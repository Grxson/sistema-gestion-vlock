// Script para poblar la tabla acciones_permiso con un set amplio de permisos
// Uso:
//  node src/scripts/seed-acciones-permiso.js
//
// Nota: este script es idempotente (usa upsert basado en codigo)

const models = require('../models');

async function upsertAcciones(list) {
  const Accion = models.Acciones_permiso;
  for (const item of list) {
    const { nombre, codigo, modulo, descripcion } = item;
    // 1) Intentar por codigo
    let existing = await Accion.findOne({ where: { codigo } });
    if (existing) {
      await existing.update({ nombre, modulo, descripcion });
      console.log(`↻ Actualizado: ${codigo} (${nombre})`);
      continue;
    }
    // 2) Intentar por nombre (posible duplicado previo con otro codigo)
    existing = await Accion.findOne({ where: { nombre } });
    if (existing) {
      await existing.update({ codigo, modulo, descripcion });
      console.log(`↻ Reconciliado por nombre: ${nombre} -> codigo ${codigo}`);
      continue;
    }
    // 3) Crear si no existe
    await Accion.create({ nombre, codigo, modulo, descripcion });
    console.log(`✓ Creado: ${codigo} (${nombre})`);
  }
}

function perms(modulo, defs) {
  return defs.map(([nombre, codigo, descripcion]) => ({ nombre, codigo, modulo, descripcion }));
}

async function main() {
  try {
    const acciones = [
      // Dashboard
      ...perms('dashboard', [
        ['Ver Dashboard', 'dashboard.ver', 'Acceso al panel principal']
      ]),

      // Empleados
      ...perms('empleados', [
        ['Ver empleados', 'empleados.ver'],
        ['Crear empleado', 'empleados.crear'],
        ['Editar empleado', 'empleados.editar'],
        ['Eliminar empleado', 'empleados.eliminar'],
        ['Exportar empleados', 'empleados.exportar']
      ]),

      // Nómina
      ...perms('nomina', [
        ['Ver nómina', 'nomina.ver'],
        ['Crear nómina', 'nomina.crear'],
        ['Editar nómina', 'nomina.editar'],
        ['Eliminar nómina', 'nomina.eliminar'],
        ['Procesar nómina', 'nomina.procesar'],
        ['Exportar nómina', 'nomina.exportar'],
        ['Ver historial nómina', 'nomina.historial.ver']
      ]),

      // Contratos
      ...perms('contratos', [
        ['Ver contratos', 'contratos.ver'],
        ['Crear contrato', 'contratos.crear'],
        ['Editar contrato', 'contratos.editar'],
        ['Eliminar contrato', 'contratos.eliminar'],
        ['Exportar contratos', 'contratos.exportar']
      ]),

      // Oficios
      ...perms('oficios', [
        ['Ver oficios', 'oficios.ver'],
        ['Crear oficio', 'oficios.crear'],
        ['Editar oficio', 'oficios.editar'],
        ['Eliminar oficio', 'oficios.eliminar'],
        ['Exportar oficios', 'oficios.exportar']
      ]),

      // Proveedores
      ...perms('proveedores', [
        ['Ver proveedores', 'proveedores.ver'],
        ['Crear proveedor', 'proveedores.crear'],
        ['Editar proveedor', 'proveedores.editar'],
        ['Eliminar proveedor', 'proveedores.eliminar'],
        ['Exportar proveedores', 'proveedores.exportar']
      ]),

      // Proyectos
      ...perms('proyectos', [
        ['Ver proyectos', 'proyectos.ver'],
        ['Crear proyecto', 'proyectos.crear'],
        ['Editar proyecto', 'proyectos.editar'],
        ['Eliminar proyecto', 'proyectos.eliminar'],
        ['Exportar proyectos', 'proyectos.exportar'],
        ['Ver finanzas proyecto', 'proyectos.ver_finanzas']
      ]),

      // Suministros (gastos)
      ...perms('suministros', [
        ['Ver suministros', 'suministros.ver'],
        ['Crear suministro', 'suministros.crear'],
        ['Editar suministro', 'suministros.editar'],
        ['Eliminar suministro', 'suministros.eliminar'],
        ['Exportar suministros', 'suministros.exportar'],
        ['Ver movimientos suministros', 'suministros.movimientos.ver'],
        ['Registrar entrada', 'suministros.movimientos.entrada'],
        ['Registrar salida', 'suministros.movimientos.salida']
      ]),

      // Herramientas
      ...perms('herramientas', [
        ['Ver herramientas', 'herramientas.ver'],
        ['Crear herramienta', 'herramientas.crear'],
        ['Editar herramienta', 'herramientas.editar'],
        ['Eliminar herramienta', 'herramientas.eliminar'],
        ['Exportar herramientas', 'herramientas.exportar'],
        ['Gestionar movimientos herramientas', 'herramientas.movimientos.gestionar'],
        ['Asignar herramienta', 'herramientas.asignar'],
        ['Devolver herramienta', 'herramientas.devolver'],
        ['Ver reportes herramientas', 'herramientas.reportes.ver']
      ]),

      // Adeudos
      ...perms('adeudos', [
        ['Ver adeudos', 'adeudos.ver'],
        ['Crear adeudo', 'adeudos.crear'],
        ['Editar adeudo', 'adeudos.editar'],
        ['Eliminar adeudo', 'adeudos.eliminar'],
        ['Liquidar adeudo', 'adeudos.liquidar'],
        ['Registrar pago parcial', 'adeudos.pago_parcial'],
        ['Exportar adeudos', 'adeudos.exportar']
      ]),

      // Adeudos generales
      ...perms('adeudos_generales', [
        ['Ver adeudos generales', 'adeudos_generales.ver'],
        ['Crear adeudo general', 'adeudos_generales.crear'],
        ['Editar adeudo general', 'adeudos_generales.editar'],
        ['Eliminar adeudo general', 'adeudos_generales.eliminar'],
        ['Liquidar adeudo general', 'adeudos_generales.liquidar']
      ]),

      // Finanzas / gastos / ingresos
      ...perms('finanzas', [
        ['Ver gastos', 'finanzas.gastos.ver'],
        ['Crear gasto', 'finanzas.gastos.crear'],
        ['Editar gasto', 'finanzas.gastos.editar'],
        ['Eliminar gasto', 'finanzas.gastos.eliminar'],
        ['Ver ingresos', 'ingresos.ver'],
        ['Crear ingreso', 'ingresos.crear']
      ]),

      // Auditoría y reportes
      ...perms('auditoria', [
        ['Ver auditoría', 'auditoria.ver'],
        ['Exportar auditoría', 'auditoria.exportar'],
        ['Limpiar auditoría', 'auditoria.limpiar']
      ]),
      ...perms('reportes', [
        ['Ver reportes', 'reportes.ver'],
        ['Generar reportes', 'reportes.generar'],
        ['Exportar reportes', 'reportes.exportar']
      ]),

      // Configuración y seguridad
      ...perms('usuarios', [
        ['Ver usuarios', 'usuarios.ver'],
        ['Crear usuario', 'usuarios.crear'],
        ['Editar usuario', 'usuarios.editar'],
        ['Eliminar usuario', 'usuarios.eliminar'],
        ['Cambiar contraseña', 'usuarios.cambiar_password'],
        ['Activar/Desactivar usuario', 'usuarios.toggle_activo']
      ]),
      ...perms('roles', [
        ['Ver roles', 'roles.ver'],
        ['Crear rol', 'roles.crear'],
        ['Editar rol', 'roles.editar'],
        ['Eliminar rol', 'roles.eliminar'],
        ['Asignar permisos', 'roles.asignar_permisos']
      ]),
      ...perms('configuracion', [
        ['Ver configuración', 'configuracion.ver'],
        ['Editar configuración', 'configuracion.editar']
      ]),

      // Respaldos
      ...perms('respaldos', [
        ['Ver respaldos', 'respaldos.ver']
      ])
    ];

    await upsertAcciones(acciones);
    console.log('\n✔ Permisos sincronizados correctamente.');
  } catch (err) {
    console.error('❌ Error en el seeding de acciones de permiso:', err);
    process.exitCode = 1;
  } finally {
    if (models.sequelize) await models.sequelize.close();
  }
}

main();
