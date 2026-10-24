// HIT-T — design v2 (institutionnel) · étape 3 · Écrans mobile
// À coller dans le plugin Scripter, dans le fichier des maquettes HIT-T, puis Run.
// Crée les écrans mobile M1 catalogue, M2 questionnaire, M3 recommandations (390 px).
// Peut être relancé sans risque : ce qui existe déjà n'est pas recréé.

const out = typeof print === 'function' ? print : console.log;
const load = async (p) => { if (p.loadAsync) await p.loadAsync(); };
const goTo = async (p) => { if (figma.setCurrentPageAsync) await figma.setCurrentPageAsync(p); else figma.currentPage = p; };

const PAGES = { fond: 'v2 · Fondations', desk: 'v2 · Écrans desktop', mob: 'v2 · Écrans mobile' };
const SERIF = ['Source Serif 4', 'Source Serif Pro', 'Georgia'];
const SANS = ['Source Sans 3', 'Source Sans Pro', 'Inter'];

const COULEURS = {
  'couleur/vert/800': '#0F5236', 'couleur/vert/700': '#146B47', 'couleur/vert/600': '#1A8559', 'couleur/vert/100': '#D5E8DC', 'couleur/vert/50': '#EEF5F0',
  'couleur/orange/700': '#B83A12', 'couleur/orange/600': '#D84416', 'couleur/orange/50': '#FBEDE7',
  'couleur/jaune/500': '#F5D31B',
  'couleur/encre': '#1D1D1B', 'couleur/encre-2': '#4A4844', 'couleur/discret': '#6E6A62', 'couleur/blanc': '#FFFFFF',
  'couleur/fond': '#F6F4EF', 'couleur/fond-2': '#EFECE4', 'couleur/papier': '#FFFFFF',
  'couleur/filet': '#DCD7CC', 'couleur/filet-fort': '#BDB6A8',
  'couleur/domaine/sisg': '#B83A12', 'couleur/domaine/ia': '#5B4B8A', 'couleur/domaine/trit': '#1F5F8B',
  'couleur/succes': '#2E7D32', 'couleur/succes-50': '#EAF3EA', 'couleur/danger': '#B3261E', 'couleur/danger-50': '#FBEAE9',
};
const RAYONS = { 'rayon/petit': 2, 'rayon/moyen': 4 };
// [nom, familles, graisse, taille, interligne, interlettrage %, casse]
const STYLES = [
  ['Display', SERIF, 'Semibold', 40, 48, 0, 'ORIGINAL'],
  ['Titre 1', SERIF, 'Semibold', 30, 38, 0, 'ORIGINAL'],
  ['Titre 2', SERIF, 'Semibold', 22, 30, 0, 'ORIGINAL'],
  ['Marque', SERIF, 'Semibold', 19, 24, 0, 'ORIGINAL'],
  ['Titre 3', SANS, 'Semibold', 17, 24, 0, 'ORIGINAL'],
  ['Chapô', SANS, 'Regular', 18, 28, 0, 'ORIGINAL'],
  ['Corps', SANS, 'Regular', 15, 22, 0, 'ORIGINAL'],
  ['Corps fort', SANS, 'Semibold', 15, 22, 0, 'ORIGINAL'],
  ['Libellé', SANS, 'Semibold', 14, 20, 0, 'ORIGINAL'],
  ['Petit', SANS, 'Regular', 13, 18, 0, 'ORIGINAL'],
  ['Petit fort', SANS, 'Semibold', 13, 18, 0, 'ORIGINAL'],
  ['Surtitre', SANS, 'Bold', 12, 16, 8, 'UPPER'],
  ['Chiffre', SERIF, 'Semibold', 44, 52, 0, 'ORIGINAL'],
  ['Rang', SERIF, 'Semibold', 34, 40, 0, 'ORIGINAL'],
];

let V = {}, TS = {}, FP, DESK, MOB, FONTS;

async function getPage(name, create) {
  let p = figma.root.children.find((x) => x.name === name);
  if (!p && create) { p = figma.createPage(); p.name = name; }
  if (!p) throw new Error('Page « ' + name + ' » introuvable : lancez d\'abord le script 01.');
  await load(p);
  return p;
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
    if (!s) {
      const fn = pickFont(fams, w);
      await figma.loadFontAsync(fn);
      s = figma.createTextStyle();
      s.name = full;
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
  stroke(c, 'couleur/filet');
  rad(c);
  return c;
}

// Encadré d'information : fond vert pâle et filet gauche
function encadre(name) {
  const c = AL('VERTICAL', { name, gap: 8 });
  c.paddingTop = c.paddingBottom = 16; c.paddingLeft = 20; c.paddingRight = 20;
  c.fills = fill('couleur/vert/50');
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

// ---------------------------------------------------------------- écrans desktop

const CATALOGUE = [
  ['Office Excel niveau intermédiaire 2010-2024', 'Maîtriser les fonctions courantes, tris, filtres, graphiques et mises en forme conditionnelles pour analyser des données.', 'SISG', 'À la carte', '1 semaine', '40 500 FCFA', '35 500 FCFA'],
  ['Secrétariat-Bureautique (SB)', 'Formation complète au métier de secrétaire : bureautique, accueil, courrier, classement et organisation administrative.', 'SISG', 'Modulaire · certifiante', '6 mois', null, '120 000 FCFA'],
  ['Community management', 'Animer et développer la présence d\'une marque sur les réseaux sociaux : contenus, communauté, statistiques.', 'SISG', 'Modulaire · certifiante', '6 mois', null, '180 000 FCFA'],
  ['Langage Python et l\'IA (Analyse des données)', 'Programmer en Python pour analyser des données et préparer des projets d\'IA (20 h).', 'IA-Data', 'À la carte', '2 jours', '90 500 FCFA', '80 000 FCFA'],
  ['ChatGPT ou Teachy, Copilot, etc.', 'Utiliser les assistants d\'IA générative (ChatGPT, Copilot…) pour gagner en productivité au travail (20 h).', 'IA-Data', 'À la carte', '2 jours', '95 500 FCFA', '85 000 FCFA'],
  ['Développement de site web avec PHP, HTML, CSS', 'Créer des sites web dynamiques avec HTML, CSS et PHP.', 'TRIT', 'À la carte', '3 semaines', '125 000 FCFA', '120 500 FCFA'],
  ['Câblage et maintenance réseaux', 'Câbler, configurer et dépanner un réseau informatique local.', 'TRIT', 'À la carte', '3 semaines', '125 500 FCFA', '120 500 FCFA'],
  ['Réseau et Cybersécurité', 'Administrer des réseaux d\'entreprise et mettre en place leur sécurité.', 'TRIT', 'Modulaire · certifiante', '9 mois', null, '380 000 FCFA'],
];

const RECOS = [
  ['Développement de site web avec PHP, HTML, CSS', 'Créer des sites web dynamiques avec HTML, CSS et PHP.', 'TRIT', '3 semaines · 120 500 FCFA (prix promotionnel)', 0.48, ['développement web', 'site web', 'programmation'], 'Retour=Pertinent'],
  ['IA et le développement web', 'Intégrer des fonctionnalités d\'intelligence artificielle dans des sites et applications web.', 'IA-Data', '1 mois · 90 000 FCFA (prix promotionnel)', 0.41, ['développement web', 'programmation', 'applications web'], 'Retour=Aucun'],
  ['Développement web Laravel (ou autres technologies)', 'Développer des applications web structurées avec le framework Laravel.', 'TRIT', '3 semaines · 135 000 FCFA (prix promotionnel)', 0.36, ['développement web', 'programmation'], 'Retour=Aucun'],
  ['Programmation en Java SE ou C++ ou VB ou PHP', 'Apprendre un langage de programmation et réaliser ses premières applications.', 'TRIT', '3 semaines · 120 500 FCFA (prix promotionnel)', 0.29, ['programmation', 'développement'], 'Retour=Non pertinent'],
  ['Algorithme et Programmation avec C/C++, Java', 'Apprendre la logique algorithmique et programmer en C, C++ ou Java.', 'TRIT', '3 semaines · 82 500 FCFA (prix promotionnel)', 0.22, ['programmation'], 'Retour=Aucun'],
];

async function ligneFormation(set, f) {
  const [t, d, dom, typ, dur, prix, promo] = f;
  const i = inst(set, null, { 'Intitulé': t, 'Description': d, 'Type': typ, 'Durée': dur, 'Prix': prix || '', 'Prix promo': promo, 'Prix barré': !!prix });
  await setNested(i, 'Étiquette domaine', 'Domaine', dom);
  if (!prix) { const p = i.findOne((n) => n.type === 'TEXT' && n.name === 'Prix promo'); if (p) p.fills = fill('couleur/encre'); }
  return i;
}

async function recommandation(set, r, rank) {
  const [t, d, dom, infos, score, words, ret] = r;
  const [label, level] = correspondance(score);
  const i = inst(set, ret, { 'Rang': String(rank), 'Intitulé': t, 'Description': d, 'Type': 'À la carte', 'Infos': infos, 'Correspondance': label });
  await setNested(i, 'Étiquette domaine', 'Domaine', dom);
  await setWords(i, words);
  setLevel(i, level);
  return i;
}

function screen(name, idx) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(1440, 900);
  f.x = idx * 1540; f.y = 0;
  f.layoutMode = 'VERTICAL';
  f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO';
  f.fills = fill('couleur/fond');
  f.clipsContent = true;
  return f;
}

async function header(sc, role, active) {
  const h = inst(comp('En-tête'), 'Rôle=' + role);
  append(sc, h);
  setActive(h, active || '');
  return h;
}

function body(sc, gap = 32) {
  const b = AL('VERTICAL', { name: 'Contenu', gap });
  b.paddingTop = 40; b.paddingBottom = 72; b.paddingLeft = b.paddingRight = 120;
  append(sc, b);
  return b;
}

function footer(sc) { append(sc, comp('Pied de page').createInstance()); }

async function pageTitle(parent, crumb, title, lead) {
  const h = AL('VERTICAL', { name: 'Titre de page', gap: 10 }); append(parent, h);
  if (crumb) h.appendChild(await txt(crumb, 'Petit', 'couleur/discret'));
  await para(h, title, 'Display');
  if (lead) await para(h, lead, 'Chapô', 'couleur/encre-2');
  return h;
}

async function steps(parent, items) {
  const box = AL('VERTICAL', { name: 'Étapes', gap: 0 }); append(parent, box);
  let k = 1;
  for (const [title, text] of items) {
    const r = AL('HORIZONTAL', { name: 'Étape ' + k, gap: 20 }); r.paddingTop = r.paddingBottom = 18; stroke(r, 'couleur/filet', 1, 't'); append(box, r);
    const n = await txt(String(k), 'Titre 1', 'couleur/vert/700'); r.appendChild(n);
    const t = AL('VERTICAL', { name: 'Texte', gap: 2 }); append(r, t);
    await para(t, title, 'Titre 3');
    await para(t, text, 'Corps', 'couleur/encre-2');
    k++;
  }
  return box;
}

async function authScreen(mode, idx) {
  const S = { btn: comp('Bouton'), field: comp('Champ') };
  const sc = screen(mode === 'login' ? '01 · Connexion' : '02 · Inscription', idx);
  await header(sc, 'Visiteur', null);
  const b = body(sc);
  b.paddingTop = 56;
  const cols = AL('HORIZONTAL', { name: 'Colonnes', gap: 96 }); append(b, cols);
  const left = AL('VERTICAL', { name: 'Présentation', gap: 24 }); append(cols, left);
  left.appendChild(await txt('Espace apprenant', 'Surtitre', 'couleur/vert/700'));
  await para(left, 'Trouvez la formation adaptée à votre projet', 'Display');
  await para(left, 'Répondez à six questions sur votre parcours et vos objectifs : la plateforme compare votre profil aux 86 formations de HIT-T Institute et vous indique les cinq plus adaptées.', 'Corps', 'couleur/encre-2');
  await steps(left, [['Créez votre compte', 'Nom, prénom, adresse email et mot de passe.'], ['Remplissez le questionnaire', 'Environ deux minutes ; vous pourrez modifier vos réponses.'], ['Consultez vos recommandations', 'Cinq formations classées, avec les raisons de chaque choix.']]);
  const form = panel(mode === 'login' ? 'Formulaire de connexion' : 'Formulaire d\'inscription', 40); form.itemSpacing = 20; cols.appendChild(form); setW(form, 480);
  const fh = AL('VERTICAL', { name: 'En-tête', gap: 6 }); append(form, fh);
  fh.appendChild(await txt(mode === 'login' ? 'Connexion' : 'Créer un compte', 'Titre 1'));
  await para(fh, mode === 'login' ? 'Accédez à votre questionnaire et à vos recommandations.' : 'Seules ces informations vous sont demandées.', 'Corps', 'couleur/encre-2');
  rule(form);
  const fld = (parent, props) => { const f = inst(S.field, 'Type=Texte', props); append(parent, f); return f; };
  if (mode === 'signup') { const r = AL('HORIZONTAL', { name: 'Nom et prénom', gap: 16 }); append(form, r); fld(r, { 'Libellé': 'Nom', 'Valeur': 'Kossi' }); fld(r, { 'Libellé': 'Prénom', 'Valeur': 'Afi' }); }
  fld(form, { 'Libellé': 'Adresse email', 'Valeur': 'afi.kossi@exemple.com' });
  fld(form, { 'Libellé': 'Mot de passe', 'Valeur': '••••••••••', 'Aide': '8 caractères minimum.', 'Afficher l\'aide': mode === 'signup' });
  append(form, inst(S.btn, 'Type=Principal', { 'Libellé': mode === 'login' ? 'Se connecter' : 'Créer mon compte' }));
  const alt = AL('HORIZONTAL', { name: 'Lien alternatif', gap: 6 }); alt.counterAxisAlignItems = 'CENTER'; append(form, alt);
  alt.appendChild(await txt(mode === 'login' ? 'Pas encore de compte ?' : 'Déjà inscrit ?', 'Corps', 'couleur/encre-2'));
  alt.appendChild(inst(S.btn, 'Type=Lien', { 'Libellé': mode === 'login' ? 'Créer un compte' : 'Se connecter' }));
  footer(sc);
  return sc;
}

async function catalogueScreen(idx) {
  const S = { btn: comp('Bouton'), field: comp('Champ'), tab: comp('Onglet'), row: comp('Ligne formation') };
  const sc = screen('03 · Catalogue', idx);
  await header(sc, 'Visiteur', 'Catalogue des formations');
  const b = body(sc);
  const top = AL('HORIZONTAL', { name: 'Haut de page', gap: 64 }); top.counterAxisAlignItems = 'MAX'; append(b, top);
  const tl = AL('VERTICAL', { name: 'Titre', gap: 0 }); append(top, tl);
  await pageTitle(tl, 'Accueil  /  Catalogue', 'Catalogue des formations', '86 formations réparties en trois domaines : Secrétariat et Gestion (SISG), IA, Data science et Blockchain, Informatique et Télécoms (TRIT).');
  const call = encadre('Aide au choix'); top.appendChild(call); setW(call, 380);
  call.appendChild(await txt('Vous ne savez pas quoi choisir ?', 'Titre 3'));
  await para(call, 'Répondez au questionnaire : nous vous proposons les cinq formations les plus proches de votre profil.', 'Petit', 'couleur/encre-2');
  call.appendChild(inst(S.btn, 'Type=Secondaire', { 'Libellé': 'Répondre au questionnaire' }));

  const bar = AL('HORIZONTAL', { name: 'Filtres', gap: 24 }); bar.counterAxisAlignItems = 'MAX'; stroke(bar, 'couleur/filet', 1, 'b'); append(b, bar);
  for (const [o, a] of [['Tous les domaines', true], ['SISG', false], ['IA · Data', false], ['TRIT', false]]) bar.appendChild(inst(S.tab, a ? 'État=Actif' : 'État=Inactif', { 'Libellé': o }));
  spacer(bar);
  const typ = inst(S.field, 'Type=Liste', { 'Libellé': 'Type de formation', 'Valeur': 'Tous les types' }); bar.appendChild(typ); setW(typ, 240); typ.paddingBottom = 10;
  const list = AL('VERTICAL', { name: 'Liste', gap: 0 }); list.fills = fill('couleur/papier'); stroke(list, 'couleur/filet'); append(b, list);
  const lh = AL('HORIZONTAL', { name: 'En-tête de liste', gap: 32 }); pad(lh, 12, 24); lh.fills = fill('couleur/fond-2'); stroke(lh, 'couleur/filet', 1, 'b'); append(list, lh);
  for (const [l, w] of [['Domaine', 150], ['Formation', null], ['Durée', 110], ['Tarif', 170], ['', 20]]) { const c = AL('HORIZONTAL', { name: l || 'Vide' }); if (l === 'Tarif') c.primaryAxisAlignItems = 'MAX'; lh.appendChild(c); if (w) setW(c, w); else c.layoutSizingHorizontal = 'FILL'; if (l) c.appendChild(await txt(l, 'Surtitre', 'couleur/discret')); }
  for (const f of CATALOGUE) append(list, await ligneFormation(S.row, f));
  const pg = AL('HORIZONTAL', { name: 'Pagination', gap: 12 }); pg.counterAxisAlignItems = 'CENTER'; append(b, pg);
  pg.appendChild(await txt('Formations 1 à 8 sur 86', 'Petit', 'couleur/discret')); spacer(pg);
  pg.appendChild(inst(S.btn, 'Type=Secondaire', { 'Libellé': 'Page précédente' }));
  pg.appendChild(inst(S.btn, 'Type=Secondaire', { 'Libellé': 'Page suivante' }));
  footer(sc);
  return sc;
}

async function detailScreen(idx) {
  const S = { btn: comp('Bouton'), mot: comp('Mot-clé'), etq: comp('Étiquette domaine') };
  const sc = screen('04 · Détail d\'une formation', idx);
  await header(sc, 'Visiteur', 'Catalogue des formations');
  const b = body(sc);
  const cols = AL('HORIZONTAL', { name: 'Colonnes', gap: 64 }); append(b, cols);
  const left = AL('VERTICAL', { name: 'Formation', gap: 28 }); append(cols, left);
  const h = AL('VERTICAL', { name: 'Titre', gap: 12 }); append(left, h);
  h.appendChild(await txt('Accueil  /  Catalogue  /  TRIT', 'Petit', 'couleur/discret'));
  h.appendChild(inst(S.etq, 'Domaine=TRIT'));
  await para(h, 'Développement de site web avec PHP, HTML, CSS', 'Display');
  await para(h, 'Créer des sites web dynamiques avec HTML, CSS et PHP.', 'Corps', 'couleur/encre-2');
  const info = AL('VERTICAL', { name: 'Informations', gap: 0 }); append(left, info);
  info.appendChild(await txt('Informations pratiques', 'Titre 2'));
  const dl = AL('VERTICAL', { name: 'Liste', gap: 0 }); dl.paddingTop = 12; append(info, dl);
  for (const [k, v] of [['Domaine', 'TRIT — Technologies de Réalisations Informatiques et Télécoms'], ['Type', 'Formation à la carte (courte)'], ['Durée', '3 semaines'], ['Niveau d\'admission', 'BEPC, BAC I, II et plus']]) {
    const r = AL('HORIZONTAL', { name: k, gap: 24 }); r.paddingTop = r.paddingBottom = 14; stroke(r, 'couleur/filet', 1, 'b'); append(dl, r);
    const kt = await txt(k, 'Corps fort'); r.appendChild(kt); kt.textAutoResize = 'HEIGHT'; kt.resize(200, kt.height);
    await para(r, v, 'Corps', 'couleur/encre-2');
  }
  const kw = AL('VERTICAL', { name: 'Mots-clés', gap: 12 }); append(left, kw);
  kw.appendChild(await txt('Mots-clés', 'Titre 2'));
  const tags = AL('HORIZONTAL', { name: 'Liste', gap: 8 }); tags.layoutWrap = 'WRAP'; tags.counterAxisSpacing = 8; append(kw, tags);
  for (const w of ['développement web', 'site web', 'php', 'html', 'css', 'programmation', 'mysql']) tags.appendChild(inst(S.mot, 'Commun=Non', { 'Mot': w }));
  const side = panel('Tarif et inscription', 28); side.itemSpacing = 16; cols.appendChild(side); setW(side, 380);
  side.appendChild(await txt('Tarif', 'Surtitre', 'couleur/discret'));
  const pr = AL('VERTICAL', { name: 'Prix', gap: 2 }); append(side, pr);
  const old = await txt('125 000 FCFA', 'Corps', 'couleur/discret'); old.textDecoration = 'STRIKETHROUGH'; pr.appendChild(old);
  pr.appendChild(await txt('120 500 FCFA', 'Titre 1', 'couleur/orange/700'));
  pr.appendChild(await txt('Prix promotionnel', 'Petit', 'couleur/encre-2'));
  rule(side);
  await para(side, 'Le paiement se fait auprès du cabinet. Créez un compte pour savoir si cette formation correspond à votre profil.', 'Petit', 'couleur/encre-2');
  append(side, inst(S.btn, 'Type=Principal', { 'Libellé': 'Obtenir mes recommandations' }));
  append(side, inst(S.btn, 'Type=Lien', { 'Libellé': 'Retour au catalogue' }), null);
  footer(sc);
  return sc;
}

async function questionnaireScreen(idx) {
  const S = { btn: comp('Bouton'), field: comp('Champ') };
  const sc = screen('05 · Questionnaire', idx);
  await header(sc, 'Apprenant', 'Mon questionnaire');
  const b = body(sc);
  const cols = AL('HORIZONTAL', { name: 'Colonnes', gap: 64 }); append(b, cols);
  const left = AL('VERTICAL', { name: 'Introduction', gap: 16 }); cols.appendChild(left); setW(left, 340);
  await pageTitle(left, 'Espace apprenant  /  Questionnaire', 'Votre profil', null);
  await para(left, 'Six questions, environ deux minutes. Vos réponses servent uniquement à calculer vos recommandations ; vous pourrez les modifier à tout moment.', 'Corps', 'couleur/encre-2');
  const note = encadre('Confidentialité'); append(left, note);
  await para(note, 'Seuls les champs de ce questionnaire et de votre compte sont enregistrés.', 'Petit', 'couleur/encre-2');
  const form = panel('Formulaire', 40); form.itemSpacing = 28; append(cols, form);
  const block = async (n, title) => { const s = AL('VERTICAL', { name: title, gap: 16 }); append(form, s); const h = AL('HORIZONTAL', { name: 'Titre', gap: 12 }); h.counterAxisAlignItems = 'BASELINE'; append(s, h); h.appendChild(await txt(n, 'Titre 2', 'couleur/vert/700')); h.appendChild(await txt(title, 'Titre 2')); rule(s); return s; };
  const fld = (parent, v, props) => { const f = inst(S.field, v, props); append(parent, f); return f; };
  const b1 = await block('1.', 'Votre parcours');
  const r1 = AL('HORIZONTAL', { name: 'Ligne', gap: 16 }); append(b1, r1);
  fld(r1, 'Type=Liste', { 'Libellé': 'Niveau d\'études', 'Valeur': 'BAC II' });
  fld(r1, 'Type=Texte', { 'Libellé': 'Objectif professionnel', 'Valeur': 'Devenir développeur web' });
  fld(b1, 'Type=Zone de texte', { 'Libellé': 'Compétences actuelles', 'Valeur': 'Word, Excel, bases d\'Internet', 'Aide': 'Ce que vous savez déjà faire, séparé par des virgules.', 'Afficher l\'aide': true });
  const b2 = await block('2.', 'Vos centres d\'intérêt');
  fld(b2, 'Type=Zone de texte', { 'Libellé': 'Domaines qui vous attirent', 'Valeur': 'Programmation, développement web, sites internet' });
  const b3 = await block('3.', 'Vos contraintes');
  const tq = AL('VERTICAL', { name: 'Type souhaité', gap: 8 }); append(b3, tq);
  tq.appendChild(await txt('Type de formation souhaité', 'Libellé'));
  const opts = AL('VERTICAL', { name: 'Options', gap: 0 }); stroke(opts, 'couleur/filet-fort'); rad(opts); append(tq, opts);
  let first = true;
  for (const [title, desc, sel] of [['Formation courte, à la carte', 'De 1 jour à 3 mois : un outil ou une compétence précise.', true], ['Parcours modulaire certifiant', 'De 2 à 9 mois : un métier complet.', false]]) {
    const o = AL('HORIZONTAL', { name: 'Option · ' + title, gap: 14 }); pad(o, 14, 16); o.counterAxisAlignItems = 'MIN';
    o.fills = sel ? fill('couleur/vert/50') : fill('couleur/papier');
    if (!first) stroke(o, 'couleur/filet', 1, 't');
    append(opts, o); first = false;
    const radio = figma.createEllipse(); radio.name = 'Bouton radio'; radio.resize(18, 18); radio.fills = fill('couleur/papier');
    radio.strokes = fill(sel ? 'couleur/vert/600' : 'couleur/filet-fort'); radio.strokeWeight = sel ? 5 : 1.5; radio.strokeAlign = 'INSIDE';
    o.appendChild(radio);
    const t = AL('VERTICAL', { name: 'Texte', gap: 2 }); append(o, t);
    await para(t, title, 'Corps fort');
    await para(t, desc, 'Petit', 'couleur/encre-2');
  }
  const bud = fld(b3, 'Type=Texte', { 'Libellé': 'Budget maximum (FCFA)', 'Valeur': '150 000', 'Aide': 'Seules les formations à ce prix ou moins vous seront proposées.', 'Afficher l\'aide': true }); setW(bud, 360);
  rule(form);
  const act = AL('HORIZONTAL', { name: 'Actions', gap: 16 }); act.counterAxisAlignItems = 'CENTER'; append(form, act);
  act.appendChild(await txt('Toutes les questions sont obligatoires.', 'Petit', 'couleur/discret')); spacer(act);
  act.appendChild(inst(S.btn, 'Type=Lien', { 'Libellé': 'Annuler' }));
  act.appendChild(inst(S.btn, 'Type=Principal', { 'Libellé': 'Voir mes recommandations' }));
  footer(sc);
  return sc;
}

async function recommandationsScreen(idx) {
  const S = { btn: comp('Bouton'), reco: comp('Recommandation') };
  const sc = screen('06 · Mes recommandations', idx);
  await header(sc, 'Apprenant', 'Mes recommandations');
  const b = body(sc);
  await pageTitle(b, 'Espace apprenant  /  Mes recommandations', 'Vos cinq formations recommandées', 'Établies le 24 octobre 2026 à partir de votre questionnaire, de la plus proche à la moins proche de votre profil.');
  const cols = AL('HORIZONTAL', { name: 'Colonnes', gap: 40 }); append(b, cols);
  const list = AL('VERTICAL', { name: 'Liste', gap: 16 }); append(cols, list);
  let rank = 1;
  for (const r of RECOS) append(list, await recommandation(S.reco, r, rank++));
  const side = AL('VERTICAL', { name: 'Colonne latérale', gap: 24 }); cols.appendChild(side); setW(side, 280);
  const prof = panel('Votre profil', 24); append(side, prof);
  prof.appendChild(await txt('Votre profil', 'Titre 2'));
  const dl = AL('VERTICAL', { name: 'Réponses', gap: 0 }); append(prof, dl);
  for (const [k, v] of [['Objectif', 'Devenir développeur web'], ['Type souhaité', 'Formation courte, à la carte'], ['Budget maximum', '150 000 FCFA']]) {
    const r = AL('VERTICAL', { name: k, gap: 2 }); r.paddingTop = r.paddingBottom = 10; stroke(r, 'couleur/filet', 1, 't'); append(dl, r);
    r.appendChild(await txt(k, 'Petit', 'couleur/discret')); await para(r, v, 'Corps fort');
  }
  append(prof, inst(S.btn, 'Type=Secondaire', { 'Libellé': 'Modifier mes réponses' }));
  const how = encadre('Lire les résultats'); append(side, how);
  how.appendChild(await txt('Comment lire ces résultats', 'Titre 3'));
  await para(how, 'La correspondance indique à quel point la formation reprend les mots de vos compétences, centres d\'intérêt et objectif. Seules les formations du type choisi et dans votre budget sont proposées.', 'Petit', 'couleur/encre-2');
  await para(how, 'Votre avis sur chaque formation aide le cabinet à améliorer les recommandations.', 'Petit', 'couleur/encre-2');
  footer(sc);
  return sc;
}

async function adminScreen(idx) {
  const S = { btn: comp('Bouton'), field: comp('Champ'), tab: comp('Onglet'), kpi: comp('Chiffre clé'), row: comp('Ligne tableau'), etq: comp('Étiquette domaine') };
  const sc = screen('07 · Tableau de bord', idx);
  await header(sc, 'Administrateur', 'Tableau de bord');
  const b = body(sc);
  await pageTitle(b, 'Administration', 'Tableau de bord', null);
  const kr = AL('HORIZONTAL', { name: 'Chiffres clés', gap: 24 }); append(b, kr);
  for (const p of [{ 'Libellé': 'Apprenants inscrits', 'Valeur': '27', 'Précision': 'comptes apprenants créés depuis l\'ouverture' }, { 'Libellé': 'Avis « pertinent »', 'Valeur': '74 %', 'Précision': '68 avis positifs sur 92 donnés — objectif : 70 %' }]) { const k = inst(S.kpi, null, p); append(kr, k); k.layoutSizingVertical = 'FILL'; }
  const top = panel('Formations les plus recommandées', 24); top.itemSpacing = 0; kr.appendChild(top); setW(top, 520);
  top.appendChild(await txt('Formations les plus recommandées', 'Surtitre', 'couleur/discret'));
  const tl = AL('VERTICAL', { name: 'Classement', gap: 0 }); tl.paddingTop = 8; append(top, tl);
  for (const [k, [n, d, c]] of [['Office Excel niveau avancé 2010-2024', 'SISG', 14], ['Développement de site web avec PHP, HTML, CSS', 'TRIT', 12], ['Marketing digital', 'SISG', 9], ['Secrétariat-Bureautique (SB)', 'SISG', 8], ['Langage Python et l\'IA (Analyse des données)', 'IA-Data', 7]].entries()) {
    const r = AL('HORIZONTAL', { name: n, gap: 12 }); r.counterAxisAlignItems = 'CENTER'; r.paddingTop = r.paddingBottom = 8; if (k) stroke(r, 'couleur/filet', 1, 't'); append(tl, r);
    const rk = await txt(String(k + 1), 'Corps fort', 'couleur/vert/700'); r.appendChild(rk); rk.textAutoResize = 'HEIGHT'; rk.resize(16, rk.height);
    await para(r, n, 'Petit');
    r.appendChild(await txt(c + ' fois', 'Petit fort', 'couleur/encre-2'));
  }
  // Catalogue
  const cat = AL('VERTICAL', { name: 'Gestion du catalogue', gap: 16 }); append(b, cat);
  const ch = AL('HORIZONTAL', { name: 'En-tête', gap: 16 }); ch.counterAxisAlignItems = 'MAX'; append(cat, ch);
  const cht = AL('VERTICAL', { name: 'Titre', gap: 4 }); append(ch, cht);
  cht.appendChild(await txt('Catalogue des formations', 'Titre 1'));
  cht.appendChild(await txt('86 formations · descriptions et mots-clés à valider par le cabinet', 'Petit', 'couleur/discret'));
  const search = inst(S.field, 'Type=Texte', { 'Libellé': 'Rechercher', 'Valeur': 'Intitulé ou mot-clé' }); ch.appendChild(search); setW(search, 300);
  const sv = search.findOne((n) => n.type === 'TEXT' && n.name === 'Valeur'); if (sv) sv.fills = fill('couleur/discret');
  ch.appendChild(inst(S.btn, 'Type=Principal', { 'Libellé': 'Ajouter une formation' }));
  const tabs = AL('HORIZONTAL', { name: 'Onglets', gap: 24 }); stroke(tabs, 'couleur/filet', 1, 'b'); append(cat, tabs);
  for (const [o, a] of [['Tous les domaines (86)', true], ['SISG (31)', false], ['IA · Data (24)', false], ['TRIT (31)', false]]) tabs.appendChild(inst(S.tab, a ? 'État=Actif' : 'État=Inactif', { 'Libellé': o }));
  const tbl = AL('VERTICAL', { name: 'Tableau', gap: 0 }); tbl.fills = fill('couleur/papier'); stroke(tbl, 'couleur/filet'); append(cat, tbl);
  const th = AL('HORIZONTAL', { name: 'En-tête tableau', gap: 16 }); pad(th, 12, 24); th.fills = fill('couleur/fond-2'); stroke(th, 'couleur/filet', 1, 'b'); append(tbl, th);
  for (const [l, w] of [['Intitulé', null], ['Domaine', 140], ['Type', 140], ['Durée', 100], ['Coût', 110], ['Prix promo', 110], ['Actions', 150]]) { const c = AL('HORIZONTAL', { name: l }); th.appendChild(c); if (w) setW(c, w); else c.layoutSizingHorizontal = 'FILL'; c.appendChild(await txt(l, 'Surtitre', 'couleur/discret')); }
  for (const [t, d, ty, du, co, pr] of [['Office Excel niveau intermédiaire 2010-2024', 'SISG', 'À la carte', '1 semaine', '40 500', '35 500'], ['Secrétariat-Bureautique (SB)', 'SISG', 'Modulaire', '6 mois', '120 000', '—'], ['Langage Python et l\'IA (Analyse des données)', 'IA-Data', 'À la carte', '2 jours', '90 500', '80 000'], ['Analyste développeur des systèmes IA', 'IA-Data', 'Modulaire', '6 mois', '250 000', '—'], ['Développement de site web avec PHP, HTML, CSS', 'TRIT', 'À la carte', '3 semaines', '125 000', '120 500'], ['Réseau et Cybersécurité', 'TRIT', 'Modulaire', '9 mois', '380 000', '—']]) {
    const r = inst(S.row, null, { 'Intitulé': t, 'Type': ty, 'Durée': du, 'Coût': co, 'Prix promo': pr }); append(tbl, r);
    await setNested(r, 'Étiquette domaine', 'Domaine', d);
  }
  const pg = AL('HORIZONTAL', { name: 'Pagination', gap: 12 }); pg.counterAxisAlignItems = 'CENTER'; append(cat, pg);
  pg.appendChild(await txt('Formations 1 à 6 sur 86', 'Petit', 'couleur/discret')); spacer(pg);
  pg.appendChild(inst(S.btn, 'Type=Secondaire', { 'Libellé': 'Page précédente' }));
  pg.appendChild(inst(S.btn, 'Type=Secondaire', { 'Libellé': 'Page suivante' }));
  footer(sc);

  // 08 · Modification (fenêtre par-dessus le tableau de bord)
  const sm = sc.clone(); sm.name = '08 · Modifier une formation'; sm.x = sc.x + 1540;
  const ov = figma.createFrame(); ov.name = 'Voile'; sm.appendChild(ov);
  ov.layoutPositioning = 'ABSOLUTE'; ov.x = 0; ov.y = 0; ov.resize(1440, Math.max(sm.height, 900)); ov.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  ov.fills = [{ type: 'SOLID', color: hex('#1D1D1B'), opacity: 0.55 }];
  ov.layoutMode = 'VERTICAL'; ov.primaryAxisSizingMode = 'FIXED'; ov.counterAxisSizingMode = 'FIXED'; ov.counterAxisAlignItems = 'CENTER'; ov.paddingTop = 72;
  const md = panel('Fenêtre de modification', 0); md.itemSpacing = 0; ov.appendChild(md); setW(md, 720);
  md.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.18 }, offset: { x: 0, y: 12 }, radius: 32, spread: 0, visible: true, blendMode: 'NORMAL' }];
  const mh = AL('HORIZONTAL', { name: 'En-tête', gap: 16 }); mh.counterAxisAlignItems = 'CENTER'; pad(mh, 20, 32); mh.fills = fill('couleur/vert/700'); append(md, mh);
  mh.appendChild(await txt('Modifier une formation', 'Titre 2', 'couleur/blanc')); spacer(mh);
  mh.appendChild(await txt('Fermer', 'Libellé', 'couleur/vert/100'));
  const mb = AL('VERTICAL', { name: 'Formulaire', gap: 20 }); pad(mb, 28, 32); append(md, mb);
  const fld = (parent, v, props) => { const f = inst(S.field, v, props); append(parent, f); return f; };
  const line = () => { const r = AL('HORIZONTAL', { name: 'Ligne', gap: 16 }); append(mb, r); return r; };
  fld(mb, 'Type=Texte', { 'Libellé': 'Intitulé', 'Valeur': 'Office Excel niveau intermédiaire 2010-2024' });
  fld(mb, 'Type=Zone de texte', { 'Libellé': 'Description', 'Valeur': 'Maîtriser les fonctions courantes, tris, filtres, graphiques et mises en forme conditionnelles pour analyser des données.' });
  let r = line(); fld(r, 'Type=Liste', { 'Libellé': 'Domaine', 'Valeur': 'SISG — Secrétariat et Gestion' }); fld(r, 'Type=Liste', { 'Libellé': 'Type', 'Valeur': 'À la carte' });
  r = line(); fld(r, 'Type=Texte', { 'Libellé': 'Durée', 'Valeur': '1' }); fld(r, 'Type=Liste', { 'Libellé': 'Unité', 'Valeur': 'semaine' }); fld(r, 'Type=Texte', { 'Libellé': 'Coût (FCFA)', 'Valeur': '40 500' }); fld(r, 'Type=Texte', { 'Libellé': 'Prix promo (FCFA)', 'Valeur': '35 500' });
  fld(mb, 'Type=Zone de texte', { 'Libellé': 'Mots-clés', 'Valeur': 'excel, tableur, fonctions, graphiques, filtres, analyse de données, gestion, comptabilité', 'Aide': 'Séparés par des virgules. Ils servent directement au calcul des recommandations.', 'Afficher l\'aide': true });
  const ma = AL('HORIZONTAL', { name: 'Actions', gap: 12 }); ma.counterAxisAlignItems = 'CENTER'; pad(ma, 16, 32); ma.fills = fill('couleur/fond-2'); stroke(ma, 'couleur/filet', 1, 't'); append(md, ma);
  ma.appendChild(inst(S.btn, 'Type=Danger', { 'Libellé': 'Supprimer la formation' })); spacer(ma);
  ma.appendChild(inst(S.btn, 'Type=Lien', { 'Libellé': 'Annuler' }));
  ma.appendChild(inst(S.btn, 'Type=Principal', { 'Libellé': 'Enregistrer' }));
  return [sc, sm];
}

async function ecransDesktop() {
  FP = await getPage(PAGES.fond);
  DESK = await getPage(PAGES.desk);
  if (DESK.children.some((n) => n.name.startsWith('01 ·'))) return false;
  await goTo(DESK);
  const made = [];
  made.push(await authScreen('login', 0));
  made.push(await authScreen('signup', 1));
  made.push(await catalogueScreen(2));
  made.push(await detailScreen(3));
  made.push(await questionnaireScreen(4));
  made.push(await recommandationsScreen(5));
  made.push(...(await adminScreen(6)));
  figma.viewport.scrollAndZoomIntoView(made);
  return true;
}

// ---------------------------------------------------------------- écrans mobile

const RECOS_M = [
  ['Développement de site web avec PHP, HTML, CSS', 'Créer des sites web dynamiques avec HTML, CSS et PHP.', 'TRIT', '3 semaines · 120 500 FCFA (promo)', 0.48, ['développement web', 'site web', 'programmation'], 'Retour=Pertinent'],
  ['IA et le développement web', 'Intégrer l\'intelligence artificielle dans des sites et applications web.', 'IA-Data', '1 mois · 90 000 FCFA (promo)', 0.41, ['développement web', 'programmation'], 'Retour=Aucun'],
  ['Développement web Laravel (ou autres technologies)', 'Développer des applications web structurées avec Laravel.', 'TRIT', '3 semaines · 135 000 FCFA (promo)', 0.36, ['développement web', 'programmation'], 'Retour=Aucun'],
];

function mScreen(name, x) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(390, 844);
  f.x = x; f.y = 0;
  f.layoutMode = 'VERTICAL';
  f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO';
  f.fills = fill('couleur/fond');
  f.clipsContent = true;
  return f;
}

async function mHeader(sc, section) {
  const top = AL('HORIZONTAL', { name: 'Barre haute' }); top.primaryAxisAlignItems = 'SPACE_BETWEEN'; top.counterAxisAlignItems = 'CENTER'; pad(top, 10, 16);
  top.fills = fill('couleur/papier'); append(sc, top);
  top.appendChild(inst(comp('Logo'), 'Taille=Compact'));
  const m = AL('HORIZONTAL', { name: 'Menu', gap: 6 }); m.counterAxisAlignItems = 'CENTER'; pad(m, 8, 4);
  m.appendChild(await txt('Menu', 'Libellé', 'couleur/vert/700'));
  m.appendChild(await icon('menu', 22, 'couleur/vert/700'));
  top.appendChild(m);
  const band = AL('HORIZONTAL', { name: 'Rubrique' }); band.counterAxisAlignItems = 'CENTER'; pad(band, 12, 16); band.fills = fill('couleur/vert/700'); append(sc, band);
  band.appendChild(await txt(section, 'Libellé', 'couleur/blanc'));
}

function mBody(sc, gap = 20) {
  const b = AL('VERTICAL', { name: 'Contenu', gap });
  b.paddingTop = 24; b.paddingBottom = 32; b.paddingLeft = b.paddingRight = 16;
  append(sc, b);
  return b;
}

async function ecransMobile() {
  FP = await getPage(PAGES.fond);
  MOB = await getPage(PAGES.mob);
  if (MOB.children.some((n) => n.name.startsWith('M1 ·'))) return false;
  await goTo(MOB);
  const S = { btn: comp('Bouton'), field: comp('Champ'), tab: comp('Onglet'), row: comp('Ligne formation mobile'), reco: comp('Recommandation mobile') };

  // M1 · Catalogue
  const m1 = mScreen('M1 · Catalogue', 0);
  await mHeader(m1, 'Catalogue des formations');
  const b1 = mBody(m1);
  const h1 = AL('VERTICAL', { name: 'Titre', gap: 6 }); append(b1, h1);
  await para(h1, 'Catalogue des formations', 'Titre 1');
  await para(h1, '86 formations en Secrétariat et Gestion, IA et Data, Informatique et Télécoms.', 'Corps', 'couleur/encre-2');
  const call = encadre('Aide au choix'); append(b1, call);
  await para(call, 'Vous ne savez pas quoi choisir ?', 'Titre 3');
  await para(call, 'Répondez au questionnaire pour recevoir cinq propositions.', 'Petit', 'couleur/encre-2');
  call.appendChild(inst(S.btn, 'Type=Secondaire', { 'Libellé': 'Répondre au questionnaire' }));
  const tabs = AL('HORIZONTAL', { name: 'Onglets', gap: 18 }); stroke(tabs, 'couleur/filet', 1, 'b'); append(b1, tabs);
  for (const [o, a] of [['Tous', true], ['SISG', false], ['IA · Data', false], ['TRIT', false]]) tabs.appendChild(inst(S.tab, a ? 'État=Actif' : 'État=Inactif', { 'Libellé': o }));
  append(b1, inst(S.field, 'Type=Liste', { 'Libellé': 'Type de formation', 'Valeur': 'Tous les types' }));
  const list = AL('VERTICAL', { name: 'Liste', gap: 0 }); list.fills = fill('couleur/papier'); stroke(list, 'couleur/filet'); append(b1, list);
  for (const f of [CATALOGUE[0], CATALOGUE[3], CATALOGUE[5], CATALOGUE[7]]) {
    const [t, d, dom, typ, dur, prix, promo] = f;
    const i = inst(S.row, null, { 'Intitulé': t, 'Description': d, 'Type': typ, 'Durée': dur, 'Prix': prix || '', 'Prix promo': promo, 'Prix barré': !!prix });
    append(list, i);
    await setNested(i, 'Étiquette domaine', 'Domaine', dom);
    if (!prix) { const p = i.findOne((n) => n.type === 'TEXT' && n.name === 'Prix promo'); if (p) p.fills = fill('couleur/encre'); }
  }
  append(b1, inst(S.btn, 'Type=Secondaire', { 'Libellé': 'Afficher plus de formations' }));

  // M2 · Questionnaire
  const m2 = mScreen('M2 · Questionnaire', 490);
  await mHeader(m2, 'Mon questionnaire');
  const b2 = mBody(m2, 24);
  const h2 = AL('VERTICAL', { name: 'Titre', gap: 6 }); append(b2, h2);
  await para(h2, 'Votre profil', 'Titre 1');
  await para(h2, 'Six questions, environ deux minutes.', 'Corps', 'couleur/encre-2');
  const fld = (parent, v, props) => { const f = inst(S.field, v, props); append(parent, f); return f; };
  const block = async (n, title) => { const s = AL('VERTICAL', { name: title, gap: 14 }); append(b2, s); const h = AL('HORIZONTAL', { name: 'Titre', gap: 10 }); h.counterAxisAlignItems = 'BASELINE'; append(s, h); h.appendChild(await txt(n, 'Titre 2', 'couleur/vert/700')); await para(h, title, 'Titre 2'); rule(s); return s; };
  const q1 = await block('1.', 'Votre parcours');
  fld(q1, 'Type=Liste', { 'Libellé': 'Niveau d\'études', 'Valeur': 'BAC II' });
  fld(q1, 'Type=Texte', { 'Libellé': 'Objectif professionnel', 'Valeur': 'Devenir développeur web' });
  fld(q1, 'Type=Zone de texte', { 'Libellé': 'Compétences actuelles', 'Valeur': 'Word, Excel, bases d\'Internet' });
  const q2 = await block('2.', 'Vos centres d\'intérêt');
  fld(q2, 'Type=Zone de texte', { 'Libellé': 'Domaines qui vous attirent', 'Valeur': 'Programmation, développement web' });
  const q3 = await block('3.', 'Vos contraintes');
  q3.appendChild(await txt('Type de formation souhaité', 'Libellé'));
  const opts = AL('VERTICAL', { name: 'Options', gap: 0 }); stroke(opts, 'couleur/filet-fort'); rad(opts); append(q3, opts);
  let first = true;
  for (const [title, desc, sel] of [['Formation courte, à la carte', 'De 1 jour à 3 mois.', true], ['Parcours modulaire certifiant', 'De 2 à 9 mois.', false]]) {
    const o = AL('HORIZONTAL', { name: 'Option · ' + title, gap: 12 }); pad(o, 14); o.counterAxisAlignItems = 'MIN'; o.fills = sel ? fill('couleur/vert/50') : fill('couleur/papier');
    if (!first) stroke(o, 'couleur/filet', 1, 't');
    append(opts, o); first = false;
    const radio = figma.createEllipse(); radio.name = 'Bouton radio'; radio.resize(18, 18); radio.fills = fill('couleur/papier');
    radio.strokes = fill(sel ? 'couleur/vert/600' : 'couleur/filet-fort'); radio.strokeWeight = sel ? 5 : 1.5; radio.strokeAlign = 'INSIDE';
    o.appendChild(radio);
    const t = AL('VERTICAL', { name: 'Texte', gap: 2 }); append(o, t);
    await para(t, title, 'Corps fort'); await para(t, desc, 'Petit', 'couleur/encre-2');
  }
  fld(q3, 'Type=Texte', { 'Libellé': 'Budget maximum (FCFA)', 'Valeur': '150 000', 'Aide': 'Seules les formations à ce prix ou moins seront proposées.', 'Afficher l\'aide': true });
  const bar = AL('VERTICAL', { name: 'Barre d\'action', gap: 8 }); pad(bar, 16); bar.fills = fill('couleur/papier'); stroke(bar, 'couleur/filet', 1, 't'); append(m2, bar);
  append(bar, inst(S.btn, 'Type=Principal', { 'Libellé': 'Voir mes recommandations' }));
  const nt = await para(bar, 'Toutes les questions sont obligatoires.', 'Petit', 'couleur/discret'); nt.textAlignHorizontal = 'CENTER';

  // M3 · Mes recommandations
  const m3 = mScreen('M3 · Mes recommandations', 980);
  await mHeader(m3, 'Mes recommandations');
  const b3 = mBody(m3, 16);
  const h3 = AL('VERTICAL', { name: 'Titre', gap: 6 }); append(b3, h3);
  await para(h3, 'Vos cinq formations recommandées', 'Titre 1');
  await para(h3, 'De la plus proche à la moins proche de votre profil.', 'Corps', 'couleur/encre-2');
  const prof = AL('HORIZONTAL', { name: 'Résumé du profil', gap: 12 }); prof.counterAxisAlignItems = 'CENTER'; pad(prof, 12, 14); prof.fills = fill('couleur/papier'); stroke(prof, 'couleur/filet'); rad(prof); append(b3, prof);
  const pt = AL('VERTICAL', { name: 'Texte', gap: 2 }); append(prof, pt);
  await para(pt, 'À la carte · 150 000 FCFA max.', 'Petit fort');
  await para(pt, 'Objectif : devenir développeur web', 'Petit', 'couleur/encre-2');
  prof.appendChild(inst(S.btn, 'Type=Lien', { 'Libellé': 'Modifier' }));
  let rank = 1;
  for (const r of RECOS_M) append(b3, await recommandation(S.reco, r, rank++));
  await para(b3, 'Faites défiler pour voir les recommandations 4 et 5.', 'Petit', 'couleur/discret');

  figma.viewport.scrollAndZoomIntoView([m1, m2, m3]);
  return true;
}

// ---------------------------------------------------------------- exécution

try {
  await initDesign(false);
  const r = await ecransMobile();
  out(r ? '✅ 3 écrans créés sur la page « v2 · Écrans mobile »' : 'ℹ️ Écrans mobile v2 déjà présents : rien à faire');
} catch (e) { out('❌ ' + e.message); }
