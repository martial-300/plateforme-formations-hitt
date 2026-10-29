"""Outil d'évaluation précision@5 (docs/evaluation.md) : lecture du catalogue, profils, calcul."""

from collections import Counter
from types import SimpleNamespace

from app.schemas.profil import ProfilEntree
from tests.evaluation.precision_at_5 import (
    K,
    charger_catalogue,
    charger_profils,
    intitules_inconnus,
    mesurer,
    moyenne,
)


def test_catalogue_sql_lu_sans_base():
    formations = charger_catalogue()
    assert len(formations) == 86
    assert Counter((f.domaine, f.type) for f in formations) == {
        ("SISG", "carte"): 14,
        ("SISG", "modulaire"): 17,
        ("IA-Data", "carte"): 21,
        ("IA-Data", "modulaire"): 3,
        ("TRIT", "carte"): 19,
        ("TRIT", "modulaire"): 12,
    }
    # Apostrophes doublées en SQL, prix promo NULL pour les modulaires, mots-clés en liste.
    intitules = {f.intitule for f in formations}
    assert "Techniques d'entretien d'embauche" in intitules
    assert all(f.cout_promo_fcfa is None for f in formations if f.type == "modulaire")
    assert all(isinstance(f.mots_cles, list) and f.mots_cles for f in formations)


def test_vingt_profils_valides_couvrant_domaines_et_types():
    profils = charger_profils()
    assert len(profils) == 20
    assert len({p["id"] for p in profils}) == 20
    for p in profils:
        ProfilEntree(**p["profil"])  # mêmes règles que PUT /profil
        assert isinstance(p["pertinentes"], list)
    assert Counter(p["profil"]["type_souhaite"] for p in profils) == {"carte": 10, "modulaire": 10}


def test_annotations_toutes_dans_le_catalogue():
    assert intitules_inconnus(charger_profils(), charger_catalogue()) == {}


def test_annotation_inconnue_signalee():
    profils = [{"id": "X", "pertinentes": ["Formation qui n'existe pas"]}]
    assert intitules_inconnus(profils, charger_catalogue()) == {"X": ["Formation qui n'existe pas"]}


def _formation(intitule: str, mots: list[str]) -> SimpleNamespace:
    return SimpleNamespace(
        intitule=intitule,
        description=" ".join(mots),
        mots_cles=mots,
        type="carte",
        cout_fcfa=10_000,
        cout_promo_fcfa=None,
    )


PROFIL = {
    "competences": "excel",
    "centres_interet": "excel tableur",
    "objectif_professionnel": "excel",
    "type_souhaite": "carte",
    "budget_max_fcfa": 50_000,
}


def test_precision_et_maximum():
    formations = [_formation(f"Excel {i}", ["excel", "tableur"]) for i in range(6)]
    profils = [
        {"id": "A", "profil": PROFIL, "pertinentes": ["Excel 0", "Excel 1", "Autre"]},
        {"id": "B", "profil": PROFIL, "pertinentes": []},
    ]
    a, b = mesurer(profils, formations)
    assert len(a.top) == K
    assert a.precision == len(a.trouvees) / K
    assert set(a.trouvees) <= {"Excel 0", "Excel 1"}
    assert a.maximum == 3 / K
    assert not b.annote and b.precision is None
    # Un profil non annoté ne compte pas dans la moyenne.
    assert moyenne([a, b]) == a.precision
    assert moyenne([b]) is None
