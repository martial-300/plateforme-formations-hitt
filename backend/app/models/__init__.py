"""Modèles SQLAlchemy (S2) : Utilisateur, ProfilApprenant, Formation, Recommandation.

Chaque modèle importé ici est enregistré dans `Base.metadata` (créé au démarrage).
"""

from app.models.formation import Formation
from app.models.profil import ProfilApprenant
from app.models.recommandation import Recommandation
from app.models.utilisateur import Utilisateur

__all__ = ["Formation", "ProfilApprenant", "Recommandation", "Utilisateur"]
