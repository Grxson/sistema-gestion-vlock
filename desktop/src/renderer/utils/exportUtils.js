import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Configuración de columnas para suministros - AJUSTADA AL FORMULARIO REAL
export const SUMINISTROS_COLUMNS = {
  // === INFORMACIÓN DEL RECIBO ===
  id_suministro: 'ID',
  proveedor: 'Proveedor',
  proyecto: 'Proyecto', 
  folio: 'Folio del Proveedor',
  fecha: 'Fecha',
  metodo_pago: 'Método de Pago',
  observaciones_generales: 'Observaciones Generales',
  
  // === INFORMACIÓN DEL SUMINISTRO ===
  nombre: 'Nombre del Suministro',
  tipo_suministro: 'Categoría',
  codigo_producto: 'Código',
  cantidad: 'Cantidad',
  unidad_medida: 'Unidad',
  precio_unitario: 'Precio Unitario',
  estado: 'Estado',
  subtotal: 'Subtotal',
  descripcion_detallada: 'Descripción Detallada',
  
  // === CONFIGURACIÓN FINANCIERA ===
  include_iva: 'Incluir IVA'
};

// Valores válidos para validación - CORREGIDOS para coincidir con el formulario oficial
export const VALID_VALUES = {
  // Categorías exactas del modelo de base de datos
  categorias: [
    'Material',
    'Herramienta', 
    'Equipo Ligero',
    'Acero',
    'Cimbra',
    'Ferretería',
    'Servicio',
    'Consumible',
    'Maquinaria',
    'Concreto'
  ],
  // Unidades COMPLETAS del formulario oficial (claves internas)
  unidades: [
    'pz', 'kg', 'm', 'm2', 'm3', 'lt', 'ton', 'hr', 'día', 'viaje',
    'ml', 'cm', 'mm', 'global', 'lote', 'caja', 'costal', 'tambor',
    'galón', 'rollo', 'bulto', 'par', 'docena', 'paquete', 'set'
  ],
  // Estados exactos del modelo de base de datos
  estados: ['Solicitado', 'Aprobado', 'Pedido', 'En_Transito', 'Entregado', 'Cancelado'],
  // Métodos de pago exactos del modelo
  metodos_pago: ['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta']
};

// Función para generar plantilla de importación - CON DATOS REALES DEL SISTEMA
export const generateImportTemplate = async (proyectos = [], proveedores = []) => {
  try {
    // Usar datos reales si están disponibles
    const proyectoEjemplo = proyectos.length > 0 ? proyectos[0].nombre : 'Proyecto Real';
    const proveedorEjemplo = proveedores.length > 0 ? proveedores[0].nombre : 'Proveedor Real';
    
    /*
    IMPORTANTE: CATEGORÍAS Y UNIDADES VÁLIDAS
    
    Categorías permitidas:
    - Material, Herramienta, Equipo Ligero, Acero, Cimbra, Ferretería, Servicio, Consumible, Maquinaria, Concreto
    
    Unidades de medida permitidas (usar EXACTAMENTE estos valores):
    - pz, kg, m, m2, m3, lt, ton, hr, día, viaje, ml, cm, mm, global, lote, caja, costal, tambor, galón, rollo, bulto, par, docena, paquete, set
    
    NOTA IMPORTANTE: 
    - Usar "m2" NO "m²" 
    - Usar "m3" NO "m³"
    - Las unidades deben escribirse exactamente como aparecen en la lista anterior
    
    INSTRUCCIONES DE USO:
    - Suministro individual: Use un folio único por suministro
    - Suministros agrupados: Use el MISMO folio para múltiples suministros del mismo recibo
    - El sistema agrupará automáticamente suministros con el mismo folio, proveedor, fecha y proyecto
    */
    
    const templateData = [
      // === EJEMPLO 1: SUMINISTRO INDIVIDUAL (UN SOLO ARTÍCULO POR RECIBO) ===
      {
        'Proveedor': proveedorEjemplo,
        'Proyecto': proyectoEjemplo,
        'Folio del Proveedor': '37945',
        'Fecha': '2025-09-03',
        'Método de Pago': 'Efectivo',
        'Observaciones Generales': 'Compra individual - 1 artículo',
        
        'Nombre del Suministro': 'Taladro Percutor',
        'Categoría': 'Herramienta',
        'Código': 'TAL001',
        'Cantidad': 1,
        'Unidad': 'pz',
        'Precio Unitario': 1850.00,
        'Estado': 'Entregado',
        'Descripción Detallada': 'Taladro percutor 1/2" profesional',
        
        'Incluir IVA': 'Sí'
      },
      
      // === EJEMPLO 2: RECIBO AGRUPADO (MÚLTIPLES ARTÍCULOS MISMO FOLIO) ===
      // Primer artículo del recibo agrupado
      {
        'Proveedor': proveedorEjemplo,
        'Proyecto': proyectoEjemplo,
        'Folio del Proveedor': '37946',
        'Fecha': '2025-09-04',
        'Método de Pago': 'Efectivo',
        'Observaciones Generales': 'Recibo agrupado - Materiales de construcción',
        
        'Nombre del Suministro': 'Cemento Portland',
        'Categoría': 'Material',
        'Código': 'CEM001',
        'Cantidad': 50,
        'Unidad': 'pz',
        'Precio Unitario': 185.50,
        'Estado': 'Entregado',
        'Descripción Detallada': 'Cemento Portland CPO 30R de 50kg',
        
        'Incluir IVA': 'Sí'
      },
      {
        // Segundo artículo del mismo recibo (mismo folio)
        'Proveedor': proveedorEjemplo,
        'Proyecto': proyectoEjemplo,
        'Folio del Proveedor': '37946',
        'Fecha': '2025-09-04',
        'Método de Pago': 'Efectivo',
        'Observaciones Generales': 'Recibo agrupado - Materiales de construcción',
        
        'Nombre del Suministro': 'Arena Fina',
        'Categoría': 'Material',
        'Código': 'ARE001',
        'Cantidad': 5,
        'Unidad': 'm3',
        'Precio Unitario': 250.00,
        'Estado': 'Entregado',
        'Descripción Detallada': 'Arena fina para mortero',
        
        'Incluir IVA': 'Sí'
      },
      {
        // Tercer artículo del mismo recibo (mismo folio)
        'Proveedor': proveedorEjemplo,
        'Proyecto': proyectoEjemplo,
        'Folio del Proveedor': '37946',
        'Fecha': '2025-09-04',
        'Método de Pago': 'Efectivo',
        'Observaciones Generales': 'Recibo agrupado - Materiales de construcción',
        
        'Nombre del Suministro': 'Grava',
        'Categoría': 'Material',
        'Código': 'GRA001',
        'Cantidad': 3,
        'Unidad': 'm3',
        'Precio Unitario': 280.00,
        'Estado': 'Entregado',
        'Descripción Detallada': 'Grava de 3/4" para concreto',
        
        'Incluir IVA': 'Sí'
      },
      
      // === EJEMPLO 3: OTRO RECIBO AGRUPADO (ACERO Y FERRETERÍA) ===
      {
        'Proveedor': proveedorEjemplo,
        'Proyecto': proyectoEjemplo,
        'Folio del Proveedor': '37947',
        'Fecha': '2025-09-05',
        'Método de Pago': 'Transferencia',
        'Observaciones Generales': 'Recibo agrupado - Acero y ferretería',
        
        'Nombre del Suministro': 'Varilla Corrugada #4',
        'Categoría': 'Acero',
        'Código': 'VAR04',
        'Cantidad': 20,
        'Unidad': 'pz',
        'Precio Unitario': 450.00,
        'Estado': 'Entregado',
        'Descripción Detallada': 'Varilla corrugada #4 de 12m grado 60',
        
        'Incluir IVA': 'Sí'
      },
      {
        'Proveedor': proveedorEjemplo,
        'Proyecto': proyectoEjemplo,
        'Folio del Proveedor': '37947',
        'Fecha': '2025-09-05',
        'Método de Pago': 'Transferencia',
        'Observaciones Generales': 'Recibo agrupado - Acero y ferretería',
        
        'Nombre del Suministro': 'Alambre Recocido',
        'Categoría': 'Ferretería',
        'Código': 'ALA001',
        'Cantidad': 10,
        'Unidad': 'kg',
        'Precio Unitario': 35.50,
        'Estado': 'Entregado',
        'Descripción Detallada': 'Alambre recocido calibre 18',
        
        'Incluir IVA': 'Sí'
      },
      
      // === FILA TEMPLATE PARA EL USUARIO ===
      {
        'Proveedor': '[ESCRIBA_NOMBRE_PROVEEDOR]',
        'Proyecto': '[ESCRIBA_NOMBRE_PROYECTO]',
        'Folio del Proveedor': '[FOLIO_ÚNICO_POR_RECIBO]',
        'Fecha': '2025-09-07',
        'Método de Pago': 'Efectivo',
        'Observaciones Generales': '[OPCIONAL: Descripción del recibo]',
        
        'Nombre del Suministro': '[ESCRIBA_NOMBRE_SUMINISTRO]',
        'Categoría': 'Material',
        'Código': '[OPCIONAL]',
        'Cantidad': 1,
        'Unidad': 'pz',
        'Precio Unitario': 0.01,
        'Estado': 'Entregado',
        'Descripción Detallada': '[OPCIONAL]',
        
        'Incluir IVA': 'Sí'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Configurar ancho de columnas optimizado para el formulario real
    const colWidths = [
      { wch: 25 }, // Proveedor
      { wch: 20 }, // Proyecto
      { wch: 18 }, // Folio del Proveedor
      { wch: 12 }, // Fecha
      { wch: 15 }, // Método de Pago
      { wch: 30 }, // Observaciones Generales
      { wch: 30 }, // Nombre del Suministro
      { wch: 15 }, // Categoría
      { wch: 12 }, // Código
      { wch: 10 }, // Cantidad
      { wch: 15 }, // Unidad
      { wch: 15 }, // Precio Unitario
      { wch: 12 }, // Estado
      { wch: 40 }, // Descripción Detallada
      { wch: 12 }  // Incluir IVA
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Suministros');

    // Agregar hoja de instrucciones actualizada
    const instrucciones = [
      // === NOTA IMPORTANTE ===
      { Campo: '� IMPORTANTE', Descripción: 'DEBES usar nombres EXACTOS de Proveedores y Proyectos que ya existen en tu sistema. Los ejemplos pueden no funcionar si no existen esos nombres.', Obligatorio: '⚠️', Ejemplo: 'Verifica nombres en tu sistema' },
      { Campo: '📋 ESTRUCTURA', Descripción: 'Fila 2 y 3: Ejemplos con datos del sistema. Fila 4: Template para completar. Reemplaza [ESCRIBA_...] con datos reales.', Obligatorio: '⚠️', Ejemplo: 'Usa datos reales de tu BD' },
      { Campo: '', Descripción: '', Obligatorio: '', Ejemplo: '' }, // Fila separadora
      
      // === INFORMACIÓN DEL RECIBO (OBLIGATORIA) ===
      { Campo: 'Proveedor', Descripción: 'Nombre EXACTO del proveedor (debe existir en el sistema)', Obligatorio: 'Sí', Ejemplo: 'Busca en tu lista de proveedores' },
      { Campo: 'Proyecto', Descripción: 'Nombre EXACTO del proyecto (debe existir en el sistema)', Obligatorio: 'Sí', Ejemplo: 'Busca en tu lista de proyectos' },
      { Campo: 'Folio del Proveedor', Descripción: 'Número de folio del proveedor (ej: 37946)', Obligatorio: 'Sí', Ejemplo: '37946' },
      { Campo: 'Fecha', Descripción: 'Fecha del recibo (formato YYYY-MM-DD)', Obligatorio: 'Sí', Ejemplo: '2025-09-04' },
      { Campo: 'Método de Pago', Descripción: 'Debe ser: Efectivo, Transferencia, Cheque o Tarjeta', Obligatorio: 'Sí', Ejemplo: 'Efectivo' },
      { Campo: 'Observaciones Generales', Descripción: 'Observaciones del recibo (opcional)', Obligatorio: 'No', Ejemplo: 'Entrega matutina' },
      
      // === INFORMACIÓN DEL SUMINISTRO (OBLIGATORIA) ===
      { Campo: 'Nombre del Suministro', Descripción: 'Nombre descriptivo del suministro', Obligatorio: 'Sí', Ejemplo: 'Cemento Portland' },
      { Campo: 'Categoría', Descripción: 'Debe ser una categoría válida (ver Valores Válidos)', Obligatorio: 'Sí', Ejemplo: 'Material' },
      { Campo: 'Código', Descripción: 'Código del producto (opcional)', Obligatorio: 'No', Ejemplo: 'CEM001' },
      { Campo: 'Cantidad', Descripción: 'Cantidad numérica (mayor a 0)', Obligatorio: 'Sí', Ejemplo: '50' },
      { Campo: 'Unidad', Descripción: 'Clave de unidad (usar pz, kg, m, etc. - ver Valores Válidos)', Obligatorio: 'Sí', Ejemplo: 'pz' },
      { Campo: 'Precio Unitario', Descripción: 'Precio por unidad (usar punto decimal: 185.50)', Obligatorio: 'Sí', Ejemplo: '185.50' },
      { Campo: 'Estado', Descripción: 'Debe ser un estado válido (ver Valores Válidos)', Obligatorio: 'Sí', Ejemplo: 'Entregado' },
      { Campo: 'Descripción Detallada', Descripción: 'Descripción detallada del suministro (opcional)', Obligatorio: 'No', Ejemplo: 'Cemento Portland CPO 30R' },
      
      // === CONFIGURACIÓN FINANCIERA ===
      { Campo: 'Incluir IVA', Descripción: 'Escribir: Sí o No (por defecto: Sí)', Obligatorio: 'No', Ejemplo: 'Sí' }
    ];

    const wsInstrucciones = XLSX.utils.json_to_sheet(instrucciones);
    wsInstrucciones['!cols'] = [
      { wch: 25 }, // Campo
      { wch: 50 }, // Descripción
      { wch: 12 }, // Obligatorio
      { wch: 25 }  // Ejemplo
    ];
    XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones');

    // Agregar hoja de valores válidos
    const valoresValidos = [
      { Tipo: '🏢 Proveedores del Sistema', Valores: proveedores.length > 0 ? proveedores.map(p => p.nombre).join(', ') : 'Carga la página de Suministros para ver la lista actualizada' },
      { Tipo: '🏗️ Proyectos del Sistema', Valores: proyectos.length > 0 ? proyectos.map(p => p.nombre).join(', ') : 'Carga la página de Suministros para ver la lista actualizada' },
      { Tipo: '', Valores: '' }, // Separador
      { Tipo: 'Categorías', Valores: VALID_VALUES.categorias.join(', ') },
      { Tipo: 'Unidades (Claves)', Valores: VALID_VALUES.unidades.join(', ') },
      { Tipo: 'Estados', Valores: VALID_VALUES.estados.join(', ') },
      { Tipo: 'Métodos de Pago', Valores: VALID_VALUES.metodos_pago.join(', ') },
      { Tipo: 'Incluir IVA', Valores: 'Sí, No (por defecto: Sí)' }
    ];

    const wsValores = XLSX.utils.json_to_sheet(valoresValidos);
    wsValores['!cols'] = [
      { wch: 20 }, // Tipo
      { wch: 80 }  // Valores
    ];
    XLSX.utils.book_append_sheet(wb, wsValores, 'Valores Válidos');

    // Descargar archivo
    const fileName = `plantilla_suministros_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error generando plantilla:', error);
    throw new Error('Error al generar la plantilla de importación');
  }
};

// Función para validar datos de importación - AJUSTADA AL FORMULARIO REAL
export const validateImportData = (data, proyectos = [], proveedores = []) => {
  const errors = [];
  const validData = [];

  // Filtrar filas que contienen placeholders de template
  const filteredData = data.filter(row => {
    // Excluir filas que contienen placeholders del template
    const proveedor = String(row['Proveedor'] || '').trim();
    const proyecto = String(row['Proyecto'] || '').trim();
    const folio = String(row['Folio del Proveedor'] || '').trim();
    
    // Si contiene placeholders, excluir esta fila
    if (proveedor.includes('[ESCRIBA_') || 
        proyecto.includes('[ESCRIBA_') || 
        folio.includes('[ESCRIBA_') ||
        proveedor === '' && proyecto === '' && folio === '') {
      return false;
    }
    
    return true;
  });

  filteredData.forEach((row, index) => {
    const rowNumber = index + 2; // +2 porque Excel empieza en 1 y tenemos header
    const rowErrors = [];

    // ===== VALIDACIONES DEL RECIBO (OBLIGATORIAS) =====
    if (!row['Proveedor']) {
      rowErrors.push('Proveedor es obligatorio');
    }

    if (!row['Proyecto']) {
      rowErrors.push('Proyecto es obligatorio');
    }

    if (!row['Folio del Proveedor'] || String(row['Folio del Proveedor']).trim() === '') {
      rowErrors.push('Folio del Proveedor es obligatorio');
    }

    if (!row['Fecha']) {
      rowErrors.push('Fecha es obligatoria');
    } else {
      const fecha = new Date(row['Fecha']);
      if (isNaN(fecha.getTime())) {
        rowErrors.push('Fecha debe tener formato válido (YYYY-MM-DD o DD/MM/YYYY)');
      }
    }

    if (!row['Método de Pago'] || !VALID_VALUES.metodos_pago.includes(row['Método de Pago'])) {
      rowErrors.push(`Método de Pago debe ser uno de: ${VALID_VALUES.metodos_pago.join(', ')}`);
    }

    // ===== VALIDACIONES DEL SUMINISTRO (OBLIGATORIAS) =====
    if (!row['Nombre del Suministro'] || String(row['Nombre del Suministro']).trim() === '') {
      rowErrors.push('Nombre del Suministro es obligatorio');
    }

    if (!row['Categoría'] || !VALID_VALUES.categorias.includes(row['Categoría'])) {
      rowErrors.push(`Categoría debe ser una de: ${VALID_VALUES.categorias.join(', ')}`);
    }

    if (!row['Cantidad'] || isNaN(row['Cantidad']) || Number(row['Cantidad']) <= 0) {
      rowErrors.push('Cantidad debe ser un número mayor a 0');
    }

    if (!row['Unidad'] || !VALID_VALUES.unidades.includes(row['Unidad'])) {
      rowErrors.push(`Unidad debe ser una de: ${VALID_VALUES.unidades.join(', ')}`);
    }

    if (!row['Precio Unitario'] || isNaN(row['Precio Unitario']) || Number(row['Precio Unitario']) <= 0) {
      rowErrors.push('Precio Unitario debe ser un número mayor a 0');
    }

    if (!row['Estado'] || !VALID_VALUES.estados.includes(row['Estado'])) {
      rowErrors.push(`Estado debe ser uno de: ${VALID_VALUES.estados.join(', ')}`);
    }

    // Si hay errores, agregarlos a la lista
    if (rowErrors.length > 0) {
      errors.push({
        row: rowNumber,
        message: rowErrors.join('; ')
      });
    } else {
      // Si no hay errores, agregar a datos válidos
      validData.push({
        // === Datos del Recibo ===
        proveedor_nombre: String(row['Proveedor']).trim(),
        proyecto_nombre: String(row['Proyecto']).trim(),
        folio: String(row['Folio del Proveedor']).trim(),
        fecha: row['Fecha'],
        metodo_pago: row['Método de Pago'],
        observaciones_generales: row['Observaciones Generales'] ? String(row['Observaciones Generales']).trim() : '',

        // === Datos del Suministro ===
        nombre: String(row['Nombre del Suministro']).trim(),
        tipo_suministro: row['Categoría'],
        codigo_producto: row['Código'] ? String(row['Código']).trim() : '',
        cantidad: Number(row['Cantidad']),
        unidad_medida: row['Unidad'],
        precio_unitario: Number(row['Precio Unitario']),
        estado: row['Estado'],
        descripcion_detallada: row['Descripción Detallada'] ? String(row['Descripción Detallada']).trim() : '',

        // === Configuración Financiera ===
        include_iva: row['Incluir IVA'] ? (String(row['Incluir IVA']).toLowerCase() === 'true' || String(row['Incluir IVA']).toLowerCase() === 'sí') : true
      });
    }
  });

  return { validData, errors };
};

// Función para exportar a Excel
export const exportToExcel = async (data) => {
  try {
    // Mapear datos solo con las columnas necesarias
    const exportData = data.map(item => ({
      'Folio': item.folio || item.id_suministro,
      'Nombre del Suministro': item.nombre,
      'Código': item.codigo_producto || '',
      'Descripción': item.descripcion_detallada || '',
      'Categoría': item.tipo_suministro,
      'Cantidad': item.cantidad,
      'Unidad': item.unidad_medida,
      'Precio Unitario': item.precio_unitario,
      'Subtotal': item.subtotal,
      'Estado': item.estado,
      'Proyecto': item.proyecto || '',
      'Proveedor': item.proveedor || '',
      'Fecha Recibo': item.fecha ? format(new Date(item.fecha), 'yyyy-MM-dd') : '',
      'Número Recibo': item.folio || '',
      'Método de Pago': item.metodo_pago || ''
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Configurar ancho de columnas
    const colWidths = [
      { wch: 12 }, // Folio
      { wch: 25 }, // Nombre del Suministro
      { wch: 12 }, // Código
      { wch: 30 }, // Descripción
      { wch: 20 }, // Categoría
      { wch: 10 }, // Cantidad
      { wch: 12 }, // Unidad
      { wch: 15 }, // Precio Unitario
      { wch: 15 }, // Subtotal
      { wch: 12 }, // Estado
      { wch: 20 }, // Proyecto
      { wch: 20 }, // Proveedor
      { wch: 12 }, // Fecha Recibo
      { wch: 15 }, // Número Recibo
      { wch: 15 }  // Método de Pago
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Suministros');

    const fileName = `suministros_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exportando a Excel:', error);
    throw new Error('Error al exportar a Excel');
  }
};

// Función para exportar a PDF
export const exportToPDF = async (data, filtrosInfo = null) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Título principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE SUMINISTROS', 148, 15, { align: 'center' });

    // Fecha de generación
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 148, 25, { align: 'center' });

    // Calcular estadísticas generales
    const totalSupplies = data.length;
    const totalSpent = data.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    const totalQuantity = data.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
    const uniqueSuppliers = new Set(data.map(item => item.proveedor).filter(Boolean)).size;
    const uniqueProjects = new Set(data.map(item => item.proyecto).filter(Boolean)).size;
    const avgUnitPrice = totalSpent / totalQuantity || 0;

    // Sección de estadísticas generales con mejor diseño
    let statsY = 35;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 10, statsY);

    statsY += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Crear tabla de estadísticas
    const statsData = [
      ['Total de Suministros:', totalSupplies.toLocaleString()],
      ['Monto Total Gastado:', `$${totalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ['Cantidad Total:', totalQuantity.toLocaleString()],
      ['Proveedores Únicos:', uniqueSuppliers.toString()],
      ['Proyectos Activos:', uniqueProjects.toString()],
      ['Precio Promedio por Unidad:', `$${avgUnitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`]
    ];

    autoTable(doc, {
      body: statsData,
      startY: statsY,
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { 
          cellWidth: 60, 
          fontStyle: 'bold',
          fillColor: [240, 248, 255] 
        },
        1: { 
          cellWidth: 40, 
          halign: 'right',
          fillColor: [248, 250, 252]
        }
      },
      margin: { left: 10 },
      theme: 'grid'
    });

    // Información de filtros si está disponible
    let startY = doc.lastAutoTable.finalY + 15;
    if (filtrosInfo) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('FILTROS APLICADOS', 10, startY);
      
      startY += 8;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Mostrando ${filtrosInfo.registrosFiltrados} de ${filtrosInfo.totalRegistros} registros totales`, 10, startY);
      
      const filtrosActivos = [];
      if (filtrosInfo.filtros.busqueda) filtrosActivos.push(`Búsqueda: "${filtrosInfo.filtros.busqueda}"`);
      if (filtrosInfo.filtros.proyecto) filtrosActivos.push(`Proyecto: ${filtrosInfo.filtros.proyecto}`);
      if (filtrosInfo.filtros.proveedor) filtrosActivos.push(`Proveedor: ${filtrosInfo.filtros.proveedor}`);
      if (filtrosInfo.filtros.estado) filtrosActivos.push(`Estado: ${filtrosInfo.filtros.estado}`);
      if (filtrosInfo.filtros.fechaInicio || filtrosInfo.filtros.fechaFin) {
        const fechas = `${filtrosInfo.filtros.fechaInicio || ''} - ${filtrosInfo.filtros.fechaFin || ''}`;
        filtrosActivos.push(`Fechas: ${fechas}`);
      }
      
      if (filtrosActivos.length > 0) {
        startY += 5;
        doc.text(`${filtrosActivos.join(' | ')}`, 10, startY);
        startY += 10;
      } else {
        startY += 10;
      }
    }

    // Agregar nueva página para la tabla de suministros
    doc.addPage();

    // Título de la tabla de datos en la nueva página
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE SUMINISTROS', 10, 20);
    startY = 30;

    // Configurar datos para la tabla con mejor formato
    const tableData = data.map(item => [
      item.folio || '',
      (item.nombre || '').substring(0, 30) + ((item.nombre || '').length > 30 ? '...' : ''),
      item.codigo_producto || '',
      item.tipo_suministro || '',
      Number(item.cantidad || 0).toLocaleString(),
      item.unidad_medida || '',
      `$${Number(item.precio_unitario || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      `$${Number(item.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      item.estado || '',
      (item.proyecto || '').substring(0, 25) + ((item.proyecto || '').length > 25 ? '...' : ''),
      (item.proveedor || '').substring(0, 25) + ((item.proveedor || '').length > 25 ? '...' : '')
    ]);

    // Configurar tabla con mejor espaciado y formato
    autoTable(doc, {
      head: [['Folio', 'Nombre', 'Código', 'Categoría', 'Cantidad', 'Unidad', 'P. Unitario', 'Subtotal', 'Estado', 'Proyecto', 'Proveedor']],
      body: tableData,
      startY: startY,
      styles: {
        fontSize: 7,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left',
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center' }, // Folio
        1: { cellWidth: 38 }, // Nombre
        2: { cellWidth: 22, halign: 'center' }, // Código
        3: { cellWidth: 24 }, // Categoría
        4: { cellWidth: 18, halign: 'right' }, // Cantidad
        5: { cellWidth: 20, halign: 'center' }, // Unidad
        6: { cellWidth: 24, halign: 'right' }, // Precio Unit.
        7: { cellWidth: 25, halign: 'right', fillColor: [252, 248, 227] }, // Subtotal
        8: { cellWidth: 19, halign: 'center' }, // Estado
        9: { cellWidth: 35 }, // Proyecto
        10: { cellWidth: 35 } // Proveedor
      },
      margin: { left: 8, right: 8 },
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      }
    });

    // Agregar pie de página con totales mejorados
    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Verificar si necesitamos nueva página
    if (finalY > 180) {
      doc.addPage();
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTALES FINALES', 148, 20, { align: 'center' });
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTALES FINALES', 10, finalY);
    }

    const resumenY = finalY > 180 ? 35 : finalY + 10;
    
    // Crear tabla de totales final más completa
    const resumenData = [
      ['CONCEPTO', 'VALOR'],
      ['Total de Registros Mostrados:', data.length.toLocaleString()],
      ['Monto Total Invertido:', `$${totalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ['Precio Promedio por Unidad:', `$${avgUnitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ['Proveedores Involucrados:', uniqueSuppliers.toString()],
      ['Proyectos con Suministros:', uniqueProjects.toString()]
    ];

    autoTable(doc, {
      body: resumenData,
      startY: resumenY,
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      columnStyles: {
        0: { 
          cellWidth: 80, 
          fontStyle: 'bold',
          fillColor: [240, 248, 255] 
        },
        1: { 
          cellWidth: 60, 
          halign: 'right',
          fillColor: [248, 250, 252]
        }
      },
      margin: { left: 75, right: 75 },
      theme: 'grid'
    });

    // Agregar nota de pie
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Reporte generado automáticamente por Sistema de Gestión Vlock', 148, pageHeight - 10, { align: 'center' });

    const fileName = `suministros_report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exportando a PDF:', error);
    throw new Error('Error al exportar a PDF');
  }
};

// Función para procesar archivo de importación
export const processImportFile = async (file) => {
  try {
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsBinaryString(file);
    });

    if (!data || data.length === 0) {
      throw new Error('El archivo está vacío o no contiene datos válidos');
    }

    return validateImportData(data);
  } catch (error) {
    console.error('Error procesando archivo:', error);
    throw new Error('Error al procesar el archivo de importación');
  }
};
