-- Schéma MVP HIT-T Reco : 4 tables (cf. docs/modele-donnees.md)
-- PostgreSQL 13+ (gen_random_uuid intégré).
-- Exécuté avant 02_catalogue_hitt.sql. En développement, le backend crée aussi
-- les tables au démarrage (SQLAlchemy create_all, pas d'Alembic dans le MVP) :
-- ce script doit rester aligné avec les modèles ORM.

CREATE TABLE IF NOT EXISTS utilisateurs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom                VARCHAR(100) NOT NULL,
    prenom             VARCHAR(100) NOT NULL,
    email              VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe_hash  VARCHAR(255) NOT NULL,
    role               VARCHAR(20)  NOT NULL DEFAULT 'apprenant'
                       CHECK (role IN ('apprenant', 'administrateur')),
    date_creation      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profils_apprenants (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id          UUID NOT NULL UNIQUE REFERENCES utilisateurs(id) ON DELETE CASCADE,
    niveau_etudes           VARCHAR(50)  NOT NULL,
    competences             TEXT         NOT NULL,
    centres_interet         TEXT         NOT NULL,
    objectif_professionnel  TEXT         NOT NULL,
    type_souhaite           VARCHAR(20)  NOT NULL CHECK (type_souhaite IN ('carte', 'modulaire')),
    budget_max_fcfa         INTEGER      NOT NULL CHECK (budget_max_fcfa >= 0),
    date_maj                TIMESTAMP    NOT NULL DEFAULT now()
);

-- Même définition que dans 02_catalogue_hitt.sql (IF NOT EXISTS : pas de conflit).
CREATE TABLE IF NOT EXISTS formations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intitule         VARCHAR(200) NOT NULL,
    description      TEXT         NOT NULL,
    domaine          VARCHAR(20)  NOT NULL CHECK (domaine IN ('SISG', 'IA-Data', 'TRIT')),
    type             VARCHAR(20)  NOT NULL CHECK (type IN ('carte', 'modulaire')),
    duree_valeur     NUMERIC(4,1) NOT NULL,
    duree_unite      VARCHAR(10)  NOT NULL CHECK (duree_unite IN ('heure', 'jour', 'semaine', 'mois')),
    cout_fcfa        INTEGER      NOT NULL,
    cout_promo_fcfa  INTEGER,
    mots_cles        TEXT[]       NOT NULL,
    date_creation    TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recommandations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id   UUID         NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    formation_id     UUID         NOT NULL REFERENCES formations(id)   ON DELETE CASCADE,
    score            NUMERIC(5,4) NOT NULL CHECK (score BETWEEN 0 AND 1),
    mots_cles_communs TEXT[]      NOT NULL DEFAULT '{}',
    retour           VARCHAR(20)  NOT NULL DEFAULT 'aucun'
                     CHECK (retour IN ('pertinent', 'non_pertinent', 'aucun')),
    date_generation  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommandations_utilisateur ON recommandations(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_recommandations_formation   ON recommandations(formation_id);
CREATE INDEX IF NOT EXISTS idx_formations_domaine_type     ON formations(domaine, type);
