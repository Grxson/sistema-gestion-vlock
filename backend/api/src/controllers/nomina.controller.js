const models = require('../models');
const NominaEmpleado = models.Nomina_empleado;
const Empleado = models.Empleados;
const SemanaNomina = models.Semanas_nomina;
const PagoNomina = models.Pagos_nomina;
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { calcularNomina } = require('../utils/nominaCalculator');
const { registrarCambioNomina } = require('./nominaHistorial.controller');
const { generarReciboPDF } = require('./nominaPDF.controller');
const sequelize = require('../config/db');

/**
 * Obtener todas las nóminas
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllNominas = async (req, res) => {
    try {
        const nominas = await NominaEmpleado.findAll({
            include: [
                { model: Empleado, as: 'empleado' },
                { model: SemanaNomina, as: 'semana' }
            ]
        });

        res.status(200).json({
            message: 'Nóminas obtenidas exitosamente',
            nominas
        });
    } catch (error) {
        console.error('Error al obtener nóminas:', error);
        res.status(500).json({
            message: 'Error al obtener nóminas',
            error: error.message
        });
    }
};

/**
 * Obtener nóminas por semana
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getNominasPorSemana = async (req, res) => {
    try {
        const { id_semana } = req.params;

        const nominas = await NominaEmpleado.findAll({
            where: { id_semana },
            include: [
                { model: Empleado, as: 'empleado' },
                { model: SemanaNomina, as: 'semana' }
            ]
        });

        res.status(200).json({
            message: 'Nóminas de la semana obtenidas exitosamente',
            nominas
        });
    } catch (error) {
        console.error('Error al obtener nóminas de la semana:', error);
        res.status(500).json({
            message: 'Error al obtener nóminas de la semana',
            error: error.message
        });
    }
};

/**
 * Obtener nóminas por empleado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getNominasPorEmpleado = async (req, res) => {
    try {
        const { id_empleado } = req.params;

        const nominas = await NominaEmpleado.findAll({
            where: { id_empleado },
            include: [
                { model: Empleado, as: 'empleado' },
                { model: SemanaNomina, as: 'semana' }
            ]
        });

        res.status(200).json({
            message: 'Nóminas del empleado obtenidas exitosamente',
            nominas
        });
    } catch (error) {
        console.error('Error al obtener nóminas del empleado:', error);
        res.status(500).json({
            message: 'Error al obtener nóminas del empleado',
            error: error.message
        });
    }
};

/**
 * Crear una nueva nómina para un empleado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const createNomina = async (req, res) => {
    try {
        const {
            id_empleado,
            id_semana,
            id_proyecto, // Agregamos el campo para el proyecto
            dias_laborados,
            pago_por_dia,
            horas_extra,
            deducciones_adicionales,
            bonos,
            aplicar_isr,
            aplicar_imss,
            aplicar_infonavit,
            // Nuevos campos para pagos parciales
            pago_parcial = false,
            monto_a_pagar = null,
            liquidar_adeudos = false
        } = req.body;

        // Validaciones básicas
        if (!id_empleado || !id_semana || !dias_laborados || !pago_por_dia || !id_proyecto) {
            return res.status(400).json({
                message: 'Los campos id_empleado, id_semana, id_proyecto, dias_laborados y pago_por_dia son obligatorios'
            });
        }

        // Convertir valores a números
        const diasLaboradosNum = parseFloat(dias_laborados);
        const pagoPorDiaNum = parseFloat(pago_por_dia);
        const horasExtraNum = parseFloat(horas_extra || 0);
        const deduccionesAdicionalesNum = parseFloat(deducciones_adicionales || 0);
        const bonosNum = parseFloat(bonos || 0);
        const aplicarISR = aplicar_isr !== false; // Por defecto aplica ISR a menos que se especifique false
        const aplicarIMSS = aplicar_imss !== false; // Por defecto aplica IMSS a menos que se especifique false
        const aplicarInfonavit = aplicar_infonavit !== false; // Por defecto aplica Infonavit a menos que se especifique false

        // Utilizar la función de cálculo de nómina
        const resultado = calcularNomina(
            diasLaboradosNum,
            pagoPorDiaNum,
            horasExtraNum,
            bonosNum,
            aplicarISR,
            aplicarIMSS,
            aplicarInfonavit,
            deduccionesAdicionalesNum
        );

        // Determinar el monto a pagar
        let montoAPagar = resultado.montoTotal;
        let montoAdeudo = 0;

        if (pago_parcial && monto_a_pagar !== null) {
            const montoParcial = parseFloat(monto_a_pagar);
            if (montoParcial > 0 && montoParcial < resultado.montoTotal) {
                montoAPagar = montoParcial;
                montoAdeudo = resultado.montoTotal - montoParcial;
            }
        }

        // Crear la nueva nómina
        const nuevaNomina = await NominaEmpleado.create({
            id_empleado,
            id_semana,
            id_proyecto, // Agregamos el ID del proyecto
            dias_laborados: diasLaboradosNum,
            pago_por_dia: pagoPorDiaNum,
            horas_extra: horasExtraNum,
            deducciones: resultado.deducciones.total,
            deducciones_isr: resultado.deducciones.isr,
            deducciones_imss: resultado.deducciones.imss,
            deducciones_infonavit: resultado.deducciones.infonavit,
            deducciones_adicionales: resultado.deducciones.adicionales,
            aplicar_isr: aplicarISR,
            aplicar_imss: aplicarIMSS,
            aplicar_infonavit: aplicarInfonavit,
            bonos: bonosNum,
            monto_total: resultado.montoTotal,
            monto_pagado: montoAPagar, // Nuevo campo para el monto realmente pagado
            estado: 'Pendiente'
            // Ya no necesitamos especificar createdAt y updatedAt porque la base de datos usa valores por defecto
        });

        // Crear adeudo si es pago parcial
        if (montoAdeudo > 0) {
            // Calcular explícitamente el monto pendiente
            const montoPendienteCalculado = resultado.montoTotal - montoAPagar;
            
            console.log('🔍 [CONTROLLER] Creando adeudo:', {
                monto_adeudo: resultado.montoTotal,
                monto_pagado: montoAPagar,
                monto_pendiente: montoPendienteCalculado,
                estado: montoAPagar > 0 ? 'Parcial' : 'Pendiente'
            });
            
            await models.Adeudo_empleado.create({
                id_empleado,
                id_nomina: nuevaNomina.id_nomina,
                monto_adeudo: resultado.montoTotal, // Monto total que se debe
                monto_pagado: montoAPagar, // Monto que se está pagando ahora
                monto_pendiente: montoPendienteCalculado, // Calcular explícitamente
                estado: montoAPagar > 0 ? 'Parcial' : 'Pendiente', // Determinar estado explícitamente
                observaciones: `Pago parcial de nómina ${nuevaNomina.id_nomina}. Total: $${resultado.montoTotal.toFixed(2)}, Pagado: $${montoAPagar.toFixed(2)}, Pendiente: $${montoPendienteCalculado.toFixed(2)}`
            });
        }

        // Liquidar adeudos pendientes si se solicita
        if (liquidar_adeudos) {
            const adeudosPendientes = await models.Adeudo_empleado.findAll({
                where: {
                    id_empleado,
                    estado: ['Pendiente', 'Parcial']
                }
            });

            for (const adeudo of adeudosPendientes) {
                await adeudo.update({
                    monto_pagado: adeudo.monto_adeudo,
                    estado: 'Liquidado',
                    fecha_liquidacion: new Date()
                });
            }
        }

        // Registrar en historial
        if (req.usuario) {
            await registrarCambioNomina(
                nuevaNomina.id_nomina,
                req.usuario.id_usuario,
                'creacion',
                null,
                'Pendiente',
                {
                    dias_laborados: diasLaboradosNum,
                    pago_por_dia: pagoPorDiaNum,
                    horas_extra: horasExtraNum,
                    deducciones: resultado.deducciones.total,
                    bonos: bonosNum,
                    monto_total: resultado.montoTotal
                }
            );
        }

        res.status(201).json({
            message: 'Nómina creada exitosamente',
            nomina: nuevaNomina,
            calculo: resultado // Incluir desglose del cálculo en la respuesta
        });
    } catch (error) {
        console.error('Error al crear nómina:', error);
        res.status(500).json({
            message: 'Error al crear nómina',
            error: error.message
        });
    }
};

/**
 * Actualizar una nómina existente
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateNomina = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            dias_laborados,
            pago_por_dia,
            horas_extra,
            deducciones,
            bonos,
            estado
        } = req.body;

        // Verificar si existe la nómina
        const nomina = await NominaEmpleado.findByPk(id);
        if (!nomina) {
            return res.status(404).json({
                message: 'Nómina no encontrada'
            });
        }

        // Calcular nuevo monto total si hay cambios en los valores
        let nuevoMontoTotal = nomina.monto_total;
        
        if (dias_laborados !== undefined || pago_por_dia !== undefined || 
            horas_extra !== undefined || deducciones !== undefined || bonos !== undefined) {
                
            const diasLaboradosCalc = dias_laborados !== undefined ? parseFloat(dias_laborados) : nomina.dias_laborados;
            const pagoPorDiaCalc = pago_por_dia !== undefined ? parseFloat(pago_por_dia) : nomina.pago_por_dia;
            const horasExtraCalc = horas_extra !== undefined ? parseFloat(horas_extra) : (nomina.horas_extra || 0);
            const deduccionesCalc = deducciones !== undefined ? parseFloat(deducciones) : (nomina.deducciones || 0);
            const bonosCalc = bonos !== undefined ? parseFloat(bonos) : (nomina.bonos || 0);
            
            nuevoMontoTotal = (diasLaboradosCalc * pagoPorDiaCalc) + horasExtraCalc - deduccionesCalc + bonosCalc;
        }

        // Actualizar nómina
        await nomina.update({
            dias_laborados: dias_laborados !== undefined ? dias_laborados : nomina.dias_laborados,
            pago_por_dia: pago_por_dia !== undefined ? pago_por_dia : nomina.pago_por_dia,
            horas_extra: horas_extra !== undefined ? horas_extra : nomina.horas_extra,
            deducciones: deducciones !== undefined ? deducciones : nomina.deducciones,
            bonos: bonos !== undefined ? bonos : nomina.bonos,
            monto_total: nuevoMontoTotal,
            estado: estado || nomina.estado
        });

        res.status(200).json({
            message: 'Nómina actualizada exitosamente',
            nomina
        });
    } catch (error) {
        console.error('Error al actualizar nómina:', error);
        res.status(500).json({
            message: 'Error al actualizar nómina',
            error: error.message
        });
    }
};

/**
 * Registrar pago de nómina
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const registrarPagoNomina = async (req, res) => {
    try {
        const { id_nomina } = req.params;
        const { monto, metodo_pago, referencia } = req.body;

        // Validaciones básicas
        if (!monto || !metodo_pago) {
            return res.status(400).json({
                message: 'Los campos monto y metodo_pago son obligatorios'
            });
        }

        // Verificar si existe la nómina
        const nomina = await NominaEmpleado.findByPk(id_nomina);
        if (!nomina) {
            return res.status(404).json({
                message: 'Nómina no encontrada'
            });
        }

        // Registrar el pago
        const pago = await PagoNomina.create({
            id_nomina,
            fecha_pago: new Date(),
            monto,
            metodo_pago,
            referencia: referencia || null
        });

        // Actualizar estado de la nómina a pagado
        const estadoAnterior = nomina.estado;
        await nomina.update({ estado: 'Pagado' });
        
        // Registrar en historial
        if (req.usuario) {
            await registrarCambioNomina(
                id_nomina,
                req.usuario.id_usuario,
                'pago',
                estadoAnterior,
                'Pagado',
                {
                    monto: monto,
                    metodo_pago: metodo_pago,
                    referencia: referencia || null,
                    id_pago: pago.id_pago
                }
            );
        }

        res.status(201).json({
            message: 'Pago de nómina registrado exitosamente',
            pago
        });
    } catch (error) {
        console.error('Error al registrar pago de nómina:', error);
        res.status(500).json({
            message: 'Error al registrar pago de nómina',
            error: error.message
        });
    }
};

/**
 * Generar recibo de nómina en PDF
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const generarReciboPDFOld = async (req, res) => {
    try {
        const { id_nomina } = req.params;

        // Verificar si existe la nómina
        const nomina = await NominaEmpleado.findByPk(id_nomina, {
            include: [
                { model: Empleado, as: 'empleado' },
                { model: SemanaNomina, as: 'semana' },
                { 
                    model: PagoNomina,
                    as: 'pagos_nominas',
                    limit: 1,
                    order: [['fecha_pago', 'DESC']]
                },
                {
                    model: models.Proyectos,
                    as: 'proyecto'
                }
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

        // Crear el documento PDF
        const doc = new PDFDocument({ margin: 50, size: 'letter' });
        
        // Stream para escribir en archivo
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Configuraciones del documento
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = 50;

        // Eliminamos el borde alrededor del documento para un diseño más limpio
        // (Comentamos la siguiente línea para quitar el borde)
        // doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2).stroke();
        
            // Determinar el nombre del proyecto
        const nombreProyecto = nomina.proyecto ? nomina.proyecto.nombre : 'N/A';
        const ubicacionProyecto = nomina.proyecto ? (nomina.proyecto.ubicacion || 'SIN UBICACIÓN') : 'N/A';
        
        // Obtener información del empleado
        const nombreEmpleado = nomina.empleado ? nomina.empleado.nombre : 'EMPLEADO NO ESPECIFICADO';
        
        // Obtener información del pago
        const montoPagado = nomina.pagos_nominas && nomina.pagos_nominas.length > 0 ? 
            parseFloat(nomina.pagos_nominas[0].monto).toFixed(2) : 
            parseFloat(nomina.monto_total).toFixed(2);
        
        // Fecha actual en formato DD/MM/AAAA
        const fechaActual = new Date().toLocaleDateString('es-MX');
        
        // Información de la semana
        const semanaInfo = nomina.semana ? {
            semana_iso: nomina.semana.semana_iso || 'N/A',
            anio: nomina.semana.anio || 'N/A',
            fecha_inicio: nomina.semana.fecha_inicio || 'N/A',
            fecha_fin: nomina.semana.fecha_fin || 'N/A'
        } : {
            semana_iso: 'N/A',
            anio: 'N/A',
            fecha_inicio: 'N/A',
            fecha_fin: 'N/A'
        };
        
        // Título en la parte superior con diseño mejorado
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor('#444444')
           .text('RECIBO DE PAGO', margin + 10, margin + 20, { align: 'left' });
           
        // Línea separadora bajo el título
        doc.moveTo(margin + 10, margin + 42)
           .lineTo(pageWidth/2 - 20, margin + 42)
           .lineWidth(1)
           .strokeColor('#888888')
           .stroke();
           
        // Información del proyecto con mayor visibilidad
        doc.fontSize(12)
           .fillColor('black')
           .font('Helvetica-Bold')
           .text(`PROYECTO ${nombreProyecto.toUpperCase()}`, margin + 10, margin + 48);
        doc.font('Helvetica');
        
        // Añadir logo desde archivo PNG en la esquina superior derecha
        try {
            // Ruta al logo PNG
            const logoPath = path.join(__dirname, '..', 'public', 'images', 'vlock_logo.png');
            const absoluteLogoPath = '/home/grxson/Documentos/Github/sistema-gestion-vlock/backend/api/src/public/images/vlock_logo.png';
            
            // Verificar si el archivo existe
            
            // Calculamos posición para el logo más arriba y a la derecha para evitar sobreposiciones
            const logoWidth = 80;
            const logoHeight = 60;
            const logoX = pageWidth - margin - logoWidth + 10; // Movemos más a la derecha
            const logoY = margin - 10; // Movemos más arriba
            
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, logoX, logoY, { width: logoWidth });
            } else if (fs.existsSync(absoluteLogoPath)) {
                doc.image(absoluteLogoPath, logoX, logoY, { width: logoWidth });
            } else {
                throw new Error('Archivo de logo PNG no encontrado');
            }
        } catch (err) {
            console.error('Error al cargar el logo:', err);
            // En caso de error, añadir un texto como respaldo con un rectángulo rojo simulando el logo
            const logoWidth = 80;
            const logoHeight = 60;
            const logoX = pageWidth - margin - logoWidth + 10; // Movemos más a la derecha
            const logoY = margin - 10; // Movemos más arriba igual que el logo PNG
            
            // Dibujar un rectángulo rojo como fondo
            doc.save()
               .rect(logoX, logoY, logoWidth, logoHeight)
               .fillAndStroke('red', '#000');
               
            // Añadir texto "VLOCK" en blanco sobre fondo rojo
            doc.fillColor('white')
               .font('Helvetica-Bold')
               .fontSize(20)
               .text('VLOCK', logoX, logoY + 10, { align: 'center', width: logoWidth });
               
            // Añadir texto "CONSTRUCTORA" en gris debajo
            doc.fillColor('lightgrey')
               .fontSize(8)
               .text('CONSTRUCTORA', logoX, logoY + 35, { align: 'center', width: logoWidth });
               
            // Restaurar color para el resto del documento
            doc.fillColor('black')
               .font('Helvetica');
        }
        
        // Información general con espaciado mejorado para evitar sobreposición
        
        // Definimos posiciones para las columnas con más espacio
        const leftColumnX = margin + 10;
        const rightColumnX = pageWidth - margin - 200;
        let currentY = margin + 80; // Comenzamos más abajo del título del proyecto para dar más espacio
        
        // Datos del trabajador (izquierda)
        doc.fontSize(12).text('TRABAJADOR:', leftColumnX, currentY);
        currentY += 20; // Bajamos una línea
        doc.font('Helvetica-Bold').text(nombreEmpleado, leftColumnX, currentY);
        doc.font('Helvetica');
        
        // Información de la semana/periodo
        currentY += 25; // Aumentamos el espacio para evitar sobreposiciones
        doc.fontSize(12).text('PERIODO:', leftColumnX, currentY);
        currentY += 20; // Bajamos una línea
        doc.font('Helvetica-Bold').text(`${semanaInfo.fecha_inicio} al ${semanaInfo.fecha_fin}`, leftColumnX, currentY);
        doc.font('Helvetica');
        
        // Columna derecha: Fecha y monto
        currentY = margin + 80; // Comenzamos a la misma altura que la columna izquierda
        
        doc.fontSize(12).text('FECHA:', rightColumnX, currentY);
        doc.font('Helvetica-Bold').text(fechaActual, rightColumnX + 50, currentY);
        doc.font('Helvetica');
        
        currentY += 20; // Bajamos una línea
        doc.fontSize(12).text('MONTO PAGADO:', rightColumnX, currentY);
        doc.font('Helvetica-Bold').text(`$${montoPagado}`, rightColumnX + 110, currentY);
        doc.font('Helvetica');

        // Texto central - Comenzar después de la información de encabezado con más espacio
        let contentStartY = currentY + 65; // 50px de espacio después de la última información de encabezado
        
        // Calculamos el ancho efectivo para el contenido centrado
        const contentWidth = pageWidth - (margin * 2);
        const centerX = margin;
        
        // Creamos un área de texto centrada en la página
        doc.fontSize(10)
           .font('Helvetica')
           .text('RECIBÍ POR MEDIO DE EDIFICACIONES OROCAZA SA DE CV, LA CANTIDAD DE', centerX, contentStartY, { 
               align: 'center', 
               width: contentWidth
           });
        
        contentStartY += 20;
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(`$${montoPagado} MXN`, centerX, contentStartY, { 
               align: 'center', 
               width: contentWidth
           });
        
        contentStartY += 25;
        doc.font('Helvetica')
           .fontSize(10)
           .text('EN EFECTIVO POR CONCEPTO DE', centerX, contentStartY, { 
               align: 'center', 
               width: contentWidth
           });
        
        contentStartY += 20;
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('PAGO DE NÓMINA', centerX, contentStartY, { 
               align: 'center', 
               width: contentWidth
           });
        doc.font('Helvetica');
        
        // Información del proyecto
        contentStartY += 20;
        doc.text(`DEL PROYECTO ${nombreProyecto.toUpperCase()}, ${ubicacionProyecto.toUpperCase()}.`, centerX, contentStartY, { 
            align: 'center', 
            width: contentWidth
        });

        // Desglose de nómina - Nueva sección (con posición Y ajustada)
        // Calculamos la posición inicial basada en el contenido anterior
        let desgloseY = contentStartY + 40; // Dejamos espacio después de la sección anterior
        
        // Línea separadora antes del desglose
        doc.moveTo(margin, desgloseY - 10)
           .lineTo(pageWidth - margin, desgloseY - 10)
           .lineWidth(0.5)
           .strokeColor('#cccccc')
           .stroke();
           
        // Título de la sección de desglose con mejor diseño
        doc.font('Helvetica-Bold')
           .fillColor('#444444')
           .fontSize(12)
           .text('DESGLOSE DE NÓMINA', margin + 10, desgloseY);
           
        desgloseY += 25;
        
        // Creamos dos columnas para la información de desglose
        const col1X = margin + 30;
        const col2X = pageWidth/2;
        
        // Columna 1 - Información de semana y periodo
        doc.fontSize(10)
           .fillColor('black')
           .font('Helvetica-Bold')
           .text('Semana:', col1X, desgloseY);
        doc.font('Helvetica')
           .text(`${semanaInfo.semana_iso} del ${semanaInfo.anio}`, col1X + 70, desgloseY);
        
        desgloseY += 20;
        doc.font('Helvetica-Bold')
           .text('Periodo:', col1X, desgloseY);
        doc.font('Helvetica')
           .text(`${semanaInfo.fecha_inicio} al ${semanaInfo.fecha_fin}`, col1X + 70, desgloseY);
           
        // Columna 2 - Información del empleado y días
        const col2Y = desgloseY - 20; // Regresamos arriba para la segunda columna
        doc.font('Helvetica-Bold')
           .text('Empleado:', col2X, col2Y);
        doc.font('Helvetica')
           .text(nombreEmpleado, col2X + 70, col2Y);
        
        doc.font('Helvetica-Bold')
           .text('Días laborados:', col2X, col2Y + 20);
        doc.font('Helvetica')
           .text(nomina.dias_laborados, col2X + 100, col2Y + 20);
           
        // Pago por día en una nueva línea
        desgloseY += 20;
        doc.font('Helvetica-Bold')
           .text('Pago por día:', col1X, desgloseY);
        doc.font('Helvetica')
           .text(`$${parseFloat(nomina.pago_por_dia).toFixed(2)}`, col1X + 90, desgloseY);
        
        // Restauramos para el resto del documento
        doc.font('Helvetica')
           .fillColor('black');

        // Tabla de conceptos con espacio adecuado desde la sección anterior
        const tableY = desgloseY + 50; // Posición ajustada después de la información de desglose
        const tableWidth = pageWidth - margin * 2;
        
        // Líneas para delimitar la tabla (sin fondo)
        doc.moveTo(margin, tableY)
           .lineTo(margin + tableWidth, tableY)
           .lineWidth(0.5)
           .strokeColor('#cccccc')
           .stroke();
        
        // Encabezados de la tabla
        doc.fillColor('#444444')
           .font('Helvetica-Bold')
           .fontSize(11);
        
        // Línea después del encabezado
        doc.moveTo(margin, tableY + 25)
           .lineTo(margin + tableWidth, tableY + 25)
           .lineWidth(0.5)
           .strokeColor('#cccccc')
           .stroke();
        
        const conceptosX = margin + 50;
        const importeX = pageWidth - margin - 100;
        
        // Texto de encabezado
        doc.fillColor('black')
           .text('CONCEPTO', conceptosX, tableY + 8);
        doc.text('IMPORTE', importeX, tableY + 8);
        
        // Restauramos para las filas
        doc.font('Helvetica')
           .fillColor('black');
        
        // Posición inicial para los conceptos
        let yPosition = tableY + 35;
        
        // Función para agregar fila sin fondo alternante
        let rowCount = 0;
        function addRow(concepto, importe) {
            const rowY = yPosition;
            const rowHeight = 22; // Incrementado para dar más espacio
            
            // Texto de la fila sin fondos
            doc.fillColor('black')
               .font('Helvetica')
               .text(concepto, conceptosX, rowY);
            doc.text(importe, importeX, rowY);
            
            yPosition += rowHeight;
            rowCount++;
        }
        
        // Salario base
        const salarioBase = parseFloat(nomina.dias_laborados) * parseFloat(nomina.pago_por_dia);
        addRow('Salario Base', `$${salarioBase.toFixed(2)}`);
        
        // Horas extra
        if (nomina.horas_extra && parseFloat(nomina.horas_extra) > 0) {
            addRow('Horas Extra', `$${parseFloat(nomina.horas_extra).toFixed(2)}`);
        }
        
        // Bonos
        if (nomina.bonos && parseFloat(nomina.bonos) > 0) {
            addRow('Bonos', `$${parseFloat(nomina.bonos).toFixed(2)}`);
        }
        
        // Deducciones
        if (nomina.deducciones && parseFloat(nomina.deducciones) > 0) {
            addRow('Deducciones', `-$${parseFloat(nomina.deducciones).toFixed(2)}`);
        }
        
        // Total sin fondo destacado
        const totalY = yPosition + 15;
        
        // Línea divisoria antes del total
        doc.moveTo(margin, totalY - 10)
           .lineTo(margin + tableWidth, totalY - 10)
           .strokeColor('#cccccc')
           .stroke();
           
        // Texto del total
        doc.fillColor('black')
           .font('Helvetica-Bold')
           .fontSize(12)
           .text('TOTAL', conceptosX, totalY);
        doc.text(`$${parseFloat(nomina.monto_total).toFixed(2)}`, importeX, totalY);
        
        // Sección de firmas en la parte inferior
        const firmasY = totalY + 60; // 60 puntos después del total
        
        // Crear dos recuadros para las firmas
        const firmaWidth = (pageWidth - margin * 2 - 30) / 2;
        const leftBoxX = margin;
        const rightBoxX = margin + firmaWidth + 30;
        
        // Líneas divisorias para las firmas (sin recuadros con fondo)
        doc.moveTo(leftBoxX, firmasY)
           .lineTo(leftBoxX + firmaWidth, firmasY)
           .moveTo(leftBoxX, firmasY + 80)
           .lineTo(leftBoxX + firmaWidth, firmasY + 80)
           .strokeColor('#dddddd')
           .stroke();
           
        doc.moveTo(rightBoxX, firmasY)
           .lineTo(rightBoxX + firmaWidth, firmasY)
           .moveTo(rightBoxX, firmasY + 80)
           .lineTo(rightBoxX + firmaWidth, firmasY + 80)
           .strokeColor('#dddddd')
           .stroke();
           
        // Posiciones centradas en cada recuadro
        const leftFirmaX = leftBoxX + firmaWidth/2;
        const rightFirmaX = rightBoxX + firmaWidth/2;
        
        // Firma izquierda (empleado)
        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('FIRMA DE RECIBIDO', leftBoxX + 10, firmasY + 10, { 
               width: firmaWidth - 20,
               align: 'center'
           });
           
        doc.fontSize(10)
           .font('Helvetica')
           .text('______________________________', leftBoxX + 20, firmasY + 35, {
               width: firmaWidth - 40,
               align: 'center'
           });
           
        // Nombre del empleado centrado debajo de la línea
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(nombreEmpleado, leftBoxX + 10, firmasY + 55, { 
               width: firmaWidth - 20,
               align: 'center'
           });
        
        // Firma derecha (autorizador)
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('FIRMA DE ENTREGADO', rightBoxX + 10, firmasY + 10, { 
               width: firmaWidth - 20,
               align: 'center'
           });
           
        doc.fontSize(10)
           .font('Helvetica')
           .text('______________________________', rightBoxX + 20, firmasY + 35, {
               width: firmaWidth - 40,
               align: 'center'
           });
        
        // Obtener el nombre del usuario que genera el recibo
        const nombreFirmante = req.usuario ? 
            `${req.usuario.nombre_usuario.toUpperCase()}` : 
            'LIC. KAREN COVARRUBIAS';
        
        // Nombre del firmante centrado debajo de la línea
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(nombreFirmante, rightBoxX + 10, firmasY + 55, { 
               width: firmaWidth - 20,
               align: 'center'
           });
        
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

/**
 * Obtener historial de pagos
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getHistorialPagos = async (req, res) => {
    try {
        const { id_empleado } = req.query;
        
        let where = {};
        if (id_empleado) {
            // Si se proporciona un ID de empleado, filtrar por ese empleado
            where = {
                '$nomina.id_empleado$': id_empleado
            };
        }
        
        const pagos = await PagoNomina.findAll({
            include: [{
                model: NominaEmpleado,
                as: 'nomina',
                include: [
                    { model: Empleado, as: 'empleado' },
                    { model: SemanaNomina, as: 'semana' }
                ]
            }],
            where,
            order: [['fecha_pago', 'DESC']]
        });

        res.status(200).json({
            message: 'Historial de pagos obtenido exitosamente',
            pagos
        });
    } catch (error) {
        console.error('Error al obtener historial de pagos:', error);
        res.status(500).json({
            message: 'Error al obtener historial de pagos',
            error: error.message
        });
    }
};

/**
 * Crear una nueva semana de nómina
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const crearSemanaNomina = async (req, res) => {
    try {
        const { anio, semana_iso, etiqueta, fecha_inicio, fecha_fin } = req.body;

        // Validaciones básicas
        if (!anio || !semana_iso || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                message: 'Los campos anio, semana_iso, fecha_inicio y fecha_fin son obligatorios'
            });
        }

        // Verificar que no exista ya una semana con el mismo anio y semana_iso
        const semanaExistente = await SemanaNomina.findOne({
            where: {
                anio,
                semana_iso
            }
        });

        if (semanaExistente) {
            return res.status(400).json({
                message: 'Ya existe una semana con el mismo año y número de semana ISO'
            });
        }

        // Crear la nueva semana
        const nuevaSemana = await SemanaNomina.create({
            anio,
            semana_iso,
            etiqueta,
            fecha_inicio,
            fecha_fin,
            estado: 'Borrador'
        });

        res.status(201).json({
            message: 'Semana de nómina creada exitosamente',
            semana: nuevaSemana
        });
    } catch (error) {
        console.error('Error al crear semana de nómina:', error);
        res.status(500).json({
            message: 'Error al crear semana de nómina',
            error: error.message
        });
    }
};

/**
 * Actualizar estado de semana de nómina
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const actualizarEstadoSemana = async (req, res) => {
    try {
        const { id_semana } = req.params;
        const { estado } = req.body;

        // Validaciones básicas
        if (!estado || !['Borrador', 'En_Proceso', 'Cerrada'].includes(estado)) {
            return res.status(400).json({
                message: 'El estado debe ser Borrador, En_Proceso o Cerrada'
            });
        }

        // Verificar si existe la semana
        const semana = await SemanaNomina.findByPk(id_semana);
        if (!semana) {
            return res.status(404).json({
                message: 'Semana de nómina no encontrada'
            });
        }

        // Actualizar estado
        await semana.update({ estado });

        res.status(200).json({
            message: 'Estado de semana actualizado exitosamente',
            semana
        });
    } catch (error) {
        console.error('Error al actualizar estado de semana:', error);
        res.status(500).json({
            message: 'Error al actualizar estado de semana',
            error: error.message
        });
    }
};

/**
 * Cambiar estado de la nómina
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const cambiarEstadoNomina = async (req, res) => {
    try {
        const { id_nomina } = req.params;
        const { estado } = req.body;

        // Validaciones básicas
        if (!estado || !['Pendiente', 'En_Proceso', 'Aprobada', 'Pagado', 'Cancelada'].includes(estado)) {
            return res.status(400).json({
                message: 'El estado debe ser Pendiente, En_Proceso, Aprobada, Pagado o Cancelada'
            });
        }

        // Verificar si existe la nómina
        const nomina = await NominaEmpleado.findByPk(id_nomina);
        if (!nomina) {
            return res.status(404).json({
                message: 'Nómina no encontrada'
            });
        }

        // Verificar transiciones válidas de estado
        const estadoActual = nomina.estado;
        let transicionValida = true;

        switch(estadoActual) {
            case 'Pendiente':
                // Desde pendiente puede pasar a cualquier estado
                break;
            case 'En_Proceso':
                // Desde en proceso solo puede ir a aprobada, cancelada o volver a pendiente
                if (estado === 'Pagado') {
                    transicionValida = false;
                }
                break;
            case 'Aprobada':
                // Desde aprobada solo puede ir a pagado, cancelada o volver a en proceso
                if (estado === 'Pendiente') {
                    transicionValida = false;
                }
                break;
            case 'Pagado':
                // Desde pagado no se puede cambiar a otro estado (es estado final)
                transicionValida = false;
                break;
            case 'Cancelada':
                // Desde cancelada solo se puede reactivar a pendiente
                if (estado !== 'Pendiente') {
                    transicionValida = false;
                }
                break;
        }

        if (!transicionValida) {
            return res.status(400).json({
                message: `No se puede cambiar el estado de '${estadoActual}' a '${estado}'`
            });
        }

        // Verificar que el estado sea uno de los valores permitidos
        const estadosPermitidos = ['Pendiente', 'En_Proceso', 'Aprobada', 'Pagado', 'Cancelada'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                message: `Estado inválido: '${estado}'. Estados permitidos: ${estadosPermitidos.join(', ')}`
            });
        }

        
        // Actualizar estado
        await nomina.update({ estado });

        // Registrar en historial de nómina
        if (req.usuario) {
            await registrarCambioNomina(
                id_nomina,
                req.usuario.id_usuario,
                'cambio_estado',
                estadoActual,
                estado,
                { motivo: req.body.motivo || 'No especificado' }
            );
        }

        // Registrar en auditoría si existe el modelo
        if (req.usuario && models.Auditoria) {
            await models.Auditoria.create({
                id_usuario: req.usuario.id_usuario,
                accion: 'UPDATE',
                tabla: 'nomina_empleado',
                descripcion: `Cambio de estado de nómina ID ${id_nomina} de '${estadoActual}' a '${estado}'`,
                fecha_hora: new Date(),
                datos_antiguos: JSON.stringify({ estado: estadoActual }),
                datos_nuevos: JSON.stringify({ estado })
            });
        }

        res.status(200).json({
            message: 'Estado de nómina actualizado exitosamente',
            nomina
        });
    } catch (error) {
        console.error('Error al actualizar estado de nómina:', error);
        res.status(500).json({
            message: 'Error al actualizar estado de nómina',
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas de nómina
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getNominaStats = async (req, res) => {
    try {
        // Estadísticas por estado
        const estadisticasPorEstado = await NominaEmpleado.findAll({
            attributes: [
                'estado',
                [sequelize.fn('COUNT', sequelize.col('id_nomina')), 'cantidad'],
                [sequelize.fn('SUM', sequelize.col('monto_total')), 'monto_total']
            ],
            group: ['estado']
        });

        // Total de nómina pendiente de pago
        const nominaPendiente = await NominaEmpleado.sum('monto_total', {
            where: { estado: { [Op.in]: ['Pendiente', 'En_Proceso', 'Aprobada'] } }
        });

        // Total de nómina pagada en el último mes
        const unMesAtras = new Date();
        unMesAtras.setMonth(unMesAtras.getMonth() - 1);
        
        const nominaPagadaUltimoMes = await PagoNomina.sum('monto', {
            where: {
                fecha_pago: { [Op.gte]: unMesAtras }
            }
        });

        res.status(200).json({
            message: 'Estadísticas obtenidas exitosamente',
            estadisticasPorEstado,
            nominaPendiente,
            nominaPagadaUltimoMes
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de nómina:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de nómina',
            error: error.message
        });
    }
};

/**
 * Obtener información necesaria para generar nóminas (proyectos, empleados y semanas)
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getInfoParaNomina = async (req, res) => {
    try {
        // Obtener todos los proyectos activos
        const proyectos = await models.Proyectos.findAll({
            where: {
                estado: 'Activo' 
            },
            attributes: ['id_proyecto', 'nombre', 'ubicacion', 'responsable']
        });
        
        // Obtener todos los empleados activos (no dados de baja)
        const empleados = await models.Empleados.findAll({
            where: {
                fecha_baja: null // Filtramos solo los que no tienen fecha de baja
            },
            attributes: ['id_empleado', 'nombre', 'apellido', 'id_oficio'],
            include: [
                {
                    model: models.Oficios,
                    as: 'oficio',
                    attributes: ['nombre'] // Solo incluimos el nombre del oficio
                }
            ]
        });
        
        // Obtener semanas de nómina activas
        const semanas = await models.Semanas_nomina.findAll({
            where: {
                estado: {
                    [Op.in]: ['Borrador', 'En_Proceso'] // Solo semanas no cerradas
                }
            },
            attributes: ['id_semana', 'semana_iso', 'anio', 'fecha_inicio', 'fecha_fin', 'etiqueta']
        });
        
        // Preparar datos de empleados para respuesta más amigable
        const empleadosFormateados = empleados.map(emp => {
            // Valores por defecto de pago según oficio (puedes ajustarlo según tus necesidades)
            const pagoPorDiaSugerido = {
                'Albañil': 300,
                'Electricista': 350,
                'Plomero': 350,
                'Carpintero': 320,
                'Herrero': 330,
                'Pintor': 280,
                'Ayudante': 200,
            };
            
            const oficio = emp.oficio ? emp.oficio.nombre : 'No especificado';
            const pagoPorDia = pagoPorDiaSugerido[oficio] || 250; // Valor por defecto si no se encuentra el oficio
            
            return {
                id_empleado: emp.id_empleado,
                nombre_completo: `${emp.nombre} ${emp.apellido}`,
                oficio: oficio,
                pago_por_dia_sugerido: pagoPorDia
            };
        });
        
        res.status(200).json({
            message: 'Información para nómina obtenida exitosamente',
            proyectos,
            empleados: empleadosFormateados,
            semanas
        });
    } catch (error) {
        console.error('Error al obtener información para nómina:', error);
        res.status(500).json({
            message: 'Error al obtener información para nómina',
            error: error.message
        });
    }
};

module.exports = {
    getAllNominas,
    getNominasPorSemana,
    getNominasPorEmpleado,
    createNomina,
    updateNomina,
    registrarPagoNomina,
    generarReciboPDF,
    getHistorialPagos,
    crearSemanaNomina,
    actualizarEstadoSemana,
    cambiarEstadoNomina,
    getNominaStats,
    getInfoParaNomina
};
