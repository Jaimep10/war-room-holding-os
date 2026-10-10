# Paso 1 del borrador de cocina-isla-gola-prueba: inspección de los módulos GOLA candidatos (solo lectura).
# Correr en la consola Ruby de SketchUp:
#   load '/Users/owner/war-room-holding-os/clientes/cocina-isla-gola-prueba/cocina/inspeccionar.rb'
# Abre un modelo nuevo; no toca el modelo que tengas abierto.
base = File.dirname(__FILE__)
load File.expand_path('../../../cuarto-diseno-muebles/scripts/inspeccionar_modulos.rb', base)
KsmartInspeccion.run(
  File.join(base, 'modulos'),
  File.join(base, 'modulos', 'inspeccion-modulos.json'),
  File.expand_path('~/Downloads/1.PRE_PROYECTO COCINA#1.skp')
)
