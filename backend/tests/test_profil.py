"""Questionnaire et recommandations (RF-06 à RF-09) : PUT /profil."""

import time

import pytest
from sqlalchemy import func, select

from app.models import ProfilApprenant, Recommandation, Utilisateur
from app.services.security import creer_jeton
from tests.test_formations import ajouter_formation

URL = "/api/v1/profil"

REPONSES = {
    "niveau_etudes": "BAC II",
    "competences": "word excel bases internet",
    "centres_interet": "programmation sites web informatique",
    "objectif_professionnel": "devenir développeur web",
    "type_souhaite": "carte",
    "budget_max_fcfa": 150000,
}


def creer_compte(db, email: str = "afi@example.com", role: str = "apprenant") -> Utilisateur:
    utilisateur = Utilisateur(
        nom="Kossi", prenom="Afi", email=email, mot_de_passe_hash="x", role=role
    )
    db.add(utilisateur)
    db.flush()
    return utilisateur


def entete(utilisateur: Utilisateur) -> dict[str, str]:
    return {"Authorization": f"Bearer {creer_jeton(utilisateur.id)}"}


@pytest.fixture
def apprenant(db) -> Utilisateur:
    return creer_compte(db)


def nombre(db, modele, utilisateur: Utilisateur) -> int:
    return db.scalar(
        select(func.count()).select_from(modele).where(modele.utilisateur_id == utilisateur.id)
    )


# --- Accès et validation ---------------------------------------------------------------------


def test_sans_jeton_401(client, db):
    assert client.put(URL, json=REPONSES).status_code == 401


def test_administrateur_403_et_rien_enregistre(client, db, catalogue):
    admin = creer_compte(db, email="admin@example.com", role="administrateur")
    reponse = client.put(URL, json=REPONSES, headers=entete(admin))
    assert reponse.status_code == 403
    assert reponse.json() == {"detail": "Accès réservé aux apprenants"}
    assert nombre(db, ProfilApprenant, admin) == 0
    assert nombre(db, Recommandation, admin) == 0


@pytest.mark.parametrize(
    ("champ", "valeur"),
    [
        ("budget_max_fcfa", -1),
        ("budget_max_fcfa", 2_147_483_648),
        ("type_souhaite", "intensif"),
        ("competences", "   "),
        ("centres_interet", "x" * 1001),
        ("niveau_etudes", "x" * 51),
        ("competences", "excel\u0000word"),
        ("niveau_etudes", "BAC\u0000"),
    ],
)
def test_reponse_invalide_422_et_rien_enregistre(client, db, apprenant, champ, valeur):
    reponse = client.put(URL, json=REPONSES | {champ: valeur}, headers=entete(apprenant))
    assert reponse.status_code == 422
    assert nombre(db, ProfilApprenant, apprenant) == 0


def test_champ_manquant_422(client, apprenant):
    incomplet = {k: v for k, v in REPONSES.items() if k != "objectif_professionnel"}
    assert client.put(URL, json=incomplet, headers=entete(apprenant)).status_code == 422


# --- Enregistrement du profil ----------------------------------------------------------------


def test_premiere_soumission_cree_le_profil(client, db, apprenant):
    reponse = client.put(URL, json=REPONSES, headers=entete(apprenant))
    assert reponse.status_code == 200
    profil = reponse.json()["profil"]
    assert {k: profil[k] for k in REPONSES} == REPONSES
    assert "date_maj" in profil
    assert nombre(db, ProfilApprenant, apprenant) == 1


def test_espaces_retires_des_reponses(client, apprenant):
    reponse = client.put(
        URL, json=REPONSES | {"competences": "  excel  "}, headers=entete(apprenant)
    )
    assert reponse.json()["profil"]["competences"] == "excel"


def test_resoumission_ecrase_le_profil(client, db, apprenant):
    client.put(URL, json=REPONSES, headers=entete(apprenant))
    modifie = REPONSES | {"type_souhaite": "modulaire", "budget_max_fcfa": 900000}
    reponse = client.put(URL, json=modifie, headers=entete(apprenant))
    assert reponse.status_code == 200
    assert reponse.json()["profil"]["type_souhaite"] == "modulaire"
    assert nombre(db, ProfilApprenant, apprenant) == 1
    profil = db.scalar(
        select(ProfilApprenant).where(ProfilApprenant.utilisateur_id == apprenant.id)
    )
    db.refresh(profil)
    assert profil.budget_max_fcfa == 900000


def test_un_profil_par_apprenant(client, db, apprenant):
    autre = creer_compte(db, email="kodjo@example.com")
    client.put(URL, json=REPONSES, headers=entete(apprenant))
    client.put(URL, json=REPONSES | {"niveau_etudes": "BEPC"}, headers=entete(autre))
    assert nombre(db, ProfilApprenant, apprenant) == 1
    assert nombre(db, ProfilApprenant, autre) == 1


# --- Recommandations -------------------------------------------------------------------------


def test_recommandations_renvoyees_et_enregistrees(client, db, apprenant):
    web = ajouter_formation(db)
    ajouter_formation(db, intitule="Cuisine", description="Pâtisserie.", mots_cles=["cuisine"])
    reponse = client.put(URL, json=REPONSES, headers=entete(apprenant))
    recommandations = reponse.json()["recommandations"]
    assert len(recommandations) == 1
    reco = recommandations[0]
    assert reco["formation"]["id"] == str(web.id)
    assert 0 < reco["score"] <= 1
    assert reco["retour"] == "aucun"
    assert reco["mots_cles_communs"] == []  # « site web » absent tel quel du profil
    enregistree = db.get(Recommandation, reco["id"])
    assert enregistree.utilisateur_id == apprenant.id
    assert float(enregistree.score) == reco["score"]


def test_cinq_au_plus_tries_par_score(client, catalogue, apprenant):
    reponse = client.put(URL, json=REPONSES, headers=entete(apprenant))
    recommandations = reponse.json()["recommandations"]
    assert len(recommandations) == 5
    scores = [r["score"] for r in recommandations]
    assert scores == sorted(scores, reverse=True)
    for reco in recommandations:
        formation = reco["formation"]
        prix = formation["cout_promo_fcfa"] or formation["cout_fcfa"]
        assert formation["type"] == "carte" and prix <= 150000


def test_resoumission_remplace_les_recommandations(client, db, catalogue, apprenant):
    premiere = client.put(URL, json=REPONSES, headers=entete(apprenant)).json()
    seconde = client.put(
        URL,
        json=REPONSES | {"type_souhaite": "modulaire", "budget_max_fcfa": 2_000_000},
        headers=entete(apprenant),
    ).json()
    anciens = {r["id"] for r in premiere["recommandations"]}
    nouveaux = {r["id"] for r in seconde["recommandations"]}
    assert not anciens & nouveaux
    assert {r["formation"]["type"] for r in seconde["recommandations"]} == {"modulaire"}
    assert nombre(db, Recommandation, apprenant) == len(nouveaux)


def test_recommandations_des_autres_apprenants_conservees(client, db, catalogue, apprenant):
    autre = creer_compte(db, email="kodjo@example.com")
    client.put(URL, json=REPONSES, headers=entete(autre))
    client.put(URL, json=REPONSES, headers=entete(apprenant))
    client.put(URL, json=REPONSES, headers=entete(apprenant))
    assert nombre(db, Recommandation, autre) == 5


def test_aucune_formation_dans_le_budget(client, db, catalogue, apprenant):
    reponse = client.put(URL, json=REPONSES | {"budget_max_fcfa": 0}, headers=entete(apprenant))
    assert reponse.status_code == 200
    assert reponse.json()["recommandations"] == []
    assert nombre(db, ProfilApprenant, apprenant) == 1
    assert nombre(db, Recommandation, apprenant) == 0


def test_catalogue_vide(client, apprenant):
    reponse = client.put(URL, json=REPONSES, headers=entete(apprenant))
    assert reponse.status_code == 200
    assert reponse.json()["recommandations"] == []


def test_reponse_en_moins_de_3_secondes(client, catalogue, apprenant):
    debut = time.perf_counter()
    reponse = client.put(URL, json=REPONSES, headers=entete(apprenant))
    assert reponse.status_code == 200
    assert time.perf_counter() - debut < 3


# --- GET /profil -----------------------------------------------------------------------------


def test_lecture_sans_jeton_401(client, db):
    assert client.get(URL).status_code == 401


def test_lecture_par_un_administrateur_403(client, db):
    admin = creer_compte(db, email="admin@example.com", role="administrateur")
    assert client.get(URL, headers=entete(admin)).status_code == 403


def test_lecture_sans_profil_404(client, apprenant):
    reponse = client.get(URL, headers=entete(apprenant))
    assert reponse.status_code == 404
    assert reponse.json() == {"detail": "Aucun profil : répondez au questionnaire"}


def test_lecture_renvoie_la_derniere_soumission(client, catalogue, apprenant):
    envoi = client.put(URL, json=REPONSES, headers=entete(apprenant)).json()
    reponse = client.get(URL, headers=entete(apprenant))
    assert reponse.status_code == 200
    assert reponse.json() == envoi


def test_lecture_sans_recalcul_et_retour_conserve(client, db, catalogue, apprenant):
    envoi = client.put(URL, json=REPONSES, headers=entete(apprenant)).json()
    premiere = db.get(Recommandation, envoi["recommandations"][0]["id"])
    premiere.retour = "pertinent"
    db.flush()
    lu = client.get(URL, headers=entete(apprenant)).json()
    assert [r["id"] for r in lu["recommandations"]] == [r["id"] for r in envoi["recommandations"]]
    assert lu["recommandations"][0]["retour"] == "pertinent"


def test_lecture_limitee_a_son_propre_profil(client, db, catalogue, apprenant):
    autre = creer_compte(db, email="kodjo@example.com")
    client.put(URL, json=REPONSES, headers=entete(autre))
    assert client.get(URL, headers=entete(apprenant)).status_code == 404
    client.put(URL, json=REPONSES | {"niveau_etudes": "BEPC"}, headers=entete(apprenant))
    assert client.get(URL, headers=entete(apprenant)).json()["profil"]["niveau_etudes"] == "BEPC"
