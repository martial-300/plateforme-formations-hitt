# Plugin Figma « HIT-T Maquettes »

Scripts qui complètent le fichier Figma **Plateforme formations HIT-T — Maquettes MVP** :

| Commande | Ce qu'elle fait |
|---|---|
| 1. Appliquer la charte HIT-T | Couleurs du logo dans les variables (vert `#1A8559`, orange, jaune) et vrai logo vectoriel dans le composant « Logo » : tous les écrans et barres de navigation se mettent à jour. Ajoute aussi un composant « Logo complet ». |
| 2. Créer les écrans d'administration | Composant « Ligne catalogue », écran **07 · Administration** (chiffres clés RF-11 + gestion du catalogue RF-04) et **08 · Modifier une formation** (modale). |
| 3. Créer les écrans mobile | Composant « Carte recommandation mobile » et écrans **M1 · Catalogue**, **M2 · Questionnaire**, **M3 · Mes recommandations** (390 px). |
| Tout exécuter | Les trois, dans l'ordre. |

Chaque commande peut être relancée sans risque : ce qui existe déjà n'est pas recréé.

## Installation (une seule fois) — application Figma desktop

Les plugins de développement ne s'importent que depuis l'application **Figma pour ordinateur** (Windows / macOS), pas depuis le navigateur.

1. Télécharger le dossier `design/figma-plugin/` (ou cloner le dépôt).
2. Ouvrir le fichier de maquettes dans Figma desktop.
3. Menu **Plugins → Développement → Importer un plugin depuis un manifeste…** (*Plugins → Development → Import plugin from manifest…*).
4. Choisir `design/figma-plugin/manifest.json`.

## Exécution

Dans le fichier de maquettes : **Plugins → Développement → HIT-T Maquettes →** puis la commande voulue (« Tout exécuter » pour tout faire).

Un message en bas de l'écran indique « HIT-T : terminé — … » ou l'erreur rencontrée.

## Alternative sans l'application desktop : plugin Scripter

Non testé, mais le code est prévu pour : dans Figma (navigateur), lancer le plugin communautaire **Scripter**, coller tout le contenu de `code.js` et cliquer sur *Run*. Cela exécute « Tout exécuter ».

## Notes

- Le plugin ne fait aucun accès réseau (`networkAccess: none`) : le logo est intégré en SVG dans `code.js`.
- Le logo vectoriel provient de `docs/images/logo-hitt.svg`, obtenu par vectorisation de `docs/images/logo-hitt.png`. Si le cabinet fournit un fichier vectoriel officiel, il faut le préférer.
- Le plugin suppose que le fichier contient les pages, variables (« HIT-T Tokens ») et composants créés lors de la première session ; il s'arrête avec un message clair sinon.
