---
paths:
  - "docs/**"
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
- Les mesures du moteur (précision@5, temps) ne sont écrites qu'après avoir été obtenues par une exécution, dans le journal des essais de `docs/evaluation.md`.
