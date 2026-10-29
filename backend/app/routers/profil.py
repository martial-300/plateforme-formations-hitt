"""Questionnaire de l'apprenant, calcul et relecture de ses recommandations (RF-06 à RF-09)."""

from datetime import datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Formation, ProfilApprenant, Recommandation, Utilisateur
from app.schemas.profil import ProfilEntree, ProfilEtRecommandations
from app.services.recommandation import recommander
from app.services.security import require_apprenant

router = APIRouter(prefix="/profil", tags=["Profil et recommandations"])

NB_RECOMMANDATIONS = 5


@router.put("", response_model=ProfilEtRecommandations)
def soumettre_profil(
    donnees: ProfilEntree,
    utilisateur: Annotated[Utilisateur, Depends(require_apprenant)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    # Un seul profil par apprenant (RF-07) : INSERT … ON CONFLICT plutôt que lire puis écrire,
    # pour que deux soumissions simultanées ne lèvent pas d'erreur d'unicité. Le verrou posé sur
    # la ligne du profil sérialise aussi le remplacement des recommandations jusqu'au commit.
    valeurs = donnees.model_dump() | {"date_maj": datetime.now()}
    db.execute(
        insert(ProfilApprenant)
        .values(utilisateur_id=utilisateur.id, **valeurs)
        .on_conflict_do_update(index_elements=[ProfilApprenant.utilisateur_id], set_=valeurs)
    )
    profil = db.scalars(
        select(ProfilApprenant)
        .where(ProfilApprenant.utilisateur_id == utilisateur.id)
        .execution_options(populate_existing=True)
    ).one()

    formations = db.scalars(select(Formation)).all()
    resultats = recommander(profil, formations, k=NB_RECOMMANDATIONS)

    # Les anciennes recommandations sont remplacées dans la même transaction (RF-07).
    db.execute(delete(Recommandation).where(Recommandation.utilisateur_id == utilisateur.id))
    recommandations = [
        Recommandation(
            utilisateur_id=utilisateur.id,
            formation=resultat.formation,
            # NUMERIC(5,4) entre 0 et 1 : le cosinus peut dépasser 1 d'un arrondi flottant.
            score=Decimal(str(round(min(resultat.score, 1.0), 4))),
            mots_cles_communs=resultat.mots_cles_communs,
        )
        for resultat in resultats
    ]
    db.add_all(recommandations)
    db.commit()
    return {"profil": profil, "recommandations": recommandations}


@router.get("", response_model=ProfilEtRecommandations)
def lire_profil(
    utilisateur: Annotated[Utilisateur, Depends(require_apprenant)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    """Dernières réponses et recommandations enregistrées, sans nouveau calcul (RF-07)."""
    profil = db.scalar(
        select(ProfilApprenant).where(ProfilApprenant.utilisateur_id == utilisateur.id)
    )
    if profil is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Aucun profil : répondez au questionnaire")
    recommandations = db.scalars(
        select(Recommandation)
        .join(Recommandation.formation)
        .where(Recommandation.utilisateur_id == utilisateur.id)
        .order_by(Recommandation.score.desc(), Formation.intitule)
    ).all()
    return {"profil": profil, "recommandations": list(recommandations)}
