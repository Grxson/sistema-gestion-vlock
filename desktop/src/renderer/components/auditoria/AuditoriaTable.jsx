import React, { useState } from 'react';
import { 
  FaEye, 
  FaChevronLeft, 
  FaChevronRight,
  FaUser,
  FaClock,
  FaDatabase,
  FaCog,
  FaInfoCircle
} from 'react-icons/fa';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente de tabla de registros de auditoría
 */
const AuditoriaTable = ({ 
  registros, 
  loading, 
  paginacion, 
  onCambiarPagina,
  onVerDetalle 
}) => {
  const [registroExpandido, setRegistroExpandido] = useState(null);

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    try {
      return format(new Date(fecha), "dd/MM/yyyy HH:mm:ss", { locale: es });
    } catch (error) {
      return fecha;
    }
  };

  // Función para obtener el color del badge según la acción
  const getAccionColor = (accion) => {
    const colores = {
      'LOGIN': 'bg-green-100/80 text-green-700 dark:bg-green-500/20 dark:text-green-300',
      'LOGOUT': 'bg-gray-100/80 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
      'CREATE': 'bg-blue-100/80 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
      'READ': 'bg-cyan-100/80 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
      'UPDATE': 'bg-yellow-100/80 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
      'DELETE': 'bg-red-100/80 text-red-700 dark:bg-red-500/20 dark:text-red-300'
    };
    return colores[accion] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  // Función para obtener el icono según la acción
  const getAccionIcon = (accion) => {
    const iconos = {
      'LOGIN': '🔓',
      'LOGOUT': '🔒',
      'CREATE': '➕',
      'READ': '👁️',
      'UPDATE': '✏️',
      'DELETE': '🗑️'
    };
    return iconos[accion] || '📝';
  };

  // Función para expandir/contraer registro
  const toggleExpandir = (id) => {
    setRegistroExpandido(registroExpandido === id ? null : id);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200/70 dark:border-dark-300/60 bg-white dark:bg-dark-200 shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-16 bg-gray-200/70 dark:bg-dark-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!registros || registros.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200/70 dark:border-dark-300/60 bg-white dark:bg-dark-200 shadow-lg p-12 text-center">
        <FaInfoCircle className="text-6xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No hay registros de auditoría
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No se encontraron registros con los filtros aplicados
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200/70 dark:border-dark-300/60 bg-white dark:bg-dark-200 shadow-lg">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-100/70 via-transparent to-transparent dark:from-slate-700/25 dark:via-transparent dark:to-transparent" />
      <div className="relative">
        {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/90 dark:bg-dark-300/80 border-b border-gray-200 dark:border-dark-300 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FaClock />
                  Fecha y Hora
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FaUser />
                  Usuario
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FaCog />
                  Acción
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FaDatabase />
                  Tabla
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                IP
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-300/80">
            {registros.map((registro) => (
              <React.Fragment key={registro.id_auditoria}>
                <tr className="transition-colors hover:bg-gray-50/80 dark:hover:bg-dark-300/70">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatearFecha(registro.fecha_hora)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100/80 dark:bg-blue-500/20 flex items-center justify-center">
                        <FaUser className="text-blue-600 dark:text-blue-300 text-xs" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {registro.usuario?.nombre_usuario || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getAccionColor(registro.accion)}`}>
                      <span>{getAccionIcon(registro.accion)}</span>
                      {registro.accion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-3 py-1 bg-gray-100/80 dark:bg-dark-300/70 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-mono">
                      {registro.tabla}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300/90 max-w-md truncate">
                    {registro.descripcion || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {registro.ip || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <button
                      onClick={() => toggleExpandir(registro.id_auditoria)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      title="Ver detalles"
                    >
                      <FaEye className="text-lg" />
                    </button>
                  </td>
                </tr>
                
                {/* Fila expandida con detalles */}
                {registroExpandido === registro.id_auditoria && (
                  <tr className="bg-gray-50/90 dark:bg-dark-300/70">
                    <td colSpan="7" className="px-6 py-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Datos Antiguos */}
                        {registro.datos_antiguos && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                              Datos Anteriores:
                            </h4>
                            <pre className="bg-white/90 dark:bg-dark-400 p-3 rounded-lg text-xs overflow-x-auto border border-gray-200/80 dark:border-dark-300/70 text-gray-800 dark:text-gray-200">
                              {JSON.stringify(registro.datos_antiguos, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {/* Datos Nuevos */}
                        {registro.datos_nuevos && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                              Datos Nuevos:
                            </h4>
                            <pre className="bg-white/90 dark:bg-dark-400 p-3 rounded-lg text-xs overflow-x-auto border border-gray-200/80 dark:border-dark-300/70 text-gray-800 dark:text-gray-200">
                              {JSON.stringify(registro.datos_nuevos, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {paginacion && paginacion.totalPaginas > 1 && (
        <div className="bg-gray-50/95 dark:bg-dark-300/80 px-6 py-4 border-t border-gray-200 dark:border-dark-300 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando <span className="font-medium">{((paginacion.pagina - 1) * paginacion.limite) + 1}</span> a{' '}
              <span className="font-medium">
                {Math.min(paginacion.pagina * paginacion.limite, paginacion.total)}
              </span>{' '}
              de <span className="font-medium">{paginacion.total}</span> registros
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onCambiarPagina(paginacion.pagina - 1)}
                disabled={paginacion.pagina === 1}
                className="px-4 py-2 rounded-lg border border-gray-200/90 dark:border-dark-300 bg-white/90 dark:bg-dark-200/80 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50/90 dark:hover:bg-dark-300/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FaChevronLeft />
                Anterior
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(paginacion.totalPaginas)].map((_, index) => {
                  const numeroPagina = index + 1;
                  // Mostrar solo algunas páginas alrededor de la actual
                  if (
                    numeroPagina === 1 ||
                    numeroPagina === paginacion.totalPaginas ||
                    (numeroPagina >= paginacion.pagina - 1 && numeroPagina <= paginacion.pagina + 1)
                  ) {
                    return (
                      <button
                        key={numeroPagina}
                        onClick={() => onCambiarPagina(numeroPagina)}
                        className={`px-4 py-2 rounded-lg transition-colors border ${
                          numeroPagina === paginacion.pagina
                            ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                            : 'border-gray-200/90 dark:border-dark-300 bg-white/90 dark:bg-dark-200/80 text-gray-700 dark:text-gray-200 hover:bg-gray-50/80 dark:hover:bg-dark-300/80'
                        }`}
                      >
                        {numeroPagina}
                      </button>
                    );
                  } else if (
                    numeroPagina === paginacion.pagina - 2 ||
                    numeroPagina === paginacion.pagina + 2
                  ) {
                    return <span key={numeroPagina} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => onCambiarPagina(paginacion.pagina + 1)}
                disabled={paginacion.pagina === paginacion.totalPaginas}
                className="px-4 py-2 bg-white dark:bg-dark-100 border border-gray-300 dark:border-dark-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Siguiente
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AuditoriaTable;
