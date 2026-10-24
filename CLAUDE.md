# CLAUDE.md

HIT-T Reco : MVP de soutenance qui recommande à un apprenant 5 formations du catalogue HIT-T Institute (TF-IDF + cosinus). Stack : FastAPI + SQLAlchemy + Scikit-learn, React 18 + TypeScript + Vite, PostgreSQL 15, Docker Compose. Tout est en français (code métier, docs, commits).

## Références

- Périmètre et exigences RF-01 à RF-13 (v1.1 : RF-12 aperçu visiteur, RF-13 connexion Google) : [docs/cahier-des-charges-mvp.md](docs/cahier-des-charges-mvp.md). Rien de V2 avant la soutenance.
- Maquettes de référence : [fichier Figma](https://www.figma.com/design/kvetFqrr0ID67PZe0JH6Jx/Plateforme-formations-HIT-T-%E2%80%94-Maquettes-MVP) (sections « v2 · » uniquement), rendus dans [design/apercu-v2/](design/apercu-v2/), générés par [design/figma-scripts/](design/figma-scripts/).
- Contrat d'API : [docs/api.md](docs/api.md). Données : [docs/modele-donnees.md](docs/modele-donnees.md) + [database/01_schema.sql](database/01_schema.sql). Moteur : [docs/moteur-recommandation.md](docs/moteur-recommandation.md). Évaluation : [docs/evaluation.md](docs/evaluation.md).
- Règles de branches, commits et synchronisation des docs : [CONTRIBUTING.md](CONTRIBUTING.md).

## Règles (`.claude/rules/`)

`perimetre-et-git.md` s'applique toujours ; les autres se chargent selon les fichiers touchés : `backend.md`, `moteur-recommandation.md`, `base-de-donnees.md`, `frontend.md` (dont la charte visuelle), `documentation.md`, `deploiement.md`, `design.md`.

## Agents du projet (`.claude/agents/`)

| Quand | Agent |
|---|---|
| Endpoint, schéma Pydantic, modèle ORM, colonne SQL ou type TS modifié | `gardien-contrat-api` |
| Auth, routers, CORS, `.env`, contexte d'auth React, Nginx | `relecteur-securite-api` |
| Code backend ajouté ou modifié qui doit être testé | `testeur-fastapi` |
| Moteur, paramètres TF-IDF, descriptions ou mots-clés modifiés | `evaluateur-recommandation` |
| `database/02_catalogue_hitt.sql` modifié, validation par le cabinet | `relecteur-catalogue` |
| Avant d'ouvrir ou de fusionner une PR | `relecteur-pr-mvp` |
| Docker, Nginx, `.env.example`, avant une démo (S3, S5, S7) | `verificateur-deploiement` |

Les agents de relecture ne modifient rien : ils rendent un rapport avec les correctifs.

## Méthode de travail (`.claude/skills/`)

- `writing-plans` pour planifier une tâche de sprint, puis `subagent-driven-development` pour l'exécuter (un sous-agent par tâche, revue après chaque tâche) ; `dispatching-parallel-agents` pour des tâches indépendantes (ex. un router backend et une page frontend).
- `graphify` pour cartographier le dépôt (`/graphify .`) et répondre aux questions d'architecture.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
