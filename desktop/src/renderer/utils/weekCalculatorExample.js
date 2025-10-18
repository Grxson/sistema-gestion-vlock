/**
 * Ejemplo de uso del sistema híbrido de semanas (Mes + ISO)
 * Este archivo muestra cómo funciona el nuevo sistema
 */

import { 
  calcularSemanaDelMes, 
  calcularSemanaISO, 
  obtenerInfoSemanaCompleta,
  detectarSemanaActual 
} from './weekCalculator';

// Ejemplo de uso
export function ejemploUsoSistemaHibrido() {
  console.log('=== SISTEMA HÍBRIDO DE SEMANAS ===');
  
  // Ejemplo: Octubre 2025 (mes con 5 semanas)
  const octubre2025 = [
    new Date(2025, 9, 1),   // 1 octubre
    new Date(2025, 9, 7),   // 7 octubre  
    new Date(2025, 9, 14),  // 14 octubre
    new Date(2025, 9, 21),  // 21 octubre
    new Date(2025, 9, 28),  // 28 octubre
    new Date(2025, 9, 31)   // 31 octubre
  ];
  
  console.log('\n--- OCTUBRE 2025 (5 semanas) ---');
  octubre2025.forEach(fecha => {
    const info = obtenerInfoSemanaCompleta(fecha);
    console.log(`${fecha.toLocaleDateString('es-MX')}: ${info.etiquetaMes} | ${info.etiquetaISO}`);
  });
  
  // Ejemplo: Noviembre 2025 (mes con 4 semanas)
  const noviembre2025 = [
    new Date(2025, 10, 1),   // 1 noviembre
    new Date(2025, 10, 7),   // 7 noviembre
    new Date(2025, 10, 14),  // 14 noviembre
    new Date(2025, 10, 21),  // 21 noviembre
    new Date(2025, 10, 28)   // 28 noviembre
  ];
  
  console.log('\n--- NOVIEMBRE 2025 (4 semanas) ---');
  noviembre2025.forEach(fecha => {
    const info = obtenerInfoSemanaCompleta(fecha);
    console.log(`${fecha.toLocaleDateString('es-MX')}: ${info.etiquetaMes} | ${info.etiquetaISO}`);
  });
  
  // Ejemplo: Caso especial - semana que cruza meses
  const fechasCruce = [
    new Date(2025, 9, 30),   // 30 octubre (jueves)
    new Date(2025, 9, 31),   // 31 octubre (viernes)
    new Date(2025, 10, 1),   // 1 noviembre (sábado)
    new Date(2025, 10, 2)    // 2 noviembre (domingo)
  ];
  
  console.log('\n--- SEMANA QUE CRUZA MESES ---');
  fechasCruce.forEach(fecha => {
    const info = obtenerInfoSemanaCompleta(fecha);
    console.log(`${fecha.toLocaleDateString('es-MX')}: ${info.etiquetaMes} | ${info.etiquetaISO}`);
  });
  
  // Semana actual
  console.log('\n--- SEMANA ACTUAL ---');
  const hoy = new Date();
  const infoActual = obtenerInfoSemanaCompleta(hoy);
  console.log(`Hoy (${hoy.toLocaleDateString('es-MX')}): ${infoActual.etiquetaMes} | ${infoActual.etiquetaISO}`);
  console.log(`Semana del mes detectada: ${detectarSemanaActual()}`);
}

// Ejemplo de cómo se usaría en el sistema de nóminas
export function ejemploNominaSistema() {
  console.log('\n=== EJEMPLO EN SISTEMA DE NÓMINAS ===');
  
  // Simular creación de nómina para octubre
  const fechaNomina = new Date(2025, 9, 15); // 15 octubre 2025
  const info = obtenerInfoSemanaCompleta(fechaNomina);
  
  console.log('📋 Datos para nómina:');
  console.log(`   Empleado: Juan Pérez`);
  console.log(`   Período: ${info.periodo}`);
  console.log(`   Semana del mes: ${info.semanaDelMes} (${info.etiquetaMes})`);
  console.log(`   Semana ISO: ${info.semanaISO} (${info.etiquetaISO})`);
  console.log(`   Fechas: ${info.fechaInicio.toLocaleDateString('es-MX')} - ${info.fechaFin.toLocaleDateString('es-MX')}`);
  
  // Para el usuario: "Semana 3 de octubre"
  // Para el sistema: Semana ISO 42 (identificador único)
  console.log('\n✅ Beneficios:');
  console.log('   • Usuario ve: "Semana 3 de octubre" (intuitivo)');
  console.log('   • Sistema usa: Semana ISO 42 (único y estándar)');
  console.log('   • Reportes: Pueden agrupar por mes y semana del mes');
  console.log('   • Consistencia: Semanas que cruzan meses se manejan correctamente');
}
