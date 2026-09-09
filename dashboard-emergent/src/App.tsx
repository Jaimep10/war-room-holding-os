import React, { useMemo, useState } from "react";

/**
 * Puente Emergent — Toggle de Tono (Modo Amable vs. Modo Brutal / Roast Me)
 * ---------------------------------------------------------------------------
 * Este componente vive junto a agents-manifest.json y api-wrapper.js dentro de
 * dashboard-emergent/. Su trabajo es UNA sola cosa: decidir qué tono usan los
 * 13 agentes core (ver memoria/sistema.md) y anteponer la instrucción de tono
 * correcta al system prompt que arma getAgenteSystemPrompt().
 *
 * memoria/sistema.md ya define "Modo Brutal" como el default: brutalmente
 * honesto, score <4.0 si la idea no sirve, Informe de Autopsia obligatorio en
 * veredictos NO VIABLE. Ese fondo NUNCA cambia. Lo único que este toggle
 * controla es la FORMA:
 *   - Modo Amable: mismo score, mismo veredicto, mismo Informe de Autopsia,
 *     pero sin sarcasmo ni adjetivos duros.
 *   - Modo Brutal (Roast Me): se agrega la instrucción activa
 *     "Activa puteada constructiva. Sin anestesia."
 *
 * NOTA DE INTEGRACIÓN: api-wrapper.js es un módulo CommonJS de Node (usa fs/path
 * para leer memoria/ y .claude/agents/ del disco), así que NO corre directo en
 * el navegador. En Emergent, este componente debe llamar a un endpoint del
 * backend (ej. /api/agente/:id?tono=brutal) que internamente use
 * getAgenteSystemPrompt(agenteId) + buildTonoSuffix(tono). La función
 * buildTonoSuffix de abajo es la pieza reutilizable en cualquiera de los dos
 * lados (frontend para mostrar el preview, backend para armar el prompt real).
 */

export type Tono = "amable" | "brutal";

export const TONO_BRUTAL_INSTRUCCION_ACTIVA =
  "Activa puteada constructiva. Sin anestesia.";

/**
 * Instrucción de tono que se antepone/agrega al system prompt del agente,
 * según el estado del toggle. El fondo (score, veredicto, Informe de
 * Autopsia) viene siempre de memoria/sistema.md y no lo toca esta función.
 */
export function buildTonoSuffix(tono: Tono): string {
  if (tono === "brutal") {
    return [
      "\n\n# TONO ACTIVO: MODO BRUTAL (ROAST ME)",
      "modo_tono: brutal",
      TONO_BRUTAL_INSTRUCCION_ACTIVA,
    ].join("\n");
  }
  return [
    "\n\n# TONO ACTIVO: MODO AMABLE",
    "modo_tono: amable",
    "Suaviza la forma (sin sarcasmo, sin adjetivos duros). El score, el veredicto y el Informe de",
    "Autopsia (si aplica) se mantienen EXACTAMENTE igual — no se suaviza el fondo, solo la frase.",
  ].join("\n");
}

/**
 * Ejemplo de cómo un backend armaría el prompt final para un agente dado el
 * tono elegido en el dashboard. `getAgenteSystemPrompt` es la función que ya
 * existe en dashboard-emergent/api-wrapper.js.
 *
 *   import { getAgenteSystemPrompt } from "../api-wrapper";
 *   const prompt = getAgenteSystemPromptConTono(getAgenteSystemPrompt, "pesimista", "brutal");
 */
export function getAgenteSystemPromptConTono(
  getAgenteSystemPrompt: (agenteId: string) => string,
  agenteId: string,
  tono: Tono
): string {
  return getAgenteSystemPrompt(agenteId) + buildTonoSuffix(tono);
}

interface AppProps {
  /** Tono inicial del toggle. Default: "brutal" (el default de memoria/sistema.md). */
  initialTono?: Tono;
  /** Se llama cada vez que el usuario cambia el toggle, para que el host (Emergent) lo persista. */
  onTonoChange?: (tono: Tono) => void;
}

export default function App({ initialTono = "brutal", onTonoChange }: AppProps) {
  const [tono, setTono] = useState<Tono>(initialTono);

  const handleChange = (nuevoTono: Tono) => {
    setTono(nuevoTono);
    onTonoChange?.(nuevoTono);
  };

  const previewSuffix = useMemo(() => buildTonoSuffix(tono), [tono]);

  return (
    <div className="tono-toggle" style={styles.container}>
      <span style={styles.label}>Tono del equipo:</span>

      <label style={styles.option}>
        <input
          type="checkbox"
          checked={tono === "amable"}
          onChange={() => handleChange("amable")}
        />
        Modo Amable
      </label>

      <label style={styles.option}>
        <input
          type="checkbox"
          checked={tono === "brutal"}
          onChange={() => handleChange("brutal")}
        />
        Modo Brutal (Roast Me)
      </label>

      <pre style={styles.preview}>{previewSuffix}</pre>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    border: "1px solid #333",
    borderRadius: "8px",
    background: "#111",
    color: "#eee",
    fontFamily: "monospace",
    maxWidth: "480px",
  },
  label: { fontWeight: 600, opacity: 0.8 },
  option: { display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" },
  preview: {
    marginTop: "0.5rem",
    padding: "0.5rem",
    background: "#000",
    borderRadius: "6px",
    fontSize: "12px",
    whiteSpace: "pre-wrap",
  },
};
