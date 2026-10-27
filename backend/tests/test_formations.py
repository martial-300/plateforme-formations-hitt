"""Catalogue public (RF-05) : GET /formations (filtres domaine, type) et GET /formations/{id}."""

import uuid
from decimal import Decimal
from pathlib import Path

import pytest
from sqlalchemy import func, select

from app.models import Formation

CATALOGUE_SQL = Path(__file__).resolve().parents[2] / "database" / "02_catalogue_hitt.sql"


def ajouter_formation(db, **modifs) -> Formation:
    valeurs = {
        "intitule": "Développement de site web avec PHP, HTML, CSS",
        "description": "Créer des sites web dynamiques avec HTML, CSS et PHP.",
        "domaine": "TRIT",
        "type": "carte",
        "duree_valeur": Decimal("3"),
        "duree_unite": "semaine",
        "cout_fcfa": 125000,
        "cout_promo_fcfa": 120500,
        "mots_cles": ["développement web", "site web", "php"],
    }
    formation = Formation(**{**valeurs, **modifs})
    db.add(formation)
    db.flush()
    return formation


@pytest.fixture
def catalogue(db):
    """Les 86 formations de `database/02_catalogue_hitt.sql`, annulées à la fin du test."""
    # Script statique du dépôt, sans paramètre : il vérifie aussi que le modèle ORM accepte
    # exactement les lignes chargées dans PostgreSQL au premier démarrage.
    db.connection().exec_driver_sql(CATALOGUE_SQL.read_text(encoding="utf-8"))
    return db


# --- GET /formations ---------------------------------------------------------------------------


def test_liste_renvoie_les_86_formations_du_catalogue(client, catalogue):
    reponse = client.get("/api/v1/formations")
    assert reponse.status_code == 200
    formations = reponse.json()
    assert len(formations) == 86
    assert len(formations) == catalogue.scalar(select(func.count()).select_from(Formation))


@pytest.mark.parametrize(
    ("domaine", "type_", "attendu"),
    [
        ("SISG", "carte", 14),
        ("SISG", "modulaire", 17),
        ("IA-Data", "carte", 21),
        ("IA-Data", "modulaire", 3),
        ("TRIT", "carte", 19),
        ("TRIT", "modulaire", 12),
    ],
)
def test_filtres_domaine_et_type_sur_le_catalogue(client, catalogue, domaine, type_, attendu):
    reponse = client.get("/api/v1/formations", params={"domaine": domaine, "type": type_})
    assert reponse.status_code == 200
    formations = reponse.json()
    assert len(formations) == attendu
    assert {(f["domaine"], f["type"]) for f in formations} == {(domaine, type_)}


def test_filtre_domaine_seul(client, db):
    ajouter_formation(db, domaine="TRIT")
    ajouter_formation(db, domaine="SISG", intitule="Initiation Informatique")
    reponse = client.get("/api/v1/formations", params={"domaine": "SISG"})
    assert [f["intitule"] for f in reponse.json()] == ["Initiation Informatique"]


def test_filtre_type_seul(client, db):
    ajouter_formation(db, type="carte")
    ajouter_formation(db, type="modulaire", intitule="Module réseau", cout_promo_fcfa=None)
    reponse = client.get("/api/v1/formations", params={"type": "modulaire"})
    assert [f["intitule"] for f in reponse.json()] == ["Module réseau"]


def test_liste_vide_sans_formation(client):
    reponse = client.get("/api/v1/formations")
    assert reponse.status_code == 200
    assert reponse.json() == []


@pytest.mark.parametrize("params", [{"domaine": "Cuisine"}, {"type": "presentiel"}])
def test_filtre_inconnu_422(client, params):
    assert client.get("/api/v1/formations", params=params).status_code == 422


def test_format_d_une_formation_conforme_a_api_md(client, db):
    formation = ajouter_formation(db)
    corps = client.get("/api/v1/formations").json()[0]
    assert corps == {
        "id": str(formation.id),
        "intitule": "Développement de site web avec PHP, HTML, CSS",
        "description": "Créer des sites web dynamiques avec HTML, CSS et PHP.",
        "domaine": "TRIT",
        "type": "carte",
        "duree_valeur": 3,
        "duree_unite": "semaine",
        "cout_fcfa": 125000,
        "cout_promo_fcfa": 120500,
        "mots_cles": ["développement web", "site web", "php"],
    }
    assert isinstance(corps["duree_valeur"], float)


def test_liste_publique_sans_jeton(client, db):
    ajouter_formation(db)
    reponse = client.get("/api/v1/formations")
    assert reponse.status_code == 200


# --- GET /formations/{id} ----------------------------------------------------------------------


def test_detail_d_une_formation(client, db):
    formation = ajouter_formation(
        db, type="modulaire", cout_promo_fcfa=None, duree_valeur=Decimal("0.5")
    )
    reponse = client.get(f"/api/v1/formations/{formation.id}")
    assert reponse.status_code == 200
    corps = reponse.json()
    assert corps["id"] == str(formation.id)
    assert corps["cout_promo_fcfa"] is None
    assert corps["duree_valeur"] == 0.5


def test_detail_id_inconnu_404(client):
    reponse = client.get(f"/api/v1/formations/{uuid.uuid4()}")
    assert reponse.status_code == 404
    assert reponse.json() == {"detail": "Formation introuvable"}


def test_detail_id_mal_forme_422(client):
    assert client.get("/api/v1/formations/pas-un-uuid").status_code == 422
