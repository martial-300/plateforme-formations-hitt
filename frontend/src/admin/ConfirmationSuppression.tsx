// Écran 17 : confirmation avant de retirer une formation du catalogue (RF-04).
import { useState } from "react";
import { supprimerFormation } from "../api/formations";
import type { Formation } from "../api/types";
import { messageErreur } from "../auth/useConnexion";
import { Fenetre } from "../components/Fenetre";

interface Proprietes {
  formation: Formation;
  surFermeture: () => void;
  surSuppression: () => void;
}

export function ConfirmationSuppression({ formation, surFermeture, surSuppression }: Proprietes) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function supprimer() {
    setErreur(null);
    setEnvoi(true);
    try {
      await supprimerFormation(formation.id);
      surSuppression();
    } catch (e) {
      setErreur(messageErreur(e));
      setEnvoi(false);
    }
  }

  return (
    <Fenetre
      titre="Supprimer cette formation ?"
      surFermeture={surFermeture}
      className="fenetre--confirmation"
    >
      <p className="fenetre__texte">
        « {formation.intitule} » sera retirée du catalogue. Les recommandations déjà faites pour
        cette formation seront aussi supprimées. Cette action est définitive.
      </p>
      {erreur && (
        <p className="champ__erreur" role="alert">
          {erreur}
        </p>
      )}
      <div className="fenetre__actions fenetre__actions--simple">
        {/* Le focus arrive sur « Annuler » : la touche Entrée ne supprime pas par mégarde. */}
        <button type="button" className="lien-texte" onClick={surFermeture} autoFocus>
          Annuler
        </button>
        <button
          type="button"
          className="bouton bouton--danger"
          onClick={supprimer}
          disabled={envoi}
        >
          {envoi ? "Suppression…" : "Supprimer définitivement"}
        </button>
      </div>
    </Fenetre>
  );
}
