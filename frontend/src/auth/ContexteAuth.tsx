import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { appelApi, jeton, quandNonAuthentifie } from "../api/client";
import type { Utilisateur } from "../api/types";
import { ContexteAuth } from "./contexte";

export function FournisseurAuth({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [chargement, setChargement] = useState(() => jeton.lire() !== null);

  const deconnecter = useCallback(() => {
    jeton.supprimer();
    setUtilisateur(null);
  }, []);

  const chargerCompte = useCallback(async () => {
    try {
      setUtilisateur(await appelApi<Utilisateur>("/users/me"));
    } catch {
      deconnecter();
    } finally {
      setChargement(false);
    }
  }, [deconnecter]);

  const connecter = useCallback(
    async (accessToken: string) => {
      jeton.enregistrer(accessToken);
      await chargerCompte();
    },
    [chargerCompte],
  );

  // Au chargement de la page, un jeton déjà présent est revalidé par l'API.
  useEffect(() => {
    quandNonAuthentifie(() => setUtilisateur(null));
    if (!jeton.lire()) return;
    appelApi<Utilisateur>("/users/me")
      .then(setUtilisateur, () => jeton.supprimer())
      .finally(() => setChargement(false));
  }, []);

  const valeur = useMemo(
    () => ({ utilisateur, chargement, connecter, deconnecter }),
    [utilisateur, chargement, connecter, deconnecter],
  );
  return <ContexteAuth.Provider value={valeur}>{children}</ContexteAuth.Provider>;
}
