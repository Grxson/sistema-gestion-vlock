import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '../../utils/currency';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useEmpleados } from '../../contexts/EmpleadosContext';
import api from '../../services/api';
import * as XLSX from 'xlsx';
import NominaWeeklySummary from './NominaWeeklySummary';
import NominaCharts from './NominaCharts';
import NominaPaymentsList from './NominaPaymentsList';
import DateRangePicker from '../ui/DateRangePicker';
import { calcularSemanaDelMes, semanaDelMesDesdeISO } from '../../utils/weekCalculator';
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
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [proyectos, setProyectos] = useState([]);
  const [drStart, setDrStart] = useState('');
  const [drEnd, setDrEnd] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Pagado'); // default Pagado
  const [searchText, setSearchText] = useState('');
  // Visibilidad de columnas (persistente)
  const [visibleCols, setVisibleCols] = useState({
    empleado: true,
    oficio: true,
    dias: true,
    sueldo: true,
    horasExtra: true,
    bonos: true,
    isr: true,
    imss: true,
    infonavit: true,
    descuentos: true,
    semana: true,
    total: true,
    tipoPago: true,
    status: true,
    fecha: true,
  });
  const [showColsPicker, setShowColsPicker] = useState(false);
  const [showColsPopover, setShowColsPopover] = useState(false);

  // Restaurar pestaña activa desde preferencias
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem('nominaReports_activeTab');
      if (savedTab) setActiveTab(savedTab);
    } catch {}
  }, []);

  // Guardar pestaña activa
  useEffect(() => {
    try { localStorage.setItem('nominaReports_activeTab', activeTab); } catch {}
  }, [activeTab]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nominaTablaDetallada_visibleCols');
      if (saved) {
        const parsed = JSON.parse(saved);
        setVisibleCols((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nominaTablaDetallada_visibleCols', JSON.stringify(visibleCols));
    } catch {}
  }, [visibleCols]);

  const toggleCol = (key) => setVisibleCols((v) => ({ ...v, [key]: !v[key] }));

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

  // Helpers de fechas y montos unificados (alineados a BD)
  const getBaseDate = (n) => {
    const raw = n?.semana?.fecha_inicio || n?.fecha_pago || n?.fecha || n?.createdAt || n?.fecha_creacion;
    if (!raw) return null;
    const d = new Date(raw);
    // Normalizar a mediodía local para evitar problemas TZ
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
  };
  const getMonto = (n) => {
    const v = parseFloat(n?.monto_total ?? n?.monto ?? n?.pago_semanal ?? 0);
    return Number.isFinite(v) ? v : 0;
  };

  // Debounce de búsqueda para evitar recomputación constante
  const [debouncedSearch, setDebouncedSearch] = useState(searchText);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  // Nominas filtradas (Fecha base: semana.fecha_inicio -> fecha_pago -> fecha/createdAt)
  const filteredNominas = useMemo(() => {
    const start = drStart ? new Date(drStart) : null;
    const end = drEnd ? new Date(drEnd) : null;
    const pid = filtroProyecto ? String(filtroProyecto) : '';
    return (nominas || [])
      .filter(n => {
        // Estado
        const est = (n.estado || '').toLowerCase();
        if (filtroEstado && filtroEstado !== 'Todos') {
          if (filtroEstado === 'Pagado') {
            if (!(est === 'pagado' || est === 'pagada')) return false;
          } else if (filtroEstado === 'Pendiente') {
            if (!(est === 'pendiente' || est === 'borrador' || est === 'en_proceso' || est === 'en proceso')) return false;
          } else if (filtroEstado === 'Aprobada') {
            if (!(est === 'aprobada' || est === 'aprobado')) return false;
          } else if (filtroEstado === 'Cancelada') {
            if (!(est === 'cancelada' || est === 'cancelado')) return false;
          }
        }
        // Proyecto
        if (pid) {
          const nid = n.id_proyecto || n.proyecto?.id_proyecto || n.proyecto?.id;
          if (!nid || String(nid) !== pid) return false;
        }
        // Fecha base
        const d = getBaseDate(n);
        if (!d) return false;
        if (start && d < new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0,0,0,0)) return false;
        if (end && d > new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23,59,59,999)) return false;
        // Búsqueda
        if (debouncedSearch) {
          const emp = `${n.empleado?.nombre || ''} ${n.empleado?.apellido || ''}`.toLowerCase();
          const proj = (n.proyecto?.nombre || '').toLowerCase();
          if (!emp.includes(debouncedSearch.toLowerCase()) && !proj.includes(debouncedSearch.toLowerCase())) return false;
        }
        return true;
      });
  }, [nominas, drStart, drEnd, filtroProyecto, filtroEstado, debouncedSearch]);

  // Totales filtrados (Fase B)
  const totalesFiltrados = useMemo(() => {
    const isPagada = (n) => {
      const est = (n.estado || '').toLowerCase();
      return est === 'pagado' || est === 'pagada' || est === 'completada' || est === 'completado';
    };
    const isPendienteOParcial = (n) => {
      const est = (n.estado || '').toLowerCase();
      return est === 'pendiente' || est === 'borrador' || est === 'en_proceso' || est === 'en proceso' || est === 'parcial';
    };
    const sum = (arr) => arr.reduce((acc, n) => acc + getMonto(n), 0);
    const pagadas = filteredNominas.filter(isPagada);
    const pendientes = filteredNominas.filter(isPendienteOParcial);
    return {
      totalPagado: sum(pagadas),
      totalPendiente: sum(pendientes),
      countPagadas: pagadas.length,
      countPendientes: pendientes.length,
      countTotal: filteredNominas.length,
    };
  }, [filteredNominas]);

  // Helper: calcular semana del mes usando ISO de la nómina si existe
  const computeSemanaDelMes = (n) => {
    const base = n?.semana?.fecha_inicio || n?.fecha_pago || n?.fecha || n?.createdAt || n?.fecha_creacion;
    if (n?.semana?.anio && n?.semana?.semana_iso) {
      // Derivar período desde la fecha base (YYYY-MM)
      if (base) {
        const d = new Date(base);
        const periodo = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const idx = semanaDelMesDesdeISO(periodo, n.semana.anio, n.semana.semana_iso);
        if (!Number.isNaN(idx) && idx) return idx;
      }
    }
    // Fallback a cálculo por fecha cuando no hay ISO en la nómina
    return base ? calcularSemanaDelMes(new Date(base)) : '—';
  };

  // Agrupar por semana del mes y calcular subtotales (Fase B)
  const gruposPorSemana = useMemo(() => {
    const map = new Map();
    filteredNominas.forEach((n) => {
      const semana = computeSemanaDelMes(n);
      if (!map.has(semana)) {
        map.set(semana, { rows: [], pagado: 0, comprometido: 0 });
      }
      const bucket = map.get(semana);
      bucket.rows.push(n);
      const monto = parseFloat(n.monto_total || n.monto || 0) || 0;
      const est = (n.estado || '').toLowerCase();
      if (est === 'pagado' || est === 'pagada' || est === 'completada' || est === 'completado') bucket.pagado += monto;
      else bucket.comprometido += monto;
    });
    return Array.from(map.entries()).sort((a, b) => {
      const ai = a[0] === '—' ? 99 : a[0];
      const bi = b[0] === '—' ? 99 : b[0];
      return ai - bi;
    });
  }, [filteredNominas]);

  // Helpers: semana ISO (jueves) -> semana del mes (1-5) que toca el mes de la fecha
  function getPeriodoFromDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  }

  function getWeeksTouchingMonth(periodo) {
    if (!periodo || !/^[0-9]{4}-[0-9]{2}$/.test(periodo)) return [];
    const [yearStr, monthStr] = periodo.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const first = new Date(year, month, 1, 12, 0, 0, 0);
    const last = new Date(year, month + 1, 0, 12, 0, 0, 0);
    const seen = new Set();
    const list = [];
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      const temp = new Date(d);
      const dow = temp.getDay();
      const deltaToThursday = dow === 0 ? -3 : (4 - dow);
      const th = new Date(temp);
      th.setDate(temp.getDate() + deltaToThursday);
      const isoYear = th.getFullYear();
      const firstThursday = new Date(isoYear, 0, 4, 12, 0, 0, 0);
      const firstDow = firstThursday.getDay();
      const deltaFirst = firstDow === 0 ? -3 : (4 - firstDow);
      const firstIsoWeekThursday = new Date(firstThursday);
      firstIsoWeekThursday.setDate(firstThursday.getDate() + deltaFirst);
      const diffDays = Math.round((th - firstIsoWeekThursday) / (24 * 3600 * 1000));
      const isoWeek = 1 + Math.floor(diffDays / 7);
      const key = `${isoYear}-${isoWeek}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ anio: isoYear, semana_iso: isoWeek });
      }
    }
    return list;
  }

  // Nota: Para coherencia con todo el sistema, usar util calcularSemanaDelMes(fecha)

  // Nota: el filtrado ahora se hace con useMemo (filteredNominas)

  // Función para exportar a Excel (con fuente y sufijo opcional)
  const exportToExcel = (source = null, nombreSufijo = '') => {
    const nominasToExport = source ? source : (filteredNominas.length > 0 ? filteredNominas : nominas);
    if (!nominasToExport || nominasToExport.length === 0) {
      showError('Error', 'No hay datos para exportar');
      return;
    }

    try {
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

      // Generar nombre de archivo con fecha actual y sufijo si aplica
      const fechaActual = new Date();
      let nombreArchivo = `nominas_detalladas_${fechaActual.getFullYear()}_${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}_${fechaActual.getDate().toString().padStart(2, '0')}`;
      if (nombreSufijo) nombreArchivo += `_${nombreSufijo}`;
      nombreArchivo += `.xlsx`;

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
    // Semana actual (L-D) solo para rangos visuales; datos con baseDate
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weeklyNominas = nominas.filter(n => {
      const d = getBaseDate(n);
      return d && d >= startOfWeek && d <= endOfWeek;
    });

    const paidNominas = weeklyNominas.filter(n => (n.estado||'').toLowerCase().includes('pagad'));
    const pendingNominas = weeklyNominas.filter(n => {
      const est = (n.estado||'').toLowerCase();
      return est === 'pendiente' || est === 'borrador' || est === 'en_proceso' || est === 'en proceso';
    });

    setWeeklyData({
      totalAmount: weeklyNominas.reduce((s, n) => s + getMonto(n), 0),
      totalNominas: weeklyNominas.length,
      paidNominas: paidNominas.length,
      pendingNominas: pendingNominas.length,
      partialPayments: weeklyNominas.filter(n => esPagoParcial(n.pago_parcial)).length,
      paidAmount: paidNominas.reduce((s, n) => s + getMonto(n), 0),
      pendingAmount: pendingNominas.reduce((s, n) => s + getMonto(n), 0),
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

    // Datos para gráfica: pagos por semana del mes actual (1-5) usando ISO->semana del mes
    const weeklyData = {};
    const currentMonth = new Date();
    const periodoActual = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}`;
    const weeksOfMonth = ['Semana 1','Semana 2','Semana 3','Semana 4','Semana 5'];
    weeksOfMonth.forEach(k => weeklyData[k] = 0);

    nominas.forEach(nomina => {
      const d = getBaseDate(nomina);
      if (!d) return;
      const periodo = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (periodo !== periodoActual) return;
      const w = computeSemanaDelMes(nomina);
      if (w && weeklyData[`Semana ${w}`] !== undefined) {
        weeklyData[`Semana ${w}`] += getMonto(nomina);
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
      const d = getBaseDate(nomina);
      return d && d >= startOfWeek && d <= endOfWeek;
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
        paymentsByEmpleado[empleadoId].totalAmount += getMonto(nomina);
        
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

    // Filtrar nóminas del mes actual (usando fecha base unificada)
    const monthlyNominasAll = nominas.filter(nomina => {
      const d = getBaseDate(nomina);
      return d && d >= firstDayOfMonth && d <= lastDayOfMonth;
    });

    // Solo considerar pagadas/completadas para el total mensual
    const isPaid = (n) => {
      const est = (n.estado || '').toLowerCase();
      return est === 'pagado' || est === 'pagada' || est === 'completada' || est === 'completado';
    };
    const paidNominas = monthlyNominasAll.filter(isPaid);
    const pendingNominas = monthlyNominasAll.filter(n => !isPaid(n));

    const paidAmount = paidNominas.reduce((sum, n) => sum + getMonto(n), 0);
    const pendingAmount = pendingNominas.reduce((sum, n) => sum + getMonto(n), 0);

    setMonthlyData({
      // total mensual solicitado: solo pagadas
      totalAmount: paidAmount,
      totalNominas: paidNominas.length,
      paidNominas: paidNominas.length,
      pendingNominas: pendingNominas.length,
      paidAmount,
      pendingAmount,
      firstDayOfMonth,
      lastDayOfMonth,
      monthlyNominas: monthlyNominasAll
    });
  };

  const calculateWeeklyReportsData = () => {
    if (!nominas || !empleados) return;

    // Usar util compartido calcularSemanaDelMes

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
              
              {/* Tarjetas de Totales (Fase B) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
                  <div className="text-xs text-gray-500">Total Pagado</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalesFiltrados.totalPagado)}</div>
                  <div className="text-xs text-gray-500">{totalesFiltrados.countPagadas} nóminas</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
                  <div className="text-xs text-gray-500">Comprometido (Pendiente/Parcial)</div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totalesFiltrados.totalPendiente)}</div>
                  <div className="text-xs text-gray-500">{totalesFiltrados.countPendientes} nóminas</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
                  <div className="text-xs text-gray-500">Registros filtrados</div>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{totalesFiltrados.countTotal}</div>
                  <div className="text-xs text-gray-500">Aplicando filtros</div>
                </div>
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
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
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
                    onClick={() => {
                      let suf = '';
                      if (drStart && drEnd) {
                        const s = new Date(drStart); const e = new Date(drEnd);
                        suf = `${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,'0')}-${String(s.getDate()).padStart(2,'0')}_a_${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,'0')}-${String(e.getDate()).padStart(2,'0')}`;
                      }
                      exportToExcel(null, suf);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar Excel
                  </button>
                  {/* Popover Columnas */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={()=>setShowColsPopover(v=>!v)}
                      className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm font-medium rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                      title="Columnas"
                    >
                      Columnas
                    </button>
                    {showColsPopover && (
                      <div className="absolute right-0 mt-2 w-96 z-20 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-semibold text-gray-700 dark:text-slate-200">Columnas visibles</div>
                          <div className="flex gap-2">
                            <button type="button" className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600" onClick={()=>{
                              const allTrue = Object.fromEntries(Object.keys(visibleCols).map(k=>[k,true]));
                              setVisibleCols(allTrue);
                            }}>Mostrar todo</button>
                            <button type="button" className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600" onClick={()=>{
                              const allFalse = Object.fromEntries(Object.keys(visibleCols).map(k=>[k,false]));
                              setVisibleCols(allFalse);
                            }}>Ocultar todo</button>
                            <button type="button" className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600" onClick={()=>{
                              setVisibleCols({empleado:true,oficio:true,dias:true,sueldo:true,horasExtra:true,bonos:true,isr:true,imss:true,infonavit:true,descuentos:true,semana:true,total:true,tipoPago:true,status:true,fecha:true});
                            }}>Restablecer</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {[
                            ['empleado','Empleado'],['oficio','Oficio'],['dias','Días'],['sueldo','Sueldo'],['horasExtra','Horas Extra'],['bonos','Bonos'],
                            ['isr','ISR'],['imss','IMSS'],['infonavit','Infonavit'],['descuentos','Descuentos'],['semana','Semana'],['total','Total'],['tipoPago','Tipo Pago'],['status','Status'],['fecha','Fecha']
                          ].map(([k,label])=> (
                            <label key={k} className="inline-flex items-center justify-between gap-2 text-gray-800 dark:text-slate-200">
                              <span>{label}</span>
                              <input type="checkbox" className="accent-primary-500 dark:accent-primary-500" checked={!!visibleCols[k]} onChange={()=>toggleCol(k)} />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Filtros alineados (DateRangePicker, Proyecto, Estado, Búsqueda) */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rango de fechas</label>
                    <DateRangePicker
                      startDate={drStart}
                      endDate={drEnd}
                      onStartDateChange={setDrStart}
                      onEndDateChange={setDrEnd}
                      showQuickRanges
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proyecto</label>
                    <select value={filtroProyecto} onChange={(e)=>setFiltroProyecto(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm dark:text-gray-400">
                      <option value="">Todos</option>
                      {proyectos.map(p => (
                        <option key={p.id_proyecto} value={p.id_proyecto}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                      <select value={filtroEstado} onChange={(e)=>setFiltroEstado(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm dark:text-gray-400">
                        {['Pagado','Pendiente','Aprobada','Cancelada','Todos'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
                      <input value={searchText} onChange={(e)=>setSearchText(e.target.value)} placeholder="Empleado o Proyecto" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
              
              {filteredNominas && filteredNominas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.empleado ? 'hidden' : ''}`}>
                          Empleado
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.oficio ? 'hidden' : ''}`}>
                          Oficio
                        </th>
                        <th className={`px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.dias ? 'hidden' : ''}`}>
                          Días Lab.
                        </th>
                        <th className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.sueldo ? 'hidden' : ''}`}>
                          Sueldo Base
                        </th>
                        <th className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.horasExtra ? 'hidden' : ''}`}>
                          Horas Extra
                        </th>
                        <th className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.bonos ? 'hidden' : ''}`}>
                          Bonos
                        </th>
                        <th className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.isr ? 'hidden' : ''}`}>
                          ISR
                        </th>
                        <th className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.imss ? 'hidden' : ''}`}>
                          IMSS
                        </th>
                        <th className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.infonavit ? 'hidden' : ''}`}>
                          Infonavit
                        </th>
                        <th className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.descuentos ? 'hidden' : ''}`}>
                          Descuentos
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.semana ? 'hidden' : ''}`}>
                          Semana
                        </th>
                        <th className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.total ? 'hidden' : ''}`}>
                          Total a Pagar
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.tipoPago ? 'hidden' : ''}`}>
                          Tipo Pago
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.status ? 'hidden' : ''}`}>
                          Status
                        </th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${!visibleCols.fecha ? 'hidden' : ''}`}>
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {gruposPorSemana.map(([semanaGrupo, bucket]) => (
                        <React.Fragment key={`grupo-semana-${semanaGrupo}`}>
                          {bucket.rows.map((nomina, index) => {
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
                          
                          // Calcular semana del mes con base correcta e ISO
                          const semanaDelMes = computeSemanaDelMes(nomina);
                          
                          return (
                            <tr key={nomina.id_nomina || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className={`px-6 py-4 whitespace-nowrap ${!visibleCols.empleado ? 'hidden' : ''}`}>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado no encontrado'}
                                </div>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap ${!visibleCols.oficio ? 'hidden' : ''}`}>
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {empleado?.oficio?.nombre || 'Sin oficio'}
                                </div>
                              </td>
                              <td className={`px-3 py-4 whitespace-nowrap ${!visibleCols.dias ? 'hidden' : ''}`}>
                                <div className="text-sm text-center font-medium text-gray-900 dark:text-white">
                                  {diasLaborados}
                                </div>
                              </td>
                              <td className={`px-3 py-4 whitespace-nowrap ${!visibleCols.sueldo ? 'hidden' : ''}`}>
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {formatCurrency(sueldoBase)}
                                </div>
                              </td>
                              <td className={`px-3 py-4 whitespace-nowrap ${!visibleCols.horasExtra ? 'hidden' : ''}`}>
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {horasExtra > 0 ? formatCurrency(horasExtra) : '-'}
                                </div>
                              </td>
                              <td className={`px-3 py-4 whitespace-nowrap ${!visibleCols.bonos ? 'hidden' : ''}`}>
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {bonos > 0 ? formatCurrency(bonos) : '-'}
                                </div>
                              </td>
                              <td className={`px-3 py-4 whitespace-nowrap ${!visibleCols.isr ? 'hidden' : ''}`}>
                                <div className="text-sm text-red-600 dark:text-red-400">
                                  {isr > 0 ? `-${formatCurrency(isr)}` : '-'}
                                </div>
                              </td>
                              <td className={`px-3 py-4 whitespace-nowrap ${!visibleCols.imss ? 'hidden' : ''}`}>
                                <div className="text-sm text-red-600 dark:text-red-400">
                                  {imss > 0 ? `-${formatCurrency(imss)}` : '-'}
                                </div>
                              </td>
                              <td className={`px-3 py-4 whitespace-nowrap ${!visibleCols.infonavit ? 'hidden' : ''}`}>
                                <div className="text-sm text-red-600 dark:text-red-400">
                                  {infonavit > 0 ? `-${formatCurrency(infonavit)}` : '-'}
                                </div>
                              </td>
                              <td className={`px-3 py-4 whitespace-nowrap ${!visibleCols.descuentos ? 'hidden' : ''}`}>
                                <div className="text-sm text-red-600 dark:text-red-400">
                                  {descuentos > 0 ? `-${formatCurrency(descuentos)}` : '-'}
                                </div>
                              </td>
                              <td className={`px-4 py-4 whitespace-nowrap ${!visibleCols.semana ? 'hidden' : ''}`}>
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {semanaDelMes}
                                </div>
                              </td>
                              <td className={`px-3 py-4 whitespace-nowrap ${!visibleCols.total ? 'hidden' : ''}`}>
                                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  {formatCurrency(totalAPagar)}
                                </div>
                              </td>
                              <td className={`px-4 py-4 whitespace-nowrap ${!visibleCols.tipoPago ? 'hidden' : ''}`}>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tipoPagoColor}`}>
                                  {tipoPago}
                                </span>
                              </td>
                              <td className={`px-4 py-4 whitespace-nowrap ${!visibleCols.status ? 'hidden' : ''}`}>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoColor}`}>
                                  {estado}
                                </span>
                              </td>
                              <td className={`px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${!visibleCols.fecha ? 'hidden' : ''}`}>
                                {(() => {
                                  const fc = nomina?.fecha_creacion || nomina?.createdAt;
                                  return fc ? new Date(fc).toLocaleDateString('es-MX') : '';
                                })()}
                              </td>
                            </tr>
                          );
                          })}
                        </React.Fragment>
                      ))}
                    
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
