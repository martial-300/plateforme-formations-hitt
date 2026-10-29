---
paths:
  - "docker-compose.yml"
  - "deploy/**"
  - "**/Dockerfile"
  - ".env.example"
  - "docs/deploiement.md"
---

# Déploiement

- Cible : un VPS, Docker Compose, Nginx en frontal, Let's Encrypt. Pas de CI/CD dans le MVP.
- Services : `db` (postgres:15-alpine, healthcheck), `backend` (`backend/Dockerfile`, python:3.11-slim, utilisateur non root, uvicorn `--proxy-headers`), `frontend` (`frontend/Dockerfile` multi-étapes, servi par `frontend/nginx.conf` avec repli SPA), `nginx` et `certbot` (profil `production`, premier certificat par `deploy/premier-certificat.sh`).
- `db` (5432) et `backend` (8000) sont publiés sur `127.0.0.1` uniquement : en production, seul nginx expose 80 et 443. Ne jamais publier un port sur toutes les interfaces.
- `FORWARDED_ALLOW_IPS` est fixé dans `docker-compose.yml` à l'adresse de nginx sur le réseau `production` (`NGINX_IP`) ; jamais `*`. Les noms doivent correspondre à `deploy/nginx.conf` (`backend:8000`, `frontend:80`).
- `VITE_API_URL` et `VITE_GOOGLE_CLIENT_ID` sont intégrés au build du frontend : les passer en `args` de build, pas en variables d'exécution. Le serveur statique renvoie `index.html` pour les routes React.
- En production : `CORS_ORIGINS` = domaine HTTPS, domaine déclaré dans les origines autorisées du client OAuth Google, `DOMAINE` renseigné (remplace `${DOMAINE}` dans `deploy/nginx.conf`).
- Ne jamais lancer sans accord explicite une commande destructrice : `docker compose down -v`, suppression de volume, `certbot` en production, commandes sur le VPS.
- Toute variable lue par le code figure dans `.env.example`, avec une valeur d'exemple et un commentaire.
- Avant une démo (S3, S5, S7) ou la soutenance : agent `verificateur-deploiement`.
