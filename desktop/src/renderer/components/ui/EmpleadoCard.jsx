import React from 'react';
import { 
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const EmpleadoCard = ({ 
  empleado, 
  onView, 
  onEdit, 
  onDelete,
  showActions = true 
}) => {
  const pagoDiario = empleado.pago_diario || 
                    empleado.contrato?.salario_diario || 
                    empleado.salario_diario || 
                    empleado.salario_base_personal || 0;

  const tienePagoConfigurado = pagoDiario > 0;

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header con avatar y estado */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {empleado.nombre?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              {/* Estado activo/inactivo */}
              <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white dark:border-dark-100 flex items-center justify-center ${
                empleado.activo 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}>
                {empleado.activo ? (
                  <CheckCircleIcon className="h-3 w-3 text-white" />
                ) : (
                  <ExclamationTriangleIcon className="h-3 w-3 text-white" />
                )}
              </div>
            </div>

            {/* Información básica */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {empleado.nombre} {empleado.apellido}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {empleado.oficio?.nombre || 'Sin oficio asignado'}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  empleado.activo 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {empleado.activo ? 'Activo' : 'Inactivo'}
                </span>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tienePagoConfigurado
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {tienePagoConfigurado ? 'Pago Configurado' : 'Sin Pago'}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView?.(empleado)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Ver detalles"
              >
                <UserIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onEdit?.(empleado)}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Editar"
              >
                <WrenchScrewdriverIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Información detallada */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* NSS y RFC */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <IdentificationIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">NSS</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {empleado.nss || 'No registrado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <IdentificationIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">RFC</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {empleado.rfc || 'No registrado'}
                </p>
              </div>
            </div>
          </div>

          {/* Pago y Proyecto */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pago Diario</p>
                <p className={`text-sm font-medium ${
                  tienePagoConfigurado 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {tienePagoConfigurado ? `$${pagoDiario.toLocaleString()}` : 'No configurado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Proyecto</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {empleado.proyecto?.nombre || 'Sin proyecto'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con información adicional */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {empleado.telefono && (
              <div className="flex items-center space-x-1">
                <PhoneIcon className="h-3 w-3" />
                <span>{empleado.telefono}</span>
              </div>
            )}
          </div>
          
          <div className="text-xs">
            Alta: {empleado.fecha_alta ? new Date(empleado.fecha_alta).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpleadoCard;
