// Scan borné aux fichiers du nouveau dépôt. Ne lit jamais le domicile ni les caches de comptes.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);
if (!files.length) {
  console.error(
    'Aucun fichier indexé. Exécutez git add . puis relancez le scan.',
  );
  process.exit(1);
}
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  /\bgithub_pat_[A-Za-z0-9_]{30,}/,
  /\bAIza[0-9A-Za-z_-]{30,}/,
  /https?:\/\/[^\s/@:]+:[^\s/@]+@/,
  /(?:\/home\/[^/\s]+\/|\/Users\/[^/\s]+\/|[A-Z]:\\Users\\[^\\\s]+\\)/,
];
const forbidden =
  /(?:^|\/)(?:auth\.json|\.env|credentials[^/]*|\.ds-studio|node_modules|test-results|\.codex|\.claude|\.gemini)(?:\/|$)/;
let failures = 0;
for (const file of files) {
  if (forbidden.test(file)) {
    console.error('Fichier privé indexé : ' + file);
    failures++;
  }
  const contents = [
    readFileSync(file, 'utf8'),
    execFileSync('git', ['show', ':' + file], {
      encoding: 'utf8',
      maxBuffer: 20_000_000,
    }),
  ];
  if (contents.some((text) => patterns.some((p) => p.test(text)))) {
    console.error('Motif sensible ou chemin personnel : ' + file);
    failures++;
  }
}
console.log(
  `${files.length} fichiers suivis/indexés contrôlés (contenu de travail et index). ${failures} alerte(s).`,
);
console.log(
  'Contrôle heuristique : compléter par une revue humaine avant publication.',
);
if (failures) process.exitCode = 1;
