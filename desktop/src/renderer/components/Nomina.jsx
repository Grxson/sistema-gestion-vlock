import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import NominaWizard from './NominaWizard';
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
  TrashIcon
} from '@heroicons/react/24/outline';

export default function Nomina() {
  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [nominas, setNominas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedNomina, setSelectedNomina] = useState(null);
  const [showNominaDetails, setShowNominaDetails] = useState(false);

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
      
      // Fetch empleados
      const empleadosData = await apiService.getEmpleados();
      const empleadosArray = empleadosData?.empleados || empleadosData?.data || [];
      
      // Filtrar solo empleados activos
      const empleadosActivos = Array.isArray(empleadosArray) 
        ? empleadosArray.filter(emp => emp.activo === true || emp.activo === 1)
        : [];
      
      setEmpleados(empleadosActivos);
      
      // Fetch nominas
      try {
        const nominasData = await apiService.getNominas();
        const nominasArray = nominasData?.nominas || nominasData?.data || [];
        setNominas(Array.isArray(nominasArray) ? nominasArray : []);
      } catch (error) {
        console.log('Nomina endpoint not available yet');
        setNominas([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
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
    <div className="space-y-6 bg-gray-50 dark:bg-dark-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Nómina</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Procesa y gestiona las nóminas de los empleados de manera eficiente
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Procesar Nómina
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-100 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Empleados Activos</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(empleados) ? empleados.length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-100 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Nóminas Procesadas</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(nominas) ? nominas.length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-100 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Período Actual</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getCurrentPeriod()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-100 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Salarios Mensuales</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(empleados) 
                      ? formatCurrency(empleados.reduce((sum, emp) => {
                          // Obtener el pago diario del empleado o del contrato
                          const pagoDiario = emp.pago_diario || emp.contrato?.salario_diario || 0;
                          return sum + (parseFloat(pagoDiario) || 0);
                        }, 0) * 30) // Multiplicar por 30 días para obtener salario mensual
                      : formatCurrency(0)
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empleados Table */}
      <div className="bg-white dark:bg-dark-100 shadow-sm overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-5">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <UserGroupIcon className="h-6 w-6 mr-2 text-primary-600" />
            Empleados Activos para Nómina
          </h3>
          
          {Array.isArray(empleados) && empleados.filter(empleado => empleado.activo === 1 || empleado.activo === true).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Oficio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pago Diario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Proyecto
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                  {empleados.filter(empleado => empleado.activo === 1 || empleado.activo === true).map((empleado, index) => (
                    <tr key={empleado.id_empleado || `empleado-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shadow-sm">
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
                              NSS: {empleado.nss}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {empleado.oficio?.nombre || 'Sin oficio'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {empleado.oficio?.descripcion || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(empleado.pago_diario || empleado.contrato?.salario_diario || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {empleado.proyecto?.nombre || 'Sin proyecto'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {/* Historial de Nóminas */}
      <div className="bg-white dark:bg-dark-100 shadow-sm overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-5">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <DocumentTextIcon className="h-6 w-6 mr-2 text-green-600" />
            Historial de Nóminas
          </h3>
          
          {nominas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                  {nominas.map((nomina, index) => (
                    <tr key={nomina.id || nomina.id_nomina || `nomina-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {typeof nomina.empleado === 'object' && nomina.empleado ? 
                          `${nomina.empleado.nombre || ''} ${nomina.empleado.apellido || ''}`.trim() : 
                          nomina.empleado || 'Sin empleado'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {nomina.periodo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(nomina.monto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          nomina.estado === 'Pagado' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : nomina.estado === 'Aprobada'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {nomina.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedNomina(nomina);
                              setShowNominaDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Ver detalles"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Implementar edición de nómina
                              showInfo('Próximamente', 'La edición de nóminas estará disponible pronto');
                            }}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const pdfResponse = await apiService.generarReciboPDF(nomina.id_nomina);
                                if (pdfResponse) {
                                  const blob = new Blob([pdfResponse], { type: 'application/pdf' });
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.style.display = 'none';
                                  a.href = url;
                                  a.download = `nomina_${nomina.empleado?.nombre || 'empleado'}_${nomina.periodo || 'periodo'}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                  showSuccess('PDF Descargado', 'Recibo de nómina descargado exitosamente');
                                }
                              } catch (error) {
                                console.error('Error downloading PDF:', error);
                                showError('Error', 'No se pudo descargar el PDF del recibo');
                              }
                            }}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Descargar PDF"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BanknotesIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sin historial de nóminas</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Aún no se han procesado nóminas. Procesa la primera nómina para comenzar a ver el historial.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nomina Wizard */}
      <NominaWizard 
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
    </div>
  );
}
