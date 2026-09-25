import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuarto de Diseño de Muebles",
  description: "Dashboard separado del War Room — cocinas, closets y modular sobre SketchUp + KSmart.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-base-950 text-gray-200 antialiased">{children}</body>
    </html>
  );
}
