# QA Checklist - CFO Dashboard Irarrázaval
## Sistema: Dashboard de Análisis Financiero + Make.com + Google Sheets

---

## 1. VALIDACIONES DE ENTRADA (Funcional)

### ✅ A. Formulario de Ingreso de KPIs

| Campo | Validación | Resultado Esperado |
|-------|-----------|-------------------|
| **Fecha** | Requerido | Error si vacío |
| **Venta Total** | > 0 | Error si <= 0 |
| **Gasto Variable** | >= 0 | Error si < 0 |
| **Margen Neto** | 0-100% | Error si fuera de rango |
| **RevPSM** | >= 0 | Error si < 0 |
| **Ticket Promedio** | >= 0 | Error si < 0 |
| **Ocupación** | 0-100% | Error si fuera de rango |
| **Labor Cost** | 0-100% | Error si fuera de rango |

### ✅ B. Normalización CLP

| Input | Output Esperado |
|-------|----------------|
| `$13.500.000` | `13500000` |
| `13.500.000` | `13500000` |
| `13500000` | `13500000` |
| `$ 13 500 000` | `13500000` |
| `13,500,000` | `13500000` |

### ✅ C. Estados de la App

```
idle → validating → calculated → saving → saved
                  ↓              ↓
                error ← ← ← ← error
                  ↓
             reintentar
```

---

## 2. CÁLCULOS (Lógica de Negocio)

### ✅ A. Status "Genio" vs "Figura"

| RevPSM | Status Esperado |
|--------|----------------|
| `25001` | **Genio** ✓ |
| `25000` | **Figura** (límite exacto) |
| `24999` | **Figura** |
| `30000` | **Genio** ✓ |

**Regla:** `status = revPSM > 25000 ? 'Genio' : 'Figura'`

### ✅ B. Payback Days

| Utilidad | Payback Esperado |
|----------|-----------------|
| `200000` | `ceil(18900000 / 200000) = 95 días` |
| `0` | `null` (N/A) |
| `-50000` | `null` (N/A) |
| `100000` | `189 días` |

**Regla:** `payback = utilidad > 0 ? ceil(DERECHO_LLAVES / utilidad) : null`

### ✅ C. ROI

| Venta | Gasto | Utilidad | ROI Esperado |
|-------|-------|----------|-------------|
| `13500000` | `5400000` | `8100000` | `8100000 / 37697000 = 0.2149 (21.49%)` |
| `15600000` | `5850000` | `9750000` | `9750000 / 37697000 = 0.2587 (25.87%)` |

**Regla:** `roi = utilidad / CAPEX_TOTAL`

### ✅ D. Desviación Estándar (σ)

| Cantidad Registros | σ Esperado |
|-------------------|-----------|
| `0` | `0` (sin datos) |
| `1` | `0` (insuficiente) |
| `2+` | `STDEV(valores)` |

**UI:** Muestra "N/A" si `registros.length < 2`

---

## 3. PERSISTENCIA (Upsert por Fecha)

### ✅ A. Guardar Día

**Happy Path:**
```javascript
// Input
{
  date: "2026-02-01",
  venta_clp: 13500000,
  ...
}

// Output localStorage
[
  { date: "2026-02-01", venta_clp: 13500000, ... },
  { date: "2026-01-01", ... }
]
```

**Doble guardado mismo día (Upsert):**
```javascript
// Primera vez
guardar({ date: "2026-02-01", venta: 13500000 })
// → crea registro

// Segunda vez (mismo día)
guardar({ date: "2026-02-01", venta: 15000000 })
// → actualiza registro (NO duplica)
```

### ✅ B. Editar Nota

**Test:**
1. Click en ícono "Editar"
2. Modificar texto
3. Click "Guardar" (✓)
4. Recargar página
5. **Resultado:** Nota persiste

---

## 4. GRÁFICO (σ ROI)

### ✅ A. Visualización

| Cantidad Meses | Resultado |
|---------------|-----------|
| `0` | Muestra "N/A" + mensaje "Haz clic en Simulación" |
| `1` | Muestra "N/A" + mensaje "Se necesita 1 mes más" |
| `2+` | Gráfico completo con banda ±1σ |

### ✅ B. Componentes del Gráfico

- ✅ Línea ROI real (azul, stroke-width: 2)
- ✅ Línea media ROI (verde, dashed)
- ✅ Banda superior (+1σ, área sombreada)
- ✅ Banda inferior (-1σ, área sombreada)
- ✅ Tooltips con valores formateados (4 decimales %)

---

## 5. INTEGRACIÓN MAKE.COM

### ✅ A. Webhook (App → Make)

**Endpoint:** `https://hook.us1.make.com/...`

**Payload de Ejemplo:**
```json
{
  "action": "upsert",
  "table": "LOG_KPI",
  "data": {
    "date": "2026-02-01",
    "capex": 37697000,
    "venta_clp": 13500000,
    "revpsm_clp_m2": 540000,
    "utilidad_clp": 8100000,
    "roi": 0.2149,
    "roi_mean_30d": 0.2149,
    "roi_std_30d": 0,
    "status": "Genio",
    "payback_days": 95,
    "insight": "Mes exitoso...",
    "note": "Diciembre: Temporada alta.",
    "updated_at": "2026-02-22T15:30:00.000Z"
  },
  "timestamp": "2026-02-22T15:30:00.000Z"
}
```

**Response Esperado:**
```json
{
  "ok": true,
  "action": "updated",
  "row": 3,
  "timestamp": "2026-02-22T15:30:01.234Z"
}
```

### ✅ B. Escenario Make (Upsert)

```
1. Webhook Trigger
   ↓
2. Google Sheets: Search Rows
   Filter: Col A = payload.data.date
   ↓
3. Router
   ├─ Path 1 (If row exists)
   │  └─ Google Sheets: Update Row
   │
   └─ Path 2 (If row not found)
      └─ Google Sheets: Add Row
   ↓
4. Webhook Response
   Status: 200 OK
   Body: { ok: true, action: "..." }
```

### ✅ C. Pruebas de Robustez

| Escenario | Resultado Esperado |
|-----------|-------------------|
| **20 requests rápidas** | Queue procesada sin pérdida |
| **Webhook timeout** | UI muestra error + botón "Reintentar" |
| **Sin internet** | Error catch + botón "Reintentar" |
| **Respuesta 5xx** | Error catch + log en console |
| **Doble save mismo segundo** | Último gana (sequential processing) |

---

## 6. GOOGLE SHEETS

### ✅ A. Schema Tab: LOG_KPI

| Col | Campo | Tipo | Ejemplo | Fórmula/Validación |
|-----|-------|------|---------|-------------------|
| **A** | date | DATE | `2026-02-01` | PRIMARY KEY |
| **B** | venta_clp | NUMBER | `13500000` | > 0 |
| **C** | utilidad_clp | NUMBER | `8100000` | Calculado |
| **D** | roi | DECIMAL | `0.2149` | `=C2/37697000` |
| **E** | roi_mean_30d | DECIMAL | `0.2149` | Media rolling |
| **F** | roi_std_30d | DECIMAL | `0.0234` | `=STDEV(FILTER(D:D, A:A>=TODAY()-30))` |
| **G** | revpsm_clp_m2 | NUMBER | `540000` | `=B2/25` |
| **H** | status | TEXT | `Genio` | "Genio" o "Figura" |
| **I** | payback_days | NUMBER | `95` | NULL si utilidad <= 0 |
| **J** | insight | TEXT | `Mes exitoso...` | Max 500 chars |
| **K** | note | TEXT | `Temporada alta...` | EDITABLE, Max 1000 chars |
| **L** | updated_at | TIMESTAMP | `2026-02-22 15:30` | Auto |

### ✅ B. Headers

**Fila 1 (A1:L1):**
```
date | venta_clp | utilidad_clp | roi | roi_mean_30d | roi_std_30d | revpsm_clp_m2 | status | payback_days | insight | note | updated_at
```

**Config Make:**
- ✅ "Table contains headers" = **Yes**
- ✅ "Header row" = **1**

### ✅ C. Fórmulas de Sheets

**Desviación Estándar (Col F):**
```excel
=IF(COUNTA(FILTER(D:D, A:A>=TODAY()-30))>=2, 
   STDEV(FILTER(D:D, A:A>=TODAY()-30)), 
   0)
```

**RevPSM (Col G):**
```excel
=B2/25
```

**ROI (Col D):**
```excel
=C2/37697000
```

---

## 7. MATRIZ DE PRUEBAS (Ejecutables)

### ✅ Test Case 1: Happy Path
**Pasos:**
1. Ingresar fecha: `2026-03-01`
2. Venta: `$14.500.000`
3. Gasto: `$5.800.000`
4. Nota: `Marzo normal`
5. Click "Analizar"
6. Click "Guardar"

**Resultado Esperado:**
- ✅ Utilidad: `$8.700.000`
- ✅ ROI: `23.08%`
- ✅ Status: `Genio` (RevPSM = 580.000)
- ✅ Registro aparece en historial
- ✅ Console log muestra payload Make

---

### ✅ Test Case 2: Utilidad Negativa
**Pasos:**
1. Venta: `5.000.000`
2. Gasto: `6.000.000`
3. Click "Analizar"

**Resultado Esperado:**
- ✅ Utilidad: `-1.000.000`
- ✅ ROI: `-2.65%`
- ✅ Payback: `N/A` (null)
- ✅ Status: `Figura`
- ✅ No crashea

---

### ✅ Test Case 3: RevPSM Límite
**Pasos:**
1. Venta exacta para RevPSM = `25.000`
2. Venta: `625.000` (25 m² × 25.000)
3. Gasto: `200.000`

**Resultado Esperado:**
- ✅ RevPSM: `25.000`
- ✅ Status: `Figura` (porque regla es `> 25000`)

---

### ✅ Test Case 4: Normalización CLP
**Inputs a probar:**
```
$13.500.000
13.500.000
$ 13 500 000
13500000
```

**Resultado Esperado:**
- ✅ Todos normalizan a: `13500000`
- ✅ Preview muestra: `$13.500.000`

---

### ✅ Test Case 5: Doble Guardado (Upsert)
**Pasos:**
1. Guardar fecha `2026-02-01` con venta `13.500.000`
2. Guardar **misma fecha** con venta `15.000.000`
3. Revisar historial

**Resultado Esperado:**
- ✅ Solo 1 registro para `2026-02-01`
- ✅ Venta actualizada: `15.000.000`
- ✅ NO hay duplicados

---

### ✅ Test Case 6: Editar Nota
**Pasos:**
1. Click ícono "Editar" en registro
2. Cambiar texto: `Nueva nota editada`
3. Click "✓"
4. Recargar página (F5)

**Resultado Esperado:**
- ✅ Nota persiste después de recargar
- ✅ Console log muestra payload actualización

---

### ✅ Test Case 7: Gráfico con 1 Mes
**Pasos:**
1. Tener solo 1 registro
2. Ver tab gráfico

**Resultado Esperado:**
- ✅ Muestra "N/A"
- ✅ Mensaje: "Se necesita al menos 1 mes más para calcular desviación"

---

### ✅ Test Case 8: Simulación Prueba
**Pasos:**
1. Click "Simulación"
2. Esperar 1.5s

**Resultado Esperado:**
- ✅ Carga 3 meses: Dic-2025, Ene-2026, Feb-2026
- ✅ Gráfico muestra banda σ
- ✅ Métricas globales actualizadas
- ✅ Estado: `saved` → `idle`

---

### ✅ Test Case 9: Error de Webhook (Retry)
**Pasos:**
1. Simular error webhook (10% random en código)
2. Click "Guardar"
3. Ver alerta error
4. Click "Reintentar"

**Resultado Esperado:**
- ✅ Alerta roja: "Webhook timeout - retry available"
- ✅ Botón "Reintentar" visible
- ✅ Segundo intento: guarda correctamente

---

### ✅ Test Case 10: Accesibilidad (WCAG)
**Pruebas:**
1. Navegación con **Tab** / **Shift+Tab**
2. Labels en todos los inputs
3. Focus visible en botones
4. Errores anunciables (aria-required)

**Resultado Esperado:**
- ✅ Tab order lógico
- ✅ Todos los inputs tienen `aria-label`
- ✅ Focus ring visible (outline)
- ✅ Screen reader anuncia errores

---

## 8. RIESGOS IDENTIFICADOS

| Riesgo | Mitigación |
|--------|-----------|
| **Mapeo frágil (row.F/G/H)** | Usar nombres de columna en Make, no letras |
| **Race conditions** | Sequential processing en Make |
| **Webhook rate limit** | Queue + retry logic |
| **Sin internet** | Error handling + mensaje amigable |
| **Datos corruptos** | Validación estricta en backend |
| **Columnas movidas** | Schema versionado + validation |

---

## 9. PRÓXIMOS PASOS

### ✅ Completado
- [x] Validaciones de entrada
- [x] Normalización CLP
- [x] Estados de app
- [x] Cálculos (ROI, status, payback)
- [x] Gráfico σ con N/A
- [x] Upsert por fecha
- [x] Editar nota persistente
- [x] Simulación prueba
- [x] Error handling + retry
- [x] Accesibilidad básica
- [x] Schema documentado

### 🔜 Pendiente (Producción)
- [ ] Conectar webhook Make real
- [ ] Config Google Sheets con fórmulas
- [ ] Pruebas de carga (20+ requests)
- [ ] Staging + Production split
- [ ] Rollback strategy
- [ ] Monitoring (Sentry/LogRocket)
- [ ] E2E tests (Playwright)

---

## 10. DEFINITION OF DONE (DoD)

### Para cada Feature:
- ✅ Código revisado (self-review)
- ✅ Validaciones implementadas
- ✅ Error handling completo
- ✅ Console logs informativos
- ✅ Accesibilidad (labels, aria)
- ✅ Responsive (mobile + desktop)
- ✅ Test manual exitoso
- ✅ Documentación actualizada

### Para Release:
- ✅ Todos los Test Cases pasan
- ✅ Simulación funciona
- ✅ No hay console errors
- ✅ Performance < 3s guardado
- ✅ Schema Make + Sheets alineados
- ✅ Changelog actualizado

---

## 11. CONTACTO Y SOPORTE

**Proyecto:** CFO Dashboard Irarrázaval  
**Stack:** React + Tailwind + Make.com + Google Sheets  
**Última actualización:** 22-Feb-2026  

**Webhook Make:** `MAKE_WEBHOOK_URL` (reemplazar en producción)  
**Sheet ID:** `[TU_SHEET_ID_AQUI]`  
**Tab:** `LOG_KPI`

---

**Estado QA:** ✅ **APROBADO PARA STAGING**
