# Inspección de módulos KSmart (solo lectura).
#
# Carga cada .skp de una carpeta de módulos como definición dentro de un
# MODELO NUEVO (nunca en el modelo que el usuario tenga abierto) y escribe un
# JSON con lo que agente-ksmart-ejecutor necesita para colocarlos sin adivinar:
#   - caja envolvente en cm respecto del punto de inserción del módulo
#   - atributos dinámicos (lenx/leny/lenz y parámetros KSmart)
#   - dónde están las piezas de frente (puertas, gavetas, fachadas) → de ahí
#     sale hacia qué eje mira el frente del mueble
#   - opcional: contenido de primer nivel de la plantilla de arranque
#
# Uso (consola Ruby de SketchUp):
#   load '/ruta/a/inspeccionar_modulos.rb'
#   KsmartInspeccion.run(dir_modulos, salida_json, plantilla_skp_o_nil)
require 'json'

module KsmartInspeccion
  FRENTE_RE = /puerta|frente|fachada|gaveta|caj[oó]n|tapa|door|front|drawer/i

  def self.cm(v)
    (v.to_f * 2.54).round(2)
  end

  def self.caja(b)
    { 'x' => [cm(b.min.x), cm(b.max.x)], 'y' => [cm(b.min.y), cm(b.max.y)], 'z' => [cm(b.min.z), cm(b.max.z)] }
  end

  def self.caja_transformada(defn, tr)
    b = Geom::BoundingBox.new
    8.times { |i| b.add(defn.bounds.corner(i).transform(tr)) }
    caja(b)
  end

  def self.atributos(ent)
    out = {}
    ent.attribute_dictionaries&.each do |dict|
      dict.each_pair do |k, v|
        next if k.to_s.start_with?('_') && !k.to_s.end_with?('_formula')
        next unless v.is_a?(Numeric) || (v.is_a?(String) && v.length <= 80)
        out["#{dict.name}.#{k}"] = v
        break if out.size >= 80
      end
    end
    out
  end

  def self.nombre(e)
    n = e.name.to_s
    n.empty? ? e.definition.name.to_s : n
  end

  # Recorre hasta 5 niveles acumulando la transformación, para ubicar los
  # frentes en coordenadas del módulo.
  def self.frentes(entities, tr, prof, out)
    return if prof > 5 || out.size >= 40
    entities.each do |e|
      next unless e.is_a?(Sketchup::ComponentInstance) || e.is_a?(Sketchup::Group)
      t = tr * e.transformation
      n = nombre(e)
      if n =~ FRENTE_RE || e.definition.name.to_s =~ FRENTE_RE
        out << { 'nombre' => n, 'definicion' => e.definition.name, 'tag' => e.layer.name, 'caja_cm' => caja_transformada(e.definition, t) }
      end
      frentes(e.definition.entities, t, prof + 1, out)
    end
  end

  def self.hijos(entities, max = 40)
    entities.grep(Sketchup::Drawingelement).first(max).map do |e|
      h = { 'tipo' => e.typename, 'tag' => e.layer.name }
      if e.respond_to?(:definition)
        h['nombre'] = nombre(e)
        h['caja_cm'] = caja_transformada(e.definition, e.transformation)
      end
      h
    end
  end

  def self.run(dir_modulos, salida, plantilla = nil)
    anterior = Sketchup.active_model
    Sketchup.file_new
    model = Sketchup.active_model
    if model.equal?(anterior) || model.nil?
      UI.messagebox('No se pudo abrir un modelo nuevo. No se cargó nada para no tocar tu modelo actual.')
      return
    end

    rep = { 'sketchup' => Sketchup.version, 'generado' => Time.now.to_s, 'unidades' => 'cm', 'modulos' => {} }
    Dir.glob(File.join(dir_modulos, '*.skp')).sort.each do |f|
      begin
        d = model.definitions.load(f)
        fr = []
        frentes(d.entities, Geom::Transformation.new, 0, fr)
        rep['modulos'][File.basename(f)] = {
          'definicion' => d.name,
          'caja_cm' => caja(d.bounds),
          'atributos' => atributos(d),
          'frentes' => fr,
          'hijos' => hijos(d.entities),
        }
      rescue StandardError => err
        rep['modulos'][File.basename(f)] = { 'error' => err.message }
      end
    end

    if plantilla && File.exist?(plantilla)
      begin
        d = model.definitions.load(plantilla)
        rep['plantilla'] = { 'archivo' => File.basename(plantilla), 'caja_cm' => caja(d.bounds), 'hijos' => hijos(d.entities, 80) }
      rescue StandardError => err
        rep['plantilla'] = { 'error' => err.message }
      end
    end

    File.write(salida, JSON.pretty_generate(rep))
    UI.messagebox("Inspección lista: #{rep['modulos'].size} módulos.\n#{salida}\n\nEste modelo nuevo se puede cerrar sin guardar.")
  end
end
