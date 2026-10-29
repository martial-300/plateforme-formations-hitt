// Catalogue public (RF-05) : GET /formations et GET /formations/{id}.
import { appelApi } from "./client";
import type { FiltresFormations, Formation, FormationEntree } from "./types";

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

// Gestion du catalogue par l'administrateur (RF-04).

export function creerFormation(formation: FormationEntree): Promise<Formation> {
  return appelApi<Formation>("/formations", { method: "POST", body: JSON.stringify(formation) });
}

export function modifierFormation(id: string, formation: FormationEntree): Promise<Formation> {
  return appelApi<Formation>(`/formations/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(formation),
  });
}

export function supprimerFormation(id: string): Promise<void> {
  return appelApi<void>(`/formations/${encodeURIComponent(id)}`, { method: "DELETE" });
}
