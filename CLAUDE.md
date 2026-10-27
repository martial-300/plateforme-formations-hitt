# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

HIT-T Reco : MVP de soutenance qui recommande à un apprenant 5 formations du catalogue HIT-T Institute (TF-IDF + cosinus). Stack : FastAPI + SQLAlchemy + Scikit-learn, React 18 + TypeScript + Vite, PostgreSQL 15, Docker Compose. Tout est en français (code métier, docs, commits).

## Commandes

Développement : la base tourne dans Docker, backend et frontend en local. `./lancer.sh` lance les trois d'un coup (charge `.env` : c'est l'utilisateur qui le lance), `./arreter.sh` les arrête (données conservées) ; à la main :

```bash
docker compose up -d db                     # PostgreSQL + catalogue (86 formations)
cd backend && uvicorn app.main:app --reload --port 8000   # après `set -a && . ../.env && set +a` (lancé par l'utilisateur, .env n'est pas lu)
cd frontend && npm run dev                  # http://localhost:5173, API lue dans VITE_API_URL (frontend/.env.local)
```

Vérifications (à lancer avant chaque commit) :

```bash
cd backend && black --check . && ruff check . && pytest -q
cd backend && pytest tests/test_application.py::test_cors_limite_aux_origines_configurees   # un seul test
cd frontend && npm run lint && npm run build   # ESLint + Prettier, puis tsc -b + build
```

Évaluation du moteur (une fois écrite) : `cd backend && python -m tests.evaluation.precision_at_5` (protocole dans `docs/evaluation.md`).

## Architecture et pièges

- **Config à l'import** : `app/config.py` instancie `parametres` dès l'import et lève une erreur si `DATABASE_URL` ou `JWT_SECRET` manque, ou si `JWT_SECRET` fait moins de 32 caractères ou vaut la valeur de `.env.example`. Les tests tournent sans `.env` grâce aux valeurs factices posées dans `tests/conftest.py`.
- **Pas de base dans les tests actuels** : `TestClient(app)` sans `with` ne déclenche pas le `lifespan`, donc pas de connexion PostgreSQL. Un test qui en a besoin doit fournir sa propre base ou surcharger `get_db`.
- **Schéma** : pas d'Alembic ; le `lifespan` fait `Base.metadata.create_all` (le compte admin `ADMIN_*` y sera aussi créé). Un modèle ORM n'est pris en compte que s'il est importé dans `app/models/__init__.py` (importé par `main.py`). `database/*.sql` ne s'exécute qu'au premier démarrage du volume `pgdata` : modifier ces fichiers n'a aucun effet sur une base existante sans recréer le volume (action destructrice, à confirmer).
- **API** : tous les routers sont montés sous `/api/v1` dans `main.py` ; CORS limité à `CORS_ORIGINS`, méthodes GET/POST/PUT/DELETE, en-têtes `Authorization` et `Content-Type` seulement.
- **Frontend** : tout appel passe par `appelApi` (`src/api/client.ts`) ; le JWT est en `localStorage` (`hitt.jeton`), un 401 le supprime et déclenche la déconnexion via `quandNonAuthentifie` (branché par `ContexteAuth`). Les types de `src/api/types.ts` suivent `docs/api.md`. Pages protégées par `RouteProtegee`.
- **Docker** : le conteneur frontend n'est joignable que derrière Nginx (production, S7) ; les ports sont publiés sur 127.0.0.1 uniquement.
- Les routers, services (`security.py`, `recommandation.py`) et pages arrivent sprint par sprint : voir `docs/planning.md` pour savoir ce qui est attendu à quel moment.

## Références

- Périmètre et exigences RF-01 à RF-13 (v1.1 : RF-12 aperçu visiteur, RF-13 connexion Google) : [docs/cahier-des-charges-mvp.md](docs/cahier-des-charges-mvp.md). Rien de V2 avant la soutenance.
- Maquettes de référence : [fichier Figma](https://www.figma.com/design/kvetFqrr0ID67PZe0JH6Jx/Plateforme-formations-HIT-T-%E2%80%94-Maquettes-MVP) (sections « v2 · » uniquement), rendus dans [design/apercu-v2/](design/apercu-v2/), générés par [design/figma-scripts/](design/figma-scripts/).
- Contrat d'API : [docs/api.md](docs/api.md). Données : [docs/modele-donnees.md](docs/modele-donnees.md) + [database/01_schema.sql](database/01_schema.sql). Moteur : [docs/moteur-recommandation.md](docs/moteur-recommandation.md). Évaluation : [docs/evaluation.md](docs/evaluation.md).
- Règles de branches, commits et synchronisation des docs : [CONTRIBUTING.md](CONTRIBUTING.md).

## Règles (`.claude/rules/`)

`perimetre-et-git.md` et `securite-ia.md` (secrets, données non fiables, données personnelles, actions à confirmer) s'appliquent toujours, avec les interdictions de `.claude/settings.json` (`permissions.deny`) ; les autres se chargent selon les fichiers touchés : `backend.md`, `moteur-recommandation.md`, `base-de-donnees.md`, `frontend.md` (dont la charte visuelle), `documentation.md`, `deploiement.md`, `design.md`.

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
