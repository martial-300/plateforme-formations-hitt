// Réponses du questionnaire (RF-06, RF-07) : saisie et contrôle avant envoi.
import type { ProfilEntree, TypeFormation } from "../api/types";

export const NIVEAUX_ETUDES = [
  "BEPC",
  "BAC I",
  "BAC II",
  "BAC + 2",
  "Licence",
  "Master ou plus",
  "Autre",
] as const;

/** Valeurs des champs telles que saisies (le budget reste du texte jusqu'à l'envoi). */
export interface Saisie {
  niveau_etudes: string;
  objectif_professionnel: string;
  competences: string;
  centres_interet: string;
  type_souhaite: TypeFormation | "";
  budget: string;
}

export type Champ = keyof Saisie;
export type Erreurs = Partial<Record<Champ, string>>;

export const SAISIE_VIDE: Saisie = {
  niveau_etudes: "",
  objectif_professionnel: "",
  competences: "",
  centres_interet: "",
  type_souhaite: "",
  budget: "",
};

// Ordre d'affichage : le récapitulatif des erreurs suit l'ordre des champs à l'écran.
export const CHAMPS: { champ: Champ; libelle: string }[] = [
  { champ: "niveau_etudes", libelle: "Niveau d'études" },
  { champ: "objectif_professionnel", libelle: "Objectif professionnel" },
  { champ: "competences", libelle: "Compétences actuelles" },
  { champ: "centres_interet", libelle: "Domaines qui vous attirent" },
  { champ: "type_souhaite", libelle: "Type de formation souhaité" },
  { champ: "budget", libelle: "Budget maximum" },
];

const LONGUEUR_MAX = 1000;
const BUDGET_MAX = 2_147_483_647;

/** « 150 000 », « 150000 » ou « 150.000 » → 150000 ; null si ce n'est pas un montant entier. */
export function lireMontant(texte: string): number | null {
  const chiffres = texte.replace(/[\s.\u00a0\u202f]/g, "");
  if (!/^\d+$/.test(chiffres)) return null;
  const montant = Number(chiffres);
  return montant <= BUDGET_MAX ? montant : null;
}

/** Message affiché sous le champ, et forme courte reprise dans le récapitulatif. */
export interface Probleme {
  message: string;
  resume: string;
}

export function controler(saisie: Saisie): Partial<Record<Champ, Probleme>> {
  const problemes: Partial<Record<Champ, Probleme>> = {};
  const vide = (texte: string) => texte.trim() === "";
  const tropLong = (texte: string) => texte.trim().length > LONGUEUR_MAX;
  const texteLibre = (champ: Champ, exemple: string) => {
    const valeur = saisie[champ];
    if (vide(valeur)) problemes[champ] = { message: exemple, resume: "champ vide." };
    else if (tropLong(valeur))
      problemes[champ] = {
        message: `${LONGUEUR_MAX} caractères au plus : raccourcissez votre réponse.`,
        resume: "réponse trop longue.",
      };
  };

  if (vide(saisie.niveau_etudes))
    problemes.niveau_etudes = {
      message: "Choisissez votre niveau d'études.",
      resume: "aucun choix.",
    };
  texteLibre(
    "objectif_professionnel",
    "Indiquez le métier ou le projet visé (ex. : devenir développeur web).",
  );
  texteLibre(
    "competences",
    "Indiquez au moins une compétence, même débutante (ex. : Word, Internet).",
  );
  texteLibre(
    "centres_interet",
    "Indiquez au moins un domaine qui vous attire (ex. : informatique, gestion).",
  );
  if (saisie.type_souhaite === "")
    problemes.type_souhaite = {
      message: "Choisissez une formation courte ou un parcours modulaire.",
      resume: "aucun choix.",
    };
  if (vide(saisie.budget))
    problemes.budget = {
      message: "Indiquez votre budget en chiffres, par exemple 150 000.",
      resume: "champ vide.",
    };
  else if (lireMontant(saisie.budget) === null)
    problemes.budget = {
      message: "Saisissez un montant en chiffres, par exemple 150 000.",
      resume: "le montant doit être un nombre.",
    };
  return problemes;
}

export function versProfil(saisie: Saisie): ProfilEntree {
  return {
    niveau_etudes: saisie.niveau_etudes.trim(),
    competences: saisie.competences.trim(),
    centres_interet: saisie.centres_interet.trim(),
    objectif_professionnel: saisie.objectif_professionnel.trim(),
    type_souhaite: saisie.type_souhaite as TypeFormation,
    budget_max_fcfa: lireMontant(saisie.budget) ?? 0,
  };
}

export function versSaisie(profil: ProfilEntree): Saisie {
  return {
    niveau_etudes: profil.niveau_etudes,
    competences: profil.competences,
    centres_interet: profil.centres_interet,
    objectif_professionnel: profil.objectif_professionnel,
    type_souhaite: profil.type_souhaite,
    budget: formaterNombre(profil.budget_max_fcfa),
  };
}

export function formaterNombre(montant: number): string {
  return String(montant).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}
