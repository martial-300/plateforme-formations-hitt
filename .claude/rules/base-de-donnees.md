---
paths:
  - "database/**"
  - "backend/app/models/**"
  - "docs/modele-donnees.md"
---

# Base de données et catalogue

- PostgreSQL 15, 4 tables : `utilisateurs`, `profils_apprenants`, `formations`, `recommandations`. Identifiants `UUID` (`gen_random_uuid()`), mots-clés en `TEXT[]`.
- Trois sources à garder identiques : `database/01_schema.sql`, les modèles SQLAlchemy de `backend/app/models/` et `docs/modele-donnees.md` (diagramme + règles de gestion). Toute modification touche les trois dans le même commit.
- La table `formations` est aussi définie dans `02_catalogue_hitt.sql` : les deux définitions restent identiques.
- Valeurs fermées (`CHECK`) : `role` apprenant/administrateur, `domaine` SISG/IA-Data/TRIT, `type` carte/modulaire, `duree_unite` heure/jour/semaine/mois, `retour` pertinent/non_pertinent/aucun.
- Compte Google (RF-13) : `google_id` unique, `mot_de_passe_hash` nullable, au moins l'un des deux renseigné (`CHECK`), à reproduire dans le modèle ORM.
- Les scripts de `database/` ne s'exécutent qu'au premier démarrage du conteneur (volume vide). Après un changement de schéma en développement : `docker compose down -v && docker compose up -d db` (efface les données locales).
- Catalogue : 86 formations (SISG 14 + 17, IA-Data 21 + 3, TRIT 19 + 12) ; `cout_promo_fcfa` NULL pour les modulaires ; 6 à 8 mots-clés en minuscules par formation. Les descriptions et mots-clés ont été générés par IA et doivent être validés par HIT-T Institute : toute modification passe par `02_catalogue_hitt.sql` et est signalée au cabinet. Ne pas inventer de contenu de formation au-delà de l'intitulé et des fiches.
- Apostrophes doublées en SQL (`l''ordinateur`), fichiers en UTF-8.
- Après un changement : agents `relecteur-catalogue` (catalogue) et `gardien-contrat-api` (schéma ↔ ORM ↔ doc).
