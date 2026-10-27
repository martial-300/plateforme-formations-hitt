"""Vérification du jeton d'identité Google (RF-13), toujours côté serveur."""

from dataclasses import dataclass

from google.auth.exceptions import GoogleAuthError, TransportError
from google.auth.transport import requests as transport_google
from google.oauth2 import id_token

from app.config import parametres


class JetonGoogleInvalide(Exception):
    """Jeton refusé : signature, audience, émetteur, expiration ou email non vérifié."""


class ConnexionGoogleIndisponible(Exception):
    """GOOGLE_CLIENT_ID absent, ou certificats de Google injoignables."""


@dataclass(frozen=True)
class IdentiteGoogle:
    google_id: str
    email: str
    prenom: str
    nom: str


# Réutilise la session HTTP qui télécharge les certificats publics de Google.
_transport = transport_google.Request()


def verifier_jeton(jeton: str) -> IdentiteGoogle:
    """Identité contenue dans un id_token Google dont la signature et l'audience sont valides."""
    # Sans audience, google-auth accepterait le jeton d'un autre site : on refuse plutôt.
    if not parametres.google_client_id:
        raise ConnexionGoogleIndisponible
    try:
        infos = id_token.verify_oauth2_token(
            jeton, _transport, parametres.google_client_id, clock_skew_in_seconds=10
        )
    except TransportError as exc:
        raise ConnexionGoogleIndisponible from exc
    # Un mauvais émetteur (iss) lève GoogleAuthError, qui n'hérite pas de ValueError.
    except (ValueError, GoogleAuthError) as exc:  # signature, audience, émetteur, expiration
        raise JetonGoogleInvalide from exc

    email = (infos.get("email") or "").strip().lower()
    # Seul un email vérifié par Google peut retrouver (et rattacher) un compte existant.
    if not infos.get("sub") or not email or infos.get("email_verified") is not True:
        raise JetonGoogleInvalide
    return IdentiteGoogle(
        google_id=infos["sub"],
        email=email,
        prenom=(infos.get("given_name") or infos.get("name") or "").strip()[:100],
        nom=(infos.get("family_name") or "").strip()[:100],
    )
