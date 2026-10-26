# Déploiement

Cible : **un VPS Linux** avec Docker Compose, Nginx en frontal et certificat **Let's Encrypt**. Pas de CI/CD dans le MVP (déploiement manuel).

## Prérequis

- VPS (Ubuntu 22.04+ recommandé, 2 Go de RAM suffisent)
- Nom de domaine pointant vers l'IP du VPS (enregistrement A)
- Docker + plugin Docker Compose
- Ports 80 et 443 ouverts

## Étapes

```bash
# 1. Récupérer le code
git clone https://github.com/martial-300/plateforme-formations-hitt.git
cd plateforme-formations-hitt

# 2. Configurer
cp .env.example .env
nano .env    # mots de passe forts, JWT_SECRET aléatoire, DOMAINE, ADMIN_*
# Générer un secret : openssl rand -hex 32

# 3. Lancer
docker compose up -d --build
# db (5432) et backend (8000) ne sont publiés que sur 127.0.0.1 : seul nginx expose 80 et 443.

# 4. Certificat HTTPS (première fois)
sudo apt install certbot
sudo certbot certonly --webroot -w ./deploy/certbot -d <votre-domaine>
docker compose restart nginx
```

La configuration Nginx de référence est dans [`deploy/nginx.conf`](../deploy/nginx.conf).

## Chargement du catalogue

Au **premier** démarrage (volume PostgreSQL vide), l'image PostgreSQL exécute automatiquement les scripts de `database/` par ordre alphabétique :

1. `01_schema.sql` — 4 tables
2. `02_catalogue_hitt.sql` — 86 formations

Pour recharger depuis zéro (⚠️ efface toutes les données) :

```bash
docker compose down -v && docker compose up -d
```

## Sauvegarde manuelle

Les sauvegardes automatisées sont en V2. En attendant :

```bash
docker compose exec db pg_dump -U hitt hitt > sauvegarde_$(date +%F).sql
```

## Vérifications avant la soutenance

- [ ] `https://<domaine>` répond, certificat valide
- [ ] `https://<domaine>/api/v1/formations` renvoie 86 formations
- [ ] Connexion admin OK, chiffres clés affichés
- [ ] Parcours apprenant complet sans erreur
- [ ] Temps de réponse des recommandations < 3 s
