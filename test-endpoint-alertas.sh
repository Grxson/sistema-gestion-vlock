#!/bin/bash

echo "🧪 Probando endpoint de alertas..."
echo ""

# Primero, hacer login para obtener un token
echo "1️⃣  Obteniendo token de autenticación..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vlock.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ No se pudo obtener el token"
  echo "Respuesta del login:"
  echo $LOGIN_RESPONSE | jq '.' 2>/dev/null || echo $LOGIN_RESPONSE
  echo ""
  echo "Intenta con estas credenciales en la app:"
  echo "  Email: admin@vlock.com"
  echo "  Password: admin123"
  exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."
echo ""

# Probar el endpoint de alertas
echo "2️⃣  Probando endpoint /api/adeudos-generales/alertas..."
echo ""

ALERTAS_RESPONSE=$(curl -s http://localhost:4000/api/adeudos-generales/alertas \
  -H "Authorization: Bearer $TOKEN")

echo "Respuesta del servidor:"
echo $ALERTAS_RESPONSE | jq '.' 2>/dev/null || echo $ALERTAS_RESPONSE
echo ""

# Contar alertas
ALERTAS_COUNT=$(echo $ALERTAS_RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ ! -z "$ALERTAS_COUNT" ]; then
  echo "📊 Total de alertas: $ALERTAS_COUNT"
  
  if [ "$ALERTAS_COUNT" -gt 0 ]; then
    echo "✅ El endpoint está funcionando correctamente"
  else
    echo "⚠️  El endpoint funciona pero no hay alertas"
    echo "   Verifica que los adeudos de prueba existan"
  fi
else
  echo "❌ Error en la respuesta del endpoint"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Para ver los logs en la aplicación desktop:"
echo "1. Abre la app: cd desktop && npm run dev"
echo "2. Presiona F12 para abrir DevTools"
echo "3. Ve a la pestaña Console"
echo "4. Busca logs que empiecen con 🔔 [AlertasVencimiento]"
echo ""
