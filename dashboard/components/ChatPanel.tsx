"use client";

import { useState } from "react";
import { AgentResponse, AgentSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { AlertTriangle, MessageSquare, Users, User } from "lucide-react";

type Mode = "single" | "multi" | "team";

export default function ChatPanel({
  agents,
  apiKeyConfigured,
}: {
  agents: AgentSummary[];
  apiKeyConfigured: boolean;
}) {
  const [mode, setMode] = useState<Mode>("single");
  const [singleAgent, setSingleAgent] = useState(agents[0]?.slug ?? "");
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AgentResponse[]>([]);
  const [ideaLabel, setIdeaLabel] = useState<string | null>(null);

  function toggleMulti(slug: string) {
    setMultiSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function send() {
    setLoading(true);
    setResults([]);
    try {
      if (mode === "team") {
        const res = await fetch("/api/team-meeting", { method: "POST" });
        const data = await res.json();
        if (data.error) {
          setResults([{ agent: "sistema", ok: false, text: data.error }]);
        } else {
          setResults(data.results);
          setIdeaLabel(data.idea ? `${data.idea.title} (${data.idea.giro})` : null);
        }
      } else {
        const agentSlugs = mode === "single" ? [singleAgent] : multiSelected;
        if (!agentSlugs.length) {
          setLoading(false);
          return;
        }
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentSlugs, message: message || undefined }),
        });
        const data = await res.json();
        if (data.error) {
          setResults([{ agent: "sistema", ok: false, text: data.error }]);
        } else {
          setResults(data.results);
          setIdeaLabel(data.idea ? `${data.idea.title} (${data.idea.giro})` : null);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {!apiKeyConfigured && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-600/30 bg-yellow-500/10 text-yellow-300 text-[11px] px-3 py-2 mb-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            No hay <code>ANTHROPIC_API_KEY</code> configurada — los agentes van a devolver un aviso en vez de una
            respuesta real. Cópiala en <code>dashboard/.env.local</code>.
          </span>
        </div>
      )}

      <div className="flex items-center gap-1.5 mb-3">
        <Button size="sm" variant={mode === "single" ? "primary" : "outline"} onClick={() => setMode("single")}>
          <User size={13} /> 1 agente
        </Button>
        <Button size="sm" variant={mode === "multi" ? "primary" : "outline"} onClick={() => setMode("multi")}>
          <Users size={13} /> Varios
        </Button>
        <Button size="sm" variant={mode === "team" ? "primary" : "outline"} onClick={() => setMode("team")}>
          <MessageSquare size={13} /> REUNIÓN TODO EL EQUIPO
        </Button>
      </div>

      {mode === "single" && (
        <select
          value={singleAgent}
          onChange={(e) => setSingleAgent(e.target.value)}
          className="bg-base-800 border border-base-600 text-sm text-gray-100 rounded-lg px-3 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
        >
          {agents.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.slug}
            </option>
          ))}
        </select>
      )}

      {mode === "multi" && (
        <div className="grid grid-cols-2 gap-1.5 mb-2 max-h-32 overflow-y-auto border border-base-700 rounded-lg p-2 bg-base-900">
          {agents.map((a) => (
            <label key={a.slug} className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
              <Checkbox checked={multiSelected.includes(a.slug)} onCheckedChange={() => toggleMulti(a.slug)} />
              {a.slug}
            </label>
          ))}
        </div>
      )}

      {mode !== "team" && (
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Pregunta o instrucción para el agente (opcional — si lo dejas vacío, pide su dictamen estándar)..."
          rows={2}
          className="mb-2"
        />
      )}

      <Button onClick={send} disabled={loading} className="mb-3 self-start">
        {loading ? "Consultando al equipo..." : "Enviar"}
      </Button>

      {ideaLabel && <div className="text-[11px] text-gray-500 mb-2">Sobre: {ideaLabel}</div>}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {results.map((r, i) => (
          <div key={i} className="rounded-lg border border-base-700 bg-base-850 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className={r.ok ? "bg-accent-500/20 text-accent-400" : "bg-red-500/20 text-red-400"}>
                {r.agent}
              </Badge>
            </div>
            {r.ok ? (
              <div className="markdown-body text-xs text-gray-300">
                <ReactMarkdown>{r.text}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-xs text-red-300">{r.text}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
