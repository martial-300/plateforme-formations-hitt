"""Retour sur une recommandation (RF-10) : POST /recommandations/{id}/retour."""

import uuid

import pytest

from app.models import Recommandation
from tests.test_profil import REPONSES, creer_compte, entete

URL_PROFIL = "/api/v1/profil"


def url(recommandation_id) -> str:
    return f"/api/v1/recommandations/{recommandation_id}/retour"


@pytest.fixture
def apprenant(db):
    return creer_compte(db)


@pytest.fixture
def recommandation(client, catalogue, apprenant) -> dict:
    reponse = client.put(URL_PROFIL, json=REPONSES, headers=entete(apprenant))
    return reponse.json()["recommandations"][0]


@pytest.mark.parametrize("retour", ["pertinent", "non_pertinent"])
def test_retour_enregistre_et_renvoye(client, db, apprenant, recommandation, retour):
    reponse = client.post(
        url(recommandation["id"]), json={"retour": retour}, headers=entete(apprenant)
    )
    assert reponse.status_code == 200
    corps = reponse.json()
    assert corps["retour"] == retour
    assert {k: v for k, v in corps.items() if k != "retour"} == {
        k: v for k, v in recommandation.items() if k != "retour"
    }
    assert db.get(Recommandation, recommandation["id"]).retour == retour


def test_retour_modifiable(client, db, apprenant, recommandation):
    client.post(url(recommandation["id"]), json={"retour": "pertinent"}, headers=entete(apprenant))
    reponse = client.post(
        url(recommandation["id"]), json={"retour": "non_pertinent"}, headers=entete(apprenant)
    )
    assert reponse.json()["retour"] == "non_pertinent"
    assert db.get(Recommandation, recommandation["id"]).retour == "non_pertinent"


def test_retour_visible_dans_get_profil(client, apprenant, recommandation):
    client.post(url(recommandation["id"]), json={"retour": "pertinent"}, headers=entete(apprenant))
    lu = client.get(URL_PROFIL, headers=entete(apprenant)).json()
    retours = {r["id"]: r["retour"] for r in lu["recommandations"]}
    assert retours[recommandation["id"]] == "pertinent"
    assert list(retours.values()).count("aucun") == len(retours) - 1


@pytest.mark.parametrize("valeur", ["aucun", "oui", "", None])
def test_valeur_invalide_422(client, db, apprenant, recommandation, valeur):
    reponse = client.post(
        url(recommandation["id"]), json={"retour": valeur}, headers=entete(apprenant)
    )
    assert reponse.status_code == 422
    assert db.get(Recommandation, recommandation["id"]).retour == "aucun"


def test_corps_absent_422(client, apprenant, recommandation):
    assert client.post(url(recommandation["id"]), headers=entete(apprenant)).status_code == 422


def test_sans_jeton_401(client, recommandation):
    assert client.post(url(recommandation["id"]), json={"retour": "pertinent"}).status_code == 401


def test_administrateur_403(client, db, recommandation):
    admin = creer_compte(db, email="admin@example.com", role="administrateur")
    reponse = client.post(
        url(recommandation["id"]), json={"retour": "pertinent"}, headers=entete(admin)
    )
    assert reponse.status_code == 403
    assert db.get(Recommandation, recommandation["id"]).retour == "aucun"


def test_recommandation_d_un_autre_apprenant_404(client, db, recommandation):
    autre = creer_compte(db, email="kodjo@example.com")
    reponse = client.post(
        url(recommandation["id"]), json={"retour": "pertinent"}, headers=entete(autre)
    )
    assert reponse.status_code == 404
    assert reponse.json() == {"detail": "Recommandation introuvable"}
    assert db.get(Recommandation, recommandation["id"]).retour == "aucun"


def test_recommandation_inconnue_404(client, apprenant):
    reponse = client.post(
        url(uuid.uuid4()), json={"retour": "pertinent"}, headers=entete(apprenant)
    )
    assert reponse.status_code == 404


def test_identifiant_mal_forme_422(client, apprenant):
    reponse = client.post(
        url("pas-un-uuid"), json={"retour": "pertinent"}, headers=entete(apprenant)
    )
    assert reponse.status_code == 422


def test_retour_perdu_apres_nouvelle_soumission(client, apprenant, recommandation):
    # Resoumettre le questionnaire remplace les recommandations : les retours repartent de zéro.
    client.post(url(recommandation["id"]), json={"retour": "pertinent"}, headers=entete(apprenant))
    nouvelles = client.put(URL_PROFIL, json=REPONSES, headers=entete(apprenant)).json()
    assert {r["retour"] for r in nouvelles["recommandations"]} == {"aucun"}
    ancienne = client.post(
        url(recommandation["id"]), json={"retour": "pertinent"}, headers=entete(apprenant)
    )
    assert ancienne.status_code == 404
