# Cuántas planchas Novopan BLANCO 15 2C (2440 x 2130) hacen falta para todas las piezas
# de tablero BLANCO + MADERADO, acomodadas juntas con el motor 2D de OpenCutList.
# Parámetros de corte = valores por defecto de OpenCutList (sierra 3 mm, refilado 10 mm).
# Solo lectura del modelo. Escribe planchas.json en esta carpeta.
require 'json'
dir = File.dirname(__FILE__)
ocl = Ladb::OpenCutList
require File.join(ocl::PLUGIN_DIR, 'ruby', 'worker', 'cutlist', 'cutlist_cuttingdiagram2d_worker') unless ocl.const_defined?(:CutlistCuttingdiagram2dWorker)
bp = ocl::BinPacking2D
materiales = %w[BLANCO MADERADO]
gen = ocl::PLUGIN.get_global_preset('cutlist_options') || {}
params = ocl::CutlistGenerateWorker.instance_method(:initialize).parameters.map { |_, n| n }
cutlist = ocl::CutlistGenerateWorker.new(**gen.each_with_object({}) { |(k, v), h| h[k.to_sym] = v if params.include?(k.to_sym) }).run

o = bp::Options.new
o.set_base_length('2440mm'.to_l.to_f)
o.set_base_width('2130mm'.to_l.to_f)
o.set_rotatable(true)
o.set_saw_kerf('3mm'.to_l.to_f)
o.set_trimsize('10mm'.to_l.to_f)
o.set_optimization(bp::OPT_MEDIUM)
o.set_stacking_pref(bp::STACKING_ALL)
o.set_keep('100mm'.to_l.to_f, '100mm'.to_l.to_f)
eng = bp::PackEngine.new(o)
usadas = []
n = 0
cutlist.groups.each do |g|
  next unless materiales.include?(g.material_name.to_s)
  usadas << "#{g.material_name} #{g.std_thickness}"
  hojas = g.parts.flat_map { |p| p.instance_of?(ocl::FolderPart) ? p.children : [p] }
  hojas.each do |p|
    p.count.times { eng.add_box(p.cutting_length.to_l.to_f, p.cutting_width.to_l.to_f, true, p.number, p); n += 1 }
  end
end
eng.start
eng.run until eng.done? || eng.errors?
res, err = eng.finish
out = { 'grupos' => usadas, 'piezas' => n, 'plancha' => '2440 x 2130 mm', 'sierra' => '3 mm', 'refilado' => '10 mm', 'error' => err }
if res
  out['planchas'] = res.packed_bins.size
  out['sin_colocar'] = res.unplaced_boxes.size
  out['eficiencia'] = res.overall_efficiency
end
File.write(File.join(dir, 'planchas.json'), JSON.pretty_generate(out))
puts "planchas: #{out['planchas'].inspect}"
