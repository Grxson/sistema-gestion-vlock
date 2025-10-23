import React, { useState } from 'react';
import { 
  FaClipboardList, 
  FaChartBar, 
  FaDownload,
  FaSync,
  FaTable
} from 'react-icons/fa';
import { useAuditoriaData, useAuditoriaEstadisticas } from '../hooks/auditoria';
import AuditoriaStatsCards from '../components/auditoria/AuditoriaStatsCards';
import AuditoriaFilters from '../components/auditoria/AuditoriaFilters';
import AuditoriaTable from '../components/auditoria/AuditoriaTable';
import AuditoriaCharts from '../components/auditoria/AuditoriaCharts';
import AuditoriaExport from '../components/auditoria/AuditoriaExport';

/**
 * Página principal del módulo de Auditoría
 */
const Auditoria = () => {
  const [vistaActual, setVistaActual] = useState('tabla'); // 'tabla' o 'graficos'
  const [mostrarExportacion, setMostrarExportacion] = useState(false);

  // Hook para datos de auditoría
  const {
    registros,
    loading: loadingRegistros,
    paginacion,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    cambiarPagina,
    recargar
  } = useAuditoriaData();

  // Hook para estadísticas
  const {
    estadisticas,
    loading: loadingEstadisticas,
    recargar: recargarEstadisticas
  } = useAuditoriaEstadisticas(filtros);

  /**
   * Manejar cambio de vista
   */
  const handleCambiarVista = (vista) => {
    setVistaActual(vista);
  };

  /**
   * Manejar recargar todo
   */
  const handleRecargarTodo = () => {
    recargar();
    recargarEstadisticas();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-300 py-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
              <FaClipboardList className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Auditoría del Sistema</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Revisa la actividad registrada, filtra por usuario o tipo de acción y exporta los movimientos relevantes.
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRecargarTodo}
              disabled={loadingRegistros || loadingEstadisticas}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-dark-100 disabled:opacity-50"
            >
              <FaSync className={loadingRegistros || loadingEstadisticas ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button
              onClick={() => setMostrarExportacion(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <FaDownload />
              Exportar
            </button>
          </div>
        </div>

        {/* Selector de vista */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 p-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            <button
              onClick={() => handleCambiarVista('tabla')}
              className={`flex items-center gap-2 rounded px-3 py-1.5 transition-colors ${
                vistaActual === 'tabla'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-dark-100'
              }`}
            >
              <FaTable className="text-base" />
              Tabla
            </button>
            <button
              onClick={() => handleCambiarVista('graficos')}
              className={`flex items-center gap-2 rounded px-3 py-1.5 transition-colors ${
                vistaActual === 'graficos'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-dark-100'
              }`}
            >
              <FaChartBar className="text-base" />
              Gráficos
            </button>
          </div>
        </div>

      {/* Tarjetas de estadísticas */}
      <AuditoriaStatsCards 
        estadisticas={estadisticas} 
        loading={loadingEstadisticas} 
      />

      {/* Filtros */}
      <AuditoriaFilters
        filtros={filtros}
        onFiltrosChange={actualizarFiltros}
        onLimpiar={limpiarFiltros}
      />

      {/* Contenido según vista seleccionada */}
      {vistaActual === 'tabla' ? (
        <AuditoriaTable
          registros={registros}
          loading={loadingRegistros}
          paginacion={paginacion}
          onCambiarPagina={cambiarPagina}
        />
      ) : (
        <AuditoriaCharts
          estadisticas={estadisticas}
          loading={loadingEstadisticas}
        />
      )}

      {/* Modal de exportación */}
      {mostrarExportacion && (
        <AuditoriaExport
          filtros={filtros}
          onClose={() => setMostrarExportacion(false)}
        />
      )}
      </div>
    </div>
  );
};

export default Auditoria;
