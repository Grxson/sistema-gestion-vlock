import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  CircleStackIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Componente para exportar e importar datos del sistema
 */
const ExportacionImportacion = () => {
  const [tablas, setTablas] = useState([]);
  const [tablasSeleccionadas, setTablasSeleccionadas] = useState([]);
  const [formatoExportacion, setFormatoExportacion] = useState('json');
  const [incluirRelaciones, setIncluirRelaciones] = useState(false);
  const [vaciarDespues, setVaciarDespues] = useState(false);
  // Opciones específicas para SQL
  const [backupCompleto, setBackupCompleto] = useState(false);
  const [incluirEstructuraYVistas, setIncluirEstructuraYVistas] = useState(true);
  // Estados para backup por proyecto
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
  const [formatoProyecto, setFormatoProyecto] = useState('sql');
  const [modoProyecto, setModoProyecto] = useState(false); // false = tablas, true = proyecto
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    cargarTablas();
    cargarProyectos();
  }, []);

  const cargarTablas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/exportacion/tablas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTablas(response.data.tablas);
      }
    } catch (error) {
      console.error('Error al cargar tablas:', error);
      mostrarMensaje('error', 'Error al cargar las tablas disponibles');
    } finally {
      setLoading(false);
    }
  };

  const cargarProyectos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/proyectos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtrar solo proyectos activos o en proceso
      const proyectosActivos = response.data.filter(p => 
        p.estado && p.estado !== 'Cancelado' && p.estado !== 'Archivado'
      );
      setProyectos(proyectosActivos);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  };

  const toggleTabla = (nombreTabla) => {
    setTablasSeleccionadas(prev => {
      if (prev.includes(nombreTabla)) {
        return prev.filter(t => t !== nombreTabla);
      } else {
        return [...prev, nombreTabla];
      }
    });
  };

  const seleccionarTodas = () => {
    if (tablasSeleccionadas.length === tablas.length) {
      setTablasSeleccionadas([]);
    } else {
      setTablasSeleccionadas(tablas.map(t => t.nombre));
    }
  };

  const exportarDatos = async () => {
    if (tablasSeleccionadas.length === 0) {
      mostrarMensaje('warning', 'Debe seleccionar al menos una tabla para exportar');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      let endpoint = '';
      let responseType = 'json';
      const data = { 
        tablas: tablasSeleccionadas,
        incluirRelaciones 
      };

      switch (formatoExportacion) {
        case 'json':
          endpoint = `${API_URL}/exportacion/json`;
          break;
        case 'csv':
          endpoint = `${API_URL}/exportacion/csv`;
          responseType = 'blob';
          data.tabla = tablasSeleccionadas[0]; // CSV solo soporta una tabla
          break;
        case 'excel':
          endpoint = `${API_URL}/exportacion/excel`;
          responseType = 'blob';
          break;
        case 'sql':
          endpoint = `${API_URL}/exportacion/sql`;
          responseType = 'blob';
          Object.assign(data, {
            fullBackup: backupCompleto,
            includeStructure: incluirEstructuraYVistas,
            includeViews: incluirEstructuraYVistas
          });
          break;
        default:
          throw new Error('Formato de exportación no válido');
      }

      const response = await axios.post(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` },
        responseType
      });

      if (formatoExportacion === 'json') {
        // Descargar JSON
        const jsonStr = JSON.stringify(response.data.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `exportacion_${Date.now()}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Descargar otros formatos
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        let extension = formatoExportacion;
        if (formatoExportacion === 'excel') extension = 'xlsx';
        
        link.download = `exportacion_${Date.now()}.${extension}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      mostrarMensaje('success', 'Exportación completada exitosamente');

      // Si se seleccionó vaciar después de exportar
      if (vaciarDespues) {
        await vaciarTablas();
      }

      // Actualizar estadísticas
      calcularEstadisticas();
    } catch (error) {
      console.error('Error al exportar:', error);
      mostrarMensaje('error', error.response?.data?.message || 'Error al exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  const vaciarTablas = async () => {
    const confirmacion = window.confirm(
      `⚠️ ADVERTENCIA: Esta acción eliminará PERMANENTEMENTE todos los datos de las tablas seleccionadas.\n\n` +
      `Tablas a vaciar:\n${tablasSeleccionadas.join('\n')}\n\n` +
      `¿Está seguro de que desea continuar?`
    );

    if (!confirmacion) return;

    // Segunda confirmación para operaciones críticas
    const confirmacionFinal = window.confirm(
      `Esta es su última oportunidad para cancelar.\n\n` +
      `¿Confirma que desea ELIMINAR todos los datos?`
    );

    if (!confirmacionFinal) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/exportacion/vaciar`,
        {
          tablas: tablasSeleccionadas,
          confirmar: true
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        mostrarMensaje('success', 'Tablas vaciadas exitosamente');
        cargarTablas(); // Recargar para actualizar conteos
        setTablasSeleccionadas([]);
      }
    } catch (error) {
      console.error('Error al vaciar tablas:', error);
      mostrarMensaje('error', error.response?.data?.message || 'Error al vaciar las tablas');
    } finally {
      setLoading(false);
    }
  };

  const importarDatos = async (archivo) => {
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        const datos = JSON.parse(e.target.result);
        const token = localStorage.getItem('token');

        const response = await axios.post(
          `${API_URL}/exportacion/importar`,
          {
            datos,
            sobrescribir: false
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          mostrarMensaje('success', `Importación completada. ${response.data.resultados.importados} registros importados`);
          cargarTablas();
        }
      } catch (error) {
        console.error('Error al importar:', error);
        mostrarMensaje('error', error.response?.data?.message || 'Error al importar los datos');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(archivo);
  };

  const backupProyectoHandler = async () => {
    if (!proyectoSeleccionado) {
      mostrarMensaje('warning', 'Debe seleccionar un proyecto');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const proyecto = proyectos.find(p => p.id_proyecto == proyectoSeleccionado);

      const response = await axios.post(
        `${API_URL}/exportacion/proyecto/${proyectoSeleccionado}/backup`,
        { formato: formatoProyecto },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const extension = formatoProyecto === 'excel' ? 'xlsx' : formatoProyecto;
      const nombreArchivo = `backup_${proyecto.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.${extension}`;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();

      mostrarMensaje('success', `Backup del proyecto ${proyecto.nombre} exportado exitosamente`);
    } catch (error) {
      console.error('Error al exportar backup de proyecto:', error);
      mostrarMensaje('error', 'Error al generar backup del proyecto');
    } finally {
      setLoading(false);
    }
  };

  const vaciarProyectoHandler = async () => {
    if (!proyectoSeleccionado) {
      mostrarMensaje('warning', 'Debe seleccionar un proyecto');
      return;
    }

    const proyecto = proyectos.find(p => p.id_proyecto == proyectoSeleccionado);
    
    const confirmacion = window.confirm(
      `⚠️ ADVERTENCIA: Está a punto de ELIMINAR PERMANENTEMENTE todos los datos del proyecto:\n\n` +
      `"${proyecto.nombre}"\n\n` +
      `Esto incluye:\n` +
      `- Suministros\n` +
      `- Gastos e Ingresos\n` +
      `- Nóminas\n` +
      `- Movimientos de herramientas\n` +
      `- Estados de cuenta\n` +
      `- Presupuestos\n\n` +
      `Esta acción NO SE PUEDE DESHACER.\n\n` +
      `¿Está seguro de continuar?`
    );

    if (!confirmacion) return;

    const confirmacionFinal = window.confirm(
      `¿Confirma que desea ELIMINAR PERMANENTEMENTE todos los datos del proyecto "${proyecto.nombre}"?\n\n` +
      `Escriba "CONFIRMAR" mentalmente y haga clic en Aceptar.`
    );

    if (!confirmacionFinal) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `${API_URL}/exportacion/proyecto/${proyectoSeleccionado}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { confirmar: 'CONFIRMAR' }
        }
      );

      if (response.data.success) {
        mostrarMensaje('success', 
          `Proyecto "${proyecto.nombre}" vaciado exitosamente. ` +
          `${response.data.total_registros_eliminados} registros eliminados.`
        );
        setProyectoSeleccionado('');
        cargarTablas(); // Actualizar conteos
      }
    } catch (error) {
      console.error('Error al vaciar proyecto:', error);
      mostrarMensaje('error', error.response?.data?.message || 'Error al vaciar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = () => {
    const totalRegistros = tablas
      .filter(t => tablasSeleccionadas.includes(t.nombre))
      .reduce((sum, t) => sum + t.count, 0);

    setEstadisticas({
      tablasSeleccionadas: tablasSeleccionadas.length,
      totalRegistros
    });
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  useEffect(() => {
    if (tablasSeleccionadas.length > 0) {
      calcularEstadisticas();
    } else {
      setEstadisticas(null);
    }
  }, [tablasSeleccionadas, tablas]);

  const getIconoFormato = (formato) => {
    switch (formato) {
      case 'json':
        return <CodeBracketIcon className="h-5 w-5" />;
      case 'csv':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'excel':
        return <TableCellsIcon className="h-5 w-5" />;
      case 'sql':
        return <CircleStackIcon className="h-5 w-5" />;
      default:
        return <DocumentArrowDownIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Exportación e Importación de Datos
        </h1>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona los datos del sistema: exporta, importa o vacía información de tus proyectos
          </p>
          {/* Pequeña etiqueta informativa para ver a qué API apunta esta vista */}
          <span
            title={`API base usada por esta vista: ${API_URL}`}
            className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
          >
            API: {API_URL}
          </span>
        </div>
      </div>

      {/* Mensaje de alerta */}
      {mensaje && (
        <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
          mensaje.tipo === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
          mensaje.tipo === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
          'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
        }`}>
          {mensaje.tipo === 'success' ? <CheckCircleIcon className="h-6 w-6" /> :
           mensaje.tipo === 'warning' ? <ExclamationTriangleIcon className="h-6 w-6" /> :
           <InformationCircleIcon className="h-6 w-6" />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Selección de tablas o proyecto */}
        <div className="lg:col-span-2 space-y-6">
          {/* Toggle: Modo Tablas vs Modo Proyecto */}
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setModoProyecto(false)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  !modoProyecto
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300'
                }`}
              >
                <TableCellsIcon className="h-5 w-5 inline mr-2" />
                Por Tablas
              </button>
              <button
                onClick={() => setModoProyecto(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  modoProyecto
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300'
                }`}
              >
                <CircleStackIcon className="h-5 w-5 inline mr-2" />
                Por Proyecto
              </button>
            </div>
          </div>

          {/* Modo Tablas */}
          {!modoProyecto && (
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Seleccionar Tablas
              </h2>
              <button
                onClick={seleccionarTodas}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {tablasSeleccionadas.length === tablas.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tablas.map((tabla) => (
                <label
                  key={tabla.nombre}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    tablasSeleccionadas.includes(tabla.nombre)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={tablasSeleccionadas.includes(tabla.nombre)}
                      onChange={() => toggleTabla(tabla.nombre)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {tabla.nombre}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {tabla.descripcion}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {tabla.count} registros
                  </div>
                </label>
              ))}
            </div>
          </div>
          )}

          {/* Modo Proyecto */}
          {modoProyecto && (
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Backup y Limpieza por Proyecto
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seleccionar Proyecto
                </label>
                <select
                  value={proyectoSeleccionado}
                  onChange={(e) => setProyectoSeleccionado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                >
                  <option value="">-- Seleccione un proyecto --</option>
                  {proyectos.map(proyecto => (
                    <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                      {proyecto.nombre} ({proyecto.estado || 'Sin estado'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formato de Backup
                </label>
                <div className="flex space-x-3">
                  {['sql', 'excel', 'json'].map((formato) => (
                    <button
                      key={formato}
                      onClick={() => setFormatoProyecto(formato)}
                      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        formatoProyecto === formato
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {getIconoFormato(formato)}
                      <span className="mt-1 text-xs font-medium uppercase">{formato}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <InformationCircleIcon className="h-5 w-5 inline mr-2" />
                  El backup incluirá automáticamente todas las tablas relacionadas al proyecto:
                </p>
                <ul className="mt-2 text-xs text-blue-700 dark:text-blue-400 ml-7 space-y-1">
                  <li>• Suministros y gastos</li>
                  <li>• Nóminas y pagos</li>
                  <li>• Movimientos de herramientas</li>
                  <li>• Estados de cuenta y presupuestos</li>
                  <li>• Ingresos y movimientos</li>
                </ul>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={backupProyectoHandler}
                  disabled={!proyectoSeleccionado || loading}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>Exportar Backup</span>
                </button>
                
                <button
                  onClick={vaciarProyectoHandler}
                  disabled={!proyectoSeleccionado || loading}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <TrashIcon className="h-5 w-5" />
                  <span>Vaciar Proyecto</span>
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Tarjeta de formato de exportación (solo en modo tablas) */}
          {!modoProyecto && (
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Formato de Exportación
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['json', 'csv', 'excel', 'sql'].map((formato) => (
                <button
                  key={formato}
                  onClick={() => setFormatoExportacion(formato)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    formatoExportacion === formato
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {getIconoFormato(formato)}
                  <span className="mt-2 text-sm font-medium uppercase">
                    {formato}
                  </span>
                </button>
              ))}
            </div>

            {formatoExportacion === 'csv' && tablasSeleccionadas.length > 1 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm">
                <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
                El formato CSV solo permite exportar una tabla a la vez. Se exportará: <strong>{tablasSeleccionadas[0]}</strong>
              </div>
            )}

            {formatoExportacion === 'sql' && (
              <div className="mt-4 space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupCompleto}
                    onChange={(e) => setBackupCompleto(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Backup completo (estructura + datos + vistas)
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Incluye tablas, datos, vistas y (si es posible) triggers/rutinas. Ignora la selección de tablas.
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incluirEstructuraYVistas}
                    onChange={(e) => setIncluirEstructuraYVistas(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Incluir estructura y vistas
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Para exportación parcial, agrega CREATE TABLE si no existe y las definiciones de vistas.
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Panel derecho: Acciones y opciones */}
        <div className="space-y-6">{!modoProyecto && (
          <>
          {/* Estadísticas */}
          {estadisticas && (
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Resumen de Exportación</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold">{estadisticas.tablasSeleccionadas}</div>
                  <div className="text-sm opacity-90">Tablas seleccionadas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{estadisticas.totalRegistros.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Total de registros</div>
                </div>
              </div>
            </div>
          )}

          {/* Opciones adicionales */}
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Opciones
            </h3>

            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirRelaciones}
                  onChange={(e) => setIncluirRelaciones(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Incluir relaciones
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Exportar datos relacionados (empleados, proyectos, etc.)
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vaciarDespues}
                  onChange={(e) => setVaciarDespues(e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <div>
                  <div className="font-medium text-red-600 dark:text-red-400">
                    Vaciar después de exportar
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ⚠️ Elimina los datos después de exportarlos
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acciones
            </h3>

            <div className="space-y-3">
              <button
                onClick={exportarDatos}
                disabled={loading || tablasSeleccionadas.length === 0}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>{loading ? 'Exportando...' : 'Exportar Datos'}</span>
              </button>

              <label className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer">
                <ArrowUpTrayIcon className="h-5 w-5" />
                <span>Importar Datos</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => importarDatos(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                onClick={vaciarTablas}
                disabled={loading || tablasSeleccionadas.length === 0}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
                <span>Vaciar Tablas</span>
              </button>
            </div>
          </div>
          </>
          )}

          {/* Información adicional para modo proyecto */}
          {modoProyecto && proyectoSeleccionado && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Proyecto Seleccionado</h3>
              <div className="space-y-2">
                <div className="text-xl font-bold">
                  {proyectos.find(p => p.id_proyecto == proyectoSeleccionado)?.nombre}
                </div>
                <div className="text-sm opacity-90">
                  Se exportarán/eliminarán todas las tablas relacionadas automáticamente
                </div>
              </div>
            </div>
          )}

          {/* Advertencia */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Advertencia:</strong> Las acciones de vaciar {modoProyecto ? 'proyecto' : 'tablas'} son irreversibles. Asegúrate de hacer un respaldo antes de continuar.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportacionImportacion;
