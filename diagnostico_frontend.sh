#!/bin/bash

# Script para verificar autenticación y peticiones del frontend

BASE_URL="http://localhost:4000/api"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        Diagnóstico de Frontend - Ingresos y Movimientos     ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

print_section() {
    echo ""
    echo -e "${YELLOW}──────────────────────────────────────────────────────────${NC}"
    echo -e "${YELLOW}  $1${NC}"
    echo -e "${YELLOW}──────────────────────────────────────────────────────────${NC}"
}

# ============================================================================
# PASO 1: Verificar que el backend esté corriendo
# ============================================================================
print_section "PASO 1: Verificar Backend"

echo "🔍 Verificando que el backend esté en línea..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health 2>&1 | grep -q "200\|404"; then
    echo -e "${GREEN}✅ Backend está corriendo en puerto 4000${NC}"
else
    echo -e "${RED}❌ Backend NO está respondiendo en puerto 4000${NC}"
    echo "   Por favor, verifica que el backend esté iniciado:"
    echo "   cd backend/api/src && npm start"
    exit 1
fi

# ============================================================================
# PASO 2: Verificar endpoints sin autenticación
# ============================================================================
print_section "PASO 2: Endpoints Públicos (Sin Token)"

echo "🔓 Probando endpoint de movimientos SIN token..."
RESPONSE=$(curl -s "$BASE_URL/movimientos-ingresos")

if echo "$RESPONSE" | jq -e '.message' > /dev/null 2>&1; then
    MESSAGE=$(echo "$RESPONSE" | jq -r '.message')
    CODE=$(echo "$RESPONSE" | jq -r '.code')
    echo -e "${YELLOW}⚠️  Requiere autenticación${NC}"
    echo "   Mensaje: $MESSAGE"
    echo "   Código: $CODE"
else
    echo -e "${GREEN}✅ Endpoint responde sin autenticación${NC}"
fi

# ============================================================================
# PASO 3: Instrucciones para obtener token
# ============================================================================
print_section "PASO 3: Autenticación"

echo "🔑 Para probar con autenticación necesitas:"
echo ""
echo "1. Abre tu aplicación en el navegador"
echo "2. Inicia sesión si no lo has hecho"
echo "3. Abre DevTools (F12)"
echo "4. Ve a la pestaña 'Console'"
echo "5. Ejecuta este comando:"
echo ""
echo -e "${GREEN}   localStorage.getItem('token')${NC}"
echo ""
echo "6. Copia el token (sin las comillas)"
echo "7. Ejecuta este script de nuevo con el token:"
echo ""
echo -e "${GREEN}   ./diagnostico_frontend.sh TU_TOKEN_AQUI${NC}"
echo ""

# Si se proporciona un token como argumento
if [ -n "$1" ]; then
    print_section "PASO 4: Probando con Token Proporcionado"
    
    TOKEN="$1"
    echo "🔑 Usando token: ${TOKEN:0:50}..."
    echo ""
    
    # Probar endpoint de ingresos
    echo "📊 Probando GET /api/ingresos con token..."
    INGRESOS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/ingresos")
    
    if echo "$INGRESOS_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Autenticación exitosa${NC}"
        COUNT=$(echo "$INGRESOS_RESPONSE" | jq '.data | length')
        echo "   Ingresos encontrados: $COUNT"
        
        if [ "$COUNT" -gt 0 ]; then
            echo ""
            echo "   Detalles de ingresos:"
            echo "$INGRESOS_RESPONSE" | jq -r '.data[] | "   - ID: \(.id_ingreso) | Proyecto: \(.proyecto.nombre) | Monto: $\(.monto) | Fecha: \(.fecha)"'
        else
            echo -e "${YELLOW}   ⚠️  No hay ingresos en la base de datos${NC}"
        fi
    else
        echo -e "${RED}❌ Token inválido o expirado${NC}"
        echo "$INGRESOS_RESPONSE" | jq '.'
    fi
    
    echo ""
    echo "📈 Probando GET /api/movimientos-ingresos con token..."
    MOVIMIENTOS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/movimientos-ingresos")
    
    if echo "$MOVIMIENTOS_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Endpoint de movimientos funciona${NC}"
        COUNT=$(echo "$MOVIMIENTOS_RESPONSE" | jq '.data | length')
        echo "   Movimientos encontrados: $COUNT"
        
        if [ "$COUNT" -gt 0 ]; then
            echo ""
            echo "   Resumen:"
            echo "$MOVIMIENTOS_RESPONSE" | jq '.resumen'
        fi
    else
        echo -e "${RED}❌ Error en endpoint de movimientos${NC}"
        echo "$MOVIMIENTOS_RESPONSE" | jq '.'
    fi
fi

# ============================================================================
# PASO 5: Verificar que el frontend esté corriendo
# ============================================================================
print_section "PASO 5: Verificar Frontend (Electron)"

echo "🖥️  Verificando si el frontend está corriendo..."
echo ""
echo "Si NO ves la aplicación abierta:"
echo "   cd desktop"
echo "   npm run dev"
echo ""
echo "Si la aplicación está abierta pero no muestra datos:"
echo "   1. Abre DevTools (F12)"
echo "   2. Ve a la pestaña 'Console'"
echo "   3. Busca errores en rojo"
echo "   4. Ve a la pestaña 'Network'"
echo "   5. Filtra por 'ingresos' o 'movimientos'"
echo "   6. Verifica que las peticiones estén saliendo"
echo ""

# ============================================================================
# RESUMEN
# ============================================================================
print_section "RESUMEN"

echo "✅ Checklist de diagnóstico:"
echo ""
echo "   [ ] Backend corriendo en puerto 4000"
echo "   [ ] Frontend (Electron) abierto"
echo "   [ ] Usuario logueado en la aplicación"
echo "   [ ] Token válido en localStorage"
echo "   [ ] Endpoints responden correctamente con token"
echo "   [ ] No hay errores en DevTools Console"
echo "   [ ] Peticiones HTTP aparecen en DevTools Network"
echo ""
echo -e "${BLUE}Si aún no ves datos, comparte los errores de la consola${NC}"
echo ""
