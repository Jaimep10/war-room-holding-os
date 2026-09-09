"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { riskColor, cn } from "@/lib/utils";
import { Wallet, Loader2 } from "lucide-react";
import type { CapitalCard } from "@/app/api/capital/route";

export default function CapitalIdeaMode({ onGenerated }: { onGenerated: () => void }) {
  const [capital, setCapital] = useState(5000);
  const [ciudad, setCiudad] = useState("Guayaquil");
  const [horasSemana, setHorasSemana] = useState(20);
  const [habilidades, setHabilidades] = useState("");
  const [retorno, setRetorno] = useState("6 meses");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<CapitalCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setWarning(null);
    setCards(null);
    try {
      const res = await fetch("/api/capital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capital, ciudad, horasSemana, habilidades, retorno }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setCards(data.cards);
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
        <h2 className="text-sm font-semibold text-gray-200 mb-1">Capital → Idea</h2>
        <p className="text-xs text-gray-500 mb-3">
          El equipo (Analista + Finanzas + Compras + Pesimista) propone 10 ideas comparables para tu situación.
        </p>

        <label className="text-[11px] text-gray-400 mb-1">Capital disponible (USD)</label>
        <input
          type="number"
          value={capital}
          onChange={(e) => setCapital(Number(e.target.value))}
          className="mb-3 bg-base-900 border border-base-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        />

        <label className="text-[11px] text-gray-400 mb-1">Ciudad</label>
        <input
          type="text"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="mb-3 bg-base-900 border border-base-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        />

        <label className="text-[11px] text-gray-400 mb-1">Horas por semana disponibles</label>
        <input
          type="number"
          value={horasSemana}
          onChange={(e) => setHorasSemana(Number(e.target.value))}
          className="mb-3 bg-base-900 border border-base-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        />

        <label className="text-[11px] text-gray-400 mb-1">Habilidades / activos</label>
        <Textarea
          value={habilidades}
          onChange={(e) => setHabilidades(e.target.value)}
          placeholder="ej: tengo carro, sé vender, sin local..."
          rows={3}
          className="mb-3"
        />

        <label className="text-[11px] text-gray-400 mb-1">Retorno deseado</label>
        <select
          value={retorno}
          onChange={(e) => setRetorno(e.target.value)}
          className="mb-4 bg-base-900 border border-base-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        >
          <option>3 meses</option>
          <option>6 meses</option>
          <option>12 meses</option>
        </select>

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
          {loading ? "Reunión en curso..." : "Generar ideas con el Equipo"}
        </Button>

        {error && <div className="mt-3 text-[11px] text-red-300 border border-red-600/30 bg-red-500/10 rounded-lg p-2">{error}</div>}
        {warning && <div className="mt-3 text-[11px] text-yellow-300 border border-yellow-600/30 bg-yellow-500/10 rounded-lg p-2">{warning}</div>}
      </div>

      <div className="col-span-2 rounded-xl border border-base-700 bg-base-900/60 p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-200 mb-3">10 ideas comparables</h2>
        {!cards && !loading && (
          <div className="text-xs text-gray-600 text-center mt-10">
            Completa el formulario y pide al equipo que genere las 10 ideas.
          </div>
        )}
        {loading && (
          <div className="text-xs text-gray-500 text-center mt-10 flex flex-col items-center gap-2">
            <Loader2 size={20} className="animate-spin" />
            El equipo está evaluando con Kraljic, Taleb y TCO...
          </div>
        )}
        {cards && (
          <div className="grid grid-cols-2 gap-3">
            {cards.map((c, i) => (
              <div key={i} className="rounded-lg border border-base-600 bg-base-850 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-100">{c.nombre}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px]", riskColor(c.riesgo))}>{c.riesgo}</span>
                </div>
                <div className="text-[11px] text-gray-400 mb-2">
                  Score <span className="text-gray-100 font-semibold">{c.score_pesimista}/10</span> · Margen{" "}
                  <span className="text-gray-100 font-semibold">{c.margen_pct}%</span>
                </div>
                <div className="text-[11px] text-gray-400 mb-2">
                  Inversión: Producto ${c.inversion?.producto} + Flete ${c.inversion?.flete} + Ads ${c.inversion?.ads} + Buffer $
                  {c.inversion?.buffer} = <span className="text-gray-100 font-semibold">${c.inversion?.total}</span>
                </div>
                <div className="text-[11px] text-gray-300 mb-2">
                  <Badge className="mb-1">Validación 7 días &lt;$100</Badge>
                  <p>{c.validacion_7_dias}</p>
                </div>
                <div className="text-[11px] text-gray-500">
                  <span className="text-gray-400 font-medium">Por qué la eligió el equipo: </span>
                  {c.por_que_elegida}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
