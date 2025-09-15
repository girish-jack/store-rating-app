-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: storepulse
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `store_id` (`store_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
INSERT INTO `ratings` VALUES (1,1,4,3,NULL,'2025-09-13 19:12:22'),(2,1,4,3,NULL,'2025-09-13 19:12:25'),(3,1,4,3,NULL,'2025-09-13 19:12:27'),(4,1,4,3,NULL,'2025-09-13 19:12:29'),(5,1,4,5,NULL,'2025-09-13 19:12:35'),(6,1,4,5,NULL,'2025-09-13 19:12:39'),(7,1,4,5,NULL,'2025-09-13 19:12:40'),(8,1,4,5,NULL,'2025-09-13 19:12:40'),(9,1,4,5,NULL,'2025-09-13 19:12:41'),(10,1,4,5,NULL,'2025-09-13 19:12:43'),(11,5,4,5,NULL,'2025-09-13 21:02:13'),(12,2,4,5,NULL,'2025-09-13 21:09:14');
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `average_rating` decimal(2,1) DEFAULT '0.0',
  `total_ratings` int DEFAULT '0',
  `image_url` varchar(500) DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,'Reliance Fresh','reliancefresh@email.com','601 Ghatkopar, Mumbai',NULL,'2025-09-13 11:37:19',4.2,10,'/stores/Reliance-Fresh.jpg',NULL),(2,'Big Bazaar','bigbazaar@email.com','Paldi, Ahmedabad',NULL,'2025-09-13 11:37:19',5.0,1,'/stores/Big-Bazaar.jpg',NULL),(3,'Star Bazaar','starbazaar@email.com','Usman Road, Chennai',NULL,'2025-09-13 11:37:19',4.1,24,'/stores/Star-Bazaar.jpg',NULL),(4,'Spencer\'s Retail','spencers@email.com','Camac Street, Kolkata',NULL,'2025-09-13 11:37:19',4.6,45,'http://localhost:5000/stores/spencers.jpg',NULL),(5,'D-Mart','dmart@email.com','Baner, Pune',NULL,'2025-09-13 11:37:19',5.0,1,'/stores/D-Mart.jpg',NULL),(6,'More Supermarket','more@email.com','MG Road, Bengaluru',NULL,'2025-09-13 11:37:19',4.0,19,'/stores/More-Supermarket.jpg',NULL),(7,'Vijay Sales','vijaysales@email.com','Anna Nagar, Chennai',NULL,'2025-09-13 11:37:19',4.3,27,'/stores/Vijay-Sales.jpg',NULL),(8,'Future Group','futuregroup@email.com','Connaught Place, Delhi',NULL,'2025-09-13 11:37:19',4.8,58,'/stores/Future-Group.jpg',NULL),(9,'Reliance Trends','reliancetrends@email.com','SR Nagar, Hyderabad',NULL,'2025-09-13 11:37:19',4.2,21,'/stores/Reliance-Trends.jpg',NULL),(10,'Central Mall','centralmall@email.com','Sector 29, Gurugram',NULL,'2025-09-13 11:37:19',4.7,52,'/stores/Central-Mall.jpg',NULL),(11,'Pantaloons','pantaloons@email.com','Bistupur, Jamshedpur',NULL,'2025-09-13 11:37:19',4.5,37,'/stores/Pantaloons.jpg',NULL),(12,'Westside','westside@email.com','Jagatpura, Jaipur',NULL,'2025-09-13 11:37:19',4.1,23,'/stores/Westside.jpg',NULL),(13,'Lifestyle','lifestyle@email.com','Banjara Hills, Hyderabad',NULL,'2025-09-13 11:37:19',4.2,34,'/stores/Lifestyle.jpg',NULL),(14,'Reliance Digital','reliancedigital@email.com','Salt Lake, Kolkata',NULL,'2025-09-13 11:37:19',4.3,40,'/stores/Reliance-Digital.jpg',NULL),(15,'Brand Factory','brandfactory@email.com','Ramdaspeth, Nagpur',NULL,'2025-09-13 11:37:19',4.1,22,'/stores/Brand-Factory.jpg',NULL),(16,'Croma','croma@email.com','Koramangala, Bengaluru',NULL,'2025-09-13 11:37:19',4.6,31,'/stores/Croma.jpg',NULL),(17,'Metro Cash and Carry','metro@email.com','Kondapur, Hyderabad',NULL,'2025-09-13 11:37:19',4.3,25,'/stores/Metro-Cash-and-Carry.jpg',NULL),(18,'Easyday','easyday@email.com','Indiranagar, Bengaluru',NULL,'2025-09-13 11:37:19',4.5,41,'/stores/Easyday.jpg',NULL),(19,'Nature\'s Basket','naturesbasket@email.com','Vashi, Navi Mumbai',NULL,'2025-09-13 11:37:19',4.4,38,'http://localhost:5000/stores/natures-basket.jpg',NULL),(20,'Hypercity','hypercity@email.com','Kharadi, Pune',NULL,'2025-09-13 11:37:19',4.2,20,'/stores/Hypercity.jpg',NULL),(21,'Foodhall','foodhall@email.com','Lavelle Road, Bengaluru',NULL,'2025-09-13 11:37:19',4.7,56,'/stores/Foodhall.jpg',NULL),(22,'Payless','payless@email.com','Alkapuri, Vadodara',NULL,'2025-09-13 11:37:19',4.0,17,'/stores/Payless.jpg',NULL),(23,'High5','high5@email.com','Subhash Nagar, Delhi',NULL,'2025-09-13 11:37:19',4.5,32,'/stores/High5.jpg',NULL),(24,'Big Basket','bigbasket@email.com','Ashok Nagar, Chennai',NULL,'2025-09-13 11:37:19',4.6,43,'/stores/Big-Basket.jpg',NULL),(25,'Grofers','grofers@email.com','Lajpat Nagar, Delhi',NULL,'2025-09-13 11:37:19',4.2,18,'/stores/Grofers.jpg',NULL),(26,'Freshmart','freshmart@email.com','Rajajinagar, Bengaluru',NULL,'2025-09-13 11:37:19',4.4,25,'/stores/Freshmart.jpg',NULL),(27,'Heritage Fresh','heritage@email.com','Bodakdev, Ahmedabad',NULL,'2025-09-13 11:37:19',4.5,37,'/stores/Heritage-Fresh.jpg',NULL),(28,'Namdhari\'s','namdhari@email.com','Boring Road, Patna',NULL,'2025-09-13 11:37:19',4.3,24,'http://localhost:5000/stores/namdharis.jpg',NULL),(29,'Ratnadeep','ratnadeep@email.com','Ameerpet, Hyderabad',NULL,'2025-09-13 11:37:19',4.1,19,'/stores/Ratnadeep.jpg',NULL),(30,'Spar','spar@email.com','Royapettah, Chennai',NULL,'2025-09-13 11:37:19',4.5,48,'/stores/Spar.jpg',NULL),(31,'Smart Bazaar','smartbazaar@email.com','Sector 18, Noida',NULL,'2025-09-13 11:37:19',4.2,33,'/stores/Smart-Bazaar.jpg',NULL),(32,'FreshChoice','freshchoice@email.com','Bandra, Mumbai',NULL,'2025-09-13 11:37:19',4.6,52,'/stores/FreshChoice.jpg',NULL),(33,'Mother Dairy','motherdairy@email.com','Ranchi Chowk, Ranchi',NULL,'2025-09-13 11:37:19',4.4,35,'/stores/Mother-Dairy.jpg',NULL),(34,'Safal','safal@email.com','Civil Lines, Allahabad',NULL,'2025-09-13 11:37:19',4.1,16,'/stores/Safal.jpg',NULL),(35,'Maggi Point','maggipoint@email.com','Dadar, Mumbai',NULL,'2025-09-13 11:37:19',4.3,20,'/stores/Maggi-Point.jpg',NULL),(36,'Amul Store','amulstore@email.com','Morabadi, Ranchi',NULL,'2025-09-13 11:37:19',4.8,43,'/stores/Amul-Store.jpg',NULL),(37,'Patel Supermarket','patelsupermarket@email.com','Race Course, Vadodara',NULL,'2025-09-13 11:37:19',4.7,39,'/stores/Patel-Supermarket.jpg',NULL),(38,'Pushpam','pushpam@email.com','Ram Nagar, Coimbatore',NULL,'2025-09-13 11:37:19',4.0,12,'/stores/Pushpam.jpg',NULL),(39,'Usha Stores','usha@email.com','Hinjewadi, Pune',NULL,'2025-09-13 11:37:19',4.5,26,'/stores/Usha-Stores.jpg',NULL),(40,'Raj Stores','rajstores@email.com','Adyar, Chennai',NULL,'2025-09-13 11:37:19',4.1,18,'/stores/Raj-Stores.jpg',NULL),(41,'Kirana King','kirana@email.com','Durgapura, Jaipur',NULL,'2025-09-13 11:37:19',4.3,24,'/stores/Kirana-King.jpg',NULL),(42,'Shiv Shakti','shivshakti@email.com','Thane West, Thane',NULL,'2025-09-13 11:37:19',4.6,41,'/stores/Shiv-Shakti.jpg',NULL),(43,'Subhiksha','subhiksha@email.com','Yelahanka, Bengaluru',NULL,'2025-09-13 11:37:19',4.2,38,'/stores/Subhiksha.jpg',NULL),(44,'Mantri Market','mantrimarket@email.com','Wakad, Pune',NULL,'2025-09-13 11:37:19',4.6,29,'/stores/Mantri-Market.jpg',NULL),(45,'Singh Stores','singhstores@email.com','Saket, Delhi',NULL,'2025-09-13 11:37:19',4.4,44,'/stores/Singh-Stores.jpg',NULL),(46,'Delhi Grocery','delhigrocery@email.com','Karol Bagh, Delhi',NULL,'2025-09-13 11:37:19',4.5,35,'/stores/Delhi-Grocery.jpg',NULL),(47,'Mumbai Mart','mumbaimart@email.com','Vile Parle, Mumbai',NULL,'2025-09-13 11:37:19',4.7,53,'/stores/Mumbai-Mart.jpg',NULL),(48,'Bengal Grocers','bengalgrocers@email.com','Park Street, Kolkata',NULL,'2025-09-13 11:37:19',4.3,29,'/stores/Bengal-Grocers.jpg',NULL),(49,'Chennai Bazaar','chennaibazaar@email.com','Teynampet, Chennai',NULL,'2025-09-13 11:37:19',4.4,37,'/stores/Chennai-Bazaar.jpg',NULL),(50,'Pune Provisions','puneprovisions@email.com','Kothrud, Pune',NULL,'2025-09-13 11:37:19',4.1,17,'http://localhost:5000/stores/pune-provisions.jpg',NULL),(51,'Sample Store','store@example.com','123 Store St',NULL,'2025-09-15 04:28:24',0.0,0,NULL,15);
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user',
  `address` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'System Administrator','admin@storepulse.com','$2b$10$G5sLAk8UeNQvRKOm98gQJ.HyFe6eglujYeXRKjoqRxruQ2B8ytqDO','admin','123 Admin Street, Admin City','2025-09-12 04:49:49'),(2,'GirishSanjayRohile1718','girishrohile18@gmail.com','$2a$10$REPLACE_WITH_YOUR_GENERATED_BCRYPT_HASH','user','Dvhh','2025-09-13 06:03:35'),(3,'GirishRohileRohile1718','rohilegirish@gmail.com','$2b$10$H9q5O5t3QQQyh5kWAX4pm.L38/ZcS8jsHwxvYuceO2MHiJxK4jhom','user','Dvhh','2025-09-13 12:45:06'),(4,'ViratKohliKohli171818','virat@gmail.com','$2b$10$mqO4E3Tvwa8nCdqTEFGVXOhGJnAnA0kk4/yq9VLzqxUzCkSIRE2TW','user','Dvhh','2025-09-13 14:53:22'),(5,'RohileGirishSanjay1718','girish@gmail.com','$2b$10$geqpu6KM3.Wh7z8xwzNhO.PwQgMoI4/L2bdjufVUla/ULHUxlivZa','admin','Address of Rohile Girish','2025-09-14 10:05:55'),(6,'AkhsayAnilMudshinge1718','ab@gmail.com','$2b$10$Rpnj8Si58vyS0W4dT9D4yenhzTzedSR3DLwIJb16D/j519g2tFIH.','user','Dvhh','2025-09-14 10:34:51'),(7,'AkhsayAnilMudshinge1718','abc@gmail.com','$2b$10$W0Al1wyoq4SV56ZPaXmDJeQB9cAUG6ROUIDm.TmcYr0ZAMY5.my02','user','Dvhh','2025-09-14 10:35:15'),(9,'AkhsayAnilMudshinge1718','akshay@gmail.com','$2b$10$77JngNzhHtzHUIilFIJr8eN3MELJH3620hfdOpGXBVswhJ.O28Y4W','user','Dvhh','2025-09-14 10:43:35'),(10,'JohnnyDeppDeppUsa1718','johnny@gmail.com','$2b$10$zesdCbPdMgInp4qChP1oROMMwpaLfVYHvFv1CkHV7aGu8LvSD8tAG','user','Dvhh','2025-09-15 01:01:53'),(11,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','a@gmail.com','$2b$10$1FEH/qYXnxAu2dxQ1d8Zd.95z.w2EgxYLn26nujIM..GjiroZ1q3q','user','Dvhh','2025-09-15 01:49:21'),(12,'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','b@gmai.com','$2b$10$4V7PjfaJgbjrrHNgJBzAxe1PDRN62aJ2fuaRRZFMV/6u3fUVD8fwm','user','Dvhh','2025-09-15 01:59:59'),(13,'cccccccccccccccccccccccccccccccccccccccccccccccccccc','c@gmail.com','$2b$10$WDzNiTbNbyT4FtLhGM2/2OQe.GxGeQGrqFl8ma5ybmibcCXoVomBS','user','Dvhh','2025-09-15 02:07:12'),(14,'ccccccccccccccccccccccccccccccccccccccccccccccccc','d@gmail.com','$2b$10$MtX2M1veUgzvhvyipKe0ruanJzSKm3d4aKMcYr5g8u5b.vPG7uDUO','user','Dvhh','2025-09-15 02:12:44'),(15,'CaptainJackSparrow','jack@email.com','$2b$10$TYgHCF15alo1Yh2hJ65GXOYhdWkrPt/vcqS6b8v/RHxho7hoLsYSq','store_owner','dvhh','2025-09-15 02:21:28');
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

-- Dump completed on 2025-09-15 10:11:59
