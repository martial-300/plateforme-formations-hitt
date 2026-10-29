"""Retour de l'apprenant sur une de ses recommandations (RF-10)."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Recommandation, Utilisateur
from app.schemas.profil import RecommandationSortie, RetourEntree
from app.services.security import require_apprenant

router = APIRouter(prefix="/recommandations", tags=["Profil et recommandations"])


@router.post("/{recommandation_id}/retour", response_model=RecommandationSortie)
def donner_retour(
    recommandation_id: uuid.UUID,
    donnees: RetourEntree,
    utilisateur: Annotated[Utilisateur, Depends(require_apprenant)],
    db: Annotated[Session, Depends(get_db)],
) -> Recommandation:
    recommandation = db.get(Recommandation, recommandation_id)
    # La recommandation d'un autre apprenant répond comme une recommandation inexistante :
    # l'identifiant ne permet pas de savoir qu'elle existe.
    if recommandation is None or recommandation.utilisateur_id != utilisateur.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Recommandation introuvable")
    # Modifiable : un nouveau retour remplace le précédent.
    recommandation.retour = donnees.retour
    db.commit()
    return recommandation
