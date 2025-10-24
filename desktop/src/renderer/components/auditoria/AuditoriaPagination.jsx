import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const AuditoriaPagination = ({
  paginacion,
  onCambiarPagina,
  onCambiarLimite,
  loading = false
}) => {
  if (!paginacion) {
    return null;
  }

  const { pagina = 1, totalPaginas = 1, limite = 50, total = 0 } = paginacion;

  const inicio = total === 0 ? 0 : ((pagina - 1) * limite) + 1;
  const fin = Math.min(pagina * limite, total);

  const handleLimiteChange = (event) => {
    if (!onCambiarLimite) return;
    const value = Number(event.target.value);
    if (!Number.isNaN(value)) {
      onCambiarLimite(value);
    }
  };

  const renderNumeroDePagina = (numeroPagina) => (
    <button
      key={numeroPagina}
      onClick={() => onCambiarPagina && onCambiarPagina(numeroPagina)}
      disabled={loading || pagina === numeroPagina}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        numeroPagina === pagina
          ? 'border-gray-900 bg-gray-900 text-white dark:border-primary-600 dark:bg-primary-600'
          : 'border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-300'
      } ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      {numeroPagina}
    </button>
  );

  const numerosDePagina = [];
  for (let index = 1; index <= totalPaginas; index += 1) {
    if (
      index === 1 ||
      index === totalPaginas ||
      (index >= pagina - 1 && index <= pagina + 1)
    ) {
      numerosDePagina.push(renderNumeroDePagina(index));
    } else if (index === pagina - 2 || index === pagina + 2) {
      numerosDePagina.push(
        <span key={index} className="px-2 text-sm text-gray-500 dark:text-gray-400">
          ...
        </span>
      );
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Mostrando{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{inicio}</span>{' '}
        a{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{fin}</span>{' '}
        de{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{total.toLocaleString()}</span>{' '}
        registros
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onCambiarLimite && (
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            Registros por página
            <select
              value={limite}
              onChange={handleLimiteChange}
              disabled={loading}
              className="rounded-md border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-2 py-1 text-sm text-gray-700 dark:text-gray-200 focus:border-gray-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCambiarPagina && onCambiarPagina(pagina - 1)}
            disabled={loading || pagina === 1}
            className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-dark-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaChevronLeft />
            Anterior
          </button>

          <div className="flex items-center gap-1">
            {numerosDePagina}
          </div>

          <button
            onClick={() => onCambiarPagina && onCambiarPagina(pagina + 1)}
            disabled={loading || pagina === totalPaginas}
            className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-dark-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditoriaPagination;
