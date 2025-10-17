const models = require('../models');
const NominaEmpleado = models.Nomina_empleado;
const Empleado = models.Empleados;
const SemanaNomina = models.Semanas_nomina;
const PagoNomina = models.Pagos_nomina;
const Proyecto = models.Proyectos;

// Función para convertir números a letra
function convertirNumeroALetra(numero) {
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const especiales = ['', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
    
    if (numero === 0) return 'cero pesos M.N.';
    if (numero < 0) return 'menos ' + convertirNumeroALetra(-numero);
    
    // Separar parte entera y centavos
    let parteEntera = Math.floor(numero);
    const centavos = Math.round((numero - parteEntera) * 100);
    
    let resultado = '';
    
    // Miles
    if (parteEntera >= 1000) {
        const miles = Math.floor(parteEntera / 1000);
        if (miles === 1) {
            resultado += 'mil ';
        } else {
            resultado += convertirParteEntera(miles) + ' mil ';
        }
        parteEntera %= 1000;
    }
    
    // Centenas
    if (parteEntera >= 100) {
        const centena = Math.floor(parteEntera / 100);
        if (centena === 1 && parteEntera % 100 === 0) {
            resultado += 'cien ';
        } else {
            resultado += centenas[centena] + ' ';
        }
        parteEntera %= 100;
    }
    
    // Decenas y unidades
    if (parteEntera >= 20) {
        const decena = Math.floor(parteEntera / 10);
        const unidad = parteEntera % 10;
        resultado += decenas[decena];
        if (unidad > 0) {
            resultado += ' y ' + unidades[unidad];
        }
        resultado += ' ';
    } else if (parteEntera >= 11) {
        resultado += especiales[parteEntera - 10] + ' ';
    } else if (parteEntera >= 1) {
        resultado += unidades[parteEntera] + ' ';
    }
    
    // Agregar "pesos"
    resultado += 'pesos';
    
    // Agregar centavos si existen
    if (centavos > 0) {
        resultado += ' ' + centavos + '/100';
    }
    
    return resultado.trim() + ' M.N.';
}

// Función auxiliar para convertir parte entera (sin recursión infinita)
function convertirParteEntera(numero) {
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const especiales = ['', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
    
    let resultado = '';
    let num = numero; // Crear variable local para modificar
    
    // Centenas
    if (num >= 100) {
        const centena = Math.floor(num / 100);
        if (centena === 1 && num % 100 === 0) {
            resultado += 'cien ';
        } else {
            resultado += centenas[centena] + ' ';
        }
        num %= 100;
    }
    
    // Decenas y unidades
    if (num >= 20) {
        const decena = Math.floor(num / 10);
        const unidad = num % 10;
        resultado += decenas[decena];
        if (unidad > 0) {
            resultado += ' y ' + unidades[unidad];
        }
        resultado += ' ';
    } else if (num >= 11) {
        resultado += especiales[num - 10] + ' ';
    } else if (num >= 1) {
        resultado += unidades[num] + ' ';
    }
    
    return resultado.trim();
}

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
                { 
                    model: Empleado, 
                    as: 'empleado',
                    include: [
                        { model: models.Oficios, as: 'oficio' },
                        { model: models.Proyectos, as: 'proyecto' }
                    ]
                },
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
           .text('COMPROBANTE DIGITAL DE NÓMINA', margin, currentY, { align: 'center' });
        
        currentY += 30;

        // ===== DATOS DE LA EMPRESA =====
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('DATOS DE LA EMPRESA:', margin, currentY);
        
        currentY += 15;
        
        doc.fontSize(9)
           .font('Helvetica')
           .text('EDIFICACIONES OROCAZA SA DE CV', margin, currentY);
        
        currentY += 12;
        doc.text('RFC: EOR161129LG4', margin, currentY);
        
        currentY += 12;
        doc.text('Oficina: C. Aldama 1949, Col. San Antonio, Guadalajara, Jalisco, México', margin, currentY);
        
        currentY += 12;
        doc.text('Email: admon.vlock.contructora@gmail.com', margin, currentY);


        // Fecha y hora de generación (esquina superior derecha)
        const fechaActual = new Date();
        const fechaFormateada = fechaActual.toLocaleDateString('es-MX');
        const horaFormateada = fechaActual.toLocaleTimeString('es-MX');
        
        // Logo de la empresa (esquina superior derecha) - PRIMERO
        try {
            const logoPath = path.join(__dirname, '..', 'public', 'images', 'vlock_logo.png');
            if (fs.existsSync(logoPath)) {
                // Posicionar logo en esquina superior derecha - MÁS GRANDE
                const logoWidth = 80; // Aumentado de 50 a 80
                const logoHeight = 88; // Aumentado proporcionalmente
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
           .text(`Nombre: ${nombreCompleto}`, empCol1X, currentY);
        
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
        
        // Puesto/Oficio del empleado
        const puesto = nomina.empleado?.oficio?.nombre || 'Sin especificar';
        doc.fontSize(8)
           .text(`Puesto: ${puesto}`, empCol1X, currentY);
        
        currentY += 10;
        
        // Proyecto del empleado
        const proyecto = nomina.empleado?.proyecto?.nombre || nomina.proyecto?.nombre || 'Sin proyecto';
        doc.fontSize(8)
           .text(`Proyecto: ${proyecto}`, empCol1X, currentY);
        

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
        // SBC calculado para semana de 6 días laborales
        const pagoSemanal = parseFloat(nomina.pago_por_dia); // pago_por_dia contiene el pago semanal
        const sbcDiario = pagoSemanal / 6; // SBC diario basado en 6 días laborales
        const sbcSemanal = sbcDiario * 6; // SBC semanal (6 días)
        doc.text(`SBC: $${sbcDiario.toFixed(2)}/día`, empCol2X, col2Y);
        
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
        
        // Para pago semanal: el salario base ES el pago semanal directamente
        const salarioBase = parseFloat(nomina.pago_por_dia); // pago_por_dia contiene el pago semanal
        doc.fontSize(8)
           .font('Helvetica')
           .text('P', col1X, currentY)
           .text('001', col2X, currentY)
           .text('Sueldo', col3X, currentY)
           .text(`$${salarioBase.toFixed(2)}`, col4X, currentY);
        
        currentY += 15;
        
        // Horas extra (si aplica) - calcular basándose en el pago semanal
        if (nomina.horas_extra && nomina.horas_extra > 0) {
            // Para pago semanal: (pago semanal / 7 días) / 8 horas por día
            const pagoPorHora = (parseFloat(nomina.pago_por_dia) / 7) / 8;
            const montoHorasExtra = parseFloat(nomina.horas_extra) * pagoPorHora * 2; // Doble tiempo
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
        // Calcular horas extra si aplican (basándose en pago semanal)
        let montoHorasExtra = 0;
        if (nomina.horas_extra && nomina.horas_extra > 0) {
            // Para pago semanal: (pago semanal / 7 días) / 8 horas por día
            const pagoPorHora = (parseFloat(nomina.pago_por_dia) / 7) / 8;
            montoHorasExtra = parseFloat(nomina.horas_extra) * pagoPorHora * 2;
        }
        
        const totalPercepciones = salarioBase + montoHorasExtra + (parseFloat(nomina.bonos) || 0);
        
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
        
        // Deducciones - usar los datos exactos de la nómina
        if (nomina.deducciones && nomina.deducciones > 0) {
            let contadorDeduccion = 1;
            
            // Mostrar ISR solo si está aplicado
            if (nomina.aplicar_isr && nomina.deducciones_isr && nomina.deducciones_isr > 0) {
                doc.fontSize(8)
                   .font('Helvetica')
                   .text(contadorDeduccion.toString().padStart(3, '0'), col1X, currentY)
                   .text('045', col2X, currentY)
                   .text('ISR', col3X, currentY)
                   .text(`$${parseFloat(nomina.deducciones_isr).toFixed(2)}`, col4X, currentY);
                currentY += 15;
                contadorDeduccion++;
            }
            
            // Mostrar IMSS solo si está aplicado
            if (nomina.aplicar_imss && nomina.deducciones_imss && nomina.deducciones_imss > 0) {
                doc.fontSize(8)
                   .font('Helvetica')
                   .text(contadorDeduccion.toString().padStart(3, '0'), col1X, currentY)
                   .text('052', col2X, currentY)
                   .text('IMSS', col3X, currentY)
                   .text(`$${parseFloat(nomina.deducciones_imss).toFixed(2)}`, col4X, currentY);
                currentY += 15;
                contadorDeduccion++;
            }
            
            // Mostrar Infonavit solo si está aplicado
            if (nomina.aplicar_infonavit && nomina.deducciones_infonavit && nomina.deducciones_infonavit > 0) {
                doc.fontSize(8)
                   .font('Helvetica')
                   .text(contadorDeduccion.toString().padStart(3, '0'), col1X, currentY)
                   .text('053', col2X, currentY)
                   .text('Infonavit', col3X, currentY)
                   .text(`$${parseFloat(nomina.deducciones_infonavit).toFixed(2)}`, col4X, currentY);
                currentY += 15;
                contadorDeduccion++;
            }
            
            // Mostrar deducciones adicionales si existen
            if (nomina.deducciones_adicionales && nomina.deducciones_adicionales > 0) {
                doc.fontSize(8)
                   .font('Helvetica')
                   .text(contadorDeduccion.toString().padStart(3, '0'), col1X, currentY)
                   .text('999', col2X, currentY)
                   .text('Adicionales', col3X, currentY)
                   .text(`$${parseFloat(nomina.deducciones_adicionales).toFixed(2)}`, col4X, currentY);
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
        
        // Solo mostrar deducciones si realmente hay alguna aplicada
        if (totalDeducciones > 0) {
            doc.text(`Descuentos $:`, resumenCol1X, currentY)
               .text(`${totalDeducciones.toFixed(2)}`, resumenCol2X, currentY);
            currentY += 15;
        }
        
        currentY += 15;
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(`Total de la Nómina $:`, resumenCol1X, currentY)
           .text(`${totalNeto.toFixed(2)}`, resumenCol2X, currentY);
        
        // Verificar si es un pago parcial
        const montoPagado = parseFloat(nomina.monto_pagado) || 0;
        const esPagoParcial = montoPagado > 0 && montoPagado < totalNeto;
        
        if (esPagoParcial) {
            currentY += 15;
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#0066CC') // Azul para destacar
               .text(`Monto a Pagar $:`, resumenCol1X, currentY)
               .text(`${montoPagado.toFixed(2)}`, resumenCol2X, currentY);
            
            currentY += 15;
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#CC0000') // Rojo para adeudo
               .text(`Adeudo Pendiente $:`, resumenCol1X, currentY)
               .text(`${(totalNeto - montoPagado).toFixed(2)}`, resumenCol2X, currentY);
               
            // Restaurar color negro
            doc.fillColor('#000000');
        }
        
        currentY += 15;
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(`Neto del recibo $:`, resumenCol1X, currentY)
           .text(`${esPagoParcial ? montoPagado.toFixed(2) : totalNeto.toFixed(2)}`, resumenCol2X, currentY);

        currentY += 20; // Reducir espacio antes del importe en letra

        // ===== IMPORTE CON LETRA =====
        // Usar el monto que realmente se está pagando (puede ser parcial)
        const montoParaLetra = esPagoParcial ? montoPagado : parseFloat(nomina.monto_total);
        const montoEnLetra = convertirNumeroALetra(montoParaLetra);
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('Importe con letra:', margin, currentY);
        
        currentY += 15;
        
        doc.fontSize(8)
           .font('Helvetica')
           .text(montoEnLetra, margin, currentY, { align: 'left', width: pageWidth - 2 * margin });
        
        currentY += 70; // Más espacio antes de la firma (aumentado de 30 a 50)

        // ===== FIRMA DEL EMPLEADO =====
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('FIRMA DEL EMPLEADO:', margin, currentY);
        
        currentY += 25; // Más espacio después del título (aumentado de 20 a 25)
        
        // Línea horizontal para firma - centrada
        const firmaWidth = 200;
        const firmaX = (pageWidth - firmaWidth) / 2; // Centrar horizontalmente
        
        // Línea horizontal para firma
        doc.moveTo(firmaX, currentY)
           .lineTo(firmaX + firmaWidth, currentY)
           .lineWidth(1)
           .strokeColor('#000000')
           .stroke();
        
        currentY += 25; // Más espacio después de la línea (aumentado de 20 a 25)
        
        doc.fontSize(10)
           .font('Helvetica')
           .text(nombreCompleto, firmaX, currentY, { align: 'center', width: firmaWidth });

        // Pie de página - posicionar más abajo (reducir margen desde el fondo)
        const piePageY = pageHeight - margin - 10; // Reducido de 20 a 10px desde el fondo
        
        doc.fontSize(7)
           .font('Helvetica')
           .text(`Documento generado el ${fechaFormateada} a las ${horaFormateada} en Guadalajara Jalisco`, margin, piePageY - 15, { align: 'center', width: pageWidth - 2 * margin });
        
        //const nombreResponsable = req.usuario ? 
          //  `${req.usuario.nombre_usuario.toUpperCase()}` : 
            //'Vlock Constructora';
        const nombreResponsable = 'ZAIDA KAREN COVARRUBIAS CASILLAS';
        
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
