import type { ReactNode } from "react";
import { BoutonGoogle } from "./BoutonGoogle";
import { GOOGLE_CLIENT_ID } from "../auth/google";

const ETAPES = [
  ["Créez votre compte", "Nom, prénom, adresse email et mot de passe."],
  ["Remplissez le questionnaire", "Environ deux minutes ; vous pourrez modifier vos réponses."],
  ["Consultez vos recommandations", "Cinq formations classées, avec les raisons de chaque choix."],
] as const;

/** Écrans 01, 02, 14, 15 et M5 : présentation à gauche, formulaire à droite. */
export function MiseEnPageCompte({
  titre,
  sousTitre,
  texteGoogle,
  surJetonGoogle,
  erreurGoogle,
  bascule,
  children,
}: {
  titre: string;
  sousTitre: string;
  texteGoogle: "continue_with" | "signup_with";
  surJetonGoogle: (idToken: string) => void;
  erreurGoogle: string | null;
  bascule: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="conteneur compte">
      <section className="compte__presentation" aria-label="Présentation">
        <p className="compte__surtitre">Espace apprenant</p>
        <p className="compte__accroche">Trouvez la formation adaptée à votre projet</p>
        <p className="compte__texte">
          Répondez à six questions sur votre parcours et vos objectifs : la plateforme compare
          automatiquement votre profil aux 86 formations de HIT-T Institute et vous indique les cinq
          plus adaptées.
        </p>
        <ol className="compte__etapes">
          {ETAPES.map(([etape, detail]) => (
            <li key={etape}>
              <strong>{etape}</strong>
              <span>{detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="compte__formulaire">
        <header className="compte__titre">
          <h1>{titre}</h1>
          <p>{sousTitre}</p>
        </header>
        <div className="compte__corps">
          {GOOGLE_CLIENT_ID && (
            <>
              {erreurGoogle && (
                <div className="alerte" role="alert">
                  <p className="alerte__titre">{erreurGoogle}</p>
                </div>
              )}
              <BoutonGoogle texte={texteGoogle} surJeton={surJetonGoogle} />
              <p className="separateur">
                <span>ou avec votre adresse email</span>
              </p>
            </>
          )}
          {children}
        </div>
        <p className="compte__bascule">{bascule}</p>
      </section>
    </main>
  );
}
