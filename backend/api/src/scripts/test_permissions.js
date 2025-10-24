/**
 * Script de prueba para verificar el sistema de permisos
 * Ejecutar con: node backend/api/src/scripts/test_permissions.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/api/src/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'grxson_18',
  database: process.env.DB_NAME || 'sistema_gestion',
  port: process.env.DB_PORT || 3306
};

async function testPermissions() {
  let connection;
  
  try {
    console.log('🔌 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa\n');

    // 1. Verificar total de permisos
    console.log('📊 ESTADÍSTICAS GENERALES');
    console.log('='.repeat(60));
    
    const [totalPermisos] = await connection.query(
      'SELECT COUNT(*) as total FROM acciones_permisos'
    );
    console.log(`Total de permisos en el sistema: ${totalPermisos[0].total}`);

    // 2. Permisos por módulo
    console.log('\n📦 PERMISOS POR MÓDULO');
    console.log('='.repeat(60));
    
    const [permisosPorModulo] = await connection.query(`
      SELECT 
        modulo,
        COUNT(*) as total_permisos
      FROM acciones_permisos
      GROUP BY modulo
      ORDER BY modulo
    `);
    
    permisosPorModulo.forEach(row => {
      console.log(`  ${row.modulo.padEnd(20)} → ${row.total_permisos} permisos`);
    });

    // 3. Verificar roles existentes
    console.log('\n👥 ROLES REGISTRADOS');
    console.log('='.repeat(60));
    
    const [roles] = await connection.query(
      'SELECT id_rol, nombre, descripcion FROM roles ORDER BY id_rol'
    );
    
    roles.forEach(rol => {
      console.log(`  [${rol.id_rol}] ${rol.nombre}`);
      if (rol.descripcion) {
        console.log(`      ${rol.descripcion}`);
      }
    });

    // 4. Permisos asignados por rol
    console.log('\n🔐 PERMISOS ASIGNADOS POR ROL');
    console.log('='.repeat(60));
    
    for (const rol of roles) {
      const [permisosRol] = await connection.query(`
        SELECT COUNT(*) as total
        FROM permisos_rols pr
        WHERE pr.id_rol = ? AND pr.permitido = 1
      `, [rol.id_rol]);
      
      console.log(`  ${rol.nombre}: ${permisosRol[0].total} permisos asignados`);
      
      // Detalle por módulo
      const [detalleModulo] = await connection.query(`
        SELECT 
          ap.modulo,
          COUNT(*) as total
        FROM permisos_rols pr
        JOIN acciones_permisos ap ON pr.id_accion = ap.id_accion
        WHERE pr.id_rol = ? AND pr.permitido = 1
        GROUP BY ap.modulo
        ORDER BY ap.modulo
      `, [rol.id_rol]);
      
      if (detalleModulo.length > 0) {
        detalleModulo.forEach(detalle => {
          console.log(`    - ${detalle.modulo}: ${detalle.total}`);
        });
      }
      console.log('');
    }

    // 5. Permisos faltantes por rol (comparado con admin)
    console.log('⚠️  ANÁLISIS DE PERMISOS FALTANTES');
    console.log('='.repeat(60));
    
    for (const rol of roles) {
      if (rol.id_rol === 1) continue; // Skip admin
      
      const [faltantes] = await connection.query(`
        SELECT 
          ap.modulo,
          ap.codigo,
          ap.nombre
        FROM acciones_permisos ap
        WHERE ap.id_accion NOT IN (
          SELECT id_accion 
          FROM permisos_rols 
          WHERE id_rol = ? AND permitido = 1
        )
        ORDER BY ap.modulo, ap.codigo
      `, [rol.id_rol]);
      
      console.log(`\n  Rol: ${rol.nombre}`);
      console.log(`  Permisos faltantes: ${faltantes.length}`);
      
      if (faltantes.length > 0 && faltantes.length <= 20) {
        console.log('  Detalle:');
        faltantes.forEach(p => {
          console.log(`    - [${p.modulo}] ${p.codigo}: ${p.nombre}`);
        });
      }
    }

    // 6. Verificar usuarios y sus permisos
    console.log('\n\n👤 USUARIOS Y SUS ROLES');
    console.log('='.repeat(60));
    
    const [usuarios] = await connection.query(`
      SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.email,
        r.nombre as rol,
        u.activo
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario
    `);
    
    usuarios.forEach(user => {
      const estado = user.activo ? '✅' : '❌';
      console.log(`  ${estado} [${user.id_usuario}] ${user.nombre_usuario} (${user.email})`);
      console.log(`      Rol: ${user.rol || 'Sin rol asignado'}`);
    });

    // 7. Módulos del sistema vs permisos
    console.log('\n\n🎯 COBERTURA DE PERMISOS POR MÓDULO');
    console.log('='.repeat(60));
    
    const modulosSistema = [
      'dashboard', 'empleados', 'nomina', 'contratos', 'oficios',
      'proyectos', 'presupuestos', 'suministros', 'proveedores',
      'herramientas', 'adeudos', 'auditoria', 'usuarios', 'roles',
      'configuracion', 'reportes'
    ];
    
    for (const modulo of modulosSistema) {
      const [count] = await connection.query(
        'SELECT COUNT(*) as total FROM acciones_permisos WHERE modulo = ?',
        [modulo]
      );
      
      const status = count[0].total > 0 ? '✅' : '❌';
      console.log(`  ${status} ${modulo.padEnd(20)} → ${count[0].total} permisos`);
    }

    // 8. Recomendaciones
    console.log('\n\n💡 RECOMENDACIONES');
    console.log('='.repeat(60));
    
    const [rolesConPermisos] = await connection.query(`
      SELECT COUNT(DISTINCT id_rol) as total FROM permisos_rols
    `);
    
    const [totalRoles] = await connection.query(
      'SELECT COUNT(*) as total FROM roles'
    );
    
    if (rolesConPermisos[0].total < totalRoles[0].total) {
      console.log('  ⚠️  Hay roles sin permisos asignados');
      console.log('     Asigna permisos a cada rol según sus responsabilidades');
    }
    
    if (totalPermisos[0].total < 50) {
      console.log('  ⚠️  Considera agregar más permisos granulares');
      console.log('     Ejemplo: ver, crear, editar, eliminar, exportar por módulo');
    }
    
    console.log('  ✅ Ejecuta el script init_all_permissions.sql para inicializar');
    console.log('  ✅ Crea roles específicos (Supervisor, Operador, etc.)');
    console.log('  ✅ Asigna permisos personalizados a cada rol');
    console.log('  ✅ Prueba el acceso con usuarios de diferentes roles');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Análisis completado exitosamente\n');

  } catch (error) {
    console.error('❌ Error durante el análisis:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar el test
testPermissions();
