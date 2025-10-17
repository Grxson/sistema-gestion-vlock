import React, { useState } from 'react';
import { formatCurrency } from '../../utils/currency';
import {
  UserIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function NominaPaymentsList({ paymentsData, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('amount'); // amount, name, status
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  if (loading || !paymentsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando lista de pagos...</p>
        </div>
      </div>
    );
  }

  // Filtrar y ordenar datos
  const filteredAndSortedData = paymentsData
    .filter(payment => {
      const matchesSearch = searchTerm === '' || 
        `${payment.empleado.nombre} ${payment.empleado.apellido}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'name':
          comparison = `${a.empleado.nombre} ${a.empleado.apellido}`.localeCompare(`${b.empleado.nombre} ${b.empleado.apellido}`);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusInfo = (status) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Pagado',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          icon: CheckCircleIcon
        };
      case 'partial':
        return {
          label: 'Pago Parcial',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
          icon: ExclamationTriangleIcon
        };
      default:
        return {
          label: 'Pendiente',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          icon: ClockIcon
        };
    }
  };

  const getStatusCounts = () => {
    const counts = paymentsData.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      paid: counts.paid || 0,
      partial: counts.partial || 0,
      pending: counts.pending || 0,
      total: paymentsData.length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-4">
            {/* Filtro por Estado */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="paid">Pagado</option>
                <option value="partial">Pago Parcial</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="amount">Monto</option>
                <option value="name">Nombre</option>
                <option value="status">Estado</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de Estados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {statusCounts.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagados</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {statusCounts.paid}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Parciales</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {statusCounts.partial}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {statusCounts.pending}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pagos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Lista de Pagos de la Semana ({filteredAndSortedData.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredAndSortedData.length > 0 ? (
            filteredAndSortedData.map((payment, index) => {
              const statusInfo = getStatusInfo(payment.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar del empleado */}
                      <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-medium text-lg">
                          {payment.empleado.nombre?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Información del empleado */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {payment.empleado.nombre} {payment.empleado.apellido}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>NSS: {payment.empleado.nss || 'Sin NSS'}</span>
                          <span>RFC: {payment.empleado.rfc || 'Sin RFC'}</span>
                          <span>{payment.nominas.length} nómina(s)</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Monto y estado */}
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(payment.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total acumulado
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                          title="Generar PDF"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detalles de nóminas */}
                  {payment.nominas.length > 1 && (
                    <div className="mt-4 pl-16">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nóminas individuales:
                        </p>
                        <div className="space-y-1">
                          {payment.nominas.map((nomina, nominaIndex) => (
                            <div key={nominaIndex} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                {nomina.periodo || 'Sin período'} - {nomina.estado}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(nomina.monto_total || nomina.monto || 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron pagos
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay nóminas procesadas para esta semana'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
