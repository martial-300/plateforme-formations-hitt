import { useSyncExternalStore } from "react";

// Même seuil que les règles @media de global.css.
const REQUETE = "(max-width: 720px)";

function abonner(rappel: () => void) {
  const media = window.matchMedia(REQUETE);
  media.addEventListener("change", rappel);
  return () => media.removeEventListener("change", rappel);
}

/** Vrai sur un écran étroit : le catalogue y remplace la pagination par « Afficher plus ». */
export function useEstMobile(): boolean {
  return useSyncExternalStore(abonner, () => window.matchMedia(REQUETE).matches);
}
