// Écran 08 : modifier une formation dans une fenêtre, sans quitter le tableau de bord.
import { useState, type FormEvent } from "react";
import { modifierFormation } from "../api/formations";
import type { Formation } from "../api/types";
import { messageErreur } from "../auth/useConnexion";
import { Fenetre } from "../components/Fenetre";
import { ChampsFormation } from "./ChampsFormation";
import { versSaisieFormation } from "./saisieFormation";
import { useSaisieFormation } from "./useSaisieFormation";

interface Proprietes {
  formation: Formation;
  surFermeture: () => void;
  surEnregistrement: (formation: Formation) => void;
  surSuppression: () => void;
}

export function FenetreModification({
  formation,
  surFermeture,
  surEnregistrement,
  surSuppression,
}: Proprietes) {
  const { saisie, erreurs, modifier, valider } = useSaisieFormation(versSaisieFormation(formation));
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function enregistrer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);
    const corps = valider();
    if (!corps) return;
    setEnvoi(true);
    try {
      surEnregistrement(await modifierFormation(formation.id, corps));
    } catch (e) {
      setErreur(messageErreur(e));
      setEnvoi(false);
    }
  }

  return (
    <Fenetre titre="Modifier une formation" surFermeture={surFermeture} bandeau>
      <form onSubmit={enregistrer} noValidate>
        <div className="fenetre__contenu">
          {erreur && (
            <div className="alerte" role="alert">
              <p className="alerte__titre">La formation n&apos;a pas été enregistrée</p>
              <p>{erreur}</p>
            </div>
          )}
          <ChampsFormation saisie={saisie} erreurs={erreurs} modifier={modifier} />
        </div>
        <div className="fenetre__actions">
          <button type="button" className="bouton bouton--danger" onClick={surSuppression}>
            Supprimer la formation
          </button>
          <span className="fenetre__espace" />
          <button type="button" className="lien-texte" onClick={surFermeture}>
            Annuler
          </button>
          <button type="submit" className="bouton" disabled={envoi}>
            {envoi ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </Fenetre>
  );
}
