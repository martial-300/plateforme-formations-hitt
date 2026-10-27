"""Schémas du catalogue : lecture publique (RF-05) et gestion par l'administrateur (RF-04)."""

import uuid
from decimal import Decimal
from typing import Annotated, Literal, Self

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    model_validator,
)

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


# INTEGER PostgreSQL : au-delà, l'insertion échouerait en erreur 500 au lieu d'un 422.
ENTIER_SQL_MAX = 2_147_483_647


def _normaliser_mots_cles(mots_cles: list[str]) -> list[str]:
    # Minuscules et sans doublon, comme dans 02_catalogue_hitt.sql : le moteur compare ces mots
    # au texte du profil.
    normalises: list[str] = []
    for mot in mots_cles:
        mot = mot.strip().lower()
        if not mot:
            raise ValueError("Un mot-clé ne peut pas être vide")
        if mot not in normalises:
            normalises.append(mot)
    return normalises


Texte = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
MotCle = Annotated[str, StringConstraints(max_length=100)]
Prix = Annotated[int, Field(gt=0, le=ENTIER_SQL_MAX)]


class FormationEntree(BaseModel):
    """Corps de POST /formations et PUT /formations/{id} : mêmes champs que la sortie, sans id."""

    intitule: Annotated[Texte, StringConstraints(max_length=200)]
    description: Texte
    domaine: Domaine
    type: TypeFormation
    # NUMERIC(4,1) en base : de 0,1 à 999,9, une décimale au plus.
    duree_valeur: Annotated[Decimal, Field(gt=0, max_digits=4, decimal_places=1)]
    duree_unite: UniteDuree
    cout_fcfa: Prix
    cout_promo_fcfa: Prix | None = None
    mots_cles: Annotated[
        list[MotCle], Field(min_length=1, max_length=20), AfterValidator(_normaliser_mots_cles)
    ]

    @model_validator(mode="after")
    def _verifier_prix_promo(self) -> Self:
        if self.cout_promo_fcfa is None:
            return self
        if self.type == "modulaire":
            raise ValueError("Les formations modulaires n'ont pas de prix promotionnel")
        if self.cout_promo_fcfa >= self.cout_fcfa:
            raise ValueError("Le prix promotionnel doit être inférieur au prix normal")
        return self
