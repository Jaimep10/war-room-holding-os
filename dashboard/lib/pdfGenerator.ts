import jsPDF from "jspdf";
import { loadProjectMemory } from "./projectMemory";

// Generador de PDF con marca War Room OS — header con nombre de proyecto + fecha, footer
// con paginación, y el markdown de los entregables convertido a un formato legible (no es
// un renderer de Markdown completo: cubre lo que de verdad generan los agentes — headers
// #/##/###, listas, negrita/cursiva/código inline y líneas horizontales).
//
// OJO: no se incrusta un logo gráfico porque nadie nos ha pasado uno todavía (mismo
// principio que CLAUDE.md aplica a los agentes: no se inventa un logo). El header usa
// wordmark de texto. Si Jaime pasa un PNG/SVG de logo, se puede incrustar como data: URI.

const MARGIN = 16;
const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297; // A4 mm
const USABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;
const HEADER_BAR_HEIGHT = 15;
const CONTENT_TOP = 34; // debajo del header + línea separadora
const FOOTER_RESERVE = 14; // espacio reservado para el footer en cada página
const BOTTOM_LIMIT = PAGE_HEIGHT - MARGIN - FOOTER_RESERVE;

function stripInlineMarkdown(line: string): string {
  return line
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

interface LineStyle {
  text: string;
  fontSize: number;
  bold: boolean;
  gapBefore: number;
  gapAfter: number;
  isRule?: boolean;
}

function classifyLine(raw: string): LineStyle | null {
  const line = raw.replace(/\r$/, "");
  const trimmed = line.trim();

  if (!trimmed) return { text: "", fontSize: 10, bold: false, gapBefore: 0, gapAfter: 3 };

  if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
    return { text: "", fontSize: 10, bold: false, gapBefore: 2, gapAfter: 4, isRule: true };
  }

  const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const sizeByLevel: Record<number, number> = { 1: 17, 2: 14.5, 3: 12.5, 4: 11.5, 5: 11, 6: 10.5 };
    return {
      text: stripInlineMarkdown(headingMatch[2]),
      fontSize: sizeByLevel[level] ?? 11,
      bold: true,
      gapBefore: level <= 2 ? 5 : 3,
      gapAfter: 3,
    };
  }

  const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
  if (bulletMatch) {
    return { text: `•  ${stripInlineMarkdown(bulletMatch[1])}`, fontSize: 10, bold: false, gapBefore: 0, gapAfter: 1.5 };
  }

  const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
  if (numberedMatch) {
    return {
      text: `${numberedMatch[1]}.  ${stripInlineMarkdown(numberedMatch[2])}`,
      fontSize: 10,
      bold: false,
      gapBefore: 0,
      gapAfter: 1.5,
    };
  }

  return { text: stripInlineMarkdown(trimmed), fontSize: 10, bold: false, gapBefore: 0, gapAfter: 1.5 };
}

function drawHeader(doc: jsPDF, titulo: string, proyectoNombre: string, fecha: string) {
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, PAGE_WIDTH, HEADER_BAR_HEIGHT, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("WAR ROOM OS", MARGIN, 9.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const proyectoTxt = proyectoNombre ? proyectoNombre.slice(0, 50) : "";
  if (proyectoTxt) doc.text(proyectoTxt, PAGE_WIDTH - MARGIN, 6.5, { align: "right" });
  doc.text(fecha, PAGE_WIDTH - MARGIN, 11.5, { align: "right" });

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  const tituloWrapped = doc.splitTextToSize(titulo, USABLE_WIDTH);
  doc.text(tituloWrapped[0] || titulo, MARGIN, 24);

  doc.setDrawColor(200);
  doc.line(MARGIN, 28, PAGE_WIDTH - MARGIN, 28);
}

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("Generado por War Room OS", MARGIN, PAGE_HEIGHT - 8);
  doc.text(`Página ${pageNum} de ${totalPages}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 8, { align: "right" });
}

/**
 * Convierte markdown a un PDF descargable con header/footer de marca. `projectId`, si se
 * pasa, se usa para sacar un nombre de proyecto de su memoria (lib/projectMemory.ts) para
 * el header — no es obligatorio.
 */
export function generarPDF(markdown: string, titulo: string, projectId?: string | null): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const fecha = new Date().toISOString().slice(0, 10);

  let proyectoNombre = "";
  if (projectId) {
    const memory = loadProjectMemory(projectId);
    proyectoNombre = memory.descripcion.trim().split("\n")[0] || projectId;
  }

  let y = CONTENT_TOP;
  drawHeader(doc, titulo, proyectoNombre, fecha);

  function ensureSpace(needed: number) {
    if (y + needed > BOTTOM_LIMIT) {
      doc.addPage();
      y = CONTENT_TOP;
      drawHeader(doc, titulo, proyectoNombre, fecha);
    }
  }

  const rawLines = markdown.split("\n");
  for (const raw of rawLines) {
    const styled = classifyLine(raw);
    if (!styled) continue;

    if (styled.isRule) {
      ensureSpace(styled.gapBefore + 2);
      y += styled.gapBefore;
      doc.setDrawColor(180);
      doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
      y += styled.gapAfter;
      continue;
    }

    if (!styled.text) {
      y += styled.gapAfter;
      continue;
    }

    doc.setFont("helvetica", styled.bold ? "bold" : "normal");
    doc.setFontSize(styled.fontSize);
    doc.setTextColor(20, 20, 20);
    const lineHeight = styled.fontSize * 0.42;
    const wrapped: string[] = doc.splitTextToSize(styled.text, USABLE_WIDTH);

    ensureSpace(styled.gapBefore + lineHeight);
    y += styled.gapBefore;

    for (const wrappedLine of wrapped) {
      ensureSpace(lineHeight);
      doc.text(wrappedLine, MARGIN, y);
      y += lineHeight;
    }

    y += styled.gapAfter;
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages);
  }

  const slug =
    titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "documento";

  doc.save(`WarRoom-${slug}-${fecha}.pdf`);
}
