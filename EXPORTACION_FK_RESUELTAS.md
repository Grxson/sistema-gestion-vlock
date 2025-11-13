# Exportación Excel con Valores Legibles para FKs

## 📋 Descripción

La exportación a Excel ahora **enriquece automáticamente** las columnas de llaves foráneas (FK) con valores legibles, facilitando la lectura de los datos sin necesidad de cruzar tablas manualmente.

## ✨ Funcionamiento

Cuando exportas una tabla a Excel, el sistema:

1. **Detecta columnas FK** por convención de nombre (`id_proyecto`, `id_empleado`, `id_proveedor`, etc.)
2. **Hace lookup** en la tabla relacionada para obtener el valor descriptivo
3. **Agrega columnas extra** con los nombres legibles al final de cada fila

### Ejemplo: Tabla `suministros`

**Antes:**
```
| id_suministro | id_proyecto | id_proveedor | nombre        | ... |
|---------------|-------------|--------------|---------------|-----|
| 7             | 1           | 3            | Grava 1 1/2   | ... |
```

**Ahora (Excel exportado):**
```
| id_suministro | id_proyecto | id_proveedor | nombre        | ... | proyecto_nombre | proveedor_nombre |
|---------------|-------------|--------------|---------------|-----|-----------------|------------------|
| 7             | 1           | 3            | Grava 1 1/2   | ... | FLEX PARK       | PADILLAS         |
```

## 🗂️ FKs Soportadas

El sistema resuelve automáticamente las siguientes llaves foráneas:

| Columna FK                    | Tabla Relacionada         | Columna Agregada               | Valor Mostrado                           |
|-------------------------------|---------------------------|--------------------------------|------------------------------------------|
| `id_proyecto`                 | proyectos                 | `proyecto_nombre`              | Nombre del proyecto                      |
| `id_empleado`                 | empleados                 | `empleado_nombre`              | Nombre completo (nombre + apellidos)     |
| `id_proveedor`                | proveedores               | `proveedor_nombre`             | Nombre del proveedor                     |
| `id_usuario`                  | usuarios                  | `usuario_nombre`               | Nombre de usuario                        |
| `id_categoria`                | categorias_suministro     | `categoria_nombre`             | Nombre de categoría                      |
| `id_categoria_suministro`     | categorias_suministro     | `categoria_nombre`             | Nombre de categoría de suministro        |
| `id_categoria_herramienta`    | categorias_herramienta    | `categoria_herramienta_nombre` | Nombre de categoría de herramienta       |
| `id_unidad`                   | unidades_medida           | `unidad_nombre`                | Nombre de unidad de medida               |
| `id_unidad_medida`            | unidades_medida           | `unidad_nombre`                | Nombre de unidad de medida               |
| `id_rol`                      | roles                     | `rol_nombre`                   | Nombre del rol                           |
| `id_semana`                   | semanas_nomina            | `semana_descripcion`           | "Sem X (fecha_inicio)"                   |
| `id_contrato`                 | contratos                 | `contrato_nombre`              | Nombre del contrato                      |
| `id_oficio`                   | oficios                   | `oficio_nombre`                | Nombre del oficio                        |
| `id_herramienta`              | herramientas              | `herramienta_nombre`           | Nombre de la herramienta                 |
| `id_nomina`                   | nomina_empleado           | `nomina_descripcion`           | "Nómina X"                               |
| `id_adeudo`                   | adeudos_empleados         | `adeudo_concepto`              | Concepto del adeudo                      |
| `id_ingreso`                  | ingresos                  | `ingreso_concepto`             | Concepto del ingreso                     |

## 🎯 Casos de Uso

### Nómina
```
id_nomina | id_empleado | id_semana | ... | empleado_nombre      | semana_descripcion
----------|-------------|-----------|-----|----------------------|--------------------
125       | 42          | 15        | ... | Juan Pérez López     | Sem 15 (2025-04-07)
```

### Suministros
```
id_suministro | id_proyecto | id_proveedor | id_categoria | ... | proyecto_nombre | proveedor_nombre | categoria_nombre
--------------|-------------|--------------|--------------|-----|-----------------|------------------|------------------
7             | 1           | 3            | 1            | ... | FLEX PARK       | PADILLAS         | Materiales
```

### Empleados
```
id_empleado | id_proyecto | id_contrato | id_oficio | ... | proyecto_nombre | contrato_nombre | oficio_nombre
------------|-------------|-------------|-----------|-----|-----------------|-----------------|---------------
15          | 4           | 8           | 3         | ... | SAN MARCOS      | Obra civil      | Albañil
```

## 🔧 Implementación Técnica

### Backend: `exportacion.controller.js`

La función `resolverValoresFK()`:
1. Escanea las columnas de la tabla a exportar
2. Identifica las FKs presentes según el diccionario `fkMapping`
3. Precarga (cache) todos los registros de las tablas relacionadas
4. Enriquece cada fila con las columnas alias correspondientes

```javascript
// Ejemplo de mapeo
const fkMapping = {
  id_proyecto: { 
    tabla: 'proyectos', 
    idCol: 'id_proyecto', 
    campo: 'nombre', 
    alias: 'proyecto_nombre' 
  },
  id_empleado: { 
    tabla: 'empleados', 
    idCol: 'id_empleado', 
    campoFn: (row) => `${row.nombre} ${row.apellido_paterno || ''} ${row.apellido_materno || ''}`.trim(), 
    alias: 'empleado_nombre' 
  }
  // ... más FKs
};
```

### Flujo de Exportación Excel

```
Cliente solicita exportar tabla X
    ↓
Backend lee datos de tabla X con columnas reales (describeTable + SELECT)
    ↓
resolverValoresFK() detecta FKs y hace lookups
    ↓
Datos enriquecidos → ExcelJS genera el archivo
    ↓
Cliente descarga Excel con columnas FK + columnas legibles
```

## ✅ Ventajas

- **Legibilidad instantánea**: No necesitas recordar qué ID corresponde a qué entidad
- **Sin consultas adicionales**: Todo en un solo archivo
- **Orden lógico**: Las columnas legibles se agregan al lado de sus respectivos IDs
- **Performance**: Cache de lookups para minimizar consultas a BD
- **Extensible**: Agregar nuevas FKs es solo añadir una línea al mapeo

## 📝 Agregar Más FKs

Para agregar soporte a una nueva FK, edita `fkMapping` en `resolverValoresFK()`:

```javascript
const fkMapping = {
  // ... FKs existentes
  id_nueva_entidad: { 
    tabla: 'tabla_entidad',         // tabla relacionada
    idCol: 'id_nueva_entidad',      // columna ID primaria en esa tabla
    campo: 'nombre',                // campo a mostrar (o usar campoFn)
    alias: 'entidad_nombre'         // nombre de la columna extra en Excel
  },
};
```

Si el valor legible requiere concatenación o cálculo:
```javascript
id_empleado: { 
  tabla: 'empleados', 
  idCol: 'id_empleado', 
  campoFn: (row) => `${row.nombre} ${row.apellido_paterno}`.trim(),  // función custom
  alias: 'empleado_nombre' 
}
```

## 🚀 Testing Local

```bash
# Obtener token
TOKEN=$(node -e "const axios=require('axios');(async()=>{const res=await axios.post('http://localhost:4000/api/auth/login',{email:'admin@vlock.com',password:'admin123'});console.log(res.data.token);})()")

# Exportar tabla con FKs (ejemplo: suministros)
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"tablas":["suministros"]}' \
     http://localhost:4000/api/exportacion/excel \
     -o export_suministros.xlsx

# Verificar columnas en Python
python3 << EOF
import openpyxl
wb = openpyxl.load_workbook('export_suministros.xlsx')
ws = wb[wb.sheetnames[0]]
headers = [cell.value for cell in ws[1]]
print("Columnas con FK y nombres legibles:")
for h in headers:
    if 'id_' in str(h) or '_nombre' in str(h):
        print(f"  ✓ {h}")
EOF
```

## 📊 Ejemplo Real

**Tabla: suministros** (251 registros)
- Columnas originales: 26
- Columnas agregadas: 2 (`proyecto_nombre`, `proveedor_nombre`)
- Total en Excel: **28 columnas**

**Tabla: empleados** (7 registros)
- Columnas originales: 22
- Columnas agregadas: 3 (`empleado_nombre`, `oficio_nombre`, `proyecto_nombre`)
- Total en Excel: **25 columnas**

---

✨ **Con esta funcionalidad, las exportaciones Excel son 100% autoexplicativas y listas para compartir sin necesidad de lookups manuales.**
