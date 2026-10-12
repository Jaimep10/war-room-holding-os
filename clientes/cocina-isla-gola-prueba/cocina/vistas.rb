# Exporta 2 vistas del borrador (iso y planta) a outputs/muebles/. Solo cámara, no edita el modelo.
base = File.dirname(__FILE__)
out = File.expand_path('../outputs/muebles', base)
m = Sketchup.active_model
v = m.active_view
tumbado = m.layers['ARQ tumbado']
tumbado.visible = false if tumbado
c = Geom::Point3d.new(180 / 2.54, -200 / 2.54, 80 / 2.54)
v.camera = Sketchup::Camera.new(Geom::Point3d.new(-120 / 2.54, -620 / 2.54, 380 / 2.54), c, Z_AXIS)
v.write_image(File.join(out, 'borrador-iso-v3.png'), 1600, 1000, true)
top = Sketchup::Camera.new(Geom::Point3d.new(180 / 2.54, -210 / 2.54, 1200 / 2.54), Geom::Point3d.new(180 / 2.54, -210 / 2.54, 0), Y_AXIS)
v.camera = top
v.write_image(File.join(out, 'borrador-planta-v3.png'), 1600, 1600, true)
v.camera = Sketchup::Camera.new(Geom::Point3d.new(-120 / 2.54, -620 / 2.54, 380 / 2.54), c, Z_AXIS)
tumbado.visible = true if tumbado
puts 'vistas ok'
