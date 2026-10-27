"""Comptes (RF-01, RF-02) : inscription, connexion, /users/me et administrateur au démarrage."""

import dataclasses

import pytest
from sqlalchemy import select

from app.config import Parametres, parametres
from app.models import Utilisateur
from app.services.comptes import creer_admin_si_absent
from app.services.security import hacher_mot_de_passe

INSCRIPTION = {
    "nom": "Kossi",
    "prenom": "Afi",
    "email": "afi@example.com",
    "mot_de_passe": "mot-de-passe-de-test",
}


def inscrire(client, **modifs):
    return client.post("/api/v1/auth/register", json={**INSCRIPTION, **modifs})


def connecter(client, email="afi@example.com", mot_de_passe="mot-de-passe-de-test"):
    return client.post("/api/v1/auth/login", json={"email": email, "mot_de_passe": mot_de_passe})


# --- POST /auth/register ---------------------------------------------------------------------


def test_inscription_cree_un_apprenant_sans_exposer_le_hash(client):
    reponse = inscrire(client)
    assert reponse.status_code == 201
    corps = reponse.json()
    assert set(corps) == {"id", "nom", "prenom", "email", "role", "date_creation"}
    assert corps["role"] == "apprenant"
    assert corps["email"] == "afi@example.com"


def test_inscription_ignore_le_role_envoye(client, db):
    reponse = inscrire(client, role="administrateur")
    assert reponse.status_code == 201
    assert reponse.json()["role"] == "apprenant"
    utilisateur = db.scalar(select(Utilisateur).where(Utilisateur.email == "afi@example.com"))
    assert utilisateur.role == "apprenant"
    assert utilisateur.mot_de_passe_hash.startswith("$2b$")


def test_inscription_email_en_minuscules(client):
    reponse = inscrire(client, email="  Afi@Example.COM ")
    assert reponse.json()["email"] == "afi@example.com"


def test_inscription_email_deja_utilise_409(client):
    assert inscrire(client).status_code == 201
    reponse = inscrire(client, email="AFI@example.com")
    assert reponse.status_code == 409
    assert reponse.json() == {"detail": "Un compte existe déjà avec cet email"}


@pytest.mark.parametrize(
    "modifs",
    [
        {"mot_de_passe": "court"},
        {"mot_de_passe": "é" * 37},  # 74 octets : bcrypt le tronquerait
        {"email": "pas-un-email"},
        {"nom": "   "},
        {"prenom": "x" * 101},
    ],
    ids=[
        "mot-de-passe-court",
        "mot-de-passe-trop-long",
        "email-invalide",
        "nom-vide",
        "prenom-long",
    ],
)
def test_inscription_donnees_invalides_422(client, modifs):
    assert inscrire(client, **modifs).status_code == 422


# --- POST /auth/login ------------------------------------------------------------------------


def test_connexion_renvoie_un_jeton_utilisable(client):
    inscrire(client)
    reponse = connecter(client, email="AFI@example.com")
    assert reponse.status_code == 200
    corps = reponse.json()
    assert corps["token_type"] == "bearer"

    moi = client.get(
        "/api/v1/users/me", headers={"Authorization": f"Bearer {corps['access_token']}"}
    )
    assert moi.status_code == 200
    assert moi.json()["email"] == "afi@example.com"


def test_connexion_meme_401_quel_que_soit_le_cas(client, db):
    inscrire(client)
    db.add(Utilisateur(nom="G", prenom="Compte", email="google@example.com", google_id="sub-123"))
    db.flush()

    reponses = [
        connecter(client, mot_de_passe="mauvais-mot-de-passe"),
        connecter(client, email="inconnu@example.com"),
        connecter(client, email="google@example.com"),  # compte Google : pas de mot de passe
    ]
    for reponse in reponses:
        assert reponse.status_code == 401
        assert reponse.json() == {"detail": "Email ou mot de passe incorrect"}


# --- GET /users/me ---------------------------------------------------------------------------


def test_mon_compte_sans_jeton_401(client):
    assert client.get("/api/v1/users/me").status_code == 401


# --- Administrateur au démarrage -------------------------------------------------------------


def parametres_admin(**modifs) -> Parametres:
    valeurs = {
        "admin_email": "Admin@hitt.demo",
        "admin_password": "mot-de-passe-admin-de-test",
        "admin_nom": "Admin",
        "admin_prenom": "HIT-T",
        **modifs,
    }
    return dataclasses.replace(parametres, **valeurs)


def test_admin_cree_au_demarrage_et_peut_se_connecter(client, db):
    assert creer_admin_si_absent(db, parametres_admin()) is True
    admin = db.scalar(select(Utilisateur).where(Utilisateur.email == "admin@hitt.demo"))
    assert admin.role == "administrateur"

    reponse = connecter(client, email="admin@hitt.demo", mot_de_passe="mot-de-passe-admin-de-test")
    assert reponse.status_code == 200


def test_admin_existant_jamais_modifie(db):
    db.add(
        Utilisateur(
            nom="Ancien",
            prenom="Admin",
            email="admin@hitt.demo",
            mot_de_passe_hash=hacher_mot_de_passe("ancien-mot-de-passe"),
            role="administrateur",
        )
    )
    db.flush()
    assert creer_admin_si_absent(db, parametres_admin()) is False
    admins = db.scalars(select(Utilisateur).where(Utilisateur.email == "admin@hitt.demo")).all()
    assert [a.nom for a in admins] == ["Ancien"]


def test_adresse_admin_prise_par_un_apprenant_signalee(client, db, caplog):
    inscrire(client, email="admin@hitt.demo")
    assert creer_admin_si_absent(db, parametres_admin()) is False
    compte = db.scalar(select(Utilisateur).where(Utilisateur.email == "admin@hitt.demo"))
    assert compte.role == "apprenant"
    assert "admin non créé" in caplog.text


def test_sans_admin_email_aucun_compte_cree(db):
    assert creer_admin_si_absent(db, parametres_admin(admin_email="")) is False


@pytest.mark.parametrize("mot_de_passe", ["", "court", "changer-moi", "é" * 37])
def test_mot_de_passe_admin_faible_refuse(monkeypatch, mot_de_passe):
    monkeypatch.setenv("ADMIN_EMAIL", "admin@hitt.demo")
    monkeypatch.setenv("ADMIN_PASSWORD", mot_de_passe)
    with pytest.raises(RuntimeError, match="ADMIN_PASSWORD"):
        Parametres()
