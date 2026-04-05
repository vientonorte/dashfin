# dashfin — Supabase Setup

## 1. Crear proyecto
- Ve a [supabase.com](https://supabase.com) → New Project
- Copia **Project URL** y **anon key** de Settings → API

## 2. Ejecutar schema
- SQL Editor → New Query → pega `supabase/schema.sql` → Run

## 3. Variables de entorno
```bash
cp .env.example .env
# edita VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
```

## 4. Build + deploy
```bash
npm install && npm run build
# dist/ listo para Vercel/Netlify/Pages
```

Sin las env vars, dashfin funciona exactamente igual con localStorage.
