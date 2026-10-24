// HIT-T — design v2 (institutionnel) · étape 6 · Textes (transparence)
// À coller dans le plugin Scripter, dans le fichier des maquettes HIT-T, puis Run.
// Remplace dans le fichier existant les 3 phrases qui expliquent les recommandations : elles précisent que le calcul est automatique et qu'un conseiller peut aider. Inutile si les écrans ont été créés avec la version actuelle des scripts 02 à 04.
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
