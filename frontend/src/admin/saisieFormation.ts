// Fiche formation de l'administrateur (RF-04) : saisie, contrôles de docs/api.md, corps envoyé.
import type { Domaine, Formation, FormationEntree, TypeFormation, UniteDuree } from "../api/types";
import { formaterNombre, lireMontant } from "../questionnaire/reponses";

/** Valeurs des champs telles que saisies (nombres et mots-clés restent du texte). */
export interface SaisieFormation {
  intitule: string;
  description: string;
  domaine: Domaine | "";
  type: TypeFormation | "";
  duree_valeur: string;
  duree_unite: UniteDuree | "";
  cout_fcfa: string;
  cout_promo_fcfa: string;
  mots_cles: string;
}

export type ChampFormation = keyof SaisieFormation;
export type ErreursFormation = Partial<Record<ChampFormation, string>>;

export const SAISIE_FORMATION_VIDE: SaisieFormation = {
  intitule: "",
  description: "",
  domaine: "",
  type: "",
  duree_valeur: "",
  duree_unite: "",
  cout_fcfa: "",
  cout_promo_fcfa: "",
  mots_cles: "",
};

export const UNITES: UniteDuree[] = ["heure", "jour", "semaine", "mois"];

export function versSaisieFormation(formation: Formation): SaisieFormation {
  return {
    intitule: formation.intitule,
    description: formation.description,
    domaine: formation.domaine,
    type: formation.type,
    duree_valeur: String(formation.duree_valeur).replace(".", ","),
    duree_unite: formation.duree_unite,
    cout_fcfa: formaterNombre(formation.cout_fcfa),
    cout_promo_fcfa:
      formation.cout_promo_fcfa === null ? "" : formaterNombre(formation.cout_promo_fcfa),
    mots_cles: formation.mots_cles.join(", "),
  };
}

/** « 3 », « 0,5 » ou « 1.5 » → nombre ; null hors de 0,1 à 999,9 ou avec plus d'une décimale. */
function lireDuree(texte: string): number | null {
  const valeur = texte.trim().replace(",", ".");
  if (!/^\d{1,3}(\.\d)?$/.test(valeur)) return null;
  const duree = Number(valeur);
  return duree > 0 ? duree : null;
}

function lireMotsCles(texte: string): string[] {
  const mots: string[] = [];
  for (const mot of texte.split(",")) {
    const propre = mot.trim().toLowerCase();
    if (propre && !mots.includes(propre)) mots.push(propre);
  }
  return mots;
}

export function controlerFormation(saisie: SaisieFormation): ErreursFormation {
  const erreurs: ErreursFormation = {};
  const intitule = saisie.intitule.trim();
  if (!intitule) erreurs.intitule = "Indiquez l'intitulé de la formation.";
  else if (intitule.length > 200) erreurs.intitule = "200 caractères au plus.";
  if (!saisie.description.trim())
    erreurs.description = "Décrivez en une ou deux phrases ce que l'apprenant saura faire.";
  if (!saisie.domaine) erreurs.domaine = "Choisissez un domaine.";
  if (!saisie.type) erreurs.type = "Choisissez un type.";
  if (lireDuree(saisie.duree_valeur) === null)
    erreurs.duree_valeur = "De 0,1 à 999,9, une décimale au plus.";
  if (!saisie.duree_unite) erreurs.duree_unite = "Choisissez une unité.";

  const cout = lireMontant(saisie.cout_fcfa);
  if (cout === null || cout === 0) erreurs.cout_fcfa = "Montant entier supérieur à 0.";
  if (saisie.cout_promo_fcfa.trim()) {
    const promo = lireMontant(saisie.cout_promo_fcfa);
    if (saisie.type === "modulaire")
      erreurs.cout_promo_fcfa = "Pas de prix promo pour un parcours modulaire.";
    else if (promo === null || promo === 0)
      erreurs.cout_promo_fcfa = "Montant entier supérieur à 0.";
    else if (cout !== null && promo >= cout)
      erreurs.cout_promo_fcfa = "Doit être inférieur au coût.";
  }

  const mots = lireMotsCles(saisie.mots_cles);
  if (mots.length === 0) erreurs.mots_cles = "Indiquez au moins un mot-clé.";
  else if (mots.length > 20) erreurs.mots_cles = "20 mots-clés au plus.";
  else if (mots.some((mot) => mot.length > 100))
    erreurs.mots_cles = "Un mot-clé fait 100 caractères au plus.";
  return erreurs;
}

/** Corps de POST et PUT /formations ; à n'appeler qu'après un contrôle sans erreur. */
export function versEntree(saisie: SaisieFormation): FormationEntree {
  const promo = saisie.cout_promo_fcfa.trim() ? lireMontant(saisie.cout_promo_fcfa) : null;
  return {
    intitule: saisie.intitule.trim(),
    description: saisie.description.trim(),
    domaine: saisie.domaine as Domaine,
    type: saisie.type as TypeFormation,
    duree_valeur: lireDuree(saisie.duree_valeur) ?? 0,
    duree_unite: saisie.duree_unite as UniteDuree,
    cout_fcfa: lireMontant(saisie.cout_fcfa) ?? 0,
    // PUT efface le prix promo absent : null le retire explicitement (docs/api.md).
    cout_promo_fcfa: saisie.type === "modulaire" ? null : promo,
    mots_cles: lireMotsCles(saisie.mots_cles),
  };
}
