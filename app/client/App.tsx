import { useEffect, useRef, useState } from 'react';
import { Catalogue, Scenario } from './DesignSystem.js';
import {
  bootstrap,
  commit,
  exportTokens,
  getState,
  request,
  type Bootstrap,
} from './api.js';
import {
  contrast,
  tokenKeys,
  type Proposal,
  type State,
  type TokenKey,
} from '../shared/model.js';

const devices = [
  { label: 'Compact · 320', width: 320 },
  { label: 'Standard · 375', width: 375 },
  { label: 'Grand · 430', width: 430 },
  { label: 'Desktop · 1024', width: 1024 },
];
function useDesignState() {
  const [state, setState] = useState<State>();
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    const refresh = () =>
      getState()
        .then((s) => {
          if (live) {
            setState(s);
            setError('');
          }
        })
        .catch((e) => {
          if (live) setError(e.message);
        });
    void refresh();
    const timer = setInterval(refresh, 1200);
    const channel = new BroadcastChannel('ds-studio');
    channel.onmessage = refresh;
    return () => {
      live = false;
      clearInterval(timer);
      channel.close();
    };
  }, []);
  return { state, setState, error };
}
function announceChange() {
  const c = new BroadcastChannel('ds-studio');
  c.postMessage('updated');
  c.close();
}
export function Preview() {
  const { state, error } = useDesignState();
  const scenario =
    new URLSearchParams(location.search).get('scenario') ?? 'cards';
  return state ? (
    <Scenario tokens={state.tokens} scenario={scenario} />
  ) : (
    <p role="alert">{error || 'Chargement du scénario…'}</p>
  );
}
export default function App() {
  const { state, setState, error: stateError } = useDesignState();
  const [boot, setBoot] = useState<Bootstrap>();
  const [key, setKey] = useState<TokenKey>('color.brand');
  const [draft, setDraft] = useState('');
  const [proposal, setProposal] = useState<Proposal>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [device, setDevice] = useState(1);
  const [scenario, setScenario] = useState('cards');
  const [agent, setAgent] = useState('manual');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([]);
  const [thinking, setThinking] = useState(false);
  const [saving, setSaving] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    bootstrap()
      .then(setBoot)
      .catch((e) => setError(e.message));
    return () => controller.current?.abort();
  }, []);
  const current = state?.tokens[key].$value;
  useEffect(() => setDraft(String(current ?? '')), [key, current]);
  useEffect(() => {
    if (proposal) {
      dialog.current?.showModal();
      cancelButton.current?.focus();
    } else dialog.current?.close();
  }, [proposal]);
  const clearError = () => {
    setError('');
    setNotice('');
  };
  async function perform(action: () => Promise<void>) {
    clearError();
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function proposeToken() {
    if (!state) return;
    await perform(async () => {
      const token = state.tokens[key];
      const value = token.$type === 'dimension' ? Number(draft) : draft;
      setProposal(
        await request<Proposal>('proposals', {
          revision: state.revision,
          changes: [{ key, value }],
        }),
      );
    });
  }
  async function accept() {
    if (!proposal) return;
    setSaving(true);
    await perform(async () => {
      const next = await commit(proposal);
      setState(next);
      setProposal(undefined);
      announceChange();
      setNotice(`Révision ${next.revision} enregistrée sur disque.`);
    });
    setSaving(false);
  }
  async function sendMessage() {
    if (!state || !message.trim() || thinking) return;
    const text = message;
    setMessage('');
    setThinking(true);
    clearError();
    const previous = chat.slice(-10);
    setChat([...chat, { role: 'user', text }]);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const result = await request<{
        message: string;
        proposal: Proposal | null;
      }>(
        'agent',
        { agent, message: text, revision: state.revision, history: previous },
        abort.signal,
      );
      setChat((c) => [...c, { role: 'assistant', text: result.message }]);
      if (result.proposal) setProposal(result.proposal);
    } catch (e) {
      setError(
        abort.signal.aborted
          ? 'Demande interrompue. Aucun changement accepté.'
          : (e as Error).message,
      );
    } finally {
      setThinking(false);
      controller.current = null;
    }
  }
  if (!state)
    return (
      <main className="loading">
        <h1>DS-Studio</h1>
        <p role="alert">{stateError || 'Ouverture du Design System…'}</p>
        <p>Lancez le serveur local puis rechargez cette page.</p>
      </main>
    );
  const selectedAgent = boot?.agents.find((a) => a.id === agent);
  return (
    <>
      <header className="studio-header">
        <div className="wordmark">
          <span className="brand-symbol">ds.</span>
          <div>
            <strong>DS-Studio</strong>
            <span>Votre atelier de Design System</span>
          </div>
        </div>
        <div className="header-status">
          <span className="local-badge">● Local · V1</span>
          <span className="muted">
            {boot?.figma.label ?? 'Figma non connecté'}
          </span>
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            aria-expanded={historyOpen}
          >
            Historique · {state.revision}
          </button>
        </div>
      </header>
      <div className="intro">
        <div>
          <span className="eyebrow">STARTER PÉDAGOGIQUE / M2 UX/UI</span>
          <h1>Une source. Toutes les vues.</h1>
          <p>
            Explorez, proposez, validez. Construisez ensuite votre propre outil.
          </p>
        </div>
        <div className="intro-actions">
          <button onClick={() => void perform(exportTokens)}>
            Exporter les tokens
          </button>
          <label className="file-button">
            Importer un JSON
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file)
                  void perform(async () => {
                    if (file.size > 128000)
                      throw new Error(
                        'Fichier trop volumineux (128 Ko maximum).',
                      );
                    const tokens = JSON.parse(await file.text());
                    setProposal(
                      await request('import', {
                        revision: state.revision,
                        tokens,
                      }),
                    );
                  });
              }}
            />
          </label>
        </div>
      </div>
      <div className="feedback" aria-live="polite">
        {(error || stateError) && (
          <p className="error" role="alert">
            {error || stateError}
          </p>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
      </div>
      {historyOpen && (
        <section className="history" aria-label="Historique des changements">
          <h2>Un historique, pas un écrasement.</h2>
          <p>
            Annulez un changement précis. Les autres tokens restent intacts. Une
            annulation s’enregistre elle aussi.
          </p>
          {!state.history.length && <p>Aucun changement enregistré.</p>}
          <ol>
            {[...state.history].reverse().map((event) => (
              <li key={event.id}>
                <div>
                  <strong>Révision {event.revision}</strong> · {event.source} ·{' '}
                  <time>{new Date(event.date).toLocaleString('fr-FR')}</time>
                  <p>{event.patches.map((p) => p.key).join(', ')}</p>
                </div>
                <button
                  onClick={() =>
                    void perform(async () =>
                      setProposal(
                        await request('undo', {
                          revision: state.revision,
                          id: event.id,
                        }),
                      ),
                    )
                  }
                >
                  Annuler la révision {event.revision}
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
      <main className="studio-grid">
        <section className="panel agent-panel" aria-labelledby="agent-title">
          <div className="panel-heading">
            <span className="panel-index">A</span>
            <div>
              <h2 id="agent-title">Agent</h2>
              <p>Un assistant, pas un pilote automatique</p>
            </div>
          </div>
          <div className="panel-body">
            <label className="field">
              Mode de travail
              <select value={agent} onChange={(e) => setAgent(e.target.value)}>
                <option value="manual">Manuel · sans compte IA</option>
                <option value="codex">Codex · expérimental qualifié</option>
                <option value="claude" disabled>
                  Claude Code · non implémenté
                </option>
                <option value="gemini" disabled>
                  Gemini CLI · non implémenté
                </option>
              </select>
            </label>
            {agent === 'manual' ? (
              <div className="agent-empty">
                <div className="line-icon">✳</div>
                <h3>Le Design System vous appartient.</h3>
                <p>
                  Aucun compte nécessaire. Sélectionnez un token dans le panneau
                  central, modifiez sa valeur et examinez le diff avant de
                  l’appliquer.
                </p>
                <ol>
                  <li>Choisissez une couleur.</li>
                  <li>Proposez un changement.</li>
                  <li>Validez et observez les deux vues.</li>
                </ol>
                <p className="privacy-note">
                  Les changements restent sur votre machine. Figma et l’IA sont
                  facultatifs.
                </p>
              </div>
            ) : (
              <>
                <p className="privacy-note">
                  {selectedAgent?.detail ?? 'Détection du CLI…'}
                </p>
                <p className="privacy-note">
                  Envoi à Codex : tokens, workspace/PFE.md, DESIGN_RULES.md et
                  10 messages récents. Aucun outil ni commande ; propositions
                  seulement.
                </p>
                <div
                  className="chat-log"
                  aria-label="Conversation"
                  aria-live="polite"
                >
                  {chat.map((c, i) => (
                    <article className={`chat-message ${c.role}`} key={i}>
                      <strong>{c.role === 'user' ? 'Vous' : 'Codex'}</strong>
                      <p>{c.text}</p>
                    </article>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendMessage();
                  }}
                >
                  <label className="field">
                    Votre demande
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={8000}
                      placeholder="Propose une couleur de marque plus chaleureuse."
                      disabled={thinking}
                    />
                  </label>
                  <button
                    className="studio-primary"
                    disabled={
                      thinking || !message.trim() || !selectedAgent?.available
                    }
                  >
                    {thinking ? 'Réflexion en cours…' : 'Envoyer à Codex'}
                  </button>
                  {thinking && (
                    <button
                      type="button"
                      onClick={() => controller.current?.abort()}
                    >
                      Arrêter
                    </button>
                  )}
                </form>
              </>
            )}
          </div>
          <div className="panel-foot">
            Périmètre : contexte PFE + tokens autorisés
          </div>
        </section>
        <section className="panel ds-panel" aria-labelledby="ds-title">
          <div className="panel-heading">
            <span className="panel-index">B</span>
            <div>
              <h2 id="ds-title">Design System</h2>
              <p>Lisière · exemple fictif, sources locales</p>
            </div>
            <span className="revision-tag">r{state.revision}</span>
          </div>
          <div className="token-editor">
            <div className="editor-title">
              <h3>Tokens sémantiques</h3>
              <span>{tokenKeys.length} tokens</span>
            </div>
            <div className="swatches">
              {tokenKeys
                .filter((k) => k.startsWith('color.'))
                .map((k) => (
                  <button
                    title={k}
                    aria-label={`Sélectionner ${k}`}
                    aria-pressed={key === k}
                    key={k}
                    style={{ background: String(state.tokens[k].$value) }}
                    onClick={() => setKey(k)}
                  >
                    <span className="sr-only">{k}</span>
                  </button>
                ))}
            </div>
            <form
              className="token-form"
              onSubmit={(e) => {
                e.preventDefault();
                void proposeToken();
              }}
            >
              <label className="field">
                Token
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value as TokenKey)}
                >
                  {tokenKeys.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Valeur
                {state.tokens[key].$type === 'fontFamily' ? (
                  <select
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  >
                    {['system-ui', 'Arial', 'Georgia', 'Verdana'].map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    aria-label="Valeur du token"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    required
                    maxLength={20}
                  />
                )}
              </label>
              <button
                className="studio-primary"
                disabled={!boot || draft === String(current)}
              >
                Proposer
              </button>
            </form>
            <p className="token-hint">
              {state.tokens[key].$type === 'color'
                ? '#RRGGBB · '
                : state.tokens[key].$type === 'dimension'
                  ? 'Pixels, de 0 à 128 · '
                  : ''}
              Rien n’est écrit avant validation.
            </p>
            <p className="contrast">
              Marque / texte sur marque :{' '}
              <strong>
                {contrast(
                  state.tokens['color.brand'].$value,
                  state.tokens['color.onBrand'].$value,
                ).toFixed(2)}
                :1
              </strong>{' '}
              ·{' '}
              {contrast(
                state.tokens['color.brand'].$value,
                state.tokens['color.onBrand'].$value,
              ) >= 4.5
                ? 'AA texte courant'
                : 'Contraste à améliorer'}
            </p>
          </div>
          <Catalogue tokens={state.tokens} />
        </section>
        <section className="panel mobile-panel" aria-labelledby="mobile-title">
          <div className="panel-heading">
            <span className="panel-index">C</span>
            <div>
              <h2 id="mobile-title">Mobile Viewer</h2>
              <p>De vrais composants, à largeur réelle</p>
            </div>
          </div>
          <div className="preview-controls">
            <label className="field">
              Viewport
              <select
                value={device}
                onChange={(e) => setDevice(Number(e.target.value))}
              >
                {devices.map((d, i) => (
                  <option key={d.width} value={i}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Scénario
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              >
                <option value="cards">Découvrir</option>
                <option value="form">Inscription</option>
              </select>
            </label>
          </div>
          <div className="viewport-scroll">
            <iframe
              title="Aperçu responsive"
              src={`/?preview=1&scenario=${scenario}`}
              width={devices[device].width}
              height={760}
            />
          </div>
          <div className="panel-foot">
            {devices[device].width} px CSS · aucun zoom appliqué · défilez si
            nécessaire
          </div>
        </section>
      </main>
      <footer className="studio-footer">
        <span>DS-Studio V1 · Fait pour être transformé.</span>
        <span>JSON local → validation → composants partagés</span>
      </footer>
      <dialog
        ref={dialog}
        onCancel={(e) => {
          if (saving) e.preventDefault();
          else setProposal(undefined);
        }}
        aria-labelledby="diff-title"
      >
        <h2 id="diff-title">Valider le changement</h2>
        <p>
          Proposition {proposal?.source} · basée sur la révision{' '}
          {proposal?.revision}. Ces valeurs seront enregistrées sur votre
          machine.
        </p>
        <div className="diff-scroll">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Avant</th>
                <th>Après</th>
              </tr>
            </thead>
            <tbody>
              {proposal?.patches.map((p) => (
                <tr key={p.key}>
                  <th>{p.key}</th>
                  <td>
                    <del>{p.before}</del>
                  </td>
                  <td>
                    <ins>{p.after}</ins>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            ref={cancelButton}
            onClick={() => setProposal(undefined)}
            disabled={saving}
          >
            Ne pas appliquer
          </button>
          <button
            className="studio-primary"
            onClick={() => void accept()}
            disabled={saving}
          >
            {saving ? 'Enregistrement…' : 'Valider et enregistrer'}
          </button>
        </div>
      </dialog>
    </>
  );
}
