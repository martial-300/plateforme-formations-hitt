# Contribuer

## Branches

- `main` : toujours démontrable (c'est ce qui est déployé).
- Une branche par tâche : `feat/rf-08-top5`, `fix/login-401`, `docs/uml`.
- Fusion dans `main` par *pull request* (relecture par un autre membre si possible).

## Commits

Format court, en français, préfixé :

```
feat(recommandation): calcul du top 5 TF-IDF (RF-08)
fix(auth): renvoyer 401 si le JWT est expiré
docs: diagramme de séquence
```

Préfixes : `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.

## Règles

- Ne rien ajouter hors périmètre MVP : ouvrir une issue avec le label `V2`.
- Référencer l'exigence (`RF-xx`) dans l'issue et la PR.
- Ne jamais committer `.env`, mots de passe ou clés.
- Toute modification du modèle de données met à jour `database/01_schema.sql` **et** `docs/modele-donnees.md`.
- Toute modification d'endpoint met à jour `docs/api.md`.
- Toute modification des descriptions / mots-clés du catalogue passe par `database/02_catalogue_hitt.sql` (et est signalée au cabinet).

## Style

- Python : PEP 8, formatage `black`, lint `ruff`.
- TypeScript : ESLint + Prettier (configuration Vite par défaut).
