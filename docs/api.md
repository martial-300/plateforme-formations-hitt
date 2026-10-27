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
| POST | `/auth/google` | Connexion ou inscription avec Google | Public | RF-13 |
| GET | `/users/me` | Infos du compte connecté | Connecté | RF-02 |
| GET | `/formations` | Lister (filtres `domaine`, `type`) | Public | RF-05 |
| GET | `/formations/{id}` | Détail d'une formation | Public | RF-05 |
| POST | `/formations` | Créer une formation | Admin | RF-03, RF-04 |
| PUT | `/formations/{id}` | Modifier une formation | Admin | RF-03, RF-04 |
| DELETE | `/formations/{id}` | Supprimer une formation | Admin | RF-03, RF-04 |
| PUT | `/profil` | Soumettre / mettre à jour le questionnaire, renvoie les recommandations | Connecté | RF-06 → RF-09 |
| POST | `/recommandations/{id}/retour` | Retour pertinent / non pertinent | Connecté | RF-10 |
| GET | `/admin/statistiques` | Les 3 chiffres clés | Admin | RF-11 |
| POST | `/recommandations/apercu` | Aperçu sans compte (3 formations, rien n'est enregistré) | Public | RF-12 |

La déconnexion (RF-02) est gérée côté frontend : suppression du JWT stocké.

## Codes d'erreur

| Code | Cas |
|---|---|
| 400 | Données invalides (ex. budget négatif) |
| 401 | JWT absent, expiré ou invalide ; identifiants incorrects |
| 403 | Rôle insuffisant (route admin appelée par un apprenant) ; administrateur sur `/auth/google` |
| 404 | Ressource introuvable |
| 409 | Email déjà utilisé |
| 422 | Erreur de validation Pydantic (format FastAPI) |
| 503 | Service externe indisponible (connexion Google non configurée ou Google injoignable) |

Format d'erreur : `{"detail": "message"}`.

## Comptes

### `POST /auth/register`

```json
{ "nom": "Kossi", "prenom": "Afi", "email": "afi@example.com", "mot_de_passe": "••••••••" }
```

`201 Created` → l'utilisateur créé (sans hash), rôle forcé à `apprenant` :

```json
{ "id": "…", "nom": "Kossi", "prenom": "Afi", "email": "afi@example.com", "role": "apprenant", "date_creation": "2026-11-02T10:15:00" }
```

`nom` et `prenom` : 1 à 100 caractères (espaces de début et de fin retirés). Mot de passe de 8 caractères minimum et 72 octets maximum (limite de bcrypt). Sinon `422`. L'email est enregistré en minuscules : `Afi@Example.com` et `afi@example.com` désignent le même compte (`409` si déjà utilisé).

### `POST /auth/login`

```json
{ "email": "afi@example.com", "mot_de_passe": "••••••••" }
```

`200 OK`

```json
{ "access_token": "eyJhbGciOi...", "token_type": "bearer" }
```

`401` avec le même message (« Email ou mot de passe incorrect ») pour un email inconnu, un mauvais mot de passe ou un compte créé avec Google : la réponse ne révèle pas si l'adresse existe.

### `POST /auth/google` (RF-13)

Le frontend affiche le bouton **Google Identity Services** (« Continuer avec Google ») et envoie le jeton d'identité reçu :

```json
{ "id_token": "eyJhbGciOiJSUzI1NiIs..." }
```

Le backend :

1. vérifie le jeton auprès de Google (bibliothèque `google-auth`) : signature, `aud` = `GOOGLE_CLIENT_ID`, expiration, `email_verified` = vrai ;
2. cherche l'utilisateur par `google_id` (champ `sub` du jeton), sinon par email (en minuscules) ; un compte créé par email est alors **rattaché** à Google et garde son mot de passe ;
3. s'il n'existe pas, crée un compte **apprenant** avec `nom` (`family_name`), `prenom` (`given_name`) et `email`, sans mot de passe (`nom` et `prenom` vides si Google ne les fournit pas) ;
4. renvoie un JWT de la plateforme, comme `/auth/login`.

`200 OK` → `{ "access_token": "…", "token_type": "bearer", "nouveau_compte": true }` (`false` pour un compte existant)

| Code | Cas | `detail` |
|---|---|---|
| `401` | Jeton Google invalide ou expiré, email non vérifié, ou adresse déjà rattachée à un autre compte Google | « Connexion avec Google refusée » |
| `403` | Compte administrateur (connexion email + mot de passe uniquement) | « Un administrateur se connecte avec son email et son mot de passe » |
| `409` | Même compte Google créé au même instant par une autre requête (double clic) ; un nouvel essai réussit | « Un compte existe déjà avec cet email » |
| `422` | `id_token` absent, vide ou de plus de 4 096 caractères | — |
| `503` | `GOOGLE_CLIENT_ID` non configuré sur le serveur, ou certificats de Google injoignables | « Connexion avec Google indisponible pour le moment » |

Sans `GOOGLE_CLIENT_ID`, l'API refuse toute connexion Google : `google-auth` ne contrôlerait plus l'audience et accepterait un jeton émis pour un autre site.

### `GET /users/me`

Même format que la réponse de `POST /auth/register` :

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

### `POST /recommandations/apercu` (public, RF-12)

Aperçu pour un visiteur sans compte. Même moteur que `PUT /profil`, mais avec 3 réponses, 3 résultats et **aucune écriture en base**.

```json
{ "centres_interet": "créer des sites internet, programmer", "type_souhaite": "carte", "budget_max_fcfa": 150000 }
```

`200 OK`

```json
{
  "recommandations": [
    { "rang": 1, "score": 0.48, "mots_cles_communs": ["développement web", "site web", "programmation"],
      "formation": { "id": "…", "intitule": "Développement de site web avec PHP, HTML, CSS", "domaine": "TRIT", "type": "carte", "duree_valeur": 3, "duree_unite": "semaine", "cout_fcfa": 125000, "cout_promo_fcfa": 120500 } }
  ]
}
```

- Pas de description ni d'identifiant de recommandation (rien n'est enregistré, donc pas de retour possible).
- Limiter le nombre d'appels par adresse IP (ex. 20 par minute) : la route est publique.
- Le frontend garde les 3 réponses en mémoire de session pour pré-remplir le questionnaire après l'inscription.

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
