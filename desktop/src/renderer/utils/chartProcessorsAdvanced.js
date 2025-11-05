/**
 * Procesa los gastos por tipo para gráfica de pastel (Administrativo, Proyecto, Nómina)
 * Ahora respeta los filtros aplicados (fechas, proyectos, etc.)
 */
export const processGastosPorTipoDoughnut = async (data, chartFilters = {}) => {
  let administrativo = 0;
  let proyecto = 0;
  let nominaTotal = 0;

  // Suministros - clasificar por tipo
  data.forEach(suministro => {
    const tipo = (suministro.tipo_suministro || suministro.categoria?.tipo || '').toLowerCase();
    const cantidad = parseFloat(suministro.cantidad) || 0;
    const precio = parseFloat(suministro.precio_unitario) || 0;
    const gasto = cantidad * precio;
    
    if (tipo.includes('admin')) {
      administrativo += gasto;
    } else if (tipo.includes('proy')) {
      proyecto += gasto;
    } else {
      // Si no es admin ni proyecto, sumarlo a proyecto por defecto
      proyecto += gasto;
    }
  });

  // Nóminas - aplicar los mismos filtros que los suministros
  try {
    const nominasResponse = await NominaService.getAll();
    if (nominasResponse.success && nominasResponse.data) {
      const nominas = Array.isArray(nominasResponse.data) ? nominasResponse.data : nominasResponse.data.nominas || [];
      
      // Función helper para obtener fecha base de nómina
      const getFechaBaseNomina = (n) => {
        const base = n?.semana?.fecha_inicio || n?.fecha_pago || n?.fecha || n?.createdAt;
        const d = base ? new Date(base) : null;
        return d && !isNaN(d) ? d : null;
      };
      
      // Aplicar filtros a las nóminas (igual que a los suministros)
      nominas.forEach(nominaItem => {
        try {
          // Filtro por fecha
          const d = getFechaBaseNomina(nominaItem);
          if (d && chartFilters.fechaInicio && chartFilters.fechaFin) {
            const fechaInicio = new Date(chartFilters.fechaInicio);
            const fechaFin = new Date(chartFilters.fechaFin);
            fechaFin.setHours(23, 59, 59, 999);
            
            if (d < fechaInicio || d > fechaFin) {
              return; // No está en el rango de fechas
            }
          }
          
          // Filtro por proyecto
          if (chartFilters.proyectoId) {
            const proyectoNomina = nominaItem.id_proyecto?.toString() || nominaItem.proyecto?.id_proyecto?.toString();
            if (proyectoNomina !== chartFilters.proyectoId.toString()) {
              return; // No es del proyecto filtrado
            }
          }
          
          // Solo contar nóminas pagadas
          const estado = (nominaItem?.estado || '').toLowerCase();
          if (estado !== 'pagado' && estado !== 'pagada') return;
          
          // Sumar el monto (usar monto_total o monto)
          const monto = parseFloat(nominaItem.monto_total || nominaItem.monto || 0);
          if (!isNaN(monto) && monto > 0) {
            nominaTotal += monto;
          }
        } catch (error) {
          console.error('Error procesando nómina individual:', error);
        }
      });
      
      console.log('📊 Nóminas procesadas para gráfica:', {
        totalNominas: nominas.length,
        filtradas: nominaTotal > 0,
        montTotal: nominaTotal,
        filtros: chartFilters
      });
    }
  } catch (error) {
    console.error('Error al cargar nóminas para gráfica de pastel por tipo:', error);
  }

  const labels = ['Administrativo', 'Proyecto', 'Nómina'];
  const dataSet = [administrativo, proyecto, nominaTotal];
  const colors = [
    'rgba(59, 130, 246, 0.8)', // azul - Administrativo
    'rgba(16, 185, 129, 0.8)', // verde - Proyecto
    'rgba(239, 68, 68, 0.8)'   // rojo - Nómina
  ];

  return {
    labels,
    datasets: [{
      label: 'Gasto por Tipo',
      data: dataSet,
      backgroundColor: colors,
      borderColor: colors.map(c => c.replace('0.8', '1')),
      borderWidth: 2
    }],
    metrics: {
      total: dataSet.reduce((sum, val) => sum + val, 0),
      administrativo,
      proyecto,
      nomina: nominaTotal
    }
  };
};
/**
 * Funciones avanzadas de procesamiento de datos para gráficas de suministros
 * Parte 3: Análisis complejos y funciones asíncronas
 */

import { formatUnidadMedida, formatCurrency, formatNumber } from './formatters';
import { NominaService } from '../services/nominas/nominaService';

/**
 * Análisis por tipo de gasto (con integración de nóminas)
 */
export const processAnalisisPorTipoGasto = async (data) => {
  try {
    const gastosMateriales = {};
    
    data.forEach(suministro => {
      try {
        const tipo = suministro.tipo_suministro || suministro.categoria?.tipo || 'Otro';
        
        const cantidad = parseFloat(suministro.cantidad) || 0;
        const precio = parseFloat(suministro.precio_unitario) || 0;
        const gasto = cantidad * precio;
        
        if (!gastosMateriales[tipo]) {
          gastosMateriales[tipo] = 0;
        }
        gastosMateriales[tipo] += gasto;
      } catch (itemError) {
        console.error('Error procesando suministro en analisisPorTipoGasto:', itemError, suministro);
      }
    });

    const tipos = Object.keys(gastosMateriales);
    const valores = tipos.map(tipo => Math.round(gastosMateriales[tipo] * 100) / 100);

    let gastosMO = 0;
    let cantidadNominas = 0;
    try {
      const nominasResponse = await NominaService.getAll();
      if (nominasResponse.success && nominasResponse.data) {
        const nominas = Array.isArray(nominasResponse.data) ? nominasResponse.data : nominasResponse.data.nominas || [];
        
        nominas.forEach(nomina => {
          try {
            const totalPagar = parseFloat(nomina.total_pagar) || 0;
            if (totalPagar > 0) {
              gastosMO += totalPagar;
              cantidadNominas++;
            }
          } catch (nominaError) {
            console.error('Error procesando nómina:', nominaError, nomina);
          }
        });
      }
    } catch (error) {
      console.error('Error al cargar nóminas para análisis:', error);
    }

    const tiposCompletos = [...tipos, 'Mano de Obra'];
    const valoresCompletos = [...valores, Math.round(gastosMO * 100) / 100];

    const total = valoresCompletos.reduce((sum, val) => sum + val, 0);
    const tipoMayorGasto = tiposCompletos[valoresCompletos.indexOf(Math.max(...valoresCompletos))];
    const porcentajeMayorGasto = ((Math.max(...valoresCompletos) / total) * 100).toFixed(1);

    return {
      labels: tiposCompletos,
      datasets: [{
        label: 'Gasto Total ($)',
        data: valoresCompletos,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderWidth: 2
      }],
      metrics: {
        total,
        tipoMayorGasto,
        porcentajeMayorGasto,
        gastosMateriales: valores.reduce((sum, val) => sum + val, 0).toFixed(2),
        gastosManoObra: gastosMO.toFixed(2),
        cantidadNominas
      }
    };
  } catch (error) {
    console.error('Error procesando analisisPorTipoGasto:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Gasto Total ($)',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Tendencia de entregas en el tiempo
 */
export const processTendenciaEntregas = (data) => {
  try {
    const entregasPorMes = {};
    const mesesSet = new Set();
    
    data.forEach(suministro => {
      try {
        let fechaAUsar = null;
        
        if (suministro.fecha_entrega) {
          fechaAUsar = suministro.fecha_entrega;
        } else if (suministro.fecha_registro) {
          fechaAUsar = suministro.fecha_registro;
        }

        if (fechaAUsar) {
          const fecha = new Date(fechaAUsar);
          if (!isNaN(fecha.getTime())) {
            const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            mesesSet.add(mes);
            
            if (!entregasPorMes[mes]) {
              entregasPorMes[mes] = 0;
            }
            entregasPorMes[mes]++;
          }
        }
      } catch (itemError) {
        console.error('Error procesando fecha en tendenciaEntregas:', itemError, suministro);
      }
    });

    const mesesOrdenados = Array.from(mesesSet).sort();
    const entregas = mesesOrdenados.map(mes => entregasPorMes[mes] || 0);

    if (mesesOrdenados.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Entregas',
          data: [0],
          borderColor: 'rgba(156, 163, 175, 1)',
          backgroundColor: 'rgba(156, 163, 175, 0.2)'
        }]
      };
    }

    const mesesNombres = mesesOrdenados.map(mes => {
      const [año, mesNum] = mes.split('-');
      const fecha = new Date(año, parseInt(mesNum) - 1);
      return fecha.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
    });

    const total = entregas.reduce((sum, cant) => sum + cant, 0);
    const promedio = (total / entregas.length).toFixed(1);
    const mesConMasEntregas = mesesNombres[entregas.indexOf(Math.max(...entregas))];

    return {
      labels: mesesNombres,
      datasets: [{
        label: 'Entregas',
        data: entregas,
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }],
      metrics: {
        total,
        promedio,
        mesConMasEntregas,
        maxEntregas: Math.max(...entregas)
      }
    };
  } catch (error) {
    console.error('Error procesando tendenciaEntregas:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Entregas',
        data: [0],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)'
      }]
    };
  }
};

/**
 * Análisis de códigos de producto
 */
export const processCodigosProducto = (data) => {
  try {
    const productosPorCodigo = {};
    const valorPorCodigo = {};
    
    data.forEach(suministro => {
      try {
        const codigo = suministro.codigo_producto || 'Sin código';
        const descripcion = suministro.descripcion || suministro.descripcion_producto || '';
        const label = codigo !== 'Sin código' ? `${codigo} - ${descripcion.substring(0, 30)}` : 'Sin código';
        
        const cantidad = parseFloat(suministro.cantidad) || 0;
        const precio = parseFloat(suministro.precio_unitario) || 0;
        const valor = cantidad * precio;
        
        if (!productosPorCodigo[label]) {
          productosPorCodigo[label] = 0;
          valorPorCodigo[label] = 0;
        }
        productosPorCodigo[label] += cantidad;
        valorPorCodigo[label] += valor;
      } catch (itemError) {
        console.error('Error procesando código de producto:', itemError, suministro);
      }
    });

    const codigos = Object.keys(productosPorCodigo);
    const cantidades = codigos.map(codigo => Math.round(productosPorCodigo[codigo] * 100) / 100);

    if (codigos.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Cantidad',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const top10Indices = cantidades
      .map((cantidad, index) => ({ cantidad, index }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10)
      .map(item => item.index);

    const top10Codigos = top10Indices.map(i => codigos[i]);
    const top10Cantidades = top10Indices.map(i => cantidades[i]);

    const totalCantidad = cantidades.reduce((sum, cant) => sum + cant, 0);
    const totalValor = Object.values(valorPorCodigo).reduce((sum, val) => sum + val, 0);

    return {
      labels: top10Codigos,
      datasets: [{
        label: 'Cantidad',
        data: top10Cantidades,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }],
      metrics: {
        totalProductos: codigos.length,
        totalCantidad: totalCantidad.toFixed(2),
        totalValor: totalValor.toFixed(2),
        productoTop: top10Codigos[0],
        cantidadTop: top10Cantidades[0].toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error procesando codigosProducto:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Cantidad',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Obtener unidad principal para una categoría
 */
export const getUnidadPrincipalCategoria = (categoria) => {
  const unidadesPorCategoria = {
    'Concreto': 'm³',
    'Varilla': 'kg',
    'Alambrón': 'kg',
    'Cemento': 'bulto',
    'Arena': 'm³',
    'Grava': 'm³',
    'Block': 'pieza',
    'Tabique': 'pieza',
    'Tubo': 'ml',
    'Cable': 'ml',
    'Pintura': 'lt',
    'Impermeabilizante': 'lt'
  };

  return unidadesPorCategoria[categoria] || 'unidad';
};

/**
 * Obtener título para análisis técnico
 */
export const getTituloAnalisisTecnico = (categoria) => {
  const titulos = {
    'Concreto': 'Análisis de Metros Cúbicos de Concreto',
    'Varilla': 'Análisis de Kilogramos de Varilla',
    'Alambrón': 'Análisis de Kilogramos de Alambrón',
    'Cemento': 'Análisis de Bultos de Cemento',
    'Arena': 'Análisis de Metros Cúbicos de Arena',
    'Grava': 'Análisis de Metros Cúbicos de Grava',
    'Block': 'Análisis de Piezas de Block',
    'Tabique': 'Análisis de Piezas de Tabique',
    'Tubo': 'Análisis de Metros Lineales de Tubo',
    'Cable': 'Análisis de Metros Lineales de Cable',
    'Pintura': 'Análisis de Litros de Pintura',
    'Impermeabilizante': 'Análisis de Litros de Impermeabilizante'
  };

  return titulos[categoria] || `Análisis de ${categoria}`;
};

/**
 * Análisis técnico inteligente por categoría
 */
export const processAnalisisTecnicoInteligente = (data, categoriasDinamicas) => {
  try {
    const cantidadPorCategoria = {};
    const valorPorCategoria = {};
    const categoriaDetalles = {};
    
    data.forEach(suministro => {
      try {
        let categoriaActual = 'Sin categoría';
        
        if (suministro.id_categoria_suministro && categoriasDinamicas && categoriasDinamicas.length > 0) {
          const categoriaObj = categoriasDinamicas.find(cat => cat.id_categoria == suministro.id_categoria_suministro);
          if (categoriaObj) {
            categoriaActual = categoriaObj.nombre;
          }
        } else if (typeof suministro.categoria === 'object' && suministro.categoria?.nombre) {
          categoriaActual = suministro.categoria.nombre;
        } else if (suministro.categoria && typeof suministro.categoria === 'string') {
          categoriaActual = suministro.categoria;
        }

        const cantidad = parseFloat(suministro.cantidad) || 0;
        const precio = parseFloat(suministro.precio_unitario) || 0;
        const valor = cantidad * precio;
        const unidad = suministro.unidad_medida || '';
        
        if (!cantidadPorCategoria[categoriaActual]) {
          cantidadPorCategoria[categoriaActual] = 0;
          valorPorCategoria[categoriaActual] = 0;
          categoriaDetalles[categoriaActual] = {
            unidad: unidad,
            items: 0
          };
        }
        cantidadPorCategoria[categoriaActual] += cantidad;
        valorPorCategoria[categoriaActual] += valor;
        categoriaDetalles[categoriaActual].items++;
      } catch (itemError) {
        console.error('Error procesando suministro en análisis técnico:', itemError, suministro);
      }
    });

    const categorias = Object.keys(cantidadPorCategoria);
    const cantidades = categorias.map(cat => Math.round(cantidadPorCategoria[cat] * 100) / 100);

    if (categorias.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Cantidad Total',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const colores = [
      'rgba(239, 68, 68, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(20, 184, 166, 0.8)'
    ];

    const totalCantidad = cantidades.reduce((sum, cant) => sum + cant, 0);
    const totalValor = Object.values(valorPorCategoria).reduce((sum, val) => sum + val, 0);
    const categoriaTop = categorias[cantidades.indexOf(Math.max(...cantidades))];

    return {
      labels: categorias,
      datasets: [{
        label: 'Cantidad Total',
        data: cantidades,
        backgroundColor: colores.slice(0, categorias.length),
        borderColor: colores.slice(0, categorias.length).map(color => 
          color.replace('0.8', '1')
        ),
        borderWidth: 2
      }],
      metrics: {
        totalCategorias: categorias.length,
        totalCantidad: totalCantidad.toFixed(2),
        totalValor: totalValor.toFixed(2),
        categoriaTop,
        cantidadTop: Math.max(...cantidades).toFixed(2),
        detalles: categoriaDetalles
      }
    };
  } catch (error) {
    console.error('Error procesando análisis técnico inteligente:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Cantidad Total',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};

/**
 * Análisis detallado de concreto
 */
export const processConcretoDetallado = (data, categoriasDinamicas) => {
  try {
    const concretoData = data.filter(suministro => {
      let esConcreto = false;
      
      if (suministro.id_categoria_suministro && categoriasDinamicas && categoriasDinamicas.length > 0) {
        const categoriaObj = categoriasDinamicas.find(cat => cat.id_categoria == suministro.id_categoria_suministro);
        if (categoriaObj) {
          esConcreto = categoriaObj.nombre?.toLowerCase().includes('concreto');
        }
      } else if (typeof suministro.categoria === 'object' && suministro.categoria?.nombre) {
        esConcreto = suministro.categoria.nombre.toLowerCase().includes('concreto');
      } else if (suministro.categoria && typeof suministro.categoria === 'string') {
        esConcreto = suministro.categoria.toLowerCase().includes('concreto');
      }
      
      return esConcreto;
    });

    const m3PorResistencia = {};
    const valorPorResistencia = {};
    
    concretoData.forEach(suministro => {
      try {
        const descripcion = suministro.descripcion || suministro.descripcion_producto || '';
        let resistencia = 'Sin especificar';
        
        const match = descripcion.match(/(\d+)\s*(kg\/cm2|kg|mpa)/i);
        if (match) {
          resistencia = `${match[1]} kg/cm²`;
        }

        const cantidad = parseFloat(suministro.cantidad) || 0;
        const precio = parseFloat(suministro.precio_unitario) || 0;
        const valor = cantidad * precio;
        
        if (!m3PorResistencia[resistencia]) {
          m3PorResistencia[resistencia] = 0;
          valorPorResistencia[resistencia] = 0;
        }
        m3PorResistencia[resistencia] += cantidad;
        valorPorResistencia[resistencia] += valor;
      } catch (itemError) {
        console.error('Error procesando concreto:', itemError, suministro);
      }
    });

    const resistencias = Object.keys(m3PorResistencia);
    const m3 = resistencias.map(res => Math.round(m3PorResistencia[res] * 100) / 100);

    if (resistencias.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Metros Cúbicos',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.8)']
        }]
      };
    }

    const totalM3 = m3.reduce((sum, val) => sum + val, 0);
    const totalValor = Object.values(valorPorResistencia).reduce((sum, val) => sum + val, 0);
    const resistenciaTop = resistencias[m3.indexOf(Math.max(...m3))];

    return {
      labels: resistencias,
      datasets: [{
        label: 'Metros Cúbicos',
        data: m3,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 2
      }],
      metrics: {
        totalM3: totalM3.toFixed(2),
        totalValor: totalValor.toFixed(2),
        resistenciaTop,
        m3Top: Math.max(...m3).toFixed(2),
        costoPromedioPorM3: (totalValor / totalM3).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error procesando concreto detallado:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Metros Cúbicos',
        data: [0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)']
      }]
    };
  }
};
