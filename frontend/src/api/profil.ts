// Questionnaire de l'apprenant (RF-06, RF-07) : PUT /profil.
import { appelApi } from "./client";
import type { ProfilEntree, ProfilEtRecommandations } from "./types";

export function soumettreProfil(reponses: ProfilEntree): Promise<ProfilEtRecommandations> {
  return appelApi<ProfilEtRecommandations>("/profil", {
    method: "PUT",
    body: JSON.stringify(reponses),
  });
}
