import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { appelApi, ErreurApi } from "../api/client";
import type { Connexion, ReponseConnexion } from "../api/types";
import { destinationApresConnexion, type EtatConnexion } from "../auth/redirection";
import { messageErreur, useConnexionGoogle, useOuvrirSession } from "../auth/useConnexion";
import { useAuth } from "../auth/useAuth";
import { MiseEnPageCompte } from "../components/MiseEnPageCompte";

/** Écrans 01, 14 et M5 (RF-02, RF-13). */
export function PageConnexion() {
  const { utilisateur, chargement } = useAuth();
  const location = useLocation();
  const ouvrirSession = useOuvrirSession();
  const google = useConnexionGoogle();
  const [envoi, setEnvoi] = useState(false);
  const [identifiantsRefuses, setIdentifiantsRefuses] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  if (chargement) return null;
  if (utilisateur) {
    const etat = location.state as EtatConnexion | null;
    return <Navigate to={destinationApresConnexion(utilisateur, etat)} replace />;
  }

  async function soumettre(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const formulaire = new FormData(evenement.currentTarget);
    const corps: Connexion = {
      email: String(formulaire.get("email")),
      mot_de_passe: String(formulaire.get("mot_de_passe")),
    };
    setEnvoi(true);
    setIdentifiantsRefuses(false);
    setErreur(null);
    try {
      const reponse = await appelApi<ReponseConnexion>("/auth/login", {
        method: "POST",
        body: JSON.stringify(corps),
      });
      await ouvrirSession(reponse.access_token);
    } catch (e) {
      if (e instanceof ErreurApi && e.statut === 401) setIdentifiantsRefuses(true);
      else setErreur(messageErreur(e));
      setEnvoi(false);
    }
  }

  return (
    <MiseEnPageCompte
      titre="Connexion"
      sousTitre="Accédez à votre questionnaire et à vos recommandations."
      texteGoogle="continue_with"
      surJetonGoogle={google.surJeton}
      erreurGoogle={google.erreur}
      bascule={
        <>
          Pas encore de compte ?{" "}
          <Link to="/inscription" state={location.state}>
            Créer un compte
          </Link>
        </>
      }
    >
      <form className="formulaire" onSubmit={soumettre}>
        {identifiantsRefuses && (
          <div className="alerte" role="alert">
            <p className="alerte__titre">Email ou mot de passe incorrect</p>
            <p>Vérifiez votre saisie. Si vous n&apos;avez pas encore de compte, créez-en un.</p>
          </div>
        )}
        {erreur && (
          <div className="alerte" role="alert">
            <p className="alerte__titre">{erreur}</p>
          </div>
        )}
        <div className="champ">
          <label htmlFor="email">Adresse email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="champ">
          <label htmlFor="mot_de_passe">Mot de passe</label>
          <input
            id="mot_de_passe"
            name="mot_de_passe"
            type="password"
            autoComplete="current-password"
            required
            maxLength={200}
            aria-invalid={identifiantsRefuses || undefined}
          />
        </div>
        <button type="submit" className="bouton" disabled={envoi}>
          {envoi ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </MiseEnPageCompte>
  );
}
