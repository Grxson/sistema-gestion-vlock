import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useEmpleados } from '../../contexts/EmpleadosContext';
import api from '../../services/api';
import * as XLSX from 'xlsx';
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
  TableCellsIcon,
} from '@heroicons/react/24/outline';

export default function NominaReportsTab({ nominas, estadisticas, loading }) {
  const { isDarkMode } = useTheme();
  const { showError, showSuccess } = useToast();
  const { empleados } = useEmpleados();

  
  const [activeTab, setActiveTab] = useState('summary');
  const [weeklyData, setWeeklyData] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [paymentsData, setPaymentsData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  
  // Estados para reportes por semanas
  const [weeklyReportsData, setWeeklyReportsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [proyectos, setProyectos] = useState([]);

  const esPagoParcial = (valor) => {
    if (valor === null || valor === undefined) {
      return false;
    }

    if (typeof valor === 'boolean') {
      return valor;
    }

    if (typeof valor === 'number') {
      return valor === 1;
    }

    if (typeof valor === 'string') {
      const normalizado = valor.trim().toLowerCase();
      return normalizado === 'parcial' || normalizado === '1' || normalizado === 'true';
    }

    return false;
  };

  // Estados para filtrado de fechas en tabla detallada
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'thisWeek', 'lastWeek', 'thisMonth', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filteredNominas, setFilteredNominas] = useState(nominas || []);

  // Función para obtener el rango de fechas según el filtro seleccionado
  const getDateRange = (filter) => {
    const now = new Date();
    let startDate, endDate;

    switch (filter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      
      case 'thisWeek':
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lunes como primer día
        startDate = new Date(now);
        startDate.setDate(now.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'lastWeek':
        const lastWeekDay = now.getDay();
        const lastWeekDiff = lastWeekDay === 0 ? 6 : lastWeekDay - 1;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - lastWeekDiff - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      
      default: // 'all'
        return null;
    }

    return { startDate, endDate };
  };

  // Aplicar filtros de fecha
  useEffect(() => {
    if (!nominas || nominas.length === 0) {
      setFilteredNominas([]);
      return;
    }

    // Debug: verificar si hay nóminas parciales
    const parciales = nominas.filter(n => esPagoParcial(n.tipo_pago));
    if (parciales.length > 0) {
      console.log('📊 Nóminas parciales encontradas:', parciales.length, parciales);
    }

    if (dateFilter === 'all') {
      setFilteredNominas(nominas);
      return;
    }

    const dateRange = getDateRange(dateFilter);
    if (!dateRange) {
      setFilteredNominas(nominas);
      return;
    }

    const { startDate, endDate } = dateRange;
    const filtered = nominas.filter(nomina => {
      const nominaDate = new Date(nomina.fecha_creacion || nomina.createdAt || nomina.fecha);
      return nominaDate >= startDate && nominaDate <= endDate;
    });

    setFilteredNominas(filtered);
  }, [nominas, dateFilter, customStartDate, customEndDate]);

  // Función para exportar a Excel
  const exportToExcel = () => {
    const nominasToExport = filteredNominas.length > 0 ? filteredNominas : nominas;
    if (!nominasToExport || nominasToExport.length === 0) {
      showError('Error', 'No hay datos para exportar');
      return;
    }

    try {
      // Función para calcular semana del mes
      const calcularSemanaDelMes = (fecha) => {
        const año = fecha.getFullYear();
        const mes = fecha.getMonth();
        const dia = fecha.getDate();
        
        const primerDiaDelMes = new Date(año, mes, 1);
        const diaPrimerDia = primerDiaDelMes.getDay();
        const diasEnPrimeraFila = 7 - diaPrimerDia;
        
        if (dia <= diasEnPrimeraFila) {
          return 1;
        } else {
          const diasRestantes = dia - diasEnPrimeraFila;
          const semanaDelMes = 1 + Math.ceil(diasRestantes / 7);
          
          const ultimoDiaDelMes = new Date(año, mes + 1, 0);
          const diasEnElMes = ultimoDiaDelMes.getDate();
          const diasRestantesTotal = diasEnElMes - diasEnPrimeraFila;
          const filasAdicionales = Math.ceil(diasRestantesTotal / 7);
          const totalFilas = 1 + filasAdicionales;
          
          return Math.max(1, Math.min(semanaDelMes, totalFilas));
        }
      };

      // Preparar datos para Excel
      const datosExcel = nominasToExport.map((nomina, index) => {
        const empleado = empleados?.find(emp => emp.id_empleado === nomina.id_empleado);
        const diasLaborados = parseInt(nomina.dias_laborados) || 6;
        const sueldoBase = parseFloat(nomina.pago_semanal) || 0;
        const horasExtra = parseFloat(nomina.horas_extra) || 0;
        const bonos = parseFloat(nomina.bonos) || 0;
        const isr = parseFloat(nomina.deducciones_isr) || 0;
        const imss = parseFloat(nomina.deducciones_imss) || 0;
        const infonavit = parseFloat(nomina.deducciones_infonavit) || 0;
        const descuentos = parseFloat(nomina.descuentos) || 0;
        const totalAPagar = parseFloat(nomina.monto_total || nomina.monto) || 0;
        const fechaNomina = new Date(nomina.fecha_creacion || nomina.createdAt || nomina.fecha);
        const semanaDelMes = calcularSemanaDelMes(fechaNomina);
        
        // Determinar tipo de pago
        const tipoPago = esPagoParcial(nomina.tipo_pago) ? 'PARCIAL' : 'COMPLETA';
        
        // Determinar estado
        let estado = 'PENDIENTE';
        if (nomina.estado === 'pagada' || nomina.estado === 'Pagado' || nomina.estado === 'pagado') {
          estado = 'PAGADO';
        } else if (nomina.estado === 'borrador' || nomina.estado === 'Borrador') {
          estado = 'BORRADOR';
        }

        return {
          'Empleado': empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado no encontrado',
          'Oficio': empleado?.oficio?.nombre || 'Sin oficio',
          'Días Laborados': diasLaborados,
          'Sueldo Base': sueldoBase,
          'Horas Extra': horasExtra,
          'Bonos': bonos,
          'ISR': isr,
          'IMSS': imss,
          'Infonavit': infonavit,
          'Descuentos': descuentos,
          'Semana': `Semana ${semanaDelMes}`,
          'Total a Pagar': totalAPagar,
          'Tipo Pago': tipoPago,
          'Status': estado,
          'Fecha': fechaNomina.toLocaleDateString('es-MX')
        };
      });

      // Agregar fila de totales
      const totalSueldoBase = nominasToExport.reduce((total, nomina) => total + (parseFloat(nomina.pago_semanal) || 0), 0);
      const totalHorasExtra = nominasToExport.reduce((total, nomina) => total + (parseFloat(nomina.horas_extra) || 0), 0);
      const totalBonos = nominasToExport.reduce((total, nomina) => total + (parseFloat(nomina.bonos) || 0), 0);
      const totalISR = nominasToExport.reduce((total, nomina) => total + (parseFloat(nomina.deducciones_isr) || 0), 0);
      const totalIMSS = nominasToExport.reduce((total, nomina) => total + (parseFloat(nomina.deducciones_imss) || 0), 0);
      const totalInfonavit = nominasToExport.reduce((total, nomina) => total + (parseFloat(nomina.deducciones_infonavit) || 0), 0);
      const totalDescuentos = nominasToExport.reduce((total, nomina) => total + (parseFloat(nomina.descuentos) || 0), 0);
      const totalAPagar = nominasToExport.reduce((total, nomina) => {
        const monto = parseFloat(nomina.monto_total || nomina.monto);
        return total + (isNaN(monto) ? 0 : monto);
      }, 0);

      datosExcel.push({
        'Empleado': 'TOTALES',
        'Oficio': `${nominasToExport.length} empleados`,
        'Días Laborados': '-',
        'Sueldo Base': totalSueldoBase,
        'Horas Extra': totalHorasExtra,
        'Bonos': totalBonos,
        'ISR': totalISR,
        'IMSS': totalIMSS,
        'Infonavit': totalInfonavit,
        'Descuentos': totalDescuentos,
        'Semana': '-',
        'Total a Pagar': totalAPagar,
        'Tipo Pago': '-',
        'Status': '-',
        'Fecha': '-'
      });

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(datosExcel);

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 25 }, // Empleado
        { wch: 20 }, // Oficio
        { wch: 10 }, // Días Laborados
        { wch: 12 }, // Sueldo Base
        { wch: 12 }, // Horas Extra
        { wch: 12 }, // Bonos
        { wch: 12 }, // ISR
        { wch: 12 }, // IMSS
        { wch: 12 }, // Infonavit
        { wch: 12 }, // Descuentos
        { wch: 12 }, // Semana
        { wch: 15 }, // Total a Pagar
        { wch: 12 }, // Tipo Pago
        { wch: 12 }, // Status
        { wch: 12 }  // Fecha
      ];
      ws['!cols'] = colWidths;

      // Aplicar formato de número a las columnas numéricas
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        // Columnas: D=Sueldo Base, E=Horas Extra, F=Bonos, G=ISR, H=IMSS, I=Infonavit, J=Descuentos, L=Total a Pagar
        ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'L'].forEach(col => {
          const cellAddress = col + (row + 1);
          if (ws[cellAddress] && typeof ws[cellAddress].v === 'number') {
            ws[cellAddress].t = 'n'; // Tipo número
            ws[cellAddress].z = '#,##0.00'; // Formato con 2 decimales y separador de miles
          }
        });
      }

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Nóminas Detalladas');

      // Generar nombre de archivo con fecha actual
      const fechaActual = new Date();
      const nombreArchivo = `nominas_detalladas_${fechaActual.getFullYear()}_${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}_${fechaActual.getDate().toString().padStart(2, '0')}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo);

      showSuccess('Éxito', 'Archivo Excel exportado correctamente');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      showError('Error', 'No se pudo exportar el archivo Excel');
    }
  };

  // Cargar proyectos
  useEffect(() => {
    const loadProyectos = async () => {
      try {
        const response = await api.getProyectos();
        setProyectos(response.data || []);
      } catch (error) {
        console.error('Error cargando proyectos:', error);
      }
    };
    loadProyectos();
  }, []);

  // Calcular datos semanales
  useEffect(() => {
    if (nominas && empleados && proyectos.length > 0) {
      calculateWeeklyData();
      calculateChartsData();
      calculatePaymentsData();
      calculateMonthlyData();
      calculateWeeklyReportsData();
    }
  }, [nominas, empleados, proyectos, selectedPeriod, selectedYear]);

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
    // Datos para gráfica de nómina por proyecto
    const proyectosData = {};
    nominas.forEach(nomina => {
      const proyectoId = nomina.id_proyecto || (nomina.proyecto && nomina.proyecto.id_proyecto);
      
      // Buscar nombre del proyecto en el array de proyectos
      let proyectoNombre = 'Administrativo';
      if (proyectoId) {
        const proyecto = proyectos.find(p => p.id_proyecto === proyectoId);
        proyectoNombre = proyecto ? proyecto.nombre : `Proyecto ${proyectoId}`;
      }
      
      if (!proyectosData[proyectoNombre]) {
        proyectosData[proyectoNombre] = {
          monto: 0,
          cantidad: 0,
          empleados: new Set()
        };
      }
      
      const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
      proyectosData[proyectoNombre].monto += (isNaN(monto) ? 0 : monto);
      proyectosData[proyectoNombre].cantidad += 1;
      
      const empleadoId = nomina.id_empleado || (nomina.empleado && nomina.empleado.id_empleado);
      if (empleadoId) {
        proyectosData[proyectoNombre].empleados.add(empleadoId);
      }
    });
    
    // Convertir Set a número para empleados únicos
    Object.keys(proyectosData).forEach(proyecto => {
      proyectosData[proyecto].empleadosUnicos = proyectosData[proyecto].empleados.size;
      delete proyectosData[proyecto].empleados;
    });
    
    // Ordenar por monto descendente
    const proyectosOrdenados = Object.entries(proyectosData)
      .sort((a, b) => b[1].monto - a[1].monto);
    
    // Colores para proyectos
    const coloresProyectos = [
      '#3B82F6', // Azul
      '#10B981', // Verde
      '#F59E0B', // Ámbar
      '#EF4444', // Rojo
      '#8B5CF6', // Púrpura
      '#06B6D4', // Cian
      '#84CC16', // Lima
      '#F97316', // Naranja
      '#EC4899', // Rosa
      '#6B7280'  // Gris
    ];

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
      proyectosDistribution: {
        labels: proyectosOrdenados.map(([nombre]) => nombre),
        data: proyectosOrdenados.map(([, data]) => data.monto),
        cantidad: proyectosOrdenados.map(([, data]) => data.cantidad),
        empleados: proyectosOrdenados.map(([, data]) => data.empleadosUnicos),
        colors: proyectosOrdenados.map((_, index) => coloresProyectos[index % coloresProyectos.length]),
        detalles: proyectosOrdenados.map(([nombre, data]) => ({
          proyecto: nombre,
          monto: data.monto,
          cantidad: data.cantidad,
          empleados: data.empleadosUnicos
        }))
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

  const calculateWeeklyReportsData = () => {
    if (!nominas || !empleados) return;

    // Función para calcular semana del mes (mismo algoritmo que el wizard)
    const calcularSemanaDelMes = (fecha) => {
      const año = fecha.getFullYear();
      const mes = fecha.getMonth();
      const dia = fecha.getDate();
      
      const primerDiaDelMes = new Date(año, mes, 1);
      const diaPrimerDia = primerDiaDelMes.getDay();
      const diasEnPrimeraFila = 7 - diaPrimerDia;
      
      if (dia <= diasEnPrimeraFila) {
        return 1;
      } else {
        const diasRestantes = dia - diasEnPrimeraFila;
        const semanaDelMes = 1 + Math.ceil(diasRestantes / 7);
        
        const ultimoDiaDelMes = new Date(año, mes + 1, 0);
        const diasEnElMes = ultimoDiaDelMes.getDate();
        const diasRestantesTotal = diasEnElMes - diasEnPrimeraFila;
        const filasAdicionales = Math.ceil(diasRestantesTotal / 7);
        const totalFilas = 1 + filasAdicionales;
        
        return Math.max(1, Math.min(semanaDelMes, totalFilas));
      }
    };

    // Filtrar nóminas por período, año y estado (solo pagadas/completadas)
    let nominasFiltradas = nominas.filter(nomina => {
      // Solo incluir nóminas que están pagadas o completadas
      const estado = nomina.estado?.toLowerCase() || '';
      return estado === 'pagada' || estado === 'pagado' || estado === 'completada' || estado === 'completado';
    });
    
    if (selectedPeriod) {
      const [año, mes] = selectedPeriod.split('-').map(Number);
      nominasFiltradas = nominasFiltradas.filter(nomina => {
        const fechaNomina = new Date(nomina.fecha_creacion || nomina.createdAt || nomina.fecha);
        return fechaNomina.getFullYear() === año && fechaNomina.getMonth() === (mes - 1);
      });
    } else if (selectedYear) {
      nominasFiltradas = nominasFiltradas.filter(nomina => {
        const fechaNomina = new Date(nomina.fecha_creacion || nomina.createdAt || nomina.fecha);
        return fechaNomina.getFullYear() === selectedYear;
      });
    }

    // Agrupar por período y semana
    const reportesPorSemana = {};
    
    nominasFiltradas.forEach(nomina => {
      const fechaNomina = new Date(nomina.fecha_creacion || nomina.createdAt || nomina.fecha);
      const año = fechaNomina.getFullYear();
      const mes = fechaNomina.getMonth() + 1;
      const semanaDelMes = calcularSemanaDelMes(fechaNomina);
      
      const periodo = `${año}-${mes.toString().padStart(2, '0')}`;
      const clave = `${periodo}-Semana${semanaDelMes}`;
      
      if (!reportesPorSemana[clave]) {
        reportesPorSemana[clave] = {
          periodo,
          semana: semanaDelMes,
          año,
          mes,
          nombreMes: fechaNomina.toLocaleDateString('es-MX', { month: 'long' }),
          nominas: [],
          totalNominas: 0,
          totalMonto: 0,
          totalPagado: 0,
          totalPendiente: 0,
          empleados: new Set()
        };
      }
      
      const montoTotal = parseFloat(nomina.monto_total || nomina.monto || 0);
      
      // Si la nómina está pagada/completada, el monto pagado es igual al monto total
      const montoPagado = montoTotal; // Nóminas pagadas/completadas se pagaron en su totalidad
      
      reportesPorSemana[clave].nominas.push(nomina);
      reportesPorSemana[clave].totalNominas++;
      reportesPorSemana[clave].totalMonto += montoTotal;
      reportesPorSemana[clave].totalPagado += montoPagado;
      reportesPorSemana[clave].totalPendiente += 0; // No hay pendiente si está pagada
      reportesPorSemana[clave].empleados.add(nomina.id_empleado);
    });

    // Convertir a array y ordenar
    const reportesArray = Object.values(reportesPorSemana).map(reporte => ({
      ...reporte,
      totalEmpleados: reporte.empleados.size,
      empleados: Array.from(reporte.empleados)
    }));

    // Ordenar por año, mes y semana
    reportesArray.sort((a, b) => {
      if (a.año !== b.año) return b.año - a.año; // Más recientes primero
      if (a.mes !== b.mes) return b.mes - a.mes;
      return b.semana - a.semana;
    });

    // Calcular totales generales
    const totalesGenerales = reportesArray.reduce((totales, reporte) => {
      return {
        totalNominas: totales.totalNominas + reporte.totalNominas,
        totalMonto: totales.totalMonto + reporte.totalMonto,
        totalPagado: totales.totalPagado + reporte.totalPagado,
        totalPendiente: totales.totalPendiente + reporte.totalPendiente,
        totalEmpleados: Math.max(totales.totalEmpleados, reporte.totalEmpleados)
      };
    }, {
      totalNominas: 0,
      totalMonto: 0,
      totalPagado: 0,
      totalPendiente: 0,
      totalEmpleados: 0
    });

    setWeeklyReportsData({
      reportes: reportesArray,
      totales: totalesGenerales,
      periodosDisponibles: [...new Set(nominas.map(n => {
        const fecha = new Date(n.fecha_creacion || n.createdAt || n.fecha);
        return `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      }))].sort().reverse(),
      añosDisponibles: [...new Set(nominas.map(n => {
        const fecha = new Date(n.fecha_creacion || n.createdAt || n.fecha);
        return fecha.getFullYear();
      }))].sort((a, b) => b - a)
    });
  };

  const tabs = [
    { id: 'summary', name: 'Resumen Semanal', icon: CalendarIcon },
    { id: 'charts', name: 'Gráficas', icon: ChartBarIcon },
    { id: 'payments', name: 'Lista de Pagos', icon: UserGroupIcon },
    { id: 'weekly-reports', name: 'Reportes por Semanas', icon: TableCellsIcon },
    { id: 'detailed', name: 'Tabla Detallada', icon: DocumentTextIcon }
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
          
          {activeTab === 'weekly-reports' && (
            <div className="space-y-6">
              {/* Filtros */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Año
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(parseInt(e.target.value));
                        setSelectedPeriod('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:text-white"
                    >
                      <option value="">Todos los años</option>
                      {weeklyReportsData?.añosDisponibles?.map(año => (
                        <option key={año} value={año}>{año}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Período Específico
                    </label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => {
                        setSelectedPeriod(e.target.value);
                        if (e.target.value) {
                          const [año] = e.target.value.split('-');
                          setSelectedYear(parseInt(año));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:text-white"
                    >
                      <option value="">Todos los períodos</option>
                      {weeklyReportsData?.periodosDisponibles?.map(periodo => (
                        <option key={periodo} value={periodo}>{periodo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSelectedPeriod('');
                        setSelectedYear(new Date().getFullYear());
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                </div>
              </div>

              {/* Total General */}
              {weeklyReportsData?.totales && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <div className="flex-shrink-0">
                        <CurrencyDollarIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Total General Pagado</p>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(weeklyReportsData.totales.totalPagado)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {weeklyReportsData.totales.totalNominas} nóminas en {weeklyReportsData.reportes.length} semanas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabla Simple de Totales por Semana */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total de Nómina Pagada por Semana
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Solo nóminas con estado "Pagada" o "Completada"
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Semana
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total Pagado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {weeklyReportsData?.reportes?.map((reporte, index) => (
                        <tr key={`${reporte.periodo}-${reporte.semana}`} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {reporte.periodo} - Semana {reporte.semana}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(reporte.totalPagado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {(!weeklyReportsData?.reportes || weeklyReportsData.reportes.length === 0) && (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay reportes</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      No se encontraron nóminas para los filtros seleccionados.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'detailed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tabla Detallada de Nóminas
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredNominas?.length || 0} de {nominas?.length || 0} nóminas
                  </div>
                  <button
                    onClick={exportToExcel}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar Excel
                  </button>
                </div>
              </div>
              
              {/* Filtros de fecha */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Botones de filtro rápido */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDateFilter('all')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        dateFilter === 'all'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setDateFilter('today')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        dateFilter === 'today'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Hoy
                    </button>
                    <button
                      onClick={() => setDateFilter('thisWeek')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        dateFilter === 'thisWeek'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Esta Semana
                    </button>
                    <button
                      onClick={() => setDateFilter('lastWeek')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        dateFilter === 'lastWeek'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Semana Pasada
                    </button>
                    <button
                      onClick={() => setDateFilter('thisMonth')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        dateFilter === 'thisMonth'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Este Mes
                    </button>
                    <button
                      onClick={() => setDateFilter('custom')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        dateFilter === 'custom'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Personalizado
                    </button>
                  </div>
                  
                  {/* Inputs de fecha personalizada */}
                  {dateFilter === 'custom' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <span className="text-gray-500 dark:text-gray-400">a</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {filteredNominas && filteredNominas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Empleado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Oficio
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Días Lab.
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Sueldo Base
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Horas Extra
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Bonos
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          ISR
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          IMSS
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Infonavit
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Descuentos
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Semana
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total a Pagar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Tipo Pago
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredNominas.map((nomina, index) => {
                        const empleado = empleados?.find(emp => emp.id_empleado === nomina.id_empleado);
                        const diasLaborados = parseInt(nomina.dias_laborados) || 6;
                        const sueldoBase = parseFloat(nomina.pago_semanal) || 0;
                        const horasExtra = parseFloat(nomina.horas_extra) || 0;
                        const bonos = parseFloat(nomina.bonos) || 0;
                        const isr = parseFloat(nomina.deducciones_isr) || 0;
                        const imss = parseFloat(nomina.deducciones_imss) || 0;
                        const infonavit = parseFloat(nomina.deducciones_infonavit) || 0;
                        const descuentos = parseFloat(nomina.descuentos) || 0;
                        const totalAPagar = parseFloat(nomina.monto_total || nomina.monto) || 0;
                        
                        // Determinar tipo de pago
                        const esParcial = esPagoParcial(nomina.tipo_pago);
                        const tipoPago = esParcial ? 'PARCIAL' : 'COMPLETA';
                        const tipoPagoColor = esParcial 
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
                        
                        // Determinar estado
                        let estado = 'PENDIENTE';
                        let estadoColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
                        if (nomina.estado === 'pagada' || nomina.estado === 'Pagado' || nomina.estado === 'pagado') {
                          estado = 'PAGADO';
                          estadoColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                        } else if (nomina.estado === 'borrador' || nomina.estado === 'Borrador') {
                          estado = 'BORRADOR';
                          estadoColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                        }
                        
                        // Calcular semana del mes
                        const fechaNomina = new Date(nomina.fecha_creacion || nomina.createdAt || nomina.fecha);
                        const calcularSemanaDelMes = (fecha) => {
                          const año = fecha.getFullYear();
                          const mes = fecha.getMonth();
                          const dia = fecha.getDate();
                          
                          const primerDiaDelMes = new Date(año, mes, 1);
                          const diaPrimerDia = primerDiaDelMes.getDay();
                          const diasEnPrimeraFila = 7 - diaPrimerDia;
                          
                          if (dia <= diasEnPrimeraFila) {
                            return 1;
                          } else {
                            const diasRestantes = dia - diasEnPrimeraFila;
                            const semanaDelMes = 1 + Math.ceil(diasRestantes / 7);
                            
                            const ultimoDiaDelMes = new Date(año, mes + 1, 0);
                            const diasEnElMes = ultimoDiaDelMes.getDate();
                            const diasRestantesTotal = diasEnElMes - diasEnPrimeraFila;
                            const filasAdicionales = Math.ceil(diasRestantesTotal / 7);
                            const totalFilas = 1 + filasAdicionales;
                            
                            return Math.max(1, Math.min(semanaDelMes, totalFilas));
                          }
                        };
                        
                        const semanaDelMes = calcularSemanaDelMes(fechaNomina);
                        
                        return (
                          <tr key={nomina.id_nomina || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado no encontrado'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {empleado?.oficio?.nombre || 'Sin oficio'}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-center font-medium text-gray-900 dark:text-white">
                                {diasLaborados}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {formatCurrency(sueldoBase)}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {horasExtra > 0 ? formatCurrency(horasExtra) : '-'}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {bonos > 0 ? formatCurrency(bonos) : '-'}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-red-600 dark:text-red-400">
                                {isr > 0 ? `-${formatCurrency(isr)}` : '-'}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-red-600 dark:text-red-400">
                                {imss > 0 ? `-${formatCurrency(imss)}` : '-'}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-red-600 dark:text-red-400">
                                {infonavit > 0 ? `-${formatCurrency(infonavit)}` : '-'}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-red-600 dark:text-red-400">
                                {descuentos > 0 ? `-${formatCurrency(descuentos)}` : '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {semanaDelMes}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(totalAPagar)}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tipoPagoColor}`}>
                                {tipoPago}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoColor}`}>
                                {estado}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {fechaNomina.toLocaleDateString('es-MX')}
                            </td>
                          </tr>
                        );
                      })}
                      
                      {/* Fila de totales */}
                      <tr className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-300 dark:border-gray-600">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            TOTALES
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredNominas.length} empleados
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-center text-gray-500 dark:text-gray-400">
                            -
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(filteredNominas.reduce((total, nomina) => total + (parseFloat(nomina.pago_semanal) || 0), 0))}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(filteredNominas.reduce((total, nomina) => total + (parseFloat(nomina.horas_extra) || 0), 0))}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(filteredNominas.reduce((total, nomina) => total + (parseFloat(nomina.bonos) || 0), 0))}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-red-600 dark:text-red-400">
                            -{formatCurrency(filteredNominas.reduce((total, nomina) => total + (parseFloat(nomina.deducciones_isr) || 0), 0))}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-red-600 dark:text-red-400">
                            -{formatCurrency(filteredNominas.reduce((total, nomina) => total + (parseFloat(nomina.deducciones_imss) || 0), 0))}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-red-600 dark:text-red-400">
                            -{formatCurrency(filteredNominas.reduce((total, nomina) => total + (parseFloat(nomina.deducciones_infonavit) || 0), 0))}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-red-600 dark:text-red-400">
                            -{formatCurrency(filteredNominas.reduce((total, nomina) => total + (parseFloat(nomina.descuentos) || 0), 0))}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            -
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(filteredNominas.reduce((total, nomina) => {
                              const monto = parseFloat(nomina.monto_total || nomina.monto);
                              return total + (isNaN(monto) ? 0 : monto);
                            }, 0))}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            -
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            -
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            -
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No hay nóminas generadas
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Genera algunas nóminas para ver la tabla detallada
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
