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

*29 octobre 2026* : les 20 profils sont rédigés (`profils_test.json` : projets orientés vers SISG pour 8 d'entre eux, IA-Data pour 6 et TRIT pour 6 ; 10 à la carte, 10 modulaires). Les formations pertinentes ont été **proposées par l'assistant IA** ([grille](grille-annotation-profils.md)) et recopiées dans `profils_test.json` avec `annote_par` ; **elles restent à valider par un conseiller du cabinet**. La mesure qui en découle (0,47) est provisoire. Une annotation validée s'écrit avec `annote_par` commençant par « conseiller du cabinet » ; le script cesse alors de signaler la mesure comme provisoire.

### Journal des essais

| Date | Paramètres | Précision@5 moyenne | Remarques |
|---|---|---|---|
| 29/10/2026 | Moteur de référence : TF-IDF `strip_accents="unicode"`, `lowercase=True`, `ngram_range=(1, 2)`, stop-words français fixes ; filtre type + prix effectif ≤ budget ; score 0 exclu ; un exemplaire par intitulé | **0,47 (provisoire)** | Annotations **proposées par l'assistant IA, non validées par le cabinet** (`annote_par`). Maximum atteignable avec ces annotations : 0,64 (15 profils sur 20 ont moins de 5 formations pertinentes). Profils au maximum : P02, P08, P11, P13, P14, P16, P18, P20. Plus gros écarts : P15 (0,40 / 1,00), P10 (0,40 / 1,00), P05 (0,60 / 1,00), P03 (0,20 / 0,40), P12 (0,20 / 0,40 ; 4 résultats seulement). Calcul : 6 ms au plus par profil. |

## 2. Retours du panel d'apprenants

**Objectif : au moins 5 apprenants testeurs et ≥ 70 % de retours « pertinent ».**

- Les apprenants utilisent l'application déployée (parcours complet).
- Le taux est lu sur le tableau de bord admin (`GET /admin/statistiques`, champ `taux_pertinent`).

## 3. Performance

Mesurer le temps de réponse de `PUT /profil` (navigateur ou `curl -w "%{time_total}"`) : **< 3 s** exigé, < 1 s attendu.
