# Definition of Done (DoD) — DashFin

**Última actualización:** 2026-04-08  
**Aplica a:** DashFin + todos los proyectos en vientonorte.github.io

---

## Propósito

Documentar buenas prácticas verificadas para no retroceder. Este DOD se aplica como checklist antes de considerar cualquier tarea como terminada.

---

## 1. Código

- [ ] Build exitoso: `cd "Project KPI Dashboard" && npm ci && npm run build`
- [ ] Sin errores de TypeScript (Vite valida tipos durante build)
- [ ] Sin `console.log` de debug en código commiteado
- [ ] Sin secretos, API keys o credenciales en el código fuente
- [ ] Cambios atómicos: un commit = un cambio coherente
- [ ] Imports ordenados: React primero, luego libs, luego locales

## 2. Accesibilidad (WCAG 2.1 AA)

- [ ] Focus visible en todos los elementos interactivos (`:focus-visible` con outline 2px)
- [ ] Skip-to-main link presente (`<a class="skip-to-main">`)
- [ ] Contraste mínimo 4.5:1 en texto normal, 3:1 en texto grande
- [ ] `aria-label` en botones sin texto visible (íconos)
- [ ] `role="alert"` o `aria-live="polite"` en mensajes dinámicos
- [ ] Navegación completa por teclado (Tab, Enter, Escape)
- [ ] `prefers-reduced-motion` respetado para animaciones
- [ ] Zona táctil mínima 44×44px en móvil

## 3. Mobile First

- [ ] Diseño base es mobile (min-width media queries, no max-width)
- [ ] Layout responsive verificado en 320px, 375px, 768px, 1024px
- [ ] Touch targets ≥ 44px × 44px
- [ ] Sin scroll horizontal en viewport ≤ 375px
- [ ] Sticky nav/toolbar funcional en iOS Safari y Chrome Android
- [ ] Textos legibles sin zoom (mínimo 16px base)
- [ ] Inputs con `type` correcto para teclados nativos (`number`, `email`, `date`)

## 4. Documentación

- [ ] README.md actualizado si cambia arquitectura, stack o flujo de desarrollo
- [ ] Changelog actualizado con cambios funcionales visibles para el usuario
- [ ] Componentes nuevos documentados con comentario breve de propósito
- [ ] Variables de negocio documentadas en BusinessConfigContext (unidades, rangos)

## 5. Seguridad y Privacidad

- [ ] Datos sensibles cifrados (AES-256-GCM si usa Web Crypto API)
- [ ] Sin datos crudos persistidos (solo datos procesados/normalizados)
- [ ] Funcionalidad de "borrado total" verificable cuando aplique
- [ ] Audit log para operaciones destructivas (delete, purge, export)
- [ ] Sin APIs externas que reciban datos sensibles (salvo opt-in explícito)

## 6. Git & Branching

- [ ] Branch nombrada según convención: `copilot/<feature>` o `<prefix>/<descripción>`
- [ ] PR con descripción clara: qué cambió, por qué, cómo verificarlo
- [ ] Merge limpio a main (sin conflictos; rebase si es necesario)
- [ ] Ramas mergeadas eliminadas del remote dentro de 48h
- [ ] Sin archivos de > 1MB commiteados (PDFs, imágenes grandes → usar Git LFS o enlace externo)

## 7. CI/CD

- [ ] GitHub Actions deploy exitoso después del merge a main
- [ ] Sitio verificado en https://vientonorte.github.io/dashfin/ post-deploy
- [ ] Sin warnings nuevos en el build log
- [ ] Base path `/dashfin/` verificado (Vite config)

## 8. Verificación Pre-Commit

Checklist rápido para ejecutar antes de cada commit:

```bash
# Build check
cd "Project KPI Dashboard" && npm run build

# Status limpio
git status
git diff --stat

# Sin secretos
grep -rn "sk-\|SUPABASE_KEY\|api_key" --include='*.ts' --include='*.tsx' src/

# Sin console.log de debug
grep -rn "console.log" --include='*.ts' --include='*.tsx' src/ | grep -v "// keep"
```

---

## 9. Prácticas del Proyecto Antropología-Corrupción (Referencia)

Buenas prácticas verificadas en https://vientonorte.github.io/antropologia-corrupcion/ que deben mantenerse en todo el ecosistema vientonorte:

### HANDOFF.md obligatorio
Cada sesión de trabajo que modifica archivos clave debe dejar un HANDOFF.md con:
1. **Alcance entregado** — qué se hizo
2. **Archivos tocados** — dónde se hizo
3. **Commits relevantes** — trazabilidad
4. **Verificación ejecutada** — cómo se validó
5. **Riesgos conocidos** — qué puede romperse
6. **Runbook de continuidad** — cómo seguir

### Validación de sintaxis post-edición
- `node --check` en módulos JS editados
- Buscar corrupción de operadores: `grep -nE "\? \\.|\? \?" *.js`
- Extraer bloques `<script>` inline y validar por separado

### Mobile UX del grafo
- Estado de foco visible en móvil
- Acción rápida para limpiar estado
- Targets táctiles > 44px
- Controles sticky adaptados a viewport

### Auditabilidad
- Score con fuente de cálculo visible
- Pesos del score transparentes al usuario
- Exportación CSV de resultados con nombre contextual

---

## 10. Anti-patrones a Evitar

| ❌ Anti-patrón | ✅ Práctica correcta |
|----------------|---------------------|
| Ramas huérfanas sin PR | Abrir PR draft al crear la rama |
| `console.log` para debug en producción | Usar condicional `import.meta.env.DEV` |
| CSS `max-width` como base | Mobile first con `min-width` |
| Datos sensibles en `localStorage` sin cifrar | AES-256-GCM via Web Crypto API |
| Merge con conflictos sin resolver | Rebase antes de merge, validar build |
| Componentes sin `aria-label` | Todo interactivo con label accesible |
| Commits masivos (1000+ líneas) | Commits atómicos < 300 líneas |
| Variables de negocio hardcodeadas | `useBusinessConfig()` desde contexto |
| `cogs_cafe_pct` como porcentaje (32) | Almacenar como decimal (0.32) |

---

*Rö · Abril 2026*
