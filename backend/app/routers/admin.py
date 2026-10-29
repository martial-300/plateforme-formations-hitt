"""Tableau de bord de l'administrateur : chiffres clés (RF-11)."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Formation, Recommandation, Utilisateur
from app.models.utilisateur import ROLE_APPRENANT
from app.schemas.statistiques import Statistiques
from app.services.security import require_admin

router = APIRouter(prefix="/admin", tags=["Administration"])

NB_TOP_FORMATIONS = 5


@router.get("/statistiques", response_model=Statistiques, dependencies=[Depends(require_admin)])
def statistiques(db: Annotated[Session, Depends(get_db)]) -> dict:
    # Les administrateurs ne sont pas comptés.
    nb_apprenants = db.scalar(
        select(func.count()).select_from(Utilisateur).where(Utilisateur.role == ROLE_APPRENANT)
    )

    nb_recommandations = func.count(Recommandation.id).label("nb_recommandations")
    top = db.execute(
        select(
            Formation.id.label("formation_id"),
            Formation.intitule,
            Formation.domaine,
            nb_recommandations,
        )
        .join(Recommandation, Recommandation.formation_id == Formation.id)
        .group_by(Formation.id)
        .order_by(nb_recommandations.desc(), Formation.intitule)
        .limit(NB_TOP_FORMATIONS)
    ).all()

    # Seuls les retours donnés comptent : « aucun » n'est ni pertinent ni non pertinent.
    nb_retours, nb_pertinents = db.execute(
        select(
            func.count(),
            func.count().filter(Recommandation.retour == "pertinent"),
        ).where(Recommandation.retour != "aucun")
    ).one()

    return {
        "nb_apprenants": nb_apprenants,
        "top_formations": [ligne._asdict() for ligne in top],
        "nb_retours": nb_retours,
        "nb_retours_pertinents": nb_pertinents,
        "taux_pertinent": round(nb_pertinents / nb_retours, 3) if nb_retours else None,
    }
