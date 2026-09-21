"use client";

import { useState } from "react";

/**
 * Botón liviano de "limpiar caché del navegador" — a diferencia de ClearButton
 * ("🧹 Limpiar Pantalla", que además resetea memoria/ideas/ en el servidor),
 * este SOLO toca lo que vive en el navegador: localStorage + sessionStorage,
 * y recarga la página. No llama a ningún endpoint, no mueve ni borra nada en
 * memoria/ideas/.
 *
 * Por qué existe: el estado de selección de agente (ChatPanel) es React state
 * en memoria, nunca se guarda en localStorage — pero el navegador puede seguir
 * sirviendo un bundle/JS viejo desde caché después de un deploy, y la única
 * forma de estar 100% seguro de que se ve la versión nueva (sin ir a las
 * devtools a mano) es limpiar el storage local y recargar. Este botón es ese
 * atajo, sin la fricción/alcance del reset de proyectos de ClearButton.
 *
 * Nota: localStorage también guarda la "Memoria del Proyecto" del lado del
 * navegador (ver lib/projectMemory.ts) — este botón SÍ la borra, por eso pide
 * confirmación. Lo que NO borra es memoria/ideas/ en el servidor.
 */
export default function ClearCacheButton() {
  const [limpiando, setLimpiando] = useState(false);

  function handleClearCache() {
    const confirmado = window.confirm(
      "Esto borra localStorage/sessionStorage de este navegador (incluye la Memoria del Proyecto guardada localmente) y recarga la página. NO toca memoria/ideas/ en el servidor — tus proyectos guardados siguen ahí. ¿Continuar?"
    );
    if (!confirmado) return;

    setLimpiando(true);
    try {
      localStorage.clear();
      sessionStorage.clear();
    } finally {
      window.location.reload();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClearCache}
      disabled={limpiando}
      title="Borra localStorage/sessionStorage de este navegador y recarga (no toca memoria/ideas/)"
      className="inline-flex items-center gap-1.5 rounded-md bg-base-700 border border-base-600 px-2.5 py-1.5 text-xs font-semibold text-gray-200 shadow-sm transition-colors hover:bg-base-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      🔄 {limpiando ? "Limpiando..." : "Limpiar caché"}
    </button>
  );
}
