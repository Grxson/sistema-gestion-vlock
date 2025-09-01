import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const DateInput = ({ 
  value, 
  onChange, 
  label, 
  placeholder = "Seleccionar fecha",
  className = "",
  disabled = false,
  required = false,
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    if (value && typeof value === 'string' && value.includes('-')) {
      try {
        const [year, month, day] = value.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } catch (error) {
        console.warn('Error parsing initial date value:', value);
        return null;
      }
    }
    return null;
  });
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);

  // Formatear fecha para mostrar
  const formatDisplayDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string' || !dateString.includes('-')) return '';
    try {
      // Crear fecha interpretando la string como fecha local (sin zona horaria)
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Formato más compacto: DD/MM/YYYY
      const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      };
      return date.toLocaleDateString('es-ES', options);
    } catch (error) {
      console.warn('Error formatting date:', dateString);
      return '';
    }
  };

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar fecha seleccionada cuando cambia el value
  useEffect(() => {
    if (value && typeof value === 'string' && value.includes('-')) {
      try {
        // Crear fecha interpretando la string como fecha local
        const [year, month, day] = value.split('-');
        const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        setSelectedDate(localDate);
        setCurrentDate(localDate);
      } catch (error) {
        console.warn('Error parsing date value:', value);
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleInputClick = () => {
    if (!disabled) {
      if (!isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCalendarPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX
        });
      }
      setIsOpen(!isOpen);
      if (selectedDate) {
        setCurrentDate(new Date(selectedDate));
      }
    }
  };

  const handleDateSelect = (date) => {
    // Crear fecha local sin problemas de zona horaria
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Formatear manualmente para evitar problemas de zona horaria
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    setSelectedDate(localDate);
    onChange(dateString);
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    setCurrentDate(localToday);
    handleDateSelect(localToday);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior para completar la semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDay = new Date(year, month, -i);
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    // Días del mes actual
    const today = new Date();
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const isToday = dayDate.getTime() === todayLocal.getTime();
      const isSelected = selectedDate && dayDate.getTime() === selectedDate.getTime();
      
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday,
        isSelected
      });
    }

    // Días del mes siguiente para completar la semana
    const remainingDays = 42 - days.length; // 6 semanas × 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonthDay = new Date(year, month + 1, day);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    return days;
  };

  const baseClasses = `
    relative w-full px-3 py-2 pr-10 
    border rounded-lg shadow-sm
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
    dark:bg-gray-700 dark:border-gray-600 dark:text-white
    ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-gray-400 hover:shadow-md'}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
    ${isOpen ? 'ring-2 ring-red-500 border-red-500' : ''}
    ${className}
  `;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="space-y-1" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Input personalizado */}
        <div 
          className={baseClasses}
          onClick={handleInputClick}
        >
          <span className={`block text-left text-sm ${!value ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
          
          {/* Icono de calendario */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <CalendarIcon className={`h-5 w-5 transition-colors duration-200 ${
              isOpen ? 'text-red-500' : error ? 'text-red-400' : 'text-gray-400'
            }`} />
          </div>
        </div>

        {/* Modal del calendario */}
        {isOpen && (
          <div className="fixed z-[9999] w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl overflow-hidden" 
               style={{
                 top: calendarPosition.top + 'px',
                 left: calendarPosition.left + 'px'
               }}>
            {/* Header del calendario */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigateMonth(-1)}
                  className="p-1 hover:bg-red-600 rounded-lg transition-colors duration-200"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                
                <div className="text-center">
                  <div className="text-sm font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </div>
                  <button
                    type="button"
                    onClick={navigateToToday}
                    className="text-xs text-red-100 hover:text-white transition-colors duration-200"
                  >
                    Ir a hoy
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => navigateMonth(1)}
                  className="p-1 hover:bg-red-600 rounded-lg transition-colors duration-200"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
              {dayNames.map((day) => (
                <div key={day} className="p-1.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-0">
              {getDaysInMonth(currentDate).map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
                  disabled={!day.isCurrentMonth}
                  className={`
                    p-1.5 text-sm transition-all duration-200 relative
                    ${day.isCurrentMonth 
                      ? 'text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/20' 
                      : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }
                    ${day.isSelected 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : ''
                    }
                    ${day.isToday && !day.isSelected 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold' 
                      : ''
                    }
                  `}
                >
                  <span className="relative z-10">{day.date.getDate()}</span>
                  
                  {/* Indicador de día actual */}
                  {day.isToday && !day.isSelected && (
                    <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer con acciones */}
            <div className="p-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setSelectedDate(null);
                    setIsOpen(false);
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default DateInput;
