#!/bin/bash

# Script de prueba del flujo de movimientos de ingresos
# Ejecutar desde la raíz del proyecto

BASE_URL="http://localhost:4000/api"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   PRUEBA DE FLUJO: Sistema de Movimientos de Ingresos      ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Función para imprimir sección
print_section() {
    echo ""
    echo -e "${YELLOW}──────────────────────────────────────────────────────────${NC}"
    echo -e "${YELLOW}  $1${NC}"
    echo -e "${YELLOW}──────────────────────────────────────────────────────────${NC}"
}

# Función para verificar respuesta
check_response() {
    if echo "$1" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Exitoso${NC}"
        return 0
    else
        echo -e "${RED}❌ Falló${NC}"
        echo "Respuesta: $1"
        return 1
    fi
}

# ============================================================================
# PASO 0: Estado inicial
# ============================================================================
print_section "PASO 0: Estado Inicial"

echo "📊 Consultando movimientos actuales..."
MOVIMIENTOS_INICIAL=$(curl -s "$BASE_URL/movimientos-ingresos")
COUNT_INICIAL=$(echo "$MOVIMIENTOS_INICIAL" | jq '.data | length')
echo "   Total de movimientos: $COUNT_INICIAL"

if [ "$COUNT_INICIAL" -gt 0 ]; then
    echo ""
    echo "   Desglose actual:"
    echo "$MOVIMIENTOS_INICIAL" | jq -r '.data[] | "   - \(.tipo | ascii_upcase): $\(.monto) (\(.fuente)) - \(.descripcion)"'
fi

echo ""
echo "$MOVIMIENTOS_INICIAL" | jq '.resumen'

# ============================================================================
# INSTRUCCIONES MANUALES
# ============================================================================
print_section "INSTRUCCIONES DE PRUEBA MANUAL"

echo -e "${YELLOW}📝 Vamos a probar el flujo completo:${NC}"
echo ""
echo "1️⃣  ${GREEN}Crea un INGRESO desde tu aplicación:${NC}"
echo "    - Ve a la sección 'Ingresos'"
echo "    - Clic en 'Nuevo Ingreso'"
echo "    - Proyecto: Oficina Principal"
echo "    - Monto: 100000"
echo "    - Fuente: Presupuesto Inicial"
echo "    - Fecha: Hoy"
echo "    - Guarda"
echo ""
echo "2️⃣  ${GREEN}Luego ejecuta este script nuevamente${NC} para ver si se creó el movimiento inicial"
echo ""
echo "3️⃣  ${GREEN}Crea un SUMINISTRO:${NC}"
echo "    - Ve a 'Suministros'"
echo "    - Clic en 'Nuevo Suministro'"
echo "    - Proyecto: Oficina Principal"
echo "    - Nombre: Material de prueba"
echo "    - Costo: 5000"
echo "    - Guarda"
echo ""
echo "4️⃣  ${GREEN}Ejecuta el script de nuevo${NC} para ver el movimiento de gasto"
echo ""
echo "5️⃣  ${GREEN}Revisa el tab 'Movimientos'${NC} en Ingresos para ver todo"
echo ""

# ============================================================================
# PASO 1: Análisis detallado de movimientos
# ============================================================================
print_section "PASO 1: Análisis Detallado de Movimientos"

echo "🔍 Consultando movimientos con detalles..."
MOVIMIENTOS=$(curl -s "$BASE_URL/movimientos-ingresos")

echo ""
echo "📈 Resumen Financiero:"
echo "$MOVIMIENTOS" | jq '{
  "💰 Total Ingresos": .resumen.totalIngresos,
  "💸 Total Gastos": .resumen.totalGastos,
  "🔧 Total Ajustes": .resumen.totalAjustes,
  "💵 Saldo Actual": .resumen.saldoActual,
  "📊 Porcentaje Gastado": (if .resumen.totalIngresos > 0 then (.resumen.totalGastos / .resumen.totalIngresos * 100 | round) else 0 end)
}'

echo ""
echo "📋 Movimientos Registrados:"
COUNT_ACTUAL=$(echo "$MOVIMIENTOS" | jq '.data | length')

if [ "$COUNT_ACTUAL" -eq 0 ]; then
    echo -e "${YELLOW}   ⚠️  No hay movimientos registrados${NC}"
else
    echo "$MOVIMIENTOS" | jq -r '.data[] | "\n   ID: \(.id_mov)\n   Fecha: \(.fecha)\n   Proyecto: \(.proyecto_nombre // "N/A")\n   Tipo: \(.tipo | ascii_upcase)\n   Fuente: \(.fuente)\n   Monto: $\(.monto)\n   Saldo después: $\(.saldo_after // "N/A")\n   Descripción: \(.descripcion)\n   ---"'
fi

# ============================================================================
# PASO 2: Verificar logs del backend
# ============================================================================
print_section "PASO 2: Verificar Logs del Backend"

echo "📝 Buscando logs relacionados con movimientos..."
echo ""

if [ -f "backend/api/src/server.log" ]; then
    echo "🔍 Últimas líneas del log de creación de movimientos:"
    grep -i "movimiento" backend/api/src/server.log | tail -10 || echo "   No se encontraron logs de movimientos"
else
    echo -e "${YELLOW}   ⚠️  Archivo server.log no encontrado${NC}"
fi

# ============================================================================
# PASO 3: Verificar proyectos
# ============================================================================
print_section "PASO 3: Capital por Proyecto"

echo "🏗️  Consultando capital disponible por proyecto..."
echo ""

CAPITAL_PROYECTOS=$(echo "$MOVIMIENTOS" | jq '.capitalPorProyecto')

if [ "$(echo "$CAPITAL_PROYECTOS" | jq 'length')" -eq 0 ]; then
    echo -e "${YELLOW}   ⚠️  No hay datos de capital por proyecto${NC}"
else
    echo "$CAPITAL_PROYECTOS" | jq -r '.[] | "\n   Proyecto ID: \(.id_proyecto)\n   💰 Total Ingresos: $\(.totalIngresos)\n   💸 Total Gastos: $\(.totalGastos)\n   🔧 Total Ajustes: $\(.totalAjustes)\n   💵 Saldo: $\(.saldoActual)\n   ---"'
fi

# ============================================================================
# COMPARACIÓN
# ============================================================================
print_section "COMPARACIÓN: Antes vs Ahora"

COUNT_NUEVA=$(curl -s "$BASE_URL/movimientos-ingresos" | jq '.data | length')
DIFERENCIA=$((COUNT_NUEVA - COUNT_INICIAL))

echo "   Movimientos iniciales: $COUNT_INICIAL"
echo "   Movimientos actuales:  $COUNT_NUEVA"

if [ $DIFERENCIA -gt 0 ]; then
    echo -e "   ${GREEN}✅ Se agregaron $DIFERENCIA nuevo(s) movimiento(s)${NC}"
elif [ $DIFERENCIA -lt 0 ]; then
    echo -e "   ${RED}❌ Se eliminaron ${DIFERENCIA#-} movimiento(s)${NC}"
else
    echo -e "   ${YELLOW}⚠️  No hay cambios${NC}"
fi

# ============================================================================
# RESUMEN FINAL
# ============================================================================
print_section "RESUMEN FINAL"

RESUMEN=$(curl -s "$BASE_URL/movimientos-ingresos" | jq '.resumen')

echo "Estado del Sistema:"
echo ""
echo "$RESUMEN" | jq '{
  "Estado": (if .saldoActual > 0 then "✅ CON FONDOS" elif .saldoActual < 0 then "🚨 SOBREGIRO" else "⚠️ SIN FONDOS" end),
  "Total Ingresos": "$\(.totalIngresos)",
  "Total Gastos": "$\(.totalGastos)",
  "Saldo Disponible": "$\(.saldoActual)",
  "% Utilizado": (if .totalIngresos > 0 then "\((.totalGastos / .totalIngresos * 100) | round)%" else "N/A" end)
}'

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    FIN DE PRUEBA                            ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
