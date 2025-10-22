# Módulo de Adeudos Generales

## 📋 Descripción

El módulo de **Adeudos Generales** permite gestionar préstamos recibidos y otorgados por la empresa de manera centralizada y eficiente. Este módulo es independiente del sistema de adeudos de empleados y está diseñado para un uso rápido y sencillo.

## 🎯 Características Principales

### ✨ Funcionalidades

- **Registro rápido de adeudos**: Formulario simple con campos mínimos necesarios
- **Dos tipos de adeudos**:
  - 💸 **Nos deben**: Dinero que otras personas/empresas nos deben
  - 🔻 **Debemos**: Dinero que la empresa debe a terceros
- **Gestión de estados**:
  - ⏳ Pendiente
  - ✅ Pagado
- **Visualización clara**: Tabla con colores distintivos según el tipo de adeudo
- **Filtros inteligentes**: Por tipo, estado y búsqueda por nombre
- **Estadísticas en tiempo real**: Dashboard con métricas clave

### 📊 Estadísticas Disponibles

1. **Total de adeudos pendientes**
2. **Monto total que nos deben** (en verde)
3. **Monto total que debemos** (en rojo)
4. **Balance general** (diferencia entre lo que nos deben y lo que debemos)

## 🚀 Instalación

### 1. Ejecutar Migración de Base de Datos

```bash
cd backend/api/src
```

Ejecutar la migración para crear la tabla:

```bash
node -e "const { sequelize } = require('./models'); const migration = require('./migrations/20250121_create_adeudos_generales'); migration.up(sequelize.getQueryInterface(), sequelize.Sequelize).then(() => { console.log('✅ Migración completada'); process.exit(0); }).catch(err => { console.error('❌ Error:', err); process.exit(1); });"
```

### 2. Configurar Permisos

Ejecutar el script SQL para crear los permisos del módulo:

```bash
mysql -u [usuario] -p [nombre_base_datos] < backend/api/src/scripts/add_adeudos_permissions.sql
```

O desde MySQL Workbench/phpMyAdmin, ejecutar el contenido del archivo:
`backend/api/src/scripts/add_adeudos_permissions.sql`

### 3. Reiniciar el Backend

```bash
cd backend/api/src
npm start
```

### 4. Reiniciar el Frontend (Electron)

```bash
cd desktop
npm run dev
```

## 📖 Uso del Módulo

### Acceder al Módulo

1. Iniciar sesión en el sistema
2. En el menú lateral, hacer clic en **"Adeudos"** (icono de billetes 💵)

### Crear un Nuevo Adeudo

1. Hacer clic en el botón **"+ Agregar Adeudo"**
2. Completar el formulario:
   - **Nombre**: Persona o empresa
   - **Tipo**: Seleccionar "Nos deben" o "Debemos"
   - **Monto**: Cantidad en pesos
   - **Notas** (opcional): Comentarios adicionales
3. Hacer clic en **"Guardar"**

### Marcar como Pagado

1. En la lista de adeudos, localizar el adeudo pendiente
2. Hacer clic en el icono de check verde ✅
3. Confirmar la acción

### Editar un Adeudo

1. En la lista de adeudos, hacer clic en el icono de lápiz azul ✏️
2. Modificar los campos necesarios
3. Hacer clic en **"Actualizar"**

**Nota**: Solo se pueden editar adeudos con estado "Pendiente"

### Eliminar un Adeudo

1. En la lista de adeudos, hacer clic en el icono de basura rojo 🗑️
2. Confirmar la eliminación

### Filtrar Adeudos

**Por tipo:**
- Todos los tipos
- Nos deben
- Debemos

**Por estado:**
- Todos los estados
- Pendientes
- Pagados

**Por búsqueda:**
- Escribir el nombre de la persona/empresa en el campo de búsqueda

## 🔐 Permisos

El módulo cuenta con los siguientes permisos:

| Permiso | Código | Descripción |
|---------|--------|-------------|
| Ver | `adeudos.ver` | Permite acceder al módulo y ver la lista |
| Crear | `adeudos.crear` | Permite crear nuevos adeudos |
| Editar | `adeudos.editar` | Permite modificar adeudos existentes |
| Eliminar | `adeudos.eliminar` | Permite eliminar adeudos |
| Liquidar | `adeudos.liquidar` | Permite marcar adeudos como pagados |

Por defecto, el rol de **Administrador** tiene todos los permisos.

## 🗄️ Estructura de la Base de Datos

### Tabla: `adeudos_generales`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_adeudo_general` | INT | ID único (PK, auto-increment) |
| `nombre_entidad` | VARCHAR(255) | Nombre de la persona o empresa |
| `tipo_adeudo` | ENUM | 'nos_deben' o 'debemos' |
| `monto` | DECIMAL(12,2) | Cantidad del adeudo |
| `estado` | ENUM | 'pendiente' o 'pagado' |
| `fecha_registro` | DATE | Fecha de creación del registro |
| `fecha_pago` | DATE | Fecha de liquidación (nullable) |
| `notas` | TEXT | Comentarios adicionales (nullable) |
| `id_usuario_registro` | INT | Usuario que creó el registro (FK) |
| `createdAt` | TIMESTAMP | Fecha de creación |
| `updatedAt` | TIMESTAMP | Fecha de última actualización |

## 🔌 API Endpoints

### Base URL: `/api/adeudos-generales`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Obtener todos los adeudos (con filtros opcionales) |
| GET | `/:id` | Obtener un adeudo por ID |
| GET | `/estadisticas` | Obtener estadísticas generales |
| POST | `/` | Crear un nuevo adeudo |
| PUT | `/:id` | Actualizar un adeudo existente |
| PUT | `/:id/pagar` | Marcar un adeudo como pagado |
| DELETE | `/:id` | Eliminar un adeudo |

### Ejemplos de Uso

**Crear un adeudo:**
```javascript
POST /api/adeudos-generales
{
  "nombre_entidad": "Juan Pérez",
  "tipo_adeudo": "nos_deben",
  "monto": 5000.00,
  "notas": "Préstamo para materiales"
}
```

**Filtrar adeudos:**
```javascript
GET /api/adeudos-generales?tipo=nos_deben&estado=pendiente
```

## 🎨 Diseño UX

### Colores Distintivos

- **Verde** (💸): Adeudos donde nos deben dinero
- **Rojo** (🔻): Adeudos donde debemos dinero
- **Amarillo**: Estado pendiente
- **Azul**: Estado pagado

### Interfaz Responsive

El módulo está completamente optimizado para:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

### Modo Oscuro

Totalmente compatible con el tema oscuro del sistema.

## 🐛 Solución de Problemas

### El módulo no aparece en el menú

1. Verificar que los permisos se hayan creado correctamente
2. Asignar el permiso `adeudos.ver` al rol del usuario
3. Cerrar sesión y volver a iniciar sesión

### Error al crear adeudo

1. Verificar que la tabla `adeudos_generales` exista en la base de datos
2. Revisar los logs del backend para más detalles
3. Verificar que el usuario tenga el permiso `adeudos.crear`

### No se muestran las estadísticas

1. Verificar que existan adeudos en la base de datos
2. Revisar la consola del navegador para errores
3. Verificar la conexión con el backend

## 📝 Notas Adicionales

- Los adeudos marcados como "Pagados" no pueden ser editados
- Los adeudos pueden ser eliminados en cualquier momento (con confirmación)
- El balance se calcula automáticamente: `Nos deben - Debemos`
- Todas las acciones quedan registradas con el usuario que las realizó

## 🔄 Actualizaciones Futuras

Posibles mejoras a considerar:

- [ ] Pagos parciales
- [ ] Historial de pagos
- [ ] Recordatorios automáticos
- [ ] Exportación a PDF/Excel
- [ ] Gráficas de tendencias
- [ ] Integración con módulo de finanzas
- [ ] Adjuntar documentos (contratos, pagarés)
- [ ] Notificaciones por correo

## 👥 Soporte

Para reportar problemas o sugerencias, contactar al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Fecha de creación**: Enero 2025  
**Última actualización**: Enero 2025
