---
paths:
  - "docs/**"
  - "docs/uml/**"
  - "README.md"
  - "CONTRIBUTING.md"
  - "backend/README.md"
  - "frontend/README.md"
---

# Documentation

- En français, phrases courtes, tableaux pour les listes structurées, diagrammes en Mermaid (rendus par GitHub).
- `docs/cahier-des-charges-mvp.md` est la référence du périmètre ; son original Word (`Cahier_des_Charges_MVP_HITT_Institute.docx`) doit être tenu à jour en parallèle. Un ajout après la v1.0 est marqué *ajout v1.1* (ou version suivante), avec la date dans l'en-tête, et reste à faire valider par les encadreurs.
- Chaque exigence est citée par son code `RF-xx`. Les nombres qui se répètent (13 exigences, 13 endpoints, 86 formations, 4 tables) doivent rester cohérents entre `README.md`, le cahier des charges, `docs/api.md` et `docs/architecture.md`.
- `docs/api.md` suit le code (et inversement) ; `docs/modele-donnees.md` suit `database/01_schema.sql`.
- Diagrammes UML (`docs/uml.md`) : chacun existe en **trois formats à garder identiques**, modifiés dans le même commit :
  - les images `docs/uml/images/NN-nom.svg` et `.png` (pour le mémoire), **dessinées par les scripts** `docs/uml/outils/statiques.py` (cas d'utilisation, classes, activité, états, déploiement) et `sequences.py` (séquences) : ne jamais retoucher un SVG ou un PNG à la main, modifier le script puis régénérer (`cd docs/uml/outils && python3 sequences.py ../images && python3 statiques.py ../images`, puis `./render.sh "$PWD"/../images/*.svg` pour les PNG, Chromium requis) ;
  - le Mermaid de `docs/uml.md` (sous chaque image, relu sur GitHub) ;
  - la source PlantUML `docs/uml/NN-nom.puml` (style commun dans `_style.iuml`).
- Ce qui oblige à mettre un diagramme à jour : une table ou une colonne (2 · Classes), un endpoint ou un flux (3 · Recommandations, 4 · Google, 5 · Aperçu), une exigence ou un acteur (1 · Cas d'utilisation, 6 · Parcours), les valeurs de `retour` (7 · États), un service Docker ou Nginx (8 · Déploiement). Un nouveau diagramme prend le numéro suivant et s'ajoute au tableau en tête de `docs/uml.md`.
- Les mesures du moteur (précision@5, temps) ne sont écrites qu'après avoir été obtenues par une exécution, dans le journal des essais de `docs/evaluation.md`.
