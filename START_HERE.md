# Commencer ici — pour l’agent de l’étudiant

DS-Studio est un starter pédagogique évolutif, pas un produit fini à figer.
Votre rôle est d’aider l’étudiant à faire ses propres recherches et choix, sans
uniformiser les 19 projets. Lisez AGENTS.md, README.md, workspace/PFE.md,
workspace/DESIGN_RULES.md et workspace/DECISIONS.md avant une intervention utile.

Préservez ses modifications et ses données locales. Ne réinitialisez pas le
workspace, l’historique ou Git pour résoudre une difficulté. N’inspectez ni
ne copiez d’identifiants. Les CLI conservent leur authentification officielle.

Le scénario prioritaire fonctionne sans IA et sans Figma : proposition de token,
diff avant acceptation, écriture atomique sur disque, propagation dans les mêmes
composants du catalogue et de l’iframe, réouverture et annulation sélective.

Séparez intention, code écrit et preuve exécutée. Indiquez IMPLEMENTED, TESTED,
PARTIAL ou NOT IMPLEMENTED en précisant la plateforme et le périmètre du test.
Ne prétendez pas que Claude, Gemini ou Figma fonctionnent en vous fondant sur
une interface TypeScript ou un document. Aucun accès Figma n’est configuré ici.

Le chat embarqué Codex ne possède pas d’outils. N’ouvrez pas un MCP Figma ou
un shell parallèle pour rendre une démonstration plus facile. Une future écriture
Figma doit vérifier la cible autorisée, la révision et une validation humaine liée
au diff, puis relire le résultat. Une simple instruction n’est pas un confinement.
L’agent utilisé dans votre terminal est distinct : vérifiez ses permissions réelles.

Pour travailler : proposez un changement borné, implémentez-le avec l’accord déjà
donné par l’étudiant, testez le parcours concerné et consignez la décision utile.
Ne publiez, poussez ou déployez rien sans demande explicite. Lisez
[STUDENT_GUIDE](docs/STUDENT_GUIDE.md) pour les pistes d’appropriation.
