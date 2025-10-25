# ⚠️ Solución: Error "cannot find specified resource build/icon.ico"

## Problema

Al ejecutar `npm run dist:all` o cualquier comando de empaquetado, aparecía el error:
```
⨯ cannot find specified resource "build/icon.ico", nor relative to "/home/grxson/Documentos/Github/sistema-gestion-vlock/desktop/build"
```

## Causa Raíz

**Vite vacía la carpeta `build/` antes de compilar** debido a la configuración `emptyOutDir: true` en `vite.config.js`.

El orden original de los scripts era:
1. `npm run prepare-icons` → Genera iconos en `build/`
2. `npm run build` → **Vite vacía `build/`** y compila
3. `electron-builder` → No encuentra los iconos (fueron eliminados)

## Solución Implementada

**Cambiar el orden de ejecución de los scripts** en `package.json`:

### ❌ Antes (Incorrecto):
```json
"dist:win": "npm run prepare-icons && npm run build && electron-builder --win --publish=never"
```

### ✅ Después (Correcto):
```json
"dist:win": "npm run build && npm run prepare-icons && electron-builder --win --publish=never"
```

## Orden Correcto de Ejecución

1. **`npm run build`** (Vite)
   - Compila React + Tailwind
   - Vacía la carpeta `build/`
   - Genera `index.html` y assets

2. **`npm run prepare-icons`** (Script personalizado)
   - Se ejecuta **después** del build
   - Genera `icon.ico` (Windows)
   - Genera `icon.png` (Linux)
   - Copia `license.txt`
   - Copia imágenes BMP opcionales

3. **`electron-builder`**
   - Encuentra todos los recursos en `build/`
   - Crea los instaladores correctamente

## Scripts Corregidos

Todos los comandos de distribución fueron actualizados:

```json
{
  "scripts": {
    "dist": "npm run build && npm run prepare-icons && electron-builder --publish=never",
    "dist:win": "npm run build && npm run prepare-icons && electron-builder --win --publish=never",
    "dist:mac": "npm run build && npm run prepare-icons && electron-builder --mac --publish=never",
    "dist:linux": "npm run build && npm run prepare-icons && electron-builder --linux --publish=never",
    "dist:all": "npm run build && npm run prepare-icons && electron-builder --win --linux --publish=never"
  }
}
```

## Verificación

Para verificar que los iconos se generan correctamente:

```bash
# Ejecutar build y preparación de iconos
npm run build && npm run prepare-icons

# Verificar que existen los archivos
ls -lh build/ | grep -E "icon|license"
```

Deberías ver:
- `icon.ico` (279 KB) - Icono Windows
- `icon.png` (69 KB) - Icono Linux
- `license.txt` (3.6 KB) - Licencia EULA

## Resultado

Ahora `npm run dist:all` funciona correctamente y genera:
- `dist/Vlock Sistema de Gestión-Setup-2.0.0.exe` (Windows)
- `dist/vlock-sistema-gestion-2.0.0.AppImage` (Linux)
- `dist/vlock-sistema-gestion_2.0.0_amd64.deb` (Linux)

Todos con los iconos correctos.

## Lección Aprendida

**Siempre ejecutar `prepare-icons` DESPUÉS de `build`** para evitar que Vite elimine los recursos generados.

---

**Fecha de solución**: Octubre 25, 2025  
**Versión**: 2.0.0
