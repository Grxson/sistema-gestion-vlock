import React, { useState, useEffect, useMemo } from "react";
import { FaPlus, FaTrash, FaCopy, FaSave, FaTimes, FaBoxes } from "react-icons/fa";
import ProveedorAutocomplete from "./common/ProveedorAutocomplete";
import DateInput from "./ui/DateInput";
import TimeInput from "./ui/TimeInput";

const CATEGORIAS_SUMINISTRO = {
  'Material': 'Material',
  'Herramienta': 'Herramienta',
  'Equipo Ligero': 'Equipo Ligero',
  'Acero': 'Acero',
  'Cimbra': 'Cimbra',
  'Ferretería': 'Ferretería',
  'Servicio': 'Servicio',
  'Consumible': 'Consumible',
  'Maquinaria': 'Maquinaria',
  'Concreto': 'Concreto'
};

const UNIDADES_MEDIDA = {
  'pz': 'Piezas (pz)',
  'kg': 'Kilogramos (kg)',
  'm': 'Metros (m)',
  'm2': 'Metros cuadrados (m²)',
  'm3': 'Metros cúbicos (m³)',
  'lt': 'Litros (lt)',
  'ton': 'Toneladas (ton)',
  'hr': 'Horas (hr)',
  'día': 'Días',
  'viaje': 'Viajes',
  'ml': 'Mililitros (ml)',
  'cm': 'Centímetros (cm)',
  'mm': 'Milímetros (mm)',
  'global': 'Global',
  'lote': 'Lote',
  'caja': 'Caja',
  'costal': 'Costal',
  'tambor': 'Tambor',
  'galón': 'Galón',
  'rollo': 'Rollo',
  'bulto': 'Bulto',
  'par': 'Par',
  'docena': 'Docena',
  'paquete': 'Paquete',
  'set': 'Set'
};

export default function FormularioMultipleSuministros({ 
  onSubmit, 
  onCancel, 
  proyectos = [],
  proveedores = [],
  categorias = CATEGORIAS_SUMINISTRO,
  unidades = UNIDADES_MEDIDA,
  initialData = null 
}) {
  // Determinar valor inicial del IVA desde los datos cargados
  const initialIVAValue = useMemo(() => {
    // Si hay initialData con suministros, usar el include_iva del primer suministro
    if (initialData?.suministros && initialData.suministros.length > 0) {
      const primerSuministro = initialData.suministros[0];
      return primerSuministro.include_iva !== undefined ? primerSuministro.include_iva : true;
    }
    // Si hay include_iva en el nivel superior de initialData, usarlo
    if (initialData?.include_iva !== undefined) {
      return initialData.include_iva;
    }
    // Por defecto, incluir IVA
    return true;
  }, [initialData]);

  // Estado del recibo/folio principal
  const [reciboInfo, setReciboInfo] = useState({
    folio_proveedor: '',
    id_proyecto: '',
    proveedor_info: null,
    fecha: new Date().toISOString().split('T')[0],
    numero_factura: '',
    metodo_pago: 'Efectivo',
    observaciones: '',
    vehiculo_transporte: '',
    operador_responsable: '',
    hora_salida: '',
    hora_llegada: '',
    hora_inicio_descarga: '',
    hora_fin_descarga: ''
  });

  // Estado de los suministros
  const [suministros, setSuministros] = useState([
    {
      id_temp: Date.now() + Math.random(),
      tipo_suministro: 'Material',
      nombre: '',
      codigo_producto: '',
      descripcion_detallada: '',
      cantidad: '',
      unidad_medida: 'pz',
      precio_unitario: '',
      estado: 'Entregado',
      fecha_necesaria: new Date().toISOString().split('T')[0],
      observaciones: '',
      
      // Campos específicos para ciertos materiales
      m3_perdidos: '',
      m3_entregados: '',
      m3_por_entregar: ''
    }
  ]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [includeIVA, setIncludeIVA] = useState(initialIVAValue); // Estado para controlar si incluir IVA
  const [suministrosEliminados, setSuministrosEliminados] = useState([]); // Track eliminated supplies

  // Calcular totales automáticamente
  const calcularTotales = () => {
    const subtotal = suministros.reduce((sum, item) => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const precio = parseFloat(item.precio_unitario) || 0;
      return sum + (cantidad * precio);
    }, 0);
    
    const iva = includeIVA ? subtotal * 0.16 : 0;
    const total = subtotal + iva;
    
    return {
      cantidad_items: suministros.length,
      subtotal: subtotal.toFixed(2),
      iva: iva.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const totales = calcularTotales();

  // Cargar datos iniciales cuando se edita un recibo existente
  useEffect(() => {
    if (initialData && initialData.suministros && initialData.suministros.length > 0) {
      // Cargar información del recibo
      const primerSuministro = initialData.suministros[0];
      setReciboInfo({
        folio_proveedor: primerSuministro.folio_proveedor || '',
        id_proyecto: primerSuministro.id_proyecto?.toString() || '',
        proveedor_info: primerSuministro.proveedorInfo || null,
        fecha: primerSuministro.fecha ? new Date(primerSuministro.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        numero_factura: primerSuministro.numero_factura || '',
        metodo_pago: primerSuministro.metodo_pago || 'Efectivo',
        observaciones: primerSuministro.observaciones || '',
        vehiculo_transporte: primerSuministro.vehiculo_transporte || '',
        operador_responsable: primerSuministro.operador_responsable || '',
        hora_salida: primerSuministro.hora_salida || '',
        hora_llegada: primerSuministro.hora_llegada || '',
        hora_inicio_descarga: primerSuministro.hora_inicio_descarga || '',
        hora_fin_descarga: primerSuministro.hora_fin_descarga || ''
      });

      // Cargar suministros
      const suministrosCargados = initialData.suministros.map((suministro, index) => ({
        id_temp: Date.now() + index,
        id_suministro: suministro.id_suministro, // Mantener ID original para actualizaciones
        tipo_suministro: suministro.tipo_suministro || suministro.categoria || 'Material',
        nombre: suministro.nombre || '',
        codigo_producto: suministro.codigo_producto || '',
        descripcion_detallada: suministro.descripcion_detallada || '',
        cantidad: suministro.cantidad?.toString() || '',
        unidad_medida: suministro.unidad_medida || 'pz',
        precio_unitario: suministro.precio_unitario?.toString() || '',
        estado: suministro.estado || 'Entregado',
        fecha_necesaria: suministro.fecha_necesaria ? new Date(suministro.fecha_necesaria).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        observaciones: suministro.observaciones || '',
        m3_perdidos: suministro.m3_perdidos?.toString() || '',
        m3_entregados: suministro.m3_entregados?.toString() || '',
        m3_por_entregar: suministro.m3_por_entregar?.toString() || ''
      }));

      setSuministros(suministrosCargados);
    }
  }, [initialData]);

  // Funciones para manejar suministros
  const agregarSuministro = () => {
    const nuevoSuministro = {
      id_temp: Date.now() + Math.random(),
      tipo_suministro: 'Material',
      nombre: '',
      codigo_producto: '',
      descripcion_detallada: '',
      cantidad: '',
      unidad_medida: 'pz',
      precio_unitario: '',
      estado: 'Entregado',
      fecha_necesaria: new Date().toISOString().split('T')[0],
      observaciones: '',
      m3_perdidos: '',
      m3_entregados: '',
      m3_por_entregar: ''
    };
    
    setSuministros([...suministros, nuevoSuministro]);
  };

  const eliminarSuministro = (id) => {
    const suministroAEliminar = suministros.find(s => s.id_temp === id);
    
    // Si el suministro tiene id_suministro (viene de BD), lo añadimos a la lista de eliminados
    if (suministroAEliminar && suministroAEliminar.id_suministro) {
      setSuministrosEliminados(prev => [...prev, suministroAEliminar.id_suministro]);
    }
    
    setSuministros(suministros.filter(s => s.id_temp !== id));
  };

  const duplicarSuministro = (index) => {
    const suministroOriginal = suministros[index];
    const suministroDuplicado = {
      ...suministroOriginal,
      id_temp: Date.now() + Math.random(),
      nombre: suministroOriginal.nombre + ' (Copia)',
      cantidad: '',
      precio_unitario: ''
    };
    
    setSuministros([...suministros, suministroDuplicado]);
  };

  const actualizarSuministro = (id, field, value) => {
    setSuministros(suministros.map(s => 
      s.id_temp === id ? { ...s, [field]: value } : s
    ));
  };

  // Validación del formulario
  const validarFormulario = () => {
    const newErrors = {};
    
    if (!reciboInfo.id_proyecto) {
      newErrors.id_proyecto = 'El proyecto es obligatorio';
    }
    
    if (!reciboInfo.proveedor_info) {
      newErrors.proveedor_info = 'El proveedor es obligatorio';
    }
    
    if (!reciboInfo.fecha) {
      newErrors.fecha = 'La fecha es obligatoria';
    }
    
    if (suministros.length === 0) {
      newErrors.suministros = 'Debe agregar al menos un suministro';
    }
    
    // Validar cada suministro
    suministros.forEach((suministro, index) => {
      if (!suministro.nombre) {
        newErrors[`suministro_${index}_nombre`] = 'El nombre es obligatorio';
      }
      if (!suministro.cantidad || parseFloat(suministro.cantidad) <= 0) {
        newErrors[`suministro_${index}_cantidad`] = 'La cantidad debe ser mayor a 0';
      }
      if (!suministro.precio_unitario || parseFloat(suministro.precio_unitario) <= 0) {
        newErrors[`suministro_${index}_precio`] = 'El precio debe ser mayor a 0';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo del envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        info_recibo: {
          proveedor: reciboInfo.proveedor_info?.nombre || '',
          id_proveedor: reciboInfo.proveedor_info?.id_proveedor || null,
          folio: reciboInfo.folio_proveedor,
          folio_proveedor: reciboInfo.folio_proveedor,
          fecha: reciboInfo.fecha,
          id_proyecto: parseInt(reciboInfo.id_proyecto),
          vehiculo_transporte: reciboInfo.vehiculo_transporte || '',
          operador_responsable: reciboInfo.operador_responsable || '',
          hora_salida: reciboInfo.hora_salida || '',
          hora_llegada: reciboInfo.hora_llegada || '',
          hora_inicio_descarga: reciboInfo.hora_inicio_descarga || '',
          hora_fin_descarga: reciboInfo.hora_fin_descarga || '',
          observaciones_generales: reciboInfo.observaciones || ''
        },
        suministros: suministros.map(s => ({
          id_suministro: s.id_suministro || null, // Incluir ID si existe (para actualización)
          tipo_suministro: s.tipo_suministro,
          nombre: s.nombre,
          codigo_producto: s.codigo_producto,
          descripcion_detallada: s.descripcion_detallada,
          cantidad: parseFloat(s.cantidad),
          unidad_medida: s.unidad_medida,
          precio_unitario: parseFloat(s.precio_unitario),
          estado: s.estado,
          observaciones: s.observaciones,
          m3_perdidos: parseFloat(s.m3_perdidos) || 0,
          m3_entregados: parseFloat(s.m3_entregados) || 0,
          m3_por_entregar: parseFloat(s.m3_por_entregar) || 0
        })),
        suministros_eliminados: suministrosEliminados, // IDs de suministros a eliminar
        include_iva: includeIVA, // Información sobre si incluir IVA
        totales: { // Totales calculados para guardar en el recibo
          subtotal: parseFloat(totales.subtotal),
          iva: parseFloat(totales.iva),
          total: parseFloat(totales.total),
          cantidad_items: totales.cantidad_items
        }
      };
      
      await onSubmit(payload);
      
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-100 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Registro de Múltiples Suministros
        </h2>

        {/* Texto explicativo */}
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Guía de llenado
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                <p className="mb-2">
                  <strong>Campos obligatorios (*):</strong> Nombre, Categoría, Proveedor, Cantidad, Unidad de Medida y Precio.
                </p>
                <p className="mb-2">
                  <strong>Información de Recibo:</strong> Completa según los datos del recibo físico. El folio del proveedor aparece usualmente en la parte superior del documento.
                </p>
                <p>
                  <strong>Horarios y Transporte:</strong> Información opcional para seguimiento detallado de entregas y logística.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
        {/* Información del Recibo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Proveedor - ocupa 2 columnas */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proveedor *
            </label>
            <ProveedorAutocomplete
              value={reciboInfo.proveedor_info}
              onChange={(proveedor) => {
                setReciboInfo(prev => ({
                  ...prev, 
                  proveedor_info: proveedor
                }));
              }}
              proveedores={proveedores}
              placeholder="Buscar o crear proveedor..."
              className="w-full"
            />
            {errors.proveedor_info && (
              <p className="mt-1 text-sm text-red-600">{errors.proveedor_info}</p>
            )}
          </div>

          {/* Proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proyecto *
            </label>
            <select
              value={reciboInfo.id_proyecto}
              onChange={(e) => setReciboInfo(prev => ({
                ...prev, 
                id_proyecto: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">Seleccionar proyecto</option>
              {proyectos.map(proyecto => (
                <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
            {errors.id_proyecto && (
              <p className="mt-1 text-sm text-red-600">{errors.id_proyecto}</p>
            )}
          </div>

          {/* Folio del Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Folio del Proveedor
            </label>
            <input
              type="text"
              value={reciboInfo.folio_proveedor}
              onChange={(e) => setReciboInfo(prev => ({
                ...prev, 
                folio_proveedor: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ej: 37946"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha
            </label>
            <DateInput
              value={reciboInfo.fecha}
              onChange={(value) => setReciboInfo(prev => ({
                ...prev, 
                fecha: value
              }))}
              className="w-full"
            />
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Método de Pago
            </label>
            <select
              value={reciboInfo.metodo_pago}
              onChange={(e) => setReciboInfo(prev => ({
                ...prev, 
                metodo_pago: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cheque">Cheque</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>
        </div>

        {/* Observaciones Generales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Observaciones Generales
          </label>
          <textarea
            value={reciboInfo.observaciones}
            onChange={(e) => setReciboInfo(prev => ({
              ...prev, 
              observaciones: e.target.value
            }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            placeholder="Observaciones del recibo..."
          />
        </div>
        </div>

        {/* Sección de Suministros */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              Suministros 
              <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-sm">
                {suministros.length} artículo{suministros.length !== 1 ? 's' : ''}
              </span>
            </h3>
            <button
              type="button"
              onClick={agregarSuministro}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md font-medium"
            >
              <FaPlus className="w-4 h-4" />
              Agregar Suministro
            </button>
          </div>

          <div className="space-y-3">
            {suministros.map((suministro, index) => (
              <div key={suministro.id_temp} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-md text-sm font-medium">
                      #{index + 1}
                    </span>
                    Suministro {index + 1}
                  </h4>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => duplicarSuministro(index)}
                      className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Duplicar suministro"
                    >
                      <FaCopy className="w-3.5 h-3.5" />
                    </button>
                    {suministros.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarSuministro(suministro.id_temp)}
                        className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar suministro"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Primera fila - Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={suministro.nombre}
                      onChange={(e) => actualizarSuministro(suministro.id_temp, 'nombre', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Nombre del suministro"
                    />
                    {errors[`suministro_${index}_nombre`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`suministro_${index}_nombre`]}</p>
                    )}
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoría
                    </label>
                    <select
                      value={suministro.tipo_suministro}
                      onChange={(e) => actualizarSuministro(suministro.id_temp, 'tipo_suministro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {Object.entries(categorias).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>

                  {/* Código */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código
                    </label>
                    <input
                      type="text"
                      value={suministro.codigo_producto}
                      onChange={(e) => actualizarSuministro(suministro.id_temp, 'codigo_producto', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Código"
                    />
                  </div>
                </div>

                {/* Segunda fila - Cantidades y precios */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={suministro.cantidad}
                      onChange={(e) => actualizarSuministro(suministro.id_temp, 'cantidad', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="0"
                    />
                    {errors[`suministro_${index}_cantidad`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`suministro_${index}_cantidad`]}</p>
                    )}
                  </div>

                  {/* Unidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unidad
                    </label>
                    <select
                      value={suministro.unidad_medida}
                      onChange={(e) => actualizarSuministro(suministro.id_temp, 'unidad_medida', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {Object.entries(unidades).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>

                  {/* Precio Unitario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Precio *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={suministro.precio_unitario}
                      onChange={(e) => actualizarSuministro(suministro.id_temp, 'precio_unitario', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="0.00"
                    />
                    {errors[`suministro_${index}_precio`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`suministro_${index}_precio`]}</p>
                    )}
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado
                    </label>
                    <select
                      value={suministro.estado}
                      onChange={(e) => actualizarSuministro(suministro.id_temp, 'estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Entregado">Entregado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Parcial">Parcial</option>
                    </select>
                  </div>

                  {/* Subtotal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subtotal
                    </label>
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-md text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-sm font-medium">
                      ${((parseFloat(suministro.cantidad) || 0) * (parseFloat(suministro.precio_unitario) || 0)).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción Detallada
                  </label>
                  <textarea
                    value={suministro.descripcion_detallada}
                    onChange={(e) => actualizarSuministro(suministro.id_temp, 'descripcion_detallada', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Descripción detallada del suministro..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de totales */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Checkbox para incluir IVA */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeIVA}
                  onChange={(e) => setIncludeIVA(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                  Incluir IVA (16%)
                </span>
              </label>
            </div>
            
            {/* Totales */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Artículos:</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{totales.cantidad_items}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-semibold text-gray-900 dark:text-white">${totales.subtotal}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">IVA:</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">${totales.iva}</span>
              </div>
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-lg">
                <span className="text-green-600 dark:text-green-300 font-medium">Total:</span>
                <span className="font-bold text-green-700 dark:text-green-400 text-lg">${totales.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            <FaTimes className="w-4 h-4 inline mr-2" />
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || suministros.length === 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-medium shadow-md"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4" />
                Guardar ({totales.cantidad_items} artículos)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}