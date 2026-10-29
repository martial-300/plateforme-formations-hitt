"""Chiffres clés du tableau de bord de l'administrateur (RF-11)."""

import uuid

from pydantic import BaseModel

from app.schemas.formation import Domaine


class FormationRecommandee(BaseModel):
    formation_id: uuid.UUID
    intitule: str
    domaine: Domaine
    nb_recommandations: int


class Statistiques(BaseModel):
    nb_apprenants: int
    # 5 au plus, de la plus recommandée à la moins recommandée (à égalité : par intitulé).
    top_formations: list[FormationRecommandee]
    # Retours donnés (« pertinent » ou « non pertinent ») et part des « pertinent ».
    nb_retours: int
    nb_retours_pertinents: int
    taux_pertinent: float | None
