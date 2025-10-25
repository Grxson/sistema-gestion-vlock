# 🎨 Guía de Personalización del Instalador Windows (NSIS)

## Resumen

El instalador de Windows utiliza NSIS (Nullsoft Scriptable Install System) y puede ser completamente personalizado con imágenes, textos y configuraciones específicas.

## ✅ Configuración Actual

### Características Habilitadas:
- ✅ **Instalación personalizable** (no one-click)
- ✅ **Selección de directorio** por el usuario
- ✅ **Accesos directos** (escritorio + menú inicio)
- ✅ **Categoría en menú inicio** (organizado)
- ✅ **Ejecutar después de instalar** (opcional para el usuario)
- ✅ **Licencia EULA** en español
- ✅ **Idioma español** (código 3082)
- ✅ **Iconos personalizados** (instalador y desinstalador)
- ✅ **Nombre de archivo personalizado**: `Vlock Sistema de Gestión-Setup-2.0.0.exe`

## 🎨 Personalización Visual

### 1. Iconos del Instalador

**Icono del instalador** (`build/icon.ico`):
- ✅ Generado automáticamente desde `vlock_logo.png`
- Se muestra en el archivo .exe del instalador
- Se muestra en el desinstalador
- Se muestra en la barra de tareas durante la instalación

### 2. Imágenes del Asistente de Instalación

#### Header (Cabecera Superior)
**Archivo**: `installer-assets/installerHeader.bmp`

**Especificaciones:**
- **Tamaño**: 150 x 57 píxeles
- **Formato**: BMP de 24 bits (sin compresión)
- **Ubicación**: Parte superior del asistente de instalación
- **Contenido sugerido**: 
  - Logo de Vlock (izquierda)
  - Nombre del producto (derecha)
  - Fondo degradado o color sólido

**Ejemplo de diseño:**
```
┌─────────────────────────────────────────────┐
│  [Logo]  Vlock Sistema de Gestión v2.0.0   │
└─────────────────────────────────────────────┘
```

#### Sidebar (Barra Lateral)
**Archivo**: `installer-assets/installerSidebar.bmp`

**Especificaciones:**
- **Tamaño**: 164 x 314 píxeles
- **Formato**: BMP de 24 bits (sin compresión)
- **Ubicación**: Lado izquierdo del asistente
- **Contenido sugerido**:
  - Logo vertical grande
  - Nombre del producto
  - Versión
  - Elementos decorativos

**Ejemplo de diseño:**
```
┌──────────┐
│          │
│  [Logo]  │
│          │
│  Vlock   │
│ Sistema  │
│   de     │
│ Gestión  │
│          │
│  v2.0.0  │
│          │
│          │
└──────────┘
```

## 🛠️ Herramientas para Crear Imágenes BMP

### Opción 1: GIMP (Gratuito, Recomendado)
1. Descarga: https://www.gimp.org/
2. Crea nueva imagen con el tamaño exacto
3. Diseña tu imagen
4. Exporta como BMP:
   - File → Export As
   - Selecciona formato BMP
   - Opciones: 24 bits, sin compresión

### Opción 2: Photoshop
1. Crea nuevo documento con dimensiones exactas
2. Diseña tu imagen
3. Guarda como BMP de 24 bits

### Opción 3: Paint.NET (Windows)
1. Descarga: https://www.getpaint.net/
2. Crea nueva imagen
3. Diseña
4. Guarda como BMP de 24 bits

### Opción 4: Convertidor Online
1. Diseña en PNG con las dimensiones correctas
2. Convierte a BMP: https://convertio.co/es/png-bmp/
3. Asegúrate de seleccionar 24 bits

## 📝 Personalización del Texto de Licencia

**Archivo**: `installer-assets/license.txt`

El archivo actual contiene un EULA genérico en español. Puedes personalizarlo:

1. Abre `installer-assets/license.txt`
2. Modifica los términos según tus necesidades
3. Mantén formato de texto plano (.txt)
4. El instalador mostrará este texto antes de la instalación

**Secciones del EULA actual:**
- Concesión de licencia
- Uso permitido
- Restricciones
- Propiedad intelectual
- Garantía limitada
- Limitación de responsabilidad
- Soporte técnico
- Actualizaciones
- Terminación
- Ley aplicable

## ⚙️ Configuración Avanzada de NSIS

### Opciones Disponibles en `package.json`

```json
"nsis": {
  "oneClick": false,                    // Instalación paso a paso
  "allowToChangeInstallationDirectory": true,  // Elegir directorio
  "allowElevation": true,               // Permitir permisos admin
  "perMachine": false,                  // Instalación por usuario
  "createDesktopShortcut": "always",    // Siempre crear acceso directo
  "createStartMenuShortcut": true,      // Crear en menú inicio
  "menuCategory": true,                 // Crear carpeta en menú
  "runAfterFinish": true,               // Opción de ejecutar al terminar
  "installerIcon": "build/icon.ico",    // Icono del instalador
  "uninstallerIcon": "build/icon.ico",  // Icono del desinstalador
  "installerHeader": "build/installerHeader.bmp",  // Header superior
  "installerSidebar": "build/installerSidebar.bmp", // Barra lateral
  "installerHeaderIcon": "build/icon.ico",  // Icono en header
  "license": "build/license.txt",       // Archivo de licencia
  "language": "3082",                   // Español (España)
  "deleteAppDataOnUninstall": false,    // Mantener datos al desinstalar
  "artifactName": "${productName}-Setup-${version}.${ext}"  // Nombre del archivo
}
```

### Códigos de Idioma NSIS
- `1033` - Inglés (US)
- `3082` - Español (España)
- `2058` - Español (México)
- `1034` - Español (España tradicional)

## 📋 Checklist de Personalización

### Básico (Requerido)
- [x] Logo PNG en `src/renderer/public/images/vlock_logo.png`
- [x] Licencia EULA en `installer-assets/license.txt`
- [x] Script `prepare-icons.js` configurado

### Avanzado (Opcional)
- [ ] Header BMP (150x57) en `installer-assets/installerHeader.bmp`
- [ ] Sidebar BMP (164x314) en `installer-assets/installerSidebar.bmp`
- [ ] Personalizar texto de licencia
- [ ] Ajustar configuración NSIS en `package.json`

## 🚀 Proceso de Empaquetado

1. **Preparar recursos**:
   ```bash
   npm run prepare-icons
   ```
   Esto genera:
   - `build/icon.ico` (automático)
   - `build/icon.png` (automático)
   - `build/license.txt` (copiado)
   - `build/installerHeader.bmp` (si existe)
   - `build/installerSidebar.bmp` (si existe)

2. **Empaquetar**:
   ```bash
   npm run dist:win
   ```

3. **Resultado**:
   - `dist/Vlock Sistema de Gestión-Setup-2.0.0.exe`

## 🎯 Mejores Prácticas

### Diseño de Imágenes
1. **Usa colores de marca**: Mantén consistencia con tu branding
2. **Fondo sólido o degradado suave**: Evita imágenes muy complejas
3. **Texto legible**: Usa fuentes claras y tamaños adecuados
4. **Logo prominente**: Debe ser fácilmente reconocible
5. **Resolución exacta**: No redimensiones, crea en el tamaño correcto

### Licencia EULA
1. **Lenguaje claro**: Evita jerga legal excesiva
2. **Secciones organizadas**: Usa títulos y numeración
3. **Información de contacto**: Incluye email de soporte
4. **Fecha de actualización**: Mantén actualizada la versión

### Testing
1. **Prueba en Windows limpio**: VM o PC sin la app instalada
2. **Verifica todos los pasos**: Instalación completa
3. **Prueba desinstalación**: Asegúrate que funciona correctamente
4. **Verifica accesos directos**: Escritorio y menú inicio
5. **Comprueba iconos**: Deben verse correctamente

## 📚 Recursos Adicionales

- **Documentación NSIS**: https://nsis.sourceforge.io/Docs/
- **Electron Builder NSIS**: https://www.electron.build/configuration/nsis
- **Convertidores de imagen**: https://convertio.co/
- **GIMP Tutorial**: https://www.gimp.org/tutorials/

## 💡 Tips y Trucos

### Reducir Tamaño del Instalador
- Usa compresión LZMA en NSIS (ya habilitada por defecto)
- Considera usar `asar` para empaquetar archivos de la app
- Elimina dependencias no utilizadas antes de empaquetar

### Firma Digital (Opcional)
Para firmar el instalador digitalmente:
1. Obtén un certificado de firma de código
2. Configura en `package.json`:
   ```json
   "win": {
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "password"
   }
   ```

### Instalador Silencioso
Los usuarios pueden instalar silenciosamente:
```bash
"Vlock Sistema de Gestión-Setup-2.0.0.exe" /S
```

---

**Última actualización**: Octubre 2025  
**Versión**: 2.0.0
