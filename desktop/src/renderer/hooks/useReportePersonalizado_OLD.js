import { useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const useReportePersonalizado = () => {
  const { showSuccess, showError } = useToast();
  const previewRef = useRef(null);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  const [reportConfig, setReportConfig] = useState({
    title: 'Reporte de Suministros Detallado',
    subtitle: 'Sistema de Gestión VLock',
    includeStatistics: true,
    includeTable: true,
    includeCharts: true,
    tableFormat: 'enumerated',
    charts: {
      gastosPorMes: true,
      valorPorCategoria: true,
      suministrosPorMes: true,
      gastosPorProyecto: false,
      gastosPorProveedor: false,
      cantidadPorEstado: false,
      distribucionTipos: true,
      tendenciaEntregas: false,
      codigosProducto: false
    }
  });

  const handleCustomExport = async (format, suministrosData, filtros, proyectos, proveedores) => {
    try {
      console.log('Iniciando exportación personalizada:', { format, dataLength: suministrosData.length });
      
      // Preparar datos para el reporte
      const dataToExport = suministrosData.map((suministro, index) => ({
        ...suministro,
        numero_fila: index + 1,
        proyecto: proyectos.find(p => p.id_proyecto === suministro.id_proyecto)?.nombre || '',
        proveedor: proveedores.find(p => p.id_proveedor === suministro.id_proveedor)?.nombre || ''
      }));

      // Calcular estadísticas
      const statistics = {
        total: suministrosData.length,
        totalValue: suministrosData.reduce((sum, s) => sum + (parseFloat(s.precio_unitario) * parseFloat(s.cantidad)), 0),
        byCategory: suministrosData.reduce((acc, s) => {
          acc[s.tipo_suministro] = (acc[s.tipo_suministro] || 0) + 1;
          return acc;
        }, {}),
        lowStock: suministrosData.filter(s => s.stock_minimo && parseFloat(s.cantidad) < parseFloat(s.stock_minimo)).length,
        highValue: suministrosData.filter(s => (parseFloat(s.precio_unitario) * parseFloat(s.cantidad)) > 1000000).length
      };

      if (format === 'pdf') {
        await exportToPDF(dataToExport, statistics, reportConfig, filtros);
      } else if (format === 'excel') {
        await exportToExcel(dataToExport, statistics, reportConfig, filtros);
      }

      setShowReportModal(false);
      showSuccess('Exportación exitosa', `El reporte personalizado en ${format.toUpperCase()} ha sido generado`);

    } catch (error) {
      console.error(`Error exportando reporte personalizado a ${format}:`, error);
      showError('Error', `No se pudo generar el reporte personalizado en ${format.toUpperCase()}: ${error.message}`);
    }
  };

  // Función para generar HTML del reporte con gráficas
  const generateReportHTML = async (data, statistics, config, selectedCharts, chartData) => {
    // Función para obtener títulos de gráficas
    const getChartTitle = (chartId) => {
      const titles = {
        gastosPorMes: 'Gastos por Mes',
        valorPorCategoria: 'Valor por Categoría',
        suministrosPorMes: 'Suministros por Mes',
        gastosPorProyecto: 'Gastos por Proyecto',
        gastosPorProveedor: 'Gastos por Proveedor',
        cantidadPorEstado: 'Cantidad por Estado',
        distribucionTipos: 'Distribución por Tipos',
        tendenciaEntregas: 'Tendencia de Entregas',
        codigosProducto: 'Códigos de Producto'
      };
      return titles[chartId] || 'Gráfica';
    };

    // Calcular métricas adicionales precisas
    const totalGastado = data.reduce((sum, item) => sum + (parseFloat(item.precio_unitario) * parseFloat(item.cantidad)), 0);
    const totalRegistros = data.length;
    
    // Calcular categorías
    const categorias = data.reduce((acc, item) => {
      const cat = item.tipo_suministro || 'Sin categoría';
      acc[cat] = (acc[cat] || 0) + (parseFloat(item.precio_unitario) * parseFloat(item.cantidad));
      return acc;
    }, {});
    
    const categoriaMasGasto = Object.entries(categorias).reduce((max, [cat, gasto]) => 
      gasto > max.gasto ? { categoria: cat, gasto } : max, { categoria: '', gasto: 0 });

    // Calcular proveedores
    const proveedores = data.reduce((acc, item) => {
      const prov = item.nombre_proveedor || 'Sin proveedor';
      acc[prov] = (acc[prov] || 0) + (parseFloat(item.precio_unitario) * parseFloat(item.cantidad));
      return acc;
    }, {});

    const proveedorMasGasto = Object.entries(proveedores).reduce((max, [prov, gasto]) => 
      gasto > max.gasto ? { proveedor: prov, gasto } : max, { proveedor: '', gasto: 0 });

    // Estadísticas adicionales
    const totalProveedores = Object.keys(proveedores).length;
    const totalCategorias = Object.keys(categorias).length;
    const promedioGastoPorSuministro = totalRegistros > 0 ? totalGastado / totalRegistros : 0;
    const suministrosConStock = data.filter(item => parseFloat(item.cantidad) > 0).length;
    const porcentajeConStock = totalRegistros > 0 ? (suministrosConStock / totalRegistros) * 100 : 0;

    return `
          return \`
      <div style="width: 210mm; min-height: 297mm; font-family: Arial, sans-serif; color: #333; background: white; margin: 0; padding: 0;">
        <!-- PORTADA -->
        <div style="width: 100%; height: 297mm; text-align: center; padding: 80px 40px; box-sizing: border-box;">
          <div style="width: 60px; height: 60px; background: #3b82f6; border-radius: 50%; margin: 0 auto 40px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">VL</span>
          </div>
          <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 20px 0; line-height: 1.2;">
            Reporte de Gastos
          </h1>
          <p style="font-size: 16px; color: #6b7280; margin: 20px 0;">Sistema de Gestión de Suministros</p>
          <div style="width: 60%; height: 2px; background: #e5e7eb; margin: 40px auto;"></div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 40px;">
            Reporte generado el \${new Date().toLocaleDateString('es-ES', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>

        <!-- PÁGINA DE CONTENIDO -->
        <div style="width: 100%; min-height: 297mm; padding: 40px; box-sizing: border-box; page-break-before: always;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            📊 Resumen Ejecutivo
          </h2>
          
          <!-- Estadísticas principales -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="width: 33%; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center;">
                <h3 style="font-size: 12px; color: #64748b; margin: 0 0 10px 0; font-weight: bold;">💰 TOTAL GASTADO</h3>
                <p style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0;">\$\${totalGastado.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </td>
              <td style="width: 33%; padding: 20px; background: #f0fdf4; border: 1px solid #e2e8f0; text-align: center;">
                <h3 style="font-size: 12px; color: #16a34a; margin: 0 0 10px 0; font-weight: bold;">📈 CATEGORÍA TOP</h3>
                <p style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0;">\${categoriaMasGasto.categoria}</p>
                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0;">\$\${categoriaMasGasto.gasto.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </td>
              <td style="width: 33%; padding: 20px; background: #fef3c7; border: 1px solid #e2e8f0; text-align: center;">
                <h3 style="font-size: 12px; color: #d97706; margin: 0 0 10px 0; font-weight: bold;">🏢 PROVEEDOR TOP</h3>
                <p style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0;">\${proveedorMasGasto.proveedor}</p>
                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0;">\$\${proveedorMasGasto.gasto.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </td>
            </tr>
          </table>

          \${config.includeStatistics ? \`
          <!-- Estadísticas Generales -->
          <h2 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 40px 0 20px 0;">
            📊 Estadísticas Generales
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="width: 25%; padding: 15px; background: #dbeafe; border: 1px solid #bfdbfe; text-align: center;">
                <h4 style="font-size: 10px; color: #1e40af; margin: 0 0 8px 0; font-weight: bold;">REGISTROS</h4>
                <p style="font-size: 16px; font-weight: bold; color: #1e3a8a; margin: 0;">\${totalRegistros.toLocaleString('es-CO')}</p>
              </td>
              <td style="width: 25%; padding: 15px; background: #dcfce7; border: 1px solid #bbf7d0; text-align: center;">
                <h4 style="font-size: 10px; color: #16a34a; margin: 0 0 8px 0; font-weight: bold;">TOTAL GASTADO</h4>
                <p style="font-size: 16px; font-weight: bold; color: #15803d; margin: 0;">\$\${totalGastado.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </td>
              <td style="width: 25%; padding: 15px; background: #fef3c7; border: 1px solid #fde68a; text-align: center;">
                <h4 style="font-size: 10px; color: #d97706; margin: 0 0 8px 0; font-weight: bold;">PROVEEDORES</h4>
                <p style="font-size: 16px; font-weight: bold; color: #b45309; margin: 0;">\${totalProveedores}</p>
              </td>
              <td style="width: 25%; padding: 15px; background: #f3e8ff; border: 1px solid #e9d5ff; text-align: center;">
                <h4 style="font-size: 10px; color: #9333ea; margin: 0 0 8px 0; font-weight: bold;">CATEGORÍAS</h4>
                <p style="font-size: 16px; font-weight: bold; color: #7c3aed; margin: 0;">\${totalCategorias}</p>
              </td>
            </tr>
          </table>
          \` : ''}

          \${config.includeTable ? \`
          <!-- Tabla de Suministros -->
          <h2 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 40px 0 20px 0;">
            📋 Detalle de Suministros
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="background: #f1f5f9;">
                \${config.tableFormat === 'enumerated' ? '<th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; width: 4%;">#</th>' : ''}
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; font-weight: bold; width: 35%;">Nombre</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; font-weight: bold; width: 15%;">Categoría</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; font-weight: bold; width: 20%;">Proveedor</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; width: 6%;">Cant.</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; width: 6%;">Unidad</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: right; font-weight: bold; width: 7%;">Precio Unit.</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: right; font-weight: bold; width: 7%;">Total</th>
              </tr>
            </thead>
            <tbody>
              \${data.slice(0, 50).map((item, index) => \`
                <tr style="background: \${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  \${config.tableFormat === 'enumerated' ? \`<td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; font-size: 8px;">\${index + 1}</td>\` : ''}
                  <td style="border: 1px solid #cbd5e1; padding: 5px; font-size: 8px;">\${item.nombre_suministro || item.descripcion || item.nombre || 'Sin nombre'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; font-size: 8px;">\${item.categoria || item.tipo_suministro || 'Sin categoría'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; font-size: 8px;">\${item.nombre_proveedor || item.proveedor || 'Sin proveedor'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; font-size: 8px;">\${(parseFloat(item.cantidad) || 0).toLocaleString('es-CO', {maximumFractionDigits: 2})}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; font-size: 8px;">\${item.unidad_medida || item.unidad || 'N/A'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: right; font-size: 8px;">\$\${(parseFloat(item.precio_unitario) || 0).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: right; font-weight: bold; font-size: 8px;">\$\${((parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0)).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
          \${data.length > 50 ? \`<p style="font-size: 9px; color: #6b7280; margin-top: 15px; text-align: center;">Mostrando primeros 50 registros de \${data.length} total.</p>\` : ''}
          \` : ''}

          \${selectedCharts && selectedCharts.length > 0 ? \`
          <div style="margin-top: 40px;">
            <h2 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 20px;">
              📊 Análisis Gráfico
            </h2>
            \${selectedCharts.map((chartId, index) => \`
              <div style="margin-bottom: 30px; text-align: center;">
                <h3 style="font-size: 14px; font-weight: bold; color: #374151; margin-bottom: 15px;">
                  \${getChartTitle(chartId)}
                </h3>
                <div id="chart-\${chartId}" style="width: 100%; height: 300px; background: #f9fafb; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center;">
                  <canvas id="canvas-\${chartId}" width="600" height="300"></canvas>
                </div>
              </div>
            \`).join('')}
          </div>
          \` : ''}
        </div>
      </div>
    \`;
          <!-- Resumen Ejecutivo -->
          <div style="margin-bottom: 40px;">
            <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
              📊 Resumen Ejecutivo
            </h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <h3 style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">💰 TOTAL GASTADO</h3>
                <p style="font-size: 24px; font-weight: bold; color: #1f2937;">$${totalGastado.toLocaleString('es-CO')}</p>
              </div>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                <h3 style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">📈 CATEGORÍA TOP</h3>
                <p style="font-size: 16px; font-weight: bold; color: #1f2937;">${categoriaMasGasto.categoria}</p>
                <p style="font-size: 14px; color: #6b7280;">$${categoriaMasGasto.gasto.toLocaleString('es-CO')}</p>
              </div>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h3 style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">🏢 PROVEEDOR TOP</h3>
                <p style="font-size: 16px; font-weight: bold; color: #1f2937;">${proveedorMasGasto.proveedor}</p>
                <p style="font-size: 14px; color: #6b7280;">$${proveedorMasGasto.gasto.toLocaleString('es-CO')}</p>
              </div>
            </div>
          </div>

          ${config.includeStatistics ? `
          <!-- Estadísticas Generales -->
          <div style="margin-bottom: 40px;">
            <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 20px;">
              � Estadísticas Generales
            </h2>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
              <div style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6;">
                <h4 style="font-size: 12px; color: #1e40af; margin-bottom: 5px; font-weight: bold;">NÚMERO DE REGISTROS</h4>
                <p style="font-size: 20px; font-weight: bold; color: #1e3a8a;">${totalRegistros.toLocaleString('es-CO')}</p>
              </div>
              <div style="background: #dcfce7; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #10b981;">
                <h4 style="font-size: 12px; color: #16a34a; margin-bottom: 5px; font-weight: bold;">TOTAL GASTADO</h4>
                <p style="font-size: 20px; font-weight: bold; color: #15803d;">$${totalGastado.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #f59e0b;">
                <h4 style="font-size: 12px; color: #d97706; margin-bottom: 5px; font-weight: bold;">PROVEEDORES ACTIVOS</h4>
                <p style="font-size: 20px; font-weight: bold; color: #b45309;">${totalProveedores}</p>
              </div>
              <div style="background: #f3e8ff; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #9333ea;">
                <h4 style="font-size: 12px; color: #9333ea; margin-bottom: 5px; font-weight: bold;">CATEGORÍAS</h4>
                <p style="font-size: 20px; font-weight: bold; color: #7c3aed;">${totalCategorias}</p>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
              <div style="background: #fef2f2; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #ef4444;">
                <h4 style="font-size: 12px; color: #dc2626; margin-bottom: 5px; font-weight: bold;">PROMEDIO POR SUMINISTRO</h4>
                <p style="font-size: 18px; font-weight: bold; color: #991b1b;">$${promedioGastoPorSuministro.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #22c55e;">
                <h4 style="font-size: 12px; color: #16a34a; margin-bottom: 5px; font-weight: bold;">SUMINISTROS CON STOCK</h4>
                <p style="font-size: 18px; font-weight: bold; color: #15803d;">${suministrosConStock} (${porcentajeConStock.toLocaleString('es-CO', {minimumFractionDigits: 1, maximumFractionDigits: 1})}%)</p>
              </div>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #64748b;">
                <h4 style="font-size: 12px; color: #475569; margin-bottom: 5px; font-weight: bold;">TIPO MÁS USADO</h4>
                <p style="font-size: 16px; font-weight: bold; color: #334155; line-height: 1.2;">${categoriaMasGasto.categoria}</p>
                <p style="font-size: 12px; color: #64748b;">$${categoriaMasGasto.gasto.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
            </div>
          </div>
          ` : ''}

          ${config.includeTable ? `
          <!-- Tabla de Suministros -->
          <div style="margin: 0 -40px 40px -40px; page-break-inside: avoid;">
            <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 40px 20px 40px;">
              📋 Detalle de Suministros
            </h2>
            <div style="overflow-x: auto; padding: 0 40px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed;">
                <thead>
                  <tr style="background: #f9fafb;">
                    ${config.tableFormat === 'enumerated' ? '<th style="border: 1px solid #d1d5db; padding: 6px; text-align: center; font-weight: bold; width: 5%;">#</th>' : ''}
                    <th style="border: 1px solid #d1d5db; padding: 6px; text-align: left; font-weight: bold; width: 30%;">Nombre</th>
                    <th style="border: 1px solid #d1d5db; padding: 6px; text-align: left; font-weight: bold; width: 15%;">Categoría</th>
                    <th style="border: 1px solid #d1d5db; padding: 6px; text-align: left; font-weight: bold; width: 20%;">Proveedor</th>
                    <th style="border: 1px solid #d1d5db; padding: 6px; text-align: center; font-weight: bold; width: 6%;">Cant.</th>
                    <th style="border: 1px solid #d1d5db; padding: 6px; text-align: center; font-weight: bold; width: 6%;">Unidad</th>
                    <th style="border: 1px solid #d1d5db; padding: 6px; text-align: right; font-weight: bold; width: 9%;">Precio Unit.</th>
                    <th style="border: 1px solid #d1d5db; padding: 6px; text-align: right; font-weight: bold; width: 9%;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.slice(0, 50).map((item, index) => `
                    <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                      ${config.tableFormat === 'enumerated' ? `<td style="border: 1px solid #d1d5db; padding: 6px; text-align: center; font-size: 10px;">${index + 1}</td>` : ''}
                      <td style="border: 1px solid #d1d5db; padding: 6px; font-size: 10px; word-wrap: break-word;">${item.nombre_suministro || item.descripcion || item.nombre || 'Sin nombre'}</td>
                      <td style="border: 1px solid #d1d5db; padding: 6px; font-size: 10px;">${item.categoria || item.tipo_suministro || 'Sin categoría'}</td>
                      <td style="border: 1px solid #d1d5db; padding: 6px; font-size: 10px; word-wrap: break-word;">${item.nombre_proveedor || item.proveedor || 'Sin proveedor'}</td>
                      <td style="border: 1px solid #d1d5db; padding: 6px; text-align: center; font-size: 10px;">${(parseFloat(item.cantidad) || 0).toLocaleString('es-CO', {maximumFractionDigits: 2})}</td>
                      <td style="border: 1px solid #d1d5db; padding: 6px; text-align: center; font-size: 10px;">${item.unidad_medida || item.unidad || 'N/A'}</td>
                      <td style="border: 1px solid #d1d5db; padding: 6px; text-align: right; font-size: 10px;">$${(parseFloat(item.precio_unitario) || 0).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td style="border: 1px solid #d1d5db; padding: 6px; text-align: right; font-weight: bold; font-size: 10px;">$${((parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0)).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${data.length > 50 ? `<p style="font-size: 10px; color: #6b7280; margin-top: 10px; text-align: center;">Mostrando primeros 50 registros de ${data.length} total.</p>` : ''}
            </div>
          </div>
          ` : ''}

          <!-- Espacio para gráficas -->
          ${selectedCharts && selectedCharts.length > 0 ? `
          <div style="margin-bottom: 40px;">
            <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 20px;">
              📊 Análisis Gráfico
            </h2>
            <div id="charts-container" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
              ${selectedCharts.map((chartId, index) => `
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <h3 style="font-size: 14px; font-weight: bold; color: #374151; margin-bottom: 15px; text-align: center;">
                    ${getChartTitle(chartId)}
                  </h3>
                  <div id="chart-${chartId}" style="width: 100%; height: 250px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 4px;">
                    <canvas id="canvas-${chartId}" width="300" height="200"></canvas>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  };
  const exportToPDFWithCharts = async (data, statistics, config, filtros, selectedCharts, chartData) => {
    try {
      console.log('🚀 Iniciando exportación PDF mejorada...', {
        dataCount: data.length,
        chartsCount: selectedCharts?.length || 0,
        config
      });

      // Crear un contenedor temporal optimizado
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm';
      tempContainer.style.background = 'white';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.fontSize = '12px';
      tempContainer.style.lineHeight = '1.4';
      tempContainer.style.color = '#333';
      document.body.appendChild(tempContainer);

      // Generar el HTML optimizado
      const reportHTML = await generateReportHTML(data, statistics, config, selectedCharts, chartData);
      tempContainer.innerHTML = reportHTML;

      // Esperar que el DOM se actualice
      await new Promise(resolve => setTimeout(resolve, 500));

      // Si hay gráficas, generarlas una por una
      if (selectedCharts && selectedCharts.length > 0 && chartData) {
        console.log('📊 Generando gráficas...', selectedCharts);
        
        for (const chartId of selectedCharts) {
          try {
            const canvasElement = tempContainer.querySelector(`#canvas-${chartId}`);
            if (canvasElement && chartData[chartId]) {
              const Chart = (await import('chart.js/auto')).default;
              
              const ctx = canvasElement.getContext('2d');
              const chartInstance = new Chart(ctx, {
                type: chartData[chartId].type || 'bar',
                data: chartData[chartId].data || { labels: [], datasets: [] },
                options: {
                  responsive: false,
                  animation: false,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        fontSize: 10,
                        padding: 10
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        fontSize: 9
                      }
                    },
                    y: {
                      ticks: {
                        fontSize: 9
                      }
                    }
                  }
                }
              });
              
              // Esperar que la gráfica se renderice
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.warn(`⚠️ Error generando gráfica ${chartId}:`, error);
          }
        }
        
        // Esperar adicional para todas las gráficas
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      console.log('📸 Capturando contenido con html2canvas...');

      // Usar html2canvas con configuración optimizada
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      console.log('📄 Generando PDF...');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 0.8);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calcular proporción para ajustar al ancho de la página
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      
      // Si la imagen es más alta que una página, dividirla
      if (scaledHeight > pdfHeight) {
        let yPosition = 0;
        let pageCount = 0;
        
        while (yPosition < scaledHeight) {
          if (pageCount > 0) {
            pdf.addPage();
          }
          
          const sourceY = yPosition / ratio;
          const remainingHeight = scaledHeight - yPosition;
          const pageHeight = Math.min(pdfHeight, remainingHeight);
          const sourceHeight = pageHeight / ratio;
          
          // Crear canvas temporal para esta sección
          const sectionCanvas = document.createElement('canvas');
          sectionCanvas.width = imgWidth;
          sectionCanvas.height = sourceHeight;
          const sectionCtx = sectionCanvas.getContext('2d');
          
          sectionCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
          const sectionImgData = sectionCanvas.toDataURL('image/png', 0.8);
          
          pdf.addImage(sectionImgData, 'PNG', 0, 0, pdfWidth, pageHeight);
          
          yPosition += pdfHeight;
          pageCount++;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
      }

      // Limpiar el contenedor temporal
      document.body.removeChild(tempContainer);

      // Guardar PDF con nombre descriptivo
      const fileName = `Reporte_de_Gastos_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.pdf`;
      pdf.save(fileName);

      console.log('✅ PDF generado exitosamente:', fileName);
      return { success: true, fileName };

    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      
      // Limpiar si hay error
      const tempContainer = document.querySelector('div[style*="position: absolute"][style*="left: -9999px"]');
      if (tempContainer) {
        document.body.removeChild(tempContainer);
      }
      
      throw new Error(`Error al generar el PDF: ${error.message}`);
    }
  };

      // Limpiar
      document.body.removeChild(tempContainer);

    } catch (error) {
      console.error('Error exportando PDF con gráficas:', error);
      throw error;
    }
  };

  // Función para exportar a PDF usando html2canvas + jsPDF con preview
  const exportToPDF = async (data, statistics, config, filtros, chartsData = {}) => {
    try {
      // Detectar tema oscuro
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                        window.matchMedia('(prefers-color-scheme: dark)').matches;

      // Crear un elemento temporal para renderizar el reporte
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '1200px'; // Ancho fijo para consistencia
      tempDiv.style.backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';
      
      // Agregar el contenido del reporte
      const reportContent = `
        <div style="background: ${isDarkMode ? '#1f2937' : '#ffffff'}; padding: 32px; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif;">
          <!-- Encabezado -->
          <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};">
            <h1 style="font-size: 28px; font-weight: bold; color: ${isDarkMode ? '#ffffff' : '#111827'}; margin-bottom: 8px;">
              ${config.title || 'Reporte de Suministros'}
            </h1>
            ${config.subtitle ? `
              <h2 style="font-size: 18px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; margin-bottom: 8px;">
                ${config.subtitle}
              </h2>
            ` : ''}
            <p style="font-size: 14px; color: ${isDarkMode ? '#6b7280' : '#9ca3af'};">
              Generado el: ${new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          ${config.includeStatistics ? `
          <!-- Estadísticas -->
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 24px; font-weight: 600; color: ${isDarkMode ? '#ffffff' : '#111827'}; margin-bottom: 24px;">
              Estadísticas Generales
            </h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 24px;">
              <div style="background: ${isDarkMode ? '#1e3a8a20' : '#dbeafe'}; padding: 16px; border-radius: 8px;">
                <h4 style="font-size: 14px; font-weight: 500; color: ${isDarkMode ? '#60a5fa' : '#2563eb'};">Total Suministros</h4>
                <p style="font-size: 24px; font-weight: bold; color: ${isDarkMode ? '#bfdbfe' : '#1e40af'};">
                  ${statistics.total.toLocaleString()}
                </p>
              </div>
              <div style="background: ${isDarkMode ? '#14532d20' : '#dcfce7'}; padding: 16px; border-radius: 8px;">
                <h4 style="font-size: 14px; font-weight: 500; color: ${isDarkMode ? '#4ade80' : '#16a34a'};">Valor Total</h4>
                <p style="font-size: 24px; font-weight: bold; color: ${isDarkMode ? '#bbf7d0' : '#15803d'};">
                  $${statistics.totalValue.toLocaleString('es-CO')}
                </p>
              </div>
              <div style="background: ${isDarkMode ? '#92400e20' : '#fef3c7'}; padding: 16px; border-radius: 8px;">
                <h4 style="font-size: 14px; font-weight: 500; color: ${isDarkMode ? '#fbbf24' : '#d97706'};">Stock Bajo</h4>
                <p style="font-size: 24px; font-weight: bold; color: ${isDarkMode ? '#fde68a' : '#b45309'};">
                  ${statistics.lowStock}
                </p>
              </div>
              <div style="background: ${isDarkMode ? '#581c8720' : '#f3e8ff'}; padding: 16px; border-radius: 8px;">
                <h4 style="font-size: 14px; font-weight: 500; color: ${isDarkMode ? '#a855f7' : '#9333ea'};">Alto Valor</h4>
                <p style="font-size: 24px; font-weight: bold; color: ${isDarkMode ? '#d8b4fe' : '#7c3aed'};">
                  ${statistics.highValue}
                </p>
              </div>
            </div>
          </div>
          ` : ''}

          ${config.includeTable && data.length > 0 ? `
          <!-- Tabla -->
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 24px; font-weight: 600; color: ${isDarkMode ? '#ffffff' : '#111827'}; margin-bottom: 24px;">
              Detalle de Suministros (${Math.min(data.length, 50)} de ${data.length})
            </h3>
            <table style="width: 100%; border-collapse: collapse; background: ${isDarkMode ? '#374151' : '#ffffff'}; border: 1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'};">
              <thead style="background: ${isDarkMode ? '#4b5563' : '#f9fafb'};">
                <tr>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    ${config.tableFormat === 'enumerated' ? '#' : 'ID'}
                  </th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    Descripción
                  </th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    Tipo
                  </th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    Cantidad
                  </th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    Precio
                  </th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    Proyecto
                  </th>
                </tr>
              </thead>
              <tbody>
                ${data.slice(0, 50).map((item, index) => `
                  <tr style="border-bottom: 1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'};">
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      ${config.tableFormat === 'enumerated' ? item.numero_fila : item.id_suministro}
                    </td>
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      ${(item.descripcion || '').substring(0, 40)}${(item.descripcion || '').length > 40 ? '...' : ''}
                    </td>
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      ${item.tipo_suministro || ''}
                    </td>
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      ${(parseFloat(item.cantidad) || 0).toLocaleString()} ${item.unidad || ''}
                    </td>
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      $${(parseFloat(item.precio_unitario) || 0).toLocaleString('es-CO')}
                    </td>
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      ${(item.proyecto || '').substring(0, 20)}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <!-- Pie de página -->
          <div style="border-top: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}; padding-top: 24px; margin-top: 32px;">
            <div style="text-align: center; font-size: 12px; color: ${isDarkMode ? '#6b7280' : '#9ca3af'};">
              <p>Sistema de Gestión VLock - Reporte Generado Automáticamente</p>
            </div>
          </div>
        </div>
      `;

      tempDiv.innerHTML = reportContent;
      document.body.appendChild(tempDiv);

      // Esperar un momento para que se renderice
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capturar con html2canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        scale: 1.5,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 1200,
        height: tempDiv.scrollHeight
      });

      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      
      const imgX = (pageWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Limpiar
      document.body.removeChild(tempDiv);

      // Guardar
      const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  };

  // Función para exportar a Excel
  const exportToExcel = async (data, statistics, config, filtros) => {
    try {
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Datos principales
      if (config.includeTable && data.length > 0) {
        const worksheetData = data.map(item => ({
          [config.tableFormat === 'enumerated' ? 'Número' : 'ID']: config.tableFormat === 'enumerated' ? item.numero_fila : item.id_suministro,
          'Descripción': item.descripcion || '',
          'Tipo': item.tipo_suministro || '',
          'Cantidad': item.cantidad || '',
          'Unidad': item.unidad || '',
          'Precio Unitario': parseFloat(item.precio_unitario) || 0,
          'Valor Total': (parseFloat(item.precio_unitario) || 0) * (parseFloat(item.cantidad) || 0),
          'Proyecto': item.proyecto || '',
          'Proveedor': item.proveedor || '',
          'Estado': item.estado || '',
          'Fecha Recibo': item.fecha_recibo || '',
          'Observaciones': item.observaciones || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Suministros');
      }

      // Hoja 2: Estadísticas
      if (config.includeStatistics) {
        const statsData = [
          { Estadística: 'Total de Suministros', Valor: statistics.total },
          { Estadística: 'Valor Total', Valor: statistics.totalValue },
          { Estadística: 'Stock Bajo', Valor: statistics.lowStock },
          { Estadística: 'Alto Valor', Valor: statistics.highValue },
          { Estadística: '', Valor: '' },
          { Estadística: 'Por Categoría:', Valor: '' },
          ...Object.entries(statistics.byCategory).map(([cat, count]) => ({
            Estadística: cat,
            Valor: count
          }))
        ];

        const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
        XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estadísticas');
      }

      // Guardar archivo
      const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error('Error generando Excel:', error);
      throw error;
    }
  };

  return {
    showReportModal,
    setShowReportModal,
    reportConfig,
    setReportConfig,
    handleCustomExport
  };
};

export default useReportePersonalizado;
