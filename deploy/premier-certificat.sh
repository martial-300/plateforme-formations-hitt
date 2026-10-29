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
# Quelques valeurs sont lues pour contrôle ; .env est passé aux conteneurs par Compose.
lire() { sed -n "s/^$1=//p" .env | tail -n 1 | tr -d '\r"'; }
DOMAINE="$(lire DOMAINE)"
CERTBOT_EMAIL="$(lire CERTBOT_EMAIL)"

if [ -z "$DOMAINE" ] || { [ "$DOMAINE" = "exemple.com" ] && [ "$MODE" != "--auto-signe" ]; }; then
  echo "DOMAINE manquant ou encore à exemple.com dans .env." >&2
  exit 1
fi
if [ "$MODE" != "--auto-signe" ] && [ -z "$CERTBOT_EMAIL" ]; then
  echo "CERTBOT_EMAIL manquant dans .env (avis d'expiration de Let's Encrypt)." >&2
  exit 1
fi
# Valeurs de développement recopiées de .env.example : le site serait cassé en production.
if [ "$MODE" != "--auto-signe" ]; then
  case "$(lire VITE_API_URL)" in
    http://localhost* | http://127.*)
      echo "VITE_API_URL pointe sur la machine locale : mettre /api/v1 dans .env." >&2
      exit 1
      ;;
  esac
  case "$(lire CORS_ORIGINS)" in
    *"https://$DOMAINE"*) ;;
    *)
      echo "CORS_ORIGINS doit contenir https://$DOMAINE dans .env." >&2
      exit 1
      ;;
  esac
  if [ "$(lire VITE_GOOGLE_CLIENT_ID)" = "xxxxxxxx.apps.googleusercontent.com" ]; then
    echo "VITE_GOOGLE_CLIENT_ID vaut encore la valeur d'exemple (vide pour désactiver Google)." >&2
    exit 1
  fi
fi

compose() { docker compose --profile production "$@"; }
certbot_sh() { compose run --rm --no-deps --entrypoint sh certbot -c "$1"; }

DOSSIER="/etc/letsencrypt/live/$DOMAINE"

RENOUVELLEMENT="/etc/letsencrypt/renewal/$DOMAINE.conf"
supprimer_certificat() {
  certbot_sh "rm -rf $DOSSIER /etc/letsencrypt/archive/$DOMAINE $RENOUVELLEMENT"
}

if certbot_sh "test -f $RENOUVELLEMENT"; then
  # Un certificat de test (--staging) n'est pas reconnu par les navigateurs : il est remplacé.
  if [ "$MODE" = "reel" ] && certbot_sh "grep -q acme-staging $RENOUVELLEMENT"; then
    echo "Certificat de test trouvé pour $DOMAINE : remplacé par un certificat réel."
    supprimer_certificat
  else
    echo "Un certificat Let's Encrypt existe déjà pour $DOMAINE : rien à faire."
    compose up -d --build
    exit 0
  fi
fi

certificat_provisoire() {
  certbot_sh "mkdir -p $DOSSIER && openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout $DOSSIER/privkey.pem -out $DOSSIER/fullchain.pem -subj /CN=$DOMAINE 2>/dev/null"
}

echo "1/4 Certificat provisoire auto-signé pour $DOMAINE"
certificat_provisoire

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
supprimer_certificat
if ! compose run --rm --no-deps --entrypoint certbot certbot certonly --webroot -w /var/www/certbot \
  -d "$DOMAINE" --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email --non-interactive "${OPTIONS[@]}"; then
  # Sans certificat, nginx ne redémarrerait plus : le provisoire est remis en place.
  certificat_provisoire
  echo "Échec de la demande : vérifier que $DOMAINE pointe vers ce serveur (A, et AAAA s'il" >&2
  echo "existe) et que le port 80 est ouvert, puis relancer le script." >&2
  exit 1
fi

echo "4/4 Rechargement de nginx et démarrage du renouvellement automatique"
compose exec nginx nginx -s reload
compose up -d certbot
echo "HTTPS prêt : https://$DOMAINE"
