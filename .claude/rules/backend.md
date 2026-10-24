---
paths:
  - "backend/**"
---

# Backend FastAPI

- Python 3.11, FastAPI, SQLAlchemy 2 (`Mapped[...]`), Pydantic, Scikit-learn, passlib/bcrypt, PyJWT, `google-auth`, psycopg. Organisation : `backend/app/{main,config,database}.py`, `models/`, `schemas/`, `routers/`, `services/` (`security.py`, `recommandation.py`), tests dans `backend/tests/`.
- Toutes les routes sous `/api/v1`, conformes à `docs/api.md` (13 endpoints). Un endpoint ajouté ou modifié met à jour `docs/api.md` dans le même commit.
- Erreurs : `HTTPException` avec `{"detail": "message"}` en français ; codes 400, 401, 403, 404, 409, 422 comme dans `docs/api.md`.
- Sécurité :
  - mots de passe hachés avec bcrypt ; `mot_de_passe_hash` et `google_id` jamais renvoyés (`response_model` explicite sur chaque route) ;
  - JWT HS256 signé avec `JWT_SECRET`, expiration `JWT_EXPIRE_MINUTES`, rôle relu en base à chaque requête ;
  - dépendances `get_current_user` (connecté) et `require_admin` (admin) ; l'inscription force le rôle `apprenant` ;
  - `/auth/google` vérifie le jeton côté serveur (`google.oauth2.id_token.verify_oauth2_token`, audience `GOOGLE_CLIENT_ID`, `email_verified`) et refuse les administrateurs ;
  - un apprenant n'accède qu'à ses propres recommandations (sinon 404) ;
  - `/recommandations/apercu` est public : aucune écriture en base, limite d'appels par IP.
- Accès base uniquement via l'ORM : pas de SQL concaténé ni de `text()` construit avec des f-strings.
- Configuration lue dans les variables d'environnement (`config.py`), jamais de secret par défaut dans le code. CORS limité à `CORS_ORIGINS`.
- Tables créées par `Base.metadata.create_all` au démarrage (pas d'Alembic) : un modèle ORM modifié modifie aussi `database/01_schema.sql` et `docs/modele-donnees.md`.
- Style : PEP 8, `black`, `ruff`. Avant de dire qu'un changement est fini : `cd backend && black --check . && ruff check . && pytest -q`.
- Après un changement backend, utiliser les agents `testeur-fastapi` (tests) et `gardien-contrat-api` (cohérence) ; `relecteur-securite-api` si l'auth ou un router est touché.
