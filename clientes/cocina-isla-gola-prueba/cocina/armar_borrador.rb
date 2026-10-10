# Paso 2 del borrador de cocina-isla-gola-prueba: arma el .skp con los módulos KSmart GOLA.
# Correr en la consola Ruby de SketchUp:
#   load '/Users/owner/war-room-holding-os/clientes/cocina-isla-gola-prueba/cocina/armar_borrador.rb'
# Abre una copia de la plantilla como documento nuevo; no toca el modelo abierto.
base = File.dirname(__FILE__)
load File.expand_path('../../../cuarto-diseno-muebles/scripts/armar_borrador.rb', base)
frente = { 'frente' => '-y' } # medido en la inspección GOLA (10-oct-2026)
KsmartBorrador.run(
  'plan' => File.expand_path('../outputs/muebles/plan-espacial.json', base),
  'plantilla' => File.expand_path('~/Downloads/1.PRE_PROYECTO COCINA#1.skp'),
  'modulos_dir' => File.join(base, 'modulos'),
  'salida' => File.join(base, 'cocina-isla-gola-prueba-cocina-v2.skp'),
  'log' => File.join(base, 'borrador-log.json'),
  'orientacion' => %w[
    CB.3G.GLM.60.K.2C.skp CB.PGL.40.1K.skp CBR.PGL.80.2PBM.skp
    CLMH.PGL.60.1K.PBIM.skp CAR.FP.60.2PBM.skp
  ].to_h { |a| [a, frente] },
  'altura_altos_cm' => 143
)
