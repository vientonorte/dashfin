#!/bin/bash

# ============================================================================
# PRE-DEPLOY TEST SCRIPT
# CFO Dashboard - Da Pleisë
# ============================================================================

echo "🚀 Iniciando Pre-Deploy Testing..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# ============================================================================
# 1. CHECK NODE VERSION
# ============================================================================
echo "📦 Verificando Node.js..."
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -ge 18 ]; then
  echo -e "${GREEN}✅ Node.js v$(node -v) - OK${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Node.js v$(node -v) - Requiere v18+${NC}"
  ((FAILED++))
fi
echo ""

# ============================================================================
# 2. CHECK PNPM
# ============================================================================
echo "📦 Verificando pnpm..."
if command -v pnpm &> /dev/null; then
  echo -e "${GREEN}✅ pnpm $(pnpm -v) - OK${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  pnpm no instalado - Instalando...${NC}"
  npm install -g pnpm
fi
echo ""

# ============================================================================
# 3. INSTALL DEPENDENCIES
# ============================================================================
echo "📥 Instalando dependencias..."
if pnpm install --frozen-lockfile; then
  echo -e "${GREEN}✅ Dependencias instaladas - OK${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Error instalando dependencias${NC}"
  ((FAILED++))
fi
echo ""

# ============================================================================
# 4. CHECK FILE STRUCTURE
# ============================================================================
echo "📁 Verificando estructura de archivos..."
FILES_TO_CHECK=(
  "src/app/App.tsx"
  "src/app/components/CFODashboard.tsx"
  "src/app/contexts/DashboardContext.tsx"
  "src/styles/index.css"
  "src/styles/accessibility.css"
  "package.json"
  "vite.config.ts"
)

FILE_CHECK_PASSED=0
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    FILE_CHECK_PASSED=$((FILE_CHECK_PASSED + 1))
  else
    echo -e "${RED}❌ Falta archivo: $file${NC}"
    ((FAILED++))
  fi
done

if [ $FILE_CHECK_PASSED -eq ${#FILES_TO_CHECK[@]} ]; then
  echo -e "${GREEN}✅ Todos los archivos críticos presentes - OK${NC}"
  ((PASSED++))
fi
echo ""

# ============================================================================
# 5. CHECK FOR SYNTAX ERRORS IN CSS
# ============================================================================
echo "🎨 Verificando sintaxis CSS..."
CSS_ERRORS=0

# Check for double colons in border
if grep -r "border:.*:.*;" src/styles/*.css 2>/dev/null; then
  echo -e "${RED}❌ Error de sintaxis CSS encontrado (doble punto)${NC}"
  ((FAILED++))
  CSS_ERRORS=1
fi

if [ $CSS_ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Sintaxis CSS correcta - OK${NC}"
  ((PASSED++))
fi
echo ""

# ============================================================================
# 6. BUILD TEST
# ============================================================================
echo "🔨 Ejecutando build de prueba..."
if pnpm build; then
  echo -e "${GREEN}✅ Build completado exitosamente - OK${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Build falló - Revisar errores arriba${NC}"
  ((FAILED++))
  exit 1
fi
echo ""

# ============================================================================
# 7. CHECK BUILD OUTPUT
# ============================================================================
echo "📂 Verificando output del build..."
if [ -d "dist" ]; then
  DIST_SIZE=$(du -sh dist | cut -f1)
  echo -e "${GREEN}✅ Directorio dist/ creado - Tamaño: $DIST_SIZE${NC}"
  ((PASSED++))
  
  # Check for index.html
  if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ index.html presente en dist/${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ index.html no encontrado en dist/${NC}"
    ((FAILED++))
  fi
else
  echo -e "${RED}❌ Directorio dist/ no fue creado${NC}"
  ((FAILED++))
fi
echo ""

# ============================================================================
# 8. CHECK FOR COMMON ISSUES
# ============================================================================
echo "🔍 Buscando problemas comunes..."

# Check for console.log in production code
CONSOLE_LOGS=$(grep -r "console\.log" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Encontrados $CONSOLE_LOGS console.log() - Considerar remover para producción${NC}"
else
  echo -e "${GREEN}✅ Sin console.log en código - OK${NC}"
  ((PASSED++))
fi

# Check for debugger statements
DEBUGGERS=$(grep -r "debugger" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
if [ "$DEBUGGERS" -gt 0 ]; then
  echo -e "${RED}❌ Encontrados $DEBUGGERS debugger statements${NC}"
  ((FAILED++))
else
  echo -e "${GREEN}✅ Sin debugger statements - OK${NC}"
  ((PASSED++))
fi
echo ""

# ============================================================================
# 9. CHECK BUNDLE SIZE
# ============================================================================
echo "📊 Analizando tamaño del bundle..."
if [ -d "dist/assets" ]; then
  BUNDLE_SIZE=$(du -sh dist/assets | cut -f1)
  echo -e "${BLUE}ℹ️  Tamaño de assets: $BUNDLE_SIZE${NC}"
  
  # Count JS files
  JS_FILES=$(find dist/assets -name "*.js" | wc -l)
  CSS_FILES=$(find dist/assets -name "*.css" | wc -l)
  
  echo -e "${BLUE}ℹ️  Archivos JS: $JS_FILES${NC}"
  echo -e "${BLUE}ℹ️  Archivos CSS: $CSS_FILES${NC}"
  ((PASSED++))
fi
echo ""

# ============================================================================
# 10. ACCESSIBILITY CHECK
# ============================================================================
echo "♿ Verificando archivos de accesibilidad..."
if grep -q "skip-to-main" src/styles/accessibility.css; then
  echo -e "${GREEN}✅ Skip-to-main link presente${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  Skip-to-main link no encontrado${NC}"
fi

if grep -q "focus-visible" src/styles/accessibility.css; then
  echo -e "${GREEN}✅ Focus-visible styles presentes${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  Focus-visible styles no encontrados${NC}"
fi

if grep -q "prefers-reduced-motion" src/styles/accessibility.css; then
  echo -e "${GREEN}✅ Reduced motion support presente${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠️  Reduced motion support no encontrado${NC}"
fi
echo ""

# ============================================================================
# FINAL REPORT
# ============================================================================
echo "═══════════════════════════════════════════════════════════"
echo "📊 RESUMEN DE PRE-DEPLOY TEST"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Tests Pasados: $PASSED${NC}"
echo -e "${RED}❌ Tests Fallidos: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                                           ║${NC}"
  echo -e "${GREEN}║   🎉 READY FOR PRODUCTION DEPLOY! 🚀    ║${NC}"
  echo -e "${GREEN}║                                           ║${NC}"
  echo -e "${GREEN}║   Success Rate: $PERCENTAGE%                    ║${NC}"
  echo -e "${GREEN}║                                           ║${NC}"
  echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
  echo ""
  echo "Siguiente paso:"
  echo "  vercel --prod    # Para Vercel"
  echo "  netlify deploy --prod  # Para Netlify"
  echo "  git push  # Si tienes auto-deploy configurado"
  echo ""
  exit 0
else
  echo -e "${RED}╔═══════════════════════════════════════════╗${NC}"
  echo -e "${RED}║                                           ║${NC}"
  echo -e "${RED}║   ⚠️  ISSUES FOUND - FIX BEFORE DEPLOY  ║${NC}"
  echo -e "${RED}║                                           ║${NC}"
  echo -e "${RED}║   Success Rate: $PERCENTAGE%                    ║${NC}"
  echo -e "${RED}║                                           ║${NC}"
  echo -e "${RED}╚═══════════════════════════════════════════╝${NC}"
  echo ""
  echo "Por favor corrige los errores marcados con ❌ antes de hacer deploy"
  echo ""
  exit 1
fi
