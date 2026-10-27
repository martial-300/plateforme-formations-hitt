#!/usr/bin/env bash
# Arrête HIT-T Reco en local : API (uvicorn), frontend (Vite) et base PostgreSQL.
# Usage : ./arreter.sh  (depuis n'importe quel dossier). Les données de la base sont conservées.
set -uo pipefail

RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$RACINE"

arreter() {
  local nom="$1" motif="$2"
  if pkill -f "$motif"; then
    echo "→ $nom arrêté"
  else
    echo "→ $nom ne tournait pas"
  fi
}

arreter "API" "uvicorn app.main:app"
arreter "Frontend" "$RACINE/frontend/node_modules/.bin/vite"

echo "→ Base PostgreSQL"
docker compose stop db
