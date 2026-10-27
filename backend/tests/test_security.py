"""Services de sécurité (RF-03) : bcrypt, JWT, get_current_user et require_admin."""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated

import jwt
import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.config import parametres
from app.database import get_db
from app.models import Utilisateur
from app.services.security import (
    creer_jeton,
    get_current_user,
    hacher_mot_de_passe,
    require_admin,
    verifier_mot_de_passe,
)

# Application minimale qui n'expose que les deux dépendances testées.
app_test = FastAPI()


@app_test.get("/connecte")
def route_connecte(utilisateur: Annotated[Utilisateur, Depends(get_current_user)]) -> dict:
    return {"email": utilisateur.email}


@app_test.get("/admin")
def route_admin(utilisateur: Annotated[Utilisateur, Depends(require_admin)]) -> dict:
    return {"email": utilisateur.email}


@pytest.fixture
def client(db: Session) -> TestClient:
    app_test.dependency_overrides[get_db] = lambda: db
    yield TestClient(app_test)
    app_test.dependency_overrides.clear()


def creer_utilisateur(db: Session, email: str, role: str = "apprenant") -> Utilisateur:
    utilisateur = Utilisateur(
        nom="Test",
        prenom="Compte",
        email=email,
        mot_de_passe_hash=hacher_mot_de_passe("mot-de-passe-de-test"),
        role=role,
    )
    db.add(utilisateur)
    db.flush()
    return utilisateur


def entete(jeton: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {jeton}"}


# --- Mots de passe ---------------------------------------------------------------------------


def test_hachage_bcrypt_et_verification():
    mot_de_passe_hash = hacher_mot_de_passe("mot-de-passe-de-test")
    assert mot_de_passe_hash != "mot-de-passe-de-test"
    assert mot_de_passe_hash.startswith("$2b$")
    assert verifier_mot_de_passe("mot-de-passe-de-test", mot_de_passe_hash)
    assert not verifier_mot_de_passe("autre", mot_de_passe_hash)


def test_compte_sans_mot_de_passe_jamais_verifie():
    assert not verifier_mot_de_passe("n-importe-quoi", None)


def test_hash_illisible_refuse_sans_erreur():
    assert not verifier_mot_de_passe("mot-de-passe-de-test", "pas-un-hash-bcrypt")


# --- get_current_user ------------------------------------------------------------------------


def test_jeton_valide_renvoie_l_utilisateur(client, db):
    apprenant = creer_utilisateur(db, "apprenant@hitt.demo")
    reponse = client.get("/connecte", headers=entete(creer_jeton(apprenant.id)))
    assert reponse.status_code == 200
    assert reponse.json() == {"email": "apprenant@hitt.demo"}


def test_jeton_absent_401(client):
    reponse = client.get("/connecte")
    assert reponse.status_code == 401
    assert reponse.headers["www-authenticate"] == "Bearer"


@pytest.mark.parametrize(
    "jeton",
    [
        "pas-un-jwt",
        jwt.encode(
            {"sub": str(uuid.uuid4()), "exp": datetime.now(UTC) + timedelta(minutes=5)},
            "autre-secret-de-test-0123456789abcdef",
            algorithm="HS256",
        ),
        jwt.encode({"sub": str(uuid.uuid4())}, parametres.jwt_secret, algorithm="HS256"),
        jwt.encode(
            {"sub": "pas-un-uuid", "exp": datetime.now(UTC) + timedelta(minutes=5)},
            parametres.jwt_secret,
            algorithm="HS256",
        ),
    ],
    ids=["malforme", "signe-avec-un-autre-secret", "sans-expiration", "sub-invalide"],
)
def test_jeton_invalide_401(client, jeton):
    assert client.get("/connecte", headers=entete(jeton)).status_code == 401


def test_jeton_alg_none_401(client, db):
    apprenant = creer_utilisateur(db, "apprenant@hitt.demo")
    jeton = jwt.encode(
        {"sub": str(apprenant.id), "exp": datetime.now(UTC) + timedelta(minutes=5)},
        key=None,
        algorithm="none",
    )
    assert client.get("/connecte", headers=entete(jeton)).status_code == 401


def test_jeton_expire_401(client, db):
    apprenant = creer_utilisateur(db, "apprenant@hitt.demo")
    jeton = jwt.encode(
        {"sub": str(apprenant.id), "exp": datetime.now(UTC) - timedelta(seconds=1)},
        parametres.jwt_secret,
        algorithm="HS256",
    )
    assert client.get("/connecte", headers=entete(jeton)).status_code == 401


def test_compte_supprime_401(client, db):
    apprenant = creer_utilisateur(db, "apprenant@hitt.demo")
    jeton = creer_jeton(apprenant.id)
    db.delete(apprenant)
    db.flush()
    assert client.get("/connecte", headers=entete(jeton)).status_code == 401


# --- require_admin ---------------------------------------------------------------------------


def test_apprenant_sur_route_admin_403(client, db):
    apprenant = creer_utilisateur(db, "apprenant@hitt.demo")
    reponse = client.get("/admin", headers=entete(creer_jeton(apprenant.id)))
    assert reponse.status_code == 403


def test_administrateur_sur_route_admin_200(client, db):
    admin = creer_utilisateur(db, "admin@hitt.demo", role="administrateur")
    reponse = client.get("/admin", headers=entete(creer_jeton(admin.id)))
    assert reponse.status_code == 200


def test_route_admin_sans_jeton_401(client):
    assert client.get("/admin").status_code == 401


def test_role_relu_en_base_a_chaque_requete(client, db):
    admin = creer_utilisateur(db, "admin@hitt.demo", role="administrateur")
    jeton = creer_jeton(admin.id)
    assert client.get("/admin", headers=entete(jeton)).status_code == 200

    admin.role = "apprenant"
    db.flush()
    assert client.get("/admin", headers=entete(jeton)).status_code == 403
