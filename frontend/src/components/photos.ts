import type { Domaine, Formation } from "../api/types";

// Photos servies depuis public/photos/ en deux largeurs (WebP 800 et 1600 px), toutes issues de
// Pexels (licence gratuite, sans attribution obligatoire) : les 6 de la maquette v2
// (design/figma-scripts/v2-05-photos.js) et une par thème de formation. Provisoires : à
// remplacer par de vraies photos du centre HIT-T.
export type NomPhoto =
  | "classe"
  | "etudiants"
  | "groupe"
  | "bureau"
  | "code"
  | "reseau"
  | "audiovisuel"
  | "blockchain"
  | "bureautique"
  | "climatisation"
  | "commerce"
  | "comptabilite"
  | "cyber"
  | "data"
  | "emploi"
  | "graphisme"
  | "ia"
  | "imprimante"
  | "iot"
  | "logistique"
  | "maintenance"
  | "marketing"
  | "projet"
  | "secretariat"
  | "serveurs"
  | "telecom";

/** Photo propre à chaque domaine : cartes de l'accueil, repli du détail d'une formation. */
export const PHOTO_DOMAINE: Record<Domaine, NomPhoto> = {
  SISG: "bureau",
  "IA-Data": "code",
  TRIT: "reseau",
};

// Thèmes cherchés dans l'intitulé, puis dans les mots-clés ; le premier qui correspond l'emporte,
// d'où l'ordre : « IoT et la BlockChain » est de l'IoT, « Analyste Programmeur et Cybersécurité »
// de la cybersécurité, « Marketing digital » du marketing et pas du développement web.
const THEMES: [RegExp, NomPhoto][] = [
  [/climatis|frigoriste/, "climatisation"],
  [/imprimante|photocopieur|mécanographie/, "imprimante"],
  [/téléphon|télécom/, "telecom"],
  [/\biot\b|objets connectés/, "iot"],
  [/blockchain|crypto/, "blockchain"],
  [/cybersécurité/, "cyber"],
  [/audiovisuel|tournage/, "audiovisuel"],
  [/infographie|graphisme|publisher/, "graphisme"],
  [/chatgpt|copilot|ia générative/, "ia"],
  [/\baws\b|cloud/, "serveurs"],
  [/analyste programmeur|génie logiciel/, "code"],
  [/initiation informatique/, "groupe"],
  [/\boffice\b/, "bureautique"],
  [/action commerciale|gestion commerciale|force de vente/, "commerce"],
  [/ressources humaines|recrutement|\bcv\b|entretien d'embauche|écrits professionnels/, "emploi"],
  [/marketing|community|réseaux sociaux|publicité/, "marketing"],
  [/comptab|caisse|factur/, "comptabilite"],
  [/secrétariat|assistant de direction|classement|archivage/, "secretariat"],
  [/logistique|transport|entrepôt/, "logistique"],
  [/commerc|vente|négociation/, "commerce"],
  [/gestion de projet|montage de projets|marchés publics|qualité/, "projet"],
  [/bureautique|tableur/, "bureautique"],
  [/analyse de données|analyse des données|power bi|power query/, "data"],
  [/\bia\b|intelligence artificielle|learning|chatbot|chatgpt|keras|tensorflow|opencv/, "ia"],
  [/base de données|\bsql\b|oracle|merise|\baws\b|cloud/, "serveurs"],
  [/\bréseau\b|câblage/, "reseau"],
  [/maintenance informatique|dépannage/, "maintenance"],
  [/programm|développ|java|php|laravel|flutter|algorithm|github|\bweb\b/, "code"],
  [/initiation|débutant|ordinateur|internet/, "groupe"],
];

/** Photo du détail d'une formation : celle de son thème, sinon celle de son domaine. */
export function photoFormation(formation: Formation): NomPhoto {
  const textes = [formation.intitule, formation.mots_cles.join(" ")].map((t) => t.toLowerCase());
  for (const texte of textes) {
    const theme = THEMES.find(([motif]) => motif.test(texte));
    if (theme) return theme[1];
  }
  return PHOTO_DOMAINE[formation.domaine];
}
