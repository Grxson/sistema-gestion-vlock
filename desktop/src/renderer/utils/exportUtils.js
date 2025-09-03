import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Configuración de columnas para suministros (solo las necesarias)
export const SUMINISTROS_COLUMNS = {
  id_suministro: 'ID',
  nombre: 'Nombre del Suministro',
  codigo_producto: 'Código',
  descripcion_detallada: 'Descripción',
  tipo_suministro: 'Categoría',
  cantidad: 'Cantidad',
  unidad_medida: 'Unidad',
  precio_unitario: 'Precio Unitario',
  subtotal: 'Subtotal',
  estado: 'Estado',
  proyecto: 'Proyecto',
  proveedor: 'Proveedor',
  fecha: 'Fecha Recibo',
  folio: 'Número Recibo',
  metodo_pago: 'Método de Pago'
};

// Valores válidos para validación
export const VALID_VALUES = {
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
  unidades: [
    'Unidad',
    'Metro',
    'Metro cuadrado',
    'Metro cúbico', 
    'Kilogramo',
    'Litro',
    'Caja',
    'Paquete',
    'Rollo',
    'Saco',
    'Galón',
    'Pieza',
    'Par',
    'Docena',
    'Tonelada'
  ],
  estados: ['Solicitado', 'Aprobado', 'Pedido', 'En_Transito', 'Entregado', 'Cancelado'],
  metodos_pago: ['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta']
};

// Función para generar plantilla de importación
export const generateImportTemplate = async () => {
  try {
    const templateData = [
      {
        'Nombre del Suministro': 'Cemento Portland',
        'Código': 'CEM001',
        'Descripción': 'Cemento Portland tipo I de 50kg',
        'Categoría': 'Material',
        'Cantidad': 10,
        'Unidad': 'Saco',
        'Precio Unitario': 15.50,
        'Estado': 'Entregado',
        'Proyecto': 'Proyecto Ejemplo',
        'Proveedor': 'Proveedor Ejemplo',
        'Fecha Recibo': '2024-01-15',
        'Número Recibo': 'REC001',
        'Método de Pago': 'Transferencia'
      },
      {
        'Nombre del Suministro': 'Cable Eléctrico',
        'Código': 'CAB002',
        'Descripción': 'Cable THW 12 AWG',
        'Categoría': 'Material',
        'Cantidad': 100,
        'Unidad': 'Metro',
        'Precio Unitario': 2.75,
        'Estado': 'Entregado',
        'Proyecto': 'Proyecto Ejemplo',
        'Proveedor': 'Proveedor Ejemplo',
        'Fecha Recibo': '2024-01-15',
        'Número Recibo': 'REC001',
        'Método de Pago': 'Efectivo'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Configurar ancho de columnas
    const colWidths = [
      { wch: 25 }, // Nombre del Suministro
      { wch: 12 }, // Código
      { wch: 30 }, // Descripción
      { wch: 20 }, // Categoría
      { wch: 10 }, // Cantidad
      { wch: 12 }, // Unidad
      { wch: 15 }, // Precio Unitario
      { wch: 12 }, // Estado
      { wch: 20 }, // Proyecto
      { wch: 20 }, // Proveedor
      { wch: 12 }, // Fecha Recibo
      { wch: 15 }, // Número Recibo
      { wch: 15 }  // Método de Pago
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Suministros');

    // Agregar hoja de instrucciones
    const instrucciones = [
      { Campo: 'Nombre del Suministro', Descripción: 'Nombre descriptivo del suministro (máximo 255 caracteres)', Obligatorio: 'Sí', Ejemplo: 'Cemento Portland' },
      { Campo: 'Código', Descripción: 'Código único del suministro (máximo 50 caracteres)', Obligatorio: 'Sí', Ejemplo: 'CEM001' },
      { Campo: 'Descripción', Descripción: 'Descripción detallada del suministro', Obligatorio: 'No', Ejemplo: 'Cemento Portland tipo I de 50kg' },
      { Campo: 'Categoría', Descripción: 'Categoría del suministro', Obligatorio: 'Sí', Ejemplo: 'Material' },
      { Campo: 'Cantidad', Descripción: 'Cantidad numérica (mayor a 0)', Obligatorio: 'Sí', Ejemplo: '10' },
      { Campo: 'Unidad', Descripción: 'Unidad de medida', Obligatorio: 'Sí', Ejemplo: 'Saco' },
      { Campo: 'Precio Unitario', Descripción: 'Precio por unidad (mayor a 0)', Obligatorio: 'Sí', Ejemplo: '15.50' },
      { Campo: 'Estado', Descripción: 'Estado del suministro', Obligatorio: 'Sí', Ejemplo: 'Entregado' },
      { Campo: 'Proyecto', Descripción: 'Nombre del proyecto (debe existir)', Obligatorio: 'Sí', Ejemplo: 'Proyecto Ejemplo' },
      { Campo: 'Proveedor', Descripción: 'Nombre del proveedor (debe existir)', Obligatorio: 'Sí', Ejemplo: 'Proveedor Ejemplo' },
      { Campo: 'Fecha Recibo', Descripción: 'Fecha del recibo (formato YYYY-MM-DD)', Obligatorio: 'Sí', Ejemplo: '2024-01-15' },
      { Campo: 'Número Recibo', Descripción: 'Número de recibo único', Obligatorio: 'Sí', Ejemplo: 'REC001' },
      { Campo: 'Método de Pago', Descripción: 'Método de pago utilizado', Obligatorio: 'Sí', Ejemplo: 'Transferencia' }
    ];

    const wsInstrucciones = XLSX.utils.json_to_sheet(instrucciones);
    wsInstrucciones['!cols'] = [
      { wch: 20 }, // Campo
      { wch: 50 }, // Descripción
      { wch: 12 }, // Obligatorio
      { wch: 20 }  // Ejemplo
    ];
    XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones');

    // Agregar hoja de valores válidos
    const valoresValidos = [
      { Tipo: 'Categorías', Valores: VALID_VALUES.categorias.join(', ') },
      { Tipo: 'Unidades', Valores: VALID_VALUES.unidades.join(', ') },
      { Tipo: 'Estados', Valores: VALID_VALUES.estados.join(', ') },
      { Tipo: 'Métodos de Pago', Valores: VALID_VALUES.metodos_pago.join(', ') }
    ];

    const wsValores = XLSX.utils.json_to_sheet(valoresValidos);
    wsValores['!cols'] = [
      { wch: 15 }, // Tipo
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

// Función para validar datos de importación
export const validateImportData = (data, proyectos = [], proveedores = []) => {
  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 porque Excel empieza en 1 y tenemos header
    const rowErrors = [];

    // Validar campos obligatorios
    if (!row['Nombre del Suministro'] || String(row['Nombre del Suministro']).trim() === '') {
      rowErrors.push('Nombre del Suministro es obligatorio');
    }

    if (!row['Código'] || String(row['Código']).trim() === '') {
      rowErrors.push('Código es obligatorio');
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

    if (!row['Proyecto']) {
      rowErrors.push('Proyecto es obligatorio');
    }

    if (!row['Proveedor']) {
      rowErrors.push('Proveedor es obligatorio');
    }

    if (!row['Fecha Recibo']) {
      rowErrors.push('Fecha Recibo es obligatoria');
    } else {
      const fecha = new Date(row['Fecha Recibo']);
      if (isNaN(fecha.getTime())) {
        rowErrors.push('Fecha Recibo debe tener formato válido (YYYY-MM-DD)');
      }
    }

    if (!row['Número Recibo'] || String(row['Número Recibo']).trim() === '') {
      rowErrors.push('Número Recibo es obligatorio');
    }

    if (!row['Método de Pago'] || !VALID_VALUES.metodos_pago.includes(row['Método de Pago'])) {
      rowErrors.push(`Método de Pago debe ser uno de: ${VALID_VALUES.metodos_pago.join(', ')}`);
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
        nombre: String(row['Nombre del Suministro']).trim(),
        codigo_producto: String(row['Código']).trim(),
        descripcion_detallada: row['Descripción'] ? String(row['Descripción']).trim() : '',
        tipo_suministro: row['Categoría'],
        cantidad: Number(row['Cantidad']),
        unidad_medida: row['Unidad'],
        precio_unitario: Number(row['Precio Unitario']),
        estado: row['Estado'],
        proyecto_nombre: String(row['Proyecto']).trim(),
        proveedor_nombre: String(row['Proveedor']).trim(),
        fecha: row['Fecha Recibo'],
        folio: String(row['Número Recibo']).trim(),
        metodo_pago: row['Método de Pago']
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
