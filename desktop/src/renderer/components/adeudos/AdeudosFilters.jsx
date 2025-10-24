import React from 'react';
import { MagnifyingGlassIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AdeudosFilters = ({
  filtroTipo,
  setFiltroTipo,
  filtroEstado,
  setFiltroEstado,
  busqueda,
  setBusqueda,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin
}) => {
  const limpiarFechas = () => {
    setFechaInicio('');
    setFechaFin('');
  };

  return (
    <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-4">
      <div className="space-y-4">
        {/* Primera fila: Búsqueda, Tipo y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todos los tipos</option>
              <option value="nos_deben">Nos deben</option>
              <option value="debemos">Debemos</option>
            </select>
          </div>

          <div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="parcial">Solo Parciales</option>
              <option value="pagado">Pagados</option>
            </select>
          </div>
        </div>

        {/* Segunda fila: Rango de fechas */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-5 w-5" />
            <span className="font-medium">Filtrar por rango de fechas:</span>
          </div>
          
          <div className="flex items-center gap-2 flex-1">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="Fecha inicio"
            />
            
            <span className="text-gray-500 dark:text-gray-400">-</span>
            
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="Fecha fin"
            />

            {(fechaInicio || fechaFin) && (
              <button
                onClick={limpiarFechas}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                title="Limpiar fechas"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {(fechaInicio || fechaFin) && (
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              Afecta: Tabla y Total Pagado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdeudosFilters;
