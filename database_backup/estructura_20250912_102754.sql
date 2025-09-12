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
-- Dumping routines for database 'sistema_gestion'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_actualizar_stock_herramienta` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_stock_herramienta`(IN p_id_herramienta INT)
BEGIN
  DECLARE total_entradas INT;
  DECLARE total_salidas INT;
  DECLARE total_bajas INT;
  
  -- Calcular movimientos
  SELECT 
    COALESCE(SUM(CASE WHEN tipo_movimiento = 'Entrada' THEN cantidad ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN tipo_movimiento = 'Salida' THEN cantidad ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN tipo_movimiento = 'Baja' THEN cantidad ELSE 0 END), 0)
  INTO total_entradas, total_salidas, total_bajas
  FROM movimientos_herramienta
  WHERE id_herramienta = p_id_herramienta;
  
  -- Actualizar stock total y disponible
  UPDATE herramientas 
  SET 
    stock_total = total_entradas - total_bajas,
    stock_disponible = total_entradas - total_salidas - total_bajas
  WHERE id_herramienta = p_id_herramienta;
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
  
  -- Obtener fechas de la semana
  SELECT fecha_inicio, fecha_fin 
  INTO v_fecha_inicio, v_fecha_fin
  FROM semanas_nomina
  WHERE id_semana = p_id_semana;
  
  -- Eliminar cálculos previos si existen
  DELETE FROM nomina_empleado WHERE id_semana = p_id_semana;
  
  -- Calcular nómina para empleados activos
  INSERT INTO nomina_empleado (
    id_empleado, id_semana, dias_trabajados, total_pagar, fecha_calculo
  )
  SELECT 
    e.id_empleado,
    p_id_semana,
    7.0, -- Asumiendo semana completa, esto se podría ajustar con registros de asistencia
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
  
  -- Obtener fecha del estado de cuenta anterior
  SELECT MAX(fecha) INTO v_fecha_anterior
  FROM estados_cuenta
  WHERE id_proyecto = p_id_proyecto AND fecha < p_fecha;
  
  -- Si no hay estado anterior, el saldo inicial es 0
  IF v_fecha_anterior IS NULL THEN
    SET v_saldo_inicial = 0;
  ELSE
    -- Obtener saldo final del estado anterior como saldo inicial
    SELECT saldo_final INTO v_saldo_inicial
    FROM estados_cuenta
    WHERE id_proyecto = p_id_proyecto AND fecha = v_fecha_anterior;
  END IF;
  
  -- Calcular ingresos para el período
  SELECT COALESCE(SUM(monto), 0) INTO v_ingresos
  FROM ingresos
  WHERE id_proyecto = p_id_proyecto AND fecha <= p_fecha
    AND (v_fecha_anterior IS NULL OR fecha > v_fecha_anterior);
  
  -- Calcular gastos para el período
  SELECT COALESCE(SUM(monto), 0) INTO v_gastos
  FROM gastos
  WHERE id_proyecto = p_id_proyecto AND fecha <= p_fecha
    AND (v_fecha_anterior IS NULL OR fecha > v_fecha_anterior);
  
  -- Calcular saldo final
  SET v_saldo_final = v_saldo_inicial + v_ingresos - v_gastos;
  
  -- Guardar estado de cuenta
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

-- Dump completed on 2025-09-12 10:27:55
