import type { Location } from "react-router-dom";
import type { Utilisateur } from "../api/types";

/** État posé par RouteProtegee quand elle renvoie vers /connexion. */
export interface EtatConnexion {
  depuis?: Location;
}

/** Page demandée avant la connexion, sinon la page d'accueil du rôle. */
export function destinationApresConnexion(
  utilisateur: Utilisateur,
  etat: EtatConnexion | null,
): string {
  const depuis = etat?.depuis;
  // Chemin interne uniquement : « //hote » serait une adresse vers un autre site.
  const interne = depuis?.pathname.startsWith("/") && !depuis.pathname.startsWith("//");
  if (depuis && interne && depuis.pathname !== "/connexion" && depuis.pathname !== "/inscription") {
    return `${depuis.pathname}${depuis.search}${depuis.hash}`;
  }
  return utilisateur.role === "administrateur" ? "/admin" : "/questionnaire";
}
