# Vérifications et preuves

## Exécution locale reproductible

```sh
npm ci
npm run build
npm test
npx playwright install chromium
npm run test:e2e
npm run qualify
npm run scan
```

Les tests unitaires/API et navigateur n’exigent ni IA ni Figma. Les fixtures sont
temporaires. Playwright écrit une synthèse JSON et des artefacts dans `test-results/`
(ignoré par Git), et arrête son serveur à la fin. Il utilise le port 4318 ; la
qualification du vrai lanceur utilise 4321. Fermez vos propres serveurs sur ces ports
avant les tests. Le mode normal utilise 4310.

| Suite                  | Vérifie réellement                                                                                          | Ne prouve pas                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `tests/store.test.ts`  | Disque, relecture, propositions sans effet, conflits, undo sélectif, import, erreurs de fichiers            | Durabilité après panne électrique              |
| `tests/http.test.ts`   | API réelle sur socket locale, Host/Origin/session, chemins et clés refusés, entrées invalides               | Sécurité face à un attaquant administrateur    |
| `tests/agent.test.ts`  | CLI manquant réel, subprocess/timeout/arrêt réels, erreur d’auth simulée                                    | Quota de chaque étudiant ou auth sur tout OS   |
| `tests/e2e/`           | Couleurs CSS rendues, diff, refus/acceptation, deux viewers, largeurs, interactions, clavier, import/export | Certification WCAG ou Safari/iOS natif         |
| `npm run qualify`      | Vrai processus et vrai lanceur, réouverture disque après arrêt, verrou interprocessus                       | Lanceurs Finder/Windows exécutés               |
| `npm run test:live`    | Vrai Codex, JSON et demande hostile sans outil retourné, canari absent                                      | Confinement formel du CLI ou intégration Figma |
| `npm run qualify:live` | Vrai Codex via API, absence d’auto-commit puis acceptation explicite                                        | Compte, permissions et quota des étudiants     |

## Tests optionnels connectés

Les commandes suffixées `live` utilisent un contexte fictif et le compte officiel
Codex déjà configuré. Elles peuvent consommer du quota ; elles ne lisent ni ne
copient d’identifiants. Le test canari vise uniquement un fichier temporaire créé
pour le contrôle, jamais un document personnel. Aucune écriture Figma n’est requise.

Les erreurs d’auth de la suite normale sont simulées pour rester hors ligne. `npm run test:auth`
ajoute une vérification optionnelle avec un CODEX_HOME temporaire vide,
sans modifier le compte enseignant ; sa portée exacte figure dans DELIVERY_REPORT.

## Matrice restante

Tester sur macOS et Windows : installation Node, chemins à espaces, npm ci,
build/start, arrêt propre, lock, rename, persistance, navigateur et sans CLI.
Avant une nouvelle intégration : authentification officielle, droits minimaux,
refus et arrêt, révision concurrente, erreurs de réseau/quota, isolation des outils,
proposition/acceptation et relecture. Une interface définie ne compte pas comme un test.
