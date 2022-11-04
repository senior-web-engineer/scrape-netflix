/*
 Navicat Premium Data Transfer

 Source Server         : root
 Source Server Type    : MySQL
 Source Server Version : 100334
 Source Host           : 127.0.0.1:3306
 Source Schema         : netflix

 Target Server Type    : MySQL
 Target Server Version : 100334
 File Encoding         : 65001

 Date: 02/11/2022 18:42:02
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
  PRIMARY KEY (`NFID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
