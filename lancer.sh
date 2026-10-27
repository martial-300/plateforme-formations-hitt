#!/usr/bin/env bash
# Lance HIT-T Reco en local : base PostgreSQL (Docker), API FastAPI et frontend Vite.
# Usage : ./lancer.sh  (depuis n'importe quel dossier). Ctrl+C arrête l'API et le frontend ;
# la base reste démarrée (`./arreter.sh` arrête tout).
set -euo pipefail

RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$RACINE"

erreur() { echo "Erreur : $1" >&2; exit 1; }

# --- Prérequis -----------------------------------------------------------------------------
[ -f .env ] || erreur ".env absent : cp .env.example .env, puis adapter les valeurs."
[ -x backend/.venv/bin/uvicorn ] \
  || erreur "venv backend absent : cd backend && uv venv --python 3.11 .venv && uv pip install --python .venv/bin/python -r requirements-dev.txt"
[ -d frontend/node_modules ] || erreur "dépendances frontend absentes : cd frontend && npm ci"
for port in 8000 5173; do
  if ss -ltn 2>/dev/null | grep -q ":$port "; then
    erreur "le port $port est déjà utilisé (une ancienne instance tourne encore ?)"
  fi
done

# --- Base de données -----------------------------------------------------------------------
echo "→ Base PostgreSQL"
docker compose up -d db >/dev/null
for _ in $(seq 1 30); do
  [ "$(docker compose ps db --format '{{.Health}}')" = "healthy" ] && break
  sleep 1
done
[ "$(docker compose ps db --format '{{.Health}}')" = "healthy" ] || erreur "la base ne répond pas (docker compose logs db)"

# --- API et frontend -----------------------------------------------------------------------
arreter() {
  echo
  echo "→ Arrêt de l'API et du frontend"
  kill "$PID_API" "$PID_FRONT" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap arreter EXIT INT TERM

echo "→ API sur http://localhost:8000 (Swagger : /docs)"
(
  cd backend
  set -a && . ../.env && set +a
  exec .venv/bin/uvicorn app.main:app --reload --port 8000
) &
PID_API=$!

echo "→ Frontend sur http://localhost:5173"
npm --prefix frontend run dev -- --strictPort &
PID_FRONT=$!

echo "Ctrl+C pour arrêter."
wait -n "$PID_API" "$PID_FRONT"
