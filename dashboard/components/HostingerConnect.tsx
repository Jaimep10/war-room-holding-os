"use client";

import { useState } from "react";
import { Server, Globe2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HostingerStatus {
  valido: boolean;
  error?: string;
  websites?: any[];
  websitesError?: string;
  virtualMachines?: any[];
  vpsError?: string;
}

/**
 * Botón "Conectar a Hostinger": prueba el HOSTINGER_API_TOKEN de .env.local (nunca se pide acá
 * en el chat/UI, sale del servidor -- ver dashboard/.env.local.example) y muestra los dominios
 * y VPS reales de la cuenta. No hardcodea ningún dominio ni cliente.
 */
export default function HostingerConnect() {
  const [expandido, setExpandido] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [status, setStatus] = useState<HostingerStatus | null>(null);

  async function probarConexion() {
    setCargando(true);
    setExpandido(true);
    try {
      const res = await fetch("/api/hostinger/status");
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setStatus({ valido: false, error: String(err?.message || err) });
    } finally {
      setCargando(false);
    }
  }

  function nombreSitio(w: any): string {
    return w?.domain || w?.dominio || w?.name || w?.id || JSON.stringify(w).slice(0, 40);
  }
  function nombreVm(vm: any): string {
    return vm?.hostname || vm?.name || vm?.id || JSON.stringify(vm).slice(0, 40);
  }

  return (
    <div className="shrink-0 rounded-xl border border-base-700 bg-base-900/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
          <Server size={14} /> Hostinger
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={probarConexion} disabled={cargando}>
            {cargando ? <Loader2 size={13} className="animate-spin" /> : <Globe2 size={13} />}
            Conectar a Hostinger
          </Button>
          {status && (
            <button
              type="button"
              onClick={() => setExpandido((v) => !v)}
              className="text-gray-500 hover:text-gray-300 p-1 rounded-md hover:bg-base-800"
            >
              {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {expandido && status && (
        <div className="mt-2 text-[11px]">
          {!status.valido ? (
            <div className="text-red-400">
              No se pudo conectar: {status.error}. Revisá HOSTINGER_API_TOKEN en dashboard/.env.local (ver
              .env.local.example) -- se configura ahí en tu Mac, nunca por acá.
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <div className="text-gray-400 mb-1">
                  Websites <Badge className="bg-base-800 text-gray-500">{status.websites?.length ?? 0}</Badge>
                </div>
                {status.websitesError && <div className="text-amber-400">{status.websitesError}</div>}
                <div className="flex flex-wrap gap-1">
                  {(status.websites ?? []).map((w, i) => (
                    <span key={i} className="rounded-md bg-base-800 px-2 py-0.5 text-gray-300">
                      {nombreSitio(w)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">
                  VPS <Badge className="bg-base-800 text-gray-500">{status.virtualMachines?.length ?? 0}</Badge>
                </div>
                {status.vpsError && (
                  <div className="text-amber-400">
                    {status.vpsError} (endpoint de VPS sin confirmar del todo -- ver comentario en
                    lib/hostinger-client.ts)
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {(status.virtualMachines ?? []).map((vm, i) => (
                    <span key={i} className="rounded-md bg-base-800 px-2 py-0.5 text-gray-300">
                      {nombreVm(vm)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
