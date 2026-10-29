// Réponses de l'essai sans compte (RF-12), gardées en mémoire de session pour pré-remplir le
// questionnaire après l'inscription. sessionStorage : effacé à la fermeture de l'onglet.
import type { ApercuEntree } from "../api/types";

const CLE = "hitt.essai";

export function garderEssai(reponses: ApercuEntree): void {
  try {
    sessionStorage.setItem(CLE, JSON.stringify(reponses));
  } catch {
    // Stockage indisponible (navigation privée stricte) : seul le pré-remplissage est perdu.
  }
}

/** Réponses gardées, ou null si absentes ou illisibles (valeur modifiée à la main). */
export function lireEssai(): ApercuEntree | null {
  try {
    const valeur: unknown = JSON.parse(sessionStorage.getItem(CLE) ?? "null");
    if (
      typeof valeur === "object" &&
      valeur !== null &&
      "centres_interet" in valeur &&
      "type_souhaite" in valeur &&
      "budget_max_fcfa" in valeur &&
      typeof valeur.centres_interet === "string" &&
      (valeur.type_souhaite === "carte" || valeur.type_souhaite === "modulaire") &&
      Number.isSafeInteger(valeur.budget_max_fcfa) &&
      (valeur.budget_max_fcfa as number) >= 0
    ) {
      return {
        centres_interet: valeur.centres_interet,
        type_souhaite: valeur.type_souhaite,
        budget_max_fcfa: valeur.budget_max_fcfa as number,
      };
    }
  } catch {
    // JSON invalide ou stockage indisponible : comme s'il n'y avait rien.
  }
  return null;
}

export function oublierEssai(): void {
  try {
    sessionStorage.removeItem(CLE);
  } catch {
    // Rien à faire.
  }
}
