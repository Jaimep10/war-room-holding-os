# Arquitectura base del cuarto (paredes, ventanas/vanos, pilares, piso y tumbado)
# para el borrador .skp. La llama armar_borrador.rb cuando el plan trae "arquitectura".
#
# Formato en plan-espacial.json (cm; coordenadas SketchUp como los "marcos":
# x de 0 a cuarto.ancho, y de 0 hacia -cuarto.fondo; la pared "arriba" está en y = 0):
#   "cuarto": { "ancho": 360, "fondo": 419, "techo": 250 },
#   "arquitectura": {
#     "espesor_pared_cm": 15,
#     "muros": ["arriba", "derecha", "izquierda"],      // lados con muro; el resto queda abierto
#     "aberturas": [                                      // desde/hasta sobre la cara interior del muro:
#       { "pared": "izquierda", "tipo": "ventana",        //   arriba/abajo: desde la pared izquierda
#         "desde": 76.3, "hasta": 285.8,                  //   izquierda/derecha: desde la pared de arriba
#         "antepecho_cm": 110, "alto_cm": 100 }           // puerta/vano: antepecho_cm = 0
#     ],
#     "pilares": [ { "x": [300, 360], "y": [-57, 0] } ],
#     "tumbado": true
#   }
# Nunca adivina: si falta un dato, validar() lo devuelve y no se dibuja nada.
module KsmartArquitectura
  LADOS = %w[arriba abajo izquierda derecha].freeze
  TIPOS = %w[ventana puerta vano].freeze

  def self.pulg(cm)
    cm.to_f / 2.54
  end

  def self.validar(plan)
    a = plan['arquitectura']
    return [] unless a

    c = plan['cuarto'] || {}
    faltan = []
    %w[ancho fondo techo].each { |k| faltan << "cuarto.#{k}" unless c[k].is_a?(Numeric) }
    faltan << 'arquitectura.espesor_pared_cm' unless a['espesor_pared_cm'].is_a?(Numeric)
    muros = a['muros']
    faltan << 'arquitectura.muros (lista de lados con muro)' unless muros.is_a?(Array) && !muros.empty? && (muros - LADOS).empty?
    (a['aberturas'] || []).each_with_index do |ab, i|
      nombre = "arquitectura.aberturas[#{i}]"
      faltan << "#{nombre}.pared (debe ser un lado con muro)" unless muros.is_a?(Array) && muros.include?(ab['pared'])
      faltan << "#{nombre}.tipo (#{TIPOS.join('|')})" unless TIPOS.include?(ab['tipo'])
      %w[desde hasta antepecho_cm alto_cm].each { |k| faltan << "#{nombre}.#{k}" unless ab[k].is_a?(Numeric) }
    end
    (a['pilares'] || []).each_with_index do |p, i|
      faltan << "arquitectura.pilares[#{i}] (x e y como [min, max])" unless [p['x'], p['y']].all? { |r| r.is_a?(Array) && r.size == 2 }
    end
    faltan
  end

  # [origen, t (s crece), exterior (hacia afuera del cuarto), largo]
  def self.lado(nombre, ancho, fondo)
    case nombre
    when 'arriba' then [[0, 0], [1, 0], [0, 1], ancho]
    when 'abajo' then [[0, -fondo], [1, 0], [0, -1], ancho]
    when 'izquierda' then [[0, 0], [0, -1], [-1, 0], fondo]
    when 'derecha' then [[ancho, 0], [0, -1], [1, 0], fondo]
    end
  end

  def self.caja(ents, pts_cm, z0, z1)
    g = ents.add_group
    pts = pts_cm.map { |x, y| Geom::Point3d.new(pulg(x), pulg(y), pulg(z0)) }
    f = g.entities.add_face(pts)
    f.reverse! if f.normal.z < 0
    f.pushpull(pulg(z1 - z0))
    g
  end

  # Pieza de muro entre s0..s1 (a lo largo del lado) y z0..z1, con todo el espesor.
  def self.tramo(ents, l, e, s0, s1, z0, z1)
    o, t, n, = l
    pt = ->(s, d) { [o[0] + t[0] * s + n[0] * d, o[1] + t[1] * s + n[1] * d] }
    caja(ents, [pt.call(s0, 0), pt.call(s1, 0), pt.call(s1, e), pt.call(s0, e)], z0, z1)
  end

  def self.dibujar(model, plan, tags)
    a = plan['arquitectura']
    c = plan['cuarto']
    e = a['espesor_pared_cm']
    h = c['techo']
    ents = model.active_entities
    muros = a['muros']
    hechos = []

    muros.each do |m|
      l = lado(m, c['ancho'], c['fondo'])
      largo = l[3]
      # Los muros horizontales cubren las esquinas de los verticales que tocan.
      s_ini = %w[arriba abajo].include?(m) && muros.include?('izquierda') ? -e : 0
      s_fin = %w[arriba abajo].include?(m) && muros.include?('derecha') ? largo + e : largo
      abs = (a['aberturas'] || []).select { |ab| ab['pared'] == m }.sort_by { |ab| ab['desde'] }
      s = s_ini
      abs.each do |ab|
        tramo(ents, l, e, s, ab['desde'], 0, h).layer = tags['paredes'] if ab['desde'] > s
        z_ab = ab['antepecho_cm'] + ab['alto_cm']
        tramo(ents, l, e, ab['desde'], ab['hasta'], 0, ab['antepecho_cm']).layer = tags['paredes'] if ab['antepecho_cm'] > 0
        tramo(ents, l, e, ab['desde'], ab['hasta'], z_ab, h).layer = tags['paredes'] if z_ab < h
        if ab['tipo'] == 'ventana'
          o, t, n, = l
          pt = ->(ss, d, z) { Geom::Point3d.new(pulg(o[0] + t[0] * ss + n[0] * d), pulg(o[1] + t[1] * ss + n[1] * d), pulg(z)) }
          g = ents.add_group
          f = g.entities.add_face(pt.call(ab['desde'], e / 2.0, ab['antepecho_cm']), pt.call(ab['hasta'], e / 2.0, ab['antepecho_cm']),
                                  pt.call(ab['hasta'], e / 2.0, z_ab), pt.call(ab['desde'], e / 2.0, z_ab))
          f.material = vidrio(model)
          f.back_material = vidrio(model)
          g.layer = tags['aberturas']
          g.name = "VENTANA #{m} #{ab['desde']}-#{ab['hasta']}"
        end
        hechos << "#{ab['tipo']} #{m} #{ab['desde']}-#{ab['hasta']} z #{ab['antepecho_cm']}-#{z_ab}"
        s = ab['hasta']
      end
      tramo(ents, l, e, s, s_fin, 0, h).layer = tags['paredes'] if s_fin > s
      hechos << "muro #{m} #{e} cm"
    end

    (a['pilares'] || []).each do |p|
      x0, x1 = p['x'].minmax
      y0, y1 = p['y'].minmax
      g = caja(ents, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 0, h)
      g.layer = tags['paredes']
      g.name = 'PILAR'
      hechos << "pilar x #{x0}-#{x1} y #{y0}-#{y1}"
    end

    x0 = muros.include?('izquierda') ? -e : 0
    x1 = muros.include?('derecha') ? c['ancho'] + e : c['ancho']
    y1 = muros.include?('arriba') ? e : 0
    y0 = muros.include?('abajo') ? -c['fondo'] - e : -c['fondo']
    piso = ents.add_group
    piso.entities.add_face([[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map { |x, y| Geom::Point3d.new(pulg(x), pulg(y), 0) })
    piso.layer = tags['piso']
    piso.name = 'PISO'
    if a['tumbado']
      t = ents.add_group
      t.entities.add_face([[0, -c['fondo']], [c['ancho'], -c['fondo']], [c['ancho'], 0], [0, 0]].map { |x, y| Geom::Point3d.new(pulg(x), pulg(y), pulg(h)) })
      t.layer = tags['tumbado']
      t.name = "TUMBADO #{h}"
      hechos << "tumbado a #{h}"
    end
    hechos
  end

  def self.vidrio(model)
    m = model.materials['Vidrio ventana'] || model.materials.add('Vidrio ventana')
    m.color = Sketchup::Color.new(170, 210, 230)
    m.alpha = 0.35
    m
  end
end
