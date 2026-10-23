# API REST

- Base : `/api/v1`
- Format : JSON (UTF-8)
- Authentification : JWT dans l'en-tête `Authorization: Bearer <token>` (pas de refresh token dans le MVP)
- Référence vivante : Swagger généré par FastAPI sur `/docs` (et `/redoc`)

## Récapitulatif

| Méthode | Route | Rôle | Accès | Exigence |
|---|---|---|---|---|
| POST | `/auth/register` | Créer un compte apprenant | Public | RF-01 |
| POST | `/auth/login` | Se connecter, recevoir un JWT | Public | RF-02 |
| GET | `/users/me` | Infos du compte connecté | Connecté | RF-02 |
| GET | `/formations` | Lister (filtres `domaine`, `type`) | Public | RF-05 |
| GET | `/formations/{id}` | Détail d'une formation | Public | RF-05 |
| POST | `/formations` | Créer une formation | Admin | RF-03, RF-04 |
| PUT | `/formations/{id}` | Modifier une formation | Admin | RF-03, RF-04 |
| DELETE | `/formations/{id}` | Supprimer une formation | Admin | RF-03, RF-04 |
| PUT | `/profil` | Soumettre / mettre à jour le questionnaire, renvoie les recommandations | Connecté | RF-06 → RF-09 |
| POST | `/recommandations/{id}/retour` | Retour pertinent / non pertinent | Connecté | RF-10 |
| GET | `/admin/statistiques` | Les 3 chiffres clés | Admin | RF-11 |

La déconnexion (RF-02) est gérée côté frontend : suppression du JWT stocké.

## Codes d'erreur

| Code | Cas |
|---|---|
| 400 | Données invalides (ex. budget négatif) |
| 401 | JWT absent, expiré ou invalide ; identifiants incorrects |
| 403 | Rôle insuffisant (route admin appelée par un apprenant) |
| 404 | Ressource introuvable |
| 409 | Email déjà utilisé |
| 422 | Erreur de validation Pydantic (format FastAPI) |

Format d'erreur : `{"detail": "message"}`.

## Comptes

### `POST /auth/register`

```json
{ "nom": "Kossi", "prenom": "Afi", "email": "afi@example.com", "mot_de_passe": "••••••••" }
```

`201 Created` → l'utilisateur créé (sans hash), rôle forcé à `apprenant`.

### `POST /auth/login`

```json
{ "email": "afi@example.com", "mot_de_passe": "••••••••" }
```

`200 OK`

```json
{ "access_token": "eyJhbGciOi...", "token_type": "bearer" }
```

### `GET /users/me`

```json
{ "id": "…", "nom": "Kossi", "prenom": "Afi", "email": "afi@example.com", "role": "apprenant", "date_creation": "2026-11-02T10:15:00" }
```

## Catalogue

### `GET /formations?domaine=TRIT&type=carte`

Paramètres optionnels : `domaine` (`SISG` | `IA-Data` | `TRIT`), `type` (`carte` | `modulaire`).

```json
[
  {
    "id": "…",
    "intitule": "Développement de site web avec PHP, HTML, CSS",
    "description": "Créer des sites web dynamiques avec HTML, CSS et PHP.",
    "domaine": "TRIT",
    "type": "carte",
    "duree_valeur": 3,
    "duree_unite": "semaine",
    "cout_fcfa": 125000,
    "cout_promo_fcfa": 120500,
    "mots_cles": ["développement web", "site web", "php", "html", "css", "programmation", "mysql"]
  }
]
```

### `POST /formations` / `PUT /formations/{id}` (admin)

Corps : mêmes champs que ci-dessus sans `id`. `POST` → `201`, `PUT` → `200`, `DELETE` → `204`.

## Profil et recommandations

### `PUT /profil`

```json
{
  "niveau_etudes": "BAC II",
  "competences": "word excel bases internet",
  "centres_interet": "programmation sites web informatique",
  "objectif_professionnel": "devenir développeur web",
  "type_souhaite": "carte",
  "budget_max_fcfa": 150000
}
```

`200 OK` — profil enregistré (créé ou écrasé) et 5 recommandations au plus, triées par score décroissant :

```json
{
  "profil": { "…": "…" },
  "recommandations": [
    {
      "id": "…",
      "score": 0.4182,
      "mots_cles_communs": ["développement web", "site web", "programmation"],
      "retour": "aucun",
      "formation": { "id": "…", "intitule": "Développement de site web avec PHP, HTML, CSS", "…": "…" }
    }
  ]
}
```

Moins de 5 résultats peuvent être renvoyés si le filtre type + budget laisse peu de formations.

### `POST /recommandations/{id}/retour`

```json
{ "retour": "pertinent" }
```

Valeurs : `pertinent` | `non_pertinent`. L'apprenant ne peut noter que ses propres recommandations (sinon `404`).

## Administration

### `GET /admin/statistiques`

```json
{
  "nb_apprenants": 27,
  "top_formations": [
    { "formation_id": "…", "intitule": "Office Excel niveau avancé 2010-2024", "nb_recommandations": 14 }
  ],
  "taux_pertinent": 0.74
}
```

`taux_pertinent` = retours « pertinent » / retours donnés (`null` s'il n'y a encore aucun retour).
