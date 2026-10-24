# Périmètre MVP et règles git

- Référence : `docs/cahier-des-charges-mvp.md` v1.1, exigences **RF-01 à RF-13**. Toute tâche se rattache à une exigence ; la citer dans le commit ou la PR.
- **Rien de V2 avant la soutenance** : refresh token, réinitialisation de mot de passe, rôle conseiller, historique, filtrage collaboratif, graphiques admin, recherche plein texte, CI/CD, sauvegardes automatiques, Alembic, paiement. Si c'est demandé, le signaler et proposer une issue avec le label `V2`.
- Tout est en français : textes d'interface, docs, commits, noms métier (`formation`, `profil`, `recommandation`, `apprenant`).
- Branches : une par tâche, `feat/rf-08-top5`, `fix/login-401`, `docs/uml`. `main` reste toujours démontrable.
- Commits : `type(scope): message` en français, types `feat`, `fix`, `docs`, `test`, `refactor`, `chore`. Exemple : `feat(recommandation): calcul du top 5 TF-IDF (RF-08)`.
- PR : suivre `.github/pull_request_template.md` (RF-xx, testé en local, périmètre, docs, secrets).
- Jamais de `.env`, mot de passe, clé, `JWT_SECRET` ou `GOOGLE_CLIENT_ID` réel dans le dépôt ; les nouvelles variables vont dans `.env.example` avec une valeur d'exemple.
