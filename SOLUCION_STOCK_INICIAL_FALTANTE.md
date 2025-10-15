# Solución: Campo stock_inicial no se mostraba en el formulario

## 🔍 **Problema Identificado**

El campo `stock_inicial` existía en la base de datos y se guardaba correctamente, pero **no se mostraba** en el formulario al editar/ver una herramienta.

### Síntomas:
- ✅ Base de datos: `stock_inicial = 13`
- ❌ Formulario: `stock_inicial = 0` (aparecía vacío)
- ❌ Cálculo: `1300% disponible` (13/0 = infinito)

## 🕵️ **Causa Raíz**

El problema estaba en el **modelo de Sequelize**. Aunque el campo `stock_inicial` existía en la base de datos, **no estaba definido en el modelo** `herramientas.model.js`.

### Lo que pasaba:
1. ✅ La migración creó el campo en la BD
2. ✅ El controlador guardaba el campo correctamente
3. ❌ **El modelo no conocía el campo**, por lo que Sequelize no lo incluía en las respuestas
4. ❌ El frontend recibía `undefined` para `stock_inicial`

## 🔧 **Solución Implementada**

### 1. Agregado el campo al modelo de Sequelize:

**Archivo**: `/backend/api/src/models/herramientas.model.js`

```javascript
stock: {
  type: DataTypes.INTEGER,
  defaultValue: 0
},
stock_inicial: {  // ← CAMPO AGREGADO
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0,
  comment: 'Stock inicial de la herramienta al momento de registro'
},
estado: {
  // ... resto del modelo
}
```

### 2. Reiniciado el servidor para que Sequelize reconozca el campo

## 🎯 **Resultado Esperado**

Después de reiniciar el servidor:

1. ✅ El campo `stock_inicial` se incluirá en todas las respuestas del backend
2. ✅ El frontend recibirá el valor correcto del campo
3. ✅ El formulario mostrará el stock inicial correctamente
4. ✅ El cálculo de porcentaje será preciso (ej: 13/13 = 100%)

## 📊 **Verificación**

### Antes (Problemático):
```json
{
  "id_herramienta": 38,
  "nombre": "Cascos",
  "stock": 13,
  "stock_inicial": undefined  // ← Campo faltante
}
```

### Después (Corregido):
```json
{
  "id_herramienta": 38,
  "nombre": "Cascos", 
  "stock": 13,
  "stock_inicial": 13  // ← Campo presente
}
```

## 🚀 **Pasos para Aplicar la Solución**

1. **Reiniciar el servidor backend**:
   ```bash
   cd backend/api/src
   npm start
   ```

2. **Verificar en el frontend**:
   - Abrir una herramienta para editar
   - El campo "Stock Inicial" debería mostrar el valor correcto
   - El porcentaje de stock debería calcularse correctamente

3. **Verificar en la consola**:
   - Los logs de debugging mostrarán el campo `stock_inicial` con su valor correcto

## 🛡️ **Prevención Futura**

Para evitar este problema en el futuro:

1. **Siempre definir campos en el modelo** cuando se agregan a la base de datos
2. **Usar migraciones de Sequelize** para mantener sincronizados modelo y BD
3. **Verificar que los campos se incluyen** en las respuestas del backend

## 🎉 **Beneficios de la Corrección**

1. **Datos consistentes**: El formulario muestra los valores reales de la BD
2. **Cálculos precisos**: Los porcentajes de stock son exactos
3. **UX mejorada**: El usuario ve la información correcta
4. **Sistema robusto**: No más discrepancias entre BD y interfaz

Esta corrección resuelve completamente el problema de que el stock inicial no se mostraba en el formulario, asegurando que la interfaz refleje fielmente los datos de la base de datos.
