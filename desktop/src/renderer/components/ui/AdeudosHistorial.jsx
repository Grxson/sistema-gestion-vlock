import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/currency';
import nominasServices from '../../services/nominas';

const AdeudosHistorial = ({ empleado, onClose, onAdeudoLiquidado }) => {
  const [adeudos, setAdeudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soloPendientes, setSoloPendientes] = useState(false);

  useEffect(() => {
    cargarAdeudos();
  }, [empleado]);

  const cargarAdeudos = async () => {
    try {
      setLoading(true);
      let adeudosData;
      if (empleado) {
        // Cargar adeudos de un empleado específico
        adeudosData = await nominasServices.adeudos.getAdeudosEmpleado(empleado.id_empleado);
      } else {
        // Cargar todos los adeudos (pendientes y liquidados)
        adeudosData = await nominasServices.adeudos.getAllAdeudos();
      }
      setAdeudos(adeudosData);
    } catch (error) {
      console.error('Error loading debts:', error);
      setError('Error al cargar adeudos');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'Parcial':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'Liquidado':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Parcial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Liquidado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Invalid Date';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filtrar adeudos según el estado de visualización
  const adeudosPendientes = adeudos.filter(a => a.estado !== 'Liquidado');
  const adeudosLiquidados = adeudos.filter(a => a.estado === 'Liquidado');
  // Por defecto mostrar todos los adeudos, con opción de filtrar solo pendientes
  const adeudosAVisualizar = soloPendientes ? adeudosPendientes : adeudos;

  const liquidarAdeudo = async (adeudoId) => {
    // Validar que el ID existe
    if (!adeudoId) {
      console.error('Error: adeudoId is undefined');
      setError('Error: ID de adeudo no válido');
      return;
    }

    try {
      
      await nominasServices.adeudos.liquidarAdeudo(adeudoId);
      
      // Actualizar el estado local inmediatamente
      setAdeudos(prevAdeudos => {
        const updatedAdeudos = prevAdeudos.map(adeudo => {
          const currentId = adeudo.id_adeudo || adeudo.id;
          
          // Convertir ambos a número para comparación
          const currentIdNum = parseInt(currentId);
          const adeudoIdNum = parseInt(adeudoId);
          
          if (currentIdNum === adeudoIdNum) {
            return { 
              ...adeudo, 
              estado: 'Liquidado', 
              monto_pagado: adeudo.monto_adeudo || adeudo.monto_total,
              monto_pendiente: 0,
              fecha_liquidacion: new Date().toISOString()
            };
          }
          return adeudo;
        });
        
        return updatedAdeudos;
      });
      
      // Notificar al componente padre para actualizar estadísticas
      if (onAdeudoLiquidado) {
        onAdeudoLiquidado();
      }
    } catch (error) {
      console.error('❌ [ADEUDOS] Error liquidating adeudo:', error);
      setError('Error al liquidar adeudo');
    }
  };

  const actualizarAdeudo = async (adeudoId, nuevosDatos) => {
    try {
      await nominasServices.adeudos.actualizarAdeudo(adeudoId, nuevosDatos);
      
      // Actualizar el estado local inmediatamente
      setAdeudos(prevAdeudos => 
        prevAdeudos.map(adeudo => {
          const currentId = adeudo.id_adeudo || adeudo.id;
          return currentId === adeudoId 
            ? { 
                ...adeudo, 
                ...nuevosDatos,
                monto_pendiente: (adeudo.monto_adeudo || adeudo.monto_total) - nuevosDatos.monto_pagado
              }
            : adeudo;
        })
      );
      
      // Notificar al componente padre para actualizar estadísticas
      if (onAdeudoLiquidado) {
        onAdeudoLiquidado();
      }
    } catch (error) {
      console.error('Error updating adeudo:', error);
      setError('Error al actualizar adeudo');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando adeudos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {empleado ? 'Historial de Adeudos' : 'Todos los Adeudos Pendientes'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Vista general de todos los adeudos'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Pendientes</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {adeudos.filter(a => a.estado === 'Pendiente').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Parciales</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {adeudos.filter(a => a.estado === 'Parcial').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Liquidados</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {adeudos.filter(a => a.estado === 'Liquidado').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de visualización */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {adeudosAVisualizar.length} de {adeudos.length} adeudos
            {soloPendientes && adeudosLiquidados.length > 0 && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                ({adeudosLiquidados.length} liquidados ocultos)
              </span>
            )}
          </div>
          
          {adeudosLiquidados.length > 0 && (
            <button
              onClick={() => setSoloPendientes(!soloPendientes)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors duration-200"
            >
              {soloPendientes ? (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-2" />
                  Mostrar Todos ({adeudos.length})
                </>
              ) : (
                <>
                  <ChevronUpIcon className="h-4 w-4 mr-2" />
                  Solo Pendientes ({adeudosPendientes.length})
                </>
              )}
            </button>
          )}
        </div>

        {/* Lista de Adeudos */}
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : adeudosAVisualizar.length === 0 ? (
          <div className="text-center py-8">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {soloPendientes ? 'No hay adeudos pendientes' : 'No hay adeudos registrados'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {adeudosAVisualizar.map((adeudo, index) => {
              return (
                <div
                  key={adeudo.id_adeudo || adeudo.id || `adeudo-${index}`}
                  className={`rounded-lg p-4 border ${
                    adeudo.estado === 'Liquidado' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getEstadoIcon(adeudo.estado)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Adeudo #{adeudo.id_adeudo || adeudo.id}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Creado: {formatFecha(adeudo.fecha_adeudo || adeudo.fecha_creacion)}
                      </p>
                      {adeudo.estado === 'Liquidado' && adeudo.fecha_liquidacion && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Liquidado: {formatFecha(adeudo.fecha_liquidacion)}
                        </p>
                      )}
                      {!empleado && adeudo.empleado && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {adeudo.empleado.nombre} {adeudo.empleado.apellido}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(adeudo.estado)}`}>
                    {adeudo.estado}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monto Original</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(adeudo.monto_adeudo || adeudo.monto_total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monto Pagado</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(adeudo.monto_pagado || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pendiente</p>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(adeudo.monto_pendiente)}
                    </p>
                  </div>
                </div>

                {adeudo.observaciones && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Observaciones:</strong> {adeudo.observaciones}
                    </p>
                  </div>
                )}

                {adeudo.fecha_liquidacion && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      <strong>Liquidado el:</strong> {formatFecha(adeudo.fecha_liquidacion)}
                    </p>
                  </div>
                )}

                {/* Botones de Acción */}
                {adeudo.estado !== 'Liquidado' && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const adeudoId = adeudo.id_adeudo || adeudo.id;
                          if (adeudoId) {
                            liquidarAdeudo(adeudoId);
                          } else {
                            console.error('Error: adeudo ID is undefined', adeudo);
                            setError('Error: ID de adeudo no válido');
                          }
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        title="Marcar como liquidado"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Liquidar
                      </button>
                      
                      {adeudo.estado === 'Pendiente' && (
                        <button
                          onClick={() => {
                            const confirmacion = window.confirm(
                              `¿Está seguro de que desea marcar este adeudo como pagado parcialmente?\n\nAdeudo: ${formatCurrency(adeudo.monto_adeudo)}\nPendiente: ${formatCurrency(adeudo.monto_pendiente)}`
                            );
                            if (confirmacion) {
                              const montoPagado = prompt(
                                `Ingrese el monto que se está pagando ahora (máximo: ${formatCurrency(adeudo.monto_adeudo)}):`,
                                formatCurrency(adeudo.monto_adeudo)
                              );
                              if (montoPagado) {
                                const monto = parseFloat(montoPagado.replace(/[$,]/g, ''));
                                if (!isNaN(monto) && monto > 0 && monto <= adeudo.monto_adeudo) {
                                  actualizarAdeudo(adeudo.id_adeudo, {
                                    monto_pagado: monto,
                                    estado: monto < adeudo.monto_adeudo ? 'Parcial' : 'Liquidado'
                                  });
                                } else {
                                  alert('Monto inválido');
                                }
                              }
                            }
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                          title="Marcar pago parcial"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Pago Parcial
                        </button>
                      )}
                    </div>
                  </div>
                )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdeudosHistorial;
