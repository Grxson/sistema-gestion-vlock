/**
 * 🎯 TEST RÁPIDO DEL SISTEMA VLOCK
 * Copia y pega en la consola del navegador (F12)
 */

console.log('🚀 PROBANDO SISTEMA VLOCK...');

// Test rápido
async function quickTest() {
    try {
        console.log('\n1️⃣ Probando API backend...');
        const apiTest = await fetch('http://localhost:4000/api/');
        const apiResult = await apiTest.text();
        console.log('   ✅ Backend:', apiResult);
        
        console.log('\n2️⃣ Probando login admin...');
        const adminLogin = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@vlock.com', password: 'admin123' })
        });
        const adminData = await adminLogin.json();
        console.log('   ✅ Admin login:', adminData.usuario?.nombre_usuario);
        
        console.log('\n3️⃣ Probando permisos admin...');
        const adminPerms = await fetch('http://localhost:4000/api/auth/permissions', {
            headers: { 'Authorization': `Bearer ${adminData.token}` }
        });
        const adminPermData = await adminPerms.json();
        console.log(`   ✅ Admin permisos: ${adminPermData.permisos?.length} permisos`);
        
        console.log('\n4️⃣ Probando login usuario...');
        const userLogin = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'usuario@vlock.com', password: 'usuario123' })
        });
        const userData = await userLogin.json();
        console.log('   ✅ User login:', userData.usuario?.nombre_usuario);
        
        console.log('\n5️⃣ Probando permisos usuario...');
        const userPerms = await fetch('http://localhost:4000/api/auth/permissions', {
            headers: { 'Authorization': `Bearer ${userData.token}` }
        });
        const userPermData = await userPerms.json();
        console.log(`   ✅ User permisos: ${userPermData.permisos?.length} permisos`);
        
        console.log('\n📊 RESUMEN:');
        console.log(`   👨‍💼 Admin: ${adminPermData.permisos?.length || 0} permisos`);
        console.log(`   👤 User: ${userPermData.permisos?.length || 0} permisos`);
        
        const isCorrect = (adminPermData.permisos?.length || 0) > (userPermData.permisos?.length || 0);
        console.log(`   ${isCorrect ? '✅' : '❌'} Sistema: ${isCorrect ? 'CORRECTO' : 'INCORRECTO'}`);
        
        if (isCorrect) {
            console.log('\n🎉 ¡TODO FUNCIONA PERFECTAMENTE!');
            console.log('\n🔗 Ahora puedes:');
            console.log('   1. Ir a http://localhost:3001 en otra pestaña');
            console.log('   2. Hacer login con admin@vlock.com / admin123');
            console.log('   3. Luego probar con usuario@vlock.com / usuario123');
            console.log('   4. Comparar las diferencias en los módulos visibles');
        } else {
            console.log('\n⚠️ Hay un problema con el sistema de permisos');
        }
        
        return { adminData, userData, adminPermData, userPermData };
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar automáticamente
quickTest();
