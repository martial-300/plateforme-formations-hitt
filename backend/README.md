# Backend — API FastAPI + moteur de recommandation

> Code à développer à partir de la S2 (voir [docs/planning.md](../docs/planning.md)).

## Stack

Python 3.11 · FastAPI · SQLAlchemy 2 · Pydantic · Scikit-learn · passlib/bcrypt · PyJWT · psycopg

## Lancement en local (prévu)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt
docker compose up -d db                              # depuis la racine du dépôt
uvicorn app.main:app --reload --port 8000
```

- API : <http://localhost:8000/api/v1>
- Swagger : <http://localhost:8000/docs>

Au démarrage, l'application crée les tables manquantes (`Base.metadata.create_all`, pas d'Alembic dans le MVP) et le compte administrateur défini par `ADMIN_*` dans `.env`.

## Tests

```bash
pytest
python -m tests.evaluation.precision_at_5    # évaluation du moteur (voir docs/evaluation.md)
```

## Références

- [API](../docs/api.md) · [Modèle de données](../docs/modele-donnees.md) · [Moteur](../docs/moteur-recommandation.md) · [Architecture](../docs/architecture.md)
