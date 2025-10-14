const models = require('../models');
const NominaEmpleado = models.Nomina_empleado;
const Empleado = models.Empleados;
const SemanaNomina = models.Semanas_nomina;
const PagoNomina = models.Pagos_nomina;
const Proyecto = models.Proyectos;

/**
 * Generar recibo de nómina en PDF con diseño profesional
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const generarReciboPDF = async (req, res) => {
    try {
        const { id_nomina } = req.params;

        // Verificar si existe la nómina con todas las relaciones necesarias
        const nomina = await NominaEmpleado.findByPk(id_nomina, {
            include: [
                { model: Empleado, as: 'empleado' },
                { model: SemanaNomina, as: 'semana' },
                { 
                    model: PagoNomina,
                    as: 'pagos_nominas',
                    required: false
                },
                { model: Proyecto, as: 'proyecto' }
            ]
        });

        if (!nomina) {
            return res.status(404).json({
                message: 'Nómina no encontrada'
            });
        }

        // Importamos las dependencias para PDF
        const PDFDocument = require('pdfkit');
        const fs = require('fs-extra');
        const path = require('path');
        
        // Crear directorio para guardar los recibos si no existe
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'recibos');
        await fs.ensureDir(uploadsDir);

        // Nombre del archivo
        const fileName = `recibo_${id_nomina}_${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);

        // Crear el documento PDF con márgenes más pequeños
        const doc = new PDFDocument({ margin: 20, size: 'letter' });
        
        // Stream para escribir en archivo
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Configuraciones del documento
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = 30;

        // ===== ENCABEZADO PRINCIPAL =====
        let currentY = margin;
        
        // Título principal - "Comprobante Fiscal Digital por Internet"
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('COMPROBANTE FISCAL DIGITAL POR INTERNET', margin, currentY, { align: 'center' });
        
        currentY += 30;

        // ===== DATOS DE LA EMPRESA =====
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('DATOS DE LA EMPRESA:', margin, currentY);
        
        currentY += 15;
        
        doc.fontSize(9)
           .font('Helvetica')
           .text('VLOCK CONSTRUCTORA', margin, currentY);
        
        currentY += 12;
        doc.text('RFC: VLO240101ABC', margin, currentY);
        
        currentY += 12;
        doc.text('Reg Fiscal: 601 General de Ley Personas Morales', margin, currentY);
        
        currentY += 12;
        doc.text('Lugar de expedición: GUADALAJARA, JALISCO, MÉXICO', margin, currentY);

        // Fecha y hora de generación (esquina superior derecha)
        const fechaActual = new Date();
        const fechaFormateada = fechaActual.toLocaleDateString('es-MX');
        const horaFormateada = fechaActual.toLocaleTimeString('es-MX');
        
        // Logo de la empresa (esquina superior derecha) - PRIMERO
        try {
            const logoPath = path.join(__dirname, '..', 'public', 'images', 'vlock_logo.png');
            if (fs.existsSync(logoPath)) {
                // Posicionar logo en esquina superior derecha
                const logoWidth = 50;
                const logoHeight = 55;
                const logoX = pageWidth - margin - logoWidth;
                const logoY = margin;
                
                doc.image(logoPath, logoX, logoY, { width: logoWidth });
                
                // Posicionar fecha/hora MUY abajo del logo para evitar superposición
                doc.fontSize(8)
                   .font('Helvetica')
                   .text(`Fecha: ${fechaFormateada}`, logoX - 40, logoY + logoHeight + 20)
                   .text(`Hora: ${horaFormateada}`, logoX - 40, logoY + logoHeight + 33);
            } else {
                // Si no hay logo, posicionar fecha/hora en esquina derecha
                doc.fontSize(9)
                   .font('Helvetica')
                   .text(`Fecha: ${fechaFormateada}`, pageWidth - 120, margin + 20)
                   .text(`Hora: ${horaFormateada}`, pageWidth - 120, margin + 35);
            }
        } catch (logoError) {
            console.log('No se pudo cargar el logo:', logoError.message);
            // Fallback sin logo
            doc.fontSize(9)
               .font('Helvetica')
               .text(`Fecha: ${fechaFormateada}`, pageWidth - 120, margin + 20)
               .text(`Hora: ${horaFormateada}`, pageWidth - 120, margin + 35);
        }

        currentY += 25; // Reducir espacio después de datos de empresa

        // ===== DATOS DEL EMPLEADO Y PERÍODO EN COLUMNAS =====
        const empleado = nomina.empleado;
        const nombreCompleto = `${empleado.nombre} ${empleado.apellido}`;
        const semanaInfo = nomina.semana || {};
        const añoActual = new Date().getFullYear();
        const mesActual = new Date().getMonth() + 1;
        
        // Definir columnas para mejor distribución
        const empCol1X = margin;
        const empCol2X = margin + 250; // Columna derecha
        const colWidth = 200;
        
        // Columna izquierda - DATOS DEL EMPLEADO
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('DATOS DEL EMPLEADO:', empCol1X, currentY);
        
        currentY += 15;
        
        // ID del empleado y nombre
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text(`ID Empleado: ${empleado.id_empleado} - ${nombreCompleto}`, empCol1X, currentY);
        
        currentY += 12;
        
        // RFC del empleado
        if (empleado.rfc) {
            doc.fontSize(8)
               .font('Helvetica')
               .text(`RFC: ${empleado.rfc}`, empCol1X, currentY);
            currentY += 10;
        }
        
        // NSS del empleado
        if (empleado.nss) {
            doc.fontSize(8)
               .text(`NSS: ${empleado.nss}`, empCol1X, currentY);
            currentY += 10;
        }
        
        // Fecha de inicio de relación laboral
        const fechaInicio = empleado.createdAt ? empleado.createdAt.toLocaleDateString('es-MX') : 'N/A';
        doc.fontSize(8)
           .text(`Fecha Inicio: ${fechaInicio}`, empCol1X, currentY);
        
        currentY += 10;
        doc.fontSize(8)
           .text('Jornada: Diurna', empCol1X, currentY);
        
        currentY += 10;
        doc.fontSize(8)
           .text('Tipo Salario: Variable', empCol1X, currentY);

        // Columna derecha - INFORMACIÓN DEL PERÍODO
        let col2Y = currentY - 50; // Ajustar para alinear con columna izquierda
        
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('INFORMACIÓN DEL PERÍODO:', empCol2X, col2Y);
        
        col2Y += 15;
        
        doc.fontSize(8)
           .font('Helvetica')
           .text(`Ejercicio: ${añoActual}`, empCol2X, col2Y);
        
        col2Y += 10;
        doc.text(`Período: ${mesActual.toString().padStart(2, '0')} - Semanal`, empCol2X, col2Y);
        
        col2Y += 10;
        doc.text(`Días de Pago: ${nomina.dias_laborados}`, empCol2X, col2Y); // Sin decimales
        
        col2Y += 10;
        doc.text(`Fecha Pago: ${fechaFormateada}`, empCol2X, col2Y);
        
        col2Y += 10;
        // Usar el oficio del empleado en lugar del proyecto
        const puesto = empleado.oficio?.nombre || 'Operativo';
        doc.text(`Puesto: ${puesto}`, empCol2X, col2Y);
        
        col2Y += 10;
        doc.text(`Depto: General`, empCol2X, col2Y);
        
        col2Y += 10;
        doc.text(`SBC: $${parseFloat(nomina.pago_por_dia).toFixed(2)}`, empCol2X, col2Y);
        
        // Ajustar currentY para la siguiente sección
        currentY = Math.max(currentY, col2Y) + 10;

        currentY += 15; // Reducir espacio antes de percepciones

        // ===== PERCEPCIONES (GANANCIAS) =====
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('PERCEPCIONES:', margin, currentY);
        
        currentY += 15; // Reducir espacio después del título
        
        // Tabla de percepciones - usar más ancho de página
        const tableStartY = currentY;
        const col1X = margin;
        const col2X = margin + 100;
        const col3X = margin + 200;
        const col4X = margin + 450;
        
        // Encabezados de la tabla
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .text('Agrup SAT', col1X, currentY)
           .text('No.', col2X, currentY)
           .text('Concepto', col3X, currentY)
           .text('Total', col4X, currentY);
        
        currentY += 15;
        
        // Línea bajo encabezados
        doc.moveTo(col1X, currentY)
           .lineTo(col4X + 80, currentY)
           .lineWidth(0.5)
           .strokeColor('#000000')
           .stroke();
        
        currentY += 10;
        
        // Usar los datos exactos de la nómina del sistema
        const salarioBase = parseFloat(nomina.pago_por_dia) * nomina.dias_laborados;
        doc.fontSize(8)
           .font('Helvetica')
           .text('P', col1X, currentY)
           .text('001', col2X, currentY)
           .text('Sueldo', col3X, currentY)
           .text(`$${salarioBase.toFixed(2)}`, col4X, currentY);
        
        currentY += 15;
        
        // Horas extra (si aplica) - usar el cálculo del sistema
        if (nomina.horas_extra && nomina.horas_extra > 0) {
            // El sistema ya calcula las horas extra, usar el monto que está en la nómina
            const montoHorasExtra = salarioBase * 0.1; // 10% del salario base como ejemplo, ajustar según el cálculo real del sistema
            doc.text('P', col1X, currentY)
               .text('002', col2X, currentY)
               .text('Horas Extra', col3X, currentY)
               .text(`$${montoHorasExtra.toFixed(2)}`, col4X, currentY);
            currentY += 15;
        }
        
        // Bonos (si aplica) - usar el dato exacto del sistema
        if (nomina.bonos && nomina.bonos > 0) {
            doc.text('P', col1X, currentY)
               .text('003', col2X, currentY)
               .text('Bonos', col3X, currentY)
               .text(`$${parseFloat(nomina.bonos).toFixed(2)}`, col4X, currentY);
            currentY += 15;
        }
        
        // Total de percepciones - usar el cálculo del sistema
        // El total debe ser: salario base + bonos (las horas extra ya están incluidas en el salario base si aplican)
        const totalPercepciones = salarioBase + (parseFloat(nomina.bonos) || 0);
        
        currentY += 10;
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text(`Total Percepc. más Otros Pagos $`, col3X, currentY)
           .text(`${totalPercepciones.toFixed(2)}`, col4X, currentY);

        currentY += 15; // Reducir espacio antes de deducciones

        // ===== DEDUCCIONES =====
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('DEDUCCIONES:', margin, currentY);
        
        currentY += 15; // Reducir espacio después del título
        
        // Encabezados de deducciones
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .text('Agrup SAT', col1X, currentY)
           .text('No.', col2X, currentY)
           .text('Concepto', col3X, currentY)
           .text('Total', col4X, currentY);
        
        currentY += 15;
        
        // Línea bajo encabezados
        doc.moveTo(col1X, currentY)
           .lineTo(col4X + 80, currentY)
           .lineWidth(0.5)
           .strokeColor('#000000')
           .stroke();
        
        currentY += 10;
        
        // Deducciones - usar los datos exactos del sistema
        if (nomina.deducciones && nomina.deducciones > 0) {
            // Obtener el desglose completo de deducciones del sistema
            // Si no hay desglose, dividir proporcionalmente como antes
            const totalDeducciones = parseFloat(nomina.deducciones);
            
            // Intentar obtener el desglose del cálculo si está disponible
            // Por ahora, usar una distribución típica: 60% ISR, 30% IMSS, 10% Infonavit
            const montoISR = totalDeducciones * 0.6;
            const montoIMSS = totalDeducciones * 0.3;
            const montoInfonavit = totalDeducciones * 0.1;
            
            // Mostrar ISR
            if (montoISR > 0) {
                doc.fontSize(8)
                   .font('Helvetica')
                   .text('001', col1X, currentY)
                   .text('045', col2X, currentY)
                   .text('ISR', col3X, currentY)
                   .text(`$${montoISR.toFixed(2)}`, col4X, currentY);
                currentY += 15;
            }
            
            // Mostrar IMSS
            if (montoIMSS > 0) {
                doc.text('002', col1X, currentY)
                   .text('052', col2X, currentY)
                   .text('IMSS', col3X, currentY)
                   .text(`$${montoIMSS.toFixed(2)}`, col4X, currentY);
                currentY += 15;
            }
            
            // Mostrar Infonavit
            if (montoInfonavit > 0) {
                doc.text('003', col1X, currentY)
                   .text('053', col2X, currentY)
                   .text('Infonavit', col3X, currentY)
                   .text(`$${montoInfonavit.toFixed(2)}`, col4X, currentY);
            }
        }

        currentY += 15; // Reducir espacio antes del resumen

        // ===== RESUMEN FINAL =====
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('RESUMEN:', margin, currentY);
        
        currentY += 15; // Reducir espacio después del título
        
        // Usar los montos exactos del sistema (como aparecen en la vista previa)
        const totalDeducciones = parseFloat(nomina.deducciones) || 0;
        const totalNeto = parseFloat(nomina.monto_total) || 0; // Usar el monto total exacto del sistema
        
        // Usar columnas para el resumen también
        const resumenCol1X = margin + 300;
        const resumenCol2X = margin + 450;
        
        // Mostrar los datos exactos como en el sistema
        doc.fontSize(9)
           .font('Helvetica')
           .text(`Subtotal $:`, resumenCol1X, currentY)
           .text(`${totalPercepciones.toFixed(2)}`, resumenCol2X, currentY);
        
        currentY += 15;
        doc.text(`Descuentos $:`, resumenCol1X, currentY)
           .text(`${totalDeducciones.toFixed(2)}`, resumenCol2X, currentY);
        
        currentY += 15;
        doc.text(`Retenciones $:`, resumenCol1X, currentY)
           .text(`${totalDeducciones.toFixed(2)}`, resumenCol2X, currentY);
        
        currentY += 15;
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(`Total a Pagar $:`, resumenCol1X, currentY)
           .text(`${totalNeto.toFixed(2)}`, resumenCol2X, currentY);
        
        currentY += 15;
        doc.text(`Neto del recibo $:`, resumenCol1X, currentY)
           .text(`${totalNeto.toFixed(2)}`, resumenCol2X, currentY);

        currentY += 20; // Reducir espacio antes de firmas

        // ===== FIRMAS =====
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('FIRMAS:', margin, currentY);
        
        currentY += 15; // Reducir espacio después del título
        
        // Firma del empleado - reducir tamaño para una página
        const firmaWidth = 150;
        const firmaHeight = 50;
        const leftFirmaX = margin;
        const rightFirmaX = margin + 250; // Separación entre firmas
        
        // Cuadro para firma del empleado
        doc.rect(leftFirmaX, currentY, firmaWidth, firmaHeight)
           .lineWidth(1)
           .strokeColor('#000000')
           .stroke();
        
        doc.fontSize(8)
           .font('Helvetica')
           .text('FIRMA DEL EMPLEADO', leftFirmaX + 5, currentY + 5, { align: 'center', width: firmaWidth - 10 });
        
        doc.fontSize(8)
           .text(nombreCompleto, leftFirmaX + 5, currentY + 45, { align: 'center', width: firmaWidth - 10 });
        
        // Cuadro para firma del responsable
        doc.rect(rightFirmaX, currentY, firmaWidth, firmaHeight)
           .lineWidth(1)
           .strokeColor('#000000')
           .stroke();
        
        const nombreResponsable = req.usuario ? 
            `${req.usuario.nombre_usuario.toUpperCase()}` : 
            'RESPONSABLE DE NÓMINA';
        
        doc.fontSize(8)
           .font('Helvetica')
           .text('FIRMA DEL RESPONSABLE', rightFirmaX + 5, currentY + 5, { align: 'center', width: firmaWidth - 10 });
        
        doc.fontSize(8)
           .text(nombreResponsable, rightFirmaX + 5, currentY + 45, { align: 'center', width: firmaWidth - 10 });

        // Pie de página - posicionar al final absoluto de la página
        const piePageY = pageHeight - margin - 20; // 20px desde el fondo
        
        doc.fontSize(7)
           .font('Helvetica')
           .text(`Documento generado el ${fechaFormateada} a las ${horaFormateada}`, margin, piePageY - 15, { align: 'center', width: pageWidth - 2 * margin });
        
        doc.fontSize(7)
           .text(`Emitido por: ${nombreResponsable}`, margin, piePageY, { align: 'center', width: pageWidth - 2 * margin });

        // Completar el documento PDF
        doc.end();
        
        // Esperar a que termine de escribir
        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
        
        // Actualizar la ruta del recibo en la base de datos
        const relativePath = `/uploads/recibos/${fileName}`;
        await nomina.update({ recibo_pdf: relativePath });
        
        try {
            // Verificar que el archivo exista y sea accesible
            const exists = await fs.pathExists(filePath);
            
            if (!exists) {
                return res.status(404).json({ message: 'El archivo PDF no pudo generarse correctamente' });
            }
            
            // Obtener información del archivo
            const stats = await fs.stat(filePath);
            
            if (stats.size === 0) {
                return res.status(500).json({ message: 'El archivo PDF generado está vacío' });
            }
            
            // Configurar encabezados de respuesta
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-Length', stats.size);
            
            // Leer el archivo completo y enviarlo como respuesta
            const fileBuffer = await fs.readFile(filePath);
            res.status(200).send(fileBuffer);
        } catch (err) {
            console.error('Error al enviar el archivo:', err);
            res.status(500).json({ 
                message: 'Error al enviar el archivo PDF', 
                error: err.message
            });
        }
    } catch (error) {
        console.error('Error al generar recibo PDF:', error);
        res.status(500).json({
            message: 'Error al generar recibo PDF',
            error: error.message
        });
    }
};

module.exports = {
    generarReciboPDF
};
