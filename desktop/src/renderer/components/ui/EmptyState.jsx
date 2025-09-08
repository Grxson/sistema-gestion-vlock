import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action = null 
}) => {
  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
      <div className="text-center">
        {Icon && (
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {description}
        </p>
        
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
