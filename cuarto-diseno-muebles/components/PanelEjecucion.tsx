"use client";

import { useEffect, useState } from "react";
import type { EstadoEjecucion, Parte } from "@/lib/ejecucion";

const PARTES: { key: Parte; label: string }[] = [
  { key: "cortes", label: "Cortes" },
  { key: "presupuesto", label: "Presupuesto" },
  { key: "renders", label: "Renders" },
  { key: "planos", label: "Planos" },
];

function labelEstado(e: EstadoEjecucion["estado"]): string {
  switch (e) {
    case "sin_solicitar":
      return "Sin solicitar todavía";
    case "borrador_solicitado":
      return "Borrador solicitado — en progreso";
    case "borrador_listo_pendiente_aprobacion":
      return "BORRADOR_LISTO — pendiente de tu aprobación";
    case "aprobado":
      return "Borrador aprobado — listo para completar";
    case "completo_solicitado":
      return "Entregable completo solicitado — en progreso";
    case "completo":
      return "Entregable completo";
  }
}

export default function PanelEjecucion({ cliente, tipoProyectoInicial }: { cliente: string; tipoProyectoInicial: string }) {
  const [tipoProyecto, setTipoProyecto] = useState(tipoProyectoInicial);
  const [estado, setEstado] = useState<EstadoEjecucion | null>(null);
  const [cargando, setCargando] = useState(false);

  async function cargar(tp: string) {
    if (!tp) return;
    setCargando(true);
    try {
      const r = await fetch(`/api/ejecucion?cliente=${encodeURIComponent(cliente)}&tipoProyecto=${encodeURIComponent(tp)}`);
      setEstado(await r.json());
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (tipoProyecto) cargar(tipoProyecto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function accionar(accion: string, extra?: object) {
    if (!tipoProyecto) return;
    setCargando(true);
    try {
      const r = await fetch("/api/ejecucion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cliente, tipoProyecto, accion, ...extra }),
      });
      setEstado(await r.json());
    } finally {
      setCargando(false);
    }
  }

  function toggleParte(key: Parte) {
    if (!estado) return;
    const nuevoValor = !estado.partesSolicitadas[key];
    // Optimista: reflejamos el cambio ya mismo en la UI
    setEstado({ ...estado, partesSolicitadas: { ...estado.partesSolicitadas, [key]: nuevoValor } });
    accionar("actualizar-partes", { partes: { [key]: nuevoValor } });
  }

  const pendienteAprobacion = estado?.estado === "borrador_listo_pendiente_aprobacion";
  const ningunaParteTildada = estado ? !Object.values(estado.partesSolicitadas).some(Boolean) : true;

  return (
    <div className="rounded-md border border-base-700 bg-base-850 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label className="text-xs text-gray-500">Proyecto (carpeta):</label>
        <input
          value={tipoProyecto}
          onChange={(e) => setTipoProyecto(e.target.value)}
          onBlur={() => cargar(tipoProyecto)}
          placeholder="ej. cocina"
          className="rounded border border-base-600 bg-base-900 px-2 py-1 text-xs text-gray-200 outline-none focus:border-wood-500"
        />
        {cargando && <span className="text-xs text-gray-600">actualizando…</span>}
      </div>

      {estado && (
        <>
          <p className="mb-2 text-xs text-gray-400">
            Estado: <span className="font-medium text-wood-400">{labelEstado(estado.estado)}</span>
          </p>

          <p className="mb-1 text-xs text-gray-500">
            Partes a incluir en <strong>Ejecutar Completo</strong> (ignoradas por <strong>Ejecutar Borrador</strong>, que siempre es solo el <code>.skp</code>):
          </p>
          <div className="mb-3 flex flex-wrap gap-3">
            {PARTES.map((p) => (
              <label key={p.key} className="flex items-center gap-1.5 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={estado.partesSolicitadas[p.key]}
                  onChange={() => toggleParte(p.key)}
                  className="accent-wood-500"
                />
                {p.label}
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => accionar("solicitar-borrador")}
              disabled={cargando || !tipoProyecto}
              className="rounded-md border border-wood-500/50 bg-wood-500/10 px-3 py-1.5 text-xs font-medium text-wood-400 hover:bg-wood-500/20 disabled:opacity-50"
            >
              Ejecutar Borrador
            </button>
            <button
              onClick={() => accionar("solicitar-completo")}
              disabled={cargando || !tipoProyecto || ningunaParteTildada}
              title={ningunaParteTildada ? "Tildá al menos una parte (Cortes/Presupuesto/Renders/Planos) antes de ejecutar" : undefined}
              className="rounded-md border border-stage-active/50 bg-stage-active/10 px-3 py-1.5 text-xs font-medium text-stage-active hover:bg-stage-active/20 disabled:opacity-50"
            >
              Ejecutar Completo
            </button>
            {ningunaParteTildada && (
              <span className="text-xs text-gray-600">tildá al menos una parte para habilitar</span>
            )}
          </div>

          {pendienteAprobacion && (
            <div className="mt-3 rounded-md border border-stage-active/50 bg-stage-active/10 p-3">
              <p className="mb-2 text-xs font-medium text-stage-active">
                BORRADOR_LISTO: ¿Apruebas para entregables?
              </p>
              <button
                onClick={() => accionar("aprobar")}
                disabled={cargando}
                className="rounded-md border border-stage-done/50 bg-stage-done/10 px-3 py-1.5 text-xs font-medium text-stage-done hover:bg-stage-done/20 disabled:opacity-50"
              >
                Sí, apruebo — continuar al entregable completo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
