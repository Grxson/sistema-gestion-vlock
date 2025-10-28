import React from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const ChartsSection = ({ 
  empleados = [], 
  nominas = [], 
  estadisticas = {},
  loading = false,
  filtroProyecto = null,
  filtroFechaInicio = '',
  filtroFechaFin = ''
}) => {
  // Filtros alineados y default a Pagado
  const getFechaBaseNomina = (n) => {
    const base = n?.semana?.fecha_inicio || n?.fecha_pago || n?.fecha || n?.createdAt;
    const d = base ? new Date(base) : null;
    return d && !isNaN(d) ? d : null;
  };
  const normalizarEstado = (e) => (e || '').toLowerCase();

  const filteredNominas = React.useMemo(() => {
    const start = filtroFechaInicio ? new Date(filtroFechaInicio) : null;
    const end = filtroFechaFin ? new Date(filtroFechaFin) : null;
    const hasProyecto = !!filtroProyecto;
    const proyectoId = hasProyecto ? (filtroProyecto.id || filtroProyecto) : null;
    return (nominas || []).filter(n => {
      // Estado: solo Pagado por defecto
      const est = normalizarEstado(n.estado);
      if (est !== 'pagado' && est !== 'pagada') return false;
      // Fecha dentro del rango si hay
      const d = getFechaBaseNomina(n);
      if (!d) return false;
      if (start && d < new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0)) return false;
      if (end && d > new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)) return false;
      // Proyecto si aplica
      if (hasProyecto) {
        const nid = n.proyecto?.id || n.id_proyecto || n.proyecto_id;
        if (!nid || String(nid) !== String(proyectoId)) return false;
      }
      return true;
    });
  }, [nominas, filtroFechaInicio, filtroFechaFin, filtroProyecto]);

  // Generar datos para gráficos usando filteredNominas
  const getGastoNominaPorMes = React.useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const porMes = Array.from({ length: 12 }, (_, index) => ({ mes: meses[index], gasto: 0 }));
    filteredNominas.forEach(n => {
      const d = getFechaBaseNomina(n);
      if (!d) return;
      const monto = parseFloat(n.monto_total || n.monto || 0) || 0;
      porMes[d.getMonth()].gasto += monto;
    });
    return porMes;
  }, [filteredNominas]);

  const getDistribucionPorOficio = React.useMemo(() => {
    const oficios = {};
    empleados.forEach(emp => {
      const oficio = emp.oficio?.nombre || 'Sin oficio';
      oficios[oficio] = (oficios[oficio] || 0) + 1;
    });
    return Object.entries(oficios).map(([oficio, count]) => ({
      oficio,
      count,
      porcentaje: (count / empleados.length) * 100
    }));
  }, [empleados]);

  const getEstadosNominas = React.useMemo(() => {
    const estados = {};
    filteredNominas.forEach(n => {
      const estado = n.estado || 'Sin estado';
      estados[estado] = (estados[estado] || 0) + 1;
    });
    return Object.entries(estados).map(([estado, count]) => ({ estado, count }));
  }, [filteredNominas]);

  const gastoPorMes = getGastoNominaPorMes;
  const distribucionOficios = getDistribucionPorOficio;
  const estadosNominas = getEstadosNominas;

  // Total filtrado (solo Pagado + filtros aplicados)
  const totalFiltrado = React.useMemo(() => {
    return filteredNominas.reduce((sum, n) => sum + (parseFloat(n.monto_total || n.monto || 0) || 0), 0);
  }, [filteredNominas]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
              <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Análisis y Gráficos
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Visualización de datos de nóminas y empleados
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Gasto por Mes */}
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-blue-600" />
              Gasto en Nóminas por Mes
            </h4>
          </div>
          
          <div className="space-y-4">
            {gastoPorMes.map(({ mes, gasto }, index) => {
              const maxGasto = Math.max(...gastoPorMes.map(g => g.gasto));
              const porcentaje = maxGasto > 0 ? (gasto / maxGasto) * 100 : 0;
              
              return (
                <div key={mes} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {mes}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${gasto.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico de Distribución por Oficio */}
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2 text-green-600" />
              Distribución por Oficio
            </h4>
          </div>
          
          <div className="space-y-4">
            {distribucionOficios.map(({ oficio, count, porcentaje }, index) => {
              const colors = [
                'from-blue-500 to-blue-600',
                'from-green-500 to-green-600',
                'from-purple-500 to-purple-600',
                'from-orange-500 to-orange-600',
                'from-red-500 to-red-600',
                'from-indigo-500 to-indigo-600'
              ];
              const colorClass = colors[index % colors.length];
              
              return (
                <div key={oficio} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {oficio}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {count}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({porcentaje.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico de Estados de Nóminas */}
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-purple-600" />
              Estados de Nóminas
            </h4>
          </div>
          
          <div className="space-y-4">
            {estadosNominas.map(({ estado, count }, index) => {
              const total = estadosNominas.reduce((sum, e) => sum + e.count, 0);
              const porcentaje = total > 0 ? (count / total) * 100 : 0;
              
              const getEstadoColor = (estado) => {
                switch (estado) {
                  case 'Pagado': return 'from-green-500 to-green-600';
                  case 'Aprobada': return 'from-blue-500 to-blue-600';
                  case 'Pendiente': return 'from-yellow-500 to-yellow-600';
                  case 'Cancelada': return 'from-red-500 to-red-600';
                  default: return 'from-gray-500 to-gray-600';
                }
              };
              
              return (
                <div key={estado} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {estado}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {count}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({porcentaje.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getEstadoColor(estado)} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen Ejecutivo */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl border border-primary-200 dark:border-primary-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-primary-900 dark:text-primary-100 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Resumen Ejecutivo
            </h4>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white dark:bg-primary-900/30 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {empleados.length}
                </div>
                <div className="text-sm text-primary-700 dark:text-primary-300">
                  Total Empleados
                </div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-primary-900/30 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {nominas.length}
                </div>
                <div className="text-sm text-primary-700 dark:text-primary-300">
                  Nóminas Procesadas
                </div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-white dark:bg-primary-900/30 rounded-lg">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400" title="Total de nóminas Pagadas según filtros">
                ${totalFiltrado.toLocaleString()}
              </div>
              <div className="text-sm text-primary-700 dark:text-primary-300">
                Total Filtrado (Pagado)
              </div>
            </div>
            
            {estadisticas?.promedioSalarioMensual && (
              <div className="text-center p-4 bg-white dark:bg-primary-900/30 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  ${estadisticas.promedioSalarioMensual.toLocaleString()}
                </div>
                <div className="text-sm text-primary-700 dark:text-primary-300">
                  Salario Promedio
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
