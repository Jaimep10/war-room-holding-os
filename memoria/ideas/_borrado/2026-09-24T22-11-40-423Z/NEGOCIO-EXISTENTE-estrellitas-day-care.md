---
modo: negocio-existente
giro: Servicios
etapa: Filtro 1 - Viabilidad
facturacion_mensual: 10000
margen_actual_pct: 20
empleados: 4
principal_dolor: Ventas inestables
---
# NEGOCIO-EXISTENTE-ESTRELLITAS-DAY-CARE: Diagnóstico de Mejora — estrellitas day care

**Modo:** Mejorar Negocio Existente (Modo 3)

## Insumos del usuario

- **Nombre del negocio:** estrellitas day care
- **Giro:** Servicios
- **Facturación mensual actual:** $10000
- **Margen actual:** 20%
- **Número de empleados:** 4
- **Principal dolor declarado:** Ventas inestables

**Estado:** Pendiente de reunión de 7 agentes (Operaciones + Compras + Finanzas + Talento + Cliente + Producto + Legal) para el diagnóstico de Fugas, Palancas y Plan 90 Días.
**Registrada:** 2026-09-22


---

## Resultado de la Reunión (Operaciones + Compras + Finanzas + Talento + Cliente + Producto + Legal)

```json
[
  {
    "area": "Finanzas - Capital inmovilizado en cuentas por cobrar",
    "detalle": "Con $10k de facturación mensual y margen 20% ($2k utilidad), si el ciclo de cobro promedio en guarderías es 15-30 días (padres pagan fin de mes o con retraso), hay entre $5k-$10k atrapados en CxC. Costo de oportunidad: ~$150-300/mes en intereses o liquidez perdida.",
    "impacto_mensual_estimado": "$150-300"
  },
  {
    "area": "Talento - Rotación de cuidadoras",
    "detalle": "Con 4 empleados en guardería (típicamente 3 cuidadoras + 1 admin/gerente), si la rotación anual es 50% (estándar del sector), reemplazar 2 personas/año cuesta ~1.5× salario mensual c/u en reclutamiento, capacitación y errores de curva de aprendizaje. Si salario promedio es $500, costo real: $1,500 total anuales = $125/mes diluido.",
    "impacto_mensual_estimado": "$125"
  },
  {
    "area": "Cliente - Churn silencioso (familias que no renuevan)",
    "detalle": "Ventas inestables sugiere churn estacional o por falta de seguimiento. Si 20% de familias no renuevan trimestre siguiente y CAC real (recomendación boca a boca + tiempo de venta) es $100/familia, cada familia perdida cuesta $100 en reposición. Con ~15-20 niños inscritos (asumiendo $500-650/niño/mes), perder 3-4 familias/trimestre = $300-400 desperdiciados en CAC.",
    "impacto_mensual_estimado": "$100-133"
  },
  {
    "area": "Operaciones - Cupo subutilizado (restricción no explotada)",
    "detalle": "Con 4 empleados y ratio legal Ecuador ~1:8 (1 cuidadora por 8 niños), capacidad instalada es ~24 niños. Si facturación $10k con ticket $600/niño/mes promedio, solo hay ~17 niños. 7 cupos vacíos × $600 = $4,200 de ingreso perdido, o ~$840 de utilidad perdida (20% margen) por no llenar capacidad existente.",
    "impacto_mensual_estimado": "$840"
  },
  {
    "area": "Producto - Servicios básicos sin resolver (Kano)",
    "detalle": "Ventas inestables puede indicar insatisfacción en básicos: horario inflexible, comunicación diaria padres-cuidadoras ausente, alimentación no clara. Si 15% de familias se van por básicos no cumplidos (vs. precio), y LTV familia es $3,600 (6 meses × $600), cada familia perdida por calidad = $3,600 × 20% margen = $720 utilidad perdida. 1 familia cada 2 meses = $360/mes promedio.",
    "impacto_mensual_estimado": "$360"
  },
  {
    "area": "Legal - Contratos de servicio sin cláusulas clave",
    "detalle": "Guarderías enfrentan riesgo de accidentes, enfermedad, retiro anticipado. Sin cláusula de responsabilidad limitada, política de reembolsos clara y exención de fuerza mayor (cierre sanitario), una disputa legal cuesta $1,000-3,000 en abogado + reputación. Probabilidad baja (5%/año) pero impacto alto: costo esperado ~$50-125/mes.",
    "impacto_mensual_estimado": "$50-125"
  }
]
```
