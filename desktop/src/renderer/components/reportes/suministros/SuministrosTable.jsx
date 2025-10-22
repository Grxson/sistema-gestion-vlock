import React, { useState } from 'react';
import { FaBox, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

/**
 * Componente de tabla detallada para materiales más utilizados
 * Incluye ordenamiento y paginación
 */
export default function SuministrosTable({ materiales = [] }) {
  const [sortConfig, setSortConfig] = useState({ key: 'total_costo', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  // Función de ordenamiento
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Ordenar datos
  const sortedMateriales = React.useMemo(() => {
    if (!materiales || materiales.length === 0) return [];
    
    const sorted = [...materiales].sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    });

    return sorted;
  }, [materiales, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(sortedMateriales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMateriales = sortedMateriales.slice(startIndex, endIndex);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-blue-600" />
      : <FaSortDown className="text-blue-600" />;
  };

  if (!materiales || materiales.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <FaBox className="text-4xl mx-auto mb-2 opacity-50" />
          <p>No hay datos de materiales disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaBox className="text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Materiales Más Utilizados
            </h3>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total: {sortedMateriales.length} materiales
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                onClick={() => handleSort('descripcion')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Material
                  <SortIcon columnKey="descripcion" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('categoria')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Categoría
                  <SortIcon columnKey="categoria" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('frecuencia')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Frecuencia
                  <SortIcon columnKey="frecuencia" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('total_cantidad')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Cantidad Total
                  <SortIcon columnKey="total_cantidad" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('total_costo')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Costo Total
                  <SortIcon columnKey="total_costo" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentMateriales.map((material, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {material.descripcion || 'Sin descripción'}
                  </div>
                  {material.unidad_medida && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Unidad: {material.unidad_medida}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {material.categoria || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {material.frecuencia || 0} veces
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {(material.total_cantidad || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(material.total_costo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {startIndex + 1} - {Math.min(endIndex, sortedMateriales.length)} de {sortedMateriales.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
