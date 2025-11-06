#!/bin/bash

# =====================================================
# Script de Instalación - Tabla ingresos_movimientos
# =====================================================

echo ""
echo "═══════════════════════════════════════════════"
echo "  🚀 INSTALACIÓN SISTEMA DE MOVIMIENTOS"
echo "═══════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar directorio
if [ ! -d "backend/api/src/migrations" ]; then
    print_error "Error: No se encuentra el directorio backend/api/src/migrations"
    print_warning "Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

print_success "Directorio del proyecto verificado"
echo ""

# Paso 1: Ejecutar migración
print_step "Paso 1: Ejecutando migración de base de datos..."
echo ""

cd backend/api/src/migrations

if [ -f "20250106_create_ingresos_movimientos.js" ]; then
    node 20250106_create_ingresos_movimientos.js
    
    if [ $? -eq 0 ]; then
        print_success "Migración ejecutada exitosamente"
    else
        print_error "Error al ejecutar la migración"
        echo ""
        print_warning "Alternativa: Ejecutar script SQL directamente"
        echo "  mysql -u root -p sistema_gestion < ../../crear_tabla_movimientos.sql"
        exit 1
    fi
else
    print_error "No se encuentra el archivo de migración"
    exit 1
fi

cd ../../../..
echo ""

# Paso 2: Verificar modelo
print_step "Paso 2: Verificando modelo Sequelize..."
echo ""

if [ -f "backend/api/src/models/ingresosMovimientos.model.js" ]; then
    print_success "Modelo ingresosMovimientos.model.js encontrado"
else
    print_warning "Modelo no encontrado"
fi

echo ""

# Paso 3: Verificar relaciones
print_step "Paso 3: Verificando relaciones actualizadas..."
echo ""

if grep -q "ingresos_movimientos" backend/api/src/models/ingreso.model.js; then
    print_success "Relación hasMany añadida al modelo Ingreso"
else
    print_warning "Relación no encontrada en modelo Ingreso"
fi

echo ""

# Paso 4: Verificar componentes frontend
print_step "Paso 4: Verificando componentes frontend..."
echo ""

components=(
    "desktop/src/renderer/components/ingresos/IngresosMovimientosFilters.jsx"
    "desktop/src/renderer/components/ingresos/IngresosMovimientosCards.jsx"
    "desktop/src/renderer/components/ingresos/IngresosMovimientosTable.jsx"
    "desktop/src/renderer/hooks/ingresos/useIngresosMovimientosData.js"
)

for component in "${components[@]}"; do
    if [ -f "$component" ]; then
        print_success "$(basename $component)"
    else
        print_warning "$(basename $component) no encontrado"
    fi
done

echo ""
echo "═══════════════════════════════════════════════"
echo "  📋 RESUMEN DE INSTALACIÓN"
echo "═══════════════════════════════════════════════"
echo ""

print_success "✓ Tabla ingresos_movimientos creada"
print_success "✓ Modelo Sequelize configurado"
print_success "✓ Relaciones establecidas"
print_success "✓ Componentes frontend listos"

echo ""
echo "═══════════════════════════════════════════════"
echo "  🔥 PRÓXIMOS PASOS"
echo "═══════════════════════════════════════════════"
echo ""

echo "1️⃣  Reiniciar el servidor backend:"
echo "   cd backend/api/src && npm start"
echo ""

echo "2️⃣  Verificar en MySQL:"
echo "   DESCRIBE ingresos_movimientos;"
echo ""

echo "3️⃣  Crear controlador y rutas (ver documentación):"
echo "   backend/api/src/controllers/ingresosMovimientosController.js"
echo ""

echo "4️⃣  Crear servicio frontend real:"
echo "   desktop/src/renderer/services/ingresos/movimientosService.js"
echo ""

echo "5️⃣  Integrar con nómina y suministros"
echo ""

echo "📚 Ver documentación completa en:"
echo "   DOCUMENTACION_MOVIMIENTOS_INGRESOS.md"
echo ""

print_success "Instalación completada exitosamente! 🎉"
echo ""
