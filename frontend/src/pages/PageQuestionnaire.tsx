// Questionnaire de l'apprenant (RF-06, RF-07) : maquettes 05, 13 (erreurs) et M2 (mobile).
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErreurApi } from "../api/client";
import { lireProfil, soumettreProfil } from "../api/profil";
import type { TypeFormation } from "../api/types";
import { messageErreur } from "../auth/useConnexion";
import { Photo } from "../components/Photo";
import { lireEssai, oublierEssai } from "../essai/memoire";
import {
  CHAMPS,
  controler,
  formaterNombre,
  lireMontant,
  NIVEAUX_ETUDES,
  SAISIE_VIDE,
  versProfil,
  versSaisie,
  type Champ,
  type Probleme,
  type Saisie,
} from "../questionnaire/reponses";

const TYPES: { valeur: TypeFormation; titre: string; detail: string }[] = [
  {
    valeur: "carte",
    titre: "Formation courte, à la carte",
    detail: "De 1 jour à 3 mois : un outil ou une compétence précise.",
  },
  {
    valeur: "modulaire",
    titre: "Parcours modulaire certifiant",
    detail: "De 2 à 9 mois : un métier complet.",
  },
];

const NOMBRES = ["Une", "Deux", "Trois", "Quatre", "Cinq", "Six"];

export function PageQuestionnaire() {
  const navigate = useNavigate();
  const recapitulatif = useRef<HTMLDivElement>(null);
  const [saisie, setSaisie] = useState<Saisie>(SAISIE_VIDE);
  // Les réponses déjà enregistrées pré-remplissent la page (RF-07) ; 404 = premier passage.
  const [chargement, setChargement] = useState(true);
  const [aUnProfil, setAUnProfil] = useState(false);
  const [repriseEssai, setRepriseEssai] = useState(false);
  const [problemes, setProblemes] = useState<Partial<Record<Champ, Probleme>>>({});
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    document.title = "Mon questionnaire — HIT-T Institute";
  }, []);

  useEffect(() => {
    let actif = true;
    lireProfil()
      .then(({ profil }) => {
        if (!actif) return;
        setSaisie(versSaisie(profil));
        setAUnProfil(true);
      })
      .catch((e: unknown) => {
        // Sans profil, le questionnaire part vide ou reprend l'essai sans compte (RF-12) ;
        // une autre erreur est signalée sans bloquer.
        if (!actif) return;
        if (!(e instanceof ErreurApi && e.statut === 404)) {
          setErreurChargement(messageErreur(e));
          return;
        }
        const essai = lireEssai();
        if (essai) {
          setSaisie({
            ...SAISIE_VIDE,
            centres_interet: essai.centres_interet,
            type_souhaite: essai.type_souhaite,
            budget: formaterNombre(essai.budget_max_fcfa),
          });
          setRepriseEssai(true);
        }
      })
      .finally(() => actif && setChargement(false));
    return () => {
      actif = false;
    };
  }, []);

  const nbProblemes = Object.keys(problemes).length;
  useEffect(() => {
    if (nbProblemes > 0) recapitulatif.current?.focus();
  }, [nbProblemes, problemes]);

  function modifier(champ: Champ, valeur: string) {
    setSaisie((s) => ({ ...s, [champ]: valeur }));
    // L'erreur d'un champ disparaît dès qu'il est corrigé, sans attendre un nouvel envoi.
    if (problemes[champ] && !controler({ ...saisie, [champ]: valeur })[champ]) {
      setProblemes((actuels) => {
        const restants = { ...actuels };
        delete restants[champ];
        return restants;
      });
    }
  }

  async function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);
    const trouves = controler(saisie);
    setProblemes(trouves);
    if (Object.keys(trouves).length > 0) return;

    setEnvoi(true);
    try {
      const resultat = await soumettreProfil(versProfil(saisie));
      oublierEssai();
      navigate("/recommandations", { state: { resultat } });
    } catch (e) {
      setErreur(messageErreur(e));
      setEnvoi(false);
    }
  }

  // Attributs communs : état d'erreur et message relié au champ pour les lecteurs d'écran.
  function aria(champ: Champ, aide?: string) {
    const ids = [problemes[champ] && `${champ}-erreur`, aide].filter(Boolean).join(" ");
    return {
      id: champ,
      "aria-invalid": problemes[champ] ? true : undefined,
      "aria-describedby": ids || undefined,
    };
  }

  function messageSous(champ: Champ): ReactNode {
    const probleme = problemes[champ];
    return probleme ? (
      <p id={`${champ}-erreur`} className="champ__erreur">
        {probleme.message}
      </p>
    ) : null;
  }

  const libelle = (champ: Champ) => CHAMPS.find((c) => c.champ === champ)!.libelle;

  return (
    <main className="conteneur questionnaire">
      <div className="questionnaire__intro">
        <nav className="fil-ariane" aria-label="Fil d'Ariane">
          Espace apprenant / <span aria-current="page">Questionnaire</span>
        </nav>
        <h1>Votre profil</h1>
        <p className="questionnaire__chapo">
          Six questions, environ deux minutes.
          <span className="questionnaire__chapo-suite">
            {" "}
            Vos réponses servent uniquement à calculer vos recommandations ; vous pourrez les
            modifier à tout moment.
          </span>
        </p>
        <p className="questionnaire__note">
          Seuls les champs de ce questionnaire et de votre compte sont enregistrés.
        </p>
        <Photo nom="groupe" className="questionnaire__photo" tailles="340px" />
      </div>

      {chargement ? (
        <p className="questionnaire__carte" role="status">
          Chargement de vos réponses…
        </p>
      ) : (
        <form className="questionnaire__carte" onSubmit={soumettre} noValidate>
          {repriseEssai && (
            <p className="questionnaire__reprise" role="status">
              Vos réponses de l'essai sans compte sont reprises : complétez les trois autres
              questions.
            </p>
          )}
          {erreurChargement && (
            <div className="alerte" role="alert">
              <p className="alerte__titre">Vos réponses précédentes n'ont pas pu être chargées</p>
              <p>{erreurChargement} Vous pouvez remplir le questionnaire à nouveau.</p>
            </div>
          )}
          {nbProblemes > 0 && (
            <div className="alerte" role="alert" tabIndex={-1} ref={recapitulatif}>
              <p className="alerte__titre">
                {nbProblemes === 1
                  ? "Une réponse est à corriger"
                  : `${NOMBRES[nbProblemes - 1]} réponses sont à corriger`}
              </p>
              {CHAMPS.filter(({ champ }) => problemes[champ]).map(({ champ, libelle }) => (
                <p key={champ}>
                  <a href={`#${champ}`}>{libelle}</a> : {problemes[champ]!.resume}
                </p>
              ))}
            </div>
          )}
          {erreur && (
            <div className="alerte" role="alert">
              <p className="alerte__titre">Vos réponses n'ont pas pu être envoyées</p>
              <p>{erreur}</p>
            </div>
          )}

          <fieldset className="questionnaire__bloc">
            <legend>
              <span className="questionnaire__numero">1.</span> Votre parcours
            </legend>
            <div className="formulaire__ligne">
              <div className="champ">
                <label htmlFor="niveau_etudes">{libelle("niveau_etudes")}</label>
                <select
                  className="champ__saisie"
                  value={saisie.niveau_etudes}
                  onChange={(e) => modifier("niveau_etudes", e.target.value)}
                  {...aria("niveau_etudes")}
                >
                  <option value="" disabled>
                    Choisissez…
                  </option>
                  {NIVEAUX_ETUDES.map((niveau) => (
                    <option key={niveau} value={niveau}>
                      {niveau}
                    </option>
                  ))}
                </select>
                {messageSous("niveau_etudes")}
              </div>
              <div className="champ">
                <label htmlFor="objectif_professionnel">{libelle("objectif_professionnel")}</label>
                <input
                  className="champ__saisie"
                  maxLength={1000}
                  placeholder="Ex. : devenir développeur web"
                  value={saisie.objectif_professionnel}
                  onChange={(e) => modifier("objectif_professionnel", e.target.value)}
                  {...aria("objectif_professionnel")}
                />
                {messageSous("objectif_professionnel")}
              </div>
            </div>
            <div className="champ">
              <label htmlFor="competences">{libelle("competences")}</label>
              <textarea
                className="champ__saisie"
                rows={3}
                maxLength={1000}
                placeholder="Ex. : Word, Excel, bases d'Internet"
                value={saisie.competences}
                onChange={(e) => modifier("competences", e.target.value)}
                {...aria("competences", "competences-aide")}
              />
              {messageSous("competences") ?? (
                <p id="competences-aide" className="champ__aide">
                  Ce que vous savez déjà faire, séparé par des virgules.
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="questionnaire__bloc">
            <legend>
              <span className="questionnaire__numero">2.</span> Vos centres d'intérêt
            </legend>
            <div className="champ">
              <label htmlFor="centres_interet">{libelle("centres_interet")}</label>
              <textarea
                className="champ__saisie"
                rows={3}
                maxLength={1000}
                placeholder="Ex. : programmation, développement web, sites internet"
                value={saisie.centres_interet}
                onChange={(e) => modifier("centres_interet", e.target.value)}
                {...aria("centres_interet")}
              />
              {messageSous("centres_interet")}
            </div>
          </fieldset>

          <fieldset className="questionnaire__bloc">
            <legend>
              <span className="questionnaire__numero">3.</span> Vos contraintes
            </legend>
            <fieldset
              className="choix"
              id="type_souhaite"
              tabIndex={-1}
              aria-invalid={problemes.type_souhaite ? true : undefined}
              aria-describedby={problemes.type_souhaite ? "type_souhaite-erreur" : undefined}
            >
              <legend className="champ__libelle">{libelle("type_souhaite")}</legend>
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
              <label htmlFor="budget">{libelle("budget")} (FCFA)</label>
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
                  Seules les formations à ce prix ou moins vous seront proposées.
                </p>
              )}
            </div>
          </fieldset>

          <div className="questionnaire__actions">
            <p className="questionnaire__obligatoire">Toutes les questions sont obligatoires.</p>
            <Link
              to={aUnProfil ? "/recommandations" : "/formations"}
              className="questionnaire__annuler"
            >
              Annuler
            </Link>
            <button type="submit" className="bouton" disabled={envoi}>
              {envoi ? "Calcul en cours…" : "Voir mes recommandations"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
