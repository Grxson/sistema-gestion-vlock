import React from 'react';

const MiniChart = ({ 
  data = [], 
  type = 'line', 
  color = 'blue',
  height = 40,
  showDots = true 
}) => {
  const colorClasses = {
    blue: 'stroke-blue-500 fill-blue-50 dark:fill-blue-900/20',
    green: 'stroke-green-500 fill-green-50 dark:fill-green-900/20',
    purple: 'stroke-purple-500 fill-purple-50 dark:fill-purple-900/20',
    orange: 'stroke-orange-500 fill-orange-50 dark:fill-orange-900/20',
    red: 'stroke-red-500 fill-red-50 dark:fill-red-900/20'
  };

  const colors = colorClasses[color] || colorClasses.blue;

  // Generar datos de ejemplo si no se proporcionan
  const chartData = data.length > 0 ? data : [
    { x: 0, y: 20 }, { x: 1, y: 35 }, { x: 2, y: 25 }, { x: 3, y: 45 }, 
    { x: 4, y: 30 }, { x: 5, y: 55 }, { x: 6, y: 40 }
  ];

  const maxY = Math.max(...chartData.map(d => d.y));
  const minY = Math.min(...chartData.map(d => d.y));
  const range = maxY - minY || 1;

  const width = 120;
  const padding = 4;

  const getX = (index) => padding + (index * (width - 2 * padding)) / (chartData.length - 1);
  const getY = (value) => height - padding - ((value - minY) / range) * (height - 2 * padding);

  const pathData = chartData
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.y)}`)
    .join(' ');

  const areaData = `${pathData} L ${getX(chartData.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;

  if (type === 'bar') {
    return (
      <div className="flex items-end space-x-1 h-full">
        {chartData.map((point, index) => {
          const barHeight = ((point.y - minY) / range) * height;
          const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500',
            orange: 'bg-orange-500',
            red: 'bg-red-500'
          };
          
          return (
            <div
              key={index}
              className={`${colorClasses[color] || colorClasses.blue} opacity-60 rounded-sm`}
              style={{
                width: `${100 / chartData.length}%`,
                height: `${barHeight}px`,
                minHeight: '2px'
              }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* Área de fondo */}
        <path
          d={areaData}
          className={`${colors} opacity-30`}
        />
        
        {/* Línea principal */}
        <path
          d={pathData}
          className={`${colors} stroke-2`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Puntos */}
        {showDots && chartData.map((point, index) => {
          const fillColors = {
            blue: 'fill-blue-500',
            green: 'fill-green-500',
            purple: 'fill-purple-500',
            orange: 'fill-orange-500',
            red: 'fill-red-500'
          };
          
          return (
            <circle
              key={index}
              cx={getX(index)}
              cy={getY(point.y)}
              r="2"
              className={fillColors[color] || fillColors.blue}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default MiniChart;
