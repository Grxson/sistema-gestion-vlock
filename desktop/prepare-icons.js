const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico').default || require('png-to-ico');
const sharp = require('sharp');

async function prepareIcons() {
  console.log('🚀 Preparando recursos para empaquetado...\n');

  // Crear directorio build si no existe
  const buildDir = path.join(__dirname, 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  const sourceLogo = path.join(__dirname, 'src/renderer/public/images/vlock_logo.png');
  const destIconPng = path.join(buildDir, 'icon.png');
  const destIconIco = path.join(buildDir, 'icon.ico');
  const tempSquarePng = path.join(buildDir, 'icon-square-temp.png');

  // Verificar que existe el logo
  if (!fs.existsSync(sourceLogo)) {
    console.error('❌ Error: No se encontró el logo en src/renderer/public/images/vlock_logo.png');
    process.exit(1);
  }

  try {
    // 1. Copiar PNG para Linux
    fs.copyFileSync(sourceLogo, destIconPng);
    console.log('✅ icon.png creado para Linux');

    // 2. Crear versión cuadrada del logo para .ico
    console.log('🔄 Creando versión cuadrada del logo...');
    const metadata = await sharp(sourceLogo).metadata();
    const size = Math.max(metadata.width, metadata.height);
    
    await sharp(sourceLogo)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(tempSquarePng);
    
    console.log(`✅ Logo cuadrado creado (${size}x${size})`);

    // 3. Generar .ico para Windows automáticamente
    console.log('🔄 Generando icon.ico para Windows...');
    const icoBuffer = await pngToIco(tempSquarePng);
    fs.writeFileSync(destIconIco, icoBuffer);
    console.log('✅ icon.ico creado para Windows');
    
    // 4. Limpiar archivo temporal
    if (fs.existsSync(tempSquarePng)) {
      fs.unlinkSync(tempSquarePng);
    }

    // 3. Copiar licencia si existe
    const licenseSrc = path.join(__dirname, 'installer-assets/license.txt');
    const licenseDest = path.join(buildDir, 'license.txt');
    if (fs.existsSync(licenseSrc)) {
      fs.copyFileSync(licenseSrc, licenseDest);
      console.log('✅ license.txt copiado');
    } else {
      console.warn('⚠️  license.txt no encontrado en installer-assets/');
    }

    // 4. Verificar imágenes del instalador (opcionales)
    const headerSrc = path.join(__dirname, 'installer-assets/installerHeader.bmp');
    const sidebarSrc = path.join(__dirname, 'installer-assets/installerSidebar.bmp');
    
    if (fs.existsSync(headerSrc)) {
      fs.copyFileSync(headerSrc, path.join(buildDir, 'installerHeader.bmp'));
      console.log('✅ installerHeader.bmp copiado');
    } else {
      console.log('ℹ️  installerHeader.bmp no encontrado (opcional)');
    }

    if (fs.existsSync(sidebarSrc)) {
      fs.copyFileSync(sidebarSrc, path.join(buildDir, 'installerSidebar.bmp'));
      console.log('✅ installerSidebar.bmp copiado');
    } else {
      console.log('ℹ️  installerSidebar.bmp no encontrado (opcional)');
    }

    console.log('\n📦 Recursos preparados exitosamente');
    console.log('   ✓ icon.png (Linux)');
    console.log('   ✓ icon.ico (Windows)');
    console.log('   ✓ license.txt');
    
    console.log('\n💡 Personalización adicional del instalador:');
    console.log('   Para personalizar el instalador NSIS, crea estas imágenes en installer-assets/:');
    console.log('   - installerHeader.bmp (150x57 píxeles, 24-bit BMP)');
    console.log('   - installerSidebar.bmp (164x314 píxeles, 24-bit BMP)');
    console.log('\n   Nota: Para Mac (.icns), convierte el logo manualmente:');
    console.log('   https://cloudconvert.com/png-to-icns');
  } catch (error) {
    console.error('❌ Error al generar recursos:', error.message);
    process.exit(1);
  }
}

// Ejecutar
prepareIcons();
