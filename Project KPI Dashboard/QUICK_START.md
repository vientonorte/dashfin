# 🚀 QUICK START - CFO Dashboard Triple Línea

## ⚡ En 3 Pasos

### 1️⃣ Ver Dashboard con Datos Simulados (0 min)
```
✅ Ya está funcionando con 12 meses de datos realistas
✅ Abre la app y ve directamente a la tab "Home"
✅ Explora las métricas, gráficos y alertas
```

### 2️⃣ Ingresar Tu Primer Mes Real (2 min)
```
1. Tab "Home" → Formulario Triple Línea
2. Ingresar fecha: 2026-03-01
3. Ventas por línea:
   ☕ Café: 8500000
   💻 Hotdesk: 3200000
   📊 Asesorías: 1800000
4. Gastos Operación: 5400000
5. Click "1. Analizar"
6. Revisar preview verde
7. Click "2. Guardar → LOG_KPI"
✅ Listo! Tu primer mes registrado
```

### 3️⃣ Conectar Make + Google Sheets (15 min)
```
Ver instrucciones completas en:
📄 /ARQUITECTURA_TRIPLE_LINEA.md (sección "Flujo Make.com")
📄 /RESUMEN_IMPLEMENTACION.md (sección "Google Sheets Setup")
```

---

## 🎯 Navegación Rápida

### Tab "Home" (Control Maestro)
- **Qué hace**: Ingresar datos mensuales, análisis y guardado
- **Cuándo usarlo**: Al final de cada mes
- **Output**: Datos → Context → Todas las vistas

### Tab "Sync"
- **Qué hace**: Sincronización con Figma variables
- **Cuándo usarlo**: Para actualizar el Figma Site
- **Output**: Variables ROI, status, línea dominante

### Tab "Metas"
- **Qué hace**: KPIs por rol (Barista, Admin, CFO)
- **Cuándo usarlo**: Para revisar cumplimiento
- **Output**: Semáforos verde/amarillo/rojo

### Tab "Webhook"
- **Qué hace**: Configurar alertas automáticas
- **Cuándo usarlo**: Setup inicial
- **Output**: Alerts a Slack/WhatsApp

### Tab "G&F" (Genio y Figura)
- **Qué hace**: Clasificación por utilidad neta
- **Cuándo usarlo**: Para ver evolución status
- **Output**: Contador Genio vs Figura

---

## 💡 Tips de Uso

### ✅ DO
- Ingresar datos al finalizar cada mes
- Revisar "Línea Dominante" mensualmente
- Prestar atención a alertas de canibalización
- Usar rangos temporales (1M, 3M, 6M) para análisis

### ❌ DON'T
- No mezclar líneas de negocio en un solo monto
- No usar símbolo `$` en Google Sheets (rompe fórmulas)
- No ignorar alertas de canibalización
- No olvidar backup de localStorage

---

## 📊 Interpretar las Métricas

### Recuperado CAPEX
```
$20M recuperado de $37.697M total
53.1% → Falta 46.9% para recuperar inversión
```

### Media ROI
```
1.5% mensual promedio
→ En 7 meses recuperas el derecho de llaves
```

### Línea Dominante
```
☕ Café → Normal (base del negocio)
💻 Hotdesk → Oportunidad de crecimiento
📊 Asesorías → ⚠️ Considerar espacio dedicado
```

### Alerta Canibalización
```
"Asesorías > 50% margen Café"
→ Acción: Evaluar espacio para reuniones privadas
→ ROI: Mayor margen, menor CAPEX adicional
```

---

## 🎲 Regenerar Simulación

Si quieres empezar de cero con nuevos datos simulados:

```
1. Scroll hasta el alert azul "🎲 Datos Simulados Cargados"
2. Click "Regenerar Simulación"
3. Confirmar
4. La app se recarga con nuevos 12 meses
```

**Usar cuando:**
- Quieres hacer demos con diferentes escenarios
- Necesitas resetear todo y empezar limpio
- Quieres ver cómo cambia la estacionalidad

---

## 🔥 Casos de Uso Reales

### Caso 1: Fin de Mes (Rutina)
```
Día 1 del mes siguiente:
1. Abrir dashboard → Tab "Home"
2. Ingresar ventas del mes pasado (3 líneas)
3. Ingresar gastos operación
4. Analizar + Guardar
5. Revisar si status = GENIO o FIGURA
6. Tomar decisiones estratégicas
```

### Caso 2: Planificación Trimestral
```
1. Tab "Home" → Selector "3M"
2. Ver gráfico de márgenes por línea
3. Identificar línea dominante
4. Proyectar siguiente trimestre
5. Ajustar estrategia (más café vs más asesorías)
```

### Caso 3: Reunión con Socios
```
1. Tab "Home" → Selector "H" (Histórico)
2. Ver evolución ROI 12 meses
3. Mostrar payback progress
4. Explicar línea dominante
5. Justificar decisiones con datos
```

### Caso 4: Alerta Crítica
```
Si utilidad_neta < $150k:
1. Status = FIGURA (badge amarillo)
2. Alert automático (si webhook configurado)
3. Revisar gráfico de márgenes
4. Identificar línea con problemas
5. Acción correctiva inmediata
```

---

## 📱 Acceso Rápido (Keyboard Shortcuts)

```
Ctrl + F → Buscar en historial
Ctrl + R → Regenerar simulación (si confirmado)
Tab → Navegar entre inputs del formulario
Enter → Analizar datos (si cursor en form)
```

---

## 🆘 Troubleshooting

### "No veo los 12 meses simulados"
```
1. Abrir DevTools (F12)
2. Console → Ver si hay errores
3. Application → localStorage → Buscar "historial_kpi_log_triple"
4. Si no existe → Recargar página (F5)
```

### "Los gráficos están vacíos"
```
1. Verificar que haya datos en historial
2. Tab "Home" → Selector temporal → Click "Histórico"
3. Si persiste → Regenerar simulación
```

### "No se guarda el registro"
```
1. Verificar que todos los campos estén llenos
2. Ver alert rojo de validación
3. Revisar Console por errores
4. Si todo OK → Simulated webhook OK (2s delay)
```

### "Línea dominante incorrecta"
```
1. Revisar cálculo: MAX(margen_cafe, margen_hotdesk, margen_asesoria)
2. Verificar COGS: Café 32%, Hotdesk 7.5%, Asesoría 0%
3. Comparar márgenes netos de cada línea
```

---

## 🎓 Conceptos Clave

### COGS (Cost of Goods Sold)
```
Café: 32% del precio de venta (granos, leche, insumos)
Hotdesk: 7.5% (electricidad, internet)
Asesoría: 0% (solo tu tiempo)
```

### Margen vs Utilidad
```
Margen Bruto = Venta - COGS
Utilidad Neta = Margen Bruto - Gastos Operación
```

### ROI
```
ROI = Utilidad Neta / CAPEX Total ($37.697M)
1% mensual = 12% anual
→ Payback en ~8 años si constante
```

### Genio vs Figura
```
Utilidad > $150k = GENIO ✅
Utilidad ≤ $150k = FIGURA ⚠️
Meta: >70% meses GENIO en año 1
```

---

## 📚 Documentación Completa

- **Arquitectura**: `/ARQUITECTURA_TRIPLE_LINEA.md`
- **QA y Testing**: `/QA_TRIPLE_LINEA.md`
- **Resumen**: `/RESUMEN_IMPLEMENTACION.md`
- **Este documento**: `/QUICK_START.md`

---

## ✨ Tip Final

> "Los datos son tu nuevo CFO. Confía en ellos más que en tu intuición. Si el dashboard dice 'Las asesorías generan más margen que el café', escúchalo y pivotea."

---

¡Listo para proteger tu inversión de $18.900.000! 🚀☕💻📊

_Quick Start Guide - v2.0_  
_22 Feb 2026_
