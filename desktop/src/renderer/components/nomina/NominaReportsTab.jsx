import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useEmpleados } from '../../contexts/EmpleadosContext';
import NominaWeeklySummary from './NominaWeeklySummary';
import NominaCharts from './NominaCharts';
import NominaPaymentsList from './NominaPaymentsList';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function NominaReportsTab({ nominas, estadisticas, loading }) {
  const { isDarkMode } = useTheme();
  const { showError } = useToast();
  const { empleados } = useEmpleados();
  
  const [activeTab, setActiveTab] = useState('summary');
  const [weeklyData, setWeeklyData] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [paymentsData, setPaymentsData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);

  // Calcular datos semanales
  useEffect(() => {
    if (nominas && empleados) {
      calculateWeeklyData();
      calculateChartsData();
      calculatePaymentsData();
      calculateMonthlyData();
    }
  }, [nominas, empleados]);

  const calculateWeeklyData = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo

    // Filtrar nóminas de esta semana
    const weeklyNominas = nominas.filter(nomina => {
      const nominaDate = new Date(nomina.fecha_creacion || nomina.createdAt);
      return nominaDate >= startOfWeek && nominaDate <= endOfWeek;
    });

    // Calcular totales
    const totalAmount = weeklyNominas.reduce((sum, nomina) => {
      const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
      return sum + (isNaN(monto) ? 0 : monto);
    }, 0);

    const paidNominas = weeklyNominas.filter(nomina => 
      nomina.estado === 'pagada' || nomina.estado === 'Pagado'
    );

    const pendingNominas = weeklyNominas.filter(nomina => 
      nomina.estado === 'pendiente' || nomina.estado === 'Pendiente' || 
      nomina.estado === 'borrador' || nomina.estado === 'Borrador'
    );

    const partialPayments = weeklyNominas.filter(nomina => nomina.pago_parcial);

    setWeeklyData({
      totalAmount,
      totalNominas: weeklyNominas.length,
      paidNominas: paidNominas.length,
      pendingNominas: pendingNominas.length,
      partialPayments: partialPayments.length,
      paidAmount: paidNominas.reduce((sum, nomina) => {
        const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
        return sum + (isNaN(monto) ? 0 : monto);
      }, 0),
      pendingAmount: pendingNominas.reduce((sum, nomina) => {
        const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
        return sum + (isNaN(monto) ? 0 : monto);
      }, 0),
      startOfWeek,
      endOfWeek,
      weeklyNominas
    });
  };

  const calculateChartsData = () => {
    // Datos para gráfica de distribución por estado
    const estadosCount = nominas.reduce((acc, nomina) => {
      const estado = nomina.estado || 'Sin estado';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    // Datos para gráfica de pagos por semana del mes actual (4 semanas)
    const weeklyData = {};
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Generar las 4 semanas del mes
    const weeksOfMonth = [];
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(firstDayOfMonth);
      weekStart.setDate(firstDayOfMonth.getDate() + (week * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Asegurar que no exceda el último día del mes
      if (weekEnd > lastDayOfMonth) {
        weekEnd.setTime(lastDayOfMonth.getTime());
      }
      
      const weekKey = `Semana ${week + 1}`;
      weeksOfMonth.push(weekKey);
      weeklyData[weekKey] = 0;
    }

    nominas.forEach(nomina => {
      const nominaDate = new Date(nomina.fecha_creacion || nomina.createdAt);
      
      // Determinar en qué semana del mes cae la nómina
      const dayOfMonth = nominaDate.getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);
      const weekKey = `Semana ${Math.min(weekNumber, 4)}`;
      
      if (weeklyData.hasOwnProperty(weekKey)) {
        const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
        weeklyData[weekKey] += (isNaN(monto) ? 0 : monto);
      }
    });

    // Datos para gráfica de top empleados por monto
    const empleadosData = {};
    nominas.forEach(nomina => {
      const empleadoId = nomina.id_empleado || nomina.empleado?.id_empleado;
      if (empleadoId) {
        if (!empleadosData[empleadoId]) {
          empleadosData[empleadoId] = {
            nombre: nomina.empleado?.nombre || 'Sin nombre',
            apellido: nomina.empleado?.apellido || '',
            total: 0,
            count: 0
          };
        }
        const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
        empleadosData[empleadoId].total += (isNaN(monto) ? 0 : monto);
        empleadosData[empleadoId].count += 1;
      }
    });

    const topEmpleados = Object.values(empleadosData)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    setChartsData({
      estadosDistribution: {
        labels: Object.keys(estadosCount),
        data: Object.values(estadosCount),
        colors: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
      },
      monthlyPayments: {
        labels: weeksOfMonth,
        data: weeksOfMonth.map(week => weeklyData[week])
      },
      topEmpleados: {
        labels: topEmpleados.map(emp => `${emp.nombre} ${emp.apellido}`),
        data: topEmpleados.map(emp => emp.total),
        count: topEmpleados.map(emp => emp.count)
      }
    });
  };

  const calculatePaymentsData = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Filtrar nóminas de esta semana
    const weeklyNominas = nominas.filter(nomina => {
      const nominaDate = new Date(nomina.fecha_creacion || nomina.createdAt);
      return nominaDate >= startOfWeek && nominaDate <= endOfWeek;
    });

    // Agrupar por empleado
    const paymentsByEmpleado = {};
    weeklyNominas.forEach(nomina => {
      const empleadoId = nomina.id_empleado || nomina.empleado?.id_empleado;
      if (empleadoId) {
        if (!paymentsByEmpleado[empleadoId]) {
          paymentsByEmpleado[empleadoId] = {
            empleado: nomina.empleado || { nombre: 'Sin nombre', apellido: '' },
            nominas: [],
            totalAmount: 0,
            status: 'pending'
          };
        }
        paymentsByEmpleado[empleadoId].nominas.push(nomina);
        const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
        paymentsByEmpleado[empleadoId].totalAmount += (isNaN(monto) ? 0 : monto);
        
        // Determinar estado general
        if (nomina.estado === 'pagada' || nomina.estado === 'Pagado') {
          paymentsByEmpleado[empleadoId].status = 'paid';
        } else if (nomina.pago_parcial) {
          paymentsByEmpleado[empleadoId].status = 'partial';
        }
      }
    });

    setPaymentsData(Object.values(paymentsByEmpleado));
  };

  const calculateMonthlyData = () => {
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Filtrar nóminas del mes actual
    const monthlyNominas = nominas.filter(nomina => {
      const nominaDate = new Date(nomina.fecha_creacion || nomina.createdAt);
      return nominaDate >= firstDayOfMonth && nominaDate <= lastDayOfMonth;
    });

    // Calcular totales del mes
    const totalAmount = monthlyNominas.reduce((sum, nomina) => {
      const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
      return sum + (isNaN(monto) ? 0 : monto);
    }, 0);

    const paidNominas = monthlyNominas.filter(nomina => 
      nomina.estado === 'pagada' || nomina.estado === 'Pagado'
    );

    const pendingNominas = monthlyNominas.filter(nomina => 
      nomina.estado === 'pendiente' || nomina.estado === 'Pendiente' || 
      nomina.estado === 'borrador' || nomina.estado === 'Borrador'
    );

    const paidAmount = paidNominas.reduce((sum, nomina) => {
      const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
      return sum + (isNaN(monto) ? 0 : monto);
    }, 0);

    const pendingAmount = pendingNominas.reduce((sum, nomina) => {
      const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
      return sum + (isNaN(monto) ? 0 : monto);
    }, 0);

    setMonthlyData({
      totalAmount,
      totalNominas: monthlyNominas.length,
      paidNominas: paidNominas.length,
      pendingNominas: pendingNominas.length,
      paidAmount,
      pendingAmount,
      firstDayOfMonth,
      lastDayOfMonth,
      monthlyNominas
    });
  };

  const tabs = [
    { id: 'summary', name: 'Resumen Semanal', icon: CalendarIcon },
    { id: 'charts', name: 'Gráficas', icon: ChartBarIcon },
    { id: 'payments', name: 'Lista de Pagos', icon: UserGroupIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-dark-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando reportes de nómina...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Reportes y Gráficas de Nómina
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Análisis detallado de pagos semanales y tendencias
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {weeklyData ? 
                  `${weeklyData.startOfWeek.toLocaleDateString('es-MX')} - ${weeklyData.endOfWeek.toLocaleDateString('es-MX')}` :
                  'Cargando...'
                }
              </span>
            </div>
            
            {/* Subtotal Mensual */}
            {monthlyData && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                      $
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Total del Mes
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {monthlyData.totalNominas} nóminas • {monthlyData.paidNominas} pagadas • {monthlyData.pendingNominas} pendientes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(monthlyData.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {monthlyData.firstDayOfMonth.toLocaleDateString('es-MX', { month: 'short' })} {monthlyData.firstDayOfMonth.getFullYear()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'summary' && (
            <NominaWeeklySummary 
              weeklyData={weeklyData}
              loading={loading}
            />
          )}
          
          {activeTab === 'charts' && (
            <NominaCharts 
              chartsData={chartsData}
              loading={loading}
            />
          )}
          
          {activeTab === 'payments' && (
            <NominaPaymentsList 
              paymentsData={paymentsData}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
