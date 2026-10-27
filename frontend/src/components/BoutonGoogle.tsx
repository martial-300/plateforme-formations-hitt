import { useEffect, useRef, useState } from "react";
import { chargerGoogle, GOOGLE_CLIENT_ID } from "../auth/google";

/** Bouton officiel de Google ; `surJeton` reçoit l'id_token à envoyer à POST /auth/google. */
export function BoutonGoogle({
  texte,
  surJeton,
}: {
  texte: "continue_with" | "signup_with";
  surJeton: (idToken: string) => void;
}) {
  const conteneur = useRef<HTMLDivElement>(null);
  const rappel = useRef(surJeton);
  const [indisponible, setIndisponible] = useState(false);

  useEffect(() => {
    rappel.current = surJeton;
  }, [surJeton]);

  useEffect(() => {
    let actif = true;
    chargerGoogle()
      .then((google) => {
        const element = conteneur.current;
        if (!actif || !element) return;
        google.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: ({ credential }) => rappel.current(credential),
          ux_mode: "popup",
          use_fedcm_for_button: true,
        });
        google.renderButton(element, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: texte,
          shape: "rectangular",
          logo_alignment: "center",
          // Google limite la largeur du bouton à 400 px.
          width: Math.min(400, Math.max(200, element.clientWidth)),
          locale: "fr",
        });
      })
      .catch(() => actif && setIndisponible(true));
    return () => {
      actif = false;
    };
  }, [texte]);

  if (indisponible) {
    return (
      <p className="compte__note">
        La connexion avec Google est indisponible pour le moment : utilisez votre adresse email.
      </p>
    );
  }
  return <div ref={conteneur} className="bouton-google" />;
}
