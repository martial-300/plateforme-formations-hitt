"""Point d'entrée de l'API HIT-T Reco."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (enregistre les modèles dans Base.metadata)
from app.config import parametres
from app.database import Base, engine


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Pas d'Alembic dans le MVP : les tables manquantes sont créées au démarrage.
    # Le compte administrateur (ADMIN_*) sera créé ici en S2, avec le modèle Utilisateur.
    Base.metadata.create_all(engine)
    yield


app = FastAPI(
    title="HIT-T Reco",
    description="Recommandation de formations du catalogue HIT-T Institute.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=parametres.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

api = APIRouter(prefix="/api/v1")
# Routers ajoutés au fil des sprints (docs/api.md) : auth, users, formations, profil,
# recommandations, admin.
app.include_router(api)
