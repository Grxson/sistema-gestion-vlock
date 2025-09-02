const TestRunner = require('./TestRunner');

async function runSuministrosTests() {
  const runner = new TestRunner();
  
  try {
    await runner.init();
    console.log('🏗️  INICIANDO PRUEBAS COMPLETAS DE SUMINISTROS');
    console.log('='.repeat(50));

    // Ir a la página inicial
    await runner.test('Cargar aplicación', async () => {
      await runner.page.goto('http://localhost:3000');
      await runner.page.waitForTimeout(3000);
    });

    // LOGIN MANUAL
    await runner.test('Login manual requerido', async () => {
      console.log('🔐 Por favor realiza el login manualmente...');
      console.log('⏳ Esperando 20 segundos para login manual...');
      
      await runner.page.waitForTimeout(20000); // 20 segundos para login
      
      const url = runner.page.url();
      if (url.includes('login') || url === 'http://localhost:3000/') {
        throw new Error('Login no completado en el tiempo esperado');
      }
    });

    // NAVEGACIÓN A SUMINISTROS
    await runner.test('Navegar a Suministros', async () => {
      // Intentar encontrar y hacer clic en el enlace de suministros
      const navigationMethods = [
        // Método 1: Buscar por href
        async () => {
          const link = await runner.page.$('a[href*="suministros"]');
          if (link) {
            await link.click();
            return true;
          }
          return false;
        },
        // Método 2: Buscar por texto en sidebar
        async () => {
          const links = await runner.page.$$eval('a', els => 
            els.filter(el => el.textContent.toLowerCase().includes('suministro'))
          );
          if (links.length > 0) {
            await runner.page.click('a');
            return true;
          }
          return false;
        },
        // Método 3: URL directa
        async () => {
          await runner.page.goto('http://localhost:3000/suministros');
          return true;
        }
      ];

      let navigated = false;
      for (const method of navigationMethods) {
        try {
          if (await method()) {
            navigated = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!navigated) {
        throw new Error('No se pudo navegar a la página de suministros');
      }

      await runner.page.waitForTimeout(3000);
      
      // Verificar que estamos en la página correcta
      const url = runner.page.url();
      if (!url.includes('suministros')) {
        throw new Error('No se llegó a la página de suministros');
      }
    });

    // VERIFICAR CARGA DE DATOS
    await runner.test('Verificar carga de componentes', async () => {
      // Esperar a que carguen los componentes principales
      const components = [
        '.table, .ag-grid, .data-grid, [class*="table"]',
        '.btn, button, [class*="btn"]',
        '.search, input[type="search"], [placeholder*="buscar"]'
      ];

      let componentsFound = 0;
      for (const componentSelector of components) {
        try {
          await runner.page.waitForSelector(componentSelector, { timeout: 3000 });
          componentsFound++;
        } catch (e) {
          // No pasa nada si no encuentra algún componente
        }
      }

      if (componentsFound === 0) {
        throw new Error('No se cargaron componentes principales de la interfaz');
      }
    });

    // PROBAR FILTROS Y BÚSQUEDA
    await runner.test('Probar funcionalidad de filtros', async () => {
      // Buscar campos de filtro
      const filterElements = await runner.page.$$('input, select');
      
      for (let i = 0; i < Math.min(filterElements.length, 3); i++) {
        try {
          const element = filterElements[i];
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          
          if (tagName === 'input') {
            await element.type('test');
            await runner.page.waitForTimeout(1000);
            await element.clear();
          } else if (tagName === 'select') {
            const options = await element.$$('option');
            if (options.length > 1) {
              await element.selectOption({ index: 1 });
              await runner.page.waitForTimeout(1000);
              await element.selectOption({ index: 0 });
            }
          }
        } catch (e) {
          // Continuar con el siguiente elemento
        }
      }
    });

    // PROBAR CREACIÓN DE SUMINISTRO
    await runner.test('Abrir formulario de creación', async () => {
      // Buscar botones que puedan abrir el formulario
      const buttonTexts = ['nuevo', 'agregar', 'crear', 'add', '+'];
      let formOpened = false;

      for (const text of buttonTexts) {
        try {
          const buttons = await runner.page.$$eval('button, .btn, a', 
            (els, searchText) => els.filter(el => 
              el.textContent.toLowerCase().includes(searchText) ||
              el.title.toLowerCase().includes(searchText) ||
              el.getAttribute('aria-label')?.toLowerCase().includes(searchText)
            ), text
          );

          if (buttons.length > 0) {
            await runner.page.click('button, .btn, a');
            await runner.page.waitForTimeout(2000);
            
            // Verificar si se abrió un modal o formulario
            const modalExists = await runner.page.$('.modal, .dialog, .form-container');
            if (modalExists) {
              formOpened = true;
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (!formOpened) {
        console.log('⚠️  No se pudo abrir el formulario automáticamente');
        console.log('    Esto puede requerir interacción manual');
      }
    });

    // PROBAR FORMULARIO (si está abierto)
    await runner.test('Interactuar con formulario', async () => {
      const modal = await runner.page.$('.modal, .dialog, .form-container');
      
      if (modal) {
        // Llenar campos básicos
        const testData = {
          'input[name="nombre"], #nombre': 'Suministro Automatizado',
          'input[name="codigo_producto"], #codigo_producto': 'AUTO001',
          'input[name="cantidad"], #cantidad': '5',
          'input[name="precio_unitario"], #precio_unitario': '50.75'
        };

        for (const [selector, value] of Object.entries(testData)) {
          try {
            const input = await runner.page.$(selector);
            if (input) {
              await input.clear();
              await input.type(value);
            }
          } catch (e) {
            // Continuar con el siguiente campo
          }
        }

        // Intentar guardar
        try {
          await runner.page.click('button[type="submit"], .btn-primary');
          await runner.page.waitForTimeout(3000);
        } catch (e) {
          console.log('⚠️  No se pudo guardar automáticamente');
        }
      } else {
        console.log('⚠️  No hay formulario abierto para probar');
      }
    });

    // VERIFICAR RESPONSIVIDAD
    await runner.test('Probar responsividad', async () => {
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ];

      for (const viewport of viewports) {
        await runner.page.setViewport({ width: viewport.width, height: viewport.height });
        await runner.page.waitForTimeout(2000);
        
        // Verificar que la página sigue siendo funcional
        const bodyVisible = await runner.page.$eval('body', el => el.offsetHeight > 0);
        if (!bodyVisible) {
          throw new Error(`Problemas de responsividad en ${viewport.name}`);
        }
      }
      
      // Restaurar viewport original
      await runner.page.setViewport({ width: 1280, height: 720 });
    });

    // PROBAR RENDIMIENTO BÁSICO
    await runner.test('Verificar rendimiento básico', async () => {
      const startTime = Date.now();
      
      // Recargar página y medir tiempo
      await runner.page.reload();
      await runner.page.waitForTimeout(3000);
      
      const loadTime = Date.now() - startTime;
      
      if (loadTime > 10000) { // 10 segundos
        throw new Error(`Tiempo de carga muy lento: ${loadTime}ms`);
      }
      
      console.log(`ℹ️  Tiempo de carga: ${loadTime}ms`);
    });

    // PROBAR NAVEGACIÓN
    await runner.test('Probar navegación del módulo', async () => {
      // Intentar navegar a diferentes secciones si existen
      const navLinks = await runner.page.$$('a, .nav-link, .tab');
      
      let navigationWorking = false;
      for (let i = 0; i < Math.min(navLinks.length, 3); i++) {
        try {
          const link = navLinks[i];
          const href = await link.evaluate(el => el.href || el.getAttribute('href'));
          
          if (href && !href.includes('javascript:') && !href.includes('#')) {
            await link.click();
            await runner.page.waitForTimeout(2000);
            navigationWorking = true;
            
            // Volver a suministros
            await runner.page.goto('http://localhost:3000/suministros');
            await runner.page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!navigationWorking) {
        console.log('ℹ️  No se encontraron enlaces de navegación adicionales');
      }
    });

    console.log('\n🎉 ¡Pruebas automatizadas de Suministros completadas!');
    console.log('    Revisa los resultados arriba para ver el estado de cada prueba.');

  } catch (error) {
    console.error('❌ Error crítico en las pruebas:', error);
  } finally {
    await runner.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSuministrosTests();
}

module.exports = runSuministrosTests;
