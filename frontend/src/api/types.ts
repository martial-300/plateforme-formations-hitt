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

export type Domaine = "SISG" | "IA-Data" | "TRIT";
export type TypeFormation = "carte" | "modulaire";
export type UniteDuree = "heure" | "jour" | "semaine" | "mois";

/** Élément de GET /formations, réponse de GET /formations/{id} */
export interface Formation {
  id: string;
  intitule: string;
  description: string;
  domaine: Domaine;
  type: TypeFormation;
  duree_valeur: number;
  duree_unite: UniteDuree;
  cout_fcfa: number;
  /** null pour les formations modulaires */
  cout_promo_fcfa: number | null;
  mots_cles: string[];
}

/** Paramètres optionnels de GET /formations */
export interface FiltresFormations {
  domaine?: Domaine;
  type?: TypeFormation;
}
