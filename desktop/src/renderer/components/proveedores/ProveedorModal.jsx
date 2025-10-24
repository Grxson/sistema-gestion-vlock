import React, { useState, useEffect } from 'react';
import { FaTimes, FaBuilding, FaPhone, FaFileInvoice, FaPlus, FaTrash } from 'react-icons/fa';

const TIPOS_PROVEEDOR = {
  'MATERIALES': 'Materiales',
  'SERVICIOS': 'Servicios',
  'EQUIPOS': 'Equipos',
  'MIXTO': 'Mixto',
  'TRANSPORTE': 'Transporte',
  'CONSTRUCCION': 'Construcción',
  'MANTENIMIENTO': 'Mantenimiento',
  'CONSULTORIA': 'Consultoría',
  'SUBCONTRATISTA': 'Subcontratista',
  'HERRAMIENTAS': 'Herramientas',
  'COMBUSTIBLE': 'Combustible',
  'ALIMENTACION': 'Alimentación'
};

const ProveedorModal = ({
  proveedor = null,
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  loading = false,
  tipos = TIPOS_PROVEEDOR
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    telefonos: [''],
    email: '',
    direccion: '',
    contacto_principal: '',
    tipo_proveedor: 'SERVICIOS',
    observaciones: '',
    banco: '',
    cuentaBancaria: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resetear form cuando cambia el proveedor o se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (proveedor) {
        setFormData({
          nombre: proveedor.nombre || '',
          rfc: proveedor.rfc || '',
          telefonos: proveedor.telefono ? proveedor.telefono.split(',').map(t => t.trim()) : [''],
          email: proveedor.email || '',
          direccion: proveedor.direccion || '',
          contacto_principal: proveedor.contacto_principal || '',
          tipo_proveedor: proveedor.tipo_proveedor || 'SERVICIOS',
          observaciones: proveedor.observaciones || '',
          banco: proveedor.banco || '',
          cuentaBancaria: proveedor.cuentaBancaria || ''
        });
      } else {
        setFormData({
          nombre: '',
          rfc: '',
          telefonos: [''],
          email: '',
          direccion: '',
          contacto_principal: '',
          tipo_proveedor: 'SERVICIOS',
          observaciones: '',
          banco: '',
          cuentaBancaria: ''
        });
      }
      setErrors({});
    }
  }, [proveedor, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTelefonoChange = (index, value) => {
    const newTelefonos = [...formData.telefonos];
    newTelefonos[index] = value;
    setFormData(prev => ({
      ...prev,
      telefonos: newTelefonos
    }));
    
    if (errors.telefonos) {
      setErrors(prev => ({
        ...prev,
        telefonos: ''
      }));
    }
  };

  const addTelefono = () => {
    if (formData.telefonos.length < 3) {
      setFormData(prev => ({
        ...prev,
        telefonos: [...prev.telefonos, '']
      }));
    }
  };

  const removeTelefono = (index) => {
    if (formData.telefonos.length > 1) {
      const newTelefonos = formData.telefonos.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        telefonos: newTelefonos
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    const telefonosLlenos = formData.telefonos.filter(tel => tel.trim());
    if (telefonosLlenos.length === 0) {
      newErrors.telefonos = 'Al menos un teléfono es obligatorio';
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'El formato del email no es válido';
      }
    }

    if (formData.rfc && formData.rfc.trim()) {
      const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-V1-9][A-Z1-9][0-9A]$/;
      if (!rfcRegex.test(formData.rfc.trim().toUpperCase())) {
        newErrors.rfc = 'El formato del RFC no es válido';
      }
    }

    formData.telefonos.forEach((telefono, index) => {
      if (telefono.trim()) {
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        if (!phoneRegex.test(telefono.trim()) || telefono.trim().replace(/\D/g, '').length < 10) {
          newErrors.telefonos = `El teléfono ${index + 1} debe tener al menos 10 dígitos y solo contener números, espacios, guiones y paréntesis`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        nombre: formData.nombre.trim(),
        rfc: formData.rfc.trim().toUpperCase() || null,
        telefono: formData.telefonos.filter(tel => tel.trim()).join(', '),
        email: formData.email.trim() || null,
        direccion: formData.direccion.trim() || null,
        contacto_principal: formData.contacto_principal.trim() || null,
        tipo_proveedor: formData.tipo_proveedor,
        observaciones: formData.observaciones.trim() || null,
        banco: formData.banco.trim() || null,
        cuentaBancaria: formData.cuentaBancaria.trim() || null
      };

      await onSave(submitData);
    } catch (error) {
      console.error('❌ [ProveedorModal] Error en submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-4 pb-4">
      <div className="relative mx-auto p-0 border border-gray-300 dark:border-gray-700 w-full max-w-3xl bg-white dark:bg-dark-100 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <FaBuilding className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {proveedor ? 'Modifica los datos del proveedor' : 'Completa la información del nuevo proveedor'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting || loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="space-y-8">
            {/* Información Básica */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                <FaBuilding className="w-4 h-4 text-red-500" />
                Información Básica
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Proveedor *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.nombre 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Ej: CEMEX, Ferretería La Esperanza"
                    disabled={isSubmitting || loading}
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Proveedor *
                  </label>
                  <select
                    value={formData.tipo_proveedor}
                    onChange={(e) => handleInputChange('tipo_proveedor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={isSubmitting || loading}
                  >
                    {Object.entries(tipos).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    RFC (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.rfc}
                    onChange={(e) => handleInputChange('rfc', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.rfc 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="CEMX860524HG3"
                    disabled={isSubmitting || loading}
                    maxLength={13}
                  />
                  {errors.rfc && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rfc}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contacto Principal (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.contacto_principal}
                    onChange={(e) => handleInputChange('contacto_principal', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nombre del contacto"
                    disabled={isSubmitting || loading}
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                <FaPhone className="w-4 h-4 text-red-500" />
                Información de Contacto
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfonos *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {formData.telefonos.map((telefono, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="tel"
                          value={telefono}
                          onChange={(e) => handleTelefonoChange(index, e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                            errors.telefonos 
                              ? 'border-red-300 dark:border-red-600' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder={`Teléfono ${index + 1}`}
                          disabled={isSubmitting || loading}
                        />
                        <div className="flex gap-1">
                          {formData.telefonos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTelefono(index)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                              disabled={isSubmitting || loading}
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          )}
                          {index === formData.telefonos.length - 1 && formData.telefonos.length < 3 && (
                            <button
                              type="button"
                              onClick={addTelefono}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                              disabled={isSubmitting || loading}
                            >
                              <FaPlus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.telefonos && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telefonos}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email (Opcional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errors.email 
                          ? 'border-red-300 dark:border-red-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="contacto@empresa.com"
                      disabled={isSubmitting || loading}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Banco (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.banco}
                      onChange={(e) => handleInputChange('banco', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Ej: BBVA, Santander"
                      disabled={isSubmitting || loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cuenta Bancaria (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.cuentaBancaria}
                      onChange={(e) => handleInputChange('cuentaBancaria', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Número de cuenta"
                      disabled={isSubmitting || loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dirección (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange('direccion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Dirección completa"
                      disabled={isSubmitting || loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                <FaFileInvoice className="w-4 h-4 text-red-500" />
                Información Adicional
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observaciones (Opcional)
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Notas adicionales sobre el proveedor..."
                  disabled={isSubmitting || loading}
                />
              </div>
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-dark-200 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || loading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting || loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {proveedor ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                {proveedor ? 'Actualizar' : 'Crear'} Proveedor
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProveedorModal;
