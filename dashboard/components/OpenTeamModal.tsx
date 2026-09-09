"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function OpenTeamModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Prueba de Equipo Abierto — mismo agente, dos rubros distintos">
        <p className="text-xs text-gray-400 mb-4">
          El <strong className="text-gray-200">mismo Agente Pesimista</strong>, con el mismo framework (Taleb + Porter), leyendo dos
          archivos de idea distintos vía <code className="text-gray-300">memoria/ideas/IDEA-ACTUAL.md</code>. Ningún dato de un rubro
          se filtra al otro — así se demuestra <code className="text-gray-300">memoria/PRINCIPIOS-DEL-EQUIPO.md</code> en la práctica.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-base-600 bg-base-850 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-accent-400">IDEA-1-pisos-conductivos.md</span>
              <Badge>Salud / Materiales</Badge>
            </div>
            <div className="text-sm font-medium text-gray-100 mb-2">
              Pisos Hospitalarios de Vinilo Conductivo — Ecuador
            </div>
            <div className="text-[11px] text-gray-300 space-y-1.5">
              <div>
                <span className="text-gray-500">Score: </span>
                <span className="font-semibold text-gray-100">5/10</span> ·{" "}
                <span className="text-gray-500">Riesgo: </span>
                <span className="font-semibold text-yellow-400">Medio-Alto</span> ·{" "}
                <span className="text-gray-500">Confianza: </span>
                <span className="font-semibold text-gray-100">65%</span>
              </div>
              <div>
                <span className="text-gray-500">Punto único de fallo: </span>
                barco desde China con 90 días de reposición.
              </div>
              <div className="text-gray-500 italic">Falta validar: vida útil real del material y capacidad de cuadrillas.</div>
            </div>
          </div>

          <div className="rounded-lg border border-base-600 bg-base-850 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-accent-400">IDEA-2-restaurante-poke-urdesa.md</span>
              <Badge>Food / Restaurante</Badge>
            </div>
            <div className="text-sm font-medium text-gray-100 mb-2">
              Restaurante de Poke Saludable — Urdesa, Guayaquil
            </div>
            <div className="text-[11px] text-gray-300 space-y-1.5">
              <div>
                <span className="text-gray-500">Score: </span>
                <span className="font-semibold text-gray-100">6.5/10</span> ·{" "}
                <span className="text-gray-500">Riesgo: </span>
                <span className="font-semibold text-yellow-400">Medio</span> ·{" "}
                <span className="text-gray-500">Confianza: </span>
                <span className="font-semibold text-gray-100">70%</span>
              </div>
              <div>
                <span className="text-gray-500">Punto único de fallo: </span>
                100% del salmón viene de 1 proveedor en Manta + 80% de la venta depende de Rappi (30% comisión).
              </div>
              <div className="text-gray-500 italic">Ningún dato de "pisos" o "China" aparece aquí — el agente es el mismo, el rubro no.</div>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-gray-600 mt-4">
          Estos dos dictámenes están precargados como demostración estática. Con{" "}
          <code className="text-gray-400">ANTHROPIC_API_KEY</code> configurada, el mismo resultado se genera en vivo desde el panel
          de Chat Equipo.
        </p>
      </DialogContent>
    </Dialog>
  );
}
