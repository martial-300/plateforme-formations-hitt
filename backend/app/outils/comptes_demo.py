"""Comptes apprenants de démonstration, questionnaire déjà rempli (S7, démo et soutenance).

Passe par l'API elle-même (inscription, connexion, PUT /profil) : mêmes contrôles et même
calcul des recommandations qu'un vrai apprenant. Relançable : un compte existant est
reconnecté et son questionnaire remplacé. Le compte administrateur reste celui de ADMIN_*.

Sur le serveur, depuis le conteneur de l'API (qui reçoit .env) :
    docker compose exec backend python -m app.outils.comptes_demo

Le mot de passe commun est lu dans DEMO_MOT_DE_PASSE (8 caractères à 72 octets, différent de
la valeur de .env.example) : il n'est jamais affiché ni écrit.
"""

import json
import os
import sys
import urllib.error
import urllib.request
from collections.abc import Callable
from typing import Any

# Profils fictifs (adresses @hitt.demo) : aucune donnée réelle d'apprenant.
COMPTES_DEMO = [
    {
        "compte": {"nom": "Kossi", "prenom": "Afi", "email": "afi.kossi@hitt.demo"},
        "profil": {
            "niveau_etudes": "BAC II",
            "competences": "Word, Excel, bases d'Internet",
            "centres_interet": "Développement web, sites web, programmation",
            "objectif_professionnel": "Devenir développeuse web",
            "type_souhaite": "carte",
            "budget_max_fcfa": 150000,
        },
    },
    {
        "compte": {"nom": "Mensah", "prenom": "Kodjo", "email": "kodjo.mensah@hitt.demo"},
        "profil": {
            "niveau_etudes": "BAC + 2",
            "competences": "Saisie, classement, accueil téléphonique",
            "centres_interet": "Secrétariat, bureautique, gestion administrative",
            "objectif_professionnel": "Devenir assistant de direction",
            "type_souhaite": "modulaire",
            "budget_max_fcfa": 400000,
        },
    },
]

VALEUR_EXEMPLE = "changer-moi-aussi"  # .env.example

# appel(méthode, chemin, corps, jeton) -> (code HTTP, corps JSON)
Appel = Callable[[str, str, dict | None, str | None], tuple[int, Any]]


class ErreurDemo(Exception):
    pass


def appel_http(base: str) -> Appel:
    def appel(methode: str, chemin: str, corps: dict | None, jeton: str | None):
        entetes = {"Content-Type": "application/json"}
        if jeton:
            entetes["Authorization"] = f"Bearer {jeton}"
        donnees = json.dumps(corps).encode() if corps is not None else None
        requete = urllib.request.Request(
            base + chemin, data=donnees, headers=entetes, method=methode
        )
        try:
            with urllib.request.urlopen(requete, timeout=30) as reponse:
                return reponse.status, json.loads(reponse.read() or b"null")
        except urllib.error.HTTPError as erreur:
            return erreur.code, json.loads(erreur.read() or b"null")

    return appel


def creer_comptes_demo(appel: Appel, mot_de_passe: str) -> list[str]:
    """Crée ou reconnecte chaque compte, puis remplit son questionnaire ; renvoie un résumé."""
    if len(mot_de_passe) < 8 or len(mot_de_passe.encode()) > 72 or mot_de_passe == VALEUR_EXEMPLE:
        raise ErreurDemo("DEMO_MOT_DE_PASSE : 8 caractères à 72 octets, différent de .env.example")

    resume = []
    for demo in COMPTES_DEMO:
        email = demo["compte"]["email"]
        code, _ = appel(
            "POST", "/auth/register", {**demo["compte"], "mot_de_passe": mot_de_passe}, None
        )
        if code not in (201, 409):
            raise ErreurDemo(f"{email} : inscription refusée ({code})")
        etat = "créé" if code == 201 else "déjà présent"

        code, corps = appel(
            "POST", "/auth/login", {"email": email, "mot_de_passe": mot_de_passe}, None
        )
        if code != 200:
            raise ErreurDemo(
                f"{email} : connexion refusée ({code}), "
                "compte existant avec un autre mot de passe ?"
            )
        code, corps = appel("PUT", "/profil", demo["profil"], corps["access_token"])
        if code != 200:
            raise ErreurDemo(f"{email} : questionnaire refusé ({code})")
        resume.append(f"{email} : {etat}, {len(corps['recommandations'])} recommandations")
    return resume


def main() -> int:
    base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/api/v1"
    mot_de_passe = os.environ.get("DEMO_MOT_DE_PASSE", "")
    try:
        for ligne in creer_comptes_demo(appel_http(base.rstrip("/")), mot_de_passe):
            print(ligne)
    except (ErreurDemo, urllib.error.URLError) as erreur:
        print(f"Erreur : {erreur}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
