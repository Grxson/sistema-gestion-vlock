import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaPlus, FaTrash, FaCopy, FaSave, FaTimes, FaBoxes } from "react-icons/fa";
import ProveedorAutocomplete from "./common/ProveedorAutocomplete";
import CategoriaAutocomplete from "./common/CategoriaAutocomplete";
import ProveedorModal from "./proveedores/ProveedorModal";
import DateInput from "./ui/DateInput";
import TimeInput from "./ui/TimeInput";
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import { debugTools } from '../hooks/useFormDebug';

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
  'm2': 'm²',
  'm3': 'm³',
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

// Funciones auxiliares para formateo de números
const formatNumberWithCommas = (value) => {
  if (!value) return '';
  // Convertir a string y eliminar caracteres no numéricos excepto punto decimal
  const cleanValue = value.toString().replace(/[^\d.]/g, '');
  // Si está vacío o solo tiene punto, retornar tal como está
  if (!cleanValue || cleanValue === '.') return cleanValue;
  
  // Separar parte entera y decimal
  const parts = cleanValue.split('.');
  // Formatear parte entera con comas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Reunir las partes
  return parts.join('.');
};

const parseFormattedNumber = (value) => {
  if (!value) return '';
  // Eliminar todas las comas para obtener el valor numérico
  return value.toString().replace(/,/g, '');
};

// Mapeo de categorías legacy a IDs (temporal para migración)
const CATEGORIA_LEGACY_TO_ID = {
  'Material': 1,
  'Herramienta': 2,
  'Equipo Ligero': 3,
  'Acero': 4,
  'Cimbra': 5,
  'Ferretería': 6,
  'Maquinaria': 7,
  'Concreto': 8,
  'Servicio': 9,
  'Consumible': 10
};

// Función para obtener ID de categoría desde nombre legacy
const getCategoriaIdFromName = (nombreCategoria) => {
  return CATEGORIA_LEGACY_TO_ID[nombreCategoria] || null; // No default, retorna null si no encuentra
};

export default function FormularioSuministros({ 
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

  // Función para obtener fecha local correcta (sin problemas de zona horaria)
  const getLocalDateString = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Estado del recibo/folio principal
  const [reciboInfo, setReciboInfo] = useState({
    folio: '',
    id_proyecto: '',
    proveedor_info: null,
    fecha: getLocalDateString(),
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
      id_categoria_suministro: null, // Sin categoría por defecto
      nombre: '',
      codigo_producto: '',
      descripcion_detallada: '',
      cantidad: '',
      unidad_medida: 'pz',
      precio_unitario: '',
      estado: 'Entregado',
      fecha_necesaria: getLocalDateString(),
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
  const [formattedPrices, setFormattedPrices] = useState({}); // Estado para manejar precios formateados

  // Estados para validación de duplicados y autocompletado
  const [duplicatesSuggestions, setDuplicatesSuggestions] = useState([]);
  const [showDuplicatesWarning, setShowDuplicatesWarning] = useState(false);
  const [duplicatesWarningData, setDuplicatesWarningData] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState({});
  const [showNameSuggestions, setShowNameSuggestions] = useState({});
  const [codeSuggestions, setCodeSuggestions] = useState({});
  const [showCodeSuggestions, setShowCodeSuggestions] = useState({});
  const [existingSuministros, setExistingSuministros] = useState([]); // Para cargar suministros existentes del sistema

  // Estados para el modal de proveedores
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [proveedorModalData, setProveedorModalData] = useState(null);

  // Hook para toast notifications
  const { showSuccess, showError } = useToast();

  // =================== DEBUGGING Y MONITORING ===================
  debugTools.useRenderDebug('FormularioSuministros', { 
    proyectosCount: proyectos.length, 
    proveedoresCount: proveedores.length,
    hasInitialData: !!initialData,
    suministrosCount: suministros.length,
    existingSuministrosCount: existingSuministros.length
  });
  
  debugTools.useMemoryLeakDetector('FormularioSuministros');
  
  // Performance monitoring para operaciones costosas
  debugTools.usePerformanceMonitor('FormularioSuministros-MainRender', [
    suministros, existingSuministros, reciboInfo
  ]);
  
  // Validador automático de estado (solo en desarrollo y cuando hay datos)
  debugTools.useFormStateValidator(reciboInfo, {
    // Solo validar campos si el formulario tiene datos o se está enviando
    ...(reciboInfo.folio || reciboInfo.proveedor_info || suministros.some(s => s.nombre) ? {
      id_proyecto: { required: true },
      proveedor_info: { required: true },
      fecha: { required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ }
    } : {})
  });
  
  // Validador para suministros (sin usar forEach para evitar violación de reglas de hooks)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && globalThis.debugForms) {
      suministros.forEach((suministro, index) => {
        const issues = [];
        
        if (!suministro.nombre || suministro.nombre === '') {
          issues.push(`❌ Suministro ${index + 1}: Nombre requerido`);
        }
        
        if (!suministro.cantidad || isNaN(Number(suministro.cantidad)) || Number(suministro.cantidad) <= 0) {
          issues.push(`❌ Suministro ${index + 1}: Cantidad debe ser mayor a 0`);
        }
        
        if (!suministro.precio_unitario || isNaN(Number(suministro.precio_unitario)) || Number(suministro.precio_unitario) <= 0) {
          issues.push(`❌ Suministro ${index + 1}: Precio unitario debe ser mayor a 0`);
        }
        
        if (issues.length > 0) {
          console.group(`🚨 Problemas en suministro ${index + 1}:`);
          issues.forEach(issue => console.warn(issue));
          console.groupEnd();
        }
      });
    }
  }, [suministros]);

  // Calcular totales automáticamente (optimizado con useMemo)
  const totales = useMemo(() => {
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
  }, [suministros, includeIVA]);

  // =================== FUNCIONES DE NORMALIZACIÓN OPTIMIZADAS ===================
  
  // Cache para mapeos de normalización (optimización de performance)
  const unidadMappingCache = useMemo(() => ({
    // Símbolos Unicode y formatos comunes
    'm²': 'm2',
    'm³': 'm3',
    'metros cuadrados': 'm2',
    'metros cúbicos': 'm3',
    'metro cuadrado': 'm2',
    'metro cúbico': 'm3',
    'metros cuadrados (m²)': 'm2',
    'metros cúbicos (m³)': 'm3',
    'bote': 'pz',
    'botes': 'pz'
  }), []);

  // Keys cacheadas para evitar recálculos
  const unidadKeys = useMemo(() => Object.keys(UNIDADES_MEDIDA), []);
  const categoriaKeys = useMemo(() => Object.keys(CATEGORIAS_SUMINISTRO), []);
  const unidadEntries = useMemo(() => Object.entries(UNIDADES_MEDIDA), []);
  const categoriaEntries = useMemo(() => Object.entries(CATEGORIAS_SUMINISTRO), []);

  // Función optimizada para normalizar unidad de medida
  const normalizeUnidadMedida = useCallback((unidadFromDB) => {
    if (!unidadFromDB) return 'pz';
    
    // Fast path: Si ya es una clave válida
    if (UNIDADES_MEDIDA[unidadFromDB]) {
      return unidadFromDB;
    }
    
    // Fast path: Verificar cache de mapeos
    const lowerUnit = unidadFromDB.toLowerCase();
    const cachedMapping = unidadMappingCache[lowerUnit];
    if (cachedMapping) {
      return cachedMapping;
    }
    
    // Verificar mapeo de símbolos exactos
    for (const [symbol, key] of Object.entries(unidadMappingCache)) {
      if (lowerUnit === symbol.toLowerCase()) {
        return key;
      }
    }
    
    // Si es un número (índice), convertir a clave
    const unidadAsNumber = parseInt(unidadFromDB);
    if (!isNaN(unidadAsNumber) && unidadAsNumber >= 0 && unidadAsNumber < unidadKeys.length) {
      return unidadKeys[unidadAsNumber];
    }
    
    // Buscar por valor completo (última opción, más costosa)
    const entry = unidadEntries.find(([key, value]) => 
      value.toLowerCase() === lowerUnit
    );
    
    return entry ? entry[0] : 'pz';
  }, [unidadMappingCache, unidadKeys, unidadEntries]);
  
  // Función optimizada para normalizar categoría
  const normalizeCategoria = useCallback((categoriaFromDB) => {
    // Si no hay valor, retornar null en lugar de un valor por defecto
    if (!categoriaFromDB || categoriaFromDB === '' || categoriaFromDB === null || categoriaFromDB === undefined) {
      return null;
    }
    
    // Si es un objeto categoria (nuevo sistema), usar el id
    if (typeof categoriaFromDB === 'object' && categoriaFromDB.id_categoria) {
      return categoriaFromDB.id_categoria;
    }
    
    // Si es un número (ID de categoría), retornarlo directamente
    const categoriaAsNumber = parseInt(categoriaFromDB);
    if (!isNaN(categoriaAsNumber)) {
      return categoriaAsNumber;
    }
    
    // Si es un string, puede ser una clave del sistema anterior
    if (typeof categoriaFromDB === 'string') {
      // Si es una clave válida del sistema anterior, convertir a ID
      if (CATEGORIAS_SUMINISTRO[categoriaFromDB]) {
        // Buscar el índice en las categorías locales y convertir a ID (asumiendo IDs secuenciales)
        const categoriaKeys = Object.keys(CATEGORIAS_SUMINISTRO);
        const index = categoriaKeys.indexOf(categoriaFromDB);
        return index >= 0 ? index + 1 : null;
      }
      
      // Buscar por valor completo en categorías locales
      const lowerCategoria = categoriaFromDB.toLowerCase();
      const categoriaEntries = Object.entries(CATEGORIAS_SUMINISTRO);
      const entry = categoriaEntries.find(([key, value]) => 
        value.toLowerCase() === lowerCategoria
      );
      
      if (entry) {
        const index = categoriaEntries.indexOf(entry);
        return index + 1;
      }
    }
    
    return null; // No forzar valor por defecto
  }, []);

  // Función optimizada para normalizar fecha
  const normalizeFecha = useCallback((fechaFromDB) => {
    if (!fechaFromDB) return getLocalDateString();
    
    try {
      // Si viene como string en formato YYYY-MM-DD, validar y retornar
      if (typeof fechaFromDB === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fechaFromDB)) {
        const fecha = new Date(fechaFromDB + 'T00:00:00'); // Agregar tiempo para evitar zona horaria
        if (!isNaN(fecha.getTime())) {
          return fechaFromDB; // Ya está en formato correcto
        }
      }
      
      // Si viene como Date object o string de fecha
      const fecha = new Date(fechaFromDB);
      if (isNaN(fecha.getTime())) {
        return getLocalDateString();
      }
      
      // Convertir a fecha local sin problemas de zona horaria
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('Error normalizando fecha:', fechaFromDB, error);
      return getLocalDateString();
    }
  }, [getLocalDateString]);

  // ⚡ OPTIMIZACIÓN CRÍTICA: Cargar datos iniciales de forma asíncrona
  useEffect(() => {
    // ⚡ Early return si no hay datos iniciales
    if (!initialData) return;
    
    // ⚡ Usar requestAnimationFrame para diferir el procesamiento pesado
    const processInitialData = () => {
      const startTime = performance.now();
      
      // Detectar si es un suministro individual o múltiple
      let suministrosParaProcesar = [];
      
      if (initialData.suministros && Array.isArray(initialData.suministros)) {
        // Es la estructura de múltiples (recibo con array de suministros)
        suministrosParaProcesar = initialData.suministros;
      } else if (initialData.id_suministro || initialData.nombre) {
        // Es un suministro individual, convertirlo a estructura de array
        suministrosParaProcesar = [initialData];
      }

      // ⚡ Early return si no hay suministros para procesar
      if (suministrosParaProcesar.length === 0) return;

      // Cargar información del recibo del primer suministro
      const primerSuministro = suministrosParaProcesar[0];
      
      // ⚡ BATCH: Actualizar reciboInfo una sola vez
      setReciboInfo(prevState => ({
        ...prevState,
        folio: primerSuministro.folio || '',
        id_proyecto: primerSuministro.id_proyecto?.toString() || '',
        proveedor_info: primerSuministro.proveedor || primerSuministro.proveedor_info || null,
        fecha: normalizeFecha(primerSuministro.fecha),
        numero_factura: primerSuministro.numero_factura || '',
        metodo_pago: primerSuministro.metodo_pago || 'Efectivo',
        observaciones: primerSuministro.observaciones || '',
        vehiculo_transporte: primerSuministro.vehiculo_transporte || '',
        operador_responsable: primerSuministro.operador_responsable || '',
        hora_salida: primerSuministro.hora_salida || '',
        hora_llegada: primerSuministro.hora_llegada || '',
        hora_inicio_descarga: primerSuministro.hora_inicio_descarga || '',
        hora_fin_descarga: primerSuministro.hora_fin_descarga || ''
      }));

      // ⚡ OPTIMIZACIÓN: Procesar suministros usando reduce para una sola pasada
      const timestamp = Date.now();
      const suministrosCargados = suministrosParaProcesar.reduce((acc, suministro, index) => {
        // ⚡ Cache normalizaciones para evitar recálculos
        const unidadNormalizada = normalizeUnidadMedida(suministro.unidad_medida);
        const categoriaId = suministro.id_categoria_suministro || getCategoriaIdFromName(suministro.tipo_suministro || suministro.categoria);
        const fechaNormalizada = normalizeFecha(suministro.fecha_necesaria || suministro.fecha || initialData?.fecha);
        
        acc.push({
          id_temp: timestamp + index,
          id_suministro: suministro.id_suministro,
          id_categoria_suministro: categoriaId,
          nombre: suministro.nombre || '',
          codigo_producto: suministro.codigo_producto || '',
          descripcion_detallada: suministro.descripcion_detallada || '',
          cantidad: suministro.cantidad?.toString() || '',
          unidad_medida: unidadNormalizada,
          precio_unitario: suministro.precio_unitario?.toString() || '',
          estado: suministro.estado || 'Entregado',
          fecha_necesaria: fechaNormalizada,
          observaciones: suministro.observaciones || '',
          m3_perdidos: suministro.m3_perdidos?.toString() || '',
          m3_entregados: suministro.m3_entregados?.toString() || '',
          m3_por_entregar: suministro.m3_por_entregar?.toString() || ''
        });
        
        return acc;
      }, []);

      // ⚡ BATCH: Actualizar suministros una sola vez
      setSuministros(suministrosCargados);
      
      // Inicializar precios formateados
      const initialFormattedPrices = suministrosCargados.reduce((acc, suministro) => {
        if (suministro.precio_unitario) {
          acc[suministro.id_temp] = formatNumberWithCommas(suministro.precio_unitario);
        }
        return acc;
      }, {});
      setFormattedPrices(initialFormattedPrices);
      
      const processingTime = performance.now() - startTime;
      if (process.env.NODE_ENV === 'development' && globalThis.debugForms) {
      }
    };
    
    // ⚡ Diferir el procesamiento para no bloquear el render inicial
    const frameId = requestAnimationFrame(processInitialData);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [initialData, normalizeUnidadMedida, normalizeCategoria, normalizeFecha]);

  // =================== FUNCIONES DE VALIDACIÓN Y AUTOCOMPLETADO OPTIMIZADAS ===================
  
  // Función para cargar suministros existentes del sistema (para validaciones y autocompletado)
  // ⚡ OPTIMIZACIÓN: Lazy loading y cache de suministros
  useEffect(() => {
    let isMounted = true;
    
    const cargarSuministrosExistentes = async () => {
      try {
        // ⚡ Early return si ya están cargados
        if (existingSuministros.length > 0) return;
        
        const startTime = performance.now();
        const response = await api.getSuministros();
        
        // ⚡ Check si el componente sigue montado antes de actualizar estado
        if (!isMounted) return;
        
        const suministrosData = response.data || response.suministros || [];
        const loadTime = performance.now() - startTime;
        
        if (process.env.NODE_ENV === 'development' && globalThis.debugForms) {
        }
        
        setExistingSuministros(suministrosData);
      } catch (error) {
        if (isMounted) {
          console.warn('No se pudieron cargar suministros existentes para autocompletado:', error);
          setExistingSuministros([]); // Evitar re-intentos
        }
      }
    };
    
    // ⚡ Diferir la carga para no bloquear el render inicial
    const timeoutId = setTimeout(cargarSuministrosExistentes, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // ⚡ Solo ejecutar una vez al montar

  // Hook de debounce optimizado
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Función optimizada para verificar duplicados DENTRO del formulario actual
  const checkForDuplicates = useCallback((folioProveedor, currentIndex = -1) => {
    if (!folioProveedor || folioProveedor.trim() === '') {
      return [];
    }

    return suministros.filter((suministro, index) => 
      index !== currentIndex &&
      suministro.folio && 
      suministro.folio.toLowerCase().trim() === folioProveedor.toLowerCase().trim()
    );
  }, [suministros]);

  // Función optimizada para buscar registros existentes en la base de datos
  const searchExistingRecords = useCallback((folioProveedor, excludeId = null) => {
    if (!folioProveedor || folioProveedor.trim() === '') {
      setDuplicatesSuggestions([]);
      setShowDuplicatesWarning(false);
      return;
    }

    if (process.env.NODE_ENV === 'development' && globalThis.debugForms) {
    }

    // Obtener todos los IDs que debemos excluir
    const idsToExclude = [];
    
    if (excludeId) idsToExclude.push(excludeId);
    
    if (initialData?.suministros && Array.isArray(initialData.suministros)) {
      idsToExclude.push(...initialData.suministros.map(s => s.id_suministro).filter(id => id));
    } else if (initialData?.id_suministro) {
      idsToExclude.push(initialData.id_suministro);
    }
    
    idsToExclude.push(...suministros.map(s => s.id_suministro).filter(id => id));

    // Búsqueda optimizada con filtros tempranos
    const existingRecords = existingSuministros
      .filter(suministro => {
        // Early return para performance
        if (!suministro.folio) return false;
        if (idsToExclude.includes(suministro.id_suministro)) return false;
        return suministro.folio.toLowerCase().trim() === folioProveedor.toLowerCase().trim();
      })
      .slice(0, 3); // Limitar resultados para performance

    setDuplicatesSuggestions(existingRecords);
    setShowDuplicatesWarning(existingRecords.length > 0);
  }, [existingSuministros, suministros, initialData]);

  // Cache para nombres únicos (optimización de memoria y performance)
  const uniqueNames = useMemo(() => {
    const namesSet = new Set();
    const normalizedNames = existingSuministros
      .map(s => s.nombre)
      .filter(Boolean) // Filtrar valores nulos/undefined
      .map(name => name.trim()) // Eliminar espacios al inicio/final
      .filter(name => name.length > 0); // Filtrar nombres vacíos
    
    // Usar un Map para eliminar duplicados case-insensitive pero conservar el formato original
    const nameMap = new Map();
    normalizedNames.forEach(name => {
      const normalizedKey = name.toLowerCase().replace(/\s+/g, ' '); // Normalizar espacios
      if (!nameMap.has(normalizedKey)) {
        nameMap.set(normalizedKey, name);
      }
    });
    
    return Array.from(nameMap.values()).sort();
  }, [existingSuministros]);

  // Cache para códigos únicos
  const uniqueCodes = useMemo(() => {
    const codesSet = new Set();
    const normalizedCodes = existingSuministros
      .map(s => s.codigo_producto)
      .filter(Boolean) // Filtrar valores nulos/undefined
      .map(code => code.toString().trim()) // Convertir a string y eliminar espacios
      .filter(code => code.length > 0); // Filtrar códigos vacíos
    
    // Usar un Map para eliminar duplicados case-insensitive pero conservar el formato original
    const codeMap = new Map();
    normalizedCodes.forEach(code => {
      const normalizedKey = code.toLowerCase().replace(/\s+/g, ''); // Normalizar espacios
      if (!codeMap.has(normalizedKey)) {
        codeMap.set(normalizedKey, code);
      }
    });
    
    return Array.from(codeMap.values()).sort();
  }, [existingSuministros]);

  // Función optimizada para autocompletar nombres de suministros
  const searchNameSuggestions = useCallback((nombre, suministroId) => {
    if (!nombre || nombre.length < 2) {
      setNameSuggestions(prev => ({ ...prev, [suministroId]: [] }));
      setShowNameSuggestions(prev => ({ ...prev, [suministroId]: false }));
      return;
    }

    const lowerNombre = nombre.toLowerCase();
    const filteredNames = uniqueNames
      .filter(name => 
        name.toLowerCase().includes(lowerNombre) && 
        name.toLowerCase() !== lowerNombre
      )
      .sort((a, b) => {
        // Priorizar coincidencias exactas al inicio
        const aExact = a.toLowerCase().startsWith(lowerNombre) ? 0 : 1;
        const bExact = b.toLowerCase().startsWith(lowerNombre) ? 0 : 1;
        return aExact - bExact || a.length - b.length;
      })
      .slice(0, 8); // Limitar para performance

    setNameSuggestions(prev => ({ ...prev, [suministroId]: filteredNames }));
    setShowNameSuggestions(prev => ({ ...prev, [suministroId]: filteredNames.length > 0 }));
  }, [uniqueNames]);

  // Función optimizada para autocompletar códigos de producto
  const searchCodeSuggestions = useCallback((codigo, suministroId) => {
    if (!codigo || codigo.length < 2) {
      setCodeSuggestions(prev => ({ ...prev, [suministroId]: [] }));
      setShowCodeSuggestions(prev => ({ ...prev, [suministroId]: false }));
      return;
    }

    const lowerCodigo = codigo.toLowerCase();
    const filteredCodes = uniqueCodes
      .filter(code => 
        code.toLowerCase().includes(lowerCodigo) && 
        code.toLowerCase() !== lowerCodigo
      )
      .sort((a, b) => {
        const aExact = a.toLowerCase().startsWith(lowerCodigo) ? 0 : 1;
        const bExact = b.toLowerCase().startsWith(lowerCodigo) ? 0 : 1;
        return aExact - bExact || a.length - b.length;
      })
      .slice(0, 5);

    setCodeSuggestions(prev => ({ ...prev, [suministroId]: filteredCodes }));
    setShowCodeSuggestions(prev => ({ ...prev, [suministroId]: filteredCodes.length > 0 }));
  }, [uniqueCodes]);

  // Función optimizada para aplicar sugerencia con autocompletado de datos
  const applySuggestion = useCallback((suministroId, campo, valor) => {
    // Buscar el suministro completo para autocompletar otros campos

    const suministroCompleto = existingSuministros.find(s => s[campo] === valor);
    
    setSuministros(prev => prev.map(item => {
      if (item.id_temp === suministroId) {
        const updated = { ...item, [campo]: valor };
        
        // Si encontramos un suministro completo, autocompletar campos relacionados
        if (suministroCompleto) {
          if (campo === 'nombre') {
            updated.codigo_producto = suministroCompleto.codigo_producto || item.codigo_producto;
            updated.id_categoria_suministro = suministroCompleto.id_categoria_suministro || getCategoriaIdFromName(suministroCompleto.tipo_suministro) || item.id_categoria_suministro;
            updated.unidad_medida = normalizeUnidadMedida(suministroCompleto.unidad_medida) || item.unidad_medida;
            updated.precio_unitario = suministroCompleto.precio_unitario || item.precio_unitario;
          } else if (campo === 'codigo_producto') {
            updated.nombre = suministroCompleto.nombre || item.nombre;
            updated.id_categoria_suministro = suministroCompleto.id_categoria_suministro || getCategoriaIdFromName(suministroCompleto.tipo_suministro) || item.id_categoria_suministro;
            updated.unidad_medida = normalizeUnidadMedida(suministroCompleto.unidad_medida) || item.unidad_medida;
            updated.precio_unitario = suministroCompleto.precio_unitario || item.precio_unitario;
          }
        }
        
        return updated;
      }
      return item;
    }));

    // Ocultar sugerencias
    if (campo === 'nombre') {
      setShowNameSuggestions(prev => ({ ...prev, [suministroId]: false }));
    } else if (campo === 'codigo_producto') {
      setShowCodeSuggestions(prev => ({ ...prev, [suministroId]: false }));
    }
  }, [existingSuministros, normalizeCategoria, normalizeUnidadMedida]);

  // Función optimizada para limpiar todas las sugerencias
  const clearAllSuggestions = useCallback(() => {
    setNameSuggestions({});
    setShowNameSuggestions({});
    setCodeSuggestions({});
    setShowCodeSuggestions({});
    setDuplicatesSuggestions([]);
    setShowDuplicatesWarning(false);
  }, []);

  // =================== FUNCIONES OPTIMIZADAS PARA MANEJAR SUMINISTROS ===================

  // Template para nuevo suministro (memoizado para evitar recreación)
  const nuevoSuministroTemplate = useMemo(() => ({
    id_categoria_suministro: null, // Sin categoría por defecto
    nombre: '',
    codigo_producto: '',
    descripcion_detallada: '',
    cantidad: '',
    unidad_medida: 'pz',
    precio_unitario: '',
    estado: 'Entregado',
    fecha_necesaria: getLocalDateString(),
    observaciones: '',
    m3_perdidos: '',
    m3_entregados: '',
    m3_por_entregar: ''
  }), []);

  // Función optimizada para agregar suministro
  const agregarSuministro = useCallback(() => {
    const nuevoSuministro = {
      ...nuevoSuministroTemplate,
      id_temp: Date.now() + Math.random(),
      fecha_necesaria: getLocalDateString() // Fecha actual local
    };
    
    if (process.env.NODE_ENV === 'development' && globalThis.debugForms) {
    }
    setSuministros(prev => [...prev, nuevoSuministro]);
    
    // Inicializar precio formateado para el nuevo suministro
    setFormattedPrices(prev => ({
      ...prev,
      [nuevoSuministro.id_temp]: ''
    }));
  }, [nuevoSuministroTemplate]);

  // Función optimizada para eliminar suministro
  const eliminarSuministro = useCallback((id) => {
    setSuministros(prev => {
      const suministroAEliminar = prev.find(s => s.id_temp === id);
      
      // Si el suministro tiene id_suministro (viene de BD), lo añadimos a la lista de eliminados
      if (suministroAEliminar?.id_suministro) {
        setSuministrosEliminados(prevEliminados => [...prevEliminados, suministroAEliminar.id_suministro]);
      }
      
      return prev.filter(s => s.id_temp !== id);
    });
    
    // Limpiar precio formateado
    setFormattedPrices(prev => {
      const newPrices = { ...prev };
      delete newPrices[id];
      return newPrices;
    });
  }, []);

  // Función optimizada para duplicar suministro
  const duplicarSuministro = useCallback((index) => {
    setSuministros(prev => {
      const suministroOriginal = prev[index];
      if (!suministroOriginal) return prev;
      
      const suministroDuplicado = {
        ...suministroOriginal,
        id_temp: Date.now() + Math.random(),
        nombre: `${suministroOriginal.nombre} (Copia)`,
        // Conservar TODOS los campos del original, incluyendo precio y cantidad
        // cantidad: suministroOriginal.cantidad, // Ya incluido en ...suministroOriginal
        // precio_unitario: suministroOriginal.precio_unitario, // Ya incluido en ...suministroOriginal
        id_suministro: undefined // Remover ID para que sea tratado como nuevo
      };
      
      // Inicializar precio formateado para el suministro duplicado
      setFormattedPrices(prev => ({
        ...prev,
        [suministroDuplicado.id_temp]: formatNumberWithCommas(suministroOriginal.precio_unitario || '')
      }));
      
      return [...prev, suministroDuplicado];
    });
  }, []);

  // Función especializada para manejar cambios en precio con formato visual
  const handlePriceChange = useCallback((id, value) => {
    // Eliminar caracteres no numéricos excepto punto decimal
    const cleanValue = parseFormattedNumber(value);
    
    // Actualizar el valor real del suministro (sin formato)
    actualizarSuministro(id, 'precio_unitario', cleanValue);
    
    // Actualizar el valor formateado para mostrar
    setFormattedPrices(prev => ({
      ...prev,
      [id]: formatNumberWithCommas(cleanValue)
    }));
  }, []);

  // Función optimizada para actualizar suministros con debounce en autocompletado
  const actualizarSuministro = useCallback((id, field, value) => {
    console.log(`🔄 actualizarSuministro: ${id}, ${field}:`, value);
    
    // Normalizar ciertos campos antes de guardarlos
    let normalizedValue = value;
    if (field === 'unidad_medida') {
      normalizedValue = normalizeUnidadMedida(value);
      
      // Verificar que la unidad normalizada existe
      if (!UNIDADES_MEDIDA[normalizedValue]) {
        console.warn(`⚠️ Unidad normalizada "${normalizedValue}" no existe en UNIDADES_MEDIDA`);
        normalizedValue = 'pz'; // Fallback
      }
    } else if (field === 'id_categoria_suministro') {
      // Solo normalizar si el valor no es null/undefined
      if (value !== null && value !== undefined) {
        normalizedValue = normalizeCategoria(value);
      } else {
        normalizedValue = null; // Mantener null explícitamente
      }
      console.log(`📂 Categoría normalizada: ${value} -> ${normalizedValue}`);
    }
    
    console.log(`💾 Guardando en estado: ${field} = ${normalizedValue}`);
    
    // Actualizar estado de manera optimizada
    setSuministros(prev => {
      // Verificar si realmente hay cambio para evitar re-renders innecesarios
      const currentItem = prev.find(s => s.id_temp === id);
      if (currentItem && currentItem[field] === normalizedValue) {
        return prev; // Sin cambios, retornar el mismo array
      }
      
      return prev.map(s => 
        s.id_temp === id ? { ...s, [field]: normalizedValue } : s
      );
    });

    // Activar autocompletado para nombres y códigos (con debounce implícito)
    if (field === 'nombre' && value.length >= 2) {
      searchNameSuggestions(value, id);
    } else if (field === 'codigo_producto' && value.length >= 2) {
      searchCodeSuggestions(value, id);
    }
  }, [normalizeUnidadMedida, normalizeCategoria, searchNameSuggestions, searchCodeSuggestions]);

  // Función mejorada para manejar cambios en el folio del proveedor
  const handleFolioChange = (value) => {
    setReciboInfo(prev => ({ ...prev, folio: value }));
    
    // Buscar duplicados cuando cambia el folio
    if (value && value.trim() !== '') {
      // Obtener todos los IDs de suministros que se están editando para excluirlos de la validación
      const editingIds = [];
      
      // Agregar IDs de initialData si existe
      if (initialData?.suministros && Array.isArray(initialData.suministros)) {
        editingIds.push(...initialData.suministros.map(s => s.id_suministro).filter(id => id));
      } else if (initialData?.id_suministro) {
        editingIds.push(initialData.id_suministro);
      }
      
      // Agregar IDs de suministros actuales que tienen id_suministro
      
      editingIds.push(...suministros.map(s => s.id_suministro).filter(id => id));
      
      if (process.env.NODE_ENV === 'development' && globalThis.debugForms) {
      }      // Usar el primer ID como excludeId para mantener compatibilidad con searchExistingRecords
      const excludeId = editingIds.length > 0 ? editingIds[0] : null;
      
      searchExistingRecords(value, excludeId);
    } else {
      setDuplicatesSuggestions([]);
      setShowDuplicatesWarning(false);
    }
  };

  // Validación optimizada del formulario
  const validarFormulario = useCallback(() => {
    const newErrors = {};
    
    // Validar información del recibo
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
      setErrors(newErrors);
      return false;
    }
    
    // Validar cada suministro con early return para mejor performance
    let hasErrors = false;
    for (let index = 0; index < suministros.length; index++) {
      const suministro = suministros[index];
      
      if (!suministro.nombre?.trim()) {
        newErrors[`suministro_${index}_nombre`] = 'El nombre es obligatorio';
        hasErrors = true;
      }
      
      const cantidad = parseFloat(suministro.cantidad);
      if (!suministro.cantidad || isNaN(cantidad) || cantidad <= 0) {
        newErrors[`suministro_${index}_cantidad`] = 'La cantidad debe ser mayor a 0';
        hasErrors = true;
      }
      
      const precio = parseFloat(suministro.precio_unitario);
      if (!suministro.precio_unitario || isNaN(precio) || precio <= 0) {
        newErrors[`suministro_${index}_precio`] = 'El precio debe ser mayor a 0';
        hasErrors = true;
      }
    }
    
    setErrors(newErrors);
    return !hasErrors && Object.keys(newErrors).length === 0;
  }, [reciboInfo, suministros]);

  // Función para proceder con el envío después de confirmar duplicados
  const proceedWithSubmit = useCallback(async () => {
    // NO permitir continuar - solo cerrar el modal y mostrar mensaje
    setShowDuplicatesWarning(false);
    setDuplicatesWarningData([]);
    
    // Mostrar mensaje toast de error
    showError(
      `❌ No se puede crear el suministro: El folio "${reciboInfo.folio}" ya existe para este proveedor. Por favor, verifique el folio o la información del proveedor.`
    );
  }, [reciboInfo.folio, showError]);

  // Función para cancelar el envío cuando hay duplicados
  const cancelSubmit = useCallback(() => {
    setShowDuplicatesWarning(false);
    setDuplicatesWarningData([]);
  }, []);

  // Manejo del envío (con validación de duplicados)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    // Validar duplicados por folio de proveedor (solo dentro del mismo registro)
    if (reciboInfo.folio && suministros.length > 1) {
      // Solo validamos duplicados si hay múltiples suministros en el mismo registro
      const duplicates = checkForDuplicates(reciboInfo.folio);
      if (duplicates.length > 0) {
        const confirmar = window.confirm(
          `Está registrando ${suministros.length} suministros con el mismo folio "${reciboInfo.folio}". ¿Desea continuar de todas formas?`
        );
        if (!confirmar) {
          return;
        }
      }
    }

    // NUEVA VALIDACIÓN: Verificar duplicados con registros existentes en la base de datos
    if (reciboInfo.folio && reciboInfo.folio.trim() !== '') {
      if (process.env.NODE_ENV === 'development' && globalThis.debugForms) {
      }
      
      // Obtener todos los IDs de suministros que se están editando
      const editingIds = [];
      
      // Agregar IDs de initialData si existe
      if (initialData?.suministros && Array.isArray(initialData.suministros)) {
        editingIds.push(...initialData.suministros.map(s => s.id_suministro).filter(id => id));
      } else if (initialData?.id_suministro) {
        editingIds.push(initialData.id_suministro);
      }
      
      // Agregar IDs de suministros actuales que tienen id_suministro
      editingIds.push(...suministros.map(s => s.id_suministro).filter(id => id));
      
      if (process.env.NODE_ENV === 'development' && globalThis.debugForms) {
      }
      
      // Verificar duplicados del MISMO proveedor (esto SÍ debe bloquearse)
      const duplicadosMismoProveedor = existingSuministros.filter(suministro => {
        // Excluir suministros que estamos editando
        if (editingIds.includes(suministro.id_suministro)) {
          return false;
        }

        // Verificar folio exacto Y mismo proveedor
        const mismoFolio = suministro.folio && 
                          suministro.folio.toLowerCase().trim() === reciboInfo.folio.toLowerCase().trim();
        
        const mismoProveedor = suministro.id_proveedor && 
                              reciboInfo.proveedor_info?.id_proveedor &&
                              suministro.id_proveedor === reciboInfo.proveedor_info.id_proveedor;

        return mismoFolio && mismoProveedor;
      });

      if (duplicadosMismoProveedor.length > 0) {
        if (process.env.NODE_ENV === 'development') {
        }
        
        // BLOQUEAR: Mostrar mensaje de error específico para duplicados del mismo proveedor
        setDuplicatesWarningData(duplicadosMismoProveedor);
        setShowDuplicatesWarning(true);
        return;
      }
    }
    
    // Si no hay duplicados, proceder con el envío
    await submitFormData();
  };

  // Función principal para envío de datos (sin validación de duplicados)
  const submitFormData = async () => {
    setLoading(true);
    
    try {
      const payload = {
        info_recibo: {
          proveedor: reciboInfo.proveedor_info?.nombre || '',
          id_proveedor: reciboInfo.proveedor_info?.id_proveedor || null,
          folio: reciboInfo.folio,
          fecha: reciboInfo.fecha,
          id_proyecto: parseInt(reciboInfo.id_proyecto),
          metodo_pago: reciboInfo.metodo_pago || 'Efectivo',
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
          id_categoria_suministro: s.id_categoria_suministro,
          nombre: s.nombre,
          codigo_producto: s.codigo_producto,
          descripcion_detallada: s.descripcion_detallada,
          cantidad: parseFloat(s.cantidad),
          unidad_medida: s.unidad_medida,
          precio_unitario: parseFloat(s.precio_unitario),
          estado: s.estado,
          fecha_necesaria: s.fecha_necesaria || reciboInfo.fecha, // ✅ Usar fecha individual o del recibo
          observaciones: s.observaciones,
          m3_perdidos: parseFloat(s.m3_perdidos) || 0,
          m3_entregados: parseFloat(s.m3_entregados) || 0,
          m3_por_entregar: parseFloat(s.m3_por_entregar) || 0
        })),
        suministros_eliminados: suministrosEliminados, // IDs de suministros a eliminar
        include_iva: includeIVA, // Información sobre si incluir IVA
        es_individual: suministros.length === 1, // Determinar automáticamente si es individual o múltiple
        totales: { // Totales calculados para guardar en el recibo
          subtotal: parseFloat(totales.subtotal),
          iva: parseFloat(totales.iva),
          total: parseFloat(totales.total),
          cantidad_items: totales.cantidad_items
        }
      };

      // Enviar al servidor
      await onSubmit(payload);
      
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejo del modal de proveedores
  const handleOpenProveedorModal = (query = '', tipoSugerido = 'SERVICIOS') => {
    setProveedorModalData({
      id: null,
      nombre: query,
      direccion: '',
      telefono: '',
      cuentaBancaria: '',
      banco: '',
      tipoProveedor: tipoSugerido
    });
    setShowProveedorModal(true);
  };

  const handleCloseProveedorModal = () => {
    setShowProveedorModal(false);
    setProveedorModalData(null);
  };

  const handleProveedorSaved = async (proveedorData) => {
    try {
      console.log('📤 [FormularioSuministros] Creando proveedor:', proveedorData);
      
      // Llamar a la API para crear el proveedor
      const response = await api.createProveedor(proveedorData);
      
      if (response.success) {
        const nuevoProveedor = response.data;
        console.log('✅ [FormularioSuministros] Proveedor creado:', nuevoProveedor);
        
        // Cerrar modal
        setShowProveedorModal(false);
        
        // Mostrar notificación de éxito
        showSuccess('Proveedor creado exitosamente');
        
        // Actualizar el proveedor seleccionado en el formulario
        setReciboInfo(prev => ({
          ...prev,
          proveedor_info: nuevoProveedor
        }));
      } else {
        throw new Error(response.message || 'Error al crear el proveedor');
      }
    } catch (error) {
      console.error('❌ [FormularioSuministros] Error al crear proveedor:', error);
      showError('Error al crear el proveedor: ' + (error.message || 'Error desconocido'));
    }
  };

  return (
    <div className="bg-white dark:bg-dark-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          Registro de Suministros
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
            suministros.length === 1 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
          }`}>
            {suministros.length === 1 ? 'Individual' : `Múltiple (${suministros.length})`}
          </span>
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
              showCreateModal={true}
              onProveedorCreated={handleOpenProveedorModal}
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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Folio del Proveedor
            </label>
            <input
              type="text"
              value={reciboInfo.folio}
              onChange={(e) => handleFolioChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                showDuplicatesWarning 
                  ? 'border-orange-500 dark:border-orange-500 focus:ring-orange-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
              }`}
              placeholder="Ej: 37946"
            />
            
            {/* Advertencia de duplicados */}
            {showDuplicatesWarning && duplicatesSuggestions.length > 0 && (
              <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-orange-800 dark:text-orange-300">
                      Posible duplicado detectado
                    </h3>
                    <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                      Ya existe(n) {duplicatesSuggestions.length} suministro(s) con el folio "{reciboInfo.folio}".
                    </p>
                    {duplicatesSuggestions.slice(0, 3).map((dup, idx) => (
                      <div key={idx} className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                        • {dup.nombre} - {dup.proveedor?.nombre || dup.proveedor || 'Sin proveedor'} ({new Date(dup.fecha).toLocaleDateString()})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha
            </label>
            <DateInput
              value={reciboInfo.fecha}
              onChange={(value) => {
                if (process.env.NODE_ENV === 'development' && globalThis.debugForms) {
                }
                setReciboInfo(prev => ({
                  ...prev, 
                  fecha: value
                }));
              }}
              className="w-full min-w-[120px]"
              placeholder="Seleccionar fecha"
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
                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={suministro.nombre}
                      onChange={(e) => actualizarSuministro(suministro.id_temp, 'nombre', e.target.value)}
                      onFocus={() => {
                        if (suministro.nombre.length >= 2) {
                          searchNameSuggestions(suministro.nombre, suministro.id_temp);
                        }
                      }}
                      onBlur={() => {
                        // Delay para permitir clicks en sugerencias
                        setTimeout(() => {
                          setShowNameSuggestions(prev => ({ ...prev, [suministro.id_temp]: false }));
                        }, 200);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Nombre del suministro"
                    />
                    
                    {/* Sugerencias de nombres */}
                    {showNameSuggestions[suministro.id_temp] && nameSuggestions[suministro.id_temp]?.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {nameSuggestions[suministro.id_temp].map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            onClick={() => applySuggestion(suministro.id_temp, 'nombre', suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {errors[`suministro_${index}_nombre`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`suministro_${index}_nombre`]}</p>
                    )}
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoría
                    </label>
                    <CategoriaAutocomplete
                      value={suministro.id_categoria_suministro}
                      onChange={(value) => {
                        console.log(`🎯 CategoriaAutocomplete onChange: ${value} para suministro ${suministro.id_temp}`);
                        console.log(`🎯 Tipo de valor recibido:`, typeof value, value);
                        
                        // Actualizar inmediatamente usando el callback de estado para evitar problemas de timing
                        setSuministros(prev => {
                          const updated = prev.map(s => 
                            s.id_temp === suministro.id_temp 
                              ? { ...s, id_categoria_suministro: value }
                              : s
                          );
                          const updatedItem = updated.find(s => s.id_temp === suministro.id_temp);
                          console.log(`💾 Estado actualizado para suministro ${suministro.id_temp}:`, 
                            updatedItem?.id_categoria_suministro);
                          return updated;
                        });
                      }}
                      placeholder="Buscar o crear categoría..."
                      onCreateNew={(newCategoria) => {
                        console.log('🆕 Nueva categoría creada en formulario:', newCategoria);
                        // Asegurar que se asigne la nueva categoría inmediatamente
                        if (newCategoria && newCategoria.id_categoria) {
                          setSuministros(prev => prev.map(s => 
                            s.id_temp === suministro.id_temp 
                              ? { ...s, id_categoria_suministro: newCategoria.id_categoria }
                              : s
                          ));
                        }
                      }}
                    />
                  </div>

                  {/* Código */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código
                    </label>
                    <input
                      type="text"
                      value={suministro.codigo_producto}
                      onChange={(e) => actualizarSuministro(suministro.id_temp, 'codigo_producto', e.target.value)}
                      onFocus={() => {
                        if (suministro.codigo_producto.length >= 2) {
                          searchCodeSuggestions(suministro.codigo_producto, suministro.id_temp);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowCodeSuggestions(prev => ({ ...prev, [suministro.id_temp]: false }));
                        }, 200);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Código"
                    />
                    
                    {/* Sugerencias de códigos */}
                    {showCodeSuggestions[suministro.id_temp] && codeSuggestions[suministro.id_temp]?.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-32 overflow-y-auto">
                        {codeSuggestions[suministro.id_temp].map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            onClick={() => applySuggestion(suministro.id_temp, 'codigo_producto', suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Segunda fila - Cantidades y precios */}
                <div className={`grid grid-cols-2 gap-3 mb-3 ${initialData ? 'md:grid-cols-5' : 'md:grid-cols-5'}`}>
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
                      value={(() => {
                        const currentValue = suministro.unidad_medida;
                        const isValid = UNIDADES_MEDIDA[currentValue];
                        
                        // Solo log en desarrollo y con debugging habilitado, y evitar spam
                        if (process.env.NODE_ENV === 'development' && globalThis.debugForms && !isValid) {
                        }
                        
                        return isValid ? currentValue : 'pz';
                      })()}
                      onChange={(e) => actualizarSuministro(suministro.id_temp, 'unidad_medida', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {Object.entries(UNIDADES_MEDIDA).map(([key, value]) => (
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
                      type="text"
                      value={formattedPrices[suministro.id_temp] || ''}
                      onChange={(e) => handlePriceChange(suministro.id_temp, e.target.value)}
                      onBlur={(e) => {
                        // Al perder el foco, formatear el valor
                        const cleanValue = parseFormattedNumber(e.target.value);
                        if (cleanValue) {
                          setFormattedPrices(prev => ({
                            ...prev,
                            [suministro.id_temp]: formatNumberWithCommas(cleanValue)
                          }));
                        }
                      }}
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
                      ${formatNumberWithCommas(((parseFloat(suministro.cantidad) || 0) * (parseFloat(suministro.precio_unitario) || 0)).toFixed(2))}
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
                <span className="font-semibold text-gray-900 dark:text-white">${formatNumberWithCommas(totales.subtotal)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">IVA:</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">${formatNumberWithCommas(totales.iva)}</span>
              </div>
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-lg">
                <span className="text-green-600 dark:text-green-300 font-medium">Total:</span>
                <span className="font-bold text-green-700 dark:text-green-400 text-lg">${formatNumberWithCommas(totales.total)}</span>
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
                {suministros.length === 1 ? 'Guardar Suministro' : `Guardar ${suministros.length} Suministros`}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de Confirmación de Duplicados */}
      {showDuplicatesWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
                  🚫 FOLIO DUPLICADO - NO PERMITIDO
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    ❌ <strong>ERROR:</strong> El folio "<strong>{reciboInfo.folio}</strong>" ya existe para este mismo proveedor:
                  </p>
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    {duplicatesWarningData.slice(0, 5).map((dup, idx) => (
                      <div key={idx} className="mt-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        • <strong>{dup.nombre}</strong><br />
                        &nbsp;&nbsp;Proveedor: {dup.proveedor?.nombre || dup.proveedor || 'Sin proveedor'}<br />
                        &nbsp;&nbsp;Fecha: {dup.fecha ? new Date(dup.fecha).toLocaleDateString('es-MX') : 'Sin fecha'}
                      </div>
                    ))}
                    {duplicatesWarningData.length > 5 && (
                      <div className="mt-2 text-xs text-red-500 dark:text-red-400">
                        ... y {duplicatesWarningData.length - 5} más
                      </div>
                    )}
                  </div>
                  <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                      ⚠️ <strong>Acción requerida:</strong>
                    </p>
                    <ul className="mt-1 text-xs text-red-700 dark:text-red-400 list-disc list-inside">
                      <li>Verifique que el folio sea correcto</li>
                      <li>Confirme que está seleccionando el proveedor correcto</li>
                      <li>Use un folio diferente si es un nuevo suministro</li>
                    </ul>
                  </div>
                  <p className="mt-3 text-sm text-red-700 dark:text-red-400 font-medium">
                    📝 <strong>Nota:</strong> Puede usar el mismo folio solo si es de un proveedor diferente.
                  </p>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={proceedWithSubmit}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    🔍 Entendido, revisar información
                  </button>
                  <button
                    type="button"
                    onClick={cancelSubmit}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ✖️ Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Proveedores */}
      {showProveedorModal && (
        <ProveedorModal
          isOpen={showProveedorModal}
          onClose={handleCloseProveedorModal}
          onSave={handleProveedorSaved}
          proveedor={proveedorModalData}
        />
      )}
    </div>
  );
}