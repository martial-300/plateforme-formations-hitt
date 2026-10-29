"""Recommandation calculée pour un apprenant (table `recommandations`, RF-08 à RF-10)."""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.formation import Formation, _valeurs_sql

RETOURS = ("pertinent", "non_pertinent", "aucun")


class Recommandation(Base):
    __tablename__ = "recommandations"
    __table_args__ = (
        CheckConstraint("score BETWEEN 0 AND 1", name="recommandations_score_check"),
        CheckConstraint(
            f"retour IN ({_valeurs_sql(RETOURS)})", name="recommandations_retour_check"
        ),
        Index("idx_recommandations_utilisateur", "utilisateur_id"),
        Index("idx_recommandations_formation", "formation_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid()
    )
    utilisateur_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("utilisateurs.id", ondelete="CASCADE")
    )
    # Supprimer une formation supprime ses recommandations (RF-04).
    formation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("formations.id", ondelete="CASCADE"))
    score: Mapped[Decimal] = mapped_column(Numeric(5, 4))
    # Mots-clés explicatifs (RF-09), gardés pour réafficher la page sans relancer le calcul.
    mots_cles_communs: Mapped[list[str]] = mapped_column(
        ARRAY(Text), default=list, server_default="{}"
    )
    retour: Mapped[str] = mapped_column(String(20), default="aucun", server_default="aucun")
    date_generation: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, server_default=func.now()
    )

    formation: Mapped[Formation] = relationship(lazy="joined")
