# 🚀 Navegación Rápida - Quick Navigator

## ¿Qué es?

Un buscador inteligente de secciones que te permite navegar rápidamente a cualquier parte de la aplicación sin usar el mouse.

## ¿Cómo activarlo?

Presiona **`Ctrl + B`** desde cualquier ventana de la aplicación (o `Cmd + B` en Mac)

## Características

### ✨ Búsqueda Inteligente
- Escribe el nombre de la sección que buscas
- Busca por palabras clave alternativas (Ej: "trabajadores" te lleva a Empleados)
- Filtra automáticamente según tus permisos de usuario

### ⌨️ Navegación con Teclado
- **`↑` / `↓`** - Navegar entre resultados
- **`Enter`** - Ir a la sección seleccionada
- **`Esc`** - Cerrar el navegador
- **`Ctrl + B`** - Abrir/cerrar el navegador

### 🎯 Secciones Disponibles

El navegador incluye todas las secciones principales:

- **Dashboard** - Inicio, principal
- **Empleados** - Personal, trabajadores
- **Proyectos** - Obras, construcciones
- **Nómina** - Pagos, salarios
- **Suministros** - Materiales, inventario
- **Proveedores** - Suppliers, vendedores
- **Herramientas** - Equipos, tools
- **Contratos** - Acuerdos, convenios
- **Oficios** - Documentos, comunicados
- **Adeudos** - Deudas, pendientes
- **Ingresos** - Cobros, pagos recibidos
- **Reportes** - Informes, estadísticas
- **Auditoría** - Logs, historial
- **Usuarios** - Cuentas
- **Roles** - Permisos, accesos
- **Configuración** - Ajustes, settings
- **Mi Perfil** - Cuenta personal

#### Módulo de Presupuestos
- **Conceptos de Obra** - Partidas
- **Precios Unitarios** - Costos
- **Presupuestos** - Estimados, cotizaciones
- **Catálogos de Precios** - Listados
- **Nuevo Presupuesto** - Crear, generar
- **IA para Presupuestos** - Inteligencia artificial

## Ejemplos de Uso

### Ejemplo 1: Ir a Empleados
1. Presiona `Ctrl + B`
2. Escribe "empleados" o "trabajadores"
3. Presiona `Enter`

### Ejemplo 2: Ir a Nómina
1. Presiona `Ctrl + B`
2. Escribe "nomina" o "pagos"
3. Usa las flechas para seleccionar si hay múltiples resultados
4. Presiona `Enter`

### Ejemplo 3: Buscar en Presupuestos
1. Presiona `Ctrl + B`
2. Escribe "precios" para ver "Precios Unitarios"
3. O escribe "presupuestos" para ver todas las opciones del módulo
4. Selecciona con flechas y presiona `Enter`

## Ventajas

- ⚡ **Rápido** - Navega en segundos sin usar el mouse
- 🎯 **Preciso** - Búsqueda inteligente por nombre y palabras clave
- 🔒 **Seguro** - Solo muestra las secciones a las que tienes acceso
- 🎨 **Moderno** - Diseño limpio que se adapta al tema claro/oscuro
- ⌨️ **Eficiente** - Totalmente navegable con teclado

## Tips

- No necesitas escribir el nombre completo: "nom" encontrará "Nómina"
- Puedes usar sinónimos: "personal" te llevará a "Empleados"
- Las palabras clave en español e inglés funcionan
- Usa las flechas para explorar todas las opciones disponibles
- Presiona `Ctrl + B` de nuevo para cerrar rápidamente

## Implementación Técnica

### Archivos Modificados
- **`desktop/src/renderer/App.jsx`** - Integración del componente y listener global
- **`desktop/src/renderer/components/QuickNavigator.jsx`** - Componente del navegador

### Tecnologías Utilizadas
- React Hooks (useState, useEffect, useRef)
- Context API (PermissionsContext)
- React Icons (FiSearch, FiX, FiChevronRight)
- CSS Tailwind para estilos responsive y tema oscuro

---

**Última actualización:** 6 de noviembre de 2025
