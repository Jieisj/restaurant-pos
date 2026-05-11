-- MySQL dump 10.13  Distrib 8.0.34, for macos13 (arm64)
--
-- Host: 127.0.0.1    Database: restaurant_pos
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `menu_item_id` bigint unsigned DEFAULT NULL,
  `name_snapshot` varchar(25) NOT NULL,
  `price_snapshot` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `is_pending` tinyint NOT NULL DEFAULT '1',
  `is_finished` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sent_at` timestamp NULL DEFAULT NULL,
  `finished_AT` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_cart_items_order_idx` (`order_id`),
  KEY `fk_cart_items_menu_item_idx` (`menu_item_id`),
  CONSTRAINT `fk_cart_items_menu_item` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,1,1,'Cheese Burger',9.99,2,1,0,'2026-05-03 06:02:28',NULL,NULL),(2,2,2,'Double Burger',12.99,1,0,1,'2026-05-03 06:02:28','2026-05-01 16:35:00','2026-05-01 16:55:00'),(3,2,5,'Coke',2.50,2,0,1,'2026-05-03 06:02:28','2026-05-01 16:35:00','2026-05-01 16:40:00'),(4,3,3,'French Fries',4.99,1,0,1,'2026-05-03 06:02:28','2026-05-02 22:20:00','2026-05-02 22:30:00');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Appetizers'),(2,'Burgers'),(3,'Desserts'),(4,'Drinks');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(25) DEFAULT NULL,
  `address` varchar(25) DEFAULT NULL,
  `phone_number` varchar(25) DEFAULT NULL,
  `note` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_customer` (`name`,`address`,`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'John Smith','123 Main St','555-1111','No onions'),(2,'Mary Chen','88 Lake Rd','555-2222','VIP'),(3,'David Lee','45 Park Ave','555-3333',NULL);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_item_categories`
--

DROP TABLE IF EXISTS `menu_item_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_item_categories` (
  `menu_item_id` bigint NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`menu_item_id`,`category_id`),
  KEY `fk_menu_item_categories_category_idx` (`category_id`),
  KEY `idx_menu_item_categories_menu_item_id` (`menu_item_id`),
  CONSTRAINT `fk_menu_item_categories_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_item_categories`
--

LOCK TABLES `menu_item_categories` WRITE;
/*!40000 ALTER TABLE `menu_item_categories` DISABLE KEYS */;
INSERT INTO `menu_item_categories` VALUES (1,1),(2,1),(3,1),(6,1),(3,2),(4,2),(5,2),(6,2),(7,2),(8,2),(9,2),(3,3),(4,3),(7,3),(9,3),(3,4),(5,4),(7,4);
/*!40000 ALTER TABLE `menu_item_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_item_modifiers`
--

DROP TABLE IF EXISTS `menu_item_modifiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_item_modifiers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `menu_item_id` bigint unsigned NOT NULL,
  `modifier_type` enum('ADD','NO','SWITCH') NOT NULL,
  `name` varchar(25) NOT NULL,
  `switch_to` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `unique_modifier` (`menu_item_id`,`modifier_type`,`name`),
  KEY `fk_menu_item_modifiers_menu_item_idx` (`menu_item_id`),
  CONSTRAINT `fk_menu_item_modifiers_menu_item` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_item_modifiers`
--

LOCK TABLES `menu_item_modifiers` WRITE;
/*!40000 ALTER TABLE `menu_item_modifiers` DISABLE KEYS */;
INSERT INTO `menu_item_modifiers` VALUES (26,1,'NO','Onion',NULL),(27,1,'ADD','Extra Cheese',NULL),(28,1,'SWITCH','Regular Bun','Gluten Free Bun'),(29,2,'ADD','Bacon',NULL),(30,5,'NO','Ice',NULL);
/*!40000 ALTER TABLE `menu_item_modifiers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(25) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_available` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (1,'Cheese Burger',9.99,1,'2026-05-03 05:30:58',NULL),(2,'Double Burger',12.99,1,'2026-05-03 05:30:58',NULL),(3,'French Fries',4.99,1,'2026-05-03 05:30:58',NULL),(4,'Chicken Wings',8.99,1,'2026-05-03 05:30:58',NULL),(5,'Coke',2.50,1,'2026-05-03 05:30:58',NULL),(6,'Lemonade',3.00,1,'2026-05-03 05:30:58',NULL),(7,'Ice Cream',4.50,1,'2026-05-03 05:30:58',NULL);
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `table_id` bigint unsigned DEFAULT NULL,
  `table_name_snapshot` varchar(25) DEFAULT NULL,
  `username_snapshot` varchar(25) NOT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `handler_name_snapshot` varchar(25) DEFAULT NULL,
  `order_type` enum('DINING','TO_GO','DELIVERY') NOT NULL,
  `order_status` enum('SERVING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SERVING',
  `payment_status` enum('UNPAID','PAID') NOT NULL DEFAULT 'UNPAID',
  `transaction_method` enum('NONE','CASH','CARD','SPLIT') NOT NULL DEFAULT 'NONE',
  `card_type` enum('NONE','VISA','MASTERCARD','AMEX','DISCOVER','OTHERS') NOT NULL DEFAULT 'NONE',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tips` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `sa_idx` (`table_id`),
  KEY `fk_orders_customer_idx` (`customer_id`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`),
  CONSTRAINT `fk_orders_table` FOREIGN KEY (`table_id`) REFERENCES `res_tables` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'T1','waiter1',NULL,'waiter1','DINING','SERVING','UNPAID','NONE','NONE',19.98,0.00,1.78,21.76,'2026-05-03 05:56:52','2026-05-03 05:56:52'),(2,2,'T2','waiter1',1,'waiter1','DINING','COMPLETED','PAID','CARD','VISA',17.49,3.00,1.55,22.04,'2026-05-01 16:30:00','2026-05-03 05:56:52'),(3,NULL,NULL,'cashier1',2,'cashier1','TO_GO','COMPLETED','PAID','CASH','NONE',11.99,1.00,1.07,14.06,'2026-05-02 22:15:00','2026-05-03 05:56:52'),(4,NULL,NULL,'cashier1',3,'cashier1','DELIVERY','CANCELLED','UNPAID','NONE','NONE',25.98,0.00,2.31,28.29,'2026-05-03 23:00:00','2026-05-03 05:56:52');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `res_tables`
--

DROP TABLE IF EXISTS `res_tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `res_tables` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(25) NOT NULL,
  `seat` smallint NOT NULL DEFAULT '4',
  `table_status` enum('AVAILABLE','OCCUPIED','RESERVED') NOT NULL,
  `posx` smallint NOT NULL DEFAULT '0',
  `posy` smallint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `label_UNIQUE` (`label`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `res_tables`
--

LOCK TABLES `res_tables` WRITE;
/*!40000 ALTER TABLE `res_tables` DISABLE KEYS */;
INSERT INTO `res_tables` VALUES (1,'T1',4,'AVAILABLE',10,10),(2,'T2',2,'OCCUPIED',50,10),(3,'T3',6,'RESERVED',100,10),(4,'T4',4,'AVAILABLE',150,10);
/*!40000 ALTER TABLE `res_tables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(25) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','WAITER','CASHIER','KITCHEN') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (11,'admin','$2a$10$7QJz9nWwYyYw7qXjFZz9OeZx1V6G9o9lYwZl3Xc8fJzYy5HqK7b6G','ADMIN','2026-05-03 05:29:07'),(12,'waiter1','$2a$10$7QJz9nWwYyYw7qXjFZz9OeZx1V6G9o9lYwZl3Xc8fJzYy5HqK7b6G','WAITER','2026-05-03 05:29:07'),(13,'cashier1','$2a$10$7QJz9nWwYyYw7qXjFZz9OeZx1V6G9o9lYwZl3Xc8fJzYy5HqK7b6G','CASHIER','2026-05-03 05:29:07'),(14,'kitchen1','$2a$10$7QJz9nWwYyYw7qXjFZz9OeZx1V6G9o9lYwZl3Xc8fJzYy5HqK7b6G','KITCHEN','2026-05-03 05:29:07');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-03  9:53:59
