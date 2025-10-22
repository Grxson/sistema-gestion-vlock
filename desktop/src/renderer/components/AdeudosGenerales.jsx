import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import AdeudosHeader from './adeudos/AdeudosHeader';
import AdeudosStats from './adeudos/AdeudosStats';
import AdeudosFilters from './adeudos/AdeudosFilters';
import AdeudosTable from './adeudos/AdeudosTable';
import AdeudosFormModal from './adeudos/AdeudosFormModal';

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

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    nombre_entidad: '',
    tipo_adeudo: 'nos_deben',
    monto: '',
    notas: ''
  });

  useEffect(() => {
    cargarAdeudos();
    cargarEstadisticas();
  }, [filtroTipo, filtroEstado]);

  const cargarAdeudos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${API_URL}/adeudos-generales?`;
      if (filtroTipo !== 'todos') url += `tipo=${filtroTipo}&`;
      if (filtroEstado !== 'todos') url += `estado=${filtroEstado}`;

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
      const response = await fetch(`${API_URL}/adeudos-generales/estadisticas`, {
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
      } else {
        showError('Error al guardar adeudo', data.message || 'No se pudo completar la solicitud');
      }
    } catch (error) {
      console.error('Error guardando adeudo:', error);
      showError('Error al guardar adeudo', error.message || 'Ocurrió un error inesperado');
    }
  };

  const marcarComoPagado = async (id) => {
    if (!confirm('¿Estás seguro de marcar este adeudo como pagado?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/adeudos-generales/${id}/pagar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const raw = await response.text();
        console.error('Error marcando como pagado:', raw);
        showError('No se pudo liquidar el adeudo', 'Intenta nuevamente más tarde');
        return;
      }

      const data = await response.json();

      if (data.success) {
        showSuccess('Adeudo liquidado', 'El adeudo se marcó como pagado');
        cargarAdeudos();
        cargarEstadisticas();
      } else {
        showError('No se pudo liquidar el adeudo', data.message || 'Intenta nuevamente más tarde');
      }
    } catch (error) {
      console.error('Error marcando como pagado:', error);
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
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <AdeudosHeader onAdd={abrirModalNuevo} />

      <AdeudosStats
        estadisticas={estadisticas}
        formatCurrency={formatearMoneda}
      />

      <AdeudosFilters
        filtroTipo={filtroTipo}
        setFiltroTipo={setFiltroTipo}
        filtroEstado={filtroEstado}
        setFiltroEstado={setFiltroEstado}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
      />

      <AdeudosTable
        adeudos={adeudos}
        loading={loading}
        onMarkPaid={marcarComoPagado}
        onEdit={abrirModalEditar}
        onDelete={eliminarAdeudo}
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
    </div>
  );
};

export default AdeudosGenerales;
