"""Profil d'un apprenant : réponses au questionnaire (table `profils_apprenants`, RF-06, RF-07)."""

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.formation import TYPES, _valeurs_sql


class ProfilApprenant(Base):
    __tablename__ = "profils_apprenants"
    __table_args__ = (
        CheckConstraint(
            f"type_souhaite IN ({_valeurs_sql(TYPES)})",
            name="profils_apprenants_type_souhaite_check",
        ),
        CheckConstraint("budget_max_fcfa >= 0", name="profils_apprenants_budget_max_fcfa_check"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid()
    )
    # Un seul profil par apprenant : resoumettre le questionnaire l'écrase (RF-07).
    utilisateur_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("utilisateurs.id", ondelete="CASCADE"), unique=True
    )
    niveau_etudes: Mapped[str] = mapped_column(String(50))
    competences: Mapped[str] = mapped_column(Text)
    centres_interet: Mapped[str] = mapped_column(Text)
    objectif_professionnel: Mapped[str] = mapped_column(Text)
    type_souhaite: Mapped[str] = mapped_column(String(20))
    budget_max_fcfa: Mapped[int] = mapped_column(Integer)
    date_maj: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, server_default=func.now()
    )
