// Hook personalizado para debugging y monitoring del FormularioSuministros
import { useEffect, useRef, useMemo } from 'react';

// Hook para debugging de renders
export const useRenderDebug = (componentName, props = {}) => {
  const renderCount = useRef(0);
  const prevProps = useRef({});
  
  // ⚡ OPTIMIZACIÓN: Solo ejecutar debugging si está habilitado
  const isDebugEnabled = useMemo(() => 
    process.env.NODE_ENV === 'development' && 
    (localStorage.getItem('debug_forms') === 'true' || globalThis.debugForms),
    []
  );
  
  useEffect(() => {
    // ⚡ Early return si debugging está deshabilitado
    if (!isDebugEnabled) return;
    
    renderCount.current += 1;
    
    // ⚡ Throttle logging para evitar spam
    if (renderCount.current % 10 === 1 || renderCount.current <= 5) {
      console.log(`🔄 ${componentName} render #${renderCount.current}`);
      
      // ⚡ Solo verificar props si hay cambios significativos
      const hasSignificantChanges = Object.keys(props).some(key => {
        const prev = prevProps.current[key];
        const current = props[key];
        // Solo reportar cambios de valores primitivos o referencias de objetos
        return prev !== current && (typeof current !== 'function');
      });
      
      if (hasSignificantChanges) {
        const changedProps = {};
        Object.keys(props).forEach(key => {
          if (prevProps.current[key] !== props[key]) {
            changedProps[key] = {
              from: prevProps.current[key],
              to: props[key]
            };
          }
        });
        
        if (Object.keys(changedProps).length > 0) {
          console.log(`📝 ${componentName} prop changes:`, changedProps);
        }
      }
      
      prevProps.current = { ...props }; // ⚡ Solo copiar cuando sea necesario
    }
  });
  
  return isDebugEnabled ? renderCount.current : 0;
};

// ⚡ Hook optimizado para performance monitoring
export const usePerformanceMonitor = (operationName, dependencies = []) => {
  const lastExecutionTime = useRef(0);
  const isDebugEnabled = useRef(
    process.env.NODE_ENV === 'development' && 
    (localStorage.getItem('debug_forms') === 'true' || globalThis.debugForms)
  );
  
  useEffect(() => {
    // ⚡ Early return si debugging está deshabilitado
    if (!isDebugEnabled.current) return;
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // ⚡ Solo reportar operaciones significativamente lentas
      if (executionTime > 50) { // Aumentado de 16ms a 50ms para reducir ruido
        console.warn(`⚠️ Slow operation "${operationName}": ${executionTime.toFixed(2)}ms`);
      }
      
      lastExecutionTime.current = executionTime;
    };
  }, dependencies);
  
  return lastExecutionTime.current;
};

// Hook para memory leak detection
export const useMemoryLeakDetector = (componentName) => {
  const mountTime = useRef(Date.now());
  const timeouts = useRef([]);
  const intervals = useRef([]);
  const eventListeners = useRef([]);
  
  // Override setTimeout para trackear
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = (...args) => {
    const id = originalSetTimeout(...args);
    timeouts.current.push(id);
    return id;
  };
  
  // Override setInterval para trackear
  const originalSetInterval = window.setInterval;
  window.setInterval = (...args) => {
    const id = originalSetInterval(...args);
    intervals.current.push(id);
    return id;
  };
  
  useEffect(() => {
    return () => {
      // Cleanup en unmount
      timeouts.current.forEach(clearTimeout);
      intervals.current.forEach(clearInterval);
      
      const lifeTime = Date.now() - mountTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🧹 ${componentName} unmounted after ${lifeTime}ms`);
        
        if (timeouts.current.length > 0) {
          console.log(`⏰ Cleared ${timeouts.current.length} timeouts`);
        }
        
        if (intervals.current.length > 0) {
          console.log(`⏱️ Cleared ${intervals.current.length} intervals`);
        }
      }
      
      // Restore original functions
      window.setTimeout = originalSetTimeout;
      window.setInterval = originalSetInterval;
    };
  }, [componentName]);
};

// Hook para validar estado del formulario
export const useFormStateValidator = (state, validationRules = {}) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const issues = [];
    
    // Validaciones automáticas
    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = state[field];
      
      if (rules.required && (!value || value === '')) {
        issues.push(`❌ Campo requerido vacío: ${field}`);
      }
      
      if (rules.type === 'number' && value && isNaN(Number(value))) {
        issues.push(`❌ Campo debe ser numérico: ${field} = "${value}"`);
      }
      
      if (rules.min && Number(value) < rules.min) {
        issues.push(`❌ Valor menor al mínimo: ${field} = ${value} (min: ${rules.min})`);
      }
      
      if (rules.max && Number(value) > rules.max) {
        issues.push(`❌ Valor mayor al máximo: ${field} = ${value} (max: ${rules.max})`);
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        issues.push(`❌ Formato inválido: ${field} = "${value}"`);
      }
    });
    
    if (issues.length > 0) {
      console.group('🚨 Problemas de validación detectados:');
      issues.forEach(issue => console.warn(issue));
      console.groupEnd();
    }
  }, [state, validationRules]);
};

// Hook para testing de autocompletado
export const useAutocompleteTester = (searchFunction, testCases = []) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || testCases.length === 0) return;
    
    console.group('🧪 Testing autocompletado...');
    
    testCases.forEach(async ({ input, expectedResults, description }) => {
      console.log(`📝 Test: ${description}`);
      console.log(`🔍 Input: "${input}"`);
      
      try {
        const startTime = performance.now();
        const results = await searchFunction(input);
        const endTime = performance.now();
        
        console.log(`⏱️ Tiempo: ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`📊 Resultados: ${results.length} encontrados`);
        
        if (expectedResults && results.length !== expectedResults) {
          console.warn(`⚠️ Se esperaban ${expectedResults} resultados, se obtuvieron ${results.length}`);
        }
        
        console.log('✅ Test completado');
      } catch (error) {
        console.error('❌ Test falló:', error);
      }
      
      console.log('---');
    });
    
    console.groupEnd();
  }, [searchFunction, testCases]);
};

// Objeto para centralizar todas las herramientas de debugging
export const debugTools = {
  useRenderDebug,
  usePerformanceMonitor,
  useMemoryLeakDetector,
  useFormStateValidator,
  useAutocompleteTester,
  
  // Función helper para logging estructurado
  log: (category, message, data = null) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🐛',
      performance: '⚡'
    };
    
    console.log(`${emoji[category] || '📝'} [${timestamp}] ${message}`, data || '');
  },
  
  // Función para testing manual de normalización
  testNormalization: (normalizeFunction, testCases) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.group('🧪 Testing normalización...');
    
    testCases.forEach(({ input, expected, description }) => {
      const result = normalizeFunction(input);
      const passed = result === expected;
      
      console.log(
        `${passed ? '✅' : '❌'} ${description}:`,
        `"${input}" -> "${result}"`,
        passed ? '' : `(esperado: "${expected}")`
      );
    });
    
    console.groupEnd();
  }
};
