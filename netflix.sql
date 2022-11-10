/*
 Navicat Premium Data Transfer

 Source Server         : geamennfood
 Source Server Type    : MySQL
 Source Server Version : 100334
 Source Host           : 127.0.0.1:3306
 Source Schema         : netflix

 Target Server Type    : MySQL
 Target Server Version : 100334
 File Encoding         : 65001

 Date: 09/11/2022 14:53:51
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for netflix
-- ----------------------------
DROP TABLE IF EXISTS `netflix`;
CREATE TABLE `netflix` (
  `NFID` int(11) NOT NULL,
  `title` text NOT NULL,
  `year` text DEFAULT NULL,
  `duration` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `type` text DEFAULT NULL,
  `cast` text DEFAULT NULL,
  `genres` text DEFAULT NULL,
  `atributes` text DEFAULT NULL,
  `rating` text DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `timestamp` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `img` text DEFAULT NULL,
  `url` text DEFAULT NULL,
  `name_cat` varchar(255) DEFAULT NULL,
  `code_cat` varchar(255) DEFAULT NULL,
  `imdbRating` varchar(255) DEFAULT NULL,
  `imdbVotes` varchar(255) DEFAULT NULL,
  `tomatometer` varchar(255) DEFAULT NULL,
  `rated` varchar(255) DEFAULT NULL,
  `director` varchar(255) DEFAULT NULL,
  `writer` text DEFAULT NULL,
  `plot` text DEFAULT NULL,
  `imdbID` varchar(255) DEFAULT NULL,
  `awards` text DEFAULT NULL,
  `poster` text DEFAULT NULL,
  `metascore` varchar(255) DEFAULT NULL,
  `ytID` text DEFAULT NULL,
  PRIMARY KEY (`NFID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
