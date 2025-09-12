import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import {
  PlusIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  BanknotesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Nomina() {
  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [nominas, setNominas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState('');
  const [processingNomina, setProcessingNomina] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [diasLaborados, setDiasLaborados] = useState(30);
  const [semanaNum, setSemanaNum] = useState(1);

  // Filtrar empleados por búsqueda
  const empleadosFiltrados = Array.isArray(empleados) 
    ? empleados.filter(emp => 
        emp.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.nss?.includes(searchTerm)
      )
    : [];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch empleados
      const empleadosData = await apiService.getEmpleados();
      console.log('Empleados data response:', empleadosData);
      
      // Extraer el array de empleados de la respuesta
      const empleadosArray = empleadosData?.empleados || empleadosData?.data || [];
      console.log('Empleados array:', empleadosArray);
      
      // Filtrar solo empleados activos
      const empleadosActivos = Array.isArray(empleadosArray) 
        ? empleadosArray.filter(emp => emp.activo === true || emp.activo === 1)
        : [];
      
      setEmpleados(empleadosActivos);
      
      // Solo mostrar notificación una vez cuando hay cambios
      if (empleadosActivos.length !== empleados.length) {
        showSuccess('Datos cargados', 'Información de empleados y nóminas actualizada');
      }

      // Fetch nominas (si existe el endpoint)
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

  const procesarNomina = async () => {
    if (!selectedPeriodo) {
      showError('Campo requerido', 'Por favor selecciona un período');
      return;
    }

    if (!selectedEmpleado) {
      showError('Campo requerido', 'Por favor selecciona un empleado');
      return;
    }

    try {
      setProcessingNomina(true);
      showInfo('Procesando', `Generando nómina para ${selectedEmpleado.nombre} ${selectedEmpleado.apellido}...`);
      
      // Intentar procesar la nómina con el endpoint real
      try {
        const response = await apiService.procesarNomina({
          id_empleado: selectedEmpleado.id_empleado,
          id_semana: semanaNum,
          id_proyecto: selectedEmpleado.id_proyecto || 1, // Default to 1 if no project
          dias_laborados: diasLaborados,
          pago_por_dia: selectedEmpleado.pago_diario || selectedEmpleado.contrato?.salario_diario || 0,
          periodo: selectedPeriodo,
          empleado: selectedEmpleado
        });
        
        showSuccess('¡Éxito!', `Nómina generada exitosamente para ${selectedEmpleado.nombre} ${selectedEmpleado.apellido}`);
        
        // Generar PDF de la nómina usando el endpoint existente
        if (response?.data?.id_nomina) {
          try {
            showInfo('Generando PDF', 'Creando recibo de nómina...');
            
            const pdfResponse = await fetch(`/api/nomina/${response.data.id_nomina}/recibo`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/pdf'
              }
            });

            if (pdfResponse.ok) {
              // Crear un blob del PDF y descargarlo
              const blob = await pdfResponse.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = `nomina_${selectedEmpleado.nombre}_${selectedEmpleado.apellido}_${selectedPeriodo}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);

              showSuccess('PDF Generado', `Recibo de nómina descargado para ${selectedEmpleado.nombre} ${selectedEmpleado.apellido}`);
            } else {
              throw new Error('Error al generar PDF');
            }
          } catch (pdfError) {
            console.warn('Error al generar PDF:', pdfError);
            showInfo('PDF no disponible', 'La nómina se procesó pero no se pudo generar el PDF automáticamente');
          }
        }
        
        setShowModal(false);
        setSelectedPeriodo('');
        setSelectedEmpleado(null);
        setSearchTerm('');
        fetchData();
      } catch (error) {
        // Si el endpoint no está disponible, simular el procesamiento
        console.log('Endpoint no disponible, simulando procesamiento...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showSuccess('Simulación completa', `Nómina generada exitosamente para ${selectedEmpleado.nombre} ${selectedEmpleado.apellido} (simulación)`);
        setShowModal(false);
        setSelectedPeriodo('');
        setSelectedEmpleado(null);
        setSearchTerm('');
        fetchData();
      }

    } catch (error) {
      console.error('Error processing nomina:', error);
      showError('Error de procesamiento', 'Error al procesar la nómina');
    } finally {
      setProcessingNomina(false);
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
          onClick={() => setShowModal(true)}
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
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {nomina.estado}
                        </span>
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

      {/* Modal para Procesar Nómina */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-0 border border-gray-200 dark:border-gray-700 w-full max-w-2xl shadow-2xl rounded-lg bg-white dark:bg-dark-100">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mr-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Procesar Nómina Individual
                </h3>
              </div>
              
              <div className="space-y-6">
                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Período (Año-Mes)
                  </label>
                  <input
                    type="month"
                    value={selectedPeriodo}
                    onChange={(e) => setSelectedPeriodo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Selecciona el período"
                  />
                </div>

                {/* Días Laborados */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Días Laborados
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={diasLaborados}
                    onChange={(e) => setDiasLaborados(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Días trabajados en el período"
                  />
                </div>

                {/* Número de Semana */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Semana del Período
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={semanaNum}
                    onChange={(e) => setSemanaNum(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Número de semana (1-4)"
                  />
                </div>

                {/* Buscar Empleado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Buscar Empleado
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, apellido o NSS..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                  
                  {/* Lista de empleados filtrados */}
                  {searchTerm && (
                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                      {empleadosFiltrados.length > 0 ? (
                        empleadosFiltrados.map((empleado, index) => (
                          <div
                            key={empleado.id_empleado || `filtered-empleado-${index}`}
                            onClick={() => {
                              setSelectedEmpleado(empleado);
                              setSearchTerm('');
                            }}
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                          >
                            <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {empleado.nombre?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {empleado.nombre} {empleado.apellido}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                NSS: {empleado.nss} • {empleado.oficio?.nombre || 'Sin oficio'}
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                {formatCurrency(empleado.pago_diario || empleado.contrato?.salario_diario || 0)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">por día</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No se encontraron empleados
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Información del Empleado Seleccionado */}
                {selectedEmpleado && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Datos del Empleado Seleccionado:
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedEmpleado.nombre} {selectedEmpleado.apellido}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">NSS:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedEmpleado.nss}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Oficio:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedEmpleado.oficio?.nombre || 'Sin oficio'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Pago Diario:</span>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(selectedEmpleado.pago_diario || selectedEmpleado.contrato?.salario_diario || 0)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Proyecto:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedEmpleado.proyecto?.nombre || 'Sin proyecto'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Salario Mensual Estimado:</span>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency((selectedEmpleado.pago_diario || selectedEmpleado.contrato?.salario_diario || 0) * 30)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPeriodo('');
                      setSelectedEmpleado(null);
                      setSearchTerm('');
                      setDiasLaborados(30);
                      setSemanaNum(1);
                    }}
                    disabled={processingNomina}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={procesarNomina}
                    disabled={processingNomina || !selectedPeriodo || !selectedEmpleado || !diasLaborados || !semanaNum}
                    className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200"
                  >
                    {processingNomina && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {processingNomina ? 'Procesando...' : 'Procesar Nómina'}
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
