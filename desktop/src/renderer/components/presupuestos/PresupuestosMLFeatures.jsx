import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  CpuChipIcon, 
  LightBulbIcon,
  DocumentChartBarIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import presupuestosServices from '../../services/presupuestos';

/**
 * Componente de características avanzadas de ML para presupuestos
 * Incluye análisis predictivo, optimización de costos y recomendaciones inteligentes
 */
const PresupuestosMLFeatures = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [marketTrends, setMarketTrends] = useState(null);
  const [costOptimization, setCostOptimization] = useState(null);
  const [activeTab, setActiveTab] = useState('predictions');

  useEffect(() => {
    loadMLData();
  }, []);

  const loadMLData = async () => {
    try {
      setLoading(true);
      
      // Simular carga de datos de ML (en producción sería llamadas reales a API de ML)
      await Promise.all([
        loadPredictiveAnalysis(),
        loadRecommendations(),
        loadMarketTrends(),
        loadCostOptimization()
      ]);
    } catch (error) {
      console.error('Error cargando datos de ML:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPredictiveAnalysis = async () => {
    // Simulación de análisis predictivo
    setPredictions({
      precioMateriales: {
        tendencia: 'alza',
        porcentaje: 15.3,
        confianza: 87,
        factores: ['Inflación', 'Demanda estacional', 'Costos energéticos']
      },
      demandaProyectos: {
        tendencia: 'estable',
        porcentaje: 2.1,
        confianza: 92,
        factores: ['Política gubernamental', 'Inversión privada', 'Calendario fiscal']
      },
      rentabilidad: {
        tendencia: 'baja',
        porcentaje: -8.7,
        confianza: 78,
        factores: ['Competencia', 'Costos laborales', 'Regulaciones']
      }
    });
  };

  const loadRecommendations = async () => {
    setRecommendations([
      {
        id: 1,
        tipo: 'costo',
        prioridad: 'alta',
        titulo: 'Optimización de Materiales',
        descripcion: 'Se detectó un ahorro potencial del 12% en cemento mediante cambio de proveedor regional',
        impacto: 'Q 45,000 de ahorro anual',
        implementacion: 'Negociar contrato con Cementos del Norte antes del Q2',
        confianza: 89
      },
      {
        id: 2,
        tipo: 'eficiencia',
        prioridad: 'media',
        titulo: 'Automatización de Cálculos',
        descripcion: 'Implementar templates inteligentes para reducir tiempo de elaboración de presupuestos en 40%',
        impacto: '20 horas/mes liberadas',
        implementacion: 'Configurar templates basados en proyectos históricos exitosos',
        confianza: 76
      },
      {
        id: 3,
        tipo: 'riesgo',
        prioridad: 'alta',
        titulo: 'Alerta de Volatilidad',
        descripcion: 'Los precios del acero muestran alta volatilidad. Considerar compras anticipadas',
        impacto: 'Mitigar riesgo de Q 23,000',
        implementacion: 'Stockear materiales críticos para próximos 3 meses',
        confianza: 94
      },
      {
        id: 4,
        tipo: 'mercado',
        prioridad: 'baja',
        titulo: 'Oportunidad de Nicho',
        descripcion: 'Creciente demanda en proyectos ecológicos con margen superior al 18%',
        impacto: 'Nueva línea de negocio',
        implementacion: 'Desarrollar capacidades en construcción sostenible',
        confianza: 65
      }
    ]);
  };

  const loadMarketTrends = async () => {
    setMarketTrends({
      indices: {
        materialBasico: { valor: 108.3, cambio: 3.2, tendencia: 'up' },
        manoObra: { valor: 95.7, cambio: -1.8, tendencia: 'down' },
        equipoMaquinaria: { valor: 102.5, cambio: 0.9, tendencia: 'up' },
        combustibles: { valor: 87.2, cambio: -12.3, tendencia: 'down' }
      },
      regionales: {
        centroAmerica: { crecimiento: 4.2, estabilidad: 'media' },
        mexico: { crecimiento: 2.8, estabilidad: 'alta' },
        sudamerica: { crecimiento: 6.1, estabilidad: 'baja' }
      },
      estacionalidad: {
        actual: 'temporada_alta',
        pico: 'marzo-mayo',
        valle: 'septiembre-noviembre'
      }
    });
  };

  const loadCostOptimization = async () => {
    setCostOptimization({
      oportunidades: [
        {
          categoria: 'Materiales',
          ahorroActual: 8.5,
          ahorroObjetivo: 15.2,
          acciones: [
            'Negociar volúmenes con proveedores principales',
            'Evaluar materiales alternativos certificados',
            'Implementar compras consolidadas'
          ]
        },
        {
          categoria: 'Logística',
          ahorroActual: 3.1,
          ahorroObjetivo: 8.7,
          acciones: [
            'Optimizar rutas de entrega',
            'Negociar fletes de retorno',
            'Evaluar centros de distribución regionales'
          ]
        },
        {
          categoria: 'Procesos',
          ahorroActual: 12.3,
          ahorroObjetivo: 18.9,
          acciones: [
            'Automatizar cálculos repetitivos',
            'Estandarizar metodologías',
            'Implementar control de versiones'
          ]
        }
      ],
      impactoTotal: 142500,
      tiempoImplementacion: 6,
      roi: 340
    });
  };

  const tabs = [
    { id: 'predictions', name: 'Análisis Predictivo', icon: ArrowTrendingUpIcon },
    { id: 'recommendations', name: 'Recomendaciones IA', icon: LightBulbIcon },
    { id: 'market', name: 'Tendencias de Mercado', icon: ChartBarIcon },
    { id: 'optimization', name: 'Optimización', icon: AdjustmentsHorizontalIcon }
  ];

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'media': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'baja': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTrendIcon = (tendencia) => {
    if (tendencia === 'alza' || tendencia === 'up') {
      return '📈';
    } else if (tendencia === 'baja' || tendencia === 'down') {
      return '📉';
    }
    return '➡️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <CpuChipIcon className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Procesando Análisis de IA
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Analizando datos históricos y tendencias de mercado...
          </p>
        </div>
      </div>
    );
  }

  const renderPredictions = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
          Predicciones de Mercado
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictions && Object.entries(predictions).map(([key, data]) => (
            <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <span className="text-2xl">{getTrendIcon(data.tendencia)}</span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-lg font-bold ${
                  data.tendencia === 'alza' ? 'text-red-600' :
                  data.tendencia === 'baja' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {data.porcentaje > 0 ? '+' : ''}{data.porcentaje}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Confianza: {data.confianza}%
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Factores clave:
                </p>
                {data.factores.map((factor, index) => (
                  <span key={index} className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-300 mr-1 mb-1">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-2" />
          Recomendaciones Inteligentes
        </h3>
        
        <div className="grid gap-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {rec.titulo}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.prioridad)}`}>
                      {rec.prioridad}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {rec.descripcion}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {rec.impacto}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Confianza: {rec.confianza}%
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded mt-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Implementación:</strong> {rec.implementacion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMarketTrends = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Análisis de Mercado
        </h3>
        
        {marketTrends && (
          <>
            {/* Índices de materiales */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Índices de Materiales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(marketTrends.indices).map(([key, data]) => (
                  <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h5>
                      <span className="text-xl">{getTrendIcon(data.tendencia)}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.valor}
                    </div>
                    <div className={`text-sm ${data.cambio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.cambio >= 0 ? '+' : ''}{data.cambio}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Análisis regional */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Análisis Regional</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(marketTrends.regionales).map(([region, data]) => (
                  <div key={region} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <h5 className="font-medium text-gray-900 dark:text-white capitalize mb-2">
                      {region.replace(/([A-Z])/g, ' $1').trim()}
                    </h5>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          +{data.crecimiento}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Crecimiento anual
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        data.estabilidad === 'alta' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        data.estabilidad === 'media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        Estabilidad {data.estabilidad}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estacionalidad */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" />
                Análisis Estacional
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Temporada Actual</div>
                  <div className="text-lg font-semibold text-blue-600 capitalize">
                    {marketTrends.estacionalidad.actual.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Pico de Demanda</div>
                  <div className="text-lg font-semibold text-green-600">
                    {marketTrends.estacionalidad.pico}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Valle de Demanda</div>
                  <div className="text-lg font-semibold text-red-600">
                    {marketTrends.estacionalidad.valle}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderOptimization = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
          Optimización de Costos
        </h3>
        
        {costOptimization && (
          <>
            {/* Resumen de impacto */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    Q {costOptimization.impactoTotal.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Ahorro Potencial Anual
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {costOptimization.tiempoImplementacion} meses
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Tiempo de Implementación
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {costOptimization.roi}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ROI Proyectado
                  </div>
                </div>
              </div>
            </div>

            {/* Oportunidades por categoría */}
            <div className="space-y-4">
              {costOptimization.oportunidades.map((oportunidad, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {oportunidad.categoria}
                    </h4>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Actual: {oportunidad.ahorroActual}% | Objetivo: {oportunidad.ahorroObjetivo}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progreso de optimización</span>
                      <span>{Math.round((oportunidad.ahorroActual / oportunidad.ahorroObjetivo) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(oportunidad.ahorroActual / oportunidad.ahorroObjetivo) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Acciones recomendadas */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Acciones Recomendadas:
                    </h5>
                    <ul className="space-y-1">
                      {oportunidad.acciones.map((accion, actionIndex) => (
                        <li key={actionIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {accion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'predictions':
        return renderPredictions();
      case 'recommendations':
        return renderRecommendations();
      case 'market':
        return renderMarketTrends();
      case 'optimization':
        return renderOptimization();
      default:
        return renderPredictions();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Inteligencia Artificial para Presupuestos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Análisis predictivo, optimización y recomendaciones inteligentes para mejorar la rentabilidad
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate && onNavigate('/presupuestos/listado')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Volver a Presupuestos
            </button>
            <button
              onClick={loadMLData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <DocumentChartBarIcon className="h-4 w-4" />
              <span>Actualizar Análisis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {renderTabContent()}
    </div>
  );
};

export default PresupuestosMLFeatures;