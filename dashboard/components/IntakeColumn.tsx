"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function IntakeColumn({
  onCreateIdea,
}: {
  onCreateIdea: (descripcion: string) => Promise<void>;
}) {
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!descripcion.trim() || loading) return;
    setLoading(true);
    try {
      await onCreateIdea(descripcion.trim());
      setDescripcion("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="col-span-1 flex flex-col rounded-xl border border-base-700 bg-base-900/60 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-1">Idea Intake</h2>
      <p className="text-xs text-gray-500 mb-3">
        Describe tu nueva idea de negocio en cualquier rubro — el equipo es 100% generalista.
      </p>
      <Textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Describe tu nueva idea de negocio en cualquier rubro..."
        rows={10}
        className="flex-1 min-h-[220px]"
      />
      <Button className="mt-3 w-full" onClick={handleSubmit} disabled={loading || !descripcion.trim()}>
        <Sparkles size={15} />
        {loading ? "Analizando..." : "Analizar con Equipo Abierto"}
      </Button>
      <p className="text-[11px] text-gray-600 mt-2">
        Al enviar, se crea <code className="text-gray-500">memoria/ideas/IDEA-N-nombre.md</code> y se marca como
        IDEA-ACTUAL.
      </p>
    </div>
  );
}
