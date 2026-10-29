---
paths:
  - "frontend/**"
---

# Frontend React

- React 18 + TypeScript + Vite, `react-router-dom` 6, versions figées dans `package.json`. Organisation (squelette S1) : `src/api/client.ts` (`appelApi`, `jeton`, `ErreurApi`), `src/api/types.ts` (types de `docs/api.md`), `src/auth/` (`FournisseurAuth`, `useAuth`, `RouteProtegee`), `src/pages/`, `src/components/` (`EnTete`), `src/styles/global.css`.
- Identifiants et noms de composants en français, comme le code existant (`appelApi`, `RouteProtegee`, `EnTete`).
- Routes définies dans `src/App.tsx` : `/` (accueil), `/formations` (catalogue, filtre `?domaine=SISG|IA-Data|TRIT`), `/formations/:id`, `/essai` (RF-12), `/connexion`, `/inscription`, `/questionnaire` et `/recommandations` (`RouteProtegee role="apprenant"`), `/admin` et `/admin/formations/nouvelle` (`role="administrateur"`), `*` (page introuvable). Un écran codé remplace son `PageEnConstruction`.
- API : tous les appels passent par `appelApi` (URL `VITE_API_URL`, en-tête `Authorization`, erreurs `ErreurApi` avec le `detail` de l'API) ; pas de `fetch` direct dans les pages. Les types de `src/api/types.ts` reflètent exactement `docs/api.md`.
- Auth : JWT dans `localStorage` (clé `hitt.jeton`, via l'objet `jeton`), revalidé par `GET /users/me` au chargement, supprimé à la déconnexion et sur toute réponse 401 (déjà géré par `appelApi`). ESLint interdit aussi `innerHTML` et `outerHTML`. Les routes protégées ne sont qu'un confort d'interface : le contrôle réel est fait par le backend. Pas de `dangerouslySetInnerHTML` avec des données du catalogue ou du profil.
- Connexion Google (RF-13) : Google Identity Services avec `VITE_GOOGLE_CLIENT_ID` ; le bouton « Continuer avec Google » respecte les règles de marque Google ; seul l'`id_token` est envoyé à `POST /auth/google`.
- Aperçu visiteur (RF-12) : les 3 réponses sont gardées en mémoire de session pour pré-remplir le questionnaire après l'inscription.
- Design : la maquette Figma fait référence (fichier `kvetFqrr0ID67PZe0JH6Jx`, sections « v2 · » uniquement ; ids des écrans dans `.claude/rules/design.md`), avec ses rendus dans `design/apercu-v2/` (desktop 01–20, mobile M1–M7, 390 px). Pour coder un écran, lire son `get_design_context` via le connecteur Figma et l'adapter aux composants et tokens du projet plutôt que de recopier le code généré.
  - Couleurs, police et rayon via les variables CSS de `src/styles/global.css` (`--vert`, `--promo`, `--fond`, `--rayon`…), jamais de valeur hexadécimale en dur dans un composant. Valeurs de référence :
  - Police unique IBM Plex Sans ; angles de 2 px ; cartes blanches sans bordure ni ombre sur fond crème `#F6F4EF` ; filets fins (`#DCD7CC`) seulement entre les lignes ; catalogue en liste.
  - Une seule couleur d'accent : le vert du logo `#1A8559` (foncés `#146B47`, `#0F5236`). Orange `#D84416` uniquement sur les prix promo, jaune `#F5D31B` uniquement sous l'onglet actif. Pas de fonds pastel ni de pastilles. Texte `#1D1D1B`, erreur `#B3261E`.
  - Score de pertinence affiché en libellé (« Très proche / Proche / Peut vous intéresser ») avec une jauge en 3 segments, jamais le score brut.
  - Les textes disent que les recommandations sont calculées automatiquement et qu'un conseiller peut aider.
  - Illustrations : SVG de `design/illustrations/`. Logo : `docs/images/logo-hitt.svg`.
  - Photos : celles de la maquette (`v2-05-photos.js`, Pexels, provisoires), dans `frontend/public/photos/` en WebP 800 et 1600 px ; toujours via les composants `Photo` et `Bandeau` (`src/components/Photo.tsx`), jamais une URL externe.
- Responsive obligatoire (ordinateur et mobile). Montants en FCFA avec séparateur d'espace (`125 000 FCFA`).
- Style : ESLint + Prettier (`npm run lint` lance les deux, `npm run format` corrige). Avant de dire qu'un changement est fini : `cd frontend && npm run lint && npm run build` (le build vérifie aussi les types).
