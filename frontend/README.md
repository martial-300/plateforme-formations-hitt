# Frontend — React 18 + TypeScript + Vite

> Code à développer à partir de la S3 (voir [docs/planning.md](../docs/planning.md)).

## Initialisation (S1)

```bash
npm create vite@latest frontend -- --template react-ts   # depuis la racine du dépôt
cd frontend && npm install
npm install react-router-dom
```

## Lancement en local

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

L'URL de l'API est lue dans `VITE_API_URL` (voir `.env.example`).

## Pages

| Route | Page | Accès |
|---|---|---|
| `/connexion`, `/inscription` | Connexion / Inscription | Public |
| `/` , `/formations/:id` | Catalogue + détail | Public |
| `/questionnaire` | Questionnaire | Apprenant |
| `/recommandations` | Mes recommandations | Apprenant |
| `/admin` | Administration (catalogue + chiffres clés) | Administrateur |

Interface responsive (ordinateur et mobile). Le JWT est conservé côté client ; la déconnexion le supprime.
