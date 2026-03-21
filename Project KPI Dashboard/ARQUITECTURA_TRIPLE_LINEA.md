# 🏗️ Arquitectura Triple Línea - CFO Dashboard Irarrázaval

## 📊 Resumen Ejecutivo

Sistema de análisis financiero separado por 3 líneas de negocio con márgenes distintos:
- ☕ **Cafetería**: 68% margen (32% COGS)
- 💻 **Hotdesk/Cowork**: 92.5% margen (7.5% COGS)
- 📊 **Asesorías CFO**: 100% margen (0% COGS)

---

## 🎯 Separación de Responsabilidades

### BASE_DIARIA (Inputs)
- **Función**: Captura transacciones diarias crudas
- **Origen**: POS, registros manuales
- **Estructura**: Fecha, Monto, Categoría
- **No se toca en Make**

### LOG_KPI_TRIPLE (Análisis)
- **Función**: Almacena métricas calculadas mensuales
- **Origen**: CFO Dashboard → Make → Google Sheets
- **Estructura**: 21 columnas (A-U)
- **Es la fuente de verdad para reportes**

---

## 📋 Schema Google Sheets - LOG_KPI_TRIPLE

```
COLUMNA | NOMBRE                  | TIPO      | FÓRMULA/VALOR
--------|-------------------------|-----------|------------------
A       | date                    | DATE      | Manual (YYYY-MM-DD)
B       | venta_cafe_clp          | NUMBER    | Manual
C       | venta_hotdesk_clp       | NUMBER    | Manual
D       | venta_asesoria_clp      | NUMBER    | Manual
E       | cogs_cafe_clp           | NUMBER    | =B*0.32
F       | cogs_hotdesk_clp        | NUMBER    | =C*0.075
G       | cogs_asesoria_clp       | NUMBER    | =0
H       | margen_cafe_clp         | NUMBER    | =B-E
I       | margen_hotdesk_clp      | NUMBER    | =C-F
J       | margen_asesoria_clp     | NUMBER    | =D
K       | venta_total_clp         | NUMBER    | =B+C+D
L       | cogs_total_clp          | NUMBER    | =E+F+G
M       | margen_bruto_clp        | NUMBER    | =K-L
N       | gastos_operacion_clp    | NUMBER    | Manual
O       | utilidad_neta_clp       | NUMBER    | =M-N
P       | margen_neto_percent     | NUMBER    | =IF(K>0,O/K*100,0)
Q       | revpsm_clp_m2           | NUMBER    | =K/25
R       | roi                     | NUMBER    | =O/37697000
S       | status                  | TEXT      | =IF(O>150000,"Genio","Figura")
T       | linea_dominante         | TEXT      | =IF(H>MAX(I,J),"cafe",IF(I>MAX(H,J),"hotdesk","asesoria"))
U       | alerta_canibalizacion   | TEXT      | =IF(J>H*0.5,"⚠️ Asesorías > Café","-")
V       | nota                    | TEXT      | Manual
```

### ⚠️ REGLA DE ORO: NO usar $ en celdas
❌ Malo: `$13.500.000`
✅ Bueno: `13500000`

**Razón**: El símbolo $ se queda pegado como texto y rompe todas las fórmulas de ROI/Payback.

---

## 🔗 Flujo Make.com

```
┌─────────────────────────┐
│ CFO Dashboard (Figma)   │
│ Usuario ingresa:        │
│ - Venta Café            │
│ - Venta Hotdesk         │
│ - Venta Asesoría        │
│ - Gastos Operación      │
└───────────┬─────────────┘
            │ HTTP POST
            ▼
┌─────────────────────────┐
│ Make Webhook            │
│ Headers: ON             │
│ JSON Payload            │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Google Sheets           │
│ Search Rows (Col A)     │
│ Buscar por date         │
└───────────┬─────────────┘
            │
       ┌────┴────┐
       │ Router  │
       └────┬────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐    ┌────────┐
│ Update │    │ Add    │
│ Row    │    │ Row    │
└────────┘    └────────┘
    │               │
    └───────┬───────┘
            │
            ▼
┌─────────────────────────┐
│ Response 200 OK         │
│ {status: "saved",       │
│  row: 42}               │
└─────────────────────────┘
```

### Payload JSON Ejemplo

```json
{
  "action": "upsert",
  "table": "LOG_KPI_TRIPLE",
  "data": {
    "date": "2025-03-01",
    "venta_cafe_clp": 8500000,
    "venta_hotdesk_clp": 3200000,
    "venta_asesoria_clp": 1800000,
    "cogs_cafe_clp": 2720000,
    "cogs_hotdesk_clp": 240000,
    "cogs_asesoria_clp": 0,
    "margen_cafe_clp": 5780000,
    "margen_hotdesk_clp": 2960000,
    "margen_asesoria_clp": 1800000,
    "venta_total_clp": 13500000,
    "cogs_total_clp": 2960000,
    "margen_bruto_clp": 10540000,
    "gastos_operacion_clp": 5400000,
    "utilidad_neta_clp": 5140000,
    "margen_neto_percent": 38.07,
    "revpsm_clp_m2": 540000,
    "roi": 0.0001364,
    "status": "Genio",
    "linea_dominante": "cafe",
    "alerta_canibalizacion": "",
    "nota": "Marzo: Inicio operaciones"
  },
  "timestamp": "2025-03-01T10:30:00.000Z"
}
```

---

## 🚨 Alertas Automáticas

### 1. Canibalización (Asesorías > Café)
```javascript
// Make formula
if (margen_asesoria_clp > margen_cafe_clp * 0.5) {
  send_alert_slack({
    text: "⚠️ Las asesorías generan más margen que el café",
    action: "Evaluar espacio para reuniones privadas"
  });
}
```

### 2. Status FIGURA (Utilidad < $150k)
```javascript
if (utilidad_neta_clp <= 150000) {
  send_alert_whatsapp({
    to: "+56912345678",
    message: "🔴 Mes FIGURA. Utilidad: $" + utilidad_neta_clp
  });
}
```

### 3. Línea Dominante Cambia
```javascript
if (linea_dominante_mes_actual !== linea_dominante_mes_anterior) {
  log_event("shift_business_line", {
    from: linea_dominante_mes_anterior,
    to: linea_dominante_mes_actual,
    date: fecha
  });
}
```

---

## 📊 KPIs por Rol

### Barista Leader
- **Meta**: Venta Café > $450k/día
- **Dashboard**: "¿Cuántos snacks vendimos con el café?"
- **Alerta**: Ticket promedio < $3.500

### Admin Tech (Hotdesk)
- **Meta**: Ocupación > 70%
- **Dashboard**: "¿El internet simétrico está estable hoy?"
- **Alerta**: Ocupación < 50% por 3 días consecutivos

### CFO (Tú - Asesorías)
- **Meta**: Asesorías > 2 por semana
- **Dashboard**: "¿Cuál es el ROI del tiempo invertido?"
- **Alerta**: Asesorías canibalizando operación

---

## 🎨 Integración Figma Sync

Variables sincronizadas en tiempo real:

```javascript
// Desde Make → Figma API
{
  "variables": {
    "utilidad_neta": registro.utilidad_neta_clp,
    "status_color": registro.status === "Genio" ? "#10b981" : "#eab308",
    "linea_dominante_icon": {
      "cafe": "☕",
      "hotdesk": "💻",
      "asesoria": "📊"
    }[registro.linea_dominante],
    "roi_percent": (registro.roi * 100).toFixed(4)
  }
}
```

URL del site: `https://pouch-growl-74881457.figma.site/reportes`

---

## 🔧 Próximos Pasos

### ✅ Ya implementado
- [x] Separación triple línea en formulario
- [x] Cálculo automático de COGS por línea
- [x] Detección de línea dominante
- [x] Alertas de canibalización
- [x] Webhook payload correcto
- [x] Eliminación de exportaciones JSON/CSV
- [x] Context global con métricas por línea

### 🚧 Pendiente
- [ ] Crear tab LOG_KPI_TRIPLE en Google Sheets
- [ ] Configurar Make scenario con webhook
- [ ] Probar flujo completo con datos reales
- [ ] Configurar alertas Slack/WhatsApp
- [ ] Integrar Figma Sync variables
- [ ] Dashboard embebido en Figma Site

---

## 📞 Soporte

**Documentación Make**: https://www.make.com/en/help/scenarios  
**API Google Sheets**: https://developers.google.com/sheets/api  
**Figma Variables**: https://help.figma.com/hc/en-us/articles/15339657135383

---

_Última actualización: 22 Feb 2026_
_Versión: 2.0 - Triple Línea_
