#!/bin/bash

# Script de verificación rápida del sistema
echo "🔍 VERIFICACIÓN RÁPIDA DEL SISTEMA VLOCK"
echo "========================================"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar puertos
echo -e "${BLUE}📡 Verificando servicios...${NC}"

# Verificar frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend corriendo en puerto 3000${NC}"
else
    echo -e "${RED}❌ Frontend no responde en puerto 3000${NC}"
fi

# Verificar backend (puertos comunes)
backend_ports=(3001 8000 8080 5000)
backend_found=false

for port in "${backend_ports[@]}"; do
    if curl -s http://localhost:$port > /dev/null; then
        echo -e "${GREEN}✅ Backend corriendo en puerto $port${NC}"
        backend_found=true
        break
    fi
done

if [ "$backend_found" = false ]; then
    echo -e "${RED}❌ Backend no encontrado en puertos comunes${NC}"
fi

echo ""
echo -e "${BLUE}📋 Verificando archivos del proyecto...${NC}"

# Verificar archivos críticos
critical_files=(
    "/home/grxson/Documentos/Github/sistema-gestion-vlock/desktop/src/renderer/pages/Suministros.jsx"
    "/home/grxson/Documentos/Github/sistema-gestion-vlock/desktop/src/renderer/components/FormularioSuministros.jsx"
    "/home/grxson/Documentos/Github/sistema-gestion-vlock/desktop/src/renderer/components/Sidebar.jsx"
    "/home/grxson/Documentos/Github/sistema-gestion-vlock/desktop/.env"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename "$file")${NC}"
    else
        echo -e "${RED}❌ $(basename "$file") no encontrado${NC}"
    fi
done

echo ""
echo -e "${BLUE}🧪 Lista de pruebas disponibles:${NC}"
echo "1. ./manual-test.sh - Pruebas manuales completas (RECOMENDADO)"
echo "2. curl -s http://localhost:3000 - Verificar frontend básico"
echo "3. Abrir http://localhost:3000 en navegador - Prueba visual"

echo ""
echo -e "${YELLOW}📝 SIGUIENTE PASO:${NC}"
echo "Ejecuta: ./manual-test.sh"
echo "Este script te guiará paso a paso por todas las pruebas necesarias."

echo ""
echo -e "${GREEN}🚀 Sistema listo para pruebas!${NC}"
