import React, { useState, useEffect } from 'react';
import { 
  CalculatorIcon,
  ChartBarIcon,
  TrendingUpIcon,
  CpuChipIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Calculadora avanzada de costos con análisis inteligente
 * Similar a las herramientas de análisis de Opus
 */
const CalculadoraCostos = ({ 
  presupuestoData, 
  onActualizar, 
  onClose 
}) => {
  const [analisis, setAnalisis] = useState({
    resumen_costos: {},
    distribucion_por_categoria: {},
    indicadores_financieros: {},
    recomendaciones: [],
    alertas: [],
    comparativo_mercado: {}
  });
  
  const [configuracion, setConfiguracion] = useState({
    factor_complejidad: 1.0, // 0.8 - 1.5
    factor_regional: 1.0, // 0.9 - 1.3
    factor_temporal: 1.0, // 0.95 - 1.1 (inflación)
    incluir_contingencias: true,
    porcentaje_contingencias: 0.05, // 5%
    incluir_gastos_indirectos: true,
    porcentaje_gastos_indirectos: 0.15, // 15%
    incluir_financiamiento: false,
    tasa_financiamiento: 0.12, // 12% anual
    plazo_proyecto: 6 // meses
  });

  const [mostrarDetalles, setMostrarDetalles] = useState({});
  const [calculando, setCalculando] = useState(false);

  useEffect(() => {
    realizarAnalisis();
  }, [presupuestoData, configuracion]);

  const realizarAnalisis = async () => {
    setCalculando(true);
    
    try {
      // Simular análisis complejo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const nuevoAnalisis = {
        resumen_costos: calcularResumenCostos(),
        distribucion_por_categoria: calcularDistribucionCategorias(),
        indicadores_financieros: calcularIndicadoresFinancieros(),
        recomendaciones: generarRecomendaciones(),
        alertas: detectarAlertas(),
        comparativo_mercado: compararConMercado()
      };
      
      setAnalisis(nuevoAnalisis);
    } catch (error) {
      console.error('Error en análisis:', error);
    } finally {
      setCalculando(false);
    }
  };

  const calcularResumenCostos = () => {
    const subtotal = presupuestoData.subtotal || 0;
    const utilidad = presupuestoData.total_utilidad || 0;
    
    // Aplicar factores de ajuste
    const subtotalAjustado = subtotal * configuracion.factor_complejidad * configuracion.factor_regional * configuracion.factor_temporal;
    
    // Calcular costos adicionales
    const contingencias = configuracion.incluir_contingencias ? subtotalAjustado * configuracion.porcentaje_contingencias : 0;
    const gastosIndirectos = configuracion.incluir_gastos_indirectos ? subtotalAjustado * configuracion.porcentaje_gastos_indirectos : 0;
    
    const costoFinanciamiento = configuracion.incluir_financiamiento ? 
      (subtotalAjustado + contingencias + gastosIndirectos) * configuracion.tasa_financiamiento * (configuracion.plazo_proyecto / 12) : 0;
    
    const costoTotalSinUtilidad = subtotalAjustado + contingencias + gastosIndirectos + costoFinanciamiento;
    const costoTotalConUtilidad = costoTotalSinUtilidad + utilidad;
    const impuestos = presupuestoData.incluir_iva ? costoTotalConUtilidad * (presupuestoData.tasa_iva || 0.16) : 0;
    const precioFinal = costoTotalConUtilidad + impuestos;

    return {
      subtotal_original: subtotal,
      subtotal_ajustado: subtotalAjustado,
      contingencias,
      gastos_indirectos: gastosIndirectos,
      costo_financiamiento: costoFinanciamiento,
      utilidad,
      impuestos,
      precio_final: precioFinal,
      incremento_total: precioFinal - (subtotal + utilidad + impuestos),
      porcentaje_incremento: ((precioFinal - (subtotal + utilidad + impuestos)) / (subtotal + utilidad + impuestos)) * 100
    };
  };

  const calcularDistribucionCategorias = () => {
    const distribucion = {};
    const totalSubtotal = presupuestoData.subtotal || 0;
    
    // Agrupar partidas por categoría
    presupuestoData.partidas?.forEach(partida => {
      const categoria = partida.categoria || 'Sin categoría';
      if (!distribucion[categoria]) {
        distribucion[categoria] = {
          monto: 0,
          cantidad_partidas: 0,
          porcentaje: 0
        };
      }
      distribucion[categoria].monto += partida.importe || (partida.cantidad * partida.precio_unitario);
      distribucion[categoria].cantidad_partidas += 1;
    });

    // Calcular porcentajes
    Object.keys(distribucion).forEach(categoria => {
      distribucion[categoria].porcentaje = (distribucion[categoria].monto / totalSubtotal) * 100;
    });

    return distribucion;
  };

  const calcularIndicadoresFinancieros = () => {
    const resumen = calcularResumenCostos();
    const totalPartidas = presupuestoData.partidas?.length || 0;
    
    return {
      precio_por_partida: totalPartidas > 0 ? resumen.precio_final / totalPartidas : 0,
      margen_real: ((resumen.utilidad / resumen.precio_final) * 100).toFixed(2),
      costo_por_m2: 0, // TODO: calcular si se tiene área
      roi_estimado: ((resumen.utilidad / resumen.subtotal_ajustado) * 100).toFixed(2),
      factor_multiplicador: (resumen.precio_final / resumen.subtotal_original).toFixed(2),
      dias_recuperacion: configuracion.plazo_proyecto * 30, // días
      flujo_caja_mensual: resumen.precio_final / configuracion.plazo_proyecto
    };
  };

  const generarRecomendaciones = () => {
    const recomendaciones = [];
    const resumen = calcularResumenCostos();
    const indicadores = calcularIndicadoresFinancieros();
    
    // Análisis de margen
    if (parseFloat(indicadores.margen_real) < 10) {
      recomendaciones.push({
        tipo: 'warning',
        categoria: 'Rentabilidad',
        titulo: 'Margen de utilidad bajo',
        descripcion: `El margen actual de ${indicadores.margen_real}% está por debajo del recomendado (15-25%) para proyectos de construcción.`,
        accion: 'Considerar incrementar el margen de utilidad o revisar costos.'
      });
    }

    // Análisis de contingencias
    if (!configuracion.incluir_contingencias) {
      recomendaciones.push({
        tipo: 'info',
        categoria: 'Gestión de Riesgos',
        titulo: 'Considerar contingencias',
        descripcion: 'No se han incluido contingencias en el presupuesto.',
        accion: 'Agregar 5-10% para imprevistos es una práctica recomendada.'
      });
    }

    // Análisis de complejidad
    if (configuracion.factor_complejidad > 1.2) {
      recomendaciones.push({
        tipo: 'warning',
        categoria: 'Complejidad',
        titulo: 'Proyecto de alta complejidad',
        descripcion: 'El factor de complejidad aplicado sugiere un proyecto desafiante.',
        accion: 'Revisar planning y recursos necesarios. Considerar fases de ejecución.'
      });
    }

    // Análisis de financiamiento
    if (configuracion.incluir_financiamiento && configuracion.tasa_financiamiento > 0.15) {
      recomendaciones.push({
        tipo: 'warning',
        categoria: 'Financiamiento',
        titulo: 'Costo financiero elevado',
        descripcion: `La tasa de ${(configuracion.tasa_financiamiento * 100).toFixed(1)}% incrementa significativamente el costo.`,
        accion: 'Evaluar opciones de financiamiento más competitivas o ajustar condiciones de pago.'
      });
    }

    return recomendaciones;
  };

  const detectarAlertas = () => {
    const alertas = [];
    const resumen = calcularResumenCostos();
    
    // Alerta por incremento excesivo
    if (resumen.porcentaje_incremento > 30) {
      alertas.push({
        tipo: 'error',
        mensaje: `El incremento total del ${resumen.porcentaje_incremento.toFixed(1)}% sobre el costo base es muy alto.`,
        impacto: 'alto'
      });
    }

    // Alerta por partidas sin precio
    const partidasSinPrecio = presupuestoData.partidas?.filter(p => !p.precio_unitario || p.precio_unitario <= 0) || [];
    if (partidasSinPrecio.length > 0) {
      alertas.push({
        tipo: 'warning',
        mensaje: `${partidasSinPrecio.length} partidas no tienen precio asignado.`,
        impacto: 'medio'
      });
    }

    // Alerta por desequilibrio en categorías
    const distribucion = calcularDistribucionCategorias();
    const categoriasDominantes = Object.entries(distribucion).filter(([_, datos]) => datos.porcentaje > 60);
    if (categoriasDominantes.length > 0) {
      alertas.push({
        tipo: 'info',
        mensaje: `La categoría "${categoriasDominantes[0][0]}" representa más del 60% del presupuesto.`,
        impacto: 'bajo'
      });
    }

    return alertas;
  };

  const compararConMercado = () => {
    // Datos simulados de mercado
    const preciosReferencia = {
      'Obras preliminares': { min: 50, max: 150, promedio: 100 },
      'Cimentación': { min: 800, max: 1200, promedio: 1000 },
      'Estructura': { min: 1500, max: 2500, promedio: 2000 },
      'Albañilería': { min: 300, max: 600, promedio: 450 },
      'Instalaciones': { min: 400, max: 800, promedio: 600 },
      'Acabados': { min: 600, max: 1200, promedio: 900 }
    };

    return preciosReferencia;
  };

  const aplicarRecomendacion = (recomendacion) => {
    switch (recomendacion.categoria) {
      case 'Rentabilidad':
        // Incrementar margen al 15%
        const nuevoMargen = 0.15;
        onActualizar('margen_utilidad', nuevoMargen);
        break;
      case 'Gestión de Riesgos':
        setConfiguracion(prev => ({
          ...prev,
          incluir_contingencias: true,
          porcentaje_contingencias: 0.05
        }));
        break;
      default:
        break;
    }
  };

  const formatCurrency = (amount, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  };

  const resumen = calcularResumenCostos();
  const indicadores = calcularIndicadoresFinancieros();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CpuChipIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Análisis Inteligente de Costos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Herramientas avanzadas de análisis y optimización
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Configuración de Factores */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-400 mb-4 flex items-center">
              <CogIcon className="h-5 w-5 mr-2" />
              Factores de Ajuste
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Factor de Complejidad
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.1"
                  value={configuracion.factor_complejidad}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, factor_complejidad: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Simple (0.8)</span>
                  <span className="font-medium">{configuracion.factor_complejidad}</span>
                  <span>Complejo (1.5)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Factor Regional
                </label>
                <input
                  type="range"
                  min="0.9"
                  max="1.3"
                  step="0.05"
                  value={configuracion.factor_regional}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, factor_regional: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Rural (0.9)</span>
                  <span className="font-medium">{configuracion.factor_regional}</span>
                  <span>Metropolitana (1.3)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Factor Temporal
                </label>
                <input
                  type="range"
                  min="0.95"
                  max="1.1"
                  step="0.01"
                  value={configuracion.factor_temporal}
                  onChange={(e) => setConfiguracion(prev => ({ ...prev, factor_temporal: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Deflación (0.95)</span>
                  <span className="font-medium">{configuracion.factor_temporal}</span>
                  <span>Inflación (1.1)</span>
                </div>
              </div>
            </div>

            {/* Opciones adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={configuracion.incluir_contingencias}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, incluir_contingencias: e.target.checked }))}
                    className="mr-2 rounded"
                  />
                  Incluir contingencias
                </label>
                {configuracion.incluir_contingencias && (
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={configuracion.porcentaje_contingencias * 100}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, porcentaje_contingencias: parseFloat(e.target.value) / 100 }))}
                    className="ml-6 w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={configuracion.incluir_gastos_indirectos}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, incluir_gastos_indirectos: e.target.checked }))}
                    className="mr-2 rounded"
                  />
                  Incluir gastos indirectos
                </label>
                {configuracion.incluir_gastos_indirectos && (
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="1"
                    value={configuracion.porcentaje_gastos_indirectos * 100}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, porcentaje_gastos_indirectos: parseFloat(e.target.value) / 100 }))}
                    className="ml-6 w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Resumen de Costos Ajustados */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-medium text-green-800 dark:text-green-400 mb-4 flex items-center">
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Análisis de Costos Optimizado
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(resumen.subtotal_ajustado)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Costo Base Ajustado</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  +{((resumen.subtotal_ajustado / resumen.subtotal_original - 1) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(resumen.contingencias + resumen.gastos_indirectos)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Costos Indirectos</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {(((resumen.contingencias + resumen.gastos_indirectos) / resumen.subtotal_ajustado) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(resumen.utilidad)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Utilidad</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {indicadores.margen_real}%
                </p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(resumen.precio_final)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Precio Final</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Factor: {indicadores.factor_multiplicador}x
                </p>
              </div>
            </div>

            {resumen.incremento_total > 0 && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-700">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  <strong>Incremento total:</strong> {formatCurrency(resumen.incremento_total)} 
                  ({resumen.porcentaje_incremento.toFixed(1)}% sobre el presupuesto original)
                </p>
              </div>
            )}
          </div>

          {/* Alertas */}
          {analisis.alertas && analisis.alertas.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-3 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Alertas y Observaciones
              </h3>
              <div className="space-y-2">
                {analisis.alertas.map((alerta, index) => (
                  <div key={index} className={`flex items-start p-3 rounded ${
                    alerta.tipo === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                    alerta.tipo === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alerta.mensaje}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Impacto: {alerta.impacto}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {analisis.recomendaciones && analisis.recomendaciones.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-400 mb-3 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2" />
                Recomendaciones Inteligentes
              </h3>
              <div className="space-y-3">
                {analisis.recomendaciones.map((rec, index) => (
                  <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded border border-yellow-300 dark:border-yellow-700">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{rec.titulo}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rec.tipo === 'warning' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {rec.categoria}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{rec.descripcion}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{rec.accion}</p>
                      <button
                        onClick={() => aplicarRecomendacion(rec)}
                        className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Distribución por Categorías */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-medium text-purple-800 dark:text-purple-400 mb-3 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Distribución por Categorías
            </h3>
            <div className="space-y-3">
              {Object.entries(analisis.distribucion_por_categoria || {}).map(([categoria, datos]) => (
                <div key={categoria} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{categoria}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {datos.cantidad_partidas} partidas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(datos.monto)}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      {datos.porcentaje.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-500 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onActualizar('presupuesto_analizado', analisis);
                onClose();
              }}
              className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
            >
              Aplicar Optimizaciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculadoraCostos;