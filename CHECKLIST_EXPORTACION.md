# ✅ Checklist de Verificación - Módulo de Exportación/Importación

## 🎯 Objetivo
Verificar que el módulo de Exportación/Importación está funcionando correctamente.

---

## 📋 Pasos de Verificación

### 1. Verificar Backend (API)

#### 1.1 Verificar que las rutas están registradas
```bash
cd /home/grxson/Documentos/Github/sistema-gestion-vlock/backend/api/src
grep -n "exportacion" routes/index.js
```
**Resultado esperado**: Debe mostrar la línea donde se importa y registra `exportacionRoutes`

**Status**: [ ] Completado

---

#### 1.2 Verificar que el controlador existe
```bash
ls -lh controllers/exportacion.controller.js
```
**Resultado esperado**: Debe mostrar el archivo con ~500+ líneas

**Status**: [ ] Completado

---

#### 1.3 Verificar dependencias instaladas
```bash
cd /home/grxson/Documentos/Github/sistema-gestion-vlock/backend/api/src
npm list json2csv
```
**Resultado esperado**: Debe mostrar la versión instalada de json2csv

**Status**: [ ] Completado

---

### 2. Verificar Base de Datos

#### 2.1 Verificar permisos creados
```bash
mysql -h crossover.proxy.rlwy.net -P 15395 -u root \
  -p'nArkIEmlZXJfvffITuStuiuiVIvCmbri' railway \
  -e "SELECT * FROM acciones_permisos WHERE modulo = 'exportacion';"
```
**Resultado esperado**: Debe mostrar 4 permisos (ver, exportar, importar, eliminar)

**Status**: [x] Completado ✅

---

#### 2.2 Verificar permisos asignados a admin
```bash
mysql -h crossover.proxy.rlwy.net -P 15395 -u root \
  -p'nArkIEmlZXJfvffITuStuiuiVIvCmbri' railway \
  -e "SELECT pr.*, ap.codigo FROM permisos_rols pr JOIN acciones_permisos ap ON pr.id_accion = ap.id_accion WHERE ap.modulo = 'exportacion' AND pr.id_rol = 1;"
```
**Resultado esperado**: Debe mostrar 4 registros con id_rol = 1

**Status**: [x] Completado ✅

---

### 3. Verificar Frontend

#### 3.1 Verificar que la página existe
```bash
ls -lh /home/grxson/Documentos/Github/sistema-gestion-vlock/desktop/src/renderer/pages/ExportacionImportacion.jsx
```
**Resultado esperado**: Debe mostrar el archivo con ~600+ líneas

**Status**: [ ] Completado

---

#### 3.2 Verificar integración en App.jsx
```bash
grep -n "ExportacionImportacion" /home/grxson/Documentos/Github/sistema-gestion-vlock/desktop/src/renderer/App.jsx
```
**Resultado esperado**: Debe mostrar varias líneas donde se importa y usa el componente

**Status**: [ ] Completado

---

#### 3.3 Verificar integración en Sidebar
```bash
grep -n "exportacion" /home/grxson/Documentos/Github/sistema-gestion-vlock/desktop/src/renderer/components/Sidebar.jsx
```
**Resultado esperado**: Debe mostrar la entrada de menú "Exportar/Importar"

**Status**: [ ] Completado

---

#### 3.4 Verificar integración en QuickNavigator
```bash
grep -n "Exportar/Importar" /home/grxson/Documentos/Github/sistema-gestion-vlock/desktop/src/renderer/components/QuickNavigator.jsx
```
**Resultado esperado**: Debe mostrar la entrada en el navegador rápido

**Status**: [ ] Completado

---

### 4. Pruebas Funcionales (Requiere aplicación corriendo)

#### 4.1 Iniciar sesión como admin
1. Abrir el sistema
2. Iniciar sesión con credenciales de administrador
3. Verificar que la sesión inicia correctamente

**Status**: [ ] Completado

---

#### 4.2 Verificar menú en Sidebar
1. Buscar "Exportar/Importar" en el sidebar
2. Verificar que el icono se muestra correctamente
3. Clic en el menú

**Resultado esperado**: Debe navegar a `/exportacion`

**Status**: [ ] Completado

---

#### 4.3 Verificar navegación rápida
1. Presionar `Ctrl + B`
2. Escribir "exportar"
3. Verificar que aparece "Exportar/Importar"
4. Presionar Enter

**Resultado esperado**: Debe navegar a la página de exportación

**Status**: [ ] Completado

---

#### 4.4 Verificar carga de tablas
1. En la página de exportación
2. Verificar que se muestra la lista de tablas
3. Verificar que cada tabla muestra su conteo de registros

**Resultado esperado**: Debe mostrar ~14 tablas con sus respectivos conteos

**Status**: [ ] Completado

---

#### 4.5 Probar exportación en JSON
1. Seleccionar tabla "empleados"
2. Elegir formato "JSON"
3. Clic en "Exportar Datos"
4. Verificar que se descarga el archivo

**Resultado esperado**: Archivo JSON descargado correctamente

**Status**: [ ] Completado

---

#### 4.6 Probar exportación en Excel
1. Seleccionar 2-3 tablas
2. Elegir formato "Excel"
3. Clic en "Exportar Datos"
4. Verificar que se descarga el archivo
5. Abrir el archivo en Excel/LibreOffice

**Resultado esperado**: Archivo XLSX con múltiples hojas

**Status**: [ ] Completado

---

#### 4.7 Probar exportación en CSV
1. Seleccionar tabla "proyectos"
2. Elegir formato "CSV"
3. Clic en "Exportar Datos"
4. Verificar que se descarga el archivo

**Resultado esperado**: Archivo CSV descargado correctamente

**Status**: [ ] Completado

---

#### 4.8 Probar exportación en SQL
1. Seleccionar varias tablas
2. Elegir formato "SQL"
3. Clic en "Exportar Datos"
4. Verificar que se descarga el archivo
5. Abrir el archivo en un editor de texto

**Resultado esperado**: Archivo SQL con INSERT statements

**Status**: [ ] Completado

---

#### 4.9 Probar importación
1. Exportar tabla "empleados" en JSON
2. Clic en "Importar Datos"
3. Seleccionar el archivo JSON exportado
4. Verificar mensaje de confirmación

**Resultado esperado**: Importación exitosa con número de registros

**Status**: [ ] Completado

---

#### 4.10 Probar estadísticas en tiempo real
1. Seleccionar varias tablas
2. Verificar que el panel de estadísticas se actualiza
3. Verificar conteo de tablas seleccionadas
4. Verificar total de registros

**Resultado esperado**: Estadísticas correctas y actualizadas

**Status**: [ ] Completado

---

#### 4.11 Probar opción "Incluir relaciones"
1. Seleccionar tabla con relaciones (ej: "nomina")
2. Activar "Incluir relaciones"
3. Exportar en JSON
4. Verificar que incluye datos relacionados

**Resultado esperado**: JSON con relaciones incluidas

**Status**: [ ] Completado

---

#### 4.12 Probar confirmaciones de vaciado (⚠️ NO USAR EN PRODUCCIÓN)
1. Seleccionar tabla de prueba (crear una temporal si es necesario)
2. Exportar primero (backup)
3. Clic en "Vaciar Tablas"
4. Verificar primera confirmación
5. Verificar segunda confirmación
6. Cancelar (NO confirmar en producción)

**Resultado esperado**: Dos confirmaciones antes de eliminar

**Status**: [ ] Completado

---

### 5. Verificar Permisos y Seguridad

#### 5.1 Probar acceso sin permisos
1. Crear usuario sin permisos de exportación
2. Iniciar sesión con ese usuario
3. Verificar que NO aparece en el menú

**Resultado esperado**: Menú no visible sin permisos

**Status**: [ ] Completado

---

#### 5.2 Probar acceso directo sin permisos
1. Con usuario sin permisos
2. Navegar manualmente a `/exportacion`
3. Verificar mensaje de acceso denegado

**Resultado esperado**: Pantalla de "Acceso Denegado"

**Status**: [ ] Completado

---

### 6. Verificar Documentación

#### 6.1 Verificar archivos de documentación creados
```bash
ls -lh /home/grxson/Documentos/Github/sistema-gestion-vlock/*.md | grep -E "(MODULO_EXPORTACION|INSTALACION_EXPORTACION|RESUMEN_IMPLEMENTACION|GUIA_BACKUP)"
```
**Resultado esperado**: 4 archivos de documentación

**Status**: [ ] Completado

---

#### 6.2 Revisar contenido de documentación
1. Abrir `MODULO_EXPORTACION_IMPORTACION.md`
2. Verificar que tiene índice y secciones completas
3. Abrir `INSTALACION_EXPORTACION.md`
4. Verificar pasos de instalación

**Status**: [ ] Completado

---

### 7. Backup Manual (Verificado)

#### 7.1 Verificar backup manual creado
```bash
ls -lh /home/grxson/Documentos/Github/sistema-gestion-vlock/backup_completo_*.sql
```
**Resultado esperado**: Archivo de ~199KB creado

**Status**: [x] Completado ✅

---

#### 7.2 Verificar contenido del backup
```bash
head -20 /home/grxson/Documentos/Github/sistema-gestion-vlock/backup_completo_20251113_103159.sql
```
**Resultado esperado**: Debe mostrar header SQL con información de MySQL

**Status**: [x] Completado ✅

---

## 📊 Resumen de Verificación

### Componentes Backend
- [ ] Controlador creado
- [ ] Rutas registradas
- [ ] Dependencias instaladas
- [x] Permisos en BD creados ✅
- [x] Permisos asignados a admin ✅

### Componentes Frontend
- [ ] Página creada
- [ ] Integración en App.jsx
- [ ] Integración en Sidebar
- [ ] Integración en QuickNavigator

### Funcionalidades
- [ ] Exportar JSON
- [ ] Exportar CSV
- [ ] Exportar Excel
- [ ] Exportar SQL
- [ ] Importar JSON
- [ ] Vaciar tablas
- [ ] Estadísticas en tiempo real
- [ ] Incluir relaciones

### Seguridad
- [ ] Permisos funcionando
- [ ] Confirmaciones dobles
- [ ] Acceso denegado sin permisos

### Documentación
- [ ] Manual completo
- [ ] Guía de instalación
- [ ] Guía de backup
- [ ] Resumen de implementación

### Backup Manual
- [x] Backup SQL creado ✅
- [x] Tamaño verificado (199KB) ✅

---

## ✅ Criterios de Aprobación

Para considerar el módulo **completamente funcional**, se deben cumplir:

- ✅ **Mínimo 80%** de pruebas backend completadas
- ✅ **Mínimo 80%** de pruebas frontend completadas
- ✅ **100%** de permisos configurados (YA COMPLETADO)
- ✅ **100%** de documentación creada
- ✅ Al menos **3 formatos** de exportación funcionando
- ✅ Importación funcionando correctamente
- ✅ Seguridad validada

---

## 🐛 Registro de Problemas Encontrados

### Problema 1
**Descripción**: 
**Solución**: 
**Status**: 

### Problema 2
**Descripción**: 
**Solución**: 
**Status**: 

---

## 📝 Notas Adicionales

- Las vistas de BD se excluyeron del backup por problemas de permisos
- El módulo está diseñado solo para usuarios admin por defecto
- Se recomienda probar primero en ambiente de desarrollo

---

## ✅ Aprobación Final

- [ ] Todas las pruebas críticas pasadas
- [ ] Documentación completa y revisada
- [ ] Sin errores en consola
- [ ] Funcionalidad probada en producción
- [ ] Equipo capacitado en el uso

**Aprobado por**: ___________________  
**Fecha**: ___________________  
**Firma**: ___________________

---

**Versión del Checklist**: 1.0  
**Fecha de creación**: 13 de noviembre de 2025
