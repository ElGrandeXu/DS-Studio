# DS-Studio V1 — rapport de livraison

**Statut : READY pour commit et publication manuels du starter.**
Date : 26 octobre 2026. Ce statut décrit la préparation du dépôt, pas une
validation de toutes les intégrations ou des trois systèmes d’exploitation.
Aucune publication, aucun commit, aucun push et aucun dépôt distant créé.

## Démarrer

Depuis le dossier téléchargé ou cloné, avec Node.js 22.12+ et npm :

```sh
npm ci
npm run build
npm start
```

Ouvrir **http://127.0.0.1:4310**. Garder le terminal ouvert ; Ctrl+C arrête le serveur.
Après installation/compilation, Linux : `./start.sh` ; macOS : `./start.command` ;
Windows : `start.cmd` ou `npm start` dans PowerShell. Les deux derniers OS ne sont
pas qualifiés ici. Node 22.23.4 est la version réellement utilisée sur Linux.
Les lanceurs n’ouvrent pas automatiquement le navigateur.

Le cœur manuel fonctionne sans compte IA, sans Figma et sans réseau après installation.
L’installation des dépendances, les téléchargements de tests et l’IA cloud nécessitent
une connexion. Aucun compte enseignant, identifiant ou cache d’authentification distribué.

## Fonctionnalités : état réellement démontré

| Fonction | Statut | Portée de la preuve |
| --- | --- | --- |
| Application locale et trois panneaux | TESTED | Lancement Linux, HTML et ressources compilées chargés |
| DS Lisière fictif, 18 tokens et composants partagés | TESTED | Catalogue et scénario issus des mêmes sources React/CSS |
| Édition manuelle et diff avant acceptation | TESTED | Proposition sans écriture, refus, puis acceptation explicite |
| Propagation des tokens | TESTED | Couleurs CSS sur action, réservation et navigation, catalogue et iframe |
| Viewports 320, 375, 430 et 1024 px CSS | TESTED | Largeurs internes réelles, media queries une/deux colonnes, pas de zoom simulé |
| Interactions de démonstration | TESTED | Réservation, navigation, saisie et confirmation de formulaire locales |
| Persistance après redémarrage | TESTED | Arrêt et relance d’un vrai processus, relecture du journal |
| Annulation sélective | TESTED | Couleur restaurée sans perdre un espacement modifié ; conflits refusés |
| Import/export JSON local | TESTED | Téléchargement navigateur, import avec diff, invalides sans mutation |
| Validation, concurrence et périmètre HTTP | TESTED | Types, fichiers corrompus, Host/Origin/session, chemins et commandes non exposés |
| Chat Codex 0.164.0 | TESTED | Vrai CLI, chat Chromium/API, proposition puis validation, propagation aux deux vues |
| Harness et deux skills Design System | IMPLEMENTED | Fichiers utilisables, validation structurelle des skills ; pas d’évaluation pédagogique indépendante |
| Adaptateurs Claude Code et Gemini intégrés | NOT IMPLEMENTED | Points d’extension documentés, explicitement indisponibles |
| Figma MCP et synchronisation | NOT IMPLEMENTED | Statut non connecté, contrat et progression documentés ; aucun accès tenté |
| Orchestration parallèle multi-agent | NOT IMPLEMENTED | Architecture multi-fournisseurs seulement |
| macOS et Windows | PARTIAL | Chemins/scripts conçus pour ces OS, aucune exécution réelle sur ceux-ci |
| Application desktop installable et simulation iOS native | NOT IMPLEMENTED | Application web locale uniquement |

## Tests exécutés pendant la construction

Les résultats suivants ont été exécutés et lus avant l’arrêt contrôlé, le même jour.
Ils n’ont pas été relancés inutilement pendant la finalisation ; aucun code applicatif
n’a changé depuis. Plateforme : Linux Mint 22.3 x86_64, Node 22.23.4, Chromium Playwright.

| Commande / contrôle | Résultat |
| --- | --- |
| `npm ci` | Réussi avec lockfile ; 35 paquets installés, 36 audités, 0 vulnérabilité signalée à cet instant |
| `npm run check` et `npm run build` | TypeScript et compilation Vite réussis |
| `npm test` | **21 tests réussis, 0 échec, 0 ignoré** |
| `npm run test:e2e` | **4 tests réussis**, environ 8,2 secondes |
| `npm run qualify` | Vrai lanceur depuis un cwd à espaces, verrou interprocessus, écriture, redémarrage, persistance et annulation réussis |
| `npm run qualify:live` | Vrai chat Codex dans Chromium, diff sans auto-commit, acceptation explicite, styles catalogue/mobile et réservation réussis |
| `npm run test:live` | JSON demandé reçu ; demande hostile sans outil retourné et canari extérieur absent ; aucun commit automatique |
| `npm run test:auth` | CLI réel avec CODEX_HOME temporaire vide : refus exploitable ; compte réel inchangé |
| Validation des deux `SKILL.md` | Deux succès structurels ; pas une preuve de pertinence en situation étudiant |

La suite normale reste indépendante de l’IA et de Figma. Certains cas d’erreur
CLI y sont simulés pour rester hors ligne ; cela est distingué du véritable test
sans authentification et des essais connectés. Les artefacts locaux de navigateur
restent ignorés par Git et ne sont pas nécessaires à la distribution.

Les tests sont reproductibles : voir [TESTING](docs/TESTING.md).
Les commandes suffixées `live` peuvent consommer du quota ; ne pas les lancer
systématiquement sur les comptes étudiants.

## Contrôles de finalisation

- Lecture intégrale du suivi local et reprise sans développement supplémentaire.
- Sélection explicite des **62 fichiers** à publier : sources, tests, scripts, harness,
  guides, exemple de DS, configuration, lockfile, licence et présent rapport.
- `.gitignore` corrigé pour exclure `/PROGRESS.md`, conservé intégralement localement.
  Données `.ds-studio/`, dépendances, builds, résultats de tests et caches privés exclus.
- `npm run scan` exécuté sur le contenu de travail et l’index : **0 alerte**.
  Ce scan heuristique détecte des motifs fréquents et des chemins personnels ; il
  ne constitue pas une garantie mathématique contre toute forme de secret.
- README, START_HERE, guides, limitations et lanceurs relus ; liens Markdown locaux
  contrôlés, dépendances exactes comparées au lockfile, modes exécutables vérifiés.
- `sh -n start.sh start.command` et `git diff --cached --check` réussis.
- Smoke test de reprise : **`./start.sh` réellement lancé**, HTTP 4310, HTML, ressources
  compilées et 18 tokens vérifiés ; arrêt propre, verrou libéré et empreinte du
  fichier d’état local identique avant/après.
- Aucun serveur ou processus de test de cette mission laissé en fonctionnement.
  Aucun fichier de MARC modifié pendant cette finalisation. La comparaison effectuée
  lors de la construction avait déjà constaté 4 450 fichiers inchangés.

Aucune nouvelle recherche Figma, installation, authentification, fonctionnalité ou
modification du code applicatif pendant la finalisation.

## État Git et publication manuelle

Branche **main**, dépôt local initialisé, **62 fichiers indexés pour le premier commit**.
Aucun commit existant, aucun remote, aucun push ni publication. L’index constitue la
sélection destinée au dépôt public ; les fichiers privés restent sur la machine.

La livraison est prête pour un commit puis une publication manuels par l’enseignant.
Relire `git diff --cached --name-only` et conserver cette sélection. **Ne pas déposer
sur GitHub une archive brute du dossier local**, qui contient des fichiers ignorés.
Après le premier commit manuel, une archive produite depuis ce commit ou le clonage
du dépôt publié contiendra la sélection versionnée, pas les données privées locales.

Licence MIT pour le code original, licences propres aux dépendances conservées via
npm. Aucun code, mémoire personnelle ou conversation de MARC copié dans le starter.

## Limites et risques restants

1. **Compatibilité** : macOS/Windows, leurs lanceurs et le workflow CI restent à exécuter
   sur de vraies machines. Le workflow écrit n’est pas une preuve de réussite multi-OS.
2. **Codex** : seule la version 0.164.0 est qualifiée. Compte, réseau et quota personnels
   nécessaires ; chat non persistant. Un test hostile ne démontre pas un confinement
   formel du CLI. L’agent externe utilisé pour développer a ses propres permissions.
3. **Figma, Claude et Gemini** : non opérationnels dans l’application. Ne pas annoncer
   de synchronisation ni contourner les restrictions. Le contrat n’est pas une intégration.
4. **Données** : format local fermé, sans migration automatique lors d’ajout de clés,
   sans sauvegarde automatique. Historique limité à 10 Mo avec refus sans troncature ;
   propositions en mémoire perdues à l’arrêt. Un verrou après crash exige un contrôle
   avant retrait. La durabilité après coupure électrique n’est pas qualifiée.
5. **Accessibilité et sécurité** : contrôles ciblés, pas de certification WCAG ni audit
   complet de tous navigateurs. Serveur destiné à l’usage local, pas à une exposition réseau.

Détails : [sécurité](docs/SECURITY.md), [agents](docs/AGENT_ADAPTERS.md),
[Figma](docs/FIGMA.md), [guide enseignant](docs/TEACHER_GUIDE.md).

## Première tâche conseillée aux étudiants

Effectuer la boucle manuelle de couleur, puis choisir un token pertinent pour son PFE,
le vérifier sur deux composants et à 320 px, et consigner la décision dans le workspace.
Créer ensuite son propre dépôt privé sans identifiants. Le [backlog](docs/ROADMAP.md)
est un menu de directions possibles, pas une feuille de route imposée aux 19 projets.
