"""Dibuja la planta (vista superior) de un plan-espacial.json como SVG.

Solo lee el plan: no inventa nada que no esté ahí. Sirve para revisar el
reparto de módulos antes de armar el borrador en SketchUp.

Requiere que el plan traiga "cuarto" (ancho, fondo) y "marcos" para cada
tramo (mismo formato que armar_borrador.rb: cm, coordenadas SketchUp).
"aberturas" e "islas" son opcionales.

Uso:
  python3 dibujar_planta.py <plan-espacial.json> <salida.svg>
"""
import json
import sys

S, M = 1.6, 60  # px por cm, margen en px
COLOR = {"bajo": "#e9d8bd", "torre": "#c9a77c"}


def main(plan_path, out_path):
    plan = json.load(open(plan_path, encoding="utf-8"))
    W, H = plan["cuarto"]["ancho"], plan["cuarto"]["fondo"]
    prof = plan["profundidades"]
    out = []
    a = out.append

    def pt(mc, s, d):
        o, t, n = mc["origen"], mc["t"], mc["n"]
        return M + (o[0] + t[0] * s + n[0] * d) * S, M - (o[1] + t[1] * s + n[1] * d) * S

    def rect(mc, s0, s1, d0, d1):
        (xa, ya), (xb, yb) = pt(mc, s0, d0), pt(mc, s1, d1)
        return min(xa, xb), min(ya, yb), abs(xb - xa), abs(yb - ya)

    def texto(cx, cy, txt, vertical, size=9.5, color="#222"):
        rot = f' transform="rotate(-90 {cx:.1f} {cy:.1f})"' if vertical else ""
        a(f'<text x="{cx:.1f}" y="{cy:.1f}" font-size="{size}" fill="{color}" text-anchor="middle"{rot}>{txt}</text>')

    a(f'<rect x="{M-12}" y="{M-12}" width="{W*S+24}" height="{H*S+24}" fill="#555"/>')
    a(f'<rect x="{M}" y="{M}" width="{W*S}" height="{H*S}" fill="#fafaf7"/>')
    for ab in plan.get("aberturas", []):  # {"pared": "izquierda", "desde": y0, "hasta": y1, "nombre": ...}
        if ab["pared"] == "izquierda":
            a(f'<rect x="{M-12}" y="{M+ab["desde"]*S}" width="12" height="{(ab["hasta"]-ab["desde"])*S}" fill="#9cc7e6"/>')
            texto(M - 22, M + (ab["desde"] + ab["hasta"]) / 2 * S, ab.get("nombre", "abertura"), True, 10)
    for isla in plan.get("islas", []):  # contorno de la encimera: {"x", "y", "ancho", "fondo"} en coords del plano
        a(f'<rect x="{M+isla["x"]*S}" y="{M+isla["y"]*S}" width="{isla["ancho"]*S}" height="{isla["fondo"]*S}" fill="#f1ece2" stroke="#8a7" stroke-dasharray="4 3"/>')

    for tramo, v in plan["paredes"].items():
        mc = plan["marcos"][tramo]
        vertical = mc["t"][0] == 0
        for m in v.get("bajos_torres", []):
            guia = m["tipo"] in ("espacio", "volado")
            fondo = m.get("fondo", prof["bajo"])
            x, y, w, h = rect(mc, m["desde"], m["hasta"], 0, fondo)
            pendiente = not guia and not m["archivo_ksmart"]
            fill = "#fff" if guia else COLOR.get(m["tipo"], "#eee")
            extra = ' stroke-dasharray="5 4"' if guia else ""
            a(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" '
              f'stroke="{"#c33" if pendiente else "#333"}" stroke-width="{1.6 if pendiente else 1}"{extra}/>')
            if m["ancho"] < 10:
                continue
            cx, cy = x + w / 2, y + h / 2
            etiqueta = m.get("etiqueta") or m["codigo_dado"]
            texto(cx, cy, etiqueta, vertical, 8.5 if len(etiqueta) > 14 else 9.5)
            texto(cx + (11 if vertical else 0), cy + (0 if vertical else 11), m["ancho"], vertical, 9, "#777")
            if m.get("rol") == "fregadero":
                a(f'<rect x="{cx-35*S:.1f}" y="{y+8*S:.1f}" width="{70*S}" height="{40*S}" fill="none" stroke="#468" rx="4"/>')
            if m.get("rol") == "coccion":
                a(f'<circle cx="{cx:.1f}" cy="{cy-14:.1f}" r="{16*S}" fill="none" stroke="#a44"/>')
        for al in v.get("altos", []):
            x, y, w, h = rect(mc, al["desde"], al["hasta"], 0, prof.get("alto") or 35)
            a(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="none" stroke="#36c" stroke-dasharray="2 3"/>')

    ly = M + H * S + 36
    for linea in (
        "Café = bajos / torres. Borde rojo = módulo por elegir (sin archivo KSmart todavía).",
        "Azul punteado = altos. Gris punteado = guías (no son módulos).",
    ):
        a(f'<text x="{M}" y="{ly}" font-size="12">{linea}</text>')
        ly += 17
    if tri := plan.get("triangulo"):
        a(f'<text x="{M}" y="{ly}" font-size="12">Triángulo: fregadero→cocción {tri["fregadero_coccion_m"]} m · '
          f'cocción→refri {tri["coccion_refri_m"]} m · refri→fregadero {tri["refri_fregadero_m"]} m</text>')

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W*S+2*M}" height="{H*S+2*M+60}" '
           f'font-family="Helvetica,Arial,sans-serif"><rect width="100%" height="100%" fill="white"/>'
           + "".join(out) + "</svg>")
    open(out_path, "w", encoding="utf-8").write(svg)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
