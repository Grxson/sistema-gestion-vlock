-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: sistema_gestion
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.1

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
-- Table structure for table `acciones_permisos`
--

DROP TABLE IF EXISTS `acciones_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acciones_permisos` (
  `id_accion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `codigo` varchar(30) NOT NULL,
  `descripcion` text,
  `modulo` varchar(30) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL,
  PRIMARY KEY (`id_accion`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acciones_permisos`
--

LOCK TABLES `acciones_permisos` WRITE;
/*!40000 ALTER TABLE `acciones_permisos` DISABLE KEYS */;
INSERT INTO `acciones_permisos` VALUES (1,'Ver usuarios','usuarios.ver','Ver lista de usuarios','usuarios','2025-08-18 16:00:59','2025-08-18 16:00:59'),(2,'Crear usuario','usuarios.crear','Crear nuevos usuarios','usuarios','2025-08-18 16:00:59','2025-08-18 16:00:59'),(3,'Editar usuario','usuarios.editar','Modificar usuarios existentes','usuarios','2025-08-18 16:00:59','2025-08-18 16:00:59'),(4,'Eliminar usuario','usuarios.eliminar','Eliminar usuarios','usuarios','2025-08-18 16:00:59','2025-08-18 16:00:59'),(5,'Ver proyectos','proyectos.ver','Ver lista de proyectos','proyectos','2025-08-18 16:00:59','2025-08-18 16:00:59'),(6,'Crear proyecto','proyectos.crear','Crear nuevos proyectos','proyectos','2025-08-18 16:00:59','2025-08-18 16:00:59'),(7,'Editar proyecto','proyectos.editar','Modificar proyectos existentes','proyectos','2025-08-18 16:00:59','2025-08-18 16:00:59'),(8,'Eliminar proyecto','proyectos.eliminar','Eliminar proyectos','proyectos','2025-08-18 16:01:00','2025-08-18 16:01:00'),(9,'Ver empleados','empleados.ver','Ver lista de empleados','empleados','2025-08-18 16:01:00','2025-08-18 16:01:00'),(10,'Crear empleado','empleados.crear','Crear nuevos empleados','empleados','2025-08-18 16:01:00','2025-08-18 16:01:00'),(11,'Editar empleado','empleados.editar','Modificar empleados existentes','empleados','2025-08-18 16:01:00','2025-08-18 16:01:00'),(12,'Eliminar empleado','empleados.eliminar','Eliminar empleados','empleados','2025-08-18 16:01:00','2025-08-18 16:01:00'),(13,'Ver gastos','finanzas.gastos.ver','Ver registro de gastos','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(14,'Crear gasto','finanzas.gastos.crear','Registrar nuevos gastos','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(15,'Editar gasto','finanzas.gastos.editar','Modificar gastos existentes','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(16,'Eliminar gasto','finanzas.gastos.eliminar','Eliminar gastos','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(17,'Ver ingresos','finanzas.ingresos.ver','Ver registro de ingresos','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(18,'Crear ingreso','finanzas.ingresos.crear','Registrar nuevos ingresos','finanzas','2025-08-18 16:01:00','2025-08-18 16:01:00'),(19,'Ver reportes','reportes.ver','Ver reportes','reportes','2025-08-18 16:01:00','2025-08-18 16:01:00'),(20,'Generar reportes','reportes.generar','Generar nuevos reportes','reportes','2025-08-18 16:01:00','2025-08-18 16:01:00'),(21,'Ver configuración','configuracion.ver','Ver configuración del sistema','configuracion','2025-08-18 16:01:00','2025-08-18 16:01:00'),(22,'Editar configuración','configuracion.editar','Modificar configuración del sistema','configuracion','2025-08-18 16:01:00','2025-08-18 16:01:00'),(23,'Ver contratos','contratos.ver','Ver lista de contratos','contratos','2025-08-19 19:23:46','2025-08-19 19:23:46'),(24,'Crear contrato','contratos.crear','Crear nuevos contratos','contratos','2025-08-19 19:23:46','2025-08-19 19:23:46'),(25,'Editar contrato','contratos.editar','Modificar contratos existentes','contratos','2025-08-19 19:23:46','2025-08-19 19:23:46'),(26,'Eliminar contrato','contratos.eliminar','Eliminar contratos','contratos','2025-08-19 19:23:46','2025-08-19 19:23:46'),(27,'Ver oficios','oficios.ver','Ver lista de oficios','oficios','2025-08-19 19:23:46','2025-08-19 19:23:46'),(28,'Crear oficio','oficios.crear','Crear nuevos oficios','oficios','2025-08-19 19:23:46','2025-08-19 19:23:46'),(29,'Editar oficio','oficios.editar','Modificar oficios existentes','oficios','2025-08-19 19:23:46','2025-08-19 19:23:46'),(30,'Eliminar oficio','oficios.eliminar','Eliminar oficios','oficios','2025-08-19 19:23:46','2025-08-19 19:23:46'),(31,'Ver nómina','nomina.ver','Ver nómina de empleados','nomina','2025-08-19 19:23:46','2025-08-19 19:23:46'),(32,'Crear nómina','nomina.crear','Crear nueva nómina','nomina','2025-08-19 19:23:46','2025-08-19 19:23:46'),(33,'Editar nómina','nomina.editar','Modificar nómina existente','nomina','2025-08-19 19:23:46','2025-08-19 19:23:46'),(34,'Procesar nómina','nomina.procesar','Procesar pagos de nómina','nomina','2025-08-19 19:23:46','2025-08-19 19:23:46'),(35,'Ver auditoría','auditoria.ver','Ver registros de auditoría','auditoria','2025-08-19 19:23:46','2025-08-19 19:23:46'),(36,'Exportar auditoría','auditoria.exportar','Exportar registros de auditoría','auditoria','2025-08-19 19:23:46','2025-08-19 19:23:46'),(37,'Ver roles','roles.ver','Ver roles y sus permisos','roles','2025-08-19 19:30:14','2025-08-19 19:30:14'),(38,'Crear rol','roles.crear','Crear nuevos roles','roles','2025-08-19 19:30:14','2025-08-19 19:30:14'),(39,'Editar rol','roles.editar','Modificar roles existentes','roles','2025-08-19 19:30:14','2025-08-19 19:30:14'),(40,'Eliminar rol','roles.eliminar','Eliminar roles','roles','2025-08-19 19:30:14','2025-08-19 19:30:14'),(41,'Eliminar nómina','nomina.eliminar','Eliminar registros de nómina','nomina','2025-08-20 17:22:48','2025-08-20 17:22:48'),(42,'Exportar reportes','reportes.exportar','Exportar reportes a diferentes formatos','reportes','2025-08-20 17:22:48','2025-08-20 17:22:48'),(43,'Asignar permisos','roles.permisos','Gestionar permisos de roles','roles','2025-08-20 17:22:48','2025-08-20 17:22:48');
/*!40000 ALTER TABLE `acciones_permisos` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
INSERT INTO `auditoria` VALUES (1,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-18 16:27:54','::1',NULL,NULL),(2,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 1 de \'Pendiente\' a \'Pendiente\'','2025-08-18 18:01:01',NULL,'\"{\\\"estado\\\":\\\"Pendiente\\\"}\"','\"{\\\"estado\\\":\\\"Pendiente\\\"}\"'),(3,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 1 de \'Pendiente\' a \'En_Proceso\'','2025-08-18 18:02:47',NULL,'\"{\\\"estado\\\":\\\"Pendiente\\\"}\"','\"{\\\"estado\\\":\\\"En_Proceso\\\"}\"'),(4,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 1 de \'En_Proceso\' a \'Aprobada\'','2025-08-18 18:03:01',NULL,'\"{\\\"estado\\\":\\\"En_Proceso\\\"}\"','\"{\\\"estado\\\":\\\"Aprobada\\\"}\"'),(5,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 1 de \'Aprobada\' a \'Pagado\'','2025-08-18 18:03:12',NULL,'\"{\\\"estado\\\":\\\"Aprobada\\\"}\"','\"{\\\"estado\\\":\\\"Pagado\\\"}\"'),(6,1,'UPDATE','nomina_empleado','Cambio de estado de nómina ID 2 de \'Pendiente\' a \'Cancelada\'','2025-08-18 18:03:52',NULL,'\"{\\\"estado\\\":\\\"Pendiente\\\"}\"','\"{\\\"estado\\\":\\\"Cancelada\\\"}\"'),(7,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 16:15:23','::1',NULL,NULL),(8,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 16:21:43','::1',NULL,NULL),(9,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 17:40:45','::1',NULL,NULL),(10,2,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 17:41:43','::1',NULL,NULL),(11,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 18:51:31','::1',NULL,NULL),(12,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 19:09:34','::1',NULL,NULL),(13,2,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 19:13:37','::1',NULL,NULL),(14,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 19:19:32','::1',NULL,NULL),(15,2,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 19:27:16','::1',NULL,NULL),(16,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 19:36:55','::1',NULL,NULL),(17,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 19:50:28','::1',NULL,NULL),(18,2,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 20:24:36','::1',NULL,NULL),(19,2,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-19 20:57:31','::1',NULL,NULL),(20,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-20 16:50:32','::1',NULL,NULL),(21,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-20 17:02:11','::1',NULL,NULL),(22,2,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-20 17:13:56','::1',NULL,NULL),(23,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-20 18:00:50','::1',NULL,NULL),(24,2,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-20 18:02:28','::1',NULL,NULL),(25,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-27 20:19:52','127.0.0.1',NULL,NULL),(26,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-08-28 18:16:52','127.0.0.1',NULL,NULL),(27,1,'LOGOUT','usuarios','Cierre de sesión exitoso','2025-09-04 17:48:23','127.0.0.1',NULL,NULL);
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
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
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_gastos`
--

LOCK TABLES `categorias_gastos` WRITE;
/*!40000 ALTER TABLE `categorias_gastos` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_herramienta`
--

LOCK TABLES `categorias_herramienta` WRITE;
/*!40000 ALTER TABLE `categorias_herramienta` DISABLE KEYS */;
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
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `categorias_suministro_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_suministro`
--

LOCK TABLES `categorias_suministro` WRITE;
/*!40000 ALTER TABLE `categorias_suministro` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias_suministro` ENABLE KEYS */;
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
  PRIMARY KEY (`id_empleado`),
  KEY `idx_empleados_nombre` (`nombre`,`apellido`),
  KEY `idx_empleados_contrato` (`id_contrato`),
  KEY `idx_empleados_oficio` (`id_oficio`),
  KEY `idx_empleados_fechas` (`fecha_alta`,`fecha_baja`),
  KEY `fk_empleados_proyecto` (`id_proyecto`),
  CONSTRAINT `empleados_ibfk_1` FOREIGN KEY (`id_contrato`) REFERENCES `contratos` (`id_contrato`),
  CONSTRAINT `empleados_ibfk_2` FOREIGN KEY (`id_oficio`) REFERENCES `oficios` (`id_oficio`),
  CONSTRAINT `fk_empleados_proyecto` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleados`
--

LOCK TABLES `empleados` WRITE;
/*!40000 ALTER TABLE `empleados` DISABLE KEYS */;
INSERT INTO `empleados` VALUES (2,'Juan Actualizado','Pérez López','12345678901','5512345678','María Pérez','5587654321','Santander','0987654321',1,1,1,NULL,1,'2023-08-01',NULL,'eventual',NULL,'semanal',NULL),(3,'Prueba','Prueba','122345678','12345678','123456','123456','12345','12345',NULL,3,NULL,NULL,1,'2025-08-19',NULL,'eventual',NULL,'semanal',NULL),(7,'Carlos','González',NULL,'555-0001',NULL,NULL,NULL,NULL,14,1,NULL,NULL,1,'2025-08-01',NULL,'fijo',600.00,'quincenal','Empleado fijo con prestaciones'),(8,'Luis','Rodríguez',NULL,'555-0003',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,1,'2025-08-10',NULL,'por_proyecto',450.00,'semanal','Pago por proyecto, tarifa especializada'),(10,'Juan Carlos','Pérez García','99999999999','666123457','María Carmen Pérez','666654322','BBVA','ES9876543210987654321098',1,3,3,325.75,1,'2025-09-11',NULL,'eventual',NULL,'semanal',NULL);
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
  CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`),
  CONSTRAINT `gastos_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_gasto` (`id_categoria`)
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
  `stock_total` int DEFAULT '0',
  `stock_disponible` int DEFAULT '0',
  `stock_minimo` int DEFAULT '0',
  `ubicacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_herramienta`),
  KEY `idx_herramientas_nombre` (`nombre`),
  KEY `idx_herramientas_categoria` (`id_categoria_herr`),
  KEY `idx_herramientas_stock` (`stock_disponible`),
  CONSTRAINT `herramientas_ibfk_1` FOREIGN KEY (`id_categoria_herr`) REFERENCES `categorias_herramienta` (`id_categoria_herr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `herramientas`
--

LOCK TABLES `herramientas` WRITE;
/*!40000 ALTER TABLE `herramientas` DISABLE KEYS */;
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
  `concepto` varchar(100) NOT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `notas` text,
  PRIMARY KEY (`id_ingreso`),
  KEY `idx_ingresos_proyecto` (`id_proyecto`),
  KEY `idx_ingresos_fecha` (`fecha`),
  CONSTRAINT `ingresos_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingresos`
--

LOCK TABLES `ingresos` WRITE;
/*!40000 ALTER TABLE `ingresos` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingresos` ENABLE KEYS */;
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
  `tipo_movimiento` enum('Entrada','Salida','Baja') NOT NULL,
  `cantidad` int NOT NULL,
  `fecha_movimiento` datetime NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `notas` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_movimientos_herr` (`id_herramienta`),
  KEY `idx_movimientos_proyecto` (`id_proyecto`),
  KEY `idx_movimientos_tipo` (`tipo_movimiento`),
  KEY `idx_movimientos_fecha` (`fecha_movimiento`),
  KEY `idx_movimientos_fecha_tipo` (`fecha_movimiento`,`tipo_movimiento`),
  CONSTRAINT `movimientos_herramienta_ibfk_1` FOREIGN KEY (`id_herramienta`) REFERENCES `herramientas` (`id_herramienta`),
  CONSTRAINT `movimientos_herramienta_ibfk_2` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`),
  CONSTRAINT `movimientos_herramienta_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_before_movimiento_herramienta` BEFORE INSERT ON `movimientos_herramienta` FOR EACH ROW BEGIN
  DECLARE stock_actual INT;
  
  IF NEW.tipo_movimiento = 'Salida' THEN
    -- Verificar stock disponible
    SELECT stock_disponible INTO stock_actual 
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
  `pago_por_dia` decimal(10,2) NOT NULL,
  `horas_extra` decimal(10,2) DEFAULT NULL,
  `deducciones` decimal(10,2) DEFAULT NULL,
  `bonos` decimal(10,2) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL,
  `estado` enum('borrador','generada','revisada','pagada','archivada','cancelada') DEFAULT 'borrador',
  `version` int DEFAULT '1',
  `creada_por` int DEFAULT NULL,
  `revisada_por` int DEFAULT NULL,
  `pagada_por` int DEFAULT NULL,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `fecha_pago` timestamp NULL DEFAULT NULL,
  `motivo_ultimo_cambio` text,
  `archivo_pdf_path` varchar(500) DEFAULT NULL,
  `recibo_pdf` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_nomina`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nomina_empleados`
--

LOCK TABLES `nomina_empleados` WRITE;
/*!40000 ALTER TABLE `nomina_empleados` DISABLE KEYS */;
INSERT INTO `nomina_empleados` VALUES (1,1,1,1,5,350.50,2.00,315.21,500.00,1939.29,'pagada',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/recibos/recibo_1_1755794562216.pdf','2025-08-18 17:51:19','2025-08-21 12:18:08'),(2,1,1,2,6,350.50,4.00,315.21,300.00,2438.29,'cancelada',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-18 17:54:31','2025-08-21 12:18:08'),(3,1,1,NULL,6,350.50,4.00,315.21,400.00,2438.29,'generada',4,NULL,NULL,NULL,NULL,NULL,'Ajuste de bonos por excelente desempeño',NULL,'/uploads/recibos/recibo_3_1755794490980.pdf','2025-08-18 19:52:24','2025-08-21 18:51:11'),(4,1,1,1,5,350.50,4.00,94.18,300.00,2308.82,'borrador',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/recibos/recibo_4_1755547668587.pdf','2025-08-18 20:07:15','2025-08-21 12:18:08'),(5,2,1,2,6,350.50,4.00,115.21,300.00,2638.29,'pagada',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/recibos/recibo_5_1755549914655.pdf','2025-08-18 20:08:42','2025-08-21 12:18:08'),(6,2,1,1,6,333.33,0.00,70.00,0.00,1929.98,'borrador',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/recibos/recibo_6_1755794898176.pdf','2025-08-18 21:18:00','2025-08-21 12:18:08'),(7,2,1,1,6,333.33,0.00,0.00,0.00,1999.98,'borrador',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/recibos/recibo_7_1755794580365.pdf','2025-08-18 21:18:10','2025-08-21 12:18:08'),(8,3,1,1,6,233.33,0.00,34.00,0.00,1366.00,'borrador',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-21 16:48:47','2025-08-21 12:18:08'),(9,3,1,1,6,333.33,0.00,70.00,0.00,1930.00,'borrador',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/recibos/recibo_9_1755795162244.pdf','2025-08-21 16:52:22','2025-08-21 12:18:08'),(10,3,1,2,6,333.33,0.00,0.00,0.00,2000.00,'borrador',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/recibos/recibo_10_1755797812936.pdf','2025-08-21 17:36:39','2025-08-21 12:18:08'),(11,7,6,1,6,400.00,0.00,0.00,0.00,2400.00,'borrador',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/recibos/recibo_11_1755798435869.pdf','2025-08-21 17:47:09','2025-08-21 12:18:08');
/*!40000 ALTER TABLE `nomina_empleados` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nomina_historials`
--

LOCK TABLES `nomina_historials` WRITE;
/*!40000 ALTER TABLE `nomina_historials` DISABLE KEYS */;
INSERT INTO `nomina_historials` VALUES (1,2,1,'creacion',NULL,'Pendiente','{\"bonos\": 300, \"deducciones\": 315.21, \"horas_extra\": 4, \"monto_total\": 2438.29, \"pago_por_dia\": 350.5, \"dias_laborados\": 6}','2025-08-18 17:54:31','2025-08-18 17:54:31','2025-08-18 17:54:31'),(2,1,1,'cambio_estado','Pendiente','Pendiente','{\"motivo\": \"No especificado\"}','2025-08-18 18:01:01','2025-08-18 18:01:01','2025-08-18 18:01:01'),(3,1,1,'cambio_estado','Pendiente','En_Proceso','{\"motivo\": \"No especificado\"}','2025-08-18 18:02:47','2025-08-18 18:02:47','2025-08-18 18:02:47'),(4,1,1,'cambio_estado','En_Proceso','Aprobada','{\"motivo\": \"No especificado\"}','2025-08-18 18:03:01','2025-08-18 18:03:01','2025-08-18 18:03:01'),(5,1,1,'cambio_estado','Aprobada','Pagado','{\"motivo\": \"No especificado\"}','2025-08-18 18:03:12','2025-08-18 18:03:12','2025-08-18 18:03:12'),(6,2,1,'cambio_estado','Pendiente','Cancelada','{\"motivo\": \"No especificado\"}','2025-08-18 18:03:52','2025-08-18 18:03:52','2025-08-18 18:03:52'),(7,1,1,'pago','Pagado','Pagado','{\"monto\": 2203, \"id_pago\": 1, \"referencia\": \"TR-123456789\", \"metodo_pago\": \"Transferencia\"}','2025-08-18 18:05:08','2025-08-18 18:05:08','2025-08-18 18:05:08'),(8,3,1,'creacion',NULL,'Pendiente','{\"bonos\": 300, \"deducciones\": 315.21, \"horas_extra\": 4, \"monto_total\": 2438.29, \"pago_por_dia\": 350.5, \"dias_laborados\": 6}','2025-08-18 19:52:24','2025-08-18 19:52:24','2025-08-18 19:52:24'),(9,1,1,'pago','Pagado','Pagado','{\"monto\": 2203, \"id_pago\": 2, \"referencia\": \"TR-123456789\", \"metodo_pago\": \"Transferencia\"}','2025-08-18 19:52:57','2025-08-18 19:52:57','2025-08-18 19:52:57'),(10,4,1,'creacion',NULL,'Pendiente','{\"bonos\": 300, \"deducciones\": 94.18, \"horas_extra\": 4, \"monto_total\": 2308.82, \"pago_por_dia\": 350.5, \"dias_laborados\": 5}','2025-08-18 20:07:15','2025-08-18 20:07:15','2025-08-18 20:07:15'),(11,5,1,'creacion',NULL,'Pendiente','{\"bonos\": 300, \"deducciones\": 115.21, \"horas_extra\": 4, \"monto_total\": 2638.29, \"pago_por_dia\": 350.5, \"dias_laborados\": 6}','2025-08-18 20:08:42','2025-08-18 20:08:42','2025-08-18 20:08:42'),(12,5,1,'pago','Pendiente','Pagado','{\"monto\": 2350.5, \"id_pago\": 3, \"referencia\": \"Pago semanal\", \"metodo_pago\": \"Efectivo\"}','2025-08-18 20:10:38','2025-08-18 20:10:38','2025-08-18 20:10:38'),(13,6,1,'creacion',NULL,'Pendiente','{\"bonos\": 0, \"deducciones\": 69.99879999999999, \"horas_extra\": 0, \"monto_total\": 1929.9812, \"pago_por_dia\": 333.33, \"dias_laborados\": 6}','2025-08-18 21:18:00','2025-08-18 21:18:00','2025-08-18 21:18:00'),(14,7,1,'creacion',NULL,'Pendiente','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 1999.98, \"pago_por_dia\": 333.33, \"dias_laborados\": 6}','2025-08-18 21:18:10','2025-08-18 21:18:10','2025-08-18 21:18:10'),(15,5,1,'pago','Pagado','Pagado','{\"monto\": 2000, \"id_pago\": 4, \"referencia\": \"Pago semanal\", \"metodo_pago\": \"Transferencia\"}','2025-08-18 21:19:25','2025-08-18 21:19:25','2025-08-18 21:19:25'),(16,0,0,'creacion',NULL,NULL,NULL,'2025-08-20 21:43:52','2025-08-20 21:43:52','2025-08-20 21:43:52'),(17,0,0,'creacion',NULL,NULL,NULL,'2025-08-20 21:43:52','2025-08-20 21:43:52','2025-08-20 21:43:52'),(18,0,0,'creacion',NULL,NULL,NULL,'2025-08-20 21:43:52','2025-08-20 21:43:52','2025-08-20 21:43:52'),(19,0,0,'creacion',NULL,NULL,NULL,'2025-08-20 21:43:52','2025-08-20 21:43:52','2025-08-20 21:43:52'),(20,8,1,'creacion',NULL,'Pendiente','{\"bonos\": 0, \"deducciones\": 34, \"horas_extra\": 0, \"monto_total\": 1366, \"pago_por_dia\": 233.33, \"dias_laborados\": 6}','2025-08-21 16:48:47','2025-08-21 16:48:47','2025-08-21 16:48:47'),(21,9,1,'creacion',NULL,'Pendiente','{\"bonos\": 0, \"deducciones\": 70, \"horas_extra\": 0, \"monto_total\": 1930, \"pago_por_dia\": 333.33, \"dias_laborados\": 6}','2025-08-21 16:52:22','2025-08-21 16:52:22','2025-08-21 16:52:22'),(22,10,1,'creacion',NULL,'Pendiente','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 2000, \"pago_por_dia\": 333.33, \"dias_laborados\": 6}','2025-08-21 17:36:39','2025-08-21 17:36:39','2025-08-21 17:36:39'),(23,11,1,'creacion',NULL,'Pendiente','{\"bonos\": 0, \"deducciones\": 0, \"horas_extra\": 0, \"monto_total\": 2400, \"pago_por_dia\": 400, \"dias_laborados\": 6}','2025-08-21 17:47:09','2025-08-21 17:47:09','2025-08-21 17:47:09');
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oficios`
--

LOCK TABLES `oficios` WRITE;
/*!40000 ALTER TABLE `oficios` DISABLE KEYS */;
INSERT INTO `oficios` VALUES (1,'Albañil Certificado','Profesional de la construcción con certificación en técnicas modernas',NULL,400.00,'Tarifa base para albañilería general'),(3,'Plomero','Instalaciones hidráulicas',NULL,NULL,NULL),(4,'Carpintero','Trabajo en madera',NULL,NULL,NULL),(5,'Pintor','Acabados en pintura',NULL,NULL,NULL),(6,'Soldador','Trabajos de soldadura',NULL,NULL,NULL),(7,'Técnico HVAC','Aire acondicionado y ventilación',NULL,NULL,NULL),(9,'Albañil','Construcción general',NULL,400.00,'Tarifa base para albañilería general'),(10,'Electricista','Instalaciones eléctricas',NULL,NULL,NULL),(11,'Desarrollador','Desarrollo de software',NULL,NULL,NULL),(12,'Diseñador','Diseño gráfico y UI/UX',NULL,NULL,NULL),(13,'Project Manager','Gestión de proyectos',NULL,NULL,NULL),(14,'Ayudante General','Apoyo en labores generales',NULL,NULL,NULL),(15,'Operador de Maquinaria','Manejo de equipo pesado',NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_nominas`
--

LOCK TABLES `pagos_nominas` WRITE;
/*!40000 ALTER TABLE `pagos_nominas` DISABLE KEYS */;
INSERT INTO `pagos_nominas` VALUES (1,1,'2025-08-18',2203.00,'Transferencia','TR-123456789','2025-08-18 18:05:08','2025-08-18 18:05:08'),(2,1,'2025-08-18',2203.00,'Transferencia','TR-123456789','2025-08-18 19:52:57','2025-08-18 19:52:57'),(3,5,'2025-08-18',2350.50,'Efectivo','Pago semanal','2025-08-18 20:10:38','2025-08-18 20:10:38'),(4,5,'2025-08-18',2000.00,'Transferencia','Pago semanal','2025-08-18 21:19:25','2025-08-18 21:19:25');
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
) ENGINE=InnoDB AUTO_INCREMENT=699 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos_rols`
--

LOCK TABLES `permisos_rols` WRITE;
/*!40000 ALTER TABLE `permisos_rols` DISABLE KEYS */;
INSERT INTO `permisos_rols` VALUES (1,1,1,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(2,1,2,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(3,1,3,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(4,1,4,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(5,1,5,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(6,1,6,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(7,1,7,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(8,1,8,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(9,1,9,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(10,1,10,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(11,1,11,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(12,1,12,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(13,1,13,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(14,1,14,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(15,1,15,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(16,1,16,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(17,1,17,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(18,1,18,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(19,1,19,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(20,1,20,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(21,1,21,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(22,1,22,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(292,1,23,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(293,1,24,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(294,1,25,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(295,1,26,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(296,1,27,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(297,1,28,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(298,1,29,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(299,1,30,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(300,1,31,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(301,1,32,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(302,1,33,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(303,1,34,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(304,1,35,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(305,1,36,1,'2025-08-19 19:23:46','2025-08-19 19:23:46'),(310,1,37,1,'2025-08-19 19:30:14','2025-08-19 19:30:14'),(311,1,38,1,'2025-08-19 19:30:14','2025-08-19 19:30:14'),(312,1,39,1,'2025-08-19 19:30:14','2025-08-19 19:30:14'),(313,1,40,1,'2025-08-19 19:30:14','2025-08-19 19:30:14'),(475,1,41,1,'2025-08-20 17:22:49','2025-08-20 17:22:49'),(476,1,42,1,'2025-08-20 17:22:49','2025-08-20 17:22:49'),(477,1,43,1,'2025-08-20 17:22:49','2025-08-20 17:22:49'),(656,2,1,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(657,2,2,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(658,2,3,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(659,2,4,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(660,2,6,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(661,2,5,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(662,2,7,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(663,2,8,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(664,2,9,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(665,2,10,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(666,2,11,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(667,2,12,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(668,2,13,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(669,2,14,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(670,2,15,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(671,2,16,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(672,2,17,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(673,2,18,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(674,2,19,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(675,2,20,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(676,2,21,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(677,2,22,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(678,2,23,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(679,2,24,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(680,2,25,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(681,2,26,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(682,2,27,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(683,2,28,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(684,2,29,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(685,2,30,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(686,2,31,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(687,2,32,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(688,2,33,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(689,2,34,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(690,2,35,1,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(691,2,36,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(692,2,37,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(693,2,38,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(694,2,39,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(695,2,40,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(696,2,41,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(697,2,42,0,'2025-08-20 19:05:06','2025-08-20 19:05:06'),(698,2,43,0,'2025-08-20 19:05:06','2025-08-20 19:05:06');
/*!40000 ALTER TABLE `permisos_rols` ENABLE KEYS */;
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
  CONSTRAINT `presupuestos_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`),
  CONSTRAINT `presupuestos_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_gasto` (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `presupuestos`
--

LOCK TABLES `presupuestos` WRITE;
/*!40000 ALTER TABLE `presupuestos` DISABLE KEYS */;
/*!40000 ALTER TABLE `presupuestos` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,'ARGOS',NULL,NULL,NULL,NULL,NULL,NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-08-21 21:03:20','2025-09-10 19:12:03'),(2,'CEMEX',NULL,'Cemex, S.A.B. de C.V.','33-1234-5678','ventas@cemex.com',NULL,NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-08-21 21:03:30','2025-09-10 17:58:14'),(3,'PADILLAS',NULL,NULL,NULL,NULL,NULL,NULL,'MIXTO',1,NULL,NULL,NULL,'2025-08-22 18:16:53','2025-09-10 18:02:13'),(4,'CONCRETOS MAC-COY',NULL,NULL,NULL,NULL,NULL,NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-08-25 16:54:22','2025-08-25 16:54:22'),(5,'Prueba',NULL,NULL,NULL,NULL,NULL,NULL,'MIXTO',1,NULL,NULL,NULL,'2025-08-28 19:57:48','2025-09-11 18:58:48'),(10,'CONAC',NULL,NULL,'3336282676, 3336266139, 3336200659',NULL,'Volcan Popocatepetl #6713 El Colli C.P 45070 Zapopan, Jalisco',NULL,'MATERIALES',1,NULL,NULL,NULL,'2025-09-10 16:44:05','2025-09-10 16:44:05');
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
  PRIMARY KEY (`id_proyecto`),
  KEY `idx_proyectos_estado` (`estado`),
  KEY `idx_proyectos_fecha` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_proyectos_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proyectos`
--

LOCK TABLES `proyectos` WRITE;
/*!40000 ALTER TABLE `proyectos` DISABLE KEYS */;
INSERT INTO `proyectos` VALUES (1,'FLEX PARK','Construcción de Bodega W','2025-01-01',NULL,'Activo','Juan Pérez','BODEGA W EL SALTO, JALISCO'),(2,'OFICINAS CHATARRERAS','Construcción de oficinas','2025-02-01',NULL,'Activo','Ana Torres','RIO SECO, TLAQUEPAQUE, JALISCO'),(3,'Centro Comercial Sur','Desarrollo de centro comercial de 3 niveles con 80 locales','2024-06-01','2025-11-30','Pausado','Ing. Carlos Rodríguez','Guadalajara, Jalisco'),(4,'Torre Corporativa Centro','Edificio de oficinas de 25 pisos con estacionamiento subterráneo','2024-08-15','2027-03-15','Activo','Ing. Ana Martínez','Puebla, Puebla'),(5,'Fraccionamiento Las Palmas','Desarrollo habitacional de 80 casas con clubhouse','2024-10-01',NULL,'Activo','Arq. Roberto Sánchez','Querétaro, Querétaro');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semanas_nominas`
--

LOCK TABLES `semanas_nominas` WRITE;
/*!40000 ALTER TABLE `semanas_nominas` DISABLE KEYS */;
INSERT INTO `semanas_nominas` VALUES (1,2025,32,'Semana 32 - Agosto','2023-08-07','2023-08-13','Borrador','2025-08-18 20:01:15','2025-08-18 20:01:15'),(2,2025,33,NULL,'2025-08-12','2025-08-18','Cerrada','2025-08-20 21:46:43','2025-08-20 21:46:43'),(3,2025,1,'Semana 1 - 2025','2025-01-06','2025-01-12','En_Proceso','2025-08-21 17:03:24','2025-08-21 17:03:24'),(4,2025,2,'Semana 2 - 2025','2025-01-13','2025-01-19','En_Proceso','2025-08-21 17:03:24','2025-08-21 17:03:24'),(5,2025,3,'Semana 3 - 2025','2025-01-20','2025-01-26','En_Proceso','2025-08-21 17:03:24','2025-08-21 17:03:24'),(6,2025,4,'Semana 4 - 2025','2025-01-27','2025-02-02','En_Proceso','2025-08-21 17:03:24','2025-08-21 17:03:24');
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
  `nombre` varchar(255) NOT NULL COMMENT 'Nombre del suministro',
  `codigo_producto` varchar(100) DEFAULT NULL COMMENT 'SKU o código interno del producto',
  `descripcion_detallada` text COMMENT 'Descripción detallada del suministro',
  `cantidad` decimal(10,3) DEFAULT '0.000' COMMENT 'Cantidad del suministro',
  `unidad_medida` varchar(20) DEFAULT 'pz' COMMENT 'Unidad de medida del suministro',
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
  `metodo_pago` enum('Efectivo','Transferencia','Cheque','Tarjeta') DEFAULT 'Efectivo' COMMENT 'Método de pago utilizado',
  `subtotal` decimal(12,2) DEFAULT '0.00' COMMENT 'Subtotal del suministro (antes de IVA)',
  `observaciones_finales` text COMMENT 'Observaciones finales después de la entrega',
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
  CONSTRAINT `suministros_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id_proyecto`),
  CONSTRAINT `suministros_ibfk_2` FOREIGN KEY (`id_recibo`) REFERENCES `recibos` (`id_recibo`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suministros`
--

LOCK TABLES `suministros` WRITE;
/*!40000 ALTER TABLE `suministros` DISABLE KEYS */;
INSERT INTO `suministros` VALUES (7,1,3,'62289','2025-07-15','Material','Grava 1 1/2','','',30.000,'m³',NULL,433.33,NULL,'','Entregado','2025-08-25 18:30:02','2025-08-25 18:30:02',NULL,1,0.00,1,'Efectivo',0.00,NULL),(8,1,3,'62322','2025-07-11','Material','Grava 1 1/2','','',30.000,'m³',NULL,433.33,NULL,'','Entregado','2025-08-25 18:38:01','2025-08-25 18:38:01',NULL,1,0.00,1,'Efectivo',0.00,NULL),(9,1,3,'62321','2025-07-11','Material','Grava 1 1/2','','',30.000,'m³',NULL,433.33,NULL,'','Entregado','2025-08-25 18:41:03','2025-08-25 18:41:03',NULL,1,0.00,1,'Efectivo',0.00,NULL),(10,1,3,'62137','2025-07-16','Material','Arena de Río','','',7.000,'m³',NULL,228.57,NULL,'','Entregado','2025-08-25 19:02:47','2025-08-25 19:02:47',NULL,1,0.00,1,'Efectivo',0.00,NULL),(11,1,3,'62136','2025-07-16','Material','Grava 3/4','','',7.000,'m³',NULL,442.86,NULL,'','Entregado','2025-08-25 19:04:30','2025-08-25 19:04:30',NULL,1,0.00,1,'Efectivo',0.00,NULL),(12,1,3,'65713','2025-08-05','Material','Tepetate','','',35.000,'m³',NULL,185.71,NULL,'','Entregado','2025-08-25 19:05:40','2025-08-25 19:05:40',NULL,1,0.00,1,'Efectivo',0.00,NULL),(13,1,3,'65765','2025-08-07','Material','Tepetate','','',35.000,'m³',NULL,185.71,NULL,'','Entregado','2025-08-25 19:07:20','2025-08-25 19:07:20',NULL,1,0.00,1,'Efectivo',0.00,NULL),(14,1,3,'62144','2025-07-17','Material','Grava 3/4','','',7.000,'m³',NULL,442.86,NULL,'','Entregado','2025-08-25 19:24:26','2025-08-25 19:24:26',NULL,1,0.00,1,'Efectivo',0.00,NULL),(15,1,3,'62143','2025-07-17','Material','Arena de RIo','','',7.000,'m³',NULL,228.57,NULL,'','Entregado','2025-08-25 19:25:35','2025-08-25 19:25:35',NULL,1,0.00,1,'Efectivo',0.00,NULL),(16,1,3,'65217','2025-08-19','Material','Tepetate','','',35.000,'m3',NULL,185.71,7539.83,'','Entregado','2025-08-25 19:27:28','2025-09-01 17:27:30',NULL,1,0.00,1,'Efectivo',0.00,NULL),(17,1,3,'65216','2025-08-19','Material','Tepetate','','',35.000,'m3',NULL,185.71,7539.83,'','Entregado','2025-08-25 19:29:26','2025-09-01 17:27:34',NULL,1,0.00,1,'Efectivo',0.00,NULL),(18,1,3,'65953','2025-08-15','Material','Tepetate','','',30.000,'m³',NULL,185.71,NULL,'','Entregado','2025-08-25 19:40:19','2025-08-25 19:40:19',NULL,1,0.00,1,'Efectivo',0.00,NULL),(19,1,3,'65214','2025-08-18','Material','Tepetate','','',35.000,'m³',NULL,185.71,NULL,'','Entregado','2025-08-25 19:41:00','2025-08-25 19:41:00',NULL,1,0.00,1,'Efectivo',0.00,NULL),(20,1,3,'65215','2025-08-18','Material','Tepetate','','',35.000,'m³',NULL,185.71,NULL,'','Entregado','2025-08-25 19:42:02','2025-08-25 19:42:02',NULL,1,0.00,1,'Efectivo',0.00,NULL),(21,1,3,'65639','2025-08-08','Material','Grava 1 1/2','','',30.000,'m³',NULL,433.33,NULL,'','Entregado','2025-08-25 19:43:04','2025-08-25 19:43:13',NULL,1,0.00,1,'Efectivo',0.00,NULL),(22,1,3,'65770','2025-08-08','Material','Grava 1 1/2','','',30.000,'m³',NULL,433.33,NULL,'','Entregado','2025-08-25 19:44:02','2025-08-25 19:44:02',NULL,1,0.00,1,'Efectivo',0.00,NULL),(23,1,3,'37108','2025-07-26','Maquinaria','Retroexcavadora','425F','',4.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 20:12:22','2025-08-25 20:12:22',NULL,1,0.00,1,'Efectivo',0.00,NULL),(24,1,3,'37107','2025-07-25','Maquinaria','Retroexcavadora','425F','',6.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 20:58:49','2025-08-25 20:58:49',NULL,1,0.00,1,'Efectivo',0.00,NULL),(25,1,3,'37106','2025-07-24','Maquinaria','Retroexcavadora','','Excavación y movimiento de material',8.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:08:17','2025-08-25 21:08:17',NULL,1,0.00,1,'Efectivo',0.00,NULL),(26,1,3,'37105','2025-07-23','Maquinaria','Retroexcavadora','','Excavación y movimiento de material ',8.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:09:25','2025-08-25 21:09:25',NULL,1,0.00,1,'Efectivo',0.00,NULL),(27,1,3,'37104','2025-07-22','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',8.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:11:23','2025-08-25 21:16:13',NULL,1,0.00,1,'Efectivo',0.00,NULL),(28,1,3,'37103','2025-07-21','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',8.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:19:35','2025-08-25 21:19:35',NULL,1,0.00,1,'Efectivo',0.00,NULL),(29,1,3,'37946','2025-07-14','Material','Retroexcavadora','425F','Excavación y movimiento de material',4.500,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:21:35','2025-08-25 21:21:35',NULL,1,0.00,1,'Efectivo',0.00,NULL),(30,1,3,'37947','2025-07-15','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',8.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:23:45','2025-08-25 21:23:45',NULL,1,0.00,1,'Efectivo',0.00,NULL),(31,1,3,'37948','2025-07-16','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',8.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:26:03','2025-08-25 21:26:03',NULL,1,0.00,1,'Efectivo',0.00,NULL),(32,1,3,'37949','2025-07-17','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',8.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:27:06','2025-08-25 21:27:06',NULL,1,0.00,1,'Efectivo',0.00,NULL),(33,1,3,'37101','2025-07-18','Maquinaria','Retroexcavadora ','425F','Excavación y movimiento de material',8.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:28:36','2025-08-25 21:28:36',NULL,1,0.00,1,'Efectivo',0.00,NULL),(34,1,3,'37102','2025-07-19','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',4.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:31:01','2025-08-25 21:31:01',NULL,1,0.00,1,'Efectivo',0.00,NULL),(35,1,3,'37115','2025-08-02','Maquinaria','REtroexcavadora','425F','Excavación y movimiento de material',5.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:31:52','2025-08-25 21:31:52',NULL,1,0.00,1,'Efectivo',0.00,NULL),(36,1,3,'37110','2025-07-30','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',9.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:32:48','2025-08-25 21:32:48',NULL,1,0.00,1,'Efectivo',0.00,NULL),(37,1,3,'37111','2025-07-31','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',9.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:34:27','2025-08-25 21:34:27',NULL,1,0.00,1,'Efectivo',0.00,NULL),(38,1,3,'37121','2025-08-09','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',5.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:35:58','2025-08-25 21:36:05',NULL,1,0.00,1,'Efectivo',0.00,NULL),(39,1,3,'37122','2025-08-11','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',9.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:37:09','2025-08-25 21:37:09',NULL,1,0.00,1,'Efectivo',0.00,NULL),(40,1,3,'37124','2025-08-13','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',9.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:38:57','2025-08-25 21:38:57',NULL,1,0.00,1,'Efectivo',0.00,NULL),(41,1,3,'37116','2025-08-04','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',9.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:39:51','2025-08-25 21:39:51',NULL,1,0.00,1,'Efectivo',0.00,NULL),(42,1,3,'37117','2025-08-05','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',9.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:40:41','2025-08-25 21:40:41',NULL,1,0.00,1,'Efectivo',0.00,NULL),(43,1,3,'37118','2025-08-06','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',9.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:41:32','2025-08-25 21:41:32',NULL,1,0.00,1,'Efectivo',0.00,NULL),(44,1,3,'37119','2025-08-07','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',9.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:42:25','2025-08-25 21:42:25',NULL,1,0.00,1,'Efectivo',0.00,NULL),(45,1,3,'37120','2025-08-08','Maquinaria','Retroexcavadora','425F','Excavación y movimiento de material',9.000,'hr',NULL,520.75,NULL,'','Entregado','2025-08-25 21:43:15','2025-08-25 21:43:15',NULL,1,0.00,1,'Efectivo',0.00,NULL),(47,1,4,'42749','2025-07-25','Concreto','Concreto FC - Tipo TMA-Rev','C2002014B21','',7.000,'m³',NULL,0.00,NULL,'','Entregado','2025-08-26 19:36:29','2025-08-26 19:46:29',NULL,1,0.00,1,'Efectivo',0.00,NULL),(48,1,4,'42741','2025-07-25','Concreto','Concreto FC - Tipo TMA-Rev','C2002010D28','',7.000,'m³',NULL,0.00,NULL,'','Entregado','2025-08-26 19:47:55','2025-08-26 19:51:06',NULL,1,0.00,1,'Efectivo',0.00,NULL),(49,1,4,'42742','2025-07-25','Concreto','Concreto FC - Tipo TMA-Rev','C2002010D28','',7.000,'m³',NULL,0.00,NULL,'','Entregado','2025-08-26 19:56:32','2025-08-26 19:57:44',NULL,1,0.00,1,'Efectivo',0.00,NULL),(50,1,4,'42747','2025-07-25','Concreto','Concreto FC - Tipo TMA-Rev','C2002014D28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 19:57:16','2025-08-26 19:57:16',NULL,1,0.00,1,'Efectivo',0.00,NULL),(51,1,4,'42753','2025-07-25','Concreto','Concreto FC - Tipo TMA-Rev','C2002014B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 19:58:55','2025-08-26 19:58:55',NULL,1,0.00,1,'Efectivo',0.00,NULL),(52,1,4,'42681','2025-07-22','Concreto','Concreto FC - Tipo TMA-Rev','C2002010D28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 19:59:32','2025-08-26 19:59:32',NULL,1,0.00,1,'Efectivo',0.00,NULL),(53,1,4,'43623','2025-07-22','Concreto','Concreto FC - Tipo TMA-Rev','C2002010D9B','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:02:56','2025-08-26 20:02:56',NULL,1,0.00,1,'Efectivo',0.00,NULL),(54,1,4,'43674','2025-08-22','Concreto','Concreto FC - Tipo TMA-Rev','C2002014B28','',7.000,'m3',NULL,1.00,8.12,'','Entregado','2025-08-26 20:03:49','2025-09-01 17:16:29',NULL,1,0.00,1,'Efectivo',0.00,NULL),(55,1,4,'42674','2025-07-22','Concreto','Concreto FC - Tipo TMA-Rev','C2002010D28','',7.000,'m³',NULL,1.00,NULL,'','Entregado','2025-08-26 20:06:35','2025-08-26 20:06:35',NULL,1,0.00,1,'Efectivo',0.00,NULL),(56,1,4,'42922','2025-08-04','Concreto','Concreto FC - Tipo TMA-Rev','C2002014B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:07:25','2025-08-26 20:07:25',NULL,1,0.00,1,'Efectivo',0.00,NULL),(57,1,4,'42924','2025-08-08','Concreto','Concreto FC - Tipo TMA-Rev','C2002014B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:07:56','2025-08-26 20:07:56',NULL,1,0.00,1,'Efectivo',0.00,NULL),(58,1,4,'42921','2025-08-04','Concreto','Concreto FC - Tipo TMA-Rev','C2001010B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:09:05','2025-08-26 20:09:05',NULL,1,0.00,1,'Efectivo',0.00,NULL),(59,1,4,'42923','2025-08-08','Concreto','Concreto FC - Tipo TMA-Rev','C2001010B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:09:47','2025-08-26 20:09:47',NULL,1,0.00,1,'Efectivo',0.00,NULL),(60,1,4,'42671','2025-07-22','Concreto','Concreto FC - Tipo TMA-Rev','C2002010D28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:10:38','2025-08-26 20:10:38',NULL,1,0.00,1,'Efectivo',0.00,NULL),(61,1,4,'43622','2025-06-22','Concreto','Concreto FC - Tipo TMA-Rev','C2002010D28D','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:11:33','2025-08-26 20:11:33',NULL,1,0.00,1,'Efectivo',0.00,NULL),(62,1,4,'42974','2025-08-06','Concreto','Concreto FC - Tipo TMA-Rev','C2001010D20','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:12:21','2025-08-26 20:12:21',NULL,1,0.00,1,'Efectivo',0.00,NULL),(63,1,4,'42881','2025-08-02','Concreto','Concreto FC - Tipo TMA-Rev','C2001010D28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:13:06','2025-08-26 20:13:06',NULL,1,0.00,1,'Efectivo',0.00,NULL),(64,1,4,'43033','2025-08-11','Concreto','Concreto FC - Tipo TMA-Rev','C2002014D28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:13:55','2025-08-26 20:13:55',NULL,1,0.00,1,'Efectivo',0.00,NULL),(65,1,4,'43026','2025-08-11','Concreto','Concreto FC - Tipo TMA-Rev','C2001010B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:14:42','2025-08-26 20:14:42',NULL,1,0.00,1,'Efectivo',0.00,NULL),(66,1,4,'43028','2025-08-11','Concreto','Concreto FC - Tipo TMA-Rev','C2002014D28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:15:37','2025-08-26 20:15:37',NULL,1,0.00,1,'Efectivo',0.00,NULL),(67,1,4,'43023','2025-08-11','Concreto','Concreto FC - Tipo TMA-Rev','C2001010B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:16:19','2025-08-26 20:16:19',NULL,1,0.00,1,'Efectivo',0.00,NULL),(68,1,4,'43036','2025-08-11','Concreto','Concreto FC - Tipo TMA-Rev','C2002014D28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:18:03','2025-08-26 20:18:03',NULL,1,0.00,1,'Efectivo',0.00,NULL),(69,1,4,'43032','2025-08-11','Concreto','Concreto FC - Tipo TMA-Rev','C2001010B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:20:08','2025-08-26 20:20:08',NULL,1,0.00,1,'Efectivo',0.00,NULL),(70,1,4,'43037','2025-08-11','Concreto','Concreto FC - Tipo TMA-Rev','C2002014D28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:20:45','2025-08-26 20:20:45',NULL,1,0.00,1,'Efectivo',0.00,NULL),(71,1,4,'42976','2025-08-06','Concreto','Concreto FC - Tipo TMA-Rev','C2001010B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:22:08','2025-08-26 20:22:08',NULL,1,0.00,1,'Efectivo',0.00,NULL),(72,1,4,'42968','2025-08-06','Concreto','Concreto FC - Tipo TMA-Rev','C2001010B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:22:53','2025-08-26 20:22:53',NULL,1,0.00,1,'Efectivo',0.00,NULL),(73,1,4,'42966','2025-08-06','Concreto','Concreto FC - Tipo TMA-Rev','C2001010B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:23:49','2025-08-26 20:23:49',NULL,1,0.00,1,'Efectivo',0.00,NULL),(74,1,4,'43093','2025-08-14','Concreto','Concreto FC - Tipo TMA-Rev','C2001010B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:24:43','2025-08-26 20:24:43',NULL,1,0.00,1,'Efectivo',0.00,NULL),(75,1,4,'43089','2025-08-14','Concreto','Concreto FC - Tipo TMA-Rev','C2001010B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:25:20','2025-08-26 20:25:20',NULL,1,0.00,1,'Efectivo',0.00,NULL),(76,1,4,'43087','2025-08-14','Concreto','Concreto FC - Tipo TMA-Rev','C2001010B28','',7.000,'m³',NULL,NULL,NULL,'','Entregado','2025-08-26 20:26:16','2025-08-26 20:26:16',NULL,1,0.00,1,'Efectivo',0.00,NULL),(122,1,3,'34535','2025-08-18','Maquinaria','Mini Rodillo','','',9.000,'hr',NULL,1.00,9.00,'','Entregado','2025-08-30 21:39:44','2025-08-30 21:39:44',NULL,0,0.00,0,'Efectivo',0.00,NULL),(131,1,3,'65974','2025-08-25','Material','Tepetate','','',35.000,'m3',NULL,185.71,6499.85,'','Entregado','2025-09-01 20:11:35','2025-09-01 20:14:47',NULL,0,0.00,0,'Efectivo',0.00,NULL),(133,1,3,'65969','2025-08-22','Material','Tepetate','','',35.000,'m3',NULL,185.71,6499.85,'','Entregado','2025-09-01 20:16:58','2025-09-01 20:16:58',NULL,0,0.00,0,'Efectivo',0.00,NULL),(134,1,3,'65975','2025-08-25','Material','Tepetate','','',35.000,'m3',NULL,185.71,6499.85,'','Entregado','2025-09-01 20:18:07','2025-09-01 20:18:07',NULL,0,0.00,0,'Efectivo',0.00,NULL),(136,1,3,'65233','2025-08-28','Material','Tepetate','','hola',35.000,'m3',NULL,185.71,6499.85,'','Entregado','2025-09-01 20:20:11','2025-09-03 17:25:03',NULL,0,0.00,0,'Efectivo',0.00,NULL),(137,1,3,'34536','2025-08-19','Maquinaria','Mini Rodillo','','',9.000,'hr',NULL,1.00,9.00,'','Entregado','2025-09-01 20:23:01','2025-09-01 20:23:01',NULL,0,0.00,0,'Efectivo',0.00,NULL),(138,1,10,'4489','2025-08-22','Cimbra','Duela Metálica 3.00 mts','','',474.000,'pz',NULL,1.00,474.00,'Devolución de Equipo','Entregado','2025-09-01 20:28:32','2025-09-10 16:21:41',NULL,0,0.00,0,'Efectivo',474.00,NULL),(139,1,10,'4489','2025-08-22','Cimbra','Puntal Metálico 2-4 mts. C/R','','',298.000,'pz',NULL,1.00,298.00,'Devolución de Equipo','Entregado','2025-09-01 20:28:32','2025-09-10 16:21:41',NULL,0,0.00,0,'Efectivo',298.00,NULL);
/*!40000 ALTER TABLE `suministros` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidades_medida`
--

LOCK TABLES `unidades_medida` WRITE;
/*!40000 ALTER TABLE `unidades_medida` DISABLE KEYS */;
/*!40000 ALTER TABLE `unidades_medida` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','admin@vlock.com','$2b$10$zxIGI6j7qCaRz2uqJD3gVuIHacwUPSxlId/NQSNKplQB/1A/T3u0.',1,1,'2025-08-18 16:01:00','2025-08-18 16:01:00'),(2,'Prueba','prueba@gmail.com','$2b$10$7YCqKfSxIaILuVjS7/FelejWMrIA.ZVQyHcjz.SJ/7R7dJMcsUL0m',1,2,'2025-08-19 17:40:40','2025-08-19 17:40:40'),(3,'usuario_test','usuario@vlock.com','$2b$10$.jdqvqXyErXVNNQFsMW9x.AkWIQav0BnVVpdNxual/W5S13jz1aym',1,2,'2025-08-20 17:36:02','2025-08-20 17:36:02');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_auditoria_usuarios`
--

DROP TABLE IF EXISTS `v_auditoria_usuarios`;
/*!50001 DROP VIEW IF EXISTS `v_auditoria_usuarios`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_auditoria_usuarios` AS SELECT 
 1 AS `id_auditoria`,
 1 AS `fecha_hora`,
 1 AS `nombre_usuario`,
 1 AS `accion`,
 1 AS `tabla`,
 1 AS `descripcion`,
 1 AS `ip`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_empleados_detalle`
--

DROP TABLE IF EXISTS `v_empleados_detalle`;
/*!50001 DROP VIEW IF EXISTS `v_empleados_detalle`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_empleados_detalle` AS SELECT 
 1 AS `id_empleado`,
 1 AS `nombre_completo`,
 1 AS `nss`,
 1 AS `telefono`,
 1 AS `oficio`,
 1 AS `tipo_contrato`,
 1 AS `salario_diario`,
 1 AS `fecha_alta`,
 1 AS `fecha_baja`,
 1 AS `estado`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_herramientas_stock_bajo`
--

DROP TABLE IF EXISTS `v_herramientas_stock_bajo`;
/*!50001 DROP VIEW IF EXISTS `v_herramientas_stock_bajo`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_herramientas_stock_bajo` AS SELECT 
 1 AS `id_herramienta`,
 1 AS `nombre`,
 1 AS `marca`,
 1 AS `stock_total`,
 1 AS `stock_disponible`,
 1 AS `stock_minimo`,
 1 AS `categoria`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_nomina_semanal`
--

DROP TABLE IF EXISTS `v_nomina_semanal`;
