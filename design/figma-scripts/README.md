# Scripts Figma (Scripter)

Scripts autonomes à coller dans le plugin **Scripter** (Figma navigateur ou desktop), dans le fichier **Plateforme formations HIT-T — Maquettes MVP**. Chaque script peut être relancé : ce qui existe déjà n'est pas recréé.

## Design v2 — institutionnel (à utiliser)

| Ordre | Script | Résultat |
|---|---|---|
| 1 | `v2-01-fondations.js` | Pages « v2 · … », couleurs du logo, typographie Source Serif 4 / Source Sans 3, tous les composants (en-tête par rôle, pied de page, lignes de catalogue, recommandations, champs…). |
| 2 | `v2-02-ecrans-desktop.js` | 01 Connexion · 02 Inscription · 03 Catalogue · 04 Détail · 05 Questionnaire · 06 Mes recommandations · 07 Tableau de bord · 08 Modifier une formation. |
| 3 | `v2-03-ecrans-mobile.js` | M1 Catalogue · M2 Questionnaire · M3 Mes recommandations (390 px). |

Principes : une seule couleur d'accent (le vert du logo), orange uniquement sur les prix promo, jaune uniquement sous l'onglet actif ; bandeau vert plein pour la navigation, police unique IBM Plex Sans, angles de 2 px ; cartes sans bordure (le blanc se détache du fond crème), filets fins seulement entre les lignes ; pas d'ombres, de fonds pastel ni de pastilles ; catalogue en liste. Le score de pertinence est remplacé côté apprenant par un libellé (« Très proche / Proche / Peut vous intéresser ») ; le score exact reste en base.

Aperçu attendu (rendu simulé, hors Figma) : [`../apercu-v2/`](../apercu-v2/).

Si IBM Plex Sans manque dans Figma, le script se rabat sur Inter.

## Version 1 (remplacée)

`01-charte-hitt.js`, `02-ecrans-admin.js`, `03-ecrans-mobile.js` complètent la première version (pages « Fondations & composants », « Écrans desktop », « Écrans mobile »). Elle reste dans le fichier pour comparaison.

Mode d'emploi : ouvrir le fichier → **Plugins → Scripter** → nouveau script → coller le contenu d'un fichier → **Run**. Le résultat s'affiche (✅ / ℹ️ / ❌).
