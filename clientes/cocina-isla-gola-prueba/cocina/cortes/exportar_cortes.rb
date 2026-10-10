# Despiece del borrador aprobado con OpenCutList (solo lectura del modelo).
# Usa los presets que el usuario tiene guardados en OpenCutList (generación y exportación).
# Escribe en esta carpeta: presets-ocl.json, resumen.tsv, despiece.tsv, instancias.tsv
require 'json'
dir = File.dirname(__FILE__)
ocl = Ladb::OpenCutList
pl = ocl::PLUGIN
require File.join(ocl::PLUGIN_DIR, 'ruby', 'worker', 'cutlist', 'cutlist_export_worker') unless ocl.const_defined?(:CutlistExportWorker)
info = {
  'modelo' => Sketchup.active_model.path,
  'presets_export' => pl.list_global_preset_names('cutlist_export_options'),
  'presets_cutlist' => pl.list_global_preset_names('cutlist_options'),
}
gen_opts = pl.get_global_preset('cutlist_options') || {}
exp_opts = pl.get_global_preset('cutlist_export_options') || {}
info['cutlist_options'] = gen_opts
info['cutlist_export_options'] = exp_opts
File.write(File.join(dir, 'presets-ocl.json'), JSON.pretty_generate(info))

params = ocl::CutlistGenerateWorker.instance_method(:initialize).parameters.map { |_, n| n }
kw = gen_opts.each_with_object({}) { |(k, v), h| h[k.to_sym] = v if params.include?(k.to_sym) }
cutlist = ocl::CutlistGenerateWorker.new(**kw).run
cols = exp_opts['source_col_defs'] || []
{ 0 => 'resumen', 1 => 'despiece', 2 => 'instancias' }.each do |src, nombre|
  begin
    r = ocl::CutlistExportWorker.new(cutlist, source: src, format: 'pasteable', col_defs: cols[src.to_s] || cols[src] || []).run
  rescue StandardError => e
    File.write(File.join(dir, "#{nombre}-error.txt"), "#{e.class}: #{e.message}\n#{e.backtrace.first(8).join("\n")}")
    next
  end
  if r[:errors] && !r[:errors].empty?
    File.write(File.join(dir, "#{nombre}-error.txt"), r[:errors].inspect)
  else
    File.write(File.join(dir, "#{nombre}.tsv"), r[:pasteable].to_s)
  end
end
puts 'cortes ok'
