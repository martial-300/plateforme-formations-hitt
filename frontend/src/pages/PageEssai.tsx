// Essai sans compte (RF-12) : maquettes 19 (questions), 20 et M7 (aperçu des résultats).
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { demanderApercu } from "../api/apercu";
import type { ApercuEntree, RecommandationApercu, TypeFormation } from "../api/types";
import { useAuth } from "../auth/useAuth";
import { messageErreur } from "../auth/useConnexion";
import { formaterMontant } from "../catalogue/libelles";
import { ListeApercu } from "../components/ListeApercu";
import { garderEssai, lireEssai } from "../essai/memoire";
import {
  controler,
  formaterNombre,
  lireMontant,
  SAISIE_VIDE,
  type Probleme,
} from "../questionnaire/reponses";

const TYPES: { valeur: TypeFormation; titre: string; detail: string }[] = [
  { valeur: "carte", titre: "Formation courte, à la carte", detail: "De 1 jour à 3 mois." },
  { valeur: "modulaire", titre: "Parcours modulaire certifiant", detail: "De 2 à 9 mois." },
];

const CHAMPS = ["centres_interet", "type_souhaite", "budget"] as const;
type Champ = (typeof CHAMPS)[number];
type Saisie = Pick<typeof SAISIE_VIDE, Champ>;

function saisieInitiale(): Saisie {
  // Retour sur la page (depuis une fiche formation, par exemple) : les réponses sont reprises.
  const gardees = lireEssai();
  if (!gardees) return { centres_interet: "", type_souhaite: "", budget: "" };
  return {
    centres_interet: gardees.centres_interet,
    type_souhaite: gardees.type_souhaite,
    budget: formaterNombre(gardees.budget_max_fcfa),
  };
}

export function PageEssai() {
  const { utilisateur } = useAuth();
  const [saisie, setSaisie] = useState<Saisie>(saisieInitiale);
  const [problemes, setProblemes] = useState<Partial<Record<Champ, Probleme>>>({});
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  // Réponses envoyées et formations reçues : null tant que l'aperçu n'est pas affiché.
  const [resultat, setResultat] = useState<{
    reponses: ApercuEntree;
    recommandations: RecommandationApercu[];
  } | null>(null);
  const titreResultat = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = resultat
      ? "Aperçu de vos formations — HIT-T Institute"
      : "Essayer sans compte — HIT-T Institute";
    if (resultat) {
      window.scrollTo(0, 0);
      titreResultat.current?.focus();
    }
  }, [resultat]);

  function modifier(champ: Champ, valeur: string) {
    setSaisie((s) => ({ ...s, [champ]: valeur }));
    if (problemes[champ]) {
      setProblemes((actuels) => {
        const restants = { ...actuels };
        delete restants[champ];
        return restants;
      });
    }
  }

  async function envoyer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);
    // Mêmes contrôles que le questionnaire complet, limités aux trois questions de l'essai.
    const tous = controler({ ...SAISIE_VIDE, ...saisie });
    const trouves = Object.fromEntries(CHAMPS.filter((c) => tous[c]).map((c) => [c, tous[c]]));
    setProblemes(trouves);
    if (Object.keys(trouves).length > 0) {
      document.getElementById(CHAMPS.find((c) => trouves[c])!)?.focus();
      return;
    }

    const reponses: ApercuEntree = {
      centres_interet: saisie.centres_interet.trim(),
      type_souhaite: saisie.type_souhaite as TypeFormation,
      budget_max_fcfa: lireMontant(saisie.budget) ?? 0,
    };
    setEnvoi(true);
    try {
      const { recommandations } = await demanderApercu(reponses);
      garderEssai(reponses);
      setResultat({ reponses, recommandations });
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(false);
    }
  }

  function aria(champ: Champ, aide?: string) {
    const ids = [problemes[champ] && `${champ}-erreur`, aide].filter(Boolean).join(" ");
    return {
      id: champ,
      "aria-invalid": problemes[champ] ? true : undefined,
      "aria-describedby": ids || undefined,
    };
  }

  function messageSous(champ: Champ) {
    const probleme = problemes[champ];
    return probleme ? (
      <p id={`${champ}-erreur`} className="champ__erreur">
        {probleme.message}
      </p>
    ) : null;
  }

  if (resultat) {
    const { reponses, recommandations } = resultat;
    return (
      <main className="conteneur essai-resultat">
        <nav className="fil-ariane" aria-label="Fil d'Ariane">
          <Link to="/">Accueil</Link> /{" "}
          <button type="button" className="lien-texte" onClick={() => setResultat(null)}>
            Essai
          </button>{" "}
          / <span aria-current="page">Aperçu</span>
        </nav>
        <h1 tabIndex={-1} ref={titreResultat}>
          {recommandations.length === 0
            ? "Aucune formation pour ces réponses"
            : recommandations.length === 1
              ? "Votre première formation"
              : `Vos ${recommandations.length === 2 ? "deux" : "trois"} premières formations`}
        </h1>
        <p className="essai-resultat__chapo">
          Calculées automatiquement à partir de vos trois réponses.
          <span className="essai-resultat__chapo-suite">
            {" "}
            Le questionnaire complet affine ce résultat.
          </span>
        </p>

        <div className="essai-resultat__grille">
          <section className="essai-resultat__liste" aria-label="Formations proposées">
            {recommandations.length > 0 ? (
              <ListeApercu recommandations={recommandations} />
            ) : (
              <p className="essai-resultat__vide">
                Aucune formation de ce format ne correspond à vos mots dans ce budget. Essayez
                d'autres mots, l'autre format ou un budget plus élevé. Un conseiller du cabinet peut
                aussi vous aider.
              </p>
            )}
          </section>

          <aside className="essai-resultat__reponses" aria-labelledby="titre-reponses">
            <h2 id="titre-reponses">Vos réponses</h2>
            <dl>
              <div>
                <dt>Ce qui vous attire</dt>
                <dd>{reponses.centres_interet}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{TYPES.find((t) => t.valeur === reponses.type_souhaite)!.titre}</dd>
              </div>
              <div>
                <dt>Budget</dt>
                <dd>{formaterMontant(reponses.budget_max_fcfa)}</dd>
              </div>
            </dl>
            <button type="button" className="lien-texte" onClick={() => setResultat(null)}>
              Modifier mes réponses
            </button>
          </aside>

          <section className="essai-compte" aria-labelledby="titre-compte">
            <div>
              <h2 id="titre-compte">Avec un compte gratuit, vous obtenez :</h2>
              <ul>
                <li>vos cinq formations recommandées, avec leur description</li>
                <li>la possibilité de dire si chaque proposition vous convient</li>
                <li>vos réponses enregistrées et modifiables à tout moment</li>
              </ul>
              <div className="essai-compte__action">
                {utilisateur ? (
                  <Link to="/questionnaire" className="bouton bouton--secondaire">
                    Remplir le questionnaire complet
                  </Link>
                ) : (
                  <Link to="/inscription" className="bouton bouton--secondaire">
                    Créer mon compte et voir les 5 formations
                  </Link>
                )}
                <p>Vos réponses seront reprises automatiquement.</p>
              </div>
            </div>
            <img src="/illustrations/compte.svg" alt="" className="essai-compte__image" />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="conteneur questionnaire essai">
      <div className="questionnaire__intro">
        <nav className="fil-ariane" aria-label="Fil d'Ariane">
          <Link to="/">Accueil</Link> / <span aria-current="page">Essai</span>
        </nav>
        <h1>Essayez sans compte</h1>
        <img src="/illustrations/questionnaire.svg" alt="" className="essai__image" />
        <p className="questionnaire__chapo">
          Trois questions suffisent pour voir les trois formations les plus proches de vous. Rien
          n'est enregistré tant que vous ne créez pas de compte.
        </p>
        <p className="questionnaire__note">
          Le questionnaire complet (six questions) affine le résultat et donne cinq formations.
        </p>
      </div>

      <form className="questionnaire__carte" onSubmit={envoyer} noValidate>
        {erreur && (
          <div className="alerte" role="alert">
            <p className="alerte__titre">L'aperçu n'a pas pu être calculé</p>
            <p>{erreur}</p>
          </div>
        )}

        <div className="champ">
          <label htmlFor="centres_interet" className="essai__question">
            <span className="questionnaire__numero">1.</span> Qu'aimeriez-vous apprendre ou faire ?
          </label>
          <textarea
            className="champ__saisie"
            rows={3}
            maxLength={1000}
            placeholder="Ex. : créer des sites internet, programmer"
            value={saisie.centres_interet}
            onChange={(e) => modifier("centres_interet", e.target.value)}
            {...aria("centres_interet", "centres_interet-aide")}
          />
          {messageSous("centres_interet") ?? (
            <p id="centres_interet-aide" className="champ__aide">
              Un métier, un outil, un domaine… Exemple : secrétariat, Excel, réseaux.
            </p>
          )}
        </div>

        <fieldset
          className="choix"
          id="type_souhaite"
          tabIndex={-1}
          aria-invalid={problemes.type_souhaite ? true : undefined}
          aria-describedby={problemes.type_souhaite ? "type_souhaite-erreur" : undefined}
        >
          <legend className="essai__question">
            <span className="questionnaire__numero">2.</span> Quel format vous convient ?
          </legend>
          {TYPES.map((type) => (
            <label key={type.valeur} className="choix__option">
              <input
                type="radio"
                name="type_souhaite"
                value={type.valeur}
                checked={saisie.type_souhaite === type.valeur}
                onChange={() => modifier("type_souhaite", type.valeur)}
              />
              <span>
                <strong>{type.titre}</strong>
                <span className="choix__detail">{type.detail}</span>
              </span>
            </label>
          ))}
          {messageSous("type_souhaite")}
        </fieldset>

        <div className="champ questionnaire__budget">
          <label htmlFor="budget" className="essai__question">
            <span className="questionnaire__numero">3.</span> Quel est votre budget maximum ?
            <span className="visuellement-masque"> (FCFA)</span>
          </label>
          <input
            className="champ__saisie"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex. : 150 000"
            value={saisie.budget}
            onChange={(e) => modifier("budget", e.target.value)}
            onBlur={() => {
              const montant = lireMontant(saisie.budget);
              if (montant !== null) modifier("budget", formaterNombre(montant));
            }}
            {...aria("budget", "budget-aide")}
          />
          {messageSous("budget") ?? (
            <p id="budget-aide" className="champ__aide">
              En FCFA. Seules les formations à ce prix ou moins vous seront proposées.
            </p>
          )}
        </div>

        <div className="questionnaire__actions">
          <p className="questionnaire__obligatoire">Aucune donnée enregistrée.</p>
          <button type="submit" className="bouton" disabled={envoi}>
            {envoi ? "Calcul en cours…" : "Voir l'aperçu"}
          </button>
        </div>
      </form>
    </main>
  );
}
