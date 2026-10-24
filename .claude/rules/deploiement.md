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
- Services : `db` (postgres:15-alpine, healthcheck), `backend` (port 8000), `frontend` (statique, port 80), `nginx` (production). Les noms doivent correspondre à `deploy/nginx.conf` (`backend:8000`, `frontend:80`).
- `VITE_API_URL` et `VITE_GOOGLE_CLIENT_ID` sont intégrés au build du frontend : les passer en `args` de build, pas en variables d'exécution. Le serveur statique renvoie `index.html` pour les routes React.
- En production : port 5432 non publié, `CORS_ORIGINS` = domaine HTTPS, domaine déclaré dans les origines autorisées du client OAuth Google, `exemple.com` remplacé dans `nginx.conf`.
- Ne jamais lancer sans accord explicite une commande destructrice : `docker compose down -v`, suppression de volume, `certbot` en production, commandes sur le VPS.
- Toute variable lue par le code figure dans `.env.example`, avec une valeur d'exemple et un commentaire.
- Avant une démo (S3, S5, S7) ou la soutenance : agent `verificateur-deploiement`.
