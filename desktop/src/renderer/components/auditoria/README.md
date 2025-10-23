# Módulo de Auditoría

## Descripción
Sistema completo de auditoría para monitorear y registrar todas las actividades del sistema, incluyendo accesos de usuarios, modificaciones de datos y operaciones críticas.

## Arquitectura

### Estructura de Archivos
```
components/auditoria/
├── AuditoriaStatsCards.jsx    # Tarjetas de estadísticas
├── AuditoriaFilters.jsx        # Panel de filtros avanzados
├── AuditoriaTable.jsx          # Tabla de registros con paginación
├── AuditoriaCharts.jsx         # Gráficos y visualizaciones
├── AuditoriaExport.jsx         # Modal de exportación
└── README.md                   # Documentación

hooks/auditoria/
├── useAuditoriaData.js         # Hook para gestión de datos
├── useAuditoriaEstadisticas.js # Hook para estadísticas
└── index.js                    # Exportaciones

services/auditoria/
└── auditoriaService.js         # Servicio API

pages/
└── Auditoria.jsx               # Página principal
```

## Componentes

### AuditoriaStatsCards
Muestra 6 tarjetas con métricas clave:
- Total de registros
- Usuarios activos
- Total de acciones
- Tablas monitoreadas
- Acciones de hoy
- Sesiones activas

**Props:**
- `estadisticas` (Object): Objeto con las estadísticas
- `loading` (Boolean): Estado de carga

### AuditoriaFilters
Panel de filtros con búsqueda y filtros avanzados:
- Búsqueda por descripción
- Filtro por usuario
- Filtro por tipo de acción
- Filtro por tabla
- Filtro por rango de fechas

**Props:**
- `filtros` (Object): Objeto con los filtros actuales
- `onFiltrosChange` (Function): Callback para actualizar filtros
- `onLimpiar` (Function): Callback para limpiar filtros

### AuditoriaTable
Tabla de registros con:
- Paginación
- Ordenamiento
- Detalles expandibles
- Visualización de datos antiguos y nuevos

**Props:**
- `registros` (Array): Array de registros
- `loading` (Boolean): Estado de carga
- `paginacion` (Object): Objeto de paginación
- `onCambiarPagina` (Function): Callback para cambiar página

### AuditoriaCharts
Visualizaciones con Chart.js:
- Gráfico de dona: Acciones por tipo
- Gráfico de barras: Top 10 usuarios más activos
- Gráfico circular: Top 10 tablas más modificadas
- Gráfico de línea: Actividad de los últimos 30 días

**Props:**
- `estadisticas` (Object): Objeto con las estadísticas
- `loading` (Boolean): Estado de carga

### AuditoriaExport
Modal para exportar registros:
- Exportación a Excel (.xlsx)
- Exportación a PDF (.pdf)
- Respeta filtros aplicados

**Props:**
- `filtros` (Object): Filtros actuales para exportación
- `onClose` (Function): Callback para cerrar modal

## Hooks

### useAuditoriaData
Hook personalizado para gestión de datos de auditoría.

**Retorna:**
```javascript
{
  registros: Array,           // Registros de auditoría
  loading: Boolean,           // Estado de carga
  error: String,              // Error si existe
  paginacion: Object,         // Info de paginación
  filtros: Object,            // Filtros actuales
  actualizarFiltros: Function,// Actualizar filtros
  limpiarFiltros: Function,   // Limpiar filtros
  cambiarPagina: Function,    // Cambiar página
  cambiarLimite: Function,    // Cambiar límite
  recargar: Function          // Recargar datos
}
```

### useAuditoriaEstadisticas
Hook personalizado para estadísticas de auditoría.

**Parámetros:**
- `filtros` (Object): Filtros para las estadísticas

**Retorna:**
```javascript
{
  estadisticas: Object,  // Estadísticas calculadas
  loading: Boolean,      // Estado de carga
  error: String,         // Error si existe
  recargar: Function     // Recargar estadísticas
}
```

## API Service

### auditoriaService
Servicio para comunicación con el backend.

**Métodos:**
- `getRegistros(params)`: Obtener registros con filtros
- `getRegistro(id)`: Obtener un registro específico
- `getEstadisticas(params)`: Obtener estadísticas
- `getActividadPorUsuario(params)`: Actividad por usuario
- `getActividadPorTabla(params)`: Actividad por tabla
- `exportarExcel(params)`: Exportar a Excel
- `exportarPDF(params)`: Exportar a PDF
- `getUsuarios()`: Obtener lista de usuarios
- `getTablas()`: Obtener lista de tablas

## Backend

### Endpoints

#### GET /api/auditoria
Obtener registros de auditoría con filtros y paginación.

**Query Parameters:**
- `id_usuario` (Number): Filtrar por usuario
- `accion` (String): Filtrar por tipo de acción
- `tabla` (String): Filtrar por tabla
- `fecha_inicio` (Date): Fecha de inicio
- `fecha_fin` (Date): Fecha de fin
- `limite` (Number): Registros por página (default: 100)
- `pagina` (Number): Número de página (default: 1)

#### GET /api/auditoria/estadisticas
Obtener estadísticas de auditoría.

**Query Parameters:**
- `fecha_inicio` (Date): Fecha de inicio
- `fecha_fin` (Date): Fecha de fin
- `id_usuario` (Number): Filtrar por usuario
- `tabla` (String): Filtrar por tabla

#### GET /api/auditoria/tablas
Obtener lista de tablas disponibles.

#### GET /api/auditoria/exportar/excel
Exportar registros a Excel.

**Query Parameters:** Mismos que GET /api/auditoria

#### GET /api/auditoria/exportar/pdf
Exportar registros a PDF.

**Query Parameters:** Mismos que GET /api/auditoria

#### GET /api/auditoria/:id
Obtener un registro específico.

## Características

### Funcionalidades Principales
- ✅ Registro automático de todas las acciones del sistema
- ✅ Filtros avanzados y búsqueda
- ✅ Visualización de datos con gráficos interactivos
- ✅ Exportación a Excel y PDF
- ✅ Paginación eficiente
- ✅ Detalles expandibles de cada registro
- ✅ Estadísticas en tiempo real
- ✅ Soporte completo de dark mode
- ✅ Responsive design

### Tipos de Acciones Registradas
- `LOGIN`: Inicio de sesión
- `LOGOUT`: Cierre de sesión
- `CREATE`: Creación de registros
- `READ`: Lectura de datos
- `UPDATE`: Actualización de registros
- `DELETE`: Eliminación de registros

### Información Registrada
- Fecha y hora exacta
- Usuario que realizó la acción
- Tipo de acción
- Tabla afectada
- Descripción detallada
- Dirección IP
- Datos anteriores (para UPDATE/DELETE)
- Datos nuevos (para CREATE/UPDATE)

## Permisos

El módulo requiere el permiso `auditoria.ver` para acceder.
Solo usuarios con rol de administrador pueden acceder por defecto.

## Uso

### Ejemplo Básico
```javascript
import Auditoria from './pages/Auditoria';

function App() {
  return <Auditoria />;
}
```

### Registrar una Acción (Backend)
```javascript
const { registrarAuditoria } = require('./controllers/auditoria.controller');

// En cualquier controlador
await registrarAuditoria(
  req.user.id_usuario,
  'CREATE',
  'empleados',
  'Nuevo empleado creado',
  null,
  nuevoEmpleado
);
```

## Optimizaciones

### Performance
- Debounce en filtros (500ms)
- Paginación en backend
- Límites de seguridad en exportaciones
- Carga diferida de componentes
- Memoización de datos

### Seguridad
- Autenticación requerida
- Solo administradores
- Validación de permisos
- Sanitización de datos
- Límites de exportación

## Mejoras Futuras

- [ ] Alertas en tiempo real
- [ ] Exportación personalizable
- [ ] Comparación de cambios (diff)
- [ ] Búsqueda avanzada con operadores
- [ ] Filtros guardados
- [ ] Dashboard personalizable
- [ ] Integración con notificaciones
- [ ] Análisis de patrones
- [ ] Detección de anomalías
- [ ] Reportes programados

## Dependencias

### Frontend
- React
- Chart.js
- react-chartjs-2
- date-fns
- react-icons

### Backend
- Sequelize
- ExcelJS
- PDFKit
- Express

## Mantenimiento

### Limpieza de Registros
Se recomienda implementar una tarea programada para limpiar registros antiguos:

```javascript
// Ejemplo: Eliminar registros mayores a 1 año
const hace1Año = new Date();
hace1Año.setFullYear(hace1Año.getFullYear() - 1);

await Auditoria.destroy({
  where: {
    fecha_hora: {
      [Op.lt]: hace1Año
    }
  }
});
```

### Monitoreo
- Revisar regularmente el tamaño de la tabla
- Monitorear el rendimiento de las consultas
- Verificar la integridad de los datos
- Analizar patrones de uso

## Soporte

Para reportar problemas o sugerencias, contactar al equipo de desarrollo.
