// Questionnaire de l'apprenant (RF-06, RF-07) : GET et PUT /profil.
import { appelApi } from "./client";
import type { ProfilEntree, ProfilEtRecommandations } from "./types";

/** Dernières réponses et recommandations enregistrées ; ErreurApi 404 si aucun profil. */
export function lireProfil(): Promise<ProfilEtRecommandations> {
  return appelApi<ProfilEtRecommandations>("/profil");
}

export function soumettreProfil(reponses: ProfilEntree): Promise<ProfilEtRecommandations> {
  return appelApi<ProfilEtRecommandations>("/profil", {
    method: "PUT",
    body: JSON.stringify(reponses),
  });
}
