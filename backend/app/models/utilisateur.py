"""Compte de la plateforme : apprenant ou administrateur (table `utilisateurs`)."""

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

ROLE_APPRENANT = "apprenant"
ROLE_ADMINISTRATEUR = "administrateur"


class Utilisateur(Base):
    __tablename__ = "utilisateurs"
    __table_args__ = (
        CheckConstraint(
            f"role IN ('{ROLE_APPRENANT}', '{ROLE_ADMINISTRATEUR}')", name="utilisateurs_role_check"
        ),
        # Un compte email a un mot de passe, un compte Google (RF-13) un google_id.
        CheckConstraint(
            "mot_de_passe_hash IS NOT NULL OR google_id IS NOT NULL", name="utilisateurs_check"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid()
    )
    nom: Mapped[str] = mapped_column(String(100))
    prenom: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    mot_de_passe_hash: Mapped[str | None] = mapped_column(String(255))
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True)
    role: Mapped[str] = mapped_column(
        String(20), default=ROLE_APPRENANT, server_default=ROLE_APPRENANT
    )
    date_creation: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, server_default=func.now()
    )
