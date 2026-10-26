"""Petit générateur SVG de diagrammes UML (notation standard, charte HIT-T)."""
from html import escape

FONT = "'IBM Plex Sans','DejaVu Sans',Arial,sans-serif"
C = dict(ink='#1D1D1B', ink2='#4A4844', muted='#6E6A62', green='#146B47', green6='#1A8559',
         light='#EEF5F0', line='#BDB6A8', soft='#DCD7CC', cream='#F6F4EF', white='#FFFFFF', yellow='#F5D31B')


def tw(s, size=13, bold=False):
    """Largeur approximative d'un texte (px)."""
    return max((len(l) for l in s.split('\n')), default=0) * size * (0.60 if bold else 0.56)


def text(x, y, s, size=13, weight=400, anchor='start', color=C['ink'], italic=False, lh=1.3):
    lines = s.split('\n')
    out = [f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" fill="{color}"'
           + (' font-style="italic"' if italic else '') + '>']
    for i, l in enumerate(lines):
        out.append(f'<tspan x="{x:.1f}" dy="{0 if i == 0 else size * lh:.1f}">{escape(l)}</tspan>')
    out.append('</text>')
    return ''.join(out)


def rect(x, y, w, h, fill=C['white'], stroke=C['green'], sw=1.5, r=3, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>'


def line(pts, color=C['green'], sw=1.5, dash=None, end=None, start=None):
    d = ' '.join(f'{"M" if i == 0 else "L"}{x:.1f},{y:.1f}' for i, (x, y) in enumerate(pts))
    a = (f' stroke-dasharray="{dash}"' if dash else '') + (f' marker-end="url(#{end})"' if end else '') + (f' marker-start="url(#{start})"' if start else '')
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{sw}"{a}/>'


def doc(w, h, title, body):
    defs = f'''<defs>
<marker id="plein" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{C['green']}"/></marker>
<marker id="ouvert" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="{C['green']}" stroke-width="1.5"/></marker>
<marker id="triangle" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="14" markerHeight="14" orient="auto-start-reverse"><path d="M0,0 L12,6 L0,12 z" fill="{C['white']}" stroke="{C['green']}" stroke-width="1.2"/></marker>
</defs>'''
    style = f'<style>@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&amp;display=swap"); text {{ font-family: {FONT}; }}</style>'
    head = text(32, 38, title, 19, 700) + f'<rect x="32" y="50" width="56" height="3" fill="{C["yellow"]}"/>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{style}{defs}'
            f'<rect width="{w}" height="{h}" fill="{C["white"]}"/>{head}{body}</svg>')


def actor(x, y, label):
    """Bonhomme UML centré en x, tête en y."""
    g = [f'<circle cx="{x}" cy="{y + 9}" r="9" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.6"/>',
         line([(x, y + 18), (x, y + 44)]), line([(x - 16, y + 27), (x + 16, y + 27)]),
         line([(x, y + 44), (x - 13, y + 64)]), line([(x, y + 44), (x + 13, y + 64)]),
         text(x, y + 84, label, 13, 600, 'middle')]
    return ''.join(g)


def ellipse(cx, cy, rx, ry, label, size=12.5):
    n = label.count('\n') + 1
    return (f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.5"/>'
            + text(cx, cy - (n - 1) * size * 0.65 + size * 0.35, label, size, 400, 'middle'))


def note(x, y, w, s, size=12):
    n = s.count('\n') + 1
    h = n * size * 1.3 + 16
    return (f'<path d="M{x},{y} L{x + w - 12},{y} L{x + w},{y + 12} L{x + w},{y + h} L{x},{y + h} z" fill="{C["white"]}" stroke="{C["line"]}" stroke-width="1.2"/>'
            f'<path d="M{x + w - 12},{y} L{x + w - 12},{y + 12} L{x + w},{y + 12}" fill="none" stroke="{C["line"]}" stroke-width="1.2"/>'
            + text(x + 10, y + 8 + size, s, size, 400, 'start', C['ink2']))


def label_on(x, y, s, size=11.5, color=C['ink2'], anchor='middle', bg=True):
    w = tw(s, size) + 8
    b = f'<rect x="{x - w / 2 if anchor == "middle" else x - 4:.1f}" y="{y - size:.1f}" width="{w:.1f}" height="{size * 1.35:.1f}" fill="{C["white"]}"/>' if bg else ''
    return b + text(x, y, s, size, 400, anchor, color)


def bgtext(x, y, s, anchor, size=12):
    """Texte sur fond blanc semi-opaque (lisible au-dessus des lignes de vie)."""
    n = s.count('\n') + 1
    w = tw(s, size) + 10
    x0 = x - w / 2 if anchor == 'middle' else x - 5
    return (f'<rect x="{x0:.1f}" y="{y - size - 1:.1f}" width="{w:.1f}" height="{size * (1.3 * (n - 1) + 1) + 4:.1f}" rx="2" fill="{C["white"]}" fill-opacity="0.92"/>'
            + text(x, y, s, size, 400, anchor, C['ink']))


# ---------------------------------------------------------------- séquence

def sequence(title, parts, events, gap=210, width=None):
    """parts : [(id, libellé, 'actor'|'box'|'db', boîte)] ; events : tuples."""
    x0 = 110
    X = {p[0]: x0 + i * gap for i, p in enumerate(parts)}
    top = 80
    body = []
    y = top + 120
    num = 0
    groups = []  # pile [y_debut, libellé, [(y, label_else)], niveau]
    msgs = []
    for ev in events:
        k = ev[0]
        if k in ('msg', 'ret'):
            _, a, b, s = ev[:4]
            num += 1
            n = s.count('\n')
            y += 14 * n
            xa, xb = X[a], X[b]
            msgs.append(line([(xa, y), (xb, y)], dash='6 4' if k == 'ret' else None, end='ouvert' if k == 'ret' else 'plein'))
            lx = (xa + xb) / 2
            msgs.append(bgtext(lx, y - 7 - 14 * n, f'{num}. {s}', 'middle'))
            y += 40
        elif k == 'self':
            _, a, s = ev
            num += 1
            n = s.count('\n')
            xa = X[a]
            msgs.append(line([(xa, y), (xa + 34, y), (xa + 34, y + 20), (xa + 4, y + 20)], end='plein'))
            msgs.append(bgtext(xa + 42, y + 6 - 7 * n, f'{num}. {s}', 'start'))
            y += 46 + 14 * n
        elif k == 'note':
            _, a, s = ev
            msgs.append(note(X[a] + 14, y - 14, tw(s, 12) + 24, s))
            y += 22 + 16 * (s.count('\n') + 1)
        elif k in ('alt', 'opt'):
            y += 8
            groups.append([y, k, ev[1], [], len(groups)])
            y += 34
        elif k == 'else':
            groups[-1][3].append((y - 6, ev[1]))
            y += 28
        elif k == 'end':
            y0, kind, lab, elses, lvl = groups.pop()
            xl = min(X.values()) - 70 + lvl * 10
            xr = max(X.values()) + 90 - lvl * 10
            body.append(rect(xl, y0, xr - xl, y - y0 + 4, fill='none', stroke=C['line'], sw=1.2, r=2))
            tab = f'{kind}'
            body.append(f'<path d="M{xl},{y0} L{xl + 46},{y0} L{xl + 46},{y0 + 14} L{xl + 38},{y0 + 22} L{xl},{y0 + 22} z" fill="{C["light"]}" stroke="{C["line"]}" stroke-width="1.2"/>')
            body.append(text(xl + 8, y0 + 15, tab, 12, 700, 'start', C['green']))
            body.append(text(xl + 56, y0 + 15, f'[{lab}]', 12, 600, 'start', C['ink2']))
            for ye, le in elses:
                body.append(line([(xl, ye), (xr, ye)], color=C['line'], sw=1.2, dash='5 4'))
                body.append(text(xl + 10, ye + 16, f'[{le}]', 12, 600, 'start', C['ink2']))
            y += 16
    bottom = y + 10
    # boîtes de regroupement (navigateur / serveur)
    boxes = {}
    for p in parts:
        if len(p) > 3 and p[3]:
            boxes.setdefault(p[3], []).append(X[p[0]])
    for name, xs in boxes.items():
        xl, xr = min(xs) - 92, max(xs) + 92
        body.insert(0, rect(xl, top - 14, xr - xl, bottom - top + 30, fill=C['cream'], stroke=C['soft'], sw=1, r=4))
        body.insert(1, text((xl + xr) / 2, top + 2, name, 12, 700, 'middle', C['muted']))
    heads = []
    for p in parts:
        pid, lab, kind = p[0], p[1], p[2]
        x = X[pid]
        heads.append(line([(x, top + 92), (x, bottom)], color=C['line'], sw=1.2, dash='5 5'))
        if kind == 'actor':
            heads.append(actor(x, top + 8, lab))
        elif kind == 'db':
            heads.append(f'<path d="M{x - 46},{top + 30} v44 a46,10 0 0,0 92,0 v-44" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.5"/>'
                         f'<ellipse cx="{x}" cy="{top + 30}" rx="46" ry="10" fill="{C["white"]}" stroke="{C["green"]}" stroke-width="1.5"/>'
                         + text(x, top + 62, lab, 12.5, 600, 'middle'))
        else:
            w = max(tw(lab, 13, True) + 28, 130)
            n = lab.count('\n')
            heads.append(rect(x - w / 2, top + 22, w, 44 + 16 * n, fill=C['light']) + text(x, top + 49 - 8 * n, lab, 13, 600, 'middle'))
    W = width or (max(X.values()) + 160)
    return doc(W, bottom + 40, title, ''.join(body) + ''.join(heads) + ''.join(msgs))
