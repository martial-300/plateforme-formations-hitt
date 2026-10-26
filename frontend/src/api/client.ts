// Client HTTP de l'API (base : VITE_API_URL, ex. http://localhost:8000/api/v1).

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";
const CLE_JETON = "hitt.jeton";

export class ErreurApi extends Error {
  constructor(
    public readonly statut: number,
    message: string,
  ) {
    super(message);
  }
}

export const jeton = {
  lire: () => localStorage.getItem(CLE_JETON),
  enregistrer: (valeur: string) => localStorage.setItem(CLE_JETON, valeur),
  supprimer: () => localStorage.removeItem(CLE_JETON),
};

let surDeconnexion: () => void = () => {};

/** Appelé par le contexte d'auth pour réagir à une réponse 401. */
export function quandNonAuthentifie(rappel: () => void) {
  surDeconnexion = rappel;
}

export async function appelApi<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  const entetes = new Headers(options.headers);
  if (options.body && !entetes.has("Content-Type")) entetes.set("Content-Type", "application/json");
  const valeur = jeton.lire();
  if (valeur) entetes.set("Authorization", `Bearer ${valeur}`);

  const reponse = await fetch(`${BASE_URL}${chemin}`, { ...options, headers: entetes });

  if (reponse.status === 401) {
    jeton.supprimer();
    surDeconnexion();
  }
  if (!reponse.ok) {
    const corps = await reponse.json().catch(() => null);
    const detail =
      typeof corps?.detail === "string" ? corps.detail : "Une erreur est survenue. Réessayez.";
    throw new ErreurApi(reponse.status, detail);
  }
  return (reponse.status === 204 ? undefined : await reponse.json()) as T;
}
