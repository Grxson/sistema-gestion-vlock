# 💾 Guía de Backup Manual - Base de Datos

## 📋 Información de Conexión

```
Host: crossover.proxy.rlwy.net
Puerto: 15395
Usuario: root
Base de datos: railway
```

## 🔧 Comando para Backup Completo

### Backup con todos los datos (recomendado)

```bash
mysqldump -h crossover.proxy.rlwy.net -P 15395 -u root \
  -p'nArkIEmlZXJfvffITuStuiuiVIvCmbri' \
  --single-transaction \
  --routines \
  --triggers \
  --no-tablespaces \
  --ignore-table=railway.v_gastos_por_proyecto \
  --ignore-table=railway.v_auditoria_usuarios \
  --ignore-table=railway.v_empleados_detalle \
  --ignore-table=railway.v_herramientas_stock_bajo \
  --ignore-table=railway.v_nomina_semanal \
  railway > backup_completo_$(date +%Y%m%d_%H%M%S).sql
```

### Explicación de los parámetros:

- `--single-transaction`: Backup consistente sin bloquear tablas
- `--routines`: Incluye procedimientos almacenados y funciones
- `--triggers`: Incluye triggers
- `--no-tablespaces`: Evita problemas con tablespaces
- `--ignore-table`: Excluye vistas con problemas de permisos

## 📦 Resultado del Backup

✅ **Último backup realizado**: 13 de noviembre de 2025, 10:31:59  
✅ **Tamaño del archivo**: 199 KB  
✅ **Ubicación**: `/home/grxson/Documentos/Github/sistema-gestion-vlock/backup_completo_20251113_103159.sql`

## 🔄 Restaurar desde Backup

### Restaurar toda la base de datos

```bash
mysql -h crossover.proxy.rlwy.net -P 15395 -u root \
  -p'nArkIEmlZXJfvffITuStuiuiVIvCmbri' \
  railway < backup_completo_20251113_103159.sql
```

### Restaurar solo una tabla específica

```bash
# Extraer solo la tabla empleados del backup
sed -n '/Table structure for table `empleados`/,/Table structure for table/p' \
  backup_completo_20251113_103159.sql > empleados_backup.sql

# Restaurar solo esa tabla
mysql -h crossover.proxy.rlwy.net -P 15395 -u root \
  -p'nArkIEmlZXJfvffITuStuiuiVIvCmbri' \
  railway < empleados_backup.sql
```

## 📊 Tablas Incluidas en el Backup

El backup incluye todas las tablas principales:

- ✅ empleados
- ✅ proyectos  
- ✅ nomina_empleados
- ✅ nomina_historial
- ✅ contratos
- ✅ oficios
- ✅ suministros
- ✅ proveedores
- ✅ herramientas
- ✅ adeudos_generales
- ✅ ingresos
- ✅ usuarios
- ✅ roles
- ✅ permisos_rols
- ✅ acciones_permisos
- ✅ presupuestos
- ✅ conceptos_obra
- ✅ auditoria
- ✅ Y más...

**Nota**: Las vistas (v_*) están excluidas porque tienen problemas de permisos, pero se pueden recrear después.

## 🔐 Buenas Prácticas de Backup

### 1. Frecuencia Recomendada
- **Diario**: Para ambientes de producción activos
- **Semanal**: Para ambientes de desarrollo
- **Antes de cambios importantes**: Migraciones, actualizaciones

### 2. Almacenamiento
- ✅ Guardar en múltiples ubicaciones
- ✅ Usar almacenamiento en la nube (Google Drive, Dropbox)
- ✅ Mantener al menos 3 copias recientes
- ✅ Eliminar backups antiguos (> 30 días)

### 3. Verificación
```bash
# Verificar que el backup no está vacío
ls -lh backup_completo_*.sql

# Verificar que contiene datos
grep -c "INSERT INTO" backup_completo_*.sql
```

## 🤖 Automatizar Backups (Opcional)

### Crear script de backup automático

```bash
#!/bin/bash
# Archivo: backup_diario.sh

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/grxson/Documentos/Backups"
ARCHIVO="backup_railway_${FECHA}.sql"

mkdir -p $BACKUP_DIR

mysqldump -h crossover.proxy.rlwy.net -P 15395 -u root \
  -p'nArkIEmlZXJfvffITuStuiuiVIvCmbri' \
  --single-transaction \
  --routines \
  --triggers \
  --no-tablespaces \
  --ignore-table=railway.v_gastos_por_proyecto \
  --ignore-table=railway.v_auditoria_usuarios \
  --ignore-table=railway.v_empleados_detalle \
  --ignore-table=railway.v_herramientas_stock_bajo \
  --ignore-table=railway.v_nomina_semanal \
  railway > "$BACKUP_DIR/$ARCHIVO"

# Comprimir el backup
gzip "$BACKUP_DIR/$ARCHIVO"

# Eliminar backups más antiguos de 30 días
find $BACKUP_DIR -name "backup_railway_*.sql.gz" -mtime +30 -delete

echo "Backup completado: $ARCHIVO.gz"
```

### Programar con cron

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * /home/grxson/scripts/backup_diario.sh >> /var/log/backup.log 2>&1
```

## 🚨 En Caso de Emergencia

### Recuperar datos borrados accidentalmente

1. **No hacer nada más en la base de datos**
2. **Restaurar desde el backup más reciente**
3. **Verificar integridad de datos**
4. **Aplicar cambios incrementales si es necesario**

### Comando de restauración rápida

```bash
# Restaurar TODO desde el último backup
mysql -h crossover.proxy.rlwy.net -P 15395 -u root \
  -p'nArkIEmlZXJfvffITuStuiuiVIvCmbri' \
  railway < backup_completo_20251113_103159.sql
```

## 📝 Notas Importantes

⚠️ **Advertencias**:
- La contraseña está en texto plano en el comando (usar con cuidado)
- Las vistas se excluyen por problemas de permisos
- El backup puede tardar varios minutos en bases grandes
- Siempre probar la restauración en ambiente de pruebas primero

✅ **Recomendaciones**:
- Guardar backups en ubicación segura
- Encriptar backups con datos sensibles
- Documentar el proceso de restauración
- Probar restauraciones periódicamente

## 🔗 Recursos Adicionales

- **Módulo de Exportación Web**: Usa `/exportacion` en el sistema
- **Documentación completa**: `MODULO_EXPORTACION_IMPORTACION.md`
- **MySQL Docs**: https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html

---

**Última actualización**: 13 de noviembre de 2025  
**Versión**: 1.0
