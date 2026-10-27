"""Compte de l'utilisateur connecté."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.models import Utilisateur
from app.schemas.utilisateur import UtilisateurSortie
from app.services.security import get_current_user

router = APIRouter(prefix="/users", tags=["Comptes"])


@router.get("/me", response_model=UtilisateurSortie)
def lire_mon_compte(
    utilisateur: Annotated[Utilisateur, Depends(get_current_user)],
) -> Utilisateur:
    return utilisateur
