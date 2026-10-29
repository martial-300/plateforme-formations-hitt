# Déploiement

Cible : **un VPS Linux** avec Docker Compose, Nginx en frontal et certificat **Let's Encrypt**. Pas de CI/CD dans le MVP (déploiement manuel).

En production, cinq services tournent (profil Compose `production`) :

| Service | Rôle | Exposé |
|---|---|---|
| `db` | PostgreSQL 15, catalogue chargé au premier démarrage | `127.0.0.1:5432` |
| `backend` | API FastAPI (uvicorn `--proxy-headers`) | `127.0.0.1:8000` |
| `frontend` | build React servi par un nginx statique | non |
| `nginx` | HTTPS, redirection HTTP → HTTPS, `/api/` vers le backend, le reste vers le frontend | **80 et 443** |
| `certbot` | renouvellement du certificat (essai toutes les 12 h) | non |

`nginx`, `backend` et `frontend` partagent le réseau `production` au sous-réseau fixe (`172.30.89.0/24` par défaut) : nginx y a l'adresse `172.30.89.10`, la seule dont l'API accepte l'en-tête `X-Forwarded-For` (`FORWARDED_ALLOW_IPS`, fixé dans `docker-compose.yml`). La limite d'appels de l'aperçu (RF-12) s'applique donc à l'adresse réelle du visiteur, même s'il envoie un `X-Forwarded-For` falsifié.

## Prérequis

- VPS (Ubuntu 22.04+ recommandé, 2 Go de RAM suffisent) avec Docker et le plugin Docker Compose
- Nom de domaine pointant vers l'IP du VPS (enregistrement A), **avant** de demander le certificat
- Ports 80 et 443 ouverts

## Étapes

```bash
# 1. Récupérer le code
git clone https://github.com/martial-300/plateforme-formations-hitt.git
cd plateforme-formations-hitt

# 2. Configurer : copier puis remplir .env (voir le tableau ci-dessous)
cp .env.example .env
nano .env
# Générer un secret : openssl rand -hex 32

# 3. Premier démarrage et certificat HTTPS (accepte les conditions de Let's Encrypt)
./deploy/premier-certificat.sh --staging   # facultatif : essai avec un certificat de test
./deploy/premier-certificat.sh

# 4. Comptes apprenants de démonstration (mot de passe : DEMO_MOT_DE_PASSE)
docker compose exec backend python -m app.outils.comptes_demo
```

`premier-certificat.sh` pose un certificat provisoire auto-signé (nginx refuse de démarrer sans certificat), démarre toute la pile, demande le vrai certificat par le défi HTTP de Let's Encrypt, recharge nginx puis lance `certbot` pour les renouvellements. Relancé alors qu'un certificat existe, il se contente de `docker compose --profile production up -d --build`. Après `--staging`, supprimer le certificat de test avant la demande réelle : `docker compose --profile production run --rm --entrypoint sh certbot -c "rm -rf /etc/letsencrypt/live/<domaine> /etc/letsencrypt/archive/<domaine> /etc/letsencrypt/renewal/<domaine>.conf"`.

Mise à jour du code ensuite :

```bash
git pull
docker compose --profile production up -d --build
```

### Valeurs de `.env` en production

| Variable | Valeur |
|---|---|
| `POSTGRES_PASSWORD`, `JWT_SECRET` | secrets aléatoires (`openssl rand -hex 32`) |
| `CORS_ORIGINS` | `https://<domaine>` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | compte administrateur créé au démarrage |
| `VITE_API_URL` | `/api/v1` (même domaine que le site ; intégré au build) |
| `GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_ID` | identifiant OAuth ; ajouter `https://<domaine>` aux **origines JavaScript autorisées** du client dans Google Cloud Console |
| `DOMAINE` | domaine du site (remplace `${DOMAINE}` dans `deploy/nginx.conf`) |
| `CERTBOT_EMAIL` | adresse des avis d'expiration de Let's Encrypt |
| `DEMO_MOT_DE_PASSE` | mot de passe commun des comptes de démo |
| `RESEAU_PRODUCTION`, `NGINX_IP` | seulement si `172.30.89.0/24` est déjà pris sur le serveur |

### Comptes de démonstration

`app/outils/comptes_demo.py` crée deux apprenants fictifs, questionnaire rempli et recommandations calculées, en passant par l'API (mêmes contrôles qu'un vrai apprenant) : `afi.kossi@hitt.demo` (développement web, à la carte) et `kodjo.mensah@hitt.demo` (secrétariat, parcours modulaire). Le script est relançable ; il ne crée pas l'administrateur, qui vient de `ADMIN_*`.

## Répétition en local

Pour tester la pile de production sans VPS, dans une **copie** du dépôt (pour ne pas toucher à la base de développement) :

```bash
git worktree add --detach ../hitt-repetition
cd ../hitt-repetition
cp ../plateforme-formations-hitt/.env.example .env   # puis valeurs de test, DOMAINE=localhost,
# CORS_ORIGINS=https://localhost:8443, VITE_API_URL=/api/v1, HTTP_PORT=8080, HTTPS_PORT=8443,
# RESEAU_PRODUCTION=172.30.90.0/24, NGINX_IP=172.30.90.10
./deploy/premier-certificat.sh --auto-signe            # https://localhost:8443 (avertissement normal)
docker compose --profile production down -v            # à la fin : supprime les volumes de la copie
```

Si la base de développement tourne déjà, ajouter dans la copie un `docker-compose.override.yml` qui retire les ports publiés de `db` et `backend` (`ports: !reset []`).

## Chargement du catalogue

Au **premier** démarrage (volume PostgreSQL vide), l'image PostgreSQL exécute automatiquement les scripts de `database/` par ordre alphabétique :

1. `01_schema.sql` — 4 tables
2. `02_catalogue_hitt.sql` — 86 formations

Pour recharger depuis zéro (⚠️ efface toutes les données, comptes compris) :

```bash
docker compose --profile production down -v && ./deploy/premier-certificat.sh
```

## Sauvegarde manuelle

Les sauvegardes automatisées sont en V2. En attendant :

```bash
docker compose exec db pg_dump -U hitt hitt > sauvegarde_$(date +%F).sql
```

## Vérifications avant la soutenance

- [ ] `https://<domaine>` répond, certificat valide ; `http://<domaine>` redirige vers HTTPS
- [ ] `https://<domaine>/api/v1/formations` renvoie 86 formations
- [ ] Connexion admin OK, chiffres clés affichés
- [ ] Comptes de démo créés, leurs recommandations affichées
- [ ] Connexion avec Google OK (domaine dans les origines autorisées)
- [ ] Parcours apprenant complet sans erreur
- [ ] Temps de réponse des recommandations < 3 s
