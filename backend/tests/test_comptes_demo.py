"""Comptes de démonstration (S7) : app/outils/comptes_demo.py, appelé à travers l'API de test."""

import pytest
from sqlalchemy import func, select

from app.models import ProfilApprenant, Utilisateur
from app.outils.comptes_demo import COMPTES_DEMO, ErreurDemo, creer_comptes_demo

MOT_DE_PASSE = "mot-de-passe-de-demo"


@pytest.fixture
def appel(client):
    def appel(methode, chemin, corps, jeton):
        entetes = {"Authorization": f"Bearer {jeton}"} if jeton else {}
        reponse = client.request(methode, f"/api/v1{chemin}", json=corps, headers=entetes)
        return reponse.status_code, reponse.json()

    return appel


def nombre(db, modele) -> int:
    return db.scalar(select(func.count()).select_from(modele))


def test_comptes_crees_avec_leurs_recommandations(appel, catalogue):
    resume = creer_comptes_demo(appel, MOT_DE_PASSE)
    assert len(resume) == len(COMPTES_DEMO)
    assert all(": créé, " in ligne for ligne in resume)
    assert nombre(catalogue, Utilisateur) == len(COMPTES_DEMO)
    assert nombre(catalogue, ProfilApprenant) == len(COMPTES_DEMO)
    for ligne in resume:
        assert not ligne.endswith(" 0 recommandations")


def test_relancable(appel, catalogue):
    creer_comptes_demo(appel, MOT_DE_PASSE)
    resume = creer_comptes_demo(appel, MOT_DE_PASSE)
    assert all(": déjà présent, " in ligne for ligne in resume)
    assert nombre(catalogue, Utilisateur) == len(COMPTES_DEMO)
    assert nombre(catalogue, ProfilApprenant) == len(COMPTES_DEMO)


def test_comptes_apprenants_fictifs(appel, catalogue):
    creer_comptes_demo(appel, MOT_DE_PASSE)
    comptes = catalogue.scalars(select(Utilisateur)).all()
    assert {c.role for c in comptes} == {"apprenant"}
    assert all(c.email.endswith("@hitt.demo") for c in comptes)


def test_autre_mot_de_passe_refuse(appel, catalogue):
    creer_comptes_demo(appel, MOT_DE_PASSE)
    with pytest.raises(ErreurDemo, match="connexion refusée"):
        creer_comptes_demo(appel, "un-autre-mot-de-passe")


@pytest.mark.parametrize("mot_de_passe", ["", "court", "é" * 37, "changer-moi-aussi"])
def test_mot_de_passe_invalide(appel, mot_de_passe):
    with pytest.raises(ErreurDemo, match="DEMO_MOT_DE_PASSE"):
        creer_comptes_demo(appel, mot_de_passe)
