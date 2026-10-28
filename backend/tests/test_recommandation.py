"""Moteur de recommandation TF-IDF + cosinus (RF-08, RF-09) : tests sans base."""

import time
from dataclasses import dataclass, field

from app.services.recommandation import prix_effectif, recommander


@dataclass
class F:
    """Formation minimale : `recommander` n'a besoin que de ces attributs."""

    intitule: str
    description: str = ""
    mots_cles: list[str] = field(default_factory=list)
    type: str = "carte"
    cout_fcfa: int = 100_000
    cout_promo_fcfa: int | None = None


@dataclass
class P:
    competences: str = ""
    centres_interet: str = ""
    objectif_professionnel: str = ""
    type_souhaite: str = "carte"
    budget_max_fcfa: int = 500_000


WEB = F(
    "Développement de site web avec PHP, HTML, CSS",
    "Créer des sites internet dynamiques en programmant avec PHP.",
    ["développement web", "site web", "programmation", "php", "html"],
)
EXCEL = F(
    "Office Excel niveau avancé",
    "Tableaux croisés dynamiques et formules avancées pour la gestion.",
    ["excel", "tableur", "formules", "gestion"],
)
COMPTA = F(
    "Comptabilité informatisée",
    "Tenir la comptabilité d'une entreprise avec un logiciel de gestion.",
    ["comptabilité", "gestion", "entreprise", "logiciel"],
)
RESEAU = F(
    "Réseaux informatiques",
    "Installer et administrer un réseau local d'entreprise.",
    ["réseau", "cisco", "administration", "entreprise"],
)
CATALOGUE = [WEB, EXCEL, COMPTA, RESEAU]


def intitules(resultats):
    return [r.formation.intitule for r in resultats]


def test_formation_la_plus_proche_en_tete():
    profil = P(
        centres_interet="programmation sites web",
        objectif_professionnel="devenir développeur web",
    )
    resultats = recommander(profil, CATALOGUE)
    assert intitules(resultats)[0] == WEB.intitule
    assert 0 < resultats[0].score <= 1


def test_scores_tries_par_ordre_decroissant():
    profil = P(competences="excel", centres_interet="gestion entreprise comptabilité")
    scores = [r.score for r in recommander(profil, CATALOGUE)]
    assert scores == sorted(scores, reverse=True)


def test_accents_et_casse_ignores():
    profil = P(centres_interet="COMPTABILITE")
    assert intitules(recommander(profil, CATALOGUE)) == [COMPTA.intitule]


def test_score_nul_exclu():
    # Aucun mot du profil n'apparaît dans le catalogue : rien n'est recommandé.
    assert recommander(P(centres_interet="cuisine pâtisserie"), CATALOGUE) == []


def test_profil_vide_ou_fait_de_mots_vides():
    assert recommander(P(), CATALOGUE) == []
    assert recommander(P(centres_interet="je de la et pour les"), CATALOGUE) == []


def test_catalogue_vide():
    assert recommander(P(centres_interet="excel"), []) == []


def test_filtre_sur_le_type_souhaite():
    modulaire = F("Excel certifiant", "Parcours excel complet.", ["excel"], type="modulaire")
    profil = P(competences="excel", type_souhaite="modulaire")
    assert intitules(recommander(profil, [EXCEL, modulaire])) == [modulaire.intitule]


def test_filtre_budget_sur_le_prix_promo_s_il_existe():
    promo = F("Excel promo", "Excel.", ["excel"], cout_fcfa=150_000, cout_promo_fcfa=120_000)
    cher = F("Excel cher", "Excel.", ["excel"], cout_fcfa=150_000)
    profil = P(competences="excel", budget_max_fcfa=120_000)
    assert intitules(recommander(profil, [promo, cher])) == [promo.intitule]


def test_prix_effectif():
    assert prix_effectif(F("a", cout_fcfa=15_500, cout_promo_fcfa=13_500)) == 13_500
    assert prix_effectif(F("a", cout_fcfa=15_500)) == 15_500


def test_k_limite_le_nombre_de_resultats():
    profil = P(centres_interet="gestion entreprise informatique excel web réseau comptabilité")
    assert len(recommander(profil, CATALOGUE)) == 4
    assert len(recommander(profil, CATALOGUE, k=3)) == 3
    assert len(recommander(profil, CATALOGUE, k=5)) == 4


def test_doublon_d_intitule_garde_une_seule_occurrence():
    # « Initiation Informatique » existe en SISG et en TRIT.
    sisg = F("Initiation Informatique", "Découvrir l'ordinateur.", ["informatique", "ordinateur"])
    trit = F("Initiation informatique", "Découvrir l'informatique.", ["informatique"])
    resultats = recommander(P(centres_interet="informatique ordinateur"), [sisg, trit, RESEAU])
    assert [r.formation.intitule.lower() for r in resultats].count("initiation informatique") == 1
    assert resultats[0].formation is sisg


def test_mots_cles_communs():
    profil = P(
        centres_interet="programmation, création de site web",
        objectif_professionnel="Développement web en PHP",
    )
    resultat = recommander(profil, [WEB])[0]
    assert resultat.mots_cles_communs == ["développement web", "site web", "programmation", "php"]


def test_mots_cles_communs_sur_des_mots_entiers():
    # « html » ne doit pas être reconnu dans « htmlx », ni « php » dans « phpstorm ».
    resultat = recommander(P(centres_interet="web htmlx phpstorm"), [WEB])[0]
    assert resultat.mots_cles_communs == []


def test_apercu_visiteur_profil_reduit_et_k_3():
    # RF-12 : seul « ce que vous aimeriez apprendre » est rempli.
    apercu = P(centres_interet="créer des sites internet, programmer", budget_max_fcfa=150_000)
    resultats = recommander(apercu, CATALOGUE, k=3)
    assert 1 <= len(resultats) <= 3
    assert resultats[0].formation is WEB


def test_ne_modifie_pas_les_formations():
    copie = list(CATALOGUE)
    recommander(P(centres_interet="excel gestion"), CATALOGUE)
    assert CATALOGUE == copie
    assert EXCEL.mots_cles == ["excel", "tableur", "formules", "gestion"]


def test_calcul_en_moins_d_une_seconde_sur_86_formations():
    themes = ["excel", "réseau", "comptabilité", "python", "web", "secrétariat", "blockchain"]
    formations = [
        F(
            f"Formation {i} {themes[i % len(themes)]}",
            f"Apprendre {themes[i % len(themes)]} et {themes[(i + 2) % len(themes)]} "
            "avec des exercices pratiques en entreprise.",
            [themes[i % len(themes)], themes[(i + 3) % len(themes)], "pratique"],
            type="carte" if i % 3 else "modulaire",
            cout_fcfa=50_000 + 5_000 * i,
        )
        for i in range(86)
    ]
    profil = P(
        competences="word excel bases internet",
        centres_interet="programmation sites web python",
        objectif_professionnel="devenir développeur web",
        budget_max_fcfa=300_000,
    )
    debut = time.perf_counter()
    resultats = recommander(profil, formations)
    assert time.perf_counter() - debut < 1
    assert len(resultats) == 5
