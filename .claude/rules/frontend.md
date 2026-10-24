---
paths:
  - "frontend/**"
---

# Frontend React

- React 18 + TypeScript + Vite, `react-router-dom`. Organisation : `src/api/` (client HTTP + types), `src/pages/`, `src/components/`, `src/auth/` (contexte d'auth, routes protégées).
- Routes : `/connexion`, `/inscription`, `/`, `/formations/:id`, `/questionnaire`, `/recommandations`, `/admin` (voir `frontend/README.md`), plus l'essai sans compte (RF-12).
- API : URL lue dans `VITE_API_URL` ; les types TS reflètent exactement les exemples de `docs/api.md`. Un champ ajouté côté API l'est aussi dans `src/api/`.
- Auth : JWT stocké côté client, supprimé à la déconnexion et sur toute réponse 401. Les routes protégées ne sont qu'un confort d'interface : le contrôle réel est fait par le backend. Pas de `dangerouslySetInnerHTML` avec des données du catalogue ou du profil.
- Connexion Google (RF-13) : Google Identity Services avec `VITE_GOOGLE_CLIENT_ID` ; le bouton « Continuer avec Google » respecte les règles de marque Google ; seul l'`id_token` est envoyé à `POST /auth/google`.
- Aperçu visiteur (RF-12) : les 3 réponses sont gardées en mémoire de session pour pré-remplir le questionnaire après l'inscription.
- Design : la maquette Figma fait référence (fichier `kvetFqrr0ID67PZe0JH6Jx`, sections « v2 · » uniquement ; ids des écrans dans `.claude/rules/design.md`), avec ses rendus dans `design/apercu-v2/` (desktop 01–20, mobile M1–M7, 390 px). Pour coder un écran, lire son `get_design_context` via le connecteur Figma et l'adapter aux composants et tokens du projet plutôt que de recopier le code généré.
  - Police unique IBM Plex Sans ; angles de 2 px ; cartes blanches sans bordure ni ombre sur fond crème `#F6F4EF` ; filets fins (`#DCD7CC`) seulement entre les lignes ; catalogue en liste.
  - Une seule couleur d'accent : le vert du logo `#1A8559` (foncés `#146B47`, `#0F5236`). Orange `#D84416` uniquement sur les prix promo, jaune `#F5D31B` uniquement sous l'onglet actif. Pas de fonds pastel ni de pastilles. Texte `#1D1D1B`, erreur `#B3261E`.
  - Score de pertinence affiché en libellé (« Très proche / Proche / Peut vous intéresser ») avec une jauge en 3 segments, jamais le score brut.
  - Les textes disent que les recommandations sont calculées automatiquement et qu'un conseiller peut aider.
  - Illustrations : SVG de `design/illustrations/`. Logo : `docs/images/logo-hitt.svg`.
- Responsive obligatoire (ordinateur et mobile). Montants en FCFA avec séparateur d'espace (`125 000 FCFA`).
- Style : ESLint + Prettier. Avant de dire qu'un changement est fini : `cd frontend && npm run lint && npm run build`.
