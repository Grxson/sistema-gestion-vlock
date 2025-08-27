# 📋 DOCUMENTACIÓN COMPLETA - MÓDULO DE SUMINISTROS
## VLock Sistema de Gestión - Versión Beta

---

## 🎯 RESUMEN EJECUTIVO

El módulo de **Suministros** es el componente principal de la versión beta, diseñado para la gestión integral de materiales, servicios y equipos en proyectos de construcción. Este sistema permite un control detallado desde la solicitud hasta la entrega, incluyendo logística, tiempos y costos.

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Backend (API REST)
```
/backend/api/src/
├── models/suministros.model.js      # Modelo de datos principal
├── controllers/suministros.controller.js  # Lógica de negocio
├── routes/suministros.routes.js     # Endpoints de la API
├── models/proveedores.model.js      # Gestión de proveedores
├── controllers/proveedores.controller.js
└── controllers/reportes.controller.js  # Dashboards y gráficas
```

### Frontend (React + Electron)
```
/desktop/src/renderer/
├── pages/Suministros.jsx           # Interfaz principal
├── components/common/ProveedorAutocomplete.jsx  # Autocompletado
├── components/ui/DateInput.jsx      # Componentes UI
├── components/ui/TimeInput.jsx
└── services/api.js                  # Cliente API
```

---

## 📊 ESTRUCTURA DE DATOS

### Tabla: `suministros`
```sql
CREATE TABLE suministros (
  id_suministro INT PRIMARY KEY AUTO_INCREMENT,
  id_proyecto INT NOT NULL,              -- Referencia al proyecto
  id_proveedor INT NULL,                 -- Referencia al proveedor
  proveedor VARCHAR(100) NOT NULL,       -- Nombre del proveedor
  folio VARCHAR(50) NULL,                -- Folio interno
  folio_proveedor VARCHAR(100) NULL,     -- Folio del proveedor
  fecha DATE NOT NULL,                   -- Fecha del suministro
  
  -- Información del producto
  tipo_suministro ENUM('Material', 'Herramienta', 'Equipo Ligero', 'Acero', 
                      'Cimbra', 'Ferretería', 'Servicio', 'Consumible', 
                      'Maquinaria', 'Concreto') DEFAULT 'Material',
  nombre VARCHAR(255) NOT NULL,          -- Nombre del suministro
  codigo_producto VARCHAR(100) NULL,     -- SKU o código interno
  descripcion_detallada TEXT NULL,       -- Descripción detallada
  
  -- Cantidades
  cantidad DECIMAL(10,3) DEFAULT 0,      -- Cantidad principal
  unidad_medida VARCHAR(20) DEFAULT 'pz', -- Unidad (pz, m³, kg, etc.)
  m3_perdidos DECIMAL(10,3) DEFAULT 0,   -- Metros cúbicos perdidos
  m3_entregados DECIMAL(10,3) DEFAULT 0, -- Metros cúbicos entregados
  m3_por_entregar DECIMAL(10,3) DEFAULT 0, -- Pendientes por entregar
  
  -- Logística y tiempos
  vehiculo_transporte VARCHAR(50) NULL,   -- Placas del vehículo
  operador_responsable VARCHAR(100) NULL, -- Nombre del operador
  hora_salida TIME NULL,                  -- Hora de salida de planta
  hora_llegada TIME NULL,                 -- Hora de llegada a obra
  hora_inicio_descarga TIME NULL,         -- Inicio de descarga
  hora_fin_descarga TIME NULL,            -- Fin de descarga
  hora_salida_obra TIME NULL,             -- Salida de obra
  total_horas DECIMAL(4,2) NULL,          -- Total de horas calculado
  
  -- Financiero
  precio_unitario DECIMAL(10,2) DEFAULT 0, -- Precio por unidad
  costo_total DECIMAL(12,2) DEFAULT 0,     -- Costo total
  
  -- Estado y observaciones
  estado ENUM('Solicitado', 'Aprobado', 'Pedido', 'En_Transito', 
             'Entregado', 'Cancelado') DEFAULT 'Solicitado',
  observaciones TEXT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔧 FUNCIONALIDADES PRINCIPALES

### 1. GESTIÓN DE SUMINISTROS

#### ✅ **Crear Suministro**
- **Endpoint**: `POST /api/suministros`
- **Validaciones**: 
  - Proveedor, fecha, proyecto y nombre son obligatorios
  - Verificación de duplicados por folio_proveedor
  - Validación de existencia del proyecto
- **Características**:
  - Autocompletado inteligente de proveedores
  - Detección de duplicados automática
  - Sugerencias basadas en historial

#### ✅ **Listar Suministros**
- **Endpoint**: `GET /api/suministros`
- **Filtros disponibles**:
  - `id_proyecto`: Filtrar por proyecto específico
  - `fecha_inicio` / `fecha_fin`: Rango de fechas
  - `proveedor`: Búsqueda por nombre de proveedor
  - `nombre`: Búsqueda por nombre del suministro
- **Características**:
  - Paginación automática
  - Ordenamiento por fecha y folio
  - Incluye información de proyecto y proveedor

#### ✅ **Actualizar Suministro**
- **Endpoint**: `PUT /api/suministros/:id`
- **Validaciones**:
  - Verificación de existencia
  - Validación de duplicados al actualizar
  - Conversión automática de decimales

#### ✅ **Eliminar Suministro**
- **Endpoint**: `DELETE /api/suministros/:id`
- **Características**: Eliminación física del registro

---

### 2. GESTIÓN DE PROVEEDORES

#### ✅ **Autocompletado Inteligente**
- **Endpoint**: `GET /api/proveedores/search?q=término`
- **Características**:
  - Búsqueda por nombre y razón social
  - Creación automática de proveedores nuevos
  - Tipos: Material, Servicio, Equipo, Mixto

#### ✅ **Crear/Obtener Proveedor**
- **Endpoint**: `POST /api/proveedores/create-or-get`
- **Lógica**: Si el proveedor existe, lo devuelve; si no, lo crea automáticamente

---

### 3. CATEGORIZACIÓN AVANZADA

#### **Tipos de Suministros**
```javascript
const CATEGORIAS_SUMINISTRO = {
  'Material': 'Material',           // Materiales básicos
  'Herramienta': 'Herramienta',     // Herramientas manuales
  'Equipo Ligero': 'Equipo Ligero', // Equipos portátiles
  'Acero': 'Acero',                 // Estructuras metálicas
  'Cimbra': 'Cimbra',               // Sistemas de cimbrado
  'Ferretería': 'Ferretería',       // Ferretería general
  'Servicio': 'Servicio',           // Servicios y mano de obra
  'Consumible': 'Consumible',       // Materiales consumibles
  'Maquinaria': 'Maquinaria',       // Maquinaria pesada
  'Concreto': 'Concreto'            // Concreto y premezclados
};
```

#### **Unidades de Medida**
```javascript
const UNIDADES_MEDIDA = {
  'pz': 'Pieza (pz)',
  'm³': 'Metro cúbico (m³)',
  'm²': 'Metro cuadrado (m²)',
  'm': 'Metro lineal (m)',
  'kg': 'Kilogramo (kg)',
  'ton': 'Tonelada (ton)',
  'lt': 'Litro (lt)',
  'hr': 'Hora (hr)',
  'día': 'Día (día)',
  'caja': 'Caja (caja)',
  'saco': 'Saco (saco)',
  'bote': 'Bote (bote)',
  'rollo': 'Rollo (rollo)',
  'ml': 'Metro lineal (ml)',
  'gl': 'Galón (gl)',
  'jgo': 'Juego (jgo)'
};
```

#### **Estados del Suministro**
```javascript
const ESTADOS_SUMINISTRO = {
  'Solicitado': 'Solicitado',       // Inicial, pendiente de aprobación
  'Aprobado': 'Aprobado',           // Aprobado para compra
  'Pedido': 'Pedido',               // Pedido realizado al proveedor
  'En_Transito': 'En Tránsito',     // En camino a la obra
  'Entregado': 'Entregado',         // Entregado en obra
  'Cancelado': 'Cancelado'          // Cancelado
};
```

---

### 4. SISTEMA DE CONTROL LOGÍSTICO

#### **Seguimiento de Tiempos**
- ⏰ **Hora de salida**: Salida de planta/almacén
- 🚚 **Hora de llegada**: Llegada a obra
- 📦 **Inicio descarga**: Inicio del proceso de descarga
- ✅ **Fin descarga**: Finalización de descarga
- 🔄 **Salida obra**: Salida del vehículo de la obra
- ⏱️ **Total horas**: Cálculo automático del tiempo total

#### **Control de Vehículos**
- 🚛 **Vehículo transporte**: Placas o identificador
- 👤 **Operador responsable**: Nombre del conductor/operador

---

### 5. SISTEMA DE ANÁLISIS Y REPORTES

#### ✅ **Dashboard de Suministros**
- **Endpoint**: `GET /api/reportes/dashboard-suministros`
- **Métricas incluidas**:
  - Total gastado en suministros
  - Total de registros
  - Metros cúbicos de concreto
  - Proveedores únicos
  - Consumo por obra
  - Distribución por proveedores
  - Tipos de materiales más utilizados

#### **Gráficas Implementadas** (Chart.js)
1. **📊 Gastos por Mes** - Análisis temporal de costos
2. **🥧 Valor por Categoría** - Distribución de gastos por tipo
3. **📈 Suministros por Mes** - Frecuencia de entregas
4. **🏗️ Gastos por Proyecto** - Distribución por obra
5. **🏪 Gastos por Proveedor** - Análisis de proveedores
6. **📊 Cantidad por Estado** - Estado de los suministros
7. **🔄 Distribución por Tipos** - Análisis de categorías
8. **📈 Tendencia de Entregas** - Evolución temporal

---

## 🎨 INTERFAZ DE USUARIO

### **Página Principal** (`/desktop/src/renderer/pages/Suministros.jsx`)

#### **Secciones Principales:**

1. **📋 Lista de Suministros**
   - Tabla responsive con paginación
   - Filtros por proyecto, proveedor, categoría, estado
   - Búsqueda en tiempo real
   - Acciones: Ver, Editar, Eliminar

2. **➕ Modal de Creación/Edición**
   - Formulario completo con validaciones
   - Autocompletado de proveedores
   - Detección de duplicados
   - Campos específicos por tipo de suministro

3. **📊 Panel de Gráficas**
   - Dashboard interactivo
   - Filtros de fecha y proyecto
   - Múltiples tipos de visualización
   - Exportación de datos

4. **🔍 Sistema de Filtros**
   - Filtros múltiples combinables
   - Búsqueda avanzada
   - Guardado de preferencias

#### **Componentes Auxiliares:**

- **`ProveedorAutocomplete.jsx`**: Autocompletado inteligente de proveedores
- **`DateInput.jsx`**: Selector de fechas optimizado
- **`TimeInput.jsx`**: Selector de horas para logística

---

## 🔐 SISTEMA DE PERMISOS

### **Autenticación Requerida**
- Todas las rutas requieren token JWT válido
- Middleware: `verifyToken`

### **Roles y Permisos**
- **👤 Usuario Normal**: Puede ver y crear suministros
- **👑 Administrador**: Acceso completo + estadísticas avanzadas

---

## 🚀 CARACTERÍSTICAS AVANZADAS

### **1. Detección Inteligente de Duplicados**
```javascript
// Verifica duplicados por:
- folio_proveedor (principal)
- nombre + código_producto + proyecto
- Sugiere registros similares antes de crear
```

### **2. Autocompletado Contextual**
```javascript
// Sugerencias automáticas de:
- Nombres de suministros basados en historial
- Códigos de producto frecuentes
- Proveedores por tipo de suministro
```

### **3. Cálculos Automáticos**
```javascript
// El sistema calcula automáticamente:
- total_horas = hora_fin_descarga - hora_salida
- costo_total = cantidad * precio_unitario
- m3_por_entregar = cantidad - m3_entregados - m3_perdidos
```

### **4. Búsqueda Avanzada**
```javascript
// Búsqueda por múltiples campos:
- Nombre del suministro
- Código de producto
- Nombre del proveedor
- Descripción detallada
- Folio del proveedor
```

---

## 📱 CARACTERÍSTICAS DE LA INTERFAZ

### **Diseño Responsivo**
- ✅ Optimizado para pantallas grandes (desktop)
- ✅ Tabla responsive con scroll horizontal
- ✅ Modales adaptativos
- ✅ Gráficas escalables

### **Tema Oscuro/Claro**
- ✅ Soporte completo para ambos temas
- ✅ Gráficas adaptables al tema
- ✅ Iconografía consistente

### **Experiencia de Usuario**
- ✅ Notificaciones toast integradas
- ✅ Loading states en todas las operaciones
- ✅ Confirmaciones para acciones destructivas
- ✅ Shortcuts de teclado para formularios

---

## 🔧 CONFIGURACIÓN PARA BETA

### **Variables de Entorno**
```env
# Frontend (.env)
VITE_API_URL=https://sistema-gestion-vlock-production.up.railway.app/api
VITE_NODE_ENV=production

# Backend
DATABASE_URL=mysql://usuario:password@host:puerto/database
JWT_SECRET=tu_jwt_secret_aqui
PORT=4000
```

### **Scripts de Build**
```json
{
  "scripts": {
    "build": "npm run build:vite && npm run build:electron",
    "build:vite": "vite build",
    "build:electron": "electron-builder",
    "dist": "npm run build && electron-builder --publish=never"
  }
}
```

---

## 🧪 ESTADO DE DESARROLLO

### **✅ COMPLETADO**
- [x] CRUD completo de suministros
- [x] Gestión de proveedores
- [x] Sistema de filtros y búsqueda
- [x] Dashboard con gráficas
- [x] Detección de duplicados
- [x] Autocompletado inteligente
- [x] Control logístico básico
- [x] Responsive design
- [x] Integración con Railway (producción)

### **🚧 EN DESARROLLO/FUTURO**
- [ ] Sistema de archivos adjuntos
- [ ] Notificaciones push
- [ ] Exportación a Excel/PDF
- [ ] API de integración con ERP
- [ ] Módulo de inventarios
- [ ] Workflow de aprobaciones
- [ ] App móvil nativa

---

## 📋 CHECKLIST PARA BETA

### **Antes del Empaquetado:**
- [x] Backend desplegado en Railway
- [x] Base de datos configurada
- [x] Variables de entorno configuradas
- [x] Frontend conectado al backend de producción
- [x] Pruebas de funcionalidad básica
- [x] Gráficas funcionando correctamente

### **Para el Empaquetado:**
- [ ] Verificar credenciales de admin (admin@vlock.com / admin123)
- [ ] Probar login y navegación básica
- [ ] Crear algunos registros de prueba
- [ ] Verificar que las gráficas cargan datos
- [ ] Empaquetar con electron-builder
- [ ] Generar instalador para la plataforma objetivo

---

## 🎯 GUÍA DE USO PARA BETA

### **Login Inicial**
```
Email: admin@vlock.com
Password: admin123
```

### **Flujo Básico de Uso:**
1. **Crear Proyecto** (si no existe)
2. **Navegar a Suministros**
3. **Crear Primer Suministro**:
   - Seleccionar proyecto
   - Autocompletar proveedor
   - Llenar información básica
   - Guardar
4. **Ver Dashboard** (botón "Mostrar Gráficas")
5. **Filtrar y Buscar** registros existentes

---

## 🏁 CONCLUSIÓN

El módulo de **Suministros** está completamente funcional y listo para la versión beta. Proporciona una base sólida para la gestión de materiales con capacidades avanzadas de análisis y un diseño profesional. La integración con Railway garantiza estabilidad y la arquitectura permite escalabilidad futura.

**¿Estás listo para empaquetar la beta? 🚀**
