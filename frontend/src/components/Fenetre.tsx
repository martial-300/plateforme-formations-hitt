// Fenêtre modale native (<dialog>) : focus gardé dedans, Échap ferme, fond assombri.
import { useEffect, useRef, type ReactNode } from "react";

interface Proprietes {
  titre: string;
  surFermeture: () => void;
  /** Bandeau vert avec « Fermer » (écran 08) ; sinon titre simple (écran 17) */
  bandeau?: boolean;
  className?: string;
  children: ReactNode;
}

export function Fenetre({ titre, surFermeture, bandeau = false, className, children }: Proprietes) {
  const fenetre = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = fenetre.current;
    if (!element) return;
    element.showModal();
    return () => element.close();
  }, []);

  return (
    <dialog
      ref={fenetre}
      className={["fenetre", className].filter(Boolean).join(" ")}
      aria-labelledby="fenetre-titre"
      onCancel={(e) => {
        e.preventDefault();
        surFermeture();
      }}
    >
      {bandeau ? (
        <div className="fenetre__bandeau">
          <h2 id="fenetre-titre">{titre}</h2>
          <button type="button" className="fenetre__fermer" onClick={surFermeture}>
            Fermer
          </button>
        </div>
      ) : (
        <h2 id="fenetre-titre" className="fenetre__titre">
          {titre}
        </h2>
      )}
      {children}
    </dialog>
  );
}
