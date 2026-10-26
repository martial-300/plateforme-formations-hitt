---
paths:
  - "backend/**"
---

# Backend FastAPI

- Python 3.11, FastAPI, SQLAlchemy 2 (`Mapped[...]`), Pydantic, Scikit-learn, passlib/bcrypt, PyJWT, `google-auth`, psycopg. Organisation (squelette S1) : `app/main.py` (app, CORS, `create_all` dans `lifespan`, `APIRouter(prefix="/api/v1")` où s'ajoutent les routers), `app/config.py` (dataclass `Parametres`, instance `parametres`), `app/database.py` (`engine`, `Base`, dépendance `get_db`), `models/`, `schemas/`, `routers/`, `services/` (`security.py`, `recommandation.py`), tests dans `backend/tests/`.
- Identifiants en français, comme le code existant (`parametres`, `get_db`, `test_cors_limite_aux_origines_configurees`).
- Dépendances figées à la version exacte dans `requirements.txt` (exécution) et `requirements-dev.txt` (pytest, httpx, black, ruff) ; `bcrypt==4.0.1` est figé exprès pour passlib 1.7.4.
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
- Configuration lue dans les variables d'environnement via `app/config.py` uniquement : `DATABASE_URL` et `JWT_SECRET` sont obligatoires, et `JWT_SECRET` est refusé s'il fait moins de 32 caractères ou vaut la valeur d'exemple. Une nouvelle variable s'ajoute à `Parametres` et à `.env.example`, jamais de secret par défaut dans le code. CORS limité à `CORS_ORIGINS`.
- IP du visiteur (limite d'appels de l'aperçu) : lue par uvicorn `--proxy-headers` depuis `X-Forwarded-For`, seulement pour les proxys de `FORWARDED_ALLOW_IPS` ; ne jamais lire `X-Forwarded-For` à la main ni mettre `*`.
- Tables créées par `Base.metadata.create_all` au démarrage (pas d'Alembic) : un modèle ORM modifié modifie aussi `database/01_schema.sql` et `docs/modele-donnees.md`.
- Style : PEP 8, `black` et `ruff` configurés dans `pyproject.toml` (lignes de 100, règles E, F, I, B, UP). Avant de dire qu'un changement est fini : `cd backend && black --check . && ruff check . && pytest -q`.
- Après un changement backend, utiliser les agents `testeur-fastapi` (tests) et `gardien-contrat-api` (cohérence) ; `relecteur-securite-api` si l'auth ou un router est touché.
