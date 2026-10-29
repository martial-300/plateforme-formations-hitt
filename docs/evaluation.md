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

### Outils

Depuis `backend/`, sans base de données (le catalogue est lu dans `database/02_catalogue_hitt.sql`) :

| Commande | Rôle |
|---|---|
| `python -m tests.evaluation.precision_at_5` | Précision@5 par profil, moyenne sur les profils annotés, temps de calcul |
| `python -m tests.evaluation.precision_at_5 --details` | Idem, avec le top 5 de chaque profil (✓ = formation pertinente) |
| `python -m tests.evaluation.precision_at_5 --grille` | Grille à remettre au conseiller : [grille-annotation-profils.md](grille-annotation-profils.md), profils et catalogue **sans** résultat du moteur |

- Un profil dont `pertinentes` est vide est affiché « non annoté » et exclu de la moyenne.
- Une formation pertinente doit être écrite exactement comme son intitulé dans le catalogue ; sinon le script s'arrête et indique le profil concerné.
- La colonne « Maximum » donne la précision@5 atteignable quand le conseiller a désigné moins de 5 formations.

### État

*29 octobre 2026* : les 20 profils sont rédigés (`profils_test.json` : projets orientés vers SISG pour 8 d'entre eux, IA-Data pour 6 et TRIT pour 6 ; 10 à la carte, 10 modulaires). **Les formations pertinentes restent à désigner par un conseiller du cabinet** : aucune précision@5 n'a encore été mesurée.

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
