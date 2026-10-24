// HIT-T — design v2 (institutionnel) · étape 8 · Illustrations
// À coller dans le plugin Scripter, dans le fichier des maquettes HIT-T, puis Run.
// Ajoute 8 illustrations vectorielles (accueil, catalogue, essai, aperçu, aucun résultat, 404, mobile) et un bandeau photo sur l'essai sans compte.
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

const ILLUS = {"questionnaire": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"360\" height=\"220\" viewBox=\"0 0 360 220\" fill=\"none\" stroke=\"#1D1D1B\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<rect x=\"0\" y=\"0\" width=\"360\" height=\"220\" fill=\"#EFECE4\" stroke=\"none\"/>\n<circle cx=\"292\" cy=\"58\" r=\"30\" fill=\"#D5E8DC\" stroke=\"none\"/>\n<rect x=\"110\" y=\"34\" width=\"132\" height=\"164\" rx=\"6\" fill=\"#FFFFFF\"/>\n<rect x=\"148\" y=\"24\" width=\"56\" height=\"20\" rx=\"4\" fill=\"#1A8559\"/>\n<path d=\"M132 70 H220\" stroke-width=\"3\"/>\n<rect x=\"132\" y=\"88\" width=\"88\" height=\"18\" rx=\"2\" fill=\"#EFECE4\"/>\n<rect x=\"132\" y=\"116\" width=\"88\" height=\"18\" rx=\"2\" fill=\"#EFECE4\"/>\n<circle cx=\"139\" cy=\"153\" r=\"6\" fill=\"#1A8559\"/><path d=\"M152 153 H200\"/>\n<circle cx=\"139\" cy=\"174\" r=\"6\"/><path d=\"M152 174 H192\"/>\n<path d=\"M248 176 L286 104 l14 7 -38 72 -16 8 z\" fill=\"#F5D31B\"/>\n<path d=\"M281 114 l14 7\"/>\n<path d=\"M60 190 H300\" stroke=\"#BDB6A8\"/>\n</svg>\n", "introuvable": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"360\" height=\"220\" viewBox=\"0 0 360 220\" fill=\"none\" stroke=\"#1D1D1B\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<rect x=\"0\" y=\"0\" width=\"360\" height=\"220\" fill=\"#EFECE4\" stroke=\"none\"/>\n<path d=\"M40 196 H320\" stroke=\"#BDB6A8\"/>\n<path d=\"M180 40 V196\" stroke-width=\"4\"/>\n<path d=\"M184 56 H262 l16 14 -16 14 H184 Z\" fill=\"#1A8559\"/>\n<path d=\"M176 98 H104 l-16 14 16 14 H140 l6 -6 6 8 6 -8 H176 Z\" fill=\"#FFFFFF\"/>\n<path d=\"M150 132 l-8 34 M160 130 l6 30\" stroke=\"#BDB6A8\"/>\n<circle cx=\"180\" cy=\"36\" r=\"6\" fill=\"#F5D31B\"/>\n<path d=\"M206 70 H246\" stroke=\"#FFFFFF\" stroke-width=\"3\"/>\n</svg>\n", "parcours": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"360\" height=\"220\" viewBox=\"0 0 360 220\" fill=\"none\" stroke=\"#1D1D1B\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<rect x=\"0\" y=\"0\" width=\"360\" height=\"220\" fill=\"#EFECE4\" stroke=\"none\"/>\n<path d=\"M78 112 H140 M220 112 H282\" stroke=\"#1A8559\" stroke-dasharray=\"2 7\"/>\n<rect x=\"22\" y=\"62\" width=\"88\" height=\"104\" rx=\"4\" fill=\"#FFFFFF\"/>\n<circle cx=\"66\" cy=\"96\" r=\"14\" fill=\"#D5E8DC\"/>\n<path d=\"M44 140 c4-14 40-14 44 0\" fill=\"#D5E8DC\"/>\n<rect x=\"136\" y=\"48\" width=\"88\" height=\"128\" rx=\"4\" fill=\"#FFFFFF\"/>\n<rect x=\"162\" y=\"40\" width=\"36\" height=\"14\" rx=\"3\" fill=\"#1A8559\" stroke=\"#1D1D1B\"/>\n<rect x=\"150\" y=\"74\" width=\"10\" height=\"10\" rx=\"2\" fill=\"#F5D31B\"/><path d=\"M168 79 H208\"/>\n<rect x=\"150\" y=\"98\" width=\"10\" height=\"10\" rx=\"2\" fill=\"#F5D31B\"/><path d=\"M168 103 H200\"/>\n<rect x=\"150\" y=\"122\" width=\"10\" height=\"10\" rx=\"2\"/><path d=\"M168 127 H206\"/>\n<rect x=\"150\" y=\"146\" width=\"10\" height=\"10\" rx=\"2\"/><path d=\"M168 151 H196\"/>\n<path d=\"M151 79 l3 3 5-6 M151 103 l3 3 5-6\" stroke=\"#1D1D1B\"/>\n<rect x=\"250\" y=\"62\" width=\"88\" height=\"104\" rx=\"4\" fill=\"#FFFFFF\"/>\n<path d=\"M264 84 H324\" stroke=\"#1A8559\" stroke-width=\"6\"/>\n<path d=\"M264 106 H312\" stroke=\"#1A8559\" stroke-width=\"6\" opacity=\".7\"/>\n<path d=\"M264 128 H300\" stroke=\"#1A8559\" stroke-width=\"6\" opacity=\".45\"/>\n<path d=\"M264 150 H290\" stroke=\"#1A8559\" stroke-width=\"6\" opacity=\".25\"/>\n<circle cx=\"326\" cy=\"62\" r=\"12\" fill=\"#F5D31B\"/>\n<path d=\"M320 62 l4 4 8-8\"/>\n</svg>\n", "choix": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"360\" height=\"220\" viewBox=\"0 0 360 220\" fill=\"none\" stroke=\"#1D1D1B\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<rect x=\"0\" y=\"0\" width=\"360\" height=\"220\" fill=\"#EFECE4\" stroke=\"none\"/>\n<rect x=\"44\" y=\"70\" width=\"80\" height=\"110\" rx=\"4\" fill=\"#FFFFFF\"/>\n<rect x=\"140\" y=\"50\" width=\"80\" height=\"130\" rx=\"4\" fill=\"#FFFFFF\" stroke-width=\"3\"/>\n<rect x=\"236\" y=\"70\" width=\"80\" height=\"110\" rx=\"4\" fill=\"#FFFFFF\"/>\n<path d=\"M58 92 H110 M58 108 H100 M254 92 H302 M254 108 H290\" stroke=\"#BDB6A8\"/>\n<path d=\"M154 74 H206 M154 90 H196\" />\n<rect x=\"154\" y=\"138\" width=\"52\" height=\"24\" rx=\"3\" fill=\"#1A8559\"/>\n<circle cx=\"220\" cy=\"50\" r=\"14\" fill=\"#F5D31B\"/>\n<path d=\"M213 50 l5 5 9-9\"/>\n<path d=\"M30 196 H330\" stroke=\"#BDB6A8\"/>\n</svg>\n", "vide": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"360\" height=\"220\" viewBox=\"0 0 360 220\" fill=\"none\" stroke=\"#1D1D1B\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<rect x=\"0\" y=\"0\" width=\"360\" height=\"220\" fill=\"#EFECE4\" stroke=\"none\"/>\n<path d=\"M70 170 H250 L232 128 H88 Z\" fill=\"#FFFFFF\"/>\n<path d=\"M88 128 V100 M232 128 V100\" stroke=\"#BDB6A8\" stroke-dasharray=\"3 6\"/>\n<path d=\"M70 170 V186 H250 V170\" fill=\"#D5E8DC\"/>\n<circle cx=\"230\" cy=\"88\" r=\"34\" fill=\"#FFFFFF\" stroke-width=\"3\"/>\n<path d=\"M254 112 L286 144\" stroke-width=\"8\" stroke=\"#1A8559\"/>\n<path d=\"M218 80 q12-12 24 0\" stroke=\"#BDB6A8\"/>\n<path d=\"M120 190 H300\" stroke=\"#BDB6A8\"/>\n</svg>\n", "compte": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"360\" height=\"220\" viewBox=\"0 0 360 220\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<rect x=\"0\" y=\"0\" width=\"360\" height=\"220\" fill=\"#0F5236\" stroke=\"none\"/>\n<rect x=\"96\" y=\"54\" width=\"168\" height=\"112\" rx=\"6\" fill=\"#146B47\"/>\n<circle cx=\"140\" cy=\"100\" r=\"18\" fill=\"#D5E8DC\" stroke=\"none\"/>\n<path d=\"M116 146 c6-20 42-20 48 0\" fill=\"#D5E8DC\" stroke=\"none\"/>\n<path d=\"M182 92 H240 M182 110 H226 M182 128 H234\" stroke=\"#D5E8DC\"/>\n<circle cx=\"258\" cy=\"58\" r=\"18\" fill=\"#F5D31B\" stroke=\"#0F5236\"/>\n<path d=\"M249 58 l6 6 11-11\" stroke=\"#0F5236\" stroke-width=\"3\"/>\n</svg>\n"};

// ---------------------------------------------------------------- photos

// Photos d'illustration libres de droits (licence Pexels : usage gratuit, sans attribution obligatoire).
// À remplacer de préférence par de vraies photos du centre HIT-T : glisser une image sur le cadre « Photo · … ».
const PEXELS = (id) => 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.jpeg?auto=compress&cs=tinysrgb&w=1600';
const PHOTOS = {
  classe: { url: PEXELS(31820972), desc: 'séance de formation en salle (Aristide Ouedraogo, Pexels)' },
  etudiants: { url: PEXELS(34162714), desc: 'apprenants en cours (Pexels)' },
  groupe: { url: PEXELS(5940713), desc: 'apprenants autour d\'un ordinateur portable (Pexels)' },
  bureau: { url: PEXELS(20209020), desc: 'travail de bureau, secrétariat (Pexels)' },
  code: { url: PEXELS(19805876), desc: 'programmation sur ordinateur (Pexels)' },
  reseau: { url: PEXELS(442150), desc: 'câblage d\'une baie réseau (Field Engineer, Pexels)' },
};

const IMG = {};
const STATS = { ok: 0, echec: 0, deja: 0 };

async function imageFill(key) {
  if (!(key in IMG)) {
    try { const im = await figma.createImageAsync(PHOTOS[key].url); IMG[key] = im.hash; }
    catch (e) { IMG[key] = null; }
  }
  return IMG[key] ? [{ type: 'IMAGE', imageHash: IMG[key], scaleMode: 'FILL' }] : null;
}

// Crée (ou complète) un cadre photo nommé ; parent auto-layout, inséré à l'index donné.
async function photo(parent, index, key, h, name) {
  const full = 'Photo · ' + name;
  let f = parent.findOne((n) => n.name === full && n.parent === parent);
  if (f && f.fills.some && f.fills.some((p) => p.type === 'IMAGE')) { STATS.deja++; return f; }
  if (!f) {
    f = figma.createFrame();
    f.name = full;
    f.layoutMode = 'VERTICAL'; f.primaryAxisAlignItems = 'CENTER'; f.counterAxisAlignItems = 'CENTER';
    f.resize(100, h);
    f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED';
    f.clipsContent = true;
    parent.insertChild(Math.min(index, parent.children.length), f);
    f.layoutSizingHorizontal = 'FILL';
  }
  const fills = await imageFill(key);
  const label = f.findOne((n) => n.type === 'TEXT' && n.name === 'Légende');
  if (fills) { f.fills = fills; if (label) label.remove(); STATS.ok++; }
  else {
    f.fills = fill('couleur/fond-2');
    if (!label) { const t = await txt('Photo à placer : ' + PHOTOS[key].desc, 'Petit', 'couleur/discret'); t.name = 'Légende'; f.appendChild(t); }
    STATS.echec++;
  }
  return f;
}

const child = (root, name, type = 'FRAME') => root && root.findOne((n) => n.type === type && n.name === name);
const screenNamed = (sec, prefix) => sec.children.find((n) => n.type === 'FRAME' && n.name.startsWith(prefix));

async function photos() {
  FP = (await getZone('fond', false)).sec;
  const zd = await getZone('desk', false); DESK = zd.sec;
  const zm = await getZone('mob', false); MOB = zm.sec;
  await goTo(zd.page);

  // Bandeaux pleine largeur juste sous l'en-tête
  const accueil = screenNamed(DESK, '09 ·');
  if (accueil) {
    await photo(accueil, 1, 'classe', 440, 'Accueil — bandeau');
    for (const [d, key] of [['SISG', 'bureau'], ['IA-Data', 'code'], ['TRIT', 'reseau']]) {
      const p = child(accueil, 'Domaine ' + d);
      if (p) await photo(p, 0, key, 180, 'Domaine ' + d);
    }
  }
  const cat = screenNamed(DESK, '03 ·');
  if (cat) await photo(cat, 1, 'etudiants', 260, 'Catalogue — bandeau');

  // Connexion / inscription : photo sous les étapes
  for (const [prefix, key] of [['01 ·', 'groupe'], ['02 ·', 'etudiants'], ['14 ·', 'groupe'], ['15 ·', 'etudiants']]) {
    const sc = screenNamed(DESK, prefix);
    const col = child(sc, 'Présentation');
    if (col) await photo(col, col.children.length, key, 260, 'Espace apprenant');
  }

  // Détails : grande photo sous le titre
  for (const [prefix, key] of [['04 ·', 'code'], ['10 ·', 'code'], ['11 ·', 'reseau']]) {
    const sc = screenNamed(DESK, prefix);
    const col = child(sc, 'Formation');
    if (col) await photo(col, 1, key, 340, 'Formation');
  }

  // Questionnaire : photo dans la colonne d'introduction
  const q = screenNamed(DESK, '05 ·');
  const qi = child(q, 'Introduction');
  if (qi) await photo(qi, qi.children.length, 'groupe', 220, 'Questionnaire');
  fit(DESK);

  // Mobile
  await goTo(zm.page);
  const m1 = screenNamed(MOB, 'M1 ·');
  if (m1) await photo(m1, 2, 'etudiants', 180, 'Catalogue — bandeau');
  const m4 = screenNamed(MOB, 'M4 ·');
  const m4b = child(m4, 'Contenu');
  if (m4b) await photo(m4b, 2, 'code', 200, 'Formation');
  fit(MOB);
  return STATS;
}

// ---------------------------------------------------------------- illustrations

// Illustrations vectorielles maison (aux couleurs du logo), modifiables dans Figma.
async function illus(parent, index, key, width, name) {
  const full = 'Illustration · ' + name;
  if (!parent || parent.findOne((n) => n.name === full && n.parent === parent)) return false;
  const f = figma.createNodeFromSvg(ILLUS[key]);
  f.name = full;
  f.rescale(width / f.width);
  parent.insertChild(Math.min(index, parent.children.length), f);
  return true;
}

async function illustrations() {
  FP = (await getZone('fond', false)).sec;
  const zd = await getZone('desk', false); DESK = zd.sec;
  const zm = await getZone('mob', false); MOB = zm.sec;
  let n = 0;
  await goTo(zd.page);
  const scr = (p) => screenNamed(DESK, p);
  const how = child(scr('09 ·'), 'Fonctionnement');
  const howT = how && how.children.find((c) => c.name === 'Titre');
  if (await illus(howT, 0, 'parcours', 380, 'Parcours')) n++;
  const cat = child(scr('03 ·'), 'Aide au choix');
  if (await illus(cat, 0, 'choix', 340, 'Aide au choix')) n++;
  const essai = scr('19 ·');
  const eIntro = child(essai, 'Introduction');
  if (await illus(eIntro, 1, 'questionnaire', 380, 'Questionnaire')) n++;
  // Aperçu : texte à gauche, illustration à droite
  const ver = child(scr('20 ·'), 'Réservé aux inscrits');
  if (ver && !ver.findOne((x) => x.name === 'Illustration · Compte')) {
    const kids = [...ver.children].map((k) => [k, k.layoutSizingHorizontal]);
    const col = AL('VERTICAL', { name: 'Texte', gap: ver.itemSpacing });
    ver.layoutMode = 'HORIZONTAL'; ver.itemSpacing = 32; ver.counterAxisAlignItems = 'CENTER';
    ver.appendChild(col); col.layoutSizingHorizontal = 'FILL';
    for (const [k, sizing] of kids) { col.appendChild(k); if (sizing === 'FILL') k.layoutSizingHorizontal = 'FILL'; }
    ver.layoutSizingHorizontal = 'FILL'; ver.layoutSizingVertical = 'HUG';
    const note = col.findOne((x) => x.type === 'TEXT' && x.characters.startsWith('Vos réponses seront'));
    if (note) { note.textAutoResize = 'HEIGHT'; note.layoutSizingHorizontal = 'FILL'; }
    if (await illus(ver, 1, 'compte', 260, 'Compte')) n++;
  }
  const vide = child(scr('12 ·'), 'Aucun résultat');
  if (await illus(vide, 0, 'vide', 360, 'Aucun résultat')) n++;
  const nf = child(scr('18 ·'), 'Message');
  if (await illus(nf, 0, 'introuvable', 360, 'Page introuvable')) n++;
  if (essai) await photo(essai, 1, 'classe', 240, 'Essai — bandeau');
  fit(DESK);
  await goTo(zm.page);
  const m1c = child(screenNamed(MOB, 'M1 ·'), 'Aide au choix');
  if (await illus(m1c, 0, 'choix', 300, 'Aide au choix')) n++;
  const m7v = child(screenNamed(MOB, 'M7 ·'), 'Réservé aux inscrits');
  if (await illus(m7v, 0, 'compte', 200, 'Compte')) n++;
  fit(MOB);
  return { illus: n, photos: STATS };
}

// ---------------------------------------------------------------- exécution

try {
  await initDesign(false);
  const r = await illustrations();
  const p = r.photos.echec ? ' · photo non chargée : cadre « Photo · … » laissé vide' : '';
  out(r.illus ? '✅ ' + r.illus + ' illustration(s) ajoutée(s)' + p : 'ℹ️ Illustrations déjà présentes : rien à faire' + p);
} catch (e) { out('❌ ' + e.message); }
