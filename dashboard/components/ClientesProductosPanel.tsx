"use client";

import { useEffect, useState } from "react";
import { Building2, Package, FileText, ShieldCheck, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClienteSummary, ProductoSummary } from "@/lib/types";

function FileLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-accent-400 hover:bg-base-800 rounded-md px-1.5 py-1"
    >
      <FileText size={12} className="shrink-0" />
      <span className="truncate">{label}</span>
    </a>
  );
}

function ClienteCard({ cliente }: { cliente: ClienteSummary }) {
  return (
    <div className="rounded-lg border border-base-700 bg-base-850 p-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="text-xs font-semibold text-gray-100 truncate">{cliente.nombre}</div>
        {cliente.modoAbierto && (
          <Badge className="bg-accent-500/15 text-accent-400 shrink-0 gap-1">
            <ShieldCheck size={11} /> Modo Abierto
          </Badge>
        )}
      </div>
      <div className="text-[10px] text-gray-500 mb-2">
        clientes/{cliente.slug}/ · {cliente.archivos.length} archivos
        {cliente.kitRedes.length > 0 && ` · kit-redes/ (${cliente.kitRedes.length})`}
      </div>

      <div className="grid grid-cols-1 gap-0.5">
        {cliente.archivos.map((f) => (
          <FileLink
            key={f}
            href={`/api/clientes/file?slug=${encodeURIComponent(cliente.slug)}&file=${encodeURIComponent(f)}`}
            label={f}
          />
        ))}
      </div>

      {cliente.kitRedes.length > 0 && (
        <div className="mt-2 pt-2 border-t border-base-700">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">kit-redes/</div>
          <div className="grid grid-cols-1 gap-0.5">
            {cliente.kitRedes.map((f) => (
              <FileLink
                key={f}
                href={`/api/clientes/file?slug=${encodeURIComponent(cliente.slug)}&file=${encodeURIComponent(f)}&kitRedes=1`}
                label={f}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductoCard({ producto }: { producto: ProductoSummary }) {
  return (
    <div className="rounded-lg border border-base-700 bg-base-850 p-3">
      <div className="text-xs font-semibold text-gray-100 truncate mb-1.5">{producto.nombre}</div>
      <div className="text-[10px] text-gray-500 mb-2">
        producto/{producto.slug}/ · {producto.archivos.length} archivos
      </div>
      <div className="grid grid-cols-1 gap-0.5">
        {producto.archivos.map((f) => (
          <FileLink
            key={f}
            href={`/api/productos/file?slug=${encodeURIComponent(producto.slug)}&file=${encodeURIComponent(f)}`}
            label={f}
          />
        ))}
      </div>
    </div>
  );
}

export default function ClientesProductosPanel() {
  const [clientes, setClientes] = useState<ClienteSummary[]>([]);
  const [productos, setProductos] = useState<ProductoSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [rc, rp] = await Promise.all([fetch("/api/clientes"), fetch("/api/productos")]);
      const [dc, dp] = await Promise.all([rc.json(), rp.json()]);
      setClientes(dc.clientes ?? []);
      setProductos(dp.productos ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="col-span-3 rounded-xl border border-base-700 bg-base-900/60 p-4 flex flex-col overflow-hidden">
      <div className="text-[11px] text-gray-500 mb-3">
        Leyendo directo de <code>clientes/</code> y <code>producto/</code> — cada cliente aislado en su
        propia carpeta (Modo Abierto), separado de la memoria general de la agencia (
        <code>memoria/</code>) y de las líneas de producto internas (<code>producto/</code>).
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-xs gap-2">
          <Loader2 size={14} className="animate-spin" /> Cargando clientes y productos…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* CLIENTES */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200 mb-2 uppercase tracking-wide">
              <Building2 size={14} className="text-accent-400" />
              Clientes
              <Badge className="ml-auto">{clientes.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {clientes.length === 0 && (
                <div className="text-[11px] text-gray-500">Todavía no hay clientes en clientes/.</div>
              )}
              {clientes.map((c) => (
                <ClienteCard key={c.slug} cliente={c} />
              ))}
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200 mb-2 uppercase tracking-wide">
              <Package size={14} className="text-accent-400" />
              Productos
              <Badge className="ml-auto">{productos.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {productos.length === 0 && (
                <div className="text-[11px] text-gray-500">Todavía no hay productos en producto/.</div>
              )}
              {productos.map((p) => (
                <ProductoCard key={p.slug} producto={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
