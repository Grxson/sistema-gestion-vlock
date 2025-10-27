import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, XMarkIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { eventBus, EVENTS } from '../utils/eventBus';

const NotificacionesPanel = () => {
  const [alertas, setAlertas] = useState([]);
  const [alertasLeidas, setAlertasLeidas] = useState([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  useEffect(() => {
    cargarAlertas();
    cargarAlertasLeidas();
    limpiarAlertasAntiguasSiEsNuevoDia();
    
    // Recargar alertas cada 5 minutos
    const interval = setInterval(() => {
      cargarAlertas();
      limpiarAlertasAntiguasSiEsNuevoDia();
    }, 5 * 60 * 1000);

    // Cerrar panel al hacer clic fuera
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setMostrarPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Escuchar eventos de actualización de adeudos
    const unsubscribeActualizado = eventBus.on(EVENTS.ADEUDO_ACTUALIZADO, () => {
      console.log('🔔 [NotificacionesPanel] Adeudo actualizado, recargando alertas...');
      cargarAlertas();
    });

    const unsubscribePagado = eventBus.on(EVENTS.ADEUDO_PAGADO, () => {
      console.log('🔔 [NotificacionesPanel] Adeudo pagado, recargando alertas...');
      cargarAlertas();
    });

    const unsubscribeEliminado = eventBus.on(EVENTS.ADEUDO_ELIMINADO, () => {
      console.log('🔔 [NotificacionesPanel] Adeudo eliminado, recargando alertas...');
      cargarAlertas();
    });

    const unsubscribeRecargar = eventBus.on(EVENTS.RECARGAR_ALERTAS, () => {
      console.log('🔔 [NotificacionesPanel] Recarga manual solicitada...');
      cargarAlertas();
    });
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
      unsubscribeActualizado();
      unsubscribePagado();
      unsubscribeEliminado();
      unsubscribeRecargar();
    };
  }, []);

  const limpiarAlertasAntiguasSiEsNuevoDia = () => {
    const hoy = new Date().toDateString();
    const ultimaLimpieza = localStorage.getItem('ultima_limpieza_alertas');

    if (ultimaLimpieza !== hoy) {
      console.log('🔔 [Notificaciones] Nuevo día detectado, limpiando alertas antiguas...');
      localStorage.removeItem('alertas_cerradas');
      localStorage.removeItem('alertas_leidas');
      localStorage.setItem('ultima_limpieza_alertas', hoy);
      setAlertasLeidas([]);
    }
  };

  const cargarAlertas = async () => {
    try {
      const response = await api.get('/adeudos-generales/alertas');
      
      if (response.success) {
        setAlertas(response.data);
      }
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarAlertasLeidas = () => {
    const leidas = JSON.parse(localStorage.getItem('alertas_leidas') || '[]');
    setAlertasLeidas(leidas);
  };

  const marcarComoLeida = (idAdeudo) => {
    if (!alertasLeidas.includes(idAdeudo)) {
      const nuevasLeidas = [...alertasLeidas, idAdeudo];
      setAlertasLeidas(nuevasLeidas);
      localStorage.setItem('alertas_leidas', JSON.stringify(nuevasLeidas));
    }
  };

  const marcarTodasComoLeidas = () => {
    const todasLasIds = alertas.map(a => a.id_adeudo_general);
    setAlertasLeidas(todasLasIds);
    localStorage.setItem('alertas_leidas', JSON.stringify(todasLasIds));
  };

  const togglePanel = () => {
    setMostrarPanel(!mostrarPanel);
  };

  const alertasNoLeidas = alertas.filter(
    (alerta) => !alertasLeidas.includes(alerta.id_adeudo_general)
  );

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'vencido':
        return 'bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 dark:border-red-500';
      case 'critico':
        return 'bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400';
      case 'alto':
        return 'bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-500 dark:border-orange-400';
      case 'medio':
        return 'bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400';
      case 'bajo':
        return 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400';
      default:
        return 'bg-gray-50 dark:bg-gray-800/50 border-l-4 border-gray-500 dark:border-gray-400';
    }
  };

  const getNivelIcono = (nivel) => {
    const className = "w-5 h-5";
    switch (nivel) {
      case 'vencido':
        return <ExclamationTriangleIcon className={`${className} text-red-600 dark:text-red-400`} />;
      case 'critico':
        return <ExclamationTriangleIcon className={`${className} text-red-600 dark:text-red-400`} />;
      case 'alto':
        return <ExclamationTriangleIcon className={`${className} text-orange-600 dark:text-orange-400`} />;
      case 'medio':
        return <ClockIcon className={`${className} text-yellow-600 dark:text-yellow-400`} />;
      case 'bajo':
        return <ClockIcon className={`${className} text-blue-600 dark:text-blue-400`} />;
      default:
        return <ClockIcon className={`${className} text-gray-600 dark:text-gray-400`} />;
    }
  };

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón de campana */}
      <button
        onClick={togglePanel}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
        title="Notificaciones"
      >
        <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        
        {/* Badge con contador */}
        {alertasNoLeidas.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {alertasNoLeidas.length > 9 ? '9+' : alertasNoLeidas.length}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {mostrarPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-100 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header del panel */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </h3>
              <button
                onClick={() => setMostrarPanel(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-200 rounded transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {alertas.length > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {alertasNoLeidas.length > 0 
                    ? `${alertasNoLeidas.length} sin leer`
                    : 'Todas leídas'}
                </p>
                {alertasNoLeidas.length > 0 && (
                  <button
                    onClick={marcarTodasComoLeidas}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando...</p>
              </div>
            ) : alertas.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No hay adeudos próximos a vencer
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  ¡Todo al día! 🎉
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {alertas.map((adeudo) => {
                  const esLeida = alertasLeidas.includes(adeudo.id_adeudo_general);
                  const nivelColor = getNivelColor(adeudo.alerta.nivelUrgencia);
                  const icono = getNivelIcono(adeudo.alerta.nivelUrgencia);

                  return (
                    <div
                      key={adeudo.id_adeudo_general}
                      className={`p-4 transition-colors ${nivelColor} ${esLeida ? 'opacity-80' : 'hover:bg-gray-100/50 dark:hover:bg-gray-700/30'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {icono}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {adeudo.nombre_entidad}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                {adeudo.alerta.mensaje}
                              </p>
                            </div>
                            
                            {!esLeida && (
                              <span className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-1"></span>
                            )}
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium">
                              {adeudo.tipo_adeudo === 'nos_deben' ? '💸 Nos deben' : '🔻 Debemos'}
                            </span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatearMonto(adeudo.monto_pendiente)}
                            </span>
                          </div>

                          {adeudo.fecha_vencimiento && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              Vence: {new Date(adeudo.fecha_vencimiento).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => marcarComoLeida(adeudo.id_adeudo_general)}
                          disabled={esLeida}
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            esLeida
                              ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-default'
                              : 'bg-primary-600 hover:bg-primary-700 text-white'
                          }`}
                        >
                          {esLeida ? 'Notificación leída' : 'Marcar como leída'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {alertas.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-200">
              <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                Las notificaciones se actualizan automáticamente cada día
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificacionesPanel;
