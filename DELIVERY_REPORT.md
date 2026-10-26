# DS-Studio V2 — rapport de livraison

Date : **27 octobre 2026**. Base : `ed6ead0` / `v1.1.0-launchers`, initialement
publiée et propre. Développement sur `codex/v2` ; tags V1 préservés. Aucun fichier
de MARC ni configuration personnelle modifié. Aucune nouvelle dépendance.

## Résultat

V2 conserve la boucle pédagogique de V1.1 et ajoute un brief PFE privé exportable,
la recherche et l’édition typée des tokens, la reprise du brouillon, les conflits
visibles, le renouvellement de session, la copie précédente et une restauration
confirmée qui archive l’original. Le serveur est indépendant du panneau. Le mode
manuel reste disponible sans compte IA, sans Figma et hors ligne après installation.

[Audit et backlog](docs/V2_AUDIT.md) · [Changelog et décisions](docs/V2_CHANGELOG.md) ·
[Tests reproductibles](docs/TESTING.md) · [Guide étudiant](docs/STUDENT_GUIDE.md).

## Audit CI de départ

Run V1.1 [40418398973](https://github.com/ElGrandeXu/DS-Studio/actions/runs/40418398973) :
build, tests API et navigateur réussis sur les trois OS, suite lanceurs en échec.

| Plateforme | Échec observé                                                             | Traitement V2                                                                                                      |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Ubuntu     | Le test attend un Node utilisateur alors qu’un Node système valide existe | Test portable et absence testée en isolation                                                                       |
| Windows    | PID serveur perdu après crash du panneau                                  | Serveur détaché sans pipes du panneau ; qualification CI requise                                                   |
| macOS      | Refus après PID étranger mort puis échecs en cascade                      | Assertions diagnostiques et protection contre statut asynchrone périmé ; cause V1.1 non prouvée par ses seuls logs |

## Vérifications locales exécutées

Linux, Node **22.23.4**, npm fourni avec cette distribution, Chromium Playwright.
Les tests emploient des données fictives dans des dossiers temporaires, jamais
l’état personnel du projet.

| Contrôle                          | Résultat obtenu avant qualification distante                                  |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `npm run check` / `npm run build` | Réussis                                                                       |
| `npm test`                        | 29 tests réussis, dont crash en écriture, concurrence, brief et sécurité HTTP |
| `npm run test:e2e`                | 9 tests réussis ; parcours V1 conservés et nouveaux parcours V2               |
| `npm run test:launcher`           | 22 tests réussis, dont 19 sous-tests de cycle réel                            |
| `npm run qualify`                 | Réussi : vrai processus, verrou, persistance et annulation                    |
| `npm audit --json`                | 0 vulnérabilité signalée à la date du contrôle                                |
| `npm run scan`                    | Contrôle requis avant chaque publication ; résultat final indiqué ci-dessous  |

La revue contradictoire a recherché : perte de données après mise à jour, liens
ajoutés après init, sauvegarde impossible, copies invalides, révisions concurrentes,
statut de panneau périmé, crash pendant écriture et dépendance du mode manuel à
l’IA. Les défauts confirmés ont reçu des corrections et des tests ciblés.
Les échecs intermédiaires et leurs corrections sont décrits dans le changelog.

## Qualification distante et publication

**Qualification de la branche en cours ; main et tag v2.0.0 non modifiés à ce stade.**
Cette section est complétée seulement après observation des résultats GitHub.
Aucune CI en échec, divergence distante ou alerte de secret non résolue ne doit
être contournée pour publier. Le tag final ne doit pointer que sur le commit validé.

## Limites à transmettre aux 19 étudiants

- La CI exécute le contrôleur sur trois OS ; elle ne certifie ni le double-clic
  Finder, Gatekeeper, SmartScreen, Windows Script Host ni les politiques de l’école.
- Node 22.12+ avec npm doit être installé officiellement. Aucun sudo ni service
  persistant, aucune modification de protection ou d’identifiant.
- Une sauvegarde externe reste nécessaire. La copie précédente est locale et ne
  garantit pas la récupération après panne électrique. Après restauration, recharger.
- Claude/Gemini et Figma restent non implémentés. Le lien Figma du brief ne connecte
  rien. Le chat Codex reste sur son profil qualifié 0.164.0 ; aucun test cloud V2
  exécuté ni quota étudiant promis. CLI manquant et auth indisponible sont testés
  hors ligne par des processus contrôlés et des fixtures explicites.
- Accessibilité testée au clavier et sur petits viewports, pas certification WCAG.
  Les choix du PFE et les composants peuvent être librement personnalisés, avec
  migration explicite si les clés de tokens évoluent.
