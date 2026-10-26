// Types alignés sur les exemples de docs/api.md (complétés à chaque sprint).

export type Role = "apprenant" | "administrateur";

/** Réponse de GET /users/me */
export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  date_creation: string;
}
