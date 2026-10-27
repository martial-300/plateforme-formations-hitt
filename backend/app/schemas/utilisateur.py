"""Schémas des comptes (RF-01, RF-02) : jamais de mot_de_passe_hash ni de google_id en sortie."""

import uuid
from datetime import datetime
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field, StringConstraints


def _normaliser_email(email: str) -> str:
    # Un seul compte par adresse, quelle que soit la casse saisie.
    return email.strip().lower()


def _limiter_a_72_octets(mot_de_passe: str) -> str:
    # bcrypt ignore tout ce qui dépasse 72 octets : on refuse plutôt que de tronquer en silence.
    if len(mot_de_passe.encode()) > 72:
        raise ValueError("Le mot de passe ne doit pas dépasser 72 octets")
    return mot_de_passe


Email = Annotated[EmailStr, AfterValidator(_normaliser_email)]
Nom = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


class InscriptionEntree(BaseModel):
    nom: Nom
    prenom: Nom
    email: Email
    mot_de_passe: Annotated[str, Field(min_length=8), AfterValidator(_limiter_a_72_octets)]


class ConnexionEntree(BaseModel):
    email: Email
    mot_de_passe: Annotated[str, Field(min_length=1, max_length=200)]


class JetonSortie(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"


class UtilisateurSortie(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nom: str
    prenom: str
    email: str
    role: Literal["apprenant", "administrateur"]
    date_creation: datetime
