// Mes recommandations (RF-08 à RF-10) : maquettes 06, M3 et 12 (aucune recommandation).
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ErreurApi } from "../api/client";
import { lireProfil } from "../api/profil";
import type { Profil, ProfilEtRecommandations, Recommandation } from "../api/types";
import { DOMAINE_COURT, formaterDuree, formaterMontant, TYPE_COURT } from "../catalogue/libelles";
import { Correspondance } from "../components/Correspondance";
import { AucuneRecommandation } from "../recommandations/AucuneRecommandation";
import { AvisRecommandation } from "../recommandations/AvisRecommandation";
import {
  lireEtat,
  type EtatApresQuestionnaire,
  type EtatDepuisRecommandations,
} from "../recommandations/navigation";

type Etat =
  | { statut: "chargement" }
  | { statut: "sans-profil" }
  | { statut: "erreur"; message: string }
  | { statut: "pret"; resultat: ProfilEtRecommandations };

const NOMBRES = [
  "",
  "Votre formation recommandée",
  "Vos deux",
  "Vos trois",
  "Vos quatre",
  "Vos cinq",
];

const TYPE_SOUHAITE: Record<Profil["type_souhaite"], string> = {
  carte: "Formation courte, à la carte",
  modulaire: "Parcours modulaire certifiant",
};

function titre(nombre: number) {
  return nombre === 1 ? NOMBRES[1] : `${NOMBRES[nombre]} formations recommandées`;
}

function dateCalcul(profil: Profil) {
  return new Date(profil.date_maj).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PageRecommandations() {
  const location = useLocation();
  // Juste après le questionnaire, le résultat de PUT /profil s'affiche aussitôt ; GET /profil
  // est relu dans tous les cas (un rechargement de la page garderait sinon d'anciens avis).
  const transmis = lireEtat<EtatApresQuestionnaire>(location.state, "resultat")?.resultat;
  const [etat, setEtat] = useState<Etat>(() =>
    transmis ? { statut: "pret", resultat: transmis } : { statut: "chargement" },
  );
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    document.title = "Mes recommandations — HIT-T Institute";
  }, []);

  useEffect(() => {
    let actif = true;
    lireProfil()
      .then((resultat) => actif && setEtat({ statut: "pret", resultat }))
      .catch((e: unknown) => {
        if (!actif) return;
        if (e instanceof ErreurApi && e.statut === 404) setEtat({ statut: "sans-profil" });
        else setEtat({ statut: "erreur", message: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      actif = false;
    };
  }, [essai]);

  function remplacer(miseAJour: Recommandation) {
    setEtat((actuel) =>
      actuel.statut === "pret"
        ? {
            statut: "pret",
            resultat: {
              ...actuel.resultat,
              recommandations: actuel.resultat.recommandations.map((r) =>
                r.id === miseAJour.id ? miseAJour : r,
              ),
            },
          }
        : actuel,
    );
  }

  const filAriane = (
    <nav className="fil-ariane" aria-label="Fil d'Ariane">
      Espace apprenant / <span aria-current="page">Mes recommandations</span>
    </nav>
  );

  if (etat.statut === "chargement") {
    return (
      <main className="conteneur recommandations">
        <p role="status">Chargement de vos recommandations…</p>
      </main>
    );
  }

  if (etat.statut === "erreur") {
    return (
      <main className="conteneur recommandations">
        <div className="alerte" role="alert">
          <p className="alerte__titre">Vos recommandations n'ont pas pu être chargées</p>
          <p>{etat.message}</p>
        </div>
        <button
          type="button"
          className="bouton bouton--secondaire"
          onClick={() => {
            setEtat({ statut: "chargement" });
            setEssai((n) => n + 1);
          }}
        >
          Réessayer
        </button>
      </main>
    );
  }

  if (etat.statut === "sans-profil") {
    return (
      <main className="conteneur recommandations">
        {filAriane}
        <h1>Vos recommandations</h1>
        <section className="recommandations__vide">
          <img
            src="/illustrations/questionnaire.svg"
            alt=""
            className="recommandations__illustration"
          />
          <h2>Répondez d'abord au questionnaire</h2>
          <p>
            Six questions, environ deux minutes : la plateforme calcule ensuite automatiquement les
            cinq formations les plus proches de votre profil.
          </p>
          <Link to="/questionnaire" className="bouton">
            Répondre au questionnaire
          </Link>
        </section>
      </main>
    );
  }

  const { profil, recommandations } = etat.resultat;
  const total = recommandations.length;
  const budget = formaterMontant(profil.budget_max_fcfa);

  const resumeProfil = (
    <aside className="recommandations__profil" aria-label="Votre profil">
      <h2>{total === 0 ? "Vos réponses" : "Votre profil"}</h2>
      <dl>
        {total > 0 && (
          <div>
            <dt>Objectif</dt>
            <dd>{profil.objectif_professionnel}</dd>
          </div>
        )}
        <div>
          <dt>Type souhaité</dt>
          <dd>{TYPE_SOUHAITE[profil.type_souhaite]}</dd>
        </div>
        <div>
          <dt>Budget maximum</dt>
          <dd>{budget}</dd>
        </div>
      </dl>
      {total > 0 && (
        <Link to="/questionnaire" className="bouton bouton--secondaire bouton--large">
          Modifier mes réponses
        </Link>
      )}
    </aside>
  );

  if (total === 0) {
    return (
      <main className="conteneur recommandations">
        {filAriane}
        <h1>Vos recommandations</h1>
        <div className="recommandations__grille">
          <AucuneRecommandation profil={profil} />
          {resumeProfil}
        </div>
      </main>
    );
  }

  return (
    <main className="conteneur recommandations">
      {filAriane}
      <h1>{titre(total)}</h1>
      <p className="recommandations__chapo">
        <span className="seulement-ordinateur">
          Propositions calculées automatiquement le {dateCalcul(profil)} à partir de votre
          questionnaire, de la plus proche à la moins proche de votre profil. Un conseiller du
          cabinet peut vous aider à choisir.
        </span>
        <span className="seulement-mobile">
          Calculées automatiquement à partir de vos réponses. Un conseiller peut vous aider à
          choisir.
        </span>
      </p>

      <div className="recommandations__resume-mobile">
        <p>
          <strong>
            {TYPE_COURT[profil.type_souhaite]} · {budget} max.
          </strong>
          <span>Objectif : {profil.objectif_professionnel}</span>
        </p>
        <Link to="/questionnaire">Modifier</Link>
      </div>

      <div className="recommandations__grille">
        <ol className="recommandations__liste">
          {recommandations.map((recommandation, index) => {
            const { formation, mots_cles_communs, score } = recommandation;
            const rang = index + 1;
            const promo = formation.cout_promo_fcfa !== null;
            const etatLien: EtatDepuisRecommandations = {
              depuisRecommandations: { recommandation, rang, total, profil },
            };
            return (
              <li key={recommandation.id} className="carte-reco">
                <span className="carte-reco__rang" aria-hidden="true">
                  {rang}
                </span>
                <div className="carte-reco__texte">
                  <p className="carte-reco__sur-titre">
                    <span className="surtitre">{DOMAINE_COURT[formation.domaine]}</span>
                    <span>{TYPE_COURT[formation.type]}</span>
                  </p>
                  <h2>
                    <span className="visuellement-masque">{rang}. </span>
                    <Link to={`/formations/${formation.id}`} state={etatLien}>
                      {formation.intitule}
                    </Link>
                  </h2>
                  <p className="carte-reco__description">{formation.description}</p>
                  {mots_cles_communs.length > 0 && (
                    <>
                      <p className="carte-reco__legende">Mots en commun avec votre profil</p>
                      <ul className="mots-cles mots-cles--communs">
                        {mots_cles_communs.map((mot) => (
                          <li key={mot}>{mot}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <p className="carte-reco__infos">
                    {formaterDuree(formation)} ·{" "}
                    {formaterMontant(formation.cout_promo_fcfa ?? formation.cout_fcfa)}
                    {promo && (
                      <>
                        {" "}
                        (<span className="seulement-ordinateur">prix promotionnel</span>
                        <span className="seulement-mobile">promo</span>)
                      </>
                    )}
                  </p>
                </div>
                <div className="carte-reco__avis">
                  <p className="surtitre">Correspondance</p>
                  <Correspondance score={score} />
                  <AvisRecommandation recommandation={recommandation} surChangement={remplacer} />
                </div>
              </li>
            );
          })}
        </ol>

        <div className="recommandations__cote">
          {resumeProfil}
          <aside className="recommandations__aide" aria-label="Comment lire ces résultats">
            <h2>Comment lire ces résultats</h2>
            <p>
              La correspondance indique à quel point la formation reprend les mots de vos
              compétences, centres d'intérêt et objectif. Seules les formations du type choisi et
              dans votre budget sont proposées.
            </p>
            <p>Votre avis sur chaque formation aide le cabinet à améliorer les recommandations.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
