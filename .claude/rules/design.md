---
paths:
  - "design/**"
---

# Maquettes Figma

- Fichier Figma : « Plateforme formations HIT-T — Maquettes MVP », <https://www.figma.com/design/kvetFqrr0ID67PZe0JH6Jx/Plateforme-formations-HIT-T-%E2%80%94-Maquettes-MVP> (clé `kvetFqrr0ID67PZe0JH6Jx`). Pages : `0:1` Fondations & composants, `2:2` Écrans desktop, `2:3` Écrans mobile. Chaque page contient encore la v1 (remplacée) au-dessus de la section v2 : ne lire que les sections dont le nom commence par « v2 · ».
- Section « v2 · Écrans mobile » : `17:3262`. Écrans : M1 Catalogue `17:3637`, M2 Questionnaire `17:3737`, M3 Mes recommandations `17:3816`, M4 Détail `18:4886`, M5 Connexion `18:4954`, M6 Menu ouvert `18:4992`, M7 Aperçu des résultats `24:5479`. Pour les autres sections, appeler `get_metadata` sur la page.
- Accès par le connecteur Figma (MCP) : `create_session` avec la clé du fichier, puis `get_metadata` (structure) et `get_design_context` / `get_screenshot` (rendu) sur un id d'écran. Lecture seule sauf demande explicite : les écrans sont générés par les scripts ci-dessous, une retouche faite à la main dans Figma serait écrasée ou divergerait des scripts.
- Formule Starter : 3 pages maximum. La v2 est rangée dans des **sections** (« v2 · Fondations », « v2 · Écrans desktop », « v2 · Écrans mobile »), jamais dans de nouvelles pages.
- Scripts de `design/figma-scripts/` : à coller dans le plugin Scripter, numérotés dans l'ordre d'exécution (`v2-01` → `v2-10`). Chaque script est **relançable** : il ne recrée pas ce qui existe. Un nouveau script garde ce comportement et s'ajoute au tableau de `design/figma-scripts/README.md`.
- Un script qui corrige un fichier déjà généré (comme `v2-06`, `v2-10`) est accompagné de la même correction dans les scripts d'origine, pour qu'un fichier régénéré de zéro soit à jour.
- Les principes visuels du README des scripts s'appliquent (accent vert unique, IBM Plex Sans, pas d'ombres ni de pastilles) ; ils sont repris dans `.claude/rules/frontend.md`.
- `design/apercu-v2/` contient les rendus de référence : les régénérer quand un écran change. `design/illustrations/` contient les SVG utilisés par le frontend.
- `design/figma-plugin/` (v1) est remplacé par la v2 ; ne le faire évoluer que sur demande. Il n'a aucun accès réseau (`networkAccess: none`).
- Un écran lié à une exigence cite son `RF-xx`. Les écrans n'introduisent pas de fonctionnalité hors périmètre MVP.
