const models = require('../models');
const NominaEmpleado = models.Nomina_empleado;
const Empleado = models.Empleados;
const SemanaNomina = models.Semanas_nomina;
const PagoNomina = models.Pagos_nomina;
const Proyecto = models.Proyectos;
const NominaHistorial = models.Nomina_historial;
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { calcularNomina } = require('../utils/nominaCalculator');
const { calcularSemanaISO, generarInfoSemana, detectarSemanaActual } = require('../utils/weekCalculator');
const { registrarCambioNomina } = require('./nominaHistorial.controller');
const { generarReciboPDF } = require('./nominaPDF.controller');
const sequelize = require('../config/db');

/**
 * Registra un movimiento en el libro de ingresos asociado a una nómina
 * @param {Object} nominaInstance - Instancia de nómina (Sequelize)
 * @param {Object} [options]
 * @param {Date|string} [options.fecha]
 * @param {string} [options.descripcion]
 * @param {number} [options.monto]
 * @param {boolean} [options.forzar]
 * @param {Object} [options.empleado]
 * @param {Object} [options.semana]
 * @returns {Promise<{registrado: boolean, motivo?: string, movimiento?: Object}>}
 */
async function registrarMovimientoNomina(nominaInstance, options = {}) {
    if (!nominaInstance) {
        return { registrado: false, motivo: 'SIN_NOMINA' };
    }

    if (!nominaInstance.id_proyecto) {
        return { registrado: false, motivo: 'SIN_PROYECTO' };
    }

    const montoMovimiento = parseFloat(options.monto ?? nominaInstance.monto_total) || 0;
    if (montoMovimiento <= 0) {
        return { registrado: false, motivo: 'MONTO_NO_POSITIVO' };
    }

    const movimientosModel = models.ingresos_movimientos;

    if (!options.forzar) {
        const existente = await movimientosModel.findOne({
            where: {
                ref_tipo: 'nomina',
                ref_id: nominaInstance.id_nomina
            }
        });

        if (existente) {
            return { registrado: false, motivo: 'YA_REGISTRADO', movimiento: existente };
        }
    }

    const IngresoModel = models.Ingresos || models.ingresos || models.Ingreso;
    if (!IngresoModel) {
        throw new Error('Modelo Ingreso no disponible');
    }

    const ingresoProyecto = await IngresoModel.findOne({
        where: { id_proyecto: nominaInstance.id_proyecto },
        order: [['fecha', 'DESC']]
    });

    if (!ingresoProyecto) {
        return { registrado: false, motivo: 'SIN_INGRESO' };
    }

    const empleado = options.empleado || await Empleado.findByPk(nominaInstance.id_empleado);
    const semana = options.semana || await SemanaNomina.findByPk(nominaInstance.id_semana);

    const descripcion = options.descripcion || `Pago nómina - ${empleado?.nombre || 'Empleado'}${empleado?.apellido ? ` ${empleado.apellido}` : ''} - Semana ${semana?.semana_iso || nominaInstance.id_semana}`;

    const movimiento = await movimientosModel.registrarGasto({
        id_ingreso: ingresoProyecto.id_ingreso,
        id_proyecto: nominaInstance.id_proyecto,
        monto: montoMovimiento,
        fecha: options.fecha || new Date(),
        descripcion,
        ref_tipo: 'nomina',
        ref_id: nominaInstance.id_nomina,
        fuente: 'nomina'
    });

    return { registrado: true, movimiento };
}

/**
 * Obtener todas las nóminas
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllNominas = async (req, res) => {
    try {
        // Query SIN includes para evitar referencias circulares
        // Obtenemos los datos manualmente
        const nominasRaw = await NominaEmpleado.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        });

        // Obtener IDs únicos de empleados y semanas
        const empleadoIds = [...new Set(nominasRaw.map(n => n.id_empleado))];
        const semanaIds = [...new Set(nominasRaw.map(n => n.id_semana))];

        // Consultas separadas sin includes anidados
        const empleados = await Empleado.findAll({
            where: { id_empleado: empleadoIds },
            attributes: ['id_empleado', 'nombre', 'apellido', 'nss', 'rfc', 'telefono', 'pago_semanal', 'activo', 'id_proyecto']
        });

        const semanas = await SemanaNomina.findAll({
            where: { id_semana: semanaIds },
            attributes: ['id_semana', 'anio', 'semana_iso', 'etiqueta', 'fecha_inicio', 'fecha_fin', 'estado']
        });

        // Mapear para acceso rápido
        const empleadosMap = new Map(empleados.map(e => [e.id_empleado, e.toJSON()]));
        const semanasMap = new Map(semanas.map(s => [s.id_semana, s.toJSON()]));

        // Combinar datos manualmente
        const nominas = nominasRaw.map(nomina => {
            const nominaJSON = nomina.toJSON();
            return {
                ...nominaJSON,
                empleado: empleadosMap.get(nomina.id_empleado) || null,
                semana: semanasMap.get(nomina.id_semana) || null
            };
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
 * Obtener una nómina por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getNominaById = async (req, res) => {
    try {
        const { id } = req.params;

        const nomina = await NominaEmpleado.findByPk(id, {
            include: [
                { model: Empleado, as: 'empleado' },
                { model: SemanaNomina, as: 'semana' },
                { model: Proyecto, as: 'proyecto' }
            ]
        });

        if (!nomina) {
            return res.status(404).json({
                success: false,
                message: 'Nómina no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: nomina
        });
    } catch (error) {
        console.error('Error al obtener nómina por ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener nómina',
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
            id_proyecto, // Agregamos el campo para el proyecto
            dias_laborados,
            pago_semanal,
            horas_extra,
            deducciones_adicionales,
            bonos,
            monto_isr,
            monto_imss,
            monto_infonavit,
            descuentos,
            // Nuevos campos para pagos parciales
            pago_parcial = false,
            monto_a_pagar = null,
            liquidar_adeudos = false,
            es_pago_semanal = false,
            // Nuevos campos: período y semana seleccionados por el usuario
            periodo_anio,
            periodo_mes,
            semana_del_mes
        } = req.body;

        // Validaciones básicas
        if (!id_empleado || !dias_laborados || !pago_semanal || !id_proyecto) {
            return res.status(400).json({
                message: 'Los campos id_empleado, id_proyecto, dias_laborados y pago_semanal son obligatorios'
            });
        }

        // Convertir valores a números
        const diasLaboradosNum = parseFloat(dias_laborados);
        const pagoSemanalNum = parseFloat(pago_semanal);
        const horasExtraNum = parseFloat(horas_extra || 0);
        const deduccionesAdicionalesNum = parseFloat(deducciones_adicionales || 0);
        const bonosNum = parseFloat(bonos || 0);
        const montoISRNum = parseFloat(monto_isr || 0);
        const montoIMSSNum = parseFloat(monto_imss || 0);
        const montoInfonavitNum = parseFloat(monto_infonavit || 0);
        const descuentosNum = parseFloat(descuentos || 0);

        // Buscar o crear la semana en la tabla semanas_nomina
        // Si el frontend envía período y semana, usarlos; si no, usar fecha actual (retrocompatibilidad)
        let infoSemana;
        if (periodo_anio && periodo_mes && semana_del_mes) {
            // LÓGICA UNIFICADA: Usar semanas ISO, asignadas al mes solo si ≥4 días caen en él
            const year = parseInt(periodo_anio, 10);
            const month0 = parseInt(periodo_mes, 10) - 1;

            const primerDia = new Date(year, month0, 1);
            const ultimoDia = new Date(year, month0 + 1, 0);

            // Retroceder hasta el lunes anterior al primer día del mes
            const diaInicio = primerDia.getDay();
            const diasHastaLunes = diaInicio === 0 ? -6 : (1 - diaInicio);
            let fechaActual = new Date(primerDia);
            fechaActual.setDate(fechaActual.getDate() + diasHastaLunes);

            const semanasDelMes = [];
            const seen = new Set();

            // Iterar por todas las semanas que tocan el mes
            while (fechaActual <= ultimoDia) {
                // Generar info de la semana ISO
                const infoSem = generarInfoSemana(fechaActual);
                const key = `${infoSem.año}-${infoSem.semanaISO}`;
                
                // Contar cuántos días de esta semana caen dentro del mes
                const lunesSemana = new Date(infoSem.fechaInicio);
                const domingoSemana = new Date(infoSem.fechaFin);
                
                let diasEnMes = 0;
                for (let d = new Date(lunesSemana); d <= domingoSemana; d.setDate(d.getDate() + 1)) {
                    if (d.getMonth() === month0 && d.getFullYear() === year) {
                        diasEnMes++;
                    }
                }
                
                // Solo incluir la semana si ≥4 días caen en este mes
                if (!seen.has(key) && diasEnMes >= 4) {
                    seen.add(key);
                    semanasDelMes.push({
                        año: infoSem.año,
                        semanaISO: infoSem.semanaISO,
                        etiqueta: infoSem.etiqueta,
                        fechaInicio: infoSem.fechaInicio,
                        fechaFin: infoSem.fechaFin,
                        diasEnMes
                    });
                }
                
                // Avanzar 7 días
                fechaActual.setDate(fechaActual.getDate() + 7);
            }

            // Validar que la semana solicitada existe
            if (semana_del_mes > semanasDelMes.length) {
                return res.status(400).json({
                    success: false,
                    message: `El mes ${periodo_mes}/${periodo_anio} solo tiene ${semanasDelMes.length} semanas ISO. Solicitaste la semana ${semana_del_mes}.`
                });
            }

            // Obtener la semana ISO correspondiente (1-based)
            infoSemana = semanasDelMes[semana_del_mes - 1];

            console.log('🔍 [CREATE_NOMINA] Usando período y semana del usuario (mayoría de días):', {
                periodo_anio,
                periodo_mes,
                semana_del_mes,
                semanaISO: infoSemana.semanaISO,
                año: infoSemana.año,
                etiqueta: infoSemana.etiqueta
            });
        } else {
            // Retrocompatibilidad: usar fecha actual si no se envían los datos
            const fechaActual = new Date();
            infoSemana = generarInfoSemana(fechaActual);
            console.log('⚠️ [CREATE_NOMINA] Usando fecha actual (retrocompatibilidad)');
        }
        
        console.log('🔍 [CREATE_NOMINA] Información de semana calculada:', {
            semanaISO: infoSemana.semanaISO,
            año: infoSemana.año,
            etiqueta: infoSemana.etiqueta,
            fechaInicio: infoSemana.fechaInicio,
            fechaFin: infoSemana.fechaFin
        });

        // Buscar si ya existe una semana con el mismo año y semana ISO
        let semanaNomina = await SemanaNomina.findOne({
            where: {
                anio: infoSemana.año,
                semana_iso: infoSemana.semanaISO
            }
        });

        // Si no existe, crear la semana
        if (!semanaNomina) {
            console.log('🔍 [CREATE_NOMINA] Creando nueva semana en semanas_nomina');
            semanaNomina = await SemanaNomina.create({
                anio: infoSemana.año,
                semana_iso: infoSemana.semanaISO,
                etiqueta: infoSemana.etiqueta,
                fecha_inicio: infoSemana.fechaInicio,
                fecha_fin: infoSemana.fechaFin,
                estado: 'Borrador'
            });
            console.log('✅ [CREATE_NOMINA] Semana creada con ID:', semanaNomina.id_semana);
        } else {
            console.log('✅ [CREATE_NOMINA] Semana encontrada con ID:', semanaNomina.id_semana);
        }

        // Usar el ID de la semana encontrada/creada
        const idSemanaCorrecto = semanaNomina.id_semana;

        // VALIDACIÓN CRÍTICA: Verificar que no exista ya una nómina para este empleado en esta semana
        const nominaExistente = await NominaEmpleado.findOne({
            where: {
                id_empleado: id_empleado,
                id_semana: idSemanaCorrecto
            }
        });

        if (nominaExistente) {
            console.log('❌ [CREATE_NOMINA] Ya existe nómina para este empleado en esta semana:', {
                id_empleado,
                id_semana: idSemanaCorrecto,
                semana_iso: infoSemana.semanaISO,
                año: infoSemana.año,
                id_nomina_existente: nominaExistente.id_nomina
            });
            return res.status(400).json({
                success: false,
                message: `Ya existe una nómina para este empleado en la ${infoSemana.etiqueta}. No se pueden crear nóminas duplicadas para el mismo empleado en la misma semana del mismo período.`,
                nominaExistente: {
                    id_nomina: nominaExistente.id_nomina,
                    estado: nominaExistente.estado,
                    monto_total: nominaExistente.monto_total
                }
            });
        }

        // Utilizar la función de cálculo de nómina
        // Si monto > 0: usar manual, si monto = 0: calcular automático
        const resultado = calcularNomina(
            diasLaboradosNum,
            pagoSemanalNum,
            horasExtraNum,
            bonosNum,
            true, // aplicarISR (siempre true, se controla con monto)
            true, // aplicarIMSS (siempre true, se controla con monto)
            true, // aplicarInfonavit (siempre true, se controla con monto)
            deduccionesAdicionalesNum,
            es_pago_semanal,
            montoISRNum,
            montoIMSSNum,
            montoInfonavitNum,
            descuentosNum
        );

        // Determinar el monto a pagar
        let montoAPagar = resultado.montoTotal;
        let montoAdeudo = 0;
        let adeudosLiquidados = [];

        if (pago_parcial && monto_a_pagar !== null) {
            const montoParcial = parseFloat(monto_a_pagar);
            if (montoParcial > 0 && montoParcial < resultado.montoTotal) {
                montoAPagar = montoParcial;
                montoAdeudo = resultado.montoTotal - montoParcial;
            }
        }

        // Verificar si hay liquidación automática (monto pagado > monto total)
        if (montoAPagar > resultado.montoTotal) {
            const excedente = montoAPagar - resultado.montoTotal;
            console.log(`💰 [LIQUIDACION_AUTOMATICA] Excedente detectado: $${excedente.toFixed(2)}`);
            
            // Buscar adeudos pendientes del empleado
            const adeudosPendientes = await NominaEmpleado.findAll({
                where: {
                    id_empleado: id_empleado,
                    pago_parcial: true,
                    estado: 'Pendiente'
                },
                order: [['createdAt', 'ASC']] // Liquidar los más antiguos primero
            });

            console.log(`💰 [LIQUIDACION_AUTOMATICA] Adeudos pendientes encontrados: ${adeudosPendientes.length}`);

            let excedenteRestante = excedente;
            
            // Liquidar adeudos con el excedente
            for (const adeudo of adeudosPendientes) {
                if (excedenteRestante <= 0) break;
                
                const montoTotalAdeudo = parseFloat(adeudo.monto_total);
                const montoYaPagadoAdeudo = parseFloat(adeudo.monto_pagado || 0);
                const montoPendienteAdeudo = montoTotalAdeudo - montoYaPagadoAdeudo;
                
                if (montoPendienteAdeudo > 0) {
                    const montoALiquidar = Math.min(excedenteRestante, montoPendienteAdeudo);
                    const nuevoMontoPagadoAdeudo = montoYaPagadoAdeudo + montoALiquidar;
                    const pagoCompletadoAdeudo = nuevoMontoPagadoAdeudo >= montoTotalAdeudo;
                    
                    // Actualizar el adeudo
                    await adeudo.update({
                        monto_pagado: nuevoMontoPagadoAdeudo,
                        monto_a_pagar: pagoCompletadoAdeudo ? 0 : (montoTotalAdeudo - nuevoMontoPagadoAdeudo),
                        pago_parcial: !pagoCompletadoAdeudo,
                        estado: pagoCompletadoAdeudo ? 'Pagado' : 'Pendiente',
                        fecha_pago: pagoCompletadoAdeudo ? new Date() : adeudo.fecha_pago,
                        motivo_ultimo_cambio: `Liquidación automática desde nómina ${id_semana}: $${montoALiquidar.toFixed(2)}`
                    });
                    
                    adeudosLiquidados.push({
                        id_nomina: adeudo.id_nomina,
                        monto_liquidado: montoALiquidar,
                        pago_completado: pagoCompletadoAdeudo
                    });
                    
                    excedenteRestante -= montoALiquidar;
                    
                    console.log(`✅ [LIQUIDACION_AUTOMATICA] Adeudo ${adeudo.id_nomina} liquidado: $${montoALiquidar.toFixed(2)}`);
                }
            }
            
            // Si aún hay excedente, ajustar el monto a pagar
            if (excedenteRestante > 0) {
                montoAPagar = resultado.montoTotal + excedenteRestante;
                console.log(`💰 [LIQUIDACION_AUTOMATICA] Excedente restante: $${excedenteRestante.toFixed(2)}`);
            }
        }

        // Determinar el estado de la nómina
        // Por defecto, todas las nóminas nuevas están "Borrador" hasta generar PDF
        // Solo se marcan como "Pagado" si se especifica explícitamente
        const estadoNomina = 'Borrador';

        // Crear la nueva nómina
        const nuevaNomina = await NominaEmpleado.create({
            id_empleado,
            id_semana: idSemanaCorrecto, // Usar el ID correcto de la semana
            id_proyecto, // Agregamos el ID del proyecto
            periodo: periodo_anio && periodo_mes ? `${periodo_anio}-${String(periodo_mes).padStart(2, '0')}` : null,
            semana: semana_del_mes || null,
            dias_laborados: diasLaboradosNum,
            pago_semanal: pagoSemanalNum,
            es_pago_semanal: es_pago_semanal, // Nuevo campo para identificar pago semanal
            horas_extra: horasExtraNum,
            deducciones: resultado.deducciones.total,
            deducciones_isr: resultado.deducciones.isr,
            deducciones_imss: resultado.deducciones.imss,
            deducciones_infonavit: resultado.deducciones.infonavit,
            deducciones_adicionales: resultado.deducciones.adicionales,
            descuentos: resultado.deducciones.descuentos || 0,
            bonos: bonosNum,
            monto_total: resultado.montoTotal,
            monto_pagado: montoAPagar, // Nuevo campo para el monto realmente pagado
            pago_parcial: montoAdeudo > 0, // Marcar como pago parcial si hay adeudo
            monto_a_pagar: montoAdeudo > 0 ? montoAdeudo : null, // Monto pendiente
            estado: estadoNomina // Estado dinámico: 'pagada' si es completa, 'pendiente' si es parcial
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
                id_empleado: id_empleado,
                monto_adeudo: resultado.montoTotal, // Monto total que se debe
                monto_pagado: montoAPagar, // Monto ya pagado
                monto_pendiente: montoPendienteCalculado, // Calcular explícitamente
                fecha_adeudo: new Date(),
                estado: montoAPagar > 0 ? 'Parcial' : 'Pendiente', // Determinar estado explícitamente
                observaciones: `Pago parcial de nómina ${nuevaNomina.id_nomina}. Total: $${resultado.montoTotal.toFixed(2)}, Pagado: $${montoAPagar.toFixed(2)}, Pendiente: $${montoPendienteCalculado.toFixed(2)}`
            });
        }

        // Liquidar adeudos pendientes si se solicita
        if (liquidar_adeudos) {
            const adeudosPendientes = await models.Adeudo_empleado.findAll({
                where: {
                    id_empleado: id_empleado,
                    estado: ['Pendiente', 'Parcial']
                }
            });

            for (const adeudo of adeudosPendientes) {
                await adeudo.update({
                    monto_pendiente: 0,
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
                estadoNomina === 'Borrador' ? 'Borrador' : 'Pagado',
                {
                    dias_laborados: diasLaboradosNum,
                    pago_semanal: pagoSemanalNum,
                    horas_extra: horasExtraNum,
                    deducciones: resultado.deducciones.total,
                    bonos: bonosNum,
                    monto_total: resultado.montoTotal,
                    monto_pagado: montoAPagar,
                    monto_adeudo: montoAdeudo
                }
            );
        }

        res.status(201).json({
            message: adeudosLiquidados.length > 0 
                ? `Nómina creada exitosamente. ${adeudosLiquidados.length} adeudo(s) liquidado(s) automáticamente.`
                : 'Nómina creada exitosamente',
            nomina: nuevaNomina,
            calculo: resultado, // Incluir desglose del cálculo en la respuesta
            adeudos_liquidados: adeudosLiquidados // Información sobre adeudos liquidados
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
            pago_semanal,
            horas_extra,
            deducciones, // total opcional (retrocompatibilidad)
            bonos,
            estado,
            // Nuevos campos de desglose
            deducciones_isr,
            deducciones_imss,
            deducciones_infonavit,
            deducciones_adicionales,
            descuentos,
            // Campos para pago parcial
            pago_parcial,
            monto_a_pagar,
            liquidar_adeudos,
            // Permite forzar el monto_total desde frontend (si ya viene calculado)
            monto_total
        } = req.body;

        // Verificar si existe la nómina
        const nomina = await NominaEmpleado.findByPk(id);
        if (!nomina) {
            return res.status(404).json({
                message: 'Nómina no encontrada'
            });
        }

        // Normalizar números helper
        const toNum = (v, def = 0) => {
            if (v === null || v === undefined || v === '') return def;
            const n = parseFloat(v);
            return isNaN(n) ? def : n;
        };

        // Calcular totales considerando el desglose
        let nuevoMontoTotal = nomina.monto_total;
        let nuevoISR = toNum(deducciones_isr, nomina.deducciones_isr || 0);
        let nuevoIMSS = toNum(deducciones_imss, nomina.deducciones_imss || 0);
        let nuevoInfonavit = toNum(deducciones_infonavit, nomina.deducciones_infonavit || 0);
        let nuevasAdicionales = toNum(deducciones_adicionales, nomina.deducciones_adicionales || 0);
        let nuevosDescuentos = toNum(descuentos, nomina.descuentos || 0);

        // Si el frontend envía monto_total explícito, úsalo
        if (monto_total !== undefined) {
            nuevoMontoTotal = toNum(monto_total, nomina.monto_total);
        } else {
            // Recalcular cuando cambie algún campo relevante
            if (
                dias_laborados !== undefined ||
                pago_semanal !== undefined ||
                horas_extra !== undefined ||
                bonos !== undefined ||
                deducciones !== undefined ||
                deducciones_isr !== undefined ||
                deducciones_imss !== undefined ||
                deducciones_infonavit !== undefined ||
                deducciones_adicionales !== undefined ||
                descuentos !== undefined
            ) {
                const diasLaboradosCalc = toNum(dias_laborados, nomina.dias_laborados);
                const pagoSemanalCalc = toNum(pago_semanal, nomina.pago_semanal);
                const horasExtraCalc = toNum(horas_extra, nomina.horas_extra || 0);
                const bonosCalc = toNum(bonos, nomina.bonos || 0);

                // Si envían 'deducciones' total, úsalo como base del total de deducciones; si no, suma desglose
                const totalDeducciones =
                    deducciones !== undefined
                        ? toNum(deducciones)
                        : (nuevoISR + nuevoIMSS + nuevoInfonavit + nuevasAdicionales + nuevosDescuentos);

                const salarioBaseProporcional = (pagoSemanalCalc / 6) * diasLaboradosCalc;
                nuevoMontoTotal = salarioBaseProporcional + horasExtraCalc + bonosCalc - totalDeducciones;
            }
        }

        // Actualizar nómina
        await nomina.update({
            dias_laborados: dias_laborados !== undefined ? dias_laborados : nomina.dias_laborados,
            pago_semanal: pago_semanal !== undefined ? pago_semanal : nomina.pago_semanal,
            horas_extra: horas_extra !== undefined ? horas_extra : nomina.horas_extra,
            // Guardar deducciones desglosadas y total
            deducciones_isr: nuevoISR,
            deducciones_imss: nuevoIMSS,
            deducciones_infonavit: nuevoInfonavit,
            deducciones_adicionales: nuevasAdicionales,
            descuentos: nuevosDescuentos,
            deducciones: deducciones !== undefined ? toNum(deducciones) : (nuevoISR + nuevoIMSS + nuevoInfonavit + nuevasAdicionales + nuevosDescuentos),
            bonos: bonos !== undefined ? bonos : nomina.bonos,
            monto_total: nuevoMontoTotal,
            estado: estado || nomina.estado,
            // Campos para pago parcial
            pago_parcial: pago_parcial !== undefined ? pago_parcial : nomina.pago_parcial,
            monto_a_pagar: monto_a_pagar !== undefined ? monto_a_pagar : nomina.monto_a_pagar,
            liquidar_adeudos: liquidar_adeudos !== undefined ? liquidar_adeudos : nomina.liquidar_adeudos
        });

        console.log('🔍 [BACKEND_UPDATE] Nómina actualizada exitosamente:', {
            id,
            monto_total_guardado: nuevoMontoTotal,
            dias_laborados: nomina.dias_laborados
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
 * Eliminar una nómina
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const deleteNomina = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('🔍 [DELETE_NOMINA] Iniciando eliminación de nómina:', id);

        // Verificar si existe la nómina
        const nomina = await NominaEmpleado.findByPk(id, {
            include: [
                { model: Empleado, as: 'empleado' }
            ]
        });

        if (!nomina) {
            console.log('❌ [DELETE_NOMINA] Nómina no encontrada:', id);
            return res.status(404).json({
                success: false,
                message: 'Nómina no encontrada'
            });
        }

        console.log('🔍 [DELETE_NOMINA] Nómina encontrada:', {
            id: nomina.id_nomina,
            empleado: nomina.empleado?.nombre + ' ' + nomina.empleado?.apellido,
            estado: nomina.estado
        });

        // Verificar si la nómina está en estado que permite eliminación
        const estado = nomina.estado?.toLowerCase();
        if (estado === 'pagada' || estado === 'pagado' || estado === 'completada' || estado === 'completado') {
            console.log('❌ [DELETE_NOMINA] No se puede eliminar nómina completada:', estado);
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar una nómina que ya está completada o pagada'
            });
        }

        // Iniciar transacción para eliminar en cascada
        await sequelize.transaction(async (t) => {
            console.log('🔍 [DELETE_NOMINA] Eliminando pagos relacionados...');
            
            // Eliminar pagos relacionados
            await PagoNomina.destroy({
                where: { id_nomina: id },
                transaction: t
            });

            console.log('🔍 [DELETE_NOMINA] Eliminando historial relacionado...');
            
            // Eliminar historial relacionado
            await NominaHistorial.destroy({
                where: { id_nomina: id },
                transaction: t
            });

            // 🗑️ Eliminar movimiento asociado en ingresos_movimientos si existe
            console.log('🔍 [DELETE_NOMINA] Verificando movimientos asociados...');
            try {
                const MovimientosModel = models.ingresos_movimientos;
                if (MovimientosModel) {
                    const movimientosEliminados = await MovimientosModel.destroy({
                        where: {
                            ref_tipo: 'nomina',
                            ref_id: id
                        },
                        transaction: t
                    });
                    
                    if (movimientosEliminados > 0) {
                        console.log(`✅ [DELETE_NOMINA] Eliminados ${movimientosEliminados} movimiento(s) de capital asociado(s)`);
                    } else {
                        console.log(`ℹ️ [DELETE_NOMINA] No se encontraron movimientos de capital asociados`);
                    }
                }
            } catch (movError) {
                console.error('⚠️ [DELETE_NOMINA] Error al eliminar movimientos (no crítico):', movError);
                // No fallar la transacción completa si falla esto
            }

            console.log('🔍 [DELETE_NOMINA] Eliminando nómina principal...');
            
            // Eliminar la nómina principal
            await nomina.destroy({ transaction: t });
        });

        console.log('✅ [DELETE_NOMINA] Nómina eliminada exitosamente:', id);

        res.status(200).json({
            success: true,
            message: 'Nómina eliminada exitosamente'
        });

    } catch (error) {
        console.error('❌ [DELETE_NOMINA] Error al eliminar nómina:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar nómina',
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
        
        // 🆕 Registrar movimiento en ingresos (si la nómina tiene proyecto asociado)
        if (nomina.id_proyecto) {
            try {
                const empleado = await Empleado.findByPk(nomina.id_empleado);
                const semana = await SemanaNomina.findByPk(nomina.id_semana);
                const montoMovimiento = parseFloat(monto) || parseFloat(nomina.monto_total) || 0;

                const resultadoMovimiento = await registrarMovimientoNomina(nomina, {
                    fecha: new Date(),
                    descripcion: `Pago nómina - ${empleado?.nombre || 'Empleado'}${empleado?.apellido ? ` ${empleado.apellido}` : ''} - Semana ${semana?.semana_iso || nomina.id_semana}`,
                    monto: montoMovimiento,
                    empleado,
                    semana
                });

                if (resultadoMovimiento.registrado) {
                    console.log('✅ Movimiento de nómina registrado exitosamente:', {
                        id_movimiento: resultadoMovimiento.movimiento.id_movimiento,
                        proyecto: nomina.id_proyecto,
                        monto: montoMovimiento
                    });
                } else {
                    console.log(`ℹ️  Movimiento de nómina no registrado (${resultadoMovimiento.motivo})`);
                }
            } catch (errorMovimiento) {
                console.error('⚠️ Error registrando movimiento de nómina:', errorMovimiento);
            }
        } else {
            console.log('ℹ️  Nómina sin proyecto - no se registrará movimiento');
        }
        
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
           .text(`$${parseFloat(nomina.pago_semanal).toFixed(2)}`, col1X + 90, desgloseY);
        
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
        const salarioBase = parseFloat(nomina.dias_laborados) * parseFloat(nomina.pago_semanal);
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
        const { fecha_inicio, fecha_fin, etiqueta } = req.body;

        // Validaciones básicas
        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                message: 'Los campos fecha_inicio y fecha_fin son obligatorios'
            });
        }

        // Calcular automáticamente la semana ISO y año
        const fechaInicio = new Date(fecha_inicio);
        const infoSemana = generarInfoSemana(fechaInicio);
        
        const anio = infoSemana.año;
        const semana_iso = infoSemana.semanaISO;
        const etiquetaFinal = etiqueta || infoSemana.etiqueta;

        // Verificar que no exista ya una semana con el mismo anio y semana_iso
        const semanaExistente = await SemanaNomina.findOne({
            where: {
                anio,
                semana_iso
            }
        });

        if (semanaExistente) {
            return res.status(400).json({
                message: `Ya existe una semana con el mismo año (${anio}) y número de semana ISO (${semana_iso})`
            });
        }

        // Crear la nueva semana
        const nuevaSemana = await SemanaNomina.create({
            anio,
            semana_iso,
            etiqueta: etiquetaFinal,
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

        // Validaciones básicas (permitir 'Borrador' y cualquier transición)
        const estadosPermitidos = ['Borrador', 'Pendiente', 'En_Proceso', 'Aprobada', 'Pagado', 'Cancelada'];
        if (!estado || !estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                message: `Estado inválido: '${estado}'. Estados permitidos: ${estadosPermitidos.join(', ')}`
            });
        }

        // Verificar si existe la nómina
        const nomina = await NominaEmpleado.findByPk(id_nomina);
        if (!nomina) {
            return res.status(404).json({
                message: 'Nómina no encontrada'
            });
        }

        // Estado actual (solo para registro en historial)
        const estadoActual = nomina.estado;

        
        // Actualizar estado
        await nomina.update({ estado });

        // 🆕 Registrar movimiento automático cuando se marca como pagado
        if (estado === 'Pagado' && estadoActual !== 'Pagado') {
            try {
                const resultadoMovimiento = await registrarMovimientoNomina(nomina, {
                    fecha: new Date()
                });
                if (resultadoMovimiento.registrado) {
                    console.log('✅ Movimiento de nómina registrado (cambio de estado):', {
                        id_movimiento: resultadoMovimiento.movimiento.id_movimiento,
                        proyecto: nomina.id_proyecto
                    });
                } else {
                    console.log(`ℹ️  No se registró movimiento en cambio de estado (${resultadoMovimiento.motivo})`);
                }
            } catch (errorMovimiento) {
                console.error('⚠️ Error registrando movimiento durante cambio de estado:', errorMovimiento);
            }
        }

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
            where: { estado: { [Op.in]: ['borrador', 'generada', 'revisada'] } }
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
                pago_semanal_sugerido: pagoSemanal
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

/**
 * Verificar si ya existe una nómina para un empleado en una semana específica del período
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const verificarDuplicados = async (req, res) => {
    try {
        const { id_empleado, periodo, semana } = req.query;
        
        console.log('🔍 [VERIFICAR_DUPLICADOS] Parámetros recibidos:', {
            id_empleado,
            periodo,
            semana
        });

        // Validar parámetros requeridos
        if (!id_empleado || !periodo || !semana) {
            return res.status(400).json({
                success: false,
                message: 'Parámetros requeridos: id_empleado, periodo, semana'
            });
        }

        // Validar formato del período (YYYY-MM)
        const periodoRegex = /^\d{4}-\d{2}$/;
        if (!periodoRegex.test(periodo)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de período inválido. Use YYYY-MM'
            });
        }

        // Validar semana (1-6)
        const semanaNum = parseInt(semana);
        if (isNaN(semanaNum) || semanaNum < 1 || semanaNum > 6) {
            return res.status(400).json({
                success: false,
                message: 'Semana debe ser un número entre 1 y 6'
            });
        }

        // Extraer año y mes del período
        const [año, mes] = periodo.split('-').map(Number);
        
        // ALGORITMO CORREGIDO: Solo contar semanas ISO cuya MAYORÍA de días (≥4) 
        // caen dentro del mes solicitado (estándar ISO 8601)
        const primerDiaDelMes = new Date(año, mes - 1, 1);
        const ultimoDiaDelMes = new Date(año, mes, 0);
        
        // Obtener todas las semanas ISO que pertenecen mayoritariamente a este mes
        const semanasDelMes = [];
        let fechaActual = new Date(primerDiaDelMes);
        
        // Retroceder hasta el lunes anterior al primer día del mes
        const diaInicio = fechaActual.getDay();
        const diasHastaLunes = diaInicio === 0 ? -6 : (1 - diaInicio);
        fechaActual.setDate(fechaActual.getDate() + diasHastaLunes);
        
        // Iterar por todas las semanas que tocan el mes
        while (fechaActual <= ultimoDiaDelMes) {
            const infoSemanaActual = generarInfoSemana(fechaActual);
            
            // Contar cuántos días de esta semana ISO caen dentro del mes
            const lunesSemana = new Date(infoSemanaActual.fechaInicio);
            const domingoSemana = new Date(infoSemanaActual.fechaFin);
            
            let diasEnElMes = 0;
            for (let d = new Date(lunesSemana); d <= domingoSemana; d.setDate(d.getDate() + 1)) {
                if (d.getMonth() === mes - 1 && d.getFullYear() === año) {
                    diasEnElMes++;
                }
            }
            
            // Solo incluir la semana si la MAYORÍA de sus días (4 o más) caen en este mes
            const yaExiste = semanasDelMes.some(s => 
                s.año === infoSemanaActual.año && 
                s.semanaISO === infoSemanaActual.semanaISO
            );
            
            if (!yaExiste && diasEnElMes >= 4) {
                semanasDelMes.push({
                    ...infoSemanaActual,
                    diasEnMes: diasEnElMes
                });
            }
            
            // Avanzar 7 días
            fechaActual.setDate(fechaActual.getDate() + 7);
        }
        
        console.log('🔍 [VERIFICAR_DUPLICADOS] Semanas ISO del mes:', {
            año,
            mes,
            totalSemanas: semanasDelMes.length,
            semanas: semanasDelMes.map(s => `ISO ${s.semanaISO} (${s.etiqueta})`)
        });
        
        // Validar que la semana solicitada existe
        if (semanaNum > semanasDelMes.length) {
            return res.status(400).json({
                success: false,
                message: `El mes ${mes}/${año} solo tiene ${semanasDelMes.length} semanas ISO. Solicitaste la semana ${semanaNum}.`
            });
        }
        
        // Obtener la semana ISO correspondiente (semanaNum - 1 porque el array es 0-indexado)
        const infoSemana = semanasDelMes[semanaNum - 1];
        
        console.log('🔍 [VERIFICAR_DUPLICADOS] Semana seleccionada:', {
            semanaNumero: semanaNum,
            semanaISO: infoSemana.semanaISO,
            año: infoSemana.año,
            etiqueta: infoSemana.etiqueta
        });
        
        // Buscar la semana en la tabla semanas_nomina
        const semanaNomina = await SemanaNomina.findOne({
            where: {
                anio: infoSemana.año,
                semana_iso: infoSemana.semanaISO
            }
        });

        if (!semanaNomina) {
            console.log('✅ [VERIFICAR_DUPLICADOS] No existe semana configurada, no hay duplicados');
            return res.status(200).json({
                success: true,
                existe: false,
                message: 'No existe semana configurada para este período'
            });
        }
        
        // CORRECCIÓN CRÍTICA: Buscar nóminas del empleado en esta semana ISO específica
        // Esto asegura que no se puedan crear múltiples nóminas del mismo empleado
        // en la misma semana ISO del mismo año
        const nominasExistentes = await NominaEmpleado.findAll({
            where: {
                id_empleado: id_empleado,
                id_semana: semanaNomina.id_semana
            },
            include: [
                {
                    model: Empleado,
                    as: 'empleado',
                    attributes: ['id_empleado', 'nombre', 'apellido', 'nss']
                },
                {
                    model: SemanaNomina,
                    as: 'semana',
                    attributes: ['id_semana', 'anio', 'semana_iso', 'etiqueta']
                }
            ]
        });

        console.log('🔍 [VERIFICAR_DUPLICADOS] Nóminas encontradas:', {
            cantidad: nominasExistentes.length,
            id_empleado,
            id_semana: semanaNomina.id_semana,
            semana_iso: infoSemana.semanaISO,
            año: infoSemana.año,
            periodo,
            semana: semanaNum
        });

        const existe = nominasExistentes.length > 0;
        const nominaExistente = existe ? nominasExistentes[0] : null;

        res.status(200).json({
            success: true,
            existe: existe,
            nominaExistente: nominaExistente ? {
                id_nomina: nominaExistente.id_nomina,
                estado: nominaExistente.estado,
                fecha_creacion: nominaExistente.fecha_creacion,
                monto_total: nominaExistente.monto_total,
                empleado: {
                    nombre: nominaExistente.empleado.nombre,
                    apellido: nominaExistente.empleado.apellido,
                    nss: nominaExistente.empleado.nss
                },
                semana: {
                    id_semana: nominaExistente.semana.id_semana,
                    anio: nominaExistente.semana.anio,
                    semana_iso: nominaExistente.semana.semana_iso,
                    etiqueta: nominaExistente.semana.etiqueta
                }
            } : null,
            message: existe 
                ? `Ya existe una nómina para este empleado en la ${infoSemana.etiqueta} (Semana ${semana} de ${periodo})`
                : `No existe nómina para este empleado en la ${infoSemana.etiqueta} (Semana ${semana} de ${periodo})`
        });

    } catch (error) {
        console.error('Error verificando duplicados:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al verificar duplicados',
            error: error.message
        });
    }
};

/**
 * Liquidar adeudo pendiente de una nómina
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const liquidarAdeudo = async (req, res) => {
    try {
        const { id } = req.params;
        const { monto_pagado, observaciones } = req.body;
        
        console.log('💰 [LIQUIDAR_ADEUDO] Parámetros recibidos:', {
            id_nomina: id,
            monto_pagado,
            observaciones
        });

        // Verificar si existe la nómina
        const nomina = await NominaEmpleado.findByPk(id, {
            include: [
                { model: Empleado, as: 'empleado' }
            ]
        });
        
        if (!nomina) {
            return res.status(404).json({
                success: false,
                message: 'Nómina no encontrada'
            });
        }

        // Verificar que sea una nómina con pago parcial
        if (!nomina.pago_parcial) {
            return res.status(400).json({
                success: false,
                message: 'Esta nómina no tiene pago parcial'
            });
        }

        // Calcular el monto pendiente
        const montoTotal = parseFloat(nomina.monto_total);
        const montoYaPagado = parseFloat(nomina.monto_pagado || 0);
        const montoPendiente = montoTotal - montoYaPagado;
        const montoPagadoNuevo = parseFloat(monto_pagado || 0);

        console.log('💰 [LIQUIDAR_ADEUDO] Cálculos:', {
            montoTotal,
            montoYaPagado,
            montoPendiente,
            montoPagadoNuevo
        });

        // Validar que el monto pagado no exceda el pendiente
        if (montoPagadoNuevo > montoPendiente) {
            return res.status(400).json({
                success: false,
                message: `El monto pagado ($${montoPagadoNuevo.toFixed(2)}) excede el pendiente ($${montoPendiente.toFixed(2)})`
            });
        }

        // Calcular nuevo monto pagado
        const nuevoMontoPagado = montoYaPagado + montoPagadoNuevo;
        const nuevoMontoPendiente = montoTotal - nuevoMontoPagado;

        // Determinar si se completó el pago
        const pagoCompletado = nuevoMontoPendiente <= 0;

        // Actualizar la nómina
        const datosActualizacion = {
            monto_pagado: nuevoMontoPagado,
            monto_a_pagar: pagoCompletado ? 0 : nuevoMontoPendiente,
            pago_parcial: !pagoCompletado, // Si se completó, ya no es parcial
            estado: pagoCompletado ? 'Pagado' : 'Pendiente',
            fecha_pago: pagoCompletado ? new Date() : nomina.fecha_pago,
            motivo_ultimo_cambio: observaciones || `Liquidación parcial: $${montoPagadoNuevo.toFixed(2)}`
        };

        await nomina.update(datosActualizacion);

        console.log('✅ [LIQUIDAR_ADEUDO] Nómina actualizada:', {
            id: nomina.id_nomina,
            nuevoMontoPagado,
            nuevoMontoPendiente,
            pagoCompletado,
            estado: datosActualizacion.estado
        });

        res.status(200).json({
            success: true,
            message: pagoCompletado 
                ? 'Adeudo liquidado completamente' 
                : `Pago parcial procesado. Pendiente: $${nuevoMontoPendiente.toFixed(2)}`,
            data: {
                id_nomina: nomina.id_nomina,
                empleado: `${nomina.empleado.nombre} ${nomina.empleado.apellido}`,
                monto_total: montoTotal,
                monto_pagado: nuevoMontoPagado,
                monto_pendiente: nuevoMontoPendiente,
                pago_completado: pagoCompletado,
                estado: datosActualizacion.estado,
                fecha_pago: datosActualizacion.fecha_pago
            }
        });

    } catch (error) {
        console.error('Error liquidando adeudo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al liquidar adeudo',
            error: error.message
        });
    }
};

module.exports = {
    getAllNominas,
    getNominasPorSemana,
    getNominasPorEmpleado,
    getNominaById,
    createNomina,
    updateNomina,
    deleteNomina,
    registrarPagoNomina,
    generarReciboPDF,
    getHistorialPagos,
    crearSemanaNomina,
    actualizarEstadoSemana,
    cambiarEstadoNomina,
    getNominaStats,
    getInfoParaNomina,
    verificarDuplicados,
    liquidarAdeudo
};
