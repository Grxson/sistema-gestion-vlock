# Reportes por Semanas - Implementación Completada

## 🎯 **Objetivo**

Crear una tabla detallada de reportes por semanas que permita ver el total generado de nóminas pagadas organizadas por semana del mes, con filtros por período y año para facilitar la navegación a través de muchos meses de datos.

## 🔧 **Problema Identificado**

El sistema manejaba nóminas por semanas (Semana 1, Semana 2, Semana 3, etc.) pero no había una forma fácil de:
- **Ver el desglose** por semanas de diferentes meses
- **Navegar** a través de muchos meses de datos
- **Filtrar** por períodos específicos
- **Ver totales** consolidados por semana

### **❌ Antes**
```
Reportes de Nóminas
├── Resumen Semanal (solo semana actual)
├── Gráficas
├── Lista de Pagos
└── Tabla Detallada (sin agrupación por semanas)
```

**Problemas:**
- **No había agrupación** por semanas del mes
- **Difícil navegar** entre muchos meses
- **No había filtros** por período específico
- **No se veían totales** por semana

## ✅ **Solución Implementada**

### **Mejora 1: Nueva Pestaña "Reportes por Semanas"**
```javascript
// ✅ Nueva pestaña agregada
const tabs = [
  { id: 'summary', name: 'Resumen Semanal', icon: CalendarIcon },
  { id: 'charts', name: 'Gráficas', icon: ChartBarIcon },
  { id: 'payments', name: 'Lista de Pagos', icon: UserGroupIcon },
  { id: 'weekly-reports', name: 'Reportes por Semanas', icon: TableCellsIcon }, // ← NUEVA
  { id: 'detailed', name: 'Tabla Detallada', icon: DocumentTextIcon }
];
```

### **Mejora 2: Estados para Filtros**
```javascript
// ✅ Estados para reportes por semanas
const [weeklyReportsData, setWeeklyReportsData] = useState(null);
const [selectedPeriod, setSelectedPeriod] = useState('');
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
```

### **Mejora 3: Función de Cálculo de Reportes**
```javascript
// ✅ Función calculateWeeklyReportsData
const calculateWeeklyReportsData = () => {
  // Función para calcular semana del mes (mismo algoritmo que el wizard)
  const calcularSemanaDelMes = (fecha) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const dia = fecha.getDate();
    
    const primerDiaDelMes = new Date(año, mes, 1);
    const diaPrimerDia = primerDiaDelMes.getDay();
    const diasEnPrimeraFila = 7 - diaPrimerDia;
    
    if (dia <= diasEnPrimeraFila) {
      return 1;
    } else {
      const diasRestantes = dia - diasEnPrimeraFila;
      const semanaDelMes = 1 + Math.ceil(diasRestantes / 7);
      
      const ultimoDiaDelMes = new Date(año, mes + 1, 0);
      const diasEnElMes = ultimoDiaDelMes.getDate();
      const diasRestantesTotal = diasEnElMes - diasEnPrimeraFila;
      const filasAdicionales = Math.ceil(diasRestantesTotal / 7);
      const totalFilas = 1 + filasAdicionales;
      
      return Math.max(1, Math.min(semanaDelMes, totalFilas));
    }
  };

  // Filtrar nóminas por período y año si están seleccionados
  let nominasFiltradas = nominas;
  
  if (selectedPeriod) {
    const [año, mes] = selectedPeriod.split('-').map(Number);
    nominasFiltradas = nominasFiltradas.filter(nomina => {
      const fechaNomina = new Date(nomina.fecha_creacion || nomina.createdAt || nomina.fecha);
      return fechaNomina.getFullYear() === año && fechaNomina.getMonth() === (mes - 1);
    });
  } else if (selectedYear) {
    nominasFiltradas = nominasFiltradas.filter(nomina => {
      const fechaNomina = new Date(nomina.fecha_creacion || nomina.createdAt || nomina.fecha);
      return fechaNomina.getFullYear() === selectedYear;
    });
  }

  // Agrupar por período y semana
  const reportesPorSemana = {};
  
  nominasFiltradas.forEach(nomina => {
    const fechaNomina = new Date(nomina.fecha_creacion || nomina.createdAt || nomina.fecha);
    const año = fechaNomina.getFullYear();
    const mes = fechaNomina.getMonth() + 1;
    const semanaDelMes = calcularSemanaDelMes(fechaNomina);
    
    const periodo = `${año}-${mes.toString().padStart(2, '0')}`;
    const clave = `${periodo}-Semana${semanaDelMes}`;
    
    if (!reportesPorSemana[clave]) {
      reportesPorSemana[clave] = {
        periodo,
        semana: semanaDelMes,
        año,
        mes,
        nombreMes: fechaNomina.toLocaleDateString('es-MX', { month: 'long' }),
        nominas: [],
        totalNominas: 0,
        totalMonto: 0,
        totalPagado: 0,
        totalPendiente: 0,
        empleados: new Set()
      };
    }
    
    const montoTotal = parseFloat(nomina.monto_total || nomina.monto || 0);
    const montoPagado = parseFloat(nomina.monto_pagado || 0);
    const montoPendiente = montoTotal - montoPagado;
    
    reportesPorSemana[clave].nominas.push(nomina);
    reportesPorSemana[clave].totalNominas++;
    reportesPorSemana[clave].totalMonto += montoTotal;
    reportesPorSemana[clave].totalPagado += montoPagado;
    reportesPorSemana[clave].totalPendiente += montoPendiente;
    reportesPorSemana[clave].empleados.add(nomina.id_empleado);
  });

  // Convertir a array y ordenar
  const reportesArray = Object.values(reportesPorSemana).map(reporte => ({
    ...reporte,
    totalEmpleados: reporte.empleados.size,
    empleados: Array.from(reporte.empleados)
  }));

  // Ordenar por año, mes y semana
  reportesArray.sort((a, b) => {
    if (a.año !== b.año) return b.año - a.año; // Más recientes primero
    if (a.mes !== b.mes) return b.mes - a.mes;
    return b.semana - a.semana;
  });

  // Calcular totales generales
  const totalesGenerales = reportesArray.reduce((totales, reporte) => {
    return {
      totalNominas: totales.totalNominas + reporte.totalNominas,
      totalMonto: totales.totalMonto + reporte.totalMonto,
      totalPagado: totales.totalPagado + reporte.totalPagado,
      totalPendiente: totales.totalPendiente + reporte.totalPendiente,
      totalEmpleados: Math.max(totales.totalEmpleados, reporte.totalEmpleados)
    };
  }, {
    totalNominas: 0,
    totalMonto: 0,
    totalPagado: 0,
    totalPendiente: 0,
    totalEmpleados: 0
  });

  setWeeklyReportsData({
    reportes: reportesArray,
    totales: totalesGenerales,
    periodosDisponibles: [...new Set(nominas.map(n => {
      const fecha = new Date(n.fecha_creacion || n.createdAt || n.fecha);
      return `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
    }))].sort().reverse(),
    añosDisponibles: [...new Set(nominas.map(n => {
      const fecha = new Date(n.fecha_creacion || n.createdAt || n.fecha);
      return fecha.getFullYear();
    }))].sort((a, b) => b - a)
  });
};
```

### **Mejora 4: Interfaz de Usuario Completa**
```javascript
// ✅ Filtros de navegación
<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label>Año</label>
      <select value={selectedYear} onChange={(e) => {
        setSelectedYear(parseInt(e.target.value));
        setSelectedPeriod('');
      }}>
        <option value="">Todos los años</option>
        {weeklyReportsData?.añosDisponibles?.map(año => (
          <option key={año} value={año}>{año}</option>
        ))}
      </select>
    </div>
    <div>
      <label>Período Específico</label>
      <select value={selectedPeriod} onChange={(e) => {
        setSelectedPeriod(e.target.value);
        if (e.target.value) {
          const [año] = e.target.value.split('-');
          setSelectedYear(parseInt(año));
        }
      }}>
        <option value="">Todos los períodos</option>
        {weeklyReportsData?.periodosDisponibles?.map(periodo => (
          <option key={periodo} value={periodo}>{periodo}</option>
        ))}
      </select>
    </div>
    <div>
      <button onClick={() => {
        setSelectedPeriod('');
        setSelectedYear(new Date().getFullYear());
      }}>
        Limpiar Filtros
      </button>
    </div>
  </div>
</div>

// ✅ Tarjetas de totales generales
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center">
      <DocumentTextIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Nóminas</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {weeklyReportsData.totales.totalNominas}
        </p>
      </div>
    </div>
  </div>
  
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center">
      <CurrencyDollarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monto Total</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {formatCurrency(weeklyReportsData.totales.totalMonto)}
        </p>
      </div>
    </div>
  </div>
  
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center">
      <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pagado</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {formatCurrency(weeklyReportsData.totales.totalPagado)}
        </p>
      </div>
    </div>
  </div>
  
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center">
      <ClockIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pendiente</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {formatCurrency(weeklyReportsData.totales.totalPendiente)}
        </p>
      </div>
    </div>
  </div>
</div>

// ✅ Tabla detallada por semanas
<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
  <thead className="bg-gray-50 dark:bg-gray-700">
    <tr>
      <th>Período</th>
      <th>Semana</th>
      <th>Nóminas</th>
      <th>Empleados</th>
      <th>Monto Total</th>
      <th>Pagado</th>
      <th>Pendiente</th>
    </tr>
  </thead>
  <tbody>
    {weeklyReportsData?.reportes?.map((reporte, index) => (
      <tr key={`${reporte.periodo}-${reporte.semana}`}>
        <td>{reporte.periodo}</td>
        <td>Semana {reporte.semana}</td>
        <td>{reporte.totalNominas}</td>
        <td>{reporte.totalEmpleados}</td>
        <td>{formatCurrency(reporte.totalMonto)}</td>
        <td className="text-green-600">{formatCurrency(reporte.totalPagado)}</td>
        <td className="text-orange-600">{formatCurrency(reporte.totalPendiente)}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## 📊 **Resultado Esperado**

### **✅ Después**
```
Reportes de Nóminas
├── Resumen Semanal
├── Gráficas
├── Lista de Pagos
├── Reportes por Semanas ← NUEVA
│   ├── [Filtros: Año | Período | Limpiar]
│   ├── [Totales: Nóminas | Monto | Pagado | Pendiente]
│   └── [Tabla: Período | Semana | Nóminas | Empleados | Monto | Pagado | Pendiente]
└── Tabla Detallada
```

**Beneficios:**
- ✅ **Agrupación por semanas** del mes
- ✅ **Filtros por año** y período específico
- ✅ **Totales generales** consolidados
- ✅ **Tabla detallada** con desglose por semana
- ✅ **Navegación fácil** entre muchos meses
- ✅ **Ordenamiento** por fecha (más recientes primero)

## 🎯 **Beneficios de la Mejora**

### **✅ Navegación Eficiente**
- **Filtro por año**: Ver todos los meses de un año específico
- **Filtro por período**: Ver un mes específico (ej: 2025-10)
- **Botón limpiar**: Resetear filtros fácilmente
- **Ordenamiento**: Más recientes primero

### **✅ Información Detallada**
- **Por semana**: Ver desglose de cada semana del mes
- **Totales por semana**: Nóminas, empleados, montos
- **Estado de pagos**: Pagado vs Pendiente por semana
- **Totales generales**: Resumen de todos los datos filtrados

### **✅ Usabilidad Mejorada**
- **Interfaz intuitiva** con filtros claros
- **Tarjetas de resumen** con iconos y colores
- **Tabla responsive** para diferentes pantallas
- **Estados vacíos** cuando no hay datos

### **✅ Consistencia**
- **Mismo algoritmo** de cálculo de semanas que el wizard
- **Misma lógica** de fechas y períodos
- **Coherencia** en toda la aplicación

## 🧪 **Para Probar**

1. **Ve a Reportes de Nóminas**
2. **Selecciona la pestaña** "Reportes por Semanas"
3. **Prueba los filtros**:
   - ✅ Filtrar por año (ej: 2025)
   - ✅ Filtrar por período específico (ej: 2025-10)
   - ✅ Limpiar filtros
4. **Verifica la tabla**:
   - ✅ Datos agrupados por semana
   - ✅ Totales correctos por semana
   - ✅ Ordenamiento por fecha
   - ✅ Colores para pagado/pendiente

## 📈 **Estado del Sistema**

**✅ COMPLETAMENTE IMPLEMENTADO**

- **Nueva pestaña**: "Reportes por Semanas" agregada
- **Filtros**: Por año y período específico
- **Cálculos**: Agrupación por semanas del mes
- **Totales**: Generales y por semana
- **Tabla**: Detallada con desglose completo
- **UI**: Interfaz intuitiva y responsive

**El sistema ahora permite navegar fácilmente a través de muchos meses de datos de nóminas, con un desglose detallado por semanas del mes.**

## 🔍 **Ejemplos de Uso**

### **Ver todas las semanas de 2025**
```
1. Seleccionar año: "2025"
2. Resultado: Todas las semanas de todos los meses de 2025
```

### **Ver solo octubre 2025**
```
1. Seleccionar período: "2025-10"
2. Resultado: Solo las semanas de octubre 2025
```

### **Ver resumen general**
```
1. Sin filtros (todos los datos)
2. Resultado: Todas las semanas de todos los períodos
```

**La mejora proporciona una herramienta poderosa para el análisis y consulta de nóminas por semanas, facilitando la gestión de datos históricos.**
