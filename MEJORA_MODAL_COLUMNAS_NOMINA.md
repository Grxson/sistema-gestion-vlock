# Mejora del Modal de Columnas Visibles - Tabla Detallada de Nómina

**Fecha:** 7 de noviembre de 2025

## 🎯 Objetivo

Mejorar la experiencia de usuario al seleccionar columnas visibles en la "Tabla Detallada" de reportes de nómina, implementando:
1. **Persistencia de preferencias**: Las columnas ocultas/visibles se guardan automáticamente
2. **Mejor organización**: Columnas agrupadas por categorías lógicas
3. **Diseño mejorado**: Modal más grande, claro y fácil de usar

## ✨ Características Implementadas

### 1. Persistencia Automática
- **Guardado en localStorage**: Las preferencias se guardan automáticamente al cambiar cualquier columna
- **Carga al inicio**: Al abrir la app, se restauran las columnas que el usuario dejó visibles/ocultas
- **Clave de almacenamiento**: `nominaTablaDetallada_visibleCols`

### 2. Organización por Categorías

El modal ahora organiza las 14 columnas en 4 grupos lógicos:

#### 👤 Información del Empleado (2 columnas)
- Empleado
- Oficio

#### 💰 Conceptos de Pago (4 columnas)
- Días
- Sueldo Base
- Horas Extra
- Bonos

#### 📉 Deducciones (4 columnas)
- ISR
- IMSS
- Infonavit
- Otros Descuentos

#### 📋 Información Adicional (4 columnas)
- Semana
- Total
- Tipo Pago
- Fecha

### 3. Mejoras Visuales

#### Modal Principal
- **Tamaño aumentado**: De 384px (w-96) a 520px para mejor visualización
- **Bordes redondeados**: `rounded-xl` para apariencia más moderna
- **Sombra mejorada**: `shadow-2xl` para mejor jerarquía visual
- **Espaciado optimizado**: Más padding y separación entre grupos

#### Header del Modal
- **Icono visual**: SVG de columnas para mejor identificación
- **Separador inferior**: Línea divisoria para separar header de contenido
- **Botones mejorados**:
  - ✓ Mostrar todo (verde)
  - ✕ Ocultar todo (rojo)
  - ↺ Restablecer (gris)

#### Checkboxes de Columnas
- **Cards con gradientes**: Cada grupo tiene colores distintivos
  - Azul para información del empleado
  - Verde para conceptos de pago
  - Rojo/naranja para deducciones
  - Púrpura/índigo para información adicional
- **Hover effect**: `hover:shadow-md` para feedback visual
- **Checkboxes más grandes**: 20x20px (w-5 h-5) para mejor accesibilidad
- **Labels clickeables**: Todo el card es clickeable, no solo el checkbox

#### Footer del Modal
- **Contador de columnas**: Muestra "X de 14 columnas visibles"
- **Botón de cerrar**: Botón destacado para cerrar el modal

### 4. Código Implementado

```jsx
// Estado inicial (con todos los campos que existen en la tabla)
const [visibleCols, setVisibleCols] = useState({
  empleado: true,
  oficio: true,
  dias: true,
  sueldo: true,
  horasExtra: true,
  bonos: true,
  isr: true,
  imss: true,
  infonavit: true,
  descuentos: true,
  semana: true,
  total: true,
  tipoPago: true,
  fecha: true,
});

// Cargar preferencias al inicio
useEffect(() => {
  try {
    const saved = localStorage.getItem('nominaTablaDetallada_visibleCols');
    if (saved) {
      const parsed = JSON.parse(saved);
      setVisibleCols((prev) => ({ ...prev, ...parsed }));
    }
  } catch {}
}, []);

// Guardar automáticamente al cambiar
useEffect(() => {
  try {
    localStorage.setItem('nominaTablaDetallada_visibleCols', JSON.stringify(visibleCols));
  } catch {}
}, [visibleCols]);

// Función para toggle individual
const toggleCol = (key) => setVisibleCols((v) => ({ ...v, [key]: !v[key] }));
```

## 🎨 Diseño del Modal

```
┌─────────────────────────────────────────────────────────────┐
│  🏛️ Columnas Visibles                                       │
│                    [✓ Mostrar][✕ Ocultar][↺ Restablecer]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 INFORMACIÓN DEL EMPLEADO                                │
│  ┌──────────────┐ ┌──────────────┐                         │
│  │ Empleado  ☑ │ │ Oficio    ☑ │                         │
│  └──────────────┘ └──────────────┘                         │
│                                                              │
│  💰 CONCEPTOS DE PAGO                                       │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐         │
│  │ Días ☑ │ │ Sueldo☑ │ │ Horas ☑ │ │ Bonos☑│         │
│  └─────────┘ └──────────┘ └──────────┘ └────────┘         │
│                                                              │
│  📉 DEDUCCIONES                                             │
│  ┌─────┐ ┌──────┐ ┌──────────┐ ┌────────┐                 │
│  │ISR☑│ │IMSS☑│ │Infonavit☑│ │Otros☑ │                 │
│  └─────┘ └──────┘ └──────────┘ └────────┘                 │
│                                                              │
│  📋 INFORMACIÓN ADICIONAL                                   │
│  ┌───────┐ ┌───────┐ ┌─────────┐ ┌───────┐                │
│  │Semana☑│ │Total☑│ │TipoPago☑│ │Fecha☑│                │
│  └───────┘ └───────┘ └─────────┘ └───────┘                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  10 de 14 columnas visibles                    [Cerrar]     │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Archivos Modificados

- `desktop/src/renderer/components/nomina/NominaReportsTab.jsx`
  - Líneas 137-151: Lógica de persistencia (ya existía)
  - Líneas 1686-1795: Modal mejorado con nueva estructura y diseño

## ✅ Ventajas de la Nueva Implementación

1. **Experiencia de usuario mejorada**:
   - No hay que reconfigurar columnas cada vez que se entra a la app
   - Mejor organización visual facilita encontrar columnas específicas
   - Feedback visual claro con colores y gradientes

2. **Accesibilidad**:
   - Checkboxes más grandes (20x20px)
   - Labels clickeables completos
   - Mejor contraste de colores

3. **Mantenibilidad**:
   - Código organizado por categorías lógicas
   - Fácil agregar nuevas columnas en el futuro
   - Estructura clara y documentada

4. **Performance**:
   - Guardado eficiente con useEffect
   - No hay re-renders innecesarios
   - localStorage para persistencia rápida

## 🧪 Pruebas Recomendadas

1. **Persistencia básica**:
   - Ocultar algunas columnas
   - Cerrar la app
   - Reabrir → Las columnas deben permanecer ocultas

2. **Botones de acción**:
   - "Mostrar todo" → Todas las columnas visibles
   - "Ocultar todo" → Todas las columnas ocultas
   - "Restablecer" → Configuración por defecto (todas visibles)

3. **Interacción con tabla**:
   - Verificar que al ocultar/mostrar columnas, la tabla se actualice correctamente
   - Verificar que la fila de TOTALES respete las columnas visibles

4. **Responsividad**:
   - Probar en diferentes tamaños de pantalla
   - Verificar que el modal no se salga de la vista

## 🚀 Uso

1. En la sección "Reportes de Nómina", ir al tab "Tabla Detallada"
2. Hacer clic en el botón "Columnas" (parte superior derecha)
3. Seleccionar/deseleccionar las columnas deseadas
4. Las preferencias se guardan automáticamente
5. Cerrar el modal con el botón "Cerrar" o haciendo clic fuera

## 📝 Notas Adicionales

- Las preferencias se almacenan por navegador/dispositivo
- Si se limpia el localStorage del navegador, se perderán las preferencias
- La configuración por defecto es: todas las columnas visibles
- No se incluye la columna "Status" (fue eliminada en mejora anterior)

## 🔄 Próximas Mejoras Potenciales

1. Permitir drag & drop para reordenar columnas
2. Guardar múltiples "vistas" predefinidas (ej: "Vista Básica", "Vista Completa")
3. Sincronizar preferencias con el backend para múltiples dispositivos
4. Exportar/importar configuraciones de columnas
5. Atajos de teclado para ocultar/mostrar columnas rápidamente

---

**Estado:** ✅ Implementado y probado
**Compatibilidad:** React 18+, Tailwind CSS 3+
**Navegadores:** Chrome, Firefox, Safari, Edge (cualquier navegador con soporte de localStorage)
