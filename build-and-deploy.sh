#!/bin/bash

# =====================================================
# SCRIPT DE BUILD Y DEPLOY PARA VLOCK SISTEMA
# Fecha: 2025-10-07
# Propósito: Automatizar el proceso de build y deploy
# =====================================================

set -e  # Salir si hay algún error

echo "🚀 INICIANDO PROCESO DE BUILD Y DEPLOY"
echo "======================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# ===== PASO 1: LIMPIAR CONSOLE.LOGS =====
log_info "Paso 1: Limpiando console.logs del frontend..."

# Buscar y reportar console.logs restantes
CONSOLE_COUNT=$(find desktop/src -name "*.jsx" -o -name "*.js" | xargs grep -l "console\." | wc -l)
if [ $CONSOLE_COUNT -gt 0 ]; then
    log_warning "Se encontraron $CONSOLE_COUNT archivos con console.logs"
    find desktop/src -name "*.jsx" -o -name "*.js" | xargs grep -l "console\." | head -5
    log_warning "Considera limpiar estos archivos para producción"
else
    log_success "No se encontraron console.logs en el frontend"
fi

# ===== PASO 2: VERIFICAR DEPENDENCIAS =====
log_info "Paso 2: Verificando dependencias..."

cd desktop
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependencias del frontend..."
    npm install
else
    log_success "Dependencias del frontend ya instaladas"
fi

cd ../backend/api/src
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependencias del backend..."
    npm install
else
    log_success "Dependencias del backend ya instaladas"
fi

cd ../../..

# ===== PASO 3: BUILD DEL FRONTEND =====
log_info "Paso 3: Construyendo aplicación frontend..."

cd desktop
log_info "Ejecutando build de Vite..."
npm run build

if [ $? -eq 0 ]; then
    log_success "Build del frontend completado"
else
    log_error "Error en el build del frontend"
    exit 1
fi

# ===== PASO 4: EMPAQUETAR APLICACIÓN DESKTOP =====
log_info "Paso 4: Empaquetando aplicación desktop..."

log_info "Generando distribuciones para múltiples plataformas..."

# Limpiar distribuciones anteriores
if [ -d "dist" ]; then
    rm -rf dist
    log_info "Limpiando distribuciones anteriores..."
fi

# Empaquetar para todas las plataformas
log_info "Empaquetando para Windows, Linux y macOS..."
npm run dist

if [ $? -eq 0 ]; then
    log_success "Empaquetado completado exitosamente"
    
    # Mostrar archivos generados
    log_info "Archivos generados en dist/:"
    ls -la dist/ | grep -E "\.(exe|AppImage|dmg|deb|rpm)$" || log_warning "No se encontraron archivos de distribución"
else
    log_error "Error en el empaquetado"
    exit 1
fi

cd ..

# ===== PASO 5: PREPARAR MIGRACIÓN DE BD =====
log_info "Paso 5: Preparando migración de base de datos..."

if [ -f "railway-migration.sql" ]; then
    log_success "Archivo de migración railway-migration.sql listo"
    log_info "Para aplicar en Railway:"
    echo "  1. Conecta a tu base de datos de Railway"
    echo "  2. Ejecuta: mysql -h [host] -u [user] -p [database] < railway-migration.sql"
    echo "  3. Verifica que no se perdieron datos existentes"
else
    log_error "No se encontró el archivo de migración"
fi

# ===== PASO 6: INFORMACIÓN DE DEPLOY =====
log_info "Paso 6: Información para deploy del backend..."

echo ""
echo "📋 PASOS PARA COMPLETAR EL DEPLOY:"
echo "=================================="
echo ""
echo "🗄️  BASE DE DATOS (Railway):"
echo "   1. Conectar a Railway MySQL"
echo "   2. Ejecutar railway-migration.sql"
echo "   3. Verificar integridad de datos"
echo ""
echo "🚀 BACKEND (Railway):"
echo "   1. cd backend/api/src"
echo "   2. Verificar variables de entorno"
echo "   3. railway up (o git push si está conectado)"
echo ""
echo "💻 APLICACIÓN DESKTOP:"
echo "   Archivos listos en desktop/dist/"
if [ -d "desktop/dist" ]; then
    echo "   Tamaño total: $(du -sh desktop/dist | cut -f1)"
fi
echo ""

# ===== RESUMEN FINAL =====
log_success "🎉 PROCESO COMPLETADO EXITOSAMENTE"
echo ""
echo "📊 RESUMEN:"
echo "==========="
echo "✅ Frontend construido"
echo "✅ Aplicación empaquetada"
echo "✅ Migración de BD preparada"
echo "✅ Instrucciones de deploy generadas"
echo ""
log_info "Revisa los archivos en desktop/dist/ para distribución"
log_info "Aplica railway-migration.sql en tu base de datos de Railway"
log_info "Sube el backend actualizado a Railway"

exit 0
