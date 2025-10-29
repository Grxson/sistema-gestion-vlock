import React from 'react';
import DateInput from '../ui/DateInput';
import CustomSelect from '../ui/CustomSelect';

export default function IngresosFilters({ filters, proyectos, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <CustomSelect
          label="Proyecto"
          value={filters.id_proyecto || ''}
          onChange={(v) => set({ id_proyecto: v })}
          options={[{ value: '', label: 'Todos' }, ...(proyectos || []).map(p => ({ value: String(p.id_proyecto), label: p.nombre }))]}
          placeholder="Selecciona proyecto"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
        <input
          type="text"
          value={filters.q || ''}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Fuente o descripción..."
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div>
        <DateInput
          label="Desde"
          value={filters.fecha_inicio || ''}
          onChange={(v) => set({ fecha_inicio: v })}
        />
      </div>
      <div>
        <DateInput
          label="Hasta"
          value={filters.fecha_fin || ''}
          onChange={(v) => set({ fecha_fin: v })}
        />
      </div>
    </div>
  );
}
