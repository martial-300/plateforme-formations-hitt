// HIT-T — étape 2 · Écrans d'administration
// À coller dans le plugin Scripter, dans le fichier « Plateforme formations HIT-T — Maquettes MVP », puis Run.
// Crée 07 · Administration (chiffres clés + catalogue) et 08 · Modifier une formation, sur la page « Écrans desktop ».
// Peut être relancé sans risque : ce qui existe déjà n'est pas recréé.

const out = typeof print === 'function' ? print : console.log;
const load = async (p) => { if (p.loadAsync) await p.loadAsync(); };
const goTo = async (p) => { if (figma.setCurrentPageAsync) await figma.setCurrentPageAsync(p); else figma.currentPage = p; };

let V, TS, FP, DESK, MOB;

// ---------------------------------------------------------------- utilitaires

const page = (prefix) => {
  const p = figma.root.children.find((x) => x.name.startsWith(prefix));
  if (!p) throw new Error("Page introuvable : « " + prefix + "… »");
  return p;
};

async function init() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const col = cols.find((c) => c.name === "HIT-T Tokens");
  if (!col) throw new Error("Collection « HIT-T Tokens » introuvable : ouvrez le fichier des maquettes HIT-T.");
  V = {};
  for (const id of col.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    V[v.name] = v;
  }
  TS = {};
  for (const s of await figma.getLocalTextStylesAsync()) TS[s.name] = s;
  for (const w of ["Regular", "Medium", "Semi Bold", "Bold"]) await figma.loadFontAsync({ family: "Inter", style: w });
  FP = page("Fondations");
  DESK = page("Écrans desktop");
  MOB = page("Écrans mobile");
  await load(FP);
  return col;
}

const fill = (n) => {
  if (!V[n]) throw new Error("Variable introuvable : " + n);
  return [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", V[n])];
};

const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });

async function txt(s, style, color = "color/text/default", weight) {
  const t = figma.createText();
  await t.setTextStyleIdAsync(TS[style].id);
  t.characters = s;
  t.fills = fill(color);
  if (weight) t.fontName = { family: "Inter", style: weight };
  return t;
}

const rad = (n, r) => {
  for (const k of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) n.setBoundVariable(k, V[r]);
};

// Frame auto-layout qui s'ajuste à son contenu
function AL(dir, o = {}) {
  const f = figma.createFrame();
  f.resize(1, 1);
  f.layoutMode = dir;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = [];
  f.clipsContent = false;
  if (o.name) f.name = o.name;
  if (o.itemSpacing != null) f.itemSpacing = o.itemSpacing;
  return f;
}

const padAll = (f, v, h = v) => { f.paddingTop = f.paddingBottom = v; f.paddingLeft = f.paddingRight = h; };

// Largeur fixe, hauteur ajustée au contenu
function setW(f, w) {
  f.resize(w, Math.max(f.height, 1));
  if (f.parent && f.parent.type !== "PAGE" && "layoutMode" in f.parent && f.parent.layoutMode !== "NONE") f.layoutSizingHorizontal = "FIXED";
  if ("layoutMode" in f && f.layoutMode !== "NONE") {
    if (f.layoutMode === "VERTICAL") { f.counterAxisSizingMode = "FIXED"; f.primaryAxisSizingMode = "AUTO"; }
    else { f.primaryAxisSizingMode = "FIXED"; f.counterAxisSizingMode = "AUTO"; }
  }
}

const isMain = (x) => (x.type === "COMPONENT_SET" || (x.type === "COMPONENT" && !(x.parent && x.parent.type === "COMPONENT_SET")));
function comp(name, optional = false) {
  const n = FP.findOne((x) => isMain(x) && x.name === name);
  if (!n && !optional) throw new Error("Composant introuvable : « " + name + " »");
  return n;
}

async function icon(n, size = 16, color) {
  const i = comp("Icône/" + n).createInstance();
  i.resize(size, size);
  if (color) for (const c of i.findAll((x) => "strokes" in x && x.strokes.length)) c.strokes = fill(color);
  return i;
}

const pk = (set, name) => Object.keys(set.componentPropertyDefinitions).find((k) => k.split("#")[0] === name);

function inst(set, variantName, props = {}) {
  const c = set.type === "COMPONENT_SET"
    ? (variantName ? set.children.find((x) => x.name === variantName) : set.defaultVariant)
    : set;
  if (!c) throw new Error("Variante introuvable : " + variantName + " dans " + set.name);
  const i = c.createInstance();
  const p = {};
  for (const [k, v] of Object.entries(props)) { const key = pk(set, k); if (key) p[key] = v; }
  if (Object.keys(p).length) i.setProperties(p);
  return i;
}

async function setBadges(node, dom, typ, words, tagSet) {
  const domSet = comp("Badge domaine"), typSet = comp("Badge type");
  const tags = [];
  for (const n of node.findAll((x) => x.type === "INSTANCE")) {
    const mc = await n.getMainComponentAsync();
    if (!mc || !mc.parent) continue;
    if (dom && mc.parent.id === domSet.id) n.setProperties({ Domaine: dom });
    if (typ && mc.parent.id === typSet.id) n.setProperties({ Type: typ });
    if (tagSet && mc.parent.id === tagSet.id) tags.push(n);
  }
  if (words) tags.forEach((tg, k) => { if (k < words.length) tg.setProperties({ [pk(tagSet, "Mot")]: words[k] }); else tg.visible = false; });
}

const strongVal = (i) => { const t = i.findOne((n) => n.type === "TEXT" && n.name === "Valeur"); if (t) t.fills = fill("color/text/strong"); };

function card(name, p = 24) {
  const c = AL("VERTICAL", { name, itemSpacing: 16 });
  padAll(c, p);
  rad(c, "radius/lg");
  c.fills = fill("color/surface/card");
  c.strokes = fill("color/border/default");
  c.strokeWeight = 1;
  return c;
}

function spacer(parent) { const s = AL("HORIZONTAL", { name: "Espace" }); parent.appendChild(s); s.layoutSizingHorizontal = "FILL"; return s; }

function append(parent, child, h = "FILL") { parent.appendChild(child); if (h) child.layoutSizingHorizontal = h; return child; }

async function para(parent, s, style, color, weight) {
  const t = await txt(s, style, color, weight);
  parent.appendChild(t);
  t.textAutoResize = "HEIGHT";
  t.layoutSizingHorizontal = "FILL";
  return t;
}

function logoNode(h) {
  const f = figma.createNodeFromSvg(SVG_LOGO);
  f.name = "Logo HIT-T";
  f.fills = [];
  f.rescale(h / f.height);
  return f;
}

function rightOf(pageNode, gap = 100) {
  let x = 0;
  for (const c of pageNode.children) x = Math.max(x, c.x + c.width);
  return pageNode.children.length ? x + gap : 0;
}

// Score affiché par une jauge auto-layout : la marge droite « vide » la barre.
function setGauge(instance, score) {
  const track = instance.findOne((n) => n.name === "Jauge");
  if (track && track.layoutMode !== "NONE") track.paddingRight = Math.round(track.width * (1 - score / 0.5));
}

// ---------------------------------------------------------------- 2. administration

const COLW = { dom: 120, typ: 180, dur: 110, cout: 130, promo: 130, act: 88 };

async function ligneCatalogue() {
  const existing = comp("Ligne catalogue", true);
  if (existing) return existing;
  const domSet = comp("Badge domaine"), typSet = comp("Badge type");
  const board = FP.findOne((n) => n.type === "FRAME" && n.name === "Composants" && n.parent.type === "PAGE");
  const sec = AL("VERTICAL", { name: "Tableau", itemSpacing: 16 });
  sec.appendChild(await txt("Tableau (administration)", "Titre 2", "color/text/strong"));
  if (board) board.appendChild(sec); else FP.appendChild(sec);

  const row = figma.createComponent();
  row.name = "Ligne catalogue";
  row.layoutMode = "HORIZONTAL";
  row.resize(1150, 10);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.counterAxisAlignItems = "CENTER";
  row.itemSpacing = 16;
  padAll(row, 14, 20);
  row.fills = fill("color/surface/card");
  row.strokes = fill("color/border/default");
  row.strokeWeight = 0;
  row.strokeBottomWeight = 1;
  sec.appendChild(row);

  const cell = (w) => {
    const c = AL("HORIZONTAL", { name: "Cellule", itemSpacing: 4 });
    c.counterAxisAlignItems = "CENTER";
    row.appendChild(c);
    if (w) setW(c, w); else c.layoutSizingHorizontal = "FILL";
    return c;
  };
  const tI = await txt("Office Excel niveau intermédiaire 2010-2024", "Corps fort", "color/text/strong"); tI.name = "Intitulé";
  const cT = cell(); cT.appendChild(tI); tI.textAutoResize = "HEIGHT"; tI.layoutSizingHorizontal = "FILL";
  cell(COLW.dom).appendChild(domSet.defaultVariant.createInstance());
  cell(COLW.typ).appendChild(typSet.defaultVariant.createInstance());
  const tD = await txt("1 semaine", "Corps"); tD.name = "Durée"; cell(COLW.dur).appendChild(tD);
  const tC = await txt("40 500", "Corps"); tC.name = "Coût"; cell(COLW.cout).appendChild(tC);
  const tP = await txt("35 500", "Corps"); tP.name = "Prix promo"; cell(COLW.promo).appendChild(tP);
  const cA = cell(COLW.act);
  for (const [ic, c, n] of [["crayon", "color/text/default", "Modifier"], ["corbeille", "color/danger/600", "Supprimer"]]) {
    const b = AL("HORIZONTAL", { name: n });
    padAll(b, 8);
    rad(b, "radius/sm");
    b.appendChild(await icon(ic, 18, c));
    cA.appendChild(b);
  }
  for (const [n, node] of [["Intitulé", tI], ["Durée", tD], ["Coût", tC], ["Prix promo", tP]]) {
    const k = row.addComponentProperty(n, "TEXT", node.characters);
    node.componentPropertyReferences = { characters: k };
  }
  row.description = "Ligne du tableau de gestion du catalogue (RF-04). Coûts en FCFA ; « — » si pas de prix promo.";
  return row;
}

async function admin() {
  await load(DESK);
  if (DESK.findOne((n) => n.type === "FRAME" && n.name === "07 · Administration")) return "admin (déjà présent)";
  const row = await ligneCatalogue();
  const S = { btn: comp("Bouton"), field: comp("Champ"), dom: comp("Badge domaine"), typ: comp("Badge type"), chip: comp("Filtre"), nav: comp("Barre de navigation"), kpi: comp("Carte chiffre clé") };
  await goTo(DESK);

  const sc = figma.createFrame();
  sc.name = "07 · Administration";
  sc.resize(1440, 900);
  sc.x = rightOf(DESK); sc.y = 0;
  sc.layoutMode = "VERTICAL";
  sc.counterAxisSizingMode = "FIXED";
  sc.primaryAxisSizingMode = "AUTO";
  sc.fills = fill("color/surface/page");
  sc.clipsContent = true;

  append(sc, inst(S.nav, "Rôle=Administrateur"));
  const m = AL("VERTICAL", { name: "Corps" }); m.counterAxisAlignItems = "CENTER"; m.paddingTop = 40; m.paddingBottom = 80; append(sc, m);
  const w = AL("VERTICAL", { name: "Contenu", itemSpacing: 32 }); m.appendChild(w); setW(w, 1200);
  const h = AL("VERTICAL", { name: "En-tête", itemSpacing: 6 }); w.appendChild(h);
  h.appendChild(await txt("Tableau de bord", "Display", "color/text/strong"));
  h.appendChild(await txt("Suivi de la plateforme et gestion du catalogue.", "Titre 3", "color/text/muted", "Regular"));

  // Chiffres clés (RF-11)
  const kr = AL("HORIZONTAL", { name: "Chiffres clés", itemSpacing: 24 }); append(w, kr);
  const k1 = inst(S.kpi, null, { "Libellé": "Apprenants inscrits", "Valeur": "27", "Précision": "comptes apprenants créés" });
  append(kr, k1); k1.layoutSizingVertical = "FILL";
  const k2 = inst(S.kpi, null, { "Libellé": "Retours « pertinent »", "Valeur": "74 %", "Précision": "68 sur 92 retours donnés · objectif 70 %" });
  append(kr, k2); k2.layoutSizingVertical = "FILL";
  const k2ic = k2.findOne((n) => n.name === "Pastille");
  if (k2ic) { k2ic.fills = fill("color/success/100"); for (const s of k2ic.findAll((n) => "strokes" in n && n.strokes.length)) s.strokes = fill("color/success/600"); const ic = k2ic.findOne((n) => n.type === "INSTANCE"); if (ic) { const pu = comp("Icône/pouce-haut"); ic.swapComponent(pu); for (const s of ic.findAll((n) => "strokes" in n && n.strokes.length)) s.strokes = fill("color/success/600"); } }

  const top = card("5 formations les plus recommandées"); top.itemSpacing = 14; kr.appendChild(top); setW(top, 520);
  const th = AL("HORIZONTAL", { name: "Titre", itemSpacing: 10 }); th.counterAxisAlignItems = "CENTER";
  th.appendChild(await icon("etincelles", 18, "color/primary/600"));
  th.appendChild(await txt("5 formations les plus recommandées", "Corps fort", "color/text/strong"));
  top.appendChild(th);
  const data = [["Office Excel niveau avancé 2010-2024", 14], ["Développement de site web avec PHP, HTML, CSS", 12], ["Marketing digital", 9], ["Secrétariat-Bureautique (SB)", 8], ["Langage Python et l'IA (Analyse des données)", 7]];
  for (const [n, v] of data) {
    const r = AL("VERTICAL", { name: n, itemSpacing: 4 }); append(top, r);
    const l = AL("HORIZONTAL", { name: "Libellé" }); l.primaryAxisAlignItems = "SPACE_BETWEEN"; append(r, l);
    l.appendChild(await txt(n, "Petit", "color/text/default"));
    l.appendChild(await txt(String(v), "Petit", "color/text/strong", "Semi Bold"));
    const tr = AL("HORIZONTAL", { name: "Barre" }); append(r, tr);
    tr.resize(tr.width, 6); tr.layoutSizingHorizontal = "FILL"; tr.cornerRadius = 3; tr.fills = fill("color/surface/subtle"); tr.clipsContent = true;
    const b = figma.createRectangle(); b.name = "Niveau"; b.cornerRadius = 3; b.fills = fill("color/primary/600"); tr.appendChild(b);
    b.layoutSizingHorizontal = "FILL"; b.layoutSizingVertical = "FILL";
    tr.paddingRight = Math.round(472 * (1 - v / 14));
  }

  // Gestion du catalogue (RF-04)
  const tc = card("Gestion du catalogue", 0); tc.itemSpacing = 0; tc.clipsContent = true; append(w, tc);
  const tb = AL("HORIZONTAL", { name: "Barre d'outils", itemSpacing: 12 }); tb.counterAxisAlignItems = "CENTER"; padAll(tb, 20, 24); append(tc, tb);
  const tt = AL("VERTICAL", { name: "Titre", itemSpacing: 2 });
  tt.appendChild(await txt("Catalogue", "Titre 2", "color/text/strong"));
  tt.appendChild(await txt("86 formations", "Petit", "color/text/muted"));
  tb.appendChild(tt);
  spacer(tb);
  const search = AL("HORIZONTAL", { name: "Recherche", itemSpacing: 8 }); search.counterAxisAlignItems = "CENTER"; padAll(search, 10, 12);
  rad(search, "radius/md"); search.strokes = fill("color/border/strong"); search.strokeWeight = 1; search.fills = fill("color/surface/card");
  search.appendChild(await icon("recherche", 16, "color/text/muted"));
  search.appendChild(await txt("Rechercher une formation…", "Corps", "color/text/muted"));
  tb.appendChild(search); setW(search, 260);
  for (const [o, a] of [["Tous", true], ["SISG", false], ["IA · Data", false], ["TRIT", false]]) tb.appendChild(inst(S.chip, a ? "État=Actif" : "État=Inactif", { "Libellé": o }));
  tb.appendChild(inst(S.btn, "Type=Primaire", { "Libellé": "Ajouter une formation" }));

  const hd = AL("HORIZONTAL", { name: "En-tête tableau", itemSpacing: 16 }); padAll(hd, 10, 20); hd.fills = fill("color/surface/subtle"); append(tc, hd);
  for (const [l, wd] of [["Intitulé", null], ["Domaine", COLW.dom], ["Type", COLW.typ], ["Durée", COLW.dur], ["Coût (FCFA)", COLW.cout], ["Prix promo", COLW.promo], ["Actions", COLW.act]]) {
    const t = await txt(l.toUpperCase(), "Petit", "color/text/muted", "Semi Bold");
    t.letterSpacing = { unit: "PERCENT", value: 4 };
    const c = AL("HORIZONTAL", { name: l }); c.appendChild(t); hd.appendChild(c);
    if (wd) setW(c, wd); else c.layoutSizingHorizontal = "FILL";
  }
  const rows = [
    ["Office Excel niveau intermédiaire 2010-2024", "SISG", "À la carte", "1 semaine", "40 500", "35 500"],
    ["Secrétariat-Bureautique (SB)", "SISG", "Modulaire", "6 mois", "120 000", "—"],
    ["Langage Python et l'IA (Analyse des données)", "IA-Data", "À la carte", "2 jours", "90 500", "80 000"],
    ["Analyste développeur des systèmes IA", "IA-Data", "Modulaire", "6 mois", "250 000", "—"],
    ["Développement de site web avec PHP, HTML, CSS", "TRIT", "À la carte", "3 semaines", "125 000", "120 500"],
    ["Réseau et Cybersécurité", "TRIT", "Modulaire", "9 mois", "380 000", "—"],
  ];
  for (const [t, d, ty, du, co, pr] of rows) {
    const r = inst(row, null, { "Intitulé": t, "Durée": du, "Coût": co, "Prix promo": pr });
    append(tc, r);
    await setBadges(r, d, ty);
  }
  const pg = AL("HORIZONTAL", { name: "Pied", itemSpacing: 8 }); pg.counterAxisAlignItems = "CENTER"; padAll(pg, 16, 24); append(tc, pg);
  pg.appendChild(await txt("Affichage de 6 sur 86", "Petit", "color/text/muted"));
  spacer(pg);
  pg.appendChild(inst(S.btn, "Type=Secondaire", { "Libellé": "Précédent" }));
  pg.appendChild(inst(S.btn, "Type=Secondaire", { "Libellé": "Suivant" }));

  // 08 · Modale de modification
  const sm = sc.clone();
  sm.name = "08 · Administration · Modifier une formation";
  sm.x = sc.x + 1540;
  const ov = figma.createFrame();
  ov.name = "Fond modale";
  sm.appendChild(ov);
  ov.layoutPositioning = "ABSOLUTE";
  ov.x = 0; ov.y = 0;
  ov.resize(1440, sm.height);
  ov.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.09, b: 0.16 }, opacity: 0.5 }];
  ov.layoutMode = "VERTICAL";
  ov.primaryAxisSizingMode = "FIXED"; ov.counterAxisSizingMode = "FIXED";
  ov.counterAxisAlignItems = "CENTER";
  ov.paddingTop = 64;
  const md = card("Modale formation", 32); md.itemSpacing = 20; ov.appendChild(md); setW(md, 680);
  md.effects = [{ type: "DROP_SHADOW", color: { r: 0.06, g: 0.09, b: 0.16, a: 0.2 }, offset: { x: 0, y: 16 }, radius: 40, spread: 0, visible: true, blendMode: "NORMAL" }];
  const mh = AL("VERTICAL", { name: "En-tête", itemSpacing: 4 }); append(md, mh);
  mh.appendChild(await txt("Modifier une formation", "Titre 1", "color/text/strong"));
  await para(mh, "Les modifications sont prises en compte dès la prochaine soumission d'un questionnaire.", "Corps", "color/text/muted");
  const fld = (parent, v, props) => { const f = inst(S.field, v, props); append(parent, f); strongVal(f); return f; };
  const line = () => { const r = AL("HORIZONTAL", { name: "Ligne", itemSpacing: 16 }); append(md, r); return r; };
  fld(md, "Type=Texte", { "Libellé": "Intitulé", "Valeur": "Office Excel niveau intermédiaire 2010-2024" });
  fld(md, "Type=Zone de texte", { "Libellé": "Description", "Valeur": "Maîtriser les fonctions courantes, tris, filtres, graphiques et mises en forme conditionnelles pour analyser des données." });
  let r = line(); fld(r, "Type=Liste", { "Libellé": "Domaine", "Valeur": "SISG — Secrétariat et Gestion" }); fld(r, "Type=Liste", { "Libellé": "Type", "Valeur": "À la carte" });
  r = line(); fld(r, "Type=Texte", { "Libellé": "Durée", "Valeur": "1" }); fld(r, "Type=Liste", { "Libellé": "Unité", "Valeur": "semaine" });
  r = line(); fld(r, "Type=Texte", { "Libellé": "Coût (FCFA)", "Valeur": "40 500" }); fld(r, "Type=Texte", { "Libellé": "Prix promo (FCFA)", "Valeur": "35 500", "Aide": "Laisser vide si aucun (formations modulaires).", "Afficher l'aide": true });
  fld(md, "Type=Zone de texte", { "Libellé": "Mots-clés", "Valeur": "excel, tableur, fonctions, graphiques, filtres, analyse de données, gestion, comptabilité", "Aide": "Séparés par des virgules. Ils servent directement au calcul des recommandations.", "Afficher l'aide": true });
  const ma = AL("HORIZONTAL", { name: "Actions", itemSpacing: 12 }); append(md, ma);
  ma.appendChild(inst(S.btn, "Type=Danger", { "Libellé": "Supprimer" }));
  spacer(ma);
  ma.appendChild(inst(S.btn, "Type=Secondaire", { "Libellé": "Annuler" }));
  ma.appendChild(inst(S.btn, "Type=Primaire", { "Libellé": "Enregistrer" }));

  figma.viewport.scrollAndZoomIntoView([sc, sm]);
  return "admin";
}

// ---------------------------------------------------------------- exécution

try {
  await init();
  const r = await admin();
  out(r === 'admin' ? '✅ Écrans 07 et 08 créés sur « Écrans desktop »' : 'ℹ️ Écran 07 déjà présent : rien à faire');
} catch (e) { out('❌ ' + e.message); }
