// Libellés et formats d'affichage du catalogue (maquettes 03, 04, 11, M1, M4).
import type { Domaine, Formation, TypeFormation, UniteDuree } from "../api/types";

export const DOMAINES: Domaine[] = ["SISG", "IA-Data", "TRIT"];
export const TYPES: TypeFormation[] = ["carte", "modulaire"];

/** Libellé court : onglets, colonne Domaine, sur-titre du détail. */
export const DOMAINE_COURT: Record<Domaine, string> = {
  SISG: "SISG",
  "IA-Data": "IA · Data",
  TRIT: "TRIT",
};

/** Intitulés des domaines du cahier des charges (§ 2). */
export const DOMAINE_COMPLET: Record<Domaine, string> = {
  SISG: "SISG — Secrétariat et Gestion",
  "IA-Data": "IA, Data science et Blockchain",
  TRIT: "TRIT — Informatique et Télécoms",
};

export const TYPE_COURT: Record<TypeFormation, string> = {
  carte: "À la carte",
  modulaire: "Modulaire · certifiante",
};

export const TYPE_COMPLET: Record<TypeFormation, string> = {
  carte: "Formation à la carte (courte)",
  modulaire: "Parcours modulaire certifiant",
};

/** Identique pour toutes les formations d'après les fiches (cahier des charges § 2) : pas de colonne en base. */
export const NIVEAU_ADMISSION = "BEPC, BAC I, II et plus";

const UNITES_PLURIEL: Record<UniteDuree, string> = {
  heure: "heures",
  jour: "jours",
  semaine: "semaines",
  mois: "mois",
};

export function estDomaine(valeur: string | null): valeur is Domaine {
  return DOMAINES.includes(valeur as Domaine);
}

export function estType(valeur: string | null): valeur is TypeFormation {
  return TYPES.includes(valeur as TypeFormation);
}

/** 125000 → « 125 000 FCFA » (espaces insécables : le montant ne se coupe pas). */
export function formaterMontant(montant: number): string {
  const chiffres = String(Math.round(montant)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `${chiffres}\u00a0FCFA`;
}

/** 3 semaine → « 3 semaines », 0.5 semaine → « 0,5 semaine ». */
export function formaterDuree({ duree_valeur, duree_unite }: Formation): string {
  const unite = duree_valeur >= 2 ? UNITES_PLURIEL[duree_unite] : duree_unite;
  return `${String(duree_valeur).replace(".", ",")}\u00a0${unite}`;
}
