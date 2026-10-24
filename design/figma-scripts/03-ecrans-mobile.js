// HIT-T — étape 3 · Écrans mobile
// À coller dans le plugin Scripter, dans le fichier « Plateforme formations HIT-T — Maquettes MVP », puis Run.
// Crée M1 · Catalogue, M2 · Questionnaire et M3 · Mes recommandations (390 px), sur la page « Écrans mobile ».
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

// ---------------------------------------------------------------- 3. mobile

async function fbBtn(label, ic, state) {
  const b = AL("HORIZONTAL", { name: label, itemSpacing: 6 });
  b.counterAxisAlignItems = "CENTER"; b.primaryAxisAlignItems = "CENTER";
  padAll(b, 10, 12); rad(b, "radius/md"); b.strokeWeight = 1;
  const fg = state === "pertinent" ? "color/success/600" : state === "non" ? "color/danger/600" : "color/text/default";
  b.fills = state === "pertinent" ? fill("color/success/100") : state === "non" ? fill("color/danger/100") : fill("color/surface/card");
  b.strokes = state === "pertinent" ? fill("color/success/600") : state === "non" ? fill("color/danger/600") : fill("color/border/strong");
  b.appendChild(await icon(ic, 16, fg));
  b.appendChild(await txt(label, "Libellé", fg));
  return b;
}

async function recoMobile() {
  const existing = comp("Carte recommandation mobile", true);
  if (existing) return existing;
  const domSet = comp("Badge domaine"), typSet = comp("Badge type"), tagSet = comp("Mot-clé");
  const board = FP.findOne((n) => n.type === "FRAME" && n.name === "Composants" && n.parent.type === "PAGE");
  const sec = AL("VERTICAL", { name: "Mobile", itemSpacing: 16 });
  sec.appendChild(await txt("Mobile", "Titre 2", "color/text/strong"));
  if (board) board.appendChild(sec); else FP.appendChild(sec);
  const variants = [];
  for (const retour of ["Aucun", "Pertinent", "Non pertinent"]) {
    const r = figma.createComponent();
    r.name = "Retour=" + retour;
    r.layoutMode = "VERTICAL";
    r.resize(358, 10);
    r.counterAxisSizingMode = "FIXED"; r.primaryAxisSizingMode = "AUTO";
    r.itemSpacing = 12; padAll(r, 16);
    rad(r, "radius/lg"); r.fills = fill("color/surface/card"); r.strokes = fill("color/border/default"); r.strokeWeight = 1;
    sec.appendChild(r);
    const top = AL("HORIZONTAL", { name: "En-tête", itemSpacing: 8 }); top.counterAxisAlignItems = "CENTER"; append(r, top);
    const rank = AL("HORIZONTAL", { name: "Rang" }); rank.primaryAxisAlignItems = "CENTER"; rank.counterAxisAlignItems = "CENTER";
    rank.resize(32, 32); rank.primaryAxisSizingMode = "FIXED"; rank.counterAxisSizingMode = "FIXED"; rad(rank, "radius/full"); rank.fills = fill("color/primary/50");
    const rt = await txt("1", "Corps fort", "color/primary/700", "Bold"); rt.name = "Rang"; rank.appendChild(rt); top.appendChild(rank);
    top.appendChild(domSet.defaultVariant.createInstance());
    top.appendChild(typSet.defaultVariant.createInstance());
    const t = await para(r, "Développement de site web avec PHP, HTML, CSS", "Titre 3", "color/text/strong"); t.name = "Intitulé";
    const d = await para(r, "Créer des sites web dynamiques avec HTML, CSS et PHP.", "Corps", "color/text/muted"); d.name = "Description";
    const why = AL("VERTICAL", { name: "Pourquoi", itemSpacing: 6 }); append(r, why);
    const wl = AL("HORIZONTAL", { name: "Titre", itemSpacing: 6 }); wl.counterAxisAlignItems = "CENTER";
    wl.appendChild(await icon("etincelles", 14, "color/primary/600"));
    wl.appendChild(await txt("Correspond à votre profil :", "Petit", "color/primary/700", "Semi Bold"));
    why.appendChild(wl);
    const tags = AL("HORIZONTAL", { name: "Mots-clés", itemSpacing: 6 }); tags.layoutWrap = "WRAP"; tags.counterAxisSpacing = 6; append(why, tags);
    for (const w of ["développement web", "site web", "programmation"]) tags.appendChild(inst(tagSet, "Correspondance=Oui", { "Mot": w }));
    const meta = AL("HORIZONTAL", { name: "Infos", itemSpacing: 16 }); meta.counterAxisAlignItems = "CENTER"; append(r, meta);
    for (const [ic, val, nm] of [["horloge", "3 semaines", "Durée"], ["argent", "120 500 FCFA (promo)", "Prix"]]) {
      const m = AL("HORIZONTAL", { name: nm, itemSpacing: 6 }); m.counterAxisAlignItems = "CENTER";
      m.appendChild(await icon(ic, 16, "color/text/muted"));
      const tx = await txt(val, "Corps", "color/text/default"); tx.name = nm; m.appendChild(tx);
      meta.appendChild(m);
    }
    const sc = AL("VERTICAL", { name: "Score", itemSpacing: 6 }); append(r, sc);
    const sh = AL("HORIZONTAL", { name: "Ligne" }); sh.primaryAxisAlignItems = "SPACE_BETWEEN"; sh.counterAxisAlignItems = "CENTER"; append(sc, sh);
    sh.appendChild(await txt("Score de pertinence", "Petit", "color/text/muted"));
    const sv = await txt("0,42", "Corps fort", "color/text/strong", "Bold"); sv.name = "Score"; sh.appendChild(sv);
    const track = AL("HORIZONTAL", { name: "Jauge" }); append(sc, track);
    track.resize(track.width, 6); track.layoutSizingHorizontal = "FILL"; rad(track, "radius/full"); track.fills = fill("color/surface/subtle"); track.clipsContent = true; track.paddingRight = 80;
    const lvl = figma.createRectangle(); lvl.name = "Niveau"; lvl.cornerRadius = 3; lvl.fills = fill("color/primary/600"); track.appendChild(lvl);
    lvl.layoutSizingHorizontal = "FILL"; lvl.layoutSizingVertical = "FILL";
    const fb = AL("VERTICAL", { name: "Retour", itemSpacing: 8 }); append(r, fb);
    fb.appendChild(await txt(retour === "Aucun" ? "Cette formation vous convient ?" : "Merci pour votre retour", "Petit", "color/text/muted"));
    const row = AL("HORIZONTAL", { name: "Boutons", itemSpacing: 8 }); append(fb, row);
    const b1 = await fbBtn("Pertinente", "pouce-haut", retour === "Pertinent" ? "pertinent" : "neutre");
    const b2 = await fbBtn("Pas pour moi", "pouce-bas", retour === "Non pertinent" ? "non" : "neutre");
    append(row, b1); append(row, b2);
    if (retour === "Pertinent") b2.opacity = 0.5;
    if (retour === "Non pertinent") b1.opacity = 0.5;
    variants.push(r);
  }
  const set = figma.combineAsVariants(variants, sec);
  set.name = "Carte recommandation mobile";
  set.layoutMode = "HORIZONTAL"; set.itemSpacing = 16; set.primaryAxisSizingMode = "AUTO"; set.counterAxisSizingMode = "AUTO"; set.counterAxisAlignItems = "MIN"; set.fills = [];
  const props = { "Rang": "1", "Intitulé": "Développement de site web avec PHP, HTML, CSS", "Description": "Créer des sites web dynamiques avec HTML, CSS et PHP.", "Durée": "3 semaines", "Prix": "120 500 FCFA (promo)", "Score": "0,42" };
  for (const [k, val] of Object.entries(props)) {
    const key = set.addComponentProperty(k, "TEXT", val);
    for (const v of set.children) { const n = v.findOne((x) => x.type === "TEXT" && x.name === k); if (n) n.componentPropertyReferences = { characters: key }; }
  }
  set.description = "Recommandation sur mobile (RF-08 à RF-10). Jauge : marge droite de « Jauge » = largeur × (1 − score / 0,5).";
  return set;
}

async function mobileHeader(sc, logoComp) {
  const h = AL("HORIZONTAL", { name: "En-tête mobile" });
  h.primaryAxisAlignItems = "SPACE_BETWEEN"; h.counterAxisAlignItems = "CENTER"; padAll(h, 12, 16);
  h.fills = fill("color/surface/card"); h.strokes = fill("color/border/default"); h.strokeWeight = 0; h.strokeBottomWeight = 1;
  append(sc, h);
  h.appendChild(logoComp.createInstance());
  const m = AL("HORIZONTAL", { name: "Menu" }); padAll(m, 8); m.appendChild(await icon("menu", 24, "color/text/strong")); h.appendChild(m);
  return h;
}

function mobileScreen(name, x) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(390, 844);
  f.x = x; f.y = 0;
  f.layoutMode = "VERTICAL";
  f.counterAxisSizingMode = "FIXED"; f.primaryAxisSizingMode = "AUTO";
  f.fills = fill("color/surface/page");
  f.clipsContent = true;
  return f;
}

function mobileBody(sc, gap = 16) {
  const b = AL("VERTICAL", { name: "Corps", itemSpacing: gap }); padAll(b, 20, 16); b.paddingBottom = 32; append(sc, b);
  return b;
}

async function mobile() {
  await load(MOB);
  if (MOB.findOne((n) => n.type === "FRAME" && n.name.startsWith("M1 ·"))) return "mobile (déjà présent)";
  const reco = await recoMobile();
  const S = { btn: comp("Bouton"), field: comp("Champ"), chip: comp("Filtre"), fcard: comp("Carte formation"), tag: comp("Mot-clé"), logo: comp("Logo") };
  await goTo(MOB);
  const x0 = rightOf(MOB);

  // M1 · Catalogue
  const m1 = mobileScreen("M1 · Catalogue", x0);
  await mobileHeader(m1, S.logo);
  const b1 = mobileBody(m1);
  const hd = AL("VERTICAL", { name: "Titre", itemSpacing: 4 }); append(b1, hd);
  await para(hd, "Catalogue des formations", "Titre 1", "color/text/strong");
  await para(hd, "86 formations en SISG, IA & Data, TRIT.", "Corps", "color/text/muted");
  const cta = AL("VERTICAL", { name: "Appel recommandations", itemSpacing: 12 }); padAll(cta, 16); rad(cta, "radius/lg");
  cta.fills = fill("color/primary/50"); cta.strokes = fill("color/primary/100"); cta.strokeWeight = 1; append(b1, cta);
  const ctaT = AL("HORIZONTAL", { name: "Texte", itemSpacing: 10 }); ctaT.counterAxisAlignItems = "CENTER"; append(cta, ctaT);
  ctaT.appendChild(await icon("etincelles", 20, "color/primary/600"));
  await para(ctaT, "Vous hésitez ? Obtenez 5 formations adaptées à votre profil.", "Corps fort", "color/text/strong");
  append(cta, inst(S.btn, "Type=Primaire", { "Libellé": "Commencer" }));
  for (const [label, opts] of [["Domaine", ["Tous", "SISG", "IA · Data", "TRIT"]], ["Type", ["Tous", "À la carte", "Modulaire"]]]) {
    const g = AL("VERTICAL", { name: "Filtre " + label, itemSpacing: 8 }); append(b1, g);
    g.appendChild(await txt(label, "Libellé", "color/text/muted"));
    const r = AL("HORIZONTAL", { name: "Options", itemSpacing: 8 }); r.layoutWrap = "WRAP"; r.counterAxisSpacing = 8; append(g, r);
    opts.forEach((o, i) => r.appendChild(inst(S.chip, i === 0 ? "État=Actif" : "État=Inactif", { "Libellé": o })));
  }
  const cards = [
    ["Office Excel niveau intermédiaire 2010-2024", "Maîtriser les fonctions courantes, tris, filtres, graphiques et mises en forme conditionnelles pour analyser des données.", "SISG", "À la carte", "1 semaine", "40 500 FCFA", "35 500 FCFA", true],
    ["Langage Python et l'IA (Analyse des données)", "Programmer en Python pour analyser des données et préparer des projets d'IA (20 h).", "IA-Data", "À la carte", "2 jours", "90 500 FCFA", "80 000 FCFA", true],
    ["Réseau et Cybersécurité", "Administrer des réseaux d'entreprise et mettre en place leur sécurité.", "TRIT", "Modulaire", "9 mois", "380 000 FCFA", "380 000 FCFA", false],
  ];
  for (const [t, d, dom, typ, dur, p, pp, promo] of cards) {
    const c = inst(S.fcard, null, { "Intitulé": t, "Description": d, "Durée": dur, "Prix": p, "Prix promo": pp, "Prix barré (promo)": promo });
    append(b1, c);
    await setBadges(c, dom, typ);
  }
  append(b1, inst(S.btn, "Type=Secondaire", { "Libellé": "Afficher plus de formations" }));

  // M2 · Questionnaire
  const m2 = mobileScreen("M2 · Questionnaire", x0 + 490);
  await mobileHeader(m2, S.logo);
  const b2 = mobileBody(m2, 20);
  const h2 = AL("VERTICAL", { name: "Titre", itemSpacing: 4 }); append(b2, h2);
  await para(h2, "Parlez-nous de vous", "Titre 1", "color/text/strong");
  await para(h2, "6 questions, environ 2 minutes.", "Corps", "color/text/muted");
  const fld = (v, props) => { const f = inst(S.field, v, props); append(b2, f); strongVal(f); return f; };
  fld("Type=Liste", { "Libellé": "1. Niveau d'études", "Valeur": "BAC II" });
  fld("Type=Texte", { "Libellé": "2. Objectif professionnel", "Valeur": "Devenir développeur web" });
  fld("Type=Zone de texte", { "Libellé": "3. Vos compétences actuelles", "Valeur": "Word, Excel, bases d'Internet", "Aide": "Séparez par des virgules.", "Afficher l'aide": true });
  fld("Type=Zone de texte", { "Libellé": "4. Vos centres d'intérêt", "Valeur": "Programmation, développement web, sites internet" });
  const tq = AL("VERTICAL", { name: "5. Type souhaité", itemSpacing: 8 }); append(b2, tq);
  tq.appendChild(await txt("5. Type de formation souhaité", "Libellé", "color/text/strong"));
  for (const [title, desc, sel] of [["Formation courte, à la carte", "De 1 jour à 3 mois : un outil ou une compétence précise.", true], ["Parcours modulaire certifiant", "De 2 à 9 mois : un métier complet.", false]]) {
    const o = AL("HORIZONTAL", { name: "Option · " + title, itemSpacing: 12 }); padAll(o, 14); rad(o, "radius/md");
    o.fills = sel ? fill("color/primary/50") : fill("color/surface/card"); o.strokes = sel ? fill("color/primary/600") : fill("color/border/strong"); o.strokeWeight = sel ? 2 : 1;
    append(tq, o);
    const radio = figma.createEllipse(); radio.name = "Radio"; radio.resize(18, 18); radio.fills = fill("color/surface/card");
    radio.strokes = sel ? fill("color/primary/600") : fill("color/border/strong"); radio.strokeWeight = sel ? 5 : 1.5; radio.strokeAlign = "INSIDE";
    o.appendChild(radio);
    const t = AL("VERTICAL", { name: "Texte", itemSpacing: 2 }); append(o, t);
    await para(t, title, "Corps fort", "color/text/strong");
    await para(t, desc, "Petit", "color/text/muted");
  }
  fld("Type=Texte", { "Libellé": "6. Budget maximum", "Valeur": "150 000 FCFA", "Aide": "Seules les formations à ce prix ou moins vous seront proposées.", "Afficher l'aide": true });
  const bar = AL("VERTICAL", { name: "Barre d'action", itemSpacing: 8 }); padAll(bar, 16); bar.fills = fill("color/surface/card");
  bar.strokes = fill("color/border/default"); bar.strokeWeight = 0; bar.strokeTopWeight = 1; append(m2, bar);
  append(bar, inst(S.btn, "Type=Primaire", { "Libellé": "Voir mes recommandations" }));
  const note = await para(bar, "Toutes les questions sont obligatoires.", "Petit", "color/text/muted"); note.textAlignHorizontal = "CENTER";

  // M3 · Mes recommandations
  const m3 = mobileScreen("M3 · Mes recommandations", x0 + 980);
  await mobileHeader(m3, S.logo);
  const b3 = mobileBody(m3);
  const h3 = AL("VERTICAL", { name: "Titre", itemSpacing: 4 }); append(b3, h3);
  await para(h3, "Vos 5 formations recommandées", "Titre 1", "color/text/strong");
  await para(h3, "Classées de la plus à la moins pertinente.", "Corps", "color/text/muted");
  const prof = AL("HORIZONTAL", { name: "Résumé profil", itemSpacing: 8 }); prof.counterAxisAlignItems = "CENTER"; padAll(prof, 12, 14); rad(prof, "radius/md");
  prof.fills = fill("color/surface/card"); prof.strokes = fill("color/border/default"); prof.strokeWeight = 1; append(b3, prof);
  const pt = AL("VERTICAL", { name: "Texte", itemSpacing: 2 }); append(prof, pt);
  await para(pt, "À la carte · budget ≤ 150 000 FCFA", "Corps fort", "color/text/strong");
  await para(pt, "Objectif : devenir développeur web", "Petit", "color/text/muted");
  prof.appendChild(inst(S.btn, "Type=Fantôme", { "Libellé": "Modifier" }));
  const recos = [
    ["Développement de site web avec PHP, HTML, CSS", "Créer des sites web dynamiques avec HTML, CSS et PHP.", "TRIT", "3 semaines", "120 500 FCFA (promo)", "0,48", ["développement web", "site web", "programmation"], "Retour=Pertinent"],
    ["IA et le développement web", "Intégrer des fonctionnalités d'intelligence artificielle dans des sites et applications web.", "IA-Data", "1 mois", "90 000 FCFA (promo)", "0,41", ["développement web", "programmation", "applications web"], "Retour=Aucun"],
    ["Développement web Laravel (ou autres technologies)", "Développer des applications web structurées avec le framework Laravel.", "TRIT", "3 semaines", "135 000 FCFA (promo)", "0,36", ["développement web", "programmation"], "Retour=Aucun"],
    ["Programmation en Java SE ou C++ ou VB ou PHP", "Apprendre un langage de programmation et réaliser ses premières applications.", "TRIT", "3 semaines", "120 500 FCFA (promo)", "0,29", ["programmation", "développement"], "Retour=Non pertinent"],
    ["Algorithme et Programmation avec C/C++, Java", "Apprendre la logique algorithmique et programmer en C, C++ ou Java.", "TRIT", "3 semaines", "82 500 FCFA (promo)", "0,22", ["programmation"], "Retour=Aucun"],
  ];
  let rank = 1;
  for (const [t, d, dom, dur, prix, score, words, ret] of recos) {
    const i = inst(reco, ret, { "Rang": String(rank++), "Intitulé": t, "Description": d, "Durée": dur, "Prix": prix, "Score": score });
    append(b3, i);
    await setBadges(i, dom, null, words, S.tag);
    setGauge(i, parseFloat(score.replace(",", ".")));
  }

  figma.viewport.scrollAndZoomIntoView([m1, m2, m3]);
  return "mobile";
}

// ---------------------------------------------------------------- exécution

try {
  await init();
  const r = await mobile();
  out(r === 'mobile' ? '✅ Écrans M1, M2 et M3 créés sur « Écrans mobile »' : 'ℹ️ Écrans mobile déjà présents : rien à faire');
} catch (e) { out('❌ ' + e.message); }
