"""Connexion avec Google (RF-13) : POST /auth/google, vérification Google simulée (sans réseau)."""

import dataclasses

import pytest
from google.auth.exceptions import GoogleAuthError, TransportError
from sqlalchemy import select

from app.config import parametres
from app.models import Utilisateur
from app.services import identite_google
from app.services.identite_google import (
    ConnexionGoogleIndisponible,
    IdentiteGoogle,
    JetonGoogleInvalide,
)
from app.services.security import hacher_mot_de_passe

AFI = IdentiteGoogle(google_id="g-123", email="afi@example.com", prenom="Afi", nom="Kossi")


@pytest.fixture
def google(monkeypatch):
    """Remplace la vérification Google : `google.reponse` = identité renvoyée ou erreur levée."""

    class Simulation:
        reponse: IdentiteGoogle | Exception = AFI
        jetons: list[str] = []

        def verifier(self, jeton):
            self.jetons.append(jeton)
            if isinstance(self.reponse, Exception):
                raise self.reponse
            return self.reponse

    simulation = Simulation()
    monkeypatch.setattr(identite_google, "verifier_jeton", simulation.verifier)
    return simulation


def connecter_google(client, id_token="jeton-google"):
    return client.post("/api/v1/auth/google", json={"id_token": id_token})


def ajouter(db, **champs):
    utilisateur = Utilisateur(
        **{"nom": "Kossi", "prenom": "Afi", "email": "afi@example.com"} | champs
    )
    db.add(utilisateur)
    db.commit()
    return utilisateur


# --- POST /auth/google -----------------------------------------------------------------------


def test_google_cree_un_apprenant_sans_mot_de_passe(client, db, google):
    reponse = connecter_google(client)
    assert reponse.status_code == 200
    corps = reponse.json()
    assert corps["nouveau_compte"] is True
    assert corps["token_type"] == "bearer"
    assert google.jetons == ["jeton-google"]

    utilisateur = db.scalar(select(Utilisateur).where(Utilisateur.google_id == "g-123"))
    assert utilisateur.role == "apprenant"
    assert utilisateur.mot_de_passe_hash is None
    assert (utilisateur.nom, utilisateur.prenom, utilisateur.email) == ("Kossi", "Afi", AFI.email)


def test_google_jeton_utilisable_sur_mon_compte(client, google):
    jeton = connecter_google(client).json()["access_token"]
    reponse = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {jeton}"})
    assert reponse.status_code == 200
    assert set(reponse.json()) == {"id", "nom", "prenom", "email", "role", "date_creation"}


def test_google_second_appel_retrouve_le_meme_compte(client, db, google):
    assert connecter_google(client).json()["nouveau_compte"] is True
    # Email changé chez Google : le compte est retrouvé par google_id, pas par email.
    google.reponse = dataclasses.replace(AFI, email="afi.kossi@example.com")
    assert connecter_google(client).json()["nouveau_compte"] is False
    assert db.query(Utilisateur).count() == 1


def test_google_rattache_un_compte_email_existant(client, db, google):
    compte = ajouter(db, mot_de_passe_hash=hacher_mot_de_passe("mot-de-passe-de-test"))
    reponse = connecter_google(client)
    assert reponse.status_code == 200
    assert reponse.json()["nouveau_compte"] is False
    db.refresh(compte)
    assert compte.google_id == "g-123"
    assert compte.mot_de_passe_hash is not None  # la connexion par mot de passe reste possible


def test_google_adresse_deja_liee_a_un_autre_compte_google_401(client, db, google):
    ajouter(db, google_id="g-autre")
    reponse = connecter_google(client)
    assert reponse.status_code == 401
    assert reponse.json() == {"detail": "Connexion avec Google refusée"}
    assert reponse.headers["www-authenticate"] == "Bearer"


def test_google_administrateur_refuse_403(client, db, google):
    admin = ajouter(db, mot_de_passe_hash=hacher_mot_de_passe("x" * 12), role="administrateur")
    reponse = connecter_google(client)
    assert reponse.status_code == 403
    db.refresh(admin)
    assert admin.google_id is None  # jamais rattaché


def test_google_jeton_invalide_401(client, db, google):
    google.reponse = JetonGoogleInvalide()
    reponse = connecter_google(client)
    assert reponse.status_code == 401
    assert reponse.json() == {"detail": "Connexion avec Google refusée"}
    assert db.query(Utilisateur).count() == 0


def test_google_indisponible_503(client, google):
    google.reponse = ConnexionGoogleIndisponible()
    reponse = connecter_google(client)
    assert reponse.status_code == 503
    assert reponse.json() == {"detail": "Connexion avec Google indisponible pour le moment"}


@pytest.mark.parametrize("corps", [{}, {"id_token": ""}, {"id_token": "x" * 4097}])
def test_google_corps_invalide_422(client, google, corps):
    assert client.post("/api/v1/auth/google", json=corps).status_code == 422
    assert google.jetons == []


def test_compte_google_ne_se_connecte_pas_par_mot_de_passe(client, google):
    connecter_google(client)
    reponse = client.post(
        "/api/v1/auth/login", json={"email": AFI.email, "mot_de_passe": "nimporte-quoi"}
    )
    assert reponse.status_code == 401


# --- services/identite_google.verifier_jeton -------------------------------------------------

INFOS = {
    "sub": "g-123",
    "email": "Afi@Example.com",
    "email_verified": True,
    "given_name": "Afi",
    "family_name": "Kossi",
}


@pytest.fixture
def verification(monkeypatch):
    """Configure GOOGLE_CLIENT_ID et simule `id_token.verify_oauth2_token`."""
    appels = []
    resultat = {"valeur": INFOS}

    def verify(jeton, requete, audience, clock_skew_in_seconds=0):
        appels.append(audience)
        if isinstance(resultat["valeur"], Exception):
            raise resultat["valeur"]
        return resultat["valeur"]

    monkeypatch.setattr(
        identite_google,
        "parametres",
        dataclasses.replace(parametres, google_client_id="client.apps.googleusercontent.com"),
    )
    monkeypatch.setattr(identite_google.id_token, "verify_oauth2_token", verify)
    return appels, resultat


def test_verification_audience_et_email_normalise(verification):
    appels, _ = verification
    identite = identite_google.verifier_jeton("jeton")
    assert appels == ["client.apps.googleusercontent.com"]
    assert identite == IdentiteGoogle("g-123", "afi@example.com", "Afi", "Kossi")


def test_verification_sans_client_id_refusee_sans_appel(monkeypatch):
    # Sans audience, google-auth accepterait le jeton émis pour un autre site.
    monkeypatch.setattr(
        identite_google, "parametres", dataclasses.replace(parametres, google_client_id="")
    )
    with pytest.raises(ConnexionGoogleIndisponible):
        identite_google.verifier_jeton("jeton")


@pytest.mark.parametrize(
    "infos",
    [
        INFOS | {"email_verified": False},
        INFOS | {"email_verified": "true"},
        {k: v for k, v in INFOS.items() if k != "email_verified"},
        INFOS | {"email": ""},
        INFOS | {"sub": ""},
    ],
)
def test_verification_email_non_verifie_ou_identite_incomplete(verification, infos):
    _, resultat = verification
    resultat["valeur"] = infos
    with pytest.raises(JetonGoogleInvalide):
        identite_google.verifier_jeton("jeton")


def test_verification_jeton_rejete_par_google_auth(verification):
    _, resultat = verification
    resultat["valeur"] = ValueError("Token used too late")
    with pytest.raises(JetonGoogleInvalide):
        identite_google.verifier_jeton("jeton")


def test_verification_mauvais_emetteur_refuse_sans_erreur_500(verification):
    _, resultat = verification
    resultat["valeur"] = GoogleAuthError("Wrong issuer")
    with pytest.raises(JetonGoogleInvalide):
        identite_google.verifier_jeton("jeton")


def test_verification_certificats_injoignables(verification):
    _, resultat = verification
    resultat["valeur"] = TransportError("réseau")
    with pytest.raises(ConnexionGoogleIndisponible):
        identite_google.verifier_jeton("jeton")


def test_verification_noms_absents(verification):
    _, resultat = verification
    resultat["valeur"] = {"sub": "g-1", "email": "a@example.com", "email_verified": True}
    identite = identite_google.verifier_jeton("jeton")
    assert (identite.prenom, identite.nom) == ("", "")
