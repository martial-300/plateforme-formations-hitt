"""Aperçu pour un visiteur sans compte (RF-12) : 3 formations, rien n'est enregistré."""

import math
from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Formation
from app.schemas.apercu import ApercuEntree, ApercuSortie
from app.services.limite_appels import LimiteAppels
from app.services.recommandation import recommander

router = APIRouter(prefix="/recommandations", tags=["Aperçu visiteur"])

NB_RECOMMANDATIONS_APERCU = 3

# Route publique : 20 appels par minute et par adresse IP (docs/api.md).
limite_apercu = LimiteAppels(maximum=20, fenetre_s=60)


def limiter_par_adresse(request: Request) -> None:
    # Dépendance sans corps : exécutée même si le corps est invalide, qui compte donc aussi.
    adresse = request.client.host if request.client else "inconnue"
    attente = limite_apercu.attente(adresse)
    if attente is not None:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Trop de demandes : réessayez dans une minute",
            headers={"Retry-After": str(max(1, math.ceil(attente)))},
        )


@dataclass(frozen=True)
class ProfilApercu:
    """Profil réduit à « ce que vous aimeriez apprendre », lu par le moteur comme un profil."""

    centres_interet: str
    type_souhaite: str
    budget_max_fcfa: int
    competences: None = None
    objectif_professionnel: None = None


@router.post(
    "/apercu",
    response_model=ApercuSortie,
    dependencies=[Depends(limiter_par_adresse)],
)
def apercu(donnees: ApercuEntree, db: Annotated[Session, Depends(get_db)]) -> dict:
    # Lecture seule : ni profil ni recommandation enregistrés (RF-12).
    formations = db.scalars(select(Formation)).all()
    resultats = recommander(
        ProfilApercu(**donnees.model_dump()), formations, k=NB_RECOMMANDATIONS_APERCU
    )
    return {
        "recommandations": [
            {
                "rang": rang,
                # Même arrondi que PUT /profil : le cosinus peut dépasser 1 d'un arrondi flottant.
                "score": round(min(resultat.score, 1.0), 4),
                "mots_cles_communs": resultat.mots_cles_communs,
                "formation": resultat.formation,
            }
            for rang, resultat in enumerate(resultats, start=1)
        ]
    }
