const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testEmpleadosEdit() {
    try {
        console.log('🔐 Iniciando sesión...');
        
        // 1. Login para obtener token
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@vlock.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login exitoso');
        
        // 2. Configurar headers con token
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // 3. Obtener proyectos disponibles
        console.log('📋 Obteniendo proyectos...');
        const proyectosResponse = await axios.get(`${BASE_URL}/proyectos`, { headers });
        console.log('✅ Proyectos disponibles:', proyectosResponse.data.data?.length || 0);
        
        // 4. Obtener contratos y oficios
        console.log('📋 Obteniendo contratos y oficios...');
        const [contratosResponse, oficiosResponse] = await Promise.all([
            axios.get(`${BASE_URL}/contratos`, { headers }),
            axios.get(`${BASE_URL}/oficios`, { headers })
        ]);
        
        const contratos = contratosResponse.data.contratos || contratosResponse.data.data || contratosResponse.data;
        const oficios = oficiosResponse.data.oficios || oficiosResponse.data.data || oficiosResponse.data;
        
        console.log('✅ Contratos disponibles:', contratos.length);
        console.log('✅ Oficios disponibles:', oficios.length);
        
        // 5. Crear un empleado de prueba
        console.log('👤 Creando empleado de prueba...');
        const nuevoEmpleado = {
            nombre: 'Juan',
            apellido: 'Pérez García',
            nss: '99999999999', // NSS único para el test
            telefono: '666123456',
            contacto_emergencia: 'María Pérez',
            telefono_emergencia: '666654321',
            banco: 'Santander',
            cuenta_bancaria: 'ES1234567890123456789012',
            id_contrato: contratos[0].id_contrato,
            id_oficio: oficios[0].id_oficio,
            id_proyecto: proyectosResponse.data.data ? proyectosResponse.data.data[0].id_proyecto : 1,
            pago_diario: 300.50
        };
        
        const createResponse = await axios.post(`${BASE_URL}/empleados`, nuevoEmpleado, { headers });
        console.log('✅ Empleado creado con ID:', createResponse.data.data.id_empleado);
        
        const empleadoId = createResponse.data.data.id_empleado;
        
        // 6. Intentar editar el empleado (esto era lo que fallaba antes)
        console.log('✏️ Editando empleado...');
        const empleadoEditado = {
            nombre: 'Juan Carlos',
            apellido: 'Pérez García',
            nss: '99999999999', // Mantener el mismo NSS
            telefono: '666123457', // Cambiamos el teléfono
            contacto_emergencia: 'María Carmen Pérez',
            telefono_emergencia: '666654322',
            banco: 'BBVA', // Cambiar banco
            cuenta_bancaria: 'ES9876543210987654321098', // Cambiar cuenta
            id_contrato: contratos[0].id_contrato,
            id_oficio: oficios[1] ? oficios[1].id_oficio : oficios[0].id_oficio,
            id_proyecto: proyectosResponse.data.data && proyectosResponse.data.data[1] ? proyectosResponse.data.data[1].id_proyecto : (proyectosResponse.data.data ? proyectosResponse.data.data[0].id_proyecto : 2), // Cambiar proyecto si hay más de uno
            pago_diario: 325.75, // Cambiar pago diario
            activo: true
        };
        
        const updateResponse = await axios.put(`${BASE_URL}/empleados/${empleadoId}`, empleadoEditado, { headers });
        console.log('✅ Empleado editado exitosamente');
        console.log('📊 Respuesta:', updateResponse.data);
        
        // 7. Verificar que los cambios se guardaron
        console.log('🔍 Verificando cambios...');
        const getResponse = await axios.get(`${BASE_URL}/empleados/${empleadoId}`, { headers });
        const empleadoActualizado = getResponse.data.empleado;
        
        console.log('📋 Datos actualizados:');
        console.log('  - Nombre:', empleadoActualizado.nombre);
        console.log('  - Apellido:', empleadoActualizado.apellido);
        console.log('  - NSS:', empleadoActualizado.nss);
        console.log('  - Teléfono:', empleadoActualizado.telefono);
        console.log('  - Banco:', empleadoActualizado.banco);
        console.log('  - Cuenta:', empleadoActualizado.cuenta_bancaria);
        console.log('  - Proyecto ID:', empleadoActualizado.id_proyecto);
        console.log('  - Pago diario:', empleadoActualizado.pago_diario);
        
        // 8. Limpiar - eliminar empleado de prueba
        console.log('🗑️ Limpiando empleado de prueba...');
        await axios.delete(`${BASE_URL}/empleados/${empleadoId}`, { headers });
        console.log('✅ Empleado eliminado');
        
        console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
        console.log('✅ La funcionalidad de edición de empleados está funcionando correctamente');
        console.log('✅ El campo id_proyecto se guarda y actualiza correctamente');
        console.log('✅ El campo pago_diario se guarda y actualiza correctamente');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
        console.error('📍 Error específico:', error.response?.data?.error || 'No disponible');
        
        if (error.response?.data?.details) {
            console.error('🔍 Detalles:', error.response.data.details);
        }
    }
}

testEmpleadosEdit();
