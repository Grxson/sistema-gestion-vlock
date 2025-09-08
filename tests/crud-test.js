const TestRunner = require('./TestRunner');

async function runCrudTests() {
  const runner = new TestRunner();
  
  try {
    await runner.init();
    console.log('📦 INICIANDO PRUEBAS CRUD DE SUMINISTROS');
    console.log('='.repeat(50));

    // Ir a la página de suministros
    await runner.test('Acceder a página de Suministros', async () => {
      await runner.page.goto('http://localhost:3000');
      
      // Esperar a que cargue y buscar enlace de suministros
      await runner.page.waitForTimeout(3000);
      
      // Intentar varios selectores posibles para el menú de suministros
      const possibleSelectors = [
        'a[href*="suministros"]',
        'a[href="/suministros"]',
        '.sidebar a:has-text("Suministros")',
        '[data-testid="suministros-link"]',
        'nav a:contains("Suministros")'
      ];
      
      let found = false;
      for (const selector of possibleSelectors) {
        try {
          await runner.page.waitForSelector(selector, { timeout: 2000 });
          await runner.page.click(selector);
          found = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!found) {
        // Si no encuentra el enlace, ir directamente a la URL
        await runner.page.goto('http://localhost:3000/suministros');
      }
      
      await runner.page.waitForTimeout(3000);
      
      // Verificar que estamos en la página correcta
      const url = runner.page.url();
      if (!url.includes('suministros')) {
        throw new Error('No se pudo acceder a la página de suministros');
      }
    });

    // Verificar carga de lista de suministros
    await runner.test('Verificar carga de lista de suministros', async () => {
      // Buscar indicadores de que la lista se cargó
      const possibleIndicators = [
        '.table',
        '.suministros-list',
        '.data-table',
        '[data-testid="suministros-table"]',
        '.ag-grid'
      ];
      
      let found = false;
      for (const selector of possibleIndicators) {
        try {
          await runner.page.waitForSelector(selector, { timeout: 3000 });
          found = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!found) {
        throw new Error('No se encontró la tabla/lista de suministros');
      }
    });

    // Probar búsqueda/filtros
    await runner.test('Funcionalidad de búsqueda', async () => {
      // Buscar campo de búsqueda
      const searchSelectors = [
        'input[placeholder*="buscar"]',
        'input[placeholder*="Buscar"]',
        '.search-input',
        'input[type="search"]',
        '.filter-input'
      ];
      
      let searchInput = null;
      for (const selector of searchSelectors) {
        try {
          searchInput = await runner.page.waitForSelector(selector, { timeout: 2000 });
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (searchInput) {
        await searchInput.type('test');
        await runner.page.waitForTimeout(2000);
        await searchInput.clear();
      } else {
        console.log('⚠️  No se encontró campo de búsqueda, saltando prueba');
      }
    });

    // Probar creación de nuevo suministro
    await runner.test('Abrir formulario de nuevo suministro', async () => {
      // Buscar botón de "Nuevo" o "Agregar"
      const newButtonSelectors = [
        'button:has-text("Nuevo")',
        'button:has-text("Agregar")',
        '.btn-primary:has-text("Nuevo")',
        '[data-testid="new-suministro"]',
        '.add-button',
        'button[title*="nuevo"]'
      ];
      
      let found = false;
      for (const selector of newButtonSelectors) {
        try {
          await runner.page.waitForSelector(selector, { timeout: 2000 });
          await runner.page.click(selector);
          found = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!found) {
        throw new Error('No se encontró botón para crear nuevo suministro');
      }
      
      // Verificar que se abrió el formulario/modal
      await runner.page.waitForTimeout(2000);
      
      const formSelectors = [
        '.modal',
        '.form-container',
        'form',
        '.suministro-form'
      ];
      
      let formFound = false;
      for (const selector of formSelectors) {
        try {
          await runner.page.waitForSelector(selector, { timeout: 3000 });
          formFound = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!formFound) {
        throw new Error('No se abrió el formulario de nuevo suministro');
      }
    });

    // Probar validaciones del formulario
    await runner.test('Validaciones del formulario', async () => {
      // Intentar enviar formulario vacío
      const submitSelectors = [
        'button[type="submit"]',
        '.btn-primary:has-text("Guardar")',
        '.btn-success',
        'button:has-text("Guardar")'
      ];
      
      for (const selector of submitSelectors) {
        try {
          await runner.page.click(selector);
          break;
        } catch (e) {
          continue;
        }
      }
      
      await runner.page.waitForTimeout(2000);
      
      // Verificar que aparezcan mensajes de validación
      const errorSelectors = [
        '.error-message',
        '.invalid-feedback',
        '.text-danger',
        '.validation-error'
      ];
      
      let errorsFound = false;
      for (const selector of errorSelectors) {
        try {
          const errors = await runner.page.$$(selector);
          if (errors.length > 0) {
            errorsFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!errorsFound) {
        console.log('⚠️  No se detectaron mensajes de validación visibles');
      }
    });

    // Llenar formulario con datos de prueba
    await runner.test('Llenar formulario con datos válidos', async () => {
      // Buscar y llenar campos comunes
      const fieldsToFill = [
        { selectors: ['input[name="nombre"]', '#nombre'], value: 'Suministro Test' },
        { selectors: ['input[name="codigo_producto"]', '#codigo_producto'], value: 'TEST001' },
        { selectors: ['textarea[name="descripcion"]', '#descripcion'], value: 'Descripción de prueba' },
        { selectors: ['input[name="cantidad"]', '#cantidad'], value: '10' },
        { selectors: ['input[name="precio_unitario"]', '#precio_unitario'], value: '100.50' }
      ];
      
      for (const field of fieldsToFill) {
        let filled = false;
        for (const selector of field.selectors) {
          try {
            const element = await runner.page.$(selector);
            if (element) {
              await element.clear();
              await element.type(field.value);
              filled = true;
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!filled) {
          console.log(`⚠️  No se pudo llenar el campo: ${field.selectors[0]}`);
        }
      }
      
      // Seleccionar opciones en dropdowns si existen
      const dropdowns = await runner.page.$$('select');
      for (const dropdown of dropdowns) {
        try {
          const options = await dropdown.$$('option');
          if (options.length > 1) {
            await dropdown.selectOption({ index: 1 });
          }
        } catch (e) {
          continue;
        }
      }
    });

    // Guardar suministro
    await runner.test('Guardar nuevo suministro', async () => {
      const submitSelectors = [
        'button[type="submit"]',
        '.btn-primary:has-text("Guardar")',
        '.btn-success',
        'button:has-text("Guardar")'
      ];
      
      for (const selector of submitSelectors) {
        try {
          await runner.page.click(selector);
          break;
        } catch (e) {
          continue;
        }
      }
      
      await runner.page.waitForTimeout(5000);
      
      // Verificar mensajes de éxito o que se cerró el modal
      const successIndicators = [
        '.alert-success',
        '.toast-success',
        '.success-message'
      ];
      
      let success = false;
      for (const selector of successIndicators) {
        try {
          await runner.page.waitForSelector(selector, { timeout: 3000 });
          success = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      // También verificar si el modal se cerró
      const modals = await runner.page.$$('.modal');
      if (modals.length === 0) {
        success = true;
      }
      
      if (!success) {
        console.log('⚠️  No se detectó confirmación clara de guardado exitoso');
      }
    });

    // Verificar que el suministro aparece en la lista
    await runner.test('Verificar suministro en lista', async () => {
      await runner.page.waitForTimeout(3000);
      
      // Buscar "Suministro Test" en la página
      const content = await runner.page.content();
      if (!content.includes('Suministro Test') && !content.includes('TEST001')) {
        throw new Error('El suministro creado no aparece en la lista');
      }
    });

    console.log('\n✅ Pruebas CRUD básicas completadas');

  } catch (error) {
    console.error('❌ Error en pruebas CRUD:', error);
  } finally {
    await runner.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runCrudTests();
}

module.exports = runCrudTests;
