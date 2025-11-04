import { useState, useCallback } from 'react';
import { NominaService } from '../services/nominas/nominaService';
import { formatUnidadMedida, formatCurrency, formatNumber } from '../utils/formatters';

// Importar funciones de procesamiento de datos
import {
  processGastosPorProyecto,
  processGastosPorProveedor,
  processCantidadPorEstado,
  processDistribucionTipos
} from '../utils/chartProcessors';

import {
  processAnalisisPorTipoGasto,
  processTendenciaEntregas,
  processCodigosProducto,
  getUnidadPrincipalCategoria,
  getTituloAnalisisTecnico,
  processAnalisisTecnicoInteligente,
  processConcretoDetallado,
  processGastosPorTipoDoughnut
} from '../utils/chartProcessorsAdvanced';

import {
  processHorasPorMes,
  processHorasPorEquipo,
  processComparativoHorasVsCosto,
  processDistribucionUnidades,
  processCantidadPorUnidad,
  processValorPorUnidad,
  processComparativoUnidades,
  processTotalMetrosCubicos,
  processAnalisisUnidadesMedida
} from '../utils/chartProcessorsHours';

import {
  processGastosPorCategoriaDetallado,
  processAnalisisFrecuenciaSuministros,
  processSuministrosPorMes,
  processEficienciaProveedores,
  processAnalisisCostosPorProyecto
} from '../utils/chartProcessorsFinal';

/**
 * Hook personalizado para manejar toda la lógica de procesamiento de datos de gráficas
 * de suministros. Centraliza todas las funciones process* que antes estaban en Suministros.jsx
 * 
 * @param {Function} showError - Función para mostrar errores
 * @returns {Object} - Objeto con chartData, loading y loadChartData
 */
export const useChartData = (showError) => {
  const [chartData, setChartData] = useState({
    gastosPorMes: null,
    valorPorCategoria: null,
    suministrosPorMes: null,
    gastosPorProyecto: null,
    gastosPorProveedor: null,
    cantidadPorEstado: null,
    distribucionTipos: null,
    analisisPorTipoGasto: null,
    tendenciaEntregas: null,
    codigosProducto: null,
    analisisTecnicoConcreto: null,
    concretoDetallado: null,
    horasPorMes: null,
    horasPorProyecto: null,
    horasPorEquipo: null,
    comparativoHorasVsCosto: null,
    gastosPorCategoriaDetallado: null,
    analisisFrecuenciaSuministros: null,
    distribucionUnidades: null,
    cantidadPorUnidad: null,
    valorPorUnidad: null,
    analisisUnidadesMedida: null,
    comparativoUnidades: null
  });

  const [loadingCharts, setLoadingCharts] = useState(false);

    // ============================================================================
    // FUNCIONES LOCALES DE PROCESAMIENTO (Optimizadas para este hook)
    // ============================================================================

    /**
     * Procesar gastos por mes con métricas
     */
    const processGastosPorMes = (data) => {
      const gastosPorMes = {};
      const cantidadPorMes = {};
    
      data.forEach(suministro => {
        const fecha = new Date(suministro.fecha_necesaria || suministro.fecha || suministro.createdAt);
        const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
        const cantidad = parseFloat(suministro.cantidad) || 0;
        const precio = parseFloat(suministro.precio_unitario) || 0;
        const gasto = cantidad * precio;
      
        if (!gastosPorMes[mesAnio]) {
          gastosPorMes[mesAnio] = 0;
          cantidadPorMes[mesAnio] = 0;
        }
        gastosPorMes[mesAnio] += gasto;
        cantidadPorMes[mesAnio]++;
      });

      const meses = Object.keys(gastosPorMes).sort();
      const valores = meses.map(mes => Math.round(gastosPorMes[mes] * 100) / 100);
      const cantidades = meses.map(mes => cantidadPorMes[mes]);
    
      // Calcular métricas para insights
      const totalGasto = valores.reduce((sum, val) => sum + val, 0);
      const promedioMensual = totalGasto / (meses.length || 1);
      const ultimoMes = valores[valores.length - 1] || 0;
      const mesAnterior = valores[valores.length - 2] || 0;
      const cambioMensual = mesAnterior ? ((ultimoMes - mesAnterior) / mesAnterior * 100) : 0;

      return {
        labels: meses.map(mes => {
          const [año, mesNum] = mes.split('-');
          const nombreMes = new Date(año, mesNum - 1).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
          return nombreMes;
        }),
        datasets: [{
          label: 'Gasto Total ($)',
          data: valores,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8
        }],
        metrics: {
          totalGasto,
          promedioMensual,
          cambioMensual,
          ultimoMes,
          totalItems: cantidades.reduce((sum, cant) => sum + cant, 0)
        }
      };
    };

    /**
     * Procesar valor por categoría
     */
    const processValorPorCategoria = (data, categoriasDinamicas) => {
      try {
        const valorPorCategoria = {};
        const cantidadPorCategoria = {};
      
        data.forEach(suministro => {
          try {
            let categoria = 'Sin categoría';
          
            if (suministro.id_categoria_suministro && categoriasDinamicas && categoriasDinamicas.length > 0) {
              const categoriaObj = categoriasDinamicas.find(cat => cat.id_categoria == suministro.id_categoria_suministro);
              if (categoriaObj) {
                categoria = categoriaObj.nombre;
              }
            } else if (typeof suministro.categoria === 'object' && suministro.categoria?.nombre) {
              categoria = suministro.categoria.nombre;
            } else if (suministro.categoria && typeof suministro.categoria === 'string') {
              categoria = suministro.categoria;
            } else if (suministro.tipo_suministro) {
              categoria = suministro.tipo_suministro;
            }

            const cantidad = parseFloat(suministro.cantidad) || 0;
            const precio = parseFloat(suministro.precio_unitario) || 0;
            const valor = cantidad * precio;
          
            if (!valorPorCategoria[categoria]) {
              valorPorCategoria[categoria] = 0;
              cantidadPorCategoria[categoria] = 0;
            }
            valorPorCategoria[categoria] += valor;
            cantidadPorCategoria[categoria] += cantidad;
          } catch (itemError) {
            console.error('Error procesando suministro en valorPorCategoria:', itemError, suministro);
          }
        });

        const categorias = Object.keys(valorPorCategoria);
        const valores = categorias.map(cat => Math.round(valorPorCategoria[cat] * 100) / 100);

        if (categorias.length === 0) {
          return {
            labels: ['Sin datos'],
            datasets: [{
              label: 'Valor Total ($)',
              data: [0],
              backgroundColor: ['rgba(156, 163, 175, 0.8)']
            }]
          };
        }

        const coloresProfesionales = [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ];

        const total = valores.reduce((sum, val) => sum + val, 0);
        const categoriaTop = categorias[valores.indexOf(Math.max(...valores))];
        const porcentajeTop = ((Math.max(...valores) / total) * 100).toFixed(1);

        return {
          labels: categorias,
          datasets: [{
            label: 'Valor Total ($)',
            data: valores,
            backgroundColor: coloresProfesionales.slice(0, categorias.length),
            borderColor: coloresProfesionales.slice(0, categorias.length).map(color => 
              color.replace('0.8', '1')
            ),
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverOffset: 15
          }],
          metrics: {
            total,
            categoriaTop,
            porcentajeTop,
            totalCategorias: categorias.length,
            cantidadItems: Object.values(cantidadPorCategoria).reduce((sum, cant) => sum + cant, 0)
          }
        };
      } catch (error) {
        console.error('Error procesando valorPorCategoria:', error);
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

  // ============================================================================
  // FUNCIÓN PRINCIPAL DE CARGA DE DATOS
  // ============================================================================

  const loadChartData = useCallback(async (suministros, chartFilters, categoriasDinamicas, proyectos, calculateTotal) => {
    setLoadingCharts(true);
    try {
      console.log('📊 Cargando datos de gráficas...', {
        suministrosCount: suministros?.length || 0,
        filtros: chartFilters
      });

      // Aplicar todos los filtros
      const filteredData = suministros.filter(suministro => {
        // Filtro por fechas
        const fechaSuministro = new Date(suministro.fecha_necesaria || suministro.fecha || suministro.createdAt);
        const fechaInicio = new Date(chartFilters.fechaInicio);
        const fechaFin = new Date(chartFilters.fechaFin);
        const matchesFecha = fechaSuministro >= fechaInicio && fechaSuministro <= fechaFin;
        
        // Filtro por proyecto
        const matchesProyecto = !chartFilters.proyectoId || 
                               suministro.id_proyecto?.toString() === chartFilters.proyectoId;
        
        // Filtro por proveedor
        const matchesProveedor = !chartFilters.proveedorNombre || 
                                suministro.proveedor?.nombre === chartFilters.proveedorNombre;
        
        // Filtro por tipo de suministro
        const categoriaNombre = typeof suministro.categoria === 'object' && suministro.categoria 
          ? suministro.categoria.nombre 
          : suministro.categoria;
        const matchesTipo = !chartFilters.tipoSuministro || 
                           (suministro.tipo_suministro || categoriaNombre) === chartFilters.tipoSuministro;
        
        // Filtro por estado
        const matchesEstado = !chartFilters.estado || suministro.estado === chartFilters.estado;
        
        return matchesFecha && matchesProyecto && matchesProveedor && matchesTipo && matchesEstado;
      });

      console.log('📊 Datos filtrados:', filteredData.length, 'registros');

      // Procesar datos para todas las gráficas con manejo de errores individual
      const chartDataProcessed = {};
      
      try {
        chartDataProcessed.gastosPorMes = processGastosPorMes(filteredData);
      } catch (error) {
        console.error('❌ Error en gastosPorMes:', error);
        chartDataProcessed.gastosPorMes = null;
      }

      try {
        chartDataProcessed.valorPorCategoria = processValorPorCategoria(filteredData, categoriasDinamicas);
      } catch (error) {
        console.error('❌ Error en valorPorCategoria:', error);
        chartDataProcessed.valorPorCategoria = null;
      }

      try {
        chartDataProcessed.suministrosPorMes = processSuministrosPorMes(filteredData);
      } catch (error) {
        console.error('❌ Error en suministrosPorMes:', error);
        chartDataProcessed.suministrosPorMes = null;
      }

      try {
        chartDataProcessed.gastosPorProyecto = processGastosPorProyecto(filteredData, proyectos);
      } catch (error) {
        console.error('❌ Error en gastosPorProyecto:', error);
        chartDataProcessed.gastosPorProyecto = null;
      }

      try {
        chartDataProcessed.gastosPorProveedor = processGastosPorProveedor(filteredData);
      } catch (error) {
        console.error('❌ Error en gastosPorProveedor:', error);
        chartDataProcessed.gastosPorProveedor = null;
      }

      try {
        chartDataProcessed.cantidadPorEstado = processCantidadPorEstado(filteredData);
      } catch (error) {
        console.error('❌ Error en cantidadPorEstado:', error);
        chartDataProcessed.cantidadPorEstado = null;
      }

      try {
        chartDataProcessed.distribucionTipos = processDistribucionTipos(filteredData, categoriasDinamicas);
      } catch (error) {
        console.error('❌ Error en distribucionTipos:', error);
        chartDataProcessed.distribucionTipos = null;
      }

      try {
        chartDataProcessed.analisisPorTipoGasto = await processAnalisisPorTipoGasto(filteredData, chartFilters, categoriasDinamicas);
      } catch (error) {
        console.error('❌ Error en analisisPorTipoGasto:', error);
        chartDataProcessed.analisisPorTipoGasto = null;
      }

        // Nueva gráfica de pastel por tipo de gasto
        try {
          chartDataProcessed.gastosPorTipoDoughnut = await processGastosPorTipoDoughnut(filteredData);
        } catch (error) {
          console.error('❌ Error en gastosPorTipoDoughnut:', error);
          chartDataProcessed.gastosPorTipoDoughnut = null;
        }

      try {
        chartDataProcessed.tendenciaEntregas = processTendenciaEntregas(filteredData);
      } catch (error) {
        console.error('❌ Error en tendenciaEntregas:', error);
        chartDataProcessed.tendenciaEntregas = null;
      }

      try {
        chartDataProcessed.codigosProducto = processCodigosProducto(filteredData);
      } catch (error) {
        console.error('❌ Error en codigosProducto:', error);
        chartDataProcessed.codigosProducto = null;
      }

      try {
        chartDataProcessed.analisisTecnicoConcreto = processAnalisisTecnicoInteligente(filteredData, chartFilters, categoriasDinamicas);
      } catch (error) {
        console.error('❌ Error en analisisTecnicoConcreto:', error);
        chartDataProcessed.analisisTecnicoConcreto = null;
      }

      try {
        chartDataProcessed.concretoDetallado = processConcretoDetallado(filteredData);
      } catch (error) {
        console.error('❌ Error en concretoDetallado:', error);
        chartDataProcessed.concretoDetallado = null;
      }

      try {
        chartDataProcessed.horasPorMes = processHorasPorMes(filteredData);
      } catch (error) {
        console.error('❌ Error en horasPorMes:', error);
        chartDataProcessed.horasPorMes = null;
      }

      try {
        chartDataProcessed.horasPorEquipo = processHorasPorEquipo(filteredData);
      } catch (error) {
        console.error('❌ Error en horasPorEquipo:', error);
        chartDataProcessed.horasPorEquipo = null;
      }

      try {
        chartDataProcessed.comparativoHorasVsCosto = processComparativoHorasVsCosto(filteredData);
      } catch (error) {
        console.error('❌ Error en comparativoHorasVsCosto:', error);
        chartDataProcessed.comparativoHorasVsCosto = null;
      }

      try {
        chartDataProcessed.gastosPorCategoriaDetallado = processGastosPorCategoriaDetallado(filteredData, categoriasDinamicas, calculateTotal);
      } catch (error) {
        console.error('❌ Error en gastosPorCategoriaDetallado:', error);
        chartDataProcessed.gastosPorCategoriaDetallado = null;
      }

      try {
        chartDataProcessed.analisisFrecuenciaSuministros = processAnalisisFrecuenciaSuministros(filteredData);
      } catch (error) {
        console.error('❌ Error en analisisFrecuenciaSuministros:', error);
        chartDataProcessed.analisisFrecuenciaSuministros = null;
      }

      try {
        chartDataProcessed.distribucionUnidades = processDistribucionUnidades(filteredData);
      } catch (error) {
        console.error('❌ Error en distribucionUnidades:', error);
        chartDataProcessed.distribucionUnidades = null;
      }

      try {
        chartDataProcessed.cantidadPorUnidad = processCantidadPorUnidad(filteredData);
      } catch (error) {
        console.error('❌ Error en cantidadPorUnidad:', error);
        chartDataProcessed.cantidadPorUnidad = null;
      }

      try {
        chartDataProcessed.valorPorUnidad = processValorPorUnidad(filteredData, calculateTotal);
      } catch (error) {
        console.error('❌ Error en valorPorUnidad:', error);
        chartDataProcessed.valorPorUnidad = null;
      }

      try {
        chartDataProcessed.comparativoUnidades = processComparativoUnidades(filteredData, calculateTotal);
      } catch (error) {
        console.error('❌ Error en comparativoUnidades:', error);
        chartDataProcessed.comparativoUnidades = null;
      }

      try {
        chartDataProcessed.totalMetrosCubicos = processTotalMetrosCubicos(filteredData);
      } catch (error) {
        console.error('❌ Error en totalMetrosCubicos:', error);
        chartDataProcessed.totalMetrosCubicos = null;
      }

      try {
        chartDataProcessed.analisisUnidadesMedida = processAnalisisUnidadesMedida(filteredData, chartFilters);
      } catch (error) {
        console.error('❌ Error en analisisUnidadesMedida:', error);
        chartDataProcessed.analisisUnidadesMedida = null;
      }

      setChartData(chartDataProcessed);
      console.log('✅ Datos de gráficas cargados exitosamente');
      
    } catch (error) {
      console.error('❌ Error cargando datos de gráficas:', error);
      if (showError) {
        showError('Error', 'No se pudieron cargar los datos de las gráficas');
      }
    } finally {
      setLoadingCharts(false);
    }
  }, [showError]);

  return {
    chartData,
    loadingCharts,
    loadChartData
  };
};
