// Datos de PRUEBA. Números ficticios (rango +59399000xxxx) salvo el del ejemplo de curl.
// Antes de producción esta lista se reemplaza por reportes reales de usuarios / fuentes oficiales.
export interface BlacklistedNumber {
  phone: string;
  type: 'ESTAFA' | 'VENTA';
  reports_count: number;
  last_report: string;
  scam_category: string;
}

export const blacklistSeed: BlacklistedNumber[] = [
  { phone: '+593991234567', type: 'ESTAFA', reports_count: 312, last_report: '2026-10-20', scam_category: 'SUPLANTACION_IESS' },
  { phone: '+593990000101', type: 'ESTAFA', reports_count: 188, last_report: '2026-10-22', scam_category: 'SUPLANTACION_IESS' },
  { phone: '+593990000102', type: 'ESTAFA', reports_count: 141, last_report: '2026-10-18', scam_category: 'SUPLANTACION_SRI' },
  { phone: '+593990000103', type: 'ESTAFA', reports_count: 97, last_report: '2026-10-15', scam_category: 'SUPLANTACION_SRI' },
  { phone: '+593990000104', type: 'ESTAFA', reports_count: 256, last_report: '2026-10-23', scam_category: 'SUPLANTACION_BANCO' },
  { phone: '+593990000105', type: 'ESTAFA', reports_count: 203, last_report: '2026-10-21', scam_category: 'SUPLANTACION_BANCO' },
  { phone: '+593990000106', type: 'ESTAFA', reports_count: 420, last_report: '2026-10-24', scam_category: 'FAMILIAR_DETENIDO' },
  { phone: '+593990000107', type: 'ESTAFA', reports_count: 377, last_report: '2026-10-24', scam_category: 'FAMILIAR_DETENIDO' },
  { phone: '+593990000108', type: 'ESTAFA', reports_count: 165, last_report: '2026-10-19', scam_category: 'FALSO_SECUESTRO' },
  { phone: '+593990000109', type: 'ESTAFA', reports_count: 132, last_report: '2026-10-17', scam_category: 'PREMIO_FALSO' },
  { phone: '+593990000110', type: 'ESTAFA', reports_count: 118, last_report: '2026-10-16', scam_category: 'PREMIO_FALSO' },
  { phone: '+593990000111', type: 'ESTAFA', reports_count: 89, last_report: '2026-10-14', scam_category: 'BONO_GOBIERNO' },
  { phone: '+593990000112', type: 'ESTAFA', reports_count: 76, last_report: '2026-10-12', scam_category: 'BONO_GOBIERNO' },
  { phone: '+593990000113', type: 'ESTAFA', reports_count: 64, last_report: '2026-10-11', scam_category: 'SOPORTE_TECNICO_FALSO' },
  { phone: '+593990000201', type: 'VENTA', reports_count: 540, last_report: '2026-10-24', scam_category: 'TELCO_VENTAS_CNT' },
  { phone: '+593990000202', type: 'VENTA', reports_count: 498, last_report: '2026-10-24', scam_category: 'TELCO_VENTAS_MOVISTAR' },
  { phone: '+593990000203', type: 'VENTA', reports_count: 455, last_report: '2026-10-23', scam_category: 'TELCO_VENTAS_CLARO' },
  { phone: '+593990000204', type: 'VENTA', reports_count: 310, last_report: '2026-10-22', scam_category: 'BANCO_VENTA_TARJETA' },
  { phone: '+593990000205', type: 'VENTA', reports_count: 287, last_report: '2026-10-20', scam_category: 'BANCO_VENTA_TARJETA' },
  { phone: '+593990000206', type: 'VENTA', reports_count: 150, last_report: '2026-10-19', scam_category: 'SEGUROS_VENTA' },
];
