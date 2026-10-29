#!/usr/bin/env bash
# Premier démarrage de la production : certificat HTTPS Let's Encrypt pour DOMAINE (docs/deploiement.md).
#
# nginx refuse de démarrer sans certificat, et Let's Encrypt a besoin de nginx pour vérifier le
# domaine. Le script pose donc un certificat provisoire auto-signé, démarre la pile, puis le
# remplace par le vrai certificat (défi HTTP sur /.well-known/acme-challenge/).
#
#   ./deploy/premier-certificat.sh              certificat réel (accepte les conditions de Let's Encrypt)
#   ./deploy/premier-certificat.sh --staging    certificat de test Let's Encrypt (limites plus larges)
#   ./deploy/premier-certificat.sh --auto-signe garde le certificat auto-signé (répétition en local)
#
# Lit DOMAINE et CERTBOT_EMAIL dans .env, à la racine du dépôt. Sans effet si un certificat
# Let's Encrypt existe déjà : le service certbot le renouvelle ensuite tout seul.
set -euo pipefail

RACINE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RACINE"

MODE="${1:-reel}"
case "$MODE" in
  reel | --staging | --auto-signe) ;;
  *)
    echo "Option inconnue : $MODE (--staging ou --auto-signe)" >&2
    exit 1
    ;;
esac

[ -f .env ] || { echo "Fichier .env absent : copier .env.example en .env et le remplir." >&2; exit 1; }
# Seules ces deux valeurs sont lues ; le reste de .env est passé aux conteneurs par Compose.
DOMAINE="$(sed -n 's/^DOMAINE=//p' .env | tail -n 1)"
CERTBOT_EMAIL="$(sed -n 's/^CERTBOT_EMAIL=//p' .env | tail -n 1)"

if [ -z "$DOMAINE" ] || { [ "$DOMAINE" = "exemple.com" ] && [ "$MODE" != "--auto-signe" ]; }; then
  echo "DOMAINE manquant ou encore à exemple.com dans .env." >&2
  exit 1
fi
if [ "$MODE" != "--auto-signe" ] && [ -z "$CERTBOT_EMAIL" ]; then
  echo "CERTBOT_EMAIL manquant dans .env (avis d'expiration de Let's Encrypt)." >&2
  exit 1
fi

compose() { docker compose --profile production "$@"; }
certbot_sh() { compose run --rm --no-deps --entrypoint sh certbot -c "$1"; }

DOSSIER="/etc/letsencrypt/live/$DOMAINE"

if certbot_sh "test -f /etc/letsencrypt/renewal/$DOMAINE.conf"; then
  echo "Un certificat Let's Encrypt existe déjà pour $DOMAINE : rien à faire."
  compose up -d --build
  exit 0
fi

echo "1/4 Certificat provisoire auto-signé pour $DOMAINE"
certbot_sh "mkdir -p $DOSSIER && openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout $DOSSIER/privkey.pem -out $DOSSIER/fullchain.pem -subj /CN=$DOMAINE 2>/dev/null"

echo "2/4 Démarrage de la base, de l'API, du frontend et de nginx"
compose up -d --build db backend frontend nginx

if [ "$MODE" = "--auto-signe" ]; then
  echo "Certificat auto-signé conservé (répétition locale) : le navigateur affichera un avertissement."
  exit 0
fi

echo "3/4 Demande du certificat Let's Encrypt"
OPTIONS=()
[ "$MODE" = "--staging" ] && OPTIONS+=(--staging)
# Le provisoire est retiré juste avant : certbot refuse d'écrire dans un dossier qu'il n'a pas créé.
certbot_sh "rm -rf $DOSSIER /etc/letsencrypt/archive/$DOMAINE /etc/letsencrypt/renewal/$DOMAINE.conf"
compose run --rm --no-deps --entrypoint certbot certbot certonly --webroot -w /var/www/certbot \
  -d "$DOMAINE" --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email --non-interactive "${OPTIONS[@]}"

echo "4/4 Rechargement de nginx et démarrage du renouvellement automatique"
compose exec nginx nginx -s reload
compose up -d certbot
echo "HTTPS prêt : https://$DOMAINE"
