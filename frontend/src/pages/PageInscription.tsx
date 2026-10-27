import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { appelApi, ErreurApi } from "../api/client";
import type { Connexion, Inscription, ReponseConnexion, Utilisateur } from "../api/types";
import { destinationApresConnexion, type EtatConnexion } from "../auth/redirection";
import { messageErreur, useConnexionGoogle, useOuvrirSession } from "../auth/useConnexion";
import { useAuth } from "../auth/useAuth";
import { MiseEnPageCompte } from "../components/MiseEnPageCompte";

const EMAIL_DEJA_UTILISE =
  "Un compte existe déjà avec cette adresse. Connectez-vous ou utilisez une autre adresse.";
const MOT_DE_PASSE_TROP_COURT = "8 caractères minimum.";
const MOT_DE_PASSE_TROP_LONG = "72 octets maximum : raccourcissez votre mot de passe.";

/** Écrans 02 et 15 (RF-01, RF-13). */
export function PageInscription() {
  const { utilisateur, chargement } = useAuth();
  const location = useLocation();
  const ouvrirSession = useOuvrirSession();
  const google = useConnexionGoogle();
  const [envoi, setEnvoi] = useState(false);
  const [emailDejaUtilise, setEmailDejaUtilise] = useState(false);
  const [erreurMotDePasse, setErreurMotDePasse] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  if (chargement) return null;
  if (utilisateur) {
    const etat = location.state as EtatConnexion | null;
    return <Navigate to={destinationApresConnexion(utilisateur, etat)} replace />;
  }

  async function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const formulaire = new FormData(evenement.currentTarget);
    const corps: Inscription = {
      nom: String(formulaire.get("nom")).trim(),
      prenom: String(formulaire.get("prenom")).trim(),
      email: String(formulaire.get("email")).trim(),
      mot_de_passe: String(formulaire.get("mot_de_passe")),
    };
    setEmailDejaUtilise(false);
    setErreur(null);
    // Mêmes règles que l'API, qui reste seule juge : 8 caractères (et non unités UTF-16,
    // comme minLength) et 72 octets au plus, au-delà desquels bcrypt tronquerait.
    const erreurMdp =
      [...corps.mot_de_passe].length < 8
        ? MOT_DE_PASSE_TROP_COURT
        : new TextEncoder().encode(corps.mot_de_passe).length > 72
          ? MOT_DE_PASSE_TROP_LONG
          : null;
    setErreurMotDePasse(erreurMdp);
    if (erreurMdp) return;

    setEnvoi(true);
    try {
      await appelApi<Utilisateur>("/auth/register", {
        method: "POST",
        body: JSON.stringify(corps),
      });
      // Compte créé : connexion directe, sans repasser par la page de connexion.
      const identifiants: Connexion = { email: corps.email, mot_de_passe: corps.mot_de_passe };
      const reponse = await appelApi<ReponseConnexion>("/auth/login", {
        method: "POST",
        body: JSON.stringify(identifiants),
      });
      await ouvrirSession(reponse.access_token);
    } catch (e) {
      if (e instanceof ErreurApi && e.statut === 409) setEmailDejaUtilise(true);
      else setErreur(messageErreur(e));
      setEnvoi(false);
    }
  }

  return (
    <MiseEnPageCompte
      titre="Créer un compte"
      sousTitre="Seules ces informations vous sont demandées."
      texteGoogle="signup_with"
      surJetonGoogle={google.surJeton}
      erreurGoogle={google.erreur}
      bascule={
        <>
          Déjà inscrit ?{" "}
          <Link to="/connexion" state={location.state}>
            Se connecter
          </Link>
        </>
      }
    >
      <form className="formulaire" onSubmit={soumettre}>
        {erreur && (
          <div className="alerte" role="alert">
            <p className="alerte__titre">{erreur}</p>
          </div>
        )}
        <div className="formulaire__ligne">
          <div className="champ">
            <label htmlFor="nom">Nom</label>
            <input id="nom" name="nom" autoComplete="family-name" required maxLength={100} />
          </div>
          <div className="champ">
            <label htmlFor="prenom">Prénom</label>
            <input id="prenom" name="prenom" autoComplete="given-name" required maxLength={100} />
          </div>
        </div>
        <div className="champ">
          <label htmlFor="email">Adresse email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            aria-invalid={emailDejaUtilise || undefined}
            aria-describedby={emailDejaUtilise ? "email-erreur" : undefined}
          />
          {emailDejaUtilise && (
            <p id="email-erreur" className="champ__erreur" role="alert">
              {EMAIL_DEJA_UTILISE}
            </p>
          )}
        </div>
        <div className="champ">
          <label htmlFor="mot_de_passe">Mot de passe</label>
          <input
            id="mot_de_passe"
            name="mot_de_passe"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={erreurMotDePasse !== null || undefined}
            aria-describedby="mot-de-passe-aide"
          />
          {erreurMotDePasse ? (
            <p id="mot-de-passe-aide" className="champ__erreur" role="alert">
              {erreurMotDePasse}
            </p>
          ) : (
            <p id="mot-de-passe-aide" className="champ__aide">
              8 caractères minimum.
            </p>
          )}
        </div>
        <button type="submit" className="bouton" disabled={envoi}>
          {envoi ? "Création du compte…" : "Créer mon compte"}
        </button>
      </form>
    </MiseEnPageCompte>
  );
}
