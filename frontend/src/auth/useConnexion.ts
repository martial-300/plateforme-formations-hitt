import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { appelApi, ErreurApi } from "../api/client";
import type { ConnexionGoogle, ReponseConnexionGoogle } from "../api/types";
import { destinationApresConnexion, type EtatConnexion } from "./redirection";
import { useAuth } from "./useAuth";

export const ERREUR_RESEAU =
  "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.";

/** Message à afficher pour une erreur d'appel à l'API. */
export function messageErreur(erreur: unknown): string {
  return erreur instanceof ErreurApi ? erreur.message : ERREUR_RESEAU;
}

/** Enregistre le jeton reçu de l'API puis renvoie vers la page demandée (ou celle du rôle). */
export function useOuvrirSession() {
  const { connecter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    async (accessToken: string) => {
      const utilisateur = await connecter(accessToken);
      if (!utilisateur) throw new Error(ERREUR_RESEAU);
      navigate(destinationApresConnexion(utilisateur, location.state as EtatConnexion | null), {
        replace: true,
      });
    },
    [connecter, navigate, location.state],
  );
}

/** Connexion avec Google (RF-13) : l'id_token reçu de Google est vérifié par l'API. */
export function useConnexionGoogle() {
  const ouvrirSession = useOuvrirSession();
  const [erreur, setErreur] = useState<string | null>(null);

  const surJeton = useCallback(
    async (idToken: string) => {
      setErreur(null);
      try {
        const corps: ConnexionGoogle = { id_token: idToken };
        const reponse = await appelApi<ReponseConnexionGoogle>("/auth/google", {
          method: "POST",
          body: JSON.stringify(corps),
        });
        await ouvrirSession(reponse.access_token);
      } catch (e) {
        setErreur(messageErreur(e));
      }
    },
    [ouvrirSession],
  );

  return { surJeton, erreur };
}
