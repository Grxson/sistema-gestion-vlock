import React, { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const AlertasVencimiento = () => {
  const [alertas, setAlertas] = useState([]);
  const [alertasCerradas, setAlertasCerradas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAlertas();
    cargarAlertasCerradas();
    // Recargar alertas cada 5 minutos
    const interval = setInterval(cargarAlertas, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const cargarAlertas = async () => {
    try {
      const response = await api.get('/adeudos-generales/alertas');
      if (response.data.success) {
        setAlertas(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarAlertasCerradas = () => {
    const cerradas = JSON.parse(localStorage.getItem('alertas_cerradas') || '[]');
    setAlertasCerradas(cerradas);
  };

  const cerrarAlerta = (idAdeudo) => {
    const nuevasCerradas = [...alertasCerradas, idAdeudo];
    setAlertasCerradas(nuevasCerradas);
    localStorage.setItem('alertas_cerradas', JSON.stringify(nuevasCerradas));
  };

  // Filtrar alertas que no han sido cerradas
  const alertasVisibles = alertas.filter(
    (alerta) => !alertasCerradas.includes(alerta.id_adeudo_general)
  );

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'critico':
        return 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200';
      case 'alto':
        return 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-800 dark:text-orange-200';
      case 'medio':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-200';
      case 'bajo':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-500 text-gray-800 dark:text-gray-200';
    }
  };

  const getIconoNivel = (nivel) => {
    if (nivel === 'critico' || nivel === 'alto') {
      return <ExclamationTriangleIcon className="w-5 h-5" />;
    }
    return <ClockIcon className="w-5 h-5" />;
  };

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  if (loading || alertasVisibles.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {/* Popups de alertas individuales */}
      {alertasVisibles.map((adeudo, index) => {
        const nivelColor = getNivelColor(adeudo.alerta.nivelUrgencia);
        const icono = getIconoNivel(adeudo.alerta.nivelUrgencia);
        
        return (
          <div
            key={adeudo.id_adeudo_general}
            className={`bg-white dark:bg-dark-100 rounded-lg shadow-2xl border-l-4 ${nivelColor} animate-slide-in-right`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-4">
              {/* Header con botón cerrar */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    {icono}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      ⚠️ Adeudo por Vencer
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {adeudo.alerta.mensaje}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => cerrarAlerta(adeudo.id_adeudo_general)}
                  className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-dark-200 rounded transition-colors"
                  title="Cerrar notificación"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Contenido */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {adeudo.nombre_entidad}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300">
                    {adeudo.tipo_adeudo === 'nos_deben' ? '💸 Nos deben' : '🔻 Debemos'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Monto pendiente:
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatearMonto(adeudo.monto_pendiente)}
                  </span>
                </div>

                {adeudo.fecha_vencimiento && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 pt-1">
                    Vence: {new Date(adeudo.fecha_vencimiento).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertasVencimiento;
