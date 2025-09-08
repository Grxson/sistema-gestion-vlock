#!/bin/bash

# Script de pruebas manuales para el módulo de Suministros
# Este script guía al usuario a través de las pruebas paso a paso

echo "🧪 SCRIPT DE PRUEBAS MANUALES - MÓDULO SUMINISTROS"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para esperar confirmación del usuario
wait_for_user() {
    echo ""
    read -p "Presiona Enter cuando hayas completado esta prueba..."
    echo ""
}

# Función para preguntar si la prueba pasó
ask_test_result() {
    local test_name="$1"
    echo -e "${YELLOW}¿La prueba '$test_name' fue exitosa? (s/n):${NC}"
    read -r result
    if [[ $result == "s" || $result == "S" ]]; then
        echo -e "${GREEN}✅ PASÓ: $test_name${NC}"
        return 0
    else
        echo -e "${RED}❌ FALLÓ: $test_name${NC}"
        return 1
    fi
}

# Inicializar contadores
passed_tests=0
failed_tests=0
total_tests=0

# Función para registrar resultado
record_test() {
    if ask_test_result "$1"; then
        ((passed_tests++))
    else
        ((failed_tests++))
    fi
    ((total_tests++))
}

echo -e "${BLUE}📋 INSTRUCCIONES GENERALES:${NC}"
echo "1. Asegúrate de que el frontend esté corriendo en http://localhost:3000"
echo "2. Asegúrate de que el backend esté corriendo"
echo "3. Ten credenciales válidas para hacer login"
echo "4. Sigue cada paso cuidadosamente"
echo ""

wait_for_user

echo "🔐 MÓDULO 1: AUTENTICACIÓN"
echo "========================="

echo -e "${YELLOW}Prueba 1.1: Login con credenciales válidas${NC}"
echo "- Ve a http://localhost:3000"
echo "- Ingresa credenciales válidas"
echo "- Verifica que aparezca mensaje de bienvenida"
echo "- Confirma que redirija al dashboard"
wait_for_user
record_test "Login con credenciales válidas"

echo -e "${YELLOW}Prueba 1.2: Sesión persistente${NC}"
echo "- Recarga la página (F5)"
echo "- Verifica que la sesión se mantenga"
echo "- No debería redirigir al login"
wait_for_user
record_test "Sesión persistente"

echo ""
echo "📦 MÓDULO 2: NAVEGACIÓN A SUMINISTROS"
echo "====================================="

echo -e "${YELLOW}Prueba 2.1: Acceso al módulo de Suministros${NC}"
echo "- Busca el enlace/menú de 'Suministros' en la interfaz"
echo "- Haz clic en él"
echo "- Verifica que cargue la página de suministros"
echo "- La URL debería contener '/suministros'"
wait_for_user
record_test "Acceso al módulo de Suministros"

echo -e "${YELLOW}Prueba 2.2: Carga de lista de suministros${NC}"
echo "- Verifica que aparezca una tabla/lista de suministros"
echo "- Comprueba que los datos se carguen correctamente"
echo "- Observa si hay indicadores de carga"
wait_for_user
record_test "Carga de lista de suministros"

echo ""
echo "🔍 MÓDULO 3: FUNCIONALIDADES DE BÚSQUEDA Y FILTROS"
echo "=================================================="

echo -e "${YELLOW}Prueba 3.1: Búsqueda de suministros${NC}"
echo "- Busca un campo de búsqueda/filtro"
echo "- Escribe algún término de búsqueda"
echo "- Verifica que la lista se filtre correctamente"
echo "- Borra el término y verifica que vuelvan todos los resultados"
wait_for_user
record_test "Búsqueda de suministros"

echo -e "${YELLOW}Prueba 3.2: Filtros por categoría/tipo${NC}"
echo "- Busca dropdowns o filtros de categoría"
echo "- Selecciona diferentes opciones"
echo "- Verifica que la lista se filtre según la selección"
wait_for_user
record_test "Filtros por categoría"

echo ""
echo "➕ MÓDULO 4: CREACIÓN DE SUMINISTROS"
echo "===================================="

echo -e "${YELLOW}Prueba 4.1: Abrir formulario de nuevo suministro${NC}"
echo "- Busca y haz clic en botón 'Nuevo' o 'Agregar Suministro'"
echo "- Verifica que se abra un formulario/modal"
echo "- Observa que todos los campos necesarios estén presentes"
wait_for_user
record_test "Abrir formulario de nuevo suministro"

echo -e "${YELLOW}Prueba 4.2: Validaciones del formulario${NC}"
echo "- Intenta guardar el formulario vacío"
echo "- Verifica que aparezcan mensajes de validación"
echo "- Prueba con datos inválidos (números negativos, textos muy largos)"
echo "- Confirma que las validaciones funcionen"
wait_for_user
record_test "Validaciones del formulario"

echo -e "${YELLOW}Prueba 4.3: Crear suministro válido${NC}"
echo "- Llena todos los campos obligatorios con datos válidos:"
echo "  * Nombre: 'Suministro Test Manual'"
echo "  * Código: 'MANUAL001'"
echo "  * Descripción: 'Prueba manual del sistema'"
echo "  * Cantidad: '10'"
echo "  * Precio: '100.50'"
echo "- Selecciona opciones en dropdowns si las hay"
echo "- Haz clic en 'Guardar'"
echo "- Verifica mensaje de éxito"
wait_for_user
record_test "Crear suministro válido"

echo -e "${YELLOW}Prueba 4.4: Verificar suministro en lista${NC}"
echo "- Busca el suministro recién creado en la lista"
echo "- Verifica que aparezca con los datos correctos"
echo "- Usa la búsqueda para encontrarlo si es necesario"
wait_for_user
record_test "Verificar suministro en lista"

echo ""
echo "✏️ MÓDULO 5: EDICIÓN DE SUMINISTROS"
echo "==================================="

echo -e "${YELLOW}Prueba 5.1: Abrir formulario de edición${NC}"
echo "- Busca el botón de 'Editar' en el suministro que creaste"
echo "- Haz clic en él"
echo "- Verifica que se abra el formulario con los datos precargados"
wait_for_user
record_test "Abrir formulario de edición"

echo -e "${YELLOW}Prueba 5.2: Modificar y guardar suministro${NC}"
echo "- Cambia algunos valores (ej: cantidad a '15', precio a '120.75')"
echo "- Haz clic en 'Guardar' o 'Actualizar'"
echo "- Verifica mensaje de éxito"
echo "- Confirma que los cambios se reflejen en la lista"
wait_for_user
record_test "Modificar y guardar suministro"

echo ""
echo "🗑️ MÓDULO 6: ELIMINACIÓN DE SUMINISTROS"
echo "======================================="

echo -e "${YELLOW}Prueba 6.1: Eliminar suministro individual${NC}"
echo "- Busca el botón de 'Eliminar' en algún suministro"
echo "- Haz clic en él"
echo "- Verifica que aparezca un mensaje de confirmación"
echo "- Confirma la eliminación"
echo "- Verifica que el suministro desaparezca de la lista"
wait_for_user
record_test "Eliminar suministro individual"

echo ""
echo "📱 MÓDULO 7: RESPONSIVIDAD"
echo "========================="

echo -e "${YELLOW}Prueba 7.1: Vista en dispositivos móviles${NC}"
echo "- Abre las herramientas de desarrollador (F12)"
echo "- Activa el modo de dispositivo móvil"
echo "- Verifica que la interfaz se adapte correctamente"
echo "- Prueba las funcionalidades principales en vista móvil"
wait_for_user
record_test "Vista en dispositivos móviles"

echo ""
echo "⚡ MÓDULO 8: RENDIMIENTO"
echo "======================="

echo -e "${YELLOW}Prueba 8.1: Tiempo de carga${NC}"
echo "- Recarga la página de suministros (F5)"
echo "- Observa el tiempo que tarda en cargar completamente"
echo "- Debería cargar en menos de 5 segundos con conexión normal"
wait_for_user
record_test "Tiempo de carga"

echo -e "${YELLOW}Prueba 8.2: Fluidez de la interfaz${NC}"
echo "- Navega entre diferentes secciones"
echo "- Abre y cierra formularios"
echo "- Verifica que no haya lag o congelamiento"
wait_for_user
record_test "Fluidez de la interfaz"

echo ""
echo "🔧 MÓDULO 9: FUNCIONALIDADES AVANZADAS"
echo "======================================"

echo -e "${YELLOW}Prueba 9.1: Paginación (si existe)${NC}"
echo "- Si hay muchos suministros, busca controles de paginación"
echo "- Navega entre páginas"
echo "- Verifica que funcione correctamente"
wait_for_user
record_test "Paginación"

echo -e "${YELLOW}Prueba 9.2: Ordenamiento (si existe)${NC}"
echo "- Haz clic en encabezados de columnas de la tabla"
echo "- Verifica que ordene ascendente/descendente"
echo "- Prueba con diferentes columnas"
wait_for_user
record_test "Ordenamiento"

echo -e "${YELLOW}Prueba 9.3: Exportación (si existe)${NC}"
echo "- Busca opciones de exportar/descargar datos"
echo "- Prueba la funcionalidad si está disponible"
wait_for_user
record_test "Exportación"

echo ""
echo "🚨 MÓDULO 10: MANEJO DE ERRORES"
echo "==============================="

echo -e "${YELLOW}Prueba 10.1: Manejo de errores de red${NC}"
echo "- Desconecta temporalmente internet o detén el backend"
echo "- Intenta realizar alguna operación"
echo "- Verifica que aparezcan mensajes de error apropiados"
echo "- Reconecta y verifica que vuelva a funcionar"
wait_for_user
record_test "Manejo de errores de red"

# Resumen final
echo ""
echo "📊 RESUMEN DE PRUEBAS"
echo "===================="
echo -e "${GREEN}✅ Pruebas exitosas: $passed_tests${NC}"
echo -e "${RED}❌ Pruebas fallidas: $failed_tests${NC}"
echo -e "${BLUE}📈 Total de pruebas: $total_tests${NC}"

if [ $failed_tests -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ¡Todas las pruebas pasaron! El módulo de Suministros está listo para producción.${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Se encontraron $failed_tests fallas. Revisa los problemas antes de pasar a producción.${NC}"
fi

echo ""
echo "📝 RECOMENDACIONES FINALES:"
echo "- Documenta cualquier problema encontrado"
echo "- Repite las pruebas que fallaron después de corregir"
echo "- Considera crear casos de prueba automatizados para el futuro"
echo ""

echo "✅ Pruebas manuales completadas. ¡Gracias por probar el sistema!"
