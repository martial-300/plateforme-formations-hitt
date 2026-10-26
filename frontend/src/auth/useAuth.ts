import { useContext } from "react";
import { ContexteAuth } from "./contexte";

export function useAuth() {
  const valeur = useContext(ContexteAuth);
  if (!valeur) throw new Error("useAuth doit être utilisé dans FournisseurAuth");
  return valeur;
}
