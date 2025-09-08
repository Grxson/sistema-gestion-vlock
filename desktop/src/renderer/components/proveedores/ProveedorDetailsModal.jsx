import React from 'react';
import { 
  FaTimes, 
  FaBuilding, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaIdCard,
  FaTag,
  FaToggleOn,
  FaToggleOff,
  FaUniversity,
  FaCreditCard,
  FaStickyNote,
  FaCalendar,
  FaInfoCircle
} from 'react-icons/fa';

const ProveedorDetailsModal = ({ proveedor, onClose }) => {
  if (!proveedor) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatPhones = (phoneString) => {
    if (!phoneString) return [];
    return phoneString.split(',').map(phone => phone.trim()).filter(phone => phone);
  };

  const getTypeColor = (tipo) => {
    const colors = {
      'MATERIALES': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'SERVICIOS': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'EQUIPOS': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'MIXTO': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'TRANSPORTE': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'CONSTRUCCION': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'MANTENIMIENTO': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      'CONSULTORIA': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'SUBCONTRATISTA': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      'HERRAMIENTAS': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'COMBUSTIBLE': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      'ALIMENTACION': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const phones = formatPhones(proveedor.telefono);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-900/20">
          <div className="flex items-center gap-3">
            <div>
              <FaInfoCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Información del Proveedor
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vista de solo lectura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Información General */}
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaBuilding className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Información General
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                      {proveedor.nombre || 'No especificado'}
                    </p>
                  </div>

                  {proveedor.razon_social && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Razón Social</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {proveedor.razon_social}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">RFC</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {proveedor.rfc || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Proveedor</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(proveedor.tipo_proveedor)}`}>
                        <FaTag className="w-3 h-3 mr-1" />
                        {proveedor.tipo_proveedor || 'No especificado'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        proveedor.activo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {proveedor.activo ? (
                          <FaToggleOn className="w-3 h-3 mr-1" />
                        ) : (
                          <FaToggleOff className="w-3 h-3 mr-1" />
                        )}
                        {proveedor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaUser className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Contacto
                </h3>
                
                <div className="space-y-3">
                  {proveedor.contacto_principal && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contacto Principal</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {proveedor.contacto_principal}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {proveedor.email || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfonos</label>
                    <div className="mt-1 space-y-1">
                      {phones.length > 0 ? phones.map((phone, index) => (
                        <p key={index} className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          <FaPhone className="w-3 h-3 text-gray-400" />
                          {phone}
                        </p>
                      )) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No especificado</p>
                      )}
                    </div>
                  </div>

                  {proveedor.direccion && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {proveedor.direccion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información Bancaria */}
            {(proveedor.banco || proveedor.cuentaBancaria) && (
              <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaUniversity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Información Bancaria
                </h3>
                
                <div className="space-y-3">
                  {proveedor.banco && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Banco</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {proveedor.banco}
                      </p>
                    </div>
                  )}

                  {proveedor.cuentaBancaria && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cuenta Bancaria</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                        {proveedor.cuentaBancaria}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Observaciones */}
            {proveedor.observaciones && (
              <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaStickyNote className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Observaciones
                </h3>
                
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {proveedor.observaciones}
                </p>
              </div>
            )}

            {/* Fechas del Sistema */}
            <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaCalendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Fechas del Sistema
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Creación</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatDate(proveedor.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Última Actualización</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatDate(proveedor.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProveedorDetailsModal;
