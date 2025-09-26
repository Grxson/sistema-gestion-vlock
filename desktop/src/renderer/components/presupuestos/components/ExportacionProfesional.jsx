import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { PresupuestosService } from '../../../services/presupuestos/presupuestosService';

/**
 * Componente de exportación profesional similar a Opus
 * Genera PDF y Excel con formato profesional de construcción
 */
const ExportacionProfesional = ({ 
  isOpen, 
  onClose, 
  presupuestoData, 
  formato 
}) => {
  const [configuracion, setConfiguracion] = useState({
    // Configuración del documento
    incluir_logo: true,
    incluir_partidas: true,
    incluir_analisis: true,
    incluir_graficos: false,
    incluir_especificaciones: true,
    
    // Configuración del PDF
    formato_papel: 'carta', // 'carta', 'oficio', 'a4'
    orientacion: 'vertical', // 'vertical', 'horizontal'
    margenes: 'normales', // 'estrechos', 'normales', 'amplios'
    
    // Configuración del contenido
    mostrar_precios_unitarios: true,
    mostrar_cantidades: true,
    mostrar_totales_por_capitulo: true,
    mostrar_resumen_ejecutivo: true,
    
    // Notas y observaciones
    notas_generales: `NOTAS IMPORTANTES:

1. VALIDEZ: Este presupuesto tiene una validez de 30 días naturales a partir de la fecha de emisión.

2. CONDICIONES DE PAGO: 30% anticipo, 40% avance de obra al 50%, 30% finiquito contra entrega.

3. MATERIALES: Los precios incluyen suministro de materiales puestos en obra, mermas y desperdicios.

4. MANO DE OBRA: Se incluye mano de obra especializada, herramienta menor y equipo de seguridad.

5. IMPUESTOS: Los precios no incluyen IVA, el cual se agregará según la tasa vigente al momento de facturación.

6. VARIACIONES: Cualquier modificación al proyecto original será cotizada por separado.

7. PERMISOS: No se incluyen pagos por licencias, permisos municipales o trámites ante autoridades.

8. FUERZA MAYOR: No se consideran eventos de fuerza mayor que puedan afectar el costo final.

9. ESCALATORIAS: Los precios están sujetos a escalatorias por incrementos en materiales superiores al 5%.

10. GARANTÍA: Se otorga garantía de 12 meses sobre vicios ocultos a partir de la entrega de la obra.`,
    
    incluir_notas_pie: true,
    pie_pagina_personalizado: '',
    
    // Configuración de la empresa
    datos_empresa: {
      logo_url: '/assets/images/vlock-logo.png',
      razon_social: 'V-LOCK CONSTRUCCIONES S.A. DE C.V.',
      rfc: 'VLC220915ABC',
      direccion: 'Av. Ingenieros 1234, Col. Industrial Norte',
      ciudad: 'Guadalajara, Jalisco, México',
      codigo_postal: '44470',
      telefono: '+52 (33) 1234-5678',
      email: 'contacto@vlock.com.mx',
      sitio_web: 'www.vlock.com.mx',
      registro_cmic: 'REG-CMIC-2022-001',
      licencia_municipal: 'LIC-MUN-GDL-2022-456'
    }
  });

  const [previewing, setPreviewing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleConfigChange = (field, value, subfield = null) => {
    if (subfield) {
      setConfiguracion(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subfield]: value
        }
      }));
    } else {
      setConfiguracion(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const generarExportacion = async () => {
    setExporting(true);
    try {
      const configuracionCompleta = {
        ...configuracion,
        presupuesto_data: presupuestoData,
        fecha_generacion: new Date().toISOString(),
        usuario_generacion: 'Usuario Actual', // TODO: obtener del contexto
        
        // Configuración específica por formato
        configuracion_especifica: getConfiguracionEspecifica()
      };

      const resultado = await PresupuestosService.exportar(
        presupuestoData.id || 'nuevo',
        formato,
        configuracionCompleta
      );

      // Descargar archivo
      const link = document.createElement('a');
      link.href = resultado.url;
      link.download = resultado.nombre_archivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al generar la exportación');
    } finally {
      setExporting(false);
    }
  };

  const getConfiguracionEspecifica = () => {
    switch (formato) {
      case 'pdf':
        return {
          // Configuración específica para PDF
          plantilla: 'profesional_construccion',
          incluir_portada: true,
          incluir_indices: true,
          numeracion_paginas: true,
          
          // Configuración de páginas
          salto_pagina_por_capitulo: true,
          max_partidas_por_pagina: 25,
          
          // Elementos gráficos
          incluir_marca_agua: false,
          pie_pagina_empresa: true,
          
          // Formato de tablas
          estilo_tabla: 'profesional',
          alternar_colores_filas: true,
          
          // Notas y observaciones
          posicion_notas: 'pie_documento',
          fuente_notas: 'Arial 9pt',
          
          // Configuración de colores (tema V-Lock)
          color_primario: '#2563eb', // Azul principal
          color_secundario: '#64748b', // Gris
          color_acento: '#059669' // Verde para totales
        };
        
      case 'excel':
        return {
          // Configuración específica para Excel
          incluir_formulas: true,
          incluir_graficos: configuracion.incluir_graficos,
          hojas_multiples: true,
          
          // Hojas a incluir
          hojas: {
            resumen: true,
            partidas_detalle: true,
            analisis_precios: configuracion.incluir_analisis,
            comparativo: false,
            especificaciones: configuracion.incluir_especificaciones
          },
          
          // Formato de celdas
          formato_moneda: presupuestoData.moneda || 'MXN',
          decimales_cantidades: 2,
          decimales_precios: 4,
          
          // Protección
          proteger_formulas: true,
          permitir_edicion_cantidades: false
        };
        
      case 'word':
        return {
          // Configuración específica para Word
          plantilla: 'propuesta_comercial',
          incluir_portada_comercial: true,
          incluir_carta_presentacion: true,
          
          // Secciones del documento
          secciones: {
            presentacion_empresa: true,
            alcance_proyecto: true,
            especificaciones_tecnicas: configuracion.incluir_especificaciones,
            cronograma_tentativo: true,
            condiciones_comerciales: true,
            garantias: true
          },
          
          // Formato
          estilo_documento: 'comercial',
          incluir_imagenes_referencia: false,
          pie_pagina_comercial: true
        };
        
      default:
        return {};
    }
  };

  const generarVistaPrevia = () => {
    setPreviewing(true);
    // TODO: Implementar vista previa
    setTimeout(() => setPreviewing(false), 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <DocumentArrowDownIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Exportar Presupuesto - {formato.toUpperCase()}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configuración profesional similar a Opus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {exportSuccess ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                ¡Exportación Completada!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                El archivo se ha descargado correctamente
              </p>
            </div>
          ) : (
            <>
              {/* Configuración del Documento */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <CogIcon className="h-5 w-5 mr-2" />
                  Configuración del Documento
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Formato de Papel
                    </label>
                    <select
                      value={configuracion.formato_papel}
                      onChange={(e) => handleConfigChange('formato_papel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="carta">Carta (21.6 x 27.9 cm)</option>
                      <option value="oficio">Oficio (21.6 x 35.6 cm)</option>
                      <option value="a4">A4 (21 x 29.7 cm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Orientación
                    </label>
                    <select
                      value={configuracion.orientacion}
                      onChange={(e) => handleConfigChange('orientacion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="vertical">Vertical (Portrait)</option>
                      <option value="horizontal">Horizontal (Landscape)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contenido a Incluir
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'incluir_logo', label: 'Logo de la empresa' },
                      { key: 'incluir_partidas', label: 'Detalle de partidas' },
                      { key: 'incluir_analisis', label: 'Análisis de precios' },
                      { key: 'incluir_graficos', label: 'Gráficos y charts' },
                      { key: 'incluir_especificaciones', label: 'Especificaciones técnicas' },
                      { key: 'mostrar_precios_unitarios', label: 'Precios unitarios' }
                    ].map(opcion => (
                      <label key={opcion.key} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={configuracion[opcion.key]}
                          onChange={(e) => handleConfigChange(opcion.key, e.target.checked)}
                          className="mr-2 rounded"
                        />
                        {opcion.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Información de la Empresa */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-400 mb-4">
                  Información de la Empresa
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Razón Social
                    </label>
                    <input
                      type="text"
                      value={configuracion.datos_empresa.razon_social}
                      onChange={(e) => handleConfigChange('datos_empresa', e.target.value, 'razon_social')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      RFC
                    </label>
                    <input
                      type="text"
                      value={configuracion.datos_empresa.rfc}
                      onChange={(e) => handleConfigChange('datos_empresa', e.target.value, 'rfc')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={configuracion.datos_empresa.telefono}
                      onChange={(e) => handleConfigChange('datos_empresa', e.target.value, 'telefono')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={configuracion.datos_empresa.email}
                      onChange={(e) => handleConfigChange('datos_empresa', e.target.value, 'email')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dirección Completa
                    </label>
                    <textarea
                      value={`${configuracion.datos_empresa.direccion}, ${configuracion.datos_empresa.ciudad}, CP ${configuracion.datos_empresa.codigo_postal}`}
                      onChange={(e) => {
                        const direccionCompleta = e.target.value;
                        handleConfigChange('datos_empresa', direccionCompleta, 'direccion');
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Notas Profesionales */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-400">
                    Notas y Condiciones (Estilo Opus)
                  </h3>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={configuracion.incluir_notas_pie}
                      onChange={(e) => handleConfigChange('incluir_notas_pie', e.target.checked)}
                      className="mr-2 rounded"
                    />
                    Incluir en documento
                  </label>
                </div>

                <textarea
                  value={configuracion.notas_generales}
                  onChange={(e) => handleConfigChange('notas_generales', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm font-mono"
                  placeholder="Notas importantes que aparecerán al final del documento..."
                />
                
                <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-400">
                  Estas notas aparecerán al final del documento con formato profesional similar a Opus
                </p>
              </div>

              {/* Preview y configuración específica por formato */}
              {formato === 'pdf' && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-3">
                    Configuración Específica PDF
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Partidas por Página
                      </label>
                      <select
                        value={configuracion.max_partidas_por_pagina || 25}
                        onChange={(e) => handleConfigChange('max_partidas_por_pagina', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                      >
                        <option value={20}>20 partidas</option>
                        <option value={25}>25 partidas</option>
                        <option value={30}>30 partidas</option>
                        <option value={40}>40 partidas</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={configuracion.numeracion_paginas !== false}
                          onChange={(e) => handleConfigChange('numeracion_paginas', e.target.checked)}
                          className="mr-2 rounded"
                        />
                        Numeración de páginas
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={configuracion.salto_pagina_por_capitulo !== false}
                          onChange={(e) => handleConfigChange('salto_pagina_por_capitulo', e.target.checked)}
                          className="mr-2 rounded"
                        />
                        Salto por capítulo
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Información del presupuesto */}
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Información del Presupuesto a Exportar
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Código:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{presupuestoData.codigo}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{presupuestoData.cliente?.nombre}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Partidas:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{presupuestoData.partidas?.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <p className="font-medium text-primary-600 dark:text-primary-400">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: presupuestoData.moneda || 'MXN'
                      }).format(presupuestoData.total || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer con acciones */}
        {!exportSuccess && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex space-x-3">
              <button
                onClick={generarVistaPrevia}
                disabled={previewing}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-500 transition-colors"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                {previewing ? 'Generando...' : 'Vista Previa'}
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={generarExportacion}
                disabled={exporting}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Exportar {formato.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportacionProfesional;