# Backend — API FastAPI + moteur de recommandation

> Squelette initialisé en S1 (configuration, connexion à la base, CORS, Swagger). Les routes arrivent à partir de la S2 (voir [docs/planning.md](../docs/planning.md)).

## Stack

Python 3.11 · FastAPI · SQLAlchemy 2 · Pydantic · Scikit-learn · passlib/bcrypt · PyJWT · psycopg

## Lancement en local

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements-dev.txt                  # requirements.txt + pytest, black, ruff
cp ../.env.example ../.env                           # puis adapter les valeurs (jamais committé)
set -a && . ../.env && set +a                        # charge les variables dans le shell
docker compose up -d db                              # depuis la racine du dépôt
uvicorn app.main:app --reload --port 8000
```

- API : <http://localhost:8000/api/v1>
- Swagger : <http://localhost:8000/docs>

Au démarrage, l'application crée les tables manquantes (`Base.metadata.create_all`, pas d'Alembic dans le MVP) et le compte administrateur défini par `ADMIN_*` dans `.env`.

## Tests et style

Les tests utilisent une base PostgreSQL jetable (service `db-test`, port 55432, identifiants de test) ; chaque test est annulé à la fin, la base de développement n'est jamais touchée.

```bash
docker compose --profile test up -d db-test         # une fois, depuis la racine du dépôt
black --check . && ruff check . && pytest -q
python -m tests.evaluation.precision_at_5    # évaluation du moteur (voir docs/evaluation.md)
```

## Organisation

| Dossier | Contenu |
|---|---|
| `app/main.py` | Application FastAPI, CORS, création des tables au démarrage |
| `app/config.py` | Variables d'environnement (`DATABASE_URL`, `JWT_SECRET` obligatoires) |
| `app/database.py` | Moteur SQLAlchemy, `Base`, dépendance `get_db` |
| `app/models/`, `app/schemas/` | Modèles ORM et schémas Pydantic (S2) |
| `app/routers/` | Routes `/api/v1` de [docs/api.md](../docs/api.md) |
| `app/services/` | `security.py` (bcrypt, JWT, Google), `recommandation.py` (moteur) |
| `tests/` | Tests pytest (`TestClient`) |

## Références

- [API](../docs/api.md) · [Modèle de données](../docs/modele-donnees.md) · [Moteur](../docs/moteur-recommandation.md) · [Architecture](../docs/architecture.md)
