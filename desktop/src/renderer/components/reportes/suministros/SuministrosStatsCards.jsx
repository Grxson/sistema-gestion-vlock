import React from 'react';
import { 
  FaDollarSign, 
  FaBox, 
  FaTruck, 
  FaProjectDiagram,
  FaChartLine,
  FaStar
} from 'react-icons/fa';

/**
 * Componente de tarjetas de estadísticas para el dashboard de suministros
 * Muestra métricas clave como total gastado, registros, proveedores, etc.
 */
export default function SuministrosStatsCards({ estadisticas }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const stats = [
    {
      title: 'Total Gastado',
      value: formatCurrency(estadisticas?.totalGastado),
      icon: FaDollarSign,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'text-blue-200',
      textColor: 'text-blue-100'
    },
    {
      title: 'Total Registros',
      value: estadisticas?.totalRegistros?.toLocaleString() || '0',
      icon: FaBox,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'text-green-200',
      textColor: 'text-green-100'
    },
    {
      title: 'Proveedores Activos',
      value: estadisticas?.totalProveedores || '0',
      icon: FaTruck,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'text-purple-200',
      textColor: 'text-purple-100'
    },
    {
      title: 'Proyectos',
      value: estadisticas?.totalProyectos || '0',
      icon: FaProjectDiagram,
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'text-orange-200',
      textColor: 'text-orange-100'
    },
    {
      title: 'Promedio de Gasto',
      value: formatCurrency(estadisticas?.promedioGasto),
      icon: FaChartLine,
      gradient: 'from-indigo-500 to-indigo-600',
      iconBg: 'text-indigo-200',
      textColor: 'text-indigo-100',
      subtitle: 'Por registro'
    },
    {
      title: 'Proveedor Principal',
      value: estadisticas?.proveedorMasFrecuente || 'N/A',
      icon: FaStar,
      gradient: 'from-yellow-500 to-yellow-600',
      iconBg: 'text-yellow-200',
      textColor: 'text-yellow-100',
      subtitle: 'Más frecuente',
      valueClass: 'text-xl' // Texto más pequeño para nombres largos
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`bg-gradient-to-r ${stat.gradient} text-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-200`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`${stat.textColor} text-sm font-medium mb-1`}>
                {stat.title}
              </p>
              <p className={`${stat.valueClass || 'text-2xl'} font-bold truncate`} title={stat.value}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className={`${stat.textColor} text-xs mt-1`}>
                  {stat.subtitle}
                </p>
              )}
            </div>
            <stat.icon className={`text-3xl ${stat.iconBg} flex-shrink-0 ml-2`} />
          </div>
        </div>
      ))}
    </div>
  );
}
