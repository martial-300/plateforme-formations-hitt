"""Schémas du catalogue public (RF-05)."""

import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict

Domaine = Literal["SISG", "IA-Data", "TRIT"]
TypeFormation = Literal["carte", "modulaire"]
UniteDuree = Literal["heure", "jour", "semaine", "mois"]


class FormationSortie(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    intitule: str
    description: str
    domaine: Domaine
    type: TypeFormation
    # NUMERIC(4,1) en base : renvoyé comme nombre JSON (3.0, 0.5), pas comme chaîne.
    duree_valeur: float
    duree_unite: UniteDuree
    cout_fcfa: int
    cout_promo_fcfa: int | None
    mots_cles: list[str]
