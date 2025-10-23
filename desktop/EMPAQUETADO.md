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

### Iconos Actuales
- **Linux**: `build/icon.png` (generado automáticamente)
- **Windows**: `build/icon.ico` (necesita conversión manual)
- **Mac**: `build/icon.icns` (necesita conversión manual)

### Crear Iconos para Windows (.ico)
1. Usa el logo en `src/renderer/public/images/vlock_logo.png`
2. Convierte a .ico usando: https://convertio.co/es/png-ico/
3. Guarda como `build/icon.ico`

### Crear Iconos para Mac (.icns)
1. Usa el logo en `src/renderer/public/images/vlock_logo.png`
2. Convierte a .icns usando: https://cloudconvert.com/png-to-icns
3. Guarda como `build/icon.icns`

## Configuración del Instalador

### Windows (NSIS)
- ✅ Instalación personalizable
- ✅ Selección de directorio
- ✅ Acceso directo en escritorio
- ✅ Acceso directo en menú inicio
- ✅ Desinstalador incluido

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
- Crea el archivo `build/icon.ico` siguiendo las instrucciones arriba
- O comenta la línea `"icon": "build/icon.ico"` en `package.json`

### Error: "Cannot find module"
- Ejecuta `npm install` para instalar todas las dependencias
- Verifica que `node_modules` esté completo

### Error de permisos en Linux
- Ejecuta con sudo si es necesario
- Verifica permisos del directorio `dist/`

### El instalador es muy grande
- Es normal, incluye Electron + Chromium
- Para reducir tamaño, considera usar `asar` packing

## Notas Importantes

1. **Versión**: Actualizada a `2.0.0` (estable)
2. **Sandbox**: Deshabilitado en desarrollo (`--no-sandbox`)
3. **Producción**: El sandbox está habilitado en builds de producción
4. **Backend**: Asegúrate de que el backend esté corriendo antes de usar la app

## Próximos Pasos

1. Crear iconos .ico y .icns
2. Ejecutar `npm run dist:all`
3. Probar instaladores en cada plataforma
4. Distribuir a usuarios finales

---

**Versión del Sistema**: 2.0.0  
**Última Actualización**: Octubre 2025  
**Desarrollado por**: Vlock
