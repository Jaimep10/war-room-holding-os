"use client";

import { useEffect, useState } from "react";
import { ClienteSummary } from "@/lib/types";
import { Building2, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Sidebar de clientes (20% del layout, colapsable) -- lee /api/clientes, que a su vez lee
 * carpetas reales dentro de clientes/ (lib/clientesProductos.ts). Nunca hardcodea un nombre
 * de cliente: si clientes/ está vacío, dice "sin clientes" y no inventa nada (REGLA MAESTRA
 * -- agencia abierta, nunca un solo cliente hardcodeado).
 */
export default function ClientesSidebar({
  clienteActivoSlug,
  onSelectCliente,
}: {
  clienteActivoSlug: string | null;
  onSelectCliente: (slug: string) => void;
}) {
  const [colapsado, setColapsado] = useState(false);
  const [clientes, setClientes] = useState<ClienteSummary[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/clientes")
      .then((r) => r.json())
      .then((data) => setClientes(data.clientes ?? []))
      .finally(() => setCargando(false));
  }, []);

  if (colapsado) {
    return (
      <div className="w-12 shrink-0 flex flex-col items-center rounded-xl border border-base-700 bg-base-900/60 py-3">
        <button
          type="button"
          onClick={() => setColapsado(false)}
          title="Mostrar clientes"
          className="text-gray-400 hover:text-accent-400 p-1.5 rounded-md hover:bg-base-800"
        >
          <ChevronRight size={16} />
        </button>
        <Building2 size={16} className="text-gray-600 mt-3" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[240px] shrink-0 flex flex-col rounded-xl border border-base-700 bg-base-900/60 p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
          <Building2 size={14} /> Clientes
        </div>
        <button
          type="button"
          onClick={() => setColapsado(true)}
          title="Colapsar"
          className="text-gray-500 hover:text-gray-300 p-1 rounded-md hover:bg-base-800"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {cargando && <div className="text-[11px] text-gray-600">Cargando...</div>}
        {!cargando && clientes.length === 0 && (
          <div className="text-[11px] text-gray-600">
            Sin clientes en <code className="text-gray-500">clientes/</code> todavía.
          </div>
        )}
        {clientes.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => onSelectCliente(c.slug)}
            className={`w-full text-left rounded-md px-2 py-1.5 text-[11px] transition-colors ${
              clienteActivoSlug === c.slug
                ? "bg-accent-500/20 text-accent-300 border border-accent-500/40"
                : "text-gray-300 hover:bg-base-800 border border-transparent"
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="truncate">{c.nombre}</span>
              {c.modoAbierto && <ShieldCheck size={11} className="text-accent-400 shrink-0" />}
            </div>
            <div className="text-[9px] text-gray-600 truncate">clientes/{c.slug}/</div>
          </button>
        ))}
      </div>

      {!cargando && (
        <Badge className="mt-2 bg-base-800 text-gray-500 self-start">{clientes.length} cliente(s)</Badge>
      )}
    </div>
  );
}
