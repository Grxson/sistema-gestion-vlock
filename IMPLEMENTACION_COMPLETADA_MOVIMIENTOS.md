# ✅ Sistema de Movimientos - IMPLEMENTACIÓN COMPLETADA

**Fecha:** 6 de Noviembre de 2025  
**Estado:** ✅ **LISTO PARA PROBAR**

---

## 🎉 Lo que acabamos de implementar

### ✅ 1. Frontend - Datos Mock Eliminados
- ❌ Eliminados los 5 movimientos de prueba hardcodeados
- ✅ Hook actualizado para consumir API real
- ✅ Manejo de errores con datos vacíos en caso de fallo

### ✅ 2. Backend - API Completa
**Controlador:** `backend/api/src/controllers/ingresosMovimientosController.js`
- ✅ `listarMovimientos` - Listar con filtros (fecha, proyecto, tipo, fuente)
- ✅ `obtenerResumenPorIngreso` - Resumen por ingreso específico
- ✅ `crearMovimiento` - Crear movimiento manual

**Rutas:** `backend/api/src/routes/ingresosMovimientos.routes.js`
- ✅ `GET /api/movimientos-ingresos` - Listar todos los movimientos
- ✅ `GET /api/ingresos/:id/resumen` - Resumen por ingreso
- ✅ `POST /api/movimientos-ingresos` - Crear movimiento manual

**Registro en app.js:**
- ✅ Rutas montadas en `/api/movimientos-ingresos`

### ✅ 3. Integración Automática - Nómina
**Archivo:** `backend/api/src/controllers/nomina.controller.js`

**¿Cuándo se registra?**
- ✅ Automáticamente cuando se **paga una nómina** (estado = 'Pagado')

**¿Qué se registra?**
```javascript
{
  tipo: 'gasto',
  fuente: 'nomina',
  ref_tipo: 'nomina',
  ref_id: nomina.id_nomina,
  monto: nomina.monto_total,
  descripcion: "Pago nómina - [Nombre Empleado] - Semana [X]"
}
```

**Características:**
- ✅ Busca automáticamente el último ingreso del proyecto
- ✅ Incluye nombre del empleado y semana en la descripción
- ✅ Si falla, no interrumpe el pago de nómina (manejo de errores)
- ✅ Log en consola cuando se registra exitosamente

### ✅ 4. Integración Automática - Suministros
**Archivo:** `backend/api/src/controllers/suministros.controller.js`

**¿Cuándo se registra?**
- ✅ Automáticamente cuando se **crea un suministro** con costo

**¿Qué se registra?**
```javascript
{
  tipo: 'gasto',
  fuente: 'suministro',
  ref_tipo: 'suministro',
  ref_id: suministro.id_suministro,
  monto: suministro.costo_total,
  descripcion: "Suministro - [Nombre] - [Proveedor]"
}
```

**Características:**
- ✅ Solo registra si el suministro tiene `costo_total > 0`
- ✅ Busca automáticamente el último ingreso del proyecto
- ✅ Incluye nombre del suministro y proveedor
- ✅ Si falla, no interrumpe la creación del suministro
- ✅ Log en consola cuando se registra exitosamente

---

## 🔍 Cómo Funciona el Sistema

### Flujo de Trabajo

```
1. CREAR INGRESO
   └─> Se crea en tabla `ingresos`
   └─> Opcionalmente, crear movimiento inicial de tipo "ingreso"

2. PAGAR NÓMINA
   └─> Se marca nómina como "Pagado"
   └─> 🔥 AUTOMÁTICAMENTE se crea movimiento de tipo "gasto" fuente "nomina"
   └─> Se vincula con ref_tipo='nomina' y ref_id=id_nomina

3. CREAR SUMINISTRO
   └─> Se crea suministro con costo_total
   └─> 🔥 AUTOMÁTICAMENTE se crea movimiento de tipo "gasto" fuente "suministro"
   └─> Se vincula con ref_tipo='suministro' y ref_id=id_suministro

4. VER MOVIMIENTOS
   └─> Ir a Ingresos → Tab "Movimientos"
   └─> Filtrar por fecha, proyecto, tipo, fuente
   └─> Ver cards de resumen (Inicial, Gastos, Ajustes, Saldo)
   └─> Ver tabla con todos los movimientos
```

### Estructura de Datos

**Tabla: ingresos_movimientos**
```
id_movimiento     AUTO_INCREMENT
id_ingreso        FK → ingresos
id_proyecto       FK → proyectos
tipo              'ingreso' | 'gasto' | 'ajuste'
fuente            'nomina' | 'suministro' | 'manual' | 'otros'
ref_tipo          'nomina' | 'suministro' | null
ref_id            id externo (id_nomina | id_suministro)
fecha             DATE
monto             DECIMAL(12,2)
descripcion       TEXT
saldo_after       DECIMAL(12,2)
createdAt         TIMESTAMP
updatedAt         TIMESTAMP
```

---

## 🚀 Cómo Probar Ahora

### Paso 1: Reiniciar el Backend

```bash
cd backend/api/src
npm start
```

**Verifica en la consola:**
```
Modelo registrado: Ingresos_movimientos
✅ Base de datos conectada
```

### Paso 2: Iniciar el Frontend

```bash
cd desktop
npm run dev:vite
```

### Paso 3: Navegar a Movimientos

1. Abrir `http://localhost:3000`
2. Ir a **Ingresos**
3. Hacer clic en el tab **"Movimientos"**
4. Deberías ver:
   - ✅ Filtros funcionales
   - ✅ Cards de resumen (todos en $0 si no hay datos)
   - ✅ Tabla vacía con mensaje "Sin movimientos"

### Paso 4: Crear un Ingreso (Prueba Manual)

**Opción A: Desde el Frontend**
1. En la página de Ingresos, crear un nuevo ingreso
2. Asignar a un proyecto
3. Guardar

**Opción B: Desde SQL (más rápido)**
```sql
-- Insertar ingreso de prueba
INSERT INTO ingresos (id_proyecto, fecha, monto, descripcion, fuente, createdAt, updatedAt)
VALUES (1, '2025-01-01', 100000, 'Ingreso inicial de prueba', 'Manual', NOW(), NOW());

-- Obtener el ID
SELECT LAST_INSERT_ID();
```

### Paso 5: Pagar una Nómina

1. Ir a **Nóminas**
2. Crear o seleccionar una nómina pendiente del **mismo proyecto** del ingreso
3. Hacer clic en **"Registrar Pago"**
4. Completar el formulario de pago
5. Confirmar

**Resultado esperado:**
- ✅ Nómina marcada como "Pagado"
- ✅ **Log en consola backend:** `✅ Movimiento de nómina registrado para proyecto X`
- ✅ **Nuevo movimiento en la tabla** `ingresos_movimientos`

### Paso 6: Crear un Suministro

1. Ir a **Suministros**
2. Crear un nuevo suministro del **mismo proyecto**
3. Asegurarse de poner un `costo_total > 0`
4. Guardar

**Resultado esperado:**
- ✅ Suministro creado
- ✅ **Log en consola backend:** `✅ Movimiento de suministro registrado para proyecto X`
- ✅ **Nuevo movimiento en la tabla** `ingresos_movimientos`

### Paso 7: Ver los Movimientos

1. Volver a **Ingresos → Tab Movimientos**
2. **Refrescar la página** (F5)
3. Deberías ver:
   - ✅ **Cards actualizadas:**
     - Inicial + Ingresos: $100,000
     - Gastos: [suma de nómina + suministro]
     - Saldo: [100,000 - gastos]
     - % Gastado
   - ✅ **Tabla con movimientos:**
     - Movimiento de nómina (tipo: gasto, fuente: nomina)
     - Movimiento de suministro (tipo: gasto, fuente: suministro)

### Paso 8: Probar Filtros

**Filtrar por rango de fechas:**
- Seleccionar fecha inicio y fin
- Ver que la tabla se actualiza

**Filtrar por proyecto:**
- Seleccionar un proyecto específico
- Ver solo movimientos de ese proyecto

**Filtrar por tipo:**
- Seleccionar "gasto"
- Ver solo gastos

**Filtrar por fuente:**
- Seleccionar "nomina"
- Ver solo movimientos de nómina

---

## 🔍 Verificaciones en Base de Datos

### Ver todos los movimientos
```sql
SELECT 
  m.id_movimiento,
  m.tipo,
  m.fuente,
  m.fecha,
  m.monto,
  m.descripcion,
  m.ref_tipo,
  m.ref_id,
  p.nombre as proyecto
FROM ingresos_movimientos m
LEFT JOIN proyectos p ON m.id_proyecto = p.id_proyecto
ORDER BY m.fecha DESC, m.id_movimiento DESC;
```

### Ver movimientos con nóminas
```sql
SELECT 
  m.*,
  n.monto_total as monto_nomina,
  e.nombre as empleado,
  s.numero_semana
FROM ingresos_movimientos m
INNER JOIN nomina_empleados n ON m.ref_tipo = 'nomina' AND m.ref_id = n.id_nomina
INNER JOIN empleados e ON n.id_empleado = e.id_empleado
INNER JOIN semanas_nomina s ON n.id_semana = s.id_semana
WHERE m.fuente = 'nomina';
```

### Ver movimientos con suministros
```sql
SELECT 
  m.*,
  s.nombre as nombre_suministro,
  s.costo_total,
  pr.nombre as proveedor
FROM ingresos_movimientos m
INNER JOIN suministros s ON m.ref_tipo = 'suministro' AND m.ref_id = s.id_suministro
LEFT JOIN proveedores pr ON s.id_proveedor = pr.id_proveedor
WHERE m.fuente = 'suministro';
```

### Calcular resumen por proyecto
```sql
SELECT 
  p.nombre as proyecto,
  COUNT(*) as total_movimientos,
  SUM(CASE WHEN m.tipo = 'ingreso' THEN m.monto ELSE 0 END) as total_ingresos,
  SUM(CASE WHEN m.tipo = 'gasto' THEN m.monto ELSE 0 END) as total_gastos,
  SUM(CASE WHEN m.tipo = 'ajuste' THEN m.monto ELSE 0 END) as total_ajustes,
  (
    SUM(CASE WHEN m.tipo = 'ingreso' THEN m.monto ELSE 0 END) -
    SUM(CASE WHEN m.tipo = 'gasto' THEN m.monto ELSE 0 END) +
    SUM(CASE WHEN m.tipo = 'ajuste' THEN m.monto ELSE 0 END)
  ) as saldo
FROM ingresos_movimientos m
LEFT JOIN proyectos p ON m.id_proyecto = p.id_proyecto
GROUP BY m.id_proyecto, p.nombre;
```

---

## 🐛 Troubleshooting

### El tab de Movimientos está vacío
**Solución:**
1. Verificar que el backend esté corriendo
2. Abrir DevTools → Console → buscar errores de red
3. Verificar que la tabla `ingresos_movimientos` existe
4. Verificar que hay datos en la tabla con la query SQL arriba

### No se crea movimiento al pagar nómina
**Verificar:**
1. La nómina tiene `id_proyecto` asignado
2. Existe un ingreso para ese proyecto
3. Revisar logs del backend para ver errores
4. Verificar que el modelo `ingresos_movimientos` se cargó correctamente

### No se crea movimiento al crear suministro
**Verificar:**
1. El suministro tiene `id_proyecto` asignado
2. El suministro tiene `costo_total > 0`
3. Existe un ingreso para ese proyecto
4. Revisar logs del backend

### Error "Cannot read property 'obtenerResumen' of undefined"
**Solución:**
```bash
# Reiniciar el backend para que cargue el nuevo modelo
cd backend/api/src
npm start
```

---

## 📊 Resumen de Archivos Modificados/Creados

### Backend
```
✅ CREADO: controllers/ingresosMovimientosController.js (170 líneas)
✅ CREADO: routes/ingresosMovimientos.routes.js (12 líneas)
✅ EDITADO: app.js (+4 líneas - registro de rutas)
✅ EDITADO: controllers/nomina.controller.js (+40 líneas - integración)
✅ EDITADO: controllers/suministros.controller.js (+42 líneas - integración)
```

### Frontend
```
✅ EDITADO: hooks/ingresos/useIngresosMovimientosData.js
  - Eliminados datos mock (20 líneas)
  - Agregada llamada a API real (+25 líneas)
```

### Base de Datos
```
✅ Tabla ingresos_movimientos (creada anteriormente)
✅ 5 índices optimizados
✅ 2 foreign keys (ingresos, proyectos)
```

---

## ✅ Checklist Final

- [x] Base de datos creada y verificada
- [x] Modelo Sequelize funcional
- [x] Controlador backend con 3 endpoints
- [x] Rutas API registradas
- [x] Frontend conectado a API real
- [x] Datos mock eliminados
- [x] Integración con nómina implementada
- [x] Integración con suministros implementada
- [x] Manejo de errores en integraciones
- [x] Logs informativos en backend
- [ ] Pruebas end-to-end (siguiente paso)

---

## 🎯 Siguiente: Probar el Sistema Completo

### Escenario de Prueba Completo

1. **Crear proyecto** (si no existe)
2. **Crear ingreso** de $100,000 para ese proyecto
3. **Crear y pagar 2 nóminas** de $15,000 cada una
4. **Crear 2 suministros** de $5,000 cada uno
5. **Ir a Ingresos → Movimientos**
6. **Verificar:**
   - Total Ingresos: $100,000
   - Total Gastos: $40,000 (30k nóminas + 10k suministros)
   - Saldo: $60,000
   - % Gastado: 40%
   - 5 movimientos en la tabla (1 ingreso + 2 nóminas + 2 suministros)

---

**Estado:** ✅ **IMPLEMENTACIÓN COMPLETA - LISTO PARA PROBAR**  
**Próximo paso:** Reiniciar el backend y ejecutar pruebas end-to-end
