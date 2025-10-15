import React from 'react';
import { 
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

const ViewToggle = ({ 
  viewMode, 
  onViewModeChange, 
  options = [
    { value: 'cards', icon: Squares2X2Icon, label: 'Vista de tarjetas' },
    { value: 'table', icon: ListBulletIcon, label: 'Vista de tabla' }
  ]
}) => {
  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = viewMode === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => onViewModeChange(option.value)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title={option.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewToggle;
