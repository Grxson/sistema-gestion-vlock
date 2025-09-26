import React from 'react';
import SimplePresupuestoCreator from './SimplePresupuestoCreator';

const NuevoPresupuesto = ({ onNavigate }) => {
  return (
    <div className="h-full">
      <SimplePresupuestoCreator onNavigate={onNavigate} />
    </div>
  );
};

export default NuevoPresupuesto;