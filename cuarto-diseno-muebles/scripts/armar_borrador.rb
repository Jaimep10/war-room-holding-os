# Armado del borrador .skp desde plan-espacial.json (agente-ksmart-ejecutor).
#
# - Copia la plantilla de arranque a la ruta de salida y la abre como un
#   documento NUEVO (no toca el modelo que el usuario tenga abierto). Sin
#   plantilla ("plantilla" => nil) arranca en un modelo vacío, en mm.
# - Si el plan trae "arquitectura", dibuja antes paredes, ventanas, pilares,
#   piso y tumbado (ver armar_arquitectura.rb).
# - Coloca cada módulo con su .skp real de KSmart: el dorso contra la pared
#   (o contra la línea de la península), el borde izquierdo en "desde" y el
#   frente mirando hacia adentro de la cocina.
# - Espacios libres y volados NO son módulos: se marcan solo como guías
#   (con su propio "fondo" si lo trae; si no, el fondo de los bajos).
# - Si falta la orientación de algún módulo o la altura de los altos, se
#   detiene sin colocar nada (nunca adivina).
#
# Coordenadas: las del plan (x hacia C, y hacia el frente abierto), con y
# invertida en SketchUp para que la vista superior coincida con el canvas.
#
# Tramos que no son las paredes A/B/C de una U (una isla, una pared en otra
# posición): el plan los declara en "marcos", en cm y coordenadas SketchUp:
#   "marcos": { "ISLA": { "origen": [x, y], "t": [tx, ty], "n": [nx, ny] } }
# origen = punto donde empieza el tramo (s = 0) sobre la línea del dorso,
# t = hacia dónde crece s, n = hacia dónde mira el frente. t y n son ejes
# unitarios (+-1 / 0). Un tramo declarado en "marcos" manda sobre A/B/C.
#
# Uso (consola Ruby de SketchUp):
#   load '/ruta/a/armar_borrador.rb'
#   KsmartBorrador.run(config_hash)
# config: plan, plantilla (ruta o nil), modulos_dir, salida, log,
#         orientacion { "archivo.skp" => { "frente" => "+x|-x|+y|-y" } },
#         altura_altos_cm (borde inferior de los altos, desde el piso)
require 'json'
require 'fileutils'
load File.join(File.dirname(__FILE__), 'armar_arquitectura.rb')

module KsmartBorrador
  EJES = { '+x' => [1, 0], '-x' => [-1, 0], '+y' => [0, 1], '-y' => [0, -1] }.freeze

  def self.pulg(cm)
    cm.to_f / 2.54
  end

  # [origen (cm, coords SketchUp), tangente t (s crece), normal n (hacia adentro)]
  def self.marco(plan, pared)
    m = (plan['marcos'] || {})[pared]
    return [m['origen'], m['t'], m['n']] if m
    return nil unless %w[A B C].include?(pared)

    a = plan['walls']['A']['len']
    b = plan['walls']['B']['len']
    case pared
    when 'A' then [[0, -a], [0, 1], [1, 0]]
    when 'B' then [[0, 0], [1, 0], [0, -1]]
    when 'C' then [[b, 0], [0, -1], [-1, 0]]
    end
  end

  def self.validar(cfg, plan)
    faltan = []
    faltan << 'plan-espacial.json tiene pendientes sin resolver' unless (plan['pendientes'] || []).empty?
    plan['paredes'].each do |pared, v|
      faltan << "#{pared}: tramo sin marco (no es A/B/C y no está en \"marcos\")" unless marco(plan, pared)
      ((v['bajos_torres'] || []) + (v['altos'] || [])).each do |m|
        next if %w[volado espacio].include?(m['tipo'])
        arch = m['archivo_ksmart']
        if arch.nil?
          faltan << "#{pared}: #{m['codigo_dado']} sin archivo KSmart"
          next
        end
        faltan << "#{arch}: no está en #{cfg['modulos_dir']}" unless File.exist?(File.join(cfg['modulos_dir'], arch))
        faltan << "#{arch}: falta la orientación del frente" unless EJES[cfg.dig('orientacion', arch, 'frente')]
      end
      faltan << 'falta altura_altos_cm' if !(v['altos'] || []).empty? && !cfg['altura_altos_cm'].is_a?(Numeric)
    end
    faltan << "no existe la plantilla #{cfg['plantilla']}" if cfg['plantilla'] && !File.exist?(cfg['plantilla'])
    faltan.concat(KsmartArquitectura.validar(plan).map { |f| "falta #{f}" })
    faltan.uniq
  end

  def self.colocar(ents, defn, frente, marco, s0, z0)
    origen, t, n = marco
    f = EJES[frente]
    rot = Geom::Transformation.rotation(ORIGIN, Z_AXIS, Math.atan2(n[1], n[0]) - Math.atan2(f[1], f[0]))
    caja = Geom::BoundingBox.new
    8.times { |i| caja.add(defn.bounds.corner(i).transform(rot)) }
    esquinas = (0..7).map { |i| caja.corner(i) }
    min_t = esquinas.map { |p| p.x * t[0] + p.y * t[1] }.min
    min_n = esquinas.map { |p| p.x * n[0] + p.y * n[1] }.min
    dt = pulg(origen[0] * t[0] + origen[1] * t[1] + s0) - min_t
    dn = pulg(origen[0] * n[0] + origen[1] * n[1]) - min_n
    dz = pulg(z0) - caja.min.z
    mover = Geom::Vector3d.new(t[0] * dt + n[0] * dn, t[1] * dt + n[1] * dn, dz)
    ents.add_instance(defn, Geom::Transformation.translation(mover) * rot)
  end

  def self.guia(ents, marco, s0, s1, fondo, texto)
    origen, t, n = marco
    pt = lambda do |s, d|
      Geom::Point3d.new(pulg(origen[0] + t[0] * s + n[0] * d), pulg(origen[1] + t[1] * s + n[1] * d), 0)
    end
    esq = [pt.call(s0, 0), pt.call(s1, 0), pt.call(s1, fondo), pt.call(s0, fondo)]
    4.times { |i| ents.add_cline(esq[i], esq[(i + 1) % 4]) }
    ents.add_text(texto, pt.call((s0 + s1) / 2.0, fondo / 2.0))
  end

  def self.run(cfg)
    plan = JSON.parse(File.read(cfg['plan']))
    faltan = validar(cfg, plan)
    unless faltan.empty?
      UI.messagebox("No se armó el borrador. Falta:\n- " + faltan.join("\n- "))
      File.write(cfg['log'], JSON.pretty_generate('estado' => 'detenido', 'faltan' => faltan, 'fecha' => Time.now.to_s))
      return
    end

    FileUtils.mkdir_p(File.dirname(cfg['salida']))
    if File.exist?(cfg['salida'])
      UI.messagebox("Ya existe #{cfg['salida']}. No se sobrescribe: muévelo o bórralo y vuelve a correr.")
      return
    end
    anterior = Sketchup.active_model
    if cfg['plantilla']
      FileUtils.cp(cfg['plantilla'], cfg['salida'])
      Sketchup.open_file(cfg['salida'])
    else
      Sketchup.file_new
      vacio = Sketchup.active_model
      if vacio && !vacio.equal?(anterior)
        vacio.entities.clear!
        vacio.options['UnitsOptions']['LengthUnit'] = 2 # mm
        vacio.options['UnitsOptions']['LengthFormat'] = 0 # decimal
        vacio.save(cfg['salida'])
      end
    end
    model = Sketchup.active_model
    unless model && !model.equal?(anterior) && File.identical?(model.path.to_s, cfg['salida'])
      UI.messagebox('No se pudo abrir la copia de la plantilla como documento nuevo. No se colocó nada.')
      return
    end

    prof = plan['profundidades']
    tags = {
      'bajo' => model.layers.add('KSMART bajos'), 'torre' => model.layers.add('KSMART torres'),
      'alto' => model.layers.add('KSMART altos'), 'guia' => model.layers.add('Guías plan-espacial')
    }
    colocados = []
    arquitectura = []
    model.start_operation('Borrador KSmart', true)
    begin
      if plan['arquitectura']
        arq_tags = %w[paredes aberturas pilares piso tumbado].to_h { |k| [k, model.layers.add("ARQ #{k}")] }
        arquitectura = KsmartArquitectura.dibujar(model, plan, arq_tags)
      end
      plan['paredes'].each do |pared, v|
        mc = marco(plan, pared)
        items = (v['bajos_torres'] || []).map { |m| [m, m['tipo']] } + (v['altos'] || []).map { |m| [m, 'alto'] }
        items.each_with_index do |(m, tipo), i|
          if %w[volado espacio].include?(tipo)
            g = guia(model.active_entities, mc, m['desde'], m['hasta'], m['fondo'] || prof['bajo'], "#{m['codigo_dado']} (#{m['ancho']} cm)")
            g.layer = tags['guia']
            next
          end
          defn = model.definitions.load(File.join(cfg['modulos_dir'], m['archivo_ksmart']))
          z0 = tipo == 'alto' ? cfg['altura_altos_cm'] : 0
          inst = colocar(model.active_entities, defn, cfg['orientacion'][m['archivo_ksmart']]['frente'], mc, m['desde'], z0)
          inst.name = format('%s-%02d %s', pared, i + 1, m['archivo_ksmart'].sub(/\.skp\z/, ''))
          inst.layer = tags[tipo == 'pendiente' ? 'bajo' : tipo] || tags['bajo']
          b = inst.bounds
          colocados << {
            'instancia' => inst.name, 'archivo' => m['archivo_ksmart'], 'pared' => pared, 'desde' => m['desde'], 'hasta' => m['hasta'],
            'caja_cm' => { 'x' => [b.min.x * 2.54, b.max.x * 2.54].map { |x| x.round(1) },
                           'y' => [b.min.y * 2.54, b.max.y * 2.54].map { |x| x.round(1) },
                           'z' => [b.min.z * 2.54, b.max.z * 2.54].map { |x| x.round(1) } }
          }
        end
      end
      model.commit_operation
    rescue StandardError => err
      model.abort_operation
      UI.messagebox("Error armando el borrador: #{err.message}")
      File.write(cfg['log'], JSON.pretty_generate('estado' => 'error', 'error' => err.message, 'fecha' => Time.now.to_s))
      return
    end

    model.save
    File.write(cfg['log'], JSON.pretty_generate('estado' => 'borrador_listo', 'salida' => cfg['salida'], 'arquitectura' => arquitectura, 'colocados' => colocados, 'fecha' => Time.now.to_s))
    UI.messagebox("Borrador listo: #{colocados.size} módulos colocados.\n#{cfg['salida']}")
  end
end
