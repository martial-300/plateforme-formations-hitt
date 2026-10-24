// HIT-T — design v2 (institutionnel) · étape 9 · Connexion avec Google
// À coller dans le plugin Scripter, dans le fichier des maquettes HIT-T, puis Run.
// Crée le composant « Bouton Google » et l'ajoute en haut des formulaires de connexion et d'inscription (01, 02, 14, 15, M5).
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

// ---------------------------------------------------------------- connexion avec Google

// Logo « G » officiel (règles de marque Google pour les boutons de connexion)
const G_LOGO = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

async function boutonGoogle() {
  const existing = comp('Bouton Google', true);
  if (existing) return existing;
  const board = FP.findOne((n) => n.type === 'FRAME' && n.name === 'Fondations HIT-T v2');
  const sec = AL('VERTICAL', { name: 'Connexion avec Google', gap: 16 });
  if (board) { board.appendChild(sec); sec.layoutSizingHorizontal = 'FILL'; } else FP.appendChild(sec);
  const h = AL('VERTICAL', { name: 'Titre', gap: 4 }); append(sec, h);
  h.appendChild(await txt('Connexion avec Google', 'Titre 2'));
  await para(h, 'Bouton conforme aux règles de marque Google : fond blanc, logo « G » en couleurs, libellé « Continuer avec Google ». Ne pas recolorer le logo.', 'Petit', 'couleur/discret');
  rule(sec);
  const c = figma.createComponent(); c.name = 'Bouton Google';
  c.layoutMode = 'HORIZONTAL'; c.primaryAxisSizingMode = 'AUTO'; c.counterAxisSizingMode = 'AUTO';
  c.primaryAxisAlignItems = 'CENTER'; c.counterAxisAlignItems = 'CENTER'; c.itemSpacing = 12; pad(c, 11, 20);
  c.fills = [{ type: 'SOLID', color: hex('#FFFFFF') }]; c.strokes = [{ type: 'SOLID', color: hex('#747775') }]; c.strokeWeight = 1; c.strokeAlign = 'INSIDE';
  rad(c);
  const g = figma.createNodeFromSvg(G_LOGO); g.name = 'Logo Google'; g.fills = []; c.appendChild(g);
  const t = await txt('Continuer avec Google', 'Libellé'); t.name = 'Libellé'; t.fills = [{ type: 'SOLID', color: hex('#1F1F1F') }]; c.appendChild(t);
  t.componentPropertyReferences = { characters: c.addComponentProperty('Libellé', 'TEXT', 'Continuer avec Google') };
  c.description = 'Connexion / inscription avec un compte Google (RF-13). Dans le code : bouton Google Identity Services.';
  sec.appendChild(c);
  return c;
}

async function separateur(label) {
  const r = AL('HORIZONTAL', { name: 'Séparateur « ou »', gap: 12 }); r.counterAxisAlignItems = 'CENTER';
  const a = figma.createRectangle(); a.name = 'Filet'; a.resize(10, 1); a.fills = fill('couleur/filet');
  const b = figma.createRectangle(); b.name = 'Filet'; b.resize(10, 1); b.fills = fill('couleur/filet');
  r.appendChild(a); r.appendChild(await txt(label, 'Petit', 'couleur/discret')); r.appendChild(b);
  a.layoutSizingHorizontal = 'FILL'; b.layoutSizingHorizontal = 'FILL';
  return r;
}

// Insère « Continuer avec Google » + « ou avec votre adresse email » en haut du formulaire
async function ajouterGoogle(form, index) {
  if (!form || form.findOne((n) => n.name === 'Séparateur « ou »')) return false;
  const btn = comp('Bouton Google').createInstance();
  form.insertChild(index, btn); btn.layoutSizingHorizontal = 'FILL';
  const sep = await separateur('ou avec votre adresse email');
  form.insertChild(index + 1, sep); sep.layoutSizingHorizontal = 'FILL';
  return true;
}

async function connexionGoogle() {
  const zf = await getZone('fond', false); FP = zf.sec;
  const zd = await getZone('desk', false); DESK = zd.sec;
  const zm = await getZone('mob', false); MOB = zm.sec;
  await goTo(zf.page);
  await boutonGoogle();
  fit(FP);
  let n = 0;
  await goTo(zd.page);
  for (const p of ['01 ·', '02 ·', '14 ·', '15 ·']) {
    const sc = DESK.children.find((x) => x.type === 'FRAME' && x.name.startsWith(p));
    const form = sc && sc.findOne((x) => x.type === 'FRAME' && x.name.startsWith('Formulaire'));
    if (!form) continue;
    // après l'en-tête et son filet
    const ruleIdx = form.children.findIndex((x) => x.name === 'Filet');
    if (await ajouterGoogle(form, ruleIdx >= 0 ? ruleIdx + 1 : 1)) n++;
  }
  await goTo(zm.page);
  const m5 = MOB.children.find((x) => x.type === 'FRAME' && x.name.startsWith('M5 ·'));
  const mform = m5 && m5.findOne((x) => x.type === 'FRAME' && x.name.startsWith('Formulaire'));
  if (await ajouterGoogle(mform, 0)) n++;
  return n;
}

// ---------------------------------------------------------------- exécution

try {
  await initDesign(false);
  const r = await connexionGoogle();
  out(r ? '✅ Connexion avec Google ajoutée sur ' + r + ' formulaire(s)' : 'ℹ️ Connexion avec Google déjà présente : rien à faire');
} catch (e) { out('❌ ' + e.message); }
