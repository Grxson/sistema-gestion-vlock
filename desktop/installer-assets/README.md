# 📁 Recursos del Instalador

Esta carpeta contiene los recursos personalizables para el instalador de Windows (NSIS).

## Archivos Actuales

### ✅ license.txt
Licencia EULA (Acuerdo de Licencia de Usuario Final) en español que se muestra durante la instalación.

**Puedes editar este archivo** para personalizar los términos y condiciones.

## Archivos Opcionales (Para Personalización Visual)

### installerHeader.bmp (Opcional)
**Tamaño**: 150 x 57 píxeles  
**Formato**: BMP de 24 bits  
**Ubicación**: Parte superior del instalador  

Si creas este archivo, se mostrará en la cabecera del asistente de instalación.

### installerSidebar.bmp (Opcional)
**Tamaño**: 164 x 314 píxeles  
**Formato**: BMP de 24 bits  
**Ubicación**: Barra lateral izquierda del instalador  

Si creas este archivo, se mostrará en el lado izquierdo del asistente de instalación.

## Cómo Crear las Imágenes BMP

### Opción 1: Usar GIMP (Gratuito)
1. Descarga GIMP: https://www.gimp.org/
2. Crea nueva imagen con el tamaño exacto (150x57 o 164x314)
3. Diseña tu imagen (logo, texto, colores de marca)
4. Exporta como BMP:
   - File → Export As
   - Selecciona formato BMP
   - Opciones: 24 bits, sin compresión
5. Guarda en esta carpeta (`installer-assets/`)

### Opción 2: Convertidor Online
1. Diseña tu imagen en PNG con las dimensiones correctas
2. Convierte a BMP de 24 bits: https://convertio.co/es/png-bmp/
3. Descarga y guarda en esta carpeta

## Proceso Automático

Cuando ejecutes `npm run prepare-icons` o `npm run dist:win`, el script:

1. ✅ Copiará `license.txt` a `build/license.txt`
2. ✅ Copiará `installerHeader.bmp` a `build/` (si existe)
3. ✅ Copiará `installerSidebar.bmp` a `build/` (si existe)

**No necesitas copiar manualmente** - el script lo hace automáticamente.

## Notas

- Los archivos BMP son **opcionales**
- Si no existen, el instalador usará el diseño predeterminado de NSIS
- El instalador funcionará perfectamente sin estas imágenes
- Solo agrégalas si quieres personalizar la apariencia visual

## Documentación Completa

Para más detalles sobre personalización del instalador, consulta:
- `../PERSONALIZACION_INSTALADOR.md` - Guía completa de personalización
- `../EMPAQUETADO.md` - Guía de empaquetado general
