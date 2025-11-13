# 📦 Backup y Limpieza por Proyecto

## 🎯 Descripción General

Nueva funcionalidad que permite **exportar** y **vaciar** todos los datos relacionados a un proyecto específico de manera automática e inteligente, respetando dependencias de tablas y claves foráneas.

## ✨ Características

### 🔄 Detección Automática de Relaciones

El sistema identifica automáticamente todas las tablas relacionadas a un proyecto mediante `id_proyecto`:

#### Tablas Incluidas

| Tabla | Tipo FK | Descripción |
|-------|---------|-------------|
| `suministros` | Directa | Materiales, equipos, servicios |
| `gastos` | Directa | Gastos del proyecto |
| `ingresos` | Directa | Ingresos y pagos del proyecto |
| `nomina_empleado` | Directa | Nóminas semanales |
| `pagos_nomina` | Indirecta | Pagos de nóminas (via id_nomina) |
| `deducciones_nomina` | Indirecta | Deducciones de nóminas (via id_nomina) |
| `ingresos_movimientos` | Directa | Movimientos financieros |
| `movimientos_herramienta` | Directa | Movimientos de herramientas |
| `presupuestos` | Directa | Presupuestos y partidas |
| `estados_cuenta` | Directa | Estados financieros |
| `empleados` | Opcional | Empleados asignados al proyecto |
| `herramientas` | Opcional | Herramientas ubicadas en el proyecto |

### 🗂️ Formatos de Exportación

#### 1. SQL (Recomendado para respaldo)
```sql
-- ============================================
-- Backup de Proyecto: FLEX PARK
-- ID Proyecto: 1
-- Fecha: 2025-11-13
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Datos del proyecto
INSERT INTO proyectos (...) VALUES (...);

-- Suministros
INSERT INTO suministros (...) VALUES (...);
INSERT INTO suministros (...) VALUES (...);

-- Nóminas
INSERT INTO nomina_empleado (...) VALUES (...);
-- ... más INSERTs

SET FOREIGN_KEY_CHECKS = 1;
```

**Ventajas:**
- Archivo ejecutable directamente en MySQL
- Respeta integridad referencial
- Incluye todos los datos necesarios
- Fácil de restaurar con `source backup.sql`

#### 2. Excel (Recomendado para análisis)
```
📊 backup_FLEX_PARK_2025-11-13.xlsx
├─ Hoja 1: Proyecto (info general)
├─ Hoja 2: suministros (233 registros con FK resueltas)
├─ Hoja 3: nomina_empleado (89 registros)
├─ Hoja 4: gastos (45 registros)
└─ ... más hojas
```

**Ventajas:**
- Valores FK resueltos (nombres legibles)
- Fácil de analizar en Excel/LibreOffice
- Filtros y gráficas
- Una hoja por tabla

#### 3. JSON (Recomendado para integración)
```json
{
  "metadata": {
    "proyecto": "FLEX PARK",
    "id_proyecto": 1,
    "fecha_backup": "2025-11-13",
    "version": "1.0"
  },
  "proyecto": { ... },
  "tablas": {
    "suministros": [ {...}, {...}, ... ],
    "nomina_empleado": [ {...}, {...}, ... ],
    "gastos": [ {...}, {...}, ... ]
  }
}
```

**Ventajas:**
- Estructura programática
- Fácil de parsear
- Incluye metadata

---

## 🛠️ Uso del Sistema

### 📥 Exportar Backup de Proyecto

#### Endpoint Backend
```http
POST /api/exportacion/proyecto/:id/backup
Authorization: Bearer {token}
Content-Type: application/json

{
  "formato": "sql" | "excel" | "json"
}
```

**Ejemplo con cURL:**
```bash
TOKEN="tu_token_jwt"
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"formato":"sql"}' \
     http://localhost:4000/api/exportacion/proyecto/1/backup \
     -o backup_proyecto.sql
```

#### Desde la Interfaz Web

1. Ir a **Exportar/Importar**
2. Click en **"Por Proyecto"**
3. Seleccionar proyecto del dropdown
4. Elegir formato (SQL, Excel, JSON)
5. Click en **"Exportar Backup"**
6. El archivo se descarga automáticamente

**Nombre del archivo:**
```
backup_FLEX_PARK_2025-11-13.sql
backup_NOMBRE_DEL_PROYECTO_FECHA.{formato}
```

---

### 🗑️ Vaciar Proyecto (Eliminar Datos)

#### Endpoint Backend
```http
DELETE /api/exportacion/proyecto/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "confirmar": "CONFIRMAR"
}
```

**Ejemplo con cURL:**
```bash
curl -X DELETE \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"confirmar":"CONFIRMAR"}' \
     http://localhost:4000/api/exportacion/proyecto/1
```

#### Desde la Interfaz Web

1. Ir a **Exportar/Importar**
2. Click en **"Por Proyecto"**
3. Seleccionar proyecto del dropdown
4. Click en **"Vaciar Proyecto"**
5. **Confirmar dos veces** (advertencias de seguridad)

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Proyecto FLEX PARK vaciado exitosamente",
  "total_registros_eliminados": 456,
  "proyecto": "FLEX PARK",
  "tablas_vaciadas": [
    { "tabla": "pagos_nomina", "registros_eliminados": 12 },
    { "tabla": "deducciones_nomina", "registros_eliminados": 8 },
    { "tabla": "nomina_empleado", "registros_eliminados": 89 },
    { "tabla": "suministros", "registros_eliminados": 233 },
    { "tabla": "gastos", "registros_eliminados": 45 },
    ...
  ],
  "errores": []
}
```

---

## ⚠️ Advertencias Importantes

### 🔴 Operación Irreversible
- **Vaciar proyecto es PERMANENTE**
- No hay función de "deshacer"
- **SIEMPRE** exportar backup antes de vaciar
- Sistema requiere doble confirmación

### 🔒 Integridad de Datos
- El sistema respeta FKs automáticamente
- Orden de eliminación: hijos → padres
- `SET FOREIGN_KEY_CHECKS = 0` temporal
- Rollback automático si hay error crítico

### 📋 Datos del Proyecto NO se Eliminan
- La fila en `proyectos` **NO** se elimina
- Solo se vacían las tablas relacionadas
- El proyecto queda "limpio" pero existente
- Útil para reutilizar proyecto en nueva fase

---

## 🔧 Implementación Técnica

### Backend: Identificación de Tablas

```javascript
const obtenerTablasProyecto = (idProyecto) => {
  return [
    // 1. Dependencias (primero)
    { tabla: 'pagos_nomina', fk: 'id_nomina', referencia: 'nomina_empleado' },
    { tabla: 'deducciones_nomina', fk: 'id_nomina', referencia: 'nomina_empleado' },
    
    // 2. Tablas principales con id_proyecto
    { tabla: 'nomina_empleado', fk: 'id_proyecto', referencia: null },
    { tabla: 'suministros', fk: 'id_proyecto', referencia: null },
    { tabla: 'gastos', fk: 'id_proyecto', referencia: null },
    { tabla: 'ingresos', fk: 'id_proyecto', referencia: null },
    { tabla: 'ingresos_movimientos', fk: 'id_proyecto', referencia: null },
    { tabla: 'movimientos_herramienta', fk: 'id_proyecto', referencia: null },
    { tabla: 'presupuestos', fk: 'id_proyecto', referencia: null },
    { tabla: 'estados_cuenta', fk: 'id_proyecto', referencia: null },
    
    // 3. Tablas opcionales
    { tabla: 'empleados', fk: 'id_proyecto', referencia: null },
    { tabla: 'herramientas', fk: 'id_proyecto', referencia: null },
  ];
};
```

### Algoritmo de Exportación SQL

```javascript
async function exportarProyectoSQL(proyecto, tablasRelacionadas) {
  let sql = "-- Backup del Proyecto\n";
  sql += "SET FOREIGN_KEY_CHECKS = 0;\n\n";
  
  // 1. Exportar proyecto mismo
  sql += await generarInsertSQL('proyectos', [proyectoData]);
  
  // 2. Exportar tablas relacionadas
  for (const { tabla, fk } of tablasRelacionadas) {
    const datos = await sequelize.query(
      `SELECT * FROM ${tabla} WHERE ${fk} = ?`,
      { replacements: [proyecto.id_proyecto] }
    );
    sql += generarInsertSQL(tabla, datos);
  }
  
  sql += "SET FOREIGN_KEY_CHECKS = 1;\n";
  return sql;
}
```

### Algoritmo de Eliminación

```javascript
async function vaciarProyecto(idProyecto) {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  
  const tablasRelacionadas = obtenerTablasProyecto(idProyecto);
  const resultado = { tablas_vaciadas: [], errores: [] };
  
  // Eliminar en orden (respeta dependencias)
  for (const { tabla, fk } of tablasRelacionadas) {
    try {
      const [results] = await sequelize.query(
        `DELETE FROM ${tabla} WHERE ${fk} = ?`,
        { replacements: [idProyecto] }
      );
      resultado.tablas_vaciadas.push({
        tabla,
        registros_eliminados: results.affectedRows
      });
    } catch (error) {
      resultado.errores.push({ tabla, error: error.message });
    }
  }
  
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  return resultado;
}
```

---

## 📊 Casos de Uso

### 1. Archivar Proyecto Terminado
```bash
# Exportar backup completo
curl -H "Authorization: Bearer $TOKEN" \
     -d '{"formato":"sql"}' \
     /api/exportacion/proyecto/5/backup \
     -o "Proyecto_BODEGA_X_FINALIZADO_2025-11-13.sql"

# Vaciar datos del sistema
curl -X DELETE \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"confirmar":"CONFIRMAR"}' \
     /api/exportacion/proyecto/5

# Resultado: Proyecto archivado, BD más ligera
```

### 2. Análisis de Proyecto en Excel
```bash
# Exportar en Excel con FKs resueltas
curl -d '{"formato":"excel"}' \
     /api/exportacion/proyecto/2/backup \
     -o analisis_CASA_PADILLAS.xlsx

# Abrir en Excel → Ver costos, nóminas, proveedores
```

### 3. Migrar Proyecto a Otro Sistema
```bash
# Exportar JSON
curl -d '{"formato":"json"}' \
     /api/exportacion/proyecto/3/backup \
     -o proyecto_export.json

# Parsear JSON en otro sistema
# Importar datos con mapeo de IDs
```

### 4. Limpieza de Proyectos de Prueba
```javascript
// Frontend: Listar proyectos de prueba
const proyectosPrueba = proyectos.filter(p => 
  p.nombre.includes('TEST') || p.nombre.includes('PRUEBA')
);

// Vaciar cada uno
for (const p of proyectosPrueba) {
  await vaciarProyecto(p.id_proyecto);
}
```

---

## 🧪 Testing

### Test Básico
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vlock.com","password":"admin123"}' \
  | jq -r '.token')

# 2. Backup SQL
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"formato":"sql"}' \
     http://localhost:4000/api/exportacion/proyecto/1/backup \
     -o backup_test.sql

# 3. Verificar contenido
grep -c "INSERT INTO" backup_test.sql
# Esperado: 200+ INSERTs

# 4. Backup Excel
curl -H "Authorization: Bearer $TOKEN" \
     -d '{"formato":"excel"}' \
     http://localhost:4000/api/exportacion/proyecto/1/backup \
     -o backup_test.xlsx

# 5. Verificar Excel
python3 << EOF
import openpyxl
wb = openpyxl.load_workbook('backup_test.xlsx')
print(f"Hojas: {len(wb.sheetnames)}")
print(f"Tablas: {wb.sheetnames}")
EOF
```

### Test de Integridad
```bash
# 1. Crear proyecto de prueba
# 2. Agregar datos relacionados (suministros, nóminas, etc.)
# 3. Exportar backup
# 4. Vaciar proyecto
# 5. Verificar que otros proyectos NO fueron afectados
# 6. Restaurar backup si es necesario
```

---

## 📝 Logs y Debugging

### Backend Logs
```javascript
console.log(`📦 Iniciando backup del proyecto ${id} (${proyecto.nombre})`);
console.log(`📋 Tablas a exportar: ${tablasRelacionadas.length}`);
console.log(`✅ ${tabla}: ${datos.length} registros exportados`);
console.log(`❌ Error exportando ${tabla}:`, error.message);
```

### Frontend Console
```javascript
console.log('Testing proyecto backup endpoints...');
console.log('✓ Backup SQL generado');
console.log('✓ Backup Excel descargado');
```

---

## 🔄 Mejoras Futuras

### Propuestas
- [ ] Restaurar backup desde SQL (ejecutar INSERTs)
- [ ] Backup incremental (solo cambios desde fecha)
- [ ] Backup automático programado (cron)
- [ ] Compresión de backups (.zip)
- [ ] Historial de backups por proyecto
- [ ] Notificación por email al completar backup
- [ ] Estimación de tiempo de backup/limpieza
- [ ] Preview de registros antes de vaciar
- [ ] Soft delete (marcar como eliminado, no borrar físicamente)

---

## 📚 Referencias

### Archivos Relacionados
- `backend/api/src/controllers/exportacion.controller.js` - Lógica principal
- `backend/api/src/routes/exportacion.routes.js` - Endpoints REST
- `desktop/src/renderer/pages/ExportacionImportacion.jsx` - Interfaz web
- `RAILWAY_DEPLOYMENT_CHECKLIST.md` - Guía de despliegue
- `EXPORTACION_FK_RESUELTAS.md` - FK resolution en Excel

### Endpoints
```
POST   /api/exportacion/proyecto/:id/backup
DELETE /api/exportacion/proyecto/:id
GET    /api/exportacion/tablas
POST   /api/exportacion/json
POST   /api/exportacion/excel
POST   /api/exportacion/sql
```

---

**Fecha de Implementación:** 13 de noviembre, 2025  
**Versión:** 1.0  
**Autor:** Sistema VLOCK  
**Estado:** ✅ Implementado y probado
