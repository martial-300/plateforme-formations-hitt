// Catalogue public (RF-05) : GET /formations et GET /formations/{id}.
import { appelApi } from "./client";
import type { FiltresFormations, Formation } from "./types";

export function listerFormations(filtres: FiltresFormations = {}): Promise<Formation[]> {
  const parametres = new URLSearchParams();
  if (filtres.domaine) parametres.set("domaine", filtres.domaine);
  if (filtres.type) parametres.set("type", filtres.type);
  const requete = parametres.toString();
  return appelApi<Formation[]>(`/formations${requete ? `?${requete}` : ""}`);
}

export function lireFormation(id: string): Promise<Formation> {
  return appelApi<Formation>(`/formations/${encodeURIComponent(id)}`);
}
