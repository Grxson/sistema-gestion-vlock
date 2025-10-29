import React from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  MinusIcon 
} from '@heroicons/react/24/outline';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  trendLabel,
  color = 'blue',
  subtitle,
  onClick,
  loading = false
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-900',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      textDark: 'text-blue-900 dark:text-blue-100',
      border: 'border-blue-200 dark:border-blue-900'
    },
    green: {
      bg: 'bg-green-500',
      bgLight: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      textDark: 'text-green-900 dark:text-green-100',
      border: 'border-green-200 dark:border-green-800'
    },
    purple: {
      bg: 'bg-purple-500',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      textDark: 'text-purple-900 dark:text-purple-100',
      border: 'border-purple-200 dark:border-purple-800'
    },
    orange: {
      bg: 'bg-orange-500',
      bgLight: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
      textDark: 'text-orange-900 dark:text-orange-100',
      border: 'border-orange-200 dark:border-orange-800'
    },
    red: {
      bg: 'bg-red-500',
      bgLight: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
      textDark: 'text-red-900 dark:text-red-100',
      border: 'border-red-200 dark:border-red-800'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowTrendingUpIcon className="h-4 w-4" />;
    if (trend === 'down') return <ArrowTrendingDownIcon className="h-4 w-4" />;
    return <MinusIcon className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-dark-100 overflow-hidden shadow-sm rounded-xl border ${colors.border} hover:shadow-md transition-all duration-200`}>
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`h-12 w-12 ${colors.bgLight} rounded-xl flex items-center justify-center animate-pulse`}>
                <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white dark:bg-dark-100 overflow-hidden shadow-sm rounded-xl border ${colors.border} hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`h-12 w-12 ${colors.bgLight} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon className={`h-6 w-6 ${colors.text}`} />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </p>
              <p className={`text-2xl font-bold ${colors.textDark} mt-1`}>
                {value}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {trend && trendValue && (
            <div className="flex flex-col items-end">
              <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {trendValue > 0 ? '+' : ''}{trendValue}%
                </span>
              </div>
              {trendLabel && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {trendLabel}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
