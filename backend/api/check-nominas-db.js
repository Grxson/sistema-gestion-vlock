/**
 * Script para verificar las nóminas y sus semanas
 */

const sequelize = require('./src/config/db');
const NominaEmpleado = require('./src/models/nominaEmpleados.model')(sequelize, require('sequelize').DataTypes);
const SemanaNomina = require('./src/models/semanaNomina.model')(sequelize, require('sequelize').DataTypes);
const Empleado = require('./src/models/empleados.model')(sequelize, require('sequelize').DataTypes);

// Configurar asociaciones
SemanaNomina.hasMany(NominaEmpleado, { foreignKey: 'id_semana', as: 'nominas' });
NominaEmpleado.belongsTo(SemanaNomina, { foreignKey: 'id_semana', as: 'semana' });
NominaEmpleado.belongsTo(Empleado, { foreignKey: 'id_empleado', as: 'empleado' });

async function checkNominasDB() {
    try {
        console.log('🔍 CONSULTANDO NÓMINAS DE OCTUBRE 2025\n');
        
        const nominas = await NominaEmpleado.findAll({
            include: [
                {
                    model: SemanaNomina,
                    as: 'semana',
                    where: {
                        anio: 2025
                    }
                },
                {
                    model: Empleado,
                    as: 'empleado',
                    attributes: ['nombre', 'apellido']
                }
            ],
            order: [['id_semana', 'ASC']]
        });
        
        console.log(`📊 Total de nóminas encontradas: ${nominas.length}\n`);
        
        nominas.forEach(nomina => {
            const empleado = nomina.empleado ? `${nomina.empleado.nombre} ${nomina.empleado.apellido}` : 'N/A';
            console.log(`Nómina ID: ${nomina.id_nomina} | Empleado: ${empleado}`);
            console.log(`   Semana ID: ${nomina.id_semana} | Semana ISO: ${nomina.semana.semana_iso} | ${nomina.semana.etiqueta}`);
            console.log(`   Estado: ${nomina.estado} | Monto: $${nomina.monto_total}`);
            console.log('');
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkNominasDB();
