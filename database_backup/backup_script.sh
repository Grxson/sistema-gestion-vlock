#!/bin/bash

# Script para hacer respaldo de la base de datos local
# Excluyendo vistas problemáticas

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_USER="root"
DB_PASS="grxson_18"
DB_NAME="sistema_gestion"
BACKUP_DIR="/home/grxson/Documentos/Github/sistema-gestion-vlock/database_backup"

echo "Iniciando respaldo de la base de datos local..."

# Lista de tablas (sin vistas)
TABLES="acciones_permisos adjuntos adjuntos_relaciones auditoria categorias_gastos categorias_herramienta categorias_suministro contratos empleados estados_cuenta gastos herramientas ingresos integraciones_logs movimientos_herramienta nomina_empleados nomina_historials oficios pagos_nominas permisos_rols presupuestos proveedores proyectos reportes_generados roles semanas_nominas suministros unidades_medida usuarios"

# Respaldo de estructura completa (solo tablas)
echo "Creando respaldo de estructura..."
mysqldump -u $DB_USER -p$DB_PASS --no-data --routines --triggers $DB_NAME $TABLES > $BACKUP_DIR/estructura_${TIMESTAMP}.sql

# Respaldo de datos completos (solo tablas)
echo "Creando respaldo de datos..."
mysqldump -u $DB_USER -p$DB_PASS --single-transaction $DB_NAME $TABLES > $BACKUP_DIR/datos_${TIMESTAMP}.sql

# Respaldo combinado
echo "Creando respaldo completo..."
mysqldump -u $DB_USER -p$DB_PASS --single-transaction --routines --triggers $DB_NAME $TABLES > $BACKUP_DIR/completo_${TIMESTAMP}.sql

echo "Respaldos creados exitosamente:"
echo "- Estructura: estructura_${TIMESTAMP}.sql"
echo "- Datos: datos_${TIMESTAMP}.sql"
echo "- Completo: completo_${TIMESTAMP}.sql"
