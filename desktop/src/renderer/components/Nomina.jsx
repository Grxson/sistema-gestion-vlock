import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import nominasServices from '../services/nominas';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import NominaWizardSimplificado from './NominaWizard';
import ChartsSection from './ui/ChartsSection';
import AdeudosHistorial from './ui/AdeudosHistorial';
import EmpleadoCard from './ui/EmpleadoCard';
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
} from '@heroicons/react/24/outline';

export default function Nomina() {
  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [nominas, setNominas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedNomina, setSelectedNomina] = useState(null);
  const [showCharts, setShowCharts] = useState(false);
  const [showNominaDetails, setShowNominaDetails] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [showAdeudosHistorial, setShowAdeudosHistorial] = useState(false);
  const [selectedEmpleadoAdeudos, setSelectedEmpleadoAdeudos] = useState(null);

  // Funciones de utilidad
  const handleNominaSuccess = () => {
    fetchData(); // Recargar datos después de procesar nómina
  };


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Inicializar servicios de nóminas
      await nominasServices.inicializar();
      
      // Fetch empleados usando el nuevo servicio
      const empleadosActivos = await nominasServices.empleados.getEmpleadosActivos();
      setEmpleados(empleadosActivos);
      
      // Fetch nominas usando el nuevo servicio
      let nominasData = [];
      try {
        const nominasResponse = await nominasServices.nominas.getAll();
        nominasData = nominasResponse.data || [];
        setNominas(nominasData);
      } catch (error) {
        console.log('Nomina endpoint not available yet');
        setNominas([]);
      }

      // Cargar estadísticas
      try {
        const estadisticasData = await nominasServices.empleados.getEstadisticasEmpleados();
        setEstadisticas(estadisticasData);
      } catch (error) {
        console.log('Error loading statistics:', error);
        setEstadisticas(null);
      }



    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-dark-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando información de nómina...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-50">
      {/* Header Minimalista */}
      <div className="bg-white dark:bg-dark-50 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Nóminas
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {empleados.length} empleados activos
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                {showCharts ? 'Ocultar Gráficas' : 'Ver Gráficas'}
              </button>
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
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

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
                  {empleados.filter(e => e.activo).length}
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
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(estadisticas?.totalSalariosMensuales || 0)}
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
          />
        )}

        {/* Sección de Empleados Simplificada */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Empleados Activos
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Tabla
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
              
              {Array.isArray(empleados) && empleados.filter(empleado => empleado.activo === 1 || empleado.activo === true).length > 0 ? (
                viewMode === 'cards' ? (
                  /* Vista de Cards */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {empleados.filter(empleado => empleado.activo === 1 || empleado.activo === true).map((empleado, index) => (
                      <EmpleadoCard
                        key={empleado.id_empleado || `empleado-${index}`}
                        empleado={empleado}
                        onView={(emp) => {
                          setSelectedNomina(null);
                          // Aquí podrías abrir un modal de detalles del empleado
                        }}
                        onEdit={(emp) => {
                          // Aquí podrías abrir el modal de edición
                        }}
                        showActions={true}
                      />
                    ))}
                  </div>
                ) : (
                  /* Vista de Tabla Simplificada */
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Empleado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Oficio
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Pago Diario
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Proyecto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {empleados.filter(empleado => empleado.activo === 1 || empleado.activo === true).map((empleado, index) => (
                          <tr key={empleado.id_empleado || `empleado-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
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
                                {formatCurrency(empleado.pago_diario || empleado.contrato?.salario_diario || 0)}
                              </div>
                              <div className={`text-xs ${
                                (empleado.pago_diario || empleado.contrato?.salario_diario) 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {(empleado.pago_diario || empleado.contrato?.salario_diario) 
                                  ? 'Configurado' 
                                  : 'Sin configurar'
                                }
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {empleado.proyecto?.nombre || 'Sin proyecto'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay empleados activos</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Necesitas tener empleados activos para poder procesar la nómina. Agrega o activa empleados en el módulo de empleados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Historial de Nóminas Simplificado */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Historial de Nóminas
            </h2>
          </div>
          <div className="p-6">
            {nominas.length > 0 ? (
              <div className="space-y-3">
                {nominas.slice(0, 5).map((nomina, index) => (
                  <div key={nomina.id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
                          {typeof nomina.empleado === 'object' && nomina.empleado ? 
                            nomina.empleado.nombre?.charAt(0)?.toUpperCase() : 'E'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {typeof nomina.empleado === 'object' && nomina.empleado ? 
                            `${nomina.empleado.nombre || ''} ${nomina.empleado.apellido || ''}`.trim() : 
                            nomina.empleado || 'Sin empleado'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {nomina.periodo || 'Sin período'} • {formatCurrency(nomina.monto_total || nomina.monto || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        nomina.estado === 'Pagado' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        nomina.estado === 'Aprobada' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {nomina.estado}
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            const blob = await nominasServices.nominas.generarReciboPDF(nomina.id_nomina || nomina.id);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `recibo-nomina-${nomina.id_nomina || nomina.id}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                            showSuccess('Éxito', 'Recibo descargado correctamente');
                          } catch (error) {
                            console.error('Error downloading PDF:', error);
                            showError('Error', 'No se pudo descargar el recibo');
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {nominas.length > 5 && (
                  <div className="text-center pt-2">
                    <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                      Ver todas las nóminas ({nominas.length})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aún no hay nóminas procesadas
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nomina Wizard Simplificado */}
        <NominaWizardSimplificado 
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          onSuccess={handleNominaSuccess}
          empleados={empleados}
        />

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
                        selectedNomina.estado === 'Pagado' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : selectedNomina.estado === 'Aprobada'
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
        />
      )}
    </div>
  );
}
