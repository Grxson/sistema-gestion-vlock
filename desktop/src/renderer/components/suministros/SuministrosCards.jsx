import React from 'react';
import { FaDollarSign, FaBriefcase, FaBuilding, FaMoneyCheckAlt } from 'react-icons/fa';
import { formatCurrency } from '../../utils/currency';

// Memoizar componente para evitar re-renders innecesarios
const SuministrosCards = React.memo(({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* Total General */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-xs font-medium mb-1">Total General</p>
            <p className="text-xl font-bold">
              {formatCurrency(stats.totalGastado)}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-2">
            <FaDollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Gastos Administrativos */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg shadow-md p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-xs font-medium mb-1">Gastos Administrativos</p>
            <p className="text-xl font-bold">
              {formatCurrency(stats.gastosAdministrativos || 0)}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-2">
            <FaBriefcase className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Gastos de Proyectos */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-xs font-medium mb-1">Gastos de Proyectos</p>
            <p className="text-xl font-bold">
              {formatCurrency(stats.gastosProyectos || 0)}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-2">
            <FaBuilding className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Nóminas */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-xs font-medium mb-1">Nóminas</p>
            <p className="text-xl font-bold">
              {formatCurrency(stats.totalNominas || 0)}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-2">
            <FaMoneyCheckAlt className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
});

// Nombre para debugging
SuministrosCards.displayName = 'SuministrosCards';

export default SuministrosCards;
