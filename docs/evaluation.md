# Évaluation du moteur de recommandation

Deux mesures, reprises dans le mémoire.

## 1. Précision@5 hors ligne

**Objectif : précision@5 moyenne ≥ 0,6** (3 formations pertinentes sur 5) sur 20 profils de test.

### Protocole

1. Rédiger **20 profils types** couvrant les 3 domaines et les 2 types (ex. « bachelière qui veut devenir secrétaire, budget 150 000 FCFA, modulaire »).
2. Pour chaque profil, un **conseiller du cabinet** désigne, sans voir les résultats du moteur, les formations du catalogue qu'il jugerait pertinentes.
3. Lancer le moteur sur chaque profil et récupérer le top 5.
4. Calculer pour chaque profil : `précision@5 = |top5 ∩ pertinentes| / 5`, puis la moyenne.
5. Dès la S5, ajuster textes, mots-clés et paramètres TF-IDF si la moyenne est insuffisante ; consigner chaque essai.

### Format des profils annotés

Fichier prévu : `backend/tests/evaluation/profils_test.json`

```json
[
  {
    "id": "P01",
    "profil": {
      "niveau_etudes": "BAC II",
      "competences": "word bases internet",
      "centres_interet": "organisation accueil courrier",
      "objectif_professionnel": "devenir secrétaire de direction",
      "type_souhaite": "modulaire",
      "budget_max_fcfa": 150000
    },
    "pertinentes": ["Secrétariat-Bureautique (SB)", "Assistant de Direction (AD)"]
  }
]
```

Si un conseiller désigne moins de 5 formations pertinentes pour un profil, le noter dans le mémoire (la précision@5 maximale atteignable est alors inférieure à 1).

### Journal des essais

| Date | Paramètres | Précision@5 moyenne | Remarques |
|---|---|---|---|
| | | | |

## 2. Retours du panel d'apprenants

**Objectif : au moins 5 apprenants testeurs et ≥ 70 % de retours « pertinent ».**

- Les apprenants utilisent l'application déployée (parcours complet).
- Le taux est lu sur le tableau de bord admin (`GET /admin/statistiques`, champ `taux_pertinent`).

## 3. Performance

Mesurer le temps de réponse de `PUT /profil` (navigateur ou `curl -w "%{time_total}"`) : **< 3 s** exigé, < 1 s attendu.
