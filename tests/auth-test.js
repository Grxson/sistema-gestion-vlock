const TestRunner = require('./TestRunner');

async function runAuthTests() {
  const runner = new TestRunner();
  
  try {
    await runner.init();
    console.log('🔐 INICIANDO PRUEBAS DE AUTENTICACIÓN');
    console.log('='.repeat(50));

    // Ir a la página de login
    await runner.test('Cargar página de login', async () => {
      await runner.page.goto('http://localhost:3000');
      await runner.waitForElement('input[type="text"], input[type="email"]');
    });

    // Prueba de login con credenciales vacías
    await runner.test('Login con campos vacíos', async () => {
      await runner.clickElement('button[type="submit"], .btn-primary');
      
      // Verificar que no redirija y muestre error
      await runner.page.waitForTimeout(2000);
      const url = runner.page.url();
      if (url.includes('dashboard') || url.includes('suministros')) {
        throw new Error('No debería permitir login con campos vacíos');
      }
    });

    // Prueba de login con credenciales incorrectas
    await runner.test('Login con credenciales incorrectas', async () => {
      await runner.page.reload();
      await runner.waitForElement('input[type="text"], input[type="email"]');
      
      // Buscar campos de usuario y contraseña
      const inputs = await runner.page.$$('input');
      if (inputs.length >= 2) {
        await inputs[0].type('usuario_inexistente');
        await inputs[1].type('password_incorrecto');
      }
      
      await runner.clickElement('button[type="submit"], .btn-primary');
      await runner.page.waitForTimeout(3000);
      
      const url = runner.page.url();
      if (url.includes('dashboard') || url.includes('suministros')) {
        throw new Error('No debería permitir login con credenciales incorrectas');
      }
    });

    // Prueba de login exitoso (necesitará credenciales válidas)
    await runner.test('Login exitoso (MANUAL)', async () => {
      console.log('⚠️  Esta prueba requiere credenciales válidas manualmente');
      console.log('   Por favor, ingresa credenciales válidas cuando aparezca el formulario');
      
      await runner.page.reload();
      await runner.waitForElement('input[type="text"], input[type="email"]');
      
      // Pausar para permitir entrada manual
      console.log('🔄 Esperando entrada manual de credenciales...');
      await runner.page.waitForTimeout(15000); // 15 segundos para login manual
      
      // Verificar si logró acceder
      const url = runner.page.url();
      if (!url.includes('dashboard') && !url.includes('suministros')) {
        throw new Error('Login manual no completado o fallido');
      }
    });

    // Prueba de sesión persistente
    await runner.test('Sesión persistente (recarga de página)', async () => {
      await runner.page.reload();
      await runner.page.waitForTimeout(3000);
      
      const url = runner.page.url();
      if (url.includes('login') || url === 'http://localhost:3000/') {
        throw new Error('La sesión no persiste después de recargar');
      }
    });

  } catch (error) {
    console.error('❌ Error en pruebas de autenticación:', error);
  } finally {
    await runner.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAuthTests();
}

module.exports = runAuthTests;
