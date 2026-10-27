"""Catalogue public : liste filtrable et détail d'une formation (RF-05)."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Formation
from app.schemas.formation import Domaine, FormationSortie, TypeFormation

router = APIRouter(prefix="/formations", tags=["Catalogue"])


@router.get("", response_model=list[FormationSortie])
def lister_formations(
    db: Annotated[Session, Depends(get_db)],
    domaine: Domaine | None = None,
    type: TypeFormation | None = None,
) -> list[Formation]:
    requete = select(Formation).order_by(Formation.domaine, Formation.type, Formation.intitule)
    if domaine is not None:
        requete = requete.where(Formation.domaine == domaine)
    if type is not None:
        requete = requete.where(Formation.type == type)
    return list(db.scalars(requete))


@router.get("/{formation_id}", response_model=FormationSortie)
def lire_formation(formation_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]) -> Formation:
    formation = db.get(Formation, formation_id)
    if formation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Formation introuvable")
    return formation
