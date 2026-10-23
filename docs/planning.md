# Planning et backlog

Méthode : **Scrum allégé**, sprints d'une semaine, démo aux encadreurs en fin de **S3, S5 et S7** (dates à fixer dès la S1).

![Planning MVP](images/planning-mvp.png)

| Semaine | Thème | Tâches principales | Fin de sprint |
|---|---|---|---|
| S1 | Cadrage, UML, base de données | Dépôt GitHub, diagrammes UML, schéma SQL, chargement du catalogue, Docker Compose (db), squelettes backend/frontend, fixer les dates de démo | Base avec 86 formations |
| S2 | Comptes + catalogue | Modèles ORM, `/auth/register`, `/auth/login`, `/users/me`, bcrypt + JWT ; `GET /formations` ; **validation des descriptions et mots-clés par le cabinet** | API comptes OK |
| S3 | Comptes + catalogue | CRUD admin formations, pages Connexion/Inscription et Catalogue (filtres, détail), routes protégées | **Démo 1** |
| S4 | Questionnaire + moteur IA | `PUT /profil`, page Questionnaire, moteur TF-IDF + cosinus, rédaction des 20 profils de test | Top 5 renvoyé par l'API |
| S5 | Questionnaire + moteur IA | Page Mes recommandations (mots-clés, retour), `POST /recommandations/{id}/retour`, première mesure précision@5, ajustements | **Démo 2** |
| S6 | Tableau de bord + finitions | `GET /admin/statistiques`, page Administration, responsive mobile, messages d'erreur | Parcours complet |
| S7 | Tests + déploiement | Tests API, VPS, Nginx, HTTPS, comptes de démo, panel d'apprenants | **Démo MVP validée** |
| S8 | Rédaction mémoire | Évaluation (précision@5, retours panel), rédaction | Mémoire |
| S9–S10 | Marge / soutenance | Corrections, répétition | Soutenance |

## Suivi

Chaque tâche est une *issue* GitHub reliée à une exigence (`RF-xx`) et à un jalon (`S1` … `S8`). Suggestion de labels : `comptes`, `catalogue`, `profilage`, `recommandation`, `admin`, `infra`, `doc`, `bug`, `V2`.

Tout ce qui sort du périmètre MVP reçoit le label `V2` et n'est pas traité avant la soutenance.
