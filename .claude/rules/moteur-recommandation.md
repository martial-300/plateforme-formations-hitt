---
paths:
  - "backend/app/services/recommandation.py"
  - "backend/tests/evaluation/**"
  - "docs/moteur-recommandation.md"
  - "docs/evaluation.md"
---

# Moteur de recommandation

- Algorithme de référence : `docs/moteur-recommandation.md`. TF-IDF + similarité cosinus, sans entraînement.
  - Texte formation = intitulé + description + mots-clés. Texte profil = compétences + centres d'intérêt + objectif professionnel.
  - `TfidfVectorizer` ajusté sur les formations, `strip_accents="unicode"`, `lowercase=True`, stop-words français fixes dans le code.
  - Filtre : type = `type_souhaite` et prix effectif (promo s'il existe, sinon normal) ≤ `budget_max_fcfa`. Score 0 exclu. Un seul exemplaire par intitulé (doublon « Initiation Informatique »).
  - Top 5 avec mots-clés communs, recalculé à chaque `PUT /profil` ; les anciennes recommandations sont remplacées dans la même transaction.
- Aperçu visiteur (RF-12) : même fonction `recommander`, profil réduit à « ce que vous aimeriez apprendre », `k = 3`, aucune persistance.
- Garder `recommander` comme fonction pure (sans session ni requête), testable sans base.
- Côté apprenant, le score s'affiche en libellé (« Très proche / Proche / Peut vous intéresser ») ; le score exact reste en base.
- Performance : < 3 s exigé pour `PUT /profil`, < 1 s attendu. La matrice TF-IDF peut être mise en cache et invalidée à chaque modification du catalogue.
- Évaluation (`docs/evaluation.md`) : objectif précision@5 moyenne ≥ 0,6 sur les 20 profils de `backend/tests/evaluation/profils_test.json`. Ne **jamais** modifier les formations `pertinentes` annotées par le conseiller pour améliorer le score. Un essai = un seul changement, consigné dans le journal des essais.
- Après un changement du moteur ou de ses paramètres : agent `evaluateur-recommandation`.
