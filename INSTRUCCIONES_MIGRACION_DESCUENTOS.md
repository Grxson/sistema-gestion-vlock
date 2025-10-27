# 📋 Instrucciones: Migración de Descuentos Manuales en Nóminas

## ✅ Cambios Implementados

### 🎯 Objetivo
Permitir capturar montos manuales de ISR, IMSS, Infonavit y descuentos adicionales (adelantos) en el Wizard de Nómina.

---

## 📂 Archivos Modificados

### Backend:
1. **`/backend/api/src/migrations/20251027_add_descuentos_column.js`**
   - Migración para agregar columna `descuentos` (DECIMAL 10,2)

2. **`/backend/api/src/models/nominaEmpleados.model.js`**
   - Agregado campo `descuentos` al modelo

3. **`/backend/api/src/controllers/nomina.controller.js`**
   - Acepta nuevos campos: `monto_isr`, `monto_imss`, `monto_infonavit`, `descuentos`
   - Los pasa a la función de cálculo
   - Guarda el campo `descuentos` en la BD

4. **`/backend/api/src/utils/nominaCalculator.js`**
   - Actualizada función `calcularNomina` para aceptar montos manuales
   - Si monto manual > 0: usa ese monto
   - Si monto manual = 0: calcula automáticamente según tablas fiscales
   - Suma `descuentos` al total de deducciones

### Frontend:
1. **`/desktop/src/renderer/components/NominaWizard.jsx`**
   - Agregados campos en `formData`: `montoISR`, `montoIMSS`, `montoInfonavit`, `descuentos`
   - Inputs dinámicos que aparecen/desaparecen según checkboxes
   - Campo "Descuentos (Adelantos)" siempre visible
   - Envía todos los campos al backend

2. **`/desktop/src/renderer/services/nominas/calculadoraNominaService.js`**
   - Acepta montos manuales
   - Lógica: monto manual > 0 ? usar manual : calcular automático
   - Incluye `descuentos` en total de deducciones

---

## 🚀 Pasos para Ejecutar la Migración

### Opción 1: Script Automático (Recomendado)

```bash
cd backend/api
node src/scripts/run-migration-descuentos.js
```

**Nota**: Asegúrate de que el archivo `.env` tenga las credenciales correctas de la base de datos.

### Opción 2: SQL Directo

Si el script no funciona por problemas de conexión, ejecuta este SQL manualmente:

```sql
ALTER TABLE nomina_empleados 
ADD COLUMN descuentos DECIMAL(10,2) DEFAULT 0 
COMMENT 'Descuentos adicionales (adelantos, préstamos, etc.)';
```

### Opción 3: Desde MySQL/MariaDB CLI

```bash
mysql -u tu_usuario -p tu_base_de_datos < backend/api/src/migrations/20251027_add_descuentos_column.sql
```

---

## 🔍 Verificar que la Migración se Ejecutó Correctamente

### Desde MySQL CLI:

```sql
USE tu_base_de_datos;
DESCRIBE nomina_empleados;
```

Deberías ver la columna `descuentos` con tipo `DECIMAL(10,2)`.

### Desde el Backend:

```bash
cd backend/api
npm start
```

Si el backend inicia sin errores, la migración fue exitosa.

---

## 🎨 Comportamiento en el Frontend

### Checkboxes ISR/IMSS/Infonavit:

**Desmarcado (☐):**
- No se aplica el descuento
- Input oculto

**Marcado (☑):**
- Aparece input numérico debajo del checkbox
- **Si input tiene valor > 0**: usa ese monto manual
- **Si input está en 0**: calcula automáticamente según tablas fiscales

### Campo "Descuentos (Adelantos)":
- Siempre visible
- Para registrar adelantos solicitados por el empleado
- Se suma al total de deducciones

---

## 📊 Ejemplo de Uso

### Caso 1: Usar cálculo automático
1. Marcar checkbox "Aplicar ISR" ☑
2. Dejar input de "Monto ISR" en 0.00
3. El sistema calculará el ISR automáticamente según tablas fiscales

### Caso 2: Usar monto manual
1. Marcar checkbox "Aplicar ISR" ☑
2. Ingresar monto manual: $500.00
3. El sistema usará $500.00 en lugar de calcular

### Caso 3: Adelanto
1. Ingresar en "Descuentos (Adelantos)": $1,000.00
2. Se descontará $1,000.00 del total de la nómina

---

## ⚠️ Notas Importantes

### Campos en Base de Datos:

**Campos BOOLEAN (indican si aplicar o no):**
- `aplicar_isr` (BOOLEAN)
- `aplicar_imss` (BOOLEAN)
- `aplicar_infonavit` (BOOLEAN)

**Campos DECIMAL (montos calculados o manuales):**
- `deducciones_isr` (DECIMAL 10,2) - Ya existía
- `deducciones_imss` (DECIMAL 10,2) - Ya existía
- `deducciones_infonavit` (DECIMAL 10,2) - Ya existía
- `descuentos` (DECIMAL 10,2) - **NUEVO**

### Reiniciar Backend:
Después de ejecutar la migración, **reinicia el backend** para que cargue el modelo actualizado.

### Pruebas Recomendadas:
1. Crear nómina con ISR automático (checkbox marcado, input en 0)
2. Crear nómina con ISR manual (checkbox marcado, input con valor)
3. Crear nómina con descuento por adelanto
4. Verificar que los montos se guarden correctamente en la BD
5. Generar PDF y verificar que muestre los montos correctos

---

## 🐛 Solución de Problemas

### Error: "Column 'descuentos' doesn't exist"
**Solución**: La migración no se ejecutó. Ejecuta el SQL manualmente (Opción 2).

### Error: "Access denied for user"
**Solución**: Verifica las credenciales en el archivo `.env`:
```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_NAME=tu_base_de_datos
```

### Los inputs no aparecen en el frontend
**Solución**: 
1. Recarga la aplicación (Ctrl+R)
2. Verifica que el archivo `NominaWizard.jsx` tenga los cambios
3. Revisa la consola del navegador (F12) por errores

### El cálculo no refleja los montos manuales
**Solución**:
1. Verifica que el backend esté actualizado
2. Reinicia el backend
3. Limpia la caché del navegador

---

## 📝 Comandos Rápidos

```bash
# Ejecutar migración
cd backend/api && node src/scripts/run-migration-descuentos.js

# Reiniciar backend
cd backend/api && npm start

# Verificar columna en BD (desde MySQL CLI)
mysql -u root -p -e "USE tu_bd; DESCRIBE nomina_empleados;"

# Ver logs del backend
cd backend/api && npm start | grep -i "descuentos"
```

---

## ✅ Checklist de Validación

- [ ] Migración ejecutada sin errores
- [ ] Columna `descuentos` existe en tabla `nomina_empleados`
- [ ] Backend reiniciado y funcionando
- [ ] Frontend muestra inputs dinámicos al marcar checkboxes
- [ ] Campo "Descuentos (Adelantos)" visible
- [ ] Cálculo automático funciona (input en 0)
- [ ] Cálculo manual funciona (input con valor)
- [ ] Datos se guardan correctamente en BD
- [ ] PDF generado muestra montos correctos

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisa los logs del backend
2. Revisa la consola del navegador (F12)
3. Verifica que todos los archivos tengan los cambios
4. Asegúrate de que la migración se ejecutó correctamente

---

**Fecha de implementación**: 27 de octubre de 2025
**Versión**: 2.0.0
