"""Aperçu visiteur (RF-12) : POST /recommandations/apercu, public, sans écriture en base."""

import pytest
from sqlalchemy import func, select

from app.models import Formation, ProfilApprenant, Recommandation, Utilisateur
from app.routers.apercu import limite_apercu
from app.services.limite_appels import LimiteAppels

URL = "/api/v1/recommandations/apercu"

REPONSES = {
    "centres_interet": "créer des sites internet, programmer",
    "type_souhaite": "carte",
    "budget_max_fcfa": 150000,
}


@pytest.fixture(autouse=True)
def compteurs_remis_a_zero():
    limite_apercu.reinitialiser()
    yield
    limite_apercu.reinitialiser()


def nombre_de_lignes(db) -> dict[str, int]:
    return {
        modele.__name__: db.scalar(select(func.count()).select_from(modele))
        for modele in (Utilisateur, ProfilApprenant, Recommandation, Formation)
    }


# --- Résultats ---------------------------------------------------------------------------------


def test_trois_resultats_au_plus_avec_rang(client, catalogue):
    reponse = client.post(URL, json=REPONSES)
    assert reponse.status_code == 200
    recommandations = reponse.json()["recommandations"]
    assert 1 <= len(recommandations) <= 3
    assert [r["rang"] for r in recommandations] == list(range(1, len(recommandations) + 1))
    scores = [r["score"] for r in recommandations]
    assert scores == sorted(scores, reverse=True)
    assert all(0 < score <= 1 for score in scores)


def test_ni_description_ni_identifiant_de_recommandation(client, catalogue):
    recommandation = client.post(URL, json=REPONSES).json()["recommandations"][0]
    assert set(recommandation) == {"rang", "score", "mots_cles_communs", "formation"}
    assert set(recommandation["formation"]) == {
        "id",
        "intitule",
        "domaine",
        "type",
        "duree_valeur",
        "duree_unite",
        "cout_fcfa",
        "cout_promo_fcfa",
    }


def test_format_et_budget_respectes(client, catalogue):
    recommandations = client.post(URL, json=REPONSES).json()["recommandations"]
    for recommandation in recommandations:
        formation = recommandation["formation"]
        assert formation["type"] == "carte"
        prix = formation["cout_promo_fcfa"] or formation["cout_fcfa"]
        assert prix <= REPONSES["budget_max_fcfa"]


def test_mots_cles_communs_tires_de_la_reponse(client, catalogue):
    corps = REPONSES | {"centres_interet": "développement web et site web"}
    recommandations = client.post(URL, json=corps).json()["recommandations"]
    communs = [mot for r in recommandations for mot in r["mots_cles_communs"]]
    assert {"développement web", "site web"} <= set(communs)
    assert all(mot in corps["centres_interet"] for mot in communs)


def test_aucune_formation_dans_le_budget(client, catalogue):
    reponse = client.post(URL, json=REPONSES | {"budget_max_fcfa": 0})
    assert reponse.status_code == 200
    assert reponse.json() == {"recommandations": []}


def test_catalogue_vide(client):
    reponse = client.post(URL, json=REPONSES)
    assert reponse.status_code == 200
    assert reponse.json() == {"recommandations": []}


def test_rien_n_est_enregistre(client, catalogue):
    avant = nombre_de_lignes(catalogue)
    assert client.post(URL, json=REPONSES).status_code == 200
    assert nombre_de_lignes(catalogue) == avant


def test_public_meme_avec_un_jeton_invalide(client, catalogue):
    reponse = client.post(URL, json=REPONSES, headers={"Authorization": "Bearer faux"})
    assert reponse.status_code == 200


# --- Validation --------------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("champ", "valeur"),
    [
        ("centres_interet", ""),
        ("centres_interet", "   "),
        ("centres_interet", "x" * 1001),
        ("centres_interet", "web\x00"),
        ("type_souhaite", "les deux"),
        ("budget_max_fcfa", -1),
        ("budget_max_fcfa", 2_147_483_648),
    ],
)
def test_reponse_invalide_422(client, champ, valeur):
    assert client.post(URL, json=REPONSES | {champ: valeur}).status_code == 422


def test_champ_manquant_422(client):
    corps = {cle: valeur for cle, valeur in REPONSES.items() if cle != "type_souhaite"}
    assert client.post(URL, json=corps).status_code == 422


# --- Limite d'appels ---------------------------------------------------------------------------


def test_au_dela_de_la_limite_429(client, catalogue):
    for _ in range(limite_apercu.maximum):
        assert client.post(URL, json=REPONSES).status_code == 200
    reponse = client.post(URL, json=REPONSES)
    assert reponse.status_code == 429
    assert reponse.json() == {"detail": "Trop de demandes : réessayez dans une minute"}
    assert 1 <= int(reponse.headers["Retry-After"]) <= 60


def test_requetes_invalides_comptees(client):
    # Sinon un robot pourrait envoyer des corps invalides sans jamais être limité.
    for _ in range(limite_apercu.maximum):
        client.post(URL, json={})
    assert client.post(URL, json=REPONSES).status_code == 429


def test_limite_par_adresse():
    limite = LimiteAppels(maximum=2, fenetre_s=60)
    assert limite.attente("192.0.2.1", maintenant=0) is None
    assert limite.attente("192.0.2.1", maintenant=1) is None
    assert limite.attente("192.0.2.1", maintenant=2) == pytest.approx(58)
    # Une autre adresse a son propre compteur.
    assert limite.attente("192.0.2.2", maintenant=2) is None


def test_limite_levee_apres_la_fenetre():
    limite = LimiteAppels(maximum=2, fenetre_s=60)
    limite.attente("192.0.2.1", maintenant=0)
    limite.attente("192.0.2.1", maintenant=30)
    assert limite.attente("192.0.2.1", maintenant=59) is not None
    # L'appel refusé ne prolonge pas l'attente ; le premier appel sort de la fenêtre à 60 s.
    assert limite.attente("192.0.2.1", maintenant=60) is None


def test_adresses_inactives_oubliees():
    limite = LimiteAppels(maximum=2, fenetre_s=60, adresses_max=3)
    for i in range(3):
        limite.attente(f"192.0.2.{i}", maintenant=0)
    limite.attente("192.0.2.9", maintenant=61)
    assert limite.nb_adresses_suivies == 1


def test_nouvelle_adresse_refusee_si_toutes_actives():
    limite = LimiteAppels(maximum=2, fenetre_s=60, adresses_max=3)
    for i in range(3):
        limite.attente(f"192.0.2.{i}", maintenant=0)
    assert limite.attente("192.0.2.9", maintenant=30) == 60
    assert limite.nb_adresses_suivies == 3
    # Les adresses déjà suivies restent servies.
    assert limite.attente("192.0.2.0", maintenant=30) is None
