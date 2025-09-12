import React from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaBuilding, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaUser,
  FaToggleOn,
  FaToggleOff,
  FaTrashAlt,
  FaUndo,
  FaInfoCircle
} from 'react-icons/fa';

const ProveedorCard = ({
  proveedor,
  onEdit = null,
  onDelete = null,
  onDeletePermanent = null,
  onView = null,
  onViewDetails = null,
  estados = {}
}) => {
  const estadoInfo = estados[proveedor.activo?.toString()] || { 
    label: proveedor.activo ? 'Activo' : 'Inactivo', 
    color: proveedor.activo 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
  };

  const handleEdit = () => onEdit && onEdit(proveedor);
  const handleDelete = () => onDelete && onDelete(proveedor);
  const handleDeletePermanent = () => onDeletePermanent && onDeletePermanent(proveedor);
  const handleView = () => onView && onView(proveedor);
  const handleViewDetails = () => onViewDetails && onViewDetails(proveedor);

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Header de la tarjeta */}
      <div className="p-6 pb-4 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
                <FaBuilding className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {(proveedor.nombre && proveedor.nombre.trim()) ? proveedor.nombre.trim() : 'Proveedor sin nombre'}
                </h3>
                <div className="h-5">
                  {proveedor.razon_social && proveedor.razon_social !== proveedor.nombre && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {proveedor.razon_social}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Estado y tipo */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                {proveedor.activo ? (
                  <FaToggleOn className="w-3 h-3 mr-1" />
                ) : (
                  <FaToggleOff className="w-3 h-3 mr-1" />
                )}
                {estadoInfo.label}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {proveedor.tipo_proveedor}
              </span>
            </div>
          </div>
        </div>

        {/* Información de contacto - altura fija */}
        <div className="space-y-2 min-h-[120px]">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 h-5">
            <FaPhone className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">{proveedor.telefono || 'Sin información'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 h-5">
            <FaEnvelope className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">{proveedor.email || 'Sin información'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 h-5">
            <FaUser className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">{proveedor.contacto_principal || 'Sin información'}</span>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FaMapMarkerAlt className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2 h-10 overflow-hidden">
              {proveedor.direccion || 'Sin información'}
            </span>
          </div>

          {/* Información bancaria si existe */}
          {(proveedor.banco || proveedor.cuentaBancaria) && (
            <div className="pt-2">
              {proveedor.banco && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Banco:</strong> {proveedor.banco}
                </div>
              )}
              {proveedor.cuentaBancaria && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Cuenta:</strong> {proveedor.cuentaBancaria}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información adicional - RFC */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 h-5">
            <strong>RFC:</strong> {proveedor.rfc || 'No proporcionado'}
          </div>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl border-t border-gray-100 dark:border-gray-700 mt-auto">
        <div className="flex items-center justify-between">
          {/* Fechas */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {proveedor.createdAt && (
              <div>
                Creado: {new Date(proveedor.createdAt).toLocaleDateString('es-MX')}
              </div>
            )}
            {proveedor.updatedAt && proveedor.createdAt !== proveedor.updatedAt && (
              <div>
                Modificado: {new Date(proveedor.updatedAt).toLocaleDateString('es-MX')}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-1">
            {/* Botón Ver Solo Lectura */}
            <button
              onClick={handleViewDetails}
              className="inline-flex items-center p-2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Ver información (solo lectura)"
            >
              <FaInfoCircle className="w-4 h-4" />
            </button>

            {/* Botón Editar */}
            {onEdit && (
              <button
                onClick={handleEdit}
                className="inline-flex items-center p-2 text-amber-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Editar proveedor"
              >
                <FaEdit className="w-4 h-4" />
              </button>
            )}

            {/* Botón Desactivar */}
            {onDelete && proveedor.activo && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center p-2 text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                title="Desactivar proveedor"
              >
                <FaToggleOff className="w-4 h-4" />
              </button>
            )}

            {/* Botón Reactivar */}
            {onDelete && !proveedor.activo && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center p-2 text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                title="Reactivar proveedor"
              >
                <FaUndo className="w-4 h-4" />
              </button>
            )}

            {/* Botón Eliminar Definitivamente (solo para inactivos) */}
            {onDeletePermanent && !proveedor.activo && (
              <button
                onClick={handleDeletePermanent}
                className="inline-flex items-center p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Eliminar definitivamente (¡IRREVERSIBLE!)"
              >
                <FaTrashAlt className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProveedorCard;
