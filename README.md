# DS-Studio V1

Un atelier **web local** pour explorer, modifier et faire évoluer un Design System.
Ce starter pédagogique est conçu pour devenir **votre outil**, pas pour dicter vos
choix. Trois panneaux : assistant facultatif, catalogue de composants et viewport
responsive interactif. Exemple fictif fourni : **Lisière**.

**Le mode manuel fonctionne sans compte IA, sans Figma et sans Internet après installation.**
Une IA cloud nécessite un compte, Internet et du quota. Ce n’est pas un modèle local.

## Installer et lancer

Prérequis : **Node.js 22.12+**, npm fourni avec Node et un navigateur moderne.
Node LTS 22.23.4 est la version testée ; [.nvmrc](.nvmrc) la fixe pour les outils compatibles.
Téléchargez Node depuis [le site officiel](https://nodejs.org/en/download).
Git est facultatif si vous téléchargez une archive. Aucun Python, Docker, compte
Figma ou abonnement IA n’est nécessaire pour démarrer.

1. Clonez ou décompressez le projet, puis ouvrez un terminal dans son dossier.
2. Exécutez :

   ```sh
   npm ci
   npm run build
   npm start
   ```

3. Ouvrez **http://127.0.0.1:4310** (pas `localhost`, le contrôle d’hôte est strict).
4. Laissez ce terminal ouvert. **Ctrl+C** arrête le serveur ; fermer l’onglet ne l’arrête pas.

Pour les lancements suivants : `npm start`, ou `./start.sh` sous Linux,
`./start.command` sous macOS, `start.cmd` sous Windows. Ces lanceurs requièrent
l’installation et la compilation ci-dessus. Ils affichent une URL mais n’ouvrent
pas automatiquement le navigateur. Sur macOS un double-clic peut demander une
autorisation système ; les lanceurs macOS/Windows restent **non testés** sur ces OS.
Si les permissions exécutables sont perdues dans une archive : `sh start.sh` ou
`sh start.command`. Windows : ouvrez PowerShell dans le dossier puis `npm start`.

`npm run doctor` vérifie les prérequis sans ouvrir d’identifiants. Un dossier
contenant des espaces est accepté. N’utilisez ni `sudo` ni installation de service.

## Votre première boucle, en deux minutes

1. Dans **Design System**, choisissez `color.brand`, remplacez la valeur par `#8A3B20`.
2. Cliquez **Proposer**. Le diff montre l’ancienne et la nouvelle valeur, sans écriture.
3. Cliquez **Valider et enregistrer**. Boutons, réservation et navigation changent dans les deux vues.
4. Testez la réservation, puis les viewports 320, 375, 430 et 1024 px (défilement horizontal si nécessaire).
5. Rechargez ou redémarrez : la valeur reste. Dans **Historique**, annulez la révision,
   examinez son diff et validez. Les changements des autres tokens sont conservés.

La propagation inter-vues utilise les valeurs enregistrées sur disque (diffusion
locale et relecture, au plus environ 1,2 seconde sans diffusion). Aucun rafraîchissement
simulé. Les propositions périmées et annulations conflictuelles sont refusées.

## Où sont mes données ?

| Emplacement                           | Responsabilité                                             |
| ------------------------------------- | ---------------------------------------------------------- |
| `workspace/PFE.md`                    | Votre sujet, publics et objectifs                          |
| `workspace/DESIGN_RULES.md`           | Vos règles de conception et contraintes                    |
| `workspace/DECISIONS.md`              | Vos arbitrages et preuves                                  |
| `workspace/design-system.tokens.json` | Seed versionné, utilisé uniquement à la création d’un état |
| `.ds-studio/state.json`               | Tokens courants et historique personnel, ignorés par Git   |
| `workspace/private/`                  | Vos données privées ignorées, à sauvegarder hors Git       |

Ne modifiez pas le journal `state.json` à la main. **Exporter les tokens** télécharge
le JSON courant ; **Importer un JSON** prépare un diff qui demande validation.
Le format est un sous-ensemble local à clés plates et valeurs explicites, **pas un
importeur universel DTCG ni un export Figma automatique**. Voir [TOKENS](docs/TOKENS.md).
Pour sauvegarder tout l’historique, arrêtez le serveur et copiez `.ds-studio/` dans
un emplacement privé. Exporter les tokens seuls ne sauvegarde pas l’historique.

Pour versionner une palette choisie, exportez-la, vérifiez-la puis remplacez le seed
versionné. Cela ne remplace jamais un état courant déjà créé. Ne supprimez pas votre
état pour essayer une autre palette : importez-la ou utilisez un autre dossier de données.

## Travailler avec votre agent préféré

Dans votre CLI (Codex, Claude Code, Gemini CLI, etc.), depuis le dossier du projet :

> Lis START_HERE.md et les instructions de ton agent. Examine le dépôt et mon
> workspace. Aide-moi à définir puis réaliser une amélioration personnelle bornée.
> Préserve mes données et vérifie le résultat. Distingue ce qui est testé de ce qui est proposé.

`AGENTS.md`, `CLAUDE.md` et `GEMINI.md` partagent le même point d’entrée.
Le développement via une CLI externe et le chat embarqué sont **deux choses différentes**.
L’agent externe a ses propres permissions ; DS-Studio ne les contrôle pas.

Codex découvre les skills dans `.agents/skills/` : demandez `$token-change` ou
`$component-audit`. Un autre agent peut lire le `SKILL.md` explicitement. Pour
créer un skill : ajoutez `.agents/skills/nom-du-skill/SKILL.md`, avec un frontmatter
`name` et `description`, puis une procédure courte, ses contraintes et ses preuves.
Inspirez-vous des deux skills fournis, sans copier vos identifiants ou vos conversations.

## État réel de V1

| Fonction                                                            | État et portée                                                                                     |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Édition manuelle, diff, commit, persistance et annulation sélective | **TESTED**, Linux, API + navigateur + redémarrage processus                                        |
| Catalogue et viewport responsive, formulaire et navigation          | **TESTED**, Chromium sous Linux                                                                    |
| Import/export JSON local                                            | **TESTED**, API + navigateur                                                                       |
| Chat Codex, JSON proposé avant acceptation                          | **TESTED**, CLI 0.164.0, compte enseignant disponible pendant la qualification ; quota non garanti |
| Claude Code / Gemini dans l’application                             | **NOT IMPLEMENTED**, adaptateurs indisponibles et contrat documenté                                |
| Figma MCP et synchronisation                                        | **NOT IMPLEMENTED**, statut non connecté, contrat et procédure future documentés                   |
| Skills et harness personnalisable                                   | **IMPLEMENTED**, structure et liens vérifiés ; pas une validation des choix d’un étudiant          |
| Windows / macOS                                                     | **PARTIAL**, conception portable, aucune exécution sur ces OS                                      |
| Application desktop installable                                     | **NOT IMPLEMENTED**, application web locale uniquement                                             |

Preuves précises et réserves : [DELIVERY_REPORT.md](DELIVERY_REPORT.md).

### Codex embarqué (facultatif)

Le mode est restreint à **Codex CLI 0.164.0** : une autre version est refusée jusqu’à
qualification. Installez cette version depuis les moyens officiels de votre CLI,
puis authentifiez-vous vous-même avec `codex login` et contrôlez `codex login status`.
Aucun fichier d’authentification n’est ouvert ou copié par l’application. Un compte
compatible, une connexion et du quota sont requis. Aucun compte enseignant n’est fourni.

Choisir Codex puis **Envoyer** transmet les tokens, `PFE.md`, `DESIGN_RULES.md`, la demande
et au plus dix messages précédents. Ne mettez pas de données sensibles dans ce contexte.
Le chat ne persiste pas après recharge. Codex ne peut pas exécuter vos commandes dans
ce profil : le contrôleur valide les propositions de tokens, l’utilisateur accepte le diff.
Les MCP, plugins et outils shell sont désactivés, et le contexte est transmis en JSON
depuis un dossier temporaire vide. L’authentification reste gérée par le CLI officiel.
Détails et limites : [SECURITY](docs/SECURITY.md), [AGENTS](docs/AGENT_ADAPTERS.md).

### Figma

Figma reste la source de vérité du DS réel de votre PFE. Lisière est un exemple local,
pas une copie de votre fichier. Aucun fichier personnel autorisé n’a été fourni ;
aucun accès Figma n’a été tenté. Les clients tiers MCP doivent être autorisés par Figma.
Pas de contournement ni réutilisation de session : [contrat d’intégration](docs/FIGMA.md).

## Vérifier et développer

```sh
npm run doctor
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run qualify
npm run scan
```

`npm run dev` démarre le backend avec Vite sur la même adresse. `npm start` sert
`dist/` : reconstruisez avec `npm run build` après un changement frontend.
Les tests utilisent des dossiers temporaires et ne touchent pas vos données.
`npm run test:live` et `npm run qualify:live` sont **facultatifs et connectés à Codex** ;
ils peuvent consommer du quota, contrairement aux autres commandes.

## Créer votre dépôt privé

1. Téléchargez le starter sans reprendre de compte partagé. Personnalisez le workspace.
2. Créez vous-même un dépôt **privé** sur GitHub (interface web ou GitHub Desktop).
3. Avec GitHub Desktop, ajoutez ce dossier puis publiez en conservant **Keep this code private**.
   Avec Git, utilisez `git status`, `git add`, `git diff --cached` et `git commit` avant
   d’ajouter votre propre remote et de pousser. Ne réutilisez aucun remote enseignant.
4. Vérifiez les fichiers indexés et lancez `npm run scan` avant le premier envoi.
   Pour un nouveau dépôt non indexé : `git init`, puis `git add .` avant le scan.
5. Gardez `.ds-studio/`, `.env`, identifiants et documents sensibles hors Git. Un dépôt
   privé n’est pas un coffre-fort. `.gitignore` ne retire pas un secret déjà commité.

Le starter est sous [licence MIT](LICENSE) pour le code original ; les dépendances
conservent leurs licences. Aucune copie du code ou des mémoires personnelles de MARC.

## Pour aller plus loin

[Guide étudiant](docs/STUDENT_GUIDE.md) · [Guide enseignant](docs/TEACHER_GUIDE.md) ·
[Architecture](docs/ARCHITECTURE.md) · [Backlog ouvert](docs/ROADMAP.md)
