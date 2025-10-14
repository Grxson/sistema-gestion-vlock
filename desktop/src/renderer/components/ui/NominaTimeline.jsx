import React from 'react';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const NominaTimeline = ({ 
  nominas = [], 
  onView, 
  onEdit, 
  onDownload,
  loading = false 
}) => {
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Pagado':
        return <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'Aprobada':
        return <CheckCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'Pendiente':
        return <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'Cancelada':
        return <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pagado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Aprobada':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Cancelada':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const groupNominasByPeriod = (nominas) => {
    const grouped = {};
    
    nominas.forEach(nomina => {
      const periodo = nomina.periodo || 'Sin período';
      if (!grouped[periodo]) {
        grouped[periodo] = [];
      }
      grouped[periodo].push(nomina);
    });

    // Ordenar períodos de más reciente a más antiguo
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  };

  const groupedNominas = groupNominasByPeriod(nominas);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (nominas.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Sin historial de nóminas
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Aún no se han procesado nóminas. Procesa la primera nómina para comenzar a ver el historial.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedNominas.map(([periodo, nominasPeriodo]) => (
        <div key={periodo} className="relative">
          {/* Header del período */}
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Período {periodo}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {nominasPeriodo.length} nómina{nominasPeriodo.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {/* Estadísticas del período */}
            <div className="ml-auto flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(nominasPeriodo.reduce((sum, n) => sum + (n.monto_total || n.monto || 0), 0))}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {nominasPeriodo.filter(n => n.estado === 'Pagado').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pagadas</p>
              </div>
            </div>
          </div>

          {/* Lista de nóminas del período */}
          <div className="space-y-3">
            {nominasPeriodo.map((nomina, index) => (
              <div 
                key={nomina.id || nomina.id_nomina || `nomina-${periodo}-${index}`}
                className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar del empleado */}
                      <div className="h-12 w-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-medium text-sm">
                          {nomina.empleado?.nombre?.charAt(0)?.toUpperCase() || 'E'}
                        </span>
                      </div>

                      {/* Información de la nómina */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                            {typeof nomina.empleado === 'object' && nomina.empleado ? 
                              `${nomina.empleado.nombre || ''} ${nomina.empleado.apellido || ''}`.trim() : 
                              nomina.empleado || 'Sin empleado'
                            }
                          </h5>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(nomina.estado)}`}>
                            {getEstadoIcon(nomina.estado)}
                            <span className="ml-1">{nomina.estado}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Semana {nomina.id_semana || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CurrencyDollarIcon className="h-4 w-4" />
                            <span>{formatCurrency(nomina.monto_total || nomina.monto || 0)}</span>
                          </div>
                          {nomina.createdAt && (
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{new Date(nomina.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onView?.(nomina)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => onEdit?.(nomina)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => onDownload?.(nomina)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="Descargar PDF"
                      >
                        <DocumentTextIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Función helper para formatear moneda (debería importarse desde utils)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount || 0);
};

export default NominaTimeline;
