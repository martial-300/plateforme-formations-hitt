// HIT-T — design v2 (institutionnel) · étape 6 · Textes (transparence)
// À coller dans le plugin Scripter, dans le fichier des maquettes HIT-T, puis Run.
// Remplace dans le fichier existant les phrases qui parlent des recommandations (écrans apprenant et visiteur) : elles précisent que le calcul est automatique et qu'un conseiller peut aider. Inutile si les écrans ont été créés avec la version actuelle des scripts 02 à 04.
// Peut être relancé sans risque : ce qui existe déjà n'est pas recréé.

const out = typeof print === 'function' ? print : console.log;
const load = async (p) => { if (p.loadAsync) await p.loadAsync(); };

// ---------------------------------------------------------------- retouche des textes (transparence)

const RETOUCHES = [
  [
    "Établies le 24 octobre 2026 à partir de votre questionnaire, de la plus proche à la moins proche de votre profil.",
    "Propositions calculées automatiquement le 24 octobre 2026 à partir de votre questionnaire, de la plus proche à la moins proche de votre profil. Un conseiller du cabinet peut vous aider à choisir."
  ],
  [
    "De la plus proche à la moins proche de votre profil.",
    "Calculées automatiquement à partir de vos réponses. Un conseiller peut vous aider à choisir."
  ],
  [
    "Le calcul compare les mots de vos réponses à ceux de chaque formation. Il ne retient que le format choisi et les formations dans votre budget.",
    "Le classement est automatique : il compare les mots de vos réponses à ceux de chaque formation et ne retient que le format choisi et les formations dans votre budget. Vos avis servent à l'améliorer."
  ],
  [
    "Répondez à six questions sur votre parcours et vos objectifs : la plateforme compare votre profil aux 86 formations de HIT-T Institute et vous indique les cinq plus adaptées.",
    "Répondez à six questions sur votre parcours et vos objectifs : la plateforme compare automatiquement votre profil aux 86 formations de HIT-T Institute et vous indique les cinq plus adaptées."
  ],
  [
    "Répondez au questionnaire : nous vous proposons les cinq formations les plus proches de votre profil.",
    "Répondez au questionnaire : la plateforme sélectionne automatiquement les cinq formations les plus proches de votre profil. Un conseiller du cabinet peut aussi vous aider."
  ],
  [
    "Le paiement se fait auprès du cabinet. Créez un compte pour savoir si cette formation correspond à votre profil.",
    "Le paiement se fait auprès du cabinet. Créez un compte et répondez au questionnaire : la plateforme vous dira automatiquement si cette formation correspond à votre profil."
  ],
  [
    "Répondez au questionnaire pour recevoir cinq propositions.",
    "Répondez au questionnaire pour recevoir cinq propositions calculées automatiquement."
  ],
  [
    "Secrétariat et gestion, intelligence artificielle et data, informatique et télécoms : répondez à six questions pour savoir quelles formations vous correspondent.",
    "Secrétariat et gestion, intelligence artificielle et data, informatique et télécoms : répondez à six questions, la plateforme vous indique automatiquement les formations qui vous correspondent."
  ],
  [
    "Le paiement se fait auprès du cabinet. Créez un compte pour savoir si ce parcours correspond à votre profil.",
    "Le paiement se fait auprès du cabinet. Créez un compte et répondez au questionnaire : la plateforme vous dira automatiquement si ce parcours correspond à votre profil."
  ]
];

async function retoucherTextes() {
  let n = 0;
  for (const page of figma.root.children) {
    await load(page);
    for (const t of page.findAll((x) => x.type === 'TEXT')) {
      const r = RETOUCHES.find(([o]) => t.characters === o);
      if (!r) continue;
      if (t.fontName === figma.mixed) { for (const s of t.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(s.fontName); }
      else await figma.loadFontAsync(t.fontName);
      t.characters = r[1];
      n++;
    }
  }
  return n;
}

// ---------------------------------------------------------------- exécution

try {
  const n = await retoucherTextes();
  out(n ? '✅ ' + n + ' texte(s) mis à jour' : 'ℹ️ Aucun texte à modifier (déjà à jour)');
} catch (e) { out('❌ ' + e.message); }
