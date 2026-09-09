"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Loader2, AlertTriangle, Zap, CalendarClock } from "lucide-react";
import type { NegocioDiagnostico } from "@/app/api/negocio/route";

const GIROS = ["Restaurante", "Clínica", "Importadora", "Servicios", "Retail", "SaaS / Tech", "Otro"];
const DOLORES = [
  "No queda utilidad",
  "Dependo de 1 proveedor",
  "Ventas inestables",
  "Robos/mermas",
  "No puedo escalar",
];

export default function NegocioExistenteMode({ onGenerated }: { onGenerated: () => void }) {
  const [nombre, setNombre] = useState("");
  const [giro, setGiro] = useState(GIROS[0]);
  const [facturacion, setFacturacion] = useState(10000);
  const [margen, setMargen] = useState(15);
  const [empleados, setEmpleados] = useState(5);
  const [dolor, setDolor] = useState(DOLORES[0]);
  const [loading, setLoading] = useState(false);
  const [diagnostico, setDiagnostico] = useState<NegocioDiagnostico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleSubmit() {
    if (!nombre.trim()) return;
    setLoading(true);
    setError(null);
    setWarning(null);
    setDiagnostico(null);
    try {
      const res = await fetch("/api/negocio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, giro, facturacion, margen, empleados, dolor }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setDiagnostico(data.diagnostico);
        setWarning(data.warning ?? null);
        onGenerated();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="col-span-1 flex flex-col rounded-xl border border-base-700 bg-base-900/60 p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-200 mb-1">Mejorar Negocio Existente</h2>
        <p className="text-xs text-gray-500 mb-3">
          7 agentes (Operaciones, Compras, Finanzas, Talento, Cliente, Producto, Legal) diagnostican fugas y palancas.
        </p>

        <label className="text-[11px] text-gray-400 mb-1">Nombre del negocio</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="mb-3 bg-base-900 border border-base-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        />

        <label className="text-[11px] text-gray-400 mb-1">Giro</label>
        <select
          value={giro}
          onChange={(e) => setGiro(e.target.value)}
          className="mb-3 bg-base-900 border border-base-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        >
          {GIROS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        <label className="text-[11px] text-gray-400 mb-1">Facturación mensual actual (USD)</label>
        <input
          type="number"
          value={facturacion}
          onChange={(e) => setFacturacion(Number(e.target.value))}
          className="mb-3 bg-base-900 border border-base-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        />

        <label className="text-[11px] text-gray-400 mb-1">Margen actual (%)</label>
        <input
          type="number"
          value={margen}
          onChange={(e) => setMargen(Number(e.target.value))}
          className="mb-3 bg-base-900 border border-base-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        />

        <label className="text-[11px] text-gray-400 mb-1"># Empleados</label>
        <input
          type="number"
          value={empleados}
          onChange={(e) => setEmpleados(Number(e.target.value))}
          className="mb-3 bg-base-900 border border-base-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        />

        <label className="text-[11px] text-gray-400 mb-1">Principal dolor</label>
        <select
          value={dolor}
          onChange={(e) => setDolor(e.target.value)}
          className="mb-4 bg-base-900 border border-base-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        >
          {DOLORES.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <Button onClick={handleSubmit} disabled={loading || !nombre.trim()} className="w-full">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
          {loading ? "Diagnosticando..." : "Diagnosticar con el Equipo"}
        </Button>

        {error && <div className="mt-3 text-[11px] text-red-300 border border-red-600/30 bg-red-500/10 rounded-lg p-2">{error}</div>}
        {warning && <div className="mt-3 text-[11px] text-yellow-300 border border-yellow-600/30 bg-yellow-500/10 rounded-lg p-2">{warning}</div>}
      </div>

      <div className="col-span-2 rounded-xl border border-base-700 bg-base-900/60 p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-200 mb-3">Dashboard de Mejora</h2>
        {!diagnostico && !loading && (
          <div className="text-xs text-gray-600 text-center mt-10">
            Completa el formulario y pide al equipo el diagnóstico de fugas y palancas.
          </div>
        )}
        {loading && (
          <div className="text-xs text-gray-500 text-center mt-10 flex flex-col items-center gap-2">
            <Loader2 size={20} className="animate-spin" />
            7 agentes están diagnosticando el negocio...
          </div>
        )}
        {diagnostico && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-red-600/30 bg-red-500/5 p-3">
              <div className="flex items-center gap-1.5 text-red-300 text-xs font-semibold mb-2">
                <AlertTriangle size={13} /> Fugas
              </div>
              <div className="space-y-2">
                {diagnostico.fugas?.map((f, i) => (
                  <div key={i} className="text-[11px] text-gray-300 border-b border-base-700 pb-1.5 last:border-0">
                    <div className="font-medium text-gray-100">{f.area}</div>
                    <div className="text-gray-400">{f.detalle}</div>
                    <div className="text-red-300 mt-0.5">{f.impacto_mensual_estimado}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-accent-500/30 bg-accent-500/5 p-3">
              <div className="flex items-center gap-1.5 text-accent-400 text-xs font-semibold mb-2">
                <Zap size={13} /> Palancas
              </div>
              <div className="space-y-2">
                {diagnostico.palancas?.map((p, i) => (
                  <div key={i} className="text-[11px] text-gray-300 border-b border-base-700 pb-1.5 last:border-0">
                    <div className="font-medium text-gray-100">{p.accion}</div>
                    <div className="text-gray-400">{p.detalle}</div>
                    <div className="text-accent-400 mt-0.5">{p.impacto_estimado}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-green-600/30 bg-green-500/5 p-3">
              <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold mb-2">
                <CalendarClock size={13} /> Plan 90 Días
              </div>
              <div className="space-y-2">
                {diagnostico.plan_90_dias?.map((f, i) => (
                  <div key={i} className="text-[11px] text-gray-300 border-b border-base-700 pb-1.5 last:border-0">
                    <div className="font-medium text-gray-100">{f.fase}</div>
                    <ul className="list-disc ml-3.5 text-gray-400">
                      {f.tareas?.map((t, j) => (
                        <li key={j}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
