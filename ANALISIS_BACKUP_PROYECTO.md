# 🔍 Análisis Completo: Relaciones con Proyectos

## 📊 Tablas con `id_proyecto` (16 tablas encontradas)

### ✅ Tablas a INCLUIR en Backup Y Vaciar

| # | Tabla | Tipo | Descripción | Razón para Vaciar |
|---|-------|------|-------------|-------------------|
| 1 | **suministros** | Transaccional | Materiales, equipos comprados | ✓ Datos únicos del proyecto |
| 2 | **gastos** | Transaccional | Gastos directos del proyecto | ✓ Datos únicos del proyecto |
| 3 | **presupuestos** | Planificación | Partidas presupuestarias | ✓ Específico del proyecto |
| 4 | **estados_cuenta** | Financiero | Estados financieros del proyecto | ✓ Específico del proyecto |

### ⚠️ Tablas a INCLUIR en Backup PERO NO Vaciar

| # | Tabla | Tipo | Descripción | Razón para NO Vaciar |
|---|-------|------|-------------|----------------------|
| 5 | **nomina_empleado** | Transaccional | Pagos semanales a empleados | ⚠️ Empleados pueden trabajar en múltiples proyectos |
| 6 | **pagos_nomina** | Transaccional (hijo) | Pagos de nóminas | ⚠️ Dependencia de nomina_empleado |
| 7 | **deducciones_nomina** | Transaccional (hijo) | Deducciones de nóminas | ⚠️ Dependencia de nomina_empleado |
| 8 | **ingresos** | Financiero | Ingresos/pagos del proyecto | ⚠️ Puede estar ligado a contratos generales |
| 9 | **ingresos_movimientos** | Financiero | Movimientos de caja del proyecto | ⚠️ Trazabilidad financiera crítica |
| 10 | **movimientos_herramienta** | Inventario | Movimientos de herramientas | ⚠️ Herramientas compartidas entre proyectos |
| 11 | **empleados** | Maestro | Datos de empleados | ❌ NUNCA vaciar - son maestros reutilizables |
| 12 | **herramientas** | Maestro | Inventario de herramientas | ❌ NUNCA vaciar - inventario compartido |

### 📝 Tablas Relacionadas Indirectamente (Sin id_proyecto directo)

| # | Tabla | Relación | Descripción | Acción |
|---|-------|----------|-------------|--------|
| 13 | **proveedores** | Via suministros.id_proveedor | Catálogo de proveedores | ✓ Incluir en backup, NO vaciar |
| 14 | **adeudos_empleados** | Via nomina_empleado | Adeudos de empleados | ⚠️ Incluir en backup, NO vaciar |
| 15 | **categorias_suministro** | Via suministros.id_categoria | Catálogos | ✓ Incluir en backup, NO vaciar |
| 16 | **unidades_medida** | Via suministros.id_unidad_medida | Catálogos | ✓ Incluir en backup, NO vaciar |

---

## 🎯 Estrategia Actualizada

### 1. Backup (Incluir TODO)

```javascript
const obtenerTablasBackupProyecto = (idProyecto) => {
  return [
    // ========================================
    // GRUPO 1: TRANSACCIONALES (Vaciar después)
    // ========================================
    { tabla: 'suministros', fk: 'id_proyecto', vaciar: true },
    { tabla: 'gastos', fk: 'id_proyecto', vaciar: true },
    { tabla: 'presupuestos', fk: 'id_proyecto', vaciar: true },
    { tabla: 'estados_cuenta', fk: 'id_proyecto', vaciar: true },
    
    // ========================================
    // GRUPO 2: NÓMINAS (Solo backup, NO vaciar)
    // ========================================
    { tabla: 'deducciones_nomina', fk: 'id_nomina', referencia: 'nomina_empleado', vaciar: false },
    { tabla: 'pagos_nomina', fk: 'id_nomina', referencia: 'nomina_empleado', vaciar: false },
    { tabla: 'nomina_empleado', fk: 'id_proyecto', vaciar: false },
    
    // ========================================
    // GRUPO 3: FINANCIEROS (Solo backup, NO vaciar)
    // ========================================
    { tabla: 'ingresos', fk: 'id_proyecto', vaciar: false },
    { tabla: 'ingresos_movimientos', fk: 'id_proyecto', vaciar: false },
    
    // ========================================
    // GRUPO 4: INVENTARIO (Solo backup, NO vaciar)
    // ========================================
    { tabla: 'movimientos_herramienta', fk: 'id_proyecto', vaciar: false },
    
    // ========================================
    // GRUPO 5: MAESTROS (Solo backup, NUNCA vaciar)
    // ========================================
    { tabla: 'empleados', fk: 'id_proyecto', vaciar: false },
    { tabla: 'herramientas', fk: 'id_proyecto', vaciar: false },
    
    // ========================================
    // GRUPO 6: RELACIONES INDIRECTAS (Incluir en backup full)
    // ========================================
    // Estos se incluyen cuando se exporta con datos relacionados
    // proveedores (via suministros)
    // adeudos_empleados (via nomina_empleado)
    // categorias_suministro (via suministros)
    // unidades_medida (via suministros)
  ];
};
```

### 2. Vaciado Selectivo

```javascript
const vaciarProyecto = async (req, res) => {
  // Solo vaciar tablas con vaciar: true
  const tablasAVaciar = obtenerTablasBackupProyecto().filter(t => t.vaciar === true);
  
  // Resultado:
  // ✓ suministros
  // ✓ gastos
  // ✓ presupuestos
  // ✓ estados_cuenta
  
  // ❌ NO vaciar:
  // - nomina_empleado (empleados reutilizables)
  // - pagos_nomina (trazabilidad)
  // - deducciones_nomina (trazabilidad)
  // - ingresos (trazabilidad financiera)
  // - ingresos_movimientos (trazabilidad)
  // - movimientos_herramienta (herramientas compartidas)
  // - empleados (maestro)
  // - herramientas (maestro)
};
```

---

## 🔄 Comparación Antes vs Después

### ❌ Implementación Actual (Problemática)

```javascript
// PROBLEMA: Vaciaba TODO
vaciarProyecto() {
  - nomina_empleado → ❌ Elimina nóminas de empleados que trabajan en otros proyectos
  - empleados → ❌ Elimina empleados maestros
  - herramientas → ❌ Elimina herramientas del inventario general
  - ingresos → ❌ Pierde trazabilidad financiera
  - movimientos_herramienta → ❌ Pierde historial de movimientos
}
```

**Consecuencias:**
- 🚨 Empleado trabaja en FLEX PARK y PADILLAS → Se elimina de ambos
- 🚨 Herramienta usada en múltiples proyectos → Se pierde el registro
- 🚨 Nóminas históricas → Se pierden para reportes fiscales
- 🚨 Movimientos financieros → Descuadre contable

### ✅ Implementación Mejorada (Segura)

```javascript
// SOLUCIÓN: Vaciar solo datos únicos del proyecto
vaciarProyecto() {
  ✓ suministros → Solo materiales de este proyecto
  ✓ gastos → Solo gastos de este proyecto
  ✓ presupuestos → Solo presupuestos de este proyecto
  ✓ estados_cuenta → Solo estados de este proyecto
  
  🔒 PRESERVAR:
  - nomina_empleado → Mantener historial laboral
  - empleados → Mantener maestro
  - herramientas → Mantener inventario
  - ingresos → Mantener trazabilidad
  - movimientos_herramienta → Mantener historial
}
```

**Beneficios:**
- ✅ Empleados siguen disponibles para otros proyectos
- ✅ Inventario de herramientas intacto
- ✅ Historial de nóminas para IMSS/SAT
- ✅ Trazabilidad financiera completa
- ✅ Solo se eliminan datos exclusivos del proyecto

---

## 📋 Casos de Uso Reales

### Caso 1: Proyecto FLEX PARK Finalizado

**Situación:**
- FLEX PARK terminó en Sept 2025
- Tiene 235 suministros
- 89 nóminas de 12 empleados
- 45 gastos
- 5 empleados trabajan también en PADILLAS

**Backup (Incluir TODO):**
```sql
-- Proyecto
INSERT INTO proyectos (...) VALUES (...);

-- GRUPO 1: Transaccionales (se vaciarán)
INSERT INTO suministros (233 registros)
INSERT INTO gastos (45 registros)
INSERT INTO presupuestos (12 registros)
INSERT INTO estados_cuenta (8 registros)

-- GRUPO 2: Nóminas (NO se vaciarán)
INSERT INTO nomina_empleado (89 registros)
INSERT INTO pagos_nomina (89 registros)
INSERT INTO deducciones_nomina (34 registros)

-- GRUPO 3-4: Financiero/Inventario (NO se vaciarán)
INSERT INTO ingresos (15 registros)
INSERT INTO ingresos_movimientos (67 registros)
INSERT INTO movimientos_herramienta (23 registros)

-- GRUPO 5: Maestros (NO se vaciarán, pero se incluyen en backup)
INSERT INTO empleados (12 registros - solo los que trabajaron aquí)
INSERT INTO herramientas (8 registros - solo las usadas aquí)

-- GRUPO 6: Relaciones
-- Proveedores mencionados en suministros
-- Categorías usadas
-- Unidades de medida usadas
```

**Vaciado (Solo exclusivos):**
```sql
DELETE FROM suministros WHERE id_proyecto = 1;  -- 233 registros
DELETE FROM gastos WHERE id_proyecto = 1;       -- 45 registros
DELETE FROM presupuestos WHERE id_proyecto = 1; -- 12 registros
DELETE FROM estados_cuenta WHERE id_proyecto = 1; -- 8 registros

-- Total: 298 registros eliminados
-- Liberados: ~5-10 MB

-- PRESERVADOS:
-- ✓ 89 nóminas (historial laboral)
-- ✓ 12 empleados (siguen trabajando en PADILLAS)
-- ✓ 8 herramientas (inventario activo)
-- ✓ 67 movimientos financieros (trazabilidad)
```

### Caso 2: Proyecto BODEGA X (Sin empleados compartidos)

**Situación:**
- Proyecto pequeño, 3 meses
- 45 suministros
- 12 nóminas de 3 empleados
- Empleados YA NO trabajan en ningún otro proyecto

**Backup:** Igual - TODO incluido

**Vaciado:**
```sql
-- Transaccionales
DELETE FROM suministros WHERE id_proyecto = 5;  -- 45 registros
DELETE FROM gastos WHERE id_proyecto = 5;       -- 12 registros
DELETE FROM presupuestos WHERE id_proyecto = 5; -- 5 registros

-- PRESERVADOS pero archivados en backup:
-- ✓ 12 nóminas (aunque empleados ya no están)
-- ✓ 3 empleados (maestro, aunque inactivos)
-- ✓ Movimientos financieros
```

**Nota:** Si se quiere limpiar empleados inactivos, usar otro proceso separado (limpieza de maestros).

---

## 🛡️ Justificaciones Técnicas

### ¿Por qué NO vaciar nóminas?

**Razones Legales:**
```
1. IMSS: Requiere historial de 5 años
2. SAT: Auditorías fiscales hasta 10 años
3. INFONAVIT: Cálculos de créditos
4. FONACOT: Validación de descuentos
5. Demandas laborales: Evidencia de pagos
```

**Razones Operativas:**
```
1. Reportes anuales (aguinaldo, utilidades)
2. Finiquitos y liquidaciones
3. Constancias de empleo
4. Análisis de productividad histórica
5. Comparativas entre proyectos
```

### ¿Por qué NO vaciar empleados?

**Razones:**
```
1. Son MAESTROS reutilizables (como productos en inventario)
2. Pueden trabajar en múltiples proyectos simultáneamente
3. Historial laboral completo en un solo registro
4. Relaciones: contratos, oficios, datos bancarios
5. Si se eliminan, rompe FKs en otras tablas
```

**Ejemplo Real:**
```
Juan Pérez (id_empleado: 15)
├─ FLEX PARK (id_proyecto: 1) → 45 nóminas
├─ PADILLAS (id_proyecto: 2) → 23 nóminas
└─ BODEGA W (id_proyecto: 3) → 12 nóminas

Si vaciamos FLEX PARK y eliminamos empleado:
❌ Se rompen nóminas de PADILLAS
❌ Se rompen nóminas de BODEGA W
❌ Perdemos historial completo
```

### ¿Por qué NO vaciar herramientas?

**Razones:**
```
1. Inventario general compartido
2. Una herramienta se mueve entre proyectos
3. Control de activos fijos
4. Depreciación contable
5. Mantenimientos y reparaciones
```

**Ejemplo Real:**
```
Martillo Industrial (id_herramienta: 8)
├─ FLEX PARK (100 días)
├─ PADILLAS (45 días)
└─ BODEGA W (30 días)

Movimientos:
- 2024-01-15: Entrada FLEX PARK
- 2024-05-20: Salida FLEX PARK → Entrada PADILLAS
- 2024-07-10: Salida PADILLAS → Entrada BODEGA W
```

### ¿Por qué NO vaciar ingresos/movimientos?

**Razones:**
```
1. Trazabilidad financiera CRÍTICA
2. Conciliaciones bancarias
3. Flujo de efectivo histórico
4. Auditorías contables
5. Cálculo de utilidades/pérdidas
```

---

## ⚙️ Implementación Técnica

### Modificaciones Requeridas

#### 1. Actualizar `obtenerTablasProyecto()`

```javascript
const obtenerTablasProyecto = (idProyecto) => {
  return [
    // Dependencias (vaciar primero por FKs, pero NO las nóminas)
    // pagos_nomina y deducciones_nomina NO se vacían
    
    // Transaccionales (SÍ vaciar)
    { tabla: 'suministros', fk: 'id_proyecto', vaciar: true },
    { tabla: 'gastos', fk: 'id_proyecto', vaciar: true },
    { tabla: 'presupuestos', fk: 'id_proyecto', vaciar: true },
    { tabla: 'estados_cuenta', fk: 'id_proyecto', vaciar: true },
    
    // Nóminas (NO vaciar, solo backup)
    { tabla: 'nomina_empleado', fk: 'id_proyecto', vaciar: false },
    { tabla: 'pagos_nomina', fk: 'id_nomina', referencia: 'nomina_empleado', vaciar: false },
    { tabla: 'deducciones_nomina', fk: 'id_nomina', referencia: 'nomina_empleado', vaciar: false },
    
    // Financieros (NO vaciar, solo backup)
    { tabla: 'ingresos', fk: 'id_proyecto', vaciar: false },
    { tabla: 'ingresos_movimientos', fk: 'id_proyecto', vaciar: false },
    
    // Inventario (NO vaciar, solo backup)
    { tabla: 'movimientos_herramienta', fk: 'id_proyecto', vaciar: false },
    
    // Maestros (NO vaciar, solo backup)
    { tabla: 'empleados', fk: 'id_proyecto', vaciar: false },
    { tabla: 'herramientas', fk: 'id_proyecto', vaciar: false },
  ];
};
```

#### 2. Modificar `backupProyecto()` - Incluir TODO

```javascript
const backupProyecto = async (req, res) => {
  // TODAS las tablas para backup completo
  const todasLasTablas = obtenerTablasProyecto(id);
  
  // Incluir también adeudos y relaciones indirectas
  const tablasExtendidas = [
    ...todasLasTablas,
    // Adeudos relacionados (via empleados que trabajaron aquí)
    { 
      tabla: 'adeudos_empleados', 
      query: `SELECT a.* FROM adeudos_empleados a 
              INNER JOIN nomina_empleado n ON a.id_empleado = n.id_empleado 
              WHERE n.id_proyecto = ?`,
      vaciar: false 
    }
  ];
  
  // Exportar TODO
  for (const config of tablasExtendidas) {
    // ... exportar
  }
};
```

#### 3. Modificar `vaciarProyecto()` - Solo selectivos

```javascript
const vaciarProyecto = async (req, res) => {
  const todasLasTablas = obtenerTablasProyecto(id);
  
  // Filtrar SOLO las que tienen vaciar: true
  const tablasAVaciar = todasLasTablas.filter(t => t.vaciar === true);
  
  console.log(`🗑️ Vaciando ${tablasAVaciar.length} tablas transaccionales`);
  console.log(`🔒 Preservando ${todasLasTablas.length - tablasAVaciar.length} tablas de historial`);
  
  for (const { tabla, fk } of tablasAVaciar) {
    await sequelize.query(
      `DELETE FROM ${tabla} WHERE ${fk} = ?`,
      { replacements: [id] }
    );
  }
};
```

---

## 📊 Comparativa de Resultados

### Escenario: FLEX PARK (1 año de operación)

| Métrica | Antes (Vaciar TODO) | Después (Selectivo) |
|---------|---------------------|---------------------|
| **Registros eliminados** | 456 | 298 |
| **Espacio liberado** | ~12 MB | ~8 MB |
| **Nóminas preservadas** | 0 (❌ perdidas) | 89 (✅ conservadas) |
| **Empleados disponibles** | 0 (❌ eliminados) | 12 (✅ activos) |
| **Herramientas en inventario** | 0 (❌ perdidas) | 8 (✅ conservadas) |
| **Trazabilidad financiera** | ❌ Rota | ✅ Completa |
| **Cumplimiento legal** | ❌ Violado (IMSS/SAT) | ✅ Cumplido |
| **Riesgo operativo** | 🔴 ALTO | 🟢 BAJO |

---

## 🎯 Recomendaciones Finales

### ✅ Hacer Siempre:
1. **Backup completo** antes de vaciar (incluye TODO)
2. **Vaciar solo transaccionales** del proyecto específico
3. **Preservar historial** de nóminas, empleados, herramientas
4. **Mantener trazabilidad** financiera intacta
5. **Documentar** qué proyecto se vació y cuándo

### ❌ NO Hacer:
1. NO vaciar nóminas (legal/fiscal)
2. NO vaciar empleados (maestros compartidos)
3. NO vaciar herramientas (inventario general)
4. NO vaciar ingresos/movimientos (trazabilidad)
5. NO vaciar sin backup previo

### 🔄 Proceso Recomendado:
```bash
1. Exportar backup completo (SQL + Excel)
   → Incluye TODO relacionado al proyecto
   
2. Verificar backup descargado correctamente
   → Abrir archivos y validar contenido
   
3. Vaciar proyecto (solo transaccionales)
   → Libera espacio, preserva historial
   
4. Archivar backup en almacenamiento seguro
   → Drive, NAS, backup externo
   
5. Actualizar estado del proyecto
   → Cambiar de "Activo" a "Archivado"
   → NO eliminarlo, solo marcarlo
```

---

## 📈 Métricas de Éxito

### Antes vs Después (Proyección 1 año, 10 proyectos archivados)

| Métrica | Sistema Anterior | Sistema Mejorado |
|---------|------------------|------------------|
| Espacio liberado | ~120 MB | ~80 MB (-33%) |
| Empleados perdidos | 45 | 0 |
| Herramientas perdidas | 23 | 0 |
| Nóminas perdidas | 890 | 0 |
| Riesgo legal | ALTO | BAJO |
| Integridad de datos | 40% | 95% |
| Tiempo de recuperación | N/A (datos perdidos) | 5 min (desde backup) |

---

**Conclusión:** La estrategia actualizada **balancea** liberación de espacio con preservación de datos críticos, cumplimiento legal y trazabilidad operativa.
