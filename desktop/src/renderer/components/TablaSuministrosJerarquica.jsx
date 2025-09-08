import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaEdit, FaTrash, FaReceipt, FaBox, FaBuilding } from 'react-icons/fa';

export default function TablaSuministrosJerarquica({ 
  suministros, 
  onEdit, 
  onDelete, 
  onEditRecibo 
}) {
  const [expandedFolios, setExpandedFolios] = useState(new Set());

  // Agrupar suministros por folio
  const agruparPorFolio = (suministros) => {
    const grupos = {};
    
    suministros.forEach(suministro => {
      const folio = suministro.folio || 'sin_folio';
      
      if (!grupos[folio]) {
        grupos[folio] = {
          folio: suministro.folio,
          proveedor: suministro.proveedor || suministro.proveedor?.nombre_empresa || 'Sin asignar',
          fecha: suministro.fecha || suministro.fecha_necesaria,
          numero_factura: suministro.numero_factura,
          metodo_pago: suministro.metodo_pago,
          proyecto: suministro.proyecto?.nombre || 'Sin proyecto',
          suministros: [],
          total: 0,
          cantidad_items: 0
        };
      }
      
      grupos[folio].suministros.push(suministro);
      
      // Usar costo_total si está disponible, sino calcular manualmente
      let costoSuministro;
      if (suministro.costo_total && !isNaN(parseFloat(suministro.costo_total))) {
        costoSuministro = parseFloat(suministro.costo_total);
      } else {
        // Normalizar cantidad y precio antes de calcular total (evitar símbolos/sep. de miles)
        const cantidadVal = parseFloat(String(suministro.cantidad || '0').replace(/,/g, '').replace(/\s/g, '')) || 0;
        // eliminar cualquier caracter no numérico excepto punto y guión
        const precioStr = String(suministro.precio_unitario || '0');
        const precioVal = parseFloat(precioStr.replace(/[^0-9.\-]/g, '')) || 0;
        costoSuministro = cantidadVal * precioVal;
      }
      
      grupos[folio].total += costoSuministro;
      grupos[folio].cantidad_items += 1;
    });
    
    return Object.entries(grupos).map(([folio, data]) => ({
      ...data,
      id_grupo: folio,
      es_grupo: true
    }));
  };

  const gruposSuministros = agruparPorFolio(suministros);

  const toggleFolio = (folioId) => {
    const newExpanded = new Set(expandedFolios);
    if (newExpanded.has(folioId)) {
      newExpanded.delete(folioId);
    } else {
      newExpanded.add(folioId);
    }
    setExpandedFolios(newExpanded);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatQuantity = (cantidad) => {
    return parseFloat(cantidad || 0).toLocaleString('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    });
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      'Material': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Herramienta': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Concreto': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      'Acero': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Ferretería': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Servicio': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    };
    return colores[categoria] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'Entregado': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'En_Transito': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Pedido': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Aprobado': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Solicitado': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      'Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  return (
    <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-dark-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recibo / Suministro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Folio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
            {gruposSuministros.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  <FaBox className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p>No hay suministros registrados</p>
                </td>
              </tr>
            ) : (
              gruposSuministros.map((grupo) => (
                <React.Fragment key={grupo.id_grupo}>
                  {/* Fila principal del grupo/recibo */}
                  <tr 
                    className="hover:bg-gray-50 dark:hover:bg-dark-200 cursor-pointer border-l-4 border-blue-500"
                    onClick={() => toggleFolio(grupo.id_grupo)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFolio(grupo.id_grupo);
                          }}
                        >
                          {expandedFolios.has(grupo.id_grupo) ? (
                            <FaChevronDown className="w-4 h-4" />
                          ) : (
                            <FaChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <FaReceipt className="text-blue-500 w-5 h-5" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            📋 {grupo.suministros[0]?.nombre || 'Recibo'} 
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {grupo.numero_factura && `Factura: ${grupo.numero_factura}`}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {grupo.proyecto}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        Recibo
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-gray-400 dark:text-gray-500 w-4 h-4" />
                        <div className="font-medium text-gray-900 dark:text-white">
                          {grupo.proveedor}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {grupo.folio || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBox className="text-gray-400 w-4 h-4" />
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {grupo.cantidad_items} artículos
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(grupo.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Múltiple
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {grupo.fecha ? new Date(grupo.fecha).toLocaleDateString('es-MX') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRecibo && onEditRecibo(grupo);
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Editar recibo completo"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Confirmar antes de eliminar el grupo completo
                            if (confirm(`¿Eliminar todo el recibo con ${grupo.cantidad_items} artículos?`)) {
                              grupo.suministros.forEach(s => onDelete(s.id_suministro));
                            }
                          }}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Eliminar recibo completo"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Filas expandidas de suministros individuales */}
                  {expandedFolios.has(grupo.id_grupo) && grupo.suministros.map((suministro, index) => (
                    <tr key={`${grupo.id_grupo}-${index}`} className="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-gray-300">
                      <td className="px-6 py-3 pl-12">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div>
                            <div className="font-medium text-gray-700 dark:text-gray-300">
                              {suministro.nombre}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {suministro.descripcion_detallada || suministro.observaciones}
                            </div>
                            {suministro.codigo_producto && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                Código: {suministro.codigo_producto}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(suministro.tipo_suministro || suministro.categoria)}`}>
                          {suministro.tipo_suministro || suministro.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {/* Mostrar tipo de proveedor si está disponible */}
                          {suministro.proveedor?.tipo_proveedor && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {suministro.proveedor.tipo_proveedor}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          -
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatQuantity(suministro.cantidad)} {suministro.unidad_medida}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(suministro.precio_unitario)}/{suministro.unidad_medida}
                        </div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          Total: {formatCurrency(
                            suministro.costo_total && !isNaN(parseFloat(suministro.costo_total)) 
                              ? parseFloat(suministro.costo_total)
                              : (suministro.cantidad || 0) * (suministro.precio_unitario || 0)
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(suministro.estado)}`}>
                          {suministro.estado === 'En_Transito' ? 'En Tránsito' : suministro.estado}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {suministro.fecha_necesaria ? 
                            new Date(suministro.fecha_necesaria).toLocaleDateString('es-MX') : 
                            '-'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => onEdit(suministro)}
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Editar este artículo individual"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
