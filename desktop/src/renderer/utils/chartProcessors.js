/**
 * Funciones de procesamiento de datos para gráficas de suministros
 * Parte 2: Funciones adicionales
 */

import { formatUnidadMedida, formatCurrency } from './formatters';
import { computeGastoFromItem } from './calc';
import { NominaService } from '../services/nominas/nominaService';

/**
 * Procesar gastos por proyecto
 */
export const processGastosPorProyecto = (data, proyectos) => {
  const gastosPorProyecto = {};
  
  data.forEach(suministro => {
    const proyectoId = suministro.id_proyecto;
    const proyectoNombre = proyectos?.find(p => p.id_proyecto === proyectoId)?.nombre || `Proyecto ${proyectoId}`;
    
    const gasto = computeGastoFromItem(suministro);
    
    if (!gastosPorProyecto[proyectoNombre]) {
      gastosPorProyecto[proyectoNombre] = 0;
    }
    gastosPorProyecto[proyectoNombre] += gasto;
  });

  const proyectosList = Object.keys(gastosPorProyecto);
  const valores = proyectosList.map(proyecto => Math.round(gastosPorProyecto[proyecto] * 100) / 100);

  return {
    labels: proyectosList,
    datasets: [{
      label: 'Gasto Total ($)',
      data: valores,
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(14, 165, 233, 0.8)'
      ],
      borderWidth: 2
    }]
  };
};

/**
 * Procesar gastos por proveedor
 */
export const processGastosPorProveedor = (data) => {
  try {
    const gastosPorProveedor = {};
    const cantidadPorProveedor = {};
    
    data.forEach(suministro => {
      try {
        const proveedorNombre = suministro.proveedor?.nombre || 'Sin proveedor';
        
        const cantidad = parseFloat(suministro.cantidad) || 0;
        const gasto = computeGastoFromItem(suministro);
        
        if (!gastosPorProveedor[proveedorNombre]) {
          gastosPorProveedor[proveedorNombre] = 0;
          cantidadPorProveedor[proveedorNombre] = 0;
        }
        gastosPorProveedor[proveedorNombre] += gasto;
        cantidadPorProveedor[proveedorNombre] += cantidad;
      } catch (itemError) {
        console.error('Error procesando suministro en gastosPorProveedor:', itemError, suministro);
      }
    });

    const proveedoresList = Object.keys(gastosPorProveedor);
    const valores = proveedoresList.map(proveedor => Math.round(gastosPorProveedor[proveedor] * 100) / 100);

    if (proveedoresList.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Gasto Total ($)',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const coloresProveedores = [
      'rgba(34, 197, 94, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(20, 184, 166, 0.8)',
      'rgba(217, 70, 239, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(139, 92, 246, 0.8)'
    ];

    const total = valores.reduce((sum, val) => sum + val, 0);
    const proveedorTop = proveedoresList[valores.indexOf(Math.max(...valores))];
    const porcentajeTop = ((Math.max(...valores) / total) * 100).toFixed(1);

    return {
      labels: proveedoresList,
      datasets: [{
        label: 'Gasto Total ($)',
        data: valores,
        backgroundColor: coloresProveedores.slice(0, proveedoresList.length),
        borderColor: coloresProveedores.slice(0, proveedoresList.length).map(color => 
          color.replace('0.8', '1')
        ),
        borderWidth: 2,
        hoverBorderWidth: 3
      }],
      metrics: {
        total,
        proveedorTop,
        porcentajeTop,
        totalProveedores: proveedoresList.length,
        gastoPromedio: (total / proveedoresList.length).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error procesando gastosPorProveedor:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Gasto Total ($)',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Procesar cantidad por estado
 */
export const processCantidadPorEstado = (data) => {
  try {
    const cantidadPorEstado = {};
    const suministrosPorEstado = {};
    
    data.forEach(suministro => {
      try {
        const estado = suministro.estado || 'Sin estado';
        
        if (!cantidadPorEstado[estado]) {
          cantidadPorEstado[estado] = 0;
          suministrosPorEstado[estado] = [];
        }
        cantidadPorEstado[estado]++;
        suministrosPorEstado[estado].push(suministro);
      } catch (itemError) {
        console.error('Error procesando suministro en cantidadPorEstado:', itemError, suministro);
      }
    });

    const estados = Object.keys(cantidadPorEstado);
    const cantidades = estados.map(estado => cantidadPorEstado[estado]);

    if (estados.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Cantidad de Suministros',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const coloresEstados = {
      'Sin estado': 'rgba(156, 163, 175, 0.8)',
      'Solicitado': 'rgba(156, 163, 175, 0.8)',
      'Aprobado': 'rgba(59, 130, 246, 0.8)',
      'Pedido': 'rgba(245, 158, 11, 0.8)',
      'En Tránsito': 'rgba(139, 92, 246, 0.8)',
      'Entregado': 'rgba(16, 185, 129, 0.8)',
      'Cancelado': 'rgba(239, 68, 68, 0.8)',
      'Recibido': 'rgba(34, 197, 94, 0.8)',
      'Pendiente': 'rgba(251, 146, 60, 0.8)'
    };

    const backgroundColors = estados.map(estado => 
      coloresEstados[estado] || 'rgba(107, 114, 128, 0.8)'
    );

    const total = cantidades.reduce((sum, cant) => sum + cant, 0);
    const estadoTop = estados[cantidades.indexOf(Math.max(...cantidades))];
    const porcentajeTop = ((Math.max(...cantidades) / total) * 100).toFixed(1);

    return {
      labels: estados,
      datasets: [{
        label: 'Cantidad de Suministros',
        data: cantidades,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
        borderWidth: 2,
        hoverBorderWidth: 3
      }],
      metrics: {
        total,
        estadoTop,
        porcentajeTop,
        totalEstados: estados.length,
        promedioXEstado: (total / estados.length).toFixed(0)
      }
    };
  } catch (error) {
    console.error('Error procesando cantidadPorEstado:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Cantidad de Suministros',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Procesar distribución de tipos
 */
export const processDistribucionTipos = (data, categoriasDinamicas) => {
  try {
    const distribucionTipos = {};
    const valorPorTipo = {};
    
    data.forEach(suministro => {
      try {
        let tipo = 'Sin tipo';
        
        if (suministro.id_categoria_suministro && categoriasDinamicas && categoriasDinamicas.length > 0) {
          const categoriaObj = categoriasDinamicas.find(cat => cat.id_categoria == suministro.id_categoria_suministro);
          if (categoriaObj) {
            tipo = categoriaObj.tipo || categoriaObj.nombre;
          }
        } else if (typeof suministro.categoria === 'object' && suministro.categoria?.tipo) {
          tipo = suministro.categoria.tipo;
        } else if (suministro.tipo_suministro) {
          tipo = suministro.tipo_suministro;
        } else if (typeof suministro.categoria === 'object' && suministro.categoria?.nombre) {
          tipo = suministro.categoria.nombre;
        } else if (suministro.categoria && typeof suministro.categoria === 'string') {
          tipo = suministro.categoria;
        }

        const cantidad = parseFloat(suministro.cantidad) || 0;
        const valor = computeGastoFromItem(suministro);
        
        if (!distribucionTipos[tipo]) {
          distribucionTipos[tipo] = 0;
          valorPorTipo[tipo] = 0;
        }
        distribucionTipos[tipo]++;
        valorPorTipo[tipo] += valor;
      } catch (itemError) {
        console.error('Error procesando suministro en distribucionTipos:', itemError, suministro);
      }
    });

    const tipos = Object.keys(distribucionTipos);
    const cantidades = tipos.map(tipo => distribucionTipos[tipo]);

    if (tipos.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Cantidad de Suministros',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const coloresTipos = [
      'rgba(239, 68, 68, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(20, 184, 166, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(34, 197, 94, 0.8)'
    ];

    const total = cantidades.reduce((sum, cant) => sum + cant, 0);
    const tipoTop = tipos[cantidades.indexOf(Math.max(...cantidades))];
    const porcentajeTop = ((Math.max(...cantidades) / total) * 100).toFixed(1);

    return {
      labels: tipos,
      datasets: [{
        label: 'Cantidad de Suministros',
        data: cantidades,
        backgroundColor: coloresTipos.slice(0, tipos.length),
        borderColor: coloresTipos.slice(0, tipos.length).map(color => 
          color.replace('0.8', '1')
        ),
        borderWidth: 2,
        hoverBorderWidth: 3
      }],
      metrics: {
        total,
        tipoTop,
        porcentajeTop,
        totalTipos: tipos.length,
        valorTotal: Object.values(valorPorTipo).reduce((sum, val) => sum + val, 0).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error procesando distribucionTipos:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Cantidad de Suministros',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

// Este archivo continuará siendo exportado...
// Las funciones restantes se agregarán en archivos adicionales por tamaño
