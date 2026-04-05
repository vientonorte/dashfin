# Da Pleisë — CFO Dashboard

Dashboard financiero para gestión de triple línea de negocio (Café + Hotdesk + Asesorías). Análisis de KPIs, motor de insights IA, alertas automáticas y seguimiento de payback.

**Live:** https://vientonorte.github.io/dashfin/

---

## Stack

| Capa | Tecnología |
|------|-----------|
| UI | React 19 + TypeScript + Tailwind CSS v4 |
| Componentes | Radix UI + shadcn/ui |
| Charts | Recharts |
| Build | Vite 6 |
| Deploy | GitHub Pages (GitHub Actions) |
| Persistencia | localStorage (schema v2.0) |

## Arquitectura

```
dashfin/
├── .github/workflows/        ← CI/CD (build + deploy a GitHub Pages)
├── Project KPI Dashboard/
│   ├── index.html             ← Entry point
│   ├── vite.config.ts         ← Build config (base: /dashfin/)
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── app/
│       │   ├── App.tsx                  ← Router por roles
│       │   ├── components/
│       │   │   ├── CFODashboard.tsx      ← Dashboard principal (admin)
│       │   │   ├── CFODashboardConsolidado.tsx
│       │   │   ├── AICommandCenter.tsx   ← Centro de inteligencia IA
│       │   │   ├── DashboardAdmin.tsx    ← Vista Admin (13 tabs)
│       │   │   ├── DashboardGerente.tsx  ← Vista Gerente
│       │   │   ├── DashboardBarista.tsx  ← Vista por línea de negocio
│       │   │   └── ErrorBoundary.tsx
│       │   ├── contexts/
│       │   │   ├── DashboardContext.tsx   ← Estado global + localStorage
│       │   │   ├── RoleContext.tsx        ← RBAC (admin/gerente/barista)
│       │   │   ├── AIInsightsContext.tsx
│       │   │   └── BusinessConfigContext.tsx
│       │   └── services/
│       │       ├── aiInsightsEngine.ts   ← Motor analítico (anomalías, tendencias)
│       │       └── sheetsSync.ts
│       └── styles/
└── README.md
```

## Roles

| Rol | Acceso |
|-----|--------|
| **CFO / Admin** | Dashboard completo, configuración, exportar PDF ejecutivo |
| **Gerente** | KPIs operativos, checklist, PDF operativo |
| **Barista 1** | Métricas de Café + checklist |
| **Barista 2** | Métricas de Hotdesk + checklist |

## Desarrollo local

```bash
cd "Project KPI Dashboard"
npm install
npm run dev
# → http://localhost:5173/dashfin/
```

Modo debug (role switcher visible): `?debug=true`

## Deploy

Push a `main` → GitHub Actions ejecuta build + deploy automático a GitHub Pages.

---

Rö · Abril 2026
