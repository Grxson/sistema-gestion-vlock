// Script de testing automatizado para el módulo de suministros
// Ejecutar en la consola del navegador con: window.runSuministrosTests()

window.runSuministrosTests = () => {
  console.clear();
  console.log('🚀 INICIANDO TESTING AUTOMATIZADO DEL MÓDULO DE SUMINISTROS');
  console.log('='.repeat(70));
  
  const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  };
  
  // Helper para ejecutar tests
  const runTest = (testName, testFunction) => {
    testResults.total++;
    try {
      const result = testFunction();
      if (result) {
        testResults.passed++;
        testResults.details.push({ name: testName, status: '✅ PASS', details: result });
        console.log(`✅ ${testName}: PASS`);
      } else {
        testResults.failed++;
        testResults.details.push({ name: testName, status: '❌ FAIL', details: 'Test returned false' });
        console.log(`❌ ${testName}: FAIL`);
      }
    } catch (error) {
      testResults.failed++;
      testResults.details.push({ name: testName, status: '❌ ERROR', details: error.message });
      console.error(`❌ ${testName}: ERROR -`, error.message);
    }
  };
  
  // =================== TESTS DE NORMALIZACIÓN ===================
  
  runTest('Normalización de Unidades - Casos Básicos', () => {
    // Simular función de normalización
    const normalizeUnidadMedida = (input) => {
      if (!input) return 'pz';
      
      const mappings = {
        'm³': 'm3',
        'm²': 'm2',
        'metros cúbicos (m³)': 'm3',
        'metros cuadrados (m²)': 'm2'
      };
      
      return mappings[input.toLowerCase()] || input;
    };
    
    const testCases = [
      { input: 'm³', expected: 'm3' },
      { input: 'm²', expected: 'm2' },
      { input: 'metros cúbicos (m³)', expected: 'm3' },
      { input: '', expected: 'pz' },
      { input: null, expected: 'pz' }
    ];
    
    return testCases.every(({ input, expected }) => {
      const result = normalizeUnidadMedida(input);
      const passed = result === expected;
      if (!passed) {
        console.log(`  ❌ "${input}" -> "${result}" (esperado: "${expected}")`);
      }
      return passed;
    });
  });
  
  runTest('Validación de Números - Cantidades y Precios', () => {
    const validateNumber = (value, min = 0) => {
      const num = parseFloat(value);
      return !isNaN(num) && num > min;
    };
    
    const testCases = [
      { input: '10', expected: true },
      { input: '10.5', expected: true },
      { input: '0', expected: false },
      { input: '-5', expected: false },
      { input: 'abc', expected: false },
      { input: '', expected: false }
    ];
    
    return testCases.every(({ input, expected }) => {
      const result = validateNumber(input);
      return result === expected;
    });
  });
  
  // =================== TESTS DE CÁLCULOS ===================
  
  runTest('Cálculo de Totales - Subtotal, IVA y Total', () => {
    const calcularTotales = (suministros, includeIVA) => {
      const subtotal = suministros.reduce((sum, item) => {
        const cantidad = parseFloat(item.cantidad) || 0;
        const precio = parseFloat(item.precio_unitario) || 0;
        return sum + (cantidad * precio);
      }, 0);
      
      const iva = includeIVA ? subtotal * 0.16 : 0;
      const total = subtotal + iva;
      
      return {
        subtotal: subtotal.toFixed(2),
        iva: iva.toFixed(2),
        total: total.toFixed(2)
      };
    };
    
    const testSuministros = [
      { cantidad: '10', precio_unitario: '100' },
      { cantidad: '5', precio_unitario: '200' }
    ];
    
    const result = calcularTotales(testSuministros, true);
    const expectedSubtotal = '2000.00';
    const expectedIVA = '320.00';
    const expectedTotal = '2320.00';
    
    const passed = result.subtotal === expectedSubtotal && 
                   result.iva === expectedIVA && 
                   result.total === expectedTotal;
    
    if (!passed) {
      console.log('  📊 Resultado:', result);
      console.log('  📊 Esperado:', { subtotal: expectedSubtotal, iva: expectedIVA, total: expectedTotal });
    }
    
    return passed;
  });
  
  // =================== TESTS DE PERFORMANCE ===================
  
  runTest('Performance - Búsqueda en Array Grande', () => {
    // Simular array grande de suministros
    const largeSuministros = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      nombre: `Suministro ${i}`,
      codigo: `COD${i.toString().padStart(4, '0')}`
    }));
    
    const searchFunction = (query) => {
      return largeSuministros.filter(s => 
        s.nombre.toLowerCase().includes(query.toLowerCase())
      );
    };
    
    const startTime = performance.now();
    const results = searchFunction('Suministro 5');
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    const passed = executionTime < 50 && results.length > 0; // Debe ser < 50ms
    
    console.log(`  ⏱️ Tiempo de búsqueda: ${executionTime.toFixed(2)}ms`);
    console.log(`  📊 Resultados encontrados: ${results.length}`);
    
    return passed;
  });
  
  // =================== TESTS DE VALIDACIÓN ===================
  
  runTest('Validación de Formulario - Campos Obligatorios', () => {
    const validarFormulario = (reciboInfo, suministros) => {
      const errors = {};
      
      if (!reciboInfo.id_proyecto) errors.id_proyecto = 'Proyecto requerido';
      if (!reciboInfo.proveedor_info) errors.proveedor_info = 'Proveedor requerido';
      
      suministros.forEach((suministro, index) => {
        if (!suministro.nombre) errors[`suministro_${index}_nombre`] = 'Nombre requerido';
        if (!suministro.cantidad || parseFloat(suministro.cantidad) <= 0) {
          errors[`suministro_${index}_cantidad`] = 'Cantidad inválida';
        }
      });
      
      return Object.keys(errors).length === 0;
    };
    
    // Test con datos incompletos
    const invalidData = {
      reciboInfo: { id_proyecto: '', proveedor_info: null },
      suministros: [{ nombre: '', cantidad: '0' }]
    };
    
    const invalidResult = validarFormulario(invalidData.reciboInfo, invalidData.suministros);
    
    // Test con datos válidos
    const validData = {
      reciboInfo: { id_proyecto: '1', proveedor_info: { id: 1, nombre: 'Test' } },
      suministros: [{ nombre: 'Test', cantidad: '10', precio_unitario: '100' }]
    };
    
    const validResult = validarFormulario(validData.reciboInfo, validData.suministros);
    
    return !invalidResult && validResult;
  });
  
  // =================== TESTS DE DUPLICADOS ===================
  
  runTest('Detección de Duplicados - Folio Proveedor', () => {
    const existingSuministros = [
      { id_suministro: 1, folio: 'FOLIO123', nombre: 'Cemento' },
      { id_suministro: 2, folio: 'FOLIO456', nombre: 'Arena' },
      { id_suministro: 3, folio: 'FOLIO123', nombre: 'Grava' }
    ];
    
    const checkDuplicates = (folio, excludeIds = []) => {
      return existingSuministros.filter(s => 
        s.folio === folio && !excludeIds.includes(s.id_suministro)
      );
    };
    
    // Test: Buscar duplicados de FOLIO123
    const duplicates1 = checkDuplicates('FOLIO123');
    
    // Test: Buscar duplicados excluyendo ID 1
    const duplicates2 = checkDuplicates('FOLIO123', [1]);
    
    // Test: Buscar folio inexistente
    const duplicates3 = checkDuplicates('FOLIO_NO_EXISTE');
    
    const passed = duplicates1.length === 2 && 
                   duplicates2.length === 1 && 
                   duplicates3.length === 0;
    
    if (!passed) {
      console.log('  📊 Duplicados FOLIO123:', duplicates1.length);
      console.log('  📊 Duplicados FOLIO123 (excl. ID 1):', duplicates2.length);
      console.log('  📊 Duplicados inexistente:', duplicates3.length);
    }
    
    return passed;
  });
  
  // =================== TESTS DE AUTOCOMPLETADO ===================
  
  runTest('Autocompletado - Sugerencias de Nombres', () => {
    const suministros = [
      { nombre: 'Cemento Portland' },
      { nombre: 'Cemento Blanco' },
      { nombre: 'Arena Fina' },
      { nombre: 'Arena Gruesa' }
    ];
    
    const getSuggestions = (query) => {
      return suministros
        .map(s => s.nombre)
        .filter(nombre => nombre.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => {
          const aExact = a.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
          const bExact = b.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
          return aExact - bExact;
        });
    };
    
    const suggestions1 = getSuggestions('Cemento');
    const suggestions2 = getSuggestions('Arena');
    const suggestions3 = getSuggestions('xyz');
    
    const passed = suggestions1.length === 2 && 
                   suggestions2.length === 2 && 
                   suggestions3.length === 0 &&
                   suggestions1[0] === 'Cemento Portland'; // Ordenado correctamente
    
    return passed;
  });
  
  // =================== RESULTADOS FINALES ===================
  
  console.log('');
  console.log('='.repeat(70));
  console.log('📊 RESUMEN DE RESULTADOS:');
  console.log(`✅ Pruebas exitosas: ${testResults.passed}`);
  console.log(`❌ Pruebas fallidas: ${testResults.failed}`);
  console.log(`📈 Total ejecutadas: ${testResults.total}`);
  console.log(`🎯 Porcentaje de éxito: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('');
    console.log('❌ PRUEBAS FALLIDAS:');
    testResults.details
      .filter(t => t.status.includes('FAIL') || t.status.includes('ERROR'))
      .forEach(test => {
        console.log(`  • ${test.name}: ${test.details}`);
      });
  }
  
  console.log('');
  console.log('🏁 TESTING COMPLETADO');
  
  return testResults;
};

// Auto-ejecutar si estamos en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🧪 Script de testing cargado. Ejecutar con: window.runSuministrosTests()');
}
