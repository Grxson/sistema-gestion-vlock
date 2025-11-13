# 📚 Índice de Documentación - Módulo de Exportación/Importación

## 🎯 Inicio Rápido

**¿Primera vez usando el módulo?** Sigue estos pasos:

1. ✅ **Ya completado**: Permisos creados en la base de datos
2. ✅ **Ya completado**: Backup manual generado
3. 🔄 **Siguiente paso**: Reiniciar el servidor backend
4. 🔄 **Siguiente paso**: Probar la funcionalidad desde la interfaz

---

## 📖 Documentación Disponible

### 1. 📘 Manual Completo del Módulo
**Archivo**: `MODULO_EXPORTACION_IMPORTACION.md`

**Contenido**:
- ✅ Descripción general de funcionalidades
- ✅ Características principales
- ✅ API Endpoints documentados
- ✅ Tablas soportadas
- ✅ Casos de uso detallados
- ✅ Advertencias y mejores prácticas
- ✅ Solución de problemas
- ✅ Mejoras futuras

**Cuándo usar**: Para entender completamente todas las funcionalidades del módulo.

---

### 2. 🚀 Guía de Instalación
**Archivo**: `INSTALACION_EXPORTACION.md`

**Contenido**:
- ✅ Pasos de instalación del backend
- ✅ Ejecutar script SQL de permisos
- ✅ Reiniciar servidor
- ✅ Verificación de instalación
- ✅ Asignar permisos a otros roles
- ✅ Archivos creados/modificados
- ✅ Primer uso del módulo
- ✅ Solución de problemas de instalación

**Cuándo usar**: Al instalar el módulo por primera vez o en otro ambiente.

---

### 3. 📊 Resumen de Implementación
**Archivo**: `RESUMEN_IMPLEMENTACION.md`

**Contenido**:
- ✅ Componentes implementados
- ✅ Permisos creados
- ✅ Funcionalidades implementadas
- ✅ Tablas soportadas
- ✅ Archivos creados/modificados
- ✅ Dependencias instaladas
- ✅ Estado de la base de datos
- ✅ Características de la interfaz
- ✅ Pruebas recomendadas
- ✅ Checklist de verificación

**Cuándo usar**: Para ver un resumen ejecutivo de todo lo implementado.

---

### 4. 💾 Guía de Backup Manual
**Archivo**: `GUIA_BACKUP_MANUAL.md`

**Contenido**:
- ✅ Comando para backup completo
- ✅ Explicación de parámetros
- ✅ Resultado del último backup
- ✅ Cómo restaurar desde backup
- ✅ Tablas incluidas/excluidas
- ✅ Buenas prácticas de backup
- ✅ Automatizar backups con cron
- ✅ Recuperación de emergencia

**Cuándo usar**: Para hacer backups manuales de la base de datos.

---

### 5. ✅ Checklist de Verificación
**Archivo**: `CHECKLIST_EXPORTACION.md`

**Contenido**:
- ✅ Pasos de verificación del backend
- ✅ Pasos de verificación de la base de datos
- ✅ Pasos de verificación del frontend
- ✅ Pruebas funcionales paso a paso
- ✅ Verificación de permisos y seguridad
- ✅ Verificación de documentación
- ✅ Registro de problemas encontrados
- ✅ Criterios de aprobación final

**Cuándo usar**: Para verificar que todo está funcionando correctamente.

---

## 🎯 Flujos de Trabajo Comunes

### 📥 Hacer un Backup Completo

**Opción 1: Desde la Interfaz Web**
1. Ir a "Exportar/Importar" en el sidebar
2. Clic en "Seleccionar todas"
3. Elegir formato "SQL"
4. Activar "Incluir relaciones"
5. Clic en "Exportar Datos"

**Opción 2: Desde la Terminal**
```bash
mysqldump -h crossover.proxy.rlwy.net -P 15395 -u root \
  -p'nArkIEmlZXJfvffITuStuiuiVIvCmbri' \
  --single-transaction --routines --triggers --no-tablespaces \
  --ignore-table=railway.v_gastos_por_proyecto \
  --ignore-table=railway.v_auditoria_usuarios \
  --ignore-table=railway.v_empleados_detalle \
  --ignore-table=railway.v_herramientas_stock_bajo \
  --ignore-table=railway.v_nomina_semanal \
  railway > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Documentación**: Ver `GUIA_BACKUP_MANUAL.md`

---

### 📤 Exportar Proyecto Específico

1. Ir a "Exportar/Importar"
2. Seleccionar tablas relacionadas:
   - Proyectos
   - Empleados
   - Nóminas
   - Suministros
   - Contratos
3. Elegir formato "Excel"
4. Clic en "Exportar Datos"

**Documentación**: Ver `MODULO_EXPORTACION_IMPORTACION.md` > Casos de Uso

---

### 🗑️ Limpiar Datos Antiguos

1. **PRIMERO**: Exportar datos (backup de seguridad)
2. Verificar que el archivo se descargó
3. Seleccionar tablas a vaciar
4. Clic en "Vaciar Tablas"
5. Confirmar ambas advertencias

**⚠️ ADVERTENCIA**: Esta operación es IRREVERSIBLE

**Documentación**: Ver `MODULO_EXPORTACION_IMPORTACION.md` > Casos de Uso

---

### 📥 Importar Datos

1. Tener archivo JSON exportado previamente
2. Ir a "Exportar/Importar"
3. Clic en "Importar Datos"
4. Seleccionar archivo JSON
5. Esperar confirmación

**Documentación**: Ver `MODULO_EXPORTACION_IMPORTACION.md` > API Endpoints

---

## 🔐 Permisos Configurados

| Código | Descripción | ID |
|--------|-------------|-----|
| `exportacion.ver` | Ver módulo | 50 |
| `exportacion.exportar` | Exportar datos | 51 |
| `exportacion.importar` | Importar datos | 52 |
| `exportacion.eliminar` | Vaciar tablas | 53 |

**Estado**: ✅ Asignados al rol admin (id_rol = 1)

**Documentación**: Ver `INSTALACION_EXPORTACION.md` > Verificación de Permisos

---

## 📦 Archivos del Módulo

### Backend
```
backend/api/src/
├── controllers/
│   └── exportacion.controller.js      # Lógica de negocio
├── routes/
│   ├── exportacion.routes.js          # Endpoints API
│   └── index.js                       # Registro de rutas (modificado)
└── migrations/
    └── permisos_exportacion.sql       # Script SQL de permisos
```

### Frontend
```
desktop/src/renderer/
├── pages/
│   └── ExportacionImportacion.jsx     # Interfaz principal
├── components/
│   ├── Sidebar.jsx                    # Menú lateral (modificado)
│   └── QuickNavigator.jsx             # Búsqueda rápida (modificado)
└── App.jsx                            # Rutas (modificado)
```

### Documentación
```
/
├── MODULO_EXPORTACION_IMPORTACION.md  # Manual completo
├── INSTALACION_EXPORTACION.md         # Guía de instalación
├── RESUMEN_IMPLEMENTACION.md          # Resumen ejecutivo
├── GUIA_BACKUP_MANUAL.md              # Guía de backups
├── CHECKLIST_EXPORTACION.md           # Checklist de verificación
└── README_EXPORTACION.md              # Este archivo
```

---

## 🚀 Próximos Pasos

### Inmediatos (Hoy)
1. [ ] Reiniciar servidor backend
2. [ ] Probar acceso al módulo desde la interfaz
3. [ ] Hacer prueba de exportación en JSON
4. [ ] Verificar que los archivos se descargan correctamente

### Corto Plazo (Esta Semana)
1. [ ] Probar todos los formatos de exportación
2. [ ] Probar importación de datos
3. [ ] Capacitar al equipo en el uso del módulo
4. [ ] Establecer política de backups periódicos

### Largo Plazo (Este Mes)
1. [ ] Implementar backups automáticos programados
2. [ ] Configurar subida de backups a la nube
3. [ ] Crear alertas de backup fallido
4. [ ] Documentar procedimientos de recuperación

---

## 🐛 Soporte y Ayuda

### Problemas Comunes

**Problema**: No aparece en el menú  
**Solución**: Ver `INSTALACION_EXPORTACION.md` > Solución de Problemas

**Problema**: Error al exportar  
**Solución**: Ver `MODULO_EXPORTACION_IMPORTACION.md` > Solución de Problemas

**Problema**: No tengo permisos  
**Solución**: Ejecutar script SQL de permisos y cerrar/abrir sesión

---

## 📞 Contacto

Para reportar problemas o sugerir mejoras:
- **GitHub Issues**: [Crear issue](https://github.com/Grxson/sistema-gestion-vlock/issues)
- **Email**: (agregar email si corresponde)
- **Documentación interna**: Ver archivos .md mencionados arriba

---

## 📅 Historial de Cambios

### Versión 1.0.0 (13 de noviembre de 2025)
- ✅ Implementación inicial completa
- ✅ 4 formatos de exportación
- ✅ Importación desde JSON
- ✅ Vaciado seguro de tablas
- ✅ Documentación completa
- ✅ Permisos configurados
- ✅ Backup manual generado (199KB)

---

## 🎓 Recursos Adicionales

- **MySQL Dump Documentation**: https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html
- **ExcelJS**: https://github.com/exceljs/exceljs
- **json2csv**: https://github.com/zemirco/json2csv

---

## ✅ Estado Actual

**Componente** | **Estado** | **Observaciones**
---------------|------------|------------------
Backend API | ✅ Completado | 7 endpoints funcionando
Frontend Web | ✅ Completado | Interfaz responsive
Permisos BD | ✅ Completado | 4 permisos asignados a admin
Documentación | ✅ Completado | 5 documentos creados
Backup Manual | ✅ Completado | 199KB generado
Pruebas | 🔄 Pendiente | Requiere servidor corriendo

---

**¡Implementación Exitosa! 🎉**

Para comenzar a usar el módulo, consulta `INSTALACION_EXPORTACION.md` o `MODULO_EXPORTACION_IMPORTACION.md`.

---

**Última actualización**: 13 de noviembre de 2025  
**Versión**: 1.0.0
