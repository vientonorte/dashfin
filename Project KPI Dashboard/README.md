
  # Project KPI Dashboard

  This is a code bundle for Project KPI Dashboard. The original project is available at https://www.figma.com/design/fns7OigOryR0z2T09g3b8S/Project-KPI-Dashboard.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

---

## Módulo: Estados de Cuenta Personal (MVP)

Módulo de finanzas personales con enfoque **privacy-by-design**, integrado al dashboard bajo la pestaña **"Estados de Cuenta"** (visible en el rol Admin).

### Funcionalidades

| Característica | Descripción |
|---|---|
| **Importar CSV** | Parseo automático de CSVs bancarios. Detecta separador, columnas y formatos de fecha. |
| **Importar PDF** | Extracción de texto de PDFs bancarios (texto embebido; no requiere OCR). |
| **Normalización** | Categorización automática de transacciones (14 categorías). |
| **Deduplicación** | Detecta duplicados por fecha+descripción+monto al importar. |
| **Tabla editable** | Edición inline de fecha, descripción, monto, categoría y notas. |
| **Deshacer importación** | Revertir un lote completo importado con un clic. |
| **Dashboard** | Gráficos de ingresos/egresos mensuales y distribución por categoría. |
| **Cifrado AES-256** | Datos cifrados en reposo con Web Crypto API (AES-256-GCM). |
| **Log de auditoría** | Registro inmutable de todas las acciones (importar, editar, eliminar, exportar, purgar). |
| **Exportar datos** | Descarga CSV con todas las transacciones. |
| **Borrado total** | Elimina datos y destruye la clave de cifrado (datos ilegibles). |
| **Centro de privacidad** | Toggles de cifrado, retención de datos y logs. |

### Formato CSV soportado

```csv
Fecha,Descripcion,Monto
2026-01-15,Supermercado Jumbo,-45000
2026-01-16,Sueldo enero,1500000
```

También soporta columnas separadas de Abono/Cargo:
```csv
Fecha;Glosa;Abono;Cargo
15/01/2026;Supermercado Jumbo;;45000
16/01/2026;Sueldo enero;1500000;
```

Formatos de fecha soportados: `DD/MM/YYYY`, `YYYY-MM-DD`, `DD-MM-YYYY`.

### Privacidad

- Los datos se almacenan **solo en localStorage** del navegador.
- La clave de cifrado se genera localmente y se guarda en localStorage.
- No se envía ningún dato a servidores externos.
- El "borrado total" elimina datos Y clave, haciendo los datos cifrados irrecuperables.

### Stack técnico del módulo

- **Frontend:** React + TypeScript + Vite (mismo stack existente)
- **Cifrado:** Web Crypto API — AES-256-GCM (sin dependencias externas)
- **Estado:** React Context + localStorage
- **Gráficos:** Recharts (ya incluido en el proyecto)
- **Validación:** TypeScript estricto + parsers propios

### Backlog Scrum

**Sprint 1 — Flujo crítico (completado)**
- [x] Ingesta CSV con detección automática de formato
- [x] Ingesta PDF básica (texto embebido)
- [x] Normalización y categorización automática
- [x] Cifrado AES-256-GCM en reposo
- [x] Tabla editable con undo por lote
- [x] Log de auditoría persistente
- [x] Exportación CSV
- [x] Borrado total verificable
- [x] Centro de privacidad con toggles

**Sprint 2 — Mejoras (pendiente)**
- [ ] OCR local para PDFs escaneados (Tesseract.js opt-in)
- [ ] Soporte multi-cuenta
- [ ] Reglas de categorización personalizables
- [ ] Alertas de presupuesto por categoría
- [ ] Sincronización con archivo local (File System Access API)
- [ ] Tests unitarios e integración (Vitest)

### Riesgos técnicos y de privacidad

| Riesgo | Mitigación |
|---|---|
| Clave de cifrado en localStorage | Aceptable para single-user local; mejora futura: PBKDF2 con passphrase |
| PDF escaneados sin texto embebido | Mensaje de error claro + recomendación de exportar CSV |
| Duplicados en importaciones sucesivas | Detección por hash fecha+descripción+monto |
| Borrado accidental | Confirmación en dos pasos antes del purge |
| Pérdida de datos por rotación de clave | El borrado total es explícito; no hay rotación automática |

  