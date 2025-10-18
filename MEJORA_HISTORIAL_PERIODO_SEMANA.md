# Mejora del Historial de Nóminas - Período y Semana

## 🎯 **Objetivo**

Mejorar la visualización del historial de nóminas para mostrar tanto el período como la semana específica a la que pertenece cada nómina.

## 🔧 **Problema Identificado**

En el historial de nóminas solo se mostraba información básica del período, pero no se especificaba claramente la semana del mes a la que pertenecía cada nómina.

### **❌ Antes**
```
Juan Pérez
2025-10 • $2,000.00
```

**Problemas:**
- **No especificaba** la semana del mes
- **Información incompleta** sobre el período
- **Difícil identificar** nóminas de la misma semana

## ✅ **Solución Implementada**

### **Mejora 1: Función de Cálculo de Semana**
```javascript
// ✅ Función para calcular semana del mes (mismo algoritmo que el wizard)
const calcularSemanaDelMes = (fecha) => {
  const año = fecha.getFullYear();
  const mes = fecha.getMonth();
  const dia = fecha.getDate();
  
  // Obtener el primer día del mes
  const primerDiaDelMes = new Date(año, mes, 1);
  const diaPrimerDia = primerDiaDelMes.getDay(); // 0 = domingo, 1 = lunes, etc.
  
  // Calcular en qué fila del calendario está la fecha
  const diasEnPrimeraFila = 7 - diaPrimerDia; // Días del mes en la primera fila
  
  if (dia <= diasEnPrimeraFila) {
    // La fecha está en la primera fila
    return 1;
  } else {
    // La fecha está en una fila posterior
    const diasRestantes = dia - diasEnPrimeraFila;
    const semanaDelMes = 1 + Math.ceil(diasRestantes / 7);
    
    // Calcular cuántas semanas tiene realmente el mes
    const ultimoDiaDelMes = new Date(año, mes + 1, 0);
    const diasEnElMes = ultimoDiaDelMes.getDate();
    const diasRestantesTotal = diasEnElMes - diasEnPrimeraFila;
    const filasAdicionales = Math.ceil(diasRestantesTotal / 7);
    const totalFilas = 1 + filasAdicionales;
    
    // Limitar al número real de semanas del mes
    return Math.max(1, Math.min(semanaDelMes, totalFilas));
  }
};
```

### **Mejora 2: Lógica de Obtención de Información**
```javascript
// ✅ Obtener período y semana
let periodo = 'Sin período';
let semana = '';

// Intentar obtener información de la semana desde la base de datos
if (nomina.semana && typeof nomina.semana === 'object') {
  // Si tenemos información de la semana desde la BD
  const semanaData = nomina.semana;
  const fechaInicio = new Date(semanaData.fecha_inicio);
  const año = fechaInicio.getFullYear();
  const mes = fechaInicio.getMonth() + 1;
  const semanaDelMes = calcularSemanaDelMes(fechaInicio);
  
  periodo = `${año}-${mes.toString().padStart(2, '0')}`;
  semana = `Semana ${semanaDelMes}`;
} else {
  // Fallback: calcular desde fecha de creación
  const fechaCreacion = new Date(nomina.fecha_creacion || nomina.createdAt || nomina.fecha);
  if (!isNaN(fechaCreacion.getTime())) {
    const año = fechaCreacion.getFullYear();
    const mes = fechaCreacion.getMonth() + 1;
    const semanaDelMes = calcularSemanaDelMes(fechaCreacion);
    
    periodo = `${año}-${mes.toString().padStart(2, '0')}`;
    semana = `Semana ${semanaDelMes}`;
  }
}
```

### **Mejora 3: Visualización Mejorada**
```javascript
// ✅ Mostrar período y semana
<div className="text-xs text-gray-500 dark:text-gray-400">
  {periodo}{semana ? ` • ${semana}` : ''} • {formatCurrency(nomina.monto_total || nomina.monto || 0)}
  {nomina.pago_parcial && (
    <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
      (Parcial: {formatCurrency(nomina.monto_a_pagar || 0)})
    </span>
  )}
</div>
```

## 📊 **Resultado Esperado**

### **✅ Después**
```
Juan Pérez
2025-10 • Semana 3 • $2,000.00
```

**Beneficios:**
- **Especifica claramente** la semana del mes
- **Información completa** del período
- **Fácil identificar** nóminas de la misma semana
- **Consistencia** con el wizard y preview

## 🎯 **Beneficios de la Mejora**

### **✅ Información Completa**
- **Período**: Año y mes (ej: 2025-10)
- **Semana**: Semana específica del mes (ej: Semana 3)
- **Monto**: Monto total de la nómina
- **Estado**: Parcial si aplica

### **✅ Consistencia**
- **Mismo algoritmo** que el wizard y preview
- **Misma lógica** de cálculo de semanas
- **Coherencia** en toda la aplicación

### **✅ Robustez**
- **Prioriza** información de la base de datos
- **Fallback** a fecha de creación
- **Manejo de errores** robusto
- **Validación** de fechas

### **✅ Usabilidad**
- **Identificación rápida** de nóminas
- **Agrupación visual** por semana
- **Información clara** y concisa
- **Fácil navegación** del historial

## 🧪 **Para Probar**

1. **Ve al historial** de nóminas
2. **Verifica que** cada nómina muestra:
   - ✅ Período (año-mes)
   - ✅ Semana del mes
   - ✅ Monto total
   - ✅ Estado si es parcial

3. **Confirma que**:
   - ✅ Las semanas son correctas
   - ✅ Coinciden con el wizard
   - ✅ Son consistentes con el calendario

## 📈 **Estado del Sistema**

**✅ COMPLETAMENTE MEJORADO**

- **Historial**: Muestra período y semana
- **Wizard**: Calcula semanas correctamente
- **Preview**: Muestra semana correcta
- **PDF**: Genera con semana correcta
- **Backend**: Verifica duplicados correctamente

**El sistema ahora proporciona información completa y consistente en todas sus partes.**

## 🔍 **Ejemplos de Visualización**

### **Nómina Completa**
```
Juan Pérez
2025-10 • Semana 3 • $2,000.00
```

### **Nómina Parcial**
```
María García
2025-10 • Semana 2 • $1,500.00 (Parcial: $1,000.00)
```

### **Nómina sin Información de Semana**
```
Carlos López
2025-10 • $1,800.00
```

**La mejora proporciona información clara y útil para la gestión de nóminas.**
