"""Inscription et connexion par email (RF-01, RF-02) ou avec Google (RF-13).

La déconnexion est gérée par le frontend.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Utilisateur
from app.models.utilisateur import ROLE_ADMINISTRATEUR, ROLE_APPRENANT
from app.schemas.utilisateur import (
    ConnexionEntree,
    ConnexionGoogleEntree,
    InscriptionEntree,
    JetonGoogleSortie,
    JetonSortie,
    UtilisateurSortie,
)
from app.services import identite_google
from app.services.security import (
    creer_jeton,
    hacher_mot_de_passe,
    hash_leurre,
    verifier_mot_de_passe,
)

router = APIRouter(prefix="/auth", tags=["Comptes"])

EMAIL_DEJA_UTILISE = "Un compte existe déjà avec cet email"
IDENTIFIANTS_INCORRECTS = "Email ou mot de passe incorrect"
GOOGLE_REFUSE = "Connexion avec Google refusée"
GOOGLE_INDISPONIBLE = "Connexion avec Google indisponible pour le moment"
GOOGLE_ADMIN = "Un administrateur se connecte avec son email et son mot de passe"


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


@router.post("/google", response_model=JetonGoogleSortie)
def connecter_avec_google(
    donnees: ConnexionGoogleEntree, db: Annotated[Session, Depends(get_db)]
) -> JetonGoogleSortie:
    try:
        identite = identite_google.verifier_jeton(donnees.id_token)
    except identite_google.ConnexionGoogleIndisponible as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=GOOGLE_INDISPONIBLE
        ) from exc
    except identite_google.JetonGoogleInvalide as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=GOOGLE_REFUSE,
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    utilisateur = db.scalar(select(Utilisateur).where(Utilisateur.google_id == identite.google_id))
    if utilisateur is None:
        utilisateur = db.scalar(select(Utilisateur).where(Utilisateur.email == identite.email))
        if utilisateur is not None and utilisateur.google_id is not None:
            # Adresse déjà rattachée à un autre compte Google : on ne remplace pas le lien.
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=GOOGLE_REFUSE)
    if utilisateur is not None and utilisateur.role == ROLE_ADMINISTRATEUR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=GOOGLE_ADMIN)

    nouveau_compte = utilisateur is None
    if nouveau_compte:
        utilisateur = Utilisateur(
            nom=identite.nom,
            prenom=identite.prenom,
            email=identite.email,
            mot_de_passe_hash=None,  # compte Google : aucun mot de passe stocké
            google_id=identite.google_id,
            role=ROLE_APPRENANT,
        )
        db.add(utilisateur)
    elif utilisateur.google_id is None:
        # Compte créé par email : rattaché à Google (email vérifié par Google).
        utilisateur.google_id = identite.google_id
    try:
        db.commit()
    except IntegrityError as exc:  # même compte Google créé au même instant par une autre requête
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=EMAIL_DEJA_UTILISE
        ) from exc
    return JetonGoogleSortie(
        access_token=creer_jeton(utilisateur.id), nouveau_compte=nouveau_compte
    )
