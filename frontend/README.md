# Frontend — React 18 + TypeScript + Vite

> Squelette initialisé en S1 : routes, contexte d'auth, client API, charte (police, couleurs). Chaque écran est codé au sprint indiqué, d'après la maquette Figma v2.

## Lancement en local

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run lint       # ESLint + Prettier
npm run build      # vérification TypeScript + build de production
```

L'URL de l'API est lue dans `VITE_API_URL` et l'identifiant Google dans `VITE_GOOGLE_CLIENT_ID` (voir `.env.example`). En développement, Vite lit `frontend/.env.local` (non committé), par exemple :

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

## Organisation

| Dossier                 | Contenu                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `src/api/`              | Client HTTP (`appelApi`, jeton, gestion du 401) et types de [docs/api.md](../docs/api.md) |
| `src/auth/`             | Contexte d'auth, `useAuth`, `RouteProtegee`                                               |
| `src/pages/`            | Écrans, un composant par page (`PageCatalogue`, `PageIntrouvable`…)                       |
| `src/components/`       | Composants partagés (en-tête…)                                                            |
| `src/styles/global.css` | Tokens de la charte v2                                                                    |

## Pages

| Route                            | Page                                       | Accès          |
| -------------------------------- | ------------------------------------------ | -------------- |
| `/connexion`, `/inscription`     | Connexion / Inscription                    | Public         |
| `/`                              | Accueil (écran 09)                         | Public         |
| `/formations`, `/formations/:id` | Catalogue (filtre `?domaine=`) + détail    | Public         |
| `/essai`                         | Essayer sans compte (aperçu, RF-12)        | Public         |
| `/questionnaire`                 | Questionnaire                              | Apprenant      |
| `/recommandations`               | Mes recommandations                        | Apprenant      |
| `/admin`                         | Administration (catalogue + chiffres clés) | Administrateur |
| `/admin/formations/nouvelle`     | Ajouter une formation (écran 16)           | Administrateur |

Interface responsive (ordinateur et mobile). Le JWT est conservé côté client ; la déconnexion le supprime.
