"""Point d'entrée de l'API HIT-T Reco."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (enregistre les modèles dans Base.metadata)
from app.config import parametres
from app.database import Base, SessionLocal, engine
from app.routers import auth, users
from app.services.comptes import creer_admin_si_absent


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Pas d'Alembic dans le MVP : les tables manquantes sont créées au démarrage.
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        creer_admin_si_absent(db, parametres)
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
# recommandations, admin. Chacun ajoute ses lignes sans réorganiser celles de l'autre.
api.include_router(auth.router)
api.include_router(users.router)
app.include_router(api)
