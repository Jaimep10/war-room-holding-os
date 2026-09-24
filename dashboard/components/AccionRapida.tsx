"use client";

import { useEffect, useState } from "react";
import { AgentSummary, AgentResponse, ClienteSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { Zap, Loader2, ChevronDown, ChevronUp } from "lucide-react";

// Acciones ABIERTAS -- son plantillas de instrucción (editable antes de enviar), no
// obligan a ningún agente en particular ni a un rubro de negocio fijo. El checkbox de
// agentes de abajo es independiente de la acción elegida.
//
// FIX cuello de botella (22-sep-2026): este componente ya NO depende de que haya una
// memoria/ideas/IDEA-ACTUAL.md activa -- manda contextoIndependiente:true a /api/chat, así
// que corre con SOLO la memoria del cliente elegido (ver ejecutar() más abajo), sin arrastrar
// de contrabando el contenido de otra idea/cliente que esté activa en ese momento en el
// puntero global. Ver app/api/chat/route.ts para el detalle completo.
const ACCIONES = [
  {
    key: "/web",
    label: "🌐 /web — Página web",
    plantilla:
      "Necesito una propuesta de página web para este cliente: estructura de páginas, plugins necesarios, copy de las secciones principales y una descripción del mockup visual. Basate en la memoria del cliente de arriba -- si falta logo, colores corporativos o fotos reales, decilo en vez de inventarlos.",
  },
  {
    key: "/tech",
    label: "🛠️ /tech — Sistema / Tecnología",
    plantilla:
      "Necesito una recomendación técnica/de sistemas para este cliente: qué construir o mejorar primero, con qué stack, y por qué -- priorizado por impacto real según la memoria del cliente de arriba.",
  },
  {
    key: "/seo",
    label: "🔍 /seo — SEO / Contenido",
    plantilla:
      "Necesito un plan de SEO/contenido para este cliente: palabras clave prioritarias, 3 a 5 ideas de contenido concretas, y qué mejorar primero en su presencia online -- basado en la memoria del cliente de arriba.",
  },
  {
    key: "/informe-economico",
    label: "📊 /informe-economico — Informe económico",
    plantilla:
      "Necesito un informe económico corto de este cliente: principales fugas de dinero, palancas de mejora priorizadas por impacto, y un plan de 90 días -- basado en la memoria del cliente de arriba.",
  },
];

// Default pedido explícitamente: tecnico-constructor + tecnologia -- pero es solo el
// default inicial, el usuario puede des-marcarlos y elegir cualquier otro par de los 22.
const AGENTES_DEFAULT = ["agente-tecnico-constructor", "agente-tecnologia"];
const MAX_AGENTES = 2;

export default function AccionRapida({
  agents,
  clienteActivoSlug,
  onClienteChange,
}: {
  agents: AgentSummary[];
  /** Cliente ya elegido en el sidebar (si hay uno) -- Acción Rápida arranca sincronizada con eso. */
  clienteActivoSlug?: string | null;
  onClienteChange?: (slug: string) => void;
}) {
  const [expandido, setExpandido] = useState(true);
  const [clientes, setClientes] = useState<ClienteSummary[]>([]);
  const [clienteSlug, setClienteSlug] = useState<string>(clienteActivoSlug || "");
  const [accionKey, setAccionKey] = useState<string>(ACCIONES[0].key);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(() => {
    const defaults = AGENTES_DEFAULT.filter((slug) => agents.some((a) => a.slug === slug));
    if (defaults.length) return defaults;
    return agents.slice(0, MAX_AGENTES).map((a) => a.slug);
  });
  const [orden, setOrden] = useState<string>(ACCIONES[0].plantilla);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<AgentResponse[]>([]);

  useEffect(() => {
    fetch("/api/clientes")
      .then((r) => r.json())
      .then((data) => {
        const lista: ClienteSummary[] = data.clientes ?? [];
        setClientes(lista);
        // Si no hay cliente sincronizado desde el sidebar, arrancar con el primero real
        // (orden alfabético de listClientes()) -- nunca un nombre de cliente hardcodeado.
        if (!clienteSlug && lista.length) setClienteSlug(lista[0].slug);
      })
      .catch(() => setClientes([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (clienteActivoSlug && clienteActivoSlug !== clienteSlug) setClienteSlug(clienteActivoSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteActivoSlug]);

  function handleAccionChange(key: string) {
    setAccionKey(key);
    const accion = ACCIONES.find((a) => a.key === key);
    if (accion) setOrden(accion.plantilla);
  }

  function toggleAgente(slug: string) {
    setSelectedAgents((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_AGENTES) return prev; // tope de 2, ignora el click si ya hay 2
      return [...prev, slug];
    });
  }

  async function ejecutar() {
    setError(null);
    setResultados([]);

    if (!clienteSlug) {
      setError("Elegí un cliente primero -- la lista sale de las carpetas reales en clientes/.");
      return;
    }
    if (!selectedAgents.length) {
      setError("Elegí al menos 1 agente (máximo 2).");
      return;
    }

    setLoading(true);
    try {
      const readmeRes = await fetch(
        `/api/clientes/file?slug=${encodeURIComponent(clienteSlug)}&file=README.md`
      );
      if (!readmeRes.ok) {
        setError(
          `No encontré clientes/${clienteSlug}/README.md -- creá ese archivo con la info real del cliente antes de lanzar Acción Rápida sobre él.`
        );
        setLoading(false);
        return;
      }
      const readme = await readmeRes.text();
      const accion = ACCIONES.find((a) => a.key === accionKey);

      const message = [
        `## MEMORIA DEL CLIENTE (clientes/${clienteSlug}/README.md)`,
        readme,
        "---",
        `### Acción rápida: ${accion?.label ?? accionKey}`,
        orden || accion?.plantilla || "",
      ].join("\n\n");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // contextoIndependiente: true -- ver comentario en app/api/chat/route.ts. Acción Rápida
        // ya arma su propio contexto completo (el README del cliente elegido, arriba); no
        // depende de memoria/ideas/IDEA-ACTUAL.md ni se le mezcla el contenido de otra
        // idea/cliente que casualmente esté activa en ese momento.
        body: JSON.stringify({ agentSlugs: selectedAgents, message, contextoIndependiente: true }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResultados(data.results ?? []);
      }
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-accent-500/30 bg-base-900/60 p-3 shrink-0">
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-400">
          <Zap size={14} /> Acción Rápida — máximo 2 agentes
        </div>
        {expandido ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>

      {expandido && (
        <div className="mt-2.5 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wide text-gray-500 mb-1 block">Cliente</label>
              <select
                value={clienteSlug}
                onChange={(e) => {
                  setClienteSlug(e.target.value);
                  onClienteChange?.(e.target.value);
                }}
                className="w-full bg-base-800 border border-base-600 text-xs text-gray-100 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
              >
                {clientes.length === 0 && <option value="">Sin clientes en clientes/</option>}
                {clientes.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide text-gray-500 mb-1 block">Acción</label>
              <select
                value={accionKey}
                onChange={(e) => handleAccionChange(e.target.value)}
                className="w-full bg-base-800 border border-base-600 text-xs text-gray-100 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
              >
                {ACCIONES.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wide text-gray-500 mb-1 block">
              Agentes ({selectedAgents.length}/{MAX_AGENTES})
            </label>
            <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto border border-base-700 rounded-md p-1.5 bg-base-900">
              {agents.map((a) => {
                const checked = selectedAgents.includes(a.slug);
                const disabled = !checked && selectedAgents.length >= MAX_AGENTES;
                return (
                  <label
                    key={a.slug}
                    className={`flex items-center gap-1 text-[10px] px-1 py-0.5 rounded ${
                      disabled ? "text-gray-600 cursor-not-allowed" : "text-gray-300 cursor-pointer"
                    }`}
                  >
                    <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => toggleAgente(a.slug)} />
                    <span className="truncate">{a.slug}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <Textarea
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            placeholder="La orden que le vas a dar a los agentes..."
            rows={3}
            className="text-xs"
          />

          {error && (
            <div className="text-[11px] text-red-300 border border-red-600/30 bg-red-500/10 rounded-md px-2 py-1.5">
              {error}
            </div>
          )}

          <Button onClick={ejecutar} disabled={loading} className="w-full">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {loading ? "Ejecutando..." : "EJECUTAR"}
          </Button>

          {resultados.length > 0 && (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {resultados.map((r, i) => (
                <div key={i} className="rounded-md border border-base-700 bg-base-850 p-2">
                  <Badge className={r.ok ? "bg-accent-500/20 text-accent-400 mb-1" : "bg-red-500/20 text-red-400 mb-1"}>
                    {r.agent}
                  </Badge>
                  {r.ok ? (
                    <div className="markdown-body text-[11px] text-gray-300">
                      <ReactMarkdown>{r.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-[11px] text-red-300">{r.text}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
