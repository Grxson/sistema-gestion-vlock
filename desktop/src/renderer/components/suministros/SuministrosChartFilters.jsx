import React, { useState } from 'react';
import { FaFilter, FaCalendarAlt, FaChevronDown, FaChevronUp, FaRedo } from 'react-icons/fa';
import DateInput from '../ui/DateInput';

/**
 * Componente de filtros compactos para sidebar
 */
const SuministrosChartFilters = ({ 
  chartFilters, 
  setChartFilters, 
  proyectos,
  proveedores,
  categoriasDinamicas 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Obtener tipos únicos de las categorías dinámicas
  const tiposUnicos = categoriasDinamicas && Array.isArray(categoriasDinamicas)
    ? [...new Set(categoriasDinamicas.map(cat => cat.tipo).filter(Boolean))]
    : [];

  // Contar filtros activos
  const activeFiltersCount = [
    chartFilters.proyectoId,
    chartFilters.proveedorNombre,
    chartFilters.tipoSuministro,
    chartFilters.estado
  ].filter(Boolean).length;

  const handleReset = () => {
    setChartFilters({
      fechaInicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0],
      proyectoId: '',
      proveedorNombre: '',
      tipoSuministro: '',
      estado: '',
      tipoAnalisis: 'gastos'
    });
  };

  return (
    <div className="filters-compact">
      {/* Header colapsable */}
      <div className="filters-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="filters-title-wrapper">
          <FaFilter className="filters-icon" />
          <h3 className="filters-title">Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className="filters-badge">{activeFiltersCount}</span>
          )}
        </div>
        <button className="collapse-btn" type="button">
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {/* Contenido colapsable */}
      {isExpanded && (
        <div className="filters-content">
          {/* Filtros de fecha */}
          <div className="filter-group">
            <label className="filter-label">
              <FaCalendarAlt className="label-icon" />
              Fecha Inicio
            </label>
            <DateInput
              value={chartFilters.fechaInicio}
              onChange={(e) => setChartFilters({...chartFilters, fechaInicio: e.target.value})}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <FaCalendarAlt className="label-icon" />
              Fecha Fin
            </label>
            <DateInput
              value={chartFilters.fechaFin}
              onChange={(e) => setChartFilters({...chartFilters, fechaFin: e.target.value})}
              className="filter-input"
            />
          </div>

          {/* Filtro por Proyecto */}
          <div className="filter-group">
            <label className="filter-label">Proyecto</label>
            <select
              value={chartFilters.proyectoId}
              onChange={(e) => setChartFilters({...chartFilters, proyectoId: e.target.value})}
              className="filter-select"
            >
              <option value="">Todos</option>
              {proyectos && proyectos.map(proyecto => (
                <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Proveedor */}
          <div className="filter-group">
            <label className="filter-label">Proveedor</label>
            <select
              value={chartFilters.proveedorNombre}
              onChange={(e) => setChartFilters({...chartFilters, proveedorNombre: e.target.value})}
              className="filter-select"
            >
              <option value="">Todos</option>
              {proveedores && proveedores.map(proveedor => (
                <option key={proveedor.id_proveedor} value={proveedor.nombre}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Tipo */}
          <div className="filter-group">
            <label className="filter-label">Tipo</label>
            <select
              value={chartFilters.tipoSuministro}
              onChange={(e) => setChartFilters({...chartFilters, tipoSuministro: e.target.value})}
              className="filter-select"
            >
              <option value="">Todos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="filter-group">
            <label className="filter-label">Estado</label>
            <select
              value={chartFilters.estado}
              onChange={(e) => setChartFilters({...chartFilters, estado: e.target.value})}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="Solicitado">Solicitado</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Pedido">Pedido</option>
              <option value="En Tránsito">En Tránsito</option>
              <option value="Entregado">Entregado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Botón de reset */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="reset-btn"
              type="button"
            >
              <FaRedo className="reset-icon" />
              Restablecer
            </button>
          )}
        </div>
      )}

      {/* Estilos inline para el componente compacto */}
      <style jsx>{`
        .filters-compact {
          display: flex;
          flex-direction: column;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          padding: 0.75rem 0;
          border-bottom: 2px solid #e5e7eb;
          transition: border-color 0.2s;
        }

        .filters-header:hover {
          border-bottom-color: #3b82f6;
        }

        .dark .filters-header {
          border-bottom-color: #4a5568;
        }

        .dark .filters-header:hover {
          border-bottom-color: #60a5fa;
        }

        .filters-title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filters-icon {
          color: #3b82f6;
          font-size: 1rem;
        }

        .filters-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .dark .filters-title {
          color: #f9fafb;
        }

        .filters-badge {
          background: #3b82f6;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          min-width: 1.5rem;
          text-align: center;
        }

        .collapse-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .collapse-btn:hover {
          color: #3b82f6;
          transform: scale(1.1);
        }

        .dark .collapse-btn {
          color: #9ca3af;
        }

        .dark .collapse-btn:hover {
          color: #60a5fa;
        }

        .filters-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .dark .filter-label {
          color: #e5e7eb;
        }

        .label-icon {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .dark .label-icon {
          color: #9ca3af;
        }

        .filter-input,
        .filter-select {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          color: #111827;
          transition: all 0.2s;
        }

        .filter-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .dark .filter-input,
        .dark .filter-select {
          background: #1f2937;
          border-color: #4a5568;
          color: #f9fafb;
        }

        .dark .filter-input:focus,
        .dark .filter-select:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }

        .filter-select option {
          background: white;
          color: #111827;
        }

        .dark .filter-select option {
          background: #1f2937;
          color: #f9fafb;
        }

        .reset-btn {
          width: 100%;
          padding: 0.625rem;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .reset-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
        }

        .reset-btn:active {
          transform: translateY(0);
        }

        .reset-icon {
          font-size: 0.875rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .filters-title {
            font-size: 1rem;
          }

          .filter-label {
            font-size: 0.8125rem;
          }

          .filter-input,
          .filter-select {
            font-size: 0.8125rem;
            padding: 0.5rem 0.625rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SuministrosChartFilters;

