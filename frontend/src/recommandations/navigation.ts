// État transmis par les liens de « Mes recommandations » vers le détail d'une formation (écran 10).
import type { Profil, ProfilEtRecommandations, Recommandation } from "../api/types";

export interface EtatDepuisRecommandations {
  depuisRecommandations: {
    recommandation: Recommandation;
    rang: number;
    total: number;
    profil: Profil;
  };
}

/** État posé par le questionnaire après PUT /profil : évite de relire aussitôt GET /profil. */
export interface EtatApresQuestionnaire {
  resultat: ProfilEtRecommandations;
}

export function lireEtat<T extends object>(etat: unknown, cle: keyof T): T | null {
  return etat && typeof etat === "object" && cle in etat ? (etat as T) : null;
}
