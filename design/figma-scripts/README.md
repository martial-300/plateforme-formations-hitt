# Scripts Figma (Scripter)

Scripts autonomes à coller dans le plugin **Scripter** (Figma navigateur ou desktop), dans le fichier **Plateforme formations HIT-T — Maquettes MVP**. Chaque script peut être relancé : ce qui existe déjà n'est pas recréé.

## Design v2 — institutionnel (à utiliser)

La formule Starter de Figma limite un fichier à 3 pages : la v2 ne crée pas de page, elle est rangée dans des **sections** « v2 · Fondations », « v2 · Écrans desktop » et « v2 · Écrans mobile », sous la v1, sur les pages 1, 2 et 3. Pour repartir de zéro, supprimer ces 3 sections puis relancer 01 → 02 → 03.

| Ordre | Script | Résultat |
|---|---|---|
| 1 | `v2-01-fondations.js` | Section « v2 · Fondations » (page 1), couleurs du logo, typographie IBM Plex Sans, tous les composants (en-tête par rôle, pied de page, lignes de catalogue, recommandations, champs…). |
| 2 | `v2-02-ecrans-desktop.js` | 01 Connexion · 02 Inscription · 03 Catalogue · 04 Détail · 05 Questionnaire · 06 Mes recommandations · 07 Tableau de bord · 08 Modifier une formation. |
| 3 | `v2-03-ecrans-mobile.js` | M1 Catalogue · M2 Questionnaire · M3 Mes recommandations (390 px). |
| 4 | `v2-04-ecrans-complementaires.js` | 2e rangée desktop : 09 Accueil · 10 Détail vu depuis les recommandations · 11 Détail d'un parcours modulaire · 12 Aucune recommandation · 13 Questionnaire avec erreurs · 14 Connexion échouée · 15 Email déjà utilisé · 16 Ajouter une formation · 17 Confirmer la suppression · 18 Page introuvable. Mobile : M4 Détail · M5 Connexion · M6 Menu ouvert. |
| 5 | `v2-05-photos.js` | 15 photos : bandeaux (accueil, catalogue), domaines, détails, connexion, questionnaire, mobile. Téléchargées depuis Pexels (licence gratuite, sans attribution obligatoire) au moment de l'exécution ; si une photo ne se charge pas, un cadre « Photo · … » reste en place pour y glisser une image. À remplacer de préférence par de vraies photos du centre. |
| 6 | `v2-06-textes-transparence.js` | Retouche en place de 3 phrases (06, M3, 09) pour dire que les recommandations sont calculées automatiquement et qu'un conseiller peut aider. Inutile si les écrans viennent de la version actuelle des scripts 02 à 04. |

Principes : une seule couleur d'accent (le vert du logo), orange uniquement sur les prix promo, jaune uniquement sous l'onglet actif ; bandeau vert plein pour la navigation, police unique IBM Plex Sans, angles de 2 px ; cartes sans bordure (le blanc se détache du fond crème), filets fins seulement entre les lignes ; pas d'ombres, de fonds pastel ni de pastilles ; catalogue en liste. Le score de pertinence est remplacé côté apprenant par un libellé (« Très proche / Proche / Peut vous intéresser ») ; le score exact reste en base.

Aperçu attendu (rendu simulé, hors Figma) : [`../apercu-v2/`](../apercu-v2/).

Si IBM Plex Sans manque dans Figma, le script se rabat sur Inter.

## Version 1 (remplacée)

`01-charte-hitt.js`, `02-ecrans-admin.js`, `03-ecrans-mobile.js` complètent la première version (pages « Fondations & composants », « Écrans desktop », « Écrans mobile »). Elle reste dans le fichier pour comparaison.

Mode d'emploi : ouvrir le fichier → **Plugins → Scripter** → nouveau script → coller le contenu d'un fichier → **Run**. Le résultat s'affiche (✅ / ℹ️ / ❌).
