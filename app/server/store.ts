import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import {
  applyChanges,
  diff,
  stateSchema,
  tokensSchema,
  type State,
  type Tokens,
  type Proposal,
  type Revision,
  type TokenKey,
  type TokenValue,
} from '../shared/model.js';

export class StudioError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export class Store {
  private state!: State;
  private digest = '';
  private queue: Promise<unknown> = Promise.resolve();
  private proposals = new Map<string, Proposal>();
  readonly file: string;
  constructor(
    readonly directory: string,
    private seed: Tokens,
  ) {
    this.file = path.join(directory, 'state.json');
  }
  async init() {
    tokensSchema.parse(this.seed);
    await fs.mkdir(this.directory, { recursive: true, mode: 0o700 });
    if ((await fs.lstat(this.directory)).isSymbolicLink())
      throw new StudioError('Dossier de données symbolique refusé.', 500);
    try {
      if ((await fs.lstat(this.file)).isSymbolicLink())
        throw new Error('Lien symbolique refusé.');
      const raw = await fs.readFile(this.file, 'utf8');
      this.state = stateSchema.parse(JSON.parse(raw));
      this.validateHistory(this.state);
      this.digest = this.hash(raw);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT')
        throw new StudioError(
          'state.json invalide ou inaccessible : original préservé. Sauvegardez-le avant toute réparation.',
          500,
        );
      this.state = {
        version: 1,
        revision: 0,
        tokens: structuredClone(this.seed),
        history: [],
      };
      await this.write(this.state);
    }
  }
  private validateHistory(state: State) {
    if (state.history.length !== state.revision)
      throw new Error('Historique incohérent');
    for (const [i, r] of state.history.entries())
      if (r.revision !== i + 1) throw new Error('Historique non ordonné');
    // Relecture inverse : chaque patch doit réellement correspondre à l'état enregistré.
    let tokens = structuredClone(state.tokens);
    for (const r of [...state.history].reverse()) {
      if (new Set(r.patches.map((p) => p.key)).size !== r.patches.length)
        throw new Error('Doublon');
      for (const p of r.patches)
        if (tokens[p.key].$value !== p.after)
          throw new Error('Patch incohérent');
      tokens = applyChanges(
        tokens,
        r.patches.map((p) => ({ key: p.key, value: p.before })),
      );
    }
  }
  snapshot(): State {
    return structuredClone(this.state);
  }
  async flush() {
    await this.queue;
  }
  propose(
    revision: number,
    changes: { key: TokenKey; value: TokenValue }[],
    source: Revision['source'] = 'manual',
  ): Proposal {
    if (revision !== this.state.revision)
      throw new StudioError(
        'Le Design System a changé. Rechargez et refaites la proposition.',
        409,
      );
    const patches = diff(
      this.state.tokens,
      applyChanges(this.state.tokens, changes),
    );
    if (!patches.length) throw new StudioError('Aucune modification.');
    if (this.proposals.size >= 100)
      this.proposals.delete(this.proposals.keys().next().value!);
    const proposal = { id: randomUUID(), revision, source, patches };
    this.proposals.set(proposal.id, proposal);
    return structuredClone(proposal);
  }
  proposeImport(revision: number, input: unknown) {
    const tokens = tokensSchema.parse(input);
    return this.propose(
      revision,
      diff(this.state.tokens, tokens).map((p) => ({
        key: p.key,
        value: p.after,
      })),
      'import',
    );
  }
  proposeUndo(revision: number, id: string) {
    const event = this.state.history.find((r) => r.id === id);
    if (!event) throw new StudioError('Révision inconnue.', 404);
    for (const p of event.patches)
      if (this.state.tokens[p.key].$value !== p.after)
        throw new StudioError(
          `Conflit sur ${p.key} : un changement plus récent serait perdu.`,
          409,
        );
    return this.propose(
      revision,
      event.patches.map((p) => ({ key: p.key, value: p.before })),
      'undo',
    );
  }
  commit(id: string): Promise<State> {
    const work = this.queue.then(async () => {
      const p = this.proposals.get(id);
      if (!p)
        throw new StudioError(
          'Proposition inconnue ou expirée. Refaites le diff.',
          404,
        );
      if (p.revision !== this.state.revision)
        throw new StudioError('Proposition périmée. Refaites le diff.', 409);
      const raw = await fs.readFile(this.file, 'utf8');
      if (this.hash(raw) !== this.digest)
        throw new StudioError(
          'Données modifiées hors application. Redémarrez pour les relire.',
          409,
        );
      const next: State = {
        ...this.state,
        revision: this.state.revision + 1,
        tokens: applyChanges(
          this.state.tokens,
          p.patches.map((x) => ({ key: x.key, value: x.after })),
        ),
        history: [
          ...this.state.history,
          {
            ...p,
            revision: this.state.revision + 1,
            date: new Date().toISOString(),
          },
        ],
      };
      // Pas de mise à jour en mémoire ni à l'écran avant la réussite du remplacement disque.
      await this.write(next);
      this.state = next;
      this.proposals.delete(id);
      return this.snapshot();
    });
    this.queue = work.catch(() => {});
    return work;
  }
  private hash(raw: string) {
    return createHash('sha256').update(raw).digest('hex');
  }
  private async write(state: State) {
    const raw = JSON.stringify(state, null, 2) + '\n';
    if (Buffer.byteLength(raw) > 10_000_000)
      throw new StudioError(
        'Historique trop volumineux : exportez et archivez avant de continuer.',
        507,
      );
    const tmp = path.join(this.directory, `state-${randomUUID()}.tmp`);
    const handle = await fs.open(tmp, 'wx', 0o600);
    try {
      await handle.writeFile(raw);
      await handle.sync();
    } finally {
      await handle.close();
    }
    try {
      await fs.rename(tmp, this.file);
    } catch (e) {
      await fs.unlink(tmp).catch(() => {});
      throw e;
    }
    this.digest = this.hash(raw);
  }
}
