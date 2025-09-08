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
    
    const templateData = [
      {
        // === INFORMACIÓN DEL RECIBO ===
        'Proveedor': proveedorEjemplo,
        'Proyecto': proyectoEjemplo,
        'Folio del Proveedor': '37946',
        'Fecha': '2025-09-04',
        'Método de Pago': 'Efectivo',
        'Observaciones Generales': 'Entrega matutina',
        
        // === INFORMACIÓN DEL SUMINISTRO ===
        'Nombre del Suministro': 'Cemento Portland',
        'Categoría': 'Material',
        'Código': 'CEM001',
        'Cantidad': 50,
        'Unidad': 'pz',
        'Precio Unitario': 185.50,
        'Estado': 'Entregado',
        'Descripción Detallada': 'Cemento Portland CPO 30R de 50kg',
        
        // === CONFIGURACIÓN FINANCIERA ===
        'Incluir IVA': 'Sí'
      },
      {
        // === SEGUNDO EJEMPLO CON DIFERENTES VALORES ===
        'Proveedor': proveedorEjemplo,
        'Proyecto': proyectoEjemplo,
        'Folio del Proveedor': '37947',
        'Fecha': '2025-09-04',
        'Método de Pago': 'Transferencia',
        'Observaciones Generales': 'Entrega tarde',
        
        'Nombre del Suministro': 'Varilla Corrugada',
        'Categoría': 'Acero',
        'Código': 'VAR12',
        'Cantidad': 20,
        'Unidad': 'pz',
        'Precio Unitario': 450.00,
        'Estado': 'Solicitado',
        'Descripción Detallada': 'Varilla corrugada #4 de 12m',
        
        'Incluir IVA': 'Sí'
      },
      {
        // === FILA TEMPLATE PARA EL USUARIO ===
        'Proveedor': '[ESCRIBA_NOMBRE_PROVEEDOR]',
        'Proyecto': '[ESCRIBA_NOMBRE_PROYECTO]',
        'Folio del Proveedor': '[ESCRIBA_FOLIO]',
        'Fecha': '2025-09-04',
        'Método de Pago': 'Efectivo',
        'Observaciones Generales': '',
        
        'Nombre del Suministro': '[ESCRIBA_NOMBRE_SUMINISTRO]',
        'Categoría': 'Material',
        'Código': '',
        'Cantidad': 1,
        'Unidad': 'pz',
        'Precio Unitario': 0.01,
        'Estado': 'Entregado',
        'Descripción Detallada': '',
        
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
      'ID': item.id_suministro,
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
      { wch: 8 },  // ID
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

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Suministros', 148, 15, { align: 'center' });

    // Fecha de generación
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 148, 25, { align: 'center' });

    // Información de filtros si está disponible
    let startY = 35;
    if (filtrosInfo) {
      doc.setFontSize(8);
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
        doc.text(`Filtros aplicados: ${filtrosActivos.join(' | ')}`, 10, startY + 5);
        startY += 10;
      } else {
        startY += 5;
      }
    }

    // Configurar datos para la tabla
    const tableData = data.map(item => [
      item.id_suministro || '',
      item.nombre || '',
      item.codigo_producto || '',
      item.tipo_suministro || '',
      item.cantidad || '',
      item.unidad_medida || '',
      `$${Number(item.precio_unitario || 0).toFixed(2)}`,
      `$${Number(item.subtotal || 0).toFixed(2)}`,
      item.estado || '',
      item.proyecto || '',
      item.proveedor || ''
    ]);

    // Configurar tabla usando autoTable importado
    autoTable(doc, {
      head: [['ID', 'Nombre', 'Código', 'Categoría', 'Cantidad', 'Unidad', 'Precio Unit.', 'Subtotal', 'Estado', 'Proyecto', 'Proveedor']],
      body: tableData,
      startY: startY,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 35 }, // Nombre
        2: { cellWidth: 20 }, // Código
        3: { cellWidth: 25 }, // Categoría
        4: { cellWidth: 15 }, // Cantidad
        5: { cellWidth: 15 }, // Unidad
        6: { cellWidth: 20 }, // Precio Unit.
        7: { cellWidth: 20 }, // Subtotal
        8: { cellWidth: 20 }, // Estado
        9: { cellWidth: 30 }, // Proyecto
        10: { cellWidth: 30 } // Proveedor
      },
      margin: { left: 10, right: 10 },
      pageBreak: 'auto',
      rowPageBreak: 'avoid'
    });

    // Agregar resumen al final con más detalles
    const totalSubtotal = data.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    const totalCantidad = data.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
    const finalY = doc.lastAutoTable.finalY + 15;

    // Crear tabla de resumen
    const resumenData = [
      ['Total de Registros:', data.length.toString()],
      ['Total de Cantidad:', totalCantidad.toString()],
      ['Total General:', `$${totalSubtotal.toFixed(2)}`]
    ];

    autoTable(doc, {
      body: resumenData,
      startY: finalY,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'right' }
      },
      margin: { left: 180 },
      theme: 'plain'
    });

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
