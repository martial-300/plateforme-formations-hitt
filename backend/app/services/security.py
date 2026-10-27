"""Sécurité (RF-03) : hachage bcrypt, JWT HS256 et dépendances d'accès aux routes."""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import parametres
from app.database import get_db
from app.models import Utilisateur
from app.models.utilisateur import ROLE_ADMINISTRATEUR

ALGORITHME_JWT = "HS256"

_contexte_mdp = CryptContext(schemes=["bcrypt"], deprecated="auto")
# auto_error=False : un en-tête absent renvoie notre 401, pas l'erreur par défaut de FastAPI.
_schema_bearer = HTTPBearer(auto_error=False)


def hacher_mot_de_passe(mot_de_passe: str) -> str:
    return _contexte_mdp.hash(mot_de_passe)


def verifier_mot_de_passe(mot_de_passe: str, mot_de_passe_hash: str | None) -> bool:
    """Faux pour un compte sans mot de passe (compte Google) ou un hash illisible."""
    if not mot_de_passe_hash:
        return False
    try:
        return _contexte_mdp.verify(mot_de_passe, mot_de_passe_hash)
    except ValueError:
        return False


def creer_jeton(utilisateur_id: uuid.UUID) -> str:
    """JWT ne portant que l'identifiant : le rôle est relu en base à chaque requête."""
    maintenant = datetime.now(UTC)
    charge = {
        "sub": str(utilisateur_id),
        "iat": maintenant,
        "exp": maintenant + timedelta(minutes=parametres.jwt_expire_minutes),
    }
    return jwt.encode(charge, parametres.jwt_secret, algorithm=ALGORITHME_JWT)


def _non_authentifie() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentification requise ou session expirée",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    identifiants: Annotated[HTTPAuthorizationCredentials | None, Depends(_schema_bearer)],
    db: Annotated[Session, Depends(get_db)],
) -> Utilisateur:
    """Utilisateur du JWT ; 401 si le jeton est absent, expiré, falsifié ou le compte supprimé."""
    if identifiants is None:
        raise _non_authentifie()
    try:
        charge = jwt.decode(
            identifiants.credentials,
            parametres.jwt_secret,
            algorithms=[ALGORITHME_JWT],
            options={"require": ["exp", "sub"]},
        )
        utilisateur_id = uuid.UUID(charge["sub"])
    except (jwt.InvalidTokenError, ValueError) as exc:
        raise _non_authentifie() from exc

    utilisateur = db.get(Utilisateur, utilisateur_id)
    if utilisateur is None:
        raise _non_authentifie()
    return utilisateur


def require_admin(
    utilisateur: Annotated[Utilisateur, Depends(get_current_user)],
) -> Utilisateur:
    """Administrateur connecté ; 403 pour un apprenant."""
    if utilisateur.role != ROLE_ADMINISTRATEUR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Accès réservé à l'administrateur"
        )
    return utilisateur
