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
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const containerRef = useRef(null);

  // Formatear fecha para mostrar
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
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
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (selectedDate) {
        setCurrentDate(new Date(selectedDate));
      }
    }
  };

  const handleDateSelect = (date) => {
    const isoString = date.toISOString().split('T')[0];
    setSelectedDate(date);
    onChange(isoString);
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    handleDateSelect(today);
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
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const isToday = dayDate.toDateString() === today.toDateString();
      const isSelected = selectedDate && dayDate.toDateString() === selectedDate.toDateString();
      
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
    relative w-full px-4 py-3 pr-10 
    border rounded-lg shadow-sm
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    dark:bg-gray-700 dark:border-gray-600 dark:text-white
    ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-gray-400 hover:shadow-md'}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
    ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
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
          <span className={`block text-left ${!value ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
          
          {/* Icono de calendario */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <CalendarIcon className={`h-5 w-5 transition-colors duration-200 ${
              isOpen ? 'text-blue-500' : error ? 'text-red-400' : 'text-gray-400'
            }`} />
          </div>
        </div>

        {/* Modal del calendario */}
        {isOpen && (
          <div className="absolute z-50 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl overflow-hidden">
            {/* Header del calendario */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigateMonth(-1)}
                  className="p-1 hover:bg-blue-600 rounded-lg transition-colors duration-200"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </div>
                  <button
                    type="button"
                    onClick={navigateToToday}
                    className="text-sm text-blue-100 hover:text-white transition-colors duration-200"
                  >
                    Ir a hoy
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => navigateMonth(1)}
                  className="p-1 hover:bg-blue-600 rounded-lg transition-colors duration-200"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
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
                    p-2 text-sm transition-all duration-200 relative
                    ${day.isCurrentMonth 
                      ? 'text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                      : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }
                    ${day.isSelected 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : ''
                    }
                    ${day.isToday && !day.isSelected 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold' 
                      : ''
                    }
                  `}
                >
                  <span className="relative z-10">{day.date.getDate()}</span>
                  
                  {/* Indicador de día actual */}
                  {day.isToday && !day.isSelected && (
                    <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer con acciones */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setSelectedDate(null);
                    setIsOpen(false);
                  }}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
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
