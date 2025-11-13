-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: crossover.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20250927000003-add-observaciones-to-herramientas.js'),('add_id_unidad_medida_to_suministros.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `acciones_permisos`
--

DROP TABLE IF EXISTS `acciones_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acciones_permisos` (
  `id_accion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `codigo` varchar(255) NOT NULL,
  `descripcion` text,
  `modulo` varchar(30) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL,
  PRIMARY KEY (`id_accion`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acciones_permisos`
--

LOCK TABLES `acciones_permisos` WRITE;
/*!40000 ALTER TABLE `acciones_permisos` DISABLE KEYS */;
INSERT INTO `acciones_permisos` VALUES (1,'Ver usuarios','usuarios.ver','Ver lista de usuarios','usuarios','2025-08-18 16:00:59','2025-08-18 16:00:59'),(2,'Crear usuario','usuarios.crear','Crear nuevos usuarios','usuarios','2025-08-18 16:00:59','2025-08-18 16:00:59'),(3,'Editar usuario','usuarios.editar','Modificar usuarios existentes','usuarios','2025-08-18 16:00:59','2025-08-18 16:00:59'),(4,'Eliminar usuario','usuarios.eliminar','Eliminar usuarios','usuarios','2025-08-18 16:00:59','2025-08-18 16:00:59'),(5,'Ver proyectos','proyectos.ver','Ver lista de proyectos','proyectos','2025-08-18 16:00:59','2025-08-18 16:00:59'),(6,'Crear proyecto','proyectos.crear','Crear nuevos proyectos','proyectos','2025-08-18 16:00:59','2025-08-18 16:00:59'),(7,'Editar proyecto','proyectos.editar','Modificar proyectos existentes','proyectos','2025-08-18 16:00:59','2025-08-18 16:00:59'),(8,'Eliminar proyecto','proyectos.eliminar','Eliminar proyectos','proyectos','2025-08-18 16:01:00','2025-08-18 16:01:00'),(9,'Ver empleados','empleados.ver','Ver lista de empleados','empleados','2025-08-18 16:01:00','2025-08-18 16:01:00'),(10,'Crear empleado','empleados.crear','Crear nuevos empleados','empleados','2025-08-18 16:01:00','2025-08-18 16:01:00'),(11,'Editar empleado','empleados.editar','Modificar empleados existentes','empleados','2025-08-18 16:01:00','2025-08-18 16:01:00'),(12,'Eliminar empleado','empleados.eliminar','Eliminar empleados','empleados','2025-08-18 16:01:00','2025-08-18 16:01:00'),(13,'Ver gastos','finanzas.gastos.ver','Ver registro de gastos','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(14,'Crear gasto','finanzas.gastos.crear','Registrar nuevos gastos','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(15,'Editar gasto','finanzas.gastos.editar','Modificar gastos existentes','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(16,'Eliminar gasto','finanzas.gastos.eliminar','Eliminar gastos','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(17,'Ver ingresos','finanzas.ingresos.ver','Ver registro de ingresos','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(18,'Crear ingreso','finanzas.ingresos.crear','Registrar nuevos ingresos','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(19,'Ver reportes','reportes.ver','Ver reportes','reportes','2025-08-18 16:01:00','2025-08-18 16:01:00'),(20,'Generar reportes','reportes.generar','Generar nuevos reportes','reportes','2025-08-18 16:01:00','2025-08-18 16:01:00'),(21,'Ver configuración','configuracion.ver','Ver configuración del sistema','configuracion','2025-08-18 16:01:00','2025-08-18 16:01:00'),(22,'Editar configuración','configuracion.editar','Modificar configuración del sistema','configuracion','2025-08-18 16:01:00','2025-08-18 16:01:00'),(23,'Ver contratos','contratos.ver','Ver lista de contratos','contratos','2025-08-19 19:23:46','2025-08-19 19:23:46'),(24,'Crear contrato','contratos.crear','Crear nuevos contratos','contratos','2025-08-19 19:23:46','2025-08-19 19:23:46'),(25,'Editar contrato','contratos.editar','Modificar contratos existentes','contratos','2025-08-19 19:23:46','2025-08-19 19:23:46'),(26,'Eliminar contrato','contratos.eliminar','Eliminar contratos','contratos','2025-08-19 19:23:46','2025-08-19 19:23:46'),(27,'Ver oficios','oficios.ver','Ver lista de oficios','oficios','2025-08-19 19:23:46','2025-08-19 19:23:46'),(28,'Crear oficio','oficios.crear','Crear nuevos oficios','oficios','2025-08-19 19:23:46','2025-08-19 19:23:46'),(29,'Editar oficio','oficios.editar','Modificar oficios existentes','oficios','2025-08-19 19:23:46','2025-08-19 19:23:46'),(30,'Eliminar oficio','oficios.eliminar','Eliminar oficios','oficios','2025-08-19 19:23:46','2025-08-19 19:23:46'),(31,'Ver nómina','nomina.ver','Ver nómina de empleados','nomina','2025-08-19 19:23:46','2025-08-19 19:23:46'),(32,'Crear nómina','nomina.crear','Crear nueva nómina','nomina','2025-08-19 19:23:46','2025-08-19 19:23:46'),(33,'Editar nómina','nomina.editar','Modificar nómina existente','nomina','2025-08-19 19:23:46','2025-08-19 19:23:46'),(34,'Procesar nómina','nomina.procesar','Procesar pagos de nómina','nomina','2025-08-19 19:23:46','2025-08-19 19:23:46'),(35,'Ver auditoría','auditoria.ver','Ver registros de auditoría','auditoria','2025-08-19 19:23:46','2025-08-19 19:23:46'),(36,'Exportar auditoría','auditoria.exportar','Exportar registros de auditoría','auditoria','2025-08-19 19:23:46','2025-08-19 19:23:46'),(37,'Ver roles','roles.ver','Ver roles y sus permisos','roles','2025-08-19 19:30:14','2025-08-19 19:30:14'),(38,'Crear rol','roles.crear','Crear nuevos roles','roles','2025-08-19 19:30:14','2025-08-19 19:30:14'),(39,'Editar rol','roles.editar','Modificar roles existentes','roles','2025-08-19 19:30:14','2025-08-19 19:30:14'),(40,'Eliminar rol','roles.eliminar','Eliminar roles','roles','2025-08-19 19:30:14','2025-08-19 19:30:14'),(41,'Eliminar nómina','nomina.eliminar','Eliminar registros de nómina','nomina','2025-08-20 17:22:48','2025-08-20 17:22:48'),(42,'Exportar reportes','reportes.exportar','Exportar reportes a diferentes formatos','reportes','2025-08-20 17:22:48','2025-08-20 17:22:48'),(43,'Asignar permisos','roles.permisos','Gestionar permisos de roles','roles','2025-08-20 17:22:48','2025-08-20 17:22:48'),(44,'Ver herramientas','herramientas.ver','Ver inventario de herramientas','herramientas','2025-10-07 19:15:23','2025-10-07 19:15:23'),(45,'Crear herramienta','herramientas.crear','Agregar nuevas herramientas al inventario','herramientas','2025-10-07 19:15:24','2025-10-07 19:15:24'),(46,'Editar herramienta','herramientas.editar','Modificar información de herramientas','herramientas','2025-10-07 19:15:24','2025-10-07 19:15:24'),(47,'Eliminar herramienta','herramientas.eliminar','Eliminar herramientas del inventario','herramientas','2025-10-07 19:15:25','2025-10-07 19:15:25'),(48,'Gestionar movimientos herramientas','herramientas.movimientos','Registrar entradas, salidas y bajas de herramientas','herramientas','2025-10-07 19:15:25','2025-10-07 19:15:25'),(49,'Ver reportes herramientas','herramientas.reportes','Generar reportes de inventario de herramientas','herramientas','2025-10-07 19:15:25','2025-10-07 19:15:25'),(50,'Ver Exportación','exportacion.ver','Acceder al módulo de exportación/importación de datos','exportacion','2025-11-13 16:28:58','2025-11-13 16:28:58'),(51,'Exportar Datos','exportacion.exportar','Exportar datos del sistema en diferentes formatos','exportacion','2025-11-13 16:28:58','2025-11-13 16:28:58'),(52,'Importar Datos','exportacion.importar','Importar datos al sistema desde archivos externos','exportacion','2025-11-13 16:28:58','2025-11-13 16:28:58'),(53,'Vaciar Tablas','exportacion.eliminar','Eliminar datos de tablas seleccionadas','exportacion','2025-11-13 16:28:58','2025-11-13 16:28:58');
/*!40000 ALTER TABLE `acciones_permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adeudos_empleados`
--

DROP TABLE IF EXISTS `adeudos_empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adeudos_empleados` (
  `id_adeudo` int NOT NULL AUTO_INCREMENT,
  `id_empleado` int NOT NULL,
  `id_nomina` int DEFAULT NULL,
  `monto_adeudo` decimal(10,2) NOT NULL,
  `monto_pagado` decimal(10,2) NOT NULL DEFAULT '0.00',
  `monto_pendiente` decimal(10,2) NOT NULL,
  `fecha_adeudo` datetime NOT NULL,
  `fecha_liquidacion` datetime DEFAULT NULL,
  `estado` enum('Pendiente','Parcial','Liquidado') NOT NULL DEFAULT 'Pendiente',
  `observaciones` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_adeudo`),
  KEY `idx_id_empleado` (`id_empleado`),
  KEY `idx_id_nomina` (`id_nomina`),
  KEY `idx_fecha_adeudo` (`fecha_adeudo`),
  KEY `idx_estado` (`estado`),
  KEY `id_nomina` (`id_nomina`),
  KEY `adeudos_empleados_id_empleado` (`id_empleado`),
  KEY `adeudos_empleados_estado` (`estado`),
  KEY `adeudos_empleados_fecha_adeudo` (`fecha_adeudo`),
  CONSTRAINT `adeudos_empleados_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `adeudos_empleados_ibfk_2` FOREIGN KEY (`id_nomina`) REFERENCES `nomina_empleados` (`id_nomina`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adeudos_empleados`
--

LOCK TABLES `adeudos_empleados` WRITE;
/*!40000 ALTER TABLE `adeudos_empleados` DISABLE KEYS */;
/*!40000 ALTER TABLE `adeudos_empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adeudos_generales`
--

DROP TABLE IF EXISTS `adeudos_generales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adeudos_generales` (
  `id_adeudo_general` int NOT NULL AUTO_INCREMENT,
  `nombre_entidad` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la persona o empresa',
  `tipo_adeudo` enum('nos_deben','debemos') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de adeudo: nos_deben o debemos',
  `monto` decimal(12,2) NOT NULL COMMENT 'Cantidad del adeudo',
  `estado` enum('pendiente','parcial','pagado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro del adeudo',
  `fecha_pago` datetime DEFAULT NULL COMMENT 'Fecha en que se liquidó el adeudo',
  `notas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Comentarios o notas adicionales',
  `id_usuario_registro` int DEFAULT NULL COMMENT 'Usuario que registró el adeudo',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `monto_original` decimal(12,2) DEFAULT NULL COMMENT 'Monto original del adeudo (se copia del monto al crear)',
  `monto_pagado` decimal(12,2) NOT NULL DEFAULT '0.00',
  `monto_pendiente` decimal(12,2) DEFAULT NULL COMMENT 'Monto que falta por pagar (calculado)',
  `fecha_vencimiento` datetime DEFAULT NULL COMMENT 'Fecha de vencimiento del adeudo para alertas',
  PRIMARY KEY (`id_adeudo_general`),
  KEY `fk_adeudos_generales_usuario` (`id_usuario_registro`),
  KEY `idx_tipo_adeudo` (`tipo_adeudo`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_registro` (`fecha_registro`),
  CONSTRAINT `fk_adeudos_generales_usuario` FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adeudos_generales`
--

LOCK TABLES `adeudos_generales` WRITE;
/*!40000 ALTER TABLE `adeudos_generales` DISABLE KEYS */;
INSERT INTO `adeudos_generales` VALUES (2,'POLIZA SEGURO NISSAN','debemos',5287.91,'pendiente','2025-10-24 19:25:20',NULL,'VENCIMIENTO 13/11',NULL,'2025-10-24 19:25:20','2025-10-27 20:58:11',NULL,0.00,NULL,'2025-11-13 00:00:00'),(3,'PELTOF JESUS TORRES','debemos',3025.00,'pendiente','2025-10-24 19:27:10',NULL,'MAQUINARIA',NULL,'2025-10-24 19:27:10','2025-10-24 19:27:10',NULL,0.00,NULL,NULL),(4,'IMPUESTO AGOSTO ISR','debemos',11430.00,'pagado','2025-10-24 19:27:59','2025-11-04 21:21:12','DECLARACION AGOSTO ISR\n[4/11/2025] Liquidación completa: $11430.00 - Liquidación completa desde interfaz',NULL,'2025-10-24 19:27:59','2025-11-06 17:24:18',11430.00,11430.00,0.00,'2025-11-07 00:00:00'),(5,'IMSS SEPTIEMBRE','debemos',7390.00,'pagado','2025-10-24 19:28:52','2025-10-24 19:30:11',NULL,NULL,'2025-10-24 19:28:52','2025-10-24 19:30:11',7390.00,7390.00,0.00,NULL),(6,'IMSS MAYO DIFERENCIA','debemos',794.00,'pagado','2025-10-24 19:29:17','2025-10-24 19:30:01','PENDIENTE',NULL,'2025-10-24 19:29:17','2025-10-24 19:30:01',794.00,794.00,0.00,NULL),(7,'IMPUESTO JULIO ISR','debemos',44823.00,'pagado','2025-10-24 19:29:43','2025-10-24 19:29:57',NULL,NULL,'2025-10-24 19:29:43','2025-10-24 19:29:57',44823.00,44823.00,0.00,NULL),(8,'CIMBRA REPOSICION','debemos',8381.50,'pagado','2025-10-24 19:34:33','2025-11-03 19:05:34','15 DUELAS Y 2 PUNTALES EXTRAVIADOS\n[3/11/2025] Liquidación completa: $8381.50 - Liquidación completa desde interfaz',NULL,'2025-10-24 19:34:33','2025-11-06 17:24:38',8381.50,8381.50,0.00,'2025-10-27 00:00:00'),(10,'PADILLAS','debemos',20000.00,'pagado','2025-10-27 20:59:40','2025-10-27 20:59:48','MAQUINARIA\n[27/10/2025] Liquidación completa: $20000.00 - Liquidación completa desde interfaz',NULL,'2025-10-27 20:59:40','2025-11-06 17:24:38',20000.00,20000.00,0.00,NULL);
/*!40000 ALTER TABLE `adeudos_generales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adjuntos`
--

DROP TABLE IF EXISTS `adjuntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adjuntos` (
  `id_adjunto` int NOT NULL AUTO_INCREMENT,
  `nombre_archivo` varchar(100) NOT NULL,
  `tipo_archivo` varchar(50) NOT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `tamano_bytes` int DEFAULT NULL,
  `fecha_subida` datetime NOT NULL,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_adjunto`),
  KEY `idx_adjuntos_tipo` (`tipo_archivo`),
  KEY `idx_adjuntos_usuario` (`id_usuario`),
  CONSTRAINT `adjuntos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adjuntos`
--

LOCK TABLES `adjuntos` WRITE;
/*!40000 ALTER TABLE `adjuntos` DISABLE KEYS */;
/*!40000 ALTER TABLE `adjuntos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adjuntos_relaciones`
--

DROP TABLE IF EXISTS `adjuntos_relaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adjuntos_relaciones` (
  `id_relacion` int NOT NULL AUTO_INCREMENT,
  `id_adjunto` int NOT NULL,
  `tabla_relacionada` varchar(50) NOT NULL,
  `id_registro` int NOT NULL,
  PRIMARY KEY (`id_relacion`),
  KEY `id_adjunto` (`id_adjunto`),
  KEY `idx_adjuntos_rel_tabla` (`tabla_relacionada`,`id_registro`),
  CONSTRAINT `adjuntos_relaciones_ibfk_1` FOREIGN KEY (`id_adjunto`) REFERENCES `adjuntos` (`id_adjunto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adjuntos_relaciones`
--

LOCK TABLES `adjuntos_relaciones` WRITE;
/*!40000 ALTER TABLE `adjuntos_relaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `adjuntos_relaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analisis_costos`
--

DROP TABLE IF EXISTS `analisis_costos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analisis_costos` (
  `id_analisis` int NOT NULL AUTO_INCREMENT,
  `id_concepto` int NOT NULL,
  `tipo_elemento` enum('Material','Mano_de_Obra','Maquinaria') NOT NULL,
  `descripcion_elemento` text NOT NULL,
  `unidad` varchar(20) NOT NULL,
  `cantidad` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `precio_unitario` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `importe` decimal(12,4) GENERATED ALWAYS AS ((`cantidad` * `precio_unitario`)) STORED,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nombre_analisis` varchar(200) NOT NULL,
  `descripcion` text,
  `tipo_analisis` enum('costo_directo','precio_unitario','rendimiento','comparativo','tendencia') NOT NULL,
  `unidad_base` varchar(20) NOT NULL,
  `rendimiento_base` decimal(8,4) NOT NULL DEFAULT '1.0000',
  `costo_materiales_total` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `porcentaje_materiales` decimal(5,2) NOT NULL DEFAULT '0.00',
  `costo_mano_obra_total` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `horas_hombre_total` decimal(8,4) DEFAULT NULL,
  `costo_promedio_hora` decimal(10,4) DEFAULT NULL,
  `porcentaje_mano_obra` decimal(5,2) NOT NULL DEFAULT '0.00',
  `costo_equipo_total` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `horas_equipo_total` decimal(8,4) DEFAULT NULL,
  `porcentaje_equipo` decimal(5,2) NOT NULL DEFAULT '0.00',
  `costo_subcontratos_total` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `porcentaje_subcontratos` decimal(5,2) NOT NULL DEFAULT '0.00',
  `costo_directo_total` decimal(15,4) NOT NULL,
  `costos_indirectos_porcentaje` decimal(5,2) NOT NULL DEFAULT '0.00',
  `costos_indirectos_importe` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `utilidad_porcentaje` decimal(5,2) NOT NULL DEFAULT '0.00',
  `utilidad_importe` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `financiamiento_porcentaje` decimal(5,2) NOT NULL DEFAULT '0.00',
  `financiamiento_importe` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `precio_unitario_sin_iva` decimal(15,4) NOT NULL,
  `iva_porcentaje` decimal(5,2) NOT NULL DEFAULT '16.00',
  `precio_unitario_con_iva` decimal(15,4) NOT NULL,
  `fecha_analisis` date NOT NULL,
  `vigencia_desde` date NOT NULL,
  `vigencia_hasta` date DEFAULT NULL,
  `region_aplicacion` varchar(100) DEFAULT NULL,
  `moneda` varchar(3) NOT NULL DEFAULT 'MXN',
  `estado` enum('borrador','en_revision','aprobado','obsoleto') NOT NULL DEFAULT 'borrador',
  `elaborado_por` int NOT NULL,
  `revisado_por` int DEFAULT NULL,
  `aprobado_por` int DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `observaciones` text,
  `fuentes_informacion` json DEFAULT NULL,
  `supuestos` json DEFAULT NULL,
  `variables_entorno` json DEFAULT NULL,
  `metadatos` json DEFAULT NULL,
  `version` varchar(10) NOT NULL DEFAULT '1.0',
  `analisis_padre_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_analisis`),
  KEY `idx_analisis_concepto` (`id_concepto`),
  KEY `idx_analisis_tipo` (`tipo_elemento`),
  KEY `idx_analisis_activo` (`activo`),
  KEY `analisis_padre_id` (`analisis_padre_id`),
  KEY `analisis_costos_id_concepto` (`id_concepto`),
  KEY `analisis_costos_tipo_analisis` (`tipo_analisis`),
  KEY `analisis_costos_estado` (`estado`),
  KEY `analisis_costos_fecha_analisis` (`fecha_analisis`),
  KEY `analisis_costos_vigencia_desde` (`vigencia_desde`),
  KEY `analisis_costos_region_aplicacion` (`region_aplicacion`),
  KEY `analisis_costos_elaborado_por` (`elaborado_por`),
  CONSTRAINT `analisis_costos_ibfk_1` FOREIGN KEY (`id_concepto`) REFERENCES `conceptos_obra` (`id_concepto`) ON DELETE CASCADE,
  CONSTRAINT `analisis_costos_ibfk_2` FOREIGN KEY (`analisis_padre_id`) REFERENCES `analisis_costos` (`id_analisis`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analisis_costos`
--

LOCK TABLES `analisis_costos` WRITE;
/*!40000 ALTER TABLE `analisis_costos` DISABLE KEYS */;
/*!40000 ALTER TABLE `analisis_costos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `accion` enum('LOGIN','LOGOUT','CREATE','READ','UPDATE','DELETE') NOT NULL,
  `tabla` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_hora` datetime NOT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `datos_antiguos` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_auditoria_usuario` (`id_usuario`),
  KEY `idx_auditoria_accion` (`accion`),
  KEY `idx_auditoria_fecha` (`fecha_hora`),
  KEY `idx_auditoria_tabla` (`tabla`),
  KEY `idx_auditoria_fecha_tabla` (`fecha_hora`,`tabla`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
INSERT INTO `auditoria` VALUES (1,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-18 16:27:54','::1',NULL,NULL),(2,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 1 de \'Pendiente\' a \'Pendiente\'','2025-08-18 18:01:01',NULL,'\"{\\\"estado\\\":\\\"Pendiente\\\"}\"','\"{\\\"estado\\\":\\\"Pendiente\\\"}\"'),(3,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 1 de \'Pendiente\' a \'En_Proceso\'','2025-08-18 18:02:47',NULL,'\"{\\\"estado\\\":\\\"Pendiente\\\"}\"','\"{\\\"estado\\\":\\\"En_Proceso\\\"}\"'),(4,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 1 de \'En_Proceso\' a \'Aprobada\'','2025-08-18 18:03:01',NULL,'\"{\\\"estado\\\":\\\"En_Proceso\\\"}\"','\"{\\\"estado\\\":\\\"Aprobada\\\"}\"'),(5,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 1 de \'Aprobada\' a \'Pagado\'','2025-08-18 18:03:12',NULL,'\"{\\\"estado\\\":\\\"Aprobada\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(6,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 2 de \'Pendiente\' a \'Cancelada\'','2025-08-18 18:03:52',NULL,'\"{\\\"estado\\\":\\\"Pendiente\\\"}\"','\"{\\\"estado\\\":\\\"Cancelada\\\"}\"'),(7,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 16:15:23','::1',NULL,NULL),(8,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 16:21:43','::1',NULL,NULL),(9,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 17:40:45','::1',NULL,NULL),(11,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 18:51:31','::1',NULL,NULL),(12,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 19:09:34','::1',NULL,NULL),(14,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 19:19:32','::1',NULL,NULL),(16,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 19:36:55','::1',NULL,NULL),(17,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 19:50:28','::1',NULL,NULL),(20,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-20 16:50:32','::1',NULL,NULL),(21,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-20 17:02:11','::1',NULL,NULL),(23,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-20 18:00:50','::1',NULL,NULL),(25,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-27 20:19:52','127.0.0.1',NULL,NULL),(26,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-28 18:16:52','127.0.0.1',NULL,NULL),(27,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-09-04 17:48:23','127.0.0.1',NULL,NULL),(28,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-09-12 23:54:23','100.64.0.7',NULL,NULL),(29,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-09-15 18:57:24','100.64.0.5',NULL,NULL),(30,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-09-20 18:47:35','100.64.0.6',NULL,NULL),(31,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-09-25 05:38:43','100.64.0.7',NULL,NULL),(32,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 59 de \'Borrador\' a \'Pagado\'','2025-10-22 01:23:36',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(33,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 59 de \'Pagado\' a \'Pagado\'','2025-10-22 01:24:22',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(34,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 55 de \'Borrador\' a \'Pagado\'','2025-10-22 01:25:12',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(35,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-10-24 22:15:02','127.0.0.1',NULL,NULL),(36,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 12 de \'Borrador\' a \'Pagado\'','2025-11-01 17:46:50',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(37,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 14 de \'Borrador\' a \'Aprobada\'','2025-11-01 17:47:03',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Aprobada\\\"}\"'),(38,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 14 de \'Aprobada\' a \'Pagado\'','2025-11-01 17:47:05',NULL,'\"{\\\"estado\\\":\\\"Aprobada\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(39,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 15 de \'Borrador\' a \'Pagado\'','2025-11-01 17:47:13',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(40,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 12 de \'Pagado\' a \'Pendiente\'','2025-11-01 18:09:22',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Pendiente\\\"}\"'),(41,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 12 de \'Pendiente\' a \'Borrador\'','2025-11-01 18:09:26',NULL,'\"{\\\"estado\\\":\\\"Pendiente\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(42,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 15 de \'Pagado\' a \'Borrador\'','2025-11-01 18:09:54',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(43,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 14 de \'Pagado\' a \'Pendiente\'','2025-11-01 18:10:02',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Pendiente\\\"}\"'),(44,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 15 de \'Borrador\' a \'Pagado\'','2025-11-01 18:10:13',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(45,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 15 de \'Pagado\' a \'Borrador\'','2025-11-01 18:13:57',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(46,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 15 de \'Borrador\' a \'Pagado\'','2025-11-01 18:16:51',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(47,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 15 de \'Pagado\' a \'Borrador\'','2025-11-01 18:17:10',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(48,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 15 de \'Borrador\' a \'Pagado\'','2025-11-01 18:18:00',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(49,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 12 de \'Borrador\' a \'Pagado\'','2025-11-01 18:34:57',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(50,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 14 de \'Pendiente\' a \'Pagado\'','2025-11-01 18:35:05',NULL,'\"{\\\"estado\\\":\\\"Pendiente\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(51,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 1 de \'Borrador\' a \'Pagado\'','2025-11-01 18:44:07',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(52,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 2 de \'Borrador\' a \'Pagado\'','2025-11-01 18:44:14',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(53,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 3 de \'Borrador\' a \'Pagado\'','2025-11-01 18:44:25',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(54,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 4 de \'Borrador\' a \'Pagado\'','2025-11-01 18:44:38',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(55,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 5 de \'Borrador\' a \'Pagado\'','2025-11-01 18:44:44',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(56,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 6 de \'Borrador\' a \'Pagado\'','2025-11-01 18:44:50',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(57,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 13 de \'Borrador\' a \'Pagado\'','2025-11-01 18:45:42',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(58,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 17 de \'Borrador\' a \'Pagado\'','2025-11-01 19:37:36',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(59,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 16 de \'Borrador\' a \'Pagado\'','2025-11-01 19:37:36',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(60,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 18 de \'Borrador\' a \'Pagado\'','2025-11-01 19:37:37',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(61,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 19 de \'Borrador\' a \'Pagado\'','2025-11-01 19:38:01',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(62,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 13 de \'Pagado\' a \'Borrador\'','2025-11-03 20:18:51',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(63,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 20 de \'Borrador\' a \'Pagado\'','2025-11-07 17:07:38',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(64,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 20 de \'Pagado\' a \'Borrador\'','2025-11-07 17:09:33',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(65,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 19 de \'Pagado\' a \'Borrador\'','2025-11-08 05:19:44',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(66,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 19 de \'Borrador\' a \'Pagado\'','2025-11-08 05:19:48',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(67,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-11-08 15:45:33','100.64.0.5',NULL,NULL),(68,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 26 de \'Borrador\' a \'Pagado\'','2025-11-08 16:25:49',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(69,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 26 de \'Pagado\' a \'Borrador\'','2025-11-08 16:26:01',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(70,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 26 de \'Borrador\' a \'Pagado\'','2025-11-08 18:38:35',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(71,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 29 de \'Borrador\' a \'Pagado\'','2025-11-08 18:38:40',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(72,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 27 de \'Borrador\' a \'Pagado\'','2025-11-08 18:38:49',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(73,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 30 de \'Borrador\' a \'Pagado\'','2025-11-08 18:53:44',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(74,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 29 de \'Pagado\' a \'Borrador\'','2025-11-08 19:36:04',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(75,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 29 de \'Borrador\' a \'Pagado\'','2025-11-08 19:36:12',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(76,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-11-10 18:03:38','127.0.0.1',NULL,NULL),(77,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 31 de \'Borrador\' a \'Pagado\'','2025-11-11 20:47:22',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(78,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 31 de \'Pagado\' a \'Borrador\'','2025-11-11 20:56:31',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(79,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 31 de \'Borrador\' a \'Cancelada\'','2025-11-11 20:58:36',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Cancelada\\\"}\"'),(80,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 31 de \'Cancelada\' a \'Pagado\'','2025-11-11 20:58:39',NULL,'\"{\\\"estado\\\":\\\"Cancelada\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(81,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 31 de \'Pagado\' a \'Borrador\'','2025-11-11 21:00:33',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(82,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 32 de \'Borrador\' a \'Pagado\'','2025-11-11 21:00:51',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(83,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 32 de \'Pagado\' a \'Borrador\'','2025-11-11 21:01:17',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"'),(84,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 33 de \'Borrador\' a \'Pagado\'','2025-11-11 21:10:33',NULL,'\"{\\\"estado\\\":\\\"Borrador\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(85,4,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 33 de \'Pagado\' a \'Borrador\'','2025-11-11 21:11:00',NULL,'\"{\\\"estado\\\":\\\"Pagado\\\"}\"','\"{\\\"estado\\\":\\\"Borrador\\\"}\"');
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogos_precios`
--

DROP TABLE IF EXISTS `catalogos_precios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogos_precios` (
  `id_catalogo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `tipo` enum('Material','Mano_de_Obra','Maquinaria','Mixto') NOT NULL DEFAULT 'Material',
  `fecha_vigencia_inicio` date NOT NULL,
  `fecha_vigencia_fin` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `version` varchar(10) NOT NULL DEFAULT '1.0',
  `observaciones` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nombre_catalogo` varchar(200) NOT NULL,
  `tipo_catalogo` enum('general','regional','especializado','temporal','cliente_especifico') NOT NULL DEFAULT 'general',
  `region` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `moneda` varchar(3) NOT NULL DEFAULT 'MXN',
  `fecha_inicio_vigencia` date NOT NULL,
  `fecha_fin_vigencia` date DEFAULT NULL,
  `factor_actualizacion` decimal(8,4) NOT NULL DEFAULT '1.0000',
  `base_calculo` enum('costos_directos','precios_mercado','licitacion','historicos','mixto') NOT NULL DEFAULT 'precios_mercado',
  `incluye_indirectos` tinyint(1) NOT NULL DEFAULT '0',
  `porcentaje_indirectos` decimal(5,2) DEFAULT NULL,
  `incluye_utilidad` tinyint(1) NOT NULL DEFAULT '0',
  `porcentaje_utilidad` decimal(5,2) DEFAULT NULL,
  `estado` enum('borrador','activo','suspendido','obsoleto') NOT NULL DEFAULT 'borrador',
  `es_publico` tinyint(1) NOT NULL DEFAULT '1',
  `cliente_id` int DEFAULT NULL,
  `creado_por` int NOT NULL,
  `aprobado_por` int DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `catalogo_padre_id` int DEFAULT NULL,
  `configuracion` json DEFAULT NULL,
  `metadatos` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_catalogo`),
  KEY `idx_catalogo_tipo` (`tipo`),
  KEY `idx_catalogo_vigencia` (`fecha_vigencia_inicio`,`fecha_vigencia_fin`),
  KEY `idx_catalogo_activo` (`activo`),
  KEY `catalogo_padre_id` (`catalogo_padre_id`),
  KEY `catalogos_precios_tipo_catalogo` (`tipo_catalogo`),
  KEY `catalogos_precios_region` (`region`),
  KEY `catalogos_precios_estado` (`estado`),
  KEY `catalogos_precios_fecha_inicio_vigencia` (`fecha_inicio_vigencia`),
  KEY `catalogos_precios_es_publico` (`es_publico`),
  KEY `catalogos_precios_creado_por` (`creado_por`),
  CONSTRAINT `catalogos_precios_ibfk_1` FOREIGN KEY (`catalogo_padre_id`) REFERENCES `catalogos_precios` (`id_catalogo`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogos_precios`
--

LOCK TABLES `catalogos_precios` WRITE;
/*!40000 ALTER TABLE `catalogos_precios` DISABLE KEYS */;
/*!40000 ALTER TABLE `catalogos_precios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogos_precios_detalle`
--

DROP TABLE IF EXISTS `catalogos_precios_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogos_precios_detalle` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_catalogo` int NOT NULL,
  `id_concepto` int NOT NULL,
  `precio_unitario` decimal(15,4) NOT NULL,
  `precio_minimo` decimal(15,4) DEFAULT NULL,
  `precio_maximo` decimal(15,4) DEFAULT NULL,
  `costo_material` decimal(15,4) DEFAULT NULL,
  `costo_mano_obra` decimal(15,4) DEFAULT NULL,
  `costo_equipo` decimal(15,4) DEFAULT NULL,
  `costo_subcontrato` decimal(15,4) DEFAULT NULL,
  `factor_sobrecosto` decimal(8,4) NOT NULL DEFAULT '1.0000',
  `margen_utilidad_porcentaje` decimal(5,2) DEFAULT NULL,
  `descuento_volumen_porcentaje` decimal(5,2) DEFAULT NULL,
  `rendimiento_promedio` decimal(8,4) DEFAULT NULL,
  `rendimiento_minimo` decimal(8,4) DEFAULT NULL,
  `rendimiento_maximo` decimal(8,4) DEFAULT NULL,
  `vigente_desde` date NOT NULL,
  `vigente_hasta` date DEFAULT NULL,
  `proveedor_referencia` varchar(200) DEFAULT NULL,
  `fuente_precio` enum('cotizacion','mercado','historico','estimado','ajustado') NOT NULL DEFAULT 'cotizacion',
  `confiabilidad` enum('alta','media','baja') NOT NULL DEFAULT 'media',
  `numero_cotizaciones` int DEFAULT NULL,
  `fecha_ultima_actualizacion` datetime NOT NULL,
  `actualizado_por` int NOT NULL,
  `observaciones` text,
  `metadatos` json DEFAULT NULL,
  `es_precio_referencial` tinyint(1) NOT NULL DEFAULT '0',
  `requiere_aprobacion` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_detalle`),
  UNIQUE KEY `catalogos_precios_detalle_id_catalogo_id_concepto` (`id_catalogo`,`id_concepto`),
  KEY `idx_id_catalogo` (`id_catalogo`),
  KEY `idx_id_concepto` (`id_concepto`),
  KEY `idx_vigente_desde` (`vigente_desde`),
  KEY `idx_fuente_precio` (`fuente_precio`),
  KEY `idx_confiabilidad` (`confiabilidad`),
  KEY `catalogos_precios_detalle_id_catalogo` (`id_catalogo`),
  KEY `catalogos_precios_detalle_id_concepto` (`id_concepto`),
  KEY `catalogos_precios_detalle_fuente_precio` (`fuente_precio`),
  KEY `catalogos_precios_detalle_confiabilidad` (`confiabilidad`),
  KEY `catalogos_precios_detalle_vigente_desde` (`vigente_desde`),
  CONSTRAINT `catalogos_precios_detalle_ibfk_1` FOREIGN KEY (`id_catalogo`) REFERENCES `catalogos_precios` (`id_catalogo`),
  CONSTRAINT `catalogos_precios_detalle_ibfk_2` FOREIGN KEY (`id_concepto`) REFERENCES `conceptos_obra` (`id_concepto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogos_precios_detalle`
--

LOCK TABLES `catalogos_precios_detalle` WRITE;
/*!40000 ALTER TABLE `catalogos_precios_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `catalogos_precios_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_gastos`
--

DROP TABLE IF EXISTS `categorias_gastos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_gastos` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `color` varchar(7) DEFAULT '#6B7280',
  `icono` varchar(50) DEFAULT 'receipt',
  `activo` tinyint(1) DEFAULT '1',
  `orden_visualizacion` int DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_gastos`
--

LOCK TABLES `categorias_gastos` WRITE;
/*!40000 ALTER TABLE `categorias_gastos` DISABLE KEYS */;
INSERT INTO `categorias_gastos` VALUES (1,'Materiales','Gastos en materiales de construcción','0000-00-00 00:00:00','0000-00-00 00:00:00','#3B82F6','cube',1,1,'2025-10-15 21:53:19','2025-10-15 21:53:20'),(2,'Mano de Obra','Gastos en mano de obra','0000-00-00 00:00:00','0000-00-00 00:00:00','#10B981','users',1,1,'2025-10-15 21:53:19','2025-10-15 21:53:20'),(3,'Equipo','Gastos en equipo y maquinaria','0000-00-00 00:00:00','0000-00-00 00:00:00','#F59E0B','truck',1,1,'2025-10-15 21:53:19','2025-10-15 21:53:20'),(4,'Servicios','Gastos en servicios externos','0000-00-00 00:00:00','0000-00-00 00:00:00','#8B5CF6','cog',1,1,'2025-10-15 21:53:19','2025-10-15 21:53:20'),(5,'Administrativos','Gastos administrativos','0000-00-00 00:00:00','0000-00-00 00:00:00','#EF4444','document-text',1,1,'2025-10-15 21:53:19','2025-10-15 21:53:20');
/*!40000 ALTER TABLE `categorias_gastos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_herramienta`
--

DROP TABLE IF EXISTS `categorias_herramienta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_herramienta` (
  `id_categoria_herr` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_categoria_herr`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_categorias_herr_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_herramienta`
--

LOCK TABLES `categorias_herramienta` WRITE;
/*!40000 ALTER TABLE `categorias_herramienta` DISABLE KEYS */;
INSERT INTO `categorias_herramienta` VALUES (1,'Herramientas de Mano','Herramientas manuales básicas'),(2,'Herramientas Eléctricas','Herramientas que requieren electricidad'),(3,'Maquinaria Ligera','Maquinaria portátil y ligera'),(4,'Maquinaria Pesada','Maquinaria de gran tamaño'),(5,'Instrumentos de Medición','Herramientas de medición y precisión'),(6,'Seguridad','Equipo de protección personal'),(7,'Construcción','Herramientas específicas para construcción'),(8,'Jardinería','Herramientas para mantenimiento de áreas verdes'),(9,'Equipo de Elevación','Herramientas y equipos para elevación y transporte de materiales'),(10,'Herramientas Especializadas','Herramientas específicas para trabajos especializados de construcción');
/*!40000 ALTER TABLE `categorias_herramienta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_suministro`
--

DROP TABLE IF EXISTS `categorias_suministro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_suministro` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `tipo` enum('Proyecto','Administrativo') NOT NULL DEFAULT 'Proyecto',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL,
  `color` varchar(7) DEFAULT '#10B981',
  `orden` int DEFAULT '1',
  `icono` varchar(50) DEFAULT 'box',
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `categorias_suministro_nombre` (`nombre`),
  KEY `idx_categorias_tipo` (`tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_suministro`
--

LOCK TABLES `categorias_suministro` WRITE;
/*!40000 ALTER TABLE `categorias_suministro` DISABLE KEYS */;
INSERT INTO `categorias_suministro` VALUES (1,'Material','Materiales de construcción en general','Proyecto',1,'2025-10-07 18:55:44','2025-10-07 18:55:44','#3B82F6',1,NULL),(2,'Herramienta','Herramientas de trabajo y construcción','Proyecto',1,'2025-10-07 18:55:44','2025-10-07 18:55:44','#9333EA',2,NULL),(3,'Equipo Ligero','Equipos ligeros para construcción','Proyecto',1,'2025-10-07 18:55:44','2025-10-07 18:55:44','#3B82F6',3,NULL),(4,'Acero','Materiales de acero y estructura metálica','Proyecto',1,'2025-10-07 18:55:44','2025-10-07 18:55:44','#3B82F6',4,NULL),(5,'Cimbra','Materiales para cimbrado y moldeo','Proyecto',1,'2025-10-07 18:55:44','2025-10-07 18:55:44','#3B82F6',5,NULL),(6,'Ferretería','Artículos de ferretería y accesorios','Proyecto',1,'2025-10-07 18:55:44','2025-10-07 18:55:44','#3B82F6',6,NULL),(7,'Maquinaria','Maquinaria pesada y equipos especializados','Proyecto',1,'2025-10-07 18:55:44','2025-10-07 18:55:44','#3B82F6',7,NULL),(8,'Concreto','Concreto y materiales relacionados','Proyecto',1,'2025-10-07 18:55:44','2025-10-07 18:55:44','#3B82F6',8,NULL),(9,'Servicio','Servicios diversos y subcontratación','Administrativo',1,'2025-10-07 18:55:44','2025-10-07 18:55:44','#3B82F6',9,NULL),(10,'Consumible','Materiales consumibles y suministros de oficina','Administrativo',1,'2025-10-07 18:55:44','2025-10-07 18:55:44','#3B82F6',10,NULL),(16,'prueba','','Administrativo',1,'2025-10-10 21:30:27','2025-10-10 21:30:27','#3B82F6',0,NULL),(17,'IMSS','','Administrativo',1,'2025-11-03 20:47:06','2025-11-03 20:47:06','#3B82F6',0,'box'),(18,'IMPUESTO ISR','','Administrativo',1,'2025-11-03 20:53:02','2025-11-03 20:53:02','#3B82F6',0,'box'),(19,'GASOLINA','','Proyecto',1,'2025-11-07 20:38:23','2025-11-07 20:38:23','#3B82F6',0,'box');
/*!40000 ALTER TABLE `categorias_suministro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conceptos_obra`
--

DROP TABLE IF EXISTS `conceptos_obra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conceptos_obra` (
  `id_concepto` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `descripcion` text,
  `unidad` varchar(20) NOT NULL,
  `tipo` enum('Material','Mano_de_Obra','Maquinaria','Subcontrato') NOT NULL DEFAULT 'Material',
  `precio_base` decimal(12,4) DEFAULT '0.0000',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `observaciones` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nombre` varchar(200) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `subcategoria` varchar(100) DEFAULT NULL,
  `precio_referencial` decimal(15,4) DEFAULT NULL,
  `moneda` varchar(3) NOT NULL DEFAULT 'MXN',
  `tipo_concepto` enum('material','mano_obra','equipo','subcontrato','mixto') NOT NULL,
  `estado` enum('activo','inactivo','obsoleto') NOT NULL DEFAULT 'activo',
  `es_compuesto` tinyint(1) NOT NULL DEFAULT '0',
  `nivel_jerarquia` int NOT NULL DEFAULT '1',
  `concepto_padre_id` int DEFAULT NULL,
  `vigente_desde` date NOT NULL,
  `vigente_hasta` date DEFAULT NULL,
  `especificaciones_tecnicas` json DEFAULT NULL,
  `rendimiento_referencial` decimal(8,4) DEFAULT NULL,
  `metadatos` json DEFAULT NULL,
  `version` int NOT NULL DEFAULT '1',
  `creado_por` int NOT NULL,
  `actualizado_por` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_concepto`),
  UNIQUE KEY `unique_codigo` (`codigo`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `conceptos_obra_codigo` (`codigo`),
  KEY `idx_concepto_codigo` (`codigo`),
  KEY `idx_concepto_tipo` (`tipo`),
  KEY `idx_concepto_activo` (`activo`),
  KEY `conceptos_obra_categoria` (`categoria`),
  KEY `conceptos_obra_tipo_concepto` (`tipo_concepto`),
  KEY `conceptos_obra_estado` (`estado`),
  KEY `conceptos_obra_concepto_padre_id` (`concepto_padre_id`),
  CONSTRAINT `conceptos_obra_ibfk_1` FOREIGN KEY (`concepto_padre_id`) REFERENCES `conceptos_obra` (`id_concepto`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conceptos_obra`
--

LOCK TABLES `conceptos_obra` WRITE;
/*!40000 ALTER TABLE `conceptos_obra` DISABLE KEYS */;
/*!40000 ALTER TABLE `conceptos_obra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contratos`
--

DROP TABLE IF EXISTS `contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contratos` (
  `id_contrato` int NOT NULL AUTO_INCREMENT,
  `tipo_contrato` enum('Fijo','Temporal','Honorarios','Por_Proyecto') NOT NULL,
  `salario_diario` decimal(10,2) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  PRIMARY KEY (`id_contrato`),
  KEY `idx_contratos_tipo` (`tipo_contrato`),
  KEY `idx_contratos_fecha` (`fecha_inicio`,`fecha_fin`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contratos`
--

LOCK TABLES `contratos` WRITE;
/*!40000 ALTER TABLE `contratos` DISABLE KEYS */;
INSERT INTO `contratos` VALUES (1,'Fijo',400.00,'2023-01-01','2025-08-21'),(12,'Fijo',233.00,'2025-08-20',NULL),(13,'Fijo',350.00,'2023-01-01',NULL),(14,'Temporal',300.00,'2023-01-01','2023-12-31'),(15,'Honorarios',400.00,'2023-01-01',NULL),(16,'Por_Proyecto',450.00,'2023-01-01','2023-06-30'),(18,'Temporal',0.00,'2025-08-05','2025-12-31');
/*!40000 ALTER TABLE `contratos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleados`
--

DROP TABLE IF EXISTS `empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleados` (
  `id_empleado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `nss` varchar(20) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contacto_emergencia` varchar(100) DEFAULT NULL,
  `telefono_emergencia` varchar(20) DEFAULT NULL,
  `banco` varchar(50) DEFAULT NULL,
  `cuenta_bancaria` varchar(50) DEFAULT NULL,
  `id_contrato` int DEFAULT NULL,
  `id_oficio` int DEFAULT NULL,
  `id_proyecto` int DEFAULT NULL,
  `pago_diario` decimal(10,2) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_alta` date NOT NULL,
  `fecha_baja` date DEFAULT NULL,
  `tipo_empleado` enum('fijo','por_proyecto','eventual') DEFAULT 'eventual' COMMENT 'Tipo de relación laboral',
  `salario_base_personal` decimal(10,2) DEFAULT NULL COMMENT 'Salario base específico del empleado (opcional)',
  `modalidad_pago` enum('semanal','quincenal','mensual') DEFAULT 'semanal' COMMENT 'Frecuencia de pago',
  `observaciones_pago` text COMMENT 'Notas específicas sobre el pago del empleado',
  `rfc` varchar(13) DEFAULT NULL,
  `pago_semanal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_empleado`),
  KEY `idx_empleados_nombre` (`nombre`,`apellido`),
  KEY `idx_empleados_contrato` (`id_contrato`),
  KEY `idx_empleados_oficio` (`id_oficio`),
  KEY `idx_empleados_fechas` (`fecha_alta`,`fecha_baja`),
  KEY `fk_empleados_proyecto` (`id_proyecto`),
  CONSTRAINT `empleados_ibfk_1` FOREIGN KEY (`id_contrato`) REFERENCES `contratos` (`id_contrato`),
  CONSTRAINT `empleados_ibfk_2` FOREIGN KEY (`id_oficio`) REFERENCES `oficios` (`id_oficio`),
  CONSTRAINT `fk_empleados_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleados`
--

LOCK TABLES `empleados` WRITE;
/*!40000 ALTER TABLE `empleados` DISABLE KEYS */;
INSERT INTO `empleados` VALUES (13,'RAFAEL ','MENDOZA LOPEZ','54998265489','3332463442',NULL,NULL,NULL,NULL,NULL,9,4,NULL,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,NULL,3500.00),(14,'CRISPIN','MUÑOZ CRUZ','04007941000','3320913816',NULL,NULL,NULL,NULL,NULL,14,4,NULL,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,'MUCC791020',3000.00),(15,'GAEL NEPTALI','NAVARRO ALVAREZ','63190422715','3325689263',NULL,NULL,NULL,NULL,NULL,11,8,NULL,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,'NAAG040718IR3',2000.00),(16,'ZAIDA KAREN','COVARRUBIAS CASILLAS','17149242640','3323254350','PAREJA','3312908259',NULL,NULL,NULL,14,8,NULL,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,'COCZ921109',2000.00),(17,'JOSE CRUZ','VALDEZ LOPEZ','04139213419','3334149805',NULL,NULL,NULL,NULL,NULL,9,4,NULL,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,'VALC920619',4500.00),(18,'VITROPISERO','VITROPISERO','1234567890','1234567890',NULL,NULL,NULL,NULL,NULL,17,4,NULL,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,'RFC1234567890',3500.00);
/*!40000 ALTER TABLE `empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_cuenta`
--

DROP TABLE IF EXISTS `estados_cuenta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_cuenta` (
  `id_estado_cuenta` int NOT NULL AUTO_INCREMENT,
  `id_proyecto` int DEFAULT NULL,
  `fecha` date NOT NULL,
  `saldo_inicial` decimal(10,2) NOT NULL,
  `ingresos` decimal(10,2) NOT NULL DEFAULT '0.00',
  `gastos` decimal(10,2) NOT NULL DEFAULT '0.00',
  `saldo_final` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_estado_cuenta`),
  KEY `idx_estados_proyecto` (`id_proyecto`),
  KEY `idx_estados_fecha` (`fecha`),
  CONSTRAINT `estados_cuenta_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_cuenta`
--

LOCK TABLES `estados_cuenta` WRITE;
/*!40000 ALTER TABLE `estados_cuenta` DISABLE KEYS */;
/*!40000 ALTER TABLE `estados_cuenta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gastos`
--

DROP TABLE IF EXISTS `gastos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gastos` (
  `id_gasto` int NOT NULL AUTO_INCREMENT,
  `id_proyecto` int DEFAULT NULL,
  `id_categoria` int NOT NULL,
  `proveedor` varchar(100) DEFAULT NULL,
  `descripcion` text,
  `fecha` date NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `tiene_recibo` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_gasto`),
  KEY `idx_gastos_proyecto` (`id_proyecto`),
  KEY `idx_gastos_categoria` (`id_categoria`),
  KEY `idx_gastos_fecha` (`fecha`),
  KEY `idx_gastos_fecha_monto` (`fecha`,`monto`),
  CONSTRAINT `gastos_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_gastos` (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gastos`
--

LOCK TABLES `gastos` WRITE;
/*!40000 ALTER TABLE `gastos` DISABLE KEYS */;
/*!40000 ALTER TABLE `gastos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `herramientas`
--

DROP TABLE IF EXISTS `herramientas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `herramientas` (
  `id_herramienta` int NOT NULL AUTO_INCREMENT,
  `id_categoria_herr` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `serial` varchar(100) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `vida_util_meses` int DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `estado` int NOT NULL DEFAULT '1' COMMENT '1=Disponible, 2=Prestado, 3=Mantenimiento, 4=Reparación, 5=Fuera de Servicio',
  `id_proyecto` int DEFAULT NULL,
  `observaciones` text,
  `image_url` varchar(500) DEFAULT NULL,
  `stock_inicial` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_herramienta`),
  KEY `idx_herramientas_nombre` (`nombre`),
  KEY `idx_herramientas_categoria` (`id_categoria_herr`),
  KEY `herramientas_id_proyecto_foreign_idx` (`id_proyecto`),
  CONSTRAINT `herramientas_ibfk_1` FOREIGN KEY (`id_categoria_herr`) REFERENCES `categorias_herramienta` (`id_categoria_herr`),
  CONSTRAINT `herramientas_id_proyecto_foreign_idx` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `herramientas`
--

LOCK TABLES `herramientas` WRITE;
/*!40000 ALTER TABLE `herramientas` DISABLE KEYS */;
INSERT INTO `herramientas` VALUES (26,5,'NIveladores de Azulejos','TRUPER','NIAZ-50 102395',1.00,24,'Oficina Principal - Área de Trabajo',50,1,8,'','/uploads/herramientas/herramienta-1760206492832-436833072.jpeg',50),(28,2,'Rotomartillo MPOWER','MPOWER','Z1C-DW-40B',1.00,24,'Oficina Principal - Área de Trabajo',1,1,8,'','/uploads/herramientas/herramienta-1760206898674-224846957.jpeg',1),(29,2,'Pulidora Profesional','TRUPER','PULA-7A3',1.00,24,'Oficina Principal - Área de Trabajo',1,1,8,'','/uploads/herramientas/herramienta-1760207054314-925469815.jpeg',1),(30,5,'Sellador de Poliuretano Blanco','TRUPER','SEPO-280B',1.00,NULL,'Oficina Principal - Área de Trabajo',3,1,8,'','/uploads/herramientas/herramienta-1760207886127-57594998.jpeg',3),(32,5,'Guantes de Poliéster palma de Látex','TRUPER','GU-413',1.00,24,'Oficina Principal - Área de Trabajo',12,1,8,'','/uploads/herramientas/herramienta-1760208243552-754400986.jpeg',12),(33,5,'Lentes para Láser','TRUPER','LEN-NL-V',1.00,24,'Oficina Principal - Área de Trabajo',1,1,8,'','/uploads/herramientas/herramienta-1760208320475-162133814.jpeg',1),(34,5,'Guantes anticorte nivel 5','Generica','generico',1.00,12,'Oficina Principal - Área de Trabajo',3,1,8,'','',3),(35,10,'MARTILLO DE DEMOLICIÓN SDS MAX','TRUPER EXPERT','MADE-6NX',1.00,24,'Oficina Principal - Área de Trabajo',1,1,8,'','/uploads/herramientas/herramienta-1760209144219-883281832.jpeg',1),(36,2,'ROTO MARTILLO ','TRUPER','ROEL-60N',1.00,12,'Oficina Principal - Área de Trabajo',1,1,8,'','/uploads/herramientas/herramienta-1760209667527-9194349.jpeg',1),(37,4,'Sierra Circular','TRUPER','SICI-7-1/4N4',1.00,23,'Oficina Principal - Área de Trabajo',1,1,8,'','/uploads/herramientas/herramienta-1760209934593-495063260.jpeg',1),(39,4,'Esmiladora electrica','TRUPER','0',1.00,12,'',0,2,NULL,'','/uploads/herramientas/herramienta-1760211478975-264914546.jpg',1),(40,4,'Esmiladora inalambrica','TRUPER','0',1.00,12,'',0,2,NULL,'','/uploads/herramientas/herramienta-1760211627997-548971837.jpg',1),(41,5,'Extension Cable Uso Rudo','Generico','0',1.00,12,'',0,2,NULL,'','/uploads/herramientas/herramienta-1760211964215-828664077.webp',1),(42,5,'Extension Cable Uso Rudo 100 Metros','Generico','',1.00,12,'',0,2,NULL,'','/uploads/herramientas/herramienta-1760212066133-540424207.webp',1),(43,1,'Barra de hierro','TRUPER','',1.00,24,'',1,1,8,'','/uploads/herramientas/herramienta-1760465538161-441864172.jpeg',1),(44,1,'Pico','Genenico','',1.00,24,'Oficina Principal - Área de Trabajo',1,1,8,'','/uploads/herramientas/herramienta-1760466325625-672859952.jpeg',1),(45,5,'Escalera','CUPRUM','',1.00,24,'Oficina Principal - Área de Trabajo',1,1,8,'','/uploads/herramientas/herramienta-1760466633837-264358394.jpeg',1),(46,2,'Rotomartillo ','TRUPER','CUT',1.00,24,'Oficina Principal - Área de Trabajo',1,1,8,'','/uploads/herramientas/herramienta-1760466694262-627291900.jpeg',1),(47,5,'Palas','Generico','',1.00,24,'Oficina Principal - Área de Trabajo',4,1,8,'','/uploads/herramientas/herramienta-1760466980059-495348238.jpeg',4),(48,2,'Rotomartillo ','TRUPER','6J',1.00,23,'Oficina Principal - Área de Trabajo',1,1,8,'','',1),(49,5,'NIvel de láser','TRUPER','NLP-30',1.00,24,'Oficina Principal - Área de Trabajo',1,5,8,'','/uploads/herramientas/herramienta-1760466957004-9515901.jpeg',1),(50,4,'Sierra Circular','CRAFTSAMAN','',1.00,24,'Oficina Principal - Área de Trabajo',1,1,8,'','/uploads/herramientas/herramienta-1760467089697-199856080.jpeg',1);
/*!40000 ALTER TABLE `herramientas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingresos`
--

DROP TABLE IF EXISTS `ingresos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingresos` (
  `id_ingreso` int NOT NULL AUTO_INCREMENT,
  `id_proyecto` int DEFAULT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `notas` text,
  `descripcion` text COMMENT 'Descripción del ingreso',
  `fuente` varchar(100) DEFAULT NULL COMMENT 'Fuente del ingreso (cliente/razón)',
  `createdAt` datetime DEFAULT NULL COMMENT 'Fecha de creación (agregada por migración)',
  `updatedAt` datetime DEFAULT NULL COMMENT 'Fecha de actualización (agregada por migración)',
  PRIMARY KEY (`id_ingreso`),
  KEY `idx_ingresos_proyecto` (`id_proyecto`),
  KEY `idx_ingresos_fecha` (`fecha`),
  CONSTRAINT `ingresos_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingresos`
--

LOCK TABLES `ingresos` WRITE;
/*!40000 ALTER TABLE `ingresos` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingresos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingresos_movimientos`
--

DROP TABLE IF EXISTS `ingresos_movimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingresos_movimientos` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT COMMENT 'ID único del movimiento',
  `id_ingreso` int NOT NULL COMMENT 'ID del ingreso al que pertenece este movimiento',
  `id_proyecto` int DEFAULT NULL COMMENT 'ID del proyecto asociado (heredado o específico)',
  `tipo` enum('ingreso','gasto','ajuste') NOT NULL DEFAULT 'gasto' COMMENT 'Tipo de movimiento: ingreso (inicial o adicional), gasto (consumo), ajuste (corrección)',
  `fuente` enum('nomina','suministro','manual','otros') NOT NULL DEFAULT 'manual' COMMENT 'Fuente del movimiento',
  `ref_tipo` varchar(50) DEFAULT NULL COMMENT 'Tipo de referencia: nomina, suministro, etc. (para referencias polimórficas)',
  `ref_id` int DEFAULT NULL COMMENT 'ID de la referencia externa (id_nomina, id_suministro, etc.)',
  `fecha` date NOT NULL COMMENT 'Fecha del movimiento',
  `monto` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Monto del movimiento (positivo para ingresos/ajustes positivos, positivo también para gastos)',
  `descripcion` text COMMENT 'Descripción detallada del movimiento',
  `saldo_after` decimal(12,2) DEFAULT NULL COMMENT 'Saldo del ingreso después de aplicar este movimiento',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  PRIMARY KEY (`id_movimiento`),
  KEY `idx_movimientos_ingreso` (`id_ingreso`),
  KEY `idx_movimientos_proyecto` (`id_proyecto`),
  KEY `idx_movimientos_tipo_fuente` (`tipo`,`fuente`),
  KEY `idx_movimientos_fecha` (`fecha`),
  KEY `idx_movimientos_referencia` (`ref_tipo`,`ref_id`),
  CONSTRAINT `ingresos_movimientos_ibfk_1` FOREIGN KEY (`id_ingreso`) REFERENCES `ingresos` (`id_ingreso`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ingresos_movimientos_ibfk_2` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tabla de movimientos de ingresos - Registra todos los ingresos, gastos y ajustes asociados a un ingreso';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingresos_movimientos`
--

LOCK TABLES `ingresos_movimientos` WRITE;
/*!40000 ALTER TABLE `ingresos_movimientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingresos_movimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integraciones_logs`
--

DROP TABLE IF EXISTS `integraciones_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `integraciones_logs` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('Importacion','Exportacion') NOT NULL,
  `sistema` varchar(50) DEFAULT NULL,
  `direccion` enum('Entrada','Salida') NOT NULL,
  `archivo` varchar(100) DEFAULT NULL,
  `filas_procesadas` int DEFAULT NULL,
  `errores_json` json DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `id_usuario` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_log`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integraciones_logs`
--

LOCK TABLES `integraciones_logs` WRITE;
/*!40000 ALTER TABLE `integraciones_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `integraciones_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_herramienta`
--

DROP TABLE IF EXISTS `movimientos_herramienta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_herramienta` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `id_herramienta` int NOT NULL,
  `id_proyecto` int DEFAULT NULL,
  `tipo_movimiento` enum('Entrada','Salida','Devolucion','Baja') NOT NULL,
  `cantidad` int NOT NULL,
  `fecha_movimiento` datetime NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `notas` varchar(255) DEFAULT NULL,
  `razon_movimiento` varchar(100) DEFAULT NULL,
  `detalle_adicional` text,
  `usuario_receptor` varchar(255) DEFAULT NULL,
  `fecha_devolucion_esperada` date DEFAULT NULL,
  `estado_movimiento` enum('activo','completado','cancelado') DEFAULT 'activo',
  PRIMARY KEY (`id_movimiento`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_movimientos_herr` (`id_herramienta`),
  KEY `idx_movimientos_proyecto` (`id_proyecto`),
  KEY `idx_movimientos_tipo` (`tipo_movimiento`),
  KEY `idx_movimientos_fecha` (`fecha_movimiento`),
  KEY `idx_movimientos_fecha_tipo` (`fecha_movimiento`,`tipo_movimiento`),
  KEY `idx_movimientos_razon` (`razon_movimiento`),
  KEY `idx_movimientos_estado` (`estado_movimiento`),
  CONSTRAINT `movimientos_herramienta_ibfk_1` FOREIGN KEY (`id_herramienta`) REFERENCES `herramientas` (`id_herramienta`),
  CONSTRAINT `movimientos_herramienta_ibfk_2` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`),
  CONSTRAINT `movimientos_herramienta_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_herramienta`
--

LOCK TABLES `movimientos_herramienta` WRITE;
/*!40000 ALTER TABLE `movimientos_herramienta` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_herramienta` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_before_movimiento_herramienta` BEFORE INSERT ON `movimientos_herramienta` FOR EACH ROW BEGIN
        DECLARE stock_actual INT;
        
        IF NEW.tipo_movimiento = 'Salida' THEN
          
          SELECT stock INTO stock_actual 
          FROM herramientas 
          WHERE id_herramienta = NEW.id_herramienta;
          
          IF stock_actual < NEW.cantidad THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Stock insuficiente para realizar la salida';
          END IF;
        END IF;
      END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_after_movimiento_herramienta` AFTER INSERT ON `movimientos_herramienta` FOR EACH ROW BEGIN
  CALL sp_actualizar_stock_herramienta(NEW.id_herramienta);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `nomina_empleados`
--

DROP TABLE IF EXISTS `nomina_empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nomina_empleados` (
  `id_nomina` int NOT NULL AUTO_INCREMENT,
  `id_empleado` int NOT NULL,
  `id_semana` int NOT NULL,
  `id_proyecto` int DEFAULT NULL,
  `dias_laborados` int NOT NULL,
  `horas_extra` decimal(10,2) DEFAULT NULL,
  `bonos` decimal(10,2) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL,
  `estado` enum('Pendiente','En_Proceso','Aprobada','Pagado','Cancelada','Borrador') NOT NULL DEFAULT 'Pendiente',
  `fecha_pago` timestamp NULL DEFAULT NULL,
  `recibo_pdf` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deducciones_isr` decimal(10,2) DEFAULT '0.00' COMMENT 'Monto de ISR (0 = no aplicado, >0 = monto aplicado)',
  `deducciones_imss` decimal(10,2) DEFAULT '0.00' COMMENT 'Monto de IMSS (0 = no aplicado, >0 = monto aplicado)',
  `deducciones_infonavit` decimal(10,2) DEFAULT '0.00' COMMENT 'Monto de Infonavit (0 = no aplicado, >0 = monto aplicado)',
  `deducciones_adicionales` decimal(10,2) DEFAULT '0.00' COMMENT 'Otras deducciones',
  `monto_pagado` decimal(10,2) DEFAULT NULL,
  `semana` int DEFAULT NULL COMMENT 'Número de semana del mes (1-5)',
  `periodo` varchar(7) DEFAULT NULL COMMENT 'Periodo en formato YYYY-MM',
  `pago_semanal` decimal(10,2) NOT NULL COMMENT 'Pago semanal del empleado',
  `pago_parcial` tinyint(1) DEFAULT '0' COMMENT 'Indica si es un pago parcial',
  `monto_a_pagar` decimal(10,2) DEFAULT NULL COMMENT 'Monto específico a pagar en caso de pago parcial',
  `liquidar_adeudos` tinyint(1) DEFAULT '0' COMMENT 'Indica si se deben liquidar adeudos pendientes',
  `descuentos` decimal(10,2) DEFAULT '0.00' COMMENT 'Descuentos adicionales (adelantos, préstamos, etc.)',
  PRIMARY KEY (`id_nomina`),
  UNIQUE KEY `idx_nomina_unica_empleado_semana` (`id_empleado`,`id_semana`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nomina_empleados`
--

LOCK TABLES `nomina_empleados` WRITE;
/*!40000 ALTER TABLE `nomina_empleados` DISABLE KEYS */;
INSERT INTO `nomina_empleados` VALUES (1,13,42,4,6,0.00,0.00,3500.00,'Pagado',NULL,'/uploads/recibos/nomina_semana-3_RAFAEL__MENDOZA_LOPEZ_20251108_183903.pdf','2025-10-17 17:45:23','2025-11-08 18:39:03',0.00,0.00,0.00,0.00,3500.00,NULL,NULL,3500.00,0,NULL,0,0.00),(2,14,42,4,6,0.00,0.00,3000.00,'Pagado',NULL,NULL,'2025-10-17 17:45:52','2025-11-01 18:44:14',0.00,0.00,0.00,0.00,3000.00,NULL,NULL,3000.00,0,NULL,0,0.00),(3,15,42,8,6,0.00,0.00,2000.00,'Pagado',NULL,'/uploads/recibos/nomina_semana-3_GAEL_NEPTALI_NAVARRO_ALVAREZ_20251108_183903.pdf','2025-10-17 17:46:05','2025-11-08 18:39:03',0.00,0.00,0.00,0.00,2000.00,NULL,NULL,2000.00,0,NULL,0,0.00),(4,16,42,8,6,0.00,0.00,2000.00,'Pagado',NULL,NULL,'2025-10-17 17:46:23','2025-11-01 18:44:38',0.00,0.00,0.00,0.00,2000.00,NULL,NULL,2000.00,0,NULL,0,0.00),(5,17,42,4,6,0.00,0.00,4500.00,'Pagado',NULL,'/uploads/recibos/nomina_semana-3_JOSE_CRUZ_VALDEZ_LOPEZ_20251108_183904.pdf','2025-10-17 17:46:33','2025-11-08 18:39:04',0.00,0.00,0.00,0.00,4500.00,NULL,NULL,4500.00,0,NULL,0,0.00),(6,18,42,4,6,0.00,0.00,3500.00,'Pagado',NULL,NULL,'2025-10-17 17:46:49','2025-11-01 18:44:50',0.00,0.00,0.00,0.00,3500.00,NULL,NULL,3500.00,0,NULL,0,0.00),(12,14,43,4,5,0.00,0.00,549.00,'Pagado',NULL,'/uploads/recibos/nomina_semana4_CRISPIN_MUÑOZ_CRUZ.pdf','2025-10-27 22:20:49','2025-11-01 18:34:57',0.00,1951.00,0.00,0.00,549.00,NULL,NULL,3000.00,0,NULL,0,0.00),(14,17,43,4,6,0.00,0.00,2549.00,'Pagado',NULL,'/uploads/recibos/nomina_semana4_JOSE_CRUZ_VALDEZ_LOPEZ.pdf','2025-10-27 22:33:17','2025-11-01 18:35:05',0.00,1951.00,0.00,0.00,2549.00,NULL,NULL,4500.00,0,NULL,0,0.00),(15,15,43,8,6,0.00,0.00,2000.00,'Pagado',NULL,'/uploads/recibos/nomina_semana4_GAEL_NEPTALI_NAVARRO_ALVAREZ.pdf','2025-10-27 22:33:50','2025-11-01 18:24:52',0.00,0.00,0.00,0.00,2000.00,NULL,NULL,2000.00,0,NULL,0,0.00),(16,14,44,4,1,0.00,0.00,0.00,'Pagado',NULL,'/uploads/recibos/nomina_semana-5_CRISPIN_MUÑOZ_CRUZ_20251101_193605.pdf','2025-11-01 17:06:18','2025-11-01 19:37:36',0.00,500.00,0.00,0.00,500.00,NULL,NULL,3000.00,0,NULL,0,0.00),(17,13,44,4,5,0.00,0.00,965.67,'Pagado',NULL,'/uploads/recibos/nomina_semana-5_RAFAEL__MENDOZA_LOPEZ_20251101_193605.pdf','2025-11-01 18:38:30','2025-11-01 19:37:36',0.00,1951.00,0.00,0.00,965.67,NULL,NULL,3500.00,0,NULL,0,0.00),(18,17,44,4,6,0.00,0.00,2549.00,'Pagado',NULL,'/uploads/recibos/nomina_semana-5_JOSE_CRUZ_VALDEZ_LOPEZ_20251101_193606.pdf','2025-11-01 18:39:23','2025-11-01 19:37:37',0.00,1951.00,0.00,0.00,2549.00,NULL,NULL,4500.00,0,NULL,0,0.00),(19,15,44,8,6,0.00,0.00,2000.00,'Pagado',NULL,'/uploads/recibos/nomina_semana-5_GAEL_NEPTALI_NAVARRO_ALVAREZ_20251101_193800.pdf','2025-11-01 18:43:26','2025-11-08 05:19:47',0.00,0.00,0.00,0.00,2000.00,NULL,NULL,2000.00,0,NULL,0,0.00),(26,13,45,4,6,0.00,0.00,1549.00,'Pagado',NULL,'/uploads/recibos/nomina_semana-2_RAFAEL__MENDOZA_LOPEZ_20251108_183952.pdf','2025-11-07 20:09:24','2025-11-08 18:39:52',0.00,1951.00,0.00,0.00,1549.00,NULL,NULL,3500.00,0,NULL,0,0.00),(27,17,45,4,6,0.00,0.00,2549.00,'Pagado',NULL,'/uploads/recibos/nomina_semana-2_JOSE_CRUZ_VALDEZ_LOPEZ_20251108_184026.pdf','2025-11-07 20:09:55','2025-11-08 18:40:26',0.00,1951.00,0.00,0.00,2549.00,NULL,NULL,4500.00,0,NULL,0,0.00),(29,15,45,8,6,0.00,0.00,2000.00,'Pagado',NULL,'/uploads/recibos/nomina_semana-2_GAEL_NEPTALI_NAVARRO_ALVAREZ_20251108_184016.pdf','2025-11-08 06:42:33','2025-11-10 19:37:29',0.00,0.00,0.00,0.00,2000.00,1,'2025-11',2000.00,0,NULL,0,0.00),(30,16,45,8,6,0.00,0.00,49.00,'Pagado',NULL,'/uploads/recibos/nomina_semana-2_ZAIDA_KAREN_COVARRUBIAS_CASILLAS_20251108_185312.pdf','2025-11-08 18:53:12','2025-11-08 18:53:44',0.00,1951.00,0.00,0.00,49.00,1,'2025-11',2000.00,0,NULL,0,0.00);
/*!40000 ALTER TABLE `nomina_empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nomina_historial`
--

DROP TABLE IF EXISTS `nomina_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nomina_historial` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_nomina` int NOT NULL,
  `id_usuario` int NOT NULL,
  `tipo_cambio` enum('creacion','actualizacion','cambio_estado','pago','Pago Parcial','Liquidación de Adeudo') NOT NULL,
  `descripcion` text,
  `monto_anterior` decimal(10,2) DEFAULT NULL,
  `monto_nuevo` decimal(10,2) DEFAULT NULL,
  `estado_anterior` varchar(20) DEFAULT NULL,
  `estado_nuevo` varchar(20) DEFAULT NULL,
  `detalles` json DEFAULT NULL,
  `fecha_cambio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  KEY `id_nomina` (`id_nomina`),
  KEY `id_usuario` (`id_usuario`),
  KEY `tipo_cambio` (`tipo_cambio`),
  KEY `fecha_cambio` (`fecha_cambio`),
  CONSTRAINT `nomina_historial_ibfk_1` FOREIGN KEY (`id_nomina`) REFERENCES `nomina_empleados` (`id_nomina`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nomina_historial`
--

LOCK TABLES `nomina_historial` WRITE;
/*!40000 ALTER TABLE `nomina_historial` DISABLE KEYS */;
/*!40000 ALTER TABLE `nomina_historial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nomina_historials`
--

DROP TABLE IF EXISTS `nomina_historials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nomina_historials` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_nomina` int NOT NULL,
  `id_usuario` int NOT NULL,
  `tipo_cambio` enum('creacion','actualizacion','cambio_estado','pago') NOT NULL,
  `estado_anterior` varchar(20) DEFAULT NULL,
  `estado_nuevo` varchar(20) DEFAULT NULL,
  `detalles` json DEFAULT NULL,
  `fecha_cambio` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_historial`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nomina_historials`
--

LOCK TABLES `nomina_historials` WRITE;
/*!40000 ALTER TABLE `nomina_historials` DISABLE KEYS */;
INSERT INTO `nomina_historials` VALUES (1,1,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 3500, \"monto_adeudo\": 0, \"monto_pagado\": 3500, \"pago_semanal\": 3500, \"dias_laborados\": 6}','2025-10-18 17:45:23','2025-10-18 17:45:23','2025-10-18 17:45:23'),(2,2,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 3000, \"monto_adeudo\": 0, \"monto_pagado\": 3000, \"pago_semanal\": 3000, \"dias_laborados\": 6}','2025-10-18 17:45:52','2025-10-18 17:45:52','2025-10-18 17:45:52'),(3,3,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 2000, \"monto_adeudo\": 0, \"monto_pagado\": 2000, \"pago_semanal\": 2000, \"dias_laborados\": 6}','2025-10-18 17:46:05','2025-10-18 17:46:05','2025-10-18 17:46:05'),(4,4,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 2000, \"monto_adeudo\": 0, \"monto_pagado\": 2000, \"pago_semanal\": 2000, \"dias_laborados\": 6}','2025-10-18 17:46:23','2025-10-18 17:46:23','2025-10-18 17:46:23'),(5,5,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 4500, \"monto_adeudo\": 0, \"monto_pagado\": 4500, \"pago_semanal\": 4500, \"dias_laborados\": 6}','2025-10-18 17:46:33','2025-10-18 17:46:33','2025-10-18 17:46:33'),(6,6,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 3500, \"monto_adeudo\": 0, \"monto_pagado\": 3500, \"pago_semanal\": 3500, \"dias_laborados\": 6}','2025-10-18 17:46:49','2025-10-18 17:46:49','2025-10-18 17:46:49'),(7,7,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 3000, \"monto_adeudo\": 1049, \"monto_pagado\": 1951, \"pago_semanal\": 3000, \"dias_laborados\": 6}','2025-10-25 21:08:57','2025-10-25 21:08:57','2025-10-25 21:08:57'),(8,8,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 4500, \"monto_adeudo\": 2549, \"monto_pagado\": 1951, \"pago_semanal\": 4500, \"dias_laborados\": 6}','2025-10-25 21:09:19','2025-10-25 21:09:19','2025-10-25 21:09:19'),(9,9,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 2000, \"monto_adeudo\": 0, \"monto_pagado\": 2000, \"pago_semanal\": 2000, \"dias_laborados\": 6}','2025-10-25 21:09:31','2025-10-25 21:09:31','2025-10-25 21:09:31'),(12,12,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 1951, \"horas_extra\": 0, \"monto_total\": 549, \"monto_adeudo\": 0, \"monto_pagado\": 549, \"pago_semanal\": 3000, \"dias_laborados\": 5}','2025-10-27 22:20:50','2025-10-27 22:20:50','2025-10-27 22:20:50'),(14,14,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 1951, \"horas_extra\": 0, \"monto_total\": 2549, \"monto_adeudo\": 0, \"monto_pagado\": 2549, \"pago_semanal\": 4500, \"dias_laborados\": 6}','2025-10-27 22:33:17','2025-10-27 22:33:17','2025-10-27 22:33:17'),(15,15,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 2000, \"monto_adeudo\": 0, \"monto_pagado\": 2000, \"pago_semanal\": 2000, \"dias_laborados\": 6}','2025-10-27 22:33:50','2025-10-27 22:33:50','2025-10-27 22:33:50'),(16,16,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 500, \"monto_adeudo\": 0, \"monto_pagado\": 500, \"pago_semanal\": 3000, \"dias_laborados\": 1}','2025-11-01 17:06:18','2025-11-01 17:06:18','2025-11-01 17:06:18'),(17,12,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 17:46:50','2025-11-01 17:46:50','2025-11-01 17:46:50'),(18,14,1,'cambio_estado','Borrador','Aprobada','{\"motivo\": \"No especificado\"}','2025-11-01 17:47:03','2025-11-01 17:47:03','2025-11-01 17:47:03'),(19,14,1,'cambio_estado','Aprobada','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 17:47:05','2025-11-01 17:47:05','2025-11-01 17:47:05'),(20,15,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 17:47:13','2025-11-01 17:47:13','2025-11-01 17:47:13'),(21,12,1,'cambio_estado','Pagado','Pendiente','{\"motivo\": \"No especificado\"}','2025-11-01 18:09:22','2025-11-01 18:09:22','2025-11-01 18:09:22'),(22,12,1,'cambio_estado','Pendiente','Borrador','{\"motivo\": \"No especificado\"}','2025-11-01 18:09:26','2025-11-01 18:09:26','2025-11-01 18:09:26'),(23,15,1,'cambio_estado','Pagado','Borrador','{\"motivo\": \"No especificado\"}','2025-11-01 18:09:54','2025-11-01 18:09:54','2025-11-01 18:09:54'),(24,14,1,'cambio_estado','Pagado','Pendiente','{\"motivo\": \"No especificado\"}','2025-11-01 18:10:02','2025-11-01 18:10:02','2025-11-01 18:10:02'),(25,15,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 18:10:13','2025-11-01 18:10:13','2025-11-01 18:10:13'),(26,15,1,'cambio_estado','Pagado','Borrador','{\"motivo\": \"No especificado\"}','2025-11-01 18:13:57','2025-11-01 18:13:57','2025-11-01 18:13:57'),(27,15,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 18:16:51','2025-11-01 18:16:51','2025-11-01 18:16:51'),(28,15,1,'cambio_estado','Pagado','Borrador','{\"motivo\": \"No especificado\"}','2025-11-01 18:17:10','2025-11-01 18:17:10','2025-11-01 18:17:10'),(29,15,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 18:18:00','2025-11-01 18:18:00','2025-11-01 18:18:00'),(30,12,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 18:34:57','2025-11-01 18:34:57','2025-11-01 18:34:57'),(31,14,1,'cambio_estado','Pendiente','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 18:35:05','2025-11-01 18:35:05','2025-11-01 18:35:05'),(32,17,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 1951, \"horas_extra\": 0, \"monto_total\": 965.666666666667, \"monto_adeudo\": 0, \"monto_pagado\": 965.666666666667, \"pago_semanal\": 3500, \"dias_laborados\": 5}','2025-11-01 18:38:30','2025-11-01 18:38:30','2025-11-01 18:38:30'),(33,18,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 1951, \"horas_extra\": 0, \"monto_total\": 2549, \"monto_adeudo\": 0, \"monto_pagado\": 2549, \"pago_semanal\": 4500, \"dias_laborados\": 6}','2025-11-01 18:39:23','2025-11-01 18:39:23','2025-11-01 18:39:23'),(34,19,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 2000, \"monto_adeudo\": 0, \"monto_pagado\": 2000, \"pago_semanal\": 2000, \"dias_laborados\": 6}','2025-11-01 18:43:26','2025-11-01 18:43:26','2025-11-01 18:43:26'),(35,1,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 18:44:07','2025-11-01 18:44:07','2025-11-01 18:44:07'),(36,2,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 18:44:14','2025-11-01 18:44:14','2025-11-01 18:44:14'),(37,3,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 18:44:25','2025-11-01 18:44:25','2025-11-01 18:44:25'),(38,4,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 18:44:38','2025-11-01 18:44:38','2025-11-01 18:44:38'),(39,5,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 18:44:44','2025-11-01 18:44:44','2025-11-01 18:44:44'),(40,6,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 18:44:50','2025-11-01 18:44:50','2025-11-01 18:44:50'),(42,17,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 19:37:36','2025-11-01 19:37:36','2025-11-01 19:37:36'),(43,16,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 19:37:36','2025-11-01 19:37:36','2025-11-01 19:37:36'),(44,18,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 19:37:37','2025-11-01 19:37:37','2025-11-01 19:37:37'),(45,19,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-01 19:38:01','2025-11-01 19:38:01','2025-11-01 19:38:01'),(55,26,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 1951, \"horas_extra\": 0, \"monto_total\": 1549, \"monto_adeudo\": 0, \"monto_pagado\": 1549, \"pago_semanal\": 3500, \"dias_laborados\": 6}','2025-11-07 20:09:24','2025-11-07 20:09:24','2025-11-07 20:09:24'),(56,27,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 1951, \"horas_extra\": 0, \"monto_total\": 2549, \"monto_adeudo\": 0, \"monto_pagado\": 2549, \"pago_semanal\": 4500, \"dias_laborados\": 6}','2025-11-07 20:09:55','2025-11-07 20:09:55','2025-11-07 20:09:55'),(57,19,1,'cambio_estado','Pagado','Borrador','{\"motivo\": \"No especificado\"}','2025-11-08 05:19:44','2025-11-08 05:19:44','2025-11-08 05:19:44'),(58,19,1,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-08 05:19:48','2025-11-08 05:19:48','2025-11-08 05:19:48'),(60,29,1,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 2000, \"monto_adeudo\": 0, \"monto_pagado\": 2000, \"pago_semanal\": 2000, \"dias_laborados\": 6}','2025-11-08 06:42:33','2025-11-08 06:42:33','2025-11-08 06:42:33'),(61,26,4,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-08 16:25:49','2025-11-08 16:25:49','2025-11-08 16:25:49'),(62,26,4,'cambio_estado','Pagado','Borrador','{\"motivo\": \"No especificado\"}','2025-11-08 16:26:01','2025-11-08 16:26:01','2025-11-08 16:26:01'),(63,26,4,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-08 18:38:35','2025-11-08 18:38:35','2025-11-08 18:38:35'),(64,29,4,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-08 18:38:40','2025-11-08 18:38:40','2025-11-08 18:38:40'),(65,27,4,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-08 18:38:49','2025-11-08 18:38:49','2025-11-08 18:38:49'),(66,30,4,'creacion',NULL,'Borrador','{\"bonos\": 0, \"deducciones\": 1951, \"horas_extra\": 0, \"monto_total\": 49, \"monto_adeudo\": 0, \"monto_pagado\": 49, \"pago_semanal\": 2000, \"dias_laborados\": 6}','2025-11-08 18:53:12','2025-11-08 18:53:12','2025-11-08 18:53:12'),(67,30,4,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-08 18:53:44','2025-11-08 18:53:44','2025-11-08 18:53:44'),(68,29,4,'cambio_estado','Pagado','Borrador','{\"motivo\": \"No especificado\"}','2025-11-08 19:36:04','2025-11-08 19:36:04','2025-11-08 19:36:04'),(69,29,4,'cambio_estado','Borrador','Pagado','{\"motivo\": \"No especificado\"}','2025-11-08 19:36:12','2025-11-08 19:36:12','2025-11-08 19:36:12');
/*!40000 ALTER TABLE `nomina_historials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oficios`
--

DROP TABLE IF EXISTS `oficios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oficios` (
  `id_oficio` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `salario_referencia` decimal(10,2) DEFAULT NULL,
  `tarifa_referencia` decimal(8,2) DEFAULT NULL COMMENT 'Tarifa de referencia por día (no obligatoria)',
  `descripcion_tarifa` varchar(255) DEFAULT NULL COMMENT 'Descripción de la tarifa de referencia',
  PRIMARY KEY (`id_oficio`),
  KEY `idx_oficios_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oficios`
--

LOCK TABLES `oficios` WRITE;
/*!40000 ALTER TABLE `oficios` DISABLE KEYS */;
INSERT INTO `oficios` VALUES (1,'Albañil Certificado','Profesional de la construcción con certificación en técnicas modernas',NULL,400.00,'Tarifa base para albañilería general'),(3,'Plomero','Instalaciones hidráulicas',NULL,NULL,NULL),(4,'Carpintero','Trabajo en madera',NULL,NULL,NULL),(5,'Pintor','Acabados en pintura',NULL,NULL,NULL),(6,'Soldador','Trabajos de soldadura',NULL,NULL,NULL),(7,'Técnico HVAC','Aire acondicionado y ventilación',NULL,NULL,NULL),(9,'Albañil','Construcción general',NULL,400.00,'Tarifa base para albañilería general'),(10,'Electricista','Instalaciones eléctricas',NULL,NULL,NULL),(11,'Desarrollador','Desarrollo de software',NULL,NULL,NULL),(12,'Diseñador','Diseño gráfico y UI/UX',NULL,NULL,NULL),(13,'Project Manager','Gestión de proyectos',NULL,NULL,NULL),(14,'Ayudante General','Apoyo en labores generales',NULL,NULL,NULL),(15,'Operador de Maquinaria','Manejo de equipo pesado',NULL,NULL,NULL),(16,'Administrativo','xd',NULL,NULL,NULL),(17,'VITROPISERO',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `oficios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos_nominas`
--

DROP TABLE IF EXISTS `pagos_nominas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos_nominas` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `id_nomina` int NOT NULL,
  `fecha_pago` date NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('Efectivo','Transferencia') NOT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_pago`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_nominas`
--

LOCK TABLES `pagos_nominas` WRITE;
/*!40000 ALTER TABLE `pagos_nominas` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagos_nominas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos_rols`
--

DROP TABLE IF EXISTS `permisos_rols`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos_rols` (
  `id_permiso` int NOT NULL AUTO_INCREMENT,
  `id_rol` int NOT NULL,
  `id_accion` int NOT NULL,
  `permitido` tinyint(1) DEFAULT '1',
  `fecha_creacion` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL,
  PRIMARY KEY (`id_permiso`),
  KEY `id_rol` (`id_rol`),
  KEY `id_accion` (`id_accion`),
  CONSTRAINT `permisos_rols_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON UPDATE CASCADE,
  CONSTRAINT `permisos_rols_ibfk_2` FOREIGN KEY (`id_accion`) REFERENCES `acciones_permisos` (`id_accion`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=714 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos_rols`
--

LOCK TABLES `permisos_rols` WRITE;
/*!40000 ALTER TABLE `permisos_rols` DISABLE KEYS */;
INSERT INTO `permisos_rols` VALUES (1,1,1,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(2,1,2,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(3,1,3,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(4,1,4,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(5,1,5,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(6,1,6,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(7,1,7,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(8,1,8,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(9,1,9,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(10,1,10,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(11,1,11,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(12,1,12,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(13,1,13,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(14,1,14,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(15,1,15,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(16,1,16,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(17,1,17,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(18,1,18,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(19,1,19,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(20,1,20,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(21,1,21,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(22,1,22,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(292,1,23,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(293,1,24,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(294,1,25,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(295,1,26,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(296,1,27,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(297,1,28,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(298,1,29,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(299,1,30,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(300,1,31,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(301,1,32,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(302,1,33,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(303,1,34,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(304,1,35,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(305,1,36,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(310,1,37,1,'2025-08-19 19:30:14','2025-08-19 19:30:14'),(311,1,38,1,'2025-08-19 19:30:14','2025-08-19 19:30:14'),(312,1,39,1,'2025-08-19 19:30:14','2025-08-19 19:30:14'),(313,1,40,1,'2025-08-19 19:30:14','2025-08-19 19:30:14'),(475,1,41,1,'2025-08-20 17:22:49','2025-08-20 17:22:49'),(476,1,42,1,'2025-08-20 17:22:49','2025-08-20 17:22:49'),(477,1,43,1,'2025-08-20 17:22:49','2025-08-20 17:22:49'),(656,2,1,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(657,2,2,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(658,2,3,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(659,2,4,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(660,2,6,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(661,2,5,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(662,2,7,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(663,2,8,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(664,2,9,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(665,2,10,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(666,2,11,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(667,2,12,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(668,2,13,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(669,2,14,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(670,2,15,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(671,2,16,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(672,2,17,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(673,2,18,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(674,2,19,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(675,2,20,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(676,2,21,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(677,2,22,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(678,2,23,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(679,2,24,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(680,2,25,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(681,2,26,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(682,2,27,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(683,2,28,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(684,2,29,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(685,2,30,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(686,2,31,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(687,2,32,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(688,2,33,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(689,2,34,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(690,2,35,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(691,2,36,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(692,2,37,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(693,2,38,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(694,2,39,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(695,2,40,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(696,2,41,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(697,2,42,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(698,2,43,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(699,1,44,1,'2025-10-07 19:15:37','2025-10-07 19:15:37'),(700,1,45,1,'2025-10-07 19:15:38','2025-10-07 19:15:38'),(701,1,46,1,'2025-10-07 19:15:38','2025-10-07 19:15:38'),(702,1,47,1,'2025-10-07 19:15:39','2025-10-07 19:15:39'),(703,1,48,1,'2025-10-07 19:15:39','2025-10-07 19:15:39'),(704,1,49,1,'2025-10-07 19:15:39','2025-10-07 19:15:39'),(705,2,49,1,'2025-10-07 19:15:40','2025-10-07 19:15:40'),(706,2,44,1,'2025-10-07 19:15:41','2025-10-07 19:15:41'),(707,1,50,1,'2025-11-13 16:29:06','2025-11-13 16:29:06'),(708,1,51,1,'2025-11-13 16:29:06','2025-11-13 16:29:06'),(709,1,52,1,'2025-11-13 16:29:06','2025-11-13 16:29:06'),(710,1,53,1,'2025-11-13 16:29:06','2025-11-13 16:29:06');
/*!40000 ALTER TABLE `permisos_rols` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `precios_unitarios`
--

DROP TABLE IF EXISTS `precios_unitarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `precios_unitarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `observaciones` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `id_concepto` int NOT NULL,
  `region` varchar(100) NOT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `precio_unitario` decimal(15,4) NOT NULL,
  `moneda` varchar(3) NOT NULL DEFAULT 'MXN',
  `costo_material` decimal(15,4) DEFAULT NULL,
  `costo_mano_obra` decimal(15,4) DEFAULT NULL,
  `costo_equipo` decimal(15,4) DEFAULT NULL,
  `costo_subcontrato` decimal(15,4) DEFAULT NULL,
  `costo_directo_total` decimal(15,4) NOT NULL,
  `factor_indirectos` decimal(5,2) NOT NULL DEFAULT '15.00',
  `factor_utilidad` decimal(5,2) NOT NULL DEFAULT '10.00',
  `factor_financiamiento` decimal(5,2) NOT NULL DEFAULT '3.00',
  `vigente_desde` date NOT NULL,
  `vigente_hasta` date DEFAULT NULL,
  `fuente_informacion` enum('cotizacion','mercado','historico','estimado','ajustado') NOT NULL DEFAULT 'cotizacion',
  `confiabilidad` enum('alta','media','baja') NOT NULL DEFAULT 'media',
  `numero_cotizaciones` int DEFAULT NULL,
  `proveedor_principal` varchar(200) DEFAULT NULL,
  `rendimiento_promedio` decimal(8,4) DEFAULT NULL,
  `rendimiento_minimo` decimal(8,4) DEFAULT NULL,
  `rendimiento_maximo` decimal(8,4) DEFAULT NULL,
  `estado` enum('borrador','pendiente','aprobado','rechazado','obsoleto') NOT NULL DEFAULT 'borrador',
  `condiciones_especiales` json DEFAULT NULL,
  `metadatos` json DEFAULT NULL,
  `version` int NOT NULL DEFAULT '1',
  `precio_base_id` int DEFAULT NULL,
  `elaborado_por` int NOT NULL,
  `aprobado_por` int DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `precios_unitarios_id_concepto_region_vigente_desde` (`id_concepto`,`region`,`vigente_desde`),
  KEY `precio_base_id` (`precio_base_id`),
  KEY `precios_unitarios_id_concepto` (`id_concepto`),
  KEY `precios_unitarios_region` (`region`),
  KEY `precios_unitarios_estado` (`estado`),
  KEY `precios_unitarios_vigente_desde` (`vigente_desde`),
  KEY `precios_unitarios_confiabilidad` (`confiabilidad`),
  CONSTRAINT `precios_unitarios_ibfk_1` FOREIGN KEY (`id_concepto`) REFERENCES `conceptos_obra` (`id_concepto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `precios_unitarios`
--

LOCK TABLES `precios_unitarios` WRITE;
/*!40000 ALTER TABLE `precios_unitarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `precios_unitarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `presupuestos`
--

DROP TABLE IF EXISTS `presupuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `presupuestos` (
  `id_presupuesto` int NOT NULL AUTO_INCREMENT,
  `id_proyecto` int NOT NULL,
  `id_categoria` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `mes` int DEFAULT NULL,
  `anio` int DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_presupuesto`),
  KEY `idx_presupuesto_proyecto` (`id_proyecto`),
  KEY `idx_presupuesto_categoria` (`id_categoria`),
  KEY `idx_presupuesto_periodo` (`anio`,`mes`),
  CONSTRAINT `presupuestos_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `presupuestos`
--

LOCK TABLES `presupuestos` WRITE;
/*!40000 ALTER TABLE `presupuestos` DISABLE KEYS */;
INSERT INTO `presupuestos` VALUES (3,1,1,0.00,0,0,'Presupuesto de construcción enero');
/*!40000 ALTER TABLE `presupuestos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `presupuestos_detalle`
--

DROP TABLE IF EXISTS `presupuestos_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `presupuestos_detalle` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_presupuesto` int NOT NULL,
  `id_concepto` int NOT NULL,
  `numero_partida` int NOT NULL,
  `codigo_partida` varchar(20) DEFAULT NULL,
  `descripcion_personalizada` text,
  `unidad` varchar(20) NOT NULL,
  `cantidad` decimal(12,4) NOT NULL,
  `precio_unitario` decimal(15,4) NOT NULL,
  `factor_rendimiento` decimal(8,4) NOT NULL DEFAULT '1.0000',
  `importe_subtotal` decimal(15,4) NOT NULL,
  `descuento_porcentaje` decimal(5,2) NOT NULL DEFAULT '0.00',
  `importe_descuento` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `importe_neto` decimal(15,4) NOT NULL,
  `notas` text,
  `incluir_en_cotizacion` tinyint(1) NOT NULL DEFAULT '1',
  `es_opcional` tinyint(1) NOT NULL DEFAULT '0',
  `grupo_partida` varchar(100) DEFAULT NULL,
  `orden_visualizacion` int NOT NULL,
  `estado_partida` enum('activa','pausada','completada','cancelada') NOT NULL DEFAULT 'activa',
  `metadatos` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_detalle`),
  UNIQUE KEY `presupuestos_detalle_id_presupuesto_numero_partida` (`id_presupuesto`,`numero_partida`),
  KEY `presupuestos_detalle_id_presupuesto` (`id_presupuesto`),
  KEY `presupuestos_detalle_id_concepto` (`id_concepto`),
  KEY `presupuestos_detalle_grupo_partida` (`grupo_partida`),
  KEY `presupuestos_detalle_orden_visualizacion` (`orden_visualizacion`),
  KEY `presupuestos_detalle_id_presupuesto_orden_visualizacion` (`id_presupuesto`,`orden_visualizacion`),
  CONSTRAINT `presupuestos_detalle_ibfk_1` FOREIGN KEY (`id_presupuesto`) REFERENCES `presupuestos` (`id_presupuesto`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `presupuestos_detalle_ibfk_2` FOREIGN KEY (`id_concepto`) REFERENCES `conceptos_obra` (`id_concepto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `presupuestos_detalle`
--

LOCK TABLES `presupuestos_detalle` WRITE;
/*!40000 ALTER TABLE `presupuestos_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `presupuestos_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL COMMENT 'Nombre del proveedor',
  `rfc` varchar(13) DEFAULT NULL COMMENT 'RFC del proveedor',
  `razon_social` varchar(150) DEFAULT NULL COMMENT 'Razón social completa',
  `telefono` varchar(100) DEFAULT NULL COMMENT 'Teléfonos de contacto (separados por comas si son múltiples)',
  `email` varchar(100) DEFAULT NULL COMMENT 'Email de contacto',
  `direccion` text COMMENT 'Dirección fiscal',
  `contacto_principal` varchar(100) DEFAULT NULL COMMENT 'Nombre del contacto principal',
  `tipo_proveedor` enum('MATERIALES','SERVICIOS','EQUIPOS','MIXTO','TRANSPORTE','CONSTRUCCION','MANTENIMIENTO','CONSULTORIA','SUBCONTRATISTA','HERRAMIENTAS','COMBUSTIBLE','ALIMENTACION') DEFAULT 'SERVICIOS',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Estado del proveedor',
  `observaciones` text COMMENT 'Observaciones adicionales',
  `banco` varchar(100) DEFAULT NULL COMMENT 'Nombre del banco del proveedor',
  `cuentaBancaria` varchar(18) DEFAULT NULL COMMENT 'Número de cuenta bancaria o CLABE',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `proveedores_nombre` (`nombre`),
  KEY `proveedores_activo` (`activo`),
  KEY `proveedores_tipo_proveedor` (`tipo_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,'ARGOS',NULL,NULL,NULL,NULL,NULL,NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-08-21 21:03:20','2025-09-10 19:12:03'),(2,'CEMEX',NULL,'Cemex, S.A.B. de C.V.','33-1234-5678','ventas@cemex.com',NULL,NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-08-21 21:03:30','2025-09-10 17:58:14'),(3,'PADILLAS',NULL,NULL,'3316577107',NULL,NULL,NULL,'MIXTO',1,NULL,NULL,NULL,'2025-08-22 18:16:53','2025-09-12 17:12:38'),(4,'CONCRETOS MAC-COY','VIAM750103Q29',NULL,'3336915912','concretosmac-coy@hotmail.com','Carretera libre a Zapotlanejo 2538 Colonia Paseos del Valle Tonalá, Jal. C.P 45428',NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-08-25 16:54:22','2025-09-15 17:35:55'),(5,'Prueba',NULL,NULL,NULL,NULL,NULL,NULL,'MIXTO',1,NULL,NULL,NULL,'2025-08-28 19:57:48','2025-09-11 18:58:48'),(10,'CONAC','CAC020207PZ6',NULL,'3336282676','conac@hotmail.com','Volcan Popocatepetl #6713 El Colli C.P 45070 Zapopan, Jalisco',NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-09-10 16:44:05','2025-09-15 17:35:48'),(11,'Genérico',NULL,NULL,'1234567890',NULL,NULL,NULL,'MIXTO',1,NULL,NULL,NULL,'2025-09-12 17:33:48','2025-09-12 17:33:48'),(12,'GRUPO FERREABASTECEDORA','FIN020708AT7',NULL,'3336503633',NULL,'RIO BALSAS 1483 QUINTA VELARDE, GUADALAJARA GUADALAJARA, JALISCO CP: 44430',NULL,'MIXTO',1,NULL,NULL,NULL,'2025-09-12 17:40:36','2025-09-12 17:40:36'),(13,'MAPEVI',NULL,NULL,'1234567890',NULL,NULL,NULL,'MIXTO',1,NULL,NULL,NULL,'2025-09-12 17:45:04','2025-09-12 17:45:04'),(14,'HARMAK PACIFICO',NULL,NULL,'1234567890',NULL,'Carretera Monterrey Colombia 500 66054 PUERTA DEL NORTE RESIDENCIAL General Escobedo, NLE México',NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-09-12 17:59:15','2025-09-12 17:59:15'),(15,'MADERAS TARAHUMARA','MTA9207276P8',NULL,'3336891373',NULL,'AV. DE LA SOLIDARIDAD IBEROAMERICANA # 5555 Las Pintas El Salto Jalisco 45690 México',NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-09-12 20:21:51','2025-09-12 20:21:51'),(16,'GLOBAL NETS',NULL,NULL,'3331226822',NULL,NULL,NULL,'CONSTRUCCION',1,NULL,NULL,NULL,'2025-09-12 20:31:23','2025-09-12 20:31:23'),(17,'DUREZA',NULL,NULL,'1234567890',NULL,NULL,NULL,'CONSTRUCCION',1,NULL,NULL,NULL,'2025-09-12 20:35:43','2025-09-12 20:35:43'),(18,'FERRETERIA DIEGO',NULL,NULL,'1234567890',NULL,NULL,NULL,'MIXTO',1,NULL,NULL,NULL,'2025-09-12 20:38:23','2025-09-12 20:38:23'),(19,'THE HOME DEPOT',NULL,NULL,'3331623500',NULL,NULL,NULL,'MIXTO',1,NULL,NULL,NULL,'2025-09-12 20:54:36','2025-09-12 20:54:36'),(20,'GRUPO NAPRESA','GNA940328AV5',NULL,'3331448180 , 3331448184',NULL,'Av. Lázaro Cárdenas 4135 A y B. Col. Jardines de San Ignacio. CP: 45040',NULL,'MIXTO',1,NULL,NULL,NULL,'2025-09-13 17:22:45','2025-09-13 17:22:45'),(21,'CONTRULIV CONSTRUCCIONES Y REMODELACIONES LIGERAS RUIZ','RUGJ691006P48',NULL,'1234567890',NULL,NULL,'MARIA DE JESUS RUIZ GUTIERREZ','MIXTO',1,NULL,NULL,NULL,'2025-09-13 17:32:49','2025-09-13 17:32:49'),(22,'Mercado Libre',NULL,NULL,'1234567890',NULL,NULL,NULL,'MIXTO',1,NULL,NULL,NULL,'2025-09-13 17:47:31','2025-09-13 17:47:31'),(23,'MADERAS Y COMPLEMENTOS EL PINO','MCP900125D48',NULL,'3336502970, 3336891041',NULL,'MAR MEDITERRANEO 1255, COUNTRY CLUB C.P. 44610 GUADALAJARA, Jalisco',NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-09-13 18:17:04','2025-09-13 18:17:04'),(24,'MARMOLINAS INTEGRALES DE JALISCO','MIJ970917FQ7',NULL,'3336700672','adhemex@hotmail.com',NULL,NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-09-13 18:48:41','2025-09-13 18:48:41'),(25,'PROA - CONSTRUCCIONES',NULL,NULL,'3338354393','contacto@proaconstrucciones.com.mx',NULL,NULL,'MIXTO',1,NULL,NULL,NULL,'2025-09-13 19:04:12','2025-09-13 19:04:12'),(26,'Almacen \"La Meza\"',NULL,NULL,'1234567890',NULL,NULL,NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-09-15 20:37:39','2025-09-15 20:37:39'),(27,'RECMA, RENTA Y VENTA DE ANDAMIOS Y CIMBRA',NULL,NULL,'1234567890',NULL,NULL,NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-09-18 18:58:04','2025-09-18 18:58:04'),(28,'PEC SILLETAS Y ESPACIADORES',NULL,NULL,'1234567890',NULL,NULL,NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-09-18 20:12:17','2025-09-18 20:12:17'),(29,'DURITIAM','ROFA8311285M5',NULL,'3336596644',NULL,'Frailes No.34. Colonia La Duraznera. Tlaquepaque. Jalisco. Mexico. C.P. 45580','ADLAI FRANCISCO ROBLES FARIAS','MATERIALES',1,NULL,NULL,NULL,'2025-09-18 21:22:48','2025-09-18 21:22:48'),(30,'Cadys Maquinaria Ligera',NULL,NULL,'3319185255',NULL,'Circunvalación Poniente No. 612, Colonia Ciudad Granja. C.P 45010, Zapopan, Jalisco',NULL,'EQUIPOS',1,NULL,NULL,NULL,'2025-09-23 16:15:28','2025-09-23 16:15:28'),(31,'FERREABASTECEDA INDUSTRIAL SA DE CV \"TRUPER\"','FIN020708AT7',NULL,'3328412792, 3336503633','ferreabastecedora@hotmail.com',NULL,'Lupita','SERVICIOS',1,NULL,NULL,NULL,'2025-09-26 18:39:19','2025-09-26 18:43:53'),(32,'RECKA - RENTA DE CIMBRA Y MAQUINARIA',NULL,NULL,'3336282676',NULL,NULL,NULL,'SERVICIOS',1,NULL,NULL,NULL,'2025-10-09 19:20:50','2025-10-09 19:20:50'),(33,'IMSS',NULL,NULL,'3323254350',NULL,NULL,NULL,'SERVICIOS',1,NULL,NULL,NULL,'2025-11-03 20:45:58','2025-11-03 20:45:58'),(34,'SAT SERVICIO DE ADMINISTRACION TRIBUTARIA',NULL,NULL,'3333333333',NULL,NULL,NULL,'SERVICIOS',1,NULL,NULL,NULL,'2025-11-03 20:52:14','2025-11-03 20:52:14'),(35,'GASOLINERA SAN GERARDO','GSG110301EK3',NULL,'3333333333333333333',NULL,NULL,NULL,'COMBUSTIBLE',1,NULL,NULL,NULL,'2025-11-07 20:35:24','2025-11-07 20:35:24');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proyectos`
--

DROP TABLE IF EXISTS `proyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proyectos` (
  `id_proyecto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('Activo','Pausado','Finalizado') DEFAULT 'Activo',
  `responsable` varchar(100) DEFAULT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `cliente_nombre` varchar(150) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `presupuesto` decimal(12,2) DEFAULT NULL,
  `notas` text,
  PRIMARY KEY (`id_proyecto`),
  KEY `idx_proyectos_estado` (`estado`),
  KEY `idx_proyectos_fecha` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_proyectos_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proyectos`
--

LOCK TABLES `proyectos` WRITE;
/*!40000 ALTER TABLE `proyectos` DISABLE KEYS */;
INSERT INTO `proyectos` VALUES (1,'FLEX PARK','CONSTRUCCIÓN DE NAVE INDUSTRIAL \"W\" Flex Park. Salto, Jalisco','2025-01-01','2025-09-30','Activo','Juan Pérez','BODEGA W EL SALTO, JALISCO','ALLIUZ','Industrial','Estructuras',0.00,NULL),(2,'DUKE','Remodelación','2025-01-30',NULL,'Activo','Jonathan Orozco','Guadalajara, Jalisco',NULL,NULL,NULL,NULL,NULL),(4,'SAN MARCOS','Remodelación de Casa','2025-10-13',NULL,'Activo','Ing. Jonathan Orozco','Guadalajara, Jalisco',NULL,NULL,NULL,NULL,NULL),(6,'Almacén Principal','Almacén secundario de herramientas','2025-10-11',NULL,'Activo','Encargado de Almacén','Almacén Principal - Área de Almacenamiento',NULL,NULL,NULL,NULL,NULL),(7,'Bodega Central','Ubicación principal de herramientas y equipos','2025-10-11',NULL,'Activo','Administrador de Bodega','Bodega Central - Estante Principal',NULL,NULL,NULL,NULL,NULL),(8,'Oficina Principal','Herramientas y equipos en oficina','2025-10-11',NULL,'Activo','Administrador de Oficina','Oficina Principal - Área de Trabajo',NULL,NULL,NULL,NULL,NULL),(9,'OFICINAS CHATARRERAS','Construcción de oficinas','2025-02-01',NULL,'Activo','Ana Torres','RIO SECO, TLAQUEPAQUE, JALISCO',NULL,NULL,NULL,NULL,NULL),(11,'Taller de Reparaciones','Área de mantenimiento y reparación de herramientas','2025-10-11',NULL,'Activo','Técnico de Mantenimiento','Taller de Reparaciones - Mesa de Trabajo',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `proyectos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes_generados`
--

DROP TABLE IF EXISTS `reportes_generados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes_generados` (
  `id_reporte` int NOT NULL AUTO_INCREMENT,
  `tipo_reporte` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `parametros` json DEFAULT NULL,
  `fecha_generacion` datetime NOT NULL,
  `ruta_archivo` varchar(255) DEFAULT NULL,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `idx_reportes_tipo` (`tipo_reporte`),
  KEY `idx_reportes_usuario` (`id_usuario`),
  KEY `idx_reportes_fecha` (`fecha_generacion`),
  CONSTRAINT `reportes_generados_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes_generados`
--

LOCK TABLES `reportes_generados` WRITE;
/*!40000 ALTER TABLE `reportes_generados` DISABLE KEYS */;
/*!40000 ALTER TABLE `reportes_generados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_roles_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','Control total del sistema','2025-08-18 16:00:59','2025-08-18 16:00:59'),(2,'Usuario','Usuario con acceso limitado','2025-08-18 16:00:59','2025-08-18 16:00:59');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `semanas_nomina`
--

DROP TABLE IF EXISTS `semanas_nomina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semanas_nomina` (
  `id_semana` int NOT NULL AUTO_INCREMENT,
  `anio` int NOT NULL,
  `semana_iso` int NOT NULL,
  `etiqueta` varchar(50) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('Borrador','En_Proceso','Cerrada') DEFAULT 'Borrador',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_semana`),
  UNIQUE KEY `unique_semana_anio` (`anio`,`semana_iso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semanas_nomina`
--

LOCK TABLES `semanas_nomina` WRITE;
/*!40000 ALTER TABLE `semanas_nomina` DISABLE KEYS */;
/*!40000 ALTER TABLE `semanas_nomina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `semanas_nominas`
--

DROP TABLE IF EXISTS `semanas_nominas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semanas_nominas` (
  `id_semana` int NOT NULL AUTO_INCREMENT,
  `anio` int NOT NULL,
  `semana_iso` int NOT NULL,
  `etiqueta` varchar(50) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('Borrador','En_Proceso','Cerrada') DEFAULT 'Borrador',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_semana`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semanas_nominas`
--

LOCK TABLES `semanas_nominas` WRITE;
/*!40000 ALTER TABLE `semanas_nominas` DISABLE KEYS */;
INSERT INTO `semanas_nominas` VALUES (1,2025,1,'Semana ISO 1 - diciembre/enero 2025','2024-12-30','2025-01-05','Borrador','2025-10-25 16:49:33','2025-10-25 16:49:33'),(2,2025,2,'Semana ISO 2 - enero 2025','2025-01-06','2025-01-12','Borrador','2025-10-25 16:49:33','2025-10-25 16:49:33'),(3,2025,3,'Semana ISO 3 - enero 2025','2025-01-13','2025-01-19','Borrador','2025-10-25 16:49:33','2025-10-25 16:49:33'),(4,2025,4,'Semana ISO 4 - enero 2025','2025-01-20','2025-01-26','Borrador','2025-10-25 16:49:33','2025-10-25 16:49:33'),(5,2025,5,'Semana ISO 5 - enero/febrero 2025','2025-01-27','2025-02-02','Borrador','2025-10-25 16:49:33','2025-10-25 16:49:33'),(6,2025,6,'Semana ISO 6 - febrero 2025','2025-02-03','2025-02-09','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(7,2025,7,'Semana ISO 7 - febrero 2025','2025-02-10','2025-02-16','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(8,2025,8,'Semana ISO 8 - febrero 2025','2025-02-17','2025-02-23','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(9,2025,9,'Semana ISO 9 - febrero/marzo 2025','2025-02-24','2025-03-02','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(10,2025,10,'Semana ISO 10 - marzo 2025','2025-03-03','2025-03-09','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(11,2025,11,'Semana ISO 11 - marzo 2025','2025-03-10','2025-03-16','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(12,2025,12,'Semana ISO 12 - marzo 2025','2025-03-17','2025-03-23','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(13,2025,13,'Semana ISO 13 - marzo 2025','2025-03-24','2025-03-30','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(14,2025,14,'Semana ISO 14 - marzo/abril 2025','2025-03-31','2025-04-06','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(15,2025,15,'Semana ISO 15 - abril 2025','2025-04-07','2025-04-13','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(16,2025,16,'Semana ISO 16 - abril 2025','2025-04-14','2025-04-20','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(17,2025,17,'Semana ISO 17 - abril 2025','2025-04-21','2025-04-27','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(18,2025,18,'Semana ISO 18 - abril/mayo 2025','2025-04-28','2025-05-04','Borrador','2025-10-25 16:49:34','2025-10-25 16:49:34'),(19,2025,19,'Semana ISO 19 - mayo 2025','2025-05-05','2025-05-11','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(20,2025,20,'Semana ISO 20 - mayo 2025','2025-05-12','2025-05-18','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(21,2025,21,'Semana ISO 21 - mayo 2025','2025-05-19','2025-05-25','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(22,2025,22,'Semana ISO 22 - mayo/junio 2025','2025-05-26','2025-06-01','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(23,2025,23,'Semana ISO 23 - junio 2025','2025-06-02','2025-06-08','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(24,2025,24,'Semana ISO 24 - junio 2025','2025-06-09','2025-06-15','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(25,2025,25,'Semana ISO 25 - junio 2025','2025-06-16','2025-06-22','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(26,2025,26,'Semana ISO 26 - junio 2025','2025-06-23','2025-06-29','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(27,2025,27,'Semana ISO 27 - junio/julio 2025','2025-06-30','2025-07-06','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(28,2025,28,'Semana ISO 28 - julio 2025','2025-07-07','2025-07-13','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(29,2025,29,'Semana ISO 29 - julio 2025','2025-07-14','2025-07-20','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(30,2025,30,'Semana ISO 30 - julio 2025','2025-07-21','2025-07-27','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(31,2025,31,'Semana ISO 31 - julio/agosto 2025','2025-07-28','2025-08-03','Borrador','2025-10-25 16:49:35','2025-10-25 16:49:35'),(32,2025,32,'Semana ISO 32 - agosto 2025','2025-08-04','2025-08-10','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(33,2025,33,'Semana ISO 33 - agosto 2025','2025-08-11','2025-08-17','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(34,2025,34,'Semana ISO 34 - agosto 2025','2025-08-18','2025-08-24','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(35,2025,35,'Semana ISO 35 - agosto 2025','2025-08-25','2025-08-31','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(36,2025,36,'Semana ISO 36 - septiembre 2025','2025-09-01','2025-09-07','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(37,2025,37,'Semana ISO 37 - septiembre 2025','2025-09-08','2025-09-14','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(38,2025,38,'Semana ISO 38 - septiembre 2025','2025-09-15','2025-09-21','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(39,2025,39,'Semana ISO 39 - septiembre 2025','2025-09-22','2025-09-28','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(40,2025,40,'Semana ISO 40 - septiembre/octubre 2025','2025-09-29','2025-10-05','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(41,2025,41,'Semana ISO 41 - octubre 2025','2025-10-06','2025-10-12','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(42,2025,42,'Semana ISO 42 - octubre 2025','2025-10-13','2025-10-19','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(43,2025,43,'Semana ISO 43 - octubre 2025','2025-10-20','2025-10-26','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(44,2025,44,'Semana ISO 44 - octubre/noviembre 2025','2025-10-27','2025-11-02','Borrador','2025-10-25 16:49:36','2025-10-25 16:49:36'),(45,2025,45,'Semana ISO 45 - noviembre 2025','2025-11-03','2025-11-09','Borrador','2025-10-25 16:49:37','2025-10-25 16:49:37'),(46,2025,46,'Semana ISO 46 - noviembre 2025','2025-11-10','2025-11-16','Borrador','2025-10-25 16:49:37','2025-10-25 16:49:37'),(47,2025,47,'Semana ISO 47 - noviembre 2025','2025-11-17','2025-11-23','Borrador','2025-10-25 16:49:37','2025-10-25 16:49:37'),(48,2025,48,'Semana ISO 48 - noviembre 2025','2025-11-24','2025-11-30','Borrador','2025-10-25 16:49:37','2025-10-25 16:49:37'),(49,2025,49,'Semana ISO 49 - diciembre 2025','2025-12-01','2025-12-07','Borrador','2025-10-25 16:49:37','2025-10-25 16:49:37'),(50,2025,50,'Semana ISO 50 - diciembre 2025','2025-12-08','2025-12-14','Borrador','2025-10-25 16:49:37','2025-10-25 16:49:37'),(51,2025,51,'Semana ISO 51 - diciembre 2025','2025-12-15','2025-12-21','Borrador','2025-10-25 16:49:37','2025-10-25 16:49:37'),(52,2025,52,'Semana ISO 52 - diciembre 2025','2025-12-22','2025-12-28','Borrador','2025-10-25 16:49:37','2025-10-25 16:49:37'),(53,2026,1,'Semana ISO 1 - diciembre/enero 2026','2025-12-29','2026-01-04','Borrador','2025-10-25 16:49:37','2025-10-25 16:49:37');
/*!40000 ALTER TABLE `semanas_nominas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suministros`
--

DROP TABLE IF EXISTS `suministros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suministros` (
  `id_suministro` int NOT NULL AUTO_INCREMENT,
  `id_proyecto` int NOT NULL,
  `id_proveedor` int NOT NULL COMMENT 'ID del proveedor (relación con tabla proveedores)',
  `folio` varchar(100) DEFAULT NULL COMMENT 'Folio del suministro que aparece en el recibo',
  `fecha` date NOT NULL,
  `tipo_suministro` enum('Material','Herramienta','Equipo Ligero','Acero','Cimbra','Ferretería','Servicio','Consumible','Maquinaria','Concreto') DEFAULT 'Material',
  `id_categoria_suministro` int DEFAULT NULL,
  `nombre` varchar(255) NOT NULL COMMENT 'Nombre del suministro',
  `codigo_producto` varchar(100) DEFAULT NULL COMMENT 'SKU o código interno del producto',
  `descripcion_detallada` text COMMENT 'Descripción detallada del suministro',
  `cantidad` decimal(10,3) DEFAULT '0.000' COMMENT 'Cantidad del suministro',
  `salida_obra` time DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT '0.00' COMMENT 'Precio por unidad de medida',
  `costo_total` decimal(12,2) DEFAULT '0.00' COMMENT 'Costo total del suministro',
  `observaciones` text COMMENT 'Observaciones adicionales',
  `estado` enum('Solicitado','Aprobado','Pedido','En_Transito','Entregado','Cancelado') DEFAULT 'Solicitado',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `id_recibo` int DEFAULT NULL,
  `es_legacy` tinyint(1) DEFAULT '0' COMMENT 'Identifica si es un registro anterior a la implementación de recibos',
  `subtotal_producto` decimal(12,2) DEFAULT '0.00' COMMENT 'Subtotal de este producto específico en el recibo',
  `include_iva` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Indica si el costo_total incluye IVA',
  `metodo_pago` enum('Efectivo','Transferencia','Cheque','Tarjeta','Cuenta Fiscal') DEFAULT 'Efectivo' COMMENT 'Método de pago utilizado',
  `subtotal` decimal(12,2) DEFAULT '0.00' COMMENT 'Subtotal del suministro (antes de IVA)',
  `observaciones_finales` text COMMENT 'Observaciones finales después de la entrega',
  `id_unidad_medida` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_suministro`),
  KEY `suministros_id_proyecto` (`id_proyecto`),
  KEY `suministros_fecha` (`fecha`),
  KEY `suministros_tipo_suministro` (`tipo_suministro`),
  KEY `idx_id_proveedor` (`id_proveedor`),
  KEY `idx_suministros_codigo_producto` (`codigo_producto`),
  KEY `idx_suministros_nombre` (`nombre`),
  KEY `idx_suministros_recibo` (`id_recibo`),
  KEY `idx_suministros_legacy` (`es_legacy`),
  KEY `suministros_id_recibo` (`id_recibo`),
  KEY `suministros_es_legacy` (`es_legacy`),
  KEY `suministros_id_proveedor` (`id_proveedor`),
  KEY `idx_suministros_folio` (`folio`),
  KEY `suministros_folio` (`folio`),
  KEY `idx_categoria_suministro` (`id_categoria_suministro`),
  KEY `suministros_id_categoria_suministro` (`id_categoria_suministro`),
  KEY `idx_suministros_unidad_medida` (`id_unidad_medida`),
  KEY `idx_suministros_categoria` (`id_categoria_suministro`),
  KEY `fk_suministros_unidad_medida` (`id_unidad_medida`),
  CONSTRAINT `fk_suministros_unidad_medida` FOREIGN KEY (`id_unidad_medida`) REFERENCES `unidades_medida` (`id_unidad`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `suministros_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`),
  CONSTRAINT `suministros_ibfk_2` FOREIGN KEY (`id_recibo`) REFERENCES `recibos` (`id_recibo`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=375 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suministros`
--

LOCK TABLES `suministros` WRITE;
/*!40000 ALTER TABLE `suministros` DISABLE KEYS */;
INSERT INTO `suministros` VALUES (7,1,3,'62289','2025-07-15','Material',1,'Grava 1 1/2','','',30.000,NULL,433.33,NULL,'','Entregado','2025-08-25 18:30:02','2025-08-25 18:30:02',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(8,1,3,'62322','2025-07-11','Material',1,'Grava 1 1/2','','',30.000,NULL,433.33,NULL,'','Entregado','2025-08-25 18:38:01','2025-08-25 18:38:01',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(9,1,3,'62321','2025-07-11','Material',1,'Grava 1 1/2','','',30.000,NULL,433.33,NULL,'','Entregado','2025-08-25 18:41:03','2025-08-25 18:41:03',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(10,1,3,'62137','2025-07-16','Material',1,'Arena de Río','','',7.000,NULL,228.57,NULL,'','Entregado','2025-08-25 19:02:47','2025-08-25 19:02:47',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(11,1,3,'62136','2025-07-16','Material',1,'Grava 3/4','','',7.000,NULL,442.86,NULL,'','Entregado','2025-08-25 19:04:30','2025-08-25 19:04:30',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(12,1,3,'65713','2025-08-05','Material',1,'Tepetate','','',35.000,NULL,185.71,NULL,'','Entregado','2025-08-25 19:05:40','2025-08-25 19:05:40',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(13,1,3,'65765','2025-08-07','Material',1,'Tepetate','','',35.000,NULL,185.71,NULL,'','Entregado','2025-08-25 19:07:20','2025-08-25 19:07:20',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(14,1,3,'62144','2025-07-17','Material',1,'Grava 3/4','','',7.000,NULL,442.86,NULL,'','Entregado','2025-08-25 19:24:26','2025-08-25 19:24:26',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(15,1,3,'62143','2025-07-17','Material',1,'Arena de RIo','','',7.000,NULL,228.57,NULL,'','Entregado','2025-08-25 19:25:35','2025-08-25 19:25:35',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(16,1,3,'65217','2025-08-19','Material',1,'Tepetate','','',35.000,NULL,185.71,7539.83,'','Entregado','2025-08-25 19:27:28','2025-09-01 17:27:30',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(17,1,3,'65216','2025-08-19','Material',1,'Tepetate','','',35.000,NULL,185.71,7539.83,'','Entregado','2025-08-25 19:29:26','2025-09-01 17:27:34',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(18,1,3,'65953','2025-08-15','Material',1,'Tepetate','','',30.000,NULL,185.71,NULL,'','Entregado','2025-08-25 19:40:19','2025-08-25 19:40:19',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(19,1,3,'65214','2025-08-18','Material',1,'Tepetate','','',35.000,NULL,185.71,NULL,'','Entregado','2025-08-25 19:41:00','2025-08-25 19:41:00',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(20,1,3,'65215','2025-08-18','Material',1,'Tepetate','','',35.000,NULL,185.71,NULL,'','Entregado','2025-08-25 19:42:02','2025-08-25 19:42:02',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(21,1,3,'65639','2025-08-08','Material',1,'Grava 1 1/2','','',30.000,NULL,433.33,NULL,'','Entregado','2025-08-25 19:43:04','2025-08-25 19:43:13',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(22,1,3,'65770','2025-08-08','Material',1,'Grava 1 1/2','','',30.000,NULL,433.33,NULL,'','Entregado','2025-08-25 19:44:02','2025-08-25 19:44:02',NULL,1,0.00,1,'Efectivo',0.00,NULL,11),(23,1,3,'37108','2025-07-26','Maquinaria',7,'Retroexcavadora','425F','',4.000,NULL,520.75,NULL,'','Entregado','2025-08-25 20:12:22','2025-08-25 20:12:22',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(24,1,3,'37107','2025-07-25','Maquinaria',7,'Retroexcavadora','425F','',6.000,NULL,520.75,NULL,'','Entregado','2025-08-25 20:58:49','2025-08-25 20:58:49',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(25,1,3,'37106','2025-07-24','Maquinaria',7,'Retroexcavadora','','Excavación y movimiento de material',8.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:08:17','2025-08-25 21:08:17',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(26,1,3,'37105','2025-07-23','Maquinaria',7,'Retroexcavadora','','Excavación y movimiento de material ',8.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:09:25','2025-08-25 21:09:25',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(27,1,3,'37104','2025-07-22','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',8.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:11:23','2025-08-25 21:16:13',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(28,1,3,'37103','2025-07-21','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',8.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:19:35','2025-08-25 21:19:35',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(29,1,3,'37946','2025-07-14','Material',1,'Retroexcavadora','425F','Excavación y movimiento de material',4.500,NULL,520.75,NULL,'','Entregado','2025-08-25 21:21:35','2025-08-25 21:21:35',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(30,1,3,'37947','2025-07-15','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',8.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:23:45','2025-08-25 21:23:45',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(31,1,3,'37948','2025-07-16','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',8.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:26:03','2025-08-25 21:26:03',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(32,1,3,'37949','2025-07-17','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',8.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:27:06','2025-08-25 21:27:06',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(33,1,3,'37101','2025-07-18','Maquinaria',7,'Retroexcavadora ','425F','Excavación y movimiento de material',8.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:28:36','2025-08-25 21:28:36',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(34,1,3,'37102','2025-07-19','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',4.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:31:01','2025-08-25 21:31:01',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(35,1,3,'37115','2025-08-02','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',5.000,NULL,520.75,2603.75,'','Entregado','2025-08-25 21:31:52','2025-09-12 18:01:35',NULL,1,0.00,0,'Efectivo',2603.75,NULL,29),(36,1,3,'37110','2025-07-30','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',9.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:32:48','2025-08-25 21:32:48',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(37,1,3,'37111','2025-07-31','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',9.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:34:27','2025-08-25 21:34:27',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(38,1,3,'37121','2025-08-09','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',5.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:35:58','2025-08-25 21:36:05',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(39,1,3,'37122','2025-08-11','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',9.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:37:09','2025-08-25 21:37:09',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(40,1,3,'37124','2025-08-13','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',9.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:38:57','2025-08-25 21:38:57',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(41,1,3,'37116','2025-08-04','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',9.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:39:51','2025-08-25 21:39:51',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(42,1,3,'37117','2025-08-05','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',9.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:40:41','2025-08-25 21:40:41',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(43,1,3,'37118','2025-08-06','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',9.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:41:32','2025-08-25 21:41:32',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(44,1,3,'37119','2025-08-07','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',9.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:42:25','2025-08-25 21:42:25',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(45,1,3,'37120','2025-08-08','Maquinaria',7,'Retroexcavadora','425F','Excavación y movimiento de material',9.000,NULL,520.75,NULL,'','Entregado','2025-08-25 21:43:15','2025-08-25 21:43:15',NULL,1,0.00,1,'Efectivo',0.00,NULL,29),(122,1,3,'34535','2025-08-18','Maquinaria',7,'Mini Rodillo','','',9.000,NULL,1.00,9.00,'','Entregado','2025-08-30 21:39:44','2025-08-30 21:39:44',NULL,0,0.00,0,'Efectivo',0.00,NULL,29),(131,1,3,'65974','2025-08-25','Material',1,'Tepetate','','',35.000,NULL,185.71,6499.85,'','Entregado','2025-09-01 20:11:35','2025-09-01 20:14:47',NULL,0,0.00,0,'Efectivo',0.00,NULL,11),(133,1,3,'65969','2025-08-22','Material',1,'Tepetate','','',35.000,NULL,185.71,6499.85,'','Entregado','2025-09-01 20:16:58','2025-09-01 20:16:58',NULL,0,0.00,0,'Efectivo',0.00,NULL,11),(134,1,3,'65975','2025-08-25','Material',1,'Tepetate','','',35.000,NULL,185.71,6499.85,'','Entregado','2025-09-01 20:18:07','2025-09-01 20:18:07',NULL,0,0.00,0,'Efectivo',0.00,NULL,11),(137,1,3,'34536','2025-08-19','Maquinaria',7,'Mini Rodillo','','',9.000,NULL,1.00,9.00,'','Entregado','2025-09-01 20:23:01','2025-09-01 20:23:01',NULL,0,0.00,0,'Efectivo',0.00,NULL,29),(138,1,10,'4489','2025-08-22','Cimbra',5,'Duela Metálica 3.00 mts','','',1416.000,NULL,16.50,27102.24,'Devolución de Equipo','Entregado','2025-09-01 20:28:32','2025-09-12 17:23:19',NULL,0,0.00,1,'Efectivo',23364.00,NULL,19),(139,1,10,'4489','2025-08-22','Cimbra',5,'Puntal Metálico 2-4 mts. C/R','','',150.000,NULL,30.00,5220.00,'Devolución de Equipo','Entregado','2025-09-01 20:28:32','2025-09-12 17:23:19',NULL,0,0.00,1,'Efectivo',4500.00,NULL,19),(149,1,3,'65233','2025-08-28','Material',1,'Tepetate','','',35.000,NULL,185.71,6499.85,'','Entregado','2025-09-12 17:06:54','2025-09-12 17:06:54',NULL,0,0.00,0,'Efectivo',6499.85,NULL,11),(150,1,10,'4489','2025-08-22','Servicio',9,'Servicio de manejo de materiales','','',2.000,NULL,400.00,928.00,'Devolución de Equipo','Entregado','2025-09-12 17:23:19','2025-09-12 17:23:19',NULL,0,0.00,1,'Efectivo',800.00,NULL,19),(151,1,11,'0000','2025-09-12','Material',1,'Viaje de Escombro','','',1.000,NULL,14000.00,14000.00,'','Entregado','2025-09-12 17:35:48','2025-09-12 17:50:14',NULL,0,0.00,0,'Efectivo',14000.00,NULL,36),(153,1,13,'pend1','2025-07-12','Material',1,'Clavos del 4','','',4.000,NULL,60.00,278.40,'','Entregado','2025-09-12 17:49:59','2025-09-12 17:49:59',NULL,0,0.00,1,'Efectivo',240.00,NULL,15),(154,1,3,'37812','2025-09-08','Maquinaria',7,'Retroexcavadora','425F','',9.000,NULL,520.75,4686.75,'','Entregado','2025-09-12 18:01:01','2025-09-12 18:01:01',NULL,0,0.00,0,'Efectivo',4686.75,NULL,29),(155,1,3,'37810','2025-09-05','Maquinaria',7,'Retroexcavadora','425F','',9.000,NULL,520.75,4686.75,'Movimiento de material','Entregado','2025-09-12 18:04:13','2025-09-12 18:04:13',NULL,0,0.00,0,'Efectivo',4686.75,NULL,29),(156,1,3,'37811','2025-09-06','Maquinaria',7,'Retroexcavadora','425F','',5.000,NULL,520.75,2603.75,'Movimiento de material ','Entregado','2025-09-12 18:05:08','2025-09-12 18:05:08',NULL,0,0.00,0,'Efectivo',2603.75,NULL,29),(157,1,3,'35550','2025-08-27','Maquinaria',7,'Retroexcavadora','425F','',9.000,NULL,520.75,4686.75,'Excavación y Movimiento de material ','Entregado','2025-09-12 18:06:19','2025-09-12 18:06:19',NULL,0,0.00,0,'Efectivo',4686.75,NULL,29),(158,1,3,'37808','2025-09-03','Maquinaria',7,'Retroexcavadora','425F','',3.000,NULL,520.75,1562.25,'Movimiento de material ','Entregado','2025-09-12 18:07:09','2025-09-12 18:07:09',NULL,0,0.00,0,'Efectivo',1562.25,NULL,29),(159,1,3,'37809','2025-09-09','Maquinaria',7,'Retroexcavadora','425F','',8.990,NULL,520.75,4681.54,'Movimiento de material ','Entregado','2025-09-12 18:07:58','2025-09-12 18:07:58',NULL,0,0.00,0,'Efectivo',4681.54,NULL,29),(160,1,3,'35548','2025-09-12','Maquinaria',7,'Retroexcavadora','425F','',7.000,NULL,520.75,3645.25,'Excavación y Movimiento de material ','Entregado','2025-09-12 18:08:50','2025-09-12 18:08:50',NULL,0,0.00,0,'Efectivo',3645.25,NULL,29),(161,1,3,'35549','2025-08-26','Maquinaria',7,'Retroexcavadora','425F','',8.990,NULL,520.75,4681.54,'Excavación y Movimiento de material ','Entregado','2025-09-12 18:10:15','2025-09-12 18:10:15',NULL,0,0.00,0,'Efectivo',4681.54,NULL,29),(162,1,3,'36897','2025-08-19','Maquinaria',7,'Retroexcavadora','425F','',8.970,NULL,520.75,4671.13,'Movimiento de material ','Entregado','2025-09-12 18:11:54','2025-09-12 18:11:54',NULL,0,0.00,0,'Efectivo',4671.13,NULL,29),(163,1,3,'36898','2025-08-20','Maquinaria',7,'Retroexcavadora','425F','de 4 a 6 de la tarde - Paro por que la llanta que parcharon se le despego el parche ',7.000,NULL,520.75,3645.25,'Excavación y Movimiento de material ','Entregado','2025-09-12 18:13:50','2025-09-12 18:13:50',NULL,0,0.00,0,'Efectivo',3645.25,NULL,29),(164,1,3,'36899','2025-08-21','Maquinaria',7,'Retroexcavadora','425F','',7.000,NULL,520.75,3645.25,'Movimiento de material ','Entregado','2025-09-12 18:14:51','2025-09-12 18:14:51',NULL,0,0.00,0,'Efectivo',3645.25,NULL,29),(165,1,3,'36895','2025-08-16','Maquinaria',7,'Retroexcavadora','425F','de 8 a 11 de la mañana se pararon por llanta ponchada',2.000,NULL,520.75,1041.50,'Movimiento de material ','Entregado','2025-09-12 18:15:48','2025-09-12 18:15:48',NULL,0,0.00,0,'Efectivo',1041.50,NULL,29),(166,1,3,'36894','2025-08-15','Maquinaria',7,'Retroexcavadora','425F','',8.990,NULL,520.75,4681.54,'Movimiento de material ','Entregado','2025-09-12 18:16:29','2025-09-12 18:16:29',NULL,0,0.00,0,'Efectivo',4681.54,NULL,29),(167,1,3,'36893','2025-09-12','Maquinaria',7,'Retroexcavadora','425F','',9.000,NULL,520.75,4686.75,'','Entregado','2025-09-12 18:16:59','2025-09-12 18:16:59',NULL,0,0.00,0,'Efectivo',4686.75,NULL,29),(168,1,3,'36900','2025-08-22','Maquinaria',7,'Retroexcavadora','425F','revisar si este es valido ya que tiene muchas firmas encima del recibo',9.000,NULL,520.75,4686.75,'Movimiento de material (Por Confirmar)','Entregado','2025-09-12 18:21:22','2025-09-12 18:21:22',NULL,0,0.00,0,'Efectivo',4686.75,NULL,29),(169,1,3,'36896','2025-08-28','Maquinaria',7,'Retroexcavadora','425F','',9.000,NULL,520.75,4686.75,'Movimiento de material ','Entregado','2025-09-12 18:21:56','2025-09-12 18:21:56',NULL,0,0.00,0,'Efectivo',4686.75,NULL,29),(170,1,14,'S44611','2025-09-12','Acero',4,' VARILLA CORRUGADA 1/2 12 MTS. R-42','30102400','',7000.000,NULL,14.30,116116.00,'','Entregado','2025-09-12 19:45:16','2025-09-12 20:06:18',NULL,0,0.00,1,'Transferencia',100100.00,NULL,15),(171,1,14,'S44611','2025-09-12','Acero',4,'VARILLA CORRUGADA 3/8 12 MTS. R-42','30102400','',5000.000,NULL,14.30,82940.00,'','Entregado','2025-09-12 19:45:16','2025-09-12 20:06:18',NULL,0,0.00,1,'Transferencia',71500.00,NULL,15),(172,1,14,'VarAgrupado','2025-09-12','Material',1,'VARILLA 1/2 Y 3/8','','',1.000,NULL,100100.00,116116.00,'','Entregado','2025-09-12 20:04:09','2025-09-15 16:58:44',NULL,0,0.00,1,'Efectivo',100100.00,NULL,19),(174,1,14,'S43876','2025-07-14','Acero',4,'ALAMBRE RECOCIDO','','',1000.000,NULL,18.00,18000.00,'','Entregado','2025-09-12 20:19:11','2025-09-12 20:19:11',NULL,0,0.00,0,'Efectivo',18000.00,NULL,19),(175,1,15,'44222','2025-07-24','Material',1,'Multiplay Pino CD 12mm 4x8','','',1.000,NULL,494.66,573.81,'','Entregado','2025-09-12 20:23:23','2025-09-12 20:23:23',NULL,0,0.00,1,'Efectivo',494.66,NULL,19),(177,1,15,'TARAHUMARA','2025-07-14','Cimbra',5,'BARROTES 8FT','','',18.000,NULL,93.17,1677.00,'','Entregado','2025-09-12 20:27:57','2025-09-12 20:27:57',NULL,0,0.00,0,'Efectivo',1677.06,NULL,19),(178,1,16,'globalnets','2025-08-21','Material',1,'Malla Geotextil ','','',40.000,NULL,94.25,3770.00,'','Entregado','2025-09-12 20:33:27','2025-09-12 20:33:27',NULL,0,0.00,0,'Efectivo',3770.00,NULL,7),(179,1,17,'dureza','2025-08-21','Material',1,'Cemento','','',20.000,NULL,118.75,2375.00,'','Entregado','2025-09-12 20:37:07','2025-09-12 20:37:07',NULL,0,0.00,0,'Efectivo',2375.00,NULL,22),(180,1,18,'DIEGO','2025-07-15','Ferretería',6,'Manguera','','',12.500,NULL,8.00,100.00,'','Entregado','2025-09-12 20:39:34','2025-09-12 20:39:34',NULL,0,0.00,0,'Efectivo',100.00,NULL,1),(181,1,18,'xd','2025-07-17','Ferretería',6,'CEPILLO AMARILLO','','',1.000,NULL,105.00,105.00,'','Entregado','2025-09-12 20:44:02','2025-09-12 20:44:02',NULL,0,0.00,0,'Efectivo',105.00,NULL,19),(182,1,17,'4198418484698','2025-07-16','Material',1,'CEMENTO FORTALEZA ','','',25.000,NULL,180.00,4500.00,'','Entregado','2025-09-12 20:50:33','2025-09-12 20:50:33',NULL,0,0.00,0,'Efectivo',4500.00,NULL,15),(183,1,17,'41984984156','2025-07-16','Material',1,'YESO UNIBASICO VERDE ','','',40.000,NULL,3.75,150.00,'','Entregado','2025-09-12 20:51:27','2025-09-12 20:51:27',NULL,0,0.00,0,'Efectivo',150.00,NULL,15),(184,1,19,'5109','2025-08-22','Ferretería',6,'TUBO RECTANGULAR ','','',2.000,NULL,259.00,518.00,'','Entregado','2025-09-12 20:56:54','2025-09-12 20:56:54',NULL,0,0.00,0,'Efectivo',518.00,NULL,19),(185,1,16,'4984198498498','2025-08-08','Material',1,'Malla Geotextil ','','',88.000,NULL,94.25,8294.00,'','Entregado','2025-09-12 20:58:57','2025-09-12 20:58:57',NULL,0,0.00,0,'Efectivo',8294.00,NULL,7),(186,1,17,'obgsd','2025-08-18','Material',1,'CEMENTO FORTALEZA ','','',25.000,NULL,95.00,2375.00,'','Entregado','2025-09-13 16:19:12','2025-09-13 16:19:12',NULL,0,0.00,0,'Efectivo',2375.00,NULL,15),(187,1,20,'WS58501','2025-07-16','Material',1,'CANALETA DE CARGA PREMIUM DE 3.05 M','','',1.000,NULL,39.11,45.37,'','Entregado','2025-09-13 17:26:39','2025-09-13 17:26:39',NULL,0,0.00,1,'Efectivo',39.11,NULL,19),(188,1,20,'WS58501','2025-07-16','Material',1,'COMPUESTO P/JUNTAS REDIMIX 6 KG','','',1.000,NULL,177.20,205.55,'','Entregado','2025-09-13 17:26:39','2025-09-13 17:26:39',NULL,0,0.00,1,'Efectivo',177.20,NULL,19),(189,1,20,'WS58501','2025-07-16','Ferretería',6,'REMACHE P/CLAVO C-27 AMARILLO','RG406 (31162000)','',10.000,NULL,1.83,21.23,'','Entregado','2025-09-13 17:26:39','2025-09-13 17:26:39',NULL,0,0.00,1,'Efectivo',18.30,NULL,19),(190,2,21,'3853','2025-08-21','Material',1,'REBORDE \"J\" PERFATRIM X 2.44 ML','','',4.000,NULL,98.00,454.72,'','Entregado','2025-09-13 17:44:25','2025-09-13 17:44:25',NULL,0,0.00,1,'Transferencia',392.00,NULL,19),(191,2,21,'3853','2025-08-21','Material',1,'PANEL DE YESO RH 12 MM ','','',3.000,NULL,240.00,835.20,'','Entregado','2025-09-13 17:44:25','2025-09-13 17:44:25',NULL,0,0.00,1,'Transferencia',720.00,NULL,19),(192,2,21,'3853','2025-08-21','Material',1,'TORNILLO S1 C. SENCILLA','','',15.000,NULL,18.00,313.20,'','Entregado','2025-09-13 17:44:25','2025-09-13 17:44:25',NULL,0,0.00,1,'Transferencia',270.00,NULL,19),(193,2,21,'3853','2025-08-21','Material',1,'CINTA FIBRA DE VIDRIO','','',2.000,NULL,98.00,227.36,'','Entregado','2025-09-13 17:44:25','2025-09-13 17:44:25',NULL,0,0.00,1,'Transferencia',196.00,NULL,23),(194,2,21,'3853','2025-08-21','Material',1,'COMPUESTO STD PLUS 21.8 KG','','',4.000,NULL,318.00,1475.52,'','Entregado','2025-09-13 17:44:25','2025-09-13 17:44:25',NULL,0,0.00,1,'Transferencia',1272.00,NULL,21),(195,2,21,'3853','2025-08-21','Servicio',9,'Servicio de manejo de materiales','','',1.000,NULL,300.00,348.00,'','Entregado','2025-09-13 17:44:25','2025-09-13 17:44:25',NULL,0,0.00,1,'Transferencia',300.00,NULL,19),(196,2,21,'3853','2025-08-21','Material',1,'PANEL DE YESO LIGHT 12 MM ','','',5.000,NULL,165.00,957.00,'','Entregado','2025-09-13 17:44:25','2025-09-13 17:44:25',NULL,0,0.00,1,'Transferencia',825.00,NULL,19),(197,1,22,'mercadoLibre','2025-08-12','Material',1,'IMPERMEABILIZANTE','','',4.000,NULL,3000.00,12000.00,'','Entregado','2025-09-13 17:49:18','2025-09-13 17:49:18',NULL,0,0.00,0,'Tarjeta',12000.00,NULL,13),(198,1,11,'viajes','2025-08-11','Servicio',9,'Viajes Movimientos','','',1.000,NULL,4000.00,4000.00,'','Entregado','2025-09-13 17:55:19','2025-09-13 17:55:19',NULL,0,0.00,0,'Efectivo',4000.00,NULL,19),(199,1,11,'viajes','2025-08-11','Servicio',9,'Viajes Loera','','',1.000,NULL,30000.00,30000.00,'','Entregado','2025-09-13 17:55:19','2025-09-13 17:55:19',NULL,0,0.00,0,'Efectivo',30000.00,NULL,19),(200,1,12,'botas','2025-07-16','Ferretería',6,'BOTAS INDUSTRIALES','','',1.000,NULL,489.00,567.24,'','Entregado','2025-09-13 18:03:18','2025-09-13 18:05:45',NULL,0,0.00,1,'Efectivo',489.00,NULL,19),(201,1,11,'horasExtras','2025-07-26','Maquinaria',7,'HORAS EXTRAS','','',1.000,NULL,4000.00,4000.00,'','Entregado','2025-09-13 18:08:35','2025-09-13 18:08:35',NULL,0,0.00,0,'Efectivo',4000.00,NULL,19),(202,1,23,'48225','2025-07-31','Cimbra',5,'TRIPLAY','','Cimbra Film Faced Eco-Max, CHN de .18 x 4 x 8 Lote: (25) M202506.0008 ',25.000,NULL,517.24,14999.96,'','Entregado','2025-09-13 18:44:24','2025-09-13 18:44:24',NULL,0,0.00,1,'Efectivo',12931.00,NULL,19),(203,1,23,'48238','2025-08-01','Cimbra',5,'TRIPLAY','','',20.000,NULL,517.24,11999.97,'','Entregado','2025-09-13 18:45:48','2025-09-13 18:45:48',NULL,0,0.00,1,'Transferencia',10344.80,NULL,19),(204,1,24,'','2025-08-16','Material',1,'SACO MARMOLINA TIPO I Mar. Int. Jal. 50 KG','','',5.000,NULL,66.82,387.56,'','Entregado','2025-09-13 18:50:42','2025-09-13 18:52:21',NULL,0,0.00,1,'Tarjeta',334.10,NULL,19),(205,1,24,'','2025-08-16','Material',1,'SACO PASTA TEXTURIZADA MARCA ADHEMEX CON 50 KG COLOR BLANCA BASE CEMENTO CON PIEDRA DE MARMOL EN GRANO 0','','',5.000,NULL,183.19,1062.50,'','Entregado','2025-09-13 18:50:42','2025-09-13 18:52:21',NULL,0,0.00,1,'Tarjeta',915.95,NULL,19),(206,1,24,NULL,'2025-08-16','Material',1,'SACO PASTA TEXTURIZADA MARCA ADHEMEX CON 50 KG COLOR BLANCA BASE CEMENTO CON PIEDRA DE MARMOL EN GRANO 0 ','','',5.000,NULL,183.19,1062.50,'','Entregado','2025-09-13 18:52:21','2025-09-13 18:52:21',NULL,0,0.00,1,'Tarjeta',915.95,NULL,19),(207,1,15,'1PINOCD','2025-07-16','Material',1,'1 PINO CD 12 MM, 40 MAQUILA','','',1.000,NULL,574.00,574.00,'','Entregado','2025-09-13 18:56:40','2025-09-13 18:56:40',NULL,0,0.00,0,'Efectivo',574.00,NULL,19),(210,1,25,'PROA','2025-07-29','Maquinaria',7,'MAQUINARIA','','',1.000,NULL,380000.00,380000.00,'','Entregado','2025-09-13 19:06:34','2025-09-13 19:06:34',NULL,0,0.00,0,'Efectivo',380000.00,NULL,19),(211,1,25,'PROA','2025-07-29','Maquinaria',7,'MAQUINARIA','','',1.000,NULL,500000.00,500000.00,'','Entregado','2025-09-13 19:06:34','2025-09-13 19:06:34',NULL,0,0.00,0,'Efectivo',500000.00,NULL,19),(212,1,11,'RECOCIDO','2025-07-15','Acero',4,'ALAMBRE RECOCIDO','','',1.000,NULL,21000.00,21000.00,'','Entregado','2025-09-13 19:09:21','2025-09-13 19:09:21',NULL,0,0.00,0,'Efectivo',21000.00,NULL,19),(213,1,11,'VARIOS','2025-07-15','Ferretería',6,'VARIOS','','',1.000,NULL,3120.00,3619.20,'','Entregado','2025-09-13 19:20:24','2025-09-13 19:20:24',NULL,0,0.00,1,'Efectivo',3120.00,NULL,19),(214,1,12,'RASTRILLOS','2025-07-18','Ferretería',6,'RASTRILLOS ','','',1.000,NULL,274.00,317.84,'','Entregado','2025-09-13 20:05:32','2025-09-13 20:05:32',NULL,0,0.00,1,'Efectivo',274.00,NULL,19),(215,2,11,'COPANEL','2025-07-30','Material',1,'MATERIAL','','',1.000,NULL,4938.00,4938.00,'','Entregado','2025-09-13 20:07:44','2025-09-13 20:08:27',NULL,0,0.00,0,'Efectivo',4938.00,NULL,19),(216,1,11,'CLAVOS','2025-07-30','Material',1,'CLAVOS','','',1.000,NULL,2050.00,2050.00,'CASTILLOS ARMADOS, SOLDADOS Y DERIVADOS DEL ACERO','Entregado','2025-09-13 20:11:19','2025-09-13 20:11:19',NULL,0,0.00,0,'Efectivo',2050.00,NULL,19),(217,1,17,'CEMENTO1TONELADA','2025-08-04','Material',1,'CEMENTO FORTALEZA 1 TONELADA','','',1.000,NULL,4750.00,4750.00,'','Entregado','2025-09-13 20:13:30','2025-09-13 20:13:30',NULL,0,0.00,0,'Efectivo',4750.00,NULL,17),(218,1,17,'FV0000003306','2025-08-04','Material',1,'SACOS DE CEMENTRO GRIS FORTALEZA 25K','','',40.000,NULL,102.37,4750.01,'','Entregado','2025-09-13 20:37:36','2025-09-13 20:37:36',NULL,0,0.00,1,'Transferencia',4094.80,NULL,22),(219,1,11,'9841968410','2025-08-01','Cimbra',5,'Polines 3.5x3.5x2.44','','',90.000,NULL,140.00,12600.00,'','Entregado','2025-09-13 20:40:55','2025-09-13 20:40:55',NULL,0,0.00,0,'Efectivo',12600.00,NULL,19),(220,1,17,'2084','2025-08-15','Material',1,'ESTUCO BLANCO 25 K','','',5.000,NULL,125.00,625.00,'','Entregado','2025-09-13 20:45:41','2025-09-13 20:45:41',NULL,0,0.00,0,'Efectivo',625.00,NULL,19),(221,1,17,'2084','2025-08-15','Material',1,'YESO UNIBASICO 40K','','',5.000,NULL,144.00,720.00,'','Entregado','2025-09-13 20:45:41','2025-09-13 20:45:41',NULL,0,0.00,0,'Efectivo',720.00,NULL,19),(222,1,19,'4730','2025-08-03','Ferretería',6,'ADITIVO DURACRIL PER','','',1.000,NULL,142.24,165.00,'','Entregado','2025-09-13 20:52:52','2025-09-13 20:54:30',NULL,0,0.00,1,'Efectivo',142.24,NULL,19),(223,1,19,'1231','2025-08-05','Ferretería',6,'CEPILLO','','',2.000,NULL,145.00,290.00,'','Entregado','2025-09-13 21:00:46','2025-09-13 21:00:46',NULL,0,0.00,0,'Efectivo',290.00,NULL,19),(224,1,19,'1231','2025-08-05','Ferretería',6,'DESARMADOR','','',1.000,NULL,50.50,50.50,'','Entregado','2025-09-13 21:00:46','2025-09-13 21:00:46',NULL,0,0.00,0,'Efectivo',50.50,NULL,19),(225,1,19,'1231','2025-08-05','Ferretería',6,'PINZA ELECTRICA','','',1.000,NULL,109.00,109.00,'','Entregado','2025-09-13 21:00:46','2025-09-13 21:00:46',NULL,0,0.00,0,'Efectivo',109.00,NULL,19),(226,1,19,'1231','2025-08-05','Ferretería',6,'CLAVIJA','','',2.000,NULL,24.00,48.00,'','Entregado','2025-09-13 21:00:46','2025-09-13 21:00:46',NULL,0,0.00,0,'Efectivo',48.00,NULL,19),(227,1,19,'4500','2025-08-09','Ferretería',6,'TUBO RECTANGULAR ','','',8.000,NULL,253.82,2030.56,'','Entregado','2025-09-13 21:10:40','2025-09-13 21:10:40',NULL,0,0.00,0,'Efectivo',2030.56,NULL,19),(228,1,19,'4500','2025-08-09','Ferretería',6,'RODILLERAS','','',2.000,NULL,851.63,1703.26,'','Entregado','2025-09-13 21:10:40','2025-09-13 21:10:40',NULL,0,0.00,0,'Efectivo',1703.26,NULL,19),(229,1,19,'4500','2025-08-09','Ferretería',6,'RODILLO','','',1.000,NULL,74.26,74.26,'','Entregado','2025-09-13 21:10:40','2025-09-13 21:10:40',NULL,0,0.00,0,'Efectivo',74.26,NULL,19),(230,1,19,'4500','2025-08-09','Ferretería',6,'LLANA','','',1.000,NULL,149.25,149.25,'','Entregado','2025-09-13 21:10:40','2025-09-13 21:10:40',NULL,0,0.00,0,'Efectivo',149.25,NULL,19),(231,1,19,'4500','2025-08-09','Ferretería',6,'SIKALATEX','','',1.000,NULL,2331.84,2331.84,'','Entregado','2025-09-13 21:10:40','2025-09-13 21:10:40',NULL,0,0.00,0,'Efectivo',2331.84,NULL,19),(232,1,19,'4500','2025-08-09','Ferretería',6,'LIJA','','',1.000,NULL,19.60,19.60,'','Entregado','2025-09-13 21:10:40','2025-09-13 21:10:40',NULL,0,0.00,0,'Efectivo',19.60,NULL,19),(233,1,19,'4500','2025-08-09','Ferretería',6,'TIRA LINEAS','','',1.000,NULL,89.25,89.25,'','Entregado','2025-09-13 21:10:40','2025-09-13 21:10:40',NULL,0,0.00,0,'Efectivo',89.25,NULL,19),(234,1,19,'7731','2025-07-21','Ferretería',6,'ESCALERA','','',1.000,NULL,1499.00,1499.00,'','Entregado','2025-09-13 21:15:26','2025-09-13 21:15:26',NULL,0,0.00,0,'Efectivo',1499.00,NULL,19),(235,1,19,'7731','2025-07-21','Ferretería',6,'CEPILLO','','',1.000,NULL,145.00,145.00,'','Entregado','2025-09-13 21:15:26','2025-09-13 21:15:26',NULL,0,0.00,0,'Efectivo',145.00,NULL,19),(236,1,19,'7731','2025-07-21','Ferretería',6,'GARRAFON','','',3.000,NULL,99.00,297.00,'','Entregado','2025-09-13 21:15:26','2025-09-13 21:15:26',NULL,0,0.00,0,'Efectivo',297.00,NULL,19),(237,1,19,'080425','2025-08-04','Ferretería',6,'CEPILLO IXTLE','','',2.000,NULL,119.00,238.00,'','Entregado','2025-09-13 21:22:28','2025-09-13 21:22:28',NULL,0,0.00,0,'Efectivo',238.00,NULL,19),(238,1,19,'080425','2025-08-04','Ferretería',6,'IMPAC EMULSION FIBRA','','',3.000,NULL,709.00,2127.00,'','Entregado','2025-09-13 21:22:28','2025-09-13 21:22:28',NULL,0,0.00,0,'Efectivo',2127.00,NULL,19),(239,1,19,'080425','2025-08-04','Ferretería',6,'PLACA POLIETIRENO','','',8.000,NULL,58.60,468.80,'','Entregado','2025-09-13 21:22:28','2025-09-13 21:22:28',NULL,0,0.00,0,'Efectivo',468.80,NULL,19),(240,1,19,'9362','2025-08-05','Ferretería',6,'IMPAC EMULSION FIBRA','','',2.000,NULL,709.00,1418.00,'','Entregado','2025-09-13 21:24:30','2025-09-13 21:24:30',NULL,0,0.00,0,'Efectivo',1418.00,NULL,19),(241,1,19,'3586','2025-08-14','Ferretería',6,'IMPAC EMULSION FIBRA','','',1.000,NULL,694.82,694.82,'','Entregado','2025-09-13 21:26:49','2025-09-13 21:26:49',NULL,0,0.00,0,'Efectivo',694.82,NULL,19),(242,1,19,'3585','2025-08-14','Ferretería',6,'IMPAC EMULSION FIBRA','','',2.000,NULL,694.82,1389.64,'','Entregado','2025-09-13 21:28:12','2025-09-13 21:28:12',NULL,0,0.00,0,'Efectivo',1389.64,NULL,19),(243,1,19,'8927','2025-09-07','Ferretería',6,'IMPAC EMULSION FIBRA','','',2.000,NULL,694.82,1389.64,'','Entregado','2025-09-13 21:30:40','2025-09-13 21:30:40',NULL,0,0.00,0,'Efectivo',1389.64,NULL,19),(244,1,19,'8929','2025-08-07','Ferretería',6,'IMPAC EMULSION FIBRA','','',2.000,NULL,694.82,1389.64,'','Entregado','2025-09-13 21:31:32','2025-09-13 21:31:32',NULL,0,0.00,0,'Efectivo',1389.64,NULL,19),(245,1,19,'8928','2025-08-07','Ferretería',6,'IMPAC EMULSION FIBRA','','',2.000,NULL,694.82,1389.64,'','Entregado','2025-09-13 21:32:14','2025-09-13 21:32:14',NULL,0,0.00,0,'Efectivo',1389.64,NULL,19),(246,1,11,'CALZAS','2025-08-12','Cimbra',5,'CALZAS PARA MURO 2 ','','',1000.000,NULL,2.08,2080.00,'','Entregado','2025-09-13 21:43:56','2025-09-13 21:43:56',NULL,0,0.00,0,'Efectivo',2080.00,NULL,19),(247,1,26,'','2025-09-15','Material',1,'Grava','','',1.000,NULL,530.00,530.00,'','Entregado','2025-09-15 20:38:46','2025-09-15 20:38:46',NULL,0,0.00,0,'Efectivo',530.00,NULL,19),(248,1,26,'','2025-09-15','Material',1,'Arena de RIo','','',1.000,NULL,270.00,270.00,'','Entregado','2025-09-15 20:38:46','2025-09-15 20:38:46',NULL,0,0.00,0,'Efectivo',270.00,NULL,11),(249,1,12,'ojsjndgpmañs,','2025-07-08','Ferretería',6,'LONA, ANDADERA Y PIJAS','','',1.000,NULL,399.00,462.84,'','Entregado','2025-09-18 18:21:57','2025-09-18 18:21:57',NULL,0,0.00,1,'Efectivo',399.00,NULL,19),(250,1,12,'YDBOGPINDSAGLDSAMV','2025-07-10','Ferretería',6,'LENTES Y GUANTES','','',1.000,NULL,4176.00,4844.16,'','Entregado','2025-09-18 18:24:36','2025-09-18 18:24:36',NULL,0,0.00,1,'Efectivo',4176.00,NULL,19),(251,1,12,'UIHBAOKNSMFPAS´F,AS','2025-07-12','Ferretería',6,'BARRETAS Y RASPADOR','','',1.000,NULL,1483.00,1720.28,'','Entregado','2025-09-18 18:25:46','2025-09-18 18:25:46',NULL,0,0.00,1,'Efectivo',1483.00,NULL,19),(252,1,11,'xftcyvgbhuinjokm','2025-07-14','Cimbra',5,'POLINES','','',20.000,NULL,85.00,1700.00,'','Entregado','2025-09-18 18:27:28','2025-09-18 18:27:28',NULL,0,0.00,0,'Efectivo',1700.00,NULL,19),(253,1,12,'xftcyvghubinjokmpl,','2025-07-16','Ferretería',6,'ESPATULAS Y PIZON','','',1.000,NULL,1038.00,1204.08,'','Entregado','2025-09-18 18:31:33','2025-09-18 18:31:33',NULL,0,0.00,1,'Efectivo',1038.00,NULL,19),(254,1,19,'cftyvghubinjokmpl,','2025-07-21','Ferretería',6,'ESCALERA, CEPILLO Y GARRAFON','','',1.000,NULL,1941.00,1941.00,'','Entregado','2025-09-18 18:48:09','2025-09-18 18:48:09',NULL,0,0.00,0,'Efectivo',1941.00,NULL,19),(255,1,27,'exctybgimjo,k','2025-07-29','Cimbra',5,'DUELA METALICA Y PUNTAL','','',1.000,NULL,19700.00,19700.00,'','Entregado','2025-09-18 18:58:41','2025-09-18 18:58:41',NULL,0,0.00,0,'Efectivo',19700.00,NULL,19),(256,1,11,'ZAPATASCALZAS','2025-07-30','Cimbra',5,'CALZAS ZAPATAS','','',1.000,NULL,3373.00,3373.00,'','Entregado','2025-09-18 19:02:00','2025-09-18 19:02:00',NULL,0,0.00,0,'Efectivo',3373.00,NULL,19),(257,1,11,'BARROTESPOLINES','2025-07-30','Cimbra',5,'BARROTES, POLINES Y TABLAS','','',1.000,NULL,28600.00,28600.00,'','Entregado','2025-09-18 19:03:46','2025-09-18 19:03:46',NULL,0,0.00,0,'Efectivo',28600.00,NULL,19),(258,1,17,'aousnfkapsfasf','2025-07-31','Material',1,'CEMENTO FORTALEZA 25K X 40','','',40.000,NULL,112.50,4500.00,'','Entregado','2025-09-18 19:07:07','2025-09-18 19:07:07',NULL,0,0.00,0,'Efectivo',4500.00,NULL,15),(259,1,11,'rdft yghupl,','2025-08-04','Ferretería',6,'IMPERMEABILIZANTE','','',1.000,NULL,3241.00,3241.00,'','Entregado','2025-09-18 19:10:59','2025-09-18 19:10:59',NULL,0,0.00,0,'Efectivo',3241.00,NULL,13),(260,1,19,'VARIOSHOME','2025-08-04','Ferretería',6,'VARIOS','','',1.000,NULL,2834.00,2834.00,'','Entregado','2025-09-18 19:13:43','2025-09-18 19:13:43',NULL,0,0.00,0,'Efectivo',2834.00,NULL,19),(261,1,19,'extcyvokmpl,ñ.','2025-08-05','Material',1,'IMPERMEABILIZANTE','','',1.000,NULL,1418.00,1418.00,'','Entregado','2025-09-18 19:23:40','2025-09-18 19:23:40',NULL,0,0.00,0,'Efectivo',1418.00,NULL,13),(262,1,19,'xtcyvghubinjokmpl,.','2025-08-14','Ferretería',6,'IMPERMEABILIZANTE','','',2.000,NULL,695.00,1390.00,'','Entregado','2025-09-18 19:27:16','2025-09-18 19:27:16',NULL,0,0.00,0,'Efectivo',1390.00,NULL,13),(263,1,19,'xtcyvghubinjokmpl,.','2025-08-14','Ferretería',6,'IMPERMEABILIZANTE ','','',1.000,NULL,695.00,695.00,'','Entregado','2025-09-18 19:27:16','2025-09-18 19:27:16',NULL,0,0.00,0,'Efectivo',695.00,NULL,13),(264,1,14,'ACERO','2025-09-18','Acero',4,'ACERO','','',1.000,NULL,33176.00,33176.00,'','Entregado','2025-09-18 19:31:31','2025-09-18 19:31:31',NULL,0,0.00,0,'Efectivo',33176.00,NULL,19),(266,1,11,'MATERIAL','2025-09-18','Material',1,'MATERIAL','','',1.000,NULL,10000.00,10000.00,'','Entregado','2025-09-18 19:48:11','2025-09-18 19:48:11',NULL,0,0.00,0,'Efectivo',10000.00,NULL,19),(267,1,28,'zexsrd ftyguhijomp,','2025-07-18','Cimbra',5,'SH200','','',1.000,NULL,1293.00,1293.00,'','Entregado','2025-09-18 20:13:05','2025-09-18 20:13:05',NULL,0,0.00,0,'Efectivo',1293.00,NULL,19),(268,1,19,'CEPILLODESARMADOR','2025-08-05','Ferretería',6,'Cepillo, desarmador, pinza electrica y Clavija','','',1.000,NULL,498.00,498.00,'','Entregado','2025-09-18 20:22:31','2025-09-18 20:22:31',NULL,0,0.00,0,'Efectivo',498.00,NULL,19),(269,1,19,'zsrdxftcyvghubinjokmpl,','2025-08-09','Ferretería',6,'TUBO, RODILLERAS, RODILLO, LLANA,SIKALATEX, LIJA','','',1.000,NULL,6398.00,6398.00,'','Entregado','2025-09-18 20:24:09','2025-09-18 20:24:09',NULL,0,0.00,0,'Efectivo',6398.00,NULL,19),(270,1,4,'xrtcfyvgubhinjomk,','2025-08-05','Concreto',8,'CONCRETO','','',1.000,NULL,28646.55,33230.00,'','Entregado','2025-09-18 20:36:41','2025-09-18 21:02:39',NULL,0,0.00,1,'Efectivo',28646.55,NULL,19),(271,1,4,'31616','2025-08-28','Concreto',8,'SUMINISTRO DE CONCRETO PREMEZCLADO','','',1.000,NULL,1360.96,1578.71,'','Entregado','2025-09-18 20:48:13','2025-09-18 20:48:13',NULL,0,0.00,1,'Efectivo',1360.96,NULL,19),(272,1,4,'31617','2025-08-23','Concreto',8,'SUMINISTRO DE CONCRETO PREMEZCLADO','','',1.000,NULL,8506.01,9866.97,'','Entregado','2025-09-18 20:49:44','2025-09-18 20:49:44',NULL,0,0.00,1,'Efectivo',8506.01,NULL,19),(273,1,4,'31598','2025-08-13','Concreto',8,'SUMINISTRO DE CONCRETO PREMEZCLADO','','',1.000,NULL,60298.02,69945.70,'','Entregado','2025-09-18 20:51:21','2025-09-18 20:51:21',NULL,0,0.00,1,'Efectivo',60298.02,NULL,19),(274,1,4,'31418','2025-08-27','Concreto',8,'SUMINISTRO DE CONCRETO PREMEZCLADO',NULL,NULL,1.000,NULL,135828.41,157560.96,NULL,'Entregado','2025-09-18 14:54:28','2025-09-18 14:54:53',NULL,0,0.00,1,'Efectivo',135828.41,NULL,19),(275,1,4,'exctvyhubinjokm','2025-07-18','Concreto',8,'CONCRETO','','',1.000,NULL,28483.00,28483.00,'','Entregado','2025-09-18 21:01:08','2025-09-18 21:02:55',NULL,0,0.00,0,'Efectivo',28483.00,NULL,19),(276,1,4,'ftcyvgubhinjokm','2025-07-22','Concreto',8,'CONCRETO','','',1.000,NULL,22000.00,22000.00,'','Entregado','2025-09-18 21:04:22','2025-09-18 21:04:22',NULL,0,0.00,0,'Efectivo',22000.00,NULL,19),(277,1,4,'xtcubinomp','2025-07-24','Concreto',8,'CONCRETO','','',1.000,NULL,65000.00,65000.00,'','Entregado','2025-09-18 21:04:58','2025-09-18 21:04:58',NULL,0,0.00,0,'Efectivo',65000.00,NULL,19),(278,1,4,'CYVUBIONÑL','2025-07-25','Concreto',8,'CONCRETO','','',1.000,NULL,18075.00,18075.00,'','Entregado','2025-09-18 21:05:40','2025-09-18 21:05:40',NULL,0,0.00,0,'Efectivo',18075.00,NULL,19),(279,1,4,'hou jg','2025-07-31','Concreto',8,'CONCRETO','','',1.000,NULL,144804.00,144804.00,'','Entregado','2025-09-18 21:08:07','2025-09-18 21:08:07',NULL,0,0.00,0,'Efectivo',144804.00,NULL,19),(280,1,17,'bion aklv','2025-09-18','Material',1,'SACOS DE CEMENTO GRIS FORTALEZA 25 KG ','','',10.000,NULL,102.37,1187.49,'','Entregado','2025-09-18 21:20:35','2025-09-18 21:24:24',NULL,0,0.00,1,'Efectivo',1023.70,NULL,22),(281,2,29,'FVP000029594','2025-09-06','Material',1,'SACO DE YESO UNIBASICO','','',10.000,NULL,124.14,1440.00,'','Entregado','2025-09-18 21:23:43','2025-09-18 21:23:43',NULL,0,0.00,1,'Efectivo',1241.40,NULL,19),(282,1,4,'42921','2025-08-04','Concreto',8,'Concreto Lanzado ','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:12:16','2025-09-19 20:12:54',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(283,1,4,'42921','2025-08-04','Concreto',8,'Concreto Lanzado','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:12:16','2025-09-19 20:12:54',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(284,1,4,'42921','2025-08-04','Concreto',8,'Concreto Lanzado ','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:12:16','2025-09-19 20:12:54',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(285,1,4,'42681','2025-07-22','Concreto',8,'Concreto ','C2002010D28','',2.000,NULL,2046.19,4092.38,'','Entregado','2025-09-19 20:17:26','2025-09-19 20:31:09',NULL,0,0.00,0,'Efectivo',4092.38,NULL,11),(286,1,4,'42881','2025-08-01','Concreto',8,'Concreto Lanzado','L2001010B28','',21.000,NULL,2192.66,46045.86,'','Entregado','2025-09-19 20:20:04','2025-09-19 20:20:04',NULL,0,0.00,0,'Efectivo',46045.86,NULL,11),(287,1,4,'42976','2025-08-06','Concreto',8,'Concreto Lanzado','L2001010B28','',28.000,NULL,2192.66,61394.48,'','Entregado','2025-09-19 20:21:09','2025-09-19 20:21:09',NULL,0,0.00,0,'Efectivo',61394.48,NULL,11),(288,1,4,'43032','2025-08-11','Concreto',8,'Concreto Lanzado','L2001010B28','',21.000,NULL,2192.66,46045.86,'','Entregado','2025-09-19 20:21:46','2025-09-19 20:21:46',NULL,0,0.00,0,'Efectivo',46045.86,NULL,11),(289,1,4,'42924','2025-08-09','Concreto',8,'Concreto Lanzado','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:23:47','2025-09-19 20:23:47',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(290,1,4,'42924','2025-08-09','Concreto',8,'Concreto Lanzado ','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:23:47','2025-09-19 20:23:47',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(291,1,4,'42924','2025-08-09','Concreto',8,'Concreto Lanzado  ','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:23:47','2025-09-19 20:23:47',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(292,1,4,'42924','2025-08-09','Concreto',8,'Concreto Lanzado   ','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:23:47','2025-09-19 20:23:47',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(293,1,4,'43649','2025-09-13','Concreto',8,'Concreto Fluido','RD2514D28','',7.000,NULL,2070.42,14492.94,'','Entregado','2025-09-19 20:29:15','2025-09-19 20:42:44',NULL,0,0.00,0,'Efectivo',14492.94,NULL,11),(294,1,4,'43649','2025-09-13','Concreto',8,'Concreto Fluido ','RD2514D28','',7.000,NULL,2070.42,14492.94,'','Entregado','2025-09-19 20:29:15','2025-09-19 20:42:44',NULL,0,0.00,0,'Efectivo',14492.94,NULL,11),(295,1,4,'43649','2025-09-13','Concreto',8,'Concreto Fluido  ','RD2514D28','',7.000,NULL,2070.42,14492.94,'','Entregado','2025-09-19 20:29:15','2025-09-19 20:42:44',NULL,0,0.00,0,'Efectivo',14492.94,NULL,11),(296,1,4,'43649','2025-09-13','Concreto',8,'Concreto Fluido ','RD2514D28','',7.000,NULL,2070.42,14492.94,'','Entregado','2025-09-19 20:29:15','2025-09-19 20:42:44',NULL,0,0.00,0,'Efectivo',14492.94,NULL,11),(297,1,4,'43649','2025-09-13','Concreto',8,'Concreto Fluido  ','RD2514D28','',7.000,NULL,2070.42,14492.94,'','Entregado','2025-09-19 20:29:15','2025-09-19 20:42:44',NULL,0,0.00,0,'Efectivo',14492.94,NULL,11),(298,1,4,'42671','2025-07-28','Concreto',8,'Concreto ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:34:14','2025-09-19 20:34:14',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(299,1,4,'42671','2025-07-28','Concreto',8,'Concreto ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:34:14','2025-09-19 20:34:14',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(300,1,4,'42671','2025-07-28','Concreto',8,'Concreto ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:34:14','2025-09-19 20:34:14',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(301,1,4,'42671','2025-07-28','Concreto',8,'Concreto  ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:34:14','2025-09-19 20:34:14',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(302,1,4,'43023','2025-08-11','Concreto',8,'Concreto Lanzado','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:39:55','2025-09-19 20:39:55',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(303,1,4,'43023','2025-08-11','Concreto',8,'Concreto Lanzado','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:39:55','2025-09-19 20:39:55',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(304,1,4,'42966','2025-08-06','Concreto',8,'Concreto Lanzado','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:42:33','2025-09-19 20:42:33',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(305,1,4,'42966','2025-08-06','Concreto',8,'Concreto Lanzado','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:42:33','2025-09-19 20:42:33',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(306,1,4,'42966','2025-08-06','Concreto',8,'Concreto Lanzado (Copia)','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:42:33','2025-09-19 20:42:33',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(307,1,4,'42966','2025-08-06','Concreto',8,'Concreto Lanzado ','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:42:33','2025-09-19 20:42:33',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(308,1,4,'43622','2025-07-22','Concreto',8,'Concreto ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:44:49','2025-09-19 20:44:49',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(309,1,4,'43622','2025-07-22','Concreto',8,'Concreto ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:44:49','2025-09-19 20:44:49',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(310,1,4,'43087','2025-08-14','Concreto',8,'Concreto Lanzado','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:46:57','2025-09-19 20:46:57',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(311,1,4,'43087','2025-08-14','Concreto',8,'Concreto Lanzado','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:46:57','2025-09-19 20:46:57',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(312,1,4,'43087','2025-08-14','Concreto',8,'Concreto Lanzado  ','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:46:57','2025-09-19 20:46:57',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(313,1,4,'43087','2025-08-14','Concreto',8,'Concreto Lanzado ','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:46:57','2025-09-19 20:46:57',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(314,1,4,'43087','2025-08-14','Concreto',8,'Concreto Lanzado ','L2001010B28','',7.000,NULL,2192.66,15348.62,'','Entregado','2025-09-19 20:46:57','2025-09-19 20:46:57',NULL,0,0.00,0,'Efectivo',15348.62,NULL,11),(315,1,4,'42741','2025-07-25','Concreto',8,'Concreto  ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:49:46','2025-09-19 20:49:46',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(316,1,4,'42741','2025-07-25','Concreto',8,'Concreto','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:49:46','2025-09-19 20:49:46',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(317,1,4,'42741','2025-07-25','Concreto',8,'Concreto ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:49:46','2025-09-19 20:49:46',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(318,1,4,'42741','2025-07-25','Concreto',8,'Concreto  ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:49:46','2025-09-19 20:49:46',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(319,1,4,'42741','2025-07-25','Concreto',8,'Concreto ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:49:46','2025-09-19 20:49:46',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(320,1,4,'43037','2025-08-11','Concreto',8,'Concreto','C2002010D28',NULL,28.000,NULL,2046.19,57293.32,NULL,'Entregado','2025-09-19 14:56:42','2025-09-19 14:56:42',NULL,0,0.00,0,'Efectivo',57293.32,NULL,11),(321,1,4,'43028','2025-08-11','Concreto',8,'Concreto','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:58:12','2025-09-19 20:58:12',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(322,1,4,'43028','2025-08-11','Concreto',8,'Concreto ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:58:12','2025-09-19 20:58:12',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(323,1,4,'43028','2025-08-11','Concreto',8,'Concreto ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:58:12','2025-09-19 20:58:12',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(324,1,4,'43028','2025-08-11','Concreto',8,'Concreto ','C2002010D28','',7.000,NULL,2046.19,14323.33,'','Entregado','2025-09-19 20:58:12','2025-09-19 20:58:12',NULL,0,0.00,0,'Efectivo',14323.33,NULL,11),(325,1,30,'24780','2025-09-22','Servicio',9,'APISONADOR MANUAL, Modelo: BT65','','',1.000,NULL,250.00,250.00,'Renta de Maquinaria ligera','Entregado','2025-09-23 16:25:02','2025-09-23 16:27:41',NULL,0,0.00,0,'Efectivo',250.00,NULL,30),(326,1,30,'24780','2025-09-22','Servicio',9,'APISONADOR MANUAL, Modelo: BT65','','',1.000,NULL,320.00,320.00,'Renta de Maquinaria ligera','Entregado','2025-09-23 16:25:02','2025-09-23 16:27:41',NULL,0,0.00,0,'Efectivo',320.00,NULL,30),(327,1,30,'24780','2025-09-22','Servicio',9,'APISONADOR MANUAL, Modelo: BT65','','',1.000,NULL,250.00,250.00,'Renta de Maquinaria ligera','Entregado','2025-09-23 16:25:02','2025-09-23 16:27:41',NULL,0,0.00,0,'Efectivo',250.00,NULL,30),(328,1,30,'24780','2025-09-22','Servicio',9,'MANIOBRA 0/ /0 RF(11879)','','',1.000,NULL,1000.00,1000.00,'Renta de Maquinaria ligera','Entregado','2025-09-23 16:25:02','2025-09-23 16:27:41',NULL,0,0.00,0,'Efectivo',1000.00,NULL,19),(329,1,30,'24780','2025-09-22','Servicio',9,'APISONADOR MANUAL, Modelo: BT65','','',1.000,NULL,250.00,290.00,'Renta de Maquinaria ligera','Entregado','2025-09-23 16:27:41','2025-09-23 16:27:41',NULL,0,0.00,1,'Efectivo',250.00,NULL,30),(330,1,30,'24780','2025-09-22','Servicio',9,'APISONADOR MANUAL, Modelo: BT65','','',1.000,NULL,250.00,290.00,'Renta de Maquinaria ligera','Entregado','2025-09-23 16:27:41','2025-09-23 16:27:41',NULL,0,0.00,1,'Efectivo',250.00,NULL,30),(331,1,30,'24780','2025-09-22','Servicio',9,'APISONADOR MANUAL, Modelo: BT65','','',1.000,NULL,250.00,290.00,'Renta de Maquinaria ligera','Entregado','2025-09-23 16:27:41','2025-09-23 16:27:41',NULL,0,0.00,1,'Efectivo',250.00,NULL,30),(332,1,30,'24780','2025-09-22','Servicio',9,'MANIOBRA 0/ /0 RF(11879)','','',1.000,NULL,1000.00,1160.00,'Renta de Maquinaria ligera','Entregado','2025-09-23 16:27:41','2025-09-23 16:27:41',NULL,0,0.00,1,'Efectivo',1000.00,NULL,19),(333,1,30,'24748','2025-09-22','Servicio',9,'APISONADOR MANUAL, Modelo: BT65','','',7.000,NULL,250.00,1750.00,'Renta de Maquinaria LIgera','Entregado','2025-09-23 16:30:36','2025-09-23 16:30:36',NULL,0,0.00,0,'Efectivo',1750.00,NULL,30),(334,1,30,'24748','2025-09-22','Servicio',9,'APISONADOR MANUAL, Modelo: BT65','','',7.000,NULL,250.00,1750.00,'Renta de Maquinaria LIgera','Entregado','2025-09-23 16:30:36','2025-09-23 16:30:36',NULL,0,0.00,0,'Efectivo',1750.00,NULL,30),(335,1,30,'24748','2025-09-22','Servicio',9,'APISONADOR MANUAL, Modelo: BT65','','',7.000,NULL,250.00,1750.00,'Renta de Maquinaria LIgera','Entregado','2025-09-23 16:30:36','2025-09-23 16:30:36',NULL,0,0.00,0,'Efectivo',1750.00,NULL,30),(336,1,30,'24831','2025-09-22','Servicio',9,'APISONADOR MANUAL, Modelo: BT65','','',7.000,NULL,250.00,1750.00,'Renta de Maquinaria LIgera','Entregado','2025-09-23 16:33:04','2025-09-23 16:33:04',NULL,0,0.00,0,'Efectivo',1750.00,NULL,30),(337,1,30,'24831','2025-09-22','Servicio',9,'APISONADOR MANUAL, Modelo: BT65','','',7.000,NULL,250.00,1750.00,'Renta de Maquinaria LIgera','Entregado','2025-09-23 16:33:04','2025-09-23 16:33:04',NULL,0,0.00,0,'Efectivo',1750.00,NULL,30),(338,1,30,'24831','2025-09-22','Servicio',9,'MANIOBRA 0/ /0 RF(11879)','','',1.000,NULL,1000.00,1000.00,'Renta de Maquinaria LIgera','Entregado','2025-09-23 16:33:04','2025-09-23 16:33:04',NULL,0,0.00,0,'Efectivo',1000.00,NULL,19),(341,2,31,'PED010182','2025-09-25','Herramienta',2,'Esmeriladora de 4 pulgadas','12872','',1.000,NULL,991.38,1150.00,'','Entregado','2025-09-26 18:49:08','2025-09-26 19:27:45',NULL,0,0.00,1,'Efectivo',991.38,NULL,19),(342,2,31,'PED010182','2025-09-25','Herramienta',2,'Disco de diamante rin turbo 4 pulgadas','12980','',1.000,NULL,99.14,115.00,'','Entregado','2025-09-26 18:49:08','2025-09-26 19:27:45',NULL,0,0.00,1,'Efectivo',99.14,NULL,19),(343,2,31,'PED010170','2025-09-25','Herramienta',2,'LIjadora roto orbital 5 pulgadas','103735','',1.000,NULL,818.97,950.01,'','Entregado','2025-09-26 18:52:42','2025-09-26 18:52:42',NULL,0,0.00,1,'Efectivo',818.97,NULL,19),(344,2,31,'PED010170','2025-09-25','Herramienta',2,'Copa de diamente doble hilera 4 pulgadas','103212','',1.000,NULL,340.52,395.00,'','Entregado','2025-09-26 18:52:42','2025-09-26 18:52:42',NULL,0,0.00,1,'Efectivo',340.52,NULL,19),(345,1,19,'4993','2025-10-03','Ferretería',6,'Cepillo HDX tallador','','',2.000,NULL,149.00,298.00,'','Entregado','2025-10-03 20:22:04','2025-10-03 20:22:04',NULL,0,0.00,0,'Efectivo',298.00,NULL,19),(346,1,19,'4993','2025-10-03','Ferretería',6,'Sellador para Concreto','','',7.000,NULL,99.00,693.00,'','Entregado','2025-10-03 20:22:04','2025-10-03 20:22:04',NULL,0,0.00,0,'Efectivo',693.00,NULL,19),(347,1,19,'4993','2025-10-03','Ferretería',6,'Pistota calefactora','','',1.000,NULL,60.54,60.54,'','Entregado','2025-10-03 20:22:04','2025-10-03 20:22:04',NULL,0,0.00,0,'Efectivo',60.54,NULL,19),(348,1,19,'0795','2025-10-03','Ferretería',6,'CONT DUP COMERCIAL','','',2.000,NULL,100.40,232.93,'','Entregado','2025-10-03 20:40:44','2025-10-03 20:40:44',NULL,0,0.00,1,'Efectivo',200.80,NULL,19),(349,1,19,'0795','2025-10-03','Ferretería',6,'CLAVIJA BLINDADA 3X1','','',2.000,NULL,84.48,195.99,'','Entregado','2025-10-03 20:40:44','2025-10-03 20:40:44',NULL,0,0.00,1,'Efectivo',168.96,NULL,19),(350,1,19,'0795','2025-10-03','Ferretería',6,'PLACA P/INTEMPERIE','','',2.000,NULL,126.48,293.43,'','Entregado','2025-10-03 20:40:44','2025-10-03 20:40:44',NULL,0,0.00,1,'Efectivo',252.96,NULL,19),(351,1,32,'1294','2025-10-09','Material',5,'Duela Metálica 3.00 mts','','111 piezas por 15 dias',1665.000,NULL,1.10,1831.50,'RENTA DE EQUIPO O MATERIAL PARA OBRA','Entregado','2025-10-09 19:29:33','2025-10-09 19:29:33',NULL,0,0.00,0,'Efectivo',1831.50,NULL,19),(352,1,32,'1294','2025-10-09','Material',5,'Duela Metálica 3.00 mts ','','15 piezas por 30 dias',450.000,NULL,1.10,495.00,'RENTA DE EQUIPO O MATERIAL PARA OBRA','Entregado','2025-10-09 19:29:33','2025-10-09 19:29:33',NULL,0,0.00,0,'Efectivo',495.00,NULL,19),(353,1,32,'1294','2025-10-09','Material',5,'Puntal Metálico 2-4 mts. C/R','','2 piezas por 30 dias',60.000,NULL,2.00,120.00,'RENTA DE EQUIPO O MATERIAL PARA OBRA','Entregado','2025-10-09 19:29:33','2025-10-09 19:29:33',NULL,0,0.00,0,'Efectivo',120.00,NULL,19),(354,1,32,'1294','2025-10-09','Material',5,'Servicio','','Servicio de la cimbra',1.000,NULL,400.00,400.00,'RENTA DE EQUIPO O MATERIAL PARA OBRA','Entregado','2025-10-09 19:29:33','2025-10-09 19:29:33',NULL,0,0.00,0,'Efectivo',400.00,NULL,19),(361,1,3,'','2025-10-31','Material',7,'MAQUINARIA','','',1.000,NULL,20000.00,20000.00,'','Entregado','2025-11-03 20:43:10','2025-11-03 20:45:15',NULL,0,0.00,0,'Efectivo',20000.00,NULL,38),(362,1,27,'','2025-11-03','Material',5,'DUELA METALICA Y PUNTAL','','',1.000,NULL,8381.50,8381.50,'','Entregado','2025-11-03 20:44:36','2025-11-03 20:44:36',NULL,0,0.00,0,'Efectivo',8381.50,NULL,19),(363,8,33,'','2025-11-01','Material',17,'PAGO IMSS SEPTIEMBRE','','',1.000,NULL,7380.00,7380.00,'','Entregado','2025-11-03 20:48:08','2025-11-03 20:48:08',NULL,0,0.00,0,'Transferencia',7380.00,NULL,38),(364,8,33,'','2025-11-01','Material',17,'PAGO IMSS DIF MAYO','','',1.000,NULL,794.00,794.00,'','Entregado','2025-11-03 20:50:36','2025-11-03 20:50:36',NULL,0,0.00,0,'Transferencia',794.00,NULL,38),(365,8,34,'','2025-11-03','Material',18,'PAGO IMPUESTO ISR JULIO','','',1.000,NULL,44823.00,44823.00,'','Entregado','2025-11-03 20:53:31','2025-11-03 20:53:31',NULL,0,0.00,0,'Efectivo',44823.00,NULL,38),(373,4,35,'F-1762547645636-528','2025-11-03','Material',19,'GASOLINA','','',41.390,NULL,25.99,1075.73,'','Entregado','2025-11-07 20:38:29','2025-11-07 20:38:29',NULL,0,0.00,0,'Tarjeta',1075.73,NULL,12);
/*!40000 ALTER TABLE `suministros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicaciones_especificas`
--

DROP TABLE IF EXISTS `ubicaciones_especificas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicaciones_especificas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` text,
  `id_proyecto` int NOT NULL,
  `nombre_ubicacion` varchar(100) NOT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `orden` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_proyecto` (`id_proyecto`),
  CONSTRAINT `ubicaciones_especificas_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones_especificas`
--

LOCK TABLES `ubicaciones_especificas` WRITE;
/*!40000 ALTER TABLE `ubicaciones_especificas` DISABLE KEYS */;
/*!40000 ALTER TABLE `ubicaciones_especificas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unidades_medida`
--

DROP TABLE IF EXISTS `unidades_medida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidades_medida` (
  `id_unidad` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `simbolo` varchar(10) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL,
  PRIMARY KEY (`id_unidad`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `simbolo` (`simbolo`),
  UNIQUE KEY `unidades_medida_nombre` (`nombre`),
  UNIQUE KEY `unidades_medida_simbolo` (`simbolo`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidades_medida`
--

LOCK TABLES `unidades_medida` WRITE;
/*!40000 ALTER TABLE `unidades_medida` DISABLE KEYS */;
INSERT INTO `unidades_medida` VALUES (1,'Metro','m','Metro lineal - unidad básica de longitud',1,'2025-10-10 21:34:51','2025-10-10 21:34:51'),(2,'Centímetro','cm','Centímetro - subunidad de longitud',1,'2025-10-10 21:34:51','2025-10-10 21:34:51'),(3,'Milímetro','mm','Milímetro - medición de precisión',1,'2025-10-10 21:34:51','2025-10-10 21:34:51'),(4,'Kilómetro','km','Kilómetro - distancias largas',1,'2025-10-10 21:34:51','2025-10-10 21:34:51'),(5,'Pulgada','in','Pulgada - sistema imperial',1,'2025-10-10 21:34:52','2025-10-10 21:34:52'),(6,'Pie','ft','Pie - sistema imperial',1,'2025-10-10 21:34:52','2025-10-10 21:34:52'),(7,'Metro cuadrado','m²','Metro cuadrado - unidad de superficie',1,'2025-10-10 21:34:52','2025-10-10 21:34:52'),(8,'Centímetro cuadrado','cm²','Centímetro cuadrado - superficie pequeña',1,'2025-10-10 21:34:52','2025-10-10 21:34:52'),(9,'Hectárea','ha','Hectárea - superficies grandes',1,'2025-10-10 21:34:52','2025-10-10 21:34:52'),(10,'Pie cuadrado','ft²','Pie cuadrado - sistema imperial',1,'2025-10-10 21:34:52','2025-10-10 21:34:52'),(11,'Metro cúbico','m³','Metro cúbico - unidad de volumen',1,'2025-10-10 21:34:52','2025-10-10 21:34:52'),(12,'Litro','L','Litro - volumen de líquidos',1,'2025-10-10 21:34:52','2025-10-10 21:34:52'),(13,'Galón','gal','Galón - sistema imperial',1,'2025-10-10 21:34:52','2025-10-10 21:34:52'),(14,'Pie cúbico','ft³','Pie cúbico - sistema imperial',1,'2025-10-10 21:34:53','2025-10-10 21:34:53'),(15,'Kilogramo','kg','Kilogramo - unidad básica de peso',1,'2025-10-10 21:34:53','2025-10-10 21:34:53'),(16,'Gramo','g','Gramo - peso pequeño',1,'2025-10-10 21:34:53','2025-10-10 21:34:53'),(17,'Tonelada','t','Tonelada métrica - peso grande',1,'2025-10-10 21:34:53','2025-10-10 21:34:53'),(18,'Libra','lb','Libra - sistema imperial',1,'2025-10-10 21:34:53','2025-10-10 21:34:53'),(19,'Pieza','pza','Pieza individual',1,'2025-10-10 21:34:53','2025-10-10 21:34:53'),(20,'Lote','lote','Lote o conjunto de elementos',1,'2025-10-10 21:34:53','2025-10-10 21:34:53'),(21,'Caja','caja','Caja o empaque',1,'2025-10-10 21:34:53','2025-10-10 21:34:53'),(22,'Saco','saco','Saco o bolsa',1,'2025-10-10 21:34:53','2025-10-10 21:34:53'),(23,'Rollo','rollo','Rollo de material flexible',1,'2025-10-10 21:34:54','2025-10-10 21:34:54'),(24,'Varilla','var','Varilla de acero de refuerzo',1,'2025-10-10 21:34:54','2025-10-10 21:34:54'),(25,'Tubo','tubo','Tubo o tubería',1,'2025-10-10 21:34:54','2025-10-10 21:34:54'),(26,'Lámina','lam','Lámina o placa',1,'2025-10-10 21:34:54','2025-10-10 21:34:54'),(28,'Tabique','tab','Tabique o ladrillo',1,'2025-10-10 21:34:54','2025-10-10 21:34:54'),(29,'Hora','hr','Hora de trabajo',1,'2025-10-10 21:34:54','2025-10-10 21:34:54'),(30,'Día','día','Día laboral',1,'2025-10-10 21:34:54','2025-10-10 21:34:54'),(31,'Jornada','jor','Jornada de trabajo (8 horas)',1,'2025-10-10 21:34:54','2025-10-10 21:34:54'),(32,'Semana','sem','Semana laboral',1,'2025-10-10 21:34:54','2025-10-10 21:34:54'),(33,'Mes','mes','Mes de trabajo',1,'2025-10-10 21:34:55','2025-10-10 21:34:55'),(34,'Global','global','Trabajo global o integral',1,'2025-10-10 21:34:55','2025-10-10 21:34:55'),(35,'Estimación','est','Estimación de trabajo',1,'2025-10-10 21:34:55','2025-10-10 21:34:55'),(36,'Salida','salida','Salida técnica o visita',1,'2025-10-10 21:34:55','2025-10-10 21:34:55'),(37,'Servicio','serv','Servicio especializado',1,'2025-10-10 21:34:55','2025-10-10 21:34:55'),(38,'PARTIDA','PDA','Actividad específica',1,'2025-10-10 21:34:55','2025-11-03 20:48:37'),(39,'Punto','pto','Punto eléctrico o de instalación',1,'2025-10-10 21:34:55','2025-10-10 21:34:55'),(40,'Contacto','cont','Contacto eléctrico',1,'2025-10-10 21:34:55','2025-10-10 21:34:55'),(41,'Salida eléctrica','sal','Salida de instalación eléctrica',1,'2025-10-10 21:34:55','2025-10-10 21:34:55'),(42,'Mueble','mue','Mueble sanitario',1,'2025-10-10 21:34:56','2025-10-10 21:34:56'),(43,'Luminaria','lum','Luminaria o fixture',1,'2025-10-10 21:34:56','2025-10-10 21:34:56');
/*!40000 ALTER TABLE `unidades_medida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `id_user_settings` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `settings` json NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user_settings`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_shortcuts`
--

DROP TABLE IF EXISTS `user_shortcuts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_shortcuts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `shortcut_key` varchar(50) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `context` varchar(50) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_editable` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_shortcut_context` (`id_usuario`,`shortcut_key`,`context`),
  UNIQUE KEY `unique_user_action_context` (`id_usuario`,`action_type`,`context`),
  CONSTRAINT `user_shortcuts_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_shortcuts`
--

LOCK TABLES `user_shortcuts` WRITE;
/*!40000 ALTER TABLE `user_shortcuts` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_shortcuts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `id_rol` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuarios_nombre` (`nombre_usuario`),
  KEY `idx_usuarios_email` (`email`),
  KEY `idx_usuarios_rol` (`id_rol`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','admin@vlock.com','$2b$10$zxIGI6j7qCaRz2uqJD3gVuIHacwUPSxlId/NQSNKplQB/1A/T3u0.',1,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(4,'Gael','gael@vlock.com','$2b$10$y4cWVWUE4pAqb7VsHGi.te04vKLOfxpOL6NzR.9pIJrMrPHdZ3w2.',1,1,'2025-11-08 15:45:25','2025-11-08 15:45:25');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'railway'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_actualizar_stock_herramienta` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_actualizar_stock_herramienta`(IN p_id_herramienta INT)
BEGIN
        DECLARE total_entradas INT DEFAULT 0;
        DECLARE total_salidas INT DEFAULT 0;
        DECLARE total_bajas INT DEFAULT 0;
        DECLARE stock_inicial_herramienta INT DEFAULT 0;
        DECLARE nuevo_stock INT DEFAULT 0;
        
        -- Obtener el stock inicial de la herramienta
        SELECT COALESCE(stock_inicial, 0) INTO stock_inicial_herramienta
        FROM herramientas 
        WHERE id_herramienta = p_id_herramienta;
        
        -- Calcular totales de movimientos (solo movimientos adicionales al stock inicial)
        SELECT 
          COALESCE(SUM(CASE WHEN tipo_movimiento = 'Entrada' THEN cantidad ELSE 0 END), 0),
          COALESCE(SUM(CASE WHEN tipo_movimiento = 'Salida' THEN cantidad ELSE 0 END), 0),
          COALESCE(SUM(CASE WHEN tipo_movimiento = 'Baja' THEN cantidad ELSE 0 END), 0)
        INTO total_entradas, total_salidas, total_bajas
        FROM movimientos_herramienta
        WHERE id_herramienta = p_id_herramienta;
        
        -- Calcular nuevo stock: stock_inicial + entradas - salidas - bajas
        SET nuevo_stock = stock_inicial_herramienta + total_entradas - total_salidas - total_bajas;
        
        -- Actualizar el stock en la tabla herramientas
        UPDATE herramientas 
        SET stock = nuevo_stock
        WHERE id_herramienta = p_id_herramienta;
        
        -- Validar que el stock no sea negativo
        IF nuevo_stock < 0 THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Error: El stock no puede ser negativo';
        END IF;
      END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_calcular_nomina_semanal` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_calcular_nomina_semanal`(IN p_id_semana INT)
BEGIN
  DECLARE v_fecha_inicio DATE;
  DECLARE v_fecha_fin DATE;
  
  
  SELECT fecha_inicio, fecha_fin 
  INTO v_fecha_inicio, v_fecha_fin
  FROM semanas_nomina
  WHERE id_semana = p_id_semana;
  
  
  DELETE FROM nomina_empleado WHERE id_semana = p_id_semana;
  
  
  INSERT INTO nomina_empleado (
    id_empleado, id_semana, dias_trabajados, total_pagar, fecha_calculo
  )
  SELECT 
    e.id_empleado,
    p_id_semana,
    7.0, 
    ROUND(7.0 * c.salario_diario, 2),
    NOW()
  FROM empleados e
  INNER JOIN contratos c ON e.id_contrato = c.id_contrato
  WHERE 
    (e.fecha_alta <= v_fecha_fin) AND
    (e.fecha_baja IS NULL OR e.fecha_baja >= v_fecha_inicio);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_generar_estado_cuenta` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_generar_estado_cuenta`(IN p_id_proyecto INT, IN p_fecha DATE)
BEGIN
  DECLARE v_saldo_inicial DECIMAL(10,2);
  DECLARE v_ingresos DECIMAL(10,2);
  DECLARE v_gastos DECIMAL(10,2);
  DECLARE v_saldo_final DECIMAL(10,2);
  DECLARE v_fecha_anterior DATE;
  
  
  SELECT MAX(fecha) INTO v_fecha_anterior
  FROM estados_cuenta
  WHERE id_proyecto = p_id_proyecto AND fecha < p_fecha;
  
  
  IF v_fecha_anterior IS NULL THEN
    SET v_saldo_inicial = 0;
  ELSE
    
    SELECT saldo_final INTO v_saldo_inicial
    FROM estados_cuenta
    WHERE id_proyecto = p_id_proyecto AND fecha = v_fecha_anterior;
  END IF;
  
  
  SELECT COALESCE(SUM(monto), 0) INTO v_ingresos
  FROM ingresos
  WHERE id_proyecto = p_id_proyecto AND fecha <= p_fecha
    AND (v_fecha_anterior IS NULL OR fecha > v_fecha_anterior);
  
  
  SELECT COALESCE(SUM(monto), 0) INTO v_gastos
  FROM gastos
  WHERE id_proyecto = p_id_proyecto AND fecha <= p_fecha
    AND (v_fecha_anterior IS NULL OR fecha > v_fecha_anterior);
  
  
  SET v_saldo_final = v_saldo_inicial + v_ingresos - v_gastos;
  
  
  INSERT INTO estados_cuenta (
    id_proyecto, fecha, saldo_inicial, ingresos, gastos, saldo_final
  ) VALUES (
    p_id_proyecto, p_fecha, v_saldo_inicial, v_ingresos, v_gastos, v_saldo_final
  )
  ON DUPLICATE KEY UPDATE
    saldo_inicial = v_saldo_inicial,
    ingresos = v_ingresos,
    gastos = v_gastos,
    saldo_final = v_saldo_final;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-13 10:32:59
