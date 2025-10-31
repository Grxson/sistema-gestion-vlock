import React, { useState } from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import ProyectoResumen from '../components/proyectos/ProyectoResumen';
import ProyectoIngresosTable from '../components/proyectos/ProyectoIngresosTable';
import ProyectoSuministrosTable from '../components/proyectos/ProyectoSuministrosTable';
import ProyectoInfo from '../components/proyectos/ProyectoInfo';
import { useProyectoDetalleData } from '../hooks/useProyectoDetalleData';

function parseIdFromPath(currentPath) {
  // espera rutas tipo /proyectos/:id
  const parts = currentPath.split('/').filter(Boolean);
  const idx = parts.indexOf('proyectos');
  if (idx !== -1 && parts[idx+1]) return parts[idx+1];
  return null;
}

const ProyectoDetalle = ({ currentPath }) => {
  const { hasModuleAccess } = usePermissions();

  const id = parseIdFromPath(currentPath || window?.location?.pathname || '/proyectos');
  const canSeeCosts = hasModuleAccess('ingresos') || hasModuleAccess('suministros');

  const [tab, setTab] = useState('informacion');

  const {
    proyecto,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    ingresos,
    suministros,
    totals,
    loading
  } = useProyectoDetalleData(id);

  const goBack = () => window.navigateApp && window.navigateApp('/proyectos');

  if (!id) {
    return (
      <div className="p-6"><p className="text-gray-600 dark:text-gray-300">Ruta inválida</p></div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header + tarjeta de proyecto (sin contenido de Resumen) */}
        <ProyectoResumen
          proyecto={proyecto}
          fechaInicio={fechaInicio}
          setFechaInicio={setFechaInicio}
          fechaFin={fechaFin}
          setFechaFin={setFechaFin}
          totals={totals}
          ingresos={ingresos}
          suministros={suministros}
          canSeeCosts={canSeeCosts}
          onBack={goBack}
          showHeader={true}
          showProjectCard={true}
          showResumen={false}
        />
        {/* Tabs */}
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700 p-2">
          <nav className="-mb-px flex gap-6">
            {['informacion','resumen','ingresos','suministros'].map(t => (
              <button key={t} onClick={()=>setTab(t)} className={`px-3 pb-1 border-b-2 ${tab===t? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'} `}>
                {t === 'informacion' ? 'Información' : t === 'resumen' ? 'Resumen' : t === 'ingresos' ? 'Ingresos' : 'Suministros'}
              </button>
            ))}
          </nav>
        </div>

        {tab === 'informacion' && (
          <div className="mt-6">
            <ProyectoInfo proyecto={proyecto} />
          </div>
        )}

        {/* Contenido del tab seleccionado */}
        {tab === 'resumen' && (
          <div className="mt-6">
            <ProyectoResumen
              proyecto={proyecto}
              fechaInicio={fechaInicio}
              setFechaInicio={setFechaInicio}
              fechaFin={fechaFin}
              setFechaFin={setFechaFin}
              totals={totals}
              ingresos={ingresos}
              suministros={suministros}
              canSeeCosts={canSeeCosts}
              onBack={goBack}
              showHeader={false}
              showProjectCard={false}
              showResumen={true}
            />
          </div>
        )}

        {tab === 'ingresos' && (
          <div className="mt-6">
            <ProyectoIngresosTable ingresos={ingresos} />
          </div>
        )}

        {tab === 'suministros' && (
          <div className="mt-6">
            <ProyectoSuministrosTable suministros={suministros} />
          </div>
        )}

      </div>
    </div>
  );
};

export default ProyectoDetalle;
