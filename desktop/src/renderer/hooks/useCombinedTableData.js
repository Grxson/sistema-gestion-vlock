import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { semanaDelMesDesdeISO } from '../utils/weekCalculator';

/**
 * Hook para combinar datos de suministros con datos de nóminas
 * Formatea las nóminas como filas adicionales en la tabla de suministros
 */
const useCombinedTableData = (suministros = [], filters = {}) => {
  const [nominaRows, setNominaRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtiene la fecha base de una nómina para determinar el periodo
   */
  const getFechaBaseNomina = (nomina) => {
    const base = nomina?.semana?.fecha_inicio || nomina?.fecha_pago || nomina?.fecha || nomina?.createdAt;
    const d = base ? new Date(base) : null;
    return d && !isNaN(d) ? d : null;
  };

  /**
   * Formatea una nómina agrupada por semana como una fila de tabla
   */
  const formatNominaAsRow = (nominaData, semana, proyecto) => {
    console.log('🎨 Formateando fila de nómina:', {
      total: nominaData.total,
      cantidad_empleados: nominaData.cantidad_empleados,
      nominas_en_array: nominaData.nominas?.length,
      semana_id: semana.id_semana,
      proyecto_id: proyecto?.id_proyecto,
      proyecto_nombre: proyecto?.nombre // Corregido: usar .nombre
    });
    
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Obtener información de la semana
    const fechaInicio = new Date(semana.fecha_inicio);
    const mes = meses[fechaInicio.getMonth()];
    const anio = semana.anio;
    
    // Calcular número de semana del mes (1-5) usando la misma lógica que en Nomina.jsx
    const periodo = `${anio}-${String(fechaInicio.getMonth() + 1).padStart(2, '0')}`;
    const numeroSemana = semanaDelMesDesdeISO(periodo, semana.anio, semana.semana_iso);
    
    // Generar folio específico para nómina: NOM-AAAA-MM-SX (ej: NOM-2025-11-S3)
    const folio = `NOM-${anio}-${String(fechaInicio.getMonth() + 1).padStart(2, '0')}-S${numeroSemana}`;

    console.log('🔄 formatNominaAsRow - Entrada:', {
      nominaData_total: nominaData.total,
      cantidad_empleados: nominaData.cantidad_empleados,
      nominas_en_grupo: nominaData.nominas?.length
    });

    const resultado = {
      // Identificadores únicos
      id_suministro: `nomina-${semana.id_semana}-${proyecto?.id_proyecto || 'sin-proyecto'}`,
      isNominaRow: true, // Flag para identificar que es una fila de nómina
      
      // Información de la nómina - Formato más conciso
      nombre: `Nómina Semana ${numeroSemana} de ${mes} del ${anio}`,
      codigo: folio,
      descripcion: `Pago de nómina correspondiente a la semana ${numeroSemana} de ${mes} del ${anio}`,
      
      // Datos financieros
      precio_unitario: nominaData.total,
      cantidad: 1,
      costo_total: nominaData.total,
      subtotal: nominaData.total,
      total_con_iva: nominaData.total,
      
      // Información de categoría y tipo
      categoria: 'Nómina',
      tipo_categoria: 'Mano de Obra',
      
      // Información del proyecto - Corregido: usar proyecto.nombre en lugar de nombre_proyecto
      id_proyecto: proyecto?.id_proyecto || null,
      nombre_proyecto: proyecto?.nombre || 'Sin proyecto asignado',
      
      // Información de la semana
      id_semana: semana.id_semana,
      fecha: semana.fecha_inicio,
      fecha_registro: semana.fecha_inicio,
      fecha_inicio: semana.fecha_inicio,
      fecha_fin: semana.fecha_fin,
      semana_iso: semana.semana_iso,
      anio: semana.anio,
      
      // Proveedor (empleados)
      proveedor: 'Empleados',
      id_proveedor: null,
      
      // Estado
      estado: semana.estado || 'Pagado',
      
      // Información adicional
      unidad_medida: 'Semana',
      folio: folio,
      metodo_pago: 'Transferencia',
      
      // Datos de nómina específicos
      cantidad_empleados: nominaData.cantidad_empleados || 0,
      nominas_detalle: nominaData.nominas || []
    };

    console.log('🔄 formatNominaAsRow - Salida:', {
      costo_total: resultado.costo_total,
      precio_unitario: resultado.precio_unitario,
      cantidad_empleados: resultado.cantidad_empleados
    });

    return resultado;
  };

  /**
   * Obtiene y procesa las nóminas agrupadas por semana y proyecto
   */
  const fetchNominasGrouped = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir filtros para la API de nóminas
      const nominaFilters = {};
      
      // Aplicar filtro de proyecto si existe
      if (filters.proyecto) {
        nominaFilters.proyecto_id = filters.proyecto;
      }

      // Aplicar filtro de fecha si existe
      if (filters.fechaInicio) {
        nominaFilters.fecha_desde = filters.fechaInicio;
      }
      if (filters.fechaFin) {
        nominaFilters.fecha_hasta = filters.fechaFin;
      }

      // Solo incluir nóminas en estado "Pagado"
      nominaFilters.estado = 'Pagado';

      // Obtener todas las nóminas con los filtros aplicados
      const response = await api.getNominas({ noCache: true });
      
      // La respuesta viene con formato: { message: '...', nominas: [...] }
      if (!response.nominas) {
        console.error('❌ Error en respuesta de getNominas:', response);
        throw new Error(response.message || 'Error al obtener nóminas');
      }

      const nominas = response.nominas || [];
      
      console.log('📊 Total nóminas recibidas del backend:', nominas.length);
      console.log('📊 Nóminas recibidas:', nominas);
      
      // Log de cada nómina individualmente
      nominas.forEach((n, i) => {
        console.log(`📋 Nómina ${i + 1}:`, {
          id_nomina: n.id_nomina,
          id_empleado: n.id_empleado,
          id_semana: n.id_semana,
          id_proyecto: n.id_proyecto,
          monto_total: n.monto_total,
          estado: n.estado,
          tiene_proyecto_obj: !!n.proyecto,
          proyecto_nombre: n.proyecto?.nombre_proyecto
        });
      });

      // Filtrar nóminas según los filtros activos
      let nominasFiltradas = nominas.filter(nomina => nomina.estado === 'Pagado');
      
      console.log('📊 Nóminas filtradas (Pagado):', nominasFiltradas.length);

      if (nominaFilters.proyecto_id) {
        nominasFiltradas = nominasFiltradas.filter(
          nomina => nomina.id_proyecto === parseInt(nominaFilters.proyecto_id)
        );
      }

      if (nominaFilters.fecha_desde) {
        const fechaDesde = new Date(nominaFilters.fecha_desde);
        nominasFiltradas = nominasFiltradas.filter(nomina => {
          const fechaNomina = nomina.semana?.fecha_inicio 
            ? new Date(nomina.semana.fecha_inicio) 
            : null;
          return fechaNomina && fechaNomina >= fechaDesde;
        });
      }

      if (nominaFilters.fecha_hasta) {
        const fechaHasta = new Date(nominaFilters.fecha_hasta);
        fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
        nominasFiltradas = nominasFiltradas.filter(nomina => {
          const fechaNomina = nomina.semana?.fecha_fin 
            ? new Date(nomina.semana.fecha_fin) 
            : null;
          return fechaNomina && fechaNomina <= fechaHasta;
        });
      }

      // Agrupar nóminas por semana y proyecto
      const nominasAgrupadas = nominasFiltradas.reduce((acc, nomina) => {
        // Skip nominas without week information
        if (!nomina.semana || !nomina.id_semana) {
          console.warn('Nómina sin información de semana:', nomina);
          return acc;
        }

        const semanaId = nomina.id_semana;
        const proyectoId = nomina.id_proyecto || 'sin-proyecto';
        const key = `${semanaId}-${proyectoId}`;

        if (!acc[key]) {
          acc[key] = {
            semana: nomina.semana,
            proyecto: nomina.proyecto || null,
            nominas: [],
            total: 0,
            cantidad_empleados: 0
          };
        }

        acc[key].nominas.push(nomina);
        
        // Usar la misma lógica que en Nomina.jsx para calcular el monto
        const monto = parseFloat(nomina.monto_total || nomina.monto || 0);
        console.log(`💰 Nómina ID ${nomina.id_nomina} (Empleado ${nomina.id_empleado}):`, {
          monto_total: nomina.monto_total,
          monto: nomina.monto,
          monto_calculado: monto,
          acumulado_antes: acc[key].total,
          acumulado_despues: acc[key].total + (isNaN(monto) ? 0 : monto)
        });
        acc[key].total += isNaN(monto) ? 0 : monto;
        acc[key].cantidad_empleados += 1;

        return acc;
      }, {});

      console.log('📊 Nóminas agrupadas por semana y proyecto:', nominasAgrupadas);
      console.log('📊 Cantidad de grupos:', Object.keys(nominasAgrupadas).length);
      
      // Log detallado de cada grupo
      Object.entries(nominasAgrupadas).forEach(([key, group]) => {
        console.log(`📊 Grupo ${key}:`, {
          total: group.total,
          cantidad_empleados: group.cantidad_empleados,
          nominas_count: group.nominas.length,
          semana: group.semana?.id_semana,
          proyecto: group.proyecto?.nombre || 'Sin proyecto',
          nominas_detalle: group.nominas.map(n => ({
            id: n.id_nomina,
            empleado: n.id_empleado,
            monto_individual: n.monto_total || n.monto
          }))
        });
      });

      // Convertir las nóminas agrupadas en filas de tabla
      const rows = Object.values(nominasAgrupadas).map(group => {
        console.log('🔄 Formateando grupo:', {
          total_a_pasar: group.total,
          cantidad_empleados: group.cantidad_empleados,
          nominas_en_grupo: group.nominas.length
        });
        return formatNominaAsRow(group, group.semana, group.proyecto);
      });

      // Ordenar por fecha descendente
      rows.sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro));

      setNominaRows(rows);
    } catch (err) {
      console.error('Error al obtener nóminas:', err);
      setError(err.message);
      setNominaRows([]);
    } finally {
      setLoading(false);
    }
  }, [filters.proyecto, filters.fechaInicio, filters.fechaFin]);

  // Cargar nóminas cuando cambien los filtros
  useEffect(() => {
    fetchNominasGrouped();
  }, [fetchNominasGrouped]);

  /**
   * Combina suministros con nóminas en un solo array
   */
  const combinedData = [...suministros, ...nominaRows];

  // Helper para normalizar fechas confiables
  const normalizeDate = (value) => {
    if (!value) return null;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-');
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 0, 0, 0, 0);
    }
    if (typeof value === 'string' && value.includes('T')) {
      const [datePart] = value.split('T');
      const [y, m, d] = datePart.split('-');
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 0, 0, 0, 0);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  };

  const getItemDate = (item) => {
    const keys = [
      'fecha_entrega',
      'fecha_necesaria',
      'fecha',
      'fecha_registro',
      'fecha_inicio',
      'createdAt',
      'updatedAt'
    ];
    for (const k of keys) {
      const d = normalizeDate(item[k]);
      if (d) return d;
    }
    return new Date(0); // fallback a época
  };

  // Ordenar por fecha descendente (más reciente primero)
  combinedData.sort((a, b) => getItemDate(b) - getItemDate(a));

  return {
    combinedData,
    nominaRows,
    loading,
    error,
    refetch: fetchNominasGrouped
  };
};

export default useCombinedTableData;
