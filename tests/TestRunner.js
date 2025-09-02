const puppeteer = require('puppeteer');

class TestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
  }

  async init() {
    this.browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1280, height: 720 }
    });
    this.page = await this.browser.newPage();
    
    // Configurar timeouts más largos
    this.page.setDefaultTimeout(10000);
    
    // Interceptar errores de consola
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Error en consola:', msg.text());
      }
    });
  }

  async test(description, testFunction) {
    console.log(`🧪 Ejecutando: ${description}`);
    try {
      await testFunction();
      this.results.push({ description, status: 'PASSED' });
      console.log(`✅ PASSED: ${description}`);
    } catch (error) {
      this.results.push({ description, status: 'FAILED', error: error.message });
      console.log(`❌ FAILED: ${description} - ${error.message}`);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('\n📊 RESUMEN DE PRUEBAS:');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    
    console.log(`✅ Pruebas exitosas: ${passed}`);
    console.log(`❌ Pruebas fallidas: ${failed}`);
    console.log(`📈 Total de pruebas: ${this.results.length}`);
    
    if (failed > 0) {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      this.results.filter(r => r.status === 'FAILED').forEach(result => {
        console.log(`   • ${result.description}: ${result.error}`);
      });
    }
  }

  async waitForElement(selector, timeout = 5000) {
    return await this.page.waitForSelector(selector, { timeout });
  }

  async clickElement(selector) {
    await this.waitForElement(selector);
    await this.page.click(selector);
  }

  async typeText(selector, text) {
    await this.waitForElement(selector);
    await this.page.type(selector, text);
  }

  async getText(selector) {
    await this.waitForElement(selector);
    return await this.page.$eval(selector, el => el.textContent);
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `./screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}

module.exports = TestRunner;
