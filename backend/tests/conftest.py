import os

# Valeurs factices pour les tests : aucune base réelle n'est contactée tant que
# l'application n'est pas démarrée (lifespan non déclenché par TestClient sans `with`).
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://test:test@localhost:5432/test")
os.environ.setdefault("JWT_SECRET", "secret-de-test-uniquement")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")
