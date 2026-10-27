"""Catalogue : liste filtrable et détail publics (RF-05), gestion par l'administrateur (RF-04)."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Formation
from app.schemas.formation import Domaine, FormationEntree, FormationSortie, TypeFormation
from app.services.security import require_admin

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


# --- Gestion du catalogue par l'administrateur (RF-03, RF-04) --------------------------------

ADMIN = [Depends(require_admin)]


def _formation_ou_404(db: Session, formation_id: uuid.UUID) -> Formation:
    formation = db.get(Formation, formation_id)
    if formation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Formation introuvable")
    return formation


@router.post(
    "", response_model=FormationSortie, status_code=status.HTTP_201_CREATED, dependencies=ADMIN
)
def creer_formation(donnees: FormationEntree, db: Annotated[Session, Depends(get_db)]) -> Formation:
    formation = Formation(**donnees.model_dump())
    db.add(formation)
    db.commit()
    return formation


@router.put("/{formation_id}", response_model=FormationSortie, dependencies=ADMIN)
def modifier_formation(
    formation_id: uuid.UUID, donnees: FormationEntree, db: Annotated[Session, Depends(get_db)]
) -> Formation:
    formation = _formation_ou_404(db, formation_id)
    # PUT remplace tous les champs : un prix promo absent du corps est effacé.
    for champ, valeur in donnees.model_dump().items():
        setattr(formation, champ, valeur)
    db.commit()
    return formation


@router.delete("/{formation_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=ADMIN)
def supprimer_formation(
    formation_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]
) -> Response:
    # Les recommandations liées sont supprimées par PostgreSQL (ON DELETE CASCADE, 01_schema.sql).
    db.delete(_formation_ou_404(db, formation_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
