# Sistema de Nóminas - Gestión de Semanas ISO

## 🚀 Escalabilidad del Sistema

### ✅ El sistema ES completamente escalable

**El sistema funcionará automáticamente en 2026, 2027, 2028, etc. sin necesidad de intervención manual.**

#### ¿Cómo funciona?

1. **Backend crea semanas automáticamente**: Cuando se crea una nómina, si la semana ISO no existe en la base de datos, el backend la crea automáticamente.

2. **Frontend detecta período y semana actual**: El frontend actualiza automáticamente el período (año-mes) y la semana cuando cambia el mes o año.

3. **Algoritmo ISO 8601**: Usa el estándar internacional que funciona para cualquier año.

### 📅 Cambio Automático de Período y Semana

**Ejemplo de comportamiento:**
- **Octubre 2025, Semana 5** (27 oct - 2 nov)
- Cuando llegue el **1 de noviembre 2025**:
  - Período cambia automáticamente a: `2025-11`
  - Semana cambia automáticamente a: `1` (primera semana de noviembre)
- Cuando llegue el **1 de enero 2026**:
  - Período cambia automáticamente a: `2026-01`
  - Semana cambia automáticamente a: `1` (primera semana de enero)

**El frontend verifica cada minuto** si cambió el mes/año y actualiza automáticamente.

---

## ⚠️ Scripts de Limpieza (Solo para Desarrollo)

Estos scripts eliminarán **TODOS** los datos de nóminas existentes. Solo ejecutar si estás seguro de querer empezar de cero con el algoritmo corregido.

## Problema Corregido

El sistema tenía un error en el cálculo del año ISO de las semanas. La función `generarInfoSemana` usaba el año del **lunes** en lugar del año del **jueves** para determinar el año ISO, causando inconsistencias en la asignación de semanas.

### Cambio Implementado

**Antes (incorrecto):**
```javascript
const añoSemana = lunes.getFullYear(); // ❌ Incorrecto
```

**Después (correcto):**
```javascript
// Encontrar el jueves de la semana
const diasHastaJueves = dia === 0 ? -3 : (4 - dia);
const jueves = new Date(fechaTemp);
jueves.setDate(fechaTemp.getDate() + diasHastaJueves);

// El año ISO es el año del jueves (estándar ISO 8601)
const añoISO = jueves.getFullYear(); // ✅ Correcto
```

## Scripts Disponibles

### 1. `truncate-nominas.js`
Limpia todas las tablas relacionadas con nóminas.

**Tablas afectadas:**
- `nomina_historial`
- `pagos_nomina`
- `adeudos_empleados`
- `nomina_empleados`
- `semanas_nominas`

### 2. `populate-semanas-2025-corrected.js`
Repuebla la tabla `semanas_nominas` con las 53 semanas ISO del año 2025 usando el algoritmo corregido.

### 3. `populate-semanas-year.js` (Opcional - Para Pre-poblar Años Futuros)
Script opcional para pre-poblar las semanas de cualquier año. **NO es necesario ejecutarlo** porque el sistema crea las semanas automáticamente, pero puede ser útil para poblar años futuros por adelantado.

**Uso:**
```bash
# Poblar año actual
node src/scripts/populate-semanas-year.js

# Poblar año específico (ej: 2026)
node src/scripts/populate-semanas-year.js 2026

# Poblar año 2027
node src/scripts/populate-semanas-year.js 2027
```

**Características:**
- ✅ Verifica si las semanas ya existen antes de insertar (no crea duplicados)
- ✅ Funciona para cualquier año entre 2000 y 2100
- ✅ Usa el mismo algoritmo ISO 8601 corregido
- ✅ Muestra resumen de semanas insertadas

## Instrucciones de Uso

### Paso 1: Limpiar las tablas

Desde el directorio del backend:

```bash
cd backend/api
node src/scripts/truncate-nominas.js
```

El script te pedirá confirmación. Escribe `SI` (en mayúsculas) para continuar.

### Paso 2: Repoblar semanas

```bash
node src/scripts/populate-semanas-2025-corrected.js
```

Este script insertará automáticamente todas las semanas del 2025 con el algoritmo corregido.

### Paso 3: Verificar

Puedes verificar que las semanas se insertaron correctamente:

```sql
SELECT 
  id_semana,
  anio,
  semana_iso,
  etiqueta,
  DATE_FORMAT(fecha_inicio, '%d/%m/%Y') as inicio,
  DATE_FORMAT(fecha_fin, '%d/%m/%Y') as fin
FROM semanas_nominas
ORDER BY anio, semana_iso;
```

## Validación de Duplicados Mejorada

Después de ejecutar estos scripts, el sistema validará correctamente los duplicados usando:

1. **`id_empleado`**: Identifica al empleado
2. **`periodo` (año-mes)**: Identifica el mes y año
3. **`semana_del_mes`**: Identifica qué semana del mes (1-5)

### Comportamiento Esperado

✅ **Mismo empleado, misma semana, mismo período** → ❌ RECHAZADO (duplicado)
✅ **Mismo empleado, diferente semana, mismo período** → ✅ PERMITIDO
✅ **Mismo empleado, misma semana, diferente período** → ✅ PERMITIDO

## Ejemplo de Uso Correcto

**Octubre 2025:**
- Semana 1: ISO 40 (29 sept - 5 oct)
- Semana 2: ISO 41 (6-12 oct)
- Semana 3: ISO 42 (13-19 oct)
- Semana 4: ISO 43 (20-26 oct)
- Semana 5: ISO 44 (27 oct - 2 nov)

**Validación:**
- Crear nómina para empleado X en Semana 4 de Octubre 2025 → ✅ OK
- Crear otra nómina para empleado X en Semana 4 de Octubre 2025 → ❌ RECHAZADO (duplicado)
- Crear nómina para empleado X en Semana 5 de Octubre 2025 → ✅ OK (diferente semana)
- Crear nómina para empleado X en Semana 4 de Noviembre 2025 → ✅ OK (diferente mes)

## Archivos Modificados

### Backend
- `/backend/api/src/utils/weekCalculator.js` - Función `generarInfoSemana` corregida
- `/backend/api/src/controllers/nomina.controller.js` - Validación de duplicados mejorada

### Frontend
- `/desktop/src/renderer/utils/weekCalculator.js` - Función `generarInfoSemana` corregida

## Notas Importantes

1. **Backup**: Considera hacer un backup de la base de datos antes de ejecutar estos scripts
2. **Producción**: NO ejecutar en producción sin antes hacer backup
3. **Consistencia**: Asegúrate de que tanto frontend como backend estén actualizados
4. **Reinicio**: Después de ejecutar los scripts, reinicia el servidor backend

## Soporte

Si encuentras algún problema después de ejecutar estos scripts, verifica:

1. Que el backend esté usando el `weekCalculator.js` actualizado
2. Que el frontend esté usando el `weekCalculator.js` actualizado
3. Que la tabla `semanas_nominas` tenga registros
4. Que los logs del backend muestren el cálculo correcto de semanas ISO
