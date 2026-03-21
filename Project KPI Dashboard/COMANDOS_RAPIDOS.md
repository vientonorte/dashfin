# ⚡ COMANDOS RÁPIDOS - DEPLOY

## 🚀 DEPLOY EN 3 PASOS

### 1️⃣ Pre-Deploy Test
```bash
bash pre-deploy-test.sh
```

### 2️⃣ Build Local
```bash
pnpm build
```

### 3️⃣ Deploy
```bash
# Vercel (Recomendado)
vercel --prod

# O Netlify
netlify deploy --prod

# O simplemente push si tienes auto-deploy
git push
```

---

## 🔧 COMANDOS DE DESARROLLO

### Instalar dependencias
```bash
pnpm install
```

### Iniciar dev server
```bash
pnpm dev
```

### Build para producción
```bash
pnpm build
```

### Preview build local
```bash
pnpm preview
```

---

## ✅ VERIFICACIÓN RÁPIDA

### Check syntax errors
```bash
# CSS
grep -r "border:.*:.*;" src/styles/*.css

# TypeScript (si tienes tsc)
npx tsc --noEmit
```

### Check build size
```bash
pnpm build
du -sh dist
```

### Check accessibility
```bash
# Requiere Lighthouse CI
npx lhci autorun --collect.url=http://localhost:4173
```

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot find module"
```bash
rm -rf node_modules
pnpm install
```

### Error en build
```bash
# Limpiar cache
rm -rf dist
rm -rf node_modules/.vite

# Reinstalar
pnpm install
pnpm build
```

### Port already in use
```bash
# Cambiar puerto en vite.config.ts
# O matar proceso
lsof -ti:5173 | xargs kill -9
```

---

## 📊 QUICK STATUS CHECK

```bash
# Ver versión de Node
node -v

# Ver versión de pnpm
pnpm -v

# Ver espacio en disco
df -h

# Ver tamaño del proyecto
du -sh .
```

---

## 🎯 ONE-LINER DEPLOY

```bash
# Test + Build + Deploy todo en uno
pnpm install && pnpm build && vercel --prod
```

---

**Última actualización**: 2026-02-22
