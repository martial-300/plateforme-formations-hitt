"""Configuration lue dans les variables d'environnement (voir .env.example)."""

import os
from dataclasses import dataclass, field


def _obligatoire(nom: str) -> str:
    valeur = os.environ.get(nom)
    if not valeur:
        raise RuntimeError(f"Variable d'environnement manquante : {nom} (voir .env.example)")
    return valeur


SECRET_EXEMPLE = "generer-avec-openssl-rand-hex-32"


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

    def __post_init__(self) -> None:
        # Un secret court ou recopié de .env.example permettrait de forger des JWT.
        if len(self.jwt_secret) < 32 or self.jwt_secret == SECRET_EXEMPLE:
            raise RuntimeError("JWT_SECRET trop faible : générer avec `openssl rand -hex 32`")


parametres = Parametres()
