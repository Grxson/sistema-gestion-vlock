/**
 * Funciones de procesamiento para análisis de horas, unidades y métricas especializadas
 * Parte 4: Horas, unidades y análisis comparativos
 */

import { formatUnidadMedida, formatCurrency, formatNumber } from './formatters';

/**
 * Horas trabajadas por mes
 */
export const processHorasPorMes = (data) => {
  try {
    const horasPorMes = {};
    const mesesSet = new Set();
    
    data.forEach(suministro => {
      try {
        const horas = parseFloat(suministro.horas_trabajadas) || 0;
        
        if (horas > 0) {
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
              
              if (!horasPorMes[mes]) {
                horasPorMes[mes] = 0;
              }
              horasPorMes[mes] += horas;
            }
          }
        }
      } catch (itemError) {
        console.error('Error procesando horas por mes:', itemError, suministro);
      }
    });

    const mesesOrdenados = Array.from(mesesSet).sort();
    const horas = mesesOrdenados.map(mes => Math.round(horasPorMes[mes] * 100) / 100);

    if (mesesOrdenados.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Horas Trabajadas',
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

    const totalHoras = horas.reduce((sum, h) => sum + h, 0);
    const promedioHoras = (totalHoras / horas.length).toFixed(1);
    const mesConMasHoras = mesesNombres[horas.indexOf(Math.max(...horas))];

    return {
      labels: mesesNombres,
      datasets: [{
        label: 'Horas Trabajadas',
        data: horas,
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }],
      metrics: {
        totalHoras: totalHoras.toFixed(1),
        promedioHoras,
        mesConMasHoras,
        maxHoras: Math.max(...horas).toFixed(1)
      }
    };
  } catch (error) {
    console.error('Error procesando horasPorMes:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Horas Trabajadas',
        data: [0],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)'
      }]
    };
  }
};

/**
 * Horas trabajadas por equipo/profesional
 */
export const processHorasPorEquipo = (data) => {
  try {
    const horasPorProfesional = {};
    const costoHorasPorProfesional = {};
    
    data.forEach(suministro => {
      try {
        const horas = parseFloat(suministro.horas_trabajadas) || 0;
        
        if (horas > 0) {
          const profesional = suministro.profesional?.nombre || 
                            suministro.nombre_profesional || 
                            'Sin especificar';
          
          const cantidad = parseFloat(suministro.cantidad) || 0;
          const precio = parseFloat(suministro.precio_unitario) || 0;
          const costo = cantidad * precio;
          
          if (!horasPorProfesional[profesional]) {
            horasPorProfesional[profesional] = 0;
            costoHorasPorProfesional[profesional] = 0;
          }
          horasPorProfesional[profesional] += horas;
          costoHorasPorProfesional[profesional] += costo;
        }
      } catch (itemError) {
        console.error('Error procesando horas por equipo:', itemError, suministro);
      }
    });

    const profesionales = Object.keys(horasPorProfesional);
    const horas = profesionales.map(prof => Math.round(horasPorProfesional[prof] * 100) / 100);

    if (profesionales.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Horas Trabajadas',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const totalHoras = horas.reduce((sum, h) => sum + h, 0);
    const totalCosto = Object.values(costoHorasPorProfesional).reduce((sum, c) => sum + c, 0);
    const profesionalTop = profesionales[horas.indexOf(Math.max(...horas))];

    return {
      labels: profesionales,
      datasets: [{
        label: 'Horas Trabajadas',
        data: horas,
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2
      }],
      metrics: {
        totalHoras: totalHoras.toFixed(1),
        totalCosto: totalCosto.toFixed(2),
        profesionalTop,
        horasTop: Math.max(...horas).toFixed(1),
        costoPromedioPorHora: (totalCosto / totalHoras).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error procesando horasPorEquipo:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Horas Trabajadas',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Comparativo de horas vs costo
 */
export const processComparativoHorasVsCosto = (data) => {
  try {
    const datosPorProyecto = {};
    
    data.forEach(suministro => {
      try {
        const horas = parseFloat(suministro.horas_trabajadas) || 0;
        
        if (horas > 0) {
          const proyecto = suministro.proyecto?.nombre || 
                          suministro.nombre_proyecto || 
                          `Proyecto ${suministro.id_proyecto || 'Sin ID'}`;
          
          const cantidad = parseFloat(suministro.cantidad) || 0;
          const precio = parseFloat(suministro.precio_unitario) || 0;
          const costo = cantidad * precio;
          
          if (!datosPorProyecto[proyecto]) {
            datosPorProyecto[proyecto] = { horas: 0, costo: 0 };
          }
          datosPorProyecto[proyecto].horas += horas;
          datosPorProyecto[proyecto].costo += costo;
        }
      } catch (itemError) {
        console.error('Error procesando comparativo horas vs costo:', itemError, suministro);
      }
    });

    const proyectos = Object.keys(datosPorProyecto);
    const horas = proyectos.map(proy => Math.round(datosPorProyecto[proy].horas * 100) / 100);
    const costos = proyectos.map(proy => Math.round(datosPorProyecto[proy].costo * 100) / 100);

    if (proyectos.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [
          {
            label: 'Horas Trabajadas',
            data: [0],
            backgroundColor: 'rgba(156, 163, 175, 0.8)'
          },
          {
            label: 'Costo ($)',
            data: [0],
            backgroundColor: 'rgba(156, 163, 175, 0.8)'
          }
        ]
      };
    }

    const totalHoras = horas.reduce((sum, h) => sum + h, 0);
    const totalCosto = costos.reduce((sum, c) => sum + c, 0);

    return {
      labels: proyectos,
      datasets: [
        {
          label: 'Horas Trabajadas',
          data: horas,
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Costo ($)',
          data: costos,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          yAxisID: 'y1'
        }
      ],
      metrics: {
        totalHoras: totalHoras.toFixed(1),
        totalCosto: totalCosto.toFixed(2),
        costoPromedioPorHora: (totalCosto / totalHoras).toFixed(2),
        proyectos: proyectos.length
      }
    };
  } catch (error) {
    console.error('Error procesando comparativo horas vs costo:', error);
    return {
      labels: ['Error'],
      datasets: [
        {
          label: 'Horas Trabajadas',
          data: [0],
          backgroundColor: 'rgba(239, 68, 68, 0.8)'
        },
        {
          label: 'Costo ($)',
          data: [0],
          backgroundColor: 'rgba(239, 68, 68, 0.8)'
        }
      ]
    };
  }
};

/**
 * Distribución de unidades de medida
 */
export const processDistribucionUnidades = (data) => {
  try {
    const cantidadPorUnidad = {};
    const valorPorUnidad = {};
    
    data.forEach(suministro => {
      try {
        const unidad = formatUnidadMedida(suministro.unidad_medida) || 'Sin unidad';
        
        const cantidad = parseFloat(suministro.cantidad) || 0;
        const precio = parseFloat(suministro.precio_unitario) || 0;
        const valor = cantidad * precio;
        
        if (!cantidadPorUnidad[unidad]) {
          cantidadPorUnidad[unidad] = 0;
          valorPorUnidad[unidad] = 0;
        }
        cantidadPorUnidad[unidad] += cantidad;
        valorPorUnidad[unidad] += valor;
      } catch (itemError) {
        console.error('Error procesando distribución de unidades:', itemError, suministro);
      }
    });

    const unidades = Object.keys(cantidadPorUnidad);
    const cantidades = unidades.map(unidad => Math.round(cantidadPorUnidad[unidad] * 100) / 100);

    if (unidades.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Cantidad',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const totalCantidad = cantidades.reduce((sum, cant) => sum + cant, 0);
    const totalValor = Object.values(valorPorUnidad).reduce((sum, val) => sum + val, 0);
    const unidadTop = unidades[cantidades.indexOf(Math.max(...cantidades))];

    return {
      labels: unidades,
      datasets: [{
        label: 'Cantidad',
        data: cantidades,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(20, 184, 166, 0.8)'
        ],
        borderWidth: 2
      }],
      metrics: {
        totalUnidades: unidades.length,
        totalCantidad: totalCantidad.toFixed(2),
        totalValor: totalValor.toFixed(2),
        unidadTop,
        cantidadTop: Math.max(...cantidades).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error procesando distribución de unidades:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Cantidad',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Cantidad por unidad de medida
 */
export const processCantidadPorUnidad = (data) => {
  try {
    const cantidadPorUnidad = {};
    const itemsPorUnidad = {};
    
    data.forEach(suministro => {
      try {
        const unidad = formatUnidadMedida(suministro.unidad_medida) || 'Sin unidad';
        const cantidad = parseFloat(suministro.cantidad) || 0;
        
        if (!cantidadPorUnidad[unidad]) {
          cantidadPorUnidad[unidad] = 0;
          itemsPorUnidad[unidad] = 0;
        }
        cantidadPorUnidad[unidad] += cantidad;
        itemsPorUnidad[unidad]++;
      } catch (itemError) {
        console.error('Error procesando cantidad por unidad:', itemError, suministro);
      }
    });

    const unidades = Object.keys(cantidadPorUnidad);
    const cantidades = unidades.map(unidad => Math.round(cantidadPorUnidad[unidad] * 100) / 100);

    if (unidades.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Cantidad Total',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const totalCantidad = cantidades.reduce((sum, cant) => sum + cant, 0);
    const unidadTop = unidades[cantidades.indexOf(Math.max(...cantidades))];

    return {
      labels: unidades,
      datasets: [{
        label: 'Cantidad Total',
        data: cantidades,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }],
      metrics: {
        totalUnidades: unidades.length,
        totalCantidad: totalCantidad.toFixed(2),
        unidadTop,
        cantidadTop: Math.max(...cantidades).toFixed(2),
        totalItems: Object.values(itemsPorUnidad).reduce((sum, items) => sum + items, 0)
      }
    };
  } catch (error) {
    console.error('Error procesando cantidad por unidad:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Cantidad Total',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Valor por unidad de medida
 */
export const processValorPorUnidad = (data) => {
  try {
    const valorPorUnidad = {};
    const cantidadPorUnidad = {};
    
    data.forEach(suministro => {
      try {
        const unidad = formatUnidadMedida(suministro.unidad_medida) || 'Sin unidad';
        
        const cantidad = parseFloat(suministro.cantidad) || 0;
        const precio = parseFloat(suministro.precio_unitario) || 0;
        const valor = cantidad * precio;
        
        if (!valorPorUnidad[unidad]) {
          valorPorUnidad[unidad] = 0;
          cantidadPorUnidad[unidad] = 0;
        }
        valorPorUnidad[unidad] += valor;
        cantidadPorUnidad[unidad] += cantidad;
      } catch (itemError) {
        console.error('Error procesando valor por unidad:', itemError, suministro);
      }
    });

    const unidades = Object.keys(valorPorUnidad);
    const valores = unidades.map(unidad => Math.round(valorPorUnidad[unidad] * 100) / 100);

    if (unidades.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Valor Total ($)',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const totalValor = valores.reduce((sum, val) => sum + val, 0);
    const unidadTop = unidades[valores.indexOf(Math.max(...valores))];

    return {
      labels: unidades,
      datasets: [{
        label: 'Valor Total ($)',
        data: valores,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }],
      metrics: {
        totalUnidades: unidades.length,
        totalValor: totalValor.toFixed(2),
        unidadTop,
        valorTop: Math.max(...valores).toFixed(2),
        valorPromedio: (totalValor / unidades.length).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error procesando valor por unidad:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Valor Total ($)',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Comparativo de unidades de medida
 */
export const processComparativoUnidades = (data) => {
  try {
    const datosPorUnidad = {};
    
    data.forEach(suministro => {
      try {
        const unidad = formatUnidadMedida(suministro.unidad_medida) || 'Sin unidad';
        
        const cantidad = parseFloat(suministro.cantidad) || 0;
        const precio = parseFloat(suministro.precio_unitario) || 0;
        const valor = cantidad * precio;
        
        if (!datosPorUnidad[unidad]) {
          datosPorUnidad[unidad] = { cantidad: 0, valor: 0 };
        }
        datosPorUnidad[unidad].cantidad += cantidad;
        datosPorUnidad[unidad].valor += valor;
      } catch (itemError) {
        console.error('Error procesando comparativo de unidades:', itemError, suministro);
      }
    });

    const unidades = Object.keys(datosPorUnidad);
    const cantidades = unidades.map(unidad => Math.round(datosPorUnidad[unidad].cantidad * 100) / 100);
    const valores = unidades.map(unidad => Math.round(datosPorUnidad[unidad].valor * 100) / 100);

    if (unidades.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [
          {
            label: 'Cantidad',
            data: [0],
            backgroundColor: 'rgba(156, 163, 175, 0.8)'
          },
          {
            label: 'Valor ($)',
            data: [0],
            backgroundColor: 'rgba(156, 163, 175, 0.8)'
          }
        ]
      };
    }

    const totalCantidad = cantidades.reduce((sum, cant) => sum + cant, 0);
    const totalValor = valores.reduce((sum, val) => sum + val, 0);

    return {
      labels: unidades,
      datasets: [
        {
          label: 'Cantidad',
          data: cantidades,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Valor ($)',
          data: valores,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          yAxisID: 'y1'
        }
      ],
      metrics: {
        totalUnidades: unidades.length,
        totalCantidad: totalCantidad.toFixed(2),
        totalValor: totalValor.toFixed(2),
        valorPromedioPorUnidad: (totalValor / totalCantidad).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error procesando comparativo de unidades:', error);
    return {
      labels: ['Error'],
      datasets: [
        {
          label: 'Cantidad',
          data: [0],
          backgroundColor: 'rgba(239, 68, 68, 0.8)'
        },
        {
          label: 'Valor ($)',
          data: [0],
          backgroundColor: 'rgba(239, 68, 68, 0.8)'
        }
      ]
    };
  }
};

/**
 * Total de metros cúbicos
 */
export const processTotalMetrosCubicos = (data) => {
  try {
    const m3PorCategoria = {};
    
    data.forEach(suministro => {
      try {
        const unidad = suministro.unidad_medida || '';
        
        if (unidad.toLowerCase().includes('m³') || 
            unidad.toLowerCase().includes('m3') || 
            unidad.toLowerCase().includes('metro') && unidad.toLowerCase().includes('cubico')) {
          
          const categoria = typeof suministro.categoria === 'object' 
            ? suministro.categoria?.nombre || 'Sin categoría'
            : suministro.categoria || 'Sin categoría';
          
          const cantidad = parseFloat(suministro.cantidad) || 0;
          
          if (!m3PorCategoria[categoria]) {
            m3PorCategoria[categoria] = 0;
          }
          m3PorCategoria[categoria] += cantidad;
        }
      } catch (itemError) {
        console.error('Error procesando metros cúbicos:', itemError, suministro);
      }
    });

    const categorias = Object.keys(m3PorCategoria);
    const m3 = categorias.map(cat => Math.round(m3PorCategoria[cat] * 100) / 100);

    if (categorias.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Metros Cúbicos',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const totalM3 = m3.reduce((sum, val) => sum + val, 0);
    const categoriaTop = categorias[m3.indexOf(Math.max(...m3))];

    return {
      labels: categorias,
      datasets: [{
        label: 'Metros Cúbicos',
        data: m3,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 2
      }],
      metrics: {
        totalM3: totalM3.toFixed(2),
        categorias: categorias.length,
        categoriaTop,
        m3Top: Math.max(...m3).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error procesando total de metros cúbicos:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Metros Cúbicos',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Análisis de unidades de medida
 */
export const processAnalisisUnidadesMedida = (data) => {
  try {
    const analisisPorUnidad = {};
    
    data.forEach(suministro => {
      try {
        const unidad = formatUnidadMedida(suministro.unidad_medida) || 'Sin unidad';
        
        const cantidad = parseFloat(suministro.cantidad) || 0;
        const precio = parseFloat(suministro.precio_unitario) || 0;
        const valor = cantidad * precio;
        
        if (!analisisPorUnidad[unidad]) {
          analisisPorUnidad[unidad] = {
            cantidad: 0,
            valor: 0,
            items: 0,
            precioMin: Infinity,
            precioMax: 0
          };
        }
        
        analisisPorUnidad[unidad].cantidad += cantidad;
        analisisPorUnidad[unidad].valor += valor;
        analisisPorUnidad[unidad].items++;
        analisisPorUnidad[unidad].precioMin = Math.min(analisisPorUnidad[unidad].precioMin, precio);
        analisisPorUnidad[unidad].precioMax = Math.max(analisisPorUnidad[unidad].precioMax, precio);
      } catch (itemError) {
        console.error('Error procesando análisis de unidades:', itemError, suministro);
      }
    });

    const unidades = Object.keys(analisisPorUnidad);
    const valores = unidades.map(unidad => Math.round(analisisPorUnidad[unidad].valor * 100) / 100);

    if (unidades.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Valor Total ($)',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const totalValor = valores.reduce((sum, val) => sum + val, 0);
    const totalItems = Object.values(analisisPorUnidad).reduce((sum, datos) => sum + datos.items, 0);
    const unidadTop = unidades[valores.indexOf(Math.max(...valores))];

    return {
      labels: unidades,
      datasets: [{
        label: 'Valor Total ($)',
        data: valores,
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
        totalUnidades: unidades.length,
        totalValor: totalValor.toFixed(2),
        totalItems,
        unidadTop,
        valorTop: Math.max(...valores).toFixed(2),
        detalles: analisisPorUnidad
      }
    };
  } catch (error) {
    console.error('Error procesando análisis de unidades de medida:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Valor Total ($)',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};
