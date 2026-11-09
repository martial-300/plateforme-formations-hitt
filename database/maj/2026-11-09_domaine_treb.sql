-- Mise à jour d'une base existante : domaine TREB (cahier des charges v1.3, 9 novembre 2026).
--
-- database/01_schema.sql et 02_catalogue_hitt.sql ne s'exécutent qu'à la création du volume
-- PostgreSQL, et create_all ne modifie pas une table qui existe déjà. Sur une base créée avant
-- l'ajout de TREB, ce script élargit la contrainte du domaine et ajoute les 10 formations TREB
-- qui manquent, sans toucher aux autres formations ni aux comptes. Relançable sans effet.
--
-- Hors de database/ racine : il ne s'exécute jamais tout seul. À lancer en une transaction :
--   docker compose exec -T db psql -U hitt -d hitt -v ON_ERROR_STOP=1 --single-transaction \
--     < database/maj/2026-11-09_domaine_treb.sql
-- (remplacer -U hitt -d hitt si POSTGRES_USER ou POSTGRES_DB ont été changés).
-- Valeurs identiques aux lignes TREB de 02_catalogue_hitt.sql : modifier les deux ensemble.

ALTER TABLE formations DROP CONSTRAINT IF EXISTS formations_domaine_check;
ALTER TABLE formations ADD CONSTRAINT formations_domaine_check
    CHECK (domaine IN ('SISG', 'IA-Data', 'TRIT', 'TREB'));

INSERT INTO formations (intitule, description, domaine, type, duree_valeur, duree_unite, cout_fcfa, cout_promo_fcfa, mots_cles)
SELECT v.intitule, v.description, v.domaine, v.type, v.duree_valeur, v.duree_unite, v.cout_fcfa, v.cout_promo_fcfa, v.mots_cles
FROM (VALUES
    ('AutoCad / ArchiCad (Conception de plans électriques)', 'Concevoir sur ordinateur des plans de bâtiment et des plans électriques avec AutoCad et ArchiCad.', 'TREB', 'carte', 4, 'semaine', 80000, NULL::integer,
     ARRAY['autocad','archicad','dessin assisté par ordinateur','plan électrique','plan de bâtiment','conception','bâtiment']),
    -- =====================================================================
    -- TREB : Technologies / Techniques et Bâtiment — MODULAIRES
    -- =====================================================================
    ('Électricité bâtiment', 'Réaliser et entretenir les installations électriques des bâtiments.', 'TREB', 'modulaire', 6, 'mois', 150000, NULL,
     ARRAY['électricité','électricité bâtiment','installation électrique','câblage électrique','électricien','bâtiment','technicien']),
    ('Dessin bâtiment / Schéma', 'Dessiner les plans d''un bâtiment et les schémas de ses installations.', 'TREB', 'modulaire', 6, 'mois', 150000, NULL,
     ARRAY['dessin bâtiment','schéma','plan','dessin technique','lecture de plan','bâtiment','conception']),
    ('Électronique', 'Comprendre, monter et dépanner des circuits et des équipements électroniques.', 'TREB', 'modulaire', 6, 'mois', 160000, NULL,
     ARRAY['électronique','circuit électronique','composants','dépannage','montage','technicien','électricité']),
    ('Froid et climatisation', 'Installer, entretenir et dépanner les équipements de froid et de climatisation.', 'TREB', 'modulaire', 6, 'mois', 165000, NULL,
     ARRAY['froid','climatisation','frigoriste','installation','dépannage','maintenance','technicien']),
    ('Informatique industrielle', 'Programmer et maintenir les systèmes informatiques et automatisés utilisés dans l''industrie.', 'TREB', 'modulaire', 6, 'mois', 175000, NULL,
     ARRAY['informatique industrielle','automatisme','automate','industrie','électronique','maintenance','électricité']),
    ('Électrotechnique', 'Installer et maintenir les machines et les équipements électriques.', 'TREB', 'modulaire', 6, 'mois', 150000, NULL,
     ARRAY['électrotechnique','électricité','moteurs électriques','machines électriques','énergie','maintenance','technicien']),
    ('Domotique', 'Installer et programmer les équipements qui automatisent une maison ou un bâtiment : éclairage, sécurité, confort.', 'TREB', 'modulaire', 6, 'mois', 210000, NULL,
     ARRAY['domotique','maison connectée','automatisation','bâtiment','électricité','installation','éclairage']),
    ('Installation de panneaux solaires', 'Installer et entretenir des panneaux solaires et des installations photovoltaïques.', 'TREB', 'modulaire', 6, 'mois', 150000, NULL,
     ARRAY['panneaux solaires','énergie solaire','photovoltaïque','énergie renouvelable','installation','électricité','maintenance']),
    ('Réalisation des enseignes lumineuses', 'Concevoir et fabriquer des enseignes lumineuses pour les commerces et les entreprises.', 'TREB', 'modulaire', 6, 'mois', 200000, NULL,
     ARRAY['enseignes lumineuses','éclairage','led','signalétique','électricité','conception','fabrication'])
) AS v (intitule, description, domaine, type, duree_valeur, duree_unite, cout_fcfa, cout_promo_fcfa, mots_cles)
WHERE NOT EXISTS (
    SELECT 1 FROM formations f WHERE f.intitule = v.intitule AND f.domaine = 'TREB'
);
