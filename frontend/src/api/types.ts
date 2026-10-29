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

/** Corps de POST /formations et PUT /formations/{id} (administrateur) */
export type FormationEntree = Omit<Formation, "id" | "cout_promo_fcfa"> & {
  /** absent ou null pour les formations modulaires ; PUT efface le prix promo s'il est absent */
  cout_promo_fcfa?: number | null;
};

/** Corps de PUT /profil (RF-06, RF-07) : toutes les réponses, à chaque soumission */
export interface ProfilEntree {
  /** 1 à 50 caractères */
  niveau_etudes: string;
  /** 1 à 1 000 caractères */
  competences: string;
  /** 1 à 1 000 caractères */
  centres_interet: string;
  /** 1 à 1 000 caractères */
  objectif_professionnel: string;
  type_souhaite: TypeFormation;
  /** entier de 0 à 2 147 483 647 */
  budget_max_fcfa: number;
}

export interface Profil extends ProfilEntree {
  date_maj: string;
}

export type Retour = "pertinent" | "non_pertinent" | "aucun";

/** Corps de POST /recommandations/{id}/retour : « aucun » n'est pas un choix (RF-10) */
export type RetourDonne = Exclude<Retour, "aucun">;

/** Recommandation enregistrée pour l'apprenant (RF-08, RF-09) */
export interface Recommandation {
  id: string;
  /** de 0 à 1, jamais affiché tel quel (libellé de correspondance) */
  score: number;
  mots_cles_communs: string[];
  retour: Retour;
  formation: Formation;
}

/** Réponse de GET et PUT /profil : 5 recommandations au plus, triées par score décroissant */
export interface ProfilEtRecommandations {
  profil: Profil;
  recommandations: Recommandation[];
}

/** Corps de POST /recommandations/apercu (RF-12) : les 3 questions de la page /essai */
export interface ApercuEntree {
  /** 1 à 1 000 caractères : « ce que vous aimeriez apprendre » */
  centres_interet: string;
  type_souhaite: TypeFormation;
  /** entier de 0 à 2 147 483 647 */
  budget_max_fcfa: number;
}

/** Formation de l'aperçu : sans description ni mots-clés */
export type FormationApercu = Omit<Formation, "description" | "mots_cles">;

/** Rien n'est enregistré : pas d'identifiant, donc pas de retour possible */
export interface RecommandationApercu {
  /** 1 à 3, par score décroissant */
  rang: number;
  /** de 0 à 1, jamais affiché tel quel (libellé de correspondance) */
  score: number;
  mots_cles_communs: string[];
  formation: FormationApercu;
}

/** Réponse de POST /recommandations/apercu : 3 formations au plus (liste vide possible) */
export interface ReponseApercu {
  recommandations: RecommandationApercu[];
}

/** Ligne du top 5 de GET /admin/statistiques */
export interface FormationRecommandee {
  formation_id: string;
  intitule: string;
  domaine: Domaine;
  nb_recommandations: number;
}

/** Réponse de GET /admin/statistiques (RF-11) */
export interface Statistiques {
  /** administrateurs exclus */
  nb_apprenants: number;
  /** 5 au plus, par nombre de recommandations décroissant puis par intitulé */
  top_formations: FormationRecommandee[];
  /** retours « pertinent » ou « non pertinent » donnés */
  nb_retours: number;
  nb_retours_pertinents: number;
  /** de 0 à 1, null sans retour */
  taux_pertinent: number | null;
}
