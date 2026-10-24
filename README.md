# HIT-T Reco — Plateforme de recommandation de formations

MVP d'une application web qui recommande automatiquement à un apprenant les formations du catalogue **HIT-T Institute** les plus adaptées à son profil.

> Un apprenant remplit un questionnaire → il reçoit les **5 formations les plus pertinentes**, classées par score, avec les mots-clés qui expliquent chaque choix.

Aujourd'hui l'orientation est faite à la main par les conseillers (lent, subjectif). Le MVP remplace cette étape par un moteur de **filtrage basé sur le contenu** (TF-IDF + similarité cosinus).

![Architecture MVP](docs/images/architecture-mvp.png)

## Sommaire

- [Fonctionnalités du MVP](#fonctionnalités-du-mvp)
- [Stack technique](#stack-technique)
- [Structure du dépôt](#structure-du-dépôt)
- [Démarrage rapide](#démarrage-rapide)
- [Comptes de démo](#comptes-de-démo)
- [Documentation](#documentation)
- [Planning](#planning)
- [Contribuer](#contribuer)

## Fonctionnalités du MVP

| Module | Ce qui est livré |
|---|---|
| Comptes | Inscription apprenant, connexion / déconnexion (JWT), routes admin protégées |
| Catalogue | 86 formations (SISG, IA-Data, TRIT), liste publique filtrable par domaine et type, CRUD admin |
| Questionnaire | Niveau d'études, compétences, centres d'intérêt, objectif pro, type souhaité, budget max (FCFA) ; modifiable |
| Recommandations | Top 5 classé + mots-clés correspondants + retour « pertinent / non pertinent » |
| Aperçu visiteur | Exemple sur l'accueil et essai sans compte : 3 questions → 3 formations (RF-12, ajout v1.1) |
| Tableau de bord admin | Nb d'apprenants, 5 formations les plus recommandées, taux de retours « pertinent » |

Hors MVP (V2) : réinitialisation de mot de passe, refresh token, rôle conseiller, historique, filtrage collaboratif, CI/CD… Voir le [cahier des charges](docs/cahier-des-charges-mvp.md#2-périmètre).

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend + IA | Python 3.11, FastAPI, SQLAlchemy, Scikit-learn |
| Base de données | PostgreSQL 15 |
| Déploiement | Docker Compose, Nginx, Let's Encrypt (VPS) |

## Structure du dépôt

```
plateforme-formations-hitt/
├── backend/          API FastAPI + moteur de recommandation (Python)
├── frontend/         Application React + TypeScript (Vite)
├── database/
│   ├── 01_schema.sql           Schéma des 4 tables
│   └── 02_catalogue_hitt.sql   Catalogue réel : 86 formations
├── deploy/           Configuration Nginx / production
├── docs/             Cahier des charges, architecture, API, UML, moteur IA…
├── docker-compose.yml
└── .env.example
```

## Démarrage rapide

Prérequis : Docker et Docker Compose.

```bash
git clone https://github.com/martial-300/plateforme-formations-hitt.git
cd plateforme-formations-hitt
cp .env.example .env          # puis adapter les mots de passe et JWT_SECRET
docker compose up -d db       # PostgreSQL + chargement automatique du catalogue
```

Vérifier le catalogue :

```bash
docker compose exec db psql -U hitt -d hitt -c "SELECT domaine, type, count(*) FROM formations GROUP BY 1,2 ORDER BY 1,2;"
```

Résultat attendu : 86 formations (SISG 14 + 17, IA-Data 21 + 3, TRIT 19 + 12).

Le lancement du backend et du frontend est décrit dans [backend/README.md](backend/README.md) et [frontend/README.md](frontend/README.md). Une fois l'API démarrée, la documentation Swagger est disponible sur <http://localhost:8000/docs>.

## Comptes de démo

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@hitt.demo` | à définir dans `.env` (`ADMIN_PASSWORD`) |
| Apprenant | `apprenant@hitt.demo` | à créer via la page d'inscription |

## Documentation

| Document | Contenu |
|---|---|
| [Cahier des charges MVP](docs/cahier-des-charges-mvp.md) | Périmètre, exigences, critères de validation (référence) |
| [Architecture](docs/architecture.md) | Couches, pages frontend, organisation du code |
| [Modèle de données](docs/modele-donnees.md) | 4 tables, diagramme entité-relation |
| [API REST](docs/api.md) | 12 endpoints, exemples de requêtes / réponses |
| [Moteur de recommandation](docs/moteur-recommandation.md) | Algorithme TF-IDF + cosinus, pseudo-code |
| [Diagrammes UML](docs/uml.md) | Cas d'utilisation, classes, séquence « obtenir des recommandations » |
| [Évaluation](docs/evaluation.md) | Protocole précision@5, panel d'apprenants |
| [Déploiement](docs/deploiement.md) | VPS, Docker Compose, Nginx, HTTPS |
| [Planning](docs/planning.md) | 10 semaines, backlog par sprint |

## Planning

MVP démontrable fin S7, mémoire en S8, 2 semaines de marge (S9–S10). Démos aux encadreurs en fin de S3, S5 et S7.

![Planning MVP](docs/images/planning-mvp.png)

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md) (branches, commits, revue).

## Note sur les données

Les descriptions et mots-clés du catalogue ont été générés avec l'assistance d'une IA à partir des fiches du cabinet ; ils doivent être **validés par HIT-T Institute** (S2), car le moteur de recommandation en dépend.
