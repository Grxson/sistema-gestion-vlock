# Módulo de Exportación e Importación de Datos

## 📋 Descripción General

Sistema completo para exportar, importar y gestionar los datos del sistema de gestión Vlock. Permite respaldar información, migrar datos entre ambientes y limpiar información obsoleta de proyectos.

## ✨ Características Principales

### 1. **Exportación de Datos**
- ✅ Múltiples formatos de exportación:
  - **JSON**: Formato completo con estructura de datos
  - **CSV**: Formato tabular para análisis en Excel/Sheets
  - **Excel (XLSX)**: Múltiples hojas con formato profesional
  - **SQL**: Backup completo con INSERT statements

### 2. **Importación de Datos**
- ✅ Importar desde archivos JSON
- ✅ Opción de sobrescribir datos existentes
- ✅ Validación de integridad de datos
- ✅ Transacciones seguras (rollback en caso de error)

### 3. **Gestión de Datos**
- ✅ Selección granular de tablas a exportar
- ✅ Incluir relaciones entre tablas
- ✅ Vaciar tablas después de exportar
- ✅ Estadísticas en tiempo real
- ✅ Confirmaciones dobles para operaciones críticas

### 4. **Seguridad**
- ✅ Permisos específicos por operación
- ✅ Registro en auditoría de todas las acciones
- ✅ Confirmaciones múltiples antes de eliminar
- ✅ Solo usuarios con permisos pueden acceder

## 🗂️ Estructura de Archivos

### Backend
```
backend/api/src/
├── controllers/
│   └── exportacion.controller.js    # Lógica de exportación/importación
├── routes/
│   └── exportacion.routes.js        # Endpoints de la API
└── middleware/
    └── auth.middleware.js           # Verificación de permisos
```

### Frontend
```
desktop/src/renderer/
├── pages/
│   └── ExportacionImportacion.jsx   # Página principal
├── components/
│   ├── Sidebar.jsx                  # Navegación actualizada
│   └── QuickNavigator.jsx           # Búsqueda rápida actualizada
└── App.jsx                          # Rutas actualizadas
```

## 🔌 API Endpoints

### Obtener Tablas Disponibles
```http
GET /api/exportacion/tablas
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "tablas": [
    {
      "nombre": "empleados",
      "descripcion": "Empleados registrados",
      "count": 45
    },
    ...
  ]
}
```

### Exportar en JSON
```http
POST /api/exportacion/json
Authorization: Bearer {token}
Content-Type: application/json

{
  "tablas": ["empleados", "proyectos"],
  "incluirRelaciones": true
}
```

### Exportar en CSV
```http
POST /api/exportacion/csv
Authorization: Bearer {token}
Content-Type: application/json

{
  "tabla": "empleados"
}
```

### Exportar en Excel
```http
POST /api/exportacion/excel
Authorization: Bearer {token}
Content-Type: application/json

{
  "tablas": ["empleados", "proyectos", "nomina"]
}
```

### Exportar en SQL
```http
POST /api/exportacion/sql
Authorization: Bearer {token}
Content-Type: application/json

{
  "tablas": ["empleados", "proyectos"]
}
```

### Importar Datos
```http
POST /api/exportacion/importar
Authorization: Bearer {token}
Content-Type: application/json

{
  "datos": {...},
  "sobrescribir": false
}
```

### Vaciar Tablas
```http
POST /api/exportacion/vaciar
Authorization: Bearer {token}
Content-Type: application/json

{
  "tablas": ["empleados_antiguos", "proyectos_finalizados"],
  "confirmar": true
}
```

## 🔐 Permisos Requeridos

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Ver módulo | `exportacion.ver` | Acceder a la página |
| Exportar datos | `exportacion.exportar` | Descargar datos |
| Importar datos | `exportacion.importar` | Subir datos |
| Vaciar tablas | `exportacion.eliminar` | Eliminar datos |

## 📊 Tablas Soportadas

- ✅ Empleados
- ✅ Proyectos
- ✅ Nómina
- ✅ Contratos
- ✅ Oficios
- ✅ Suministros
- ✅ Proveedores
- ✅ Herramientas
- ✅ Adeudos Generales
- ✅ Ingresos
- ✅ Usuarios
- ✅ Roles
- ✅ Presupuestos
- ✅ Conceptos de Obra

## 🎯 Casos de Uso

### 1. Backup Completo del Sistema
```
1. Seleccionar todas las tablas
2. Elegir formato SQL o JSON
3. Activar "Incluir relaciones"
4. Exportar
5. Guardar archivo en lugar seguro
```

### 2. Exportar Proyecto Finalizado
```
1. Seleccionar tablas relacionadas al proyecto:
   - Proyectos
   - Empleados asignados
   - Nóminas del proyecto
   - Suministros utilizados
   - Contratos relacionados
2. Exportar en Excel para análisis
3. Activar "Vaciar después de exportar" si ya no se necesita
```

### 3. Migrar Datos Entre Ambientes
```
1. En ambiente origen:
   - Exportar en JSON con relaciones
2. En ambiente destino:
   - Importar archivo JSON
   - Revisar log de importación
```

### 4. Limpiar Datos Antiguos
```
1. Exportar datos que se van a eliminar (backup de seguridad)
2. Verificar que el archivo se descargó correctamente
3. Usar "Vaciar tablas" para eliminar
4. Confirmar doble confirmación
```

## ⚠️ Advertencias Importantes

### Operaciones Irreversibles
- ❗ Vaciar tablas es **PERMANENTE**
- ❗ No hay papelera de reciclaje
- ❗ Siempre hacer backup antes de vaciar

### Mejores Prácticas
1. **Siempre hacer backup antes de vaciar**
2. **Verificar el archivo descargado antes de eliminar**
3. **Usar formato SQL para backups completos**
4. **Usar Excel/CSV para análisis de datos**
5. **Probar importación en ambiente de pruebas primero**

### Limitaciones
- CSV solo permite exportar una tabla a la vez
- Importación solo soporta formato JSON
- Relaciones complejas pueden requerir importación manual

## 🚀 Uso desde la Interfaz

### Acceso Rápido
- **Atajo de teclado**: `Ctrl + B` → Buscar "Exportar" o "Backup"
- **Sidebar**: Sección "Administración" → "Exportar/Importar"
- **URL directa**: `/exportacion`

### Flujo de Trabajo

#### Exportar Datos
1. Seleccionar tablas deseadas
2. Elegir formato de exportación
3. (Opcional) Activar "Incluir relaciones"
4. (Opcional) Activar "Vaciar después de exportar"
5. Clic en "Exportar Datos"
6. Guardar archivo descargado

#### Importar Datos
1. Clic en "Importar Datos"
2. Seleccionar archivo JSON
3. Esperar confirmación de importación
4. Verificar registros importados

#### Vaciar Tablas
1. Seleccionar tablas a vaciar
2. Clic en "Vaciar Tablas"
3. Confirmar primera advertencia
4. Confirmar segunda advertencia
5. Esperar confirmación de eliminación

## 📈 Estadísticas y Monitoreo

La interfaz muestra en tiempo real:
- **Tablas seleccionadas**: Número de tablas marcadas
- **Total de registros**: Suma de registros a exportar/eliminar
- **Progreso**: Indicador visual durante operaciones largas

## 🔧 Configuración Adicional

### Configurar Permisos en Base de Datos
```sql
-- Permisos para módulo de exportación
INSERT INTO permisos (codigo, nombre, descripcion, modulo) VALUES
('exportacion.ver', 'Ver Exportación', 'Ver módulo de exportación/importación', 'exportacion'),
('exportacion.exportar', 'Exportar Datos', 'Exportar datos del sistema', 'exportacion'),
('exportacion.importar', 'Importar Datos', 'Importar datos al sistema', 'exportacion'),
('exportacion.eliminar', 'Vaciar Tablas', 'Eliminar datos de tablas', 'exportacion');

-- Asignar permisos al rol admin (id_rol = 1)
INSERT INTO permisos_rol (id_rol, id_permiso)
SELECT 1, id FROM permisos WHERE modulo = 'exportacion';
```

## 🐛 Solución de Problemas

### Error: "No se encontraron tablas"
**Solución**: Verificar que el usuario tenga permisos de lectura en la base de datos.

### Error al exportar SQL
**Solución**: Verificar conexión a base de datos y permisos de SELECT.

### Archivo Excel vacío
**Solución**: Asegurarse de que las tablas seleccionadas tengan datos.

### Error al importar JSON
**Solución**: Verificar formato del archivo y que coincida con estructura de base de datos.

### No aparece en el menú
**Solución**: Verificar que el usuario tenga el permiso `exportacion.ver` asignado.

## 📝 Notas de Desarrollo

### Dependencias Instaladas
```json
{
  "exceljs": "^4.4.0",      // Exportación a Excel
  "json2csv": "^6.0.0-alpha.2"  // Exportación a CSV
}
```

### Tecnologías Utilizadas
- **Backend**: Node.js, Express, Sequelize
- **Frontend**: React, TailwindCSS, Heroicons
- **Base de Datos**: MySQL/MariaDB

## 🎨 Interfaz de Usuario

### Características Visuales
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Modo oscuro/claro
- ✅ Iconos intuitivos para cada formato
- ✅ Indicadores de progreso
- ✅ Mensajes de confirmación claros
- ✅ Estadísticas en tiempo real
- ✅ Advertencias visuales para operaciones críticas

### Accesibilidad
- ✅ Navegación por teclado
- ✅ Textos descriptivos
- ✅ Colores con buen contraste
- ✅ Confirmaciones múltiples para acciones destructivas

## 📅 Historial de Cambios

### Versión 1.0.0 (13 de noviembre de 2025)
- ✅ Implementación inicial del módulo
- ✅ Soporte para JSON, CSV, Excel y SQL
- ✅ Funcionalidad de importación
- ✅ Funcionalidad de vaciado de tablas
- ✅ Integración con sistema de permisos
- ✅ Interfaz de usuario completa
- ✅ Documentación completa

## 🔮 Mejoras Futuras

- [ ] Programar backups automáticos
- [ ] Enviar backups por email
- [ ] Subir backups a la nube (AWS S3, Google Drive)
- [ ] Comparar versiones de backups
- [ ] Restaurar desde backup con un clic
- [ ] Exportación incremental (solo cambios)
- [ ] Compresión de archivos exportados
- [ ] Encriptación de backups sensibles
- [ ] Historial de exportaciones/importaciones

---

**Desarrollado por**: Sistema de Gestión Vlock  
**Fecha**: 13 de noviembre de 2025  
**Versión**: 1.0.0
