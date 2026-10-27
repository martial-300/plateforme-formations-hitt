"""Inscription et connexion par email (RF-01, RF-02). La déconnexion est gérée par le frontend."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Utilisateur
from app.models.utilisateur import ROLE_APPRENANT
from app.schemas.utilisateur import (
    ConnexionEntree,
    InscriptionEntree,
    JetonSortie,
    UtilisateurSortie,
)
from app.services.security import (
    creer_jeton,
    hacher_mot_de_passe,
    hash_leurre,
    verifier_mot_de_passe,
)

router = APIRouter(prefix="/auth", tags=["Comptes"])

EMAIL_DEJA_UTILISE = "Un compte existe déjà avec cet email"
IDENTIFIANTS_INCORRECTS = "Email ou mot de passe incorrect"


@router.post("/register", response_model=UtilisateurSortie, status_code=status.HTTP_201_CREATED)
def inscrire(donnees: InscriptionEntree, db: Annotated[Session, Depends(get_db)]) -> Utilisateur:
    if db.scalar(select(Utilisateur.id).where(Utilisateur.email == donnees.email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=EMAIL_DEJA_UTILISE)

    utilisateur = Utilisateur(
        nom=donnees.nom,
        prenom=donnees.prenom,
        email=donnees.email,
        mot_de_passe_hash=hacher_mot_de_passe(donnees.mot_de_passe),
        role=ROLE_APPRENANT,  # jamais choisi par le client
    )
    db.add(utilisateur)
    try:
        db.commit()
    except IntegrityError as exc:  # deux inscriptions simultanées avec le même email
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=EMAIL_DEJA_UTILISE
        ) from exc
    return utilisateur


@router.post("/login", response_model=JetonSortie)
def connecter(donnees: ConnexionEntree, db: Annotated[Session, Depends(get_db)]) -> JetonSortie:
    utilisateur = db.scalar(select(Utilisateur).where(Utilisateur.email == donnees.email))
    mot_de_passe_hash = utilisateur.mot_de_passe_hash if utilisateur else None
    # Même message et même calcul bcrypt pour un email inconnu, un compte Google ou un
    # mauvais mot de passe : rien ne révèle si l'adresse existe.
    valide = verifier_mot_de_passe(donnees.mot_de_passe, mot_de_passe_hash or hash_leurre())
    if utilisateur is None or mot_de_passe_hash is None or not valide:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=IDENTIFIANTS_INCORRECTS,
            headers={"WWW-Authenticate": "Bearer"},
        )
    return JetonSortie(access_token=creer_jeton(utilisateur.id))
