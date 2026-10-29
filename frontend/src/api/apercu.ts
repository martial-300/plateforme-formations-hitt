// Aperçu visiteur (RF-12) : POST /recommandations/apercu, public, rien n'est enregistré.
import { appelApi } from "./client";
import type { ApercuEntree, ReponseApercu } from "./types";

export function demanderApercu(reponses: ApercuEntree): Promise<ReponseApercu> {
  return appelApi<ReponseApercu>("/recommandations/apercu", {
    method: "POST",
    body: JSON.stringify(reponses),
  });
}
