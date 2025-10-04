import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Función para formatear moneda
const formatCurrency = (value) => {
  if (!value || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(parseFloat(value));
};

// Función para formatear porcentaje
const formatPercentage = (value) => {
  if (!value || isNaN(value)) return '0.0%';
  return `${parseFloat(value).toFixed(1)}%`;
};

// Exportar reporte por tipo a PDF
export const exportReporteTipoPDF = async (estadisticas, suministros, filtros = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Configuración de colores
  const primaryColor = [59, 130, 246]; // Azul
  const secondaryColor = [34, 197, 94]; // Verde
  const grayColor = [107, 114, 128]; // Gris
  
  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text('Reporte de Análisis por Tipo de Gasto', pageWidth / 2, 30, { align: 'center' });
  
  // Subtítulo con fecha
  doc.setFontSize(12);
  doc.setTextColor(...grayColor);
  const fechaReporte = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Generado el ${fechaReporte}`, pageWidth / 2, 40, { align: 'center' });
  
  let yPosition = 60;
  
  // Procesar estadísticas
  if (estadisticas?.por_tipo && Array.isArray(estadisticas.por_tipo)) {
    const tipoData = estadisticas.por_tipo;
    const proyectoData = tipoData.find(item => item.tipo_categoria === 'Proyecto') || {};
    const adminData = tipoData.find(item => item.tipo_categoria === 'Administrativo') || {};
    
    const totalProyecto = parseFloat(proyectoData.total_costo) || 0;
    const totalAdmin = parseFloat(adminData.total_costo) || 0;
    const totalGeneral = totalProyecto + totalAdmin;
    
    const registrosProyecto = parseFloat(proyectoData.total_registros) || 0;
    const registrosAdmin = parseFloat(adminData.total_registros) || 0;
    const totalRegistros = registrosProyecto + registrosAdmin;
    
    const porcentajeProyecto = totalGeneral > 0 ? (totalProyecto / totalGeneral * 100) : 0;
    const porcentajeAdmin = totalGeneral > 0 ? (totalAdmin / totalGeneral * 100) : 0;
    
    // Resumen ejecutivo
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen Ejecutivo', 20, yPosition);
    yPosition += 20;
    
    // Tabla de resumen
    const resumenData = [
      ['Métrica', 'Gastos de Proyecto', 'Gastos Administrativos', 'Total'],
      ['Total Gastado', formatCurrency(totalProyecto), formatCurrency(totalAdmin), formatCurrency(totalGeneral)],
      ['Número de Registros', registrosProyecto.toString(), registrosAdmin.toString(), totalRegistros.toString()],
      ['Porcentaje del Total', formatPercentage(porcentajeProyecto), formatPercentage(porcentajeAdmin), '100.0%'],
      ['Promedio por Registro', 
       formatCurrency(registrosProyecto > 0 ? totalProyecto / registrosProyecto : 0),
       formatCurrency(registrosAdmin > 0 ? totalAdmin / registrosAdmin : 0),
       formatCurrency(totalRegistros > 0 ? totalGeneral / totalRegistros : 0)
      ]
    ];
    
    const tableResult = autoTable(doc, {
      head: [resumenData[0]],
      body: resumenData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right', fontStyle: 'bold' }
      }
    });
    
    yPosition = doc.lastAutoTable.finalY + 30;
    
    // Análisis y recomendaciones
    doc.setFontSize(16);
    doc.text('Análisis y Recomendaciones', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(11);
    
    // Análisis automático
    let analisis = [];
    
    if (totalProyecto > totalAdmin) {
      const diferencia = ((totalProyecto - totalAdmin) / totalAdmin * 100);
      analisis.push(`• Los gastos de proyecto superan a los administrativos en ${formatPercentage(diferencia)}.`);
    } else if (totalAdmin > totalProyecto) {
      const diferencia = ((totalAdmin - totalProyecto) / totalProyecto * 100);
      analisis.push(`• Los gastos administrativos superan a los de proyecto en ${formatPercentage(diferencia)}.`);
    } else {
      analisis.push('• Los gastos de proyecto y administrativos están equilibrados.');
    }
    
    if (porcentajeProyecto > 70) {
      analisis.push('• Alta inversión en proyectos - enfoque en crecimiento y desarrollo.');
    } else if (porcentajeProyecto < 30) {
      analisis.push('• Oportunidad de incrementar inversión en proyectos productivos.');
    }
    
    const promedioProyecto = registrosProyecto > 0 ? totalProyecto / registrosProyecto : 0;
    const promedioAdmin = registrosAdmin > 0 ? totalAdmin / registrosAdmin : 0;
    
    if (promedioProyecto > promedioAdmin * 2) {
      analisis.push('• Los gastos unitarios de proyecto son significativamente mayores.');
    }
    
    analisis.push(`• Eficiencia de inversión: ${formatPercentage(porcentajeProyecto)} del presupuesto en proyectos.`);
    
    // Mostrar análisis
    analisis.forEach(texto => {
      doc.text(texto, 20, yPosition);
      yPosition += 10;
    });
    
    // Nueva página para detalles
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 30;
    } else {
      yPosition += 20;
    }
    
    // Tabla detallada de suministros (top 10 por costo)
    if (suministros && suministros.length > 0) {
      doc.setFontSize(16);
      doc.text('Top 10 Suministros por Costo', 20, yPosition);
      yPosition += 15;
      
      const suministrosOrdenados = suministros
        .filter(s => s.costo_total || (s.cantidad && s.precio_unitario))
        .map(s => ({
          ...s,
          costo_calculado: s.costo_total || (parseFloat(s.cantidad || 0) * parseFloat(s.precio_unitario || 0))
        }))
        .sort((a, b) => b.costo_calculado - a.costo_calculado)
        .slice(0, 10);
      
      const detalleData = suministrosOrdenados.map(suministro => [
        suministro.nombre || 'Sin nombre',
        suministro.categoria?.tipo || 'N/A',
        suministro.categoria?.nombre || suministro.tipo_suministro || 'Sin categoría',
        formatCurrency(suministro.costo_calculado),
        suministro.estado || 'Sin estado'
      ]);
      
      autoTable(doc, {
        head: [['Nombre', 'Tipo', 'Categoría', 'Costo Total', 'Estado']],
        body: detalleData,
        startY: yPosition,
        theme: 'striped',
        headStyles: { 
          fillColor: secondaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 40 },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 25, halign: 'center' }
        }
      });
    }
    
    // Pie de página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10, { align: 'right' });
      doc.text('Sistema de Gestión V-Lock', 20, pageHeight - 10);
    }
  }
  
  // Guardar PDF
  const fileName = `reporte-analisis-tipo-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
};

// Exportar reporte por tipo a Excel
export const exportReporteTipoExcel = (estadisticas, suministros, filtros = {}) => {
  const workbook = XLSX.utils.book_new();
  
  // Procesar estadísticas
  if (estadisticas?.por_tipo && Array.isArray(estadisticas.por_tipo)) {
    const tipoData = estadisticas.por_tipo;
    const proyectoData = tipoData.find(item => item.tipo_categoria === 'Proyecto') || {};
    const adminData = tipoData.find(item => item.tipo_categoria === 'Administrativo') || {};
    
    const totalProyecto = parseFloat(proyectoData.total_costo) || 0;
    const totalAdmin = parseFloat(adminData.total_costo) || 0;
    const totalGeneral = totalProyecto + totalAdmin;
    
    const registrosProyecto = parseFloat(proyectoData.total_registros) || 0;
    const registrosAdmin = parseFloat(adminData.total_registros) || 0;
    const totalRegistros = registrosProyecto + registrosAdmin;
    
    const porcentajeProyecto = totalGeneral > 0 ? (totalProyecto / totalGeneral * 100) : 0;
    const porcentajeAdmin = totalGeneral > 0 ? (totalAdmin / totalGeneral * 100) : 0;
    
    // Hoja 1: Resumen Ejecutivo
    const resumenData = [
      ['REPORTE DE ANÁLISIS POR TIPO DE GASTO'],
      [`Generado el: ${new Date().toLocaleDateString('es-MX')}`],
      [''],
      ['RESUMEN EJECUTIVO'],
      [''],
      ['Métrica', 'Gastos de Proyecto', 'Gastos Administrativos', 'Total'],
      ['Total Gastado', totalProyecto, totalAdmin, totalGeneral],
      ['Número de Registros', registrosProyecto, registrosAdmin, totalRegistros],
      ['Porcentaje del Total (%)', porcentajeProyecto, porcentajeAdmin, 100],
      ['Promedio por Registro', 
       registrosProyecto > 0 ? totalProyecto / registrosProyecto : 0,
       registrosAdmin > 0 ? totalAdmin / registrosAdmin : 0,
       totalRegistros > 0 ? totalGeneral / totalRegistros : 0
      ],
      [''],
      ['ANÁLISIS'],
      totalProyecto > totalAdmin ? 
        [`Los gastos de proyecto superan a los administrativos en ${((totalProyecto - totalAdmin) / totalAdmin * 100).toFixed(1)}%`] :
        totalAdmin > totalProyecto ?
        [`Los gastos administrativos superan a los de proyecto en ${((totalAdmin - totalProyecto) / totalProyecto * 100).toFixed(1)}%`] :
        ['Los gastos de proyecto y administrativos están equilibrados'],
      [`Eficiencia de inversión: ${porcentajeProyecto.toFixed(1)}% del presupuesto en proyectos`]
    ];
    
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    
    // Formatear celdas de moneda
    if (!wsResumen['!cols']) wsResumen['!cols'] = [];
    wsResumen['!cols'][1] = { wch: 20 };
    wsResumen['!cols'][2] = { wch: 25 };
    wsResumen['!cols'][3] = { wch: 15 };
    
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
    
    // Hoja 2: Detalles por Tipo
    if (suministros && suministros.length > 0) {
      const detalleData = [
        ['DETALLE DE SUMINISTROS POR TIPO'],
        [''],
        ['Nombre', 'Tipo de Categoría', 'Categoría', 'Cantidad', 'Precio Unitario', 'Costo Total', 'Estado', 'Fecha', 'Proyecto']
      ];
      
      suministros.forEach(suministro => {
        const costoTotal = suministro.costo_total || (parseFloat(suministro.cantidad || 0) * parseFloat(suministro.precio_unitario || 0));
        detalleData.push([
          suministro.nombre || 'Sin nombre',
          suministro.categoria?.tipo || 'N/A',
          suministro.categoria?.nombre || suministro.tipo_suministro || 'Sin categoría',
          parseFloat(suministro.cantidad || 0),
          parseFloat(suministro.precio_unitario || 0),
          costoTotal,
          suministro.estado || 'Sin estado',
          suministro.fecha_necesaria || suministro.fecha || '',
          suministro.proyecto?.nombre || 'Sin proyecto'
        ]);
      });
      
      const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);
      
      // Configurar anchos de columna
      wsDetalle['!cols'] = [
        { wch: 40 }, // Nombre
        { wch: 15 }, // Tipo
        { wch: 20 }, // Categoría
        { wch: 10 }, // Cantidad
        { wch: 15 }, // Precio
        { wch: 15 }, // Costo Total
        { wch: 12 }, // Estado
        { wch: 12 }, // Fecha
        { wch: 25 }  // Proyecto
      ];
      
      XLSX.utils.book_append_sheet(workbook, wsDetalle, 'Detalle por Tipo');
    }
    
    // Hoja 3: Análisis de Categorías
    if (estadisticas.detalladas && Array.isArray(estadisticas.detalladas)) {
      const categoriaData = [
        ['ANÁLISIS POR CATEGORÍA'],
        [''],
        ['Categoría', 'Tipo', 'Registros', 'Costo Total', 'Promedio', '% del Total']
      ];
      
      estadisticas.detalladas.forEach(categoria => {
        const costoTotal = parseFloat(categoria.total_costo || 0);
        const registros = parseFloat(categoria.total_registros || 0);
        const promedio = registros > 0 ? costoTotal / registros : 0;
        const porcentaje = totalGeneral > 0 ? (costoTotal / totalGeneral * 100) : 0;
        
        categoriaData.push([
          categoria.nombre_categoria || 'Sin nombre',
          categoria.tipo_categoria || 'N/A',
          registros,
          costoTotal,
          promedio,
          porcentaje
        ]);
      });
      
      const wsCategoria = XLSX.utils.aoa_to_sheet(categoriaData);
      
      wsCategoria['!cols'] = [
        { wch: 25 }, // Categoría
        { wch: 15 }, // Tipo
        { wch: 10 }, // Registros
        { wch: 15 }, // Costo Total
        { wch: 15 }, // Promedio
        { wch: 12 }  // Porcentaje
      ];
      
      XLSX.utils.book_append_sheet(workbook, wsCategoria, 'Análisis Categorías');
    }
  }
  
  // Guardar archivo
  const fileName = `reporte-analisis-tipo-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
};