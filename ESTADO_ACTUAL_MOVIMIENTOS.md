# ✅ Sistema de Movimientos - Estado Actual

**Fecha:** 6 de Noviembre de 2025  
**Estado:** ✅ INSTALACIÓN COMPLETADA

---

## 🎉 Lo que se ha completado

### ✅ 1. Base de Datos
- **Tabla `ingresos_movimientos` creada** exitosamente en Railway
- **Todos los índices** creados correctamente:
  - `idx_movimientos_ingreso`
  - `idx_movimientos_proyecto`
  - `idx_movimientos_tipo_fuente`
  - `idx_movimientos_fecha`
  - `idx_movimientos_referencia`
- **Relaciones configuradas**:
  - FK a `ingresos` (ON DELETE RESTRICT)
  - FK a `proyectos` (ON DELETE SET NULL)

### ✅ 2. Backend
- **Modelo Sequelize** (`ingresosMovimientos.model.js`) creado con:
  - Métodos de instancia: `calcularImpacto()`, `obtenerReferencia()`
  - Métodos estáticos: `obtenerResumen()`, `crearMovimientoInicial()`, `registrarGasto()`
- **Relación en modelo Ingreso** actualizada:
  ```javascript
  Ingreso.hasMany(models.ingresos_movimientos, { 
    foreignKey: 'id_ingreso', 
    as: 'movimientos' 
  });
  ```

### ✅ 3. Frontend
- **Nuevo Tab "Movimientos"** en la página de Ingresos
- **4 Componentes nuevos** creados:
  1. `IngresosMovimientosFilters.jsx` - Filtros avanzados
  2. `IngresosMovimientosCards.jsx` - Cards de resumen
  3. `IngresosMovimientosTable.jsx` - Tabla de movimientos
  4. `useIngresosMovimientosData.js` - Hook con datos mock

### ✅ 4. Características del Frontend

#### Filtros Implementados:
- ✅ **Rango de fechas** (inicio y fin)
- ✅ **Proyecto** (dropdown con todos los proyectos)
- ✅ **Tipo** (ingreso, gasto, ajuste)
- ✅ **Fuente** (nómina, suministro, manual, otros)

#### Cards de Resumen:
1. **Inicial + Ingresos** - Monto inicial más ingresos adicionales
2. **Gastos** - Total de gastos (nómina + suministros + otros)
3. **Ajustes** - Correcciones o ajustes
4. **Saldo** - Saldo disponible con % gastado

#### Tabla de Movimientos:
- Fecha del movimiento
- Proyecto asociado
- Tipo (con badge de color)
- Fuente
- Monto formateado
- Descripción

---

## 🔍 Para Probar Ahora Mismo

### 1. Verificar la tabla en la base de datos

Puedes ejecutar estos comandos SQL en Railway o tu cliente MySQL:

```sql
-- Ver estructura de la tabla
DESCRIBE ingresos_movimientos;

-- Ver índices
SHOW INDEXES FROM ingresos_movimientos;

-- Contar registros (debería ser 0)
SELECT COUNT(*) FROM ingresos_movimientos;
```

### 2. Ver el frontend en funcionamiento

1. **Iniciar el servidor de desarrollo:**
   ```bash
   cd desktop
   npm run dev:vite
   ```

2. **Navegar a:** `http://localhost:3000/ingresos`

3. **Hacer clic en el tab "Movimientos"**

4. **Verás:**
   - Filtros funcionales
   - 4 cards con resumen (datos mock)
   - Tabla con 5 movimientos de ejemplo
   - Nota informativa: "Datos simulados hasta integrar API real"

### 3. Datos Mock Actuales

Los datos de prueba incluyen:

```javascript
Proyecto A:
- Ingreso inicial: $50,000
- Gasto nómina: $12,000
- Gasto suministro: $3,500
- Ajuste: -$1,000

Proyecto B:
- Ingreso: $80,000

Total: 5 movimientos de ejemplo
```

---

## 🚀 Próximos Pasos (En Orden)

### 🔴 PRIORIDAD ALTA - Backend API

**1. Crear Controlador de Movimientos**

Archivo: `backend/api/src/controllers/ingresosMovimientosController.js`

```javascript
const models = require('../models');
const { Op } = require('sequelize');

// GET /api/ingresos/:id/movimientos
exports.listarMovimientos = async (req, res) => {
  try {
    const { id } = req.params;
    const { drStart, drEnd, tipo, fuente } = req.query;
    
    const where = { id_ingreso: id };
    
    if (drStart && drEnd) {
      where.fecha = { [Op.between]: [drStart, drEnd] };
    } else if (drStart) {
      where.fecha = { [Op.gte]: drStart };
    } else if (drEnd) {
      where.fecha = { [Op.lte]: drEnd };
    }
    
    if (tipo) where.tipo = tipo;
    if (fuente) where.fuente = fuente;
    
    const movimientos = await models.ingresos_movimientos.findAll({
      where,
      include: [
        { 
          model: models.Proyectos, 
          as: 'proyecto',
          attributes: ['id_proyecto', 'nombre']
        }
      ],
      order: [['fecha', 'DESC'], ['id_movimiento', 'DESC']]
    });
    
    res.json({ success: true, data: movimientos });
  } catch (error) {
    console.error('Error listando movimientos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/ingresos/:id/movimientos/resumen
exports.obtenerResumen = async (req, res) => {
  try {
    const { id } = req.params;
    const resumen = await models.ingresos_movimientos.obtenerResumen(id);
    res.json({ success: true, data: resumen });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/ingresos/:id/movimientos
exports.crearMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, fuente, monto, fecha, descripcion, ref_tipo, ref_id, id_proyecto } = req.body;
    
    const movimiento = await models.ingresos_movimientos.create({
      id_ingreso: id,
      id_proyecto,
      tipo,
      fuente,
      ref_tipo,
      ref_id,
      fecha,
      monto,
      descripcion
    });
    
    res.json({ success: true, data: movimiento });
  } catch (error) {
    console.error('Error creando movimiento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

**2. Crear Rutas**

Archivo: `backend/api/src/routes/ingresosMovimientos.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingresosMovimientosController');

// GET /api/ingresos/:id/movimientos
router.get('/:id/movimientos', controller.listarMovimientos);

// GET /api/ingresos/:id/movimientos/resumen
router.get('/:id/movimientos/resumen', controller.obtenerResumen);

// POST /api/ingresos/:id/movimientos
router.post('/:id/movimientos', controller.crearMovimiento);

module.exports = router;
```

**3. Registrar Rutas en app.js**

Agregar en `backend/api/src/app.js`:

```javascript
// Después de las rutas existentes de ingresos
const ingresosMovimientosRoutes = require('./routes/ingresosMovimientos.routes');
app.use('/api/ingresos', ingresosMovimientosRoutes);
```

### 🟡 PRIORIDAD MEDIA - Servicio Frontend

**4. Crear Servicio de Movimientos**

Archivo: `desktop/src/renderer/services/ingresos/movimientosService.js`

```javascript
import api from '../api';

const movimientosService = {
  // Listar movimientos con filtros
  async list(idIngreso, params = {}) {
    try {
      const { data } = await api.get(`/ingresos/${idIngreso}/movimientos`, { params });
      return data;
    } catch (error) {
      console.error('Error listando movimientos:', error);
      throw error;
    }
  },
  
  // Obtener resumen
  async resumen(idIngreso) {
    try {
      const { data } = await api.get(`/ingresos/${idIngreso}/movimientos/resumen`);
      return data;
    } catch (error) {
      console.error('Error obteniendo resumen:', error);
      throw error;
    }
  },
  
  // Crear movimiento manual
  async crear(idIngreso, movimiento) {
    try {
      const { data } = await api.post(`/ingresos/${idIngreso}/movimientos`, movimiento);
      return data;
    } catch (error) {
      console.error('Error creando movimiento:', error);
      throw error;
    }
  }
};

export default movimientosService;
```

**5. Actualizar Hook para usar API Real**

Modificar `desktop/src/renderer/hooks/ingresos/useIngresosMovimientosData.js`:

```javascript
import movimientosService from '../../services/ingresos/movimientosService';

// Cambiar fetchMovimientos por:
async function fetchMovimientos(idIngreso, params) {
  try {
    const response = await movimientosService.list(idIngreso, params);
    const resumenResponse = await movimientosService.resumen(idIngreso);
    
    return {
      rows: response.data || [],
      resumen: resumenResponse.data || {}
    };
  } catch (error) {
    console.error('Error fetching movimientos:', error);
    // Fallback a datos mock si falla la API
    return fetchMovimientosMock(params);
  }
}
```

### 🟢 PRIORIDAD BAJA - Integración Automática

**6. Registrar Movimientos Automáticamente**

En el controlador de **nómina** al pagar:

```javascript
// backend/api/src/controllers/nominaController.js
// Después de marcar nómina como pagada
if (nomina.estado === 'Pagado' && nomina.id_proyecto) {
  await models.ingresos_movimientos.registrarGasto({
    id_ingreso: proyecto.id_ingreso_activo, // Necesitarás definir esto
    id_proyecto: nomina.id_proyecto,
    monto: nomina.monto_total,
    fecha: nomina.fecha_pago,
    descripcion: `Pago nómina - ${empleado.nombre} - Semana ${semana.numero_semana}`,
    ref_tipo: 'nomina',
    ref_id: nomina.id_nomina
  });
}
```

En el controlador de **suministros** al crear:

```javascript
// backend/api/src/controllers/suministrosController.js
// Después de crear suministro
if (suministro.estado === 'Entregado' && suministro.id_proyecto) {
  await models.ingresos_movimientos.registrarGasto({
    id_ingreso: proyecto.id_ingreso_activo,
    id_proyecto: suministro.id_proyecto,
    monto: suministro.costo_total,
    fecha: suministro.fecha,
    descripcion: `Suministro - ${suministro.nombre}`,
    ref_tipo: 'suministro',
    ref_id: suministro.id_suministro
  });
}
```

---

## 🧪 Plan de Pruebas

### Prueba 1: Ver UI con Datos Mock ✅
**Ya funciona ahora mismo**

1. Ejecutar `npm run dev:vite` en desktop
2. Ir a Ingresos → Tab Movimientos
3. Ver filtros, cards y tabla funcionando

### Prueba 2: Conectar API Real (Siguiente)

1. Crear controlador y rutas
2. Reiniciar backend
3. Crear servicio frontend
4. Actualizar hook
5. Recargar frontend
6. Verificar que no hay datos (tabla vacía)

### Prueba 3: Insertar Datos Manualmente

```sql
-- Insertar un ingreso de prueba si no tienes
INSERT INTO ingresos (id_proyecto, fecha, monto, descripcion, fuente)
VALUES (1, '2025-01-01', 100000, 'Ingreso de prueba', 'Manual');

-- Obtener el ID del ingreso
SET @id_ingreso = LAST_INSERT_ID();

-- Crear movimiento inicial
INSERT INTO ingresos_movimientos 
  (id_ingreso, id_proyecto, tipo, fuente, fecha, monto, descripcion)
VALUES 
  (@id_ingreso, 1, 'ingreso', 'manual', '2025-01-01', 100000, 'Ingreso inicial');

-- Crear un gasto
INSERT INTO ingresos_movimientos 
  (id_ingreso, id_proyecto, tipo, fuente, fecha, monto, descripcion)
VALUES 
  (@id_ingreso, 1, 'gasto', 'nomina', '2025-01-05', 15000, 'Pago nómina semana 1');
```

### Prueba 4: Filtros en Frontend

1. Seleccionar rango de fechas
2. Filtrar por proyecto
3. Filtrar por tipo
4. Filtrar por fuente
5. Verificar que la tabla se actualiza

### Prueba 5: Integración con Nómina

1. Crear/pagar una nómina
2. Verificar que se crea automáticamente un movimiento
3. Ver el movimiento en el tab de Movimientos
4. Verificar que el saldo disminuye

---

## 📝 Resumen de Archivos Creados

```
Backend:
✅ backend/api/src/migrations/20250106_create_ingresos_movimientos.js
✅ backend/api/src/models/ingresosMovimientos.model.js
✅ backend/api/crear_tabla_movimientos.sql
⏳ backend/api/src/controllers/ingresosMovimientosController.js (pendiente)
⏳ backend/api/src/routes/ingresosMovimientos.routes.js (pendiente)

Frontend:
✅ desktop/src/renderer/components/ingresos/IngresosMovimientosFilters.jsx
✅ desktop/src/renderer/components/ingresos/IngresosMovimientosCards.jsx
✅ desktop/src/renderer/components/ingresos/IngresosMovimientosTable.jsx
✅ desktop/src/renderer/hooks/ingresos/useIngresosMovimientosData.js
✅ desktop/src/renderer/pages/Ingresos.jsx (actualizado)
⏳ desktop/src/renderer/services/ingresos/movimientosService.js (pendiente)

Documentación:
✅ DOCUMENTACION_MOVIMIENTOS_INGRESOS.md
✅ GUIA_RAPIDA_MOVIMIENTOS.md
✅ ESTADO_ACTUAL_MOVIMIENTOS.md (este archivo)
✅ instalar_movimientos.sh
```

---

## ✅ Checklist Final

- [x] Migración ejecutada exitosamente
- [x] Tabla creada en Railway
- [x] Modelo Sequelize creado
- [x] Relaciones configuradas
- [x] Componentes frontend creados
- [x] Tab de movimientos añadido
- [x] Filtros implementados
- [x] Cards de resumen implementadas
- [x] Tabla de movimientos implementada
- [x] Datos mock funcionando
- [ ] Controlador backend (siguiente)
- [ ] Rutas API (siguiente)
- [ ] Servicio frontend real (siguiente)
- [ ] Integración con nómina (después)
- [ ] Integración con suministros (después)
- [ ] Pruebas end-to-end (después)

---

## 🎯 Siguiente Acción Recomendada

**OPCIÓN 1: Ver el frontend funcionando con mock data**
```bash
cd desktop
npm run dev:vite
# Ir a http://localhost:3000/ingresos y hacer clic en "Movimientos"
```

**OPCIÓN 2: Crear el backend para datos reales**
```bash
# Crear el controlador y rutas según los ejemplos arriba
# Luego reiniciar el backend
cd backend/api/src
npm start
```

**OPCIÓN 3: Insertar datos de prueba manualmente**
```sql
-- Ejecutar los INSERT de la sección "Prueba 3" arriba
```

---

**Estado:** ✅ Todo listo para empezar a probar  
**Próximo paso:** Decidir si quieres ver el frontend con mock o crear el backend real primero
