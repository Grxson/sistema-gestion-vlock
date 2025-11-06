import React from 'react';
import DateRangePicker from '../ui/DateRangePicker';

export default function IngresosMovimientosFilters({ filters, onChange, proyectos }) {
  const { drStart, drEnd, proyectoId, tipo, fuente } = filters || {};

  const set = (patch) => onChange({ ...(filters||{}), ...patch });

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rango de Fechas</label>
        <DateRangePicker
          startDate={drStart||''}
          endDate={drEnd||''}
          onChange={({ startDate, endDate }) => set({ drStart: startDate, drEnd: endDate })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proyecto</label>
        <select
          value={proyectoId||''}
          onChange={(e)=>set({ proyectoId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:text-white"
        >
          <option value="">Todos</option>
          {(proyectos||[]).map(p => (
            <option key={p.id_proyecto} value={p.id_proyecto}>{p.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
        <select
          value={tipo||''}
          onChange={(e)=>set({ tipo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:text-white"
        >
          <option value="">Todos</option>
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
          <option value="ajuste">Ajuste</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuente</label>
        <select
          value={fuente||''}
          onChange={(e)=>set({ fuente: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:text-white"
        >
          <option value="">Todas</option>
          <option value="nomina">Nómina</option>
          <option value="suministro">Suministro</option>
          <option value="manual">Manual</option>
          <option value="otros">Otros</option>
        </select>
      </div>
    </div>
  );
}
