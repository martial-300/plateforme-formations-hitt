"""Moteur de recommandation : TF-IDF + similarité cosinus (RF-08, RF-09).

Fonction pure, sans session ni requête : elle reçoit le profil et les formations déjà lus
en base et renvoie le top k. Appelée par `PUT /profil` (k = 5) et par l'aperçu visiteur
(RF-12, k = 3, profil réduit à « ce que vous aimeriez apprendre »).
Référence : docs/moteur-recommandation.md.
"""

import re
import unicodedata
from collections.abc import Sequence
from typing import NamedTuple, Protocol

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# scikit-learn ne fournit pas de liste française : liste fixe, sans accents car les textes
# sont comparés après `strip_accents="unicode"`.
STOPWORDS_FR = frozenset(
    """
    a au aux avec ce ces cet cette d dans de des du elle en et eux il ils je la le les leur
    leurs lui ma mais me meme mes moi mon ne nos notre nous on ou par pas pour qu que qui sa
    se ses son sur ta te tes toi ton tu un une vos votre vous c j l m n s t y
    ete etre avoir ai as avons avez ont est sont suis es sommes etes etait
    plus tres bien aussi comme tout tous toute toutes sans sous entre vers chez afin ainsi
    dont donc car si ni or deja encore puis
    devenir apprendre savoir utiliser travailler faire creer trouver gerer vite peu
    """.split()
)
# Dernière ligne : verbes et mots génériques des projets (« devenir secrétaire », « apprendre à
# créer… »). Sans eux, « devenir » suffisait à rapprocher un projet de secrétariat d'une formation
# de maintenance informatique (journal des essais, docs/evaluation.md).


class FormationRecommandable(Protocol):
    intitule: str
    description: str
    mots_cles: list[str]
    type: str
    cout_fcfa: int
    cout_promo_fcfa: int | None


class ProfilRecommandable(Protocol):
    competences: str | None
    centres_interet: str | None
    objectif_professionnel: str | None
    type_souhaite: str
    budget_max_fcfa: int


class Resultat(NamedTuple):
    formation: FormationRecommandable
    score: float
    mots_cles_communs: list[str]


def normaliser(texte: str) -> str:
    """Minuscules, sans accents, ponctuation remplacée par des espaces."""
    sans_accents = unicodedata.normalize("NFKD", texte.lower())
    sans_accents = "".join(c for c in sans_accents if not unicodedata.combining(c))
    return " ".join(re.findall(r"\w+", sans_accents))


def texte_formation(formation: FormationRecommandable) -> str:
    return " ".join([formation.intitule, formation.description, " ".join(formation.mots_cles)])


def texte_profil(profil: ProfilRecommandable) -> str:
    # Champs vides acceptés : l'aperçu visiteur ne remplit que `centres_interet`.
    champs = (profil.competences, profil.centres_interet, profil.objectif_professionnel)
    return " ".join(champ for champ in champs if champ)


def prix_effectif(formation: FormationRecommandable) -> int:
    """Prix promo s'il existe, sinon prix normal : c'est lui qui est comparé au budget."""
    if formation.cout_promo_fcfa is not None:
        return formation.cout_promo_fcfa
    return formation.cout_fcfa


def mots_cles_communs(formation: FormationRecommandable, texte_p: str) -> list[str]:
    """Mots-clés de la formation présents dans le profil normalisé, en mots entiers."""
    profil = f" {texte_p} "
    return [m for m in formation.mots_cles if normaliser(m) and f" {normaliser(m)} " in profil]


def recommander(
    profil: ProfilRecommandable, formations: Sequence[FormationRecommandable], k: int = 5
) -> list[Resultat]:
    """Top k des formations les plus proches du profil, par score décroissant.

    Filtre : type = `type_souhaite` et prix effectif ≤ `budget_max_fcfa`. Les formations de
    score 0 sont écartées et un intitulé n'apparaît qu'une fois (doublon « Initiation
    Informatique » en SISG et en TRIT). Moins de k résultats si le filtre en laisse peu.
    """
    if not formations or k <= 0:
        return []

    # IDF calculé sur tout le catalogue, puis profil projeté dans le même espace.
    vectoriseur = TfidfVectorizer(
        strip_accents="unicode",
        lowercase=True,
        stop_words=list(STOPWORDS_FR),
        # Mots seuls : les paires de mots n'amélioraient pas la mesure (journal des essais).
        ngram_range=(1, 1),
    )
    matrice = vectoriseur.fit_transform([texte_formation(f) for f in formations])
    vecteur_profil = vectoriseur.transform([texte_profil(profil)])
    scores = cosine_similarity(vecteur_profil, matrice).ravel()

    candidats = [
        (formation, float(score))
        for formation, score in zip(formations, scores, strict=True)
        if score > 0
        and formation.type == profil.type_souhaite
        and prix_effectif(formation) <= profil.budget_max_fcfa
    ]
    # Tri stable : à score égal, l'ordre du catalogue est conservé.
    candidats.sort(key=lambda candidat: candidat[1], reverse=True)

    texte_p = normaliser(texte_profil(profil))
    resultats: list[Resultat] = []
    intitules_vus: set[str] = set()
    for formation, score in candidats:
        cle = normaliser(formation.intitule)
        if cle in intitules_vus:
            continue
        intitules_vus.add(cle)
        resultats.append(Resultat(formation, score, mots_cles_communs(formation, texte_p)))
        if len(resultats) == k:
            break
    return resultats
