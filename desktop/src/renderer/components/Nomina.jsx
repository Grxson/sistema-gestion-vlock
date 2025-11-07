import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import nominasServices from '../services/nominas';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useEmpleados } from '../contexts/EmpleadosContext';
import NominaWizardSimplificado from './NominaWizard';
import EditNominaModal from './nomina/EditNominaModal';
import ChartsSection from './ui/ChartsSection';
import AdeudosHistorial from './ui/AdeudosHistorial';
import EmpleadoCard from './ui/EmpleadoCard';
import CustomSelect from './ui/CustomSelect';
import DateRangePicker from './ui/DateRangePicker';
import NominaReportsTab from './nomina/NominaReportsTab';
import ConfirmModal from './ui/ConfirmModal';
import useDeleteNomina from '../hooks/useDeleteNomina';
import { generarInfoSemana, semanaDelMesDesdeISO } from '../utils/weekCalculator';
import NominaEmpleadoHistorialDrawer from './nomina/NominaEmpleadoHistorialDrawer';
import {
  PlusIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function Nomina() {
  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  const { empleados, getEmpleadosActivos, refreshEmpleados } = useEmpleados();
  
  // Hook para manejar eliminación de nóminas
  const deleteNominaModal = useDeleteNomina(
    (message) => {
      showSuccess('Éxito', message);
      fetchData(); // Recargar las nóminas
    },
    (message) => {
      showError('Error', message);
    }
  );
  
  const [nominas, setNominas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedNomina, setSelectedNomina] = useState(null);
  const [nominaToEdit, setNominaToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showNominaDetails, setShowNominaDetails] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [showAdeudosHistorial, setShowAdeudosHistorial] = useState(false);
  const [selectedEmpleadoAdeudos, setSelectedEmpleadoAdeudos] = useState(null);
  const [showAllNominas, setShowAllNominas] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Cargar la pestaña activa desde localStorage, por defecto 'empleados'
    return localStorage.getItem('nomina-active-tab') || 'empleados';
  });
  // Drawer historial de nómina por empleado
  const [showHistorialDrawer, setShowHistorialDrawer] = useState(false);
  const [empleadoHistorial, setEmpleadoHistorial] = useState(null);

  // Filtros para empleados (deben declararse antes de los efectos que los usan)
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroBusquedaInput, setFiltroBusquedaInput] = useState('');
  const [filtroEstadoSemana, setFiltroEstadoSemana] = useState('all'); // all|none|draft|completed
  // Paginación client-side
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  // Selección múltiple
  const [selectedEmpleadoIds, setSelectedEmpleadoIds] = useState(new Set());
  // Virtualización
  const [virtScrollTop, setVirtScrollTop] = useState(0);
  const [virtViewportHeight, setVirtViewportHeight] = useState(480);
  const virtRowHeight = 64; // px aproximado por fila
  const [virtBuffer, setVirtBuffer] = useState(5); // filas extra arriba/abajo
  const virtContainerRef = React.useRef(null);

  // Total mensual solo con nóminas Pagadas (mes/año actuales)
  const getFechaBaseNomina = (n) => {
    const base = n?.semana?.fecha_inicio || n?.fecha_pago || n?.fecha || n?.createdAt;
    const d = base ? new Date(base) : null;
    return d && !isNaN(d) ? d : null;
  };
  const totalMensualPagado = React.useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return (nominas || []).reduce((acc, n) => {
      const estado = (n?.estado || '').toLowerCase();
      if (estado !== 'pagado' && estado !== 'pagada') return acc;
      const d = getFechaBaseNomina(n);
      if (!d || d.getFullYear() !== y || d.getMonth() !== m) return acc;
      const monto = parseFloat(n.monto_total || n.monto || 0);
      return acc + (isNaN(monto) ? 0 : monto);
    }, 0);
  }, [nominas]);

  // Guardar la pestaña activa en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('nomina-active-tab', activeTab);
  }, [activeTab]);

  // Cargar filtros persistentes al montar
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nomina-empleados-filtros') || '{}');
      if (saved) {
        if (saved.proyecto !== undefined) setFiltroProyecto(saved.proyecto);
        if (saved.busqueda !== undefined) {
          setFiltroBusqueda(saved.busqueda);
          setFiltroBusquedaInput(saved.busqueda);
        }
        if (saved.estado !== undefined) setFiltroEstadoSemana(saved.estado);
        if (saved.pageSize) setPageSize(saved.pageSize);
      }
    } catch {}
  }, []);

  // Persistir filtros cuando cambien
  useEffect(() => {
    const data = {
      proyecto: filtroProyecto,
      busqueda: filtroBusqueda,
      estado: filtroEstadoSemana,
      pageSize
    };
    localStorage.setItem('nomina-empleados-filtros', JSON.stringify(data));
  }, [filtroProyecto, filtroBusqueda, filtroEstadoSemana, pageSize]);

  // Normaliza valores de estado a los aceptados por backend
  const normalizarEstadoValor = (estado) => {
    const e = (estado || '').toLowerCase();
    if (e === 'borrador') return 'Borrador';
    if (e === 'pendiente') return 'Pendiente';
    if (e === 'en_proceso' || e === 'en proceso') return 'En_Proceso';
    if (e === 'aprobada' || e === 'aprobado') return 'Aprobada';
    if (e === 'pagado' || e === 'pagada') return 'Pagado';
    if (e === 'cancelada' || e === 'cancelado') return 'Cancelada';
    return 'Pendiente';
  };

  // Cambio de estado desde la tabla del historial (update optimista)
  const cambiarEstadoHistorial = async (nom, nuevoEstado) => {
    const id = nom.id_nomina || nom.id;
    const prev = nom.estado;
    // Optimista en lista completa de nominas
    setNominas((arr) => arr.map(item => ((item.id_nomina||item.id) === id ? { ...item, estado: nuevoEstado } : item)));
    try {
      await apiService.cambiarEstadoNomina(id, nuevoEstado);
    } catch (err) {
      // revertir si falla
      setNominas((arr) => arr.map(item => ((item.id_nomina||item.id) === id ? { ...item, estado: prev } : item)));
      showError('Error', err.message || 'No se pudo cambiar el estado');
    }
  };

  // Debounce para búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setFiltroBusqueda(filtroBusquedaInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [filtroBusquedaInput]);

  // Medir viewport de virtualización
  useEffect(() => {
    const el = virtContainerRef.current;
    if (!el) return;
    const measure = () => setVirtViewportHeight(el.clientHeight || 480);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const abrirHistorialEmpleado = (empleado) => {
    setEmpleadoHistorial(empleado);
    setShowHistorialDrawer(true);
  };

  const cerrarHistorialEmpleado = () => {
    setShowHistorialDrawer(false);
    setEmpleadoHistorial(null);
  };

  const editarNominaDesdeHistorial = (nomina) => {
    setNominaToEdit(nomina);
    setShowEditModal(true);
  };
  
  // (Eliminado: duplicado de estados, se declararon antes de los efectos)
  
  // Filtros para historial de nóminas
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroBusquedaHistorial, setFiltroBusquedaHistorial] = useState('');
  
  // Estados para proyectos
  const [proyectos, setProyectos] = useState([]);
  
  // Estados para preview de nómina
  const [showNominaPreview, setShowNominaPreview] = useState(false);
  const [selectedEmpleadoPreview, setSelectedEmpleadoPreview] = useState(null);
  const [nominaPreviewData, setNominaPreviewData] = useState(null);

  // Funciones de filtrado mejoradas
  const getEmpleadosFiltrados = () => {
    let empleadosActivos = getEmpleadosActivos();
    
    // Filtrar por proyecto (usando ID del proyecto seleccionado)
    if (filtroProyecto) {
      empleadosActivos = empleadosActivos.filter(emp => 
        emp.id_proyecto?.toString() === filtroProyecto ||
        emp.proyecto?.id_proyecto?.toString() === filtroProyecto
      );
    }
    
    // Filtrar por búsqueda (nombre, apellido, NSS, RFC)
    if (filtroBusqueda) {
      const busqueda = filtroBusqueda.toLowerCase();
      empleadosActivos = empleadosActivos.filter(emp => 
        emp.nombre?.toLowerCase().includes(busqueda) ||
        emp.apellido?.toLowerCase().includes(busqueda) ||
        emp.nss?.toLowerCase().includes(busqueda) ||
        emp.rfc?.toLowerCase().includes(busqueda)
      );
    }

    // Filtrar por estado semana actual (pending|completed)
    if (filtroEstadoSemana && filtroEstadoSemana !== 'all') {
      empleadosActivos = empleadosActivos.filter(emp => {
        const st = getNominaStatus(emp).status; // pending|completed
        // Normalizar filtros antiguos a nuevo esquema
        const target = (filtroEstadoSemana === 'draft' || filtroEstadoSemana === 'none')
          ? 'pending'
          : filtroEstadoSemana;
        return st === target;
      });
    }
    
    return empleadosActivos;
  };

  // Helper: obtener última nómina de un empleado
  const getLatestNominaForEmpleado = (empleado) => {
    const nominasEmpleado = nominas.filter(nomina => 
      nomina.empleado?.id_empleado === empleado.id_empleado ||
      nomina.id_empleado === empleado.id_empleado
    );
    if (nominasEmpleado.length === 0) return null;
    return nominasEmpleado.sort((a, b) => 
      new Date(b.fecha_creacion || b.createdAt) - new Date(a.fecha_creacion || a.createdAt)
    )[0];
  };

  const toggleSelectEmpleado = (id) => {
    setSelectedEmpleadoIds(prev => {
      const ns = new Set(prev);
      if (ns.has(id)) ns.delete(id); else ns.add(id);
      return ns;
    });
  };

  const toggleSelectAllPaged = () => {
    const paged = getPagedEmpleados().items;
    const allSelected = paged.every(e => selectedEmpleadoIds.has(e.id_empleado));
    if (allSelected) {
      // deseleccionar todos los de la página
      setSelectedEmpleadoIds(prev => {
        const ns = new Set(prev);
        paged.forEach(e => ns.delete(e.id_empleado));
        return ns;
      });
    } else {
      // seleccionar todos los de la página
      setSelectedEmpleadoIds(prev => {
        const ns = new Set(prev);
        paged.forEach(e => ns.add(e.id_empleado));
        return ns;
      });
    }
  };

  const bulkGeneratePDFs = async () => {
    const empleadosSel = getPagedEmpleados().items.filter(e => selectedEmpleadoIds.has(e.id_empleado));
    if (empleadosSel.length === 0) return;
    // Si solo hay 1 empleado, descargar PDF directo sin comprimir
    if (empleadosSel.length === 1) {
      const emp = empleadosSel[0];
      try {
        showInfo('Generando PDF', `Creando recibo para ${emp.nombre || 'empleado'}...`);
        const latest = getLatestNominaForEmpleado(emp);
        if (!latest) return;
        const pdfBlob = await nominasServices.nominas.generarReciboPDF(latest.id_nomina || latest.id);
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        const nombreEmpleado = `${emp.nombre || ''}_${emp.apellido || ''}`.trim().replace(/\s+/g, '_') || 'empleado';
        const periodo = latest.periodo || (() => { const b = latest?.semana?.fecha_inicio || latest?.fecha || latest?.createdAt; if (!b) return 'YYYY-MM'; const d = new Date(b); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })();
        const semanaMes = (() => {
          const semana = latest?.semana; if (!semana?.anio || !semana?.semana_iso) return 'X';
          const baseDateStr = latest?.semana?.fecha_inicio || latest?.fecha || latest?.createdAt;
          let per = latest?.periodo; if (!per && baseDateStr) { const d = new Date(baseDateStr); per = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
          if (!per) return 'X';
          const idx = semanaDelMesDesdeISO(per, semana.anio, semana.semana_iso);
          return Number.isNaN(idx) ? 'X' : idx;
        })();
        const now = new Date();
        const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
        a.download = `nomina_semana-${semanaMes}_${nombreEmpleado}_${ts}.pdf`;
        document.body.appendChild(a); a.click();
        window.URL.revokeObjectURL(url); document.body.removeChild(a);
        showSuccess('Listo', 'PDF generado');
      } catch (e) {
        console.error('Error generando PDF:', e);
      }
      return;
    }

    // Si hay más de 1 empleado, comprimir en ZIP
    showInfo('Generando ZIP', `Preparando recibos para ${empleadosSel.length} empleados...`);
    let JSZip;
    try {
      JSZip = (await import('jszip')).default;
    } catch (e) {
      console.warn('JSZip no disponible, usando descarga individual', e);
      // Fallback a descargas sueltas
      for (const emp of empleadosSel) {
        try {
          const latest = getLatestNominaForEmpleado(emp);
          if (!latest) continue;
          const pdfBlob = await nominasServices.nominas.generarReciboPDF(latest.id_nomina || latest.id);
          const url = window.URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          const nombreEmpleado = `${emp.nombre || ''}_${emp.apellido || ''}`.trim().replace(/\s+/g, '_') || 'empleado';
          const periodo = latest.periodo || (() => { const b = latest?.semana?.fecha_inicio || latest?.fecha || latest?.createdAt; if (!b) return 'YYYY-MM'; const d = new Date(b); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })();
          const semanaMes = (() => {
            const semana = latest?.semana; if (!semana?.anio || !semana?.semana_iso) return 'X';
            const baseDateStr = latest?.semana?.fecha_inicio || latest?.fecha || latest?.createdAt;
            let per = latest?.periodo; if (!per && baseDateStr) { const d = new Date(baseDateStr); per = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
            if (!per) return 'X';
            const idx = semanaDelMesDesdeISO(per, semana.anio, semana.semana_iso);
            return Number.isNaN(idx) ? 'X' : idx;
          })();
          const now = new Date();
          const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
          a.download = `nomina_semana-${semanaMes}_${nombreEmpleado}_${ts}.pdf`;
          document.body.appendChild(a); a.click();
          window.URL.revokeObjectURL(url); document.body.removeChild(a);
        } catch (e2) { console.error('Error generando PDF masivo:', e2); }
      }
      showSuccess('Listo', 'PDFs generados');
      return;
    }

    // Con JSZip, generar un ZIP
    const zip = new JSZip();
    const folder = zip.folder('recibos') || zip;
    let added = 0;
    for (const emp of empleadosSel) {
      try {
        const latest = getLatestNominaForEmpleado(emp);
        if (!latest) continue;
        const pdfBlob = await nominasServices.nominas.generarReciboPDF(latest.id_nomina || latest.id);
        const nombreEmpleado = `${emp.nombre || ''}_${emp.apellido || ''}`.trim().replace(/\s+/g, '_') || 'empleado';
        const periodo = latest.periodo || (() => { const b = latest?.semana?.fecha_inicio || latest?.fecha || latest?.createdAt; if (!b) return 'YYYY-MM'; const d = new Date(b); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })();
        const semanaMes = (() => {
          const semana = latest?.semana; if (!semana?.anio || !semana?.semana_iso) return 'X';
          const baseDateStr = latest?.semana?.fecha_inicio || latest?.fecha || latest?.createdAt;
          let per = latest?.periodo; if (!per && baseDateStr) { const d = new Date(baseDateStr); per = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
          if (!per) return 'X';
          const idx = semanaDelMesDesdeISO(per, semana.anio, semana.semana_iso);
          return Number.isNaN(idx) ? 'X' : idx;
        })();
        const now = new Date();
        const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
        const fileName = `nomina_semana-${semanaMes}_${nombreEmpleado}_${ts}.pdf`;
        folder.file(fileName, pdfBlob);
        added++;
      } catch (e) { console.error('Error agregando PDF al ZIP:', e); }
    }

    if (added === 0) { showInfo('Sin archivos', 'No se generaron PDFs para comprimir'); return; }
    const blobZip = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blobZip);
    a.href = url;
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    a.download = `recibos_nomina_${stamp}.zip`;
    document.body.appendChild(a); a.click();
    window.URL.revokeObjectURL(url); document.body.removeChild(a);
    showSuccess('ZIP generado', `Se descargó un ZIP con ${added} recibos`);
  };

  const bulkMarkAsPaid = async () => {
    const empleadosSel = getPagedEmpleados().items.filter(e => selectedEmpleadoIds.has(e.id_empleado));
    if (empleadosSel.length === 0) return;
    showInfo('Actualizando estado', `Marcando pagadas ${empleadosSel.length} nóminas...`);
    let ok = 0;
    for (const emp of empleadosSel) {
      try {
        const latest = getLatestNominaForEmpleado(emp);
        if (!latest) continue;
        const estado = (latest.estado || '').toLowerCase();
        if (estado === 'borrador' || estado === 'pendiente') {
          await nominasServices.nominas.marcarComoPagada(latest.id_nomina || latest.id);
          ok++;
        }
      } catch (e) { console.error('Error marcando pagada:', e); }
    }
    await fetchData();
    showSuccess('Actualizado', `${ok} nóminas marcadas como pagadas`);
  };

  // Empleados paginados
  const getPagedEmpleados = () => {
    const list = getEmpleadosFiltrados();
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return {
      items: list.slice(start, end),
      total: list.length,
      totalPages,
      currentPage
    };
  };

  const getNominasFiltradas = () => {
    let nominasFiltradas = nominas;
    
    // Filtrar por rango de fechas
    if (filtroFechaInicio) {
      nominasFiltradas = nominasFiltradas.filter(nomina => {
        const fechaNomina = new Date(nomina.fecha_creacion || nomina.fecha || nomina.createdAt);
        const fechaInicio = new Date(filtroFechaInicio);
        return fechaNomina >= fechaInicio;
      });
    }
    
    if (filtroFechaFin) {
      nominasFiltradas = nominasFiltradas.filter(nomina => {
        const fechaNomina = new Date(nomina.fecha_creacion || nomina.fecha || nomina.createdAt);
        const fechaFin = new Date(filtroFechaFin);
        // Agregar un día para incluir el día completo
        fechaFin.setDate(fechaFin.getDate() + 1);
        return fechaNomina < fechaFin;
      });
    }
    
    // Filtrar por búsqueda de texto
    if (filtroBusquedaHistorial) {
      const busqueda = filtroBusquedaHistorial.toLowerCase();
      nominasFiltradas = nominasFiltradas.filter(nomina => {
        const nombreEmpleado = typeof nomina.empleado === 'object' && nomina.empleado
          ? `${nomina.empleado.nombre || ''} ${nomina.empleado.apellido || ''}`.trim().toLowerCase()
          : (nomina.nombre_empleado || nomina.empleado || '').toLowerCase();
        
        const nss = nomina.empleado?.nss?.toLowerCase() || '';
        const rfc = nomina.empleado?.rfc?.toLowerCase() || '';
        const idNomina = (nomina.id_nomina || nomina.id || '').toString();
        
        return nombreEmpleado.includes(busqueda) ||
               nss.includes(busqueda) ||
               rfc.includes(busqueda) ||
               idNomina.includes(busqueda);
      });
    }
    
    return nominasFiltradas;
  };


  // Función para calcular el subtotal de la semana actual
  const getSubtotalSemanaActual = () => {
    const nominasFiltradas = getNominasFiltradas();    
    const subtotal = nominasFiltradas.reduce((total, nomina) => {
      // Intentar diferentes campos de monto y convertir a número
      const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
      return total + (isNaN(monto) ? 0 : monto);
    }, 0);
    
    return {
      total: subtotal,
      cantidad: nominasFiltradas.length,
      pagadas: nominasFiltradas.filter(n => 
        n.estado === 'pagada' || n.estado === 'Pagado' || n.estado === 'pagado'
      ).length,
      pendientes: nominasFiltradas.filter(n => 
        n.estado === 'pendiente' || n.estado === 'Pendiente' || n.estado === 'borrador' || n.estado === 'Borrador'
      ).length
    };
  };

  // Función para estado de nómina en la SEMANA ACTUAL
  const getNominaStatus = (empleado) => {
    // Obtener información de la semana actual del sistema
    const hoy = new Date();
    const infoSemanaActual = generarInfoSemana(hoy);
    
    // Filtrar nóminas del empleado que pertenezcan a la semana actual
    const nominasEmpleado = nominas.filter(nomina => {
      const perteneceAlEmpleado = nomina.empleado?.id_empleado === empleado.id_empleado ||
                                   nomina.id_empleado === empleado.id_empleado;
      
      if (!perteneceAlEmpleado) return false;
      
      // Verificar si la nómina pertenece a la semana actual
      // Comparar por año y semana ISO
      const semanaNomina = nomina.semana;
      if (semanaNomina) {
        return semanaNomina.anio === infoSemanaActual.año && 
               semanaNomina.semana_iso === infoSemanaActual.semanaISO;
      }
      
      return false;
    });
    
    if (nominasEmpleado.length === 0) {
      // Semana nueva sin nómina aún => Pendiente
      return { status: 'pending', count: 0, latest: null, hasCurrentWeek: false, latestStatus: null };
    }
    
    const latest = nominasEmpleado.sort((a, b) => 
      new Date(b.fecha_creacion || b.createdAt) - new Date(a.fecha_creacion || a.createdAt)
    )[0];
    
    // Determinar el estado de la nómina
    const estado = (latest.estado || '').toLowerCase();
    let status;
    if (estado === 'pagada' || estado === 'pagado' || estado === 'completada' || estado === 'completado' || estado === 'aprobada' || estado === 'aprobado') {
      status = 'completed';
    } else {
      // Borrador o pendiente (u otro intermedio) => Pending
      status = 'pending';
    }
  
    return {
      status,
      count: nominasEmpleado.length,
      latest,
      hasCurrentWeek: true,
      latestStatus: estado
    };
  };

  // Función para ver preview de nómina
  const verPreviewNomina = async (empleado) => {
    try {
      setSelectedEmpleadoPreview(empleado);
      
      // Buscar la nómina más reciente del empleado
      const nominasEmpleado = nominas.filter(nomina => 
        nomina.empleado?.id_empleado === empleado.id_empleado ||
        nomina.id_empleado === empleado.id_empleado
      );
      
      if (nominasEmpleado.length === 0) {
        showInfo('Sin nóminas', 'Este empleado no tiene nóminas generadas');
        return;
      }
      
      const latestNomina = nominasEmpleado.sort((a, b) => 
        new Date(b.fecha_creacion || b.createdAt) - new Date(a.fecha_creacion || a.createdAt)
      )[0];
      
      // Obtener datos frescos de la nómina desde el backend
      try {
        const response = await nominasServices.nominas.getById(latestNomina.id_nomina);
        if (response.success && response.data) {
          setNominaPreviewData(response.data);
        } else {
          console.warn('Respuesta inválida del servicio, usando datos locales');
          setNominaPreviewData(latestNomina);
        }
      } catch (apiError) {
        console.warn('No se pudieron obtener datos frescos, usando datos locales:', apiError);
        setNominaPreviewData(latestNomina);
      }
      
      setShowNominaPreview(true);
      
    } catch (error) {
      console.error('Error al obtener preview de nómina:', error);
      showError('Error', 'No se pudo obtener la información de la nómina');
    }
  };

  // Función para generar PDF desde preview
  const generarPDFDesdePreview = async () => {
    if (!nominaPreviewData?.id_nomina) {
      showError('Error', 'No hay nómina para generar PDF');
      return;
    }

    try {
      showInfo('Generando PDF', 'Creando recibo de nómina...');
      
      const pdfBlob = await nominasServices.nominas.generarReciboPDF(nominaPreviewData.id_nomina);
      
      if (!pdfBlob || !(pdfBlob instanceof Blob)) {
        throw new Error('No se recibió un PDF válido');
      }
      
      // Crear nombre de archivo con formato solicitado
      const nombreEmpleado = `${selectedEmpleadoPreview.nombre || ''}_${selectedEmpleadoPreview.apellido || ''}`.trim().replace(/\s+/g, '_') || 'empleado';
      const semanaMes = (() => {
        const n = nominaPreviewData;
        const semana = n?.semana;
        if (!semana?.anio || !semana?.semana_iso) return 'X';
        const baseDateStr = semana?.fecha_inicio || n?.fecha || n?.createdAt;
        let per = n?.periodo; if (!per && baseDateStr) { const d = new Date(baseDateStr); per = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
        if (!per) return 'X';
        const idx = semanaDelMesDesdeISO(per, semana.anio, semana.semana_iso);
        return Number.isNaN(idx) ? 'X' : idx;
      })();
      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
      const nombreArchivo = `nomina_semana-${semanaMes}_${nombreEmpleado}_${ts}.pdf`;
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar recursos
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 2000);

      showSuccess('PDF Generado', `Recibo de nómina descargado: ${nombreArchivo}`);
      
      // Actualizar estado de la nómina a "Pagado" si estaba en "borrador" o "Pendiente"
      if (nominaPreviewData.estado === 'borrador' || nominaPreviewData.estado === 'Borrador' || nominaPreviewData.estado === 'Pendiente') {
        try {
          
          await nominasServices.nominas.marcarComoPagada(nominaPreviewData.id_nomina);
          showSuccess('Estado actualizado', 'La nómina ha sido marcada como pagada');
          
          // Refrescar datos
          await fetchData();
        } catch (error) {
          console.error('❌ [PDF] Error actualizando estado:', error);
          showError('Error', 'No se pudo actualizar el estado de la nómina');
        }
      }
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      showError('Error al generar PDF', error.message || 'No se pudo generar el PDF');
    }
  };



  const editarNominaDirecta = async (empleado) => {    
    try {
      // Buscar la nómina más reciente del empleado
      const nominasEmpleado = nominas.filter(nomina => 
        nomina.empleado?.id_empleado === empleado.id_empleado ||
        nomina.id_empleado === empleado.id_empleado
      );
      
      if (nominasEmpleado.length === 0) {
        showError('Error', 'Este empleado no tiene nóminas generadas');
        return;
      }
      
      const latestNomina = nominasEmpleado.sort((a, b) => 
        new Date(b.fecha_creacion || b.createdAt) - new Date(a.fecha_creacion || a.createdAt)
      )[0];      
      // Obtener datos frescos de la nómina
      const response = await nominasServices.nominas.getById(latestNomina.id_nomina);
      
      if (response.success && response.data) {
        const nominaData = response.data;
        
        // Almacenar datos de la nómina para editar
        setNominaToEdit(nominaData);
        setSelectedEmpleadoPreview(empleado);
        
        // Abrir modal de edición
        setShowEditModal(true);
        
        showInfo('Editando Nómina', 'Abriendo editor de nómina...');
      } else {
        console.error('❌ [EDITAR_DIRECTA] Respuesta inválida del servicio:', response);
        showError('Error', 'No se pudieron obtener los datos de la nómina');
      }
    } catch (error) {
      console.error('❌ [EDITAR_DIRECTA] Error obteniendo datos de nómina:', error);
      showError('Error', 'No se pudieron cargar los datos para editar');
    }
  };

  // Función para eliminar nómina (simplificada usando el hook)
  const eliminarNomina = (empleado) => {
    
    // Buscar la nómina más reciente del empleado
    const nominasEmpleado = nominas.filter(nomina => 
      nomina.empleado?.id_empleado === empleado.id_empleado ||
      nomina.id_empleado === empleado.id_empleado
    );
    
    if (nominasEmpleado.length === 0) {
      showError('Error', 'Este empleado no tiene nóminas generadas');
      return;
    }
    
    const latestNomina = nominasEmpleado.sort((a, b) => 
      new Date(b.fecha_creacion || b.createdAt) - new Date(a.fecha_creacion || a.createdAt)
    )[0];
        
    // Usar el hook para manejar la eliminación
    deleteNominaModal.deleteNomina(empleado, latestNomina);
  };

  // Estado para el modal de liquidar adeudo
  const [showLiquidarModal, setShowLiquidarModal] = useState(false);
  const [nominaSeleccionada, setNominaSeleccionada] = useState(null);
  const [montoLiquidacion, setMontoLiquidacion] = useState('');
  const [observacionesLiquidacion, setObservacionesLiquidacion] = useState('');

  // Función para abrir modal de liquidar adeudo
  const abrirModalLiquidar = (nomina) => {
    setNominaSeleccionada(nomina);
    setMontoLiquidacion('');
    setObservacionesLiquidacion('');
    setShowLiquidarModal(true);
  };

  // Función para liquidar adeudo
  const liquidarAdeudo = async () => {
    try {
      if (!nominaSeleccionada || !montoLiquidacion) {
        alert('Por favor ingresa el monto a liquidar');
        return;
      }

      const monto = parseFloat(montoLiquidacion);
      if (isNaN(monto) || monto <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
      }

      const response = await ApiService.liquidarAdeudo(
        nominaSeleccionada.id_nomina,
        monto,
        observacionesLiquidacion
      );

      if (response.success) {
        showSuccess('Adeudo liquidado', response.message);
        setShowLiquidarModal(false);
        // Refrescar datos
        await refreshEmpleados();
      } else {
        showError('Error', response.message || 'No se pudo liquidar el adeudo');
      }
    } catch (error) {
      console.error('Error liquidando adeudo:', error);
      showError('Error', 'No se pudo liquidar el adeudo');
    }
  };

  // Funciones de utilidad
  const handleNominaSuccess = async () => {
    try {
      // Refrescar empleados desde el contexto global
      await refreshEmpleados();
      
      // Recargar otros datos
      await fetchData();
      
      // Limpiar datos de edición
      setNominaToEdit(null);
      setSelectedEmpleadoPreview(null);
      setShowEditModal(false);
      
      // Mostrar mensaje de éxito
      showSuccess('Éxito', 'Nómina procesada correctamente');
      } catch (error) {
      console.error('❌ [Nomina] Error refrescando datos:', error);
      showError('Error', 'Nómina procesada pero hubo un problema al refrescar los datos');
    }
  };

  // Función para refrescar datos cuando se liquida un adeudo
  const handleAdeudoLiquidado = async () => {
    // Refrescar estadísticas y datos
    await fetchData();
  };


  useEffect(() => {
    fetchData();
    cargarDatosFiltros();
  }, []);

  // Función para cargar datos necesarios para los filtros
  const cargarDatosFiltros = async () => {
    try {
      // Cargar proyectos
      const proyectosResponse = await apiService.getProyectosActivos();
      setProyectos(proyectosResponse.data || []);
    } catch (error) {
      console.error('Error cargando datos de filtros:', error);
    }
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltroProyecto('');
    setFiltroBusqueda('');
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Inicializar servicios de nóminas
      await nominasServices.inicializar();
      // Refrescar empleados desde el contexto global
      await refreshEmpleados();
      // Esperar un poco para que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch nominas usando el servicio
      try {
        const nominasResponse = await nominasServices.nominas.getAll();
        const nominasData = nominasResponse.data || [];
        setNominas(nominasData);
      } catch (error) {
        setNominas([]);
      }

      // Cargar estadísticas
      try {
        const estadisticasData = await nominasServices.empleados.getEstadisticasEmpleados();
        setEstadisticas(estadisticasData);
      } catch (error) {
        setEstadisticas(null);
      }
    } catch (error) {
      showError('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const refreshEventTimer = React.useRef(null);
  useEffect(() => {
    const onNominaChanged = () => {
      if (refreshEventTimer.current) clearTimeout(refreshEventTimer.current);
      refreshEventTimer.current = setTimeout(() => {
        fetchData();
      }, 300);
    };
    window.addEventListener('nomina:changed', onNominaChanged);
    return () => {
      window.removeEventListener('nomina:changed', onNominaChanged);
      if (refreshEventTimer.current) clearTimeout(refreshEventTimer.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-50">
      {/* Header con Pestañas */}
      <div className="bg-white dark:bg-dark-50 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Nóminas
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getEmpleadosActivos().length} empleados activos • Sistema de pago semanal
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Resumen filtros visibles */}
              <div className="hidden md:flex items-center gap-2 mr-2">
                {filtroProyecto && (
                  <span className="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-100 dark:border-primary-800">Proyecto filtrado</span>
                )}
                {filtroEstadoSemana !== 'all' && (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">Estado: {filtroEstadoSemana}</span>
                )}
                {filtroBusqueda && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Búsqueda activa</span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedEmpleadoAdeudos(null);
                  setShowAdeudosHistorial(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                Ver Adeudos
              </button>
              <button
                onClick={() => setShowWizard(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nueva Nómina
              </button>
            </div>
          </div>
          
          {/* Pestañas */}
          <div className="mt-4">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('empleados')}
                className={`${
                  activeTab === 'empleados'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Empleados
              </button>
              <button
                onClick={() => setActiveTab('historial')}
                className={`${
                  activeTab === 'historial'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Historial
              </button>
              <button
                onClick={() => setActiveTab('reportes')}
                className={`${
                  activeTab === 'reportes'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2`}
              >
                <ChartBarIcon className="h-4 w-4" />
                <span>Reportes</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Contenido según pestaña activa */}
        {activeTab === 'reportes' ? (
          <NominaReportsTab 
            nominas={nominas}
            estadisticas={estadisticas}
            loading={loading}
          />
        ) : (
          <>
            {/* Métricas Simples */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <UserGroupIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Empleados</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {getEmpleadosActivos().length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nóminas</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {nominas.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <CurrencyDollarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Mensual</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white" title="Suma de nóminas Pagadas del mes actual">
                      {formatCurrency(totalMensualPagado)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Gráficas */}
            {showCharts && (
              <ChartsSection 
                empleados={empleados}
                nominas={nominas}
                estadisticas={estadisticas}
                loading={loading}
                filtroProyecto={filtroProyecto}
                filtroFechaInicio={filtroFechaInicio}
                filtroFechaFin={filtroFechaFin}
              />
            )}
          </>
        )}

        {/* Sección de Empleados con Tabla y Filtros - Solo en pestaña empleados */}
        {activeTab === 'empleados' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Empleados Activos ({getEmpleadosFiltrados().length})
                </h2>
              </div>
              
              {/* Filtros Mejorados */}
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Buscar Empleado
                    </label>
                    <input
                      type="text"
                      value={filtroBusquedaInput}
                      onChange={(e) => { setFiltroBusquedaInput(e.target.value); setPage(1); }}
                      placeholder="Nombre, apellido, NSS o RFC..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Filtrar por Proyecto
                    </label>
                    <CustomSelect
                      value={filtroProyecto}
                      onChange={(v) => { setFiltroProyecto(v); setPage(1); }}
                      placeholder="Seleccionar proyecto..."
                      options={[
                        { value: '', label: 'Todos los proyectos' },
                        ...proyectos.map(proyecto => ({
                          value: proyecto.id_proyecto.toString(),
                          label: proyecto.nombre,
                          description: proyecto.ubicacion || 'Sin ubicación'
                        }))
                      ]}
                      searchable={true}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado (semana actual)
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                      value={filtroEstadoSemana}
                      onChange={(e) => { setFiltroEstadoSemana(e.target.value); setPage(1); }}
                    >
                      <option value="all">Todos</option>
                      <option value="none">Sin nómina</option>
                      <option value="draft">Borrador</option>
                      <option value="completed">Pagada</option>
                    </select>
                  </div>
                </div>
                
                {/* Botón para limpiar filtros */}
                {(filtroBusqueda || filtroProyecto || (filtroEstadoSemana && filtroEstadoSemana !== 'all')) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => { limpiarFiltros(); setFiltroEstadoSemana('all'); setFiltroBusquedaInput(''); setPage(1); }}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              {/* Barra de acciones masivas */}
              {selectedEmpleadoIds.size > 0 && (
                <div className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Seleccionados: {selectedEmpleadoIds.size}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={bulkGeneratePDFs} className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md">Generar PDFs</button>
                    <button onClick={bulkMarkAsPaid} className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md">Marcar como pagadas</button>
                  </div>
                </div>
              )}
              {Array.isArray(empleados) && getEmpleadosFiltrados().length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3">
                          <input type="checkbox" onChange={toggleSelectAllPaged} checked={getPagedEmpleados().items.length > 0 && getPagedEmpleados().items.every(e => selectedEmpleadoIds.has(e.id_empleado))} />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Empleado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Oficio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Pago Semanal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Proyecto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estado Nómina
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {getPagedEmpleados().items.map((empleado, index) => (
                        <tr key={empleado.id_empleado || `empleado-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={selectedEmpleadoIds.has(empleado.id_empleado)} onChange={() => toggleSelectEmpleado(empleado.id_empleado)} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                  <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                                    {empleado.nombre?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {empleado.nombre} {empleado.apellido}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {empleado.nss || 'Sin NSS'} • {empleado.rfc || 'Sin RFC'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {empleado.oficio?.nombre || 'Sin oficio'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {empleado.pago_semanal ? formatCurrency(empleado.pago_semanal) : 
                               empleado.contrato?.salario_diario ? formatCurrency(empleado.contrato.salario_diario * 7) : 
                               formatCurrency(0)}
                            </div>
                            <div className={`text-xs ${
                              (empleado.pago_semanal || empleado.contrato?.salario_diario) 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {(empleado.pago_semanal || empleado.contrato?.salario_diario) 
                                ? 'Configurado' 
                                : 'Sin configurar'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {empleado.proyecto?.nombre || 'Sin proyecto'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                            const nominaStatus = getNominaStatus(empleado);
                            if (nominaStatus.status === 'pending') {
                              return (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                  Pendiente{nominaStatus.count ? ` (${nominaStatus.count})` : ''}
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Completada ({nominaStatus.count})
                              </span>
                            );
                          })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => verPreviewNomina(empleado)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Ver nómina"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => abrirHistorialEmpleado(empleado)}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                title="Historial de nómina"
                              >
                                <ClockIcon className="h-4 w-4" />
                              </button>
                              {(() => {
                                const st = getNominaStatus(empleado);
                                // Mostrar editar si existe nómina de semana actual en borrador o pendiente
                                const shouldShow = st.hasCurrentWeek && (st.latestStatus === 'borrador' || st.latestStatus === 'pendiente');
                                return shouldShow;
                              })() && (
                                <button 
                                  onClick={() => {
                                    editarNominaDirecta(empleado);
                                  }}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Editar nómina"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              )}
                              {(() => {
                                const st = getNominaStatus(empleado);
                                // Mostrar eliminar si existe nómina de semana actual en borrador o pendiente
                                const shouldShow = st.hasCurrentWeek && (st.latestStatus === 'borrador' || st.latestStatus === 'pendiente');
                                return shouldShow;
                              })() && (
                                <button 
                                  onClick={() => {
                                    eliminarNomina(empleado);
                                  }}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Eliminar nómina"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {getEmpleadosActivos().length === 0 ? 'No hay empleados activos' : 'No se encontraron empleados'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    {getEmpleadosActivos().length === 0 
                      ? 'Necesitas tener empleados activos para poder procesar la nómina. Agrega o activa empleados en el módulo de empleados.'
                      : 'Intenta ajustar los filtros de búsqueda para encontrar empleados.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Historial de Nóminas con Filtros - Solo en pestaña historial */}
        {activeTab === 'historial' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Historial de Nóminas ({getNominasFiltradas().length})
              </h2>
            </div>
            
            {/* Filtros del Historial */}
            <div className="mt-4 space-y-4">
              {/* Primera fila: Búsqueda Rápida */}
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Búsqueda Rápida
                </label>
                <input
                  type="text"
                  placeholder="Buscar por nombre, NSS, RFC o ID..."
                  value={filtroBusquedaHistorial}
                  onChange={(e) => setFiltroBusquedaHistorial(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Segunda fila: Rango de Fechas */}
              <div className="max-w-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rango de Fechas
                </label>
                <DateRangePicker
                  startDate={filtroFechaInicio}
                  endDate={filtroFechaFin}
                  onStartDateChange={setFiltroFechaInicio}
                  onEndDateChange={setFiltroFechaFin}
                />

              </div>
            </div>
          </div>
          <div className={`p-6 ${showAllNominas ? 'max-h-[600px] overflow-y-auto' : ''}`}>
            {getNominasFiltradas().length > 0 ? (
              <div className="w-full overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/70 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Empleado</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Período</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Semana</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Estado</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Proyecto</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Días</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Hrs Extra</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Bonos</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Deducciones</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Total</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {(showAllNominas ? getNominasFiltradas() : getNominasFiltradas().slice(0, 20)).map((n) => {
                      const nombreEmpleado = n.empleado?.nombre ? `${n.empleado.nombre} ${n.empleado.apellido || ''}`.trim() : (n.nombre_empleado || '—');
                      const periodoLabel = (() => {
                        const b = n?.semana?.fecha_inicio || n?.fecha_pago || n?.fecha || n?.createdAt;
                        if (!b) return '—';
                        const d = new Date(b);
                        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
                      })();
                      // Calcular Semana (1-5) del mes - PRIORIDAD: usar valor guardado directamente
                      const semanaMes = (() => {
                        try {
                          // PRIORIDAD 1: Usar valor directo si existe (nuevo campo guardado)
                          if (n?.semana && typeof n.semana === 'number') {
                            return n.semana;
                          }
                          
                          // PRIORIDAD 2: Si viene del join con semanas_nomina
                          if (n?.semana?.semana_mes && typeof n.semana.semana_mes === 'number') {
                            return n.semana.semana_mes;
                          }
                          
                          // PRIORIDAD 3: Recalcular desde semana ISO (fallback para nóminas antiguas)
                          const periodo = periodoLabel;
                          if (!periodo || !n?.semana?.anio || !n?.semana?.semana_iso) return '—';
                          const [yStr, mStr] = periodo.split('-');
                          const year = parseInt(yStr, 10);
                          const month = parseInt(mStr, 10) - 1;
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
                          const idx = list.findIndex(w => w.anio === n.semana.anio && w.semana_iso === n.semana.semana_iso);
                          return idx >= 0 ? (idx + 1) : '—';
                        } catch { return '—'; }
                      })();
                      const dias = n.dias_laborados ?? (n.es_pago_semanal ? 6 : null);
                      const horasExtra = n.horas_extra || 0;
                      const bonos = n.bonos || 0;
                      const deducciones = (n.deducciones !== undefined && n.deducciones !== null)
                        ? n.deducciones
                        : ((n.deducciones_isr || 0) + (n.deducciones_imss || 0) + (n.deducciones_infonavit || 0) + (n.descuentos || 0) + (n.deducciones_adicionales || 0));
                      const ddTooltip = `ISR: ${formatCurrency(n.deducciones_isr||0)}\nIMSS: ${formatCurrency(n.deducciones_imss||0)}\nInfonavit: ${formatCurrency(n.deducciones_infonavit||0)}\nDescuentos: ${formatCurrency(n.descuentos||0)}\nAdicionales: ${formatCurrency(n.deducciones_adicionales||0)}`;
                      return (
                        <tr key={n.id_nomina || n.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                          <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{nombreEmpleado}</td>
                          <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{periodoLabel}</td>
                          <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{semanaMes}</td>
                          <td className="px-3 py-2">
                            <select
                              className="text-xs px-2 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                              value={normalizarEstadoValor(n.estado)}
                              onChange={(e) => cambiarEstadoHistorial(n, e.target.value)}
                            >
                              {['Borrador','Pendiente','En_Proceso','Aprobada','Pagado','Cancelada'].map(opt => (
                                <option key={opt} value={opt}>{opt === 'En_Proceso' ? 'En Proceso' : opt}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{n.proyecto?.nombre || 'Administrativo'}</td>
                          <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100">{dias ?? '—'}</td>
                          <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100">{horasExtra}</td>
                          <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100">{formatCurrency(bonos)}</td>
                          <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100" title={ddTooltip}>{formatCurrency(deducciones)}</td>
                          <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100">{formatCurrency(n.monto_total || n.monto || 0)}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    const blob = await nominasServices.nominas.generarReciboPDF(n.id_nomina || n.id);
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `recibo-nomina-${n.id_nomina || n.id}.pdf`;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                  } catch (error) {
                                    console.error('Error downloading PDF:', error);
                                    showError('Error', 'No se pudo descargar el recibo');
                                  }
                                }}
                                className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                                title="PDF"
                              >
                                <DocumentTextIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">No hay registros en el historial de nóminas</div>
            )}
          </div>
        </div>
  
        )}

        {/* Nomina Wizard Simplificado */}
        <NominaWizardSimplificado 
          isOpen={showWizard}
          onClose={() => {
            setShowWizard(false);
            setNominaToEdit(null); // Limpiar datos de edición al cerrar
            setSelectedEmpleadoPreview(null); // Limpiar empleado seleccionado
          }}
          onSuccess={handleNominaSuccess}
          empleados={empleados}
          selectedEmpleado={selectedEmpleadoPreview}
          nominaToEdit={nominaToEdit}
        />

        {/* Modal de Edición de Nómina */}
        <EditNominaModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setNominaToEdit(null);
          }}
          nominaData={nominaToEdit}
          empleado={selectedEmpleadoPreview}
          onSuccess={handleNominaSuccess}
        />

        {/* Modal de Confirmación */}
        <ConfirmModal
          isOpen={deleteNominaModal.isOpen}
          onClose={deleteNominaModal.handleCancel}
          onConfirm={deleteNominaModal.handleConfirm}
          title={deleteNominaModal.modalData?.title || ''}
          message={deleteNominaModal.modalData?.message || ''}
          confirmText={deleteNominaModal.modalData?.confirmText || 'Confirmar'}
          cancelText={deleteNominaModal.modalData?.cancelText || 'Cancelar'}
          type={deleteNominaModal.modalData?.type || 'warning'}
        />

        {/* Modal de Preview de Nómina */}
        {showNominaPreview && nominaPreviewData && selectedEmpleadoPreview && (
          <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative mx-auto border border-gray-200 dark:border-gray-700 w-full max-w-5xl shadow-2xl rounded-lg bg-white dark:bg-dark-100">
              {/* Header del Preview */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Preview de Nómina
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedEmpleadoPreview.nombre} {selectedEmpleadoPreview.apellido}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowNominaPreview(false);
                      setNominaPreviewData(null);
                      setSelectedEmpleadoPreview(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido del Preview */}
              <div className="p-6">
                {/* Estado de la nómina */}
                <div className={`p-4 rounded-lg border mb-6 ${
                  nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : nominaPreviewData.pago_parcial
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado' ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : nominaPreviewData.pago_parcial ? (
                          <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${
                          nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado'
                            ? 'text-green-800 dark:text-green-200'
                            : nominaPreviewData.pago_parcial
                            ? 'text-orange-800 dark:text-orange-200'
                            : 'text-yellow-800 dark:text-yellow-200'
                        }`}>
                          <strong>Estado:</strong> {nominaPreviewData.estado} - ID: {nominaPreviewData.id_nomina}
                        </p>
                        <p className={`text-xs ${
                          nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado'
                            ? 'text-green-600 dark:text-green-400'
                            : nominaPreviewData.pago_parcial
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado'
                            ? 'Nómina completada y PDF generado'
                            : nominaPreviewData.pago_parcial
                            ? 'Pago parcial - Pendiente de liquidación'
                            : 'Nómina en borrador - Pendiente de confirmación'
                          }
                        </p>
                      </div>
                    </div>
                    {nominaPreviewData.pago_parcial && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          Pago Parcial
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid principal: Información a la izquierda, Cálculos a la derecha */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  {/* Columna izquierda: Información del Empleado y Detalles (2/3) */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Información del Empleado */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Información del Empleado</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Nombre</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {selectedEmpleadoPreview.nombre} {selectedEmpleadoPreview.apellido}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">NSS</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{selectedEmpleadoPreview.nss}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">RFC</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{selectedEmpleadoPreview.rfc}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Proyecto</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {selectedEmpleadoPreview.proyecto?.nombre || 'Sin proyecto'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detalles de la Nómina */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Detalles de la Nómina</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Período</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {(() => {
                              const fecha = nominaPreviewData.fecha_creacion || nominaPreviewData.createdAt ? 
                                new Date(nominaPreviewData.fecha_creacion || nominaPreviewData.createdAt) : 
                                new Date();
                              const año = fecha.getFullYear();
                              const mes = fecha.getMonth() + 1;
                              return `${año}-${String(mes).padStart(2, '0')}`;
                            })()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Semana</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {(() => {
                              const fecha = nominaPreviewData.fecha_creacion || nominaPreviewData.createdAt ? 
                                new Date(nominaPreviewData.fecha_creacion || nominaPreviewData.createdAt) : 
                                new Date();
                              function calcularSemanaDelMes(fecha) {
                                const año = fecha.getFullYear();
                                const mes = fecha.getMonth();
                                const dia = fecha.getDate();
                                const primerDiaDelMes = new Date(año, mes, 1);
                                const diaPrimerDia = primerDiaDelMes.getDay();
                                const diasEnPrimeraFila = 7 - diaPrimerDia;
                                if (dia <= diasEnPrimeraFila) return 1;
                                const diasRestantes = dia - diasEnPrimeraFila;
                                return 1 + Math.ceil(diasRestantes / 7);
                              }
                              return `Semana ${calcularSemanaDelMes(fecha)}`;
                            })()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Días Laborados</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {nominaPreviewData.dias_laborados || 6}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Pago Semanal</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {formatCurrency(nominaPreviewData.pago_semanal || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha: Cálculos (1/3) */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Cálculos</h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Salario Base:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(nominaPreviewData.pago_semanal || 0)}
                        </span>
                      </div>
                      {nominaPreviewData.horas_extra > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Horas Extra:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(nominaPreviewData.horas_extra || 0)}                                                                                      
                          </span>
                        </div>
                      )}
                      {nominaPreviewData.bonos > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Bonos:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(nominaPreviewData.bonos || 0)}
                          </span>
                        </div>
                      )}
                    
                    {/* Deducciones Detalladas */}
                    {(nominaPreviewData.deducciones_isr > 0 || nominaPreviewData.deducciones_imss > 0 || 
                      nominaPreviewData.deducciones_infonavit > 0 || nominaPreviewData.deducciones_adicionales > 0 || 
                      nominaPreviewData.descuentos > 0) && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Deducciones:</h5>
                        <div className="space-y-0.5">
                          {nominaPreviewData.deducciones_isr > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">ISR:</span>
                              <span className="font-medium text-red-600 dark:text-red-400">
                                -{formatCurrency(nominaPreviewData.deducciones_isr)}
                              </span>
                            </div>
                          )}
                          {nominaPreviewData.deducciones_imss > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">IMSS:</span>
                              <span className="font-medium text-red-600 dark:text-red-400">
                                -{formatCurrency(nominaPreviewData.deducciones_imss)}
                              </span>
                            </div>
                          )}
                          {nominaPreviewData.deducciones_infonavit > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">Infonavit:</span>
                              <span className="font-medium text-red-600 dark:text-red-400">
                                -{formatCurrency(nominaPreviewData.deducciones_infonavit)}
                              </span>
                            </div>
                          )}
                          {nominaPreviewData.deducciones_adicionales > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">Adicionales:</span>
                              <span className="font-medium text-red-600 dark:text-red-400">
                                -{formatCurrency(nominaPreviewData.deducciones_adicionales)}
                              </span>
                            </div>
                          )}
                          {nominaPreviewData.descuentos > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">Descuentos:</span>
                              <span className="font-medium text-red-600 dark:text-red-400">
                                -{formatCurrency(nominaPreviewData.descuentos)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs font-semibold pt-1 mt-1 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-gray-700 dark:text-gray-300">Total:</span>
                            <span className="text-red-600 dark:text-red-400">
                              -{formatCurrency(
                                (nominaPreviewData.deducciones_isr || 0) +
                                (nominaPreviewData.deducciones_imss || 0) +
                                (nominaPreviewData.deducciones_infonavit || 0) +
                                (nominaPreviewData.deducciones_adicionales || 0) +
                                (nominaPreviewData.descuentos || 0)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                      <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-2 mt-2">
                        {nominaPreviewData.pago_parcial ? (
                          <>
                            <div className="flex justify-between mb-1 text-xs">
                              <span className="text-gray-600 dark:text-gray-400">Monto Original:</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(nominaPreviewData.monto_total || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between mb-1 text-xs">
                              <span className="text-gray-600 dark:text-gray-400">Monto Pagado:</span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(nominaPreviewData.monto_pagado || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-base font-bold text-gray-900 dark:text-white">Pendiente:</span>
                              <span className="text-base font-bold text-orange-600 dark:text-orange-400">
                                {formatCurrency((nominaPreviewData.monto_total || 0) - (nominaPreviewData.monto_pagado || 0))}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between">
                            <span className="text-base font-bold text-gray-900 dark:text-white">Total a Pagar:</span>
                            <span className="text-base font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(nominaPreviewData.monto_total || 0)}
                            </span>
                          </div>
                        )}
                      </div>
                  </div>
                  </div>
                </div>
              </div>

              {/* Footer del Preview */}
              <div className="flex justify-end px-6 py-4 bg-gray-50 dark:bg-gray-900/30 rounded-b-lg">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNominaPreview(false);
                      setNominaPreviewData(null);
                      setSelectedEmpleadoPreview(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cerrar
                  </button>
                  {(nominaPreviewData.estado === 'borrador' || nominaPreviewData.estado === 'Borrador' || nominaPreviewData.estado === 'Pendiente') && (
                    <button
                      type="button"
                      onClick={generarPDFDesdePreview}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-2 inline-block" />
                      Generar PDF y Marcar como Pagada
                    </button>
                  )}
                  {nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado' ? (
                    <button
                      type="button"
                      onClick={generarPDFDesdePreview}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-2 inline-block" />
                      Descargar PDF
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalles de Nómina - Placeholder para futuras implementaciones */}
      {showNominaDetails && selectedNomina && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-0 border border-gray-200 dark:border-gray-700 w-full max-w-2xl shadow-2xl rounded-lg bg-white dark:bg-dark-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                    <EyeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Detalles de la Nómina
                  </h3>
                </div>
                <button
                  onClick={() => setShowNominaDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Información de la Nómina
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                      <span className="text-gray-600 dark:text-gray-400">Empleado:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                        {selectedNomina.empleado?.nombre} {selectedNomina.empleado?.apellido}
                        </p>
                      </div>
                      <div>
                      <span className="text-gray-600 dark:text-gray-400">Período:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                        {selectedNomina.periodo || 'N/A'}
                        </p>
                      </div>
                      <div>
                      <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                        <p className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(selectedNomina.monto_total || selectedNomina.monto || 0)}
                        </p>
                      </div>
                      <div>
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedNomina.estado === 'pagada' || selectedNomina.estado === 'Pagado' || selectedNomina.estado === 'pagado'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : selectedNomina.estado === 'pendiente' || selectedNomina.estado === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : selectedNomina.estado === 'Aprobada' || selectedNomina.estado === 'aprobada'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {selectedNomina.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowNominaDetails(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial de Adeudos */}
      {showAdeudosHistorial && (
        <AdeudosHistorial
          empleado={selectedEmpleadoAdeudos}
          onClose={() => setShowAdeudosHistorial(false)}
          onAdeudoLiquidado={handleAdeudoLiquidado}
        />
      )}

      {/* Modal de Liquidar Adeudo */}
      {showLiquidarModal && nominaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Liquidar Adeudo
              </h3>
              <button
                onClick={() => setShowLiquidarModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empleado
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {nominaSeleccionada.empleado?.nombre} {nominaSeleccionada.empleado?.apellido}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto Total
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(nominaSeleccionada.monto_total || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto Ya Pagado
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(nominaSeleccionada.monto_pagado || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto Pendiente
                </label>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {formatCurrency((nominaSeleccionada.monto_total || 0) - (nominaSeleccionada.monto_pagado || 0))}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto a Liquidar *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={(nominaSeleccionada.monto_total || 0) - (nominaSeleccionada.monto_pagado || 0)}
                  value={montoLiquidacion}
                  onChange={(e) => setMontoLiquidacion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={observacionesLiquidacion}
                  onChange={(e) => setObservacionesLiquidacion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Observaciones sobre el pago..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowLiquidarModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={liquidarAdeudo}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200"
              >
                Liquidar Adeudo
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Drawer Historial de Nómina por Empleado */}
      <NominaEmpleadoHistorialDrawer
        open={showHistorialDrawer}
        empleado={empleadoHistorial}
        onClose={cerrarHistorialEmpleado}
        onEditarNomina={editarNominaDesdeHistorial}
      />
    </div>
  );
}
