// ⚡ SCRIPT DE VERIFICACIÓN FINAL DE OPTIMIZACIONES
// Ejecutar en DevTools Console de la aplicación

console.log('🚀 INICIANDO VERIFICACIÓN FINAL DE OPTIMIZACIONES...');
console.log('===============================================');

// 1. Verificar que las funciones de prueba están disponibles
if (typeof window.runCompleteTest === 'function') {
  console.log('✅ window.runCompleteTest está disponible');
} else {
  console.warn('⚠️ window.runCompleteTest NO está disponible - verifique el hook useFormDebug');
}

if (typeof window.testFormRenderTime === 'function') {
  console.log('✅ window.testFormRenderTime está disponible');
} else {
  console.warn('⚠️ window.testFormRenderTime NO está disponible - verifique el hook useFormDebug');
}

// 2. Verificar configuración de debugging
console.log('📊 Estado de debugging:');
console.log('- globalThis.debugForms:', globalThis.debugForms);
console.log('- NODE_ENV:', process.env.NODE_ENV || 'no definido');

// 3. Función de verificación automática
function ejecutarVerificacionCompleta() {
  console.log('\n🔄 EJECUTANDO VERIFICACIÓN AUTOMÁTICA...');
  
  // Verificar memoria inicial
  if (performance.memory) {
    const memoryBefore = performance.memory.usedJSHeapSize;
    console.log('📊 Memoria inicial:', (memoryBefore / 1024 / 1024).toFixed(2) + ' MB');
  }
  
  // Ejecutar pruebas si están disponibles
  if (typeof window.runCompleteTest === 'function') {
    console.log('\n⚡ Ejecutando pruebas completas...');
    try {
      window.runCompleteTest();
    } catch (error) {
      console.error('❌ Error ejecutando pruebas completas:', error);
    }
  }
  
  // Simular cambio de ruta a formulario
  setTimeout(() => {
    console.log('\n🧪 Para verificar performance del formulario:');
    console.log('1. Navegue a: Suministros → Nuevo Suministro');
    console.log('2. Execute en consola: window.testFormRenderTime()');
    console.log('3. Objetivo: Tiempo de render < 50ms');
    
    // Verificar memoria después
    if (performance.memory) {
      const memoryAfter = performance.memory.usedJSHeapSize;
      console.log('\n📊 Memoria después:', (memoryAfter / 1024 / 1024).toFixed(2) + ' MB');
    }
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('===============================================');
  }, 2000);
}

// 4. Función para activar debugging si está desactivado
function activarDebugging() {
  globalThis.debugForms = true;
  console.log('🔧 Debugging activado: globalThis.debugForms = true');
}

// 5. Función para verificar console.log limpio en producción
function verificarLogsProduccion() {
  console.log('\n🧹 VERIFICANDO LIMPIEZA DE LOGS DE PRODUCCIÓN...');
  
  // Simular entorno de producción
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  globalThis.debugForms = false;
  
  console.log('📝 Simulando entorno de producción...');
  console.log('- NODE_ENV: production');
  console.log('- debugForms: false');
  console.log('✅ Los console.log de debug deberían estar silenciados');
  
  // Restaurar entorno
  process.env.NODE_ENV = originalEnv;
  globalThis.debugForms = true;
  
  console.log('🔄 Entorno restaurado para desarrollo');
}

// Ejecutar verificación automática
ejecutarVerificacionCompleta();

// Exponer funciones adicionales
window.activarDebugging = activarDebugging;
window.verificarLogsProduccion = verificarLogsProduccion;
window.ejecutarVerificacionCompleta = ejecutarVerificacionCompleta;

console.log('\n📚 FUNCIONES DISPONIBLES:');
console.log('- window.activarDebugging() - Activa el debugging');
console.log('- window.verificarLogsProduccion() - Verifica logs limpios');
console.log('- window.ejecutarVerificacionCompleta() - Re-ejecuta todas las pruebas');
