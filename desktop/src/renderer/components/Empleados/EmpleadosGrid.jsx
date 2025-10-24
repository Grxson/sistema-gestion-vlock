import React from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import PermissionButton from '../ui/PermissionButton';
import { STANDARD_ICONS } from '../../constants/icons';

const EmpleadosGrid = ({ 
  empleados, 
  onViewProfile, 
  onEdit, 
  onActivar, 
  onDesactivar, 
  onDeletePermanente 
}) => {
  
  const getInitials = (nombre, apellido) => {
    const n = nombre?.charAt(0)?.toUpperCase() || '';
    const a = apellido?.charAt(0)?.toUpperCase() || '';
    return n + a || 'NN';
  };

  const getPagoDisplay = (empleado) => {
    if (empleado.contrato?.salario_diario) {
      return {
        monto: parseFloat(empleado.contrato.salario_diario).toLocaleString(),
        tipo: '/día',
        label: 'Contrato'
      };
    } else if (empleado.pago_semanal) {
      return {
        monto: parseFloat(empleado.pago_semanal).toLocaleString(),
        tipo: '/semana',
        label: 'Independiente'
      };
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
      {empleados.map((empleado) => {
        const pago = getPagoDisplay(empleado);
        
        return (
          <motion.div
            key={empleado.id_empleado}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200/60 dark:border-gray-700/60 hover:border-primary-300 dark:hover:border-primary-700 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group"
          >
            {/* Header minimalista */}
            <div className="relative p-3 border-b border-gray-100 dark:border-gray-800">
              {/* Indicador de estado minimalista */}
              <div className="absolute top-2 right-2">
                <div className={`h-1.5 w-1.5 rounded-full ${
                  empleado.activo 
                    ? 'bg-green-500 ring-2 ring-green-200 dark:ring-green-900/50' 
                    : 'bg-gray-400 ring-2 ring-gray-200 dark:ring-gray-700'
                }`} title={empleado.activo ? 'Activo' : 'Inactivo'} />
              </div>

              {/* Avatar y nombre - diseño limpio */}
              <div className="flex items-center space-x-2.5 pr-4">
                <div className="flex-shrink-0">
                  <div className="h-11 w-11 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center ring-2 ring-primary-100 dark:ring-primary-900/30 group-hover:ring-primary-200 dark:group-hover:ring-primary-800/50 transition-all">
                    <span className="text-white font-semibold text-sm tracking-wide">
                      {getInitials(empleado.nombre, empleado.apellido)}
                    </span>
                  </div>
                </div>

                {/* Información del empleado */}
                <div className="flex-1 min-w-0">
                  <h3 
                    className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-0.5" 
                    title={`${empleado.nombre} ${empleado.apellido}`}
                  >
                    {empleado.nombre} {empleado.apellido}
                  </h3>
                  <p 
                    className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium" 
                    title={empleado.oficio?.nombre || 'Sin oficio'}
                  >
                    {empleado.oficio?.nombre || 'Sin oficio'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido - diseño minimalista */}
            <div className="px-3 py-2.5 space-y-2">
              {/* Información en lista limpia */}
              <div className="space-y-1.5">
                {/* NSS y RFC en líneas separadas */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">NSS</span>
                  <span className="text-gray-900 dark:text-white font-semibold truncate ml-2" title={empleado.nss || 'No registrado'}>
                    {empleado.nss || '—'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">RFC</span>
                  <span className="text-gray-900 dark:text-white font-semibold truncate ml-2" title={empleado.rfc || 'No registrado'}>
                    {empleado.rfc || '—'}
                  </span>
                </div>
              </div>

              {/* Separador sutil */}
              <div className="border-t border-gray-100 dark:border-gray-800"></div>

              {/* Pago - destacado con diseño limpio */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pago</span>
                {pago ? (
                  <div className="flex items-center space-x-1">
                    <CurrencyDollarIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-bold text-green-700 dark:text-green-300 truncate">
                      ${pago.monto}{pago.tipo}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Sin definir</span>
                )}
              </div>

              {/* Proyecto y Teléfono - solo si existen */}
              {(empleado.proyecto || empleado.telefono) && (
                <>
                  <div className="border-t border-gray-100 dark:border-gray-800"></div>
                  <div className="space-y-1.5">
                    {empleado.proyecto && (
                      <div className="flex items-start space-x-1.5">
                        <BuildingOfficeIcon className="h-3.5 w-3.5 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <p 
                          className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1 font-medium" 
                          title={empleado.proyecto.nombre}
                        >
                          {empleado.proyecto.nombre}
                        </p>
                      </div>
                    )}

                    {empleado.telefono && (
                      <div className="flex items-center space-x-1.5">
                        <PhoneIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium" title={empleado.telefono}>
                          {empleado.telefono}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer con acciones - diseño minimalista */}
            <div className="px-3 py-2 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between gap-1">
                {/* Ver perfil */}
                <button
                  onClick={() => onViewProfile(empleado)}
                  className="flex-1 p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-lg transition-all duration-150"
                  title="Ver perfil"
                >
                  <EyeIcon className="h-4 w-4 mx-auto" />
                </button>

                {/* Editar */}
                <PermissionButton
                  permissionCode="empleados.editar"
                  onClick={() => onEdit(empleado)}
                  className="flex-1 p-2 bg-transparent hover:bg-transparent text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 rounded-lg transition-all duration-150"
                  disabledMessage="No tienes permiso para editar empleados"
                  title="Editar"
                >
                  <PencilIcon className="h-4 w-4 mx-auto" />
                </PermissionButton>

                {/* Activar/Desactivar */}
                {empleado.activo ? (
                  <PermissionButton
                    permissionCode="empleados.editar"
                    onClick={() => onDesactivar(empleado.id_empleado)}
                    className="flex-1 p-2 bg-transparent hover:bg-transparent text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 rounded-lg transition-all duration-150"
                    disabledMessage="No tienes permiso para desactivar empleados"
                    title="Desactivar"
                  >
                    <XMarkIcon className="h-4 w-4 mx-auto" />
                  </PermissionButton>
                ) : (
                  <PermissionButton
                    permissionCode="empleados.editar"
                    onClick={() => onActivar(empleado.id_empleado)}
                    className="flex-1 p-2 bg-transparent hover:bg-transparent text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/10 rounded-lg transition-all duration-150"
                    disabledMessage="No tienes permiso para activar empleados"
                    title="Activar"
                  >
                    <CheckIcon className="h-4 w-4 mx-auto" />
                  </PermissionButton>
                )}

                {/* Eliminar */}
                <PermissionButton
                  permissionCode="empleados.eliminar"
                  onClick={() => onDeletePermanente(empleado.id_empleado)}
                  className="flex-1 p-2 bg-transparent hover:bg-transparent text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10 rounded-lg transition-all duration-150"
                  disabledMessage="No tienes permiso para eliminar empleados"
                  title="Eliminar permanentemente"
                >
                  <TrashIcon className="h-4 w-4 mx-auto" />
                </PermissionButton>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default EmpleadosGrid;
