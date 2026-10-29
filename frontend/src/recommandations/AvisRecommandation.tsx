// Avis de l'apprenant sur une recommandation (RF-10), modifiable : écrans 06, 10 et M3.
import { useState } from "react";
import { donnerRetour } from "../api/recommandations";
import type { Recommandation, RetourDonne } from "../api/types";
import { messageErreur } from "../auth/useConnexion";

const LIBELLES: Record<RetourDonne, string> = {
  pertinent: "Elle me correspond",
  non_pertinent: "Pas pour moi",
};

export function AvisRecommandation({
  recommandation,
  surChangement,
}: {
  recommandation: Recommandation;
  surChangement: (miseAJour: Recommandation) => void;
}) {
  const [modification, setModification] = useState(false);
  const [envoi, setEnvoi] = useState<RetourDonne | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const { retour } = recommandation;

  async function choisir(choix: RetourDonne) {
    setErreur(null);
    setEnvoi(choix);
    try {
      surChangement(await donnerRetour(recommandation.id, choix));
      setModification(false);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnvoi(null);
    }
  }

  // Avis donné : seul le choix retenu reste affiché ; un clic rouvre les deux choix.
  if (retour !== "aucun" && !modification) {
    return (
      <div className="avis">
        <p className="avis__question">Votre avis (modifiable) :</p>
        <button
          type="button"
          className={`bouton bouton--large avis__choisi avis__choisi--${retour}`}
          aria-label={`${LIBELLES[retour]} : modifier votre avis`}
          onClick={() => setModification(true)}
        >
          <span aria-hidden="true">✓</span> {LIBELLES[retour]}
        </button>
      </div>
    );
  }

  return (
    <div className="avis">
      <p className="avis__question">Cette formation vous intéresse ?</p>
      <div className="avis__choix">
        {(Object.keys(LIBELLES) as RetourDonne[]).map((choix) => (
          <button
            key={choix}
            type="button"
            className="bouton bouton--secondaire bouton--large"
            aria-pressed={retour === choix}
            disabled={envoi !== null}
            onClick={() => choisir(choix)}
          >
            {envoi === choix ? "Envoi…" : LIBELLES[choix]}
          </button>
        ))}
      </div>
      {erreur && (
        <p className="champ__erreur" role="alert">
          Votre avis n'a pas pu être enregistré : {erreur}
        </p>
      )}
    </div>
  );
}
