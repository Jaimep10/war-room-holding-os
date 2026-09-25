---
modo: negocio-existente
giro: Servicios
etapa: Filtro 1 - Viabilidad
facturacion_mensual: 10000
margen_actual_pct: 15
empleados: 4
principal_dolor: Ventas inestables
---
# NEGOCIO-EXISTENTE-ESTRELLITAS-DAY-CARE: Diagnóstico de Mejora — estrellitas day care 

**Modo:** Mejorar Negocio Existente (Modo 3)

## Insumos del usuario

- **Nombre del negocio:** estrellitas day care 
- **Giro:** Servicios
- **Facturación mensual actual:** $10000
- **Margen actual:** 15%
- **Número de empleados:** 4
- **Principal dolor declarado:** Ventas inestables

**Estado:** Pendiente de reunión de 7 agentes (Operaciones + Compras + Finanzas + Talento + Cliente + Producto + Legal) para el diagnóstico de Fugas, Palancas y Plan 90 Días.
**Registrada:** 2026-09-22


---

## Resultado de la Reunión (Operaciones + Compras + Finanzas + Talento + Cliente + Producto + Legal)

```json
[
  {
    "area": "Finanzas",
    "detalle": "Margen 15% es bajo para servicios de cuidado infantil (estándar industria 25-35%). Capital inmovilizado en materiales/juguetes sin rotación clara, y probable falta de separación Profit First entre utilidad real vs. gastos operativos.",
    "impacto_mensual_estimado": "$1,000-$1,500 (diferencia entre margen actual y objetivo 25%)"
  },
  {
    "area": "Operaciones",
    "detalle": "Ratio niño:adulto probablemente subóptimo (4 empleados para $10k/mes = $2,500/empleado). Restricción en capacidad instalada: si cada educadora atiende 6-8 niños según normativa, máximo 24-32 niños, pero sin proceso claro de admisión/lista de espera se pierden cupos.",
    "impacto_mensual_estimado": "$800-$1,200 (cupos vacíos por falta de sistema de llenado continuo)"
  },
  {
    "area": "Cliente",
    "detalle": "Ventas inestables indica alta deserción (churn) o dependencia de inscripciones puntuales (inicio de año/trimestre). Sin medición de NPS ni causa raíz de por qué familias se van: ¿precio, horarios rígidos, falta de comunicación diaria con padres?",
    "impacto_mensual_estimado": "$600-$1,000 (costo de reemplazar familias que desertan vs. retenerlas)"
  },
  {
    "area": "Talento",
    "detalle": "Rotación típica en cuidado infantil 30-40% anual. Con 4 empleados, reemplazar 1-2 al año cuesta 0.5-1x salario anual c/u en reclutamiento + capacitación + pérdida de confianza de familias. Probable falta de claridad de roles (educadora vs. asistente vs. administrativo).",
    "impacto_mensual_estimado": "$400-$700 (prorrateado costo de rotación + productividad reducida)"
  },
  {
    "area": "Producto",
    "detalle": "Servicio probablemente sin diferenciación clara: horarios estándar (7am-6pm), sin opciones flexibles (medio tiempo, drop-in, horario extendido) que capturen familias con necesidades no cubiertas. Faltan características Kano de desempeño (comunicación app/fotos diarias, menú saludable visible, curriculum estructurado).",
    "impacto_mensual_estimado": "$500-$800 (familias que eligen competencia por mejor propuesta de valor percibida)"
  },
  {
    "area": "Legal",
    "detalle": "Contratos con familias probablemente genéricos: sin cláusulas claras de política de enfermedad, pagos por reserva de cupo, penalidad por retiro anticipado, ni cobertura de responsabilidad civil profesional actualizada. Un solo incidente sin blindaje contractual puede costar meses de utilidad.",
    "impacto_mensual_estimado": "$300-$500 (riesgo de pérdida por disputas de pago o retiros sin aviso)"
  }
]
```
