import { createContext } from "react";
import type { Utilisateur } from "../api/types";

export interface ValeurAuth {
  utilisateur: Utilisateur | null;
  chargement: boolean;
  connecter: (accessToken: string) => Promise<void>;
  deconnecter: () => void;
}

export const ContexteAuth = createContext<ValeurAuth | null>(null);
