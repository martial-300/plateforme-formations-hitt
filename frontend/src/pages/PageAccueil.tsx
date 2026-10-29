import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { demanderApercu } from "../api/apercu";
import type { ApercuEntree, RecommandationApercu } from "../api/types";
import { formaterMontant } from "../catalogue/libelles";
import { ListeApercu } from "../components/ListeApercu";

// Chiffres du catalogue validé (database/02_catalogue_hitt.sql) ; à lire depuis l'API
// une fois GET /formations disponible.
const DOMAINES = [
  {
    code: "SISG",
    surtitre: "SISG",
    nom: "Secrétariat et Gestion",
    carte: 14,
    modulaires: 17,
    exemples: [
      "Office Excel (débutant à avancé)",
      "Secrétariat-Bureautique",
      "Ressources humaines",
    ],
  },
  {
    code: "IA-Data",
    surtitre: "IA · Data",
    nom: "IA, Data science et Blockchain",
    carte: 21,
    modulaires: 3,
    exemples: [
      "Langage Python et l'IA",
      "Analyse des données (Power BI)",
      "Analyste développeur des systèmes IA",
    ],
  },
  {
    code: "TRIT",
    surtitre: "TRIT",
    nom: "Informatique et Télécoms",
    carte: 19,
    modulaires: 12,
    exemples: ["Développement de site web", "Maintenance informatique", "Réseau et Cybersécurité"],
  },
];

const ETAPES = [
  ["Créez votre compte", "Nom, prénom, adresse email et mot de passe."],
  [
    "Remplissez le questionnaire",
    "Parcours, compétences, centres d'intérêt, objectif, format et budget.",
  ],
  [
    "Consultez vos cinq formations",
    "Classées, avec les mots qui les relient à votre profil. Donnez votre avis sur chacune.",
  ],
] as const;

// Profil fictif de l'exemple (RF-12) : ses formations sont calculées par le vrai moteur, via
// l'aperçu, pour que l'exemple reste juste quand le catalogue ou le moteur change.
const EXEMPLE: ApercuEntree = {
  centres_interet: "Développement web, sites web, programmation",
  type_souhaite: "carte",
  budget_max_fcfa: 150000,
};

const TOTAL = DOMAINES.reduce((total, d) => total + d.carte + d.modulaires, 0);

/** Exemple de l'écran 09 ; rien n'est affiché si l'aperçu échoue (API injoignable, 429). */
function ExempleAfi() {
  const [recommandations, setRecommandations] = useState<RecommandationApercu[] | null>(null);

  useEffect(() => {
    let actif = true;
    demanderApercu(EXEMPLE)
      .then((reponse) => actif && setRecommandations(reponse.recommandations))
      .catch(() => {});
    return () => {
      actif = false;
    };
  }, []);

  if (!recommandations || recommandations.length === 0) return null;
  return (
    <section className="conteneur accueil__section" aria-labelledby="titre-exemple">
      <p className="surtitre">Exemple</p>
      <h2 id="titre-exemple">Ce que la plateforme propose à Afi</h2>
      <p className="exemple__note">
        Afi est un profil fictif, donné pour illustrer le fonctionnement.
      </p>
      <div className="exemple">
        <div className="exemple__reponses">
          <h3>Ses réponses</h3>
          <dl>
            <div>
              <dt>Ce qui l&apos;attire</dt>
              <dd>{EXEMPLE.centres_interet}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>Formation courte, à la carte</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>{formaterMontant(EXEMPLE.budget_max_fcfa)} au maximum</dd>
            </div>
          </dl>
        </div>
        <div className="exemple__resultat">
          <h3>Ses {recommandations.length === 3 ? "trois " : ""}premières formations</h3>
          <ListeApercu recommandations={recommandations} />
          <div className="exemple__action">
            <Link to="/essai" className="bouton">
              Essayer avec mon profil
            </Link>
            <p>Sans compte, en trois questions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Écran 09 (RF-05, RF-12). */
export function PageAccueil() {
  return (
    <main className="accueil">
      <section className="conteneur accueil__entree">
        <div>
          <p className="surtitre">HIT-T Institute · Orientation</p>
          <h1>Choisissez votre formation en connaissance de cause</h1>
          <p className="accueil__texte">
            Secrétariat et gestion, intelligence artificielle et data, informatique et télécoms :
            répondez à six questions, la plateforme vous indique automatiquement les formations qui
            vous correspondent.
          </p>
          <div className="accueil__boutons">
            <Link to="/questionnaire" className="bouton">
              Commencer le questionnaire
            </Link>
            <Link to="/formations" className="bouton bouton--secondaire">
              Voir le catalogue
            </Link>
          </div>
        </div>
        <dl className="chiffres">
          <div>
            <dt>{TOTAL}</dt>
            <dd>formations au catalogue</dd>
          </div>
          <div>
            <dt>{DOMAINES.length}</dt>
            <dd>domaines : SISG, IA et Data, TRIT</dd>
          </div>
          <div>
            <dt>2</dt>
            <dd>
              formats : à la carte (1 jour à 3 mois) ou parcours modulaire certifiant (2 à 9 mois)
            </dd>
          </div>
        </dl>
      </section>

      <section className="conteneur accueil__section" aria-labelledby="titre-domaines">
        <h2 id="titre-domaines">Trois domaines de formation</h2>
        <ul className="domaines">
          {DOMAINES.map((domaine) => (
            <li key={domaine.code} className="domaine">
              <p className="surtitre">{domaine.surtitre}</p>
              <h3>{domaine.nom}</h3>
              <p className="domaine__compte">
                {domaine.carte} à la carte · {domaine.modulaires} parcours modulaires
              </p>
              <ul className="domaine__exemples">
                {domaine.exemples.map((exemple) => (
                  <li key={exemple}>{exemple}</li>
                ))}
              </ul>
              <Link to={`/formations?domaine=${domaine.code}`}>
                Voir les {domaine.carte + domaine.modulaires} formations
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ExempleAfi />

      <section
        className="conteneur accueil__section fonctionnement"
        aria-labelledby="titre-fonctionnement"
      >
        <div>
          <img src="/illustrations/parcours.svg" alt="" className="fonctionnement__image" />
          <h2 id="titre-fonctionnement">Comment fonctionne l&apos;orientation</h2>
          <p className="accueil__texte">
            Le classement est automatique : il compare les mots de vos réponses à ceux de chaque
            formation et ne retient que le format choisi et les formations dans votre budget. Vos
            avis servent à l&apos;améliorer.
          </p>
        </div>
        <ol className="etapes">
          {ETAPES.map(([etape, detail]) => (
            <li key={etape}>
              <strong>{etape}</strong>
              <span>{detail}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
