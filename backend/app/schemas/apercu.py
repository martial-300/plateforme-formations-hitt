"""Schémas de l'aperçu visiteur (RF-12) : 3 réponses en entrée, 3 formations en sortie."""

import uuid
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.formation import ENTIER_SQL_MAX, Domaine, TypeFormation, UniteDuree
from app.schemas.profil import TexteLibre


class ApercuEntree(BaseModel):
    """Les 3 questions de la page /essai, mêmes règles que le questionnaire complet."""

    centres_interet: TexteLibre
    type_souhaite: TypeFormation
    budget_max_fcfa: Annotated[int, Field(ge=0, le=ENTIER_SQL_MAX)]


class FormationApercu(BaseModel):
    """Formation sans description ni mots-clés : l'aperçu reste court (docs/api.md)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    intitule: str
    domaine: Domaine
    type: TypeFormation
    duree_valeur: float
    duree_unite: UniteDuree
    cout_fcfa: int
    cout_promo_fcfa: int | None


class RecommandationApercu(BaseModel):
    # Rien n'est enregistré : pas d'identifiant, donc pas de retour possible (RF-10).
    rang: int
    score: float
    mots_cles_communs: list[str]
    formation: FormationApercu


class ApercuSortie(BaseModel):
    recommandations: list[RecommandationApercu]
