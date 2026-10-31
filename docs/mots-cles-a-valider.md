# Mots-clés du catalogue ajustés au vocabulaire des apprenants

*31 octobre 2026 · proposition issue de l'évaluation du moteur (issue #25, [journal des essais](evaluation.md#journal-des-essais)).*

Le réglage du moteur plafonne à une précision@5 de 0,49 (mesure provisoire). Les formations pertinentes qu'il manque le sont surtout par **écart de vocabulaire** : un apprenant décrit son projet avec ses mots (« développeur web », « intelligence artificielle », « sites internet »), alors que les fiches emploient d'autres termes (« développement », « IA », « site web »). Le moteur compare des mots : il ne peut pas rapprocher deux formulations différentes.

Ajouter quelques mots-clés tels que les apprenants les écrivent corrige une partie de ces écarts **sans changer le moteur**. Les descriptions et mots-clés du catalogue ont été générés par IA et relèvent de la validation du cabinet (`.claude/rules/base-de-donnees.md`).

**Statut (31 octobre 2026)** : appliqué dans `database/02_catalogue_hitt.sql`. Le cabinet a délégué ce choix à l'assistant IA (décision transmise par TheRossDjickso) ; aucun conseiller n'a relu la liste ligne par ligne. Règle respectée : 6 à 8 mots-clés en minuscules par formation, d'où le remplacement d'un mot peu utile quand la formation en avait déjà 8.

| Formation | Mots-clés retirés | Mots-clés ajoutés | Formulation d'apprenant visée |
|---|---|---|---|
| Développement de site web avec PHP, HTML, CSS | mysql | site internet, développeur web | « créer des sites internet », « devenir développeur web » |
| Développement web Laravel (ou autres technologies) | backend | site internet, développeur web | idem |
| Programmation en Java SE ou C++ ou VB ou PHP | — | développeur | « devenir développeur » |
| Algorithme et Programmation avec C/C++, Java | — | développeur | « bases en programmation », « devenir développeur » |
| Bases de données MySQL / Oracle / SQL Server | — | développeur | projets d'applications web ou mobiles |
| Bibliothèque TensorFlow ou PyTorch | — | intelligence artificielle | « intelligence artificielle, apprentissage automatique » |
| Bibliothèque Keras | — | intelligence artificielle | idem |
| Secrétariat-Comptabilité / Aide Comptable | excel | secrétaire | « devenir secrétaire » |
| Marketing et Communication (M & C) | médias | commercial | « devenir commercial », « vente » |
| Ecrits Professionnels (EP : CV et LM) | — | emploi | « trouver un premier emploi » |

Écartés après la relecture du catalogue (agent `relecteur-catalogue`), car trompeurs au regard de l'intitulé et de la description : « comptabilité » sur Secrétariat / Caisse (SC), « réseaux sociaux » sur Multimédia ou Infographie ou Sérigraphie et sur Production audiovisuel, « vente » sur Marketing et Communication, « analyse de données » sur Langage SQL. « développeur » sur Bases de données MySQL / Oracle / SQL Server est conservé mais reste discutable.

## Bases déjà remplies

`02_catalogue_hitt.sql` ne s'exécute qu'au premier démarrage d'une base vide. Pour une base existante (développement, VPS), modifier ces 10 formations par la page Administration ; recréer le volume effacerait aussi les comptes et les profils.

Résultat (journal des essais, essai 14) : précision@5 provisoire de 0,49 à 0,51, aucun profil en baisse.

Les profils de test ont servi à repérer ces écarts : une fois les mots-clés ajoutés, la mesure sur ces mêmes profils sera optimiste. La validation des annotations par un conseiller (et, si possible, de nouveaux profils) reste nécessaire pour une mesure fiable.
