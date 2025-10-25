# 📦 Guía de Empaquetado - Vlock Sistema de Gestión v2.0.0

## Requisitos Previos

1. **Node.js** instalado (v18 o superior)
2. **npm** actualizado
3. Todas las dependencias instaladas: `npm install`

## Scripts Disponibles

### Empaquetar para Windows
```bash
npm run dist:win
```
**Genera:**
- `dist/Vlock Sistema de Gestión Setup 2.0.0.exe` - Instalador NSIS
- Instalador con opciones de directorio personalizado
- Accesos directos en escritorio y menú inicio

### Empaquetar para Linux
```bash
npm run dist:linux
```
**Genera:**
- `dist/vlock-sistema-gestion-2.0.0.AppImage` - Ejecutable portable
- `dist/vlock-sistema-gestion_2.0.0_amd64.deb` - Paquete Debian/Ubuntu

### Empaquetar para Windows y Linux simultáneamente
```bash
npm run dist:all
```

## Proceso de Empaquetado

El proceso automático realiza los siguientes pasos:

1. **Preparar iconos** (`npm run prepare-icons`)
   - Copia el logo de la aplicación
   - Prepara iconos para cada plataforma

2. **Compilar frontend** (`npm run build`)
   - Vite compila React + Tailwind
   - Optimiza assets y código
   - Genera bundle de producción

3. **Empaquetar con Electron Builder**
   - Crea instaladores específicos por plataforma
   - Incluye todas las dependencias necesarias
   - Firma digitalmente (si está configurado)

## Configuración de Iconos

### ✅ Iconos Automáticos
El script `prepare-icons.js` genera automáticamente:
- **Linux**: `build/icon.png` ✅ Automático
- **Windows**: `build/icon.ico` ✅ Automático (desde PNG)
- **Mac**: `build/icon.icns` ⚠️ Requiere conversión manual

### Crear Iconos para Mac (.icns)
1. Usa el logo en `src/renderer/public/images/vlock_logo.png`
2. Convierte a .icns usando: https://cloudconvert.com/png-to-icns
3. Guarda como `build/icon.icns`

**Nota**: Los iconos de Windows y Linux se generan automáticamente al ejecutar `npm run prepare-icons` o cualquier comando `dist:*`.

## Configuración del Instalador

### Windows (NSIS) - Personalización Completa

#### Características del Instalador:
- ✅ Instalación personalizable (no one-click)
- ✅ Selección de directorio de instalación
- ✅ Acceso directo en escritorio (siempre)
- ✅ Acceso directo en menú inicio
- ✅ Categoría en menú inicio
- ✅ Ejecutar después de instalar
- ✅ Desinstalador incluido
- ✅ Licencia EULA incluida
- ✅ Idioma español (código 3082)
- ✅ Iconos personalizados (instalador y desinstalador)

#### Personalización Visual del Instalador:
Para personalizar la apariencia del instalador NSIS, crea estas imágenes en `installer-assets/`:

**1. Header del Instalador** (`installerHeader.bmp`):
- **Tamaño**: 150 x 57 píxeles
- **Formato**: BMP de 24 bits
- **Ubicación**: Se muestra en la parte superior del instalador
- **Contenido sugerido**: Logo + nombre del producto

**2. Sidebar del Instalador** (`installerSidebar.bmp`):
- **Tamaño**: 164 x 314 píxeles
- **Formato**: BMP de 24 bits
- **Ubicación**: Barra lateral izquierda del instalador
- **Contenido sugerido**: Logo vertical + branding

**Herramientas recomendadas para crear BMPs:**
- GIMP (gratuito): https://www.gimp.org/
- Photoshop
- Paint.NET (Windows)
- Convertidores online: https://convertio.co/es/png-bmp/

**Proceso:**
1. Diseña las imágenes en el tamaño correcto
2. Guárdalas como BMP de 24 bits
3. Colócalas en `installer-assets/`
4. El script `prepare-icons.js` las copiará automáticamente a `build/`

#### Archivo de Licencia:
El instalador incluye un EULA (Acuerdo de Licencia) en español ubicado en:
- `installer-assets/license.txt` (fuente)
- `build/license.txt` (copiado automáticamente)

Puedes editar `installer-assets/license.txt` para personalizar los términos de uso.

### Linux
- ✅ AppImage (portable, no requiere instalación)
- ✅ .deb (para Debian/Ubuntu)
- ✅ Integración con menú de aplicaciones
- ✅ Icono en launcher

## Ubicación de los Archivos Generados

Todos los instaladores se generan en la carpeta `dist/`:

```
dist/
├── win-unpacked/                              # Archivos desempaquetados Windows
├── linux-unpacked/                            # Archivos desempaquetados Linux
├── Vlock Sistema de Gestión Setup 2.0.0.exe  # Instalador Windows
├── vlock-sistema-gestion-2.0.0.AppImage      # AppImage Linux
└── vlock-sistema-gestion_2.0.0_amd64.deb     # Paquete Debian
```

## Tamaño Aproximado de los Instaladores

- **Windows**: ~150-200 MB
- **Linux AppImage**: ~150-200 MB
- **Linux .deb**: ~150-200 MB

## Distribución

### Windows
1. Distribuye el archivo `.exe`
2. Los usuarios ejecutan el instalador
3. Siguen el asistente de instalación

### Linux (AppImage)
1. Distribuye el archivo `.AppImage`
2. Los usuarios dan permisos de ejecución: `chmod +x vlock-sistema-gestion-2.0.0.AppImage`
3. Ejecutan directamente: `./vlock-sistema-gestion-2.0.0.AppImage`

### Linux (Debian/Ubuntu)
1. Distribuye el archivo `.deb`
2. Los usuarios instalan: `sudo dpkg -i vlock-sistema-gestion_2.0.0_amd64.deb`
3. O hacen doble clic en el archivo

## Solución de Problemas

### Error: "icon.ico not found"
✅ **Solucionado**: El script `prepare-icons.js` ahora genera automáticamente el archivo `.ico` desde el PNG.
- Si aún falla, verifica que existe `src/renderer/public/images/vlock_logo.png`

### Error: "Cannot find module 'png-to-ico'"
- Ejecuta `npm install` para instalar todas las dependencias
- La dependencia `png-to-ico` se agregó automáticamente

### Error: "Cannot find module"
- Ejecuta `npm install` para instalar todas las dependencias
- Verifica que `node_modules` esté completo

### Error de permisos en Linux
- Ejecuta con sudo si es necesario
- Verifica permisos del directorio `dist/`

### El instalador es muy grande
- Es normal, incluye Electron + Chromium (~150-200 MB)
- Para reducir tamaño, considera usar `asar` packing

### Advertencias sobre imágenes del instalador
Si ves mensajes como "installerHeader.bmp no encontrado":
- Son **opcionales**, el instalador funcionará sin ellas
- Crea las imágenes BMP si quieres personalizar la apariencia
- Sin ellas, NSIS usa el diseño predeterminado

## Notas Importantes

1. **Versión**: Actualizada a `2.0.0` (estable)
2. **Iconos**: Generación automática para Windows y Linux ✅
3. **Licencia**: EULA incluida en español
4. **Sandbox**: Deshabilitado en desarrollo (`--no-sandbox`)
5. **Producción**: El sandbox está habilitado en builds de producción
6. **Backend**: Asegúrate de que el backend esté corriendo antes de usar la app

## Estructura de Archivos del Instalador

```
desktop/
├── installer-assets/          # Recursos del instalador (editable)
│   ├── license.txt           # Licencia EULA (español)
│   ├── installerHeader.bmp   # Header 150x57 (opcional)
│   └── installerSidebar.bmp  # Sidebar 164x314 (opcional)
├── build/                     # Generado automáticamente
│   ├── icon.png              # Icono Linux (auto)
│   ├── icon.ico              # Icono Windows (auto)
│   ├── license.txt           # Copiado desde installer-assets
│   ├── installerHeader.bmp   # Copiado si existe
│   └── installerSidebar.bmp  # Copiado si existe
└── dist/                      # Instaladores finales
    ├── Vlock Sistema de Gestión-Setup-2.0.0.exe
    ├── vlock-sistema-gestion-2.0.0.AppImage
    └── vlock-sistema-gestion_2.0.0_amd64.deb
```

## Próximos Pasos

1. ✅ Iconos .ico generados automáticamente
2. (Opcional) Crear imágenes BMP para personalizar instalador
3. Ejecutar `npm run dist:win` o `npm run dist:all`
4. Probar instaladores en cada plataforma
5. Distribuir a usuarios finales

---

**Versión del Sistema**: 2.0.0  
**Última Actualización**: Octubre 2025  
**Desarrollado por**: Vlock
