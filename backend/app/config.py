"""Configuration lue dans les variables d'environnement (voir .env.example)."""

import os
from dataclasses import dataclass, field


def _obligatoire(nom: str) -> str:
    valeur = os.environ.get(nom)
    if not valeur:
        raise RuntimeError(f"Variable d'environnement manquante : {nom} (voir .env.example)")
    return valeur


SECRET_EXEMPLE = "generer-avec-openssl-rand-hex-32"
MOT_DE_PASSE_ADMIN_EXEMPLE = "changer-moi"


@dataclass(frozen=True)
class Parametres:
    database_url: str = field(default_factory=lambda: _obligatoire("DATABASE_URL"))
    jwt_secret: str = field(default_factory=lambda: _obligatoire("JWT_SECRET"))
    jwt_expire_minutes: int = field(
        default_factory=lambda: int(os.environ.get("JWT_EXPIRE_MINUTES", "120"))
    )
    cors_origins: list[str] = field(
        default_factory=lambda: [
            o.strip()
            for o in os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
            if o.strip()
        ]
    )
    google_client_id: str = field(default_factory=lambda: os.environ.get("GOOGLE_CLIENT_ID", ""))
    # Compte administrateur créé au démarrage s'il n'existe pas (aucun si ADMIN_EMAIL est vide).
    admin_email: str = field(default_factory=lambda: os.environ.get("ADMIN_EMAIL", ""))
    admin_password: str = field(default_factory=lambda: os.environ.get("ADMIN_PASSWORD", ""))
    admin_nom: str = field(default_factory=lambda: os.environ.get("ADMIN_NOM", "Admin"))
    admin_prenom: str = field(default_factory=lambda: os.environ.get("ADMIN_PRENOM", "HIT-T"))

    def __post_init__(self) -> None:
        # Un secret court ou recopié de .env.example permettrait de forger des JWT.
        if len(self.jwt_secret) < 32 or self.jwt_secret == SECRET_EXEMPLE:
            raise RuntimeError("JWT_SECRET trop faible : générer avec `openssl rand -hex 32`")
        # bcrypt ignore ce qui dépasse 72 octets : même règle qu'à l'inscription.
        if self.admin_email and (
            len(self.admin_password) < 8
            or len(self.admin_password.encode()) > 72
            or self.admin_password == MOT_DE_PASSE_ADMIN_EXEMPLE
        ):
            raise RuntimeError(
                "ADMIN_PASSWORD invalide : 8 caractères à 72 octets, différent de .env.example"
            )


parametres = Parametres()
