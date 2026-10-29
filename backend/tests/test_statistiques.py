"""Chiffres clés de l'administrateur (RF-11) : GET /admin/statistiques."""

from decimal import Decimal

import pytest

from app.models import Recommandation, Utilisateur
from tests.test_formations import ajouter_formation
from tests.test_profil import creer_compte, entete

URL = "/api/v1/admin/statistiques"


@pytest.fixture
def admin(db) -> Utilisateur:
    return creer_compte(db, email="admin@hitt.demo", role="administrateur")


def recommander(db, utilisateur, formation, retour: str = "aucun") -> Recommandation:
    recommandation = Recommandation(
        utilisateur_id=utilisateur.id, formation=formation, score=Decimal("0.5"), retour=retour
    )
    db.add(recommandation)
    db.flush()
    return recommandation


# --- Accès -------------------------------------------------------------------------------------


def test_sans_jeton_401(client):
    assert client.get(URL).status_code == 401


def test_apprenant_403(client, db):
    apprenant = creer_compte(db)
    reponse = client.get(URL, headers=entete(apprenant))
    assert reponse.status_code == 403
    assert reponse.json() == {"detail": "Accès réservé à l'administrateur"}


# --- Chiffres ----------------------------------------------------------------------------------


def test_base_vide(client, admin):
    reponse = client.get(URL, headers=entete(admin))
    assert reponse.status_code == 200
    assert reponse.json() == {
        "nb_apprenants": 0,
        "top_formations": [],
        "nb_retours": 0,
        "nb_retours_pertinents": 0,
        "taux_pertinent": None,
    }


def test_l_administrateur_n_est_pas_compte(client, db, admin):
    for i in range(3):
        creer_compte(db, email=f"apprenant{i}@hitt.demo")
    creer_compte(db, email="admin2@hitt.demo", role="administrateur")
    assert client.get(URL, headers=entete(admin)).json()["nb_apprenants"] == 3


def test_cinq_formations_les_plus_recommandees(client, db, admin):
    apprenants = [creer_compte(db, email=f"apprenant{i}@hitt.demo") for i in range(6)]
    formations = [ajouter_formation(db, intitule=f"Formation {i}") for i in range(7)]
    # Formation i recommandée à i apprenants (la formation 0 jamais).
    for i, formation in enumerate(formations):
        for apprenant in apprenants[:i]:
            recommander(db, apprenant, formation)

    top = client.get(URL, headers=entete(admin)).json()["top_formations"]
    assert [f["intitule"] for f in top] == [f"Formation {i}" for i in (6, 5, 4, 3, 2)]
    assert [f["nb_recommandations"] for f in top] == [6, 5, 4, 3, 2]
    assert top[0]["formation_id"] == str(formations[6].id)
    assert set(top[0]) == {"formation_id", "intitule", "domaine", "nb_recommandations"}


def test_egalite_departagee_par_intitule(client, db, admin):
    apprenant = creer_compte(db)
    for intitule in ("Bureautique", "Anglais", "Comptabilité"):
        recommander(db, apprenant, ajouter_formation(db, intitule=intitule))
    top = client.get(URL, headers=entete(admin)).json()["top_formations"]
    assert [f["intitule"] for f in top] == ["Anglais", "Bureautique", "Comptabilité"]


def test_formation_jamais_recommandee_absente(client, db, admin):
    ajouter_formation(db)
    assert client.get(URL, headers=entete(admin)).json()["top_formations"] == []


def test_taux_pertinent_parmi_les_retours_donnes(client, db, admin):
    apprenant = creer_compte(db)
    formation = ajouter_formation(db)
    for retour in ("pertinent", "pertinent", "pertinent", "non_pertinent", "aucun", "aucun"):
        recommander(db, apprenant, formation, retour)

    corps = client.get(URL, headers=entete(admin)).json()
    assert corps["nb_retours"] == 4
    assert corps["nb_retours_pertinents"] == 3
    assert corps["taux_pertinent"] == 0.75


def test_taux_null_sans_retour(client, db, admin):
    recommander(db, creer_compte(db), ajouter_formation(db))
    corps = client.get(URL, headers=entete(admin)).json()
    assert corps["nb_retours"] == 0
    assert corps["taux_pertinent"] is None
