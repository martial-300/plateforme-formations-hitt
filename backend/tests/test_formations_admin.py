"""Gestion du catalogue par l'administrateur (RF-03, RF-04) : POST, PUT et DELETE /formations."""

import uuid
from pathlib import Path

import pytest
from pydantic import ValidationError
from sqlalchemy import func, select

from app.models import Formation, Utilisateur
from app.schemas.formation import ENTIER_SQL_MAX, FormationEntree
from app.services.security import creer_jeton
from tests.test_formations import ajouter_formation

SCHEMA_SQL = Path(__file__).resolve().parents[2] / "database" / "01_schema.sql"
CATALOGUE_SQL = Path(__file__).resolve().parents[2] / "database" / "02_catalogue_hitt.sql"

NOUVELLE = {
    "intitule": "Excel pour la gestion",
    "description": "Tableaux, formules et graphiques pour le suivi d'activité.",
    "domaine": "SISG",
    "type": "carte",
    "duree_valeur": 1,
    "duree_unite": "semaine",
    "cout_fcfa": 45000,
    "cout_promo_fcfa": 40000,
    "mots_cles": ["excel", "tableur", "gestion"],
}


def entete(db, role: str) -> dict[str, str]:
    utilisateur = Utilisateur(
        nom="Test", prenom=role, email=f"{role}@example.com", mot_de_passe_hash="x", role=role
    )
    db.add(utilisateur)
    db.flush()
    return {"Authorization": f"Bearer {creer_jeton(utilisateur.id)}"}


@pytest.fixture
def admin(db):
    return entete(db, "administrateur")


@pytest.fixture
def apprenant(db):
    return entete(db, "apprenant")


def nombre_de_formations(db) -> int:
    return db.scalar(select(func.count()).select_from(Formation))


# --- POST /formations ------------------------------------------------------------------------


def test_creation_201_et_visible_dans_le_catalogue(client, admin):
    reponse = client.post("/api/v1/formations", json=NOUVELLE, headers=admin)
    assert reponse.status_code == 201
    corps = reponse.json()
    assert uuid.UUID(corps["id"])
    assert {k: v for k, v in corps.items() if k != "id"} == {**NOUVELLE, "duree_valeur": 1.0}
    assert client.get(f"/api/v1/formations/{corps['id']}").json() == corps


def test_creation_mots_cles_en_minuscules_sans_doublon(client, admin):
    mots = [" Excel ", "TABLEUR", "excel", "Gestion"]
    reponse = client.post("/api/v1/formations", json=NOUVELLE | {"mots_cles": mots}, headers=admin)
    assert reponse.json()["mots_cles"] == ["excel", "tableur", "gestion"]


def test_creation_modulaire_sans_prix_promo(client, admin):
    modulaire = NOUVELLE | {"type": "modulaire", "duree_valeur": 6, "duree_unite": "mois"}
    del modulaire["cout_promo_fcfa"]
    reponse = client.post("/api/v1/formations", json=modulaire, headers=admin)
    assert reponse.status_code == 201
    assert reponse.json()["cout_promo_fcfa"] is None


def test_creation_sans_jeton_401(client, db):
    # Le contrôle d'accès passe avant la validation du corps : pas d'indice sur le format attendu.
    assert client.post("/api/v1/formations", json={}).status_code == 401
    assert client.post("/api/v1/formations", json=NOUVELLE).status_code == 401
    assert nombre_de_formations(db) == 0


def test_creation_par_un_apprenant_403(client, db, apprenant):
    reponse = client.post("/api/v1/formations", json=NOUVELLE, headers=apprenant)
    assert reponse.status_code == 403
    assert nombre_de_formations(db) == 0


@pytest.mark.parametrize(
    "modifs",
    [
        {"type": "modulaire"},  # modulaire avec prix promo
        {"cout_promo_fcfa": 45000},  # promo égale au prix normal
        {"cout_promo_fcfa": 50000},  # promo supérieure
        {"domaine": "Cuisine"},
        {"type": "presentiel"},
        {"duree_unite": "an"},
        {"duree_valeur": 0},
        {"duree_valeur": 1.25},  # NUMERIC(4,1) : une décimale au plus
        {"duree_valeur": 1000},
        {"cout_fcfa": 0},
        {"cout_fcfa": ENTIER_SQL_MAX + 1},
        {"cout_promo_fcfa": 0},
        {"mots_cles": []},
        {"mots_cles": ["excel", "  "]},
        {"mots_cles": [f"mot{i}" for i in range(21)]},
        {"intitule": "   "},
        {"intitule": "x" * 201},
        {"description": ""},
    ],
)
def test_creation_donnees_invalides_422(client, db, admin, modifs):
    reponse = client.post("/api/v1/formations", json=NOUVELLE | modifs, headers=admin)
    assert reponse.status_code == 422
    assert nombre_de_formations(db) == 0


@pytest.mark.parametrize("champ", ["intitule", "description", "domaine", "cout_fcfa", "mots_cles"])
def test_creation_champ_obligatoire_manquant_422(client, admin, champ):
    corps = {k: v for k, v in NOUVELLE.items() if k != champ}
    assert client.post("/api/v1/formations", json=corps, headers=admin).status_code == 422


# --- PUT /formations/{id} --------------------------------------------------------------------


def test_modification_remplace_tous_les_champs(client, db, admin):
    formation = ajouter_formation(db)
    sans_promo = {k: v for k, v in NOUVELLE.items() if k != "cout_promo_fcfa"}
    reponse = client.put(f"/api/v1/formations/{formation.id}", json=sans_promo, headers=admin)
    assert reponse.status_code == 200
    corps = reponse.json()
    assert corps["id"] == str(formation.id)
    assert corps["intitule"] == "Excel pour la gestion"
    assert corps["cout_promo_fcfa"] is None  # absent du corps : effacé
    db.refresh(formation)
    assert formation.domaine == "SISG"
    assert nombre_de_formations(db) == 1


def test_modification_id_inconnu_404(client, admin):
    reponse = client.put(f"/api/v1/formations/{uuid.uuid4()}", json=NOUVELLE, headers=admin)
    assert reponse.status_code == 404
    assert reponse.json() == {"detail": "Formation introuvable"}


def test_modification_par_un_apprenant_403(client, db, apprenant):
    formation = ajouter_formation(db)
    reponse = client.put(f"/api/v1/formations/{formation.id}", json=NOUVELLE, headers=apprenant)
    assert reponse.status_code == 403
    db.refresh(formation)
    assert formation.intitule == "Développement de site web avec PHP, HTML, CSS"


def test_modification_invalide_422_sans_rien_changer(client, db, admin):
    formation = ajouter_formation(db)
    reponse = client.put(
        f"/api/v1/formations/{formation.id}", json=NOUVELLE | {"cout_fcfa": 0}, headers=admin
    )
    assert reponse.status_code == 422
    db.refresh(formation)
    assert formation.cout_fcfa == 125000


# --- DELETE /formations/{id} -----------------------------------------------------------------


def test_suppression_204_puis_introuvable(client, db, admin):
    formation = ajouter_formation(db)
    reponse = client.delete(f"/api/v1/formations/{formation.id}", headers=admin)
    assert reponse.status_code == 204
    assert reponse.content == b""
    assert client.get(f"/api/v1/formations/{formation.id}").status_code == 404


def test_suppression_id_inconnu_404(client, admin):
    assert client.delete(f"/api/v1/formations/{uuid.uuid4()}", headers=admin).status_code == 404


def test_suppression_sans_jeton_401_ou_par_un_apprenant_403(client, db, apprenant):
    formation = ajouter_formation(db)
    assert client.delete(f"/api/v1/formations/{formation.id}").status_code == 401
    assert client.delete(f"/api/v1/formations/{formation.id}", headers=apprenant).status_code == 403
    assert nombre_de_formations(db) == 1


def test_suppression_supprime_les_recommandations_liees(client, db, admin):
    # 01_schema.sql est rejoué (sans effet sur les tables déjà créées par le modèle ORM) : le
    # ON DELETE CASCADE vérifié est celui de la base réelle comme celui du modèle Recommandation.
    connexion = db.connection()
    connexion.exec_driver_sql(SCHEMA_SQL.read_text(encoding="utf-8"))
    formation = ajouter_formation(db)
    compte = db.scalar(select(Utilisateur).where(Utilisateur.role == "administrateur"))
    connexion.exec_driver_sql(
        "INSERT INTO recommandations (utilisateur_id, formation_id, score) VALUES (%s, %s, 0.5)",
        (compte.id, formation.id),
    )
    compter = "SELECT count(*) FROM recommandations WHERE formation_id = %s"
    assert connexion.exec_driver_sql(compter, (formation.id,)).scalar() == 1

    assert client.delete(f"/api/v1/formations/{formation.id}", headers=admin).status_code == 204
    assert connexion.exec_driver_sql(compter, (formation.id,)).scalar() == 0


# --- Compatibilité avec le catalogue réel ----------------------------------------------------


def test_les_86_formations_du_catalogue_passent_la_validation(db):
    # L'administrateur doit pouvoir réenregistrer n'importe quelle formation existante telle quelle.
    db.connection().exec_driver_sql(CATALOGUE_SQL.read_text(encoding="utf-8"))
    formations = db.scalars(select(Formation)).all()
    assert len(formations) == 86
    refusees = []
    for formation in formations:
        champs = {c: getattr(formation, c) for c in FormationEntree.model_fields}
        try:
            entree = FormationEntree(**champs)
        except ValidationError as exc:
            refusees.append((formation.intitule, exc.errors()[0]["msg"]))
            continue
        assert entree.mots_cles == formation.mots_cles, formation.intitule
    assert refusees == []
