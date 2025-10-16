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
INSERT INTO `empleados` VALUES (13,'RAFAEL ','MENDOZA LOPEZ','54998265489','3332463442',NULL,NULL,NULL,NULL,NULL,9,4,583.34,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,NULL),(14,'CRISPIN','MUÑOZ CRUZ','04007941000','3320913816',NULL,NULL,NULL,NULL,NULL,14,4,583.34,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,'MUCC791020'),(15,'GAEL NEPTALI','NAVARRO ALVAREZ','63190422715','3325689263',NULL,NULL,NULL,NULL,NULL,11,8,333.34,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,'NAAG040718IR3'),(16,'ZAIDA KAREN','COVARRUBIAS CASILLAS','17149242640','3323254350','PAREJA','3312908259',NULL,NULL,NULL,16,8,333.34,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,'COCZ921109'),(17,'JOSE CRUZ','VALDEZ LOPEZ','04139213419','3334149805',NULL,NULL,NULL,NULL,NULL,9,4,1000.00,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,'VALC920619'),(18,'VITROPISERO','VITROPISERO','1234567890','1234567890',NULL,NULL,NULL,NULL,NULL,17,4,1000.00,1,'2025-10-16',NULL,'eventual',NULL,'semanal',NULL,'RFC1234567890');
/*!40000 ALTER TABLE `empleados` ENABLE KEYS */;
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

-- Dump completed on 2025-10-16 14:55:37
