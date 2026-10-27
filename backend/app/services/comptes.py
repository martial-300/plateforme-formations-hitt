"""Compte administrateur créé au démarrage à partir des variables ADMIN_* (RF-03)."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Parametres
from app.models import Utilisateur
from app.models.utilisateur import ROLE_ADMINISTRATEUR
from app.services.security import hacher_mot_de_passe

logger = logging.getLogger(__name__)


def creer_admin_si_absent(db: Session, parametres: Parametres) -> bool:
    """Crée l'administrateur s'il n'existe pas ; un compte existant n'est jamais modifié.

    Renvoie vrai si le compte a été créé.
    """
    email = parametres.admin_email.strip().lower()
    if not email:
        return False
    existant = db.scalar(select(Utilisateur).where(Utilisateur.email == email))
    if existant is not None:
        if existant.role != ROLE_ADMINISTRATEUR:
            # Jamais de promotion automatique : l'exploitant doit choisir une autre adresse.
            logger.warning("ADMIN_EMAIL désigne un compte non administrateur : admin non créé")
        return False
    db.add(
        Utilisateur(
            nom=parametres.admin_nom,
            prenom=parametres.admin_prenom,
            email=email,
            mot_de_passe_hash=hacher_mot_de_passe(parametres.admin_password),
            role=ROLE_ADMINISTRATEUR,
        )
    )
    try:
        db.commit()
    except IntegrityError:  # créé au même instant par un autre processus de l'API
        db.rollback()
        return False
    return True
