import type { Domaine } from "../api/types";

// Photos de la maquette v2 (design/figma-scripts/v2-05-photos.js), servies depuis public/photos/
// en deux largeurs. Provisoires : à remplacer par de vraies photos du centre HIT-T.
export type NomPhoto = "classe" | "etudiants" | "groupe" | "bureau" | "code" | "reseau";

/** Photo propre à chaque domaine : cartes de l'accueil et détail d'une formation. */
export const PHOTO_DOMAINE: Record<Domaine, NomPhoto> = {
  SISG: "bureau",
  "IA-Data": "code",
  TRIT: "reseau",
};
