const fs = require('fs');
const path = require('path');

// Crear directorio build si no existe
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copiar el logo como icon.png para Linux
const sourceLogo = path.join(__dirname, 'src/renderer/public/images/vlock_logo.png');
const destIconPng = path.join(buildDir, 'icon.png');

if (fs.existsSync(sourceLogo)) {
  fs.copyFileSync(sourceLogo, destIconPng);
  console.log('✅ icon.png creado para Linux');
} else {
  console.warn('⚠️  Logo no encontrado, usando favicon como fallback');
  const fallback = path.join(__dirname, 'src/renderer/public/favicon-32x32.png');
  if (fs.existsSync(fallback)) {
    fs.copyFileSync(fallback, destIconPng);
    console.log('✅ icon.png creado desde favicon');
  }
}

console.log('\n📦 Iconos preparados para empaquetado');
console.log('Nota: Para Windows (.ico) y Mac (.icns), necesitarás convertir el logo manualmente');
console.log('Puedes usar herramientas online como:');
console.log('- https://convertio.co/es/png-ico/ (para Windows)');
console.log('- https://cloudconvert.com/png-to-icns (para Mac)');
