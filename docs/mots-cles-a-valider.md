# Mots-clés du catalogue à faire valider par le cabinet

*31 octobre 2026 · proposition issue de l'évaluation du moteur (issue #25, [journal des essais](evaluation.md#journal-des-essais)).*

Le réglage du moteur plafonne à une précision@5 de 0,49 (mesure provisoire). Les formations pertinentes qu'il manque le sont surtout par **écart de vocabulaire** : un apprenant décrit son projet avec ses mots (« développeur web », « intelligence artificielle », « sites internet »), alors que les fiches emploient d'autres termes (« développement », « IA », « site web »). Le moteur compare des mots : il ne peut pas rapprocher deux formulations différentes.

Ajouter quelques mots-clés tels que les apprenants les écrivent corrigerait ces écarts **sans changer le moteur**. Le catalogue n'est pas modifié tant que le cabinet ne l'a pas validé (descriptions et mots-clés générés par IA, `.claude/rules/base-de-donnees.md`).

**Demande au cabinet** : pour chaque ligne, accepter, refuser ou corriger les mots-clés proposés. Les mots-clés restent en minuscules, 8 au plus par formation idéalement.

| Formation | Mots-clés actuels | Mots-clés proposés en plus | Formulation d'apprenant non reconnue aujourd'hui |
|---|---|---|---|
| Développement de site web avec PHP, HTML, CSS | développement web, site web, php, html, css, programmation, mysql | site internet, développeur web | « créer des sites internet », « devenir développeur web » |
| Développement web Laravel (ou autres technologies) | laravel, php, développement web, framework, applications web, programmation, backend | site internet, développeur web | idem |
| Programmation en Java SE ou C++ ou VB ou PHP | programmation, java, c++, visual basic, php, développement, logiciel | développeur | « devenir développeur » |
| Algorithme et Programmation avec C/C++, Java | algorithmique, programmation, c, c++, java, logique, développement | développeur, débutant | « bases en programmation », « devenir développeur » |
| Bases de données MySQL / Oracle / SQL Server | base de données, sql, mysql, oracle, sql server, requêtes, données | développeur, application | projets d'applications web ou mobiles |
| Langage SQL ou PL/SQL ou Transact-SQL | sql, pl/sql, transact-sql, requêtes, base de données, oracle, sql server | analyse de données | « devenir analyste de données » |
| Bibliothèque TensorFlow ou PyTorch | tensorflow, pytorch, deep learning, réseaux de neurones, python, machine learning, ia | intelligence artificielle, apprentissage automatique | « intelligence artificielle, apprentissage automatique » |
| Bibliothèque Keras | keras, deep learning, réseaux de neurones, python, tensorflow, machine learning, ia | intelligence artificielle, apprentissage automatique | idem |
| Secrétariat / Caisse (SC) | secrétariat, caisse, caissier, encaissement, facturation, accueil, commerce, gestion | comptabilité | « aide-comptable », « comptabilité » |
| Secrétariat-Comptabilité / Aide Comptable | comptabilité, aide comptable, secrétariat, saisie comptable, facturation, excel, finance, gestion | secrétaire | « devenir secrétaire » |
| Marketing et Communication (M & C) | marketing, communication, publicité, promotion, stratégie, médias, image de marque, réseaux sociaux | commercial, vente | « devenir commercial », « vente » |
| Multimédia ou Infographie ou Sérigraphie | infographie, graphisme, design, multimédia, sérigraphie, photoshop, affiche, impression | réseaux sociaux, community manager | « devenir community manager » |
| Production audiovisuel (Options : image, Montage, etc.) | audiovisuel, vidéo, montage, tournage, caméra, photographie, image, création de contenu | réseaux sociaux, community manager | idem |
| Ecrits Professionnels (EP : CV et LM) | écrits professionnels, cv, lettre de motivation, rédaction, courrier, candidature, communication écrite | emploi, recherche d'emploi | « trouver un premier emploi » |

## Après la validation

1. Reporter les mots-clés acceptés dans `database/02_catalogue_hitt.sql` (et en base par la page d'administration, ou en recréant le volume de développement).
2. Relancer `python -m tests.evaluation.precision_at_5` depuis `backend/` et consigner la mesure dans le journal des essais.
3. Faire relire le catalogue par l'agent `relecteur-catalogue`.

Les profils de test ont servi à repérer ces écarts : une fois les mots-clés ajoutés, la mesure sur ces mêmes profils sera optimiste. La validation des annotations par un conseiller (et, si possible, de nouveaux profils) reste nécessaire pour une mesure fiable.
