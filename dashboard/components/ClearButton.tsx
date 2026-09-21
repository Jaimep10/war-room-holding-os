"use client";

import { useState } from "react";

/**
 * Botón rojo de "reset total" del dashboard: borra localStorage + sessionStorage
 * del navegador y recarga la página. Además, antes de recargar, le pide al server
 * (vía /api/limpiar-datos) que limpie dashboard/data/* si esa carpeta existe.
 *
 * Nota de seguridad: en vez de borrar los archivos de dashboard/data/ de forma
 * permanente, el endpoint los MUEVE a dashboard/data/_borrado/<fecha>/ (igual que
 * el resto de este proyecto trata cualquier borrado: con cuarentena, nunca rm
 * directo) — así un click accidental en este botón no destruye nada sin forma
 * de recuperarlo.
 */
export default function ClearButton() {
  const [limpiando, setLimpiando] = useState(false);

  async function handleClear() {
    const confirmado = window.confirm(
      "Esto borra localStorage y sessionStorage del navegador, y mueve los archivos de dashboard/data/ a cuarentena. ¿Continuar?"
    );
    if (!confirmado) return;

    setLimpiando(true);
    try {
      const res = await fetch("/api/limpiar-datos", { method: "POST" });
      if (!res.ok) {
        console.error("No se pudo limpiar dashboard/data:", await res.text());
      }
    } catch (err) {
      console.error("Error llamando a /api/limpiar-datos:", err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClear}
      disabled={limpiando}
      title="Borra localStorage, sessionStorage y mueve dashboard/data/* a cuarentena"
      className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      🧹 {limpiando ? "Limpiando..." : "Limpiar Pantalla"}
    </button>
  );
}
