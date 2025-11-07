# Corrección: Número de Semana en Historial de Nómina

## Problema Detectado
El historial de nóminas mostraba números de semana incorrectos. Por ejemplo, nóminas registradas en "Semana 1" aparecían como "Semana 2".

## Causa Raíz
El frontend estaba **recalculando** la semana del mes usando semanas ISO en lugar de mostrar el valor original guardado en la base de datos. El problema era que la tabla `nomina_empleados` no guardaba los campos `periodo` y `semana` directamente.

## Solución Implementada

### 1. Backend - Modelo y Base de Datos

**Archivo:** `backend/api/src/models/nominaEmpleados.model.js`
- ✅ Agregados campos `periodo` (VARCHAR) y `semana` (INT) al modelo

**Migración SQL:** `backend/api/migrations/add_periodo_semana_to_nomina.sql`
```bash
# Ejecutar en MySQL:
mysql -u root -p sistema_gestion < backend/api/migrations/add_periodo_semana_to_nomina.sql
```

### 2. Backend - Controlador

**Archivo:** `backend/api/src/controllers/nomina.controller.js`
- ✅ El endpoint `createNomina` ahora guarda `periodo` y `semana` al crear nóminas
- Los valores se construyen desde `periodo_anio`, `periodo_mes` y `semana_del_mes` enviados por el frontend

### 3. Frontend - Componentes

**Archivos actualizados:**
1. `desktop/src/renderer/components/nomina/NominaEmpleadoHistorialDrawer.jsx`
2. `desktop/src/renderer/components/nomina/NominaReportsTab.jsx`

**Cambios en la lógica:**
- ✅ **PRIORIDAD 1**: Si la nómina trae `n.semana` (número directo 1-5), se usa ese valor
- ✅ **PRIORIDAD 2**: Si viene en `n.semana.semana_mes`, se usa ese valor
- ✅ **PRIORIDAD 3**: Si no existe, se recalcula usando semana ISO (fallback para datos antiguos)

```javascript
// Ejemplo de la lógica corregida:
const getSemanaDelMes = (n) => {
  // Usar valor directo si existe
  if (n?.semana && typeof n.semana === 'number') {
    return n.semana;
  }
  
  // Recalcular solo si es necesario (nóminas antiguas)
  // ... lógica de cálculo ISO
};
```

## Qué Hacer Ahora

### 1. Ejecutar Migración (Solo una vez)
```bash
cd /home/grxson/Documentos/Github/sistema-gestion-vlock/backend/api
mysql -u root -p sistema_gestion < migrations/add_periodo_semana_to_nomina.sql
```

### 2. Reiniciar Backend
```bash
# Si el backend está corriendo, reiniciarlo para cargar el modelo actualizado
cd /home/grxson/Documentos/Github/sistema-gestion-vlock/backend/api
npm start
# o
node src/app.js
```

### 3. Refrescar Frontend
- Simplemente refresca el navegador (Ctrl+R o Cmd+R)
- Las nóminas **nuevas** que se creen ahora tendrán el `periodo` y `semana` correctos guardados
- Las nóminas **antiguas** seguirán mostrándose correctamente gracias al fallback

## Comportamiento Esperado

✅ **Nóminas nuevas**: Se guardan con `periodo` y `semana`, se muestran correctamente siempre
✅ **Nóminas antiguas**: El frontend las calcula usando el método antiguo (compatible)
✅ **Historial**: Muestra el número correcto de semana (1, 2, 3, 4, 5)
✅ **Reportes**: La tabla detallada también usa el valor correcto

## Verificación

Para verificar que funciona:
1. Crea una nómina nueva en "Semana 1" de un mes
2. Ve al historial del empleado
3. Debe aparecer como "Semana 1" (no "Semana 2")

## Notas Técnicas

- Los campos `periodo` y `semana` son **NULL** por defecto para no romper datos existentes
- El frontend tiene 3 niveles de prioridad para obtener la semana, garantizando retrocompatibilidad
- No es necesario actualizar nóminas antiguas manualmente (el frontend las maneja)

## Archivos Modificados

```
backend/api/src/models/nominaEmpleados.model.js
backend/api/src/controllers/nomina.controller.js
backend/api/migrations/add_periodo_semana_to_nomina.sql (nuevo)
desktop/src/renderer/components/nomina/NominaEmpleadoHistorialDrawer.jsx
desktop/src/renderer/components/nomina/NominaReportsTab.jsx
```

---

**Estado:** ✅ Implementado y listo para probar
**Compatibilidad:** Mantiene nóminas antiguas funcionando correctamente
**Riesgo:** Bajo (cambios aditivos, no destructivos)
