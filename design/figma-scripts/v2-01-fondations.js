// HIT-T — design v2 (institutionnel) · étape 1 · Fondations
// À coller dans le plugin Scripter, dans le fichier des maquettes HIT-T, puis Run.
// Crée les pages « v2 · … », les couleurs du logo, la typographie (Source Serif / Source Sans) et tous les composants.
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
  'couleur/danger': '#B3261E',
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

const SVG_LOGO = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1080\" height=\"698\" viewBox=\"0 0 1080 698\"><path fill=\"#1A8559\" fill-rule=\"evenodd\" d=\"M516.3 690.2C515.3 689.6 515.3 681.2 516.0 652.7C516.5 632.5 517.2 615.5 517.5 615.0C518.2 613.9 533.1 613.6 536.8 614.6C538.9 615.2 539.0 615.6 539.0 628.5C539.0 640.4 539.2 641.9 540.8 642.4C541.7 642.6 548.1 642.6 555.0 642.2L567.5 641.5L567.2 627.8L566.8 614.1L570.2 613.6C578.7 612.3 587.9 612.2 588.9 613.3C589.4 614.0 591.1 630.9 592.6 650.8C594.9 680.3 595.2 687.3 594.1 687.9C592.4 689.0 572.3 690.3 571.0 689.5C570.4 689.1 570.0 684.3 570.0 678.2C570.0 672.3 569.7 665.8 569.4 663.7L568.7 659.9L554.6 660.2L540.5 660.5L540.0 675.5L539.5 690.5L528.5 690.8C522.5 690.9 517.0 690.6 516.3 690.2ZM464.0 687.6C450.0 683.4 441.8 678.0 437.1 669.7C426.4 650.8 434.7 626.6 455.3 616.9C463.1 613.3 469.9 612.0 480.9 612.0C489.8 612.0 502.6 614.2 504.4 616.0C505.1 616.7 504.7 619.2 503.1 624.0C501.8 627.9 500.5 631.0 500.2 631.0C499.9 631.0 495.9 630.3 491.2 629.4C470.9 625.6 457.5 634.4 457.5 651.5C457.6 666.5 470.0 674.8 491.1 673.8L498.5 673.5L499.9 680.4C501.7 689.9 501.4 690.0 484.6 689.9C474.0 689.9 470.1 689.5 464.0 687.6ZM612.6 682.9C611.7 677.7 606.0 618.6 606.0 614.6C606.0 611.7 606.4 610.9 608.2 610.6C611.0 610.0 627.8 608.0 630.2 608.0C631.9 608.0 643.7 621.9 658.3 641.2C662.1 646.1 665.4 650.0 665.6 649.8C665.8 649.5 664.2 640.8 662.1 630.4C660.0 620.0 658.0 609.7 657.9 607.5L657.5 603.5L666.7 601.9C671.7 601.0 676.3 600.6 676.8 600.9C677.3 601.2 680.3 614.1 683.5 629.5C692.4 673.1 692.4 673.0 691.2 674.2C690.1 675.3 680.5 677.5 671.9 678.5L666.3 679.2L656.4 667.5C647.8 657.4 636.6 643.2 630.7 635.0L628.9 632.5L629.4 638.0C629.7 641.0 631.0 651.3 632.4 660.8C633.9 670.2 635.0 679.3 635.0 680.9C635.0 684.3 634.2 684.6 621.8 685.6L613.1 686.3L612.6 682.9ZM396.0 679.0C366.6 673.6 359.1 672.2 358.0 671.5C357.5 671.2 357.0 669.8 357.0 668.4C357.0 665.7 371.8 598.8 372.6 598.0C372.9 597.8 377.7 598.4 383.3 599.4C388.9 600.4 400.6 602.4 409.2 603.9C417.9 605.4 425.2 606.9 425.6 607.2C426.3 608.0 425.1 620.3 424.1 621.9C423.6 622.7 419.4 622.3 408.5 620.5C400.4 619.1 393.1 618.1 392.4 618.4C390.5 619.1 388.8 628.2 390.3 629.6C391.0 630.2 397.6 631.7 405.0 632.9C412.4 634.2 418.9 635.4 419.3 635.7C420.1 636.2 419.4 645.4 418.4 649.2C417.7 651.5 416.6 651.5 400.5 648.4C393.0 646.9 386.6 646.0 386.3 646.4C385.9 646.7 385.1 649.6 384.4 652.8C383.6 657.0 383.5 658.8 384.4 659.7C385.0 660.3 391.8 661.8 399.5 663.0C407.2 664.1 414.8 665.3 416.4 665.7L419.3 666.2L418.6 673.2C418.3 677.1 417.7 680.6 417.4 681.1C416.6 682.4 413.0 682.1 396.0 679.0ZM722.9 662.5C696.5 654.0 688.3 618.7 708.0 599.0C722.0 585.0 746.6 579.8 762.3 587.5C769.9 591.2 778.1 600.0 781.2 607.7C783.1 612.5 783.5 615.3 783.5 624.0C783.5 633.8 783.3 634.9 780.5 639.8C775.3 649.3 765.6 656.8 753.0 661.2C745.5 663.8 729.1 664.5 722.9 662.5ZM306.5 658.4C302.2 657.1 298.2 655.6 297.7 655.1C296.8 654.2 299.3 645.1 308.7 615.2C311.2 607.4 313.0 600.3 312.7 599.6C312.4 598.8 308.4 597.0 303.8 595.5C299.2 594.0 295.0 592.3 294.4 591.8C293.3 591.0 293.8 587.8 296.7 578.8C297.5 576.2 299.7 576.5 313.9 580.9C320.8 583.1 331.2 586.2 337.0 587.8C342.8 589.4 350.5 591.5 354.2 592.6C361.8 594.7 361.8 594.7 359.6 604.0C358.1 610.7 357.0 611.0 346.6 608.0C342.6 606.8 338.4 606.0 337.4 606.2C335.4 606.5 334.1 610.6 324.3 647.2L320.7 661.0L317.6 660.9C315.9 660.9 310.9 659.8 306.5 658.4ZM749.5 645.1C755.2 642.5 757.9 639.1 759.2 632.8C761.5 621.8 755.2 606.7 746.6 602.6C738.0 598.5 727.0 602.2 723.3 610.4C719.6 618.7 721.6 632.8 727.6 639.8C733.7 646.9 741.5 648.8 749.5 645.1ZM807.3 639.8C806.8 639.1 805.0 634.7 803.3 630.0C801.7 625.3 797.5 613.9 794.1 604.5C781.5 570.1 781.9 571.6 783.8 570.2C786.2 568.3 801.1 562.8 802.4 563.3C803.6 563.8 803.8 564.2 816.0 595.0C820.5 606.3 824.5 615.9 825.0 616.4C825.5 616.9 832.5 614.4 841.2 610.6C849.6 607.0 856.9 604.0 857.3 604.0C858.6 604.0 864.3 616.9 863.7 618.4C863.2 619.8 852.0 624.7 825.8 635.1C810.3 641.4 808.8 641.7 807.3 639.8ZM242.5 612.1C229.3 606.7 224.4 604.5 222.0 602.9L219.6 601.3L221.5 596.9C222.5 594.5 223.7 592.1 224.1 591.6C225.0 590.6 256.0 603.0 256.7 604.6C257.5 606.8 253.3 615.0 251.3 615.0C250.3 614.9 246.3 613.6 242.5 612.1ZM872.7 602.5C863.0 598.9 854.0 589.1 850.5 578.2C847.7 569.8 848.7 557.0 852.8 548.9C858.3 537.8 867.2 530.0 880.2 524.9C887.5 522.0 889.6 521.6 898.1 521.6C906.7 521.6 908.3 521.9 913.6 524.5C920.8 528.0 928.6 535.9 932.5 543.7C935.3 549.0 935.5 550.4 935.5 560.0C935.5 568.8 935.1 571.2 933.3 575.0C927.8 586.0 914.5 596.8 900.8 601.4C892.0 604.4 879.2 604.8 872.7 602.5ZM144.7 590.7C139.4 587.8 134.8 584.9 134.5 584.2C133.9 582.6 135.3 579.8 144.6 564.3C153.9 548.8 161.0 535.5 161.0 533.6C161.0 532.7 157.5 530.0 153.0 527.4C148.6 524.8 144.6 522.2 144.1 521.6C143.0 520.3 149.4 508.4 151.6 507.6C152.3 507.3 156.6 509.4 161.2 512.2C169.8 517.4 195.5 531.7 204.8 536.4C208.4 538.2 210.0 539.6 210.0 541.0C210.0 543.9 204.8 554.0 203.3 554.0C202.5 554.0 197.9 551.9 193.0 549.4C188.0 546.9 183.6 545.1 183.1 545.5C182.2 546.0 179.1 551.7 162.8 582.6C159.6 588.8 156.4 594.2 155.7 594.8C154.8 595.6 151.8 594.5 144.7 590.7ZM904.7 582.2C910.4 578.6 913.5 571.8 912.5 565.1C910.6 551.8 899.7 540.1 889.2 540.0C883.7 540.0 876.3 544.4 873.9 549.2C869.5 557.8 873.6 574.4 881.8 580.6C889.6 586.6 896.9 587.1 904.7 582.2ZM501.8 564.9C443.3 562.5 394.7 556.1 342.0 543.9C315.0 537.7 306.1 535.3 283.0 527.8C253.3 518.1 214.5 502.2 197.8 492.8C194.1 490.7 190.8 489.0 190.5 489.0C189.0 489.0 165.3 474.9 153.0 466.7C85.9 422.1 47.5 370.5 37.9 312.0C36.2 302.3 36.3 275.8 37.9 265.5C45.4 217.5 73.3 173.5 121.5 133.6C145.7 113.6 173.5 96.1 207.0 79.8C294.6 37.4 401.8 13.7 517.0 11.4C583.4 10.0 654.5 16.8 724.0 31.1C877.0 62.7 992.0 131.3 1034.8 216.6C1058.0 262.9 1058.0 314.1 1034.8 360.4C998.7 432.4 908.9 494.3 789.4 529.5C745.0 542.6 691.7 553.3 642.0 559.0C636.8 559.6 629.1 560.5 625.0 561.0C606.3 563.3 553.9 566.1 533.0 565.8C525.6 565.8 511.5 565.4 501.8 564.9ZM90.3 557.7C85.2 554.3 81.0 550.9 81.0 550.2C81.0 548.7 85.0 542.5 100.5 520.0C106.4 511.5 113.5 501.0 116.3 496.8C119.5 491.9 122.2 489.0 123.2 489.0C124.2 489.0 128.6 491.4 133.0 494.2C138.5 497.9 141.0 500.1 141.0 501.5C141.0 502.6 135.7 511.7 129.2 521.6C122.8 531.5 114.0 545.1 109.7 551.8C105.4 558.5 101.3 564.0 100.7 564.0C100.0 563.9 95.3 561.1 90.3 557.7ZM963.9 551.9C956.5 551.1 950.0 547.9 944.4 542.3C939.0 536.8 936.5 532.1 934.5 523.7C931.7 511.6 936.3 497.8 947.1 485.7C955.4 476.4 976.5 462.0 981.8 462.0C983.2 462.0 984.4 463.8 986.3 468.8C987.8 472.5 989.0 475.9 989.0 476.3C989.0 476.8 987.3 477.8 985.3 478.6C974.9 483.0 962.1 493.6 958.9 500.5C952.4 514.4 962.6 530.3 978.0 530.3C986.3 530.3 1000.0 523.3 1000.0 519.1C1000.0 516.7 995.2 510.0 993.4 510.0C992.6 510.0 990.4 511.1 988.6 512.5C986.8 513.9 984.6 515.0 983.8 515.0C982.2 515.0 975.0 505.2 975.0 503.1C975.0 502.6 977.8 500.1 981.3 497.6C984.7 495.2 990.7 490.6 994.5 487.6C998.4 484.5 1002.0 482.0 1002.6 482.0C1004.0 482.0 1007.0 485.4 1015.5 496.5C1018.8 500.8 1023.0 506.1 1024.8 508.2C1026.5 510.4 1028.0 513.2 1028.0 514.3C1028.0 516.9 1009.5 535.4 1002.9 539.3C992.6 545.5 980.2 551.0 975.0 551.8C972.0 552.2 967.0 552.3 963.9 551.9ZM53.2 532.0C48.2 528.1 44.0 524.6 44.0 524.1C44.0 523.6 47.8 518.3 52.5 512.4C57.2 506.4 60.9 501.0 60.8 500.4C60.4 498.9 39.0 482.0 37.5 482.0C36.8 482.0 35.5 483.1 34.7 484.4C33.8 485.7 31.7 488.3 30.0 490.1C28.3 492.0 25.2 495.6 23.2 498.2C21.2 500.9 19.1 503.0 18.5 503.0C17.2 503.0 13.3 500.2 5.7 493.6C-1.2 487.7 -1.5 485.6 3.8 479.7C12.1 470.7 29.9 450.8 38.5 441.2C43.4 435.6 48.2 431.0 49.1 431.0C50.0 431.0 53.6 433.5 57.1 436.6C68.6 446.7 68.4 444.3 58.6 456.0C53.9 461.7 50.0 466.6 50.0 467.0C50.0 468.5 71.3 485.1 72.7 484.8C73.4 484.6 77.3 480.2 81.3 475.0C85.3 469.8 89.2 465.4 90.1 465.2C92.2 464.8 108.0 476.7 108.0 478.7C108.0 479.6 106.6 482.1 104.9 484.4C99.3 491.9 80.9 517.3 73.2 528.2C69.0 534.2 64.9 539.0 64.0 539.0C63.2 539.0 58.3 535.8 53.2 532.0ZM1052.9 481.4C1048.8 476.6 1044.6 471.7 1043.5 470.4C1042.3 469.0 1039.2 467.4 1036.0 466.6C1022.6 463.2 993.4 453.8 992.2 452.6C991.1 451.5 991.9 450.4 997.2 445.9C1000.7 442.9 1004.9 439.3 1006.5 437.8C1008.1 436.2 1010.0 435.0 1010.5 435.0C1011.0 435.0 1017.9 437.8 1025.8 441.1C1033.6 444.5 1040.3 447.0 1040.6 446.7C1041.0 446.4 1039.1 440.1 1036.6 432.8C1034.1 425.5 1032.0 418.4 1032.0 417.0C1032.0 415.2 1034.3 412.2 1040.3 406.2C1044.9 401.7 1049.1 398.0 1049.7 398.0C1050.8 398.0 1054.3 415.0 1057.9 437.9L1059.9 450.2L1066.2 456.9C1069.6 460.5 1074.2 465.2 1076.2 467.2C1078.3 469.3 1080.0 471.9 1080.0 472.9C1080.0 475.1 1064.1 490.0 1061.7 490.0C1060.9 490.0 1056.9 486.1 1052.9 481.4Z\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M339.4 432.7C339.2 432.0 339.1 422.9 339.2 412.5L339.5 393.5L363.2 393.2L387.0 393.0L387.0 286.5C387.0 202.2 386.7 179.8 385.8 179.5C385.1 179.2 374.2 179.3 361.6 179.7L338.6 180.5L338.9 199.0C339.0 210.2 338.7 218.6 338.1 220.3L337.0 223.0L308.3 222.8L279.5 222.5L279.2 180.7L279.0 139.0L420.5 139.0L562.0 139.0L561.8 180.7L561.5 222.5L532.2 222.8C516.2 222.9 503.0 222.7 503.0 222.3C503.0 221.8 502.9 212.3 502.7 201.0L502.5 180.5L478.2 180.2L454.0 180.0L454.0 286.5L454.0 393.0L478.0 393.0L502.0 393.0L502.0 413.5L502.0 434.0L421.0 434.0C356.0 434.0 339.8 433.7 339.4 432.7ZM712.4 432.7C712.2 432.0 712.1 422.9 712.2 412.5L712.5 393.5L736.2 393.2L760.0 393.0L760.0 286.5L760.0 180.0L736.0 180.0L712.0 180.0L711.8 201.2L711.5 222.5L682.0 222.5L652.5 222.5L652.5 181.0L652.5 139.5L793.8 139.2L935.0 139.0L934.8 180.7L934.5 222.5L905.2 222.8L876.0 223.0L876.0 201.5L876.0 180.0L851.5 180.0L827.0 180.0L827.0 286.5L827.0 393.0L851.0 393.0L875.0 393.0L875.0 413.5L875.0 434.0L794.0 434.0C729.0 434.0 712.8 433.7 712.4 432.7ZM543.4 358.7C543.2 358.0 543.1 348.5 543.2 337.5L543.5 317.5L607.0 317.5L670.5 317.5L671.0 336.5C671.3 346.9 671.4 356.5 671.2 357.8L670.9 360.0L607.4 360.0C556.8 360.0 543.8 359.7 543.4 358.7Z\"/><path fill=\"#F5D31B\" fill-rule=\"evenodd\" d=\"M365.2 286.6L365.2 180.1L370.3 179.5C373.2 179.1 378.0 179.0 381.0 179.2L386.5 179.5L386.8 286.2L387.0 393.0L376.1 393.0L365.2 393.0L365.2 286.6Z\"/><path fill=\"#D84416\" fill-rule=\"evenodd\" d=\"M145.2 433.7C143.2 432.8 142.9 432.1 143.2 427.1L143.5 421.5L158.2 421.2L173.0 420.9L173.0 292.1C173.0 221.2 172.7 162.5 172.4 161.6C171.9 160.3 169.8 160.0 159.3 160.0C147.7 160.0 146.6 159.8 144.9 157.8C142.4 155.0 142.5 149.9 145.0 147.2L147.1 145.0L202.6 145.0C248.8 145.1 258.4 145.3 259.6 146.5C261.4 148.3 261.4 156.7 259.6 158.6C258.5 159.7 255.1 160.0 245.2 160.0C234.2 160.0 232.1 160.2 231.6 161.6C230.8 163.7 230.9 274.5 231.6 276.5C232.1 277.8 237.3 278.0 269.5 278.0C304.1 278.0 306.8 277.9 307.5 276.2C307.9 275.3 308.1 262.9 308.0 248.8L307.9 223.1L323.2 222.8L338.5 222.5L338.8 201.2L339.0 179.9L352.1 180.2L365.2 180.5L365.1 285.5C365.1 343.2 365.1 391.1 365.1 391.8C365.0 392.7 361.7 393.0 352.0 393.0L339.0 393.0L339.0 414.0L339.0 435.1L310.9 435.0C292.7 434.9 281.9 434.4 280.3 433.7C278.1 432.7 277.9 432.1 278.2 427.6C278.4 424.8 278.9 422.2 279.5 421.8C280.1 421.4 286.4 421.0 293.6 421.0L306.8 421.0L307.4 417.9C308.2 413.9 308.2 296.7 307.4 294.6C306.9 293.2 302.6 293.0 269.9 293.0L233.0 293.0L232.0 295.6C230.9 298.4 230.6 412.6 231.6 417.9L232.2 421.0L246.6 421.0L261.0 421.0L261.0 427.4C261.0 432.2 260.6 433.9 259.5 434.4C256.5 435.5 147.6 434.9 145.2 433.7Z\"/></svg>";

// ---------------------------------------------------------------- fondations et composants

const ICONES = {
  'horloge': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'pouce-haut': '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
  'pouce-bas': '<path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/>',
  'recherche': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'chevron-bas': '<path d="m6 9 6 6 6-6"/>',
  'chevron-droite': '<path d="m9 18 6-6-6-6"/>',
  'fleche-gauche': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'deconnexion': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  'menu': '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
};

async function section(board, title, note) {
  const s = AL('VERTICAL', { name: title, gap: 16 });
  board.appendChild(s);
  s.layoutSizingHorizontal = 'FILL';
  const h = AL('VERTICAL', { name: 'Titre', gap: 4 }); append(s, h);
  h.appendChild(await txt(title, 'Titre 2'));
  if (note) await para(h, note, 'Petit', 'couleur/discret');
  rule(s);
  return s;
}

function logoSvg(h) {
  const f = figma.createNodeFromSvg(SVG_LOGO);
  f.name = 'Logo HIT-T';
  f.fills = [];
  f.rescale(h / f.height);
  return f;
}

async function navLink(label, active, dark = true) {
  const l = AL('HORIZONTAL', { name: 'Lien · ' + label });
  l.counterAxisAlignItems = 'CENTER';
  l.paddingLeft = l.paddingRight = 18;
  l.appendChild(await txt(label, 'Libellé', dark ? 'couleur/blanc' : 'couleur/encre'));
  setH(l, 52);
  const ind = figma.createRectangle();
  ind.name = 'Indicateur';
  ind.fills = fill('couleur/jaune/500');
  l.appendChild(ind);
  ind.layoutPositioning = 'ABSOLUTE';
  ind.resize(Math.max(l.width, 10), 3);
  ind.x = 0; ind.y = 49;
  ind.constraints = { horizontal: 'STRETCH', vertical: 'MAX' };
  ind.visible = active;
  return l;
}

async function fondations() {
  FP = await getPage(PAGES.fond, true);
  DESK = await getPage(PAGES.desk, true);
  MOB = await getPage(PAGES.mob, true);
  await goTo(FP);
  if (exists(FP, 'Fondations HIT-T v2')) return false;

  const board = AL('VERTICAL', { name: 'Fondations HIT-T v2', gap: 56 });
  setW(board, 1600);
  pad(board, 64);
  board.fills = fill('couleur/fond');
  board.x = 0; board.y = 0;

  // En-tête de planche
  const intro = AL('VERTICAL', { name: 'Introduction', gap: 8 }); append(board, intro);
  intro.appendChild(await txt('Charte de la plateforme', 'Surtitre', 'couleur/vert/700'));
  intro.appendChild(await txt('HIT-T Institute — fondations v2', 'Display'));
  await para(intro, 'Style institutionnel : couleurs du logo, titres à empattements (Source Serif), texte courant en Source Sans, angles presque droits, filets fins, pas d\'ombres. Une seule couleur d\'accent (le vert du logo) ; pas de fonds teintés ni de pastilles.', 'Corps', 'couleur/encre-2');

  // Couleurs
  const sCol = await section(board, 'Couleurs', 'Une seule couleur d\'accent : le vert du logo. L\'orange n\'apparaît que sur les prix promotionnels, le jaune que sous l\'onglet actif. Tout le reste est en neutres chauds.');
  const sw = AL('HORIZONTAL', { name: 'Nuancier', gap: 16 }); sw.layoutWrap = 'WRAP'; sw.counterAxisSpacing = 16; append(sCol, sw);
  for (const n of ['couleur/vert/800', 'couleur/vert/700', 'couleur/vert/600', 'couleur/vert/100', 'couleur/orange/700', 'couleur/jaune/500', 'couleur/encre', 'couleur/encre-2', 'couleur/discret', 'couleur/filet', 'couleur/fond']) {
    const c = AL('VERTICAL', { name: n, gap: 8 });
    const chip = figma.createRectangle(); chip.name = 'Échantillon'; chip.resize(128, 72); chip.fills = fill(n); chip.strokes = fill('couleur/filet'); chip.strokeWeight = 1;
    c.appendChild(chip);
    c.appendChild(await txt(n.replace('couleur/', ''), 'Petit fort'));
    c.appendChild(await txt(COULEURS[n], 'Petit', 'couleur/discret'));
    sw.appendChild(c);
  }

  // Typographie
  const sTy = await section(board, 'Typographie');
  for (const [name] of STYLES) {
    const r = AL('HORIZONTAL', { name, gap: 24 }); r.counterAxisAlignItems = 'BASELINE'; append(sTy, r);
    const l = await txt(name, 'Petit', 'couleur/discret'); r.appendChild(l); l.textAutoResize = 'HEIGHT'; l.resize(140, l.height);
    r.appendChild(await txt(name === 'Chiffre' || name === 'Rang' ? '27 · 74 %' : 'Formation en développement web', name));
  }

  // Icônes
  const sIc = await section(board, 'Icônes', 'Trait 1,75 px. Pas d\'icône décorative : une icône accompagne toujours un libellé ou une action.');
  const ir = AL('HORIZONTAL', { name: 'Icônes', gap: 20 }); append(sIc, ir, null);
  for (const [n, body] of Object.entries(ICONES)) {
    const f = figma.createNodeFromSvg('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#4A4844" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>');
    const c = figma.createComponentFromNode(f);
    c.name = 'Icône/' + n;
    c.fills = [];
    ir.appendChild(c);
  }

  // Logo
  const sLogo = await section(board, 'Logo et en-têtes');
  const lr = AL('HORIZONTAL', { name: 'Logos', gap: 48 }); lr.counterAxisAlignItems = 'CENTER'; append(sLogo, lr, null);
  const full = figma.createComponent(); full.name = 'Logo complet'; full.layoutMode = 'HORIZONTAL'; full.primaryAxisSizingMode = 'AUTO'; full.counterAxisSizingMode = 'AUTO'; full.fills = [];
  full.appendChild(logoSvg(120)); full.description = 'Logo officiel (vectorisé depuis le PNG du cabinet). Sur fond blanc ou clair uniquement.';
  lr.appendChild(full);
  const logos = [];
  for (const variant of ['Complet', 'Compact']) {
    const lg = figma.createComponent(); lg.name = 'Taille=' + variant;
    lg.layoutMode = 'HORIZONTAL'; lg.primaryAxisSizingMode = 'AUTO'; lg.counterAxisSizingMode = 'AUTO'; lg.counterAxisAlignItems = 'CENTER'; lg.itemSpacing = 14; lg.fills = [];
    lg.appendChild(logoSvg(variant === 'Complet' ? 44 : 34));
    if (variant === 'Complet') {
      const sep = figma.createRectangle(); sep.name = 'Séparateur'; sep.resize(1, 36); sep.fills = fill('couleur/filet'); lg.appendChild(sep);
      const t = AL('VERTICAL', { name: 'Nom', gap: 0 });
      t.appendChild(await txt('HIT-T Institute', 'Marque'));
      t.appendChild(await txt('Plateforme d\'orientation des apprenants', 'Petit', 'couleur/discret'));
      lg.appendChild(t);
    } else {
      lg.appendChild(await txt('HIT-T Institute', 'Marque'));
    }
    logos.push(lg);
  }
  const logoSet = figma.combineAsVariants(logos, lr); logoSet.name = 'Logo';
  logoSet.layoutMode = 'HORIZONTAL'; logoSet.itemSpacing = 48; logoSet.counterAxisAlignItems = 'CENTER'; logoSet.primaryAxisSizingMode = 'AUTO'; logoSet.counterAxisSizingMode = 'AUTO'; logoSet.fills = [];

  // Boutons
  const btnSet = await (async () => {
    const vs = [];
    for (const [type, bg, fg, st] of [['Principal', 'couleur/vert/600', 'couleur/blanc', null], ['Secondaire', 'couleur/papier', 'couleur/vert/700', 'couleur/vert/600'], ['Lien', null, 'couleur/vert/700', null], ['Danger', 'couleur/papier', 'couleur/danger', 'couleur/danger']]) {
      const c = figma.createComponent(); c.name = 'Type=' + type;
      c.layoutMode = 'HORIZONTAL'; c.primaryAxisSizingMode = 'AUTO'; c.counterAxisSizingMode = 'AUTO'; c.primaryAxisAlignItems = 'CENTER'; c.counterAxisAlignItems = 'CENTER'; c.itemSpacing = 8;
      if (type === 'Lien') pad(c, 4, 0); else pad(c, 11, 20);
      rad(c); c.fills = bg ? fill(bg) : [];
      if (st) stroke(c, st);
      const t = await txt('Bouton', 'Libellé', fg); t.name = 'Libellé';
      if (type === 'Lien') t.textDecoration = 'UNDERLINE';
      c.appendChild(t);
      vs.push(c);
    }
    const s = await section(board, 'Boutons', 'Un seul bouton principal par écran. « Lien » pour les actions secondaires dans le texte ou les tableaux.');
    const set = figma.combineAsVariants(vs, s); set.name = 'Bouton';
    set.layoutMode = 'HORIZONTAL'; set.itemSpacing = 24; set.counterAxisAlignItems = 'CENTER'; set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO'; set.fills = [];
    const k = set.addComponentProperty('Libellé', 'TEXT', 'Bouton');
    for (const v of set.children) v.findOne((n) => n.type === 'TEXT').componentPropertyReferences = { characters: k };
    return set;
  })();

  // Champs
  {
    const vs = [];
    for (const type of ['Texte', 'Liste', 'Zone de texte']) {
      const c = figma.createComponent(); c.name = 'Type=' + type;
      c.layoutMode = 'VERTICAL'; c.itemSpacing = 6; c.fills = [];
      c.resize(360, 10); c.counterAxisSizingMode = 'FIXED'; c.primaryAxisSizingMode = 'AUTO';
      const l = await txt('Libellé', 'Libellé'); l.name = 'Libellé'; c.appendChild(l);
      const box = AL('HORIZONTAL', { name: 'Champ', gap: 8 }); box.counterAxisAlignItems = type === 'Zone de texte' ? 'MIN' : 'CENTER';
      pad(box, 10, 12); rad(box); box.fills = fill('couleur/papier'); stroke(box, 'couleur/filet-fort');
      append(c, box); setH(box, type === 'Zone de texte' ? 96 : 44); box.layoutSizingHorizontal = 'FILL';
      const val = await txt('Saisir…', 'Corps'); val.name = 'Valeur'; box.appendChild(val); val.textAutoResize = 'HEIGHT'; val.layoutSizingHorizontal = 'FILL';
      if (type === 'Liste') box.appendChild(await icon('chevron-bas', 18, 'couleur/encre-2'));
      const h = await txt('Texte d\'aide', 'Petit', 'couleur/discret'); h.name = 'Aide'; h.visible = false; c.appendChild(h); h.textAutoResize = 'HEIGHT'; h.layoutSizingHorizontal = 'FILL';
      vs.push(c);
    }
    const s = await section(board, 'Champs de formulaire');
    const set = figma.combineAsVariants(vs, s); set.name = 'Champ';
    set.layoutMode = 'HORIZONTAL'; set.itemSpacing = 32; set.counterAxisAlignItems = 'MIN'; set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO'; set.fills = [];
    const kL = set.addComponentProperty('Libellé', 'TEXT', 'Libellé'), kV = set.addComponentProperty('Valeur', 'TEXT', 'Saisir…'), kA = set.addComponentProperty('Aide', 'TEXT', 'Texte d\'aide'), kAv = set.addComponentProperty('Afficher l\'aide', 'BOOLEAN', false);
    for (const v of set.children) {
      const ts = v.findAll((n) => n.type === 'TEXT');
      ts.find((t) => t.name === 'Libellé').componentPropertyReferences = { characters: kL };
      ts.find((t) => t.name === 'Valeur').componentPropertyReferences = { characters: kV };
      ts.find((t) => t.name === 'Aide').componentPropertyReferences = { characters: kA, visible: kAv };
    }
  }

  // Étiquettes, mots-clés, onglets
  const sTag = await section(board, 'Étiquettes, mots-clés et onglets', 'Le domaine est écrit en surtitre, sans couleur propre. Les mots-clés sont du texte, pas des pastilles.');
  const tr = AL('HORIZONTAL', { name: 'Ligne', gap: 48 }); tr.counterAxisAlignItems = 'CENTER'; append(sTag, tr, null);
  {
    const vs = [];
    for (const [d, label, c] of [['SISG', 'SISG', 'couleur/vert/700'], ['IA-Data', 'IA · Data', 'couleur/vert/700'], ['TRIT', 'TRIT', 'couleur/vert/700']]) {
      const e = figma.createComponent(); e.name = 'Domaine=' + d;
      e.layoutMode = 'HORIZONTAL'; e.primaryAxisSizingMode = 'AUTO'; e.counterAxisSizingMode = 'AUTO'; e.counterAxisAlignItems = 'CENTER'; e.itemSpacing = 6; e.fills = [];
      e.appendChild(await txt(label, 'Surtitre', c));
      vs.push(e);
    }
    const set = figma.combineAsVariants(vs, tr); set.name = 'Étiquette domaine';
    set.layoutMode = 'HORIZONTAL'; set.itemSpacing = 20; set.counterAxisAlignItems = 'CENTER'; set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO'; set.fills = [];
  }
  {
    const vs = [];
    for (const [v, bg, fg, style] of [['Oui', null, 'couleur/encre', 'Petit fort'], ['Non', null, 'couleur/encre-2', 'Petit']]) {
      const e = figma.createComponent(); e.name = 'Commun=' + v;
      e.layoutMode = 'HORIZONTAL'; e.primaryAxisSizingMode = 'AUTO'; e.counterAxisSizingMode = 'AUTO'; e.fills = []; e.paddingTop = 0; e.paddingBottom = 2;
      stroke(e, v === 'Oui' ? 'couleur/vert/600' : 'couleur/filet-fort', 1, 'b');
      const t = await txt('mot-clé', style, fg); t.name = 'Mot'; e.appendChild(t);
      vs.push(e);
    }
    const set = figma.combineAsVariants(vs, tr); set.name = 'Mot-clé';
    set.layoutMode = 'HORIZONTAL'; set.itemSpacing = 16; set.counterAxisAlignItems = 'CENTER'; set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO'; set.fills = [];
    const k = set.addComponentProperty('Mot', 'TEXT', 'mot-clé');
    for (const v of set.children) v.findOne((n) => n.type === 'TEXT').componentPropertyReferences = { characters: k };
    set.description = 'Commun=Oui : mot-clé présent à la fois dans le profil et dans la formation (explication RF-09).';
  }
  {
    const vs = [];
    for (const v of ['Actif', 'Inactif']) {
      const e = figma.createComponent(); e.name = 'État=' + v;
      e.layoutMode = 'HORIZONTAL'; e.primaryAxisSizingMode = 'AUTO'; e.counterAxisSizingMode = 'AUTO'; e.fills = []; e.paddingTop = e.paddingBottom = 10; e.paddingLeft = e.paddingRight = 2;
      if (v === 'Actif') stroke(e, 'couleur/vert/600', 3, 'b');
      const t = await txt('Tous', 'Libellé', v === 'Actif' ? 'couleur/encre' : 'couleur/discret'); t.name = 'Libellé'; e.appendChild(t);
      vs.push(e);
    }
    const set = figma.combineAsVariants(vs, tr); set.name = 'Onglet';
    set.layoutMode = 'HORIZONTAL'; set.itemSpacing = 24; set.counterAxisAlignItems = 'CENTER'; set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO'; set.fills = [];
    const k = set.addComponentProperty('Libellé', 'TEXT', 'Tous');
    for (const v of set.children) v.findOne((n) => n.type === 'TEXT').componentPropertyReferences = { characters: k };
  }

  // En-tête desktop
  const sHead = await section(board, 'En-tête et pied de page', 'Bandeau vert plein pour la navigation ; l\'onglet actif est souligné en jaune.');
  {
    const vs = [];
    const links = { Visiteur: ['Catalogue des formations', 'Obtenir mes recommandations'], Apprenant: ['Catalogue des formations', 'Mon questionnaire', 'Mes recommandations'], Administrateur: ['Tableau de bord', 'Catalogue des formations'] };
    for (const role of ['Visiteur', 'Apprenant', 'Administrateur']) {
      const h = figma.createComponent(); h.name = 'Rôle=' + role;
      h.layoutMode = 'VERTICAL'; h.resize(1440, 10); h.counterAxisSizingMode = 'FIXED'; h.primaryAxisSizingMode = 'AUTO'; h.fills = fill('couleur/papier');
      const top = AL('HORIZONTAL', { name: 'Barre haute' }); top.primaryAxisAlignItems = 'SPACE_BETWEEN'; top.counterAxisAlignItems = 'CENTER'; pad(top, 14, 120); append(h, top);
      top.appendChild(logoSet.children[0].createInstance());
      const right = AL('HORIZONTAL', { name: 'Compte', gap: 24 }); right.counterAxisAlignItems = 'CENTER'; top.appendChild(right);
      if (role === 'Visiteur') {
        right.appendChild(inst(btnSet, 'Type=Lien', { 'Libellé': 'Se connecter' }));
        right.appendChild(inst(btnSet, 'Type=Principal', { 'Libellé': 'Créer un compte' }));
      } else {
        const who = AL('VERTICAL', { name: 'Identité' }); who.counterAxisAlignItems = 'MAX'; right.appendChild(who);
        who.appendChild(await txt(role === 'Apprenant' ? 'Afi Kossi' : 'Administration HIT-T', 'Libellé'));
        who.appendChild(await txt(role === 'Apprenant' ? 'Espace apprenant' : 'Accès administrateur', 'Petit', 'couleur/discret'));
        const out = AL('HORIZONTAL', { name: 'Déconnexion', gap: 6 }); out.counterAxisAlignItems = 'CENTER';
        out.appendChild(await icon('deconnexion', 18, 'couleur/vert/700'));
        out.appendChild(await txt('Se déconnecter', 'Libellé', 'couleur/vert/700'));
        right.appendChild(out);
      }
      const nav = AL('HORIZONTAL', { name: 'Navigation' }); nav.fills = fill('couleur/vert/700'); nav.paddingLeft = nav.paddingRight = 102; append(h, nav);
      let first = true;
      for (const l of links[role]) { nav.appendChild(await navLink(l, first)); first = false; }
      vs.push(h);
    }
    const set = figma.combineAsVariants(vs, sHead); set.name = 'En-tête';
    set.layoutMode = 'VERTICAL'; set.itemSpacing = 24; set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO'; set.fills = [];
    set.description = 'En-tête desktop par rôle. Pour changer l\'onglet actif : afficher/masquer le calque « Indicateur » du lien voulu.';
  }
  // Pied de page
  {
    const f = figma.createComponent(); f.name = 'Pied de page';
    f.layoutMode = 'VERTICAL'; f.resize(1440, 10); f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO'; f.itemSpacing = 24;
    f.fills = fill('couleur/vert/800'); f.paddingTop = 40; f.paddingBottom = 24; f.paddingLeft = f.paddingRight = 120;
    sHead.appendChild(f);
    const row = AL('HORIZONTAL', { name: 'Colonnes', gap: 48 }); append(f, row);
    const c1 = AL('VERTICAL', { name: 'Institut', gap: 6 }); append(row, c1);
    c1.appendChild(await txt('HIT-T Institute', 'Marque', 'couleur/blanc'));
    await para(c1, 'Plateforme d\'orientation des apprenants — version MVP.', 'Petit', 'couleur/vert/100');
    for (const [title, lines] of [['Domaines', ['SISG — Secrétariat et Gestion', 'IA, Data science et Blockchain', 'TRIT — Informatique et Télécoms']], ['Contact', ['Coordonnées du cabinet', '(à compléter)']]]) {
      const c = AL('VERTICAL', { name: title, gap: 6 }); row.appendChild(c); setW(c, 260);
      c.appendChild(await txt(title, 'Surtitre', 'couleur/vert/100'));
      for (const l of lines) c.appendChild(await txt(l, 'Petit', 'couleur/blanc'));
    }
    rule(f, 'couleur/vert/700');
    f.appendChild(await txt('© 2026 HIT-T Institute', 'Petit', 'couleur/vert/100'));
  }

  // Lignes et cartes
  const sList = await section(board, 'Listes, recommandations et chiffres', 'Le catalogue est présenté en liste, comme un programme de formation, plutôt qu\'en grille de cartes.');
  const etq = comp('Étiquette domaine'), mot = comp('Mot-clé');
  // Ligne formation (desktop)
  {
    const r = figma.createComponent(); r.name = 'Ligne formation';
    r.layoutMode = 'HORIZONTAL'; r.resize(1200, 10); r.primaryAxisSizingMode = 'FIXED'; r.counterAxisSizingMode = 'AUTO'; r.itemSpacing = 32; r.counterAxisAlignItems = 'MIN';
    pad(r, 20, 24); r.fills = fill('couleur/papier'); stroke(r, 'couleur/filet', 1, 'b');
    sList.appendChild(r);
    const c1 = AL('VERTICAL', { name: 'Domaine', gap: 6 }); r.appendChild(c1); setW(c1, 150);
    c1.appendChild(etq.defaultVariant.createInstance());
    const ty = await txt('À la carte', 'Petit', 'couleur/encre-2'); ty.name = 'Type'; c1.appendChild(ty);
    const c2 = AL('VERTICAL', { name: 'Formation', gap: 4 }); append(r, c2);
    const ti = await para(c2, 'Office Excel niveau intermédiaire 2010-2024', 'Titre 3'); ti.name = 'Intitulé';
    const de = await para(c2, 'Maîtriser les fonctions courantes, tris, filtres, graphiques et mises en forme conditionnelles pour analyser des données.', 'Petit', 'couleur/encre-2'); de.name = 'Description';
    const c3 = AL('VERTICAL', { name: 'Durée', gap: 2 }); r.appendChild(c3); setW(c3, 110);
    const du = await txt('1 semaine', 'Corps fort'); du.name = 'Durée'; c3.appendChild(du);
    const c4 = AL('VERTICAL', { name: 'Tarif', gap: 2 }); c4.counterAxisAlignItems = 'MAX'; r.appendChild(c4); setW(c4, 170);
    const pr = await txt('40 500 FCFA', 'Petit', 'couleur/discret'); pr.name = 'Prix'; pr.textDecoration = 'STRIKETHROUGH'; c4.appendChild(pr);
    const pp = await txt('35 500 FCFA', 'Corps fort', 'couleur/orange/700'); pp.name = 'Prix promo'; c4.appendChild(pp);
    const c5 = AL('VERTICAL', { name: 'Ouvrir' }); c5.paddingTop = 2; r.appendChild(c5); c5.appendChild(await icon('chevron-droite', 20, 'couleur/vert/700'));
    const keys = {};
    for (const [n, def] of [['Intitulé', ti.characters], ['Description', de.characters], ['Type', 'À la carte'], ['Durée', '1 semaine'], ['Prix', '40 500 FCFA'], ['Prix promo', '35 500 FCFA']]) keys[n] = r.addComponentProperty(n, 'TEXT', def);
    const kB = r.addComponentProperty('Prix barré', 'BOOLEAN', true);
    ti.componentPropertyReferences = { characters: keys['Intitulé'] }; de.componentPropertyReferences = { characters: keys['Description'] }; ty.componentPropertyReferences = { characters: keys['Type'] };
    du.componentPropertyReferences = { characters: keys['Durée'] }; pr.componentPropertyReferences = { characters: keys['Prix'], visible: kB }; pp.componentPropertyReferences = { characters: keys['Prix promo'] };
    r.description = 'Ligne du catalogue (RF-05). Sans promotion : masquer « Prix barré », mettre le prix dans « Prix promo » et passer sa couleur en encre.';
  }
  // Ligne formation mobile
  {
    const r = figma.createComponent(); r.name = 'Ligne formation mobile';
    r.layoutMode = 'VERTICAL'; r.resize(358, 10); r.counterAxisSizingMode = 'FIXED'; r.primaryAxisSizingMode = 'AUTO'; r.itemSpacing = 6;
    pad(r, 16, 16); r.fills = fill('couleur/papier'); stroke(r, 'couleur/filet', 1, 'b');
    sList.appendChild(r);
    const top = AL('HORIZONTAL', { name: 'Haut', gap: 8 }); top.counterAxisAlignItems = 'CENTER'; append(r, top);
    top.appendChild(etq.defaultVariant.createInstance()); spacer(top);
    const ty = await txt('À la carte', 'Petit', 'couleur/encre-2'); ty.name = 'Type'; top.appendChild(ty);
    const ti = await para(r, 'Office Excel niveau intermédiaire 2010-2024', 'Titre 3'); ti.name = 'Intitulé';
    const de = await para(r, 'Maîtriser les fonctions courantes, tris, filtres et graphiques.', 'Petit', 'couleur/encre-2'); de.name = 'Description';
    const bot = AL('HORIZONTAL', { name: 'Bas', gap: 8 }); bot.counterAxisAlignItems = 'BASELINE'; append(r, bot);
    const du = await txt('1 semaine', 'Petit fort'); du.name = 'Durée'; bot.appendChild(du); spacer(bot);
    const pr = await txt('40 500 FCFA', 'Petit', 'couleur/discret'); pr.name = 'Prix'; pr.textDecoration = 'STRIKETHROUGH'; bot.appendChild(pr);
    const pp = await txt('35 500 FCFA', 'Corps fort', 'couleur/orange/700'); pp.name = 'Prix promo'; bot.appendChild(pp);
    const keys = {};
    for (const [n, def] of [['Intitulé', ti.characters], ['Description', de.characters], ['Type', 'À la carte'], ['Durée', '1 semaine'], ['Prix', '40 500 FCFA'], ['Prix promo', '35 500 FCFA']]) keys[n] = r.addComponentProperty(n, 'TEXT', def);
    const kB = r.addComponentProperty('Prix barré', 'BOOLEAN', true);
    ti.componentPropertyReferences = { characters: keys['Intitulé'] }; de.componentPropertyReferences = { characters: keys['Description'] }; ty.componentPropertyReferences = { characters: keys['Type'] };
    du.componentPropertyReferences = { characters: keys['Durée'] }; pr.componentPropertyReferences = { characters: keys['Prix'], visible: kB }; pp.componentPropertyReferences = { characters: keys['Prix promo'] };
  }
  // Recommandations (desktop + mobile)
  const fbBtn = async (label, ic, state) => {
    const b = AL('HORIZONTAL', { name: label, gap: 8 }); b.counterAxisAlignItems = 'CENTER'; b.primaryAxisAlignItems = 'CENTER'; pad(b, 9, 12); rad(b);
    const chosen = state !== 'neutre';
    b.fills = chosen ? fill(state === 'oui' ? 'couleur/vert/700' : 'couleur/encre-2') : fill('couleur/papier');
    if (!chosen) stroke(b, 'couleur/filet-fort');
    if (chosen) b.appendChild(await icon('check', 16, 'couleur/blanc'));
    b.appendChild(await txt(label, 'Petit fort', chosen ? 'couleur/blanc' : 'couleur/encre'));
    return b;
  };
  const levelRow = async (parent) => {
    const row = AL('HORIZONTAL', { name: 'Correspondance', gap: 10 }); row.counterAxisAlignItems = 'CENTER'; append(parent, row);
    const sq = AL('HORIZONTAL', { name: 'Niveau', gap: 3 }); row.appendChild(sq);
    for (let k = 1; k <= 3; k++) { const r = figma.createRectangle(); r.name = 'Niveau ' + k; r.resize(10, 10); r.fills = fill('couleur/vert/600'); sq.appendChild(r); }
    const t = await txt('Très proche de votre profil', 'Corps fort', 'couleur/vert/700'); t.name = 'Correspondance'; row.appendChild(t); t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL';
    return row;
  };
  for (const mobile of [false, true]) {
    const vs = [];
    for (const retour of ['Aucun', 'Pertinent', 'Non pertinent']) {
      const r = figma.createComponent(); r.name = 'Retour=' + retour;
      r.layoutMode = mobile ? 'VERTICAL' : 'HORIZONTAL';
      r.resize(mobile ? 358 : 880, 10);
      if (mobile) { r.counterAxisSizingMode = 'FIXED'; r.primaryAxisSizingMode = 'AUTO'; } else { r.primaryAxisSizingMode = 'FIXED'; r.counterAxisSizingMode = 'AUTO'; }
      r.itemSpacing = mobile ? 10 : 24; r.counterAxisAlignItems = 'MIN'; pad(r, mobile ? 16 : 24); r.fills = fill('couleur/papier'); stroke(r, 'couleur/filet'); rad(r);
      sList.appendChild(r);
      const rg = await txt('1', mobile ? 'Titre 1' : 'Rang', 'couleur/vert/700'); rg.name = 'Rang';
      const body = AL('VERTICAL', { name: 'Contenu', gap: 8 });
      const meta = AL('HORIZONTAL', { name: 'Domaine', gap: 10 }); meta.counterAxisAlignItems = 'CENTER';
      if (mobile) {
        const head = AL('HORIZONTAL', { name: 'En-tête', gap: 12 }); head.counterAxisAlignItems = 'CENTER'; append(r, head);
        head.appendChild(rg); head.appendChild(meta);
        append(r, body);
      } else {
        const rc = AL('VERTICAL', { name: 'Rang' }); r.appendChild(rc); setW(rc, 44); rc.appendChild(rg);
        append(r, body);
        body.appendChild(meta);
      }
      meta.appendChild(etq.defaultVariant.createInstance());
      const ty = await txt('À la carte', 'Petit', 'couleur/encre-2'); ty.name = 'Type'; meta.appendChild(ty);
      const ti = await para(body, 'Développement de site web avec PHP, HTML, CSS', mobile ? 'Titre 3' : 'Titre 2'); ti.name = 'Intitulé';
      const de = await para(body, 'Créer des sites web dynamiques avec HTML, CSS et PHP.', mobile ? 'Petit' : 'Corps', 'couleur/encre-2'); de.name = 'Description';
      const why = AL('VERTICAL', { name: 'Mots en commun', gap: 6 }); append(body, why);
      why.appendChild(await txt('Mots en commun avec votre profil', 'Petit', 'couleur/discret'));
      const tags = AL('HORIZONTAL', { name: 'Mots-clés', gap: 6 }); tags.layoutWrap = 'WRAP'; tags.counterAxisSpacing = 8; tags.itemSpacing = 14; append(why, tags);
      for (const w of ['développement web', 'site web', 'programmation']) tags.appendChild(inst(mot, 'Commun=Oui', { 'Mot': w }));
      const info = await para(body, '3 semaines · 120 500 FCFA (prix promotionnel)', 'Petit', 'couleur/encre-2'); info.name = 'Infos';
      const side = AL('VERTICAL', { name: 'Avis', gap: 12 });
      if (mobile) { rule(r); append(r, side); } else { r.appendChild(side); setW(side, 248); side.paddingLeft = 24; stroke(side, 'couleur/filet', 1, 'l'); side.layoutSizingVertical = 'FILL'; }
      side.appendChild(await txt('Correspondance', 'Surtitre', 'couleur/discret'));
      await levelRow(side);
      const q = await para(side, retour === 'Aucun' ? 'Cette formation vous intéresse ?' : 'Votre avis (modifiable) :', 'Petit', 'couleur/discret'); q.name = 'Question';
      const btns = AL(mobile ? 'HORIZONTAL' : 'VERTICAL', { name: 'Boutons', gap: 8 }); append(side, btns);
      const b1 = await fbBtn('Elle me correspond', 'pouce-haut', retour === 'Pertinent' ? 'oui' : 'neutre');
      const b2 = await fbBtn('Pas pour moi', 'pouce-bas', retour === 'Non pertinent' ? 'non' : 'neutre');
      append(btns, b1); append(btns, b2);
      if (retour === 'Pertinent') b2.visible = false;
      if (retour === 'Non pertinent') b1.visible = false;
      vs.push(r);
    }
    const set = figma.combineAsVariants(vs, sList); set.name = mobile ? 'Recommandation mobile' : 'Recommandation';
    set.layoutMode = mobile ? 'HORIZONTAL' : 'VERTICAL'; set.itemSpacing = 16; set.counterAxisAlignItems = 'MIN'; set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO'; set.fills = [];
    for (const [k, val] of Object.entries({ 'Rang': '1', 'Intitulé': 'Développement de site web avec PHP, HTML, CSS', 'Description': 'Créer des sites web dynamiques avec HTML, CSS et PHP.', 'Type': 'À la carte', 'Infos': '3 semaines · 120 500 FCFA (prix promotionnel)', 'Correspondance': 'Très proche de votre profil' })) {
      const key = set.addComponentProperty(k, 'TEXT', val);
      for (const v of set.children) { const n = v.findOne((x) => x.type === 'TEXT' && x.name === k); if (n) n.componentPropertyReferences = { characters: key }; }
    }
    set.description = 'Recommandation (RF-08 rang, RF-09 mots en commun, RF-10 avis). Correspondance : ≥ 0,40 « Très proche » (3 carrés), ≥ 0,30 « Proche » (2), sinon « Peut vous intéresser » (1). Le score exact reste en base.';
  }
  // Chiffre clé
  {
    const k = figma.createComponent(); k.name = 'Chiffre clé';
    k.layoutMode = 'VERTICAL'; k.resize(384, 10); k.counterAxisSizingMode = 'FIXED'; k.primaryAxisSizingMode = 'AUTO'; k.itemSpacing = 6;
    pad(k, 24); k.paddingTop = 27; k.fills = fill('couleur/papier'); stroke(k, 'couleur/filet'); k.clipsContent = true;
    const bar = figma.createRectangle(); bar.name = 'Repère'; bar.fills = fill('couleur/vert/600');
    sList.appendChild(k);
    k.appendChild(bar); bar.layoutPositioning = 'ABSOLUTE'; bar.x = 0; bar.y = 0; bar.resize(384, 3); bar.constraints = { horizontal: 'STRETCH', vertical: 'MIN' };
    const l = await txt('Apprenants inscrits', 'Surtitre', 'couleur/discret'); l.name = 'Libellé'; k.appendChild(l);
    const v = await txt('27', 'Chiffre'); v.name = 'Valeur'; k.appendChild(v);
    const p = await para(k, 'comptes apprenants créés', 'Petit', 'couleur/encre-2'); p.name = 'Précision';
    for (const [n, node] of [['Libellé', l], ['Valeur', v], ['Précision', p]]) node.componentPropertyReferences = { characters: k.addComponentProperty(n, 'TEXT', node.characters) };
    k.description = 'Chiffre clé du tableau de bord (RF-11).';
  }
  // Ligne tableau admin
  {
    const r = figma.createComponent(); r.name = 'Ligne tableau';
    r.layoutMode = 'HORIZONTAL'; r.resize(1200, 10); r.primaryAxisSizingMode = 'FIXED'; r.counterAxisSizingMode = 'AUTO'; r.itemSpacing = 16; r.counterAxisAlignItems = 'CENTER';
    pad(r, 14, 24); r.fills = fill('couleur/papier'); stroke(r, 'couleur/filet', 1, 'b');
    sList.appendChild(r);
    const cell = (w) => { const c = AL('HORIZONTAL', { name: 'Cellule', gap: 16 }); c.counterAxisAlignItems = 'CENTER'; r.appendChild(c); if (w) setW(c, w); else c.layoutSizingHorizontal = 'FILL'; return c; };
    const cT = cell(); const tI = await txt('Office Excel niveau intermédiaire 2010-2024', 'Corps fort'); tI.name = 'Intitulé'; cT.appendChild(tI); tI.textAutoResize = 'HEIGHT'; tI.layoutSizingHorizontal = 'FILL';
    cell(140).appendChild(etq.defaultVariant.createInstance());
    const vals = {};
    for (const [n, w, def] of [['Type', 140, 'À la carte'], ['Durée', 100, '1 semaine'], ['Coût', 110, '40 500'], ['Prix promo', 110, '35 500']]) { const t = await txt(def, 'Corps', 'couleur/encre-2'); t.name = n; cell(w).appendChild(t); vals[n] = t; }
    const cA = cell(150);
    const m = await txt('Modifier', 'Libellé', 'couleur/vert/700'); m.textDecoration = 'UNDERLINE'; cA.appendChild(m);
    const s = await txt('Supprimer', 'Libellé', 'couleur/danger'); s.textDecoration = 'UNDERLINE'; cA.appendChild(s);
    tI.componentPropertyReferences = { characters: r.addComponentProperty('Intitulé', 'TEXT', tI.characters) };
    for (const [n, t] of Object.entries(vals)) t.componentPropertyReferences = { characters: r.addComponentProperty(n, 'TEXT', t.characters) };
    r.description = 'Ligne du tableau de gestion du catalogue (RF-04). Montants en FCFA, « — » si pas de prix promo.';
  }
  return true;
}

// ---------------------------------------------------------------- exécution

try {
  await initDesign(true);
  const r = await fondations();
  out(r ? '✅ Fondations v2 créées sur la page « v2 · Fondations »' : 'ℹ️ Fondations v2 déjà présentes : rien à faire');
} catch (e) { out('❌ ' + e.message); }
