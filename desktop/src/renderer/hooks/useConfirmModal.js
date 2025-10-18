import { useState } from 'react';

/**
 * Hook personalizado para manejar modales de confirmación
 * @returns {Object} Objeto con funciones y estado del modal
 */
const useConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  /**
   * Abre el modal de confirmación con los datos especificados
   * @param {Object} data - Datos del modal
   * @param {string} data.title - Título del modal
   * @param {string} data.message - Mensaje del modal
   * @param {string} data.type - Tipo del modal (danger, warning, info)
   * @param {string} data.confirmText - Texto del botón de confirmación
   * @param {string} data.cancelText - Texto del botón de cancelación
   * @param {Function} data.onConfirm - Función a ejecutar al confirmar
   * @param {Function} data.onCancel - Función a ejecutar al cancelar (opcional)
   */
  const showConfirm = (data) => {
    setModalData(data);
    setIsOpen(true);
  };

  /**
   * Cierra el modal y ejecuta la función de confirmación si se proporciona
   */
  const handleConfirm = () => {
    if (modalData?.onConfirm) {
      modalData.onConfirm();
    }
    closeModal();
  };

  /**
   * Cierra el modal y ejecuta la función de cancelación si se proporciona
   */
  const handleCancel = () => {
    if (modalData?.onCancel) {
      modalData.onCancel();
    }
    closeModal();
  };

  /**
   * Cierra el modal y limpia los datos
   */
  const closeModal = () => {
    setIsOpen(false);
    setModalData(null);
  };

  return {
    isOpen,
    modalData,
    showConfirm,
    handleConfirm,
    handleCancel,
    closeModal
  };
};

export default useConfirmModal;
