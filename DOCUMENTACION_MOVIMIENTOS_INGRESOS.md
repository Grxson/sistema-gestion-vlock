# 📊 Sistema de Movimientos de Ingresos

## Descripción General

El sistema de movimientos de ingresos permite rastrear el flujo completo de recursos financieros, registrando:
- **Ingresos iniciales** y adicionales
- **Gastos** (nómina, suministros, otros)
- **Ajustes** (correcciones, devoluciones)

Cada movimiento mantiene referencia a su origen (nómina, suministro) y actualiza el saldo disponible.

---

## 🗄️ Estructura de la Tabla

### Tabla: `ingresos_movimientos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_movimiento` | INT (PK) | ID único del movimiento |
| `id_ingreso` | INT (FK) | ID del ingreso asociado |
| `id_proyecto` | INT (FK) | ID del proyecto (opcional) |
| `tipo` | ENUM | Tipo: 'ingreso', 'gasto', 'ajuste' |
| `fuente` | ENUM | Fuente: 'nomina', 'suministro', 'manual', 'otros' |
| `ref_tipo` | VARCHAR(50) | Tipo de referencia polimórfica |
| `ref_id` | INT | ID de la referencia externa |
| `fecha` | DATE | Fecha del movimiento |
| `monto` | DECIMAL(12,2) | Monto del movimiento |
| `descripcion` | TEXT | Descripción detallada |
| `saldo_after` | DECIMAL(12,2) | Saldo después del movimiento |
| `createdAt` | TIMESTAMP | Fecha de creación |
| `updatedAt` | TIMESTAMP | Fecha de actualización |

### Relaciones

- **`ingresos_movimientos` → `ingresos`**: Muchos a Uno (ON DELETE RESTRICT)
- **`ingresos_movimientos` → `proyectos`**: Muchos a Uno (ON DELETE SET NULL)
- **Referencias polimórficas**: `ref_tipo` + `ref_id` apuntan a `nomina_empleados` o `suministros`

---

## 📋 Instalación

### Opción 1: Script de Migración Node.js (Recomendado)

Este script verifica la existencia de la tabla antes de crearla y maneja errores automáticamente.

```bash
# Desde la raíz del proyecto
cd backend/api/src/migrations

# Ejecutar migración
node 20250106_create_ingresos_movimientos.js
```

**Salida esperada:**
```
📦 Cargando configuración de base de datos...
🔌 Conectando a la base de datos...
✅ Conexión establecida correctamente
🔄 Iniciando migración: crear tabla ingresos_movimientos
✅ Tabla ingresos_movimientos creada exitosamente
🔄 Creando índices...
✅ Índices creados exitosamente
✅ Migración completada con éxito

═══════════════════════════════════════════════
✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
═══════════════════════════════════════════════
```

### Opción 2: Script SQL Directo

Si prefieres ejecutar SQL directamente en MySQL:

```bash
# Asegúrate de estar en el directorio correcto
cd backend/api

# Ejecutar script SQL
mysql -u root -p sistema_gestion < crear_tabla_movimientos.sql
```

O desde MySQL Workbench/phpMyAdmin: abrir y ejecutar `crear_tabla_movimientos.sql`

---

## 🔄 Verificar la Instalación

### Verificar tabla creada

```sql
USE sistema_gestion;
DESCRIBE ingresos_movimientos;
```

### Verificar claves foráneas

```sql
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'ingresos_movimientos' 
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### Verificar índices

```sql
SHOW INDEXES FROM ingresos_movimientos;
```

---

## 🚀 Uso del Sistema

### 1. Crear Movimiento Inicial (Ingreso)

```javascript
// Cuando se crea un nuevo ingreso
const IngresosMovimientos = require('./models/ingresosMovimientos.model');

await IngresosMovimientos.crearMovimientoInicial({
  id_ingreso: 1,
  id_proyecto: 10,
  fecha: '2025-01-05',
  monto: 100000.00,
  descripcion: 'Ingreso inicial del contrato'
});
```

### 2. Registrar Gasto de Nómina

```javascript
// Al crear/actualizar una nómina
await IngresosMovimientos.registrarGasto({
  id_ingreso: 1,
  id_proyecto: 10,
  monto: 15000.00,
  fecha: '2025-01-10',
  descripcion: 'Pago nómina semana 1',
  ref_tipo: 'nomina',
  ref_id: 123 // id_nomina
});
```

### 3. Registrar Gasto de Suministro

```javascript
// Al crear un suministro
await IngresosMovimientos.registrarGasto({
  id_ingreso: 1,
  id_proyecto: 10,
  monto: 5000.00,
  fecha: '2025-01-12',
  descripcion: 'Compra de materiales',
  ref_tipo: 'suministro',
  ref_id: 456 // id_suministro
});
```

### 4. Crear Ajuste

```javascript
// Para correcciones o ajustes
await IngresosMovimientos.create({
  id_ingreso: 1,
  id_proyecto: 10,
  tipo: 'ajuste',
  fuente: 'manual',
  fecha: '2025-01-15',
  monto: -500.00, // Negativo para reducir saldo
  descripcion: 'Corrección de error contable'
});
```

### 5. Obtener Resumen de Movimientos

```javascript
// Obtener totales y saldo actual
const resumen = await IngresosMovimientos.obtenerResumen(1);

console.log(resumen);
// {
//   montoInicial: 100000,
//   totalIngresos: 100000,
//   totalGastos: 20000,
//   totalAjustes: -500,
//   saldoActual: 79500,
//   cantidadMovimientos: 4
// }
```

---

## 🔌 Integración con el Backend

### Actualizar Modelo de Ingreso

El modelo `ingreso.model.js` ya está actualizado con la relación:

```javascript
Ingreso.hasMany(models.ingresos_movimientos, { 
  foreignKey: 'id_ingreso', 
  as: 'movimientos' 
});
```

### Consultar Ingreso con Movimientos

```javascript
const ingreso = await Ingreso.findByPk(1, {
  include: [
    {
      model: IngresosMovimientos,
      as: 'movimientos',
      order: [['fecha', 'ASC']]
    }
  ]
});
```

---

## 📊 Consultas SQL Útiles

### Ver todos los movimientos de un ingreso

```sql
SELECT 
  id_movimiento,
  tipo,
  fuente,
  fecha,
  FORMAT(monto, 2) as monto,
  saldo_after,
  descripcion
FROM ingresos_movimientos
WHERE id_ingreso = 1
ORDER BY fecha ASC, id_movimiento ASC;
```

### Calcular resumen por ingreso

```sql
SELECT 
  id_ingreso,
  SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
  SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as total_gastos,
  SUM(CASE WHEN tipo = 'ajuste' THEN monto ELSE 0 END) as total_ajustes,
  (
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) -
    SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) +
    SUM(CASE WHEN tipo = 'ajuste' THEN monto ELSE 0 END)
  ) as saldo_actual
FROM ingresos_movimientos
WHERE id_ingreso = 1
GROUP BY id_ingreso;
```

### Movimientos por tipo y fuente

```sql
SELECT 
  tipo,
  fuente,
  COUNT(*) as cantidad,
  FORMAT(SUM(monto), 2) as total
FROM ingresos_movimientos
GROUP BY tipo, fuente
ORDER BY tipo, total DESC;
```

---

## 🎯 Próximos Pasos

### 1. Crear Controladores y Rutas

Archivo: `backend/api/src/controllers/ingresosMovimientosController.js`

```javascript
const models = require('../models');
const { IngresosMovimientos } = models;

// GET /api/ingresos/:id/movimientos
async function listarMovimientos(req, res) {
  try {
    const { id } = req.params;
    const { drStart, drEnd, tipo, fuente } = req.query;
    
    const where = { id_ingreso: id };
    
    if (drStart) where.fecha = { [Op.gte]: drStart };
    if (drEnd) where.fecha = { ...where.fecha, [Op.lte]: drEnd };
    if (tipo) where.tipo = tipo;
    if (fuente) where.fuente = fuente;
    
    const movimientos = await IngresosMovimientos.findAll({
      where,
      include: [
        { model: models.Proyectos, as: 'proyecto' }
      ],
      order: [['fecha', 'DESC'], ['id_movimiento', 'DESC']]
    });
    
    res.json({ success: true, data: movimientos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/ingresos/:id/movimientos/resumen
async function obtenerResumen(req, res) {
  try {
    const { id } = req.params;
    const resumen = await IngresosMovimientos.obtenerResumen(id);
    res.json({ success: true, data: resumen });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  listarMovimientos,
  obtenerResumen
};
```

### 2. Actualizar Servicio Frontend

Archivo: `desktop/src/renderer/services/ingresos/movimientosService.js`

```javascript
import api from '../api';

const movimientosService = {
  // Listar movimientos con filtros
  async list(idIngreso, params = {}) {
    const { data } = await api.get(`/ingresos/${idIngreso}/movimientos`, { params });
    return data;
  },
  
  // Obtener resumen
  async resumen(idIngreso) {
    const { data } = await api.get(`/ingresos/${idIngreso}/movimientos/resumen`);
    return data;
  }
};

export default movimientosService;
```

### 3. Actualizar Hook Frontend

Reemplazar el mock en `useIngresosMovimientosData.js`:

```javascript
import movimientosService from '../../services/ingresos/movimientosService';

async function fetchMovimientos(idIngreso, params) {
  const response = await movimientosService.list(idIngreso, params);
  const resumen = await movimientosService.resumen(idIngreso);
  
  return {
    rows: response.data || [],
    resumen: resumen.data || {}
  };
}
```

### 4. Integrar con Creación de Nómina/Suministros

En el controlador de nómina, después de crear/actualizar:

```javascript
// Al pagar una nómina
if (nomina.estado === 'Pagado') {
  await IngresosMovimientos.registrarGasto({
    id_ingreso: proyecto.id_ingreso_activo,
    id_proyecto: nomina.id_proyecto,
    monto: nomina.monto_total,
    fecha: nomina.fecha_pago,
    descripcion: `Pago nómina - ${empleado.nombre}`,
    ref_tipo: 'nomina',
    ref_id: nomina.id_nomina
  });
}
```

---

## 🐛 Troubleshooting

### Error: Table doesn't exist

```bash
# Reintentar migración
node backend/api/src/migrations/20250106_create_ingresos_movimientos.js
```

### Error: Foreign key constraint fails

Verificar que las tablas `ingresos` y `proyectos` existen:

```sql
SHOW TABLES LIKE 'ingresos';
SHOW TABLES LIKE 'proyectos';
```

### Error: Model not loaded

Reiniciar el servidor backend:

```bash
cd backend/api/src
npm start
```

---

## ✅ Checklist de Implementación

- [x] Script de migración creado
- [x] Script SQL alternativo creado
- [x] Modelo Sequelize creado
- [x] Relaciones actualizadas en modelo Ingreso
- [x] Métodos de instancia y estáticos añadidos
- [ ] Controladores y rutas del backend
- [ ] Servicio frontend para API
- [ ] Actualizar hook con servicio real
- [ ] Integrar registro automático en nómina
- [ ] Integrar registro automático en suministros
- [ ] Tests unitarios
- [ ] Documentación de API

---

## 📝 Notas Importantes

1. **ON DELETE RESTRICT**: Los movimientos no se pueden eliminar si el ingreso se elimina (integridad referencial)
2. **Referencias polimórficas**: Usar `ref_tipo` + `ref_id` para vincular con nóminas/suministros
3. **Saldo after**: Se calcula automáticamente usando el método `obtenerResumen()`
4. **Tipos de movimiento**:
   - `ingreso`: Suma al saldo
   - `gasto`: Resta del saldo
   - `ajuste`: Puede sumar o restar (monto con signo)

---

## 🎉 Resultado Final

Una vez implementado, tendrás:

✅ Tabla de movimientos con relaciones
✅ Rastreo completo de gastos por ingreso
✅ Cálculo automático de saldos
✅ UI con filtros avanzados (fecha, proyecto, tipo, fuente)
✅ Cards de resumen (Inicial, Gastos, Ajustes, Saldo)
✅ Tabla de movimientos con badges de tipo
✅ Referencias a nóminas y suministros específicos
