import React from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaBuilding, 
  FaPhone, 
  FaEnvelope,
  FaToggleOn,
  FaToggleOff,
  FaUser,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTrashAlt,
  FaUndo,
  FaInfoCircle
} from 'react-icons/fa';
import ProveedorName from '../ui/ProveedorName';
import { formatTelefono } from '../../utils/formatters';

const ProveedorTable = ({
  proveedores = [],
  onEdit = null,
  onDelete = null,
  onDeletePermanent = null,
  onView = null,
  onViewDetails = null,
  loading = false,
  estados = {},
  sortField = null,
  sortDirection = 'asc',
  onSort = null
}) => {
  // Función para obtener el nombre del proveedor de forma segura
  const getNombreProveedor = (proveedor) => {
    if (!proveedor.nombre) {
      return `Proveedor #${proveedor.id_proveedor}`;
    }
    
    const nombreLimpio = proveedor.nombre.trim();
    if (!nombreLimpio) {
      return `Proveedor #${proveedor.id_proveedor}`;
    }
    
    return nombreLimpio;
  };

  const handleSort = (field) => {
    if (onSort) {
      const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(field, direction);
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="w-3 h-3 text-gray-400" />;
    if (sortDirection === 'asc') return <FaSortUp className="w-3 h-3 text-red-500" />;
    return <FaSortDown className="w-3 h-3 text-red-500" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-dark-200">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                onClick={() => handleSort('nombre')}
              >
                <div className="flex items-center gap-2">
                  Proveedor
                  {onSort && getSortIcon('nombre')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                onClick={() => handleSort('tipo_proveedor')}
              >
                <div className="flex items-center gap-2">
                  Tipo
                  {onSort && getSortIcon('tipo_proveedor')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contacto
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                onClick={() => handleSort('activo')}
              >
                <div className="flex items-center gap-2">
                  Estado
                  {onSort && getSortIcon('activo')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Creado
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
            {proveedores.map((proveedor, index) => {
              const estadoInfo = estados[proveedor.activo?.toString()] || { 
                label: proveedor.activo ? 'Activo' : 'Inactivo', 
                color: proveedor.activo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
              };

              return (
                <tr 
                  key={proveedor.id_proveedor} 
                  className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors border-b border-gray-200 dark:border-gray-700"
                >
                  {/* Información del proveedor */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <FaBuilding className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <ProveedorName 
                          proveedor={proveedor}
                          maxLength={35}
                          size="small"
                          showRazonSocial={true}
                          nameClassName="text-sm font-medium text-gray-900 dark:text-white"
                          razonSocialClassName="text-sm text-gray-500 dark:text-gray-400"
                        />
                        {proveedor.rfc && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            RFC: {proveedor.rfc}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      {proveedor.tipo_proveedor}
                    </span>
                  </td>

                  {/* Información de contacto */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {proveedor.telefono && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaPhone className="w-3 h-3 text-gray-400" />
                          <span>{formatTelefono(proveedor.telefono)}</span>
                        </div>
                      )}
                      {proveedor.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaEnvelope className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[150px]">{proveedor.email}</span>
                        </div>
                      )}
                      {proveedor.contacto_principal && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaUser className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[150px]">{proveedor.contacto_principal}</span>
                        </div>
                      )}
                      {!proveedor.telefono && !proveedor.email && !proveedor.contacto_principal && (
                        <span className="text-sm text-gray-400 dark:text-gray-500">Sin información</span>
                      )}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                      {proveedor.activo ? (
                        <FaToggleOn className="w-3 h-3 mr-1" />
                      ) : (
                        <FaToggleOff className="w-3 h-3 mr-1" />
                      )}
                      {estadoInfo.label}
                    </span>
                  </td>

                  {/* Fecha de creación */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(proveedor.createdAt)}
                    </div>
                    {proveedor.updatedAt && proveedor.createdAt !== proveedor.updatedAt && (
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Mod: {formatDate(proveedor.updatedAt)}
                      </div>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {/* Botón Ver Solo Lectura */}
                      <button
                        onClick={() => onViewDetails && onViewDetails(proveedor)}
                        className="inline-flex items-center p-2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Ver información (solo lectura)"
                      >
                        <FaInfoCircle className="w-4 h-4" />
                      </button>

                      {/* Botón Editar */}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(proveedor)}
                          className="inline-flex items-center p-2 text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                          title="Editar proveedor"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Botón Desactivar/Reactivar */}
                      {onDelete && proveedor.activo && (
                        <button
                          onClick={() => onDelete(proveedor)}
                          className="inline-flex items-center p-2 text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                          title="Desactivar proveedor"
                        >
                          <FaToggleOff className="w-4 h-4" />
                        </button>
                      )}

                      {/* Botón Reactivar */}
                      {onDelete && !proveedor.activo && (
                        <button
                          onClick={() => onDelete(proveedor)}
                          className="inline-flex items-center p-2 text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Reactivar proveedor"
                        >
                          <FaUndo className="w-4 h-4" />
                        </button>
                      )}

                      {/* Botón Eliminar Definitivamente (solo para inactivos) */}
                      {onDeletePermanent && !proveedor.activo && (
                        <button
                          onClick={() => onDeletePermanent(proveedor)}
                          className="inline-flex items-center p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Eliminar definitivamente (¡IRREVERSIBLE!)"
                        >
                          <FaTrashAlt className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProveedorTable;
