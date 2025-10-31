import React from 'react';

const InfoRow = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 dark:border-gray-700">
    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</div>
    <div className="col-span-2 text-sm text-gray-900 dark:text-gray-100 truncate">{value ?? '—'}</div>
  </div>
);

const ProyectoInfo = ({ proyecto }) => {
  if (!proyecto) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">Sin datos del proyecto</div>
      </div>
    );
  }

  const formatoFecha = (v) => {
    if (!v) return '—';
    const d = new Date(v);
    if (isNaN(d)) return v;
    return d.toISOString().slice(0,10);
  };

  const fechaInicio = proyecto.fecha_inicio || proyecto.fechaInicio || proyecto.inicio;
  const fechaFin = proyecto.fecha_fin || proyecto.fechaFin || proyecto.fin;

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Información del Proyecto</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <InfoRow label="Nombre" value={proyecto.nombre} />
          <InfoRow label="Ubicación" value={proyecto.ubicacion} />
          <InfoRow label="Cliente" value={proyecto.cliente?.nombre || proyecto.cliente_nombre || proyecto.cliente || '—'} />
          <InfoRow label="Responsable" value={proyecto.responsable?.nombre || proyecto.responsable || '—'} />
          <InfoRow label="Estado" value={proyecto.estado || '—'} />
          <InfoRow label="Tipo" value={proyecto.tipo || proyecto.categoria || '—'} />
        </div>
        <div>
          <InfoRow label="Fecha inicio" value={formatoFecha(fechaInicio)} />
          <InfoRow label="Fecha fin" value={formatoFecha(fechaFin)} />
          <InfoRow label="Presupuesto" value={proyecto.presupuesto ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(proyecto.presupuesto)) : '—'} />
          <InfoRow label="Notas" value={proyecto.notas || proyecto.descripcion || '—'} />
        </div>
      </div>
    </div>
  );
};

export default ProyectoInfo;
