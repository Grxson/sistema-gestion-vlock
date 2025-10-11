# 🚀 INSTRUCCIONES DE DEPLOY - VLOCK SISTEMA DE GESTIÓN

## 📋 Resumen de Tareas Completadas

### ✅ Frontend Optimizado
- ❌ Console.logs principales eliminados
- ✅ Análisis por Tipo de Gasto rediseñado
- ✅ Exportación PDF profesional implementada
- ✅ Funciones de exportación mejoradas

### ✅ Archivos Preparados
- 📄 `railway-migration.sql` - Migración segura para Railway
- 🔧 `build-and-deploy.sh` - Script automatizado de build
- 📖 Este archivo de instrucciones

---

## 🗄️ PASO 1: MIGRACIÓN DE BASE DE DATOS

### Objetivo
Sincronizar la estructura de la BD de Railway con los cambios locales **SIN PERDER DATOS EXISTENTES**.

### Cambios Principales
1. **Categorías de Suministro**: Agregar campo `tipo` (Proyecto/Administrativo)
2. **Nuevas Tablas**: Presupuestos, Herramientas, Conceptos de Obra
3. **Índices**: Optimización de consultas
4. **Migración de Datos**: Mapeo automático de datos existentes

### Instrucciones
```bash
# 1. Conectar a Railway MySQL
railway connect mysql

# 2. O usar cliente MySQL directo
mysql -h [RAILWAY_HOST] -u [RAILWAY_USER] -p[RAILWAY_PASSWORD] [RAILWAY_DATABASE]

# 3. Ejecutar migración
source railway-migration.sql;

# 4. Verificar resultado
SELECT 'MIGRACIÓN COMPLETADA' as status, NOW() as fecha;
```

### ⚠️ IMPORTANTE
- La migración usa `INSERT IGNORE` y `IF NOT EXISTS` para preservar datos
- Verifica que no se perdieron registros comparando conteos antes/después
- Haz backup de la BD antes de ejecutar (recomendado)

---

## 🚀 PASO 2: DEPLOY DEL BACKEND

### Preparación
```bash
cd backend/api/src

# Verificar dependencias
npm install

# Verificar variables de entorno
cat .env
```

### Variables de Entorno Requeridas
```env
# Base de datos Railway
DB_HOST=your-railway-host
DB_USER=your-railway-user  
DB_PASSWORD=your-railway-password
DB_NAME=your-railway-database
DB_PORT=3306

# Configuración de la app
PORT=3000
NODE_ENV=production
JWT_SECRET=your-jwt-secret
```

### Deploy a Railway
```bash
# Método 1: Railway CLI
railway up

# Método 2: Git (si está conectado)
git add .
git commit -m "feat: sync with local structure and optimizations"
git push origin main
```

### Verificación
1. Verificar que el servicio esté corriendo en Railway
2. Probar endpoints principales:
   - `GET /api/suministros`
   - `GET /api/config/categorias`
   - `GET /api/herramientas`

---

## 💻 PASO 3: BUILD Y EMPAQUETADO DE LA APLICACIÓN

### Ejecución Automática
```bash
# Ejecutar script automatizado
./build-and-deploy.sh
```

### Ejecución Manual
```bash
# 1. Build del frontend
cd desktop
npm install
npm run build

# 2. Empaquetar aplicación
npm run dist

# 3. Verificar archivos generados
ls -la dist/
```

### Distribuciones Generadas
- **Windows**: `.exe` (instalador) + `.exe.blockmap`
- **Linux**: `.AppImage` (portable) + `.deb` (Debian/Ubuntu)
- **macOS**: `.dmg` (si se ejecuta en Mac)

---

## 📊 PASO 4: VERIFICACIÓN FINAL

### Backend
- [ ] Servicio corriendo en Railway
- [ ] Base de datos migrada correctamente
- [ ] Endpoints respondiendo
- [ ] Nuevas funcionalidades disponibles

### Frontend/Desktop
- [ ] Aplicación empaquetada exitosamente
- [ ] Análisis por Tipo de Gasto funcionando
- [ ] Exportación PDF con formato profesional
- [ ] Sin console.logs en producción

### Funcionalidades Nuevas
- [ ] Gráfica de Análisis por Tipo de Gasto rediseñada
- [ ] Modal con desglose detallado
- [ ] Exportación PNG/PDF mejorada
- [ ] Cálculos consistentes con Total Gastado

---

## 🔧 TROUBLESHOOTING

### Error: "Column already exists"
- **Causa**: La migración ya se ejecutó parcialmente
- **Solución**: Normal, la migración está diseñada para ser idempotente

### Error: "Cannot connect to Railway"
- **Causa**: Credenciales incorrectas o servicio inactivo
- **Solución**: Verificar variables de entorno y estado del servicio

### Error en empaquetado
- **Causa**: Dependencias faltantes o error en build
- **Solución**: 
  ```bash
  cd desktop
  rm -rf node_modules dist
  npm install
  npm run build
  npm run dist
  ```

### Datos faltantes después de migración
- **Causa**: Error en mapeo de datos
- **Solución**: Ejecutar queries de verificación:
  ```sql
  SELECT COUNT(*) FROM suministros WHERE id_categoria_suministro IS NULL;
  SELECT COUNT(*) FROM categorias_suministro WHERE tipo IS NULL;
  ```

---

## 📈 MEJORAS IMPLEMENTADAS

### Análisis por Tipo de Gasto
- ✅ Layout de 2 columnas (gráfica + métricas)
- ✅ Cálculos consistentes con Total Gastado
- ✅ Diseño profesional y moderno
- ✅ Modal con desglose completo

### Exportación PDF
- ✅ Formato profesional con header
- ✅ Secciones estructuradas
- ✅ Metadatos del documento
- ✅ Soporte multi-página
- ✅ Captura completa sin recortes

### Optimizaciones
- ✅ Console.logs eliminados
- ✅ Código limpio y optimizado
- ✅ Migración segura de BD
- ✅ Script automatizado de deploy

---

## 📞 SOPORTE

Si encuentras algún problema:

1. **Revisa los logs** de Railway para errores del backend
2. **Verifica la migración** ejecutando queries de validación
3. **Comprueba las variables de entorno** en Railway
4. **Regenera la aplicación** si hay problemas de empaquetado

---

**Fecha**: 2025-10-07  
**Versión**: 1.0.0-beta.6  
**Estado**: ✅ Listo para deploy

