"""Schémas du questionnaire (RF-06, RF-07) et des recommandations renvoyées (RF-08, RF-09)."""

import uuid
from datetime import datetime
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, StringConstraints

from app.schemas.formation import ENTIER_SQL_MAX, FormationSortie, TypeFormation


def _sans_caractere_nul(texte: str) -> str:
    # PostgreSQL refuse l'octet NUL dans un texte : sans ce contrôle, erreur 500 au lieu de 422.
    if "\x00" in texte:
        raise ValueError("Caractère non autorisé")
    return texte


# Champs libres : texte brut, longueur bornée, jamais interprété (.claude/rules/securite-ia.md).
TexteLibre = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=1000),
    AfterValidator(_sans_caractere_nul),
]


class ProfilEntree(BaseModel):
    """Corps de PUT /profil : toutes les réponses, à chaque soumission."""

    niveau_etudes: Annotated[TexteLibre, StringConstraints(max_length=50)]
    competences: TexteLibre
    centres_interet: TexteLibre
    objectif_professionnel: TexteLibre
    type_souhaite: TypeFormation
    budget_max_fcfa: Annotated[int, Field(ge=0, le=ENTIER_SQL_MAX)]


class ProfilSortie(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    niveau_etudes: str
    competences: str
    centres_interet: str
    objectif_professionnel: str
    type_souhaite: TypeFormation
    budget_max_fcfa: int
    date_maj: datetime


class RecommandationSortie(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    # NUMERIC(5,4) en base : renvoyé comme nombre JSON (0.4182).
    score: float
    mots_cles_communs: list[str]
    retour: Literal["pertinent", "non_pertinent", "aucun"]
    formation: FormationSortie


class ProfilEtRecommandations(BaseModel):
    profil: ProfilSortie
    recommandations: list[RecommandationSortie]


class RetourEntree(BaseModel):
    """Corps de POST /recommandations/{id}/retour (RF-10) : « aucun » n'est pas un choix."""

    retour: Literal["pertinent", "non_pertinent"]
