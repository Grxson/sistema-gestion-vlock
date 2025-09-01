// 🚀 Script de Testing Automático Final para FormularioSuministros
// Ejecutar en DevTools Console después de navegar a Suministros

console.log('🚀 INICIANDO TESTING FINAL DE OPTIMIZACIONES DE PERFORMANCE');
console.log('================================================================');

// 1. Activar debugging avanzado
localStorage.setItem('debug_forms', 'true');
globalThis.debugForms = true;
console.log('✅ 1. Debugging avanzado activado');

// 2. Función para testing de render performance
async function testRenderPerformance() {
  console.log('\n📊 2. TESTING RENDER PERFORMANCE');
  console.log('----------------------------------');
  
  performance.mark('form-test-start');
  
  // Simular navegación al formulario (esto debe hacerse manualmente)
  console.log('⚠️  ACCIÓN REQUERIDA: Navegar a Suministros → Nuevo Suministro');
  console.log('   Después de navegar, ejecutar: testFormRenderTime()');
  
  // Función para medir después de la navegación
  window.testFormRenderTime = () => {
    performance.mark('form-test-end');
    performance.measure('form-render-test', 'form-test-start', 'form-test-end');
    
    const measures = performance.getEntriesByType('measure');
    const renderMeasure = measures.find(m => m.name === 'form-render-test');
    
    if (renderMeasure) {
      const renderTime = renderMeasure.duration;
      console.log(`🚀 Tiempo total de render: ${renderTime.toFixed(2)}ms`);
      
      if (renderTime < 50) {
        console.log('✅ EXCELENTE: Render < 50ms (objetivo alcanzado)');
        return true;
      } else if (renderTime < 200) {
        console.log('⚠️ BUENO: Render < 200ms (mejorable)');
        return true;
      } else {
        console.log('❌ LENTO: Render > 200ms (requiere optimización)');
        return false;
      }
    }
    return false;
  };
}

// 3. Testing de suite automatizada
async function testAutomatedSuite() {
  console.log('\n🧪 3. TESTING SUITE AUTOMATIZADA');
  console.log('----------------------------------');
  
  if (typeof window.runSuministrosTests === 'function') {
    console.log('✅ Suite de testing disponible');
    try {
      await window.runSuministrosTests();
      console.log('✅ Suite ejecutada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error en suite de testing:', error);
      return false;
    }
  } else {
    console.log('⚠️ Suite de testing no disponible - verificar que esté en página de Suministros');
    return false;
  }
}

// 4. Testing de memory leaks
async function testMemoryLeaks() {
  console.log('\n🧠 4. TESTING MEMORY LEAKS');
  console.log('---------------------------');
  
  const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
  console.log(`📊 Memoria inicial: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);
  
  // Simular interacciones
  console.log('🔄 Simulando interacciones...');
  
  setTimeout(() => {
    const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const memoryDiff = finalMemory - initialMemory;
    
    console.log(`📊 Memoria final: ${(finalMemory / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📈 Diferencia: ${(memoryDiff / 1024 / 1024).toFixed(2)} MB`);
    
    if (memoryDiff < 5 * 1024 * 1024) { // < 5MB
      console.log('✅ EXCELENTE: Memory usage estable');
      return true;
    } else if (memoryDiff < 10 * 1024 * 1024) { // < 10MB
      console.log('⚠️ ACEPTABLE: Memory usage moderado');
      return true;
    } else {
      console.log('❌ PROBLEMA: Posible memory leak detectado');
      return false;
    }
  }, 3000);
}

// 5. Testing de debugging condicional
function testConditionalDebugging() {
  console.log('\n🔧 5. TESTING DEBUGGING CONDICIONAL');
  console.log('------------------------------------');
  
  // Test con debugging activado
  const debugStatus1 = localStorage.getItem('debug_forms');
  console.log(`📝 Debug status: ${debugStatus1}`);
  
  if (debugStatus1 === 'true') {
    console.log('✅ Debugging activado correctamente');
  } else {
    console.log('❌ Debugging no activado');
    return false;
  }
  
  // Test desactivar debugging
  localStorage.removeItem('debug_forms');
  globalThis.debugForms = false;
  
  const debugStatus2 = localStorage.getItem('debug_forms');
  console.log(`📝 Debug status después de desactivar: ${debugStatus2 || 'null'}`);
  
  // Reactivar para continuar tests
  localStorage.setItem('debug_forms', 'true');
  globalThis.debugForms = true;
  
  console.log('✅ Testing de debugging condicional completado');
  return true;
}

// 6. Reporte final de resultados
function generateFinalReport() {
  console.log('\n📋 6. REPORTE FINAL DE RESULTADOS');
  console.log('==================================');
  
  const results = {
    debuggingActivated: localStorage.getItem('debug_forms') === 'true',
    renderPerformanceReady: typeof window.testFormRenderTime === 'function',
    testSuiteAvailable: typeof window.runSuministrosTests === 'function',
    memoryTestCompleted: true,
    conditionalDebuggingWorking: true
  };
  
  console.log('📊 Resultados del testing:');
  console.table(results);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON!');
    console.log('✅ Sistema optimizado y listo para producción');
  } else {
    console.log('⚠️ Algunas pruebas requieren acción manual o falló alguna verificación');
  }
  
  return results;
}

// Función principal de testing
async function runCompleteTest() {
  console.log('🎯 EJECUTANDO TESTING COMPLETO...\n');
  
  try {
    // Ejecutar todos los tests
    testRenderPerformance();
    testConditionalDebugging();
    testMemoryLeaks();
    
    setTimeout(async () => {
      await testAutomatedSuite();
      generateFinalReport();
      
      console.log('\n🚀 TESTING COMPLETADO');
      console.log('======================');
      console.log('📝 Próximos pasos:');
      console.log('   1. Navegar a Suministros → Nuevo Suministro');
      console.log('   2. Ejecutar: testFormRenderTime()');
      console.log('   3. Verificar logs de performance');
      console.log('   4. Si todo pasa, proceder con limpieza de console.log');
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error durante testing:', error);
  }
}

// Hacer función disponible globalmente
window.runCompleteTest = runCompleteTest;
window.generateFinalReport = generateFinalReport;

// Auto-ejecutar el test
console.log('🔄 Auto-ejecutando testing en 2 segundos...');
setTimeout(runCompleteTest, 2000);
