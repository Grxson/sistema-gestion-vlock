import React, { useState, useEffect } from 'react';
import { CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import DateInput from './DateInput';

const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange = () => {},
  onEndDateChange = () => {},
  // Nuevo: callback combinado opcional
  onChange, // ( { startDate, endDate } )
  startLabel = "Fecha Inicio",
  endLabel = "Fecha Fin",
  className = "",
  disabled = false,
  required = false,
  error = null
}) => {
  const [startError, setStartError] = useState(null);
  const [endError, setEndError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  // Sincronizar el estado del filtro activo cuando cambian las fechas manualmente
  useEffect(() => {
    if (!startDate && !endDate) {
      setActiveFilter(null);
      return;
    }

    // Verificar si las fechas actuales coinciden con algún filtro predefinido
    const quickRanges = getQuickRanges();
    const matchingFilter = quickRanges.find(range => 
      range.start === startDate && range.end === endDate
    );

    if (matchingFilter) {
      setActiveFilter(matchingFilter.label);
    } else {
      setActiveFilter(null);
    }
  }, [startDate, endDate]);

  const handleStartDateChange = (date) => {
    setStartError(null);
    setEndError(null);
    
    if (date && endDate && new Date(date) > new Date(endDate)) {
      setStartError("La fecha de inicio no puede ser posterior a la fecha fin");
      return;
    }
    
    onStartDateChange(date);
    if (onChange) {
      onChange({ startDate: date, endDate });
    }
  };

  const handleEndDateChange = (date) => {
    setStartError(null);
    setEndError(null);
    
    if (date && startDate && new Date(date) < new Date(startDate)) {
      setEndError("La fecha fin no puede ser anterior a la fecha de inicio");
      return;
    }
    
    onEndDateChange(date);
    if (onChange) {
      onChange({ startDate, endDate: date });
    }
  };

  const getQuickRanges = () => {
    const today = new Date();
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // Semana con inicio en Lunes
    const day = today.getDay(); // 0..6 (0=Dom)
    const diffToMonday = (day + 6) % 7; // 0 si lunes
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - diffToMonday);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(thisWeekStart.getDate() - 1);
    // Mes actual y anterior (local)
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    return [
      {
        label: "Hoy",
        start: fmt(today),
        end: fmt(today)
      },
      {
        label: "Ayer",
        start: fmt(yesterday),
        end: fmt(yesterday)
      },
      {
        label: "Esta semana",
        start: fmt(thisWeekStart),
        end: fmt(today)
      },
      {
        label: "Semana pasada",
        start: fmt(lastWeekStart),
        end: fmt(lastWeekEnd)
      },
      {
        label: "Este mes",
        start: fmt(thisMonthStart),
        end: fmt(today)
      },
      {
        label: "Mes pasado",
        start: fmt(lastMonthStart),
        end: fmt(lastMonthEnd)
      }
    ];
  };

  const applyQuickRange = (range) => {
    // Si el filtro ya está activo, lo desactivamos (toggle)
    if (activeFilter === range.label) {
      setActiveFilter(null);
      handleStartDateChange('');
      handleEndDateChange('');
    } else {
      // Si no está activo, lo activamos
      setActiveFilter(range.label);
      handleStartDateChange(range.start);
      handleEndDateChange(range.end);
      // Asegurarnos de disparar una sola vez el cambio combinado tras seleccionar ambos
      if (onChange) {
        onChange({ startDate: range.start, endDate: range.end });
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Título del componente */}
      <div className="flex items-center space-x-2">
        <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Rango de Fechas
        </h3>
      </div>

      {/* Rangos rápidos */}
      <div className="flex flex-wrap gap-2">
        {getQuickRanges().map((range, index) => {
          const isActive = activeFilter === range.label;
          return (
            <button
              key={index}
              onClick={() => applyQuickRange(range)}
              disabled={disabled}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {range.label}
            </button>
          );
        })}
      </div>

      {/* Inputs de fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          label={startLabel}
          value={startDate}
          onChange={handleStartDateChange}
          placeholder="Fecha de inicio"
          disabled={disabled}
          required={required}
          error={startError}
        />
        
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center justify-center pt-6">
            <ArrowRightIcon className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex-1">
            <DateInput
              label={endLabel}
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="Fecha fin"
              disabled={disabled}
              required={required}
              error={endError}
            />
          </div>
        </div>
      </div>

      {/* Error general */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Información del rango seleccionado */}
      {startDate && endDate && !startError && !endError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            <span className="font-medium">Rango seleccionado:</span> {' '}
            {new Date(startDate).toLocaleDateString('es-ES')} - {new Date(endDate).toLocaleDateString('es-ES')}
            {' '}({Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1} días)
          </p>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
