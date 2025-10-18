import { useCallback } from 'react';
import useConfirmModal from './useConfirmModal';
import nominasServices from '../services/nominas';

/**
 * Hook personalizado para manejar la eliminación de nóminas
 * @param {Function} onSuccess - Función a ejecutar después de eliminar exitosamente
 * @param {Function} onError - Función a ejecutar en caso de error
 * @returns {Object} Objeto con funciones y estado del modal de confirmación
 */
const useDeleteNomina = (onSuccess, onError) => {
  console.log('🔍 [useDeleteNomina] Hook inicializado');
  const confirmModal = useConfirmModal();

  /**
   * Función para eliminar una nómina
   * @param {Object} empleado - Datos del empleado
   * @param {Object} nomina - Datos de la nómina a eliminar
   */
  const deleteNomina = useCallback((empleado, nomina) => {
    // Verificar el estado de la nómina
    const estado = nomina.estado?.toLowerCase();
    if (estado === 'pagada' || estado === 'pagado' || estado === 'completada' || estado === 'completado') {
      onError?.('No se puede eliminar una nómina que ya está completada o pagada');
      return;
    }

    // Configurar datos del modal de confirmación
    const confirmData = {
      title: 'Eliminar Nómina',
      message: `¿Estás seguro de que deseas eliminar la nómina de ${empleado.nombre} ${empleado.apellido}?\n\nEsta acción es permanente y eliminará:\n• La nómina del empleado\n• El historial de cambios\n• Los pagos relacionados\n\nEsta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          console.log('🔍 [ELIMINAR] Usuario confirmó eliminación');
          
          // Llamar al servicio de eliminación
          const response = await nominasServices.nominas.delete(nomina.id_nomina);
          
          if (response.success) {
            console.log('✅ [ELIMINAR] Nómina eliminada exitosamente');
            onSuccess?.('Nómina eliminada correctamente');
          } else {
            console.error('❌ [ELIMINAR] Error en respuesta del servicio:', response);
            onError?.(response.message || 'No se pudo eliminar la nómina');
          }
        } catch (error) {
          console.error('❌ [ELIMINAR] Error eliminando nómina:', error);
          onError?.('No se pudo eliminar la nómina');
        }
      },
      onCancel: () => {
        console.log('🔍 [ELIMINAR] Usuario canceló eliminación');
      }
    };

    // Mostrar modal de confirmación
    confirmModal.showConfirm(confirmData);
  }, [confirmModal, onSuccess, onError]);

  return {
    ...confirmModal,
    deleteNomina
  };
};

export default useDeleteNomina;
