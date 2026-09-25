"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Ruler, LayoutGrid, Boxes, Receipt, Box, Scissors, Image as ImageIcon, FileText } from "lucide-react";
import type { ProyectoMueble, ProyectoFisico, EtapaKey } from "@/lib/proyectos";
import PanelEjecucion from "@/components/PanelEjecucion";

interface ConfigKsmart {
  existe: boolean;
  ruta: string | null;
  confirmada: boolean;
}

const ETAPAS: { key: EtapaKey; label: string; agente: string; icon: React.ReactNode }[] = [
  { key: "interpretePlanos", label: "Plano interpretado", agente: "agente-interprete-planos", icon: <Ruler size={16} /> },
  { key: "arquitectoEspacio", label: "Espacio definido", agente: "agente-arquitecto-espacio", icon: <LayoutGrid size={16} /> },
  { key: "ksmartEjecutor", label: "Ensamble KSmart", agente: "agente-ksmart-ejecutor", icon: <Boxes size={16} /> },
  { key: "presupuesto", label: "Presupuesto", agente: "agente-presupuesto-mueble", icon: <Receipt size={16} /> },
];

function EstadoDot({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 size={14} className="text-stage-done" />
  ) : (
    <Circle size={14} className="text-gray-600" />
  );
}

function EntregableFisico({ p }: { p: ProyectoFisico }) {
  const partes: { ok: boolean; label: string; icon: React.ReactNode }[] = [
    { ok: p.tieneSkp, label: ".skp", icon: <Box size={13} /> },
    { ok: p.tieneCortes, label: "cortes/ (OpenCutList)", icon: <Scissors size={13} /> },
    { ok: p.tieneRenders, label: "renders/", icon: <ImageIcon size={13} /> },
    { ok: p.tienePlanos, label: "planos/", icon: <FileText size={13} /> },
  ];
  return (
    <div
      className={`rounded-md border px-3 py-2 text-xs ${
        p.entregableCompleto
          ? "border-stage-done/40 bg-stage-done/10"
          : "border-wood-500/30 bg-base-850"
      }`}
    >
      <p className="mb-2 font-medium text-wood-400">
        Proyecto físico: <code>{p.tipoProyecto}/</code>
        {p.entregableCompleto && <span className="ml-2 text-stage-done">completo</span>}
      </p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {partes.map((parte) => (
          <div key={parte.label} className="flex items-center gap-1.5 text-gray-400">
            <EstadoDot ok={parte.ok} />
            <span className="flex items-center gap-1">
              {parte.icon}
              {parte.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CuartoDiseno() {
  const [proyectos, setProyectos] = useState<ProyectoMueble[] | null>(null);
  const [config, setConfig] = useState<ConfigKsmart | null>(null);

  useEffect(() => {
    fetch("/api/proyectos")
      .then((r) => r.json())
      .then((d) => setProyectos(d.proyectos))
      .catch(() => setProyectos([]));
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setConfig(d))
      .catch(() => setConfig(null));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-wood-400">Producto separado del War Room</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Cuarto de Diseño de Muebles</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-400">
          Cocinas, closets y modular en general, sobre SketchUp + KSmart + OpenCutList. Cada
          proyecto pasa por 4 etapas técnicas coordinadas por{" "}
          <code className="text-wood-400">agente-director-cuarto-muebles</code>, y termina en un
          entregable físico de 4 partes (.skp, cortes, renders, planos) — este dashboard no
          comparte código ni agentes con el War Room, solo la carpeta de memoria de cliente
          (<code>clientes/[cliente]/</code>).
        </p>
      </header>

      {config && (
        <div
          className={`mb-8 rounded-lg border px-4 py-3 text-sm ${
            config.confirmada
              ? "border-stage-done/40 bg-stage-done/10 text-stage-done"
              : "border-stage-active/40 bg-stage-active/10 text-stage-active"
          }`}
        >
          {config.existe ? (
            <>
              Carpeta local de módulos KSmart: <code>{config.ruta}</code>{" "}
              {config.confirmada ? "(confirmada)" : "(provisional — pendiente de confirmar la ruta definitiva)"}
            </>
          ) : (
            "No se encontró config/ksmart.md — agente-ksmart-ejecutor no puede operar sin esto."
          )}
        </div>
      )}

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500">
          Proyectos por cliente
        </h2>

        {proyectos === null && <p className="text-sm text-gray-500">Cargando…</p>}
        {proyectos !== null && proyectos.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay clientes todavía en <code>clientes/</code>. Un proyecto de este cuarto arranca
            igual que cualquier otro cliente de la agencia: con su carpeta y su brief.
          </p>
        )}

        <div className="space-y-3">
          {proyectos?.map((p) => (
            <div
              key={p.cliente}
              className="rounded-lg border border-base-700 bg-base-900 px-4 py-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-white">{p.cliente}</h3>
                {!p.tieneProyectoMuebles && p.proyectosFisicos.length === 0 && (
                  <span className="rounded-full bg-base-700 px-2 py-0.5 text-xs text-gray-400">
                    Sin proyecto de muebles todavía
                  </span>
                )}
              </div>

              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
                {ETAPAS.map((etapa) => {
                  const hecho = p.etapas[etapa.key];
                  return (
                    <div
                      key={etapa.key}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${
                        hecho
                          ? "border-stage-done/40 bg-stage-done/10 text-stage-done"
                          : "border-base-700 bg-base-850 text-gray-500"
                      }`}
                      title={etapa.agente}
                    >
                      <EstadoDot ok={hecho} />
                      <span className="flex items-center gap-1">
                        {etapa.icon}
                        {etapa.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {p.proyectosFisicos.length > 0 && (
                <div className="mb-3 space-y-2">
                  {p.proyectosFisicos.map((pf) => (
                    <EntregableFisico key={pf.tipoProyecto} p={pf} />
                  ))}
                </div>
              )}

              <PanelEjecucion
                cliente={p.cliente}
                tipoProyectoInicial={p.proyectosFisicos[0]?.tipoProyecto ?? "cocina"}
              />
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-base-800 pt-4 text-xs text-gray-600">
        <p className="mb-1">
          MVP sin automatización de SketchUp ni API de KSmart: los botones de arriba NO ejecutan
          ningún agente por sí solos — escriben la solicitud en{" "}
          <code>clientes/[cliente]/[tipo-proyecto]/ejecucion.json</code>. Es{" "}
          <code>agente-director-cuarto-muebles</code> quien la lee al ser invocado (por vos o por el
          equipo) y hace el trabajo real; este dashboard es un tablero de solicitud/estado, no un
          motor de ejecución en segundo plano.
        </p>
        <p>
          Estado real de los archivos en disco: resumen intermedio en{" "}
          <code>clientes/[cliente]/outputs/muebles/</code>, entregable físico en{" "}
          <code>clientes/[cliente]/[tipo-proyecto]/</code>.
        </p>
      </footer>
    </main>
  );
}
