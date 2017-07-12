-- MySQL dump 10.13  Distrib 5.6.22, for Win32 (x86)
--
-- Host: localhost    Database: Pomelo
-- ------------------------------------------------------
-- Server version	5.6.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userName` char(12) NOT NULL,
  `passWord` char(20) NOT NULL,
  `parent` char(12) DEFAULT NULL,
  `roomID` char(12) DEFAULT NULL,
  `lastLoginTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `loginCount` int(11) NOT NULL DEFAULT '0',
  `upScore` int(10) unsigned NOT NULL DEFAULT '0',
  `downScore` int(10) unsigned NOT NULL DEFAULT '0',
  `balance` int(10) unsigned NOT NULL DEFAULT '0',
  `userType` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (4,'hawkMan','123','ZHAO','','2016-11-29 01:18:25',1,0,0,0,1),(11,'hawk6','123','hawkMan','','2016-11-29 01:32:57',1,0,0,0,0),(12,'hawk','123','hawkMan','','2016-11-29 01:50:23',1,0,0,52455,0),(13,'why','123','hawkMan','','2016-11-29 07:48:35',1,0,0,4994,0),(14,'13320288888','123','hawkMan','','2016-12-03 15:44:28',1,0,0,6166,0),(15,'13320299999','123','hawkMan','','2016-12-05 03:53:17',1,0,0,0,0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `room` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent` int(10) unsigned DEFAULT NULL,
  `roomName` varchar(32) NOT NULL,
  `roomDescrib` varchar(64) NOT NULL DEFAULT 'room',
  `roomID` int(10) unsigned NOT NULL DEFAULT '0',
  `roomType` bigint(20) unsigned NOT NULL DEFAULT '0',
  `config` varchar(512) NOT NULL DEFAULT '',
  `state` int(10) unsigned DEFAULT NULL,
  `numOfUsers` bigint(20) unsigned NOT NULL DEFAULT '0',
  `note` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES (1,NULL,'ChatRoom0','chatRoom',0,0,'',1,0,'an user logout'),(2,NULL,'ChatRoom1','chatRoom',1,0,'',1,0,'exist'),(3,NULL,'ChatRoom2','chatRoom',2,0,'',1,2,'an user login'),(4,NULL,'ChatRoom3','chatRoom',3,0,'',1,0,'exist');
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userName` char(12) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `operation` bigint(20) unsigned NOT NULL DEFAULT '0',
  `score` int(10) unsigned NOT NULL DEFAULT '0',
  `note` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,'hawk','2017-01-03 01:18:08',0,200,'upScore'),(2,'hawk','2017-01-03 01:18:12',1,100,'upScore'),(3,'hawk','2017-01-03 02:10:17',2,2200,'betScore'),(4,'hawk','2017-01-03 02:10:17',2,1900,'winScore'),(5,'why','2017-01-03 02:12:18',2,500,'betScore'),(6,'why','2017-01-03 02:12:18',2,400,'winScore'),(7,'hawk','2017-01-03 02:12:38',2,1000,'betScore'),(8,'hawk','2017-01-04 01:25:33',0,200,'upScore'),(9,'hawk','2017-01-04 01:26:04',1,100,'downScore'),(10,'hawk','2017-01-04 01:29:59',0,100,'upScore'),(11,'hawk','2017-01-04 01:33:23',0,100,'upScore'),(12,'hawk','2017-02-22 01:06:29',2,210,'betScore'),(13,'hawk','2017-02-22 01:06:29',3,160,'winScore');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-02-23 15:43:27
