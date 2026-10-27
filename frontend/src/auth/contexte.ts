import { createContext } from "react";
import type { Utilisateur } from "../api/types";

export interface ValeurAuth {
  utilisateur: Utilisateur | null;
  chargement: boolean;
  /** Enregistre le jeton et renvoie le compte (null si l'API le refuse). */
  connecter: (accessToken: string) => Promise<Utilisateur | null>;
  deconnecter: () => void;
}

export const ContexteAuth = createContext<ValeurAuth | null>(null);
