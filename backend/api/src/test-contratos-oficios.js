const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

// Función para obtener token de autenticación
async function getAuthToken() {
    try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@vlock.com',
            password: 'admin123'
        });
        return loginResponse.data.token;
    } catch (error) {
        console.error('Error al obtener token:', error.response?.data || error.message);
        return null;
    }
}

// Función para probar endpoints de contratos
async function testContratos(token) {
    console.log('\n🔧 === PRUEBAS DE CONTRATOS ===');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
        // 1. Obtener todos los contratos
        console.log('\n1. Obteniendo todos los contratos...');
        const contratosResponse = await axios.get(`${BASE_URL}/contratos`, { headers });
        console.log(`✅ Contratos obtenidos: ${contratosResponse.data.contratos.length}`);
        
        // 2. Crear un nuevo contrato
        console.log('\n2. Creando nuevo contrato...');
        const nuevoContrato = {
            tipo_contrato: 'Temporal',
            salario_diario: 320.00,
            fecha_inicio: '2025-01-01',
            fecha_fin: '2025-06-30'
        };
        
        const createResponse = await axios.post(`${BASE_URL}/contratos`, nuevoContrato, { headers });
        console.log(`✅ Contrato creado con ID: ${createResponse.data.contrato.id_contrato}`);
        const contratoId = createResponse.data.contrato.id_contrato;
        
        // 3. Obtener contrato por ID
        console.log('\n3. Obteniendo contrato por ID...');
        const contratoResponse = await axios.get(`${BASE_URL}/contratos/${contratoId}`, { headers });
        console.log(`✅ Contrato obtenido: ${contratoResponse.data.contrato.tipo_contrato}`);
        
        // 4. Actualizar contrato
        console.log('\n4. Actualizando contrato...');
        const updateData = { salario_diario: 350.00 };
        const updateResponse = await axios.put(`${BASE_URL}/contratos/${contratoId}`, updateData, { headers });
        console.log(`✅ Contrato actualizado: salario ${updateResponse.data.contrato.salario_diario}`);
        
        // 5. Obtener estadísticas
        console.log('\n5. Obteniendo estadísticas de contratos...');
        const statsResponse = await axios.get(`${BASE_URL}/contratos/stats`, { headers });
        console.log(`✅ Estadísticas obtenidas: ${statsResponse.data.estadisticas.total_contratos} contratos totales`);
        
        // 6. Eliminar contrato
        console.log('\n6. Eliminando contrato...');
        await axios.delete(`${BASE_URL}/contratos/${contratoId}`, { headers });
        console.log('✅ Contrato eliminado exitosamente');
        
    } catch (error) {
        console.error('❌ Error en pruebas de contratos:', error.response?.data || error.message);
    }
}

// Función para probar endpoints de oficios
async function testOficios(token) {
    console.log('\n⚒️ === PRUEBAS DE OFICIOS ===');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
        // 1. Obtener todos los oficios
        console.log('\n1. Obteniendo todos los oficios...');
        const oficiosResponse = await axios.get(`${BASE_URL}/oficios`, { headers });
        console.log(`✅ Oficios obtenidos: ${oficiosResponse.data.oficios.length}`);
        
        // 2. Crear un nuevo oficio
        console.log('\n2. Creando nuevo oficio...');
        const nuevoOficio = {
            nombre: 'Soldador',
            descripcion: 'Especialista en soldadura de metales'
        };
        
        const createResponse = await axios.post(`${BASE_URL}/oficios`, nuevoOficio, { headers });
        console.log(`✅ Oficio creado con ID: ${createResponse.data.oficio.id_oficio}`);
        const oficioId = createResponse.data.oficio.id_oficio;
        
        // 3. Obtener oficio por ID
        console.log('\n3. Obteniendo oficio por ID...');
        const oficioResponse = await axios.get(`${BASE_URL}/oficios/${oficioId}`, { headers });
        console.log(`✅ Oficio obtenido: ${oficioResponse.data.oficio.nombre}`);
        
        // 4. Actualizar oficio
        console.log('\n4. Actualizando oficio...');
        const updateData = { descripcion: 'Especialista en soldadura de acero y aluminio' };
        const updateResponse = await axios.put(`${BASE_URL}/oficios/${oficioId}`, updateData, { headers });
        console.log(`✅ Oficio actualizado: ${updateResponse.data.oficio.descripcion}`);
        
        // 5. Obtener estadísticas
        console.log('\n5. Obteniendo estadísticas de oficios...');
        const statsResponse = await axios.get(`${BASE_URL}/oficios/stats`, { headers });
        console.log(`✅ Estadísticas obtenidas: ${statsResponse.data.estadisticas.total_oficios} oficios totales`);
        
        // 6. Eliminar oficio
        console.log('\n6. Eliminando oficio...');
        await axios.delete(`${BASE_URL}/oficios/${oficioId}`, { headers });
        console.log('✅ Oficio eliminado exitosamente');
        
    } catch (error) {
        console.error('❌ Error en pruebas de oficios:', error.response?.data || error.message);
    }
}

// Función principal
async function runTests() {
    console.log('🚀 Iniciando pruebas de Contratos y Oficios...');
    
    const token = await getAuthToken();
    if (!token) {
        console.error('❌ No se pudo obtener token de autenticación');
        return;
    }
    
    console.log('✅ Token de autenticación obtenido');
    
    await testContratos(token);
    await testOficios(token);
    
    console.log('\n🎉 Pruebas completadas!');
}

// Ejecutar pruebas
runTests().catch(console.error);
