import ExcelJS from "exceljs";
import Papa from "papaparse";

// Herramientas de Excel/CSV — todas pensadas para correr en el servidor (rutas de API de
// Next.js), no en el navegador. Así evitamos meter exceljs (pesado) al bundle del cliente y
// mantenemos el mismo patrón ya probado con pdf-parse/pdfjs-dist: el navegador sube el
// archivo, el servidor lo procesa y regresa JSON (o el .xlsx ya armado, como descarga).

export interface HojaExcel {
  nombre: string;
  columnas: string[];
  filas: (string | number | null)[][]; // preview: hasta 10 filas de datos (sin encabezado)
  totalFilas: number; // total real de filas de datos en la hoja
}

function cellToPlain(value: ExcelJS.CellValue): string | number | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    const v: any = value;
    if ("result" in v) return v.result ?? null; // celda con fórmula ya calculada
    if ("richText" in v) return v.richText.map((r: any) => r.text).join("");
    if ("text" in v) return String(v.text);
    if ("hyperlink" in v) return v.text ?? v.hyperlink ?? null;
    return String(value);
  }
  return value as string | number;
}

/** Lee un .xlsx/.xlsm/.xls (todas las hojas) desde un Buffer/ArrayBuffer ya subido. */
export async function leerExcel(input: Buffer | ArrayBuffer): Promise<{ hojas: HojaExcel[] }> {
  const workbook = new ExcelJS.Workbook();
  const buf = input instanceof ArrayBuffer ? Buffer.from(input) : input;
  await workbook.xlsx.load(buf as any);

  const hojas: HojaExcel[] = [];
  workbook.eachSheet((worksheet) => {
    const headerRow = worksheet.getRow(1);
    const columnas: string[] = [];
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      const v = cellToPlain(cell.value);
      columnas.push(v === null ? "" : String(v));
    });

    const filas: (string | number | null)[][] = [];
    let totalFilas = 0;
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // encabezado
      totalFilas++;
      if (filas.length < 10) {
        const fila: (string | number | null)[] = [];
        for (let c = 1; c <= Math.max(columnas.length, 1); c++) {
          fila.push(cellToPlain(row.getCell(c).value));
        }
        filas.push(fila);
      }
    });

    hojas.push({ nombre: worksheet.name, columnas, filas, totalFilas });
  });

  return { hojas };
}

/** Lee un .csv como si fuera una sola "hoja" — mismo formato de salida que leerExcel. */
export function leerCsv(texto: string, nombreArchivo: string): { hojas: HojaExcel[] } {
  const parsed = Papa.parse<string[]>(texto.trim(), { skipEmptyLines: true });
  const rows = (parsed.data || []) as string[][];
  const columnas = rows[0] || [];
  const dataRows = rows.slice(1);
  const filas = dataRows.slice(0, 10).map((r) => r.map((c) => (c === "" ? null : c)));

  return {
    hojas: [
      {
        nombre: nombreArchivo.replace(/\.csv$/i, ""),
        columnas,
        filas,
        totalFilas: dataRows.length,
      },
    ],
  };
}

export interface CrearExcelOpts {
  nombreHoja?: string;
  encabezados?: string[];
  datos?: (string | number | null)[][];
  /** Modo cotización rápida: calcula margen/utilidad/punto de equilibrio con FÓRMULAS reales de Excel. */
  finanzas?: {
    precio: number;
    costo: number;
    unidadesMes: number;
    gastosFijos: number;
  };
}

function estilizarHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
  });
}

/**
 * Crea un .xlsx real (Buffer, listo para servir como descarga). En modo "finanzas" las
 * celdas de margen/utilidad/punto de equilibrio son FÓRMULAS de Excel de verdad
 * (=B2-B3, etc.) — si el usuario cambia precio o costo en el propio Excel, todo
 * recalcula solo, no son valores fijos calculados una vez en el servidor.
 */
export async function crearExcel(opts: CrearExcelOpts): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "War Room OS";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(opts.nombreHoja || "Datos");

  if (opts.finanzas) {
    const { precio, costo, unidadesMes, gastosFijos } = opts.finanzas;
    sheet.columns = [
      { header: "Concepto", key: "concepto", width: 38 },
      { header: "Valor", key: "valor", width: 18 },
    ];

    sheet.addRow({ concepto: "Precio de venta unitario", valor: precio });
    sheet.addRow({ concepto: "Costo unitario", valor: costo });
    sheet.addRow({ concepto: "Unidades vendidas al mes", valor: unidadesMes });
    sheet.addRow({ concepto: "Gastos fijos mensuales", valor: gastosFijos });
    sheet.addRow({ concepto: "Margen unitario (Precio − Costo)", valor: { formula: "B2-B3" } as any });
    sheet.addRow({ concepto: "Margen % (Margen unitario / Precio)", valor: { formula: "(B2-B3)/B2" } as any });
    sheet.addRow({
      concepto: "Utilidad mensual ((Precio−Costo)×Unidades − Gastos Fijos)",
      valor: { formula: "(B2-B3)*B4-B5" } as any,
    });
    sheet.addRow({ concepto: "Punto de equilibrio (unidades/mes)", valor: { formula: "B5/(B2-B3)" } as any });

    sheet.getCell("B2").numFmt = '"$"#,##0.00';
    sheet.getCell("B3").numFmt = '"$"#,##0.00';
    sheet.getCell("B5").numFmt = '"$"#,##0.00';
    sheet.getCell("B6").numFmt = '"$"#,##0.00';
    sheet.getCell("B7").numFmt = "0.0%";
    sheet.getCell("B8").numFmt = '"$"#,##0.00';
    sheet.getCell("B9").numFmt = "#,##0.0";

    estilizarHeader(sheet.getRow(1));
  } else {
    const encabezados = opts.encabezados || [];
    if (encabezados.length) {
      estilizarHeader(sheet.addRow(encabezados));
    }
    for (const fila of opts.datos || []) {
      sheet.addRow(fila);
    }
    sheet.columns.forEach((col) => {
      col.width = 20;
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export interface FinanzasCompletoInputs {
  precio: number;
  costo: number;
  unidadesMes: number;
  gastosFijos: number;
  /** Crecimiento mensual compuesto de unidades vendidas, ej. 0.05 = 5%/mes. Default 0. */
  crecimientoMensualPct?: number;
}

function colLetter(n: number): string {
  let s = "";
  let num = n;
  while (num > 0) {
    const rem = (num - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    num = Math.floor((num - 1) / 26);
  }
  return s;
}

/**
 * Genera el Excel financiero completo: Punto de Equilibrio + P&G Mensual + Flujo 12 Meses,
 * las tres hojas encadenadas con fórmulas reales (el Flujo referencia la hoja de Punto de
 * Equilibrio, no repite los números a mano). Toma los inputs explícitos porque todavía no
 * existe una "memoria financiera" estructurada en el proyecto (eso es la herramienta
 * calcularFinanzas de la Fase 3) — cuando exista, esos números alimentan esta misma función.
 */
export async function exportarFinanzasExcel(inputs: FinanzasCompletoInputs): Promise<Buffer> {
  const { precio, costo, unidadesMes, gastosFijos, crecimientoMensualPct = 0 } = inputs;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "War Room OS";
  workbook.created = new Date();

  // ---- Hoja 1: Punto de Equilibrio (fuente de verdad de los parámetros) ----
  const peSheet = workbook.addWorksheet("Punto de Equilibrio");
  peSheet.columns = [
    { header: "Concepto", key: "concepto", width: 38 },
    { header: "Valor", key: "valor", width: 18 },
  ];
  peSheet.addRow({ concepto: "Precio de venta unitario", valor: precio });
  peSheet.addRow({ concepto: "Costo variable unitario", valor: costo });
  peSheet.addRow({ concepto: "Unidades vendidas al mes (base, Mes 1)", valor: unidadesMes });
  peSheet.addRow({ concepto: "Gastos fijos mensuales", valor: gastosFijos });
  peSheet.addRow({ concepto: "Margen de contribución unitario", valor: { formula: "B2-B3" } as any });
  peSheet.addRow({ concepto: "Margen de contribución %", valor: { formula: "(B2-B3)/B2" } as any });
  peSheet.addRow({ concepto: "Punto de equilibrio (unidades/mes)", valor: { formula: "B5/(B2-B3)" } as any });
  peSheet.addRow({ concepto: "Punto de equilibrio (ventas $/mes)", valor: { formula: "B8*B2" } as any });
  peSheet.getCell("B2").numFmt = '"$"#,##0.00';
  peSheet.getCell("B3").numFmt = '"$"#,##0.00';
  peSheet.getCell("B5").numFmt = '"$"#,##0.00';
  peSheet.getCell("B6").numFmt = '"$"#,##0.00';
  peSheet.getCell("B7").numFmt = "0.0%";
  peSheet.getCell("B8").numFmt = "#,##0.0";
  peSheet.getCell("B9").numFmt = '"$"#,##0.00';
  estilizarHeader(peSheet.getRow(1));

  // ---- Hoja 2: P&G Mensual (mes base, referenciando la hoja de Punto de Equilibrio) ----
  const pygSheet = workbook.addWorksheet("P&G Mensual");
  pygSheet.columns = [
    { header: "Concepto", key: "concepto", width: 34 },
    { header: "Mes 1", key: "mes1", width: 16 },
  ];
  pygSheet.addRow({ concepto: "Unidades vendidas", mes1: { formula: "'Punto de Equilibrio'!$B$4" } as any });
  pygSheet.addRow({ concepto: "Precio unitario", mes1: { formula: "'Punto de Equilibrio'!$B$2" } as any });
  pygSheet.addRow({ concepto: "Ingresos", mes1: { formula: "B2*B3" } as any });
  pygSheet.addRow({ concepto: "Costo unitario", mes1: { formula: "'Punto de Equilibrio'!$B$3" } as any });
  pygSheet.addRow({ concepto: "Costo de ventas (COGS)", mes1: { formula: "B2*B5" } as any });
  pygSheet.addRow({ concepto: "Utilidad bruta", mes1: { formula: "B4-B6" } as any });
  pygSheet.addRow({ concepto: "Gastos fijos", mes1: { formula: "'Punto de Equilibrio'!$B$5" } as any });
  pygSheet.addRow({ concepto: "Utilidad neta mensual", mes1: { formula: "B7-B8" } as any });
  ["B2"].forEach((c) => (pygSheet.getCell(c).numFmt = "#,##0"));
  ["B3", "B4", "B5", "B6", "B7", "B8", "B9"].forEach((c) => (pygSheet.getCell(c).numFmt = '"$"#,##0.00'));
  estilizarHeader(pygSheet.getRow(1));

  // ---- Hoja 3: Flujo 12 Meses (unidades proyectadas con crecimiento compuesto real, todo
  // encadenado con fórmulas — cambiar el % de crecimiento en el Excel recalcula los 12 meses) ----
  const flujoSheet = workbook.addWorksheet("Flujo 12 Meses");
  const header = flujoSheet.addRow(["Concepto", ...Array.from({ length: 12 }, (_, i) => `Mes ${i + 1}`)]);
  estilizarHeader(header);

  const labels = [
    "Unidades vendidas",
    "Ingresos",
    "Costo de ventas (COGS)",
    "Utilidad bruta",
    "Gastos fijos",
    "Utilidad neta mensual",
    "Utilidad neta acumulada",
  ];
  labels.forEach((label, i) => {
    flujoSheet.getCell(i + 2, 1).value = label;
  });

  for (let m = 1; m <= 12; m++) {
    const col = m + 1;
    const colL = colLetter(col);
    const prevL = colLetter(col - 1);

    // Fila 2: unidades — mes 1 referencia Punto de Equilibrio, meses siguientes crecen
    // sobre el mes anterior con el % de crecimiento compuesto (fórmula real, no copiado).
    flujoSheet.getCell(2, col).value =
      m === 1
        ? ({ formula: "'Punto de Equilibrio'!$B$4" } as any)
        : ({ formula: `${prevL}2*(1+${crecimientoMensualPct})` } as any);

    flujoSheet.getCell(3, col).value = { formula: `${colL}2*'Punto de Equilibrio'!$B$2` } as any; // ingresos
    flujoSheet.getCell(4, col).value = { formula: `${colL}2*'Punto de Equilibrio'!$B$3` } as any; // COGS
    flujoSheet.getCell(5, col).value = { formula: `${colL}3-${colL}4` } as any; // utilidad bruta
    flujoSheet.getCell(6, col).value = { formula: "'Punto de Equilibrio'!$B$5" } as any; // gastos fijos (flat)
    flujoSheet.getCell(7, col).value = { formula: `${colL}5-${colL}6` } as any; // utilidad neta
    flujoSheet.getCell(8, col).value =
      m === 1 ? ({ formula: `${colL}7` } as any) : ({ formula: `${prevL}8+${colL}7` } as any); // acumulada

    flujoSheet.getCell(2, col).numFmt = "#,##0.0";
    [3, 4, 5, 6, 7, 8].forEach((r) => (flujoSheet.getCell(r, col).numFmt = '"$"#,##0'));
  }

  flujoSheet.getColumn(1).width = 30;
  for (let c = 2; c <= 13; c++) flujoSheet.getColumn(c).width = 13;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
