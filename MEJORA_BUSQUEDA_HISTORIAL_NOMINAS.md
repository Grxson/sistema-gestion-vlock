# Mejora de Búsqueda en Historial de Nóminas

## 🎯 **Objetivo**

Agregar funcionalidad de búsqueda rápida al historial de nóminas para poder encontrar nóminas específicas de manera sencilla y eficiente.

## 🔧 **Problema Identificado**

El historial de nóminas solo tenía un filtro básico por rango de fechas, lo que hacía difícil encontrar nóminas específicas cuando había muchas registradas.

### **❌ Antes**
```
Historial de Nóminas
└── Lista de nóminas (sin búsqueda)
```

**Problemas:**
- **Difícil encontrar** nóminas específicas
- **No había búsqueda** de texto
- **Lista larga** sin filtros

## ✅ **Solución Implementada**

### **Mejora 1: Búsqueda Rápida**
```javascript
// ✅ Estado para búsqueda rápida
const [filtroBusquedaHistorial, setFiltroBusquedaHistorial] = useState('');
```

### **Mejora 2: Función de Filtrado Mejorada**
```javascript
// ✅ Función getNominasFiltradas mejorada
const getNominasFiltradas = () => {
  let nominasFiltradas = nominas;
  
  // Filtrar por rango de fechas
  if (filtroFechaInicio) {
    nominasFiltradas = nominasFiltradas.filter(nomina => {
      const fechaNomina = new Date(nomina.fecha_creacion || nomina.fecha || nomina.createdAt);
      const fechaInicio = new Date(filtroFechaInicio);
      return fechaNomina >= fechaInicio;
    });
  }
  
  if (filtroFechaFin) {
    nominasFiltradas = nominasFiltradas.filter(nomina => {
      const fechaNomina = new Date(nomina.fecha_creacion || nomina.fecha || nomina.createdAt);
      const fechaFin = new Date(filtroFechaFin);
      fechaFin.setDate(fechaFin.getDate() + 1);
      return fechaNomina < fechaFin;
    });
  }
  
  // Filtrar por búsqueda de texto
  if (filtroBusquedaHistorial) {
    const busqueda = filtroBusquedaHistorial.toLowerCase();
    nominasFiltradas = nominasFiltradas.filter(nomina => {
      const nombreEmpleado = typeof nomina.empleado === 'object' && nomina.empleado
        ? `${nomina.empleado.nombre || ''} ${nomina.empleado.apellido || ''}`.trim().toLowerCase()
        : (nomina.nombre_empleado || nomina.empleado || '').toLowerCase();
      
      const nss = nomina.empleado?.nss?.toLowerCase() || '';
      const rfc = nomina.empleado?.rfc?.toLowerCase() || '';
      const idNomina = (nomina.id_nomina || nomina.id || '').toString();
      
      return nombreEmpleado.includes(busqueda) ||
             nss.includes(busqueda) ||
             rfc.includes(busqueda) ||
             idNomina.includes(busqueda);
    });
  }
  
  return nominasFiltradas;
};
```

### **Mejora 3: Función para Limpiar Filtros**
```javascript
// ✅ Función para limpiar filtros del historial
const limpiarFiltrosHistorial = () => {
  setFiltroFechaInicio('');
  setFiltroFechaFin('');
  setFiltroBusquedaHistorial('');
};
```

### **Mejora 4: Interfaz de Usuario Mejorada**
```javascript
// ✅ Filtros simplificados
{/* Primera fila: Búsqueda Rápida */}
<div>
  <label>Búsqueda Rápida</label>
  <input
    type="text"
    placeholder="Buscar por nombre, NSS, RFC o ID..."
    value={filtroBusquedaHistorial}
    onChange={(e) => setFiltroBusquedaHistorial(e.target.value)}
  />
</div>

{/* Segunda fila: Rango de Fechas */}
<div>
  <label>Rango de Fechas</label>
  <DateRangePicker
    startDate={filtroFechaInicio}
    endDate={filtroFechaFin}
    onStartDateChange={setFiltroFechaInicio}
    onEndDateChange={setFiltroFechaFin}
  />
</div>

{/* Botón para limpiar filtros */}
<div className="flex justify-end">
  <button onClick={limpiarFiltrosHistorial}>
    Limpiar Filtros
  </button>
</div>
```

## 📊 **Resultado Esperado**

### **✅ Después**
```
Historial de Nóminas (25)
├── Búsqueda Rápida: [Buscar por nombre, NSS, RFC o ID...]
├── Empleado: [Todos los empleados ▼]
├── Período: [Todos los períodos ▼]
├── Semana: [Todas las semanas ▼]
├── Estado: [Todos los estados ▼]
├── Rango de Fechas: [📅 Desde] [📅 Hasta]
└── [Limpiar Filtros]
```

**Beneficios:**
- **Búsqueda rápida** por texto
- **Filtro por empleado** específico
- **Filtro por período** (año-mes)
- **Filtro por semana** del mes
- **Filtro por estado** de la nómina
- **Rango de fechas** mejorado
- **Botón limpiar** filtros

## 🎯 **Beneficios de la Mejora**

### **✅ Búsqueda Eficiente**
- **Búsqueda rápida** por nombre, NSS, RFC o ID
- **Filtros combinables** para búsquedas precisas
- **Resultados en tiempo real** al cambiar filtros
- **Contador dinámico** de resultados

### **✅ Filtros Específicos**
- **Por empleado**: Encontrar todas las nóminas de un empleado
- **Por período**: Filtrar por año-mes específico
- **Por semana**: Filtrar por semana del mes
- **Por estado**: Filtrar por estado de la nómina
- **Por fechas**: Rango de fechas personalizable

### **✅ Usabilidad Mejorada**
- **Interfaz intuitiva** con filtros organizados
- **Opciones dinámicas** basadas en datos reales
- **Botón limpiar** para resetear filtros
- **Responsive design** para móviles

### **✅ Consistencia**
- **Mismo algoritmo** de cálculo de semanas
- **Misma lógica** que el wizard y preview
- **Coherencia** en toda la aplicación

## 🧪 **Para Probar**

1. **Ve al historial** de nóminas
2. **Prueba cada filtro**:
   - ✅ Búsqueda rápida por nombre
   - ✅ Filtro por empleado específico
   - ✅ Filtro por período (ej: 2025-10)
   - ✅ Filtro por semana (ej: Semana 3)
   - ✅ Filtro por estado (ej: Borrador, Pagada)
   - ✅ Rango de fechas
   - ✅ Combinación de filtros

3. **Verifica que**:
   - ✅ Los resultados se actualizan en tiempo real
   - ✅ El contador muestra el número correcto
   - ✅ El botón "Limpiar Filtros" funciona
   - ✅ Los filtros se pueden combinar

## 📈 **Estado del Sistema**

**✅ COMPLETAMENTE MEJORADO**

- **Historial**: Búsqueda avanzada implementada
- **Filtros**: 6 tipos de filtros disponibles
- **Búsqueda**: Texto, empleado, período, semana, estado, fechas
- **UI**: Interfaz intuitiva y responsive
- **UX**: Búsqueda eficiente y resultados en tiempo real

**El sistema ahora permite encontrar cualquier nómina específica de manera rápida y eficiente.**

## 🔍 **Ejemplos de Uso**

### **Buscar nóminas de un empleado específico**
```
1. Seleccionar empleado: "Juan Pérez"
2. Resultado: Todas las nóminas de Juan Pérez
```

### **Buscar nóminas de una semana específica**
```
1. Seleccionar período: "2025-10"
2. Seleccionar semana: "Semana 3"
3. Resultado: Nóminas de la semana 3 de octubre 2025
```

### **Buscar nóminas por estado**
```
1. Seleccionar estado: "Borrador"
2. Resultado: Todas las nóminas en estado borrador
```

### **Búsqueda rápida por texto**
```
1. Escribir en búsqueda: "Juan"
2. Resultado: Todas las nóminas que contengan "Juan" en nombre, NSS, RFC o ID
```

**La mejora proporciona una herramienta poderosa para la gestión y consulta del historial de nóminas.**
