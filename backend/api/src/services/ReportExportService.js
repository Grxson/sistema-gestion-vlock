const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class ReportExportService {
  
  /**
   * Exportar dashboard de suministros a PDF
   */
  static async exportDashboardToPDF(dashboardData, filtros = {}) {
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      info: {
        Title: 'Dashboard de Suministros - VLock',
        Author: 'Sistema VLock',
        Subject: 'Reporte de Suministros y Materiales',
        Keywords: 'suministros, materiales, reporte, dashboard'
      }
    });

    // Configurar fuente
    doc.font('Helvetica');

    // Header
    this.addHeader(doc, 'DASHBOARD DE SUMINISTROS Y MATERIALES');
    
    // Información de filtros
    this.addFiltersInfo(doc, filtros);
    
    // Estadísticas generales
    this.addGeneralStats(doc, dashboardData.estadisticas);
    
    // Consumo por proyecto
    this.addProjectConsumption(doc, dashboardData.consumoPorObra);
    
    // Distribución por proveedores
    this.addProviderDistribution(doc, dashboardData.distribicionProveedores);
    
    // Materiales más utilizados
    this.addTopMaterials(doc, dashboardData.tiposMateriales);
    
    // Resumen por categorías
    this.addCategoryResume(doc, dashboardData.resumenCategorias);
    
    // Footer
    this.addFooter(doc);
    
    return doc;
  }

  /**
   * Exportar dashboard de suministros a Excel
   */
  static async exportDashboardToExcel(dashboardData, filtros = {}) {
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Resumen General
    const generalData = [
      ['DASHBOARD DE SUMINISTROS Y MATERIALES'],
      ['Generado:', new Date().toLocaleString()],
      [''],
      ['ESTADÍSTICAS GENERALES'],
      ['Total Gastado:', this.formatCurrency(dashboardData.estadisticas.totalGastado)],
      ['Total Registros:', dashboardData.estadisticas.totalRegistros],
      ['Total Proveedores:', dashboardData.estadisticas.totalProveedores],
      ['Total Proyectos:', dashboardData.estadisticas.totalProyectos]
    ];

    // Agregar filtros aplicados
    if (filtros.fecha_inicio || filtros.fecha_fin) {
      generalData.push(['']);
      generalData.push(['FILTROS APLICADOS']);
      if (filtros.fecha_inicio) generalData.push(['Fecha Inicio:', filtros.fecha_inicio]);
      if (filtros.fecha_fin) generalData.push(['Fecha Fin:', filtros.fecha_fin]);
      if (filtros.id_proyecto) generalData.push(['Proyecto ID:', filtros.id_proyecto]);
      if (filtros.id_proveedor) generalData.push(['Proveedor ID:', filtros.id_proveedor]);
      if (filtros.categoria) generalData.push(['Categoría:', filtros.categoria]);
    }

    const generalSheet = XLSX.utils.aoa_to_sheet(generalData);
    XLSX.utils.book_append_sheet(workbook, generalSheet, 'Resumen General');

    // Hoja 2: Consumo por Proyecto
    const projectData = [
      ['CONSUMO POR PROYECTO'],
      ['Proyecto', 'Ubicación', 'Total Cantidad', 'Total Costo', 'Registros']
    ];
    
    dashboardData.consumoPorObra.forEach(item => {
      projectData.push([
        item.obra,
        item.ubicacion || 'N/A',
        item.total_cantidad,
        item.total_costo,
        item.total_registros
      ]);
    });

    const projectSheet = XLSX.utils.aoa_to_sheet(projectData);
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'Consumo por Proyecto');

    // Hoja 3: Distribución por Proveedores
    const providerData = [
      ['DISTRIBUCIÓN POR PROVEEDORES'],
      ['Proveedor', 'Tipo', 'Entregas', 'Total Cantidad', 'Total Costo']
    ];
    
    dashboardData.distribicionProveedores.forEach(item => {
      providerData.push([
        item.proveedor,
        item.tipo_proveedor || 'N/A',
        item.total_entregas,
        item.total_cantidad,
        item.total_costo
      ]);
    });

    const providerSheet = XLSX.utils.aoa_to_sheet(providerData);
    XLSX.utils.book_append_sheet(workbook, providerSheet, 'Distribución Proveedores');

    // Hoja 4: Materiales más utilizados
    const materialsData = [
      ['MATERIALES MÁS UTILIZADOS'],
      ['Descripción', 'Categoría', 'Unidad', 'Frecuencia', 'Total Cantidad', 'Total Costo', 'Precio Promedio']
    ];
    
    dashboardData.tiposMateriales.forEach(item => {
      materialsData.push([
        item.descripcion,
        item.categoria || 'N/A',
        item.unidad_medida || 'N/A',
        item.frecuencia,
        item.total_cantidad,
        item.total_costo,
        item.precio_promedio
      ]);
    });

    const materialsSheet = XLSX.utils.aoa_to_sheet(materialsData);
    XLSX.utils.book_append_sheet(workbook, materialsSheet, 'Top Materiales');

    // Hoja 5: Resumen por Categorías
    const categoryData = [
      ['RESUMEN POR CATEGORÍAS'],
      ['Categoría', 'Total Registros', 'Total Cantidad', 'Total Costo']
    ];
    
    dashboardData.resumenCategorias.forEach(item => {
      categoryData.push([
        item.categoria || 'Sin categoría',
        item.total_registros,
        item.total_cantidad,
        item.total_costo
      ]);
    });

    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Resumen Categorías');

    return workbook;
  }

  // Métodos auxiliares para PDF
  static addHeader(doc, title) {
    doc.fontSize(18).font('Helvetica-Bold').text(title, 50, 50, { align: 'center' });
    doc.moveTo(50, 80).lineTo(550, 80).stroke();
    doc.moveDown(2);
  }

  static addFiltersInfo(doc, filtros) {
    if (Object.keys(filtros).length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Filtros Aplicados:', { underline: true });
      doc.font('Helvetica').fontSize(10);
      
      if (filtros.fecha_inicio) doc.text(`• Fecha inicio: ${filtros.fecha_inicio}`);
      if (filtros.fecha_fin) doc.text(`• Fecha fin: ${filtros.fecha_fin}`);
      if (filtros.id_proyecto) doc.text(`• Proyecto ID: ${filtros.id_proyecto}`);
      if (filtros.id_proveedor) doc.text(`• Proveedor ID: ${filtros.id_proveedor}`);
      if (filtros.categoria) doc.text(`• Categoría: ${filtros.categoria}`);
      
      doc.moveDown();
    }
  }

  static addGeneralStats(doc, stats) {
    doc.fontSize(14).font('Helvetica-Bold').text('Estadísticas Generales', { underline: true });
    doc.font('Helvetica').fontSize(11);
    
    doc.text(`💰 Total Gastado: ${this.formatCurrency(stats.totalGastado)}`);
    doc.text(`📊 Total Registros: ${stats.totalRegistros.toLocaleString()}`);
    doc.text(`🏢 Total Proveedores: ${stats.totalProveedores}`);
    doc.text(`🏗️ Total Proyectos: ${stats.totalProyectos}`);
    
    doc.moveDown(1.5);
  }

  static addProjectConsumption(doc, consumoPorObra) {
    if (consumoPorObra.length === 0) return;
    
    doc.fontSize(14).font('Helvetica-Bold').text('Consumo por Proyecto', { underline: true });
    doc.font('Helvetica').fontSize(10);
    
    consumoPorObra.slice(0, 10).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.obra}`);
      doc.text(`   💰 Costo: ${this.formatCurrency(item.total_costo)}`);
      doc.text(`   📦 Cantidad: ${item.total_cantidad.toLocaleString()}`);
      doc.text(`   📋 Registros: ${item.total_registros}`);
      doc.moveDown(0.5);
    });
    
    doc.moveDown();
  }

  static addProviderDistribution(doc, distribucionProveedores) {
    if (distribucionProveedores.length === 0) return;
    
    doc.fontSize(14).font('Helvetica-Bold').text('Top Proveedores', { underline: true });
    doc.font('Helvetica').fontSize(10);
    
    distribucionProveedores.slice(0, 10).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.proveedor} (${item.tipo_proveedor || 'N/A'})`);
      doc.text(`   💰 Costo: ${this.formatCurrency(item.total_costo)}`);
      doc.text(`   🚚 Entregas: ${item.total_entregas}`);
      doc.moveDown(0.5);
    });
    
    doc.moveDown();
  }

  static addTopMaterials(doc, tiposMateriales) {
    if (tiposMateriales.length === 0) return;
    
    doc.fontSize(14).font('Helvetica-Bold').text('Materiales Más Utilizados', { underline: true });
    doc.font('Helvetica').fontSize(10);
    
    tiposMateriales.slice(0, 10).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.descripcion}`);
      doc.text(`   📂 Categoría: ${item.categoria || 'N/A'}`);
      doc.text(`   🔄 Frecuencia: ${item.frecuencia} veces`);
      doc.text(`   💰 Total: ${this.formatCurrency(item.total_costo)}`);
      doc.moveDown(0.5);
    });
    
    doc.moveDown();
  }

  static addCategoryResume(doc, resumenCategorias) {
    if (resumenCategorias.length === 0) return;
    
    doc.fontSize(14).font('Helvetica-Bold').text('Resumen por Categorías', { underline: true });
    doc.font('Helvetica').fontSize(10);
    
    resumenCategorias.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.categoria || 'Sin categoría'}`);
      doc.text(`   📋 Registros: ${item.total_registros}`);
      doc.text(`   💰 Costo: ${this.formatCurrency(item.total_costo)}`);
      doc.moveDown(0.5);
    });
  }

  static addFooter(doc) {
    const currentDate = new Date().toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.fontSize(8).font('Helvetica').text(
      `Reporte generado el ${currentDate} por Sistema VLock`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
  }

  static formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  }
}

module.exports = ReportExportService;
