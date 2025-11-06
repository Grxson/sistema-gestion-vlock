# 🚀 GUÍA RÁPIDA: Crear Tabla de Movimientos

## ✅ ¿Qué se ha creado?

1. **Script de migración Node.js** - Crea la tabla automáticamente
2. **Script SQL directo** - Para ejecutar en MySQL/phpMyAdmin
3. **Modelo Sequelize** - Con métodos y relaciones completas
4. **Componentes Frontend** - Tab de movimientos con filtros y tabla
5. **Script de instalación automática** - Ejecuta todo con un comando
6. **Documentación completa** - Guía de uso e integración

---

## 🎯 OPCIÓN 1: Instalación Automática (RECOMENDADO)

### Un solo comando ejecuta todo:

```bash
cd /home/grxson/Documentos/Github/sistema-gestion-vlock
./instalar_movimientos.sh
```

**Esto hace:**
- ✅ Verifica el entorno
- ✅ Ejecuta la migración
- ✅ Crea la tabla con relaciones
- ✅ Verifica modelos y componentes
- ✅ Muestra resumen y próximos pasos

---

## 🎯 OPCIÓN 2: Migración Manual Node.js

### Si prefieres control total:

```bash
cd backend/api/src/migrations
node 20250106_create_ingresos_movimientos.js
```

**Ventajas:**
- Verifica si la tabla existe antes de crearla
- Maneja errores automáticamente
- Crea índices optimizados
- Compatible con Sequelize

---

## 🎯 OPCIÓN 3: Script SQL Directo

### Para MySQL Workbench, phpMyAdmin, o línea de comandos:

```bash
cd backend/api
mysql -u root -p sistema_gestion < crear_tabla_movimientos.sql
```

O abre `backend/api/crear_tabla_movimientos.sql` en tu cliente SQL favorito y ejecútalo.

**Ventajas:**
- No requiere Node.js
- Control total del SQL
- Incluye consultas de verificación
- Ejemplos de datos de prueba comentados

---

## 📋 Estructura Creada

### Tabla: `ingresos_movimientos`

```
id_movimiento (PK)          INT AUTO_INCREMENT
id_ingreso (FK)             INT → ingresos.id_ingreso
id_proyecto (FK)            INT → proyectos.id_proyecto
tipo                        ENUM('ingreso','gasto','ajuste')
fuente                      ENUM('nomina','suministro','manual','otros')
ref_tipo                    VARCHAR(50) - nomina/suministro
ref_id                      INT - id externo
fecha                       DATE
monto                       DECIMAL(12,2)
descripcion                 TEXT
saldo_after                 DECIMAL(12,2)
createdAt, updatedAt        TIMESTAMP
```

### Índices:
- `idx_movimientos_ingreso` - Consultas por ingreso
- `idx_movimientos_proyecto` - Consultas por proyecto
- `idx_movimientos_tipo_fuente` - Filtros de tipo y fuente
- `idx_movimientos_fecha` - Rangos de fecha
- `idx_movimientos_referencia` - Referencias polimórficas

---

## ✨ Lo que ya funciona en el Frontend

### Tab "Movimientos" en Ingresos
- ✅ Filtros por rango de fechas
- ✅ Filtro por proyecto
- ✅ Filtro por tipo (ingreso/gasto/ajuste)
- ✅ Filtro por fuente (nómina/suministro/manual/otros)
- ✅ Cards de resumen (Inicial, Gastos, Ajustes, Saldo, % gastado)
- ✅ Tabla de movimientos con badges de tipo
- ✅ Datos mock funcionando (listo para conectar API real)

---

## 📂 Archivos Creados

### Backend
```
backend/api/src/migrations/20250106_create_ingresos_movimientos.js
backend/api/src/models/ingresosMovimientos.model.js
backend/api/crear_tabla_movimientos.sql
```

### Frontend
```
desktop/src/renderer/components/ingresos/IngresosMovimientosFilters.jsx
desktop/src/renderer/components/ingresos/IngresosMovimientosCards.jsx
desktop/src/renderer/components/ingresos/IngresosMovimientosTable.jsx
desktop/src/renderer/hooks/ingresos/useIngresosMovimientosData.js
desktop/src/renderer/pages/Ingresos.jsx (actualizado con tab)
```

### Documentación
```
DOCUMENTACION_MOVIMIENTOS_INGRESOS.md (Guía completa)
GUIA_RAPIDA_MOVIMIENTOS.md (Este archivo)
instalar_movimientos.sh (Script de instalación)
```

---

## 🔥 Después de Ejecutar la Migración

### 1. Verificar la tabla

```sql
USE sistema_gestion;
DESCRIBE ingresos_movimientos;
SHOW INDEXES FROM ingresos_movimientos;
```

### 2. Reiniciar el servidor backend

```bash
cd backend/api/src
npm start
```

El modelo `ingresosMovimientos.model.js` se cargará automáticamente.

### 3. Probar en el frontend

El tab de Movimientos ya está visible en la página de Ingresos con datos de prueba.

---

## 🎓 Ejemplos de Uso

### Crear movimiento inicial
```javascript
await IngresosMovimientos.crearMovimientoInicial({
  id_ingreso: 1,
  id_proyecto: 10,
  fecha: '2025-01-05',
  monto: 100000,
  descripcion: 'Ingreso inicial'
});
```

### Registrar gasto de nómina
```javascript
await IngresosMovimientos.registrarGasto({
  id_ingreso: 1,
  id_proyecto: 10,
  monto: 15000,
  fecha: '2025-01-10',
  descripcion: 'Pago nómina semana 1',
  ref_tipo: 'nomina',
  ref_id: 123
});
```

### Obtener resumen
```javascript
const resumen = await IngresosMovimientos.obtenerResumen(1);
// {
//   montoInicial: 100000,
//   totalIngresos: 100000,
//   totalGastos: 15000,
//   totalAjustes: 0,
//   saldoActual: 85000
// }
```

---

## 📚 Documentación Completa

Para más detalles, consulta:

**DOCUMENTACION_MOVIMIENTOS_INGRESOS.md**

Incluye:
- Estructura completa de la tabla
- Todos los métodos del modelo
- Consultas SQL útiles
- Integración con nómina/suministros
- Ejemplos de controladores y rutas
- Troubleshooting

---

## 🐛 Troubleshooting

### Error: "Table already exists"
**Solución:** La tabla ya fue creada, puedes continuar.

### Error: "Cannot find module"
**Solución:** 
```bash
cd backend/api/src
npm install
```

### Error: "Foreign key constraint fails"
**Solución:** Verifica que existen las tablas `ingresos` y `proyectos`:
```sql
SHOW TABLES LIKE 'ingresos';
SHOW TABLES LIKE 'proyectos';
```

### Frontend muestra "Sin movimientos"
**Solución:** Es normal, los datos son mock. Cuando conectes el API real, verás movimientos reales.

---

## ✅ Checklist de Implementación

- [x] Scripts de migración creados
- [x] Modelo Sequelize creado
- [x] Relaciones configuradas
- [x] Componentes frontend creados
- [x] Tab de movimientos añadido
- [x] Filtros implementados
- [x] Cards de resumen implementadas
- [x] Tabla de movimientos implementada
- [x] Mock data funcionando
- [ ] Controladores backend (siguiente paso)
- [ ] Rutas API (siguiente paso)
- [ ] Servicio frontend real (siguiente paso)
- [ ] Integración con nómina (siguiente paso)
- [ ] Integración con suministros (siguiente paso)

---

## 🎉 ¡Listo para Usar!

Ejecuta cualquiera de las 3 opciones de instalación y la tabla estará lista.

**Recomendación:** Usa la Opción 1 (script automático) para la experiencia más rápida.

```bash
./instalar_movimientos.sh
```

---

**Última actualización:** 2025-01-06
**Versión:** 1.0.0
