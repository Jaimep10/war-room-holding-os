---
modo: negocio-existente
giro: Servicios
etapa: Filtro 1 - Viabilidad
facturacion_mensual: 8000
margen_actual_pct: 15
empleados: 4
principal_dolor: Ventas inestables
---
# NEGOCIO-EXISTENTE-ESTRELLITAS-DAY-CARE: Diagnóstico de Mejora — Estrellitas day care 

**Modo:** Mejorar Negocio Existente (Modo 3)

## Insumos del usuario

- **Nombre del negocio:** Estrellitas day care 
- **Giro:** Servicios
- **Facturación mensual actual:** $8000
- **Margen actual:** 15%
- **Número de empleados:** 4
- **Principal dolor declarado:** Ventas inestables

**Estado:** Pendiente de reunión de 7 agentes (Operaciones + Compras + Finanzas + Talento + Cliente + Producto + Legal) para el diagnóstico de Fugas, Palancas y Plan 90 Días.
**Registrada:** 2026-09-21


---

## Resultado de la Reunión (Operaciones + Compras + Finanzas + Talento + Cliente + Producto + Legal)

```json
[
  {
    "area": "Finanzas — Capital de trabajo atrapado",
    "detalle": "Con 15% de margen sobre $8,000 mensuales, la utilidad neta es apenas $1,200/mes. Si hay cobros diferidos (mensualidades pagadas por adelantado pero registradas como ingreso mes a mes) o pagos adelantados a personal/proveedores, el efectivo real disponible está por debajo del margen contable. Falta separar margen de papel vs. caja (Profit First).",
    "impacto_mensual_estimado": "$300–600 atrapados en timing de caja, sin generar rendimiento"
  },
  {
    "area": "Talento — Rotación de cuidadoras",
    "detalle": "En servicios de cuidado infantil, la rotación de personal es la fuga más cara: cada salida implica reclutamiento, capacitación en protocolos de seguridad, período de adaptación de los niños, y riesgo de pérdida de familias si la nueva persona no genera confianza. Si la rotación anual supera el 30%, el costo real (1× salario anual por reemplazo) está consumiendo entre $400–800/mes del margen.",
    "impacto_mensual_estimado": "$400–800 por rotación evitable (costo oculto de reemplazo + productividad reducida)"
  },
  {
    "area": "Cliente — Churn concentrado en familias de mayor ticket",
    "detalle": "Ventas inestables suele significar que las familias se van después de 3–6 meses. Si el churn está en el 20–30% anual y afecta desproporcionadamente a familias que pagan por tiempo completo (vs. medio tiempo o drop-in), la fuga es doble: pierdes el LTV más alto y gastas más en reemplazar esos lugares con clientes de menor valor.",
    "impacto_mensual_estimado": "$500–1,000 de LTV perdido por churn evitable (familias de alto valor que se van por razones no salariales)"
  },
  {
    "area": "Operaciones — Capacidad instalada subutilizada",
    "detalle": "Con 4 empleados, la capacidad regulada (niños por cuidadora según normativa local) está probablemente en 16–24 niños dependiendo de edades. Si la ocupación promedio está por debajo del 80%, hay días/horarios donde se paga salario completo con plazas vacías. La restricción real no es capacidad física sino flujo de admisiones — falta un proceso de waitlist activa y conversión rápida de leads.",
    "impacto_mensual_estimado": "$600–1,200 de capacidad no vendida (plazas vacías pagando salario completo)"
  },
  {
    "area": "Legal — Contratos de servicio sin cláusula de penalidad por cancelación abrupta",
    "detalle": "Si las familias pueden cancelar con aviso de 1 semana o menos, el flujo de caja se vuelve impredecible (ventas inestables) y no hay colchón para reponer la plaza. Un contrato sin cláusula de aviso mínimo de 30 días o penalidad por salida anticipada deja al negocio absorbiendo el riesgo completo de rotación del cliente.",
    "impacto_mensual_estimado": "$300–500 de ingresos perdidos por cancelaciones sin penalidad (plazas que se van sin tiempo de reposición)"
  },
  {
    "area": "Producto — Falta de diferenciación en servicios básicos vs. valor agregado",
    "detalle": "Si el servicio se vende como 'cuidado genérico' sin atributos Kano de Deleite (programa educativo certificado, reporte diario digital a padres, alimentación especializada), el cliente solo compara por precio y ubicación — y cualquier competidor más barato o más cercano se lleva la familia. Falta un componente de Desempeño medible (ej: hitos de desarrollo reportados mensualmente) que justifique precio premium o lealtad.",
    "impacto_mensual_estimado": "$200–400 de margen no capturado por falta de justificación de precio diferenciado"
  }
]
```
