// État de la fiche formation : saisie, erreurs effacées au fil de la correction, contrôle final.
import { useState } from "react";
import type { FormationEntree } from "../api/types";
import {
  controlerFormation,
  versEntree,
  type ChampFormation,
  type ErreursFormation,
  type SaisieFormation,
} from "./saisieFormation";

export function useSaisieFormation(initiale: SaisieFormation) {
  const [saisie, setSaisie] = useState(initiale);
  const [erreurs, setErreurs] = useState<ErreursFormation>({});

  function modifier(champ: ChampFormation, valeur: string) {
    const suivante = { ...saisie, [champ]: valeur };
    // Passer en modulaire retire le prix promo, interdit pour ce type.
    if (champ === "type" && valeur === "modulaire") suivante.cout_promo_fcfa = "";
    setSaisie(suivante);
    if (Object.keys(erreurs).length > 0) {
      const restantes = controlerFormation(suivante);
      // Seules les erreurs déjà affichées restent : pas de nouvelle erreur pendant la frappe.
      setErreurs(
        Object.fromEntries(
          Object.entries(restantes).filter(([c]) => c in erreurs),
        ) as ErreursFormation,
      );
    }
  }

  /** Corps prêt à envoyer, ou null (erreurs affichées, curseur sur le premier champ fautif). */
  function valider(): FormationEntree | null {
    const trouvees = controlerFormation(saisie);
    setErreurs(trouvees);
    const premier = Object.keys(trouvees)[0];
    if (premier) {
      document.getElementById(premier)?.focus();
      return null;
    }
    return versEntree(saisie);
  }

  return { saisie, erreurs, modifier, valider };
}
