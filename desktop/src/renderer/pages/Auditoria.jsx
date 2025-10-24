import React, { useMemo, useState } from 'react';
import { 
  FaClipboardList, 
  FaChartBar, 
  FaDownload,
  FaSync,
  FaTable,
  FaClock,
  FaUserShield,
  FaDatabase
} from 'react-icons/fa';
import { useAuditoriaData, useAuditoriaEstadisticas } from '../hooks/auditoria';
import AuditoriaStatsCards from '../components/auditoria/AuditoriaStatsCards';
import AuditoriaFilters from '../components/auditoria/AuditoriaFilters';
import AuditoriaTable from '../components/auditoria/AuditoriaTable';
import AuditoriaCharts from '../components/auditoria/AuditoriaCharts';
import AuditoriaExport from '../components/auditoria/AuditoriaExport';
import AuditoriaPagination from '../components/auditoria/AuditoriaPagination';

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
    cambiarLimite,
    recargar
  } = useAuditoriaData();

  // Hook para estadísticas
  const {
    estadisticas,
    loading: loadingEstadisticas,
    recargar: recargarEstadisticas
  } = useAuditoriaEstadisticas(filtros);

  const ultimoRegistro = useMemo(() => (registros && registros.length ? registros[0] : null), [registros]);
  const usuarioDestacado = useMemo(() => (estadisticas?.actividadPorUsuario && estadisticas.actividadPorUsuario.length ? estadisticas.actividadPorUsuario[0] : null), [estadisticas]);
  const tablaDestacada = useMemo(() => (estadisticas?.actividadPorTabla && estadisticas.actividadPorTabla.length ? estadisticas.actividadPorTabla[0] : null), [estadisticas]);

  const formatFecha = (valor) => {
    if (!valor) return 'Sin registros';
    try {
      return new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(valor));
    } catch (error) {
      return 'Sin registros';
    }
  };

  const tarjetasDestacadas = useMemo(() => ([
    {
      id: 'ultimo-movimiento',
      titulo: 'Último movimiento',
      valor: formatFecha(ultimoRegistro?.fecha_hora),
      descripcion: ultimoRegistro ? `${ultimoRegistro.accion} en ${ultimoRegistro.tabla}` : 'Aún no se registran acciones',
      icono: FaClock,
      fondo: 'from-sky-500 via-indigo-500 to-purple-500'
    },
    {
      id: 'usuario-destacado',
      titulo: 'Usuario más activo',
      valor: usuarioDestacado?.usuario || 'Sin actividad destacada',
      descripcion: usuarioDestacado ? `${usuarioDestacado.cantidad} acciones registradas` : 'Cuando exista actividad se mostrará aquí',
      icono: FaUserShield,
      fondo: 'from-emerald-500 via-emerald-600 to-teal-500'
    },
    {
      id: 'tabla-destacada',
      titulo: 'Tabla más modificada',
      valor: tablaDestacada?.tabla || 'Sin datos disponibles',
      descripcion: tablaDestacada ? `${tablaDestacada.cantidad} operaciones registradas` : 'Observa aquí la tabla con más cambios',
      icono: FaDatabase,
      fondo: 'from-amber-500 via-orange-500 to-rose-500'
    }
  ]), [tablaDestacada, ultimoRegistro, usuarioDestacado]);

  const vistas = useMemo(() => ([
    {
      id: 'tabla',
      icono: FaTable,
      etiqueta: 'Tabla'
    },
    {
      id: 'graficos',
      icono: FaChartBar,
      etiqueta: 'Gráficos'
    }
  ]), []);

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
    <div className="min-h-screen bg-gray-100 dark:bg-dark-300 py-8">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 rounded-xl border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 p-8 shadow-sm">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-3 rounded-lg border border-gray-200 dark:border-dark-300 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 dark:bg-dark-300">
                  <FaClipboardList className="text-base text-gray-600 dark:text-gray-200" />
                </span>
                Auditoría del sistema
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Monitorea la actividad con un panel limpio y ordenado</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Consulta los registros más recientes, encuentra a los usuarios con más actividad y exporta la información que necesites con una presentación minimalista.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="rounded-lg border border-gray-200 dark:border-dark-300 px-3 py-1">
                  {estadisticas?.totalAcciones?.toLocaleString() || '0'} acciones registradas
                </span>
                <span className="rounded-lg border border-gray-200 dark:border-dark-300 px-3 py-1">
                  {estadisticas?.totalUsuarios?.toLocaleString() || '0'} usuarios participantes
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col items-stretch gap-3 sm:flex-row">
              <button
                onClick={handleRecargarTodo}
                disabled={loadingRegistros || loadingEstadisticas}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-dark-300 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-dark-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSync className={loadingRegistros || loadingEstadisticas ? 'animate-spin text-gray-500 dark:text-gray-300' : 'text-gray-500 dark:text-gray-300'} />
                Actualizar datos
              </button>
              <button
                onClick={() => setMostrarExportacion(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 dark:bg-primary-600 dark:hover:bg-primary-500"
              >
                <FaDownload />
                Exportar historial
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tarjetasDestacadas.map((tarjeta) => {
              const Icono = tarjeta.icono;
              return (
                <div
                  key={tarjeta.id}
                  className="rounded-lg border border-gray-200 dark:border-dark-300 bg-gray-50 dark:bg-dark-100 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{tarjeta.titulo}</p>
                      <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{tarjeta.valor}</p>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{tarjeta.descripcion}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-300">
                      <Icono className="text-base text-gray-600 dark:text-gray-200" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selector de vista */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 p-1 shadow-sm">
              {vistas.map((vista) => {
                const Icono = vista.icono;
                const activo = vistaActual === vista.id;
                return (
                  <button
                    key={vista.id}
                    onClick={() => handleCambiarVista(vista.id)}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activo
                        ? 'bg-gray-900 text-white shadow-sm dark:bg-primary-600'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    <Icono className="text-base" />
                    {vista.etiqueta}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Vista seleccionada: <span className="font-semibold text-gray-900 dark:text-gray-100">{vistaActual === 'tabla' ? 'Detalle tabular' : 'Panel de gráficos'}</span>
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
        <div className="space-y-4">
          <AuditoriaTable
            registros={registros}
            loading={loadingRegistros}
            paginacion={paginacion}
            onCambiarPagina={cambiarPagina}
          />
          <AuditoriaPagination
            paginacion={paginacion}
            onCambiarPagina={cambiarPagina}
            onCambiarLimite={cambiarLimite}
            loading={loadingRegistros}
          />
        </div>
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
