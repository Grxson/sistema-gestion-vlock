const models = require('../models');
const NominaEmpleado = models.Nomina_empleado;
const Empleado = models.Empleados;
const SemanaNomina = models.Semanas_nomina;
// const PagoNomina = models.Pagos_nomina; // ❌ Asociación eliminada del modelo
// const Proyecto = models.Proyectos; // ❌ Usar models.Proyectos directamente en el include

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

        // Cargar nómina SIN includes para evitar referencias circulares de Sequelize
        // Construiremos el objeto manualmente con queries separadas
        const nominaRaw = await NominaEmpleado.findByPk(id_nomina);

        if (!nominaRaw) {
            return res.status(404).json({
                message: 'Nómina no encontrada'
            });
        }

        // Convertir a objeto plano
        const nomina = nominaRaw.toJSON();

        // Cargar empleado manualmente
        if (nomina.id_empleado) {
            const empleadoRaw = await Empleado.findByPk(nomina.id_empleado);
            if (empleadoRaw) {
                const empleado = empleadoRaw.toJSON();

                // Cargar oficio del empleado si existe
                if (empleado.id_oficio) {
                    const oficioRaw = await models.Oficios.findByPk(empleado.id_oficio);
                    if (oficioRaw) {
                        empleado.oficio = oficioRaw.toJSON();
                    }
                }

                // Cargar proyecto del empleado si existe
                if (empleado.id_proyecto) {
                    const proyectoEmpleadoRaw = await models.Proyectos.findByPk(empleado.id_proyecto);
                    if (proyectoEmpleadoRaw) {
                        empleado.proyecto = proyectoEmpleadoRaw.toJSON();
                    }
                }

                nomina.empleado = empleado;
            }
        }

        // Cargar semana manualmente
        if (nomina.id_semana) {
            const semanaRaw = await SemanaNomina.findByPk(nomina.id_semana);
            if (semanaRaw) {
                nomina.semana = semanaRaw.toJSON();
            }
        }

        // Cargar proyecto de la nómina si existe
        if (nomina.id_proyecto) {
            const proyectoRaw = await models.Proyectos.findByPk(nomina.id_proyecto);
            if (proyectoRaw) {
                nomina.proyecto = proyectoRaw.toJSON();
            }
        }

        // Importamos las dependencias para PDF
        const PDFDocument = require('pdfkit');
        const fs = require('fs-extra');
        const path = require('path');

        const streamMode = req.query?.mode === 'stream' || req.query?.download === '1';
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'recibos');
        if (!streamMode) {
            await fs.ensureDir(uploadsDir);
        }

        // Generar nombre del archivo con formato: nomina_semana-<n>_<Nombre_Empleado>_<YYYYMMDD_HHMMSS>.pdf (usado también en streaming)
        const empleadoData = nomina.empleado;
        const nombreEmpleado = `${empleadoData.nombre}_${empleadoData.apellido}`.replace(/\s+/g, '_');

        // Calcular número de semana del mes
        let numeroSemana = 'N/A';
        if (nomina.semana) {
            const fechaInicio = new Date(nomina.semana.fecha_inicio);
            const mes = fechaInicio.getMonth();
            const dia = fechaInicio.getDate();

            const primerDiaDelMes = new Date(fechaInicio.getFullYear(), mes, 1);
            const diaPrimerDia = primerDiaDelMes.getDay();
            const diasEnPrimeraFila = 7 - diaPrimerDia;

            if (dia <= diasEnPrimeraFila) {
                numeroSemana = 1;
            } else {
                const diasRestantes = dia - diasEnPrimeraFila;
                numeroSemana = 1 + Math.ceil(diasRestantes / 7);
            }
        }

        const now = new Date();
        const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `nomina_semana-${numeroSemana}_${nombreEmpleado}_${ts}.pdf`;
        const filePath = path.join(uploadsDir, fileName);

        // Crear el documento PDF con márgenes más pequeños
        const doc = new PDFDocument({ margin: 20, size: 'letter' });

        // En modo streaming: enviar directo al cliente; en modo archivo: escribir a disco
        let stream = null;
        if (streamMode) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            doc.pipe(res);
        } else {
            stream = fs.createWriteStream(filePath);
            doc.pipe(stream);
        }

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

        // Fecha de inicio de relación laboral (fecha de alta/creación del usuario) con formato legible
        const fechaInicioDate = empleado?.fecha_alta ? new Date(empleado.fecha_alta) : null;
        const fechaInicio = (fechaInicioDate && !isNaN(fechaInicioDate))
            ? fechaInicioDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
            : 'N/A';
        doc.fontSize(8)
            .text(`Fecha de Inicio: ${fechaInicio}`, empCol1X, currentY);

        currentY += 10;

        // Puesto/Oficio del empleado
        const puesto = nomina.empleado?.oficio?.nombre || 'Sin especificar';
        doc.fontSize(8)
            .text(`Puesto: ${puesto}`, empCol1X, currentY);

        currentY += 10;

        // Proyecto del empleado (ahora nomina.proyecto ya es un objeto plano sin referencias circulares)
        const proyecto = nomina.empleado?.proyecto?.nombre || nomina.proyecto?.nombre || 'Sin proyecto';
        doc.fontSize(8)
            .text(`Proyecto: ${proyecto}`, empCol1X, currentY);


        // Columna derecha - INFORMACIÓN DEL PERÍODO
        let col2Y = currentY - 50; // Ajustar para alinear con columna izquierda

        doc.fontSize(10)
            .font('Helvetica-Bold')
            .text('INFORMACIÓN DEL PERÍODO:', empCol2X, col2Y);

        col2Y += 15;

        // Helpers ISO para periodo/semana del mes
        function getMondayOfISOWeek(year, week) {
            const simple = new Date(year, 0, 4 + (week - 1) * 7);
            const day = simple.getDay() || 7; // 1..7
            const monday = new Date(simple);
            monday.setDate(simple.getDate() - day + 1);
            monday.setHours(12, 0, 0, 0);
            return monday;
        }
        function getMajorityMonthFromMonday(monday) {
            const counts = new Map(); // key `${y}-${m}`
            for (let i = 0; i < 7; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                counts.set(key, (counts.get(key) || 0) + 1);
            }
            let bestKey = null, best = -1;
            counts.forEach((v, k) => { if (v > best) { best = v; bestKey = k; } });
            const [yy, mm] = bestKey.split('-').map(Number);
            return { year: yy, month0: mm };
        }
        function listarSemanasISODePeriodo(periodo) {
            const [yy, mm] = periodo.split('-');
            const year = parseInt(yy, 10);
            const month0 = parseInt(mm, 10) - 1;
            const first = new Date(year, month0, 1, 12, 0, 0, 0);
            const last = new Date(year, month0 + 1, 0, 12, 0, 0, 0);
            // lunes que contiene el día 1
            const day = first.getDay() || 7;
            const lunesInicio = new Date(first);
            lunesInicio.setDate(first.getDate() - day + 1);
            const end = new Date(last);
            end.setDate(last.getDate() + 7);
            const list = [];
            const seen = new Set();
            for (let d = new Date(lunesInicio); d <= end; d.setDate(d.getDate() + 7)) {
                // Derivar semana ISO
                const jueves = new Date(d);
                const dow = jueves.getDay();
                const diasHastaJueves = dow === 0 ? 4 : (4 - dow);
                jueves.setDate(d.getDate() + diasHastaJueves);
                const isoYear = jueves.getFullYear();
                const primerEnero = new Date(isoYear, 0, 1);
                const diaPrimerEnero = primerEnero.getDay();
                const diasHastaPrimerJueves = (11 - diaPrimerEnero) % 7;
                const primerJueves = new Date(isoYear, 0, 1 + diasHastaPrimerJueves);
                const diff = Math.floor((jueves - primerJueves) / (1000 * 60 * 60 * 24));
                const isoWeek = Math.floor(diff / 7) + 1;
                const key = `${isoYear}-${isoWeek}`;
                const maj = getMajorityMonthFromMonday(d);
                if (maj.month0 === month0 && !seen.has(key)) {
                    seen.add(key);
                    list.push({ anio: isoYear, semana_iso: isoWeek });
                }
            }
            return list;
        }
        function semanaDelMesDesdeISO(periodo, anioISO, semanaISO) {
            const weeks = listarSemanasISODePeriodo(periodo);
            const idx = weeks.findIndex(w => w.anio === anioISO && w.semana_iso === semanaISO);
            return idx >= 0 ? (idx + 1) : null;
        }

        // Obtener información de la semana desde la base de datos
        let semanaFinal = 'N/A';
        let periodoInfo = '';
        let semanaLinea = '';

        if (nomina.semana) {
            // Usar la información de la semana desde la base de datos
            const semanaData = nomina.semana;
            // Derivar lunes de la semana a partir de anio/semana_iso
            const monday = getMondayOfISOWeek(semanaData.anio, semanaData.semana_iso);
            const saturday = new Date(monday); saturday.setDate(monday.getDate() + 5);
            const fechaInicio = monday;
            const fechaFin = new Date(semanaData.fecha_fin || monday); // por si se requiere

            // Calcular 'semana del mes' por índice ISO dentro del período (mayoría de días)
            const maj = getMajorityMonthFromMonday(monday);
            const periodo = `${maj.year}-${String(maj.month0 + 1).padStart(2, '0')}`;
            const idx = semanaDelMesDesdeISO(periodo, semanaData.anio, semanaData.semana_iso);
            semanaFinal = idx || 'N/A';

            // Calcular rango lunes–sábado para mostrar
            const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            const d1 = monday.getDate();
            const m1 = meses[monday.getMonth()];
            const d2 = saturday.getDate();
            const m2 = meses[saturday.getMonth()];
            const rango = m1 === m2 ? `del ${d1} al ${d2} de ${m1}` : `del ${d1} de ${m1} al ${d2} de ${m2}`;

            periodoInfo = `Semana ${semanaFinal} - ${rango}`;
            // No mostrar línea adicional de semana ni ISO en el PDF
            semanaLinea = '';

            console.log('🔍 [PDF] Información de semana desde BD:', {
                semanaISO: semanaData.semana_iso,
                año: semanaData.anio,
                fechaInicio: fechaInicio.toLocaleDateString('es-MX'),
                fechaFin: fechaFin.toLocaleDateString('es-MX'),
                semanaDelMes: semanaFinal,
                periodo: periodoInfo
            });
        } else {
            // Fallback: calcular desde fecha de creación si no hay información de semana
            const fechaCreacion = new Date(nomina.createdAt);
            const año = fechaCreacion.getFullYear();
            const mes = fechaCreacion.getMonth();

            function calcularSemanaDelMes(fecha) {
                const año = fecha.getFullYear();
                const mes = fecha.getMonth();
                const dia = fecha.getDate();

                const primerDiaDelMes = new Date(año, mes, 1);
                const diaPrimerDia = primerDiaDelMes.getDay();
                const diasEnPrimeraFila = 7 - diaPrimerDia;

                if (dia <= diasEnPrimeraFila) {
                    return 1;
                } else {
                    const diasRestantes = dia - diasEnPrimeraFila;
                    const semanaDelMes = 1 + Math.ceil(diasRestantes / 7);

                    const ultimoDiaDelMes = new Date(año, mes + 1, 0);
                    const diasEnElMes = ultimoDiaDelMes.getDate();
                    const diasRestantesTotal = diasEnElMes - diasEnPrimeraFila;
                    const filasAdicionales = Math.ceil(diasRestantesTotal / 7);
                    const totalFilas = 1 + filasAdicionales;

                    return Math.max(1, Math.min(semanaDelMes, totalFilas));
                }
            }

            semanaFinal = calcularSemanaDelMes(fechaCreacion);
            const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            const nombreMes = meses[mes];
            periodoInfo = `Semana ${semanaFinal} de ${nombreMes}`;
            // No mostrar línea adicional de semana
            semanaLinea = '';

            console.log('🔍 [PDF] Calculando semana desde fecha de creación:', {
                fechaCreacion: fechaCreacion.toLocaleDateString('es-MX'),
                semanaDelMes: semanaFinal,
                periodo: periodoInfo
            });
        }

        doc.fontSize(8)
            .font('Helvetica')
            .text(`Período: ${periodoInfo}`, empCol2X, col2Y);

        col2Y += 10;
        // Omitido: línea adicional de semana (ya se muestra en 'Período')
        doc.text(`Días de Pago: 6`, empCol2X, col2Y); // Siempre 6 días para pago semanal

        col2Y += 10;
        // SBC calculado para semana de 6 días laborales
        const pagoSemanal = parseFloat(nomina.pago_semanal); // pago_semanal contiene el pago semanal
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
        const salarioBase = parseFloat(nomina.pago_semanal); // pago_semanal contiene el pago semanal
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
            const pagoPorHora = (parseFloat(nomina.pago_semanal) / 7) / 8;
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
            const pagoPorHora = (parseFloat(nomina.pago_semanal) / 7) / 8;
            montoHorasExtra = parseFloat(nomina.horas_extra) * pagoPorHora * 2;
        }

        const totalPercepciones = salarioBase + montoHorasExtra + (parseFloat(nomina.bonos) || 0);

        currentY += 10;
        doc.fontSize(9)
            .font('Helvetica-Bold')
            .text(`Total Percepc. más Otros Pagos $`, col3X, currentY)
            .text(`${totalPercepciones.toFixed(2)}`, col4X, currentY);

        currentY += 15; // Reducir espacio antes de deducciones

        // Determinar si hay algo que mostrar (faltas o adelantos)
        const diasBase = 6; // Semana laboral de 6 días
        const diasLaborados = parseInt(nomina.dias_laborados) || 6;
        const diasNoTrabajados = diasBase - diasLaborados;
        const hasFaltas = diasNoTrabajados > 0;
        const hasAdelantos = parseFloat(nomina.descuentos || 0) > 0;

        if (hasFaltas || hasAdelantos) {
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

            // Deducciones - mostrar todas las deducciones aplicadas
            let contadorDeduccion = 1;
            let hayDeducciones = false;

            // Líneas de deducciones fiscales (mantenidas en código pero NO visibles)
            // if (nomina.deducciones_isr && nomina.deducciones_isr > 0) {
            //     doc.fontSize(8)
            //        .font('Helvetica')
            //        .text(contadorDeduccion.toString().padStart(3, '0'), col1X, currentY)
            //        .text('045', col2X, currentY)
            //        .text('ISR', col3X, currentY)
            //        .text(`$${parseFloat(nomina.deducciones_isr).toFixed(2)}`, col4X, currentY);
            //     currentY += 15;
            //     contadorDeduccion++;
            //     hayDeducciones = true;
            // }

            // if (nomina.deducciones_imss && nomina.deducciones_imss > 0) {
            //     doc.fontSize(8)
            //        .font('Helvetica')
            //        .text(contadorDeduccion.toString().padStart(3, '0'), col1X, currentY)
            //        .text('052', col2X, currentY)
            //        .text('IMSS', col3X, currentY)
            //        .text(`$${parseFloat(nomina.deducciones_imss).toFixed(2)}`, col4X, currentY);
            //     currentY += 15;
            //     contadorDeduccion++;
            //     hayDeducciones = true;
            // }

            // if (nomina.deducciones_infonavit && nomina.deducciones_infonavit > 0) {
            //     doc.fontSize(8)
            //        .font('Helvetica')
            //        .text(contadorDeduccion.toString().padStart(3, '0'), col1X, currentY)
            //        .text('053', col2X, currentY)
            //        .text('INFONAVIT', col3X, currentY)
            //        .text(`$${parseFloat(nomina.deducciones_infonavit).toFixed(2)}`, col4X, currentY);
            //     currentY += 15;
            //     contadorDeduccion++;
            //     hayDeducciones = true;
            // }

            // Mostrar deducciones adicionales si existen (OCULTO: Requerimiento actual es no mostrarlas)
            // if (nomina.deducciones_adicionales && nomina.deducciones_adicionales > 0) {
            //     doc.fontSize(8)
            //        .font('Helvetica')
            //        .text(contadorDeduccion.toString().padStart(3, '0'), col1X, currentY)
            //        .text('999', col2X, currentY)
            //        .text('Adicionales', col3X, currentY)
            //        .text(`$${parseFloat(nomina.deducciones_adicionales).toFixed(2)}`, col4X, currentY);
            //     currentY += 15;
            //     contadorDeduccion++;
            //     hayDeducciones = true;
            // }

            // Calcular y mostrar descuento por días no trabajados
            if (diasNoTrabajados > 0) {
                // Calcular descuento por día no trabajado
                const pagoDiario = pagoSemanal / diasBase;
                const descuentoPorDias = pagoDiario * diasNoTrabajados;

                doc.fontSize(8)
                    .font('Helvetica')
                    .text(contadorDeduccion.toString().padStart(3, '0'), col1X, currentY)
                    .text('997', col2X, currentY)
                    .text(`Descuento por ${diasNoTrabajados} día(s) no trabajado(s)`, col3X, currentY)
                    .text(`$${descuentoPorDias.toFixed(2)}`, col4X, currentY);
                currentY += 15;
                contadorDeduccion++;
                hayDeducciones = true;
            }

            // Mostrar adelantos si existen (antes: 'Otros descuentos')
            if (nomina.descuentos && nomina.descuentos > 0) {
                doc.fontSize(8)
                    .font('Helvetica')
                    .text(contadorDeduccion.toString().padStart(3, '0'), col1X, currentY)
                    .text('998', col2X, currentY)
                    .text('Adelantos', col3X, currentY)
                    .text(`$${parseFloat(nomina.descuentos).toFixed(2)}`, col4X, currentY);
                currentY += 15;
                hayDeducciones = true;
            }

            // Si no hay deducciones, NO mostrar ningún mensaje (PDF debe verse como completo)
            // if (!hayDeducciones) {
            //   doc.fontSize(8)
            //      .font('Helvetica-Oblique')
            //      .text('Sin deducciones aplicadas', col1X, currentY);
            //   currentY += 15;
            // }
        }

        currentY += 15; // Reducir espacio antes del resumen

        // ===== RESUMEN FINAL =====
        doc.fontSize(10)
            .font('Helvetica-Bold')
            .text('RESUMEN:', margin, currentY);

        currentY += 15; // Reducir espacio después del título

        // Calcular descuento por días no trabajados
        const diasBaseSemana = 6;
        const diasLaboradosEmpleado = parseInt(nomina.dias_laborados) || 6;
        const diasNoTrabajadosEmpleado = diasBaseSemana - diasLaboradosEmpleado;
        const pagoDiarioEmpleado = pagoSemanal / diasBaseSemana;
        const descuentoPorDiasNoTrabajados = diasNoTrabajadosEmpleado > 0 ? (pagoDiarioEmpleado * diasNoTrabajadosEmpleado) : 0;

        // Total de deducciones SOLO por faltas y adelantos (lo que sí se resta)
        const totalDeducciones = (
            (diasNoTrabajadosEmpleado > 0 ? (pagoDiarioEmpleado * diasNoTrabajadosEmpleado) : 0) +
            parseFloat(nomina.descuentos || 0)
        );

        // Total a pagar = Percepciones - (faltas + adelantos)
        const totalNeto = totalPercepciones - totalDeducciones;

        // No mostrar pago parcial ni notas de movimientos en el PDF
        const montoPagado = 0;
        const esPagoParcial = false;

        // Usar columnas para el resumen también
        const resumenCol1X = margin + 300;
        const resumenCol2X = margin + 450;

        // Mostrar resumen simplificado y claro
        doc.fontSize(9)
            .font('Helvetica')
            .text(`Total Percepciones:`, resumenCol1X, currentY)
            .text(`$${totalPercepciones.toFixed(2)}`, resumenCol2X, currentY);

        currentY += 15;

        // Solo mostrar deducciones si hay alguna
        if (totalDeducciones > 0) {
            doc.text(`Total Deducciones:`, resumenCol1X, currentY)
                .text(`$${totalDeducciones.toFixed(2)}`, resumenCol2X, currentY);
            currentY += 15;
        }

        currentY += 5;

        // Mostrar el total a pagar (destacado)
        // Caja de fondo para destacar
        const totalBoxY = currentY - 4;
        const totalBoxHeight = 20;
        const totalBoxX = resumenCol1X - 10;
        const totalBoxWidth = (pageWidth - margin) - totalBoxX;
        doc.save();
        doc.rect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight)
            .fill('#f2f6ff');
        doc.restore();

        doc.fontSize(13)
            .font('Helvetica-Bold')
            .fillColor('#0a7')
            .text(`TOTAL A PAGAR:`, resumenCol1X, currentY)
            .fillColor('#0a7')
            .text(`$${totalNeto.toFixed(2)}`, resumenCol2X, currentY);
        doc.fillColor('#000000');

        currentY += 20; // Reducir espacio antes del importe en letra

        // ===== IMPORTE CON LETRA =====
        // Usar el Total a Pagar mostrado (igual a Total Percepciones según política actual)
        const montoParaLetra = totalNeto;
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

        // Si es streaming, terminamos aquí (pdfkit cerrará la respuesta)
        if (streamMode) return;

        // Esperar a que termine de escribir a disco
        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        // Actualizar la ruta del recibo en la base de datos
        // Como nomina es un objeto plano (JSON), usamos el modelo directamente
        const relativePath = `/uploads/recibos/${fileName}`;
        await NominaEmpleado.update(
            { recibo_pdf: relativePath },
            { where: { id_nomina: nomina.id_nomina } }
        );

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
            // Configurar encabezados de respuesta y enviar
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-Length', stats.size);
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
