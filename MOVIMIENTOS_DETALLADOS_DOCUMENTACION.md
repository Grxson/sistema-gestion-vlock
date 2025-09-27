# Sistema de Movimientos Detallados - Documentación

## 📋 Resumen de Mejoras Implementadas

Se ha implementado un sistema completo de movimientos detallados que proporciona información específica sobre cada transacción de herramientas, incluyendo razones específicas, detalles adicionales y funcionalidad para limpiar el historial.

## 🗄️ Cambios en Base de Datos

### Nuevos Campos en `movimientos_herramienta`

```sql
-- Ejecutar esta migración en la base de datos
ALTER TABLE movimientos_herramienta 
ADD COLUMN razon_movimiento VARCHAR(100) COMMENT 'Razón específica del movimiento',
ADD COLUMN detalle_adicional TEXT COMMENT 'Información adicional detallada',
ADD COLUMN usuario_receptor VARCHAR(255) COMMENT 'Usuario que recibe la herramienta',
ADD COLUMN fecha_devolucion_esperada DATE COMMENT 'Fecha esperada de devolución',
ADD COLUMN estado_movimiento ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo' COMMENT 'Estado del movimiento';

-- Agregar índices para optimizar consultas
CREATE INDEX idx_movimientos_razon ON movimientos_herramienta(razon_movimiento);
CREATE INDEX idx_movimientos_estado ON movimientos_herramienta(estado_movimiento);
```

### Descripción de Campos

1. **`razon_movimiento`** (VARCHAR(100)): 
   - Razón específica del movimiento (prestamo, perdida, reparacion, etc.)
   - Permite categorizar mejor cada transacción

2. **`detalle_adicional`** (TEXT):
   - Información específica sobre el movimiento
   - Condiciones, circunstancias especiales, etc.

3. **`usuario_receptor`** (VARCHAR(255)):
   - Usuario que recibe la herramienta en préstamos
   - Permite rastrear responsabilidades

4. **`fecha_devolucion_esperada`** (DATE):
   - Fecha esperada de devolución para préstamos
   - Control de vencimientos

5. **`estado_movimiento`** (ENUM):
   - Estados: 'activo', 'completado', 'cancelado'
   - Control del ciclo de vida del movimiento

## 🎯 Razones Predefinidas por Tipo de Movimiento

### Entrada
- `compra`: Compra nueva
- `devolucion`: Devolución de préstamo
- `reparacion`: Vuelta de reparación
- `donacion`: Donación
- `transferencia`: Transferencia desde otro proyecto
- `otro`: Otro motivo

### Salida
- `prestamo`: Préstamo a usuario
- `asignacion`: Asignación a proyecto
- `mantenimiento`: Envío a mantenimiento
- `reparacion`: Envío a reparación
- `transferencia`: Transferencia a otro proyecto
- `otro`: Otro motivo

### Devolución
- `finalizacion`: Finalización de préstamo
- `cambio_proyecto`: Cambio de proyecto
- `mantenimiento_programado`: Mantenimiento programado
- `otro`: Otro motivo

### Baja
- `perdida`: Pérdida de herramienta
- `robo`: Robo
- `dano_irreparable`: Daño irreparable
- `obsolescencia`: Obsolescencia
- `fin_vida_util`: Fin de vida útil
- `otro`: Otro motivo

## 🔧 Nuevas Funcionalidades Frontend

### Formulario de Movimientos Mejorado
- **Selección de razón específica**: Dropdown dinámico según tipo de movimiento
- **Campo de usuario receptor**: Para préstamos y asignaciones
- **Fecha de devolución esperada**: Para control de préstamos
- **Detalles adicionales**: Campo de texto libre para información específica
- **Notas generales**: Campo separado para observaciones generales

### Visualización de Historial Enriquecida
- **Descripciones contextuales**: Explicaciones detalladas de cada movimiento
- **Información específica por filas**:
  - Primera fila: Proyecto, responsable, stock resultante
  - Segunda fila: Razón, receptor, fecha devolución, estado
- **Diferenciación visual**: Detalles adicionales en color azul, notas en gris
- **Emojis informativos**: Iconos para cada tipo de información

### Funcionalidad de Limpieza de Historial
- **Botón "Limpiar Historial"**: Elimina todos los movimientos de una herramienta
- **Doble confirmación**: Seguridad con dos diálogos de confirmación
- **Preservación del stock**: El stock actual se mantiene intacto
- **Feedback detallado**: Mensajes informativos sobre la operación

## 🔄 Nuevos Endpoints Backend

### Eliminar Historial
```
DELETE /api/herramientas/:id/movimientos
```
- Elimina todos los movimientos de una herramienta específica
- Requiere autenticación
- Devuelve cantidad de registros eliminados

### Actualizar Estado de Movimiento
```
PUT /api/movimientos/:id/estado
```
- Actualiza el estado de un movimiento específico
- Estados válidos: 'activo', 'completado', 'cancelado'

## 📊 Beneficios del Sistema

### Para Usuarios
1. **Mayor contexto**: Saben exactamente por qué se hizo cada movimiento
2. **Mejor rastreabilidad**: Pueden seguir préstamos y asignaciones específicas
3. **Control de vencimientos**: Fechas de devolución para préstamos
4. **Limpieza periódica**: Pueden limpiar historial antiguo

### Para Administradores
1. **Mejor auditoría**: Registro detallado de todas las transacciones
2. **Análisis mejorado**: Datos específicos sobre patrones de uso
3. **Control de responsabilidades**: Rastreo de usuarios receptores
4. **Gestión de estados**: Control del ciclo de vida de movimientos

### Para el Sistema
1. **Base de datos optimizada**: Índices para consultas eficientes
2. **Escalabilidad**: Limpieza periódica previene crecimiento excesivo
3. **Consistencia**: Validaciones y estados definidos
4. **Extensibilidad**: Estructura preparada para futuras mejoras

## 🚀 Instrucciones de Despliegue

1. **Ejecutar migración de base de datos**:
   ```bash
   mysql -u usuario -p base_datos < migrations/20250927-add-detailed-movement-fields.sql
   ```

2. **Verificar compilación del frontend**:
   ```bash
   cd desktop && npm run build
   ```

3. **Reiniciar backend** para cargar el modelo actualizado

4. **Probar funcionalidades**:
   - Crear movimientos con razones específicas
   - Verificar visualización detallada
   - Probar eliminación de historial

## ⚠️ Notas Importantes

- Los campos nuevos son opcionales, el sistema sigue funcionando con registros existentes
- La eliminación de historial es PERMANENTE, usar con precaución
- Las fechas de devolución solo se muestran para préstamos
- Los estados de movimiento permiten futuras funcionalidades de workflow

## 🎉 Resultado Final

El sistema ahora proporciona:
- ✅ Información específica sobre cada movimiento (préstamos, pérdidas, etc.)
- ✅ Rastreabilidad completa de responsabilidades
- ✅ Control de fechas de devolución
- ✅ Funcionalidad de limpieza de historial
- ✅ Interfaz visual enriquecida y profesional
- ✅ Backend robusto con validaciones y seguridad