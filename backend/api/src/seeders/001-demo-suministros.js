module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Verificar si ya hay datos en suministros
      const [results] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM suministros'
      );
      
      if (results[0].count > 0) {
        console.log('Ya existen suministros en la base de datos, saltando seeder');
        return;
      }

      // Obtener primer proyecto y proveedor disponibles
      const [proyectos] = await queryInterface.sequelize.query(
        'SELECT id_proyecto FROM proyectos LIMIT 1'
      );
      const [proveedores] = await queryInterface.sequelize.query(
        'SELECT id_proveedor FROM proveedores LIMIT 1'
      );

      if (!proyectos.length || !proveedores.length) {
        console.log('No hay proyectos o proveedores disponibles para el seeder');
        return;
      }

      const proyectoId = proyectos[0].id_proyecto;
      const proveedorId = proveedores[0].id_proveedor;
      const fechaHoy = new Date().toISOString().split('T')[0];

      // Datos de prueba para suministros
      const suministrosPrueba = [
        // Gastos Administrativos
        {
          folio: 'ADM-001',
          fecha: fechaHoy,
          id_proyecto: proyectoId,
          id_proveedor: proveedorId,
          metodo_pago: 'Transferencia',
          tipo_suministro: 'Consumible',
          id_categoria_suministro: 10, // Consumible
          nombre: 'Papelería y útiles de oficina',
          codigo_producto: 'PAP-001',
          descripcion_detallada: 'Material de oficina completo: hojas, bolígrafos, carpetas',
          cantidad: 50,
          unidad_medida: 'piezas',
          precio_unitario: 12.50,
          subtotal: 625.00,
          costo_total: 725.00, // Con IVA
          include_iva: true,
          estado: 'Entregado',
          observaciones: 'Suministro administrativo',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          folio: 'ADM-002',
          fecha: fechaHoy,
          id_proyecto: proyectoId,
          id_proveedor: proveedorId,
          metodo_pago: 'Efectivo',
          tipo_suministro: 'Servicio',
          id_categoria_suministro: 9, // Servicio
          nombre: 'Servicio de limpieza oficinas',
          codigo_producto: 'SRV-001',
          descripcion_detallada: 'Servicio de limpieza profunda de oficinas administrativas',
          cantidad: 1,
          unidad_medida: 'servicio',
          precio_unitario: 2500.00,
          subtotal: 2500.00,
          costo_total: 2900.00, // Con IVA
          include_iva: true,
          estado: 'Entregado',
          observaciones: 'Servicio administrativo mensual',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          folio: 'ADM-003',
          fecha: fechaHoy,
          id_proyecto: proyectoId,
          id_proveedor: proveedorId,
          metodo_pago: 'Tarjeta',
          tipo_suministro: 'Consumible',
          id_categoria_suministro: 10, // Consumible
          nombre: 'Combustible para vehículos',
          codigo_producto: 'COMB-001',
          descripcion_detallada: 'Gasolina magna para flotilla vehicular administrativa',
          cantidad: 200,
          unidad_medida: 'litros',
          precio_unitario: 23.50,
          subtotal: 4700.00,
          costo_total: 5452.00, // Con IVA
          include_iva: true,
          estado: 'Entregado',
          observaciones: 'Combustible administrativo',
          created_at: new Date(),
          updated_at: new Date()
        },

        // Gastos de Proyecto
        {
          folio: 'PROY-001',
          fecha: fechaHoy,
          id_proyecto: proyectoId,
          id_proveedor: proveedorId,
          metodo_pago: 'Transferencia',
          tipo_suministro: 'Material',
          id_categoria_suministro: 8, // Concreto
          nombre: 'Concreto premezclado f\'c=300',
          codigo_producto: 'CONC-300',
          descripcion_detallada: 'Concreto premezclado con resistencia 300 kg/cm2',
          cantidad: 15.5,
          unidad_medida: 'm3',
          precio_unitario: 1850.00,
          subtotal: 28675.00,
          costo_total: 33263.00, // Con IVA
          include_iva: true,
          estado: 'Entregado',
          observaciones: 'Material para estructura',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          folio: 'PROY-002',
          fecha: fechaHoy,
          id_proyecto: proyectoId,
          id_proveedor: proveedorId,
          metodo_pago: 'Efectivo',
          tipo_suministro: 'Herramienta',
          id_categoria_suministro: 2, // Herramienta
          nombre: 'Taladro industrial profesional',
          codigo_producto: 'TAL-850',
          descripcion_detallada: 'Taladro percutor 850W con kit de brocas profesional',
          cantidad: 2,
          unidad_medida: 'piezas',
          precio_unitario: 1200.00,
          subtotal: 2400.00,
          costo_total: 2784.00, // Con IVA
          include_iva: true,
          estado: 'Entregado',
          observaciones: 'Herramienta de obra',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          folio: 'PROY-003',
          fecha: fechaHoy,
          id_proyecto: proyectoId,
          id_proveedor: proveedorId,
          metodo_pago: 'Transferencia',
          tipo_suministro: 'Material',
          id_categoria_suministro: 4, // Acero
          nombre: 'Varilla corrugada #4',
          codigo_producto: 'VAR-4',
          descripcion_detallada: 'Varilla corrugada de 3/8" grado 42 para refuerzo',
          cantidad: 100,
          unidad_medida: 'piezas',
          precio_unitario: 85.50,
          subtotal: 8550.00,
          costo_total: 9918.00, // Con IVA
          include_iva: true,
          estado: 'Entregado',
          observaciones: 'Acero de refuerzo estructural',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          folio: 'PROY-004',
          fecha: fechaHoy,
          id_proyecto: proyectoId,
          id_proveedor: proveedorId,
          metodo_pago: 'Efectivo',
          tipo_suministro: 'Material',
          id_categoria_suministro: 6, // Ferretería
          nombre: 'Kit de tornillería y clavos',
          codigo_producto: 'FERR-001',
          descripcion_detallada: 'Surtido completo de tornillos, clavos y fijadores',
          cantidad: 5,
          unidad_medida: 'lotes',
          precio_unitario: 450.00,
          subtotal: 2250.00,
          costo_total: 2610.00, // Con IVA
          include_iva: true,
          estado: 'Entregado',
          observaciones: 'Ferretería general de obra',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          folio: 'PROY-005',
          fecha: fechaHoy,
          id_proyecto: proyectoId,
          id_proveedor: proveedorId,
          metodo_pago: 'Transferencia',
          tipo_suministro: 'Equipo',
          id_categoria_suministro: 3, // Equipo Ligero
          nombre: 'Mezcladora de concreto portátil',
          codigo_producto: 'MEZ-200',
          descripcion_detallada: 'Mezcladora de concreto de 200 litros con motor a gasolina',
          cantidad: 1,
          unidad_medida: 'pieza',
          precio_unitario: 15000.00,
          subtotal: 15000.00,
          costo_total: 17400.00, // Con IVA
          include_iva: true,
          estado: 'Entregado',
          observaciones: 'Equipo ligero para proyecto',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      // Insertar datos
      await queryInterface.bulkInsert('suministros', suministrosPrueba);
      
      console.log('✅ Seeder de suministros ejecutado exitosamente');
      console.log(`📊 Se insertaron ${suministrosPrueba.length} suministros de prueba`);
      console.log('💰 Total gastado administrativo: $8,977.00');
      console.log('🏗️ Total gastado proyecto: $65,975.00');
      console.log('📈 Total general: $74,952.00');

    } catch (error) {
      console.error('❌ Error en seeder de suministros:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar datos de prueba (solo los que tienen folios específicos)
    await queryInterface.bulkDelete('suministros', {
      folio: {
        [Sequelize.Op.in]: ['ADM-001', 'ADM-002', 'ADM-003', 'PROY-001', 'PROY-002', 'PROY-003', 'PROY-004', 'PROY-005']
      }
    });
  }
};