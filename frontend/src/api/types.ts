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

/** Corps de POST /auth/register */
export interface Inscription {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
}

/** Corps de POST /auth/login */
export interface Connexion {
  email: string;
  mot_de_passe: string;
}

/** Réponse de POST /auth/login */
export interface ReponseConnexion {
  access_token: string;
  token_type: "bearer";
}

/** Corps de POST /auth/google : jeton d'identité reçu de Google Identity Services */
export interface ConnexionGoogle {
  id_token: string;
}

/** Réponse de POST /auth/google */
export interface ReponseConnexionGoogle extends ReponseConnexion {
  nouveau_compte: boolean;
}
