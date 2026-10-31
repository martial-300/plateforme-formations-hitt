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
| `python -m tests.evaluation.precision_at_5 --grille` | Grille avec les propositions de l'IA : [grille-annotation-profils.md](grille-annotation-profils.md), profils et catalogue **sans** résultat du moteur |
| `python -m tests.evaluation.precision_at_5 --grille-cabinet` | Grille vierge à cocher pour le conseiller : [grille-annotation-cabinet.md](grille-annotation-cabinet.md), formations possibles de chaque profil (format et budget), sans résultat du moteur ni proposition |

- Un profil dont `pertinentes` est vide est affiché « non annoté » et exclu de la moyenne.
- Une formation pertinente doit être écrite exactement comme son intitulé dans le catalogue ; sinon le script s'arrête et indique le profil concerné.
- La colonne « Maximum » donne la précision@5 atteignable quand le conseiller a désigné moins de 5 formations.

### État

*29 octobre 2026* : les 20 profils sont rédigés (`profils_test.json` : projets orientés vers SISG pour 8 d'entre eux, IA-Data pour 6 et TRIT pour 6 ; 10 à la carte, 10 modulaires). Les formations pertinentes ont été **proposées par l'assistant IA** ([grille](grille-annotation-profils.md)) et recopiées dans `profils_test.json` avec `annote_par` ; **elles restent à valider par un conseiller du cabinet**. La mesure qui en découle (0,47, puis 0,49 après le réglage du 29 octobre) est provisoire. Grille vierge à remettre au cabinet : [grille-annotation-cabinet.md](grille-annotation-cabinet.md), aussi en Word à imprimer ou à remplir (`grille-annotation-cabinet.docx`) ; chaque profil n'y montre que les formations du format demandé et dans le budget, sans résultat du moteur ni proposition de l'IA. Au retour, recopier les formations cochées dans `pertinentes` de `profils_test.json`, avec `annote_par` commençant par « conseiller du cabinet » (nom et date), puis relancer la mesure. Une annotation validée s'écrit avec `annote_par` commençant par « conseiller du cabinet » ; le script cesse alors de signaler la mesure comme provisoire.

### Journal des essais

| Date | Paramètres | Précision@5 moyenne | Remarques |
|---|---|---|---|
| 29/10/2026 | Moteur de référence : TF-IDF `strip_accents="unicode"`, `lowercase=True`, `ngram_range=(1, 2)`, stop-words français fixes ; filtre type + prix effectif ≤ budget ; score 0 exclu ; un exemplaire par intitulé | **0,47 (provisoire)** | Annotations **proposées par l'assistant IA, non validées par le cabinet** (`annote_par`). Maximum atteignable avec ces annotations : 0,64 (15 profils sur 20 ont moins de 5 formations pertinentes). Profils au maximum : P02, P08, P11, P13, P14, P16, P18, P20. Plus gros écarts : P15 (0,40 / 1,00), P10 (0,40 / 1,00), P05 (0,60 / 1,00), P03 (0,20 / 0,40), P12 (0,20 / 0,40 ; 4 résultats seulement). Calcul : 6 ms au plus par profil. |
| 29/10/2026 | Essai 1 : verbes et mots génériques des projets ajoutés aux stop-words (`devenir apprendre savoir utiliser travailler faire creer trouver gerer vite peu`) | 0,48 (provisoire) | « devenir » suffisait à classer « Maintenance informatique » dans le top 5 de projets de secrétariat ou de commerce (P01, P03, P06, P11). |
| 29/10/2026 | Essai 2 : mots seuls, `ngram_range=(1, 1)` (référence : `(1, 2)`) | 0,49 (provisoire) | Les paires de mots (« bases internet ») renforçaient des formations débutantes. |
| 29/10/2026 | Essai 3 : profil sans les compétences actuelles (intérêts et objectif seuls) | 0,46 (provisoire) | Écarté : les compétences aident certains profils (P09, P18). |
| 29/10/2026 | Essai 4 : centres d'intérêt et objectif comptés deux fois | 0,47 (provisoire) | Écarté : sans effet sur la moyenne. |
| 29/10/2026 | Essai 5 : pluriels ramenés au singulier (s ou x final retiré) | 0,46 (provisoire) | Écarté : « sites » retrouve « site », mais d'autres mots sont abîmés. |
| 29/10/2026 | Essai 6 : `sublinear_tf=True` | 0,47 (provisoire) | Écarté : sans effet. |
| 29/10/2026 | Essai 7 : mots-clés des formations comptés deux fois | 0,47 (provisoire) | Écarté : sans effet ; catalogue non modifié (descriptions et mots-clés à valider par le cabinet). |
| 29/10/2026 | Essai 8 : n-grammes de caractères (4 à 6, `char_wb`) avec les verbes génériques | 0,50 (provisoire) | Écarté malgré un point de plus : les scores changent d'échelle (seuils du libellé de correspondance à recalibrer) et le classement devient plus difficile à expliquer. |
| 29/10/2026 | **Retenu** : essais 1 et 2 combinés (verbes génériques en stop-words, mots seuls) | **0,49 (provisoire)** | Gains : P10 (0,40 → 0,60), P17 (0,60 → 0,80) ; aucun profil en baisse. Maximum atteignable avec ces annotations : 0,64, d'où l'objectif de 0,6 hors de portée par le seul réglage du moteur : il faut l'annotation du cabinet ([grille à remplir](grille-annotation-cabinet.md)). Calcul : 7 ms au plus par profil. |
| 31/10/2026 | Essai 9 : compétences actuelles pondérées à 0,5 puis 0,25 (comptes bruts combinés avant normalisation) | 0,49 (provisoire) | Écarté : aucun profil ne change. |
| 31/10/2026 | Essai 10 : intitulé de la formation compté 2 puis 3 fois | 0,48 puis 0,47 (provisoire) | Écarté : P15 (et P17 à ×3) baissent. |
| 31/10/2026 | Essai 11 : texte formation sans la description (intitulé + mots-clés) | 0,49 (provisoire) | Écarté : P03 monte, P15 baisse ; les descriptions restent utiles. |
| 31/10/2026 | Essai 12 : mots trop fréquents ignorés (`max_df` 0,2 puis 0,1) | 0,49 puis 0,44 (provisoire) | Écarté : sans gain à 0,2 ; à 0,1, cinq profils baissent. |
| 31/10/2026 | Essai 13 : synonymes courants côté profil (« intelligence artificielle » → ia, « développeur » → développement, « sites internet » → site web…) | 0,49 (provisoire) | Écarté : P10 monte (0,60 → 0,80), P14 baisse (0,60 → 0,40). |
| 31/10/2026 | **Bilan** : moteur inchangé (essais 1 et 2 retenus le 29/10) | **0,49 (provisoire)** | Plafond du réglage atteint avec ces annotations. Les formations pertinentes manquées le sont par **écart de vocabulaire** : l'apprenant écrit « développeur », « intelligence artificielle », « sites internet », « commercial », le catalogue « développement », « IA », « site web », « commerce ». Correction proposée au cabinet : [mots-clés à valider](mots-cles-a-valider.md) ; catalogue non modifié. |
| 31/10/2026 | Essai 14 : mots-clés de 10 formations ajustés pour reprendre le vocabulaire des apprenants (8 au plus par formation : un mot peu utile remplacé quand la place manque), par délégation du cabinet à l'assistant IA, après relecture du catalogue ([liste](mots-cles-a-valider.md)) ; moteur inchangé | **0,51 (provisoire)** | **Retenu** (catalogue modifié). Hausses : P04 (0,40 → 0,60), P06 (0,40 → 0,60) ; aucune baisse. Une première version à 14 formations donnait 0,52, mais 5 ajouts trompeurs ont été retirés à la relecture (dont « comptabilité » sur Secrétariat / Caisse, qui faisait monter P03). Aperçu visiteur : « Développement de site web avec PHP, HTML, CSS » entre dans le top 3 pour « créer des sites internet, programmer ». Mesure optimiste : les mêmes profils ont servi à repérer les écarts. Objectif de 0,6 non atteint ; plafond avec ces annotations : 0,64. |
| 31/10/2026 | **Analyse du plafond** (aucun réglage) : formations pertinentes encore manquées après l'essai 14 | 0,51 → **0,59 au mieux** | 51 formations pertinentes trouvées sur 100 ; il en faut 60 pour 0,60, soit 9 de plus parmi 13 manques (plafond 0,64). Or 5 manques n'ont **aucun mot en commun** avec le profil : P05 (Multimédia, Production audiovisuel), P07 (Internet et réseaux sociaux), P12 (IA : Historique et opportunités), P19 (Bases de données MySQL / Oracle / SQL Server). Un moteur à base de mots, même parfait, en rattrape donc au plus 8 : **0,59**. Les 8 autres manques ne partagent que des mots génériques (« gestion », « programmation », « données »). **Conclusion** : l'objectif de 0,6 est hors de portée avec ces annotations, sans mots-clés trompeurs (refusés à la relecture) ni retouche des annotations ou des profils (interdite). Seule une annotation par un conseiller du cabinet peut changer ce plafond ; un moteur sémantique sortirait du périmètre MVP (TF-IDF + cosinus). |

## 2. Retours du panel d'apprenants

**Objectif : au moins 5 apprenants testeurs et ≥ 70 % de retours « pertinent ».**

- Les apprenants utilisent l'application déployée (parcours complet).
- Le taux est lu sur le tableau de bord admin (`GET /admin/statistiques`, champ `taux_pertinent`).

## 3. Performance

Mesurer le temps de réponse de `PUT /profil` (navigateur ou `curl -w "%{time_total}"`) : **< 3 s** exigé, < 1 s attendu.
