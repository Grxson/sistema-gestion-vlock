#!/bin/bash

# ================================================================
# 🚀 SCRIPT DE INICIO - SISTEMA DE MOVIMIENTOS
# ================================================================
# Ejecutar desde la raíz del proyecto
# ================================================================

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  🚀 INICIANDO SISTEMA DE MOVIMIENTOS"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# ================================================================
# PASO 1: Iniciar Backend
# ================================================================

print_step "Paso 1: Iniciando backend..."
echo ""

cd backend/api/src

print_info "Asegúrate de que la base de datos está corriendo"
print_info "Backend se iniciará en http://localhost:4000"
echo ""

# Iniciar backend en segundo plano
npm start &
BACKEND_PID=$!

echo ""
print_success "Backend iniciado (PID: $BACKEND_PID)"
print_info "Esperando 5 segundos para que el backend se estabilice..."
sleep 5

# ================================================================
# PASO 2: Iniciar Frontend
# ================================================================

print_step "Paso 2: Iniciando frontend..."
echo ""

cd ../../../desktop

print_info "Frontend se iniciará en http://localhost:3000"
echo ""

# Iniciar frontend en segundo plano
npm run dev:vite &
FRONTEND_PID=$!

echo ""
print_success "Frontend iniciado (PID: $FRONTEND_PID)"
echo ""

# ================================================================
# RESUMEN
# ================================================================

echo "════════════════════════════════════════════════════════════"
echo "  ✅ SISTEMA INICIADO EXITOSAMENTE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🌐 URLs:"
echo "   Backend:  http://localhost:4000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "📋 PIDs de procesos:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "🧪 Para probar el sistema:"
echo "   1. Abre http://localhost:3000"
echo "   2. Navega a Ingresos → Tab 'Movimientos'"
echo "   3. Crea un ingreso para un proyecto"
echo "   4. Paga una nómina de ese proyecto"
echo "   5. Crea un suministro de ese proyecto"
echo "   6. Vuelve a Movimientos y verás los registros"
echo ""
echo "🛑 Para detener ambos servicios:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "   O presiona Ctrl+C y luego ejecuta:"
echo "   pkill -f 'node.*backend' && pkill -f 'vite'"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Mantener el script vivo
print_info "Presiona Ctrl+C para detener ambos servicios..."
wait
