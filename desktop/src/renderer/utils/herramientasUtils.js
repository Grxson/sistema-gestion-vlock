// Utilidades y constantes específicas del módulo de Herramientas

// Estados de herramientas (números del backend)
export const ESTADOS_HERRAMIENTAS = {
  1: { label: 'Disponible', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  2: { label: 'Prestado', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  3: { label: 'Mantenimiento', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  4: { label: 'Reparación', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  5: { label: 'Fuera de Servicio', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
};

export const getEstadoConfig = (estado) => ESTADOS_HERRAMIENTAS[estado] || ESTADOS_HERRAMIENTAS[1];

// Cálculos de stock
export const calcularPorcentajeStock = (stockInicial, stockActual) => {
  if (stockInicial === undefined || stockActual === undefined) return null;
  const si = parseInt(stockInicial);
  const sa = parseInt(stockActual);
  if (isNaN(si) || isNaN(sa)) return null;
  if (si <= 0) return null;
  if (sa < 0) return null;
  if (sa > si) return 100;
  return Math.round((sa / si) * 100);
};

export const getEstadoStock = (porcentaje) => {
  if (porcentaje === null || porcentaje === undefined) return null;
  if (porcentaje <= 10) return { nivel: 'crítico', color: 'text-red-600', bg: 'bg-red-50' };
  if (porcentaje <= 25) return { nivel: 'bajo', color: 'text-orange-600', bg: 'bg-orange-50' };
  if (porcentaje <= 50) return { nivel: 'medio', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  return { nivel: 'bueno', color: 'text-green-600', bg: 'bg-green-50' };
};

// Configuración de tipos de movimiento
export const getMovimientoConfig = (tipoMovimiento) => {
  const configs = {
    'Entrada': {
      titulo: 'Entrada de Stock',
      color: '#10B981',
      bgClass: 'bg-green-100 dark:bg-green-900/30',
      textClass: 'text-green-600 dark:text-green-400',
      badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      iconName: 'FaBoxOpen'
    },
    'Salida': {
      titulo: 'Salida de Stock',
      color: '#F59E0B',
      bgClass: 'bg-amber-100 dark:bg-amber-900/30',
      textClass: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      iconName: 'FaShare'
    },
    'Devolucion': {
      titulo: 'Devolución',
      color: '#06B6D4',
      bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
      textClass: 'text-cyan-600 dark:text-cyan-400',
      badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
      iconName: 'FaUndo'
    },
    'Baja': {
      titulo: 'Baja de Inventario',
      color: '#EF4444',
      bgClass: 'bg-red-100 dark:bg-red-900/30',
      textClass: 'text-red-600 dark:text-red-400',
      badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      iconName: 'FaTrash'
    }
  };
  return configs[tipoMovimiento] || configs['Entrada'];
};

// Dataset de ejemplo para el dashboard
export const EJEMPLO_DASHBOARD_HERRAMIENTAS = {
  resumen: {
    total_herramientas: 120,
    disponibles: 78,
    prestadas: 24,
    mantenimiento: 12,
    fuera_servicio: 6,
    stock_bajo: 9,
    total_stock: 560
  },
  proximosMantenimientos: [
    { id: 1, herramienta: 'Taladro Percutor', codigo: 'TL-001', tipo: 'Mecánico', fecha_mantenimiento: new Date().toISOString(), dias_restantes: 5 },
    { id: 2, herramienta: 'Sierra Circular', codigo: 'SR-020', tipo: 'Eléctrico', fecha_mantenimiento: new Date(Date.now()+1000*60*60*24*8).toISOString(), dias_restantes: 8 },
    { id: 3, herramienta: 'Compresor de Aire', codigo: 'CP-005', tipo: 'Neumático', fecha_mantenimiento: new Date(Date.now()+1000*60*60*24*20).toISOString(), dias_restantes: 20 }
  ],
  herramientasPrestadas: [
    { id: 1, herramienta: 'Rotomartillo', codigo: 'RT-110', empleado: 'Juan Pérez', proyecto: 'Torre Norte', dias_prestado: 3, fecha_prestamo: new Date(Date.now()-1000*60*60*24*3).toISOString() },
    { id: 2, herramienta: 'Llave de Impacto', codigo: 'LI-034', empleado: 'María López', proyecto: 'Plaza Centro', dias_prestado: 7, fecha_prestamo: new Date(Date.now()-1000*60*60*24*7).toISOString() }
  ],
  valorInventario: 254000,
  estadisticasUso: {
    herramientas_mas_usadas: [
      { nombre: 'Taladro', usos: 28 },
      { nombre: 'Sierra', usos: 21 },
      { nombre: 'Rotomartillo', usos: 17 },
      { nombre: 'Llave Impacto', usos: 12 }
    ]
  }
};
