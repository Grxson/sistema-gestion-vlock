import React, { useEffect, useState } from 'react';
import CustomSelect from '../ui/CustomSelect';
import DateInput from '../ui/DateInput';

export default function IngresoModal({ open, onClose, proyectos = [], initialData = null, onSubmit }) {
  const [form, setForm] = useState({
    fecha: '',
    id_proyecto: '',
    monto: '',
    fuente: '',
    descripcion: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        fecha: initialData.fecha || '',
        id_proyecto: String(initialData.id_proyecto || ''),
        monto: initialData.monto != null ? String(initialData.monto) : '',
        fuente: initialData.fuente || '',
        descripcion: initialData.descripcion || ''
      });
    } else {
      setForm({ fecha: '', id_proyecto: '', monto: '', fuente: '', descripcion: '' });
    }
  }, [initialData]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fecha: form.fecha,
        id_proyecto: form.id_proyecto ? Number(form.id_proyecto) : null,
        monto: form.monto ? Number(form.monto) : 0,
        fuente: form.fuente || null,
        descripcion: form.descripcion || null
      };
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-100 w-full max-w-xl rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initialData ? 'Editar ingreso' : 'Nuevo ingreso'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DateInput
              label="Fecha *"
              value={form.fecha}
              onChange={(v) => setForm({ ...form, fecha: v })}
            />
            <CustomSelect
              label="Proyecto *"
              value={form.id_proyecto}
              onChange={(v) => setForm({ ...form, id_proyecto: v })}
              options={(proyectos || []).map(p => ({ value: String(p.id_proyecto), label: p.nombre }))}
              placeholder="Selecciona proyecto"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuente</label>
              <input
                type="text"
                value={form.fuente}
                onChange={(e) => setForm({ ...form, fuente: e.target.value })}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Cliente, venta, transferencia, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Detalles del ingreso"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-300"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700"
            >
              {saving ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
