import os
from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

# Valeurs factices pour les tests : aucune base réelle n'est contactée tant que
# l'application n'est pas démarrée (lifespan non déclenché par TestClient sans `with`).
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://test:test@localhost:5432/test")
os.environ.setdefault("JWT_SECRET", "secret-de-test-uniquement-0123456789abcdef")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")

CATALOGUE_SQL = Path(__file__).resolve().parents[2] / "database" / "02_catalogue_hitt.sql"

# Base jetable du service `db-test` de docker-compose.yml (identifiants de test, non secrets).
URL_BASE_TEST = os.environ.get(
    "TEST_DATABASE_URL", "postgresql+psycopg://test:test@localhost:55432/hitt_test"
)


@pytest.fixture(scope="session")
def moteur_test() -> Iterator[Engine]:
    from app import models  # noqa: F401  (enregistre les modèles dans Base.metadata)
    from app.database import Base

    moteur = create_engine(URL_BASE_TEST)
    # Les tables sont supprimées puis recréées : jamais sur une base qui n'est pas de test.
    if not (moteur.url.database or "").endswith("_test"):
        pytest.fail(
            f"Refus : {moteur.url.database!r} n'est pas une base de test (nom en « _test »)",
            pytrace=False,
        )
    try:
        moteur.connect().close()
    except OperationalError:
        pytest.fail(
            "Base de test injoignable : lancer `docker compose --profile test up -d db-test` "
            f"(ou définir TEST_DATABASE_URL). URL essayée : {moteur.url!r}",
            pytrace=False,
        )
    Base.metadata.drop_all(moteur)
    Base.metadata.create_all(moteur)
    yield moteur
    Base.metadata.drop_all(moteur)
    moteur.dispose()


@pytest.fixture
def db(moteur_test: Engine) -> Iterator[Session]:
    """Session isolée : tout ce que le test écrit est annulé à la fin."""
    connexion = moteur_test.connect()
    transaction = connexion.begin()
    session = Session(
        bind=connexion, expire_on_commit=False, join_transaction_mode="create_savepoint"
    )
    yield session
    session.close()
    transaction.rollback()
    connexion.close()


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    """Client de l'API dont `get_db` pointe sur la session isolée du test."""
    from app.database import get_db
    from app.main import app

    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def catalogue(db):
    """Les 86 formations de `database/02_catalogue_hitt.sql`, annulées à la fin du test."""
    # Script statique du dépôt, sans paramètre : il vérifie aussi que le modèle ORM accepte
    # exactement les lignes chargées dans PostgreSQL au premier démarrage.
    db.connection().exec_driver_sql(CATALOGUE_SQL.read_text(encoding="utf-8"))
    return db
