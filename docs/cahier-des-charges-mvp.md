# Cahier des charges MVP — Plateforme de recommandation de formations (HIT-T Institute)

*23 octobre 2026 · Martial*

> Version Markdown du document de référence. Original Word : [Cahier_des_Charges_MVP_HITT_Institute.docx](Cahier_des_Charges_MVP_HITT_Institute.docx).

## 1. Contexte et objectif du MVP

Le MVP doit prouver une seule chose : un apprenant qui remplit un questionnaire reçoit automatiquement une liste de formations du catalogue HIT-T Institute classées par pertinence.

Aujourd'hui, l'orientation des apprenants est faite à la main par les conseillers, ce qui est lent et subjectif. Le MVP remplace cette étape par un moteur de recommandation simple (filtrage basé sur le contenu), intégré à une petite application web.

Ce document remplace, pour la phase de développement, le cahier des charges fonctionnel v2.0 et le cahier des charges technique v1.0. Tout ce qui n'est pas indispensable à la démonstration est reporté en V2.

## 2. Périmètre

Le MVP couvre 4 modules : comptes, catalogue, questionnaire, recommandations. Le reste passe en V2.

| Fonctionnalité | MVP | V2 (après soutenance) |
|---|---|---|
| Inscription / connexion (email + mot de passe) | Oui | Réinitialisation de mot de passe, refresh token |
| Rôles | Visiteur (non connecté) + Apprenant + Administrateur | Rôle Conseiller pédagogique |
| Catalogue de formations | CRUD admin + liste publique avec filtre domaine/type | Recherche plein texte avancée |
| Questionnaire de profilage | Un formulaire fixe | Questionnaire dynamique, historique des versions |
| Recommandations | Top 5 classé + mots-clés correspondants + retour pertinent / non pertinent | Historique, filtrage collaboratif, approche hybride |
| Tableau de bord admin | 3 chiffres clés | Graphiques, rapports exportables |
| Déploiement | Docker Compose sur un VPS avec HTTPS | CI/CD, sauvegardes automatisées |

Restent hors périmètre, MVP comme V2 : application mobile native, paiement en ligne, contenus de cours (e-learning), intégration CRM/ERP.

### 2.1 Catalogue de référence

Le MVP est alimenté par les 3 fiches de formation du cabinet : 86 formations réparties en 3 domaines et 2 types.

| Domaine | Type | Nb | Durée | Coût (FCFA) |
|---|---|---|---|---|
| SISG — Secrétariat et Gestion | À la carte | 14 | 1/2 à 1 semaine | 13 500 à 75 500 |
| SISG — Secrétariat et Gestion | Modulaire | 17 | 2 à 6 mois | 80 000 à 300 000 |
| IA, Data science, Blockchain | À la carte | 21 | 1 jour à 3 mois | 45 000 à 150 000 |
| IA, Data science, Blockchain | Modulaire | 3 | 6 à 9 mois | 250 000 à 450 000 |
| TRIT — Informatique et Télécoms | À la carte | 19 | 1 à 4 semaines | 15 500 à 195 000 |
| TRIT — Informatique et Télécoms | Modulaire | 12 | 6 à 9 mois | 130 000 à 380 000 |

Conséquences pour le MVP :

- Le critère « type » (à la carte / modulaire) remplace le « niveau » : les fiches donnent le même niveau d'admission (BEPC, BAC I, II et plus) pour toutes les formations.
- Les durées sont exprimées en heures, jours, semaines ou mois : on stocke une valeur et une unité.
- Les lignes « Autres formations à la demande du client » ne sont pas importées.
- Les 86 formations sont insérées directement dans la base de données, sans passer par l'interface admin.
- Les fiches ne contiennent ni description ni mots-clés : ils ont été générés avec l'assistance d'une IA (Claude) à partir des fiches et sont livrés dans le script SQL du catalogue ; le cabinet les valide en S2, car le moteur IA en dépend.
- Frais d'inscription et paiement en tranches restent hors périmètre (pas de paiement en ligne).

## 3. Acteurs

Trois rôles utilisent le système dans le MVP. Le visiteur n'a pas de compte : c'est un utilisateur non connecté, il n'est donc pas stocké en base.

| Rôle | Ce qu'il fait dans le MVP |
|---|---|
| Visiteur (non connecté) | Consulte le catalogue et le détail des formations, filtre par domaine et par type, crée un compte pour obtenir des recommandations. |
| Apprenant | Tout ce que fait le visiteur, plus : remplit le questionnaire, consulte ses recommandations, donne un retour. |
| Administrateur | Gère le catalogue, consulte les chiffres clés. |

Le rôle Conseiller pédagogique n'est pas nécessaire au MVP : l'apprenant reçoit ses recommandations sans validation intermédiaire. Les encadreurs académique et professionnel valident le projet mais n'utilisent pas l'application.

## 4. Exigences fonctionnelles MVP

11 exigences (contre 18 dans la v2.0), toutes obligatoires pour la soutenance.

| Code | Exigence | Module |
|---|---|---|
| RF-01 | Un visiteur crée un compte apprenant (nom, prénom, email, mot de passe). | Comptes |
| RF-02 | Un utilisateur se connecte et se déconnecte. | Comptes |
| RF-03 | Les routes admin sont réservées au rôle administrateur. | Comptes |
| RF-04 | L'administrateur ajoute, modifie et supprime une formation (intitulé, description, domaine, type, durée, coût, prix promo, mots-clés). | Catalogue |
| RF-05 | Tout visiteur consulte la liste des formations, filtrable par domaine et par type (à la carte / modulaire), avec durée et coût affichés, et le détail d'une formation. | Catalogue |
| RF-06 | L'apprenant remplit un questionnaire : niveau d'études, compétences, centres d'intérêt, objectif professionnel, type souhaité (formation courte à la carte ou modulaire certifiante), budget maximum en FCFA. | Profilage |
| RF-07 | L'apprenant peut modifier ses réponses et resoumettre le questionnaire. | Profilage |
| RF-08 | Après soumission, le système affiche les 5 formations les plus pertinentes, classées par score. | Recommandation |
| RF-09 | Chaque recommandation affiche les mots-clés qui l'expliquent. | Recommandation |
| RF-10 | L'apprenant marque une recommandation « pertinente » ou « non pertinente ». | Recommandation |
| RF-11 | L'administrateur voit : nombre d'apprenants inscrits, 5 formations les plus recommandées, taux de retours « pertinent ». | Tableau de bord |

## 5. Exigences non fonctionnelles essentielles

| Catégorie | Exigence MVP |
|---|---|
| Sécurité | Mots de passe hachés (bcrypt), authentification JWT, HTTPS en production, requêtes via l'ORM uniquement. |
| Performance | Recommandations affichées en moins de 3 secondes pour le catalogue actuel (86 formations). |
| Ergonomie | Interface utilisable sur ordinateur et sur mobile. |
| Maintenabilité | Code versionné sur GitHub, README d'installation. |
| Données personnelles | Ne collecter que les champs du questionnaire et du compte. |

## 6. Architecture et stack technique

Architecture 3 couches, stack inchangée par rapport au cahier technique : seuls les outils non indispensables sont retirés.

![Architecture MVP · 3 couches](images/architecture-mvp.png)

| Couche | Technologie | Retiré pour le MVP |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | — |
| Backend + IA | Python 3.11, FastAPI, SQLAlchemy, Scikit-learn | Refresh token, Alembic (tables créées au démarrage) |
| Base de données | PostgreSQL 15 | — |
| Déploiement | Docker Compose, Nginx, Let's Encrypt | CI/CD |

Pages frontend : Connexion/Inscription, Catalogue, Questionnaire, Mes recommandations, Administration.

## 7. Modèle de données minimal

4 tables. La table « historique de profilage » est supprimée : resoumettre le questionnaire écrase le profil.

| Table | Colonnes | Relations |
|---|---|---|
| utilisateurs | id, nom, prenom, email (unique), mot_de_passe_hash, role (apprenant / administrateur), date_creation | 1 → 0..1 profil ; 1 → N recommandations |
| profils_apprenants | id, utilisateur_id, niveau_etudes, competences, centres_interet, objectif_professionnel, type_souhaite, budget_max_fcfa, date_maj | 1 → 1 utilisateur |
| formations | id, intitule, description, domaine (SISG / IA-Data / TRIT), type (carte / modulaire), duree_valeur, duree_unite (heure / jour / semaine / mois), cout_fcfa, cout_promo_fcfa, mots_cles | 1 → N recommandations |
| recommandations | id, utilisateur_id, formation_id, score (0 à 1), retour (pertinent / non_pertinent / aucun), date_generation | N → 1 utilisateur, N → 1 formation |

Le texte utilisé par le moteur IA est reconstruit à la volée à partir du profil : plus besoin de stocker une colonne « vecteur de caractéristiques ».

## 8. API REST minimale

11 endpoints (contre 18 dans le cahier technique), base `/api/v1`, JSON, JWT en en-tête `Authorization: Bearer`. La documentation Swagger générée par FastAPI sur `/docs` sert de référence.

| Méthode | Route | Rôle | Accès |
|---|---|---|---|
| POST | /auth/register | Créer un compte apprenant | Public |
| POST | /auth/login | Se connecter, recevoir un JWT | Public |
| GET | /users/me | Infos du compte connecté | Connecté |
| GET | /formations | Lister (filtres domaine, type) | Public |
| GET | /formations/{id} | Détail d'une formation | Public |
| POST | /formations | Créer une formation | Admin |
| PUT | /formations/{id} | Modifier une formation | Admin |
| DELETE | /formations/{id} | Supprimer une formation | Admin |
| PUT | /profil | Soumettre ou mettre à jour le questionnaire, renvoie les recommandations | Connecté |
| POST | /recommandations/{id}/retour | Enregistrer le retour pertinent / non pertinent | Connecté |
| GET | /admin/statistiques | Les 3 chiffres clés | Admin |

Supprimés : /auth/refresh, PATCH /users/me, /recommandations/historique, /admin/utilisateurs, /admin/recommandation/recalculer (le calcul est refait à chaque soumission).

## 9. Moteur de recommandation

Filtrage basé sur le contenu : TF-IDF + similarité cosinus, sans entraînement de modèle.

1. Construire le texte de chaque formation : intitulé + description + mots-clés.
2. Construire le texte du profil : compétences + centres d'intérêt + objectif professionnel.
3. Vectoriser ces textes avec TfidfVectorizer (Scikit-learn).
4. Calculer la similarité cosinus entre le profil et chaque formation.
5. Écarter les formations d'un autre type que celui souhaité ou au-dessus du budget, puis garder les 5 meilleurs scores et, pour chacun, les mots-clés communs au profil et à la formation.
6. Enregistrer ces 5 recommandations en base et les renvoyer au frontend.

Le calcul est refait à chaque soumission du questionnaire. Avec 86 formations, il prend moins d'une seconde.

**Évaluation :** précision@5 sur 20 profils de test annotés à la main (formations jugées pertinentes par un conseiller), plus le taux de retours « pertinent » du panel d'apprenants.

## 10. Planning

Le MVP est démontrable en 7 semaines au lieu de 9 ; les 2 semaines gagnées (S9 et S10) servent de marge avant la soutenance.

![Planning MVP · 10 semaines](images/planning-mvp.png)

Méthode : Scrum allégé, sprints d'une semaine, démo aux encadreurs en fin de S3, S5 et S7.

## 11. Livrables et critères de validation

5 livrables, dont un README qui remplace manuel utilisateur et documentation technique.

| Livrable | Contenu |
|---|---|
| Cahier des charges MVP | Ce document. |
| Diagrammes UML | Cas d'utilisation, classes, séquence « obtenir des recommandations ». |
| Code source | Frontend, backend, moteur IA sur GitHub, avec README (installation, lancement, comptes de démo). |
| Application déployée | URL HTTPS accessible pour la soutenance, catalogue réel du cabinet chargé. |
| Mémoire | Rapport incluant l'évaluation du moteur de recommandation. |

Le MVP est validé quand :

- [ ] Les 11 exigences fonctionnelles fonctionnent sur l'application déployée.
- [ ] Le parcours complet (inscription → questionnaire → 5 recommandations → retour) se fait sans erreur bloquante.
- [ ] Les recommandations s'affichent en moins de 3 secondes.
- [ ] La précision@5 moyenne atteint au moins 0,6 (3 formations pertinentes sur 5) sur les 20 profils de test.
- [ ] Au moins 5 apprenants ont testé la plateforme et au moins 70 % de leurs retours sont « pertinent ».

## 12. Risques principaux

| Risque | Impact | Parade |
|---|---|---|
| Descriptions et mots-clés absents ou mal renseignés | Élevé | Descriptions (1 à 2 phrases) et mots-clés (6 à 8 par formation) générés par IA pour les 86 formations et insérés en base via le script SQL. En S2, le cabinet les relit et les corrige en une séance. |
| Recommandations peu pertinentes | Élevé | Tester sur des profils annotés dès la S5, ajuster les textes et les mots-clés. |
| Retard de développement | Moyen | Ne rien ajouter hors MVP ; utiliser les 2 semaines de marge. |
| Disponibilité des encadreurs | Moyen | Fixer les 3 démos (S3, S5, S7) dès la S1. |
