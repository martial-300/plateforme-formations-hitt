"""Mise à jour d'une base créée avant le domaine TREB : database/maj/2026-11-09_domaine_treb.sql."""

import pytest
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.models import Formation
from tests.conftest import CATALOGUE_SQL

SCRIPT = CATALOGUE_SQL.parent / "maj" / "2026-11-09_domaine_treb.sql"
ANCIENNE_CONTRAINTE = "CHECK (domaine IN ('SISG', 'IA-Data', 'TRIT'))"


def appliquer(db) -> None:
    db.connection().exec_driver_sql(SCRIPT.read_text(encoding="utf-8"))


def formations_treb(db) -> list[tuple]:
    lignes = db.execute(
        select(
            Formation.intitule,
            Formation.description,
            Formation.type,
            Formation.duree_valeur,
            Formation.duree_unite,
            Formation.cout_fcfa,
            Formation.cout_promo_fcfa,
            Formation.mots_cles,
        )
        .where(Formation.domaine == "TREB")
        .order_by(Formation.intitule)
    ).all()
    return [tuple(ligne) for ligne in lignes]


@pytest.fixture
def base_avant_treb(catalogue):
    """Le catalogue tel qu'il était avant TREB : 86 formations, contrainte à 3 domaines."""
    attendues = formations_treb(catalogue)
    connexion = catalogue.connection()
    connexion.exec_driver_sql("DELETE FROM formations WHERE domaine = 'TREB'")
    connexion.exec_driver_sql("ALTER TABLE formations DROP CONSTRAINT formations_domaine_check")
    connexion.exec_driver_sql(
        f"ALTER TABLE formations ADD CONSTRAINT formations_domaine_check {ANCIENNE_CONTRAINTE}"
    )
    return catalogue, attendues


def nombre(db, domaine: str | None = None) -> int:
    requete = select(func.count()).select_from(Formation)
    if domaine:
        requete = requete.where(Formation.domaine == domaine)
    return db.scalar(requete)


def test_base_avant_treb_refuse_le_domaine(base_avant_treb):
    db, _ = base_avant_treb
    with pytest.raises(IntegrityError, match="formations_domaine_check"), db.begin_nested():
        db.add(
            Formation(
                intitule="Essai",
                description="x",
                domaine="TREB",
                type="carte",
                duree_valeur=1,
                duree_unite="jour",
                cout_fcfa=1000,
                mots_cles=["x"],
            )
        )
        db.flush()


def test_ajoute_les_10_formations_du_catalogue(base_avant_treb):
    db, attendues = base_avant_treb
    assert nombre(db) == 86
    appliquer(db)
    assert nombre(db) == 96
    # Mêmes valeurs que 02_catalogue_hitt.sql : le script et le catalogue ne divergent pas.
    assert formations_treb(db) == attendues
    assert len(attendues) == 10


def test_relancable_sans_doublon(base_avant_treb):
    db, _ = base_avant_treb
    appliquer(db)
    appliquer(db)
    assert nombre(db) == 96
    assert nombre(db, "TREB") == 10


def test_sans_effet_sur_une_base_neuve(catalogue):
    avant = formations_treb(catalogue)
    appliquer(catalogue)
    assert nombre(catalogue) == 96
    assert formations_treb(catalogue) == avant


def test_domaine_inconnu_toujours_refuse(base_avant_treb):
    db, _ = base_avant_treb
    appliquer(db)
    with pytest.raises(IntegrityError, match="formations_domaine_check"), db.begin_nested():
        db.add(
            Formation(
                intitule="Essai",
                description="x",
                domaine="AUTRE",
                type="carte",
                duree_valeur=1,
                duree_unite="jour",
                cout_fcfa=1000,
                mots_cles=["x"],
            )
        )
        db.flush()
