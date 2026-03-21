# Sistema de Webhooks Make y Metas por Rol - CFO Dashboard Ratio Irarrázaval

## 📊 Resumen Ejecutivo

El CFO Dashboard ahora incluye un sistema completo de automatización y control operacional que reduce el tiempo de gestión de **12 horas a 4 horas**, protegiendo el patrimonio de **$37.697.000 CLP** del local Irarrázaval.

---

## 🎯 Metas por Rol (Sistema de Protección)

### Estructura del Equipo (4 personas)

| Rol | KPI Principal | Meta Diaria | Consulta Dashboard | Acción Correctiva | Columna Sheets |
|-----|---------------|-------------|-------------------|-------------------|----------------|
| **Administrador** | Utilidad Neta | > $200.000 | ¿El Gasto Variable (Col E) está controlado? | Ajustar pedidos de insumos o turnos | H (Utilidad) |
| **Barista 1 (Full)** | Ticket Promedio | > $6.500 | ¿Estamos haciendo Upselling de pastelería? | Reforzar sugerencia de acompañamiento | J (Ticket) |
| **Barista 2 (Full)** | RevPSM | > $25.000 | ¿El flujo de Irarrázaval está entrando? | Mejorar visibilidad exterior, rotación mesas | G (RevPSM) |
| **Barista 3 (30h)** | Conversión Hot Desk | > 40% | ¿Los usuarios digitales consumen café? | Ofrecer "Refill" con descuento | L (Conversión) |

---

## ⚡ Configuración Webhook Make (Integromat)

### MÓDULO 1: Google Sheets - Watch Rows
```
Trigger: On New/Updated Row
Spreadsheet: [Tu Google Sheet de Ventas]
Worksheet: "DatosVentas"
Column Range: A-K
```

### MÓDULO 2: Router (4 Rutas de Severidad)

#### 🔴 RUTA 1: Alerta "Figura" (Gasto Elevado)
```
Filtro: {{Column I}} > 30
Condición: Porcentaje de Gasto Variable > 30%
Acción: Telegram/Email → Admin + Barista 1
Mensaje: "🔴 FIGURA: Gasto Variable al {{Column I}}%"
Prioridad: ALTA
```

#### 🟡 RUTA 2: Alerta "Genio" (Venta Baja)
```
Filtro: {{Column G}} < 15000
Condición: RevPSM < $15.000 CLP/m²
Acción: Push Notification → Admin + Barista 2
Mensaje: "🟡 GENIO: RevPSM bajo en ${{Column G}}"
Prioridad: MEDIA
```

#### 🚨 RUTA 3: Alerta Crítica (Margen Neto)
```
Filtro: {{Column K}} < 25
Condición: Margen Neto < 25%
Acción: SMS + Email → Admin (Inmediato)
Mensaje: "🚨 CRÍTICO: Margen Neto al {{Column K}}%"
Prioridad: CRÍTICA
```

#### 🎉 RUTA 4: Notificación Récord (Motivacional)
```
Filtro: {{Column G}} > Max(Column G)
Condición: RevPSM supera máximo histórico
Acción: Push Notification → Todo el Staff (4 personas)
Mensaje: "🎉 ¡RÉCORD! RevPSM de ${{Column G}}"
Efecto: Refuerza comportamientos positivos
```

### MÓDULO 3: Google Sheets - Update Row
```
Columna M: Status = "Alerta Enviada"
Columna N: Timestamp = {{NOW}}
```

---

## 🔗 Integración con Figma (Pouch Growl Reportes)

### Plugin: Sync to Figma

#### Variables a Sincronizar:
```javascript
#StatusPayback → Cambia a VERDE cuando Col H > $18.900.000
#Admin_Utilidad → Columna H (Utilidad Neta)
#Barista1_Ticket → Columna J (Ticket Promedio)
#Barista2_RevPSM → Columna G (RevPSM)
#Barista3_Conversion → Columna L (Conversión Hot Desk)
```

#### Código de Color Automático:
```
🟢 VERDE: Meta cumplida (>100%)
🟡 AMARILLO: En riesgo (80-99%)
🔴 ROJO: Crítico (<80%)
```

---

## 📱 Sistema de Notificaciones

### Tipos de Alerta

| Tipo | Canal | Destinatario | Tiempo de Respuesta |
|------|-------|--------------|---------------------|
| Crítica | SMS + Email | Admin | Inmediato (< 5 min) |
| Alerta | Push + Email | Admin + Rol específico | < 15 min |
| Récord | Push | Todo el staff | Celebración |
| Info | Email | Admin | EOD (End of Day) |

---

## 🎯 Buenas Prácticas Implementadas

### ✅ Accesibilidad (A11y)
- ARIA labels en todos los elementos interactivos
- Lectores de pantalla compatibles
- Navegación por teclado optimizada
- Contraste de colores WCAG 2.1 AA

### ✅ UX Writing
- Textos orientados a la acción: "Analizar Datos" vs "Enviar"
- Mensajes contextuales según estado del KPI
- Feedback inmediato con estados de carga
- Tooltips informativos con iconos

### ✅ UI/UX
- Sistema semáforo consistente (🟢🟡🔴)
- Estados de carga visuales con spinners
- Hover effects y transiciones suaves
- Jerarquía visual clara con iconos por rol
- Design responsive móvil-first

---

## 📊 Impacto en Eficiencia

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tiempo de análisis | 12h/semana | 4h/semana | **-67%** |
| Alertas manuales | 100% manual | 100% automático | **Automatizado** |
| Visibilidad de KPIs | Post-mortem | Tiempo real | **Real-time** |
| Coordinación staff | Reuniones | Notificaciones | **Asíncrona** |

---

## 🚀 Próximos Pasos

1. **Conectar Google Sheets**: Vincular tu hoja de ventas real
2. **Configurar Webhook Make**: Usar la URL generada en make.com
3. **Probar Alertas**: Enviar datos de prueba para validar rutas
4. **Sincronizar Figma**: Instalar plugin "Sync to Figma"
5. **Capacitar Staff**: Mostrar dashboard a las 4 personas del equipo

---

## 📞 Soporte Técnico

- **Webhook URL**: `https://hook.make.com/YOUR_WEBHOOK_ID`
- **Google Sheets API**: Requiere permisos de lectura/escritura
- **Figma Plugin**: "Sync to Figma" (gratis en Community)

---

**🎉 El salto de 12h → 4h te permite iterar sobre la rentabilidad real, no solo sobre la estética.**

