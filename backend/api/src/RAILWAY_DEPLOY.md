# VLock Backend - Despliegue en Railway

## Configuración Rápida

### 1. Conectar repositorio desde Railway Dashboard
1. Ve a [railway.app](https://railway.app) y inicia sesión
2. Crea un nuevo proyecto
3. Selecciona "Deploy from GitHub repo"
4. Conecta este repositorio: `Grxson/sistema-gestion-vlock`
5. Selecciona el directorio raíz: `/backend/api/src`

### 2. Variables de Entorno Requeridas

Configura estas variables en el dashboard de Railway:

```bash
# Base de datos (ya configurada)
DATABASE_URL=mysql://root:nArkIEmlZXJfvffITuStuiuiVIvCmbri@crossover.proxy.rlwy.net:15395/railway

# Configuración individual (backup)
DB_HOST=crossover.proxy.rlwy.net
DB_USER=root
DB_PASS=nArkIEmlZXJfvffITuStuiuiVIvCmbri
DB_NAME=railway
DB_PORT=15395

# Configuración de la aplicación
NODE_ENV=production
JWT_SECRET=clave_super_secreta_production_2024
JWT_EXPIRES=7d
```

### 3. Configuración del Proyecto

El proyecto está configurado con:
- ✅ **Procfile**: Define el comando de inicio
- ✅ **railway.json**: Configuración específica de Railway
- ✅ **package.json**: Scripts de inicio y build
- ✅ **Healthcheck**: Rutas `/` y `/health` para verificar estado
- ✅ **Pool de conexiones**: Configurado para mejor rendimiento
- ✅ **Manejo de errores**: Reintentos automáticos de conexión BD
- ✅ **SSL**: Configurado para producción

### 4. Endpoints Principales

Una vez desplegado, estos endpoints estarán disponibles:

```bash
# Healthcheck
GET /              # Estado general del servidor
GET /health        # Estado detallado del servidor

# API Principal
GET /api/auth      # Autenticación
GET /api/usuarios  # Gestión de usuarios
GET /api/suministros # Gestión de suministros
GET /api/proyectos # Gestión de proyectos
# ... otros endpoints
```

### 5. Monitoreo y Logs

```bash
# Ver logs en tiempo real
railway logs

# Ver estado del deployment
railway status

# Ver variables configuradas
railway variables
```

### 6. Configuración de Dominio (Opcional)

```bash
# Generar dominio de Railway
railway domain

# O configurar dominio custom
railway domain add tudominio.com
```

## Solución de Problemas

### Error de Conexión BD
Si hay problemas de conexión:
1. Verifica que las variables de entorno estén configuradas
2. La aplicación tiene reintentos automáticos
3. En producción continúa funcionando aunque la BD esté temporalmente desconectada

### Logs de Debugging
Para activar logs detallados, cambia en Railway:
```bash
NODE_ENV=development
```

### Build Fallback
Si el build falla, el sistema usa los archivos ya transpilados.

## Comandos Útiles

```bash
# Redeploy manual
railway up

# Ver variables
railway variables

# Conectar a la BD
railway connect

# Abrir dashboard
railway open
```

## Estructura del Proyecto

```
backend/api/src/
├── app.js              # Configuración Express
├── server.js           # Punto de entrada principal
├── package.json        # Dependencias y scripts
├── railway.json        # Configuración Railway
├── Procfile           # Comando de inicio
├── .gitignore         # Archivos a ignorar
├── config/
│   └── db.js          # Configuración BD mejorada
├── controllers/       # Lógica de negocio
├── models/           # Modelos Sequelize
├── routes/           # Definición de rutas
├── middlewares/      # Middlewares custom
└── seeders/          # Datos iniciales
```

## Notas Importantes

- ⚠️ La aplicación funciona tanto con DATABASE_URL como con variables individuales
- ⚠️ El SSL está configurado automáticamente para producción
- ⚠️ Los logs SQL están desactivados en producción para mejor rendimiento
- ⚠️ El pool de conexiones está optimizado para Railway
