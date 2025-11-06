import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';

// Función para obtener movimientos desde el backend
async function fetchMovimientos(params) {
  const { drStart, drEnd, proyectoId, tipo, fuente } = params || {};
  
  try {
    // Construir query params
    const queryParams = {};
    if (drStart) queryParams.drStart = drStart;
    if (drEnd) queryParams.drEnd = drEnd;
    if (proyectoId) queryParams.proyectoId = proyectoId;
    if (tipo) queryParams.tipo = tipo;
    if (fuente) queryParams.fuente = fuente;

    // Llamar al endpoint de movimientos
    const response = await api.get('/movimientos-ingresos', { params: queryParams });
    
    const movimientos = response.data?.data || [];
    const resumenData = response.data?.resumen || {
      montoInicial: 0,
      totalIngresos: 0,
      totalGastos: 0,
      totalAjustes: 0
    };

    return { rows: movimientos, resumen: resumenData };
  } catch (error) {
    console.error('Error fetching movimientos:', error);
    // Retornar datos vacíos en caso de error
    return { 
      rows: [], 
      resumen: { montoInicial: 0, totalIngresos: 0, totalGastos: 0, totalAjustes: 0 } 
    };
  }
}

export default function useIngresosMovimientosData(initialFilters) {
  const [filters, setFilters] = useState(initialFilters || {});
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { rows, resumen } = await fetchMovimientos(filters);
      setData(rows);
      setResumen(resumen);
    } catch (e) {
      setError(e.message || 'Error cargando movimientos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return { filters, setFilters, data, resumen, loading, error, reload: load };
}
