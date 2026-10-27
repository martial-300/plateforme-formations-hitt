// Détail d'une formation (RF-05) : maquettes 04 (à la carte), 11 (parcours modulaire) et M4.
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ErreurApi } from "../api/client";
import { lireFormation } from "../api/formations";
import type { Formation } from "../api/types";
import { useAuth } from "../auth/useAuth";
import { Prix } from "../catalogue/Prix";
import {
  DOMAINE_COMPLET,
  DOMAINE_COURT,
  formaterDuree,
  NIVEAU_ADMISSION,
  TYPE_COMPLET,
} from "../catalogue/libelles";

type Etat =
  | { statut: "chargement" }
  | { statut: "introuvable" }
  | { statut: "erreur"; message: string }
  | { statut: "pret"; formation: Formation };

export function PageDetailFormation() {
  const { id = "" } = useParams();
  const location = useLocation();
  const { utilisateur } = useAuth();
  const [etat, setEtat] = useState<Etat & { id: string }>({ statut: "chargement", id });
  const [essai, setEssai] = useState(0);

  // Venu du catalogue : le retour garde l'onglet, le filtre et la page.
  const recherche = (location.state as { catalogue?: string } | null)?.catalogue ?? "";
  const retour = `/${recherche}`;

  useEffect(() => {
    let actif = true;
    lireFormation(id)
      .then((formation) => actif && setEtat({ statut: "pret", formation, id }))
      .catch((erreur: Error) => {
        if (!actif) return;
        // 422 : l'id n'est pas un UUID ; pour le visiteur, c'est aussi une formation introuvable.
        if (erreur instanceof ErreurApi && [404, 422].includes(erreur.statut)) {
          setEtat({ statut: "introuvable", id });
        } else {
          setEtat({ statut: "erreur", message: erreur.message, id });
        }
      });
    return () => {
      actif = false;
    };
  }, [id, essai]);

  // Un changement d'id affiche le chargement plutôt que la formation précédente.
  const courant: Etat = etat.id === id ? etat : { statut: "chargement" };

  const titre =
    courant.statut === "pret"
      ? courant.formation.intitule
      : courant.statut === "introuvable"
        ? "Formation introuvable"
        : null;
  useEffect(() => {
    if (titre) document.title = `${titre} — HIT-T Institute`;
  }, [titre]);

  if (courant.statut === "chargement") {
    return (
      <main className="conteneur detail">
        <p role="status">Chargement de la formation…</p>
      </main>
    );
  }

  if (courant.statut === "introuvable") {
    return (
      <main className="conteneur detail detail--vide">
        <img src="/illustrations/introuvable.svg" alt="" className="detail__illustration" />
        <h1>Formation introuvable</h1>
        <p>Cette formation n'existe pas ou a été retirée du catalogue.</p>
        <Link to={retour} className="bouton">
          Retour au catalogue
        </Link>
      </main>
    );
  }

  if (courant.statut === "erreur") {
    return (
      <main className="conteneur detail" role="alert">
        <p>La formation n'a pas pu être chargée : {courant.message}</p>
        <button
          type="button"
          className="bouton bouton--contour"
          onClick={() => {
            setEtat({ statut: "chargement", id });
            setEssai((n) => n + 1);
          }}
        >
          Réessayer
        </button>
      </main>
    );
  }

  const { formation } = courant;
  const modulaire = formation.type === "modulaire";

  return (
    <main className="conteneur detail">
      <Link to={retour} className="detail__retour-mobile">
        Retour au catalogue
      </Link>

      <div className="detail__grille">
        <div className="detail__contenu">
          <nav className="fil-ariane" aria-label="Fil d'Ariane">
            <Link to="/">Accueil</Link> / <Link to={retour}>Catalogue</Link> /{" "}
            <Link to={`/?domaine=${formation.domaine}`}>{DOMAINE_COURT[formation.domaine]}</Link>
          </nav>
          <p className="detail__sur-titre">
            <span className="sur-titre">{DOMAINE_COURT[formation.domaine]}</span>
            <span>{modulaire ? "Parcours modulaire certifiant" : "À la carte"}</span>
          </p>
          <h1>{formation.intitule}</h1>
          <p className="detail__description">{formation.description}</p>
        </div>

        <aside className="tarif">
          <h2 className="tarif__titre">Tarif</h2>
          <Prix formation={formation} grand />
          <p className="tarif__legende">
            {formation.cout_promo_fcfa !== null
              ? "Prix promotionnel"
              : modulaire
                ? "Prix du parcours complet"
                : "Prix de la formation"}
          </p>
          <p className="tarif__texte">
            Le paiement se fait auprès du cabinet.{" "}
            {utilisateur ? "Répondez" : "Créez un compte et répondez"} au questionnaire : la
            plateforme vous dira automatiquement si {modulaire ? "ce parcours" : "cette formation"}{" "}
            correspond à votre profil. Un conseiller du cabinet peut aussi vous aider.
          </p>
          <Link to="/questionnaire" className="bouton bouton--large">
            Obtenir mes recommandations
          </Link>
          <Link to={retour} className="tarif__retour">
            Retour au catalogue
          </Link>
        </aside>

        <div className="detail__infos">
          <h2>Informations pratiques</h2>
          <dl className="infos">
            <div>
              <dt>Domaine</dt>
              <dd>{DOMAINE_COMPLET[formation.domaine]}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{TYPE_COMPLET[formation.type]}</dd>
            </div>
            <div>
              <dt>Durée</dt>
              <dd>{formaterDuree(formation)}</dd>
            </div>
            <div>
              <dt>Niveau d'admission</dt>
              <dd>{NIVEAU_ADMISSION}</dd>
            </div>
          </dl>

          <h2>Mots-clés</h2>
          <ul className="mots-cles">
            {formation.mots_cles.map((mot) => (
              <li key={mot}>{mot}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
