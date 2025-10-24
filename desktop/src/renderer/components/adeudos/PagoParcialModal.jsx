import React, { useState, useEffect } from 'react';
import { BanknotesIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PagoParcialModal = ({
  isOpen,
  onClose,
  onSubmit,
  adeudo,
  formatCurrency
}) => {
  const [montoPago, setMontoPago] = useState('');
  const [notasPago, setNotasPago] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Soporte de teclado: ESC para cerrar
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting]);

  if (!isOpen || !adeudo) return null;

  const montoPendiente = parseFloat(adeudo.monto_pendiente || adeudo.monto);
  const montoPagado = parseFloat(adeudo.monto_pagado || 0);
  const montoOriginal = parseFloat(adeudo.monto_original || adeudo.monto);

  const handleClose = () => {
    setMontoPago('');
    setNotasPago('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const monto = parseFloat(montoPago);
    if (isNaN(monto) || monto <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    if (monto > montoPendiente) {
      alert(`El monto no puede ser mayor al pendiente: ${formatCurrency(montoPendiente)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        monto_pago: monto,
        notas_pago: notasPago.trim() || null
      });
      handleClose();
    } catch (error) {
      console.error('Error al registrar pago:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLiquidarCompleto = () => {
    setMontoPago(montoPendiente.toFixed(2));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 mr-3">
              <BanknotesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Registrar Pago
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {adeudo.nombre_entidad}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Resumen del adeudo */}
          <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Monto original:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(montoOriginal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Ya pagado:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(montoPagado)}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Pendiente:</span>
                <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                  {formatCurrency(montoPendiente)}
                </span>
              </div>
            </div>
          </div>

          {/* Monto del pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monto a pagar *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={montoPendiente}
                value={montoPago}
                onChange={(e) => setMontoPago(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={handleLiquidarCompleto}
              className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              disabled={isSubmitting}
            >
              Liquidar completo ({formatCurrency(montoPendiente)})
            </button>
          </div>

          {/* Notas del pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notasPago}
              onChange={(e) => setNotasPago(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Ej: Pago en efectivo, transferencia, etc..."
              disabled={isSubmitting}
            />
          </div>

          {/* Preview del resultado */}
          {montoPago && !isNaN(parseFloat(montoPago)) && parseFloat(montoPago) > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {parseFloat(montoPago) >= montoPendiente ? (
                  <>
                    ✅ <strong>El adeudo quedará liquidado completamente</strong>
                  </>
                ) : (
                  <>
                    📊 Quedará pendiente: <strong>{formatCurrency(montoPendiente - parseFloat(montoPago))}</strong>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !montoPago || parseFloat(montoPago) <= 0}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                'Registrar Pago'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PagoParcialModal;
