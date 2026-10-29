// Tableau de bord de l'administrateur (RF-11) : GET /admin/statistiques.
import { appelApi } from "./client";
import type { Statistiques } from "./types";

export function lireStatistiques(): Promise<Statistiques> {
  return appelApi<Statistiques>("/admin/statistiques");
}
