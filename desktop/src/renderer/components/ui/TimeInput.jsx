import React, { useState, useRef, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

const TimeInput = ({ 
  value, 
  onChange, 
  label, 
  placeholder = "Seleccionar hora",
  className = "",
  disabled = false,
  required = false,
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);

  // Generar opciones de hora (cada 15 minutos)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTime(timeString);
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  // Formatear hora para mostrar (formato 12 horas con AM/PM)
  const formatTime = (timeString) => {
    if (!timeString || timeString === '' || timeString === '00:00' || timeString === '00:00:00') return '';
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${period}`;
  };

  // Calcular posición del picker
  const calculatePickerPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      const pickerHeight = 300; // Altura estimada del picker
      
      if (spaceBelow >= pickerHeight || spaceBelow >= spaceAbove) {
        // Mostrar abajo
        setPickerPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX
        });
      } else {
        // Mostrar arriba
        setPickerPosition({
          top: rect.top + window.scrollY - pickerHeight - 4,
          left: rect.left + window.scrollX
        });
      }
    }
  };

  // Cerrar picker al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Abrir picker
  const openPicker = () => {
    if (disabled) return;
    calculatePickerPosition();
    setIsOpen(true);
  };

  // Seleccionar hora
  const selectTime = (timeValue) => {
    onChange(timeValue);
    setIsOpen(false);
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={value ? formatTime(value) : ''}
          placeholder={placeholder}
          readOnly
          onClick={openPicker}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-10 border rounded-md cursor-pointer transition-colors duration-200
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
            }
            ${disabled 
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
              : 'bg-white dark:bg-dark-100 hover:border-red-400 dark:hover:border-red-500'
            }
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:border-transparent
          `}
        />
        
        <ClockIcon 
          className={`
            absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 
            ${disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}
            pointer-events-none
          `} 
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Time Picker Dropdown */}
      {isOpen && (
        <div 
          className="fixed bg-white dark:bg-dark-100 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[9999] w-72"
          style={{
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Seleccionar hora</h3>
              <ClockIcon className="h-5 w-5" />
            </div>
          </div>

          {/* Time List */}
          <div className="p-2 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-1 gap-1">
              {timeOptions.map(({ value: timeValue, display }) => (
                <button
                  key={timeValue}
                  onClick={() => selectTime(timeValue)}
                  className={`
                    px-3 py-2 text-left rounded-md transition-colors duration-150 text-sm
                    ${value === timeValue
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }
                  `}
                >
                  {display}
                  <span className="text-xs opacity-75 ml-2">({timeValue})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-600 p-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-150"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeInput;
