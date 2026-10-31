// Aucune recommandation (écran 12) : la cause (budget ou vocabulaire) et deux possibilités chiffrées
// d'après le catalogue public (GET /formations).
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { listerFormations } from "../api/formations";
import type { Formation, Profil, TypeFormation } from "../api/types";
import { formaterMontant } from "../catalogue/libelles";

const NOMS: Record<
  TypeFormation,
  { aucun: string; pronom: string; pluriel: string; choisir: string }
> = {
  carte: {
    aucun: "Aucune formation à la carte",
    pronom: "aucune",
    pluriel: "formations à la carte",
    choisir: "Choisir une formation courte à la carte",
  },
  modulaire: {
    aucun: "Aucun parcours modulaire certifiant",
    pronom: "aucun",
    pluriel: "parcours modulaires",
    choisir: "Choisir un parcours modulaire certifiant",
  },
};

function prixEffectif(formation: Formation) {
  return formation.cout_promo_fcfa ?? formation.cout_fcfa;
}

/** Formation la moins chère d'une liste (prix promo s'il existe, comme le moteur). */
function moinsChere(formations: Formation[]) {
  return formations.reduce<Formation | null>(
    (min, f) => (min === null || prixEffectif(f) < prixEffectif(min) ? f : min),
    null,
  );
}

export function AucuneRecommandation({ profil }: { profil: Profil }) {
  const [catalogue, setCatalogue] = useState<Formation[] | null>(null);

  useEffect(() => {
    let actif = true;
    // En cas d'échec, l'écran garde son texte général, sans chiffres.
    listerFormations().then(
      (formations) => actif && setCatalogue(formations),
      () => undefined,
    );
    return () => {
      actif = false;
    };
  }, []);

  const type = profil.type_souhaite;
  const autre: TypeFormation = type === "carte" ? "modulaire" : "carte";
  const budget = formaterMontant(profil.budget_max_fcfa);

  let explication = `${NOMS[type].aucun} ne correspond à vos réponses pour ${budget} ou moins.`;
  let possibilites: ReactNode[] = [
    "Augmenter votre budget ou choisir l'autre type de formation.",
    "Décrire autrement vos centres d'intérêt et votre objectif.",
  ];

  if (catalogue) {
    const memeType = catalogue.filter((f) => f.type === type);
    const autreType = catalogue.filter((f) => f.type === autre);
    const dansBudget = memeType.filter((f) => prixEffectif(f) <= profil.budget_max_fcfa);
    const minType = moinsChere(memeType);
    const minAutre = moinsChere(autreType);

    if (dansBudget.length === 0) {
      // Cause : le budget. Aucune formation du type choisi n'est assez bon marché.
      explication = `${NOMS[type].aucun} ne coûte ${budget} ou moins.`;
      possibilites = [
        minType &&
          `Augmenter votre budget : les ${NOMS[type].pluriel} commencent à ${formaterMontant(prixEffectif(minType))}.`,
        minAutre &&
          `${NOMS[autre].choisir} : ${autreType.length} formations, à partir de ${formaterMontant(prixEffectif(minAutre))}${minAutre.cout_promo_fcfa !== null ? " (prix promotionnel)" : ""}.`,
      ].filter(Boolean);
    } else {
      // Cause : le vocabulaire. Des formations tiennent dans le budget, mais aucun mot en commun.
      explication = `${dansBudget.length} ${NOMS[type].pluriel} sont dans votre budget, mais ${NOMS[type].pronom} ne reprend les mots de vos réponses.`;
      possibilites = [
        "Décrire autrement vos centres d'intérêt et votre objectif, avec des mots simples (par exemple : informatique, gestion, secrétariat, réseaux).",
        <>
          Parcourir ces formations :{" "}
          <Link to={`/formations?type=${type}`}>voir les {NOMS[type].pluriel}</Link>.
        </>,
      ];
    }
  }

  return (
    <section className="recommandations__vide">
      <img src="/illustrations/vide.svg" alt="" className="recommandations__illustration" />
      <h2>Aucune formation ne correspond à vos critères</h2>
      <p className="recommandations__explication">{explication}</p>
      <h3>Deux possibilités</h3>
      <ul className="recommandations__possibilites">
        {possibilites.map((possibilite, index) => (
          <li key={index}>{possibilite}</li>
        ))}
      </ul>
      <div className="recommandations__actions">
        <Link to="/questionnaire" className="bouton">
          Modifier mes réponses
        </Link>
        <Link to="/formations">Parcourir le catalogue</Link>
      </div>
    </section>
  );
}
