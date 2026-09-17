import jsPDF from "jspdf";

// Convierte un string en Markdown (los entregables que generan los agentes) a un PDF
// descargable, directo en el navegador. No es un renderer completo de Markdown —
// cubre lo que de verdad generan los agentes: encabezados #/##/###, listas con - o *,
// negrita/cursiva/código inline, líneas horizontales (---) y párrafos normales.

const MARGIN = 18; // mm
const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297; // A4 mm
const USABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = PAGE_HEIGHT - MARGIN;

function stripInlineMarkdown(line: string): string {
  return line
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // ![alt](url) -> alt
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [texto](url) -> texto
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **negrita**
    .replace(/__([^_]+)__/g, "$1") // __negrita__
    .replace(/\*([^*]+)\*/g, "$1") // *cursiva*
    .replace(/_([^_]+)_/g, "$1") // _cursiva_
    .replace(/`([^`]+)`/g, "$1") // `code`
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

  if (!trimmed) {
    return { text: "", fontSize: 10, bold: false, gapBefore: 0, gapAfter: 3 };
  }

  if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
    return { text: "", fontSize: 10, bold: false, gapBefore: 2, gapAfter: 4, isRule: true };
  }

  const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const sizeByLevel: Record<number, number> = { 1: 18, 2: 15, 3: 13, 4: 11.5, 5: 11, 6: 10.5 };
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

export function markdownToPdf(markdown: string, filename: string): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  function ensureSpace(needed: number) {
    if (y + needed > BOTTOM_LIMIT) {
      doc.addPage();
      y = MARGIN;
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
      // línea vacía: solo espacio, sin dibujar nada
      y += styled.gapAfter;
      continue;
    }

    doc.setFont("helvetica", styled.bold ? "bold" : "normal");
    doc.setFontSize(styled.fontSize);
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

  doc.save(filename);
}
