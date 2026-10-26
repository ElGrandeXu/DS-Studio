# DS-Studio V1.1 — livraison du lanceur multiplateforme

Date : **27 octobre 2026** (travail commencé le 26). Dépôt existant conservé.
**Statut : TESTED sur Linux pour les parcours ci-dessous ; macOS / Windows PARTIAL.**
L’implémentation initiale a été livrée sans commit ni push. Max a ensuite autorisé
explicitement la publication sur `origin/main`, avec le commit
`feat: add cross-platform DS-Studio launchers` et le tag `v1.1.0-launchers`.
Le tag existant `v1.0.0-starter` est conservé sans modification. Aucune nouvelle
release GitHub, aucun dépôt ni déploiement ne fait partie de cette publication.

## Résultat utilisable

Double-cliquer sur **DS-Studio.desktop** sous Linux. Le panneau léger s’ouvre dans
le navigateur existant, sans terminal. Si l’atelier est prêt et arrêté, il démarre
et s’ouvre automatiquement. S’il est déjà actif, le même panneau est retrouvé,
sans second serveur. Boutons : Démarrer, Ouvrir, Arrêter, Redémarrer, et Arrêter
et quitter le lanceur. États : arrêté, démarrage, actif, erreur.

Au premier lancement, les dépendances / le build manquants demandent une préparation
explicitement confirmée avant `npm ci` et `npm run build`. Node 22.12+ est recherché
hors PATH, y compris dans l’installation utilisateur du MSI. Si absent ou trop
ancien, un guide HTML local explique une installation graphique officielle.
Aucune commande privilégiée, installation Node, configuration système ou connexion
IA n’est exécutée automatiquement. Aucun paquet npm supplémentaire ajouté.

Le même contrôleur est appelé par **DS-Studio.app** sur Mac et **DS-Studio.vbs** sur
Windows. Ce sont des entrées légères, pas une nouvelle application Electron.
**Ces deux entrées n’ont pas été exécutées sur macOS / Windows.** Mac : bundle non
signé / non notarié, contrôle de quarantaine à qualifier. Windows : Windows Script
Host / VBScript doit être disponible et autorisé. Aucun contournement automatique
d’une politique d’établissement. Le [guide graphique](launcher/INSTALLATION.html)
explique ces limites et les actions accessibles sans terminal.

## Corrections de fiabilité

L’ancien démarrage créait un verrou par `writeFile(..., {flag: 'wx'})` et refusait
ensuite tout fichier existant, y compris le PID d’une instance morte. La récupération
nécessitait donc une intervention manuelle après crash.

Le mécanisme partagé du serveur et du contrôleur possède désormais :

- Une identité privée par instance : PID, identifiant aléatoire, capacité, racine,
  dossier et port ; publication atomique des fichiers de verrouillage.
- Un garde noyau loopback par dossier canonique / rôle, conservé pendant toute
  la vie de l’instance. Il empêche deux écrivains et sérialise la récupération.
- Une récupération automatique uniquement pour un PID disparu. Les anciens
  verrous numériques morts sont reconnus. Un PID vivant ou réutilisé, un verrou
  mal formé ou un lien symbolique n’est jamais supprimé automatiquement.
- Un arrêt HTTP privé après vérification de l’identité complète, sans signal à
  un PID inconnu. Le serveur ferme ses requêtes et attend sa file d’écritures,
  puis libère son propre verrou. Aucun killall / pkill / taskkill.
- Des opérations du panneau sérialisées, y compris deux clics simultanés. Un crash
  du seul panneau permet de retrouver et d’arrêter le serveur encore vivant.

Un port de protection occupé provoque un refus sûr, pas une suppression de données.
Les requêtes du panneau exigent une capacité privée, l’hôte exact et une origine
locale ; cross-site est refusé. Aucun accès libre aux fichiers ou aux commandes.
Le projet et les dépendances npm doivent néanmoins provenir d’une source de confiance.
Détails : [LAUNCHER](docs/LAUNCHER.md), [SECURITY](docs/SECURITY.md).

## Validation Linux exécutée

Environnement : Linux Mint 22.3 x86_64, session Xfce/X11, Node **22.23.4**,
Chromium Playwright et navigateur système Firefox via `xdg-open`.
Les tests utilisent des projets / données temporaires, pas le journal étudiant.

| Vérification                | Résultat réellement observé                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm run check`             | TypeScript réussi                                                                                          |
| `npm run build`             | Compilation TypeScript et Vite réussie, bundle V1 inchangé fonctionnellement                               |
| `npm test`                  | **21 tests réussis**, aucun échec ni test ignoré                                                           |
| `npm run test:e2e`          | **4 tests réussis** : parcours V1, diff, persistance, viewers, responsive, import/export                   |
| `npm run test:launcher`     | **20 tests réussis**, aucun échec ni test ignoré ; vraie première installation dans une copie vide         |
| `npm run qualify`           | Ancien lanceur terminal, verrou interprocessus, écriture, arrêt, relance, persistance et undo réussis      |
| `npm run qualify:desktop`   | Vrai `.desktop` exécuté par GIO, ouverture du navigateur système, boutons du panneau et relance réussis    |
| Contrôles statiques         | `desktop-file-validate`, `sh -n`, lecture plist et script Windows ASCII, `git diff --check` réussis        |
| Anciennes entrées Linux     | `npm start` et `start.sh` réellement lancés ; HTTP et arrêt propre vérifiés, Node hors PATH pour le script |
| Contrôle de publication     | **78 fichiers publiables, 0 alerte** ; fichiers suivis, nouveaux non ignorés et index existant             |
| Audit npm avant publication | **0 vulnérabilité signalée** par `npm audit`, dépendances de développement incluses                        |

Avant le commit V1.1, la compilation, les 21 tests V1, les 20 tests du lanceur,
les 4 tests navigateur et la qualification du lancement terminal ont été rejoués
avec succès. Aucun nouveau code fonctionnel n’a été ajouté pendant cette étape.

La suite launcher vérifie notamment :

1. Premier lancement sans dépendances, deux entrées simultanées, absence d’installation
   implicite, refus sans confirmation et annulation réelle du dialogue Chromium.
2. `npm ci` et compilation réellement exécutés après confirmation ; panneau et atelier
   ouverts dans Chromium ; fermeture du navigateur sans arrêt du serveur.
3. Arrêt propre, redémarrage, changements de PID, conservation octet par octet de
   l’état après une modification réellement validée dans l’API.
4. Cinq serveurs concurrents refusés sur les mêmes données, ports différents ; deux
   clics Démarrer sérialisés ; processus étranger et verrou actif intacts.
5. Port application occupé sans arrêt de l’occupant ; crash SIGKILL et récupération ;
   crash du contrôleur seul ; ancien verrou PID mort ; état corrompu, verrou invalide
   et lien symbolique conservés sans remise à zéro ; quitter puis relancer.

La découverte Node hors PATH est exercée avec un domicile temporaire et aussi par
le vrai bootstrap du `.desktop` avec `/usr/bin:/bin` seulement dans le PATH.
L’absence de Node est exercée dans un environnement isolé sans candidat disponible ;
aucune désinstallation du Node réel. Un ouvreur de navigateur persistant de test
ne bloque pas Arrêter / Quitter. Les limites exactes sont dans [TESTING](docs/TESTING.md).

Le test graphique exécute le `.desktop` depuis un projet déplacé dont le chemin
contient espaces, accents, apostrophe et dollar. Il vérifie double lancement,
ouverture réelle, redémarrage, arrêt par bouton, nouveau lancement automatique
après arrêt et fermeture du contrôleur. GIO exerce l’entrée du double-clic ; ce
n’est pas une manipulation physique de souris ni une qualification de tous les
bureaux Linux. Capture locale : `test-results/launcher-linux.png` (ignorée par Git).

Les essais ont également détecté et corrigé un échappement `.desktop` refusé par
GLib malgré le validateur, un état/pid transitoirement absent pendant une opération,
et une course entre ouverture automatique et demande de fermeture. Les assertions
correspondantes et la qualification réelle ont été rejouées après correction.

## Préservation et périmètre

`.ds-studio/state.json` du projet original conserve exactement l’empreinte relevée
avant intervention. Les écritures / crashes de qualification portent uniquement
sur les fixtures. Aucun fichier de MARC, document personnel ou identifiant de
compte modifié. Aucun processus Node étranger terminé. Aucun compte IA ni accès
Figma nécessaire, aucun test connecté consommant du quota relancé.

Le mode manuel et l’architecture React / serveur HTTP / store ne sont pas refondus.
Les seules modifications applicatives ajoutent le cycle de vie privé, le verrou
récupérable et l’attente des écritures à l’arrêt. Les anciens `npm start`, `start.sh`,
`start.command` et `start.cmd` restent disponibles ; Linux / lanceur commun testés,
les deux scripts natifs macOS et Windows demeurent à vérifier sur leurs OS.

## Fichiers destinés à publication

Entrées OS, contrôleur et runtime standard, interface et guide graphique sous
`launcher/`, tests launcher et qualification desktop, mise à jour des guides,
du README, de la CI et du présent rapport. Le scan existant inclut désormais les
nouveaux fichiers non ignorés : aucun besoin de les indexer pour les contrôler.

Les dépendances, builds, captures, caches, fichiers d’authentification et `.ds-studio/`
restent ignorés. Le scan est heuristique : il ne garantit pas mathématiquement
l’absence de tout secret. Aucun chemin propre au MSI n’est inscrit dans les
lanceurs publiables. Modes exécutables des entrées Unix conservés sur disque ;
une archive / un bureau peut encore demander une autorisation explicite.

La CI inclut désormais `test:launcher` sur Linux, macOS et Windows. Ses résultats
distants doivent être consultés après publication ; les preuves rapportées ici
sont celles des exécutions locales Linux. La matrice
native de [TESTING](docs/TESTING.md) reste à exécuter avant de qualifier Finder et
Windows Script Host pour la classe. La validation personnelle par l’enseignant
n’est pas remplacée par ces tests automatisés.

## Limites conservées de V1

Le cœur manuel est autonome après installation. Le chat Codex demeure facultatif
et dépend de son compte, de son réseau et de la version qualifiée précédemment.
Claude, Gemini et Figma ne deviennent pas opérationnels par ce travail. Le stockage
n’est ni une sauvegarde automatique ni une garantie face à une panne électrique.
Les propositions non validées en mémoire sont perdues à l’arrêt, pas les tokens
et l’historique enregistrés. Un fichier d’état corrompu est préservé, jamais effacé.

Le contrôle de fraîcheur du build utilise les dates de fichiers ; après restauration
de timestamps anciens, demander volontairement une recompilation. Une collision
sur un port auxiliaire peut empêcher le démarrage sans danger pour les données.
Aucune protection contre un programme malveillant déjà exécuté sous le même compte.
