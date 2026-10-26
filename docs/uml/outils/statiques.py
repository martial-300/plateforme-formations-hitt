import sys
from umlsvg import C, doc, text, rect, line, actor, ellipse, note, label_on, tw

OUT = sys.argv[1]


def save(name, svg):
    open(f'{OUT}/{name}.svg', 'w').write(svg)


# ---------------------------------------------------------------- 1. cas d'utilisation

def cas_utilisation():
    b = []
    BX0, BX1, BY0, BY1 = 230, 1060, 82, 850
    b.append(rect(BX0, BY0, BX1 - BX0, BY1 - BY0, fill=C['cream'], stroke=C['line'], sw=1.4, r=4))
    b.append(text(BX0 + 16, BY0 + 26, 'Plateforme HIT-T', 14, 700, 'start', C['green']))
    RX, RY = 112, 31
    c1, c2, c3 = 400, 690, 925
    U = {
        'UC1': (c1, 150, 'Consulter le catalogue\n(RF-05)'),
        'UC3': (c1, 235, 'Voir le détail\nd\'une formation (RF-05)'),
        'UC4': (c1, 320, 'Essayer sans compte :\n3 formations (RF-12)'),
        'UC5': (c1, 405, 'Créer un compte\n(RF-01)'),
        'UC7': (c1, 490, 'Se connecter /\nse déconnecter (RF-02)'),
        'UC8': (c1, 665, 'Remplir ou modifier le\nquestionnaire (RF-06, RF-07)'),
        'UC10': (c1, 770, 'Donner un avis sur une\nrecommandation (RF-10)'),
        'UC2': (c2, 150, 'Filtrer par domaine\net par type'),
        'UC6': (c2, 448, 'S\'authentifier avec\nGoogle (RF-13)'),
        'UC9': (c2, 665, 'Obtenir 5 recommandations\nexpliquées (RF-08, RF-09)'),
        'UC11': (c3, 585, 'Gérer le catalogue\n(RF-04)'),
        'UC12': (c3, 715, 'Consulter les chiffres\nclés (RF-11)'),
    }
    VX, VY, AX, AY, ADX, ADY, GX, GY = 105, 200, 105, 620, 1160, 600, 1160, 300
    # liens acteurs → cas
    for u in ['UC1', 'UC3', 'UC4', 'UC5', 'UC7']:
        x, y, _ = U[u]; b.append(line([(VX + 20, VY + 32), (x - RX, y)], color=C['ink2'], sw=1.3))
    for u in ['UC8', 'UC10']:
        x, y, _ = U[u]; b.append(line([(AX + 20, AY + 32), (x - RX, y)], color=C['ink2'], sw=1.3))
    for u in ['UC11', 'UC12']:
        x, y, _ = U[u]; b.append(line([(ADX - 20, ADY + 32), (x + RX, y)], color=C['ink2'], sw=1.3))
    x, y, _ = U['UC6']; b.append(line([(x + RX - 6, y - 8), (GX - 22, GY + 34)], color=C['ink2'], sw=1.3))
    # généralisation Apprenant → Visiteur
    b.append(line([(AX, AY - 4), (VX, VY + 104)], end='triangle'))
    # include / extend
    def rel(a, bb, kind, pa, pb, lpos=None):
        b.append(line([pa, pb], dash='6 4', end='ouvert'))
        lx, ly = lpos or ((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2 - 6)
        b.append(label_on(lx, ly, f'«{kind}»', 11.5, C['green']))
    rel('UC2', 'UC1', 'extend', (c2 - RX, 150), (c1 + RX, 150), (545, 141))
    rel('UC6', 'UC5', 'extend', (c2 - RX + 8, 436), (c1 + RX - 6, 414), (545, 414))
    rel('UC6', 'UC7', 'extend', (c2 - RX + 8, 462), (c1 + RX - 6, 482), (545, 486))
    rel('UC8', 'UC9', 'include', (c1 + RX, 665), (c2 - RX, 665), (545, 656))
    rel('UC11', 'UC7', 'include', (c3 - RX + 6, 572), (c1 + RX - 4, 500), (835, 535))
    for k, (x, y, s) in U.items():
        b.append(ellipse(x, y, RX, RY, s))
    b.append(actor(VX, VY, 'Visiteur'))
    b.append(actor(AX, AY, 'Apprenant'))
    b.append(actor(ADX, ADY, 'Administrateur'))
    b.append(actor(GX, GY, 'Google'))
    b.append(text(GX, GY + 100, '«système»\nfournisseur d\'identité', 11, 400, 'middle', C['muted']))
    b.append(note(1080, 720, 175, 'Routes réservées au rôle\nadministrateur (RF-03).\nConnexion par email et\nmot de passe uniquement.', 11.5))
    b.append(note(24, 760, 190, 'L\'apprenant hérite des\ncas d\'utilisation du visiteur.', 11.5))
    save('01-cas-utilisation', doc(1290, 880, 'Diagramme de cas d\'utilisation — plateforme HIT-T (MVP, v1.1)', ''.join(b)))


# ---------------------------------------------------------------- 2. classes

def classe(x, y, w, name, attrs, ops=(), stereo=None):
    lh = 18
    head = 30 + (16 if stereo else 0)
    h = head + 10 + lh * len(attrs) + (10 + lh * len(ops) if ops else 0) + 8
    g = [rect(x, y, w, h, fill=C['white']), f'<rect x="{x + 0.75}" y="{y + 0.75}" width="{w - 1.5}" height="{head - 1}" rx="3" fill="{C["light"]}"/>']
    if stereo:
        g.append(text(x + w / 2, y + 17, f'«{stereo}»', 11.5, 400, 'middle', C['muted']))
    g.append(text(x + w / 2, y + head - 10, name, 14, 700, 'middle'))
    g.append(line([(x, y + head), (x + w, y + head)], sw=1.2))
    yy = y + head + 6 + 12
    for a in attrs:
        g.append(text(x + 12, yy, a, 12, 400, 'start', C['ink'])); yy += lh
    if ops:
        yy += 2
        g.append(line([(x, yy - 12), (x + w, yy - 12)], sw=1.2))
        yy += 6
        for o in ops:
            g.append(text(x + 12, yy, o, 12, 400, 'start', C['ink'])); yy += lh
    return ''.join(g), h


def classes():
    b = []
    cu, hu = classe(50, 90, 330, 'Utilisateur', ['- id : UUID', '- nom : String', '- prenom : String', '- email : String {unique}', '- motDePasseHash : String [0..1]', '- googleId : String [0..1] {unique}', '- role : Role', '- dateCreation : DateTime'], ['+ verifierMotDePasse(mdp : String) : Boolean'])
    cp, hp = classe(50, 520, 330, 'ProfilApprenant', ['- id : UUID', '- niveauEtudes : String', '- competences : String', '- centresInteret : String', '- objectifProfessionnel : String', '- typeSouhaite : TypeFormation', '- budgetMaxFcfa : Integer', '- dateMaj : DateTime'], ['+ texteMoteur() : String'])
    cr, hr = classe(540, 90, 320, 'Recommandation', ['- id : UUID', '- score : Decimal {0..1}', '- motsClesCommuns : String [*]', '- retour : Retour', '- dateGeneration : DateTime'], ['+ correspondance() : String'])
    cf, hf = classe(1020, 90, 340, 'Formation', ['- id : UUID', '- intitule : String', '- description : String', '- domaine : Domaine', '- type : TypeFormation', '- dureeValeur : Decimal', '- dureeUnite : UniteDuree', '- coutFcfa : Integer', '- coutPromoFcfa : Integer [0..1]', '- motsCles : String [1..*]'], ['+ texteMoteur() : String', '+ prixEffectif() : Integer'])
    cm, hm = classe(1020, 560, 340, 'MoteurRecommandation', ['- vectoriseur : TfidfVectorizer'], ['+ recommander(texte, type, budget, k)', '      : Resultat [0..k]'], 'service')
    cs, hs = classe(540, 560, 320, 'Resultat', ['+ score : Decimal', '+ motsClesCommuns : String [*]'], (), 'valeur')
    # associations
    b.append(line([(380, 190), (540, 190)], sw=1.5))
    b.append(text(392, 182, '1', 12, 600)); b.append(text(500, 182, '0..5', 12, 600))
    b.append(label_on(460, 210, 'reçoit ▸', 11.5))
    b.append(line([(215, 90 + hu), (215, 520)], sw=1.5))
    b.append(text(225, 90 + hu + 18, '1', 12, 600)); b.append(text(225, 512, '0..1', 12, 600))
    b.append(label_on(262, (90 + hu + 520) / 2 + 4, 'possède ▾', 11.5))
    b.append(line([(860, 190), (1020, 190)], sw=1.5))
    b.append(text(872, 182, '0..*', 12, 600)); b.append(text(1004, 182, '1', 12, 600))
    b.append(label_on(940, 210, '◂ concerne', 11.5))
    # dépendances et association du résultat
    b.append(line([(1190, 560), (1190, 90 + hf)], dash='6 4', end='ouvert'))
    b.append(label_on(1240, (560 + 90 + hf) / 2, '«use»', 11.5, C['green']))
    b.append(line([(1020, 610), (860, 610)], dash='6 4', end='ouvert'))
    b.append(label_on(940, 602, '«create»', 11.5, C['green']))
    b.append(line([(800, 560), (1060, 90 + hf)], end='ouvert'))
    b.append(text(1040, 90 + hf + 26, '1', 12, 600))
    b.append(label_on(905, 455, 'formation', 11.5))
    b.extend([cu, cp, cr, cf, cm, cs])
    b.append(note(540, 660, 300, 'Contrainte : motDePasseHash ou googleId\nest obligatoirement renseigné.\ncorrespondance() : ≥ 0,40 « Très proche »,\n≥ 0,30 « Proche », sinon « Peut vous\nintéresser » (seuils à calibrer en S5).', 11.5))
    b.append(line([(540, 690), (380, 300)], color=C['line'], sw=1.1, dash='3 3'))
    # énumérations
    ey = 830
    b.append(text(50, ey - 14, 'Énumérations', 14, 700, 'start', C['green']))
    x = 50
    for name, vals in [('Role', ['apprenant', 'administrateur']), ('Domaine', ['SISG', 'IA_Data', 'TRIT']), ('TypeFormation', ['carte', 'modulaire']), ('UniteDuree', ['heure', 'jour', 'semaine', 'mois']), ('Retour', ['aucun', 'pertinent', 'non_pertinent'])]:
        w = 200
        g, h = classe(x, ey, w, name, vals, (), 'enumeration')
        b.append(g); x += w + 30
    save('02-classes', doc(1410, 1020, 'Diagramme de classes — modèle du domaine et moteur de recommandation', ''.join(b)))


# ---------------------------------------------------------------- 6. activité

def action(cx, cy, s, w=230):
    n = s.count('\n') + 1
    h = 22 + 17 * n
    return rect(cx - w / 2, cy - h / 2, w, h, fill=C['white'], r=14) + text(cx, cy - (n - 1) * 8.5 + 4.5, s, 12.5, 400, 'middle'), h


def diamond(cx, cy, s, w=210, h=64):
    return (f'<path d="M{cx},{cy - h / 2} L{cx + w / 2},{cy} L{cx},{cy + h / 2} L{cx - w / 2},{cy} z" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.5"/>'
            + text(cx, cy + 4, s, 12, 600, 'middle'))


def activite():
    b = []
    L = [('Visiteur', 40, 440), ('Apprenant', 440, 800), ('Plateforme', 800, 1160)]
    top, bot = 80, 1210
    for name, x0, x1 in L:
        b.append(rect(x0, top, x1 - x0, bot - top, fill=C['white'], stroke=C['soft'], sw=1.2, r=0))
        b.append(f'<rect x="{x0}" y="{top}" width="{x1 - x0}" height="36" fill="{C["light"]}" stroke="{C["soft"]}"/>')
        b.append(text((x0 + x1) / 2, top + 24, name, 14, 700, 'middle', C['green']))
    V, A, P = 240, 620, 980
    arr = lambda pts, lab=None, lp=None: (b.append(line(pts, end='plein')), lab and b.append(label_on(lp[0], lp[1], lab, 11.5)))
    b.append(f'<circle cx="{V}" cy="150" r="11" fill="{C["green"]}"/>')
    g, _ = action(V, 205, 'Arrive sur l\'accueil'); b.append(g); arr([(V, 161), (V, 188)])
    b.append(diamond(V, 285, 'Sait ce qu\'il cherche ?')); arr([(V, 222), (V, 253)])
    g, _ = action(140, 390, 'Parcourt le catalogue\net les fiches', 180); b.append(g)
    g, _ = action(340, 375, 'Essaie sans compte\n(3 questions)', 170); b.append(g)
    g, _ = action(340, 455, 'Voit 3 formations', 170); b.append(g)
    arr([(V - 105, 285), (140, 285), (140, 365)], 'oui', (125, 310))
    arr([(V + 105, 285), (340, 285), (340, 350)], 'non', (356, 310))
    arr([(340, 400), (340, 438)])
    b.append(f'<path d="M{V},{520} L{V + 22},{542} L{V},{564} L{V - 22},{542} z" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.5"/>')
    arr([(140, 415), (140, 542), (V - 22, 542)])
    arr([(340, 472), (340, 542), (V + 22, 542)])
    g, _ = action(V, 625, 'Crée un compte\n(email ou Google)'); b.append(g); arr([(V, 564), (V, 600)])
    g, _ = action(A, 625, 'Remplit le questionnaire\n(réponses de l\'essai reprises)', 250); b.append(g); arr([(V + 115, 625), (A - 125, 625)])
    g, _ = action(P, 625, 'Calcule les recommandations\n(type, budget, TF-IDF)', 250); b.append(g); arr([(A + 125, 625), (P - 125, 625)])
    b.append(diamond(P, 735, 'Formation(s) trouvée(s) ?', 230)); arr([(P, 650), (P, 703)])
    g, _ = action(A, 735, 'Modifie ses réponses', 210); b.append(g)
    arr([(P - 115, 735), (A + 105, 735)], 'non : explique et\npropose d\'élargir', (P - 190, 770))
    arr([(A, 718), (A, 650)])
    g, _ = action(P, 850, 'Affiche jusqu\'à 5 formations\nclassées et expliquées', 250); b.append(g)
    arr([(P, 767), (P, 825)], 'oui', (P + 18, 795))
    g, _ = action(A, 950, 'Donne son avis\nsur chaque formation', 220); b.append(g)
    arr([(P, 875), (P, 950), (A + 110, 950)])
    b.append(diamond(A, 1050, 'Satisfait ?', 170, 58)); arr([(A, 975), (A, 1021)])
    arr([(A - 85, 1050), (470, 1050), (470, 735), (A - 105, 735)], 'non', (490, 1040))
    g, _ = action(A, 1140, 'Contacte le cabinet\npour s\'inscrire', 210); b.append(g)
    arr([(A, 1079), (A, 1115)], 'oui', (A + 18, 1100))
    b.append(f'<circle cx="{A + 160}" cy="1140" r="13" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.6"/><circle cx="{A + 160}" cy="1140" r="7.5" fill="{C["green"]}"/>')
    arr([(A + 105, 1140), (A + 146, 1140)])
    save('06-activite-parcours', doc(1200, 1240, 'Diagramme d\'activité — parcours d\'un apprenant', ''.join(b)))


# ---------------------------------------------------------------- 7. états

def etat(cx, cy, title, sub, w=230):
    return rect(cx - w / 2, cy - 34, w, 68, fill=C['white'], r=16) + f'<line x1="{cx - w / 2}" y1="{cy - 4}" x2="{cx + w / 2}" y2="{cy - 4}" stroke="{C["green"]}" stroke-width="1.2"/>' + text(cx, cy - 13, title, 13.5, 700, 'middle') + text(cx, cy + 18, sub, 12, 400, 'middle', C['ink2'])


def etats():
    b = []
    S, P, N = (300, 300), (680, 150), (680, 450)
    b.append(f'<circle cx="90" cy="300" r="11" fill="{C["green"]}"/>')
    b.append(line([(101, 300), (185, 300)], end='plein')); b.append(label_on(143, 278, 'générée à la', 11)); b.append(label_on(143, 292, 'soumission', 11))
    b.append(etat(*S, 'Sans avis', 'retour = aucun'))
    b.append(etat(*P, 'Pertinente', 'retour = pertinent'))
    b.append(etat(*N, 'Non pertinente', 'retour = non_pertinent'))
    b.append(line([(415, 280), (565, 168)], end='plein')); b.append(label_on(470, 205, '« Elle me correspond »', 11.5))
    b.append(line([(415, 320), (565, 432)], end='plein')); b.append(label_on(470, 405, '« Pas pour moi »', 11.5))
    b.append(line([(650, 184), (650, 416)], end='plein')); b.append(label_on(650, 300, 'change d\'avis', 11.5))
    b.append(line([(710, 416), (710, 184)], end='plein'))
    FX, FY = 1010, 300
    b.append(f'<circle cx="{FX}" cy="{FY}" r="13" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.6"/><circle cx="{FX}" cy="{FY}" r="7.5" fill="{C["green"]}"/>')
    b.append(line([(795, 160), (FX - 10, FY - 10)], end='plein'))
    b.append(line([(795, 440), (FX - 10, FY + 10)], end='plein'))
    b.append(f'<path d="M300,334 C300,620 1010,640 {FX},{FY + 15}" fill="none" stroke="{C["green"]}" stroke-width="1.5" marker-end="url(#plein)"/>')
    b.append(label_on(880, 300, 'questionnaire resoumis', 11.5)); b.append(label_on(880, 316, 'ou formation supprimée', 11.5))
    b.append(note(60, 380, 210, 'Les avis alimentent le taux\nde retours « pertinent »\naffiché à l\'administrateur\n(RF-11).', 11.5))
    save('07-etats-recommandation', doc(1080, 660, 'Diagramme d\'états — une recommandation', ''.join(b)))


# ---------------------------------------------------------------- 8. déploiement

def noeud(x, y, w, h, title, d=14):
    return (f'<path d="M{x},{y} L{x + d},{y - d} L{x + w + d},{y - d} L{x + w + d},{y + h - d} L{x + w},{y + h}" fill="{C["light"]}" stroke="{C["green"]}" stroke-width="1.4"/>'
            f'<line x1="{x + w}" y1="{y}" x2="{x + w + d}" y2="{y - d}" stroke="{C["green"]}" stroke-width="1.4"/>'
            + rect(x, y, w, h, fill=C['white'], r=0) + text(x + 14, y + 24, title, 13.5, 700, 'start', C['green']))


def composant(x, y, w, h, title, sub):
    return (rect(x, y, w, h, fill=C['white'], r=3)
            + f'<rect x="{x + w - 28}" y="{y + 10}" width="16" height="20" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.2"/>'
            f'<rect x="{x + w - 32}" y="{y + 14}" width="8" height="4" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.2"/>'
            f'<rect x="{x + w - 32}" y="{y + 22}" width="8" height="4" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.2"/>'
            + text(x + 14, y + 24, title, 13, 700) + text(x + 14, y + 44, sub, 11.5, 400, 'start', C['ink2']))


def deploiement():
    b = []
    b.append(noeud(40, 140, 250, 150, '«device» Poste de l\'utilisateur'))
    b.append(composant(60, 190, 210, 80, 'Navigateur', 'ordinateur ou mobile'))
    b.append(noeud(360, 110, 640, 520, '«device» VPS Linux'))
    b.append(noeud(385, 160, 590, 450, '«execution environment» Docker Compose', 10))
    b.append(composant(410, 220, 230, 80, 'Nginx', 'HTTPS (Let\'s Encrypt), port 443'))
    b.append(composant(720, 210, 230, 92, 'Frontend', 'React 18 + TypeScript (Vite)\nfichiers statiques'))
    b.append(composant(720, 360, 230, 92, 'Backend', 'Python 3.11 · FastAPI\nSQLAlchemy · Scikit-learn'))
    x, y = 835, 505
    b.append(f'<path d="M{x - 75},{y} v62 a75,13 0 0,0 150,0 v-62" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.5"/><ellipse cx="{x}" cy="{y}" rx="75" ry="13" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.5"/>')
    b.append(text(x, y + 38, '«database»', 11, 400, 'middle', C['muted'])); b.append(text(x, y + 56, 'PostgreSQL 15 · 4 tables', 12.5, 700, 'middle'))
    b.append(noeud(1070, 170, 210, 110, '«external» Google'))
    b.append(text(1084, 225, 'Google Identity Services\n(connexion, vérification\ndu jeton)', 11.5, 400, 'start', C['ink2']))
    b.append(line([(270, 230), (410, 260)], end='ouvert')); b.append(label_on(340, 236, 'HTTPS 443', 11.5))
    b.append(line([(640, 250), (720, 250)], end='ouvert')); b.append(label_on(680, 242, '/', 11.5))
    b.append(line([(600, 300), (600, 405), (720, 405)], end='ouvert')); b.append(label_on(650, 398, '/api/v1', 11.5))
    b.append(line([(835, 452), (835, 492)], end='ouvert')); b.append(label_on(885, 478, 'SQL (ORM)', 11.5))
    b.append(line([(950, 400), (1070, 250)], dash='6 4', end='ouvert')); b.append(label_on(1035, 330, 'vérifie le jeton', 11.5))
    b.append(f'<path d="M165,140 C165,60 1100,40 1150,156" fill="none" stroke="{C["green"]}" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#ouvert)"/>')
    b.append(label_on(640, 72, 'connexion Google (jeton d\'identité)', 11.5))
    save('08-deploiement', doc(1320, 670, 'Diagramme de déploiement — MVP', ''.join(b)))


cas_utilisation(); classes(); activite(); etats(); deploiement()
print('ok')
