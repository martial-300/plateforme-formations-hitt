"""Formation du catalogue HIT-T Institute (table `formations`, RF-05)."""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, Index, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

DOMAINES = ("SISG", "IA-Data", "TRIT")
TYPES = ("carte", "modulaire")
UNITES_DUREE = ("heure", "jour", "semaine", "mois")


def _valeurs_sql(valeurs: tuple[str, ...]) -> str:
    return ", ".join(f"'{valeur}'" for valeur in valeurs)


class Formation(Base):
    __tablename__ = "formations"
    __table_args__ = (
        CheckConstraint(f"domaine IN ({_valeurs_sql(DOMAINES)})", name="formations_domaine_check"),
        CheckConstraint(f"type IN ({_valeurs_sql(TYPES)})", name="formations_type_check"),
        CheckConstraint(
            f"duree_unite IN ({_valeurs_sql(UNITES_DUREE)})", name="formations_duree_unite_check"
        ),
        Index("idx_formations_domaine_type", "domaine", "type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid()
    )
    intitule: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    domaine: Mapped[str] = mapped_column(String(20))
    type: Mapped[str] = mapped_column(String(20))
    duree_valeur: Mapped[Decimal] = mapped_column(Numeric(4, 1))
    duree_unite: Mapped[str] = mapped_column(String(10))
    cout_fcfa: Mapped[int] = mapped_column(Integer)
    # NULL pour les formations modulaires (pas de prix promo).
    cout_promo_fcfa: Mapped[int | None] = mapped_column(Integer)
    mots_cles: Mapped[list[str]] = mapped_column(ARRAY(Text))
    date_creation: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, server_default=func.now()
    )
