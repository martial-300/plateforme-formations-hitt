// HIT-T — design v2 (institutionnel) · étape 5 · Photos
// À coller dans le plugin Scripter, dans le fichier des maquettes HIT-T, puis Run.
// Ajoute des photos (bandeaux, domaines, détails, connexion) en les téléchargeant depuis Pexels. Une photo qui ne se charge pas laisse un cadre « Photo · … » où glisser votre image.
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

// ---------------------------------------------------------------- exécution

try {
  await initDesign(false);
  const s = await photos();
  if (s.echec === 0) out('✅ Photos placées : ' + s.ok + (s.deja ? ' (déjà présentes : ' + s.deja + ')' : ''));
  else out('⚠️ ' + s.ok + ' photo(s) placée(s), ' + s.echec + ' non chargée(s) : cadres « Photo · … » laissés vides. Relancez plus tard ou glissez vos images dedans.');
} catch (e) { out('❌ ' + e.message); }
