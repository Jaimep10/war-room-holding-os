# Solo lectura: lista qué clases expone OpenCutList para generar/exportar el despiece.
out = File.join(File.dirname(__FILE__), 'sondeo-ocl.txt')
l = []
l << "OCL definido: #{defined?(Ladb::OpenCutList) ? 'si' : 'no'}"
if defined?(Ladb::OpenCutList)
  m = Ladb::OpenCutList
  l << "VERSION: #{m.const_defined?(:EXTENSION_VERSION) ? m::EXTENSION_VERSION : '?'}"
  l += m.constants.sort.map { |c| c.to_s }.grep(/Cutlist|Worker|Export|Api|Plugin/i)
  [:CutlistGenerateWorker, :CutlistExportWorker].each do |k|
    next unless m.const_defined?(k)
    c = m.const_get(k)
    l << "#{k}#initialize params: #{c.instance_method(:initialize).parameters.inspect}"
    src = c.instance_method(:initialize).source_location
    l << "  fuente: #{src.inspect}"
  end
end
File.write(out, l.join("\n"))
puts l.first(5)
