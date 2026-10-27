// Google Identity Services (RF-13) : le script officiel affiche le bouton « Continuer avec
// Google » (conforme aux règles de marque) et renvoie un id_token, seul élément envoyé à l'API.

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

const URL_SCRIPT = "https://accounts.google.com/gsi/client";

interface OptionsBouton {
  type: "standard";
  theme: "outline";
  size: "large";
  text: "continue_with" | "signup_with";
  shape: "rectangular";
  logo_alignment: "center";
  width: number;
  locale: string;
}

interface GoogleIdentite {
  initialize: (options: {
    client_id: string;
    callback: (reponse: { credential: string }) => void;
    ux_mode: "popup";
    use_fedcm_for_button?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: OptionsBouton) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentite } };
  }
}

let chargement: Promise<GoogleIdentite> | null = null;

/** Charge le script de Google une seule fois pour toute l'application. */
export function chargerGoogle(): Promise<GoogleIdentite> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  chargement ??= new Promise((resoudre, rejeter) => {
    const script = document.createElement("script");
    script.src = URL_SCRIPT;
    script.async = true;
    script.onload = () =>
      window.google?.accounts?.id
        ? resoudre(window.google.accounts.id)
        : rejeter(new Error("Google Identity Services indisponible"));
    script.onerror = () => {
      chargement = null; // nouvel essai possible au prochain affichage
      script.remove();
      rejeter(new Error("Google Identity Services injoignable"));
    };
    document.head.appendChild(script);
  });
  return chargement;
}
