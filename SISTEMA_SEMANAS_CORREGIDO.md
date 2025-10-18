# Sistema de Semanas Corregido

## 🔧 **Problema Identificado y Solucionado**

### ❌ **Problema Anterior**
- El frontend enviaba `id_semana: semanaISO` (ej: `id_semana: 42`)
- El backend almacenaba directamente el número de semana ISO como `id_semana`
- Esto causaba inconsistencias porque `id_semana` debería ser una clave primaria única

### ✅ **Solución Implementada**
- El backend ahora busca o crea automáticamente la semana en `semanas_nomina`
- Usa el `id_semana` correcto (clave primaria) como referencia
- Mantiene la información de semana ISO en la tabla `semanas_nomina`

## 🗄️ **Estructura de Base de Datos**

### **Tabla: `semanas_nomina`**
```sql
CREATE TABLE semanas_nomina (
  id_semana INT PRIMARY KEY AUTO_INCREMENT,  -- Clave primaria única
  anio INT,                                  -- 2025
  semana_iso INT,                           -- 42 (semana ISO)
  etiqueta VARCHAR(50),                     -- "Semana ISO 42 - 2025"
  fecha_inicio DATE,                        -- 2025-10-13
  fecha_fin DATE,                           -- 2025-10-19
  estado ENUM('Borrador', 'En_Proceso', 'Cerrada')
);
```

### **Tabla: `nomina_empleados`**
```sql
CREATE TABLE nomina_empleados (
  id_nomina INT PRIMARY KEY AUTO_INCREMENT,
  id_empleado INT,
  id_semana INT,                            -- Referencia a semanas_nomina.id_semana
  -- ... otros campos
  FOREIGN KEY (id_semana) REFERENCES semanas_nomina(id_semana)
);
```

## 🔄 **Flujo Corregido**

### **1. Frontend (Wizard)**
```javascript
// Ya NO envía id_semana
const nominaData = {
  id_empleado: formData.selectedEmpleado.id_empleado,
  // id_semana se maneja automáticamente en el backend
  id_proyecto: idProyecto,
  // ... otros campos
};
```

### **2. Backend (Controller)**
```javascript
// Buscar o crear la semana automáticamente
const fechaActual = new Date();
const infoSemana = generarInfoSemana(fechaActual);

let semanaNomina = await SemanaNomina.findOne({
  where: {
    anio: infoSemana.año,
    semana_iso: infoSemana.semanaISO
  }
});

// Si no existe, crear la semana
if (!semanaNomina) {
  semanaNomina = await SemanaNomina.create({
    anio: infoSemana.año,
    semana_iso: infoSemana.semanaISO,
    etiqueta: infoSemana.etiqueta,
    fecha_inicio: infoSemana.fechaInicio,
    fecha_fin: infoSemana.fechaFin,
    estado: 'Borrador'
  });
}

// Usar el ID correcto
const idSemanaCorrecto = semanaNomina.id_semana;
```

### **3. Almacenamiento**
```javascript
const nuevaNomina = await NominaEmpleado.create({
  id_empleado,
  id_semana: idSemanaCorrecto, // ID único de la tabla semanas_nomina
  // ... otros campos
});
```

## 📊 **Ejemplo Práctico**

### **Para el 18 de octubre 2025:**

#### **1. Cálculo de Semana**
- **Usuario ve**: "Semana 3 de octubre"
- **Sistema calcula**: `semanaISO = 42`
- **Fecha inicio**: 2025-10-13 (lunes)
- **Fecha fin**: 2025-10-19 (domingo)

#### **2. Búsqueda/Creación de Semana**
```sql
-- Buscar semana existente
SELECT * FROM semanas_nomina 
WHERE anio = 2025 AND semana_iso = 42;

-- Si no existe, crear nueva
INSERT INTO semanas_nomina VALUES (
  NULL,                           -- id_semana (auto-increment)
  2025,                           -- anio
  42,                             -- semana_iso
  'Semana ISO 42 - 2025',         -- etiqueta
  '2025-10-13',                   -- fecha_inicio
  '2025-10-19',                   -- fecha_fin
  'Borrador'                      -- estado
);
-- Resultado: id_semana = 15 (ejemplo)
```

#### **3. Creación de Nómina**
```sql
INSERT INTO nomina_empleados VALUES (
  NULL,                           -- id_nomina (auto-increment)
  15,                             -- id_empleado
  15,                             -- id_semana (referencia correcta)
  -- ... otros campos
);
```

## 🎯 **Beneficios del Sistema Corregido**

### **✅ Consistencia**
- Cada semana tiene un ID único en `semanas_nomina`
- Las nóminas referencian correctamente las semanas
- No hay duplicación de datos

### **✅ Flexibilidad**
- Se pueden crear semanas manualmente si es necesario
- El sistema auto-crea semanas cuando se necesitan
- Fácil consulta de nóminas por semana

### **✅ Integridad**
- Relaciones de base de datos correctas
- Claves foráneas funcionan correctamente
- Consultas JOIN funcionan sin problemas

## 🔍 **Verificación de Duplicados Actualizada**

La función `verificarDuplicados` ahora:
1. **Calcula la semana ISO** basada en el período y semana del mes
2. **Busca la semana** en `semanas_nomina`
3. **Verifica duplicados** usando el `id_semana` correcto

```javascript
// Buscar la semana en la tabla semanas_nomina
const semanaNomina = await SemanaNomina.findOne({
  where: {
    anio: año,
    semana_iso: infoSemana.semanaISO
  }
});

// Buscar nóminas existentes
const nominasExistentes = await NominaEmpleado.findAll({
  where: {
    id_empleado: id_empleado,
    id_semana: semanaNomina.id_semana // Usar ID correcto
  }
});
```

## 🧪 **Para Probar**

1. **Genera una nómina** para el 18 de octubre 2025
2. **Verifica en la base de datos**:
   - Se creó una entrada en `semanas_nomina` con `semana_iso = 42`
   - Se creó una entrada en `nomina_empleados` con `id_semana` correcto
3. **Verifica duplicados**:
   - Intenta crear otra nómina para la misma semana
   - Debe detectar el duplicado correctamente

**El sistema ahora funciona correctamente con referencias de base de datos apropiadas.**
