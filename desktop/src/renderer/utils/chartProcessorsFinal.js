/**
 * Funciones finales de procesamiento para análisis detallados y específicos
 * Parte 5: Análisis por categoría y frecuencia
 */

import { formatUnidadMedida, formatCurrency, formatNumber } from './formatters';
import { computeGastoFromItem } from './calc';

/**
 * Gastos detallados por categoría
 */
export const processGastosPorCategoriaDetallado = (data, categoriasDinamicas) => {
  try {
    const gastosPorCategoria = {};
    const cantidadPorCategoria = {};
    const itemsPorCategoria = {};
    
    data.forEach(suministro => {
      try {
        let categoriaActual = 'Sin categoría';
        
        if (suministro.id_categoria_suministro && categoriasDinamicas && categoriasDinamicas.length > 0) {
          const categoriaObj = categoriasDinamicas.find(cat => cat.id_categoria == suministro.id_categoria_suministro);
          if (categoriaObj) {
            categoriaActual = categoriaObj.nombre;
          }
        } else if (typeof suministro.categoria === 'object' && suministro.categoria?.nombre) {
          categoriaActual = suministro.categoria.nombre;
        } else if (suministro.categoria && typeof suministro.categoria === 'string') {
          categoriaActual = suministro.categoria;
        }

  const cantidad = parseFloat(suministro.cantidad) || 0;
  const gasto = computeGastoFromItem(suministro);
        
        if (!gastosPorCategoria[categoriaActual]) {
          gastosPorCategoria[categoriaActual] = 0;
          cantidadPorCategoria[categoriaActual] = 0;
          itemsPorCategoria[categoriaActual] = 0;
        }
        gastosPorCategoria[categoriaActual] += gasto;
        cantidadPorCategoria[categoriaActual] += cantidad;
        itemsPorCategoria[categoriaActual]++;
      } catch (itemError) {
        console.error('Error procesando gasto por categoría detallado:', itemError, suministro);
      }
    });

    const categorias = Object.keys(gastosPorCategoria);
    const gastos = categorias.map(cat => Math.round(gastosPorCategoria[cat] * 100) / 100);

    if (categorias.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Gasto Total ($)',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const colores = [
      'rgba(239, 68, 68, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(20, 184, 166, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(34, 197, 94, 0.8)'
    ];

    const totalGastos = gastos.reduce((sum, gasto) => sum + gasto, 0);
    const categoriaTop = categorias[gastos.indexOf(Math.max(...gastos))];
    const porcentajeTop = ((Math.max(...gastos) / totalGastos) * 100).toFixed(1);

    return {
      labels: categorias,
      datasets: [{
        label: 'Gasto Total ($)',
        data: gastos,
        backgroundColor: colores.slice(0, categorias.length),
        borderColor: colores.slice(0, categorias.length).map(color => 
          color.replace('0.8', '1')
        ),
        borderWidth: 2,
        hoverBorderWidth: 3
      }],
      metrics: {
        totalCategorias: categorias.length,
        totalGastos: totalGastos.toFixed(2),
        categoriaTop,
        gastoTop: Math.max(...gastos).toFixed(2),
        porcentajeTop,
        gastoPromedio: (totalGastos / categorias.length).toFixed(2),
        detalles: {
          gastos: gastosPorCategoria,
          cantidades: cantidadPorCategoria,
          items: itemsPorCategoria
        }
      }
    };
  } catch (error) {
    console.error('Error procesando gastos por categoría detallado:', error);
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
 * Análisis de frecuencia de suministros
 */
export const processAnalisisFrecuenciaSuministros = (data) => {
  try {
    const frecuenciaPorProducto = {};
    const valorPorProducto = {};
    
    data.forEach(suministro => {
      try {
        const descripcion = suministro.descripcion || suministro.descripcion_producto || 'Sin descripción';
        const producto = descripcion.substring(0, 50);
        
  const cantidad = parseFloat(suministro.cantidad) || 0;
  const valor = computeGastoFromItem(suministro);
        
        if (!frecuenciaPorProducto[producto]) {
          frecuenciaPorProducto[producto] = 0;
          valorPorProducto[producto] = 0;
        }
        frecuenciaPorProducto[producto]++;
        valorPorProducto[producto] += valor;
      } catch (itemError) {
        console.error('Error procesando frecuencia de suministros:', itemError, suministro);
      }
    });

    const productos = Object.keys(frecuenciaPorProducto);
    const frecuencias = productos.map(prod => frecuenciaPorProducto[prod]);

    if (productos.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Frecuencia',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    // Obtener los 15 productos más frecuentes
    const top15Indices = frecuencias
      .map((freq, index) => ({ freq, index }))
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 15)
      .map(item => item.index);

    const top15Productos = top15Indices.map(i => productos[i]);
    const top15Frecuencias = top15Indices.map(i => frecuencias[i]);

    const totalFrecuencia = frecuencias.reduce((sum, freq) => sum + freq, 0);
    const totalValor = Object.values(valorPorProducto).reduce((sum, val) => sum + val, 0);
    const productoTop = top15Productos[0];
    const frecuenciaTop = top15Frecuencias[0];

    return {
      labels: top15Productos,
      datasets: [{
        label: 'Frecuencia',
        data: top15Frecuencias,
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2
      }],
      metrics: {
        totalProductos: productos.length,
        totalFrecuencia,
        totalValor: totalValor.toFixed(2),
        productoTop,
        frecuenciaTop,
        frecuenciaPromedio: (totalFrecuencia / productos.length).toFixed(1)
      }
    };
  } catch (error) {
    console.error('Error procesando análisis de frecuencia:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Frecuencia',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Suministros por mes
 */
export const processSuministrosPorMes = (data) => {
  try {
    const suministrosPorMes = {};
    const mesesSet = new Set();
    
    data.forEach(suministro => {
      try {
        let fechaAUsar = null;
        
        if (suministro.fecha_registro) {
          fechaAUsar = suministro.fecha_registro;
        } else if (suministro.fecha_entrega) {
          fechaAUsar = suministro.fecha_entrega;
        }

        if (fechaAUsar) {
          const fecha = new Date(fechaAUsar);
          if (!isNaN(fecha.getTime())) {
            const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            mesesSet.add(mes);
            
            if (!suministrosPorMes[mes]) {
              suministrosPorMes[mes] = 0;
            }
            suministrosPorMes[mes]++;
          }
        }
      } catch (itemError) {
        console.error('Error procesando suministro por mes:', itemError, suministro);
      }
    });

    const mesesOrdenados = Array.from(mesesSet).sort();
    const cantidades = mesesOrdenados.map(mes => suministrosPorMes[mes] || 0);

    if (mesesOrdenados.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Cantidad de Suministros',
          data: [0],
          borderColor: 'rgba(156, 163, 175, 1)',
          backgroundColor: 'rgba(156, 163, 175, 0.2)'
        }]
      };
    }

    const mesesNombres = mesesOrdenados.map(mes => {
      const [año, mesNum] = mes.split('-');
      const fecha = new Date(año, parseInt(mesNum) - 1);
      return fecha.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
    });

    const total = cantidades.reduce((sum, cant) => sum + cant, 0);
    const promedio = (total / cantidades.length).toFixed(1);
    const mesConMas = mesesNombres[cantidades.indexOf(Math.max(...cantidades))];

    return {
      labels: mesesNombres,
      datasets: [{
        label: 'Cantidad de Suministros',
        data: cantidades,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }],
      metrics: {
        total,
        promedio,
        mesConMas,
        maxSuministros: Math.max(...cantidades)
      }
    };
  } catch (error) {
    console.error('Error procesando suministros por mes:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Cantidad de Suministros',
        data: [0],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)'
      }]
    };
  }
};

/**
 * Eficiencia de proveedores (entregas a tiempo)
 */
export const processEficienciaProveedores = (data) => {
  try {
    const datosProveedores = {};
    
    data.forEach(suministro => {
      try {
        const proveedorNombre = suministro.proveedor?.nombre || 'Sin proveedor';
        
        if (!datosProveedores[proveedorNombre]) {
          datosProveedores[proveedorNombre] = {
            total: 0,
            aTiempo: 0,
            tarde: 0,
            pendiente: 0
          };
        }
        
        datosProveedores[proveedorNombre].total++;
        
        const estado = suministro.estado || '';
        if (estado === 'Entregado' || estado === 'Recibido') {
          datosProveedores[proveedorNombre].aTiempo++;
        } else if (estado === 'Cancelado') {
          datosProveedores[proveedorNombre].tarde++;
        } else {
          datosProveedores[proveedorNombre].pendiente++;
        }
      } catch (itemError) {
        console.error('Error procesando eficiencia de proveedores:', itemError, suministro);
      }
    });

    const proveedores = Object.keys(datosProveedores);
    const eficiencia = proveedores.map(prov => {
      const datos = datosProveedores[prov];
      return datos.total > 0 
        ? Math.round((datos.aTiempo / datos.total) * 100 * 100) / 100 
        : 0;
    });

    if (proveedores.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Eficiencia (%)',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const eficienciaPromedio = (eficiencia.reduce((sum, ef) => sum + ef, 0) / proveedores.length).toFixed(1);
    const proveedorTop = proveedores[eficiencia.indexOf(Math.max(...eficiencia))];
    const eficienciaTop = Math.max(...eficiencia).toFixed(1);

    return {
      labels: proveedores,
      datasets: [{
        label: 'Eficiencia (%)',
        data: eficiencia,
        backgroundColor: eficiencia.map(ef => 
          ef >= 80 ? 'rgba(16, 185, 129, 0.8)' :
          ef >= 60 ? 'rgba(245, 158, 11, 0.8)' :
          'rgba(239, 68, 68, 0.8)'
        ),
        borderWidth: 2
      }],
      metrics: {
        totalProveedores: proveedores.length,
        eficienciaPromedio,
        proveedorTop,
        eficienciaTop,
        detalles: datosProveedores
      }
    };
  } catch (error) {
    console.error('Error procesando eficiencia de proveedores:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Eficiencia (%)',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Análisis de costos por proyecto
 */
export const processAnalisisCostosPorProyecto = (data, proyectos) => {
  try {
    const costosPorProyecto = {};
    const itemsPorProyecto = {};
    
    data.forEach(suministro => {
      try {
        const proyectoId = suministro.id_proyecto;
        const proyectoNombre = proyectos?.find(p => p.id_proyecto === proyectoId)?.nombre || `Proyecto ${proyectoId}`;
        
  const costo = computeGastoFromItem(suministro);
        
        if (!costosPorProyecto[proyectoNombre]) {
          costosPorProyecto[proyectoNombre] = 0;
          itemsPorProyecto[proyectoNombre] = 0;
        }
        costosPorProyecto[proyectoNombre] += costo;
        itemsPorProyecto[proyectoNombre]++;
      } catch (itemError) {
        console.error('Error procesando costos por proyecto:', itemError, suministro);
      }
    });

    const proyectosList = Object.keys(costosPorProyecto);
    const costos = proyectosList.map(proy => Math.round(costosPorProyecto[proy] * 100) / 100);

    if (proyectosList.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Costo Total ($)',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const totalCostos = costos.reduce((sum, costo) => sum + costo, 0);
    const proyectoTop = proyectosList[costos.indexOf(Math.max(...costos))];
    const costoTop = Math.max(...costos).toFixed(2);
    const porcentajeTop = ((Math.max(...costos) / totalCostos) * 100).toFixed(1);

    return {
      labels: proyectosList,
      datasets: [{
        label: 'Costo Total ($)',
        data: costos,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderWidth: 2
      }],
      metrics: {
        totalProyectos: proyectosList.length,
        totalCostos: totalCostos.toFixed(2),
        proyectoTop,
        costoTop,
        porcentajeTop,
        costoPromedio: (totalCostos / proyectosList.length).toFixed(2),
        detalles: {
          costos: costosPorProyecto,
          items: itemsPorProyecto
        }
      }
    };
  } catch (error) {
    console.error('Error procesando análisis de costos por proyecto:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Costo Total ($)',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};
