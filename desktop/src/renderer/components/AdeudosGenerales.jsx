import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import AdeudosHeader from './adeudos/AdeudosHeader';
import AdeudosStats from './adeudos/AdeudosStats';
import AdeudosFilters from './adeudos/AdeudosFilters';
import AdeudosTable from './adeudos/AdeudosTable';
import AdeudosFormModal from './adeudos/AdeudosFormModal';
import PagoParcialModal from './adeudos/PagoParcialModal';
import AdeudosExport from './adeudos/AdeudosExport';
import AdeudosChartModal from './adeudos/AdeudosChartModal';
import { eventBus, EVENTS } from '../utils/eventBus';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AdeudosGenerales = () => {
  const { showSuccess, showError } = useToast();
  const [adeudos, setAdeudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('pendiente');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [adeudoEditando, setAdeudoEditando] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [adeudoParaPago, setAdeudoParaPago] = useState(null);
  const [mostrarModalExport, setMostrarModalExport] = useState(false);
  const [mostrarModalGrafica, setMostrarModalGrafica] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    nombre_entidad: '',
    tipo_adeudo: 'nos_deben',
    monto: '',
    fecha_vencimiento: '',
    notas: ''
  });

  useEffect(() => {
    cargarAdeudos();
    cargarEstadisticas();
  }, [filtroTipo, filtroEstado, fechaInicio, fechaFin]);

  const cargarAdeudos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Construir URL con parámetros
      const params = new URLSearchParams();
      if (filtroTipo !== 'todos') params.append('tipo', filtroTipo);
      if (filtroEstado !== 'todos') params.append('estado', filtroEstado);
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      
      const url = `${API_URL}/adeudos-generales${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const raw = await response.text();
        console.error('Error cargando adeudos:', raw);
        showError('Error al cargar adeudos', 'No se pudo obtener la información de adeudos');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setAdeudos(data.data);
      } else {
        showError('Error al cargar adeudos', data.message || 'No se pudo obtener la información de adeudos');
      }
    } catch (error) {
      console.error('Error cargando adeudos:', error);
      showError('Error al cargar adeudos', error.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/adeudos-generales/estadisticas`;
      
      // Agregar parámetros de fecha si existen
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const raw = await response.text();
        console.error('Error cargando estadísticas:', raw);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setEstadisticas(data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formulario.nombre_entidad.trim()) {
      showToast('El nombre es requerido', 'error');
      return;
    }

    if (!formulario.monto || parseFloat(formulario.monto) <= 0) {
      showToast('El monto debe ser mayor a 0', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = adeudoEditando 
        ? `${API_URL}/adeudos-generales/${adeudoEditando.id_adeudo_general}`
        : `${API_URL}/adeudos-generales`;
      
      const method = adeudoEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formulario)
      });

      if (!response.ok) {
        const raw = await response.text();
        console.error('Error guardando adeudo:', raw);
        showError('Error al guardar adeudo', adeudoEditando ? 'No se pudo actualizar el adeudo' : 'No se pudo crear el adeudo');
        return;
      }

      const data = await response.json();

      if (data.success) {
        showSuccess(
          adeudoEditando ? 'Adeudo actualizado' : 'Adeudo creado',
          adeudoEditando ? 'El adeudo se actualizó correctamente' : 'El adeudo se registró correctamente'
        );
        cerrarModal();
        cargarAdeudos();
        cargarEstadisticas();
        
        // Emitir evento para actualizar notificaciones
        if (adeudoEditando) {
          eventBus.emit(EVENTS.ADEUDO_ACTUALIZADO, { 
            id: adeudoEditando.id_adeudo_general,
            accion: 'actualizado'
          });
        } else {
          eventBus.emit(EVENTS.ADEUDO_CREADO, { 
            accion: 'creado'
          });
        }
      } else {
        showError('Error al guardar adeudo', data.message || 'No se pudo completar la solicitud');
      }
    } catch (error) {
      console.error('Error guardando adeudo:', error);
      showError('Error al guardar adeudo', error.message || 'Ocurrió un error inesperado');
    }
  };

  const abrirModalPago = (adeudo) => {
    setAdeudoParaPago(adeudo);
    setMostrarModalPago(true);
  };

  const cerrarModalPago = () => {
    setMostrarModalPago(false);
    setAdeudoParaPago(null);
  };

  const registrarPagoParcial = async (datosPago) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/adeudos-generales/${adeudoParaPago.id_adeudo_general}/pago-parcial`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosPago)
      });

      if (!response.ok) {
        const raw = await response.text();
        console.error('Error registrando pago:', raw);
        showError('Error al registrar pago', 'No se pudo procesar el pago');
        return;
      }

      const data = await response.json();

      if (data.success) {
        showSuccess('Pago registrado', data.message || 'El pago se registró correctamente');
        cerrarModalPago();
        cargarAdeudos();
        cargarEstadisticas();
        
        // Emitir evento para actualizar notificaciones
        eventBus.emit(EVENTS.ADEUDO_ACTUALIZADO, { 
          id: adeudoParaPago.id_adeudo_general,
          accion: 'pago_parcial'
        });
      } else {
        showError('Error al registrar pago', data.message || 'No se pudo procesar el pago');
      }
    } catch (error) {
      console.error('Error registrando pago:', error);
      showError('Error al registrar pago', error.message || 'Ocurrió un error inesperado');
    }
  };

  const marcarComoPagado = async (id) => {
    if (!confirm('¿Estás seguro de liquidar completamente este adeudo?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/adeudos-generales/${id}/liquidar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notas_pago: 'Liquidación completa desde interfaz'
        })
      });

      if (!response.ok) {
        const raw = await response.text();
        console.error('Error liquidando adeudo:', raw);
        showError('No se pudo liquidar el adeudo', 'Intenta nuevamente más tarde');
        return;
      }

      const data = await response.json();

      if (data.success) {
        showSuccess('Adeudo liquidado', data.message || 'El adeudo se liquidó completamente');
        cargarAdeudos();
        cargarEstadisticas();
        
        // Emitir evento para actualizar notificaciones
        eventBus.emit(EVENTS.ADEUDO_PAGADO, { 
          id: id,
          accion: 'liquidado'
        });
      } else {
        showError('No se pudo liquidar el adeudo', data.message || 'Intenta nuevamente más tarde');
      }
    } catch (error) {
      console.error('Error liquidando adeudo:', error);
      showError('No se pudo liquidar el adeudo', error.message || 'Ocurrió un error inesperado');
    }
  };

  const eliminarAdeudo = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este adeudo? Esta acción no se puede deshacer.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/adeudos-generales/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const raw = await response.text();
        console.error('Error eliminando adeudo:', raw);
        showError('Error al eliminar adeudo', 'No se pudo eliminar el adeudo seleccionado');
        return;
      }

      const data = await response.json();

      if (data.success) {
        showSuccess('Adeudo eliminado', 'El adeudo se eliminó correctamente');
        cargarAdeudos();
        cargarEstadisticas();
        
        // Emitir evento para actualizar notificaciones
        eventBus.emit(EVENTS.ADEUDO_ELIMINADO, { 
          id: id,
          accion: 'eliminado'
        });
      } else {
        showError('Error al eliminar adeudo', data.message || 'No se pudo eliminar el adeudo seleccionado');
      }
    } catch (error) {
      console.error('Error eliminando adeudo:', error);
      showError('Error al eliminar adeudo', error.message || 'Ocurrió un error inesperado');
    }
  };

  const abrirModalNuevo = () => {
    setAdeudoEditando(null);
    setFormulario({
      nombre_entidad: '',
      tipo_adeudo: 'nos_deben',
      monto: '',
      fecha_vencimiento: '',
      notas: ''
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (adeudo) => {
    setAdeudoEditando(adeudo);
    setFormulario({
      nombre_entidad: adeudo.nombre_entidad,
      tipo_adeudo: adeudo.tipo_adeudo,
      monto: adeudo.monto,
      fecha_vencimiento: adeudo.fecha_vencimiento ? new Date(adeudo.fecha_vencimiento).toISOString().split('T')[0] : '',
      notas: adeudo.notas || ''
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setAdeudoEditando(null);
    setFormulario({
      nombre_entidad: '',
      tipo_adeudo: 'nos_deben',
      monto: '',
      fecha_vencimiento: '',
      notas: ''
    });
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    let d;
    if (fecha instanceof Date) {
      d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    } else if (typeof fecha === 'string') {
      const [y, m, dayPart] = fecha.split('T')[0].split('-').map(Number);
      d = new Date(y, (m || 1) - 1, dayPart || 1);
    } else {
      d = new Date(fecha);
    }
    return d.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <AdeudosHeader 
        onAdd={abrirModalNuevo}
        onExport={() => setMostrarModalExport(true)}
        onShowChart={() => setMostrarModalGrafica(true)}
      />

      <AdeudosStats
        estadisticas={estadisticas}
        formatCurrency={formatearMoneda}
        filtrosActivos={!!(fechaInicio || fechaFin)}
      />

      <AdeudosFilters
        filtroTipo={filtroTipo}
        setFiltroTipo={setFiltroTipo}
        filtroEstado={filtroEstado}
        setFiltroEstado={setFiltroEstado}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
      />

      <AdeudosTable
        adeudos={adeudos}
        loading={loading}
        onMarkPaid={marcarComoPagado}
        onEdit={abrirModalEditar}
        onDelete={eliminarAdeudo}
        onRegistrarPago={abrirModalPago}
        formatCurrency={formatearMoneda}
        formatDate={formatearFecha}
        filterText={busqueda}
      />

      <AdeudosFormModal
        isOpen={mostrarModal}
        onClose={cerrarModal}
        onSubmit={handleSubmit}
        formData={formulario}
        setFormData={setFormulario}
        isEditing={!!adeudoEditando}
      />

      <PagoParcialModal
        isOpen={mostrarModalPago}
        onClose={cerrarModalPago}
        onSubmit={registrarPagoParcial}
        adeudo={adeudoParaPago}
        formatCurrency={formatearMoneda}
      />

      <AdeudosExport
        adeudos={adeudos}
        onClose={() => setMostrarModalExport(false)}
        formatCurrency={formatearMoneda}
        formatDate={formatearFecha}
        isOpen={mostrarModalExport}
      />

      <AdeudosChartModal
        isOpen={mostrarModalGrafica}
        onClose={() => setMostrarModalGrafica(false)}
        estadisticas={estadisticas}
        formatCurrency={formatearMoneda}
      />
    </div>
  );
};

export default AdeudosGenerales;
