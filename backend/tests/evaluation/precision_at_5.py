"""Précision@5 du moteur sur les profils annotés par le cabinet (docs/evaluation.md, RF-08).

Usage (depuis backend/) :
    python -m tests.evaluation.precision_at_5            mesure et moyenne
    python -m tests.evaluation.precision_at_5 --details  avec le top 5 de chaque profil
    python -m tests.evaluation.precision_at_5 --grille   grille d'annotation (Markdown)
    python -m tests.evaluation.precision_at_5 --grille-cabinet
                                    grille vierge à cocher pour le cabinet
                                    (> ../docs/grille-annotation-cabinet.md)

Le catalogue est lu dans database/02_catalogue_hitt.sql, sans base de données : la mesure est
reproductible et ne dépend que du moteur et du catalogue du dépôt. Les formations « pertinentes »
sont désignées par un conseiller du cabinet, sans voir les résultats du moteur : ce script ne les
modifie jamais. Un profil sans annotation est affiché mais exclu de la moyenne.

Chaque profil indique dans `annote_par` qui a désigné ses formations pertinentes. Tant qu'un profil
annoté n'est pas validé par un conseiller du cabinet, la mesure est signalée comme provisoire.
"""

import argparse
import json
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from types import SimpleNamespace

from app.services.recommandation import recommander

RACINE = Path(__file__).resolve().parents[3]
CATALOGUE_SQL = RACINE / "database" / "02_catalogue_hitt.sql"
PROFILS = Path(__file__).with_name("profils_test.json")
K = 5
OBJECTIF = 0.6
VALIDE_PAR_LE_CABINET = "conseiller du cabinet"

COLONNES = (
    "intitule",
    "description",
    "domaine",
    "type",
    "duree_valeur",
    "duree_unite",
    "cout_fcfa",
    "cout_promo_fcfa",
    "mots_cles",
)


# --- Lecture du catalogue SQL ------------------------------------------------------------------


class _Lecteur:
    """Lit les tuples de l'INSERT de 02_catalogue_hitt.sql (chaînes, nombres, NULL, ARRAY[])."""

    def __init__(self, texte: str) -> None:
        self.texte = texte
        self.i = 0

    def _blancs(self) -> None:
        while self.i < len(self.texte):
            if self.texte[self.i].isspace():
                self.i += 1
            elif self.texte.startswith("--", self.i):
                fin = self.texte.find("\n", self.i)
                self.i = len(self.texte) if fin == -1 else fin + 1
            else:
                return

    def _chaine(self) -> str:
        self.i += 1  # apostrophe ouvrante
        morceaux = []
        while True:
            fin = self.texte.index("'", self.i)
            morceaux.append(self.texte[self.i : fin])
            if self.texte.startswith("''", fin):
                morceaux.append("'")
                self.i = fin + 2
            else:
                self.i = fin + 1
                return "".join(morceaux)

    def _valeur(self):
        self._blancs()
        if self.texte[self.i] == "'":
            return self._chaine()
        if self.texte.startswith("ARRAY[", self.i):
            self.i += len("ARRAY[")
            elements = []
            while True:
                self._blancs()
                if self.texte[self.i] == "]":
                    self.i += 1
                    return elements
                elements.append(self._valeur())
                self._blancs()
                if self.texte[self.i] == ",":
                    self.i += 1
        if self.texte.startswith("NULL", self.i):
            self.i += len("NULL")
            return None
        debut = self.i
        while self.texte[self.i] not in ",)":
            self.i += 1
        nombre = self.texte[debut : self.i].strip()
        return float(nombre) if "." in nombre else int(nombre)

    def tuples(self):
        self.i = self.texte.index("VALUES", self.texte.index("INSERT INTO formations")) + 6
        while True:
            self._blancs()
            caractere = self.texte[self.i]
            if caractere == ";":
                return
            if caractere == ",":
                self.i += 1
                continue
            if caractere != "(":
                raise ValueError(f"Caractère inattendu {caractere!r} à la position {self.i}")
            self.i += 1
            valeurs = []
            while True:
                valeurs.append(self._valeur())
                self._blancs()
                if self.texte[self.i] == ",":
                    self.i += 1
                elif self.texte[self.i] == ")":
                    self.i += 1
                    break
            yield valeurs


def charger_catalogue(chemin: Path = CATALOGUE_SQL) -> list[SimpleNamespace]:
    formations = []
    for valeurs in _Lecteur(chemin.read_text(encoding="utf-8")).tuples():
        if len(valeurs) != len(COLONNES):
            raise ValueError(f"{len(valeurs)} valeurs au lieu de {len(COLONNES)} : {valeurs[:1]}")
        formations.append(SimpleNamespace(**dict(zip(COLONNES, valeurs, strict=True))))
    return formations


# --- Mesure ------------------------------------------------------------------------------------


@dataclass
class Resultat:
    id: str
    top: list[str]
    pertinentes: list[str]
    duree_ms: float
    trouvees: list[str] = field(default_factory=list)

    @property
    def annote(self) -> bool:
        return bool(self.pertinentes)

    @property
    def precision(self) -> float | None:
        return len(self.trouvees) / K if self.annote else None

    @property
    def maximum(self) -> float | None:
        # Moins de 5 formations pertinentes : la précision@5 ne peut pas atteindre 1.
        return min(len(set(self.pertinentes)), K) / K if self.annote else None


def charger_profils(chemin: Path = PROFILS) -> list[dict]:
    return json.loads(chemin.read_text(encoding="utf-8"))


def intitules_inconnus(profils: list[dict], formations: list[SimpleNamespace]) -> dict[str, list]:
    """Annotations qui ne correspondent à aucun intitulé du catalogue (faute de frappe, etc.)."""
    connus = {f.intitule for f in formations}
    inconnus = {}
    for p in profils:
        manquants = [i for i in p["pertinentes"] if i not in connus]
        if manquants:
            inconnus[p["id"]] = manquants
    return inconnus


def annotations_provisoires(profils: list[dict]) -> list[str]:
    """Profils annotés dont l'annotation n'a pas été faite ou validée par le cabinet."""
    return [
        p["id"]
        for p in profils
        if p["pertinentes"] and not p.get("annote_par", "").startswith(VALIDE_PAR_LE_CABINET)
    ]


def mesurer(profils: list[dict], formations: list[SimpleNamespace]) -> list[Resultat]:
    resultats = []
    for p in profils:
        profil = SimpleNamespace(**p["profil"])
        debut = time.perf_counter()
        top = [r.formation.intitule for r in recommander(profil, formations, k=K)]
        duree = (time.perf_counter() - debut) * 1000
        pertinentes = set(p["pertinentes"])
        resultats.append(
            Resultat(
                id=p["id"],
                top=top,
                pertinentes=p["pertinentes"],
                duree_ms=duree,
                trouvees=[i for i in top if i in pertinentes],
            )
        )
    return resultats


def moyenne(resultats: list[Resultat]) -> float | None:
    annotes = [r.precision for r in resultats if r.annote]
    return sum(annotes) / len(annotes) if annotes else None


# --- Affichage ---------------------------------------------------------------------------------


def _decimal(valeur: float) -> str:
    return f"{valeur:.2f}".replace(".", ",")


def afficher(resultats: list[Resultat], details: bool, provisoires: list[str]) -> None:
    print(f"{'Profil':<7}{'Précision@5':>12}{'Maximum':>10}{'Temps':>9}")
    for r in resultats:
        if r.annote:
            ligne = f"{_decimal(r.precision):>12}{_decimal(r.maximum):>10}"
        else:
            ligne = f"{'non annoté':>12}{'—':>10}"
        print(f"{r.id:<7}{ligne}{r.duree_ms:>7.0f} ms")
        if details:
            for rang, intitule in enumerate(r.top, 1):
                marque = "✓" if intitule in r.trouvees else " "
                print(f"         {marque} {rang}. {intitule}")
    annotes = sum(r.annote for r in resultats)
    m = moyenne(resultats)
    print()
    if m is None:
        print(f"Aucun profil annoté sur {len(resultats)} : pas de moyenne.")
        print("Les formations pertinentes sont à désigner par un conseiller du cabinet.")
        return
    verdict = "atteint" if m >= OBJECTIF else "non atteint"
    print(
        f"Précision@5 moyenne : {_decimal(m)} sur {annotes} profil(s) annoté(s) "
        f"sur {len(resultats)} (objectif {_decimal(OBJECTIF)} : {verdict})"
    )
    print(f"Temps de calcul maximal : {max(r.duree_ms for r in resultats):.0f} ms")
    if provisoires:
        print(
            f"MESURE PROVISOIRE : {len(provisoires)} profil(s) annoté(s) sans validation du "
            "cabinet (champ annote_par). Ne pas la présenter comme la mesure du protocole."
        )


def grille(profils: list[dict], formations: list[SimpleNamespace]) -> str:
    """Grille à remettre au conseiller : profils et catalogue, sans aucun résultat du moteur."""
    types = {"carte": "Formation courte, à la carte", "modulaire": "Parcours modulaire certifiant"}
    lignes = [
        "# Grille d'annotation des profils de test",
        "",
        "*Générée par `python -m tests.evaluation.precision_at_5 --grille` (depuis `backend/`).*",
        "",
        "Pour chaque profil, indiquer les formations du catalogue que vous conseilleriez à cette "
        "personne (5 de préférence, moins si le catalogue n'en propose pas autant). Seules les "
        "formations du type souhaité et dans le budget comptent. Les résultats de la plateforme ne "
        "sont volontairement pas montrés.",
        "",
    ]
    for p in profils:
        q = p["profil"]
        lignes += [
            f"## {p['id']}",
            "",
            f"- Niveau d'études : {q['niveau_etudes']}",
            f"- Compétences : {q['competences']}",
            f"- Centres d'intérêt : {q['centres_interet']}",
            f"- Objectif professionnel : {q['objectif_professionnel']}",
            f"- Type souhaité : {types[q['type_souhaite']]}",
            f"- Budget maximum : {q['budget_max_fcfa']:,} FCFA".replace(",", " "),
            "",
            "Formations pertinentes : 1. … 2. … 3. … 4. … 5. …",
            "",
        ]
    lignes += ["## Catalogue (86 formations)", "", "| Domaine | Type | Intitulé | Prix (FCFA) |"]
    lignes.append("|---|---|---|---|")
    for f in formations:
        prix = f.cout_promo_fcfa if f.cout_promo_fcfa is not None else f.cout_fcfa
        ligne_type = "À la carte" if f.type == "carte" else "Modulaire"
        lignes.append(f"| {f.domaine} | {ligne_type} | {f.intitule} | {prix:,} |".replace(",", " "))
    return "\n".join(lignes) + "\n"


def eligibles(profil: dict, formations: list[SimpleNamespace]) -> list[SimpleNamespace]:
    """Formations que le moteur peut proposer : type souhaité, prix effectif dans le budget."""
    vues: set[str] = set()
    retenues = []
    for f in sorted(formations, key=lambda f: (f.domaine, f.intitule.lower())):
        prix = f.cout_promo_fcfa if f.cout_promo_fcfa is not None else f.cout_fcfa
        if f.type == profil["type_souhaite"] and prix <= profil["budget_max_fcfa"]:
            if f.intitule not in vues:  # doublon « Initiation Informatique » (SISG et TRIT)
                vues.add(f.intitule)
                retenues.append(f)
    return retenues


def grille_cabinet(profils: list[dict], formations: list[SimpleNamespace]) -> str:
    """Grille vierge pour le conseiller : formations possibles à cocher, sans aucune proposition."""
    types = {"carte": "Formation courte, à la carte", "modulaire": "Parcours modulaire certifiant"}
    montant = lambda n: f"{n:,} FCFA".replace(",", "\u00a0")  # noqa: E731
    lignes = [
        "# Grille d'annotation des profils de test — à remplir par HIT-T Institute",
        "",
        "*Générée par `python -m tests.evaluation.precision_at_5 --grille-cabinet` "
        "(depuis `backend/`) ; protocole : [evaluation.md](evaluation.md).*",
        "",
        "**Conseiller :** ……………………………………  **Date :** ……………………",
        "",
        "## Consignes",
        "",
        "Cette grille sert à mesurer la qualité des recommandations de la plateforme. Pour chacun "
        "des 20 profils fictifs ci-dessous :",
        "",
        "1. Lire le profil comme celui d'une personne venue vous demander conseil.",
        "2. Cocher les formations que vous lui conseilleriez, parmi celles proposées : ce sont "
        "toutes les formations du catalogue du format demandé et dans son budget (prix promo s'il "
        "existe).",
        "3. Cocher **5 formations si possible**. Si moins de 5 conviennent vraiment, n'en cocher "
        "que celles-là et l'indiquer : n'ajoutez pas de formation pour arriver à 5.",
        "4. Ne pas chercher à deviner ce que propose la plateforme : ses résultats ne sont "
        "volontairement pas montrés.",
        "",
        "Remarques libres possibles sous chaque profil (profil peu réaliste, formation manquante "
        "au catalogue…).",
        "",
    ]
    for p in profils:
        q = p["profil"]
        possibles = eligibles(q, formations)
        lignes += [
            f"## {p['id']}",
            "",
            f"- Niveau d'études : {q['niveau_etudes']}",
            f"- Compétences actuelles : {q['competences']}",
            f"- Centres d'intérêt : {q['centres_interet']}",
            f"- Objectif professionnel : {q['objectif_professionnel']}",
            f"- Format souhaité : {types[q['type_souhaite']]}",
            f"- Budget maximum : {montant(q['budget_max_fcfa'])}",
            "",
            f"Formations possibles ({len(possibles)}) — cocher celles que vous conseilleriez :",
            "",
        ]
        domaine = None
        for f in possibles:
            if f.domaine != domaine:
                if domaine is not None:
                    lignes.append("")
                domaine = f.domaine
                lignes += [f"*{domaine}*", ""]
            prix = f.cout_promo_fcfa if f.cout_promo_fcfa is not None else f.cout_fcfa
            lignes.append(f"- [ ] {f.intitule} — {montant(prix)}")
        lignes += ["", "Remarques : ……………………………………………………………………", ""]
    return "\n".join(lignes) + "\n"


def main(arguments: list[str] | None = None) -> int:
    analyse = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    analyse.add_argument("--details", action="store_true", help="affiche le top 5 de chaque profil")
    analyse.add_argument("--grille", action="store_true", help="grille d'annotation en Markdown")
    analyse.add_argument(
        "--grille-cabinet", action="store_true", help="grille vierge à cocher pour le cabinet"
    )
    options = analyse.parse_args(arguments)

    formations = charger_catalogue()
    profils = charger_profils()
    if options.grille:
        sys.stdout.write(grille(profils, formations))
        return 0
    if options.grille_cabinet:
        sys.stdout.write(grille_cabinet(profils, formations))
        return 0

    inconnus = intitules_inconnus(profils, formations)
    if inconnus:
        for profil_id, manquants in inconnus.items():
            print(
                f"{profil_id} : intitulé(s) absent(s) du catalogue : {manquants}", file=sys.stderr
            )
        return 1
    afficher(mesurer(profils, formations), options.details, annotations_provisoires(profils))
    return 0


if __name__ == "__main__":
    sys.exit(main())
