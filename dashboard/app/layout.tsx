import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "War Room — Idea to Empresa",
  description: "Dashboard de la Oficina de Estrategia con Equipo Abierto y Generalista.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-base-950 text-gray-200 antialiased">{children}</body>
    </html>
  );
}
