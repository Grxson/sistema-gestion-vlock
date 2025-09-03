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
    
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
        // 1. Obtener todos los contratos
        const contratosResponse = await axios.get(`${BASE_URL}/contratos`, { headers });
        
        // 2. Crear un nuevo contrato
        const nuevoContrato = {
            tipo_contrato: 'Temporal',
            salario_diario: 320.00,
            fecha_inicio: '2025-01-01',
            fecha_fin: '2025-06-30'
        };
        
        const createResponse = await axios.post(`${BASE_URL}/contratos`, nuevoContrato, { headers });
        const contratoId = createResponse.data.contrato.id_contrato;
        
        // 3. Obtener contrato por ID
        const contratoResponse = await axios.get(`${BASE_URL}/contratos/${contratoId}`, { headers });
        
        // 4. Actualizar contrato
        const updateData = { salario_diario: 350.00 };
        const updateResponse = await axios.put(`${BASE_URL}/contratos/${contratoId}`, updateData, { headers });
        
        // 5. Obtener estadísticas
        const statsResponse = await axios.get(`${BASE_URL}/contratos/stats`, { headers });
        
        // 6. Eliminar contrato
        await axios.delete(`${BASE_URL}/contratos/${contratoId}`, { headers });
        
    } catch (error) {
        console.error('❌ Error en pruebas de contratos:', error.response?.data || error.message);
    }
}

// Función para probar endpoints de oficios
async function testOficios(token) {
    
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
        // 1. Obtener todos los oficios
        const oficiosResponse = await axios.get(`${BASE_URL}/oficios`, { headers });
        
        // 2. Crear un nuevo oficio
        const nuevoOficio = {
            nombre: 'Soldador',
            descripcion: 'Especialista en soldadura de metales'
        };
        
        const createResponse = await axios.post(`${BASE_URL}/oficios`, nuevoOficio, { headers });
        const oficioId = createResponse.data.oficio.id_oficio;
        
        // 3. Obtener oficio por ID
        const oficioResponse = await axios.get(`${BASE_URL}/oficios/${oficioId}`, { headers });
        
        // 4. Actualizar oficio
        const updateData = { descripcion: 'Especialista en soldadura de acero y aluminio' };
        const updateResponse = await axios.put(`${BASE_URL}/oficios/${oficioId}`, updateData, { headers });
        
        // 5. Obtener estadísticas
        const statsResponse = await axios.get(`${BASE_URL}/oficios/stats`, { headers });
        
        // 6. Eliminar oficio
        await axios.delete(`${BASE_URL}/oficios/${oficioId}`, { headers });
        
    } catch (error) {
        console.error('❌ Error en pruebas de oficios:', error.response?.data || error.message);
    }
}

// Función principal
async function runTests() {
    
    const token = await getAuthToken();
    if (!token) {
        console.error('❌ No se pudo obtener token de autenticación');
        return;
    }
    
    
    await testContratos(token);
    await testOficios(token);
    
}

// Ejecutar pruebas
runTests().catch(console.error);
