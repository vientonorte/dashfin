# 🏃‍♂️ SCRUM - PRODUCT BACKLOG
**CFO Dashboard Irarrázaval 2100 - Backlog Priorizado Post-Design Thinking**

---

## 📋 METODOLOGÍA SCRUM

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  PRODUCT BACKLOG → SPRINT PLANNING → SPRINT (2 semanas) │
│                          ↓                               │
│                    DAILY STANDUP                         │
│                          ↓                               │
│              SPRINT REVIEW + RETROSPECTIVE               │
│                          ↓                               │
│                    INCREMENTO FUNCIONAL                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Roles Scrum:
- **🎯 Product Owner:** CFO Rodrigo Castro (decide prioridades)
- **👨‍💻 Scrum Master:** Tech Lead (facilita proceso)
- **👥 Dev Team:** 1 Full-Stack Developer + 1 QA

### Definiciones:
- **Sprint:** 2 semanas (10 días hábiles)
- **Story Points:** Fibonacci (1, 2, 3, 5, 8, 13, 21)
- **Velocity Esperada:** 30-40 SP por sprint
- **Definition of Done:** Ver sección final

---

## 📦 PRODUCT BACKLOG COMPLETO

### Leyenda:
- 🔴 **CRÍTICO** - Blocker de producción
- 🟠 **IMPORTANTE** - High value, debe hacerse pronto
- 🟡 **DESEABLE** - Nice to have, mejora UX
- 🟢 **OPCIONAL** - Backlog futuro

### Estimación Story Points:
```
1 SP  = 1-2 horas (trivial)
2 SP  = 2-4 horas (simple)
3 SP  = 4-8 horas (pequeño)
5 SP  = 1-2 días (medio)
8 SP  = 2-3 días (grande)
13 SP = 1 semana (muy grande)
21 SP = Requiere split (épica)
```

---

## 🎯 ÉPICAS Y USER STORIES

### ÉPICA 1: Export y Compartir (21 SP) 🔴

#### US-001: Como CFO, quiero exportar InformeEjecutivo en PDF
```
COMO: CFO / Rodrigo
QUIERO: Exportar el Informe Ejecutivo SOP como PDF
PARA: Compartirlo con socios e inversionistas sin perder formato

CRITERIOS DE ACEPTACIÓN:
✅ Botón "Exportar PDF" visible en InformeEjecutivo
✅ PDF se genera en <5 segundos
✅ PDF incluye: Header, KPIs, Gráficos, Alertas, Recomendaciones
✅ PDF se descarga automáticamente con nombre: informe-ejecutivo-YYYY-MM.pdf
✅ Toast notification: "✅ PDF descargado exitosamente"
✅ PDF mantiene colores y formato del dashboard
✅ Funciona en Chrome, Safari, Firefox

NOTAS TÉCNICAS:
- Usar jsPDF + html2canvas
- Convertir gráficos Recharts a imágenes
- Formato A4 portrait
- Resolución 300dpi para impresión

DEFINITION OF DONE:
□ Código implementado y pusheado
□ Tests unitarios (coverage >80%)
□ Testeado en 3 navegadores
□ Documentación técnica actualizada
□ Demo aprobado por Product Owner
□ Deploy a staging exitoso

PRIORIDAD: 🔴 CRÍTICA
STORY POINTS: 8
SPRINT: Sprint 1
DEPENDENCIAS: Ninguna
```

---

#### US-002: Como CFO, quiero preview del PDF antes de descargar
```
COMO: CFO / Rodrigo
QUIERO: Ver un preview del PDF antes de descargarlo
PARA: Asegurarme de que el contenido es correcto

CRITERIOS DE ACEPTACIÓN:
✅ Al hacer click en "Exportar PDF", se abre modal con preview
✅ Preview muestra las primeras 2 páginas del PDF
✅ Botones: "Descargar", "Cancelar", "Ajustar configuración"
✅ Configuración: Incluir/excluir secciones (checkboxes)
✅ Preview se genera en <2 segundos

PRIORIDAD: 🟡 DESEABLE
STORY POINTS: 5
SPRINT: Sprint 2
DEPENDENCIAS: US-001
```

---

#### US-003: Como CFO, quiero compartir reportes por email
```
COMO: CFO / Rodrigo
QUIERO: Enviar el PDF directamente por email desde la app
PARA: Ahorrar tiempo en abrir cliente de email

CRITERIOS DE ACEPTACIÓN:
✅ Botón "Compartir por Email" junto a "Exportar PDF"
✅ Modal con campos: destinatarios (múltiples), asunto, mensaje
✅ PDF se adjunta automáticamente
✅ Integración con EmailJS o SendGrid
✅ Confirmación: "✅ Email enviado a 3 destinatarios"
✅ Copia del email se envía al remitente

NOTAS TÉCNICAS:
- Usar EmailJS (gratis hasta 200 emails/mes)
- API key en variables de entorno
- Rate limiting: máx 10 emails/hora

PRIORIDAD: 🟠 IMPORTANTE
STORY POINTS: 8
SPRINT: Sprint 3
DEPENDENCIAS: US-001
```

---

### ÉPICA 2: Import y Gestión de Datos (18 SP) 🔴

#### US-004: Como Usuario, quiero descargar template CSV
```
COMO: Cualquier usuario (CFO, Socio-Gerente)
QUIERO: Descargar un template CSV de ejemplo
PARA: Saber exactamente qué formato usar al importar datos

CRITERIOS DE ACEPTACIÓN:
✅ Botón "📥 Descargar Template" en ImportadorCSV
✅ CSV incluye headers exactos requeridos
✅ CSV incluye 3 filas de ejemplo con datos realistas
✅ Nombre archivo: template-importacion-cfo-dashboard.csv
✅ Tooltip explica: "Llena este template y vuelve a importarlo"

NOTAS TÉCNICAS:
- Generar CSV dinámicamente en frontend
- Headers: fecha, venta_cafe_clp, venta_hotdesk_clp, etc.
- Ejemplo con datos del último mes

PRIORIDAD: 🔴 CRÍTICA
STORY POINTS: 2
SPRINT: Sprint 1
DEPENDENCIAS: Ninguna
```

---

#### US-005: Como Usuario, quiero validación mejorada de CSV
```
COMO: Usuario importando datos
QUIERO: Ver errores específicos si mi CSV está mal formateado
PARA: Corregirlos fácilmente sin frustración

CRITERIOS DE ACEPTACIÓN:
✅ Validación detecta: columnas faltantes, formato de fecha incorrecto, valores no numéricos
✅ Errores se muestran línea por línea: "Línea 3: venta_cafe_clp debe ser número"
✅ Advertencias (no errores): "Línea 5: margen neto muy bajo (15%)"
✅ Remueve automáticamente separadores de miles (8.000.000 → 8000000)
✅ Botón "Descargar CSV con errores corregidos" si hay fixes automáticos

PRIORIDAD: 🟠 IMPORTANTE
STORY POINTS: 5
SPRINT: Sprint 1
DEPENDENCIAS: US-004
```

---

#### US-006: Como Usuario, quiero drag & drop de archivos CSV
```
COMO: Usuario menos técnico
QUIERO: Arrastrar y soltar el CSV en vez de usar file picker
PARA: Importar datos más rápido e intuitivo

CRITERIOS DE ACEPTACIÓN:
✅ Área de drop con borde punteado y mensaje "Arrastra tu CSV aquí"
✅ Hover state cuando archivo está sobre área
✅ Acepta solo archivos .csv (rechaza .xlsx, .txt, etc.)
✅ Mensaje de error claro si formato no es CSV
✅ Animación de carga mientras procesa

PRIORIDAD: 🟡 DESEABLE
STORY POINTS: 3
SPRINT: Sprint 2
DEPENDENCIAS: US-005
```

---

#### US-007: Como CFO, quiero integración con Google Sheets
```
COMO: CFO / Rodrigo
QUIERO: Importar datos directamente desde Google Sheets
PARA: No tener que exportar a CSV manualmente

CRITERIOS DE ACEPTACIÓN:
✅ Botón "Conectar Google Sheets" en ImportadorGoogleSheets
✅ OAuth flow para autorizar acceso
✅ Dropdown para seleccionar hoja específica
✅ Mapeo de columnas (drag & drop): "Columna A" → "venta_cafe_clp"
✅ Botón "Sincronizar" importa datos más recientes
✅ Guardado de configuración para futuras sincronizaciones

NOTAS TÉCNICAS:
- Google Sheets API v4
- Scopes: spreadsheets.readonly
- Refresh token guardado en LocalStorage (encriptado)

PRIORIDAD: 🟠 IMPORTANTE
STORY POINTS: 13 (requiere split en 2 sprints)
SPRINT: Sprint 2-3
DEPENDENCIAS: Ninguna
```

---

### ÉPICA 3: Alertas y Webhooks (15 SP) 🟠

#### US-008: Como CFO, quiero alerta automática cuando margen <30%
```
COMO: CFO / Rodrigo
QUIERO: Recibir notificación automática si margen neto cae bajo 30%
PARA: Tomar acción correctiva inmediatamente

CRITERIOS DE ACEPTACIÓN:
✅ Sistema verifica margen neto en cada guardado de registro
✅ Si margen <30%, se activa alerta roja en dashboard
✅ Alert toast persiste hasta que se lea: "🚨 CRÍTICO: Margen neto 28%"
✅ Webhook a Make.com se dispara automáticamente
✅ Payload JSON incluye: margen, venta_total, utilidad_neta, fecha
✅ Botón "Marcar como leída" oculta la alerta

NOTAS TÉCNICAS:
- Webhook URL configurable en tab Configuración
- Retry 3 veces si falla (exponential backoff)
- Logs de intentos guardados en LocalStorage

PRIORIDAD: 🟠 IMPORTANTE
STORY POINTS: 5
SPRINT: Sprint 1
DEPENDENCIAS: Ninguna
```

---

#### US-009: Como CFO, quiero historial de alertas enviadas
```
COMO: CFO / Rodrigo
QUIERO: Ver un historial de todas las alertas enviadas
PARA: Auditar que las notificaciones se están disparando correctamente

CRITERIOS DE ACEPTACIÓN:
✅ Nueva tab "Historial de Alertas" en Configuración
✅ Tabla con columnas: Fecha, Tipo de Alerta, Margen, Status (Enviado/Fallido)
✅ Filtros: por fecha, por tipo de alerta, por status
✅ Botón "Exportar historial" (CSV)
✅ Paginación: 20 alertas por página
✅ Badge verde/rojo según status de envío

PRIORIDAD: 🟡 DESEABLE
STORY POINTS: 5
SPRINT: Sprint 2
DEPENDENCIAS: US-008
```

---

#### US-010: Como CFO, quiero configurar múltiples webhooks
```
COMO: CFO / Rodrigo
QUIERO: Configurar webhooks diferentes para alertas distintas
PARA: Enviar alertas críticas a Slack, normales a email, etc.

CRITERIOS DE ACEPTACIÓN:
✅ Lista de webhooks configurados (CRUD completo)
✅ Cada webhook tiene: nombre, URL, tipo de alerta (crítico/warning/info)
✅ Toggle on/off para activar/desactivar temporalmente
✅ Test button: "Enviar webhook de prueba"
✅ Validación de URL (https:// requerido)
✅ Máximo 5 webhooks configurados

PRIORIDAD: 🟢 OPCIONAL
STORY POINTS: 8
SPRINT: Backlog (Sprint 4+)
DEPENDENCIAS: US-008, US-009
```

---

### ÉPICA 4: UI/UX y Loading States (12 SP) 🟡

#### US-011: Como Usuario, quiero ver loading states claros
```
COMO: Cualquier usuario
QUIERO: Ver skeletons o spinners mientras carga el contenido
PARA: Saber que la app está funcionando, no colgada

CRITERIOS DE ACEPTACIÓN:
✅ Skeleton screens en: Dashboard, AnalisisCFO, ReportesEjecutivos
✅ Shimmer effect (animación suave)
✅ Colores del skeleton match con theme de la app
✅ Duración: Mínimo 300ms (evitar flash), máximo 5s (timeout)
✅ Fallback si carga falla: Error state con botón "Reintentar"

NOTAS TÉCNICAS:
- Usar Skeleton de Shadcn/ui
- Suspense boundaries en componentes pesados
- React.lazy() para code splitting

PRIORIDAD: 🟡 DESEABLE
STORY POINTS: 5
SPRINT: Sprint 2
DEPENDENCIAS: Ninguna
```

---

#### US-012: Como Usuario, quiero tooltips explicativos en KPIs
```
COMO: Usuario menos financiero (Daniela)
QUIERO: Ver explicación de términos técnicos al hacer hover
PARA: Entender qué significa RevPSM, CAPEX, payback, etc.

CRITERIOS DE ACEPTACIÓN:
✅ Icono (?) junto a términos técnicos
✅ Tooltip aparece en hover con explicación corta (max 50 palabras)
✅ Ejemplos: "RevPSM = Revenue por Metro Cuadrado. Mide eficiencia del espacio."
✅ Link "Ver más" abre modal con explicación detallada
✅ Tooltips en: RevPSM, CAPEX, Derecho de Llaves, Margen Ponderado, Mix Óptimo

PRIORIDAD: 🟡 DESEABLE
STORY POINTS: 3
SPRINT: Sprint 2
DEPENDENCIAS: Ninguna
```

---

#### US-013: Como Usuario, quiero glosario integrado
```
COMO: Usuario nuevo
QUIERO: Acceder a un glosario completo de términos
PARA: Aprender el lenguaje financiero del dashboard

CRITERIOS DE ACEPTACIÓN:
✅ Botón "📖 Glosario" en header del dashboard
✅ Modal con lista de términos alfabéticamente
✅ Cada término tiene: definición, fórmula (si aplica), ejemplo
✅ Búsqueda de términos en tiempo real
✅ 20+ términos cubiertos: ROI, RevPSM, CAPEX, OPEX, etc.
✅ Botón "Imprimir glosario" genera PDF

PRIORIDAD: 🟢 OPCIONAL
STORY POINTS: 5
SPRINT: Backlog (Sprint 4+)
DEPENDENCIAS: US-012
```

---

### ÉPICA 5: Personalización por Rol (16 SP) 🟡

#### US-014: Como Usuario, quiero ver KPIs relevantes a mi rol
```
COMO: Socio-Gerente / Daniela
QUIERO: Ver solo los KPIs que importan para mi rol
PARA: No abrumarme con datos financieros que no uso

CRITERIOS DE ACEPTACIÓN:
✅ Filtro por rol: CFO, Socio-Gerente, Colaborador (ya existe)
✅ Dashboard adapta widgets según rol:
  - CFO: Margen neto, ROI, payback, RevPSM
  - Socio-Gerente: Mix de ventas, ocupación hotdesk, RevPSM
  - Colaborador: Checklist operativo, estado máquina café
✅ Cambio de rol persiste en LocalStorage
✅ Onboarding: "¿Cuál es tu rol?" al primer uso

PRIORIDAD: 🟡 DESEABLE
STORY POINTS: 8
SPRINT: Sprint 3
DEPENDENCIAS: Ninguna (filtro ya existe, mejorar visibilidad)
```

---

#### US-015: Como Usuario, quiero tutorial guiado al primer uso
```
COMO: Usuario nuevo
QUIERO: Un tour guiado que me explique el dashboard
PARA: Entender dónde están las funcionalidades principales

CRITERIOS DE ACEPTACIÓN:
✅ Tour aparece al primer login (cookie "tour_completed")
✅ 5 pasos con flechas y highlights:
  1. "Estas son tus tabs principales"
  2. "Aquí ves tus KPIs en tiempo real"
  3. "Análisis CFO tiene 4 módulos estratégicos"
  4. "Importa datos desde tab Datos"
  5. "Configura alertas en Configuración"
✅ Botones: "Siguiente", "Anterior", "Saltar tour"
✅ Tour se puede reactivar desde Configuración

NOTAS TÉCNICAS:
- Usar Shepherd.js o Intro.js
- Tour personalizado por rol (5 pasos para CFO, 3 para Colaborador)

PRIORIDAD: 🟡 DESEABLE
STORY POINTS: 5
SPRINT: Sprint 3
DEPENDENCIAS: US-014
```

---

#### US-016: Como CFO, quiero guardar vistas personalizadas
```
COMO: CFO / Rodrigo
QUIERO: Guardar configuraciones de filtros y vistas
PARA: No tener que re-configurarlos cada vez que abro la app

CRITERIOS DE ACEPTACIÓN:
✅ Botón "💾 Guardar vista" guarda: filtros activos, tab seleccionado, rol
✅ Dropdown "Mis vistas guardadas": Default, Mensual CFO, Vista Ejecutiva, etc.
✅ Cada vista tiene: nombre, fecha creación, botón "Eliminar"
✅ Vista por defecto se carga al abrir la app
✅ Máximo 5 vistas guardadas

PRIORIDAD: 🟢 OPCIONAL
STORY POINTS: 8
SPRINT: Backlog (Sprint 5+)
DEPENDENCIAS: US-014
```

---

### ÉPICA 6: Optimización Técnica (10 SP) 🟡

#### US-017: Como Developer, quiero remover dependencias no usadas
```
COMO: Developer
QUIERO: Eliminar @tremor/react, @mui/material, react-dnd del bundle
PARA: Reducir bundle size y mejorar performance

CRITERIOS DE ACEPTACIÓN:
✅ Análisis de bundle con webpack-bundle-analyzer
✅ Remover dependencias: @tremor/react, @mui/material, react-dnd
✅ Verificar que nada se rompe (tests regression)
✅ Bundle size reducido de 650KB → 400KB (-38%)
✅ Lighthouse performance score >95

NOTAS TÉCNICAS:
- Buscar imports no usados con ESLint unused-imports
- Tree shaking automático de Vite ya activo
- Verificar que no hay importaciones dinámicas ocultas

PRIORIDAD: 🟡 DESEABLE
STORY POINTS: 3
SPRINT: Sprint 2
DEPENDENCIAS: Ninguna
```

---

#### US-018: Como Developer, quiero useMemo en cálculos pesados
```
COMO: Developer
QUIERO: Optimizar re-renders con useMemo y useCallback
PARA: Mejorar performance en dispositivos lentos

CRITERIOS DE ACEPTACIÓN:
✅ useMemo en: calcularAnalisisMargenes, calcularAnalisisRevPSM, calcularMixOptimo
✅ useCallback en: handlers de botones, filtros, cambios de estado
✅ React DevTools Profiler: reducción de 30% en re-renders
✅ Métricas: Time to Interactive -20%

PRIORIDAD: 🟡 DESEABLE
STORY POINTS: 3
SPRINT: Sprint 2
DEPENDENCIAS: Ninguna
```

---

#### US-019: Como Developer, quiero tests unitarios con Jest
```
COMO: Developer
QUIERO: Tests unitarios para lógica de cálculos financieros
PARA: Asegurar que fórmulas están correctas y evitar regresiones

CRITERIOS DE ACEPTACIÓN:
✅ Tests para: calcularAnalisisMargenes, calcularRevPSM, calcularMixOptimo
✅ Tests para: formatChileno, validación CSV, webhooks
✅ Coverage >80% en lógica de negocio
✅ CI/CD: tests corren en cada PR (GitHub Actions)
✅ Tiempo de ejecución de suite <30s

NOTAS TÉCNICAS:
- Jest + React Testing Library
- Mock de LocalStorage, fetch, Context API
- Ejemplo: "Margen 68% con venta $8M debe retornar $5.44M"

PRIORIDAD: 🟠 IMPORTANTE
STORY POINTS: 8
SPRINT: Sprint 3
DEPENDENCIAS: Ninguna
```

---

### ÉPICA 7: Accesibilidad (A11y) (9 SP) 🟡

#### US-020: Como Usuario con discapacidad, quiero skip to content
```
COMO: Usuario de screen reader
QUIERO: Un link "Saltar al contenido principal"
PARA: No tener que escuchar toda la navegación cada vez

CRITERIOS DE ACEPTACIÓN:
✅ Link invisible "Skip to content" como primer elemento del DOM
✅ Visible solo en focus (Tab key)
✅ Link salta a <main id="main-content">
✅ WCAG 2.1 Level AA compliance

PRIORIDAD: 🟡 DESEABLE
STORY POINTS: 2
SPRINT: Sprint 3
DEPENDENCIAS: Ninguna
```

---

#### US-021: Como Usuario con discapacidad, quiero aria-live announcements
```
COMO: Usuario de screen reader
QUIERO: Escuchar anuncios cuando datos cambian dinámicamente
PARA: Saber que algo sucedió sin depender de visual

CRITERIOS DE ACEPTACIÓN:
✅ aria-live="polite" en: toast notifications, alertas de margen, cambios de tab
✅ aria-live="assertive" en: errores críticos
✅ Anuncios: "Margen neto actualizado a 32%", "PDF descargado"
✅ Testeado con NVDA y VoiceOver

PRIORIDAD: 🟡 DESEABLE
STORY POINTS: 3
SPRINT: Sprint 3
DEPENDENCIAS: US-020
```

---

#### US-022: Como Usuario con sensibilidad visual, quiero reduced motion
```
COMO: Usuario con epilepsia o sensibilidad a movimiento
QUIERO: Que animaciones se deshabiliten si tengo prefers-reduced-motion
PARA: No experimentar mareos o malestar

CRITERIOS DE ACEPTACIÓN:
✅ Detección de prefers-reduced-motion en CSS
✅ Animaciones deshabilitadas: shimmer, transitions, hover effects
✅ Gráficos Recharts sin animación de entrada
✅ Toast notifications aparecen sin fade-in

NOTAS TÉCNICAS:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

PRIORIDAD: 🟢 OPCIONAL
STORY POINTS: 2
SPRINT: Backlog (Sprint 4+)
DEPENDENCIAS: US-020, US-021
```

---

## 📊 PRODUCT BACKLOG PRIORIZADO

### Vista Completa (Orden de Prioridad)

| ID | User Story | Prioridad | SP | Sprint | Épica |
|----|------------|-----------|----|----|-------|
| **US-001** | Exportar PDF | 🔴 CRÍTICA | 8 | 1 | Export |
| **US-004** | Template CSV | 🔴 CRÍTICA | 2 | 1 | Import |
| **US-005** | Validación CSV | 🟠 IMPORTANTE | 5 | 1 | Import |
| **US-008** | Alerta margen <30% | 🟠 IMPORTANTE | 5 | 1 | Webhooks |
| **US-011** | Loading states | 🟡 DESEABLE | 5 | 2 | UI/UX |
| **US-002** | Preview PDF | 🟡 DESEABLE | 5 | 2 | Export |
| **US-006** | Drag & drop CSV | 🟡 DESEABLE | 3 | 2 | Import |
| **US-009** | Historial alertas | 🟡 DESEABLE | 5 | 2 | Webhooks |
| **US-012** | Tooltips KPIs | 🟡 DESEABLE | 3 | 2 | UI/UX |
| **US-017** | Remover deps | 🟡 DESEABLE | 3 | 2 | Técnico |
| **US-018** | useMemo | 🟡 DESEABLE | 3 | 2 | Técnico |
| **US-003** | Email reportes | 🟠 IMPORTANTE | 8 | 3 | Export |
| **US-007** | Google Sheets | 🟠 IMPORTANTE | 13 | 2-3 | Import |
| **US-014** | KPIs por rol | 🟡 DESEABLE | 8 | 3 | Roles |
| **US-015** | Tutorial guiado | 🟡 DESEABLE | 5 | 3 | Roles |
| **US-019** | Tests Jest | 🟠 IMPORTANTE | 8 | 3 | Técnico |
| **US-020** | Skip content | 🟡 DESEABLE | 2 | 3 | A11y |
| **US-021** | aria-live | 🟡 DESEABLE | 3 | 3 | A11y |
| **US-010** | Multi-webhooks | 🟢 OPCIONAL | 8 | Backlog | Webhooks |
| **US-013** | Glosario | 🟢 OPCIONAL | 5 | Backlog | UI/UX |
| **US-016** | Vistas guardadas | 🟢 OPCIONAL | 8 | Backlog | Roles |
| **US-022** | Reduced motion | 🟢 OPCIONAL | 2 | Backlog | A11y |

**TOTAL STORY POINTS:** 115 SP

---

## 🏃 PLANIFICACIÓN DE SPRINTS

### SPRINT 0: Preparación (1 semana antes)
```
□ Setup de entorno Scrum (Jira/Trello/GitHub Projects)
□ Refinamiento de backlog con Product Owner
□ Definir Definition of Done
□ Configurar CI/CD pipeline
□ Kick-off meeting con equipo completo
```

---

### SPRINT 1: Fundamentos Críticos (2 semanas)
**Objetivo:** Resolver blockers de producción (PDF, CSV, Alertas)

**Sprint Backlog:**
- US-001: Exportar PDF (8 SP) 🔴
- US-004: Template CSV (2 SP) 🔴
- US-005: Validación CSV (5 SP) 🟠
- US-008: Alerta margen <30% (5 SP) 🟠

**TOTAL:** 20 SP (velocidad conservadora para primer sprint)

**Ceremonies:**
- **Sprint Planning:** Lunes 24 Feb, 10:00-12:00 (2h)
- **Daily Standup:** Todos los días 9:30-9:45 (15min)
- **Sprint Review:** Viernes 7 Mar, 14:00-15:00 (1h)
- **Sprint Retrospective:** Viernes 7 Mar, 15:00-16:00 (1h)

**Definition of Done Sprint 1:**
- [ ] Código implementado en feature branch
- [ ] Code review aprobado por 1+ developer
- [ ] Tests manuales completados (checklist)
- [ ] Funcionalidad demostrada a Product Owner
- [ ] Deploy a staging exitoso
- [ ] Documentación README actualizada

---

### SPRINT 2: Mejoras UX y Optimización (2 semanas)
**Objetivo:** Mejorar experiencia de usuario y performance

**Sprint Backlog:**
- US-011: Loading states (5 SP) 🟡
- US-002: Preview PDF (5 SP) 🟡
- US-006: Drag & drop CSV (3 SP) 🟡
- US-009: Historial alertas (5 SP) 🟡
- US-012: Tooltips KPIs (3 SP) 🟡
- US-017: Remover deps (3 SP) 🟡
- US-018: useMemo (3 SP) 🟡
- US-007: Google Sheets (parte 1: OAuth + UI) (6 SP) 🟠

**TOTAL:** 33 SP (velocidad aumenta con experiencia del equipo)

**Ceremonies:** Mismas que Sprint 1

**Definition of Done Sprint 2:**
- [ ] Todo de Sprint 1 +
- [ ] Tests de regresión pasan (suite automatizada)
- [ ] Performance Lighthouse >90
- [ ] Accesibilidad score >80
- [ ] Bundle size verificado (<500KB)

---

### SPRINT 3: Refinamiento y Calidad (2 semanas)
**Objetivo:** Accesibilidad, testing, personalización

**Sprint Backlog:**
- US-003: Email reportes (8 SP) 🟠
- US-007: Google Sheets (parte 2: Sync + Mapping) (7 SP) 🟠
- US-014: KPIs por rol (8 SP) 🟡
- US-015: Tutorial guiado (5 SP) 🟡
- US-019: Tests Jest (8 SP) 🟠
- US-020: Skip content (2 SP) 🟡
- US-021: aria-live (3 SP) 🟡

**TOTAL:** 41 SP (velocidad máxima del equipo)

**Ceremonies:** Mismas que Sprint 1-2

**Definition of Done Sprint 3:**
- [ ] Todo de Sprint 1-2 +
- [ ] Test coverage >80% en lógica de negocio
- [ ] Accesibilidad WCAG 2.1 AA compliant
- [ ] Deploy a producción aprobado por stakeholders
- [ ] Documentación de usuario final completa

---

## 📈 TRACKING DE VELOCIDAD

### Velocity Chart (Proyectado)
```
SP
 │
60│
 │
50│                               ┌────┐
 │                               │    │
40│                         ┌────┤ 41 │
 │                         │    ├────┤
30│                   ┌────┤ 33 │    │
 │                   │    ├────┤    │
20│             ┌────┤ 20 │    │    │
 │             │    ├────┤    │    │
10│        ┌────┤ 0  │    │    │    │
 │        │    ├────┤    │    │    │
 0├────────┴────┴────┴────┴────┴────┴────→
   Prep  Sprint Sprint Sprint Sprint Sprint
          0     1     2     3     4

Velocity promedio: 31.3 SP/sprint
```

---

## 🎯 DEFINITION OF DONE (DoD)

### Nivel 1: User Story (Individual)
```
□ Código implementado según criterios de aceptación
□ Tests unitarios escritos (si aplica)
□ Code review aprobado por peer
□ Sin errores en consola
□ Funciona en Chrome, Safari, Firefox
□ Responsive (mobile, tablet, desktop)
□ Accesible con teclado
□ Documentación inline (comentarios)
□ Commit message siguiendo convención
```

### Nivel 2: Sprint
```
□ Todas las user stories del sprint completadas
□ Tests de regresión pasan
□ Demo a Product Owner aprobada
□ Deploy a staging exitoso
□ Performance metrics OK (Lighthouse >90)
□ Documentación README actualizada
□ Retrospectiva completada con action items
```

### Nivel 3: Release (Producción)
```
□ Todos los sprints completados según plan
□ Test coverage >80%
□ Accesibilidad WCAG 2.1 AA
□ Bundle size <500KB
□ Carga inicial <3s
□ Zero bugs críticos en staging
□ Documentación de usuario final completa
□ Aprobación escrita de Product Owner y stakeholders
□ Plan de rollback preparado
□ Monitoreo post-deploy configurado
```

---

## 📅 CEREMONIES SCRUM

### 1. Sprint Planning (2 horas al inicio de cada sprint)
```
AGENDA:
0:00-0:30  Review de objetivos del sprint
0:30-1:00  Selección de user stories del backlog
1:00-1:30  Estimación y discusión técnica
1:30-2:00  Definir tareas específicas por story
2:00       Commitment del equipo al sprint goal

OUTPUT:
✅ Sprint Backlog definido
✅ Sprint Goal claro
✅ Todos los miembros comprometidos
```

### 2. Daily Standup (15 min diarios, 9:30 AM)
```
FORMAT (Round-robin, 3 min por persona):
1. ¿Qué hice ayer?
2. ¿Qué haré hoy?
3. ¿Tengo algún blocker?

REGLAS:
- De pie (virtual: cámaras on)
- Máximo 15 min total
- Blockers se resuelven después (no en el standup)
- Scrum Master facilita
```

### 3. Sprint Review (1 hora al final de sprint)
```
AGENDA:
0:00-0:10  Recap del sprint goal
0:10-0:40  Demo de user stories completadas
0:40-0:50  Feedback de Product Owner y stakeholders
0:50-1:00  Métricas del sprint (velocity, bugs, etc.)

ASISTENTES:
- Dev Team
- Scrum Master
- Product Owner
- Stakeholders (CFO, Socio-Gerente)

OUTPUT:
✅ Incremento funcional demostrado
✅ Feedback capturado para próximo sprint
```

### 4. Sprint Retrospective (1 hora después de review)
```
FORMAT: Start-Stop-Continue

PREGUNTAS:
- ¿Qué salió bien? (Keep doing)
- ¿Qué salió mal? (Stop doing)
- ¿Qué podemos mejorar? (Start doing)

TÉCNICA: "5 Whys" para root cause analysis

EJEMPLO:
Problema: US-001 tomó 12h en vez de 8h
- ¿Por qué? → jsPDF tenía bug con gráficos
- ¿Por qué? → No investigamos antes
- ¿Por qué? → Estimación fue optimista
- ¿Por qué? → No incluimos buffer
- ¿Por qué? → Primer sprint, sin datos históricos

ACCIÓN: Agregar 20% buffer en estimaciones

OUTPUT:
✅ 3-5 action items específicos para próximo sprint
✅ Mejoras en proceso documentadas
```

---

## 🔥 BURNDOWN CHART (Ejemplo Sprint 1)

```
SP Remaining
 │
20│●
 │ ╲
18│  ●
 │   ╲
16│    ●
 │     ╲
14│      ●
 │       ╲
12│        ●
 │         ╲──────────── Ideal Line
10│          ●
 │           ╲
 8│            ●●● ← Blocker: bug en jsPDF
 │              ╲
 6│               ●
 │                ╲
 4│                 ●
 │                  ╲
 2│                   ●
 │                    ╲
 0├─────────────────────●────→
   D1 D2 D3 D4 D5 D6 D7 D8 D9 D10
   (Días del sprint)

GREEN = Por debajo de ideal (adelantados)
RED = Por encima de ideal (atrasados)
```

---

## 🎯 SPRINT GOALS

### Sprint 1: "Fundamentos de Export e Import"
```
🎯 Al final de este sprint, el CFO podrá:
✅ Exportar reportes en PDF profesionales
✅ Importar datos desde CSV sin confusión
✅ Recibir alertas automáticas si margen <30%
```

### Sprint 2: "Experiencia de Usuario Premium"
```
🎯 Al final de este sprint, usuarios experimentarán:
✅ Loading states fluidos (sin sensación de cuelgue)
✅ Importación drag & drop intuitiva
✅ Tooltips explicativos en términos técnicos
✅ Performance 30% mejorado (bundle size reducido)
```

### Sprint 3: "Calidad y Accesibilidad Enterprise"
```
🎯 Al final de este sprint, la app estará:
✅ Testeada con coverage >80%
✅ Accesible para usuarios con discapacidades (WCAG AA)
✅ Integrada con Google Sheets (sync automática)
✅ Lista para producción con stakeholder sign-off
```

---

## 📊 MÉTRICAS SCRUM

### Métricas a Trackear:

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Velocity** | 30-40 SP/sprint | Story points completados |
| **Commitment Reliability** | >90% | Stories completadas vs planificadas |
| **Bugs Introducidos** | <2 por sprint | Issues post-deploy |
| **Code Review Time** | <24h | Tiempo desde PR hasta merge |
| **Test Coverage** | >80% | Jest coverage report |
| **Build Time** | <5min | CI/CD pipeline duration |
| **Deployment Frequency** | 1x por sprint | Deploys a staging/prod |

---

## 🏆 CONCLUSIÓN SCRUM

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║  🏃‍♂️ SCRUM NOS PERMITE:                                  ║
║                                                          ║
║  ✅ Entregas incrementales cada 2 semanas                ║
║  ✅ Adaptación ágil a feedback de usuarios               ║
║  ✅ Transparencia total con stakeholders                 ║
║  ✅ Mejora continua del proceso (retrospectivas)         ║
║  ✅ Priorización basada en valor de negocio              ║
║                                                          ║
║  RESULTADO: 115 SP de backlog ejecutable en 3 sprints   ║
║             (6 semanas) con calidad enterprise           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

**FIN DE SCRUM PRODUCT BACKLOG**  
Generado: 22 de Febrero, 2026  
Próxima ceremonia: Sprint Planning Sprint 1 - Lunes 24 Feb, 10:00 AM
