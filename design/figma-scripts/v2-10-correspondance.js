// HIT-T — design v2 (institutionnel) · étape 10 · Correction de la correspondance
// À coller dans le plugin Scripter, dans le fichier des maquettes HIT-T, puis Run.
// Corrige le surtitre « Correspondance » des recommandations et remplace les petits carrés par une jauge en 3 segments (composants, instances, détail 10, aperçus 09, 20 et M7).
// Peut être relancé sans risque : ce qui existe déjà n'est pas recréé.

const out = typeof print === 'function' ? print : console.log;
const load = async (p) => { if (p.loadAsync) await p.loadAsync(); };
const goTo = async (p) => { if (figma.setCurrentPageAsync) await figma.setCurrentPageAsync(p); else figma.currentPage = p; };

const PAGES = { fond: ['v2 · Fondations', 0, 'Fondations & composants'], desk: ['v2 · Écrans desktop', 1, 'Écrans desktop'], mob: ['v2 · Écrans mobile', 2, 'Écrans mobile'] };
// Police unique de la plateforme (repli sur Inter si absente)
const TITRES = ['IBM Plex Sans', 'Inter'];
const SANS = ['IBM Plex Sans', 'Inter'];

const COULEURS = {
  'couleur/vert/800': '#0F5236', 'couleur/vert/700': '#146B47', 'couleur/vert/600': '#1A8559', 'couleur/vert/100': '#D5E8DC', 'couleur/vert/50': '#EEF5F0',
  'couleur/orange/700': '#B83A12', 'couleur/orange/600': '#D84416', 'couleur/orange/50': '#FBEDE7',
  'couleur/jaune/500': '#F5D31B',
  'couleur/encre': '#1D1D1B', 'couleur/encre-2': '#4A4844', 'couleur/discret': '#6E6A62', 'couleur/blanc': '#FFFFFF',
  'couleur/fond': '#F6F4EF', 'couleur/fond-2': '#EFECE4', 'couleur/papier': '#FFFFFF',
  'couleur/filet': '#DCD7CC', 'couleur/filet-fort': '#BDB6A8',
  'couleur/danger': '#B3261E',
};
const RAYONS = { 'rayon/petit': 2, 'rayon/moyen': 4 };
// [nom, familles, graisse, taille, interligne, interlettrage %, casse]
const STYLES = [
  ['Display', TITRES, 'Bold', 40, 48, -1, 'ORIGINAL'],
  ['Titre 1', TITRES, 'Bold', 30, 38, -0.5, 'ORIGINAL'],
  ['Titre 2', TITRES, 'Semibold', 22, 30, 0, 'ORIGINAL'],
  ['Marque', TITRES, 'Bold', 19, 24, 0, 'ORIGINAL'],
  ['Titre 3', SANS, 'Semibold', 17, 24, 0, 'ORIGINAL'],
  ['Chapô', SANS, 'Regular', 18, 28, 0, 'ORIGINAL'],
  ['Corps', SANS, 'Regular', 15, 22, 0, 'ORIGINAL'],
  ['Corps fort', SANS, 'Semibold', 15, 22, 0, 'ORIGINAL'],
  ['Libellé', SANS, 'Semibold', 14, 20, 0, 'ORIGINAL'],
  ['Petit', SANS, 'Regular', 13, 18, 0, 'ORIGINAL'],
  ['Petit fort', SANS, 'Semibold', 13, 18, 0, 'ORIGINAL'],
  ['Surtitre', SANS, 'Bold', 12, 16, 8, 'UPPER'],
  ['Chiffre', TITRES, 'Bold', 44, 52, 0, 'ORIGINAL'],
  ['Rang', TITRES, 'Bold', 34, 40, 0, 'ORIGINAL'],
];

let V = {}, TS = {}, FP, DESK, MOB, FONTS;

// La formule Starter de Figma limite un fichier à 3 pages : la v2 est rangée dans des sections
// « v2 · … » placées sous le contenu existant des pages 1, 2 et 3 (créées seulement si absentes).
async function getZone(key, create) {
  const [name, idx, pageName] = PAGES[key];
  let page = figma.root.children[idx];
  if (!page) {
    if (!create) throw new Error('Page n° ' + (idx + 1) + ' introuvable : lancez d\'abord le script v2-01-fondations.js.');
    page = figma.createPage(); page.name = pageName;
  }
  await load(page);
  let sec = page.children.find((n) => n.type === 'SECTION' && n.name === name);
  if (!sec && !create) throw new Error('Zone « ' + name + ' » introuvable : lancez d\'abord le script v2-01-fondations.js, puis relancez celui-ci.');
  if (!sec) {
    sec = figma.createSection();
    sec.name = name;
    page.appendChild(sec);
    let bottom = 0;
    for (const c of page.children) if (c !== sec) bottom = Math.max(bottom, c.y + c.height);
    sec.x = 0; sec.y = bottom ? bottom + 400 : 0;
    sec.resizeWithoutConstraints(2000, 1200);
  }
  return { page, sec };
}

// Ajuste la section à son contenu
function fit(sec) {
  let r = 0, b = 0;
  for (const c of sec.children) { r = Math.max(r, c.x + c.width); b = Math.max(b, c.y + c.height); }
  sec.resizeWithoutConstraints(Math.max(r + 80, 400), Math.max(b + 80, 400));
}

function pickFont(families, weight) {
  const want = { Regular: ['regular'], Semibold: ['semibold', 'semi bold', 'demibold', 'medium'], Bold: ['bold'] }[weight];
  for (const fam of families) {
    const styles = FONTS.filter((f) => f.fontName.family === fam).map((f) => f.fontName.style);
    for (const w of want) { const s = styles.find((x) => x.toLowerCase() === w); if (s) return { family: fam, style: s }; }
  }
  return { family: 'Inter', style: weight === 'Semibold' ? 'Semi Bold' : weight };
}

const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });

// Variables, styles et polices. create = true : crée ce qui manque (script 01).
async function initDesign(create) {
  FONTS = await figma.listAvailableFontsAsync();
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  let col = cols.find((c) => c.name === 'HIT-T v2');
  if (!col && !create) throw new Error('Collection « HIT-T v2 » introuvable : lancez d\'abord le script 01.');
  if (!col) col = figma.variables.createVariableCollection('HIT-T v2');
  const mode = col.modes[0].modeId;
  V = {};
  for (const id of col.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); V[v.name] = v; }
  if (create) {
    for (const [n, h] of Object.entries(COULEURS)) {
      if (!V[n]) { V[n] = figma.variables.createVariable(n, col, 'COLOR'); V[n].scopes = ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR']; }
      V[n].setValueForMode(mode, hex(h));
    }
    for (const [n, r] of Object.entries(RAYONS)) {
      if (!V[n]) { V[n] = figma.variables.createVariable(n, col, 'FLOAT'); V[n].scopes = ['CORNER_RADIUS']; }
      V[n].setValueForMode(mode, r);
    }
  }
  const existing = {};
  for (const s of await figma.getLocalTextStylesAsync()) existing[s.name] = s;
  TS = {};
  for (const [name, fams, w, size, lh, ls, tcase] of STYLES) {
    const full = 'HIT-T v2/' + name;
    let s = existing[full];
    if (!s && !create) throw new Error('Style « ' + full + ' » introuvable : lancez d\'abord le script 01.');
    if (!s || create) {
      // Création, ou mise à jour d'un style existant (ex. ancienne police) lors du script 01
      const fn = pickFont(fams, w);
      await figma.loadFontAsync(fn);
      if (!s) { s = figma.createTextStyle(); s.name = full; }
      s.fontName = fn;
      s.fontSize = size;
      s.lineHeight = { unit: 'PIXELS', value: lh };
      s.letterSpacing = { unit: 'PERCENT', value: ls };
      s.textCase = tcase;
    }
    await figma.loadFontAsync(s.fontName);
    TS[name] = s;
  }
  return col;
}

const fill = (n) => {
  if (!V[n]) throw new Error('Variable introuvable : ' + n);
  return [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[n])];
};

async function txt(s, style, color = 'couleur/encre') {
  const t = figma.createText();
  t.fontName = TS[style].fontName;
  await t.setTextStyleIdAsync(TS[style].id);
  t.characters = s;
  t.fills = fill(color);
  return t;
}

const rad = (n, r = 'rayon/petit') => { for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) n.setBoundVariable(k, V[r]); };

function AL(dir, o = {}) {
  const f = figma.createFrame();
  f.resize(1, 1);
  f.layoutMode = dir;
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.fills = [];
  f.clipsContent = false;
  if (o.name) f.name = o.name;
  if (o.gap != null) f.itemSpacing = o.gap;
  return f;
}

const pad = (f, v, h = v) => { f.paddingTop = f.paddingBottom = v; f.paddingLeft = f.paddingRight = h; };

function setW(f, w) {
  f.resize(w, Math.max(f.height, 1));
  if (f.parent && f.parent.type !== 'PAGE' && 'layoutMode' in f.parent && f.parent.layoutMode !== 'NONE') f.layoutSizingHorizontal = 'FIXED';
  if ('layoutMode' in f && f.layoutMode !== 'NONE') {
    if (f.layoutMode === 'VERTICAL') { f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO'; }
    else { f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO'; }
  }
}

function setH(f, h) {
  f.resize(Math.max(f.width, 1), h);
  if (f.layoutMode === 'HORIZONTAL') { f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'FIXED'; }
  else if (f.layoutMode === 'VERTICAL') { f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO'; }
}

function append(parent, child, h = 'FILL') { parent.appendChild(child); if (h) child.layoutSizingHorizontal = h; return child; }
function spacer(parent) { const s = AL('HORIZONTAL', { name: 'Espace' }); parent.appendChild(s); s.layoutSizingHorizontal = 'FILL'; return s; }

async function para(parent, s, style, color) {
  const t = await txt(s, style, color);
  parent.appendChild(t);
  t.textAutoResize = 'HEIGHT';
  t.layoutSizingHorizontal = 'FILL';
  return t;
}

function rule(parent, color = 'couleur/filet') {
  const r = figma.createRectangle();
  r.name = 'Filet';
  r.resize(100, 1);
  r.fills = fill(color);
  parent.appendChild(r);
  r.layoutSizingHorizontal = 'FILL';
  return r;
}

function stroke(f, color, w = 1, sides) {
  f.strokes = fill(color);
  f.strokeAlign = 'INSIDE';
  if (!sides) { f.strokeWeight = w; return; }
  f.strokeTopWeight = sides.includes('t') ? w : 0;
  f.strokeBottomWeight = sides.includes('b') ? w : 0;
  f.strokeLeftWeight = sides.includes('l') ? w : 0;
  f.strokeRightWeight = sides.includes('r') ? w : 0;
}

function panel(name, p = 24) {
  const c = AL('VERTICAL', { name, gap: 16 });
  pad(c, p);
  c.fills = fill('couleur/papier');
  rad(c);
  return c;
}

// Encadré d'information : fond vert pâle et filet gauche
function encadre(name) {
  const c = AL('VERTICAL', { name, gap: 8 });
  c.paddingTop = c.paddingBottom = 16; c.paddingLeft = 20; c.paddingRight = 20;
  c.fills = fill('couleur/papier');
  stroke(c, 'couleur/vert/600', 4, 'l');
  return c;
}

const isMain = (x) => x.type === 'COMPONENT_SET' || (x.type === 'COMPONENT' && !(x.parent && x.parent.type === 'COMPONENT_SET'));
function comp(name, optional = false) {
  const n = FP.findOne((x) => isMain(x) && x.name === name);
  if (!n && !optional) throw new Error('Composant introuvable : « ' + name + ' » (lancez d\'abord le script 01).');
  return n;
}

async function icon(n, size = 18, color) {
  const i = comp('Icône/' + n).createInstance();
  i.resize(size, size);
  if (color) for (const c of i.findAll((x) => 'strokes' in x && x.strokes.length)) c.strokes = fill(color);
  return i;
}

const pk = (set, name) => Object.keys(set.componentPropertyDefinitions).find((k) => k.split('#')[0] === name);

function inst(set, variantName, props = {}) {
  const c = set.type === 'COMPONENT_SET'
    ? (variantName ? set.children.find((x) => x.name === variantName) : set.defaultVariant)
    : set;
  if (!c) throw new Error('Variante introuvable : ' + variantName + ' dans ' + set.name);
  const i = c.createInstance();
  const p = {};
  for (const [k, v] of Object.entries(props)) { const key = pk(set, k); if (key) p[key] = v; }
  if (Object.keys(p).length) i.setProperties(p);
  return i;
}

// Change la variante d'instances imbriquées appartenant au jeu « setName »
async function setNested(node, setName, prop, value) {
  const set = comp(setName);
  for (const n of node.findAll((x) => x.type === 'INSTANCE')) {
    const mc = await n.getMainComponentAsync();
    if (mc && mc.parent && mc.parent.id === set.id) n.setProperties({ [prop]: value });
  }
}

async function setWords(node, words) {
  const set = comp('Mot-clé');
  const tags = [];
  for (const n of node.findAll((x) => x.type === 'INSTANCE')) {
    const mc = await n.getMainComponentAsync();
    if (mc && mc.parent && mc.parent.id === set.id) tags.push(n);
  }
  tags.forEach((t, k) => { if (k < words.length) t.setProperties({ [pk(set, 'Mot')]: words[k] }); else t.visible = false; });
}

// Correspondance affichée à l'apprenant (le score reste en base)
function correspondance(score) {
  if (score >= 0.40) return ['Très proche de votre profil', 3];
  if (score >= 0.30) return ['Proche de votre profil', 2];
  return ['Peut vous intéresser', 1];
}
function setLevel(node, level) {
  for (let k = 1; k <= 3; k++) { const sq = node.findOne((n) => n.name === 'Niveau ' + k); if (sq) sq.fills = fill(k <= level ? 'couleur/vert/600' : 'couleur/filet'); }
}

// Jauge de correspondance : 3 segments sur toute la largeur, libellé en dessous
async function jauge(parent, level, label, width, style = 'Corps fort') {
  const j = AL('VERTICAL', { name: 'Correspondance', gap: 6 });
  parent.appendChild(j);
  if (width) setW(j, width); else j.layoutSizingHorizontal = 'FILL';
  const bar = AL('HORIZONTAL', { name: 'Niveau', gap: 3 }); append(j, bar);
  for (let k = 1; k <= 3; k++) {
    const r = figma.createRectangle(); r.name = 'Niveau ' + k; r.resize(20, 6);
    r.fills = fill(k <= level ? 'couleur/vert/600' : 'couleur/filet'); bar.appendChild(r); r.layoutSizingHorizontal = 'FILL';
  }
  const t = await txt(label, style, 'couleur/vert/700'); t.name = 'Correspondance'; j.appendChild(t);
  t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL';
  return j;
}

function setActive(header, label) {
  for (const l of header.findAll((n) => n.type === 'FRAME' && n.name.startsWith('Lien · '))) {
    const ind = l.findOne((n) => n.name === 'Indicateur');
    if (ind) ind.visible = l.name === 'Lien · ' + label;
  }
}

function rightOf(pageNode, gap = 100) {
  let x = 0;
  for (const c of pageNode.children) x = Math.max(x, c.x + c.width);
  return pageNode.children.length ? x + gap : 0;
}

function exists(pageNode, name) { return !!pageNode.findOne((n) => n.type === 'FRAME' && n.parent === pageNode && n.name === name); }

// ---------------------------------------------------------------- correction de la correspondance

const niveauDe = (label) => (label.startsWith('Très proche') ? 3 : label.startsWith('Proche') ? 2 : 1);
const dansInstance = (n) => { for (let p = n.parent; p; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
const ancienneJauge = (row) => { const n = row.children.find((c) => c.name === 'Niveau'); return !!(n && n.layoutMode === 'HORIZONTAL' && row.layoutMode === 'HORIZONTAL'); };
const styleNom = (t) => { for (const [k, s] of Object.entries(TS)) if (s.id === t.textStyleId) return k; return 'Corps fort'; };

async function chargerPolice(t) {
  if (t.fontName === figma.mixed) { for (const s of t.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(s.fontName); }
  else await figma.loadFontAsync(t.fontName);
}

// Remplace une ancienne ligne « carrés + libellé » par la jauge ; garde la liaison de propriété du libellé
async function remplacer(row, width) {
  const parent = row.parent, idx = parent.children.indexOf(row);
  const old = row.findOne((c) => c.type === 'TEXT');
  const label = old ? old.characters : 'Très proche de votre profil';
  const refs = old && old.componentPropertyReferences;
  const j = await jauge(parent, niveauDe(label), label, width, old ? styleNom(old) : 'Corps fort');
  parent.insertChild(idx, j);
  if (!width) j.layoutSizingHorizontal = 'FILL';
  if (refs && refs.characters) j.findOne((c) => c.type === 'TEXT').componentPropertyReferences = { characters: refs.characters };
  row.remove();
  return j;
}

async function corrigerCorrespondance() {
  const zf = await getZone('fond', false); FP = zf.sec;
  const zd = await getZone('desk', false); DESK = zd.sec;
  const zm = await getZone('mob', false); MOB = zm.sec;
  const stats = { composants: 0, instances: 0, autres: 0, surtitres: 0 };

  // 1. Composants Recommandation et Recommandation mobile
  await goTo(zf.page);
  const sets = ['Recommandation', 'Recommandation mobile'].map((n) => comp(n, true)).filter(Boolean);
  for (const set of sets) {
    for (const v of set.children) {
      const side = v.findOne((n) => n.type === 'FRAME' && n.name === 'Avis');
      if (!side) continue;
      const sur = side.children[0];
      if (sur && sur.type === 'TEXT' && (sur.characters !== 'Correspondance' || (sur.componentPropertyReferences && sur.componentPropertyReferences.characters))) {
        await chargerPolice(sur);
        sur.componentPropertyReferences = {};
        sur.characters = 'Correspondance';
        sur.name = 'Titre correspondance';
        stats.surtitres++;
      }
      const row = side.children.find((c) => c.type === 'FRAME' && c.name === 'Correspondance');
      if (row && ancienneJauge(row)) { await remplacer(row, null); stats.composants++; }
    }
  }

  // 2. Instances et lignes « Correspondance » hors composants, sur les pages d'écrans
  for (const [zone, sec] of [[zd, DESK], [zm, MOB]]) {
    await goTo(zone.page);
    for (const i of sec.findAll((n) => n.type === 'INSTANCE' && (n.name === 'Recommandation' || n.name === 'Recommandation mobile'))) {
      const side = i.findOne((n) => n.name === 'Avis');
      const sur = side && side.children[0];
      if (sur && sur.type === 'TEXT' && sur.characters !== 'Correspondance') { await chargerPolice(sur); sur.characters = 'Correspondance'; }
      const lab = side && side.findOne((n) => n.type === 'TEXT' && n.name === 'Correspondance');
      if (lab) { setLevel(i, niveauDe(lab.characters)); stats.instances++; }
    }
    for (const row of sec.findAll((n) => n.type === 'FRAME' && n.name === 'Correspondance')) {
      if (dansInstance(row) || !ancienneJauge(row)) continue;
      const enEncadre = row.parent && row.parent.name === 'Pourquoi cette formation vous est proposée';
      await remplacer(row, enEncadre ? 320 : 200);
      stats.autres++;
    }
    fit(sec);
  }
  return stats;
}

// ---------------------------------------------------------------- exécution

try {
  await initDesign(false);
  const s = await corrigerCorrespondance();
  const total = s.composants + s.autres + s.surtitres;
  out(total ? '✅ Correspondance corrigée : ' + s.surtitres + ' surtitre(s), ' + s.composants + ' variante(s), ' + s.autres + ' autre(s) bloc(s), niveau remis sur ' + s.instances + ' recommandation(s)' : 'ℹ️ Rien à corriger (déjà à jour)');
} catch (e) { out('❌ ' + e.message); }
