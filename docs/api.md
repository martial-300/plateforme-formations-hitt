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
| GET | `/profil` | Relire ses réponses et ses recommandations enregistrées (*ajout v1.2*) | Apprenant | RF-07 |
| PUT | `/profil` | Soumettre / mettre à jour le questionnaire, renvoie les recommandations | Apprenant | RF-06 → RF-09 |
| POST | `/recommandations/{id}/retour` | Retour pertinent / non pertinent | Connecté | RF-10 |
| GET | `/admin/statistiques` | Les 3 chiffres clés | Admin | RF-11 |
| POST | `/recommandations/apercu` | Aperçu sans compte (3 formations, rien n'est enregistré) | Public | RF-12 |

La déconnexion (RF-02) est gérée côté frontend : suppression du JWT stocké.

## Codes d'erreur

| Code | Cas |
|---|---|
| 400 | Données invalides (ex. budget négatif) |
| 401 | JWT absent, expiré ou invalide ; identifiants incorrects |
| 403 | Rôle insuffisant (route admin appelée par un apprenant, `PUT /profil` appelé par un administrateur) ; administrateur sur `/auth/google` |
| 404 | Ressource introuvable |
| 409 | Email déjà utilisé |
| 422 | Erreur de validation Pydantic (format FastAPI) |
| 429 | Trop d'appels à l'aperçu visiteur depuis la même adresse IP (en-tête `Retry-After`) |
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
2. cherche l'utilisateur par `google_id` (champ `sub` du jeton), sinon par email (en minuscules) ; un compte créé par email est alors **rattaché** à Google et **son mot de passe est supprimé** : l'inscription ne vérifie pas l'adresse, et un mot de passe posé par un tiers lui laisserait l'accès au compte ; la connexion se fait ensuite avec Google uniquement ;
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

Public. Paramètres optionnels : `domaine` (`SISG` | `IA-Data` | `TRIT`), `type` (`carte` | `modulaire`) ; une autre valeur → `422`. Formations triées par domaine, type puis intitulé ; liste vide si aucune ne correspond.

```json
[
  {
    "id": "…",
    "intitule": "Développement de site web avec PHP, HTML, CSS",
    "description": "Créer des sites web dynamiques avec HTML, CSS et PHP.",
    "domaine": "TRIT",
    "type": "carte",
    "duree_valeur": 3.0,
    "duree_unite": "semaine",
    "cout_fcfa": 125000,
    "cout_promo_fcfa": 120500,
    "mots_cles": ["développement web", "site web", "php", "html", "css", "programmation", "mysql"]
  }
]
```

`duree_valeur` est un nombre (`0.5` pour une demi-semaine) ; `cout_promo_fcfa` vaut `null` pour les formations modulaires.

### `GET /formations/{id}`

Public. `200 OK` → une formation, au même format qu'un élément de la liste. `404` « Formation introuvable » si l'id n'existe pas, `422` s'il n'est pas un UUID.

### `POST /formations` / `PUT /formations/{id}` / `DELETE /formations/{id}` (admin, RF-04)

Réservés à l'administrateur : sans jeton `401`, jeton d'apprenant `403`. Le contrôle d'accès passe avant la validation du corps.

Corps de `POST` et `PUT` : mêmes champs que ci-dessus sans `id`. `POST` → `201` avec la formation créée ; `PUT` → `200` avec la formation modifiée ; `DELETE` → `204` sans corps. `404` « Formation introuvable » si l'id n'existe pas (`PUT`, `DELETE`).

`PUT` remplace **tous** les champs : un `cout_promo_fcfa` absent du corps est effacé.

Règles de validation (sinon `422`) :

| Champ | Règle |
|---|---|
| `intitule` | 1 à 200 caractères (espaces de début et de fin retirés) |
| `description` | non vide |
| `domaine`, `type`, `duree_unite` | valeurs fermées ci-dessus |
| `duree_valeur` | de 0,1 à 999,9, une décimale au plus |
| `cout_fcfa` | entier strictement positif |
| `cout_promo_fcfa` | facultatif ; interdit (`null`) pour une formation modulaire ; sinon entier positif inférieur à `cout_fcfa` |
| `mots_cles` | 1 à 20 mots de 100 caractères au plus, enregistrés en minuscules et sans doublon |

`DELETE` supprime aussi les recommandations de cette formation (`ON DELETE CASCADE` en base).

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
  "profil": {
    "niveau_etudes": "BAC II", "competences": "word excel bases internet", "…": "…",
    "type_souhaite": "carte", "budget_max_fcfa": 150000, "date_maj": "2026-11-02T10:20:00"
  },
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

Moins de 5 résultats peuvent être renvoyés si le filtre type + budget laisse peu de formations (`[]` si aucune ne correspond ; le profil est enregistré quand même).

- Tous les champs sont obligatoires à chaque soumission. Textes : espaces de début et de fin retirés, 1 à 1 000 caractères (`niveau_etudes` : 50). `type_souhaite` : `carte` | `modulaire`. `budget_max_fcfa` : entier de 0 à 2 147 483 647. Sinon `422`, et rien n'est enregistré. Sans jeton ou jeton invalide : `401`. Compte administrateur : `403` « Accès réservé aux apprenants » (ses recommandations fausseraient les statistiques de RF-11).
- Un seul profil par compte : une nouvelle soumission l'écrase, et les anciennes recommandations sont remplacées dans la même transaction (RF-07).
- `score` est arrondi à 4 décimales (`NUMERIC(5,4)` en base) ; `formation` a le format de `GET /formations/{id}`.

### `GET /profil` (*ajout v1.2*)

Relit le profil et les recommandations enregistrés par le dernier `PUT /profil`, **sans nouveau calcul** : même format de réponse que `PUT /profil`, recommandations triées par score décroissant, avec leur `retour`.

- Sert à pré-remplir le questionnaire (RF-07) et à réafficher « Mes recommandations » après une reconnexion.
- `404` « Aucun profil : répondez au questionnaire » si l'apprenant n'a encore rien soumis. Même accès que `PUT /profil` : `401` sans jeton, `403` pour un administrateur.

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
      "formation": { "id": "…", "intitule": "Développement de site web avec PHP, HTML, CSS", "domaine": "TRIT", "type": "carte", "duree_valeur": 3.0, "duree_unite": "semaine", "cout_fcfa": 125000, "cout_promo_fcfa": 120500 } }
  ]
}
```

- Pas de description ni d'identifiant de recommandation (rien n'est enregistré, donc pas de retour possible).
- `centres_interet` : 1 à 1 000 caractères (espaces de début et de fin retirés) ; `type_souhaite` : `carte` ou `modulaire` ; `budget_max_fcfa` : entier ≥ 0. Sinon `422`.
- Même filtre que `PUT /profil` (format, prix promo s'il existe ≤ budget) : 0 à 3 résultats, `rang` de 1 à 3 par score décroissant ; `{"recommandations": []}` si aucune formation ne correspond.
- Route publique, sans JWT : au plus **20 appels par minute et par adresse IP**, requêtes invalides comprises. Au-delà, `429` « Trop de demandes : réessayez dans une minute » avec l'en-tête `Retry-After` (secondes). L'IP est celle lue par uvicorn `--proxy-headers` derrière les proxys de `FORWARDED_ALLOW_IPS` ; les compteurs sont en mémoire et repartent de zéro au redémarrage de l'API.
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
