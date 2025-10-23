import React, { useState, useEffect } from 'react';
import { FaFilter, FaTimes, FaSearch, FaCalendarAlt, FaUser, FaDatabase, FaCog } from 'react-icons/fa';
import auditoriaService from '../../services/auditoria/auditoriaService';

/**
 * Componente de filtros para auditoría
 */
const AuditoriaFilters = ({ filtros, onFiltrosChange, onLimpiar }) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [tablas, setTablas] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingTablas, setLoadingTablas] = useState(false);

  // Tipos de acciones disponibles
  const tiposAccion = [
    { value: '', label: 'Todas las acciones' },
    { value: 'LOGIN', label: 'Inicio de sesión' },
    { value: 'LOGOUT', label: 'Cierre de sesión' },
    { value: 'CREATE', label: 'Crear' },
    { value: 'READ', label: 'Leer' },
    { value: 'UPDATE', label: 'Actualizar' },
    { value: 'DELETE', label: 'Eliminar' }
  ];

  // Cargar usuarios
  useEffect(() => {
    const cargarUsuarios = async () => {
      setLoadingUsuarios(true);
      try {
        const response = await auditoriaService.getUsuarios();
        setUsuarios(response.usuarios || []);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    if (mostrarFiltros) {
      cargarUsuarios();
    }
  }, [mostrarFiltros]);

  // Cargar tablas
  useEffect(() => {
    const cargarTablas = async () => {
      setLoadingTablas(true);
      try {
        const response = await auditoriaService.getTablas();
        setTablas(response.tablas || []);
      } catch (error) {
        console.error('Error al cargar tablas:', error);
      } finally {
        setLoadingTablas(false);
      }
    };

    if (mostrarFiltros) {
      cargarTablas();
    }
  }, [mostrarFiltros]);

  const handleChange = (campo, valor) => {
    onFiltrosChange({ [campo]: valor });
  };

  const handleLimpiar = () => {
    onLimpiar();
    setMostrarFiltros(false);
  };

  const filtrosActivos = Object.values(filtros).filter(v => v !== '' && v !== null && v !== undefined).length;

  return (
    <div className="mb-6 rounded-lg border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 shadow-sm">
      <div className="p-5 space-y-4">
      {/* Header de filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
            <FaFilter className="text-blue-600 dark:text-blue-300 text-base" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Filtros de Búsqueda
          </h3>
          {filtrosActivos > 0 && (
            <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-300">
              {filtrosActivos} activo{filtrosActivos !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {filtrosActivos > 0 && (
            <button
              onClick={handleLimpiar}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-100"
            >
              <FaTimes />
              Limpiar
            </button>
          )}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <FaCog className={`transition-transform ${mostrarFiltros ? 'rotate-90' : ''}`} />
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
        </div>
      </div>

      {/* Búsqueda rápida (siempre visible) */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Buscar en descripción..."
          value={filtros.busqueda || ''}
          onChange={(e) => handleChange('busqueda', e.target.value)}
          className="w-full rounded-md border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-10 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filtros avanzados */}
      {mostrarFiltros && (
        <div className="grid grid-cols-1 gap-4 border-t border-gray-200 dark:border-dark-300 pt-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Filtro de Usuario */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FaUser className="text-blue-600 dark:text-blue-300" />
              Usuario
            </label>
            <select
              value={filtros.id_usuario || ''}
              onChange={(e) => handleChange('id_usuario', e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingUsuarios}
            >
              <option value="">Todos los usuarios</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.nombre_usuario}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Acción */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FaCog className="text-green-600 dark:text-green-300" />
              Tipo de Acción
            </label>
            <select
              value={filtros.accion || ''}
              onChange={(e) => handleChange('accion', e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tiposAccion.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Tabla */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FaDatabase className="text-purple-600 dark:text-purple-300" />
              Tabla
            </label>
            <select
              value={filtros.tabla || ''}
              onChange={(e) => handleChange('tabla', e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingTablas}
            >
              <option value="">Todas las tablas</option>
              {tablas.map((tabla) => (
                <option key={tabla} value={tabla}>
                  {tabla}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Fecha Inicio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FaCalendarAlt className="text-orange-600 dark:text-orange-300" />
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fecha_inicio || ''}
              onChange={(e) => handleChange('fecha_inicio', e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro de Fecha Fin */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FaCalendarAlt className="text-orange-600 dark:text-orange-300" />
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fecha_fin || ''}
              onChange={(e) => handleChange('fecha_fin', e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AuditoriaFilters;
