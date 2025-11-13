# 🚀 Guía Rápida de Instalación - Módulo de Exportación/Importación

## ⚡ Pasos de Instalación

### 1. Instalar Dependencias del Backend

```bash
cd backend/api/src
npm install json2csv
```

### 2. Ejecutar Script SQL de Permisos

Conectarse a la base de datos MySQL y ejecutar:

```bash
mysql -h crossover.proxy.rlwy.net -P 15395 -u root -p'nArkIEmlZXJfvffITuStuiuiVIvCmbri' railway < backend/api/src/migrations/permisos_exportacion.sql
```

O ejecutar el contenido del archivo `permisos_exportacion.sql` manualmente desde tu cliente MySQL.

### 3. Reiniciar el Servidor Backend

```bash
cd backend/api/src
npm start
```

### 4. Verificar la Instalación

1. Iniciar sesión en el sistema
2. Navegar a la sección "Exportar/Importar" en el sidebar
3. O usar el atajo `Ctrl + B` y buscar "exportar"

## ✅ Verificación de Permisos

Para verificar que los permisos se crearon correctamente:

```sql
SELECT * FROM permisos WHERE modulo = 'exportacion';
```

Deberías ver 4 permisos:
- `exportacion.ver`
- `exportacion.exportar`
- `exportacion.importar`
- `exportacion.eliminar`

## 🔐 Asignar Permisos a Otros Roles

Si necesitas dar acceso a otros roles (no solo admin):

```sql
-- Ver exportación y exportar para rol ID 2 (ejemplo: Supervisor)
INSERT INTO permisos_rol (id_rol, id_permiso)
SELECT 2, id FROM permisos 
WHERE codigo IN ('exportacion.ver', 'exportacion.exportar');
```

## 📦 Archivos Creados/Modificados

### Backend
- ✅ `backend/api/src/controllers/exportacion.controller.js` (NUEVO)
- ✅ `backend/api/src/routes/exportacion.routes.js` (NUEVO)
- ✅ `backend/api/src/routes/index.js` (MODIFICADO)
- ✅ `backend/api/src/migrations/permisos_exportacion.sql` (NUEVO)

### Frontend
- ✅ `desktop/src/renderer/pages/ExportacionImportacion.jsx` (NUEVO)
- ✅ `desktop/src/renderer/components/Sidebar.jsx` (MODIFICADO)
- ✅ `desktop/src/renderer/components/QuickNavigator.jsx` (MODIFICADO)
- ✅ `desktop/src/renderer/App.jsx` (MODIFICADO)

### Documentación
- ✅ `MODULO_EXPORTACION_IMPORTACION.md` (NUEVO)
- ✅ `INSTALACION_EXPORTACION.md` (NUEVO - este archivo)

## 🎯 Primer Uso

### Hacer un Backup Completo

1. Ir a "Exportar/Importar"
2. Clic en "Seleccionar todas"
3. Elegir formato "SQL"
4. Activar "Incluir relaciones"
5. Clic en "Exportar Datos"
6. Guardar el archivo en un lugar seguro

### Exportar un Proyecto Específico

1. Seleccionar solo las tablas relacionadas:
   - Proyectos
   - Empleados
   - Nóminas
   - Suministros
2. Elegir formato "Excel"
3. Clic en "Exportar Datos"

## ⚠️ Advertencias

- ⚠️ Siempre hacer backup antes de vaciar tablas
- ⚠️ La operación de vaciar es IRREVERSIBLE
- ⚠️ Solo usuarios con permisos pueden acceder
- ⚠️ Los backups SQL incluyen datos sensibles, guardar en lugar seguro

## 🐛 Solución de Problemas

### No aparece en el menú
**Problema**: El módulo no aparece en el sidebar  
**Solución**: Verificar que ejecutaste el script SQL de permisos y que tu usuario tiene el rol admin.

### Error al exportar
**Problema**: Error 500 al exportar  
**Solución**: Verificar que instalaste `json2csv` con npm install.

### Error de permisos
**Problema**: "No tienes permisos para acceder"  
**Solución**: Ejecutar el script SQL y cerrar/abrir sesión.

## 📞 Soporte

Para más información, consulta `MODULO_EXPORTACION_IMPORTACION.md` que contiene la documentación completa.

---

**Instalación completada** ✅
