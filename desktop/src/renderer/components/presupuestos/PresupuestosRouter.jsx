import React from 'react';
import PresupuestosPlaceholder from './PresupuestosPlaceholder';

/**
 * Mientras el módulo de presupuestos está en desarrollo
 * mostramos un placeholder informativo independientemente de la subruta.
 */
const PresupuestosRouter = () => {
  return <PresupuestosPlaceholder />;
};

export default PresupuestosRouter;