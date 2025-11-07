import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';

// Función para obtener movimientos desde el backend
async function fetchMovimientos(params) {
  const { drStart, drEnd, proyectoId, tipo, fuente } = params || {};
  
  try {
    console.log('🌐 [fetchMovimientos] Llamando API con params:', { drStart, drEnd, proyectoId, tipo, fuente });
    
    // Construir query params
    const queryParams = {};
    if (drStart) queryParams.drStart = drStart;
    if (drEnd) queryParams.drEnd = drEnd;
    if (proyectoId) queryParams.proyectoId = proyectoId;
    if (tipo) queryParams.tipo = tipo;
    if (fuente) queryParams.fuente = fuente;

    // Llamar al endpoint de movimientos
    const response = await api.get('/movimientos-ingresos', { params: queryParams });
    
    console.log('📡 [fetchMovimientos] Respuesta recibida:', response);
    
    // La respuesta del backend es { success: true, data: [...], resumen: {...}, capitalPorProyecto: [...] }
    // El api.get ya devuelve el objeto parseado, no necesitamos .data adicional
    const movimientos = response.data || [];
    const resumenData = response.resumen || {
      montoInicial: 0,
      totalIngresos: 0,
      totalGastos: 0,
      totalAjustes: 0,
      saldoActual: 0
    };
    const capitalPorProyecto = response.capitalPorProyecto || [];

    console.log('✨ [fetchMovimientos] Datos extraídos:', {
      movimientos: movimientos.length,
      resumen: resumenData,
      capitalPorProyecto: capitalPorProyecto.length
    });

    return { rows: movimientos, resumen: resumenData, capitalPorProyecto };
  } catch (error) {
    console.error('❌ [fetchMovimientos] Error:', error);
    // Retornar datos vacíos en caso de error
    return { 
      rows: [],
      resumen: { montoInicial: 0, totalIngresos: 0, totalGastos: 0, totalAjustes: 0, saldoActual: 0 },
      capitalPorProyecto: []
    };
  }
}

export default function useIngresosMovimientosData(initialFilters) {
  const [filters, setFilters] = useState(initialFilters || {});
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState({ montoInicial: 0, totalIngresos: 0, totalGastos: 0, totalAjustes: 0, saldoActual: 0 });
  const [capitalPorProyecto, setCapitalPorProyecto] = useState([]);
  const [globalResumen, setGlobalResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadGlobalResumen = useCallback(async () => {
    try {
      const response = await api.get('/movimientos-ingresos/resumen/global');
      setGlobalResumen(response.data?.data || null);
    } catch (err) {
      console.error('Error fetching resumen global:', err);
      setGlobalResumen(null);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      console.log('🔍 [useIngresosMovimientosData] Cargando movimientos con filtros:', filters);
      const { rows, resumen, capitalPorProyecto } = await fetchMovimientos(filters);
      console.log('✅ [useIngresosMovimientosData] Movimientos recibidos:', {
        cantidad: rows?.length,
        resumen,
        capitalPorProyecto: capitalPorProyecto?.length
      });
      setData(rows);
      setResumen(resumen);
      setCapitalPorProyecto(capitalPorProyecto);
      await loadGlobalResumen();
    } catch (e) {
      console.error('❌ [useIngresosMovimientosData] Error:', e);
      setError(e.message || 'Error cargando movimientos');
    } finally {
      setLoading(false);
    }
  }, [filters, loadGlobalResumen]);

  useEffect(() => { load(); }, [load]);

  return { filters, setFilters, data, resumen, capitalPorProyecto, globalResumen, loading, error, reload: load };
}
