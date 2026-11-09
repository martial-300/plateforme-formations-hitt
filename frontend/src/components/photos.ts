import type { Domaine, Formation } from "../api/types";

// Photos servies depuis public/photos/ en deux largeurs (WebP 800 et 1600 px). Issues de Pexels
// (licence gratuite, sans attribution obligatoire) : les 6 de la maquette v2
// (design/figma-scripts/v2-05-photos.js) et une par thème de formation, provisoires, à remplacer
// par de vraies photos du centre HIT-T. Les `site-*` viennent du site de HIT-T (COUVERTURE_DOMAINE).
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
  | "telecom"
  | "site-sisg"
  | "site-ia-data"
  | "site-trit"
  | "site-treb"
  | "site-f-power-bi"
  | "site-f-excel-ia"
  | "site-f-ia-generative"
  | "site-f-copilot"
  | "site-f-chatbot"
  | "site-f-uml";

/**
 * Images des formations du site de HIT-T (même accord du cabinet), par intitulé exact du
 * catalogue. Le site ne présente que 12 formations : 6 ont un équivalent ici. Ce sont surtout des
 * affiches : le détail les affiche en entier (`estAffiche`) au lieu de les recadrer.
 */
const IMAGE_SITE: Record<string, NomPhoto> = {
  "Analyse des données (Power BI, etc.)": "site-f-power-bi",
  "Excel appliqué à IA": "site-f-excel-ia",
  "IA Générative et rédaction de mémoire": "site-f-ia-generative",
  "ChatGPT ou Teachy, Copilot, etc.": "site-f-copilot",
  "Principe de développement des ChatBot": "site-f-chatbot",
  "Conception des SI avec MERISE ou UML": "site-f-uml",
};

/** Image reprise du site : à montrer en entier, sans recadrage. */
export function estAffiche(nom: NomPhoto): boolean {
  return nom.startsWith("site-f-");
}

/**
 * Couvertures des domaines reprises du site de HIT-T Institute (hittechnologie.com, accord du
 * cabinet du 9 novembre 2026) : cartes de l'accueil, comme sur le site. Originaux de 400 à 875 px,
 * trop petits pour le détail d'une formation.
 */
export const COUVERTURE_DOMAINE: Record<Domaine, NomPhoto> = {
  SISG: "site-sisg",
  "IA-Data": "site-ia-data",
  TRIT: "site-trit",
  TREB: "site-treb",
};

/** Photo propre à chaque domaine : repli du détail d'une formation sans thème reconnu. */
export const PHOTO_DOMAINE: Record<Domaine, NomPhoto> = {
  SISG: "bureau",
  "IA-Data": "code",
  TRIT: "reseau",
  // Pas encore de photo électricité ou bâtiment : celle du technicien en attendant.
  TREB: "maintenance",
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

/** Photo du détail d'une formation : celle du site, sinon celle de son thème, sinon du domaine. */
export function photoFormation(formation: Formation): NomPhoto {
  const duSite = IMAGE_SITE[formation.intitule];
  if (duSite) return duSite;
  const textes = [formation.intitule, formation.mots_cles.join(" ")].map((t) => t.toLowerCase());
  for (const texte of textes) {
    const theme = THEMES.find(([motif]) => motif.test(texte));
    if (theme) return theme[1];
  }
  return PHOTO_DOMAINE[formation.domaine];
}
