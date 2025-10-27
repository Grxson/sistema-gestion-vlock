const models = require('../models');
const NominaEmpleado = models.Nomina_empleado;
const Empleado = models.Empleados;
const SemanaNomina = models.Semanas_nomina;

async function checkNominas() {
  try {
    console.log('🔍 Consultando nóminas en la base de datos...\n');

    // Obtener todas las nóminas
    const nominas = await NominaEmpleado.findAll({
      include: [
        { 
          model: Empleado, 
          as: 'empleado',
          attributes: ['id_empleado', 'nombre', 'apellido']
        },
        { 
          model: SemanaNomina, 
          as: 'semana',
          attributes: ['id_semana', 'semana_iso', 'anio', 'etiqueta']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`📊 Total de nóminas encontradas: ${nominas.length}\n`);

    if (nominas.length === 0) {
      console.log('❌ No hay nóminas registradas en la base de datos');
      process.exit(0);
    }

    // Agrupar por estado
    const porEstado = {};
    nominas.forEach(nomina => {
      const estado = nomina.estado || 'Sin estado';
      if (!porEstado[estado]) {
        porEstado[estado] = [];
      }
      porEstado[estado].push(nomina);
    });

    console.log('📈 Nóminas por estado:');
    Object.keys(porEstado).forEach(estado => {
      console.log(`  - ${estado}: ${porEstado[estado].length}`);
    });
    console.log('');

    // Mostrar detalles de cada nómina
    console.log('📋 Detalle de nóminas:\n');
    nominas.forEach((nomina, index) => {
      console.log(`${index + 1}. Nómina #${nomina.id_nomina}`);
      console.log(`   Estado: ${nomina.estado || 'Sin estado'}`);
      console.log(`   Empleado: ${nomina.empleado?.nombre || 'N/A'} ${nomina.empleado?.apellido || ''} (ID: ${nomina.id_empleado})`);
      console.log(`   Semana: ${nomina.semana?.etiqueta || 'N/A'} (ISO ${nomina.semana?.semana_iso || 'N/A'})`);
      console.log(`   Días laborados: ${nomina.dias_laborados || 0}`);
      console.log(`   Monto total: $${nomina.monto_total || 0}`);
      console.log(`   Pago parcial: ${nomina.pago_parcial ? 'Sí' : 'No'}`);
      if (nomina.pago_parcial) {
        console.log(`   Monto a pagar: $${nomina.monto_a_pagar || 0}`);
      }
      console.log(`   Creada: ${nomina.createdAt}`);
      console.log('');
    });

    // Filtrar nóminas NO completadas/pagadas
    const nominasNoCompletadas = nominas.filter(nomina => {
      const estado = nomina.estado?.toLowerCase();
      return estado !== 'completado' && estado !== 'pagado';
    });

    console.log(`\n🔴 Nóminas NO completadas/pagadas: ${nominasNoCompletadas.length}`);
    if (nominasNoCompletadas.length > 0) {
      nominasNoCompletadas.forEach((nomina, index) => {
        console.log(`  ${index + 1}. Nómina #${nomina.id_nomina} - Estado: "${nomina.estado}" - Empleado: ${nomina.empleado?.nombre} ${nomina.empleado?.apellido}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al consultar nóminas:', error);
    process.exit(1);
  }
}

checkNominas();
