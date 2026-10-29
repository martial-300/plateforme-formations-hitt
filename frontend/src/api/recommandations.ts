// Retour de l'apprenant sur une recommandation (RF-10) : POST /recommandations/{id}/retour.
import { appelApi } from "./client";
import type { Recommandation, RetourDonne } from "./types";

export function donnerRetour(id: string, retour: RetourDonne): Promise<Recommandation> {
  return appelApi<Recommandation>(`/recommandations/${encodeURIComponent(id)}/retour`, {
    method: "POST",
    body: JSON.stringify({ retour }),
  });
}
