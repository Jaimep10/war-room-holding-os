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
    "area": "Finanzas",
    "detalle": "Margen de 15% es extremadamente bajo para servicios de cuidado infantil (industria promedio 25-35%). Indica precios por debajo de mercado o costos operativos inflados sin justificación.",
    "impacto_mensual_estimado": "$800-1600 (dejando de capturar margen saludable)"
  },
  {
    "area": "Cliente",
    "detalle": "Ventas inestables señalan alta deserción (churn) o dependencia de inscripciones estacionales sin estrategia de retención. En day care, perder un niño inscrito cuesta 3-5 meses de cupo vacío hasta reemplazarlo.",
    "impacto_mensual_estimado": "$1200-2000 (cupos vacíos por rotación evitable)"
  },
  {
    "area": "Operaciones",
    "detalle": "Con 4 empleados y $8000/mes, el ingreso por empleado es $2000/mes — restricción clara de capacidad. Sin conocer ratio niño:adulto ni cupos totales vs. ocupados, probable cuello de botella en capacidad instalada no explotada.",
    "impacto_mensual_estimado": "$400-800 (cupos disponibles no vendidos por falta de proceso comercial)"
  },
  {
    "area": "Producto",
    "detalle": "Sin dato de NPS ni quejas documentadas, pero ventas inestables indican que servicio básico (seguridad, higiene, comunicación con padres) puede tener huecos. Un solo incidente no resuelto genera boca a boca negativo que cierra ventas futuras.",
    "impacto_mensual_estimado": "$600-1000 (ventas perdidas por reputación o experiencia inconsistente)"
  },
  {
    "area": "Talento",
    "detalle": "Ratio 4 empleados para $8000/mes de ingresos: si el costo de nómina está por encima del 50% de ingresos (estándar en day care es 40-45%), cada punto porcentual extra de rotación o ineficiencia de planilla cuesta directamente al margen.",
    "impacto_mensual_estimado": "$400-600 (sobrecosto de nómina o turnos ineficientes)"
  },
  {
    "area": "Compras",
    "detalle": "Insumos de day care (alimentos, pañales, materiales didácticos) son ítems de apalancamiento (muchos proveedores, alto impacto). Compra no estructurada o sin negociación de volumen puede estar inflando costos 10-15%.",
    "impacto_mensual_estimado": "$300-500 (sobrecosto evitable en insumos recurrentes)"
  }
]
```
