/*
 Navicat Premium Dump SQL

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : sieage

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 22/09/2026 15:01:53
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for acudientes
-- ----------------------------
DROP TABLE IF EXISTS `acudientes`;
CREATE TABLE `acudientes`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipo_documento` enum('C.C.','C.E.','P.P.T.','PAS','N.I.T.') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'C.C.',
  `numero_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_completo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono_fijo` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `telefono_celular` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `direccion` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `barrio_id` smallint UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_acu_doc`(`tipo_documento` ASC, `numero_documento` ASC) USING BTREE,
  INDEX `fk_acu_barrio`(`barrio_id` ASC) USING BTREE,
  CONSTRAINT `fk_acu_barrio` FOREIGN KEY (`barrio_id`) REFERENCES `barrios` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 354 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of acudientes
-- ----------------------------
INSERT INTO `acudientes` VALUES (1, 'C.C.', '1113521465', 'Keterine Betancourt Leon', '3137172030', '3206923507', NULL, 'KR 39 101-03', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (2, 'C.C.', '29179998', 'Carmen Rosa Mosquera Mosquera', '3103820680', '3148626298', NULL, 'KR 40 95-114', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (3, 'C.C.', '1144144053', 'Lizeth Aguirre Giron', '3225433486', '3205297472', NULL, 'CL 71 No 7M Bis-152', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (4, 'C.C.', '31935786', 'Nancy Margot Alban Canabal Mosquera', '381 5520', '314 242 397', NULL, 'KR 7J 70-58', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (5, 'C.C.', '5519880', 'Kharoll Annabell Amaro Querales', '3134512610', '3135327431', NULL, 'CL 105 37-87', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (6, 'C.C.', '16916559', 'Javier Hernando Angola', '3166486508', '3152828024', NULL, 'KR 9#72B-52', 3, NULL, NULL);
INSERT INTO `acudientes` VALUES (7, 'C.C.', '1061198810', 'Marcelina Aragon Hurtado', '3235234323', '3504959730', NULL, 'CL 73 7R-18', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (8, 'C.C.', '66930179', 'Nancy Escobar Cambindo', '317 784 0237', '318 325 6361', NULL, 'KR 7bis 73-62', NULL, NULL, NULL);
INSERT INTO `acudientes` VALUES (9, 'C.C.', '29228669', 'Elizabeth Angulo Cambindo', '3104629267', '3023688435', NULL, 'KR 7R 77-55', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (10, 'C.C.', '1144150198', 'Vivian Soreyi Ruiz Carabali', '6562934', '3206633642', NULL, 'PS 7Dbis 62-20', 4, NULL, NULL);
INSERT INTO `acudientes` VALUES (11, 'C.C.', '1006049225', 'Laura María Rosero Camilo', '3242528606', '3054510176', NULL, 'KR 7M2 92-24', 5, NULL, NULL);
INSERT INTO `acudientes` VALUES (12, 'C.C.', '1144134155', 'Juliana Angulo', '2863564', '3117529211', NULL, 'CL96 19-58', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (13, 'C.C.', '31710709', 'Miryam Stella Cruz Gutierrez', '3178035105', '316 852 8545', NULL, 'KR 7E 70-124', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (14, 'C.C.', '1060801770', 'Albania Valencia Becoche', '310 833 9665', '314 800 1494', NULL, 'KR 26G 112-71', 6, NULL, NULL);
INSERT INTO `acudientes` VALUES (15, 'C.C.', '1112479337', 'Fanori Ceballos Gomez', '3153075352', '3176673167', NULL, 'KR 7Jbis 70-34', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (16, 'C.C.', '27261419', 'Maria Emma Chalar Castillo', '3105350984', '3234578291', NULL, 'KR 44A 48-17', 7, NULL, NULL);
INSERT INTO `acudientes` VALUES (17, 'C.C.', '1113522502', 'Maide Fernanda Giron Castillo', '3766739', '3046495646', NULL, 'KR 9 72-72', 8, NULL, NULL);
INSERT INTO `acudientes` VALUES (18, 'C.C.', '6955748', 'Carlimar Del Valle Ríos Bolivar', '3022842203', '3027260063', NULL, 'CL72V 25L-39', 9, NULL, NULL);
INSERT INTO `acudientes` VALUES (19, 'C.C.', '1130661958', 'Any Dasuli Marmolejo', '3017384817', '3186201669', NULL, 'KR 25 75B-41 Bl 3', 10, NULL, NULL);
INSERT INTO `acudientes` VALUES (20, 'C.C.', '29831831', 'Omaira Giraldo Aguirre', '311 679 8911', '321 702 4253', NULL, 'KR 7D 70-88', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (21, 'C.C.', '1104805034', 'Hilary Dayanna Jiménez Henao', '3183923952', '3161040218', NULL, 'KR 26E 97-77', 11, NULL, NULL);
INSERT INTO `acudientes` VALUES (22, 'C.C.', '1113513704', 'Claudia Lorena Orozco', '6620665', '3144205537', NULL, 'KR 7B # 86-76', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (23, 'C.C.', '1143980562', 'Nataly Cardona Lopez', '6622875', '3172734162', NULL, 'CL 78 9-68', 12, NULL, NULL);
INSERT INTO `acudientes` VALUES (24, 'C.C.', '38553355', 'Elizabeth Palomino Ramirez', '3174734212', '6622844', NULL, 'KR 7C 86-81', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (25, 'C.C.', '67038408', 'Martha Isabel Zambrano Mier', '488 5979', '318 718 4003', NULL, 'CL 73 7M-18', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (26, 'C.C.', '35589077', 'Nancy Trinidad Benitez', '315 861 0257', '311 708 6515', NULL, 'CL 70 7Ebis-50', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (27, 'C.C.', '1006034935', 'Vivian Stefany Cabezas', '3187903610', '3153790868', NULL, 'KR 25 75B-136', 13, NULL, NULL);
INSERT INTO `acudientes` VALUES (28, 'C.C.', '29742170', 'Maria Deyba Sánchez Quiceno', '3053878615', '3157968276', NULL, 'KR 7T 73-153', 14, NULL, NULL);
INSERT INTO `acudientes` VALUES (29, 'C.C.', '67037958', 'Paola Andrea Zuleta Vargas', '3145739702', '3995282', NULL, 'KR 27C 105-151', 15, NULL, NULL);
INSERT INTO `acudientes` VALUES (30, 'C.C.', '1118283505', 'Julian Antonio Plaza Vargas', '663 8435', '318 333 7274', NULL, 'KR 7A 72C-40', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (31, 'C.C.', '25342084', 'Rosa Elena Jojoa Juspian', '3225701499', '3206179275', NULL, 'KR 32 A 57-17', 16, NULL, NULL);
INSERT INTO `acudientes` VALUES (32, 'C.C.', '1127072379', 'Luz Marína Hendo Ome', '3146692507', '3175771300', NULL, 'KR 27 101-90', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (33, 'C.C.', '1030574392', 'Nimi Johanna Moreno Vilbao', '3233384349', '3161592398', NULL, 'Cl 69 7-60', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (34, 'C.C.', '1144168995', 'Mayerlin Celeste Fierro Briceño', '3042064548', '3004555972', NULL, 'KR 7Ebis 72A-06', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (35, 'C.C.', '67025998', 'Yeny Cecilia Vargas Pinilla', '3166574766', '3182217048', NULL, 'CL 105 37-74', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (36, 'C.C.', '1130671454', 'Rosmery Camacho Angola', '3052923472', '3137486063', NULL, 'KR 7P 76-40', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (37, 'C.C.', '1143980600', 'Ingrid Lucero Rivera Araujo', '3187563651', '3184065275', NULL, 'KR 28E6 82-05', 17, NULL, NULL);
INSERT INTO `acudientes` VALUES (38, 'C.C.', '1117517657', 'Yadira Morales Herrera', '3152811674', '3217882658', NULL, 'CL 10D 14-82', 16, NULL, NULL);
INSERT INTO `acudientes` VALUES (39, 'C.C.', '1107086409', 'María Ines Galeano Bolaños', '3177134878', '3157298008', NULL, 'KR 7A Bis 70-41', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (40, 'C.C.', '1127939995', 'Yuliana Angelica Jimenez Marcillo', '6622080', '3153921923', NULL, 'KR 42 Casa 95-99', 18, NULL, NULL);
INSERT INTO `acudientes` VALUES (41, 'C.C.', '98346334', 'Jose Enrique Chaves', '3136286846', '3124469714', NULL, 'KR 43 95-74', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (42, 'C.C.', '16772852', 'Hermes Fernando Cortes', '3053214633', '3152766000', NULL, 'CL 69 7-60 Bloque 1 Apto 223', 19, NULL, NULL);
INSERT INTO `acudientes` VALUES (43, 'C.C.', '29973555', 'Johanna Sinisterra Montaño', '3225888221', '3245888169', NULL, 'KR 33 96A-114', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (44, 'C.C.', '29507318', 'Maria Elena Hernandez Caro', '381 0981', '311 794 3882', NULL, 'KR 7D 70-115', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (45, 'C.C.', '1107067740', 'Melany Arboleda Biojo', '3117708109', '3228629154', NULL, 'CL 104 33-47', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (46, 'C.C.', '66835352', 'Elsy Margarita Zapata Rodriguez', '392 5961', '316 671 1204', NULL, 'KR 28G 83-115', 20, NULL, NULL);
INSERT INTO `acudientes` VALUES (47, 'C.C.', '12209089', 'Carlos Mauricio España Sanchez', '306 9609', '3216691576', NULL, 'KR 7C 72A-84', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (48, 'C.C.', '1143947884', 'Lina Marcela Zapata Viana', '3158557572', '3184532849', NULL, 'KR 33 101-71', 21, NULL, NULL);
INSERT INTO `acudientes` VALUES (49, 'C.C.', '1114820001', 'Christian Fernando Gonzalez Aparicio', '656 5995', '316 719 2505', NULL, 'KR 7L 70-75', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (50, 'C.C.', '1130634075', 'Esther Yuly Caicedo', '662 0281', '322 471 9685', NULL, 'Pasaje7Cbis 66-26', 4, NULL, NULL);
INSERT INTO `acudientes` VALUES (51, 'C.C.', '66992435', 'Maria Yolanda Mosquera', '3218476287', '3238063327', NULL, 'CL 17 74 -17', 22, NULL, NULL);
INSERT INTO `acudientes` VALUES (52, 'C.C.', '25627868', 'Marian Verónica Medina Suarez', '3154704730', '3162684083', NULL, 'KR 7B 72B-49', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (53, 'C.C.', '1079358002', 'Keisy Nicol Ordoñez Murillo', '3013743706', '3204030753', NULL, 'KR 8A 76-03', 12, NULL, NULL);
INSERT INTO `acudientes` VALUES (54, 'C.C.', '5340958', 'Albeiro Ortega Ortega', '3216656138', '3136076732', NULL, 'KR 7H 70-117', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (55, 'C.C.', '66863987', 'Mary Isabel Mesias', '6623889', '3116491269', NULL, 'KR 7M 70-192', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (56, 'C.C.', '1060873708', 'Erika Vanessa Solarte Benavides', '3205304000', '3187522909', NULL, 'KR 46 96B-03', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (57, 'C.C.', '94520373', 'Rodrigo Leon Salas Guzman', '3187815065', '3173334521', NULL, 'KR 36 101-14', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (58, 'C.C.', '29178622', 'Ana María Escobar Córdoba', '5555178', '3233436589', NULL, 'KR 25 95-54', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (59, 'C.C.', '1130681793', 'Heylin Andrea Posada Perez', '6623644', '3117414319', NULL, 'KR 7H 70-65', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (60, 'C.C.', '66875461', 'Flor de Maria Pabon', '318 6779727', '317 835 7133', NULL, 'KR 7U 73-46', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (61, 'C.C.', '1130637445', 'Kelly johannna Mancilla', '2860504', '3233314840', NULL, 'CL 103 15 A 47', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (62, 'C.C.', '1113537177', 'Alba Nelly Piedrahita', '6627015', '322 555 7556', NULL, 'KR 7R 73-80', 23, NULL, NULL);
INSERT INTO `acudientes` VALUES (63, 'C.C.', '67027676', 'marlyn yalery motato meo', NULL, '318 743 3916', NULL, 'Cl 95 # 12-27', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (64, 'C.C.', '67023322', 'Sandra Paola Calvache Rodriguez', '3128881952', '3045434922', NULL, 'CL 69 1-132 Bloque 2 Apto 403', 24, NULL, NULL);
INSERT INTO `acudientes` VALUES (65, 'C.C.', '66989417', 'Luz Amparo Viafara Ángulo', '3117396824', '3126052315', NULL, 'KR 9A 81-46', 12, NULL, NULL);
INSERT INTO `acudientes` VALUES (66, 'C.C.', '1107049891', 'Natalia Lozano Villota', '3226083250', '3144908194', NULL, 'KR 7D 84-36', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (67, 'C.C.', '31948889', 'Olga Lucia Diaz Araujo', '3117192012', '3216738237', NULL, 'KR 24D 85-33', 25, NULL, NULL);
INSERT INTO `acudientes` VALUES (68, 'C.C.', '66939501', 'Abelisa Prado Valencia', '3145795894', '3187460780', NULL, 'KR 40 95-31', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (69, 'C.C.', '1143932279', 'Rosa Eva Angola Arroyo', '3136357804', '3216343888', NULL, 'Cra 7U #93-39', 26, NULL, NULL);
INSERT INTO `acudientes` VALUES (70, 'C.C.', '1064489379', 'Lucero Herrera Sinosterra', '3173099044', '3156660512', NULL, 'KR 7U 72-75', 27, NULL, NULL);
INSERT INTO `acudientes` VALUES (71, 'C.C.', '29127261', 'Luz Marina Salverria Lucumi', '3218981244', '3136977810', NULL, 'KR 7G 71 - 39', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (72, 'C.C.', '26275146', 'Carmen Aleida Arriaga Córdoba', '3106834902', '3245735403', NULL, 'KR 25 75B-136', 28, NULL, NULL);
INSERT INTO `acudientes` VALUES (73, 'C.C.', '1130654081', 'Karen Lucumi Lugo', '3217213856', '3148623643', NULL, 'CL 17B 35A-36', 29, NULL, NULL);
INSERT INTO `acudientes` VALUES (74, 'C.C.', '1113782220', 'Sandra Patricia Morales Ramirez', '3147960584', '3155626648', NULL, 'KR 39 96B-62', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (75, 'C.C.', '113629703', 'Nicole Kharen Mina Arroyo', '3104752662', '6026628606', NULL, 'KR 13 73-64', 22, NULL, NULL);
INSERT INTO `acudientes` VALUES (76, 'C.C.', '1107531972', 'Mayra Alejandra Guaje Perdomo', '3165884633', '3023462553', NULL, 'KR 7Lbis 70-104', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (77, 'C.C.', '1143947619', 'Katerine Escobar Giron', '3023450518', '3145036212', NULL, 'KR 7L 81-43', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (78, 'C.C.', '52743818', 'Claudia Ximena Vallejos Jaramillo', '3172739400', '3222957842', NULL, 'KR 27 101-54', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (79, 'C.C.', '1005876720', 'Karen Yined Quiñones Riascos', '3011174750', '3027476581', NULL, 'KR 7C 84-38 Apto 201', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (80, 'C.C.', '1059992063', 'Luis Jose Limas Mina', '3147524103', '3225920910', NULL, 'CL 7H 72A-18', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (81, 'C.C.', '1081411048', 'Neyi Ortiz Cepeda', '3016763705', '3177926205', NULL, 'KR 7J 70-32', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (82, 'C.C.', '1060417215', 'Marelisa Aguilar Banguero', '3212288232', '3148238423', NULL, 'KR 7L 70-103', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (83, 'C.C.', '31323250', 'Diana Villegas Solis', '3187195034', '3052370606', NULL, 'CL 13A 20-52', 30, NULL, NULL);
INSERT INTO `acudientes` VALUES (84, 'C.C.', '87027665', 'Gilberto Martinez Rodriguez', '3026657694', '3143779669', NULL, 'KR 38 96B-118', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (85, 'C.C.', '31309918', 'Katheryne Agudelo Delgado', '662 9297', '319 278 3596', NULL, 'CL 707Mbis-87', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (86, 'C.C.', '29361316', 'Yisel Lorena Vargas Ocoro', '313 701 6688', '3155279199', NULL, 'Cra 7R 72-66', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (87, 'C.C.', '1113514449', 'Jennifer Millán Muñoz', '3246538074', '3128686743', NULL, 'KR 32 101-63', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (88, 'C.C.', '38464425', 'Katerine Mosquera Piedrahíta', '3188746861', '3187424532', NULL, 'KR 7Cbis 70- 106', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (89, 'C.C.', '31581812', 'Mallerlyg Salcedo Jimenez', '336 4135', '381 0784', NULL, 'CL 105 29-34', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (90, 'C.C.', '1006189473', 'Wendy Gisella Osorio Suarez', '3107436934', '3128735840', NULL, 'CL70 7Mbis-153', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (91, 'C.C.', '1005878621', 'Yesica Panchano Garcia', '3160466552', '3151048346', NULL, 'CL 56A 30B-59', 16, NULL, NULL);
INSERT INTO `acudientes` VALUES (92, 'C.C.', '1120569103', 'Jaqueline Mayorga Rodriguez', '3204933114', '3104919071', NULL, 'CL 72 7RBis-46', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (93, 'C.C.', '28539703', 'Julie Pauline Sandoval Cardenas', '3209366681', '3133246723', NULL, 'CL 72J 4N-30', 31, NULL, NULL);
INSERT INTO `acudientes` VALUES (94, 'C.C.', '1144132335', 'Jenny Sofia Rojas Castro', '3017456392', '3175771300', NULL, 'KR 7F 61-36', 32, NULL, NULL);
INSERT INTO `acudientes` VALUES (95, 'C.C.', '1080291461', 'Maria Cristina Cuéllar Parra', '3104790385', '3132248704', NULL, 'Cl 71 7MBis-43', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (96, 'C.C.', '66967701', 'Maria Schilrey Collazos Campo', '662 2597', '317 885 5476', NULL, 'KR 7M 76-45', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (97, 'C.C.', '31579052', 'Nury Lizeth Hernández Dorado', '3245482778', '3105423172', NULL, 'KR 7D 73-42', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (98, 'C.C.', '38755105', 'Lina Marcela Escalante Marin', '3156982978', '3133166105', NULL, 'KR 32 95-78', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (99, 'C.C.', '1144028602', 'Ana Maryury Castro Valencias', '3217098459', '3116129498', NULL, 'KR 28D4 106- Manazana 3 Casa 27', 33, NULL, NULL);
INSERT INTO `acudientes` VALUES (100, 'C.C.', '1110372916', 'Viviana Andrea Wilches Zapata', '3104061803', '3217493686', NULL, 'DG 26P4 93-10', 34, NULL, NULL);
INSERT INTO `acudientes` VALUES (101, 'C.C.', '1130664058', 'Kelly Ortiz Chávez', '3172590581', '3172590581', NULL, 'KR 27 # 83-03', 20, NULL, NULL);
INSERT INTO `acudientes` VALUES (102, 'C.C.', '1107046389', 'Danna Michel Yanguas Rodriguez', '3225980882', '3226609541', NULL, 'KR 7M1 93-47', 35, NULL, NULL);
INSERT INTO `acudientes` VALUES (103, 'C.C.', '1112464135', 'Diana Yicela Arias Osorio', '3226141692', '3122342298', NULL, 'KR 29Bis 30A-11', 36, NULL, NULL);
INSERT INTO `acudientes` VALUES (104, 'C.C.', '29113597', 'Karen Ortiz Chavez', '3104908180', '3104908180', NULL, 'KR 27 83-03', 20, NULL, NULL);
INSERT INTO `acudientes` VALUES (105, 'C.C.', '1005878548', 'Elizabet Castrillon Orozco', '3145042666', '3128274788', NULL, 'KR 37 95-111', 37, NULL, NULL);
INSERT INTO `acudientes` VALUES (106, 'C.C.', '1143945715', 'Jenny Ximena Quiñones Sevillano', '3002387212', '3137278120', NULL, 'KR 7D 69A-75', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (107, 'C.C.', '1130672400', 'Tito Anderson Valencia', '3165637276', '3165637276', NULL, 'CL 73 2D-17', 38, NULL, NULL);
INSERT INTO `acudientes` VALUES (108, 'C.C.', '1071348460', 'Ana Milena Pacheco Regino', '310 849 3552', '322 706 7880', NULL, 'KR 7Gbis 70-62', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (109, 'C.C.', '31922032', 'Alba Ruby Espinal Cortes', '6630962', '3122282985', NULL, 'KR 7G 72-27', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (110, 'C.C.', '31930178', 'Maria Mercedes Muñoz Sanchez', '3114445226', '3166028578', NULL, 'KR 7T 73-18', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (111, 'C.C.', '1087116424', 'Johana Marcela Estacio Sinisterra', '3148319303', '3167331189', NULL, 'CL 70 7TBis-89 Piso102', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (112, 'C.C.', '1114208984', 'Jannia Vanessa Holguin Gaviria', '317 380 9509', '3187399429', NULL, 'KR 7L 70-60', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (113, 'C.C.', '38885782', 'Adriana Milena Calderón Armero', '3148451675', '3127496271', NULL, 'KR 7J 70-05', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (114, 'C.C.', '66865023', 'Maria Teresa Palacios Aguilar', '3207395037', '3173578322', NULL, 'CL 96 12-123', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (115, 'C.C.', '78765993', 'Libardo Segundo Sanda Vertel', '3116462946', '3147983469', NULL, 'KR 39 101-118', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (116, 'C.C.', '1143975221', 'Yormary Urquijo Garcia', '314 819 7709', '312 765 6178', NULL, 'KR 7Tbis 76-25', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (117, 'C.C.', '31309343', 'Marilyn Palacios Talaga', '3108690509', '3182966809', NULL, 'KR 27B3 77-75', 39, NULL, NULL);
INSERT INTO `acudientes` VALUES (118, 'C.C.', '1134449030', 'Carlos Asad Morales Sanchez', '3154000659', '3218021921', NULL, 'CL 70 7Rbis-139', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (119, 'C.C.', '66885116', 'Claudia Patricia Giraldo Rosero', '3137239253', '3707860', NULL, 'CL 13 35Oeste-133', 40, NULL, NULL);
INSERT INTO `acudientes` VALUES (120, 'C.C.', '1061746447', 'Maria Fernanda Rodriguez Cañar', '3106641223', '3127936060', NULL, 'KR 7E 81-18', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (121, 'C.C.', '31601195', 'Ana Maria Mosquera Santana', '3137867814', '3102871082', NULL, 'KR 5C 70-41', 41, NULL, NULL);
INSERT INTO `acudientes` VALUES (122, 'C.C.', '1007711454', 'Marisol Sanchez Londoño', '3003440862', '3003427106', NULL, 'KR 13 74a 05', 22, NULL, NULL);
INSERT INTO `acudientes` VALUES (123, 'C.C.', '1107089924', 'Chady Vanessa Hurtado Lizalda', '3108341520', '3217340915', NULL, 'CL 88Lbis 33-45', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (124, 'C.C.', '76351524', 'José Gabriel Orozco Valencia', '3177732665', '3154579902', NULL, 'KR 26 95-22', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (125, 'C.C.', '1107096015', 'Dayana Lizeth Caicedo Cruz', '3232866979', '6626793', NULL, 'KR 14 73-25', 22, NULL, NULL);
INSERT INTO `acudientes` VALUES (126, 'C.C.', '94409928', 'William Gustavo Ortiz Cortes', '3103590189', '3206793472', NULL, 'KR 45 95-127', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (127, 'C.C.', '1061742190', 'Iby Mildrey Solarte Chantre', '3167563479', '3152054647', NULL, 'CL70 7Hbis-23', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (128, 'C.C.', '14622412', 'Zeus Kefren Sadhu Paez Guman', '4221314', '3216387377', NULL, 'KR 26H4 96-52', 34, NULL, NULL);
INSERT INTO `acudientes` VALUES (129, 'C.C.', '1113521080', 'Eris Karina Montoya Diaz', '6620438', '3145190655', NULL, 'KR 7J 76-58', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (130, 'C.C.', '1022945505', 'Jenny Esmeralda Romero Clavijo', '3232833230', '3166830066', NULL, 'KR 7C 72C-25', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (131, 'C.C.', '25702681', 'Nilsa Yangana', '3164400105', '3104325005', NULL, 'KR 26 101-06', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (132, 'C.C.', '94543378', 'Edison Rodriguez Barreto', '3166984428', '3167778911', NULL, 'KR 8 62 31', 32, NULL, NULL);
INSERT INTO `acudientes` VALUES (133, 'C.C.', '31305852', 'Cristina Isabel Araujo Rojas', '3122912932', '3137480655', NULL, 'CL 105 37-58', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (134, 'C.C.', '31321834', 'Viviana Ángulo Casaran', '3127387449', '3107182875', NULL, 'KR 7BBis 70-83', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (135, 'C.C.', '66970869', 'Viviana Montaña Rojas', '3058739067', '3057065315', NULL, 'KR 7Tbis 72-105', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (136, 'C.C.', '23722883', 'Genesis Andrea Arce Fuentes', '3116525116', '3178281969', NULL, 'Residencia Marco Fidel Suarez', 42, NULL, NULL);
INSERT INTO `acudientes` VALUES (137, 'C.C.', '38565255', 'Lorena Campaz Rodriguez', '3176549386', '3176549386', NULL, 'CL 103 16-54', 43, NULL, NULL);
INSERT INTO `acudientes` VALUES (138, 'C.C.', '1110232341', 'Jennifer Yanid Torres Torres', '3208129758', '3188969515', NULL, 'CL 79 7Gbis-49', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (139, 'C.C.', '66910560', 'Damir Stella Rojas Arboleda', '3173978038', '3158138037', NULL, 'CL 80C 26G2-51', 44, NULL, NULL);
INSERT INTO `acudientes` VALUES (140, 'C.C.', '1144130121', 'Jhoana Andrea Hurtado Santa', '3178868837', '3162872296', NULL, 'KR 7 72C-36', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (141, 'C.C.', '1114728633', 'Angela Geraldin Tello Segovia', '3233393809', '3186474349', NULL, 'KR 23A 72B-52', 45, NULL, NULL);
INSERT INTO `acudientes` VALUES (142, 'C.C.', '1143935261', 'Ruben Dario Alegria', '318 407 5144', '318 357 3717', NULL, 'KR 41 96B-94', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (143, 'C.C.', '1143931703', 'Fanny Yelissa Tapasco Peña', NULL, '3157843094', NULL, 'KR 7Dbis 69A-29', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (144, 'C.C.', '1023939123', 'Angela Viviana Rubio Arcila', '3103360308', '3115416408', NULL, 'KR 7L 70-66', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (145, 'C.C.', '1143942156', 'Luz Mariana Bonilla Navas', '3137913337', '3147570446', NULL, 'KR 26G5 72S1-18', 46, NULL, NULL);
INSERT INTO `acudientes` VALUES (146, 'C.C.', '1144061642', 'Karla Vanessa Herrera Saldarriaga', '3217271057', '3223401016', NULL, 'KR 26 P5 80-31', 47, NULL, NULL);
INSERT INTO `acudientes` VALUES (147, 'C.C.', '94070871', 'Luis Enrique Cuacialpu Chucrala', '3188095177', '3462465', NULL, 'KR 7Jbis 76-81', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (148, 'C.C.', '1144042649', 'Kelly Johanna Guzman Vata', '3163721770', '3052954568', NULL, 'KR 28-D4 Cll123A-81', 48, NULL, NULL);
INSERT INTO `acudientes` VALUES (149, 'C.C.', '31893345', 'Noralba Castro Gonzalez', '3212153823', '3235252318', NULL, 'KR 7Jbis 7-58', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (150, 'C.C.', '38555080', 'Ana Ruby Ortiz Hoyos', '3175706800', '3147756316', NULL, 'KR 32 96A-31', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (151, 'C.C.', '60386752', 'Maria Carolina Lindarte Rincón', '3245721020', '3104679543', NULL, 'KR 83C 53A-34 Unidad Los Almendros', 49, NULL, NULL);
INSERT INTO `acudientes` VALUES (152, 'C.C.', '1144129574', 'Diana Carolina Osorio Zamora', '3005514922', '3005514922', NULL, 'KR 37 95-27', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (153, 'C.C.', '67037926', 'Claudia Lorena Rodriguez Ortega', '3152173384', '3172734483', NULL, 'CL 93 27D-87', 20, NULL, NULL);
INSERT INTO `acudientes` VALUES (154, 'C.C.', '29113937', 'Dabeiba Andrade Castillo', '3122598329', '3128030082', NULL, 'KR 7S 93-36', 50, NULL, NULL);
INSERT INTO `acudientes` VALUES (155, 'C.C.', '38567758', 'Diana Patricia Gonzalez Ramirez', '3186517896', '3014084053', NULL, 'KR 7L 68A-43', 51, NULL, NULL);
INSERT INTO `acudientes` VALUES (156, 'C.C.', '1111788885', 'Marileidy Rebolledo Delgado', '3168142131', '3232900683', NULL, 'KR 43 95-139', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (157, 'C.C.', '1130642275', 'Diana Marcela Montes Galeano', '3204370663', '3108919795', NULL, 'KR 21 80C-168', 10, NULL, NULL);
INSERT INTO `acudientes` VALUES (158, 'C.C.', '31565472', 'Aura Maria Pineda Urbano', '3182240206', '3183074017', NULL, 'KR 26P19 Tv103-28', 52, NULL, NULL);
INSERT INTO `acudientes` VALUES (159, 'C.C.', '1027966683', 'Anayibe Candelo Hurtado', '3016165962', '3207281777', NULL, 'KR 26H3 93-04 3 Piso', 53, NULL, NULL);
INSERT INTO `acudientes` VALUES (160, 'C.C.', '1144160783', 'Gladys Xiomara Lopez Bolaños', '318 697 9776', '316 778 9877', NULL, 'CL 71 7Mbis-12', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (161, 'C.C.', '38570035', 'Candida Rosa Colorado Valencia', '311 375 1931', '310 569 6784', NULL, 'KR 35 96C-23', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (162, 'C.C.', '31483074', 'Yarledy Rojas Guzmán', '3169800190', '3185887761', NULL, 'KR 7C 84-75 Apto 201', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (163, 'C.C.', '1130658818', 'Monica Aguirre Calle', '3187308645', '3188126632', NULL, 'CL 72V 25L-33', 9, NULL, NULL);
INSERT INTO `acudientes` VALUES (164, 'C.C.', '1111753403', 'Pablo Andres Saavedra Quiñonez', '3217409398', '3022713625', NULL, 'CL 112 26F- 108-126', 6, NULL, NULL);
INSERT INTO `acudientes` VALUES (165, 'C.C.', '66853182', 'Clara Ines Palacios Burbano', '3122051715', '3207487708', NULL, 'CL 72 7Tbis-35', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (166, 'C.C.', '1144140487', 'Jenny Carolina Otero Muñoz', '3166058666', '3001232623', NULL, 'KR 38 95-115', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (167, 'C.C.', '1107045045', 'Sandra Vanessa Lopez Alzate', '391 4292', '318 317 0717', NULL, 'CL 78 27-71', 20, NULL, NULL);
INSERT INTO `acudientes` VALUES (168, 'C.C.', '1059446224', 'Jackeline Rodriguez Gongora', '315 337 3479', '315 440 6152', NULL, 'KR 45 96B-38', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (169, 'C.C.', '30276974', 'Maria Magnolia Toro Buitrago', '3164889408', '3013436953', NULL, 'KR 7R 73-52', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (170, 'C.C.', '38873724', 'Diana Patricia Montoya Cardona', '3153635043', '3188880511', NULL, 'KR 7Hbis 70-98', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (171, 'C.C.', '38468964', 'Doris No Tengo Valencia Rengifo', '3156824671', '3016528722', NULL, 'KR 7SBis 72-100', 54, NULL, NULL);
INSERT INTO `acudientes` VALUES (172, 'C.C.', '1136059356', 'Monica Alejandra Segura Cortes', '3004080122', '3172742512', NULL, 'CL 82 28E-21', 17, NULL, NULL);
INSERT INTO `acudientes` VALUES (173, 'C.C.', '1143944901', 'Laura Alejandra Castaño Alzate', '3184159261', '3142630964', NULL, 'CL 125 Bis 26I4 -39', 55, NULL, NULL);
INSERT INTO `acudientes` VALUES (174, 'C.C.', '29121478', 'Francia Elena Reyes', '3154501946', '6624043', NULL, 'KR 7D 66-46', 4, NULL, NULL);
INSERT INTO `acudientes` VALUES (175, 'C.C.', '1107040642', 'Andres Felipe Murillo Bermudez', '3137059441', '3136862797', NULL, 'KR 7CBis 84-114', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (176, 'C.C.', '31484554', 'Jenifer Aros Echeverry', '3225683334', '3174925284', NULL, 'KR 39 101-90', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (177, 'C.C.', '4177522', 'Emili Patricia Gudiño Anzola', '3003576146', '3206293555', NULL, 'CL 70 7M-09', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (178, 'C.C.', '31711004', 'Diana Elena Gonzalez Espinosa', '3126914018', '3232861226', NULL, 'CL 72R 27-22', 56, NULL, NULL);
INSERT INTO `acudientes` VALUES (179, 'C.C.', '1144128552', 'Luz Ximena Ospina Vivas', '3166610972', '3175771300', NULL, 'KR 20A 12-127', 57, NULL, NULL);
INSERT INTO `acudientes` VALUES (180, 'C.C.', '66984936', 'Derly Jazmin Bermudez Rodriguez', '3148719861', '3146678440', NULL, 'KR 26H 73-32', 53, NULL, NULL);
INSERT INTO `acudientes` VALUES (181, 'C.C.', '1126564053', 'Leidy Diana Otalvaro Sevillano', '3505517781', '3237709223', NULL, 'KR 7A 72C-75', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (182, 'C.C.', '1130629703', 'Nicole Kharen Mina Arroyo', '3104752662', '6026628606', NULL, 'KR 13 73-64', 22, NULL, NULL);
INSERT INTO `acudientes` VALUES (183, 'C.C.', '38613514', 'Lina Marcela Osorio Giraldo', '3156805308', '32252535', NULL, 'CL 13-35 Oeste', 40, NULL, NULL);
INSERT INTO `acudientes` VALUES (184, 'C.C.', '40729894', 'Idali Mateus Tique', '3177596097', '3153737572', NULL, 'KR 7SBis 73-53', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (185, 'C.C.', '14089962', 'Soannys Del Valle Orea de Escobar', '3218732625', '3022881862', NULL, 'CL 96 12-06', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (186, 'C.C.', '29506871', 'Betty Yaneth Giron Bermudez', '3133163527', '3133163527', NULL, 'KR 70 7JBis-41', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (187, 'C.C.', '1143960269', 'Ruddy Stephanye Huetio Hormiga', '3104562126', '3135997250', NULL, 'CL 105 25-38', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (188, 'C.C.', '1039678541', 'Beatriz Elena Londoño Silva', '3127429643', '3147427356', NULL, 'CL 70 7Tbis-15', 58, NULL, NULL);
INSERT INTO `acudientes` VALUES (189, 'C.C.', '94375701', 'Ruben Dario Hurtado Padilla', '3027004700', '3187885749', NULL, 'CL 69 7A-60', 59, NULL, NULL);
INSERT INTO `acudientes` VALUES (190, 'C.C.', '29126871', 'Francy Helena Rodriguez Garcia', '3116584405', '3148062607', NULL, 'KR 45 96C - 35', 60, NULL, NULL);
INSERT INTO `acudientes` VALUES (191, 'C.C.', '1144130725', 'Maryi Andrea Garzon Meneses', '3156104539', '3168257798', NULL, 'CL 72 7PBis-38', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (192, 'C.C.', '1113303723', 'Jhuliana Garcia Gonzalez', '3128593923', '3207318470', NULL, 'KR 40 95-01', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (193, 'C.C.', '1144126463', 'Dasly Angie Carvajal Bermudez', '3153463278', '3178792815', NULL, 'KR 26I3 73-08', 53, NULL, NULL);
INSERT INTO `acudientes` VALUES (194, 'C.C.', '29118780', 'Sandra Milena Quilindo Martinez', '3137891388', '3052923328', NULL, 'CL 72 7Sbis-39', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (195, 'C.C.', '29927969', 'Norbelly Velasquez Velasquez', '3145028901', '3218406110', NULL, 'KR 7M 70-155', 61, NULL, NULL);
INSERT INTO `acudientes` VALUES (196, 'C.C.', '1113522824', 'Angie Lorena Coronado Muñoz', '3160685920', '3042012768', NULL, 'CL 75 7TBis-113', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (197, 'C.C.', '21030715', 'Janny Margarita Uzcategui Diaz', '3006503466', '3164575984', NULL, 'KR 7Dbis 69 A 17 Apto 301', 4, NULL, NULL);
INSERT INTO `acudientes` VALUES (198, 'C.C.', '1052964755', 'Yesimar Correa Martinez', '3151282905', '3235175293', NULL, 'KR 26M1 73B-46', 53, NULL, NULL);
INSERT INTO `acudientes` VALUES (199, 'C.C.', '67004330', 'Andrea Valencia Aguirre', '3214982936', '3146151842', NULL, 'KR 25 26B-05', 62, NULL, NULL);
INSERT INTO `acudientes` VALUES (200, 'C.C.', '1144179299', 'Solangie Gruezo Carvajal', '656 5322', '316 371 8762', NULL, 'KR 7C bis 84-23', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (201, 'C.C.', '29346986', 'Juliana Possu Garces', '3218749972', '3195096920', NULL, 'CL 80 8A-40', 12, NULL, NULL);
INSERT INTO `acudientes` VALUES (202, 'C.C.', '66945045', 'Rocio Ordoñez Gonzalez', '3192041200', '3146635378', NULL, 'KR 49B 51-46', 7, NULL, NULL);
INSERT INTO `acudientes` VALUES (203, 'C.C.', '1006188493', 'Luisa Vanessa Mosquera Mancilla', '3157364958', '3174446544', NULL, 'CL 105 37-59', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (204, 'C.C.', '1082689893', 'Ingrid Janeth Pay Landazury', '3205592695', '3014096373', NULL, 'Diagonal 70B 22A-04', 9, NULL, NULL);
INSERT INTO `acudientes` VALUES (205, 'C.C.', '66939535', 'Janeth Millan Castañeda', '3104321244', '3163075576', NULL, 'CL 72C 7A-10', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (206, 'C.C.', '94487592', 'Edwar Antonio Gaviria', '3235091657', '3146155503', NULL, 'KR 38 101-42', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (207, 'C.C.', '66864173', 'Lucey Urbano Martinez', '3113739707', '3187847678', NULL, 'KR 26G3 73Abis-47', 63, NULL, NULL);
INSERT INTO `acudientes` VALUES (208, 'C.C.', '66988257', 'Sandra Janet Alba', '321 642 1061', '313 706 9680', NULL, 'KR 7C 72A-94', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (209, 'C.C.', '1130643356', 'Claudia Marcela Toro Grisales', '3126489839', '3906102', NULL, 'KR 26 I2 123 - 107', 64, NULL, NULL);
INSERT INTO `acudientes` VALUES (210, 'C.C.', '38463454', 'Yovana Isabel Moscoso Rivera', '6023086463', '3146871102', NULL, 'KR 26P6 87-02', 34, NULL, NULL);
INSERT INTO `acudientes` VALUES (211, 'C.C.', '35990464', 'Maria Celina Papelito Flaco', '3126014244', '3126014244', NULL, 'CL 85 8A-18', 65, NULL, NULL);
INSERT INTO `acudientes` VALUES (212, 'C.C.', '38468893', 'Rosa Amalia Rengifo Palacios', '4877129', '3176808567', NULL, 'KR 7E bis 72A-50', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (213, 'C.C.', '1143944061', 'Katherine Tutistar Céspedes', '3147063943', '3184993926', NULL, 'KR 7S 73-92', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (214, 'C.C.', '1143927994', 'Jessika Cecilia Bermudez Timote', '3116145733', '3206642851', NULL, 'KR 7T 73-117', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (215, 'C.C.', '25328315', 'Liliana Ararat Mina', '663 6954', '321 269 4795', NULL, 'KR 7T 77-23', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (216, 'C.C.', '38683911', 'Sandra Milena Cuero Cabrera', '3117761236', '310 464 7234', NULL, 'CL 88 7bis-', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (217, 'C.C.', '31568238', 'Francy Julieth Montenegro Muñoz', '3128429487', '3168879508', NULL, 'KR 40 96A-18', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (218, 'C.C.', '66911279', 'Jackeline Echeverry Reyes', '3172382560', '3185890558', NULL, 'KR 27 101-98', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (219, 'C.C.', '31958429', 'Ceneida Parodi Magallanes', '662 55 76', '314 814 7311', NULL, 'KR 7U 76-36', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (220, 'C.C.', '1144129288', 'Paola Andrea Lozano', '321 870 1587', '317 468 5415', NULL, 'CL 88 7F-37', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (221, 'C.C.', '1116433959', 'Alba Yury Marin Moncada', '3185831233', '3136962077', NULL, 'KR 7MBis 76- 22', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (222, 'C.C.', '29347128', 'Flor Angela Serna Gonzalez', '6638783', '3188405074', NULL, 'CL 92 7Q-08', 5, NULL, NULL);
INSERT INTO `acudientes` VALUES (223, 'C.C.', '1144124158', 'Gloria Amparo Gaviria Colonia', NULL, '315 802 1853', NULL, 'CL 88 7D-37', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (224, 'C.C.', '29180604', 'Sandra Yolena Acosta Guevara', '662 1983', '300 558 3547', NULL, 'KR 7M 70-92', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (225, 'C.C.', '1089798714', 'Jhoana Benitez Cuero', '3173654950', '3147424449', NULL, 'CL 67 2A-21', 66, NULL, NULL);
INSERT INTO `acudientes` VALUES (226, 'C.C.', '1118284667', 'Yare Asucena Canencio Meza', '3164661107', '3188242171', NULL, 'KR 38 95-19', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (227, 'C.C.', '31610476', 'Gloria Rodriguez Mendoza', '3113322666', '3226805643', NULL, 'KR 41 96B-34', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (228, 'C.C.', '31947767', 'Barbara Angulo Sinisterra', '3215234843', '3241977611', NULL, 'KR 28D6 123D-11', 48, NULL, NULL);
INSERT INTO `acudientes` VALUES (229, 'C.C.', '59686636', 'Iris Alicia Reinel Lopez', '3446271', '315 816 2551', NULL, 'CL 72A 4-108', 67, NULL, NULL);
INSERT INTO `acudientes` VALUES (230, 'C.C.', '16932960', 'Rolando Andrés Rojas', '3183828133', '3167988562', NULL, 'KR 37 101-102', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (231, 'C.C.', '1143856437', 'Natali Hinestroza Benavides', '3185948257', '3157372067', NULL, 'KR 7S 77-25', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (232, 'C.C.', '35990447', 'Yerlin Patricia Perea Quiñones', '3225934703', '3176252387', NULL, 'KR 7T 72-64', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (233, 'C.C.', '38561434', 'Maryuri Celis Alvarez', '6560797', '3168973851', NULL, 'CL 71 7Rbis-11', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (234, 'C.C.', '66879106', 'Carmen Elena Solarte Sarria', '3226359511', '3226359511', NULL, 'KR 7M 92-32', 50, NULL, NULL);
INSERT INTO `acudientes` VALUES (235, 'C.C.', '1130669927', 'Leidy Jhoana Zuluaga Márquez', '3182076139', '3185919609', NULL, 'CL 79B 20-15', 10, NULL, NULL);
INSERT INTO `acudientes` VALUES (236, 'C.C.', '43873048', 'Luz Aida Tamayo Agudelo', '3008573742', '3012669161', NULL, 'CL 70 7R-80 Bloq 7 Apto 501', 68, NULL, NULL);
INSERT INTO `acudientes` VALUES (237, 'C.C.', '1130595051', 'Dario Vera Cuaspud', '3168365932', '3183390459', NULL, 'KR 39 101-02', 21, NULL, NULL);
INSERT INTO `acudientes` VALUES (238, 'C.C.', '66802491', 'Norelly Gonzalez Arce', '3175061262', '3235918929', NULL, 'KR 7H #70-84', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (239, 'C.C.', '29113401', 'Liliana Ramirez Gonzalez', '486 9414', '318 465 9361', NULL, 'KR 42 95-91', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (240, 'C.C.', '31993069', 'Yineth Angel', '3206041980', '3232936574', NULL, 'KR 7 L Bis 76 11', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (241, 'C.C.', '18571152', 'Zudeleinny Del Valle Castro Zarraga', '3183441300', '3163299777', NULL, 'KR 32 98A- 26', 69, NULL, NULL);
INSERT INTO `acudientes` VALUES (242, 'C.C.', '1003713082', 'Neira Maria Barboza Feria', '6565279', '320 762 9942', NULL, 'CL 70 7m bis-103', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (243, 'C.C.', '1144163947', 'Diana Maria Moreno Garcia', '6023820294', '3163362364', NULL, 'KR 7B 72A-32', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (244, 'C.C.', '1006190712', 'Angie Vanessa Caicedo Caicedo', '3144623390', '3104061121', NULL, 'KR 1C1 65-22 Torre 9A Apto 101', 70, NULL, NULL);
INSERT INTO `acudientes` VALUES (245, 'C.C.', '38683965', 'Xiomara Rodriguez Zapata', '3011553207', '3246847301', NULL, 'CL 56E 43A-56', 71, NULL, NULL);
INSERT INTO `acudientes` VALUES (246, 'C.C.', '66949239', 'Zulemy Tovar Sanchez', NULL, '318 594 7141', NULL, 'CL 84 7Cbis-40', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (247, 'C.C.', '1144148458', 'Diana Lorena Arias Hernandez', '3053314689', '3182594728', NULL, 'KR 8 74-17', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (248, 'C.C.', '1022324760', 'Andrea Johana Martinez Perilla', '3187683732', '3182242435', NULL, 'CL 81 7F-04', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (249, 'C.C.', '66957327', 'Sandra Milena Bautista Ibarra', '3153735372', '3178708902', NULL, 'CL 106 12-82', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (250, 'C.C.', '42122285', 'Ana Felisa Nuñez Angulo', '3164800128', '3170633608', NULL, 'KR 42 96C-78', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (251, 'C.C.', '38681790', 'Teotista Ibargüen Ibargüen', '322 690 8631', '320 758 3202', NULL, 'CL 108 26-119', 11, NULL, NULL);
INSERT INTO `acudientes` VALUES (252, 'C.C.', '31276244', 'Judith Gaviria', '6624922', '3176032429', NULL, 'CL 100 23A-40', 72, NULL, NULL);
INSERT INTO `acudientes` VALUES (253, 'C.C.', '94509924', 'Gustavo Lopez Abad', '663 6126', '316 355 8049', NULL, 'CL 88 7Tbis-53', 73, NULL, NULL);
INSERT INTO `acudientes` VALUES (254, 'C.C.', '14620574', 'Emerzon Marmol Fernandez', '4019741', '3205286326', NULL, 'CL 100 22B-47', 72, NULL, NULL);
INSERT INTO `acudientes` VALUES (255, 'C.C.', '1143935081', 'Lina Marcela Mondragón Mosquera', '3158649231', '3117144507', NULL, 'CL 27A 103-74', 15, NULL, NULL);
INSERT INTO `acudientes` VALUES (256, 'C.C.', '1130635692', 'Sandra Milena Caicedo Cuero', '3176718057', '3112838124', NULL, 'KR 33 101-75', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (257, 'C.C.', '38614467', 'Claudia Ximena Vidales Lopez', '3166315618', '2760134', NULL, 'KR 29 101-79', 74, NULL, NULL);
INSERT INTO `acudientes` VALUES (258, 'C.C.', '16746766', 'Juan Carlos Piedrahita Cardona', '306 9256', '318 214 6449', NULL, 'KR 7Ebis 72A-57', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (259, 'C.C.', '1006070947', 'Darlyn Eliana Ortiz Trujillo', '4201076', '3177983252', NULL, 'KR 7G 73-49', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (260, 'C.C.', '1111767769', 'Sugehy Fernanda Quintana Mendonza', '3135339401', '3219278941', NULL, 'CL 76 7F 73-76', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (261, 'C.C.', '1038803521', 'Ana Isabel Ramos Torres', NULL, '314 616 8998', NULL, 'CL72C 7-04', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (262, 'C.C.', '14606634', 'Yovanni Torres Hurtado', '3920716', '3920716', NULL, 'KR 27G 83-116', 20, NULL, NULL);
INSERT INTO `acudientes` VALUES (263, 'C.C.', '29115706', 'bertha sinisterra garcia', NULL, '3183538496', NULL, 'KR 7m bis 7m bis-95', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (264, 'C.C.', '1112471728', 'Jhulyt Katerine Lopez Arevalo', '663 8588', '317 411 9014', NULL, 'KR 7Tbis 72-46', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (265, 'C.C.', '16944774', 'Francisco Julián Cardoza Rodríguez', '3023728606', '3206668161', NULL, 'KR 7 82-108', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (266, 'C.C.', '31305761', 'Jhenny Katerin Toro Florez', '3173635570', '3188184086', NULL, 'Kr 8D 73-59', 22, NULL, NULL);
INSERT INTO `acudientes` VALUES (267, 'C.C.', '1144141106', 'Yury Magaly Ramos Gomez', '3104702837', '3166893216', NULL, 'KR 7M 70-141', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (268, 'C.C.', '67005411', 'Paula Toloza Estupiñan', '3186031850', '3183478564', NULL, 'KR 7MBis 65-02', 32, NULL, NULL);
INSERT INTO `acudientes` VALUES (269, 'C.C.', '29351925', 'Diana Patricia Holguin Caicedo', '663 3473', '3053437838', NULL, 'KR 7Abis 86-36', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (270, 'C.C.', '1130681468', 'Leidy Diana Muñoz Manzo', '3187383019', '3157820526', NULL, 'KR 7H 64-72', 32, NULL, NULL);
INSERT INTO `acudientes` VALUES (271, 'C.C.', '14012546', 'Leonardo Carmona Lozada', '3183011851', '6023819706', NULL, 'KR 7Cbis 70-85', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (272, 'C.C.', '1130667827', 'Leydi Yhoana Urbano Sanchez', '3188747559', '6621374', NULL, 'KR 7M 76-26', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (273, 'C.C.', '1130624648', 'Sandra Milena Suarez Morales', '3162805926', '3172701581', NULL, 'KR 26A 1 75B-27', 75, NULL, NULL);
INSERT INTO `acudientes` VALUES (274, 'C.C.', '94458385', 'Jose Alberto Charry Sánchez', '3153339386', '3137176392', NULL, 'KR 36 46B-18', 76, NULL, NULL);
INSERT INTO `acudientes` VALUES (275, 'C.C.', '94441668', 'Edwar de la Cruz', '286 0760', '316 625 4636', NULL, 'KR 38 101-46', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (276, 'C.C.', '1245422', 'Maria Fatima Romero Pico', '3186313944', '3015142957', NULL, 'CL 72 3-73', 77, NULL, NULL);
INSERT INTO `acudientes` VALUES (277, 'C.C.', '1130655239', 'Angela Maria Arevalo Muñoz', '3167389515', '3185895940', NULL, 'KR 26F 75B-39', 39, NULL, NULL);
INSERT INTO `acudientes` VALUES (278, 'C.C.', '31847282', 'Amira Amira Bermeo Cutiva', '3206319823', '3143925926', NULL, 'KR 86 28D-189', 78, NULL, NULL);
INSERT INTO `acudientes` VALUES (279, 'C.C.', '1143835286', 'Diana Milena Rengifo Perez', '372 0220', '3185997722', NULL, 'KR 7Abis 72C-03', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (280, 'C.C.', '19118780', 'Sandra Milena Quilindo Martínez', '3137891388', '3176043445', NULL, 'CL 72 7Sbis-39', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (281, 'C.C.', '1235255466', 'Maxima Isabel Muñoz Bruges', '3023112504', '3233507567', NULL, 'CL 69 7Bbis-12', 79, NULL, NULL);
INSERT INTO `acudientes` VALUES (282, 'C.C.', '1076321525', 'Silvia Bermudez Manyoma', '3225776310', '3177722156', NULL, 'DG 26 H2 73-73', 53, NULL, NULL);
INSERT INTO `acudientes` VALUES (283, 'C.C.', '37558319', 'Jenny Shirley Salazar Mosquera', '3137578228', '3183072500', NULL, 'KR 32 95-62', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (284, 'C.C.', '31572090', 'Deisy Yinneth Salazar Casaran', '3105364480', '3184041119', NULL, 'KR 7Tbis 73-78', 54, NULL, NULL);
INSERT INTO `acudientes` VALUES (285, 'C.C.', '31611091', 'Maria Ilcy Grueso García', '3106911578', '3117866803', NULL, 'CL 72B 1A4B - 17', 80, NULL, NULL);
INSERT INTO `acudientes` VALUES (286, 'C.C.', '1113527786', 'Cindy Carolina Castro Castro', '3152589528', '3184768758', NULL, 'K.15 Via Cavasa Casa93', 81, NULL, NULL);
INSERT INTO `acudientes` VALUES (287, 'C.C.', '29119472', 'Melba Danieyi Molina Cabezas', '3164110207', '3153225530', NULL, 'CL 82 7Hbis-09', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (288, 'C.C.', '1144152910', 'Maria Esmeralda Aldana Mazabel', '3158114001', '3168728039', NULL, 'Casa 16 Callejon Sanandresito', 82, NULL, NULL);
INSERT INTO `acudientes` VALUES (289, 'C.C.', '48649548', 'Ofelia Rodriguez Caicedo', '3153648361', '3128385746', NULL, 'CL 81 7Gbis-03', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (290, 'C.C.', '1118285377', 'Lina Fernanda Castillo Gallego', '3105052267', '3127093725', NULL, 'KR 28J 72Z4-10', 16, NULL, NULL);
INSERT INTO `acudientes` VALUES (291, 'C.C.', '27307342', 'Marianita de Jesus Mier Morales', '3852436', '315 826 9816', NULL, 'CL 73 7M-18', NULL, NULL, NULL);
INSERT INTO `acudientes` VALUES (292, 'C.C.', '1266775', 'María Dominga Aldana Vasquez', '3235097657', '3138184847', NULL, 'CL 18 73-81', 83, NULL, NULL);
INSERT INTO `acudientes` VALUES (293, 'C.C.', '66926079', 'Tania Vergara', '3164073669', '3163049643', NULL, 'CL 76 7Tbis-64', 54, NULL, NULL);
INSERT INTO `acudientes` VALUES (294, 'C.C.', '66902001', 'Luz Stella García Arias', '3215807256', '3160804149', NULL, 'KR 26I1 83-18', 53, NULL, NULL);
INSERT INTO `acudientes` VALUES (295, 'C.C.', '1130652772', 'Maria Yolima Vargas', '3147229548', '3116972382', NULL, 'CL 80E 26G -22', 84, NULL, NULL);
INSERT INTO `acudientes` VALUES (296, 'C.C.', '66964730', 'Luz Karime Agudelo Gutierrez', '3187106625', '3183384736', NULL, 'CL 96 12-90', 85, NULL, NULL);
INSERT INTO `acudientes` VALUES (297, 'C.C.', '16798878', 'Fran Yury Restrepo Cortes', '3117518840', '3117175639', NULL, 'KR 7B 86-121', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (298, 'C.C.', '111045419', 'Leidy Mayerli Diaz Robles', '3233384095', '3173800181', NULL, 'KR 26P 118-24', 6, NULL, NULL);
INSERT INTO `acudientes` VALUES (299, 'C.C.', '1114827354', 'Yuliana Isabel Murillo Quiñones', '3122682154', '3234723861', NULL, 'CL 83A 20-83', 10, NULL, NULL);
INSERT INTO `acudientes` VALUES (300, 'C.C.', '66948936', 'Johanna Paola Saavedra Varon', '3154269409', '3882957', NULL, 'KR 7T 72-35', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (301, 'C.C.', '1130650951', 'Dalia Sabrina Rodriguez Preciado', '3127198773', '3136128418', NULL, 'KR 26J 122-22', 86, NULL, NULL);
INSERT INTO `acudientes` VALUES (302, 'C.C.', '29675277', 'Luz Karime Corrales Ospina', '6655047', '3013647847', NULL, 'CL 85 28C2-12', 87, NULL, NULL);
INSERT INTO `acudientes` VALUES (303, 'C.C.', '1130631049', 'Maria Orfelina Castro Cardenas', '3156992079', '3183506894', NULL, 'KR 35 101-59', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (304, 'C.C.', '66858192', 'Clara Rosa Meneses Ortega', '3156331538', '3166808663', NULL, 'KR 44 95-98', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (305, 'C.C.', '1107069602', 'Angie Ospina Ramirez', '316 491 2589', '300 250 4380', NULL, 'KR 42 95-14', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (306, 'C.C.', '43488639', 'gloria stella montoya', '284 8739', '314 721 4502', NULL, 'KR 13 103-30', 21, NULL, NULL);
INSERT INTO `acudientes` VALUES (307, 'C.C.', '9441668', 'Edward De La Cruz', '286 0760', '316 625 4636', NULL, 'KR 38 101-46', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (308, 'C.C.', '24344403', 'Leidy Lorena Gallego', '3154650705', '3147266038', NULL, 'KR 7E 72A-62', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (309, 'C.C.', '16947774', 'Jose Carmen Garces Angulo', '3178291408', '3127397926', NULL, 'CL 71 7Rbis-72', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (310, 'C.C.', '1110467304', 'Ester Marisol Mercado Rodríguez', '3229469843', '3213902686', NULL, 'CL 13 35 Oeste 255 Torre B Apartamento 204', 40, NULL, NULL);
INSERT INTO `acudientes` VALUES (311, 'C.C.', '26560429', 'Norma Jimena Diaz Fernandez', '3125136944', '3218497239', NULL, 'CL 31 97-25', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (312, 'C.C.', '38681390', 'Maria Elena Hernadez Escobar', '3186342333', '3168261636', NULL, 'KR 7Cbis 70-53', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (313, 'C.C.', '1130647460', 'Gianny Tatiana García Lasprilla', '3157640947', '3152937328', NULL, 'Calle 70 7EBis -57', 88, NULL, NULL);
INSERT INTO `acudientes` VALUES (314, 'C.C.', '11151968302', 'Maria Viviana Mondragon Hinestroza', '3127397926', '3132452321', NULL, 'KR 7M 70-84', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (315, 'C.C.', '1057757801', 'Leidy Johanna Montoya Velez', NULL, '3117809431', NULL, 'KR 7 72C-86', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (316, 'C.C.', '16743451', 'Hermes Armando Muñoz Muñoz', '3214801456', '3214801456', NULL, 'CL 98 12-82', 21, NULL, NULL);
INSERT INTO `acudientes` VALUES (317, 'C.C.', '1111740311', 'Angela Renteria Cuero', NULL, '3004209124', NULL, 'CL 106 37-42', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (318, 'C.C.', '1143939873', 'Victor Alfonso Paja Camacho', '3104092096', '3217822607', NULL, 'CL 97 16-85', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (319, 'C.C.', '66850863', 'Diana Patricia Yunda Ramirez', '3128187094', '3167692418', NULL, 'KR 8A 76-60', 12, NULL, NULL);
INSERT INTO `acudientes` VALUES (320, 'C.C.', '1014214775', 'Aura Cecilia Salazar Ramirez', '3206742728', '3126217357', NULL, 'CL 104 14-39', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (321, 'C.C.', '24767238', 'María Liliana Salazar Parra', '3116250289', '3116299168', NULL, 'KR 31 101-55', 89, NULL, NULL);
INSERT INTO `acudientes` VALUES (322, 'C.C.', '31570406', 'Maria Elena Angulo Correa', '3182052398', '314 623 7690', NULL, 'KR 7Sbis 77-67', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (323, 'C.C.', '1144134340', 'Tatiana Valencia Mina', '3227143690', '3234221642', NULL, 'CL 76 9A-62', 12, NULL, NULL);
INSERT INTO `acudientes` VALUES (324, 'C.C.', '1144149094', 'Lina Vanessa Valencia Quiñones', '3218299963', '3176814240', NULL, 'KR 25C 75B-136', 10, NULL, NULL);
INSERT INTO `acudientes` VALUES (325, 'C.C.', '1053765572', 'Sandra Lorena Sanchez Ospina', '312 775 6370', '3148840583', NULL, 'KR 7B 69-99', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (326, 'C.C.', '1090406632', 'Karen Zulay Gomez Chacon', '3003856572', '311 813 9283', NULL, 'KR 7L 70-103', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (327, 'C.C.', '1130677557', 'Lina Yurley Hurtado Londoño', '3042742977', '3172768857', NULL, 'KR 7E 81-18', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (328, 'C.C.', '94042623', 'Henry Barona', '3175322107', '3173336331', NULL, 'KR 7S 76-29', 61, NULL, NULL);
INSERT INTO `acudientes` VALUES (329, 'C.C.', '1152694356', 'Katerin Francelly Duarte Moreno', '3002122477', '3014391277', NULL, 'KR 7Bis 69-119', 79, NULL, NULL);
INSERT INTO `acudientes` VALUES (330, 'C.C.', '94451126', 'Jhonn Eward Castillo Ceballos', '3005165610', '3164815392', NULL, 'KR 7BBis 70-49', 90, NULL, NULL);
INSERT INTO `acudientes` VALUES (331, 'C.C.', '1004769808', 'Nohemi Micolta Micolta Cuero', '3218376448', '3226288849', NULL, 'KR 7R 72-66', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (332, 'C.C.', '1114728579', 'Sandra Lorena Arenas Guzmán', '3226100973', '3207452460', NULL, 'CL 92 7Q-06', 91, NULL, NULL);
INSERT INTO `acudientes` VALUES (333, 'C.C.', '31712073', 'Deisy Murillo Capote', '317 307 1088', '3175438045', NULL, 'KR 7E 72A-43', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (334, 'C.C.', '66833052', 'Ana Milena Mina Santana', '3212040849', '3212040849', NULL, 'KR 7Hbis 76-44', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (335, 'C.C.', '66926550', 'Ligia Yadira Padilla Hernandez', '3216404929', '3135464052', NULL, 'CL 100B 22B-86', 72, NULL, NULL);
INSERT INTO `acudientes` VALUES (336, 'C.C.', '94431873', 'Andres Alberto Diaz Paz', '3059037625', '3122207856', NULL, 'KR 46 96B-03', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (337, 'C.C.', '38556500', 'Leidy Victoria Fierro Briceño', '3233432554', '0', NULL, 'KR 7D Bis 70-131', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (338, 'C.C.', '55065520', 'Judith Tatiana Vargas Plazas', '3107508235', '3204233456', NULL, 'KR 7DBis 72A-96', 92, NULL, NULL);
INSERT INTO `acudientes` VALUES (339, 'C.C.', '1149188435', 'Yuliana Soliman Potes', '3006235042', '3234726869', NULL, 'KR 7B 72B-60', 93, NULL, NULL);
INSERT INTO `acudientes` VALUES (340, 'C.C.', '1107048160', 'Daniela Muñoz Serna', '3113467792', '3113468429', NULL, 'KR 7Mbis76-63', 61, NULL, NULL);
INSERT INTO `acudientes` VALUES (341, 'C.C.', '76277263', 'Reinel Ocoro Bonilla', '3233374811', '3970762', NULL, 'KR 7J 73-69', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (342, 'C.C.', '47148561', 'Heidi Yurani Hernández Fuentes', '3008553283', '3215189743', NULL, 'KR 26G11 72S-108', 94, NULL, NULL);
INSERT INTO `acudientes` VALUES (343, 'C.C.', '15107812', 'Evelin Maria Rodriguez Dudamel', '3182872948', '3226348376', NULL, 'KR 28C 72Z-327', 95, NULL, NULL);
INSERT INTO `acudientes` VALUES (344, 'C.C.', '38613732', 'Johanna Andrea Salazar Velasquez', '3007597803', '3042521873', NULL, 'KR 26I1 72W-111', 94, NULL, NULL);
INSERT INTO `acudientes` VALUES (345, 'C.C.', '1143941020', 'Diana Vanessa Arrubla Mallama', '3160846743', '3160846744', NULL, 'CL 104 29-11', 1, NULL, NULL);
INSERT INTO `acudientes` VALUES (346, 'C.C.', '1113522926', 'Yésica Viviana Vasquez Pacho', '3007164613', '3043422417', NULL, 'KR 7M 76-123', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (347, 'C.C.', '1113519812', 'Luis Alfredo Solis Granja', '3186668828', '3226967720', NULL, 'CL 76 9-13', 12, NULL, NULL);
INSERT INTO `acudientes` VALUES (348, 'C.C.', '1143949600', 'Cindy Mayerly Vanegas Campo', '3122129354', '3156786056', NULL, 'KR 7DBis 61-31', 4, NULL, NULL);
INSERT INTO `acudientes` VALUES (349, 'C.C.', '1143937909', 'Karen Yessenia Ospina Navarrete', '3166230257', '3002755919', NULL, 'KR 10 71-37', 3, NULL, NULL);
INSERT INTO `acudientes` VALUES (350, 'C.C.', '1130632858', 'Johanna Marcela Duque Florez', '3127851195', '3217481844', NULL, 'KR 7R 72-78', 2, NULL, NULL);
INSERT INTO `acudientes` VALUES (351, 'C.C.', '1130659015', 'Eliana Pinillo Florez', '3125143040', '3175321415', NULL, 'KR 26I1 72T1-05', 94, NULL, NULL);
INSERT INTO `acudientes` VALUES (352, 'C.C.', '1083886344', 'Kelly Johanna Forero Ardila', '3223048220', '3108796825', NULL, 'CL 73 25T-24', 9, NULL, NULL);
INSERT INTO `acudientes` VALUES (353, 'C.C.', '1060796830', 'Evelio Valencia Becoche', '3212836119', '3235956348', NULL, 'KR 26F 108-31', 6, NULL, NULL);

-- ----------------------------
-- Table structure for anios_lectivos
-- ----------------------------
DROP TABLE IF EXISTS `anios_lectivos`;
CREATE TABLE `anios_lectivos`  (
  `id` smallint UNSIGNED NOT NULL AUTO_INCREMENT,
  `anio` smallint UNSIGNED NOT NULL,
  `fecha_inicio` date NULL DEFAULT NULL,
  `fecha_fin` date NULL DEFAULT NULL,
  `estado` enum('planeado','activo','cerrado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planeado',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `anio`(`anio` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of anios_lectivos
-- ----------------------------
INSERT INTO `anios_lectivos` VALUES (1, 2015, NULL, NULL, 'cerrado', NULL, NULL);
INSERT INTO `anios_lectivos` VALUES (2, 2016, NULL, NULL, 'cerrado', NULL, NULL);
INSERT INTO `anios_lectivos` VALUES (3, 2017, NULL, NULL, 'cerrado', NULL, NULL);
INSERT INTO `anios_lectivos` VALUES (4, 2018, NULL, NULL, 'cerrado', NULL, NULL);
INSERT INTO `anios_lectivos` VALUES (5, 2019, NULL, NULL, 'cerrado', NULL, NULL);
INSERT INTO `anios_lectivos` VALUES (6, 2020, NULL, NULL, 'cerrado', NULL, NULL);
INSERT INTO `anios_lectivos` VALUES (7, 2021, NULL, NULL, 'cerrado', NULL, NULL);
INSERT INTO `anios_lectivos` VALUES (8, 2022, NULL, NULL, 'cerrado', NULL, NULL);
INSERT INTO `anios_lectivos` VALUES (9, 2023, NULL, NULL, 'cerrado', NULL, NULL);
INSERT INTO `anios_lectivos` VALUES (10, 2024, NULL, NULL, 'cerrado', NULL, NULL);
INSERT INTO `anios_lectivos` VALUES (11, 2025, NULL, NULL, 'cerrado', NULL, NULL);
INSERT INTO `anios_lectivos` VALUES (12, 2026, NULL, NULL, 'activo', NULL, NULL);

-- ----------------------------
-- Table structure for barrios
-- ----------------------------
DROP TABLE IF EXISTS `barrios`;
CREATE TABLE `barrios`  (
  `id` smallint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `comuna` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `nombre`(`nombre` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 96 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of barrios
-- ----------------------------
INSERT INTO `barrios` VALUES (1, 'Ciudad Del Campo', NULL);
INSERT INTO `barrios` VALUES (2, 'Alfonso López', NULL);
INSERT INTO `barrios` VALUES (3, 'Siete De Agosto', NULL);
INSERT INTO `barrios` VALUES (4, 'San Marino', NULL);
INSERT INTO `barrios` VALUES (5, 'Urb. Pereira', NULL);
INSERT INTO `barrios` VALUES (6, 'Manuela Beltran', NULL);
INSERT INTO `barrios` VALUES (7, 'Ciudad Cordoba', NULL);
INSERT INTO `barrios` VALUES (8, '7 De Agosto', NULL);
INSERT INTO `barrios` VALUES (9, 'Charco Azul', NULL);
INSERT INTO `barrios` VALUES (10, 'Valle Grande', NULL);
INSERT INTO `barrios` VALUES (11, 'Puertas Del Sol', NULL);
INSERT INTO `barrios` VALUES (12, 'Puerto Mallarino', NULL);
INSERT INTO `barrios` VALUES (13, 'Ciudadela Del Rio', NULL);
INSERT INTO `barrios` VALUES (14, 'Alfonso López Etapa 3', NULL);
INSERT INTO `barrios` VALUES (15, 'Las Orquídeas', NULL);
INSERT INTO `barrios` VALUES (16, 'Comuneros 1', NULL);
INSERT INTO `barrios` VALUES (17, 'Mojica 2', NULL);
INSERT INTO `barrios` VALUES (18, 'Los Tulipanes', NULL);
INSERT INTO `barrios` VALUES (19, 'Urbanizacion \"Cali Bella\"', NULL);
INSERT INTO `barrios` VALUES (20, 'Alfonso Bonilla Aragon', NULL);
INSERT INTO `barrios` VALUES (21, 'Cuidad Del Campo', NULL);
INSERT INTO `barrios` VALUES (22, 'Andres Sanin', NULL);
INSERT INTO `barrios` VALUES (23, 'Alfonso López Iii Etapa', NULL);
INSERT INTO `barrios` VALUES (24, 'Metropolitano', NULL);
INSERT INTO `barrios` VALUES (25, 'Talanga 1', NULL);
INSERT INTO `barrios` VALUES (26, 'Juanchito', NULL);
INSERT INTO `barrios` VALUES (27, 'Alfonso López 3Ra Etapa', NULL);
INSERT INTO `barrios` VALUES (28, 'Rio Cauca Ii', NULL);
INSERT INTO `barrios` VALUES (29, 'Poblado Campestre/La Rosela', NULL);
INSERT INTO `barrios` VALUES (30, 'Compartir', NULL);
INSERT INTO `barrios` VALUES (31, 'Floralia', NULL);
INSERT INTO `barrios` VALUES (32, 'Las Ceibas', NULL);
INSERT INTO `barrios` VALUES (33, 'Villa Luz', NULL);
INSERT INTO `barrios` VALUES (34, 'Marroquin', NULL);
INSERT INTO `barrios` VALUES (35, 'Urb. Pererira', NULL);
INSERT INTO `barrios` VALUES (36, 'La Fortaleza', NULL);
INSERT INTO `barrios` VALUES (37, 'Cidad Del Campo', NULL);
INSERT INTO `barrios` VALUES (38, 'Petecuy', NULL);
INSERT INTO `barrios` VALUES (39, 'Alirio Mora', NULL);
INSERT INTO `barrios` VALUES (40, 'Poblado Campestre', NULL);
INSERT INTO `barrios` VALUES (41, 'Tejares De Salomia', NULL);
INSERT INTO `barrios` VALUES (42, 'La Nueva Base', NULL);
INSERT INTO `barrios` VALUES (43, 'Cuidad Del Campo - Palmira', NULL);
INSERT INTO `barrios` VALUES (44, 'Los Naranjos', NULL);
INSERT INTO `barrios` VALUES (45, 'Ulpiano Lloreda', NULL);
INSERT INTO `barrios` VALUES (46, 'Marroquin 3', NULL);
INSERT INTO `barrios` VALUES (47, 'Marroquin Ii', NULL);
INSERT INTO `barrios` VALUES (48, 'Potrero Grande', NULL);
INSERT INTO `barrios` VALUES (49, 'Vegas De Comfandi', NULL);
INSERT INTO `barrios` VALUES (50, 'Urbanización Pereira', NULL);
INSERT INTO `barrios` VALUES (51, 'Los Pinos', NULL);
INSERT INTO `barrios` VALUES (52, 'Marroquin I', NULL);
INSERT INTO `barrios` VALUES (53, 'Marroquín 2', NULL);
INSERT INTO `barrios` VALUES (54, 'Alfonso López 3', NULL);
INSERT INTO `barrios` VALUES (55, 'Remansos De Comfandi', NULL);
INSERT INTO `barrios` VALUES (56, 'La Paz', NULL);
INSERT INTO `barrios` VALUES (57, 'Manzanares', NULL);
INSERT INTO `barrios` VALUES (58, 'Alfonzo López 3Ra Etapa', NULL);
INSERT INTO `barrios` VALUES (59, 'Calibella', NULL);
INSERT INTO `barrios` VALUES (60, 'Ciudad Del Camppo', NULL);
INSERT INTO `barrios` VALUES (61, 'Alfonso Lopez 3 Etapa', NULL);
INSERT INTO `barrios` VALUES (62, 'Aguablanca', NULL);
INSERT INTO `barrios` VALUES (63, 'José María Marroquín 2', NULL);
INSERT INTO `barrios` VALUES (64, 'Los Lideres', NULL);
INSERT INTO `barrios` VALUES (65, 'La Playa', NULL);
INSERT INTO `barrios` VALUES (66, 'Guayacanes', NULL);
INSERT INTO `barrios` VALUES (67, 'Quintas De Salomia', NULL);
INSERT INTO `barrios` VALUES (68, 'La Ceiba', NULL);
INSERT INTO `barrios` VALUES (69, 'Cuudad Del Campo', NULL);
INSERT INTO `barrios` VALUES (70, 'Chiminangos 1', NULL);
INSERT INTO `barrios` VALUES (71, 'Morichal De Comfandi', NULL);
INSERT INTO `barrios` VALUES (72, 'Talanga', NULL);
INSERT INTO `barrios` VALUES (73, 'Brisas Del Cauca', NULL);
INSERT INTO `barrios` VALUES (74, 'Ciudad Del Campo Almendros', NULL);
INSERT INTO `barrios` VALUES (75, 'Alirio Mora Beltrán', NULL);
INSERT INTO `barrios` VALUES (76, 'El Vergel', NULL);
INSERT INTO `barrios` VALUES (77, 'Quinta De Salomia', NULL);
INSERT INTO `barrios` VALUES (78, 'Mojica 1', NULL);
INSERT INTO `barrios` VALUES (79, 'Fepicol', NULL);
INSERT INTO `barrios` VALUES (80, 'San Luis 2', NULL);
INSERT INTO `barrios` VALUES (81, 'Verea Cauca Seco', NULL);
INSERT INTO `barrios` VALUES (82, 'La Nubia', NULL);
INSERT INTO `barrios` VALUES (83, 'Andrés Sanin (Angel Del Hogar )', NULL);
INSERT INTO `barrios` VALUES (84, 'Los Naranjos 2', NULL);
INSERT INTO `barrios` VALUES (85, 'Ciudada Del Campo', NULL);
INSERT INTO `barrios` VALUES (86, 'Desepaz', NULL);
INSERT INTO `barrios` VALUES (87, 'Pilar Tairona', NULL);
INSERT INTO `barrios` VALUES (88, 'Alfonso López Segunda Etapa', NULL);
INSERT INTO `barrios` VALUES (89, 'Ciudad Del Campo - Los Almendros', NULL);
INSERT INTO `barrios` VALUES (90, 'Alfonso Lopez 1', NULL);
INSERT INTO `barrios` VALUES (91, 'Urbanización Pereira Juanchito', NULL);
INSERT INTO `barrios` VALUES (92, 'Alfonso López Etapa 1', NULL);
INSERT INTO `barrios` VALUES (93, 'Urb.Pereira', NULL);
INSERT INTO `barrios` VALUES (94, 'Los Lagos', NULL);
INSERT INTO `barrios` VALUES (95, 'El Poblado Ii', NULL);

-- ----------------------------
-- Table structure for cache
-- ----------------------------
DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache`  (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cache
-- ----------------------------

-- ----------------------------
-- Table structure for cache_locks
-- ----------------------------
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks`  (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cache_locks
-- ----------------------------

-- ----------------------------
-- Table structure for docentes
-- ----------------------------
DROP TABLE IF EXISTS `docentes`;
CREATE TABLE `docentes`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NULL DEFAULT NULL,
  `documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `nombre_completo` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `telefono` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `documento`(`documento` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of docentes
-- ----------------------------

-- ----------------------------
-- Table structure for entregas_boletin
-- ----------------------------
DROP TABLE IF EXISTS `entregas_boletin`;
CREATE TABLE `entregas_boletin`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `matricula_id` int UNSIGNED NOT NULL,
  `periodo_id` smallint UNSIGNED NOT NULL,
  `estado` enum('entregado','pendiente','no_aplica') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `fecha_entrega` date NULL DEFAULT NULL,
  `recibido_por` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_entrega`(`matricula_id` ASC, `periodo_id` ASC) USING BTREE,
  INDEX `fk_bol_per`(`periodo_id` ASC) USING BTREE,
  CONSTRAINT `fk_bol_mat` FOREIGN KEY (`matricula_id`) REFERENCES `matriculas` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_bol_per` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of entregas_boletin
-- ----------------------------

-- ----------------------------
-- Table structure for estudiante_acudiente
-- ----------------------------
DROP TABLE IF EXISTS `estudiante_acudiente`;
CREATE TABLE `estudiante_acudiente`  (
  `estudiante_id` int UNSIGNED NOT NULL,
  `acudiente_id` int UNSIGNED NOT NULL,
  `parentesco_id` tinyint UNSIGNED NOT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT 1,
  `vive_con` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`estudiante_id`, `acudiente_id`) USING BTREE,
  INDEX `fk_ea_acu`(`acudiente_id` ASC) USING BTREE,
  INDEX `fk_ea_par`(`parentesco_id` ASC) USING BTREE,
  CONSTRAINT `fk_ea_acu` FOREIGN KEY (`acudiente_id`) REFERENCES `acudientes` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_ea_est` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_ea_par` FOREIGN KEY (`parentesco_id`) REFERENCES `parentescos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of estudiante_acudiente
-- ----------------------------
INSERT INTO `estudiante_acudiente` VALUES (1, 1, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (2, 2, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (3, 3, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (4, 4, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (5, 5, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (6, 6, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (7, 7, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (8, 8, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (9, 9, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (10, 10, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (11, 11, 8, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (12, 12, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (13, 13, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (14, 14, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (15, 15, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (16, 16, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (17, 17, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (18, 18, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (19, 19, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (20, 20, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (21, 21, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (22, 22, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (23, 23, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (24, 24, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (25, 25, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (26, 26, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (27, 27, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (28, 28, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (29, 29, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (30, 30, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (31, 31, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (32, 32, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (33, 7, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (34, 33, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (35, 34, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (36, 35, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (37, 36, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (38, 37, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (39, 38, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (40, 39, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (41, 40, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (42, 41, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (43, 42, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (44, 43, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (45, 44, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (46, 45, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (47, 46, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (48, 47, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (49, 48, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (50, 19, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (51, 49, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (52, 50, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (53, 51, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (54, 52, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (55, 53, 8, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (56, 54, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (57, 55, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (58, 56, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (59, 57, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (60, 58, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (61, 59, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (62, 60, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (63, 61, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (64, 62, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (65, 63, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (66, 64, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (67, 65, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (68, 66, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (69, 67, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (70, 68, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (71, 69, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (72, 70, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (73, 71, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (74, 72, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (75, 73, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (76, 74, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (77, 75, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (78, 76, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (79, 77, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (80, 78, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (81, 79, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (82, 80, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (83, 81, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (84, 82, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (85, 83, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (86, 84, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (87, 85, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (88, 86, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (89, 87, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (90, 88, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (91, 25, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (92, 89, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (93, 90, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (94, 91, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (95, 92, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (96, 93, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (97, 94, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (98, 95, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (99, 96, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (100, 97, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (101, 98, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (102, 99, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (103, 100, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (104, 101, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (105, 102, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (106, 103, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (107, 104, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (108, 105, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (109, 106, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (110, 107, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (111, 108, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (112, 109, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (113, 110, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (114, 111, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (115, 112, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (116, 113, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (117, 114, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (118, 115, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (119, 116, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (120, 117, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (121, 118, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (122, 119, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (123, 120, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (124, 121, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (125, 122, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (126, 123, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (127, 124, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (128, 125, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (129, 126, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (130, 127, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (131, 128, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (132, 129, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (133, 130, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (134, 131, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (135, 132, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (136, 133, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (137, 134, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (138, 135, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (139, 136, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (140, 137, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (141, 138, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (142, 139, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (143, 140, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (144, 141, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (145, 142, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (146, 143, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (147, 144, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (148, 145, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (149, 146, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (150, 147, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (151, 148, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (152, 149, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (153, 150, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (154, 151, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (155, 152, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (156, 153, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (157, 154, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (158, 155, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (159, 156, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (160, 157, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (161, 158, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (162, 159, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (163, 160, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (164, 161, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (165, 162, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (166, 163, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (167, 164, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (168, 165, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (169, 166, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (170, 167, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (171, 168, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (172, 169, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (173, 170, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (174, 171, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (175, 172, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (176, 173, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (177, 174, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (178, 175, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (179, 176, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (180, 177, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (181, 178, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (182, 179, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (183, 180, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (184, 181, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (185, 182, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (186, 183, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (187, 184, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (188, 185, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (189, 186, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (190, 187, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (191, 188, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (192, 189, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (193, 190, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (194, 191, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (195, 192, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (196, 193, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (197, 194, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (198, 195, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (199, 196, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (200, 197, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (201, 198, 9, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (202, 199, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (203, 200, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (204, 201, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (205, 202, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (206, 203, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (207, 61, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (208, 204, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (209, 205, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (210, 206, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (211, 207, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (212, 208, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (213, 209, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (214, 210, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (215, 211, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (216, 212, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (217, 213, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (218, 214, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (219, 215, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (220, 216, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (221, 217, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (222, 218, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (223, 219, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (224, 220, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (225, 221, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (226, 22, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (227, 222, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (228, 223, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (229, 224, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (230, 225, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (231, 226, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (232, 227, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (233, 228, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (234, 229, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (235, 230, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (236, 231, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (237, 232, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (238, 233, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (239, 234, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (240, 235, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (241, 236, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (242, 237, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (243, 238, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (244, 239, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (245, 240, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (246, 241, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (247, 242, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (248, 243, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (249, 244, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (250, 245, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (251, 246, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (252, 247, 6, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (253, 248, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (254, 249, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (255, 250, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (256, 251, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (257, 252, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (258, 253, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (259, 254, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (260, 255, 3, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (261, 256, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (262, 257, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (263, 258, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (264, 259, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (265, 260, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (266, 261, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (267, 262, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (268, 59, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (269, 263, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (270, 264, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (271, 265, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (272, 266, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (273, 267, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (274, 268, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (275, 269, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (276, 270, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (277, 271, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (278, 272, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (279, 273, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (280, 274, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (281, 275, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (282, 276, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (283, 277, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (284, 278, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (285, 279, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (286, 280, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (287, 281, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (288, 282, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (289, 283, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (290, 284, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (291, 285, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (292, 286, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (293, 287, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (294, 288, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (295, 289, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (296, 290, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (297, 291, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (298, 292, 4, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (299, 293, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (300, 294, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (301, 295, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (302, 296, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (303, 297, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (304, 298, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (305, 299, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (306, 300, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (307, 301, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (308, 302, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (309, 303, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (310, 304, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (311, 305, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (312, 306, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (313, 307, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (314, 308, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (315, 76, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (316, 309, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (317, 310, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (318, 311, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (319, 312, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (320, 313, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (321, 314, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (322, 315, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (323, 316, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (324, 317, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (325, 318, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (326, 319, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (327, 320, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (328, 321, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (329, 322, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (330, 289, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (331, 323, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (332, 225, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (333, 324, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (334, 325, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (335, 326, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (336, 12, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (337, 327, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (338, 328, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (339, 329, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (340, 330, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (341, 331, 5, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (342, 332, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (343, 333, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (344, 334, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (345, 335, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (346, 336, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (347, 337, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (348, 338, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (349, 339, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (350, 340, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (351, 341, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (352, 342, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (353, 343, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (354, 344, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (355, 345, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (356, 346, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (357, 347, 2, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (358, 348, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (359, 349, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (360, 350, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (361, 351, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (362, 352, 1, 1, 1);
INSERT INTO `estudiante_acudiente` VALUES (363, 353, 2, 1, 1);

-- ----------------------------
-- Table structure for estudiantes
-- ----------------------------
DROP TABLE IF EXISTS `estudiantes`;
CREATE TABLE `estudiantes`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipo_documento` enum('R.C.','T.I.','C.C.','C.E.','P.P.T.','N.U.I.P.','N.E.S.') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'T.I.',
  `numero_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_completo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `primer_apellido` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `segundo_apellido` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `primer_nombre` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `segundo_nombre` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `fecha_nacimiento` date NULL DEFAULT NULL,
  `genero` enum('F','M','O') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `tiene_foto` tinyint(1) NOT NULL DEFAULT 0,
  `foto_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_est_doc`(`tipo_documento` ASC, `numero_documento` ASC) USING BTREE,
  INDEX `ix_est_nombre`(`nombre_completo` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 364 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of estudiantes
-- ----------------------------
INSERT INTO `estudiantes` VALUES (1, 'T.I.', '1110047482', 'Aguirre Betancourt Yeri', NULL, NULL, NULL, NULL, '2009-07-11', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (2, 'T.I.', '1109672706', 'Aguirre Mosquera Maia Valentina', NULL, NULL, NULL, NULL, '2010-05-24', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (3, 'T.I.', '1110049366', 'Aguirre Rivera Laura Sofia', NULL, NULL, NULL, NULL, '2010-11-05', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (4, 'T.I.', '1191213788', 'Alban Canabal Isabella', NULL, NULL, NULL, NULL, '2009-02-01', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (5, 'P.P.T.', '5520100', 'Amaro Querales Anna Gabriela', NULL, NULL, NULL, NULL, '2009-04-26', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (6, 'T.I.', '1109550047', 'Angola Aguilar Mariana', NULL, NULL, NULL, NULL, '2010-11-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (7, 'T.I.', '1151196451', 'Angulo Aragon Maira Lizeth', NULL, NULL, NULL, NULL, '2010-06-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (8, 'T.I.', '1114623881', 'Angulo Escobar Darcy Juliana', NULL, NULL, NULL, NULL, '2008-12-27', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (9, 'T.I.', '1110050098', 'Arizala Angulo Darwin Stiven', NULL, NULL, NULL, NULL, '2010-01-25', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (10, 'T.I.', '1107069412', 'Baltan Ruiz Yidwar Andres', NULL, NULL, NULL, NULL, '2008-08-03', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (11, 'T.I.', '1104821685', 'Camilo Magaña Maria De Los Angeles', NULL, NULL, NULL, NULL, '2009-05-05', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (12, 'T.I.', '1111682412', 'Carabali Angulo Esteban Mauricio', NULL, NULL, NULL, NULL, '2010-12-07', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (13, 'T.I.', '1111552095', 'Carabali Cruz Sarah', NULL, NULL, NULL, NULL, '2011-01-20', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (14, 'T.I.', '1060802260', 'Chagüendo Valencia Jhanier Alexander', NULL, NULL, NULL, NULL, '2010-04-13', 'M', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (15, 'T.I.', '1105378964', 'Diaz Ceballos Alex', NULL, NULL, NULL, NULL, '2010-11-24', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (16, 'T.I.', '1086196316', 'Estupiñan Chalar Jhon Bernardo', NULL, NULL, NULL, NULL, '2009-07-08', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (17, 'T.I.', '1191217180', 'Fernandez Giron Justin Esteban', NULL, NULL, NULL, NULL, '2011-02-25', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (18, 'P.P.T.', '7459094', 'Figuera Rios Jeanmarys Valentina', NULL, NULL, NULL, NULL, '2010-05-18', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (19, 'T.I.', '1108337535', 'Gallego Marmolejo Heiver Adrian', NULL, NULL, NULL, NULL, '2010-10-29', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (20, 'T.I.', '1107860758', 'Gomez Giraldo Sara Sofia', NULL, NULL, NULL, NULL, '2010-05-07', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (21, 'T.I.', '1104824555', 'Jimenez Henao Emily Julyana', NULL, NULL, NULL, NULL, '2009-10-19', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (22, 'T.I.', '1191215631', 'Martinez Orozco Cristian', NULL, NULL, NULL, NULL, '2010-01-02', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (23, 'T.I.', '1110049272', 'Meneses Lopez Juan David', NULL, NULL, NULL, NULL, '2010-10-02', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (24, 'T.I.', '1105372954', 'Molina Palomino Juan Pablo', NULL, NULL, NULL, NULL, '2008-05-29', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (25, 'T.I.', '1109119297', 'Montoya Zambrano Mariana', NULL, NULL, NULL, NULL, '2010-02-09', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (26, 'T.I.', '1108256016', 'Perea Benitez Daniel', NULL, NULL, NULL, NULL, '2010-03-18', 'M', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (27, 'T.I.', '1109192828', 'Renteria Cabezas Michel Dayana', NULL, NULL, NULL, NULL, '2008-12-12', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (28, 'T.I.', '1106519654', 'Sanchez Quiceno Hellen Yulieth', NULL, NULL, NULL, NULL, '2009-12-09', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (29, 'T.I.', '1111679794', 'Velasquez Zuleta Santiago', NULL, NULL, NULL, NULL, '2010-02-20', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (30, 'T.I.', '1109188429', 'Plaza Cortes Maria Fernanda', NULL, NULL, NULL, NULL, '2007-05-07', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (31, 'T.I.', '1060802124', 'Camayo Jojoa Michell', NULL, NULL, NULL, NULL, '2010-01-29', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (32, 'T.I.', '1086137008', 'Rosero Hendo Hasli Yorlady', NULL, NULL, NULL, NULL, '2010-12-29', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (33, 'T.I.', '1111803345', 'Angulo Caicedo Ivan Dario', NULL, NULL, NULL, NULL, '2011-08-07', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (34, 'T.I.', '1028890776', 'Caro Moreno Elizabeth Sofia', NULL, NULL, NULL, NULL, '2010-11-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (35, 'T.I.', '1110049685', 'Chito Fierro Karol Dayana', NULL, NULL, NULL, NULL, '2011-01-02', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (36, 'T.I.', '1109192347', 'Cadenas Vargas Benjamin', NULL, NULL, NULL, NULL, '2011-01-05', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (37, 'T.I.', '1104822267', 'Acosta Camacho Greeycy Tatiana', NULL, NULL, NULL, NULL, '2009-06-01', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (38, 'T.I.', '1111682373', 'Angulo Agudelo Jordan Steven', NULL, NULL, NULL, NULL, '2010-11-21', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (39, 'T.I.', '1089609307', 'Arevalo Morales Danna Alejandra', NULL, NULL, NULL, NULL, '2010-08-03', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (40, 'T.I.', '1111553154', 'Avincula Galeano Alan Jefren', NULL, NULL, NULL, NULL, '2011-08-19', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (41, 'T.I.', '1127955970', 'Castellanos Jimenez Adriann Alejandro', NULL, NULL, NULL, NULL, '2010-09-25', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (42, 'T.I.', '1107861827', 'Chaves Burbano Angie Isabella', NULL, NULL, NULL, NULL, '2010-09-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (43, 'T.I.', '1104821940', 'Cortes Sandoval Juan Martin', NULL, NULL, NULL, NULL, '2009-06-25', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (44, 'T.I.', '1111484404', 'David Sinisterra Yahari', NULL, NULL, NULL, NULL, '2011-02-08', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (45, 'T.I.', '1109924325', 'Diaz Hernandez Laura Sofia', NULL, NULL, NULL, NULL, '2011-06-22', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (46, 'T.I.', '1143956004', 'Doncel Arboleda Annie Xirlani', NULL, NULL, NULL, NULL, '2011-04-18', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (47, 'T.I.', '1107860496', 'Echandia Zapata Maria de los Angeles', NULL, NULL, NULL, NULL, '2010-05-11', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (48, 'T.I.', '1110050211', 'España Castillo Melanie', NULL, NULL, NULL, NULL, '2011-07-15', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (49, 'T.I.', '1139834370', 'Figueroa Zapata Mariana', NULL, NULL, NULL, NULL, '2010-01-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (50, 'T.I.', '1108337534', 'Gallego Marmolejo Hanny Jholet', NULL, NULL, NULL, NULL, '2010-10-29', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (51, 'T.I.', '1012404191', 'Gonzalez Urrea Danna Valeria', NULL, NULL, NULL, NULL, '2011-10-07', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (52, 'T.I.', '1107853166', 'Grueso Caicedo Sofia', NULL, NULL, NULL, NULL, '2008-07-23', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (53, 'T.I.', '1109191316', 'Moreno Mosquera Gean Carlos', NULL, NULL, NULL, NULL, '2009-06-16', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (54, 'C.E.', '33705315', 'Nogales Suarez Mauricio Sebastian', NULL, NULL, NULL, NULL, '2009-08-29', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (55, 'T.I.', '1111548260', 'Ordoñez Murillo Samuel David', NULL, NULL, NULL, NULL, '2009-01-23', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (56, 'T.I.', '1110050605', 'Ortega Suarez Sara Yulieth', NULL, NULL, NULL, NULL, '2011-10-05', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (57, 'T.I.', '1150686596', 'Reyes Mesias Angie Valentina', NULL, NULL, NULL, NULL, '2009-07-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (58, 'T.I.', '1058935413', 'Rojas Solarte Valeria', NULL, NULL, NULL, NULL, '2011-05-01', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (59, 'T.I.', '1111548792', 'Salas Barreto Samuel David', NULL, NULL, NULL, NULL, '2009-05-12', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (60, 'T.I.', '1105374628', 'Torres Escobar Samuel Alberto', NULL, NULL, NULL, NULL, '2009-02-10', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (61, 'T.I.', '1110049318', 'Trujillo Posada Jolean Felipe', NULL, NULL, NULL, NULL, '2010-10-08', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (62, 'T.I.', '1109670782', 'Velasquez Pabon Ruben Dario', NULL, NULL, NULL, NULL, '2009-04-23', 'M', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (63, 'T.I.', '1104826952', 'Villarreal Mancilla Jose Luis', NULL, NULL, NULL, NULL, '2010-12-09', 'M', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (64, 'T.I.', '1108336329', 'Castillo Sinisterra Valentina', NULL, NULL, NULL, NULL, '2008-11-28', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (65, 'T.I.', '1107855253', 'Mosquera Motato Angie Lucero', NULL, NULL, NULL, NULL, '2009-02-03', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (66, 'T.I.', '1109924883', 'Padilla Calvache Juan Esteban', NULL, NULL, NULL, NULL, '2011-09-24', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (67, 'T.I.', '1109118904', 'Quintero Viafara Darwin', NULL, NULL, NULL, NULL, '2009-01-02', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (68, 'T.I.', '1058354679', 'Acosta Lozano Karol Fernanda', NULL, NULL, NULL, NULL, '2009-01-24', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (69, 'T.I.', '1111680060', 'Mejia Olave Sharon Saray', NULL, NULL, NULL, NULL, '2010-02-07', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (70, 'T.I.', '1148447335', 'Riascos Valencia Gloria Esthefany', NULL, NULL, NULL, NULL, '2010-10-28', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (71, 'T.I.', '1062308034', 'Arzayus Angola Gilary Danniela', NULL, NULL, NULL, NULL, '2011-04-07', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (72, 'T.I.', '1066842815', 'Balanta Herrera Joseth Harold', NULL, NULL, NULL, NULL, '2010-12-19', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (73, 'T.I.', '1110049528', 'Benavides Salverria Emanuel', NULL, NULL, NULL, NULL, '2010-12-06', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (74, 'T.I.', '1191215799', 'Caicedo Arriaga Rober Alberto', NULL, NULL, NULL, NULL, '2010-02-02', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (75, 'T.I.', '1111682473', 'Caicedo Lucumi Alan Farid', NULL, NULL, NULL, NULL, '2010-12-16', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (76, 'T.I.', '1139834660', 'Calderon Morales Jean Paul', NULL, NULL, NULL, NULL, '2010-08-11', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (77, 'T.I.', '1150687217', 'Cortes Mina Luciana', NULL, NULL, NULL, NULL, '2009-11-16', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (78, 'T.I.', '1113703887', 'Florez Guaje Reinner Samuel Yaninn', NULL, NULL, NULL, NULL, '2009-04-28', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (79, 'T.I.', '1104823379', 'Hurtado Escobar Valery Sofia', NULL, NULL, NULL, NULL, '2010-01-22', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (80, 'T.I.', '1024522354', 'Josa Vallejos Evelin Sharit', NULL, NULL, NULL, NULL, '2009-10-04', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (81, 'T.I.', '1191215802', 'Landazuri Riascos Angie Daniela', NULL, NULL, NULL, NULL, '2010-02-02', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (82, 'T.I.', '1061825800', 'Lima Lopez Barbara Yetsibeth', NULL, NULL, NULL, NULL, '2009-09-02', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (83, 'T.I.', '1081411965', 'Losada Ortiz David Santiago', NULL, NULL, NULL, NULL, '2011-05-31', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (84, 'T.I.', '1062297865', 'Martinez Aguilar Juan Jose', NULL, NULL, NULL, NULL, '2009-02-06', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (85, 'T.I.', '1111547335', 'Martinez Villegas Melanin Dayana', NULL, NULL, NULL, NULL, '2008-04-23', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (86, 'T.I.', '1081057324', 'Martinez Yama Yanny Abigail', NULL, NULL, NULL, NULL, '2009-09-26', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (87, 'T.I.', '1105379568', 'Mendoza Agudelo Joan Yuseph', NULL, NULL, NULL, NULL, '2011-02-19', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (88, 'T.I.', '1143953072', 'Meneses Vargas Yisel Andrea', NULL, NULL, NULL, NULL, '2011-01-22', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (89, 'T.I.', '1107072395', 'Millan Muñoz Ana Keyla', NULL, NULL, NULL, NULL, '2010-01-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (90, 'T.I.', '1109924781', 'Monsalve Mosquera Valery', NULL, NULL, NULL, NULL, '2011-08-31', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (91, 'T.I.', '1111482231', 'Montoya Zambrano Samuel Mauricio', NULL, NULL, NULL, NULL, '2008-03-01', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (92, 'T.I.', '1150688814', 'Olaya Salcedo Juan Esteban', NULL, NULL, NULL, NULL, '2010-07-29', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (93, 'T.I.', '1078688954', 'Osorio Lozano Michael Obama', NULL, NULL, NULL, NULL, '2009-01-02', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (94, 'T.I.', '1113068458', 'Panchano Garcia Leidy Samanta', NULL, NULL, NULL, NULL, '2009-08-28', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (95, 'T.I.', '1120571278', 'Pardo Mayorga Kevin Santiago', NULL, NULL, NULL, NULL, '2009-09-02', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (96, 'T.I.', '1107982274', 'Peña Sandoval Cristian Daniel', NULL, NULL, NULL, NULL, '2010-10-24', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (97, 'T.I.', '1109674324', 'Peñate Rojas Miguel Angel', NULL, NULL, NULL, NULL, '2011-05-07', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (98, 'T.I.', '1080294844', 'Salazar Cuellar Samuel', NULL, NULL, NULL, NULL, '2011-12-02', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (99, 'T.I.', '1109669558', 'Sanchez Collazos Yulian Andres', NULL, NULL, NULL, NULL, '2008-08-29', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (100, 'T.I.', '1107541194', 'Terranova Hernandez Nury Alejandra', NULL, NULL, NULL, NULL, '2012-01-02', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (101, 'T.I.', '1113309429', 'Velez Escalante Juan Pablo', NULL, NULL, NULL, NULL, '2011-06-15', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (102, 'T.I.', '1089512316', 'Viveros Montaño Deivin Santiago', NULL, NULL, NULL, NULL, '2008-07-23', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (103, 'T.I.', '1110372916', 'Wilches Zapata Viviana Andrea', NULL, NULL, NULL, NULL, '2011-06-07', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (104, 'T.I.', '1143958600', 'Ortiz Chavez Ayellin Bresley', NULL, NULL, NULL, NULL, '2011-08-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (105, 'T.I.', '1110048704', 'Yanguas Rodriguez Laura Estefany', NULL, NULL, NULL, NULL, '2009-10-10', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (106, 'T.I.', '1110048204', 'Valencia Arias Zharyk', NULL, NULL, NULL, NULL, '2009-12-22', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (107, 'T.I.', '1107065233', 'Valencia Ortiz Leylany Jovarle', NULL, NULL, NULL, NULL, '2009-04-23', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (108, 'T.I.', '1111678369', 'Moreno Castrillon Jhon Sebastian', NULL, NULL, NULL, NULL, '2009-08-12', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (109, 'T.I.', '1108567886', 'Quiñones Sevillano Sarah Michel', NULL, NULL, NULL, NULL, '2010-10-18', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (110, 'T.I.', '1104822335', 'Valencia Murillo Sara Michell', NULL, NULL, NULL, NULL, '2009-08-17', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (111, 'T.I.', '1071355872', 'Arcos Pacheco Nasly Camila', NULL, NULL, NULL, NULL, '2011-12-11', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (112, 'T.I.', '1107858289', 'Chaverra Espinal Alejandro', NULL, NULL, NULL, NULL, '2009-10-22', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (113, 'T.I.', '1116789330', 'Davidson Hidalgo Diglan Armando', NULL, NULL, NULL, NULL, '2008-12-21', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (114, 'T.I.', '1087813584', 'Estacio Sinisterra Greisy Pamela', NULL, NULL, NULL, NULL, '2010-03-20', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (115, 'T.I.', '1109924414', 'Fajardo Holguin Gabriela', NULL, NULL, NULL, NULL, '2011-07-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (116, 'T.I.', '1107863767', 'Gaviria Calderon Jhon Sebastian', NULL, NULL, NULL, NULL, '2011-03-19', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (117, 'T.I.', '1109672202', 'Guarin Palacios Maria Fernanda', NULL, NULL, NULL, NULL, '2010-02-03', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (118, 'T.I.', '1071435755', 'Hernandez Banda Sara Sofia', NULL, NULL, NULL, NULL, '2010-02-17', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (119, 'T.I.', '1110049135', 'Jimenez Garcia Juan Jose', NULL, NULL, NULL, NULL, '2010-09-05', 'M', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (120, 'T.I.', '1108336791', 'Llanos Palacios Jhon Edinson', NULL, NULL, NULL, NULL, '2009-08-31', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (121, 'T.I.', '1108646252', 'Morales Cruz Leidy Dahiana', NULL, NULL, NULL, NULL, '2010-11-16', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (122, 'T.I.', '1107856220', 'Moreno Giraldo Samuel', NULL, NULL, NULL, NULL, '2009-04-29', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (123, 'T.I.', '1061750487', 'Moreno Rodriguez Valeria', NULL, NULL, NULL, NULL, '2010-08-11', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (124, 'T.I.', '1113368666', 'Mosquera Mosquera Alice Xiomara', NULL, NULL, NULL, NULL, '2011-05-30', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (125, 'T.I.', '1110299088', 'Mosquera Sanchez Anderson David', NULL, NULL, NULL, NULL, '2011-01-29', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (126, 'T.I.', '1104822668', 'Murillo Lizalda Paola Andrea', NULL, NULL, NULL, NULL, '2009-04-17', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (127, 'T.I.', '1109191134', 'Orozco Achipiz Gabriel Steven', NULL, NULL, NULL, NULL, '2009-02-25', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (128, 'T.I.', '1107076534', 'Orozco Caicedo Emanuel', NULL, NULL, NULL, NULL, '2011-05-23', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (129, 'T.I.', '1105380155', 'Ortiz Ramos Jordan', NULL, NULL, NULL, NULL, '2011-05-31', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (130, 'T.I.', '1059912244', 'Ortiz Solarte Dairyn Alexandra', NULL, NULL, NULL, NULL, '2011-12-17', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (131, 'T.I.', '1104825565', 'Paez Mejia Cristal Gabriela', NULL, NULL, NULL, NULL, '2010-09-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (132, 'T.I.', '1139834466', 'Parra Montoya Cleyderman', NULL, NULL, NULL, NULL, '2010-03-06', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (133, 'T.I.', '1013126541', 'Pesca Romero Sara Sofia', NULL, NULL, NULL, NULL, '2009-04-20', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (134, 'T.I.', '1054875226', 'Quintero Cardona Sara', NULL, NULL, NULL, NULL, '2010-10-18', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (135, 'T.I.', '1107861272', 'Rodriguez Tonguino Juan Pablo', NULL, NULL, NULL, NULL, '2010-07-17', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (136, 'T.I.', '1150688948', 'Salamanca Araujo Santiago', NULL, NULL, NULL, NULL, '2010-08-20', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (137, 'T.I.', '1111682353', 'Sanchez Angulo Yostin Shamuel', NULL, NULL, NULL, NULL, '2010-12-01', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (138, 'T.I.', '1105377074', 'Tapasco Montaña Elizabeth', NULL, NULL, NULL, NULL, '2010-02-10', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (139, 'P.P.T.', '3261274', 'Uzcategui Fuentes Hanna Antonella', NULL, NULL, NULL, NULL, '2009-01-01', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (140, 'T.I.', '1105378219', 'Valencia Campaz Miguel Angel', NULL, NULL, NULL, NULL, '2010-07-27', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (141, 'T.I.', '1110050679', 'Vallejo Torres Karen Daniela', NULL, NULL, NULL, NULL, '2011-11-08', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (142, 'T.I.', '1105379271', 'Vargas Rojas Clarent Irene', NULL, NULL, NULL, NULL, '2010-12-25', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (143, 'T.I.', '1110049292', 'Viveros Hurtado Isabella', NULL, NULL, NULL, NULL, '2010-08-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (144, 'T.I.', '1104824616', 'Solano Tello Maria Jose', NULL, NULL, NULL, NULL, '2010-06-12', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (145, 'T.I.', '1150688319', 'Alegria Caicedo Sebastian', NULL, NULL, NULL, NULL, '2010-05-04', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (146, 'T.I.', '1106517403', 'Alvarez Tapasco Sharon Stephania', NULL, NULL, NULL, NULL, '2008-10-02', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (147, 'T.I.', '1054875067', 'Arango Rubio Brayan Jair', NULL, NULL, NULL, NULL, '2010-10-20', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (148, 'T.I.', '1111677031', 'Basto Bonilla Jesus Daniel', NULL, NULL, NULL, NULL, '2009-04-02', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (149, 'T.I.', '1120068679', 'Castro Herrera Dulce Maria', NULL, NULL, NULL, NULL, '2010-02-15', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (150, 'T.I.', '1109670469', 'Cuacialpu Gomez Luis Enrique', NULL, NULL, NULL, NULL, '2009-02-27', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (151, 'T.I.', '1109671429', 'Martinez Guzman Miguel Alejandro', NULL, NULL, NULL, NULL, '2009-09-05', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (152, 'T.I.', '1109674022', 'Montoya Castro Jeam Pooll', NULL, NULL, NULL, NULL, '2011-03-19', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (153, 'T.I.', '1111551927', 'Murillo Ortiz Kevin', NULL, NULL, NULL, NULL, '2011-01-05', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (154, 'T.I.', '1093301658', 'Noreña Lindarte Andres Felipe', NULL, NULL, NULL, NULL, '2009-10-10', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (155, 'P.P.T.', '6450854', 'Osorio Zamora Angie Nicole', NULL, NULL, NULL, NULL, '2009-07-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (156, 'T.I.', '1104826111', 'Ospina Rodriguez Samuel Giovanny', NULL, NULL, NULL, NULL, '2010-11-02', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (157, 'T.I.', '1109550169', 'Padilla Andrade Daniel', NULL, NULL, NULL, NULL, '2010-12-11', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (158, 'T.I.', '1111550515', 'Polindara Gonzalez Sara Nicol', NULL, NULL, NULL, NULL, '2010-03-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (159, 'T.I.', '1190463184', 'Rebolledo Angulo Karol Natalia', NULL, NULL, NULL, NULL, '2010-04-13', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (160, 'T.I.', '1091982144', 'Rengifo Montes Camilo Alexander', NULL, NULL, NULL, NULL, '2010-10-22', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (161, 'T.I.', '1104825250', 'Rengifo Pineda Laura Sofia', NULL, NULL, NULL, NULL, '2010-08-13', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (162, 'T.I.', '1027999547', 'Renteria Candelo Kelly Jhoanna', NULL, NULL, NULL, NULL, '2008-08-04', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (163, 'T.I.', '1109670610', 'Rios Lopez Natalia', NULL, NULL, NULL, NULL, '2009-03-08', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (164, 'T.I.', '1108646158', 'Rivera Holguin Maria Hasbleidy', NULL, NULL, NULL, NULL, '2010-09-25', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (165, 'T.I.', '1125276378', 'Rojas Guzman Santiago', NULL, NULL, NULL, NULL, '2010-07-26', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (166, 'T.I.', '1109192457', 'Roman Aguirre Victor Manuel', NULL, NULL, NULL, NULL, '2011-03-09', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (167, 'T.I.', '1111785041', 'Saavedra Ortiz Juan Kamilo', NULL, NULL, NULL, NULL, '2009-07-14', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (168, 'T.I.', '1116377412', 'Salazar Palacios Juan Manuel', NULL, NULL, NULL, NULL, '2009-08-14', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (169, 'T.I.', '1114003998', 'Sanchez Otero Karol Vanessa', NULL, NULL, NULL, NULL, '2009-09-22', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (170, 'T.I.', '1108337333', 'Segura Lopez Danna Valeria', NULL, NULL, NULL, NULL, '2010-08-31', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (171, 'T.I.', '1104827322', 'Sinisterra Rodriguez Jussamy', NULL, NULL, NULL, NULL, '2011-02-09', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (172, 'T.I.', '1201219844', 'Solano Perez Gustavo Adolfo', NULL, NULL, NULL, NULL, '2010-06-23', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (173, 'T.I.', '1108337713', 'Tamayo Montoya Valentina', NULL, NULL, NULL, NULL, '2011-04-27', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (174, 'T.I.', '1111781209', 'Tenorio Valencia Jhon Esteban', NULL, NULL, NULL, NULL, '2009-02-10', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (175, 'T.I.', '1111683199', 'Valencia Segura Brandon', NULL, NULL, NULL, NULL, '2011-04-22', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (176, 'T.I.', '1054480232', 'Piedrahita Castaño Sofia', NULL, NULL, NULL, NULL, '2009-05-22', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (177, 'T.I.', '1191216159', 'Reyes Yostin Andres', NULL, NULL, NULL, NULL, '2010-04-15', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (178, 'T.I.', '1116375568', 'Murillo Bermudez Jhoan Felipe', NULL, NULL, NULL, NULL, '2010-11-05', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (179, 'T.I.', '1150688380', 'Arciniegas Aros Allison', NULL, NULL, NULL, NULL, '2010-05-13', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (180, 'P.P.T.', '3068114', 'Aure Ojeda Giorge Luis', NULL, NULL, NULL, NULL, '2009-10-22', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (181, 'T.I.', '1107861222', 'Cardona Gonzalez Sara', NULL, NULL, NULL, NULL, '2010-07-13', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (182, 'T.I.', '1109672574', 'Castañeda Ospina Joseph David', NULL, NULL, NULL, NULL, '2010-04-28', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (183, 'T.I.', '1108256114', 'Castro Bermudez Nicolas', NULL, NULL, NULL, NULL, '2010-08-20', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (184, 'T.I.', '1126141481', 'Castro Otalvaro Dylan Matteo', NULL, NULL, NULL, NULL, '2011-02-18', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (185, 'T.I.', '1150687218', 'Cortes Mina Alejandra', NULL, NULL, NULL, NULL, '2009-11-16', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (186, 'T.I.', '1104822461', 'Cortes Osorio Dylan Stiven', NULL, NULL, NULL, NULL, '2009-09-03', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (187, 'T.I.', '1117933962', 'Cruz Mazabel Daniel', NULL, NULL, NULL, NULL, '2010-08-31', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (188, 'T.I.', '1144214986', 'Escobar Orea Elizabeth Celeste', NULL, NULL, NULL, NULL, '2009-08-12', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (189, 'T.I.', '1114884824', 'Fajardo Giron Axix Fernando', NULL, NULL, NULL, NULL, '2009-02-15', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (190, 'T.I.', '1110048481', 'Güetio Huetio David Santiago', NULL, NULL, NULL, NULL, '2010-02-11', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (191, 'T.I.', '1109923180', 'Guevara Londoño Roosevelt Fernando', NULL, NULL, NULL, NULL, '2010-11-29', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (192, 'T.I.', '1104826707', 'Hurtado Moreno Ashley Julieth', NULL, NULL, NULL, NULL, '2011-01-05', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (193, 'T.I.', '1107856446', 'Ipia Rodriguez Juan David', NULL, NULL, NULL, NULL, '2009-05-19', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (194, 'T.I.', '1107863041', 'Jaramillo Garzon Isabella', NULL, NULL, NULL, NULL, '2011-02-04', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (195, 'T.I.', '1115359706', 'Manquillo Garcia Marlon Esteban', NULL, NULL, NULL, NULL, '2010-10-02', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (196, 'T.I.', '1139834948', 'Meneses Carvajal Saray Sofia', NULL, NULL, NULL, NULL, '2010-10-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (197, 'T.I.', '1110049814', 'Minotta Quilindo Isabella', NULL, NULL, NULL, NULL, '2011-02-10', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (198, 'T.I.', '1191217171', 'Moncada Velasquez Angie Lizeth', NULL, NULL, NULL, NULL, '2011-02-21', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (199, 'T.I.', '1108255490', 'Rincon Coronado Kimberly Daniela', NULL, NULL, NULL, NULL, '2008-09-27', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (200, 'P.P.T.', '6377175', 'Ruiz Uzcategui Jeorliani Carmen', NULL, NULL, NULL, NULL, '2008-01-13', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (201, 'P.P.T.', '1236825', 'Sanchez Rodriguez Loudismar Alejandra', NULL, NULL, NULL, NULL, '2010-08-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (202, 'T.I.', '1107861724', 'Toro Valencia Valery', NULL, NULL, NULL, NULL, '2010-09-11', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (203, 'T.I.', '1191214550', 'Valencia Carvajal Yoselin Mayerly', NULL, NULL, NULL, NULL, '2009-05-28', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (204, 'T.I.', '1104825815', 'Valverde Possu Yeliza Andrea', NULL, NULL, NULL, NULL, '2010-10-05', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (205, 'T.I.', '1150939826', 'Velasco Ordoñez Juan Pablo', NULL, NULL, NULL, NULL, '2010-03-06', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (206, 'T.I.', '1107862936', 'Victoria Mosquera Jhon Alejandro', NULL, NULL, NULL, NULL, '2011-01-24', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (207, 'T.I.', '1104826951', 'Villarreal Mancilla Valeria', NULL, NULL, NULL, NULL, '2009-02-05', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (208, 'T.I.', '1148686793', 'Zambrano Pay Yuri Camila', NULL, NULL, NULL, NULL, '2009-04-27', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (209, 'T.I.', '1116074530', 'Arias Millan Victor Alfonso', NULL, NULL, NULL, NULL, '2009-10-11', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (210, 'T.I.', '1105375522', 'Gaviria Agudelo Isabella', NULL, NULL, NULL, NULL, '2009-06-25', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (211, 'T.I.', '1191215679', 'Ojeda Urbano William Leandro', NULL, NULL, NULL, NULL, '2010-01-08', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (212, 'T.I.', '1111679962', 'Alba Maicol Stiven', NULL, NULL, NULL, NULL, '2010-01-26', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (213, 'T.I.', '1109190690', 'Arias Toro Luna Hanai', NULL, NULL, NULL, NULL, '2008-11-07', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (214, 'T.I.', '1104822803', 'Aristizabal Moscoso Laura Sofia', NULL, NULL, NULL, NULL, '2009-10-20', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (215, 'T.I.', '1150939109', 'Casierra Papelito Michel Johana', NULL, NULL, NULL, NULL, '2009-09-16', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (216, 'T.I.', '1109670309', 'Cortes Lizalda Shery Michel', NULL, NULL, NULL, NULL, '2009-01-30', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (217, 'T.I.', '1111677193', 'Dias Tutistar Nixon Andres', NULL, NULL, NULL, NULL, '2009-04-30', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (218, 'T.I.', '1107859989', 'Galvis Bermudez Isabella', NULL, NULL, NULL, NULL, '2010-03-25', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (219, 'T.I.', '1107860229', 'Garcia Ararat Ana Maria', NULL, NULL, NULL, NULL, '2010-04-14', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (220, 'T.I.', '1110298148', 'Garcia Cuero Valerin', NULL, NULL, NULL, NULL, '2009-08-03', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (221, 'T.I.', '1110048233', 'Giraldo Montenegro Felipe', NULL, NULL, NULL, NULL, '2010-01-20', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (222, 'T.I.', '1150687388', 'Idarraga Echeverry Sebastian', NULL, NULL, NULL, NULL, '2009-12-10', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (223, 'T.I.', '1109545995', 'Londoño Parodi Niyere Dayana', NULL, NULL, NULL, NULL, '2007-11-22', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (224, 'T.I.', '1109670949', 'Lozano Maria Paula', NULL, NULL, NULL, NULL, '2009-04-24', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (225, 'T.I.', '1116439693', 'Marin Moncada Shylohn Sofia', NULL, NULL, NULL, NULL, '2009-05-17', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (226, 'T.I.', '1191215630', 'Martinez Orozco Yulian', NULL, NULL, NULL, NULL, '2008-01-02', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (227, 'T.I.', '1104822352', 'Mina Serna Felipe', NULL, NULL, NULL, NULL, '2009-08-21', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (228, 'T.I.', '1109671730', 'Montaño Gaviria Yissel Andrea', NULL, NULL, NULL, NULL, '2009-10-12', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (229, 'T.I.', '1105377806', 'Muñoz Acosta sofia', NULL, NULL, NULL, NULL, '2010-10-24', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (230, 'T.I.', '1089799570', 'Ordoñez Benitez Fabi Michel', NULL, NULL, NULL, NULL, '2008-04-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (231, 'T.I.', '1109672175', 'Ramirez Canencio Lucia', NULL, NULL, NULL, NULL, '2010-02-01', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (232, 'T.I.', '1111778921', 'Rebolledo Rodriguez Laura Michel', NULL, NULL, NULL, NULL, '2008-11-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (233, 'T.I.', '1143955528', 'Reyes Celorio Valentina', NULL, NULL, NULL, NULL, '2008-09-09', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (234, 'T.I.', '1111675519', 'Riascos Reinel Andres Felipe', NULL, NULL, NULL, NULL, '2008-09-27', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (235, 'T.I.', '1110047922', 'Rojas Bautista Estefania', NULL, NULL, NULL, NULL, '2009-10-10', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (236, 'T.I.', '1191214898', 'Salazar Hinestroza Keyla', NULL, NULL, NULL, NULL, '2009-09-21', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (237, 'T.I.', '1077646426', 'Valencia Perea Thaylin Patricia', NULL, NULL, NULL, NULL, '2008-03-19', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (238, 'T.I.', '1109669956', 'Arroyo Celis Miguel Angel', NULL, NULL, NULL, NULL, '2008-11-19', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (239, 'T.I.', '1111483273', 'Correa Contreras Darly Liceth', NULL, NULL, NULL, NULL, '2009-03-26', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (240, 'T.I.', '1109672634', 'Sepulveda Zuluaga Maria Jose', NULL, NULL, NULL, NULL, '2010-02-28', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (241, 'T.I.', '1040739993', 'Tamayo Agudelo Valeria', NULL, NULL, NULL, NULL, '2010-01-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (242, 'T.I.', '1191216116', 'Vera Villegas Mariana', NULL, NULL, NULL, NULL, '2010-04-12', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (243, 'T.I.', '1117020855', 'Sarmiento Gonzalez Mishell Dahiana', NULL, NULL, NULL, NULL, '2008-08-11', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (244, 'T.I.', '1110046537', 'Agudelo Ramirez Juan Fernando', NULL, NULL, NULL, NULL, '2008-02-20', 'M', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (245, 'T.I.', '1111547833', 'Angel Barrios Ana Gabriela', NULL, NULL, NULL, NULL, '2008-09-09', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (246, 'T.I.', '1235256497', 'Arevalo Castro Camila Sofia', NULL, NULL, NULL, NULL, '2009-11-26', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (247, 'T.I.', '1072526773', 'Barboza Feria Alejandro', NULL, NULL, NULL, NULL, '2009-12-25', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (248, 'T.I.', '1104823120', 'Benavides Garcia Ricardo Andres', NULL, NULL, NULL, NULL, '2009-12-08', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (249, 'T.I.', '1148447636', 'Caicedo Caicedo Maria Sofia', NULL, NULL, NULL, NULL, '2009-12-07', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (250, 'T.I.', '1125084324', 'Caicedo Rodriguez Pablo Cesar', NULL, NULL, NULL, NULL, '2008-11-27', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (251, 'T.I.', '1110296647', 'Caicedo Tovar Santiago', NULL, NULL, NULL, NULL, '2008-09-17', 'M', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (252, 'T.I.', '1110046573', 'Caiza Sanchez Sebastian', NULL, NULL, NULL, NULL, '2008-12-16', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (253, 'T.I.', '1150688759', 'Florez Martinez Isabela', NULL, NULL, NULL, NULL, '2010-07-21', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (254, 'T.I.', '1126593236', 'Gonzalez Bautista Estrella', NULL, NULL, NULL, NULL, '2008-09-22', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (255, 'T.I.', '1190463380', 'Hinestroza Nuñez Edier Yaser', NULL, NULL, NULL, NULL, '2010-03-03', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (256, 'T.I.', '1108336515', 'Ibargüen Ibargüen Dany Liceth', NULL, NULL, NULL, NULL, '2009-02-23', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (257, 'T.I.', '1034298098', 'Jorgge Gaviria Keissy Varonica', NULL, NULL, NULL, NULL, '2009-09-21', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (258, 'T.I.', '1109670530', 'Lopez Castillo Santiago', NULL, NULL, NULL, NULL, '2009-02-07', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (259, 'T.I.', '1150685662', 'Marmol Duran Maria Fernanda', NULL, NULL, NULL, NULL, '2009-02-11', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (260, 'T.I.', '1149936354', 'Mondragon Mosquera Isabella', NULL, NULL, NULL, NULL, '2010-02-12', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (261, 'T.I.', '1107859045', 'Montaño Caicedo Laura Marcela', NULL, NULL, NULL, NULL, '2010-01-03', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (262, 'T.I.', '1111679755', 'Narvaez Vidales Yosselen Fabiana', NULL, NULL, NULL, NULL, '2010-02-19', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (263, 'T.I.', '1150687707', 'Piedrahita Camayo Karen Natalia', NULL, NULL, NULL, NULL, '2010-01-25', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (264, 'T.I.', '1107061422', 'Pineda Ortiz Jhon Deiby', NULL, NULL, NULL, NULL, '2008-06-21', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (265, 'T.I.', '1114003685', 'Quintana Mendoza Dulce Estefany', NULL, NULL, NULL, NULL, '2008-12-01', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (266, 'T.I.', '1150688256', 'Ramos Torres Michel Natalia', NULL, NULL, NULL, NULL, '2010-03-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (267, 'T.I.', '1107858525', 'Torres Castillo Keidy Angelyn', NULL, NULL, NULL, NULL, '2009-10-30', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (268, 'T.I.', '1110046657', 'Trujillo Posada Michel Andres', NULL, NULL, NULL, NULL, '2008-12-31', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (269, 'T.I.', '1111550241', 'Valencia Sinisterra Kelly Yorlany', NULL, NULL, NULL, NULL, '2009-11-07', 'F', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (270, 'T.I.', '1112051390', 'Velasco Lopez Santiago', NULL, NULL, NULL, NULL, '2009-08-21', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (271, 'T.I.', '1109671324', 'Cardoza Agredo Laura', NULL, NULL, NULL, NULL, '2009-08-17', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (272, 'T.I.', '1108258450', 'Laguna Toro Ana Sofia', NULL, NULL, NULL, NULL, '2009-01-30', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (273, 'T.I.', '1064489932', 'Angulo Ramos Gabriel Steeven', NULL, NULL, NULL, NULL, '2010-08-26', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (274, 'T.I.', '1108336226', 'Batalla Toloza Yelsi Samuel', NULL, NULL, NULL, NULL, '2008-03-27', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (275, 'T.I.', '1107060239', 'Caicedo Holguin Maria Andrea', NULL, NULL, NULL, NULL, '2008-02-25', NULL, 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (276, 'T.I.', '1107858608', 'Cano Muñoz Anny Saray', NULL, NULL, NULL, NULL, '2009-11-20', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (277, 'T.I.', '1110048220', 'Carmona Guerrero Melody Alexandra', NULL, NULL, NULL, NULL, '2009-12-24', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (278, 'T.I.', '1191214618', 'Carles Urbano Derek', NULL, NULL, NULL, NULL, '2009-06-24', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (279, 'T.I.', '1109191412', 'Charry Suarez Jhonatan Gabriel', NULL, NULL, NULL, NULL, '2009-07-27', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (280, 'T.I.', '1104807747', 'Charry Tovar Sebastian', NULL, NULL, NULL, NULL, '2008-03-30', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (281, 'T.I.', '1110370982', 'De la Cruz Quintero Victor Manuel', NULL, NULL, NULL, NULL, '2009-05-20', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (282, 'T.I.', '1091370438', 'Duarte Romero Marian Alessandra', NULL, NULL, NULL, NULL, '2009-09-22', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (283, 'T.I.', '1107073029', 'Galvez Arevalo Haely', NULL, NULL, NULL, NULL, '2010-10-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (284, 'T.I.', '1111483834', 'Garcia Peña Jhon Santiago', NULL, NULL, NULL, NULL, '2009-09-20', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (285, 'T.I.', '1107854334', 'Llanten Restrepo Angel David', NULL, NULL, NULL, NULL, '2008-11-01', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (286, 'T.I.', '1111678217', 'Minotta Qulindo Yiret', NULL, NULL, NULL, NULL, '2009-08-01', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (287, 'P.P.T.', '5007398', 'Muñoz Muñoz Erwin Antonio', NULL, NULL, NULL, NULL, '2007-04-28', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (288, 'T.I.', '1111548533', 'Murillo Bermudez Sara', NULL, NULL, NULL, NULL, '2009-04-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (289, 'T.I.', '1110048523', 'Quiñonez Salazar Ana Mailyn', NULL, NULL, NULL, NULL, '2010-03-16', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (290, 'C.C.', '1111670692', 'Ramirez Salazar Julen Andres', NULL, NULL, NULL, NULL, '2007-04-19', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (291, 'T.I.', '1113365879', 'Riascos Rodriguez Darwin Andres', NULL, NULL, NULL, NULL, '2008-11-15', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (292, 'T.I.', '1108645632', 'Sarria Castro Juan Jose', NULL, NULL, NULL, NULL, '2009-12-22', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (293, 'T.I.', '1111483948', 'Trejos Molina Danna Briyiht', NULL, NULL, NULL, NULL, '2009-11-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (294, 'T.I.', '1111679365', 'Valencia Aldana Juan Angel', NULL, NULL, NULL, NULL, '2010-01-05', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (295, 'T.I.', '1107063534', 'Valencia Rodriguez Nikol Brillit', NULL, NULL, NULL, NULL, '2008-05-27', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (296, 'T.I.', '1108255711', 'Velasquez Castillo Sara', NULL, NULL, NULL, NULL, '2009-07-11', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (297, 'T.I.', '1108336682', 'Zambrano Salcedo Santiago', NULL, NULL, NULL, NULL, '2009-07-12', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (298, 'P.P.T.', '1256347', 'Acosta Salazar Julieth Paola', NULL, NULL, NULL, NULL, '2008-02-12', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (299, 'T.I.', '1104820052', 'Camarero Vergara Gabriela', NULL, NULL, NULL, NULL, '2008-06-26', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (300, 'T.I.', '1111674267', 'Garcia Garcia Karen Sofia', NULL, NULL, NULL, NULL, '2008-04-28', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (301, 'T.I.', '1111676097', 'Lopez Vargas Juan David', NULL, NULL, NULL, NULL, '2008-12-13', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (302, 'T.I.', '1115188003', 'Rengifo Agudelo Julian Andres', NULL, NULL, NULL, NULL, '2009-02-24', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (303, 'T.I.', '1109671004', 'Restrepo Lopez Juan Manuel', NULL, NULL, NULL, NULL, '2009-01-08', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (304, 'T.I.', '1109672381', 'Astudillo Diaz Michel Dayana', NULL, NULL, NULL, NULL, '2010-03-18', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (305, 'T.I.', '1104823361', 'Bermudez Murillo Jasly Yulied', NULL, NULL, NULL, NULL, '2009-08-13', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (306, 'T.I.', '1109118816', 'Bonilla Saavedra Samuel', NULL, NULL, NULL, NULL, '2008-10-01', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (307, 'T.I.', '1109672778', 'Caicedo Rodriguez Josue Daniel', NULL, NULL, NULL, NULL, '2010-05-26', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (308, 'T.I.', '1107856569', 'Castaño Corrales Valentina', NULL, NULL, NULL, NULL, '2009-05-30', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (309, 'T.I.', '1111551544', 'Castro Castro Ruben Mauricio', NULL, NULL, NULL, NULL, '2010-10-05', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (310, 'T.I.', '1104822504', 'Celis Meneses Steven', NULL, NULL, NULL, NULL, '2009-09-10', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (311, 'T.I.', '1105930647', 'Cordoba Ospina Luis Angel', NULL, NULL, NULL, NULL, '2008-06-19', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (312, 'T.I.', '1113365839', 'Cossio Montoya Alisson Michelle', NULL, NULL, NULL, NULL, '2009-07-30', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (313, 'T.I.', '1107053069', 'De La Cruz Quintero Silvia Maria', NULL, NULL, NULL, NULL, '2007-02-15', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (314, 'T.I.', '1070600660', 'Echavarria Gallego Ashley Zarith', NULL, NULL, NULL, NULL, '2008-05-10', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (315, 'T.I.', '1107539404', 'Florez Guaje Mayre Ahnely', NULL, NULL, NULL, NULL, '2007-11-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (316, 'T.I.', '1111779281', 'Garces Mondragon Carlos Adrian', NULL, NULL, NULL, NULL, '2009-03-08', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (317, 'T.I.', '1110047003', 'Garcia Mercado Miguel Angel', NULL, NULL, NULL, NULL, '2009-04-18', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (318, 'T.I.', '1105374800', 'Gutierrez Diaz Jesus Alejandro', NULL, NULL, NULL, NULL, '2009-03-15', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (319, 'T.I.', '1109547591', 'Hoyos Hernandez Miguel Angel', NULL, NULL, NULL, NULL, '2009-04-01', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (320, 'T.I.', '1105375611', 'Jimenez Garcia Laura Sofia', NULL, NULL, NULL, NULL, '2009-07-09', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (321, 'T.I.', '1115455533', 'Mondragon Rodallega Ashley Valentina', NULL, NULL, NULL, NULL, '2010-08-21', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (322, 'T.I.', '1057757882', 'Montoya Velez Samuel de Jesus', NULL, NULL, NULL, NULL, '2009-07-28', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (323, 'T.I.', '1106516914', 'Muñoz Caicedo Alejandro', NULL, NULL, NULL, NULL, '2008-03-19', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (324, 'T.I.', '1150688286', 'Oviedo Cuero Moises de Jesus', NULL, NULL, NULL, NULL, '2010-04-27', 'M', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (325, 'T.I.', '1107072262', 'Paja Camacho Jhon Stevan', NULL, NULL, NULL, NULL, '2009-07-16', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (326, 'T.I.', '1104820736', 'Pillimue Yunda Joselyn Tatiana', NULL, NULL, NULL, NULL, '2008-12-15', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (327, 'T.I.', '1014214781', 'Ramirez Salazar Andrea Katherin', NULL, NULL, NULL, NULL, '2008-08-19', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (328, 'T.I.', '1107858601', 'Restrepo Salazar Veronica', NULL, NULL, NULL, NULL, '2009-11-20', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (329, 'T.I.', '1060676904', 'Rodriguez Angulo Jean Carlos', NULL, NULL, NULL, NULL, '2009-07-18', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (330, 'T.I.', '1111682865', 'Rodriguez Caicedo Laura Sofia', NULL, NULL, NULL, NULL, '2009-09-23', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (331, 'T.I.', '1107860757', 'Valencia Chilito Juan Camilo', NULL, NULL, NULL, NULL, '2010-05-28', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (332, 'T.I.', '1111674881', 'Cuero Aguirre Maria Camila', NULL, NULL, NULL, NULL, '2007-12-08', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (333, 'T.I.', '1107069256', 'Valencia Quiñones Evelin Dayana', NULL, NULL, NULL, NULL, '2009-06-15', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (334, 'T.I.', '1071788961', 'Sanchez Ospina Juan Manuel', NULL, NULL, NULL, NULL, '2009-03-16', 'M', 0, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (335, 'T.I.', '1091978455', 'Aguilar Gomez Samir', NULL, NULL, NULL, NULL, '2009-08-23', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (336, 'T.I.', '1111676005', 'Angulo Maquilon Juan Manuel', NULL, NULL, NULL, NULL, '2008-12-14', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (337, 'T.I.', '1109671924', 'Barona Hurtado Angie Michell', NULL, NULL, NULL, NULL, '2009-11-02', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (338, 'T.I.', '1114004036', 'Barona Pelaez Laura Janeth', NULL, NULL, NULL, NULL, '2009-10-07', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (339, 'T.I.', '1032015274', 'Cadrazco Duarte Anderson', NULL, NULL, NULL, NULL, '2009-01-01', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (340, 'T.I.', '1104821627', 'Castillo Franco Emmanuel', NULL, NULL, NULL, NULL, '2009-05-17', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (341, 'T.I.', '1085549307', 'Castillo Micolta Jainer David', NULL, NULL, NULL, NULL, '2008-07-06', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (342, 'T.I.', '1107859828', 'Castro Arenas Eyleen Lorena', NULL, NULL, NULL, NULL, '2010-03-11', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (343, 'T.I.', '1104820613', 'Collazos Murillo Mariana', NULL, NULL, NULL, NULL, '2008-12-13', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (344, 'T.I.', '1110044112', 'Diaz Mina Valerin', NULL, NULL, NULL, NULL, '2007-11-24', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (345, 'T.I.', '1107847932', 'Florez Padilla Juan David', NULL, NULL, NULL, NULL, '2007-05-13', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (346, 'T.I.', '1108255343', 'Herrera Martinez Lizeth Thaliana', NULL, NULL, NULL, NULL, '2008-11-01', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (347, 'T.I.', '1110045916', 'Llanten Fierro Juan Andres', NULL, NULL, NULL, NULL, '2009-09-01', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (348, 'T.I.', '1145724846', 'Mesa Vargas Isabella', NULL, NULL, NULL, NULL, '2009-02-23', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (349, 'T.I.', '1149188381', 'Mina Soliman Ingris Paola', NULL, NULL, NULL, NULL, '2008-08-28', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (350, 'T.I.', '1109671943', 'Montenegro Muñoz Sophia', NULL, NULL, NULL, NULL, '2009-12-19', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (351, 'T.I.', '1104822686', 'Ocoro Riascos Michael Steven', NULL, NULL, NULL, NULL, '2009-09-10', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (352, 'T.I.', '1111681558', 'Perdomo Hernandez Maria Del Mar', NULL, NULL, NULL, NULL, '2010-09-06', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (353, 'P.P.T.', '3010295', 'Perez Rodriguez Maria Fabiola', NULL, NULL, NULL, NULL, '2008-02-23', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (354, 'T.I.', '1109922499', 'Portocarrero Salazar Joselin Zulay', NULL, NULL, NULL, NULL, '2009-10-10', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (355, 'T.I.', '1104820342', 'Quintero Arrubla Laura Sofia', NULL, NULL, NULL, NULL, '2008-09-09', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (356, 'T.I.', '1093599566', 'Silva Vasquez Maria Jose', NULL, NULL, NULL, NULL, '2010-02-23', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (357, 'T.I.', '1106518237', 'Solis Rojas Rachael Eilin', NULL, NULL, NULL, NULL, '2010-03-16', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (358, 'T.I.', '1107861059', 'Toro Vanegas Sarah Sofia', NULL, NULL, NULL, NULL, '2010-06-30', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (359, 'T.I.', '1104824362', 'Troncoso Ospina Laura Valentina', NULL, NULL, NULL, NULL, '2010-05-14', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (360, 'T.I.', '1109118611', 'Valencia Duque Juan Sebastian', NULL, NULL, NULL, NULL, '2008-06-05', 'M', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (361, 'T.I.', '1108644936', 'Pinillo Florez Rihana Naomi', NULL, NULL, NULL, NULL, '2009-04-13', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (362, 'T.I.', '1118024914', 'Suarez Forero Lina Marcela', NULL, NULL, NULL, NULL, '2008-12-09', 'F', 1, NULL, NULL, NULL, NULL);
INSERT INTO `estudiantes` VALUES (363, 'T.I.', '1060800515', 'Valencia Zambrano Esbar Emilio', NULL, NULL, NULL, NULL, '2008-02-09', 'M', 1, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for failed_jobs
-- ----------------------------
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `failed_jobs_uuid_unique`(`uuid` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of failed_jobs
-- ----------------------------

-- ----------------------------
-- Table structure for grados
-- ----------------------------
DROP TABLE IF EXISTS `grados`;
CREATE TABLE `grados`  (
  `id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT,
  `numero` tinyint NOT NULL,
  `nombre` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel` enum('preescolar','primaria','secundaria','media') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `numero`(`numero` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of grados
-- ----------------------------
INSERT INTO `grados` VALUES (1, 0, 'Transición', 'preescolar');
INSERT INTO `grados` VALUES (2, 1, 'Primero', 'primaria');
INSERT INTO `grados` VALUES (3, 2, 'Segundo', 'primaria');
INSERT INTO `grados` VALUES (4, 3, 'Tercero', 'primaria');
INSERT INTO `grados` VALUES (5, 4, 'Cuarto', 'primaria');
INSERT INTO `grados` VALUES (6, 5, 'Quinto', 'primaria');
INSERT INTO `grados` VALUES (7, 6, 'Sexto', 'secundaria');
INSERT INTO `grados` VALUES (8, 7, 'Séptimo', 'secundaria');
INSERT INTO `grados` VALUES (9, 8, 'Octavo', 'secundaria');
INSERT INTO `grados` VALUES (10, 9, 'Noveno', 'secundaria');
INSERT INTO `grados` VALUES (11, 10, 'Décimo', 'media');
INSERT INTO `grados` VALUES (12, 11, 'Undécimo', 'media');

-- ----------------------------
-- Table structure for grupos
-- ----------------------------
DROP TABLE IF EXISTS `grupos`;
CREATE TABLE `grupos`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `anio_lectivo_id` smallint UNSIGNED NOT NULL,
  `sede_id` tinyint UNSIGNED NOT NULL,
  `grado_id` tinyint UNSIGNED NOT NULL,
  `numero` tinyint UNSIGNED NOT NULL,
  `codigo` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `jornada` enum('Mañana','Tarde','Única','Noche') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Mañana',
  `director_id` int UNSIGNED NULL DEFAULT NULL,
  `cupos_proyectados` smallint UNSIGNED NOT NULL DEFAULT 34,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_grupo`(`anio_lectivo_id` ASC, `sede_id` ASC, `grado_id` ASC, `numero` ASC, `jornada` ASC) USING BTREE,
  INDEX `ix_grupo_codigo`(`anio_lectivo_id` ASC, `codigo` ASC) USING BTREE,
  INDEX `fk_grupo_sede`(`sede_id` ASC) USING BTREE,
  INDEX `fk_grupo_grado`(`grado_id` ASC) USING BTREE,
  INDEX `fk_grupo_dir`(`director_id` ASC) USING BTREE,
  CONSTRAINT `fk_grupo_anio` FOREIGN KEY (`anio_lectivo_id`) REFERENCES `anios_lectivos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_grupo_dir` FOREIGN KEY (`director_id`) REFERENCES `docentes` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_grupo_grado` FOREIGN KEY (`grado_id`) REFERENCES `grados` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_grupo_sede` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 212 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of grupos
-- ----------------------------
INSERT INTO `grupos` VALUES (1, 12, 1, 11, 1, '10-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (2, 10, 2, 9, 5, '8-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (3, 11, 2, 10, 3, '9-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (4, 7, 4, 6, 2, '5-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (5, 8, 2, 7, 4, '6-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (6, 9, 2, 8, 3, '7-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (7, 10, 2, 9, 3, '8-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (8, 11, 2, 10, 2, '9-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (9, 1, 5, 2, 2, '1-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (10, 2, 5, 3, 2, '2-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (11, 3, 5, 4, 2, '3-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (12, 4, 5, 5, 3, '4-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (13, 5, 5, 6, 3, '5-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (14, 6, 2, 7, 5, '6-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (15, 7, 2, 7, 7, '6-7', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (16, 8, 2, 8, 6, '7-6', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (17, 9, 2, 8, 4, '7-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (18, 10, 2, 9, 4, '8-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (19, 11, 2, 10, 4, '9-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (20, 7, 3, 6, 1, '5-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (21, 8, 2, 7, 1, '6-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (22, 9, 2, 8, 1, '7-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (23, 10, 2, 9, 1, '8-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (24, 11, 2, 10, 1, '9-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (25, 2, 4, 2, 1, '1-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (26, 3, 4, 3, 1, '2-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (27, 4, 4, 4, 1, '3-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (28, 5, 4, 5, 1, '4-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (29, 6, 4, 6, 1, '5-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (30, 7, 2, 7, 5, '6-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (31, 9, 2, 8, 5, '7-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (32, 3, 4, 3, 3, '2-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (33, 4, 5, 3, 3, '2-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (34, 5, 5, 4, 3, '3-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (35, 6, 5, 5, 3, '4-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (36, 7, 5, 6, 3, '5-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (37, 3, 4, 2, 1, '1-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (38, 4, 4, 3, 1, '2-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (39, 5, 4, 4, 1, '3-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (40, 6, 4, 5, 1, '4-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (41, 7, 4, 6, 1, '5-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (42, 2, 5, 1, 1, '0-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (43, 3, 5, 2, 1, '1-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (44, 4, 5, 3, 1, '2-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (45, 5, 5, 4, 1, '3-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (46, 6, 5, 5, 1, '4-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (47, 7, 5, 6, 1, '5-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (48, 8, 2, 7, 2, '6-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (49, 9, 2, 8, 2, '7-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (50, 10, 2, 9, 2, '8-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (51, 2, 5, 2, 2, '1-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (52, 3, 5, 3, 2, '2-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (53, 4, 5, 4, 2, '3-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (54, 5, 5, 5, 3, '4-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (55, 6, 5, 6, 3, '5-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (56, 7, 2, 7, 4, '6-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (57, 8, 2, 8, 4, '7-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (58, 8, 2, 7, 7, '6-7', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (59, 9, 2, 8, 6, '7-6', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (60, 1, 5, 1, 1, '0-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (61, 2, 5, 2, 1, '1-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (62, 3, 3, 3, 1, '2-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (63, 4, 3, 4, 1, '3-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (64, 5, 3, 5, 1, '4-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (65, 6, 3, 6, 1, '5-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (66, 7, 2, 7, 8, '6-8', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (67, 8, 2, 7, 5, '6-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (68, 1, 4, 2, 3, '1-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (69, 2, 4, 2, 3, '1-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (70, 4, 4, 4, 3, '3-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (71, 5, 4, 5, 3, '4-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (72, 6, 4, 6, 3, '5-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (73, 7, 2, 7, 6, '6-6', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (74, 9, 2, 9, 3, '8-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (75, 3, 5, 3, 1, '2-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (76, 4, 5, 4, 1, '3-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (77, 5, 5, 5, 1, '4-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (78, 6, 5, 6, 1, '5-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (79, 7, 2, 7, 2, '6-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (80, 1, 5, 2, 1, '1-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (81, 4, 3, 5, 1, '4-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (82, 7, 2, 7, 1, '6-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (83, 8, 2, 8, 1, '7-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (84, 12, 1, 11, 2, '10-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (85, 8, 2, 7, 8, '6-8', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (86, 2, 3, 1, 1, '0-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (87, 3, 3, 2, 1, '1-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (88, 4, 3, 3, 1, '2-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (89, 5, 3, 4, 1, '3-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (90, 6, 3, 5, 1, '4-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (91, 8, 2, 7, 6, '6-6', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (92, 3, 5, 2, 2, '1-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (93, 4, 5, 3, 2, '2-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (94, 5, 5, 4, 2, '3-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (95, 6, 5, 5, 2, '4-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (96, 2, 5, 3, 1, '2-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (97, 8, 2, 8, 5, '7-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (98, 9, 2, 9, 4, '8-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (99, 10, 2, 10, 3, '9-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (100, 11, 1, 11, 2, '10-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (101, 7, 4, 6, 3, '5-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (102, 7, 5, 6, 2, '5-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (103, 8, 2, 7, 3, '6-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (104, 1, 4, 2, 1, '1-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (105, 2, 4, 3, 1, '2-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (106, 3, 4, 4, 1, '3-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (107, 4, 4, 5, 1, '4-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (108, 5, 4, 6, 1, '5-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (109, 6, 2, 7, 3, '6-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (110, 7, 2, 8, 3, '7-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (111, 8, 2, 9, 3, '8-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (112, 9, 2, 10, 2, '9-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (113, 10, 2, 10, 2, '9-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (114, 11, 1, 11, 1, '10-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (115, 3, 4, 2, 2, '1-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (116, 4, 4, 3, 2, '2-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (117, 5, 4, 4, 2, '3-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (118, 6, 4, 5, 2, '4-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (119, 7, 4, 6, 4, '5-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (120, 3, 4, 3, 2, '2-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (121, 4, 4, 3, 3, '2-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (122, 5, 4, 4, 3, '3-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (123, 6, 4, 5, 3, '4-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (124, 1, 4, 2, 2, '1-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (125, 2, 4, 3, 3, '2-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (126, 3, 4, 4, 3, '3-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (127, 4, 4, 5, 3, '4-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (128, 5, 4, 6, 3, '5-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (129, 12, 1, 11, 3, '10-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (130, 2, 5, 1, 2, '0-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (131, 8, 2, 8, 2, '7-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (132, 6, 5, 6, 2, '5-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (133, 7, 2, 7, 3, '6-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (134, 6, 2, 7, 6, '6-6', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (135, 7, 2, 8, 4, '7-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (136, 8, 2, 9, 2, '8-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (137, 9, 2, 9, 2, '8-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (138, 2, 4, 1, 1, '0-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (139, 12, 1, 11, 3, '10-3', 'Tarde', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (140, 12, 1, 11, 4, '10-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (141, 6, 4, 5, 4, '4-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (142, 2, 2, 1, 1, '0-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (143, 8, 2, 8, 3, '7-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (144, 1, 5, 1, 2, '0-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (145, 11, 1, 11, 4, '10-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (146, 12, 1, 11, 5, '10-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (147, 2, 4, 1, 2, '0-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (148, 12, 1, 11, 6, '10-6', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (149, 1, 3, 1, 1, '0-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (150, 2, 3, 2, 1, '1-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (151, 3, 4, 4, 2, '3-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (152, 4, 4, 5, 2, '4-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (153, 5, 4, 5, 2, '4-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (154, 6, 4, 6, 2, '5-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (155, 9, 2, 9, 5, '8-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (156, 10, 2, 10, 4, '9-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (157, 11, 1, 11, 3, '10-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (158, 9, 2, 9, 1, '8-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (159, 10, 2, 10, 1, '9-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (160, 12, 1, 12, 1, '11-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (161, 7, 2, 8, 2, '7-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (162, 10, 1, 11, 2, '10-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (163, 1, 3, 2, 1, '1-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (164, 2, 3, 3, 1, '2-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (165, 3, 3, 4, 1, '3-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (166, 5, 3, 6, 1, '5-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (167, 6, 2, 7, 1, '6-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (168, 7, 2, 8, 1, '7-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (169, 8, 2, 9, 1, '8-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (170, 5, 5, 5, 2, '4-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (171, 6, 2, 7, 7, '6-7', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (172, 7, 2, 8, 5, '7-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (173, 8, 2, 9, 5, '8-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (174, 9, 1, 10, 4, '9-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (175, 4, 5, 5, 1, '4-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (176, 5, 5, 6, 2, '5-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (177, 6, 2, 7, 4, '6-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (178, 5, 5, 6, 1, '5-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (179, 4, 5, 5, 2, '4-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (180, 8, 2, 9, 4, '8-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (181, 2, 4, 3, 2, '2-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (182, 5, 4, 6, 2, '5-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (183, 6, 2, 7, 2, '6-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (184, 12, 1, 12, 2, '11-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (185, 3, 5, 4, 1, '3-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (186, 4, 4, 4, 2, '3-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (187, 12, 1, 12, 3, '11-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (188, 3, 5, 5, 2, '4-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (189, 4, 5, 6, 2, '5-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (190, 5, 2, 7, 3, '6-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (191, 11, 1, 11, 5, '10-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (192, 2, 4, 2, 2, '1-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (193, 12, 1, 12, 4, '11-4', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (194, 2, 3, 4, 1, '3-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (195, 3, 3, 5, 1, '4-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (196, 4, 3, 6, 1, '5-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (197, 5, 2, 7, 1, '6-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (198, 6, 2, 8, 5, '7-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (199, 10, 1, 11, 3, '10-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (200, 2, 4, 4, 2, '3-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (201, 3, 4, 5, 2, '4-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (202, 1, 4, 1, 2, '0-2', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (203, 10, 1, 11, 5, '10-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (204, 12, 1, 12, 5, '11-5', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (205, 9, 2, 10, 1, '9-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (206, 10, 1, 11, 1, '10-1', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (207, 1, 5, 2, 3, '1-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (208, 2, 5, 3, 3, '2-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (209, 3, 5, 4, 3, '3-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (210, 9, 2, 10, 3, '9-3', 'Mañana', NULL, 34, NULL, NULL);
INSERT INTO `grupos` VALUES (211, 8, 2, 10, 1, '9-1', 'Mañana', NULL, 34, NULL, NULL);

-- ----------------------------
-- Table structure for instituciones
-- ----------------------------
DROP TABLE IF EXISTS `instituciones`;
CREATE TABLE `instituciones`  (
  `id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `codigo_dane` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `resolucion` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `municipio` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `rector` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of instituciones
-- ----------------------------
INSERT INTO `instituciones` VALUES (1, 'Institución Educativa Alfonso López Pumarejo', '800.025.227-5', '176001040101', 'Resolución 1697 del 3 de septiembre del 2002', 'Santiago de Cali', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for job_batches
-- ----------------------------
DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches`  (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `cancelled_at` int NULL DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of job_batches
-- ----------------------------

-- ----------------------------
-- Table structure for jobs
-- ----------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED NULL DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `jobs_queue_index`(`queue` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of jobs
-- ----------------------------

-- ----------------------------
-- Table structure for matriculas
-- ----------------------------
DROP TABLE IF EXISTS `matriculas`;
CREATE TABLE `matriculas`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `estudiante_id` int UNSIGNED NOT NULL,
  `anio_lectivo_id` smallint UNSIGNED NOT NULL,
  `grado_id` tinyint UNSIGNED NOT NULL,
  `grupo_id` int UNSIGNED NULL DEFAULT NULL,
  `sede_id` tinyint UNSIGNED NOT NULL,
  `modalidad_id` tinyint UNSIGNED NULL DEFAULT NULL,
  `jornada` enum('Mañana','Tarde','Única','Noche') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `fecha_matricula` date NULL DEFAULT NULL,
  `condicion` enum('nuevo','antiguo','repitente','trasladado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'nuevo',
  `estado` enum('activo','retirado','trasladado','graduado','cancelado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `resultado` enum('promovido','reprobado','pendiente','desertor') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `fecha_retiro` date NULL DEFAULT NULL,
  `motivo_retiro` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `numero_orden` smallint UNSIGNED NULL DEFAULT NULL,
  `es_historico` tinyint(1) NOT NULL DEFAULT 0,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_matricula`(`estudiante_id` ASC, `anio_lectivo_id` ASC) USING BTREE,
  INDEX `ix_mat_grupo`(`grupo_id` ASC, `estado` ASC) USING BTREE,
  INDEX `ix_mat_anio_sede`(`anio_lectivo_id` ASC, `sede_id` ASC, `estado` ASC) USING BTREE,
  INDEX `fk_mat_grado`(`grado_id` ASC) USING BTREE,
  INDEX `fk_mat_sede`(`sede_id` ASC) USING BTREE,
  INDEX `fk_mat_moda`(`modalidad_id` ASC) USING BTREE,
  CONSTRAINT `fk_mat_anio` FOREIGN KEY (`anio_lectivo_id`) REFERENCES `anios_lectivos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_mat_est` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_mat_grado` FOREIGN KEY (`grado_id`) REFERENCES `grados` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_mat_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_mat_moda` FOREIGN KEY (`modalidad_id`) REFERENCES `modalidades` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_mat_sede` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1847 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of matriculas
-- ----------------------------
INSERT INTO `matriculas` VALUES (1, 1, 12, 11, 1, 1, 1, 'Mañana', '2026-02-24', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (2, 2, 10, 9, 2, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (3, 2, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (4, 2, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 2, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (5, 3, 7, 6, 4, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (6, 3, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (7, 3, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (8, 3, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (9, 3, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (10, 3, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 2, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (11, 4, 1, 2, 9, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (12, 4, 2, 3, 10, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (13, 4, 3, 4, 11, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (14, 4, 4, 5, 12, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (15, 4, 5, 6, 13, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (16, 4, 6, 7, 14, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (17, 4, 7, 7, 15, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (18, 4, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (19, 4, 9, 8, 17, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (20, 4, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (21, 4, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (22, 4, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 1, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (23, 5, 9, 8, 17, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (24, 5, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (25, 5, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (26, 5, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 2, 0, 'Estudiante Venezolano', NULL, NULL);
INSERT INTO `matriculas` VALUES (27, 6, 7, 6, 20, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (28, 6, 8, 7, 21, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (29, 6, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (30, 6, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (31, 6, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (32, 6, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 2, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (33, 7, 11, 10, 3, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (34, 7, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 3, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (35, 8, 2, 2, 25, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (36, 8, 3, 3, 26, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (37, 8, 4, 4, 27, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (38, 8, 5, 5, 28, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (39, 8, 6, 6, 29, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (40, 8, 7, 7, 30, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (41, 8, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (42, 8, 9, 8, 17, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (43, 8, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (44, 8, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (45, 8, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 3, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (46, 9, 9, 8, 31, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (47, 9, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (48, 9, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (49, 9, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 5, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (50, 10, 3, 3, 32, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (51, 10, 4, 3, 33, 5, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (52, 10, 5, 4, 34, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (53, 10, 6, 5, 35, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (54, 10, 7, 6, 36, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (55, 10, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (56, 10, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (57, 10, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (58, 10, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (59, 10, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 7, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (60, 11, 10, 9, 18, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (61, 11, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (62, 11, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 7, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (63, 12, 3, 2, 37, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (64, 12, 4, 3, 38, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (65, 12, 5, 4, 39, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (66, 12, 6, 5, 40, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (67, 12, 7, 6, 41, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (68, 12, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (69, 12, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (70, 12, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (71, 12, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (72, 12, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 10, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (73, 13, 2, 1, 42, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (74, 13, 3, 2, 43, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (75, 13, 4, 3, 44, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (76, 13, 5, 4, 45, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (77, 13, 6, 5, 46, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (78, 13, 7, 6, 47, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (79, 13, 8, 7, 48, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (80, 13, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (81, 13, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (82, 13, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (83, 13, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 5, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (84, 14, 2, 2, 51, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (85, 14, 3, 3, 52, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (86, 14, 4, 4, 53, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (87, 14, 5, 5, 54, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (88, 14, 6, 6, 55, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (89, 14, 7, 7, 56, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (90, 14, 8, 8, 57, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (91, 14, 9, 8, 22, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (92, 14, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (93, 14, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (94, 14, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 6, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (95, 15, 9, 8, 6, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (96, 15, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (97, 15, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (98, 15, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 10, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (99, 16, 11, 10, 19, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (100, 16, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 13, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (101, 17, 9, 8, 22, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (102, 17, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (103, 17, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (104, 17, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 16, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (105, 18, 12, 11, 1, 1, 1, 'Mañana', '2026-02-19', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (106, 19, 8, 7, 58, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (107, 19, 9, 8, 59, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (108, 19, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (109, 19, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (110, 19, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 14, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (111, 20, 1, 1, 60, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (112, 20, 2, 2, 61, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (113, 20, 3, 3, 62, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (114, 20, 4, 4, 63, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (115, 20, 5, 5, 64, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (116, 20, 6, 6, 65, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (117, 20, 7, 6, 20, 3, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (118, 20, 8, 7, 21, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (119, 20, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (120, 20, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (121, 20, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (122, 20, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 17, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (123, 21, 10, 9, 2, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (124, 21, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (125, 21, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 9, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (126, 22, 7, 7, 66, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (127, 22, 8, 7, 67, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (128, 22, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (129, 22, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (130, 22, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (131, 22, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 17, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (132, 23, 3, 2, 37, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (133, 23, 4, 3, 38, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (134, 23, 5, 4, 39, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (135, 23, 6, 5, 40, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (136, 23, 7, 6, 41, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (137, 23, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (138, 23, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (139, 23, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (140, 23, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (141, 23, 12, 11, 1, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 19, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (142, 24, 7, 7, 15, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (143, 24, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (144, 24, 9, 8, 17, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (145, 24, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (146, 24, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (147, 24, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 18, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (148, 25, 1, 2, 68, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (149, 25, 2, 2, 69, 4, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (150, 25, 3, 3, 32, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (151, 25, 4, 4, 70, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (152, 25, 5, 5, 71, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (153, 25, 6, 6, 72, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (154, 25, 7, 7, 73, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (155, 25, 8, 8, 57, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (156, 25, 9, 9, 74, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (157, 25, 10, 9, 50, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (158, 25, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (159, 25, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 11, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (160, 26, 1, 1, 60, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (161, 26, 2, 2, 61, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (162, 26, 3, 3, 75, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (163, 26, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (164, 26, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (165, 26, 6, 6, 78, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (166, 26, 7, 7, 79, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (167, 26, 8, 7, 58, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (168, 26, 9, 8, 59, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (169, 26, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (170, 26, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (171, 26, 12, 11, 1, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 20, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (172, 27, 1, 2, 80, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (173, 27, 2, 2, 61, 5, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (174, 27, 3, 3, 75, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (175, 27, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (176, 27, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (177, 27, 6, 6, 78, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (178, 27, 7, 7, 79, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (179, 27, 8, 7, 67, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (180, 27, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (181, 27, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (182, 27, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (183, 27, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 24, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (184, 28, 11, 10, 3, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (185, 28, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 26, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (186, 29, 10, 9, 2, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (187, 29, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (188, 29, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 32, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (189, 30, 4, 5, 81, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (190, 30, 5, 5, 64, 3, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (191, 30, 6, 6, 65, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (192, 30, 7, 7, 82, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (193, 30, 8, 8, 83, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (194, 30, 9, 8, 49, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (195, 30, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (196, 30, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (197, 30, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'cancelado', NULL, NULL, NULL, 33, 0, 'Solicita cambio a la jornada sabatina 2026 - Se sugiere cambio de modelo educativo', NULL, NULL);
INSERT INTO `matriculas` VALUES (198, 31, 10, 9, 18, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (199, 31, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (200, 31, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 6, 0, 'Retirado 2026-06-03 se entrega documentos - se va de la ciudad', NULL, NULL);
INSERT INTO `matriculas` VALUES (201, 32, 12, 11, 1, 1, 2, 'Mañana', '2026-03-10', 'nuevo', 'retirado', NULL, NULL, NULL, NULL, 0, 'Retirado 2026-04-21 se entrega documentos - Se va para Nariño', NULL, NULL);
INSERT INTO `matriculas` VALUES (202, 33, 11, 10, 3, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (203, 33, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 4, 0, 'Retirado 2026-07-14 se va para buenaventura', NULL, NULL);
INSERT INTO `matriculas` VALUES (204, 34, 11, 10, 3, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (205, 34, 12, 11, 1, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 6, 0, 'Retirado 2026-08-31 se entrega documentos - traslado de ciudad', NULL, NULL);
INSERT INTO `matriculas` VALUES (206, 35, 8, 7, 5, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (207, 35, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (208, 35, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (209, 35, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (210, 35, 12, 11, 1, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 11, 0, 'Retirado 2026-09-08 cambio de I.E.', NULL, NULL);
INSERT INTO `matriculas` VALUES (211, 36, 11, 10, 24, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (212, 36, 12, 11, 1, 1, NULL, 'Mañana', NULL, 'antiguo', 'cancelado', NULL, NULL, NULL, 4, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (213, 37, 11, 10, 3, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (214, 37, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 1, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (215, 38, 12, 11, 84, 1, 2, 'Mañana', '2026-02-03', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (216, 39, 12, 11, 84, 1, 1, 'Mañana', '2026-02-16', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (217, 40, 8, 7, 85, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (218, 40, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (219, 40, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (220, 40, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (221, 40, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 5, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (222, 41, 4, 3, 33, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (223, 41, 5, 4, 34, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (224, 41, 6, 5, 35, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (225, 41, 7, 6, 36, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (226, 41, 8, 7, 67, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (227, 41, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (228, 41, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (229, 41, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (230, 41, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 9, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (231, 42, 8, 7, 21, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (232, 42, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (233, 42, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (234, 42, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (235, 42, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 8, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (236, 43, 12, 11, 84, 1, 1, 'Mañana', '2026-01-06', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (237, 44, 12, 11, 84, 1, 1, 'Mañana', '2026-01-06', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (238, 45, 2, 1, 86, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (239, 45, 3, 2, 87, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (240, 45, 4, 3, 88, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (241, 45, 5, 4, 89, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (242, 45, 6, 5, 90, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (243, 45, 7, 6, 20, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (244, 45, 8, 7, 21, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (245, 45, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (246, 45, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (247, 45, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (248, 45, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 11, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (249, 46, 8, 7, 5, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (250, 46, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (251, 46, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (252, 46, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (253, 46, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 12, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (254, 47, 3, 3, 26, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (255, 47, 4, 4, 27, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (256, 47, 5, 5, 28, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (257, 47, 6, 6, 29, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (258, 47, 7, 7, 56, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (259, 47, 8, 7, 21, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (260, 47, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (261, 47, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (262, 47, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (263, 47, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 12, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (264, 48, 2, 1, 86, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (265, 48, 3, 2, 87, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (266, 48, 4, 3, 88, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (267, 48, 5, 4, 89, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (268, 48, 6, 5, 90, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (269, 48, 7, 6, 20, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (270, 48, 8, 7, 21, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (271, 48, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (272, 48, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (273, 48, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (274, 48, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 14, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (275, 49, 12, 11, 84, 1, 1, 'Mañana', '2026-01-07', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (276, 50, 8, 7, 91, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (277, 50, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (278, 50, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (279, 50, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (280, 50, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 14, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (281, 51, 2, 1, 42, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (282, 51, 3, 2, 92, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (283, 51, 4, 3, 93, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (284, 51, 5, 4, 94, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (285, 51, 6, 5, 95, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (286, 51, 7, 6, 36, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (287, 51, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (288, 51, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (289, 51, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (290, 51, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (291, 51, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 18, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (292, 52, 1, 2, 80, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (293, 52, 2, 3, 96, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (294, 52, 3, 3, 75, 5, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (295, 52, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (296, 52, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (297, 52, 6, 6, 78, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (298, 52, 7, 7, 73, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (299, 52, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (300, 52, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (301, 52, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (302, 52, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (303, 52, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'repitente', 'activo', NULL, NULL, NULL, 13, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (304, 53, 11, 10, 8, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (305, 53, 12, 11, 84, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 21, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (306, 54, 7, 6, 101, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (307, 54, 8, 7, 67, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (308, 54, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (309, 54, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (310, 54, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (311, 54, 12, 11, 84, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 20, 0, 'Estudiante Extranjero', NULL, NULL);
INSERT INTO `matriculas` VALUES (312, 55, 9, 8, 17, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (313, 55, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (314, 55, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (315, 55, 12, 11, 84, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 21, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (316, 56, 10, 9, 7, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (317, 56, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (318, 56, 12, 11, 84, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 25, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (319, 57, 4, 3, 33, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (320, 57, 5, 4, 45, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (321, 57, 6, 5, 46, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (322, 57, 7, 6, 47, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (323, 57, 8, 7, 48, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (324, 57, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (325, 57, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (326, 57, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (327, 57, 12, 11, 84, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 35, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (328, 58, 12, 11, 84, 1, 1, 'Mañana', '2026-02-02', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (329, 59, 9, 8, 31, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (330, 59, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (331, 59, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (332, 59, 12, 11, 84, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 27, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (333, 60, 8, 7, 58, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (334, 60, 9, 8, 59, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (335, 60, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (336, 60, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (337, 60, 12, 11, 84, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 27, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (338, 61, 6, 5, 40, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (339, 61, 7, 6, 102, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (340, 61, 8, 7, 103, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (341, 61, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (342, 61, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (343, 61, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (344, 61, 12, 11, 84, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 40, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (345, 62, 1, 2, 104, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (346, 62, 2, 3, 105, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (347, 62, 3, 4, 106, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (348, 62, 4, 5, 107, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (349, 62, 5, 6, 108, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (350, 62, 6, 7, 109, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (351, 62, 7, 8, 110, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (352, 62, 8, 9, 111, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (353, 62, 9, 10, 112, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (354, 62, 10, 10, 113, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (355, 62, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (356, 62, 12, 11, 84, 1, 2, 'Mañana', '2025-12-05', 'repitente', 'activo', NULL, NULL, NULL, 33, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (357, 63, 3, 2, 115, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (358, 63, 4, 3, 116, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (359, 63, 5, 4, 117, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (360, 63, 6, 5, 118, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (361, 63, 7, 6, 119, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (362, 63, 8, 7, 91, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (363, 63, 9, 8, 31, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (364, 63, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (365, 63, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (366, 63, 12, 11, 84, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 33, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (367, 64, 1, 2, 68, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (368, 64, 2, 2, 69, 4, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (369, 64, 3, 3, 120, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (370, 64, 4, 3, 121, 4, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (371, 64, 5, 4, 122, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (372, 64, 6, 5, 123, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (373, 64, 7, 6, 101, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (374, 64, 8, 7, 91, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (375, 64, 9, 8, 31, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (376, 64, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (377, 64, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (378, 64, 12, 11, 84, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 7, 0, 'Retirado 2026-03-05 se entrega documentos - se va para Medellin', NULL, NULL);
INSERT INTO `matriculas` VALUES (379, 65, 1, 2, 124, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (380, 65, 2, 3, 125, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (381, 65, 3, 4, 126, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (382, 65, 4, 5, 127, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (383, 65, 5, 6, 128, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (384, 65, 6, 7, 109, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (385, 65, 7, 8, 110, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (386, 65, 8, 9, 111, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (387, 65, 9, 9, 74, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (388, 65, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (389, 65, 11, 10, 8, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (390, 65, 12, 11, 84, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 23, 0, 'Retirado 2026-04-23 se entrega documentos - cambio de vivienda', NULL, NULL);
INSERT INTO `matriculas` VALUES (391, 66, 11, 10, 8, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (392, 66, 12, 11, 84, 1, NULL, 'Mañana', NULL, 'antiguo', 'retirado', NULL, NULL, NULL, 26, 0, 'Retirado 2026-01-13 se entrega documentos - cambio de I.E.', NULL, NULL);
INSERT INTO `matriculas` VALUES (393, 67, 11, 10, 3, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (394, 67, 12, 11, 84, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 22, 0, 'Retirado 2026-02-24 se entrega documentos - No se siente conforme en el coelgio', NULL, NULL);
INSERT INTO `matriculas` VALUES (395, 68, 8, 8, 97, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (396, 68, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (397, 68, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (398, 68, 11, 10, 8, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (399, 68, 12, 11, 84, 1, 1, 'Mañana', NULL, 'antiguo', 'cancelado', NULL, NULL, NULL, 1, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (400, 69, 8, 7, 85, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (401, 69, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (402, 69, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (403, 69, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (404, 69, 12, 11, 84, 1, NULL, 'Mañana', NULL, 'antiguo', 'cancelado', NULL, NULL, NULL, 17, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (405, 70, 11, 10, 8, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (406, 70, 12, 11, 84, 1, 1, 'Mañana', NULL, 'antiguo', 'cancelado', NULL, NULL, NULL, 30, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (407, 71, 12, 11, 129, 1, 4, 'Mañana', '2026-06-30', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (408, 72, 11, 10, 8, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (409, 72, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 6, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (410, 73, 2, 1, 130, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (411, 73, 3, 2, 92, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (412, 73, 4, 3, 93, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (413, 73, 5, 4, 94, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (414, 73, 6, 5, 95, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (415, 73, 7, 6, 36, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (416, 73, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (417, 73, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (418, 73, 11, 10, 8, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (419, 73, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 8, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (420, 74, 11, 10, 3, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (421, 74, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 5, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (422, 75, 12, 11, 129, 1, 4, 'Mañana', '2026-01-20', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (423, 76, 9, 8, 31, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (424, 76, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (425, 76, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (426, 76, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 9, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (427, 77, 12, 11, 129, 1, 1, 'Mañana', '2026-02-03', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (428, 78, 5, 4, 94, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (429, 78, 6, 5, 95, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (430, 78, 7, 6, 36, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (431, 78, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (432, 78, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (433, 78, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (434, 78, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (435, 78, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 13, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (436, 79, 7, 7, 79, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (437, 79, 8, 7, 91, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (438, 79, 9, 8, 31, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (439, 79, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (440, 79, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (441, 79, 12, 11, 129, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 15, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (442, 80, 11, 10, 3, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (443, 80, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 10, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (444, 81, 1, 1, 60, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (445, 81, 2, 2, 61, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (446, 81, 3, 3, 75, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (447, 81, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (448, 81, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (449, 81, 6, 6, 78, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (450, 81, 7, 7, 79, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (451, 81, 8, 8, 131, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (452, 81, 9, 8, 49, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (453, 81, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (454, 81, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (455, 81, 12, 11, 129, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 21, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (456, 82, 11, 10, 19, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (457, 82, 12, 11, 129, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 16, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (458, 83, 5, 4, 45, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (459, 83, 6, 5, 46, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (460, 83, 7, 6, 47, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (461, 83, 8, 7, 103, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (462, 83, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (463, 83, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (464, 83, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (465, 83, 12, 11, 129, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 23, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (466, 84, 11, 10, 8, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (467, 84, 12, 11, 129, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 16, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (468, 85, 6, 6, 132, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (469, 85, 7, 7, 133, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (470, 85, 8, 7, 103, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (471, 85, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (472, 85, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (473, 85, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (474, 85, 12, 11, 129, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 26, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (475, 86, 12, 11, 129, 1, 1, 'Mañana', '2026-01-06', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (476, 87, 3, 2, 37, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (477, 87, 4, 3, 38, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (478, 87, 5, 4, 39, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (479, 87, 6, 5, 40, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (480, 87, 7, 6, 41, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (481, 87, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (482, 87, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (483, 87, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (484, 87, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (485, 87, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 18, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (486, 88, 4, 3, 93, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (487, 88, 5, 4, 94, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (488, 88, 6, 5, 95, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (489, 88, 7, 6, 36, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (490, 88, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (491, 88, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (492, 88, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (493, 88, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (494, 88, 12, 11, 129, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 20, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (495, 89, 12, 11, 129, 1, 4, 'Mañana', '2026-05-14', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (496, 90, 11, 10, 19, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (497, 90, 12, 11, 129, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 19, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (498, 91, 1, 2, 68, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (499, 91, 2, 3, 125, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (500, 91, 3, 4, 126, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (501, 91, 4, 5, 127, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (502, 91, 5, 6, 128, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (503, 91, 6, 7, 134, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (504, 91, 7, 8, 135, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (505, 91, 8, 9, 136, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (506, 91, 9, 9, 137, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (507, 91, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (508, 91, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (509, 91, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'repitente', 'activo', NULL, NULL, NULL, 20, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (510, 92, 2, 1, 138, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (511, 92, 3, 2, 37, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (512, 92, 4, 3, 38, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (513, 92, 5, 4, 39, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (514, 92, 6, 5, 40, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (515, 92, 7, 6, 41, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (516, 92, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (517, 92, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (518, 92, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (519, 92, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (520, 92, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 24, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (521, 93, 7, 7, 56, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (522, 93, 8, 8, 57, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (523, 93, 9, 8, 59, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (524, 93, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (525, 93, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (526, 93, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 18, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (527, 94, 12, 11, 129, 1, 4, 'Mañana', '2026-05-12', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (528, 95, 9, 8, 59, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (529, 95, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (530, 95, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (531, 95, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 19, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (532, 96, 8, 7, 5, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (533, 96, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (534, 96, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (535, 96, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (536, 96, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 28, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (537, 97, 12, 11, 129, 1, 4, 'Mañana', '2026-04-21', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (538, 98, 9, 8, 59, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (539, 98, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (540, 98, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (541, 98, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 25, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (542, 99, 1, 2, 80, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (543, 99, 2, 2, 61, 5, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (544, 99, 3, 3, 75, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (545, 99, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (546, 99, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (547, 99, 6, 5, 46, 5, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (548, 99, 7, 6, 102, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (549, 99, 8, 7, 48, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (550, 99, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (551, 99, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (552, 99, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (553, 99, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 38, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (554, 100, 9, 8, 6, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (555, 100, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (556, 100, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (557, 100, 12, 11, 129, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 36, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (558, 101, 10, 9, 7, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (559, 101, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (560, 101, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 37, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (561, 102, 9, 8, 59, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (562, 102, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (563, 102, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (564, 102, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 33, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (565, 103, 12, 11, 129, 1, 1, 'Mañana', '2026-02-11', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (566, 104, 8, 7, 67, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (567, 104, 9, 8, 59, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (568, 104, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (569, 104, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (570, 104, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 16, 0, 'Retirado 2026-03-26 se entrega documentos - se fue a vivir a Candelaria', NULL, NULL);
INSERT INTO `matriculas` VALUES (571, 105, 6, 5, 35, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (572, 105, 7, 6, 47, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (573, 105, 8, 7, 85, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (574, 105, 9, 8, 59, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (575, 105, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (576, 105, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (577, 105, 12, 11, 129, 1, 4, 'Mañana', '2025-12-16', 'antiguo', 'retirado', NULL, NULL, NULL, 34, 0, 'Retirado 2026-04-08 se entrega documentos - se va para España - 2025-12-16 la señora madre de la estudiante nombra como acudiente a la hermana mayor', NULL, NULL);
INSERT INTO `matriculas` VALUES (578, 106, 8, 7, 58, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (579, 106, 9, 8, 59, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (580, 106, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (581, 106, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (582, 106, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 28, 0, 'Retirado 2026-06-09 se entrega documentos - Cambio de I.E.', NULL, NULL);
INSERT INTO `matriculas` VALUES (583, 107, 8, 7, 67, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (584, 107, 9, 8, 59, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (585, 107, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (586, 107, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (587, 107, 12, 11, 129, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 30, 0, 'Retirado 2026-03-26 se entrega documentos - Retirado por deserción 2026-04-13', NULL, NULL);
INSERT INTO `matriculas` VALUES (588, 108, 11, 10, 3, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (589, 108, 12, 11, 139, 1, NULL, 'Tarde', NULL, 'antiguo', 'cancelado', NULL, NULL, NULL, 12, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (590, 109, 10, 9, 2, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (591, 109, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (592, 109, 12, 11, 139, 1, NULL, 'Tarde', NULL, 'antiguo', 'cancelado', NULL, NULL, NULL, 23, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (593, 110, 8, 7, 85, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (594, 110, 9, 8, 59, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (595, 110, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (596, 110, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (597, 110, 12, 11, 129, 1, 2, 'Mañana', NULL, 'antiguo', 'cancelado', NULL, NULL, NULL, 29, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (598, 111, 3, 2, 92, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (599, 111, 4, 3, 44, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (600, 111, 5, 4, 45, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (601, 111, 6, 5, 46, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (602, 111, 7, 6, 102, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (603, 111, 8, 7, 48, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (604, 111, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (605, 111, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (606, 111, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (607, 111, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 3, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (608, 112, 4, 4, 63, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (609, 112, 5, 5, 64, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (610, 112, 6, 6, 65, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (611, 112, 7, 7, 82, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (612, 112, 8, 8, 83, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (613, 112, 9, 8, 22, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (614, 112, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (615, 112, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (616, 112, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 7, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (617, 113, 6, 5, 141, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (618, 113, 7, 6, 4, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (619, 113, 8, 7, 67, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (620, 113, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (621, 113, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (622, 113, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (623, 113, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 11, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (624, 114, 10, 9, 18, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (625, 114, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (626, 114, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 12, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (627, 115, 2, 1, 142, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (628, 115, 3, 2, 43, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (629, 115, 4, 3, 44, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (630, 115, 5, 4, 45, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (631, 115, 6, 5, 46, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (632, 115, 7, 6, 47, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (633, 115, 8, 7, 48, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (634, 115, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (635, 115, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (636, 115, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (637, 115, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 15, 0, '2025-04-08 La abuela de la estudiante realiza cambio de acudiente, asignando a la señora madre', NULL, NULL);
INSERT INTO `matriculas` VALUES (638, 116, 12, 11, 140, 1, 4, 'Mañana', '2025-12-18', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (639, 117, 9, 8, 17, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (640, 117, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (641, 117, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (642, 117, 12, 11, 140, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 15, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (643, 118, 12, 11, 140, 1, 4, 'Mañana', '2026-01-06', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (644, 119, 2, 1, 130, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (645, 119, 3, 2, 92, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (646, 119, 4, 3, 93, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (647, 119, 5, 4, 94, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (648, 119, 6, 5, 95, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (649, 119, 7, 6, 36, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (650, 119, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (651, 119, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (652, 119, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (653, 119, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (654, 119, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 20, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (655, 120, 9, 9, 137, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (656, 120, 10, 9, 50, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (657, 120, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (658, 120, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 22, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (659, 121, 12, 11, 140, 1, 1, 'Mañana', '2026-01-28', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (660, 122, 8, 8, 143, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (661, 122, 9, 8, 22, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (662, 122, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (663, 122, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (664, 122, 12, 11, 140, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 28, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (665, 123, 6, 5, 40, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (666, 123, 7, 6, 41, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (667, 123, 8, 7, 103, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (668, 123, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (669, 123, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (670, 123, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (671, 123, 12, 11, 140, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 29, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (672, 124, 12, 11, 140, 1, 1, 'Mañana', '2026-02-10', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (673, 125, 2, 1, 138, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (674, 125, 3, 2, 37, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (675, 125, 4, 3, 116, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (676, 125, 5, 4, 117, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (677, 125, 6, 5, 141, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (678, 125, 7, 6, 4, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (679, 125, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (680, 125, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (681, 125, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (682, 125, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (683, 125, 12, 11, 140, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 22, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (684, 126, 1, 1, 144, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (685, 126, 2, 2, 51, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (686, 126, 3, 3, 52, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (687, 126, 4, 4, 53, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (688, 126, 5, 5, 54, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (689, 126, 6, 6, 55, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (690, 126, 7, 7, 30, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (691, 126, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (692, 126, 9, 8, 59, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (693, 126, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (694, 126, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (695, 126, 12, 11, 140, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 13, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (696, 127, 11, 11, 145, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (697, 127, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'repitente', 'activo', NULL, NULL, NULL, 22, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (698, 128, 9, 8, 17, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (699, 128, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (700, 128, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (701, 128, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 22, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (702, 129, 12, 11, 140, 1, 4, 'Mañana', '2026-01-14', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (703, 130, 10, 9, 2, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (704, 130, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (705, 130, 12, 11, 140, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 17, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (706, 131, 6, 5, 46, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (707, 131, 7, 6, 47, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (708, 131, 8, 7, 48, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (709, 131, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (710, 131, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (711, 131, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (712, 131, 12, 11, 140, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 32, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (713, 132, 6, 5, 35, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (714, 132, 7, 6, 36, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (715, 132, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (716, 132, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (717, 132, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (718, 132, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (719, 132, 12, 11, 140, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 27, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (720, 133, 9, 8, 59, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (721, 133, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (722, 133, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (723, 133, 12, 11, 140, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 21, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (724, 134, 12, 11, 140, 1, 1, 'Mañana', '2026-02-17', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (725, 135, 7, 6, 4, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (726, 135, 8, 7, 85, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (727, 135, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (728, 135, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (729, 135, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (730, 135, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 25, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (731, 136, 12, 11, 140, 1, 4, 'Mañana', '2026-01-13', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (732, 137, 9, 8, 17, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (733, 137, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (734, 137, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (735, 137, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 28, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (736, 138, 4, 3, 121, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (737, 138, 5, 4, 122, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (738, 138, 6, 5, 141, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (739, 138, 7, 6, 4, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (740, 138, 8, 7, 85, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (741, 138, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (742, 138, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (743, 138, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (744, 138, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 30, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (745, 139, 6, 6, 55, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (746, 139, 7, 7, 56, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (747, 139, 8, 7, 85, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (748, 139, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (749, 139, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (750, 139, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (751, 139, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 31, 0, 'Estudiante Venezolano', NULL, NULL);
INSERT INTO `matriculas` VALUES (752, 140, 11, 11, 145, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (753, 140, 12, 11, 140, 1, 1, 'Mañana', '2025-12-05', 'repitente', 'activo', NULL, NULL, NULL, 30, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (754, 141, 10, 9, 18, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (755, 141, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (756, 141, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 32, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (757, 142, 9, 8, 22, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (758, 142, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (759, 142, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (760, 142, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 42, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (761, 143, 7, 6, 4, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (762, 143, 8, 7, 85, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (763, 143, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (764, 143, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (765, 143, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (766, 143, 12, 11, 140, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 34, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (767, 144, 9, 8, 31, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (768, 144, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (769, 144, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (770, 144, 12, 11, 140, 1, 1, 'Mañana', NULL, 'antiguo', 'retirado', NULL, NULL, NULL, 29, 0, 'Retirado 2025-12-17 se entrega documentos', NULL, NULL);
INSERT INTO `matriculas` VALUES (771, 145, 3, 2, 115, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (772, 145, 4, 3, 116, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (773, 145, 5, 4, 117, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (774, 145, 6, 5, 118, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (775, 145, 7, 6, 119, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (776, 145, 8, 7, 91, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (777, 145, 9, 8, 31, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (778, 145, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (779, 145, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (780, 145, 12, 11, 146, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 3, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (781, 146, 4, 3, 121, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (782, 146, 5, 4, 122, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (783, 146, 6, 5, 123, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (784, 146, 7, 6, 101, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (785, 146, 8, 7, 103, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (786, 146, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (787, 146, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (788, 146, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (789, 146, 12, 11, 146, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 1, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (790, 147, 8, 7, 85, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (791, 147, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (792, 147, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (793, 147, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (794, 147, 12, 11, 146, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 4, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (795, 148, 12, 11, 146, 1, 3, 'Mañana', '2026-02-04', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (796, 149, 10, 9, 18, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (797, 149, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (798, 149, 12, 11, 146, 1, 1, 'Mañana', NULL, 'antiguo', 'activo', NULL, NULL, NULL, 10, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (799, 150, 12, 11, 146, 1, 3, 'Mañana', '2026-01-27', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (800, 151, 7, 7, 133, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (801, 151, 8, 8, 143, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (802, 151, 9, 8, 49, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (803, 151, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (804, 151, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (805, 151, 12, 11, 146, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 25, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (806, 152, 7, 6, 102, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (807, 152, 8, 7, 48, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (808, 152, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (809, 152, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (810, 152, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (811, 152, 12, 11, 146, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 27, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (812, 153, 12, 11, 146, 1, 3, 'Mañana', '2026-01-06', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (813, 154, 3, 2, 43, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (814, 154, 4, 3, 44, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (815, 154, 5, 4, 45, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (816, 154, 6, 5, 46, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (817, 154, 7, 6, 47, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (818, 154, 8, 7, 103, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (819, 154, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (820, 154, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (821, 154, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (822, 154, 12, 11, 146, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 30, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (823, 155, 12, 11, 146, 1, 1, 'Mañana', '2026-01-22', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (824, 156, 12, 11, 146, 1, 3, 'Mañana', '2026-01-08', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (825, 157, 9, 8, 22, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (826, 157, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (827, 157, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (828, 157, 12, 11, 146, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 31, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (829, 158, 12, 11, 146, 1, 1, 'Mañana', '2026-01-07', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (830, 159, 10, 9, 7, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (831, 159, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (832, 159, 12, 11, 146, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 29, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (833, 160, 8, 7, 58, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (834, 160, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (835, 160, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (836, 160, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (837, 160, 12, 11, 146, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 34, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (838, 161, 10, 9, 18, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (839, 161, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (840, 161, 12, 11, 146, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 23, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (841, 162, 11, 10, 3, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (842, 162, 12, 11, 146, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 24, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (843, 163, 1, 2, 124, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (844, 163, 2, 2, 25, 4, NULL, NULL, NULL, 'repitente', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (845, 163, 3, 2, 115, 4, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (846, 163, 4, 3, 116, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (847, 163, 5, 4, 117, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (848, 163, 6, 5, 118, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (849, 163, 7, 6, 119, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (850, 163, 8, 7, 91, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (851, 163, 9, 8, 31, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (852, 163, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (853, 163, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (854, 163, 12, 11, 146, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 31, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (855, 164, 2, 1, 147, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (856, 164, 3, 2, 92, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (857, 164, 4, 3, 93, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (858, 164, 5, 4, 45, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (859, 164, 6, 5, 46, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (860, 164, 7, 6, 102, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (861, 164, 8, 7, 48, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (862, 164, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (863, 164, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (864, 164, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (865, 164, 12, 11, 146, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 36, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (866, 165, 10, 9, 7, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (867, 165, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (868, 165, 12, 11, 146, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 32, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (869, 166, 12, 11, 146, 1, 1, 'Mañana', '2026-01-13', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (870, 167, 12, 11, 146, 1, 3, 'Mañana', '2026-02-17', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (871, 168, 10, 9, 50, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (872, 168, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (873, 168, 12, 11, 146, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 37, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (874, 169, 12, 11, 146, 1, 1, 'Mañana', '2026-01-06', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (875, 170, 3, 2, 37, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (876, 170, 4, 3, 38, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (877, 170, 5, 4, 34, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (878, 170, 6, 5, 46, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (879, 170, 7, 6, 47, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (880, 170, 8, 7, 103, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (881, 170, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (882, 170, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (883, 170, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (884, 170, 12, 11, 146, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 39, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (885, 171, 3, 2, 115, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (886, 171, 4, 3, 116, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (887, 171, 5, 4, 117, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (888, 171, 6, 5, 118, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (889, 171, 7, 6, 119, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (890, 171, 8, 7, 85, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (891, 171, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (892, 171, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (893, 171, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (894, 171, 12, 11, 146, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 34, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (895, 172, 12, 11, 146, 1, 3, 'Mañana', '2026-01-06', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (896, 173, 5, 4, 94, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (897, 173, 6, 5, 95, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (898, 173, 7, 6, 36, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (899, 173, 8, 7, 5, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (900, 173, 9, 8, 6, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (901, 173, 10, 9, 7, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (902, 173, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (903, 173, 12, 11, 146, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 35, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (904, 174, 12, 11, 146, 1, 3, 'Mañana', '2026-02-17', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (905, 175, 12, 11, 146, 1, 3, 'Mañana', '2026-01-07', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (906, 176, 12, 11, 146, 1, 1, 'Mañana', '2026-01-19', 'nuevo', 'retirado', NULL, NULL, NULL, NULL, 0, 'Retirado 2026-05-19 se entrega documentos - se va para Cinchiná', NULL, NULL);
INSERT INTO `matriculas` VALUES (907, 177, 12, 11, 146, 1, 1, 'Mañana', '2026-01-15', 'nuevo', 'retirado', NULL, NULL, NULL, NULL, 0, 'Retirado 2026-06-09 se entrega documentos - cambio de I.E.', NULL, NULL);
INSERT INTO `matriculas` VALUES (908, 178, 12, 11, 146, 1, 3, 'Mañana', '2026-01-28', 'nuevo', 'retirado', NULL, NULL, NULL, NULL, 0, 'Retirado 2026-08-04', NULL, NULL);
INSERT INTO `matriculas` VALUES (909, 179, 12, 11, 148, 1, 1, 'Mañana', '2026-01-20', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (910, 180, 9, 9, 137, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (911, 180, 10, 9, 7, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (912, 180, 11, 10, 8, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (913, 180, 12, 11, 148, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 4, 0, 'Estudiante Venezolano', NULL, NULL);
INSERT INTO `matriculas` VALUES (914, 181, 10, 9, 18, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (915, 181, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (916, 181, 12, 11, 148, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 8, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (917, 182, 12, 11, 148, 1, 3, 'Mañana', '2026-03-12', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (918, 183, 12, 11, 148, 1, 1, 'Mañana', '2026-01-23', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (919, 184, 12, 11, 148, 1, 3, 'Mañana', '2026-02-12', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (920, 185, 12, 11, 148, 1, 1, 'Mañana', '2026-02-03', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (921, 186, 8, 8, 131, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (922, 186, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (923, 186, 10, 9, 50, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (924, 186, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (925, 186, 12, 11, 148, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 9, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (926, 187, 12, 11, 148, 1, 3, 'Mañana', '2026-01-20', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (927, 188, 6, 5, 90, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (928, 188, 7, 6, 20, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (929, 188, 8, 7, 21, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (930, 188, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (931, 188, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (932, 188, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (933, 188, 12, 11, 148, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 13, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (934, 189, 12, 11, 148, 1, 3, 'Mañana', '2026-02-03', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (935, 190, 2, 2, 25, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (936, 190, 3, 2, 37, 4, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (937, 190, 4, 3, 116, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (938, 190, 5, 4, 117, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (939, 190, 6, 5, 118, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (940, 190, 7, 6, 119, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (941, 190, 8, 7, 91, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (942, 190, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (943, 190, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (944, 190, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (945, 190, 12, 11, 148, 1, 3, 'Mañana', '2025-12-16', 'antiguo', 'activo', NULL, NULL, NULL, 19, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (946, 191, 12, 11, 148, 1, 3, 'Mañana', '2026-01-14', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (947, 192, 12, 11, 148, 1, 1, 'Mañana', '2026-01-20', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (948, 193, 9, 8, 59, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (949, 193, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (950, 193, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (951, 193, 12, 11, 148, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 8, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (952, 194, 12, 11, 148, 1, 1, 'Mañana', '2026-01-19', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (953, 195, 5, 4, 34, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (954, 195, 6, 5, 141, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (955, 195, 7, 6, 4, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (956, 195, 8, 7, 103, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (957, 195, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (958, 195, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (959, 195, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (960, 195, 12, 11, 148, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 24, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (961, 196, 12, 11, 148, 1, 1, 'Mañana', '2026-01-20', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (962, 197, 12, 11, 148, 1, 1, 'Mañana', '2026-01-20', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (963, 198, 12, 11, 148, 1, 1, 'Mañana', '2026-01-22', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (964, 199, 12, 11, 148, 1, 1, 'Mañana', '2026-01-20', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (965, 200, 8, 7, 85, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (966, 200, 9, 8, 17, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (967, 200, 10, 9, 18, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (968, 200, 11, 10, 19, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (969, 200, 12, 11, 148, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 26, 0, 'Estudiante Venezolano', NULL, NULL);
INSERT INTO `matriculas` VALUES (970, 201, 12, 11, 148, 1, 1, 'Mañana', '2026-01-22', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (971, 202, 12, 11, 148, 1, 1, 'Mañana', '2026-01-14', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (972, 203, 1, 1, 149, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (973, 203, 2, 2, 150, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (974, 203, 3, 3, 62, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (975, 203, 4, 4, 63, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (976, 203, 5, 5, 64, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (977, 203, 6, 6, 65, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (978, 203, 7, 7, 82, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (979, 203, 8, 7, 21, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (980, 203, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (981, 203, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (982, 203, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (983, 203, 12, 11, 148, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 41, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (984, 204, 11, 10, 3, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (985, 204, 12, 11, 148, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 31, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (986, 205, 12, 11, 148, 1, 3, 'Mañana', '2026-02-18', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (987, 206, 4, 3, 121, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (988, 206, 5, 4, 122, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (989, 206, 6, 5, 123, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (990, 206, 7, 6, 101, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (991, 206, 8, 7, 103, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (992, 206, 9, 8, 49, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (993, 206, 10, 9, 50, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (994, 206, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (995, 206, 12, 11, 148, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 43, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (996, 207, 3, 4, 151, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (997, 207, 4, 5, 152, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (998, 207, 5, 5, 153, 4, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (999, 207, 6, 6, 154, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1000, 207, 7, 7, 56, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1001, 207, 8, 7, 21, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1002, 207, 9, 8, 22, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1003, 207, 10, 9, 23, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1004, 207, 11, 10, 24, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1005, 207, 12, 11, 148, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 44, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1006, 208, 5, 4, 94, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1007, 208, 6, 5, 95, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1008, 208, 7, 6, 36, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1009, 208, 8, 7, 85, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1010, 208, 9, 8, 59, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1011, 208, 10, 9, 2, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1012, 208, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1013, 208, 12, 11, 148, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 35, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1014, 209, 12, 11, 148, 1, 3, 'Mañana', '2026-02-24', 'nuevo', 'retirado', NULL, NULL, NULL, NULL, 0, 'Retirado 2026-03-20 se entrega documentos - se regresa a Tulua', NULL, NULL);
INSERT INTO `matriculas` VALUES (1015, 210, 3, 3, 32, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1016, 210, 4, 4, 70, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1017, 210, 5, 5, 71, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1018, 210, 6, 6, 72, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1019, 210, 7, 7, 73, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1020, 210, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1021, 210, 9, 9, 155, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1022, 210, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1023, 210, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1024, 210, 12, 11, 148, 1, 3, 'Mañana', '2025-12-17', 'repitente', 'retirado', NULL, NULL, NULL, 14, 0, 'Retirado 2026-03-10 se entrega documentos - Cambio de I.E.', NULL, NULL);
INSERT INTO `matriculas` VALUES (1025, 211, 10, 9, 2, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1026, 211, 11, 10, 3, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1027, 211, 12, 11, 148, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 15, 0, 'Retirado 2026-05-12 se entrega documentos - cambio de I.E.', NULL, NULL);
INSERT INTO `matriculas` VALUES (1028, 212, 3, 3, 75, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1029, 212, 4, 4, 63, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1030, 212, 5, 5, 64, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1031, 212, 6, 6, 65, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1032, 212, 7, 7, 82, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1033, 212, 8, 8, 83, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1034, 212, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1035, 212, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1036, 212, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1037, 212, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 1, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1038, 213, 7, 8, 161, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1039, 213, 8, 9, 136, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1040, 213, 9, 10, 112, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1041, 213, 10, 11, 162, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1042, 213, 11, 11, 114, 1, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1043, 213, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 2, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1044, 214, 9, 9, 74, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1045, 214, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1046, 214, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1047, 214, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 3, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1048, 215, 9, 9, 158, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1049, 215, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1050, 215, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1051, 215, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 5, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1052, 216, 1, 2, 163, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1053, 216, 2, 3, 164, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1054, 216, 3, 4, 165, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1055, 216, 4, 5, 81, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1056, 216, 5, 6, 166, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1057, 216, 6, 7, 167, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1058, 216, 7, 8, 168, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1059, 216, 8, 9, 169, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1060, 216, 9, 9, 74, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1061, 216, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1062, 216, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1063, 216, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 7, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1064, 217, 10, 10, 99, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1065, 217, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1066, 217, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 8, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1067, 218, 9, 9, 74, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1068, 218, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1069, 218, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1070, 218, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 9, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1071, 219, 1, 1, 60, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1072, 219, 2, 2, 61, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1073, 219, 3, 3, 75, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1074, 219, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1075, 219, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1076, 219, 6, 6, 78, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1077, 219, 7, 7, 79, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1078, 219, 8, 8, 131, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1079, 219, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1080, 219, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1081, 219, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1082, 219, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 10, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1083, 220, 1, 1, 60, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1084, 220, 2, 2, 61, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1085, 220, 3, 3, 75, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1086, 220, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1087, 220, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1088, 220, 6, 6, 78, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1089, 220, 7, 7, 79, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1090, 220, 8, 8, 131, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1091, 220, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1092, 220, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1093, 220, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1094, 220, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 11, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1095, 221, 8, 8, 16, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1096, 221, 9, 9, 74, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1097, 221, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1098, 221, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1099, 221, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 12, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1100, 222, 5, 5, 170, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1101, 222, 6, 6, 132, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1102, 222, 7, 7, 133, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1103, 222, 8, 8, 143, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1104, 222, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1105, 222, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1106, 222, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1107, 222, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 13, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1108, 223, 3, 4, 106, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1109, 223, 4, 5, 107, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1110, 223, 5, 6, 108, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1111, 223, 6, 7, 171, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1112, 223, 7, 8, 172, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1113, 223, 8, 9, 173, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1114, 223, 9, 10, 174, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1115, 223, 10, 10, 113, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1116, 223, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1117, 223, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 14, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1118, 224, 2, 2, 61, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1119, 224, 3, 3, 75, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1120, 224, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1121, 224, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1122, 224, 6, 6, 78, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1123, 224, 7, 7, 79, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1124, 224, 8, 8, 131, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1125, 224, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1126, 224, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1127, 224, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1128, 224, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 15, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1129, 225, 10, 10, 159, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1130, 225, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1131, 225, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 16, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1132, 226, 7, 7, 66, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1133, 226, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1134, 226, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1135, 226, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1136, 226, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1137, 226, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 17, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1138, 227, 4, 4, 76, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1139, 227, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1140, 227, 6, 6, 78, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1141, 227, 7, 7, 79, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1142, 227, 8, 8, 131, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1143, 227, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1144, 227, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1145, 227, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1146, 227, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 18, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1147, 228, 1, 1, 149, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1148, 228, 2, 2, 150, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1149, 228, 3, 3, 62, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1150, 228, 4, 4, 63, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1151, 228, 5, 5, 64, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1152, 228, 6, 6, 65, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1153, 228, 7, 7, 82, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1154, 228, 8, 8, 83, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1155, 228, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1156, 228, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1157, 228, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1158, 228, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 19, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1159, 229, 1, 1, 144, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1160, 229, 2, 2, 61, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1161, 229, 3, 3, 75, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1162, 229, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1163, 229, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1164, 229, 6, 6, 132, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1165, 229, 7, 7, 133, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1166, 229, 8, 8, 143, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1167, 229, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1168, 229, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1169, 229, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1170, 229, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 21, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1171, 230, 10, 10, 156, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1172, 230, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1173, 230, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 22, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1174, 231, 1, 1, 60, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1175, 231, 2, 2, 61, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1176, 231, 3, 3, 75, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1177, 231, 4, 4, 53, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1178, 231, 5, 5, 170, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1179, 231, 6, 6, 132, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1180, 231, 7, 7, 133, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1181, 231, 8, 8, 143, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1182, 231, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1183, 231, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1184, 231, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1185, 231, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 23, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1186, 232, 9, 9, 137, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1187, 232, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1188, 232, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1189, 232, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 24, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1190, 233, 11, 11, 114, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1191, 233, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 25, 0, 'Fue promovido al grado 11-1 por comision de evaluacion y promoción anticipada de marzo 2026', NULL, NULL);
INSERT INTO `matriculas` VALUES (1192, 234, 4, 5, 175, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1193, 234, 5, 6, 176, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1194, 234, 6, 7, 177, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1195, 234, 7, 8, 161, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1196, 234, 8, 8, 57, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1197, 234, 9, 9, 74, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1198, 234, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1199, 234, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1200, 234, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 26, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1201, 235, 9, 9, 74, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1202, 235, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1203, 235, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1204, 235, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 27, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1205, 236, 10, 10, 99, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1206, 236, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1207, 236, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 28, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1208, 237, 4, 5, 175, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1209, 237, 5, 6, 178, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1210, 237, 6, 7, 177, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1211, 237, 7, 8, 110, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1212, 237, 8, 8, 131, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1213, 237, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1214, 237, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1215, 237, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1216, 237, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 32, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1217, 238, 4, 5, 179, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1218, 238, 5, 6, 176, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1219, 238, 6, 7, 177, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1220, 238, 7, 8, 135, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1221, 238, 8, 9, 180, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1222, 238, 9, 9, 98, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1223, 238, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1224, 238, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1225, 238, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 4, 0, 'Retirado 2026-01-15 se entega documentos - cambio de residencia', NULL, NULL);
INSERT INTO `matriculas` VALUES (1226, 239, 9, 9, 158, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1227, 239, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1228, 239, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1229, 239, 12, 12, 160, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 6, 0, 'Retirado 2026-02-12 se entrega documentos - cambio de residencia', NULL, NULL);
INSERT INTO `matriculas` VALUES (1230, 240, 10, 10, 99, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1231, 240, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1232, 240, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 30, 0, 'Retirado 2026-05-07 se entrega documentos - cambio de I.E.', NULL, NULL);
INSERT INTO `matriculas` VALUES (1233, 241, 11, 11, 114, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1234, 241, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 31, 0, 'Retirado 2025-12-17 se entrega documentos', NULL, NULL);
INSERT INTO `matriculas` VALUES (1235, 242, 10, 10, 99, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1236, 242, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1237, 242, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 34, 0, 'Retirado 2025-12-18 se entrega documentos', NULL, NULL);
INSERT INTO `matriculas` VALUES (1238, 243, 8, 8, 143, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1239, 243, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1240, 243, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1241, 243, 11, 11, 114, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1242, 243, 12, 12, 160, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'cancelado', NULL, NULL, NULL, 29, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1243, 244, 2, 3, 181, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1244, 244, 3, 4, 151, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1245, 244, 4, 5, 152, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1246, 244, 5, 6, 182, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1247, 244, 6, 7, 183, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1248, 244, 7, 7, 15, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1249, 244, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1250, 244, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1251, 244, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1252, 244, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1253, 244, 12, 12, 184, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 1, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1254, 245, 7, 7, 66, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1255, 245, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1256, 245, 9, 9, 155, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1257, 245, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1258, 245, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1259, 245, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 2, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1260, 246, 8, 8, 97, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1261, 246, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1262, 246, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1263, 246, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1264, 246, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 3, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1265, 247, 1, 1, 60, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1266, 247, 2, 2, 61, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1267, 247, 3, 3, 75, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1268, 247, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1269, 247, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1270, 247, 6, 6, 78, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1271, 247, 7, 7, 79, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1272, 247, 8, 8, 131, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1273, 247, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1274, 247, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1275, 247, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1276, 247, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 4, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1277, 248, 1, 1, 149, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1278, 248, 2, 2, 150, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1279, 248, 3, 3, 62, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1280, 248, 4, 4, 63, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1281, 248, 5, 5, 64, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1282, 248, 6, 6, 65, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1283, 248, 7, 7, 82, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1284, 248, 8, 8, 83, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1285, 248, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1286, 248, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1287, 248, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1288, 248, 12, 12, 184, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 5, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1289, 249, 9, 9, 158, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1290, 249, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1291, 249, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1292, 249, 12, 12, 184, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 6, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1293, 250, 10, 10, 159, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1294, 250, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1295, 250, 12, 12, 184, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 7, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1296, 251, 1, 2, 163, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1297, 251, 2, 3, 164, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1298, 251, 3, 4, 165, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1299, 251, 4, 5, 81, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1300, 251, 5, 6, 166, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1301, 251, 6, 7, 167, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1302, 251, 7, 7, 82, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1303, 251, 8, 8, 83, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1304, 251, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1305, 251, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1306, 251, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1307, 251, 12, 12, 184, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 8, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1308, 252, 9, 9, 158, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1309, 252, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1310, 252, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1311, 252, 12, 12, 184, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 9, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1312, 253, 6, 6, 132, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1313, 253, 7, 7, 133, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1314, 253, 8, 8, 143, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1315, 253, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1316, 253, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1317, 253, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1318, 253, 12, 12, 184, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 11, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1319, 254, 10, 10, 99, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1320, 254, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1321, 254, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 12, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1322, 255, 7, 7, 56, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1323, 255, 8, 8, 57, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1324, 255, 9, 9, 74, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1325, 255, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1326, 255, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1327, 255, 12, 12, 184, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 14, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1328, 256, 2, 3, 96, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1329, 256, 3, 4, 185, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1330, 256, 4, 5, 175, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1331, 256, 5, 6, 178, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1332, 256, 6, 7, 177, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1333, 256, 7, 7, 66, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1334, 256, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1335, 256, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1336, 256, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1337, 256, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1338, 256, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 15, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1339, 257, 1, 1, 144, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1340, 257, 2, 2, 51, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1341, 257, 3, 3, 32, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1342, 257, 4, 4, 70, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1343, 257, 5, 5, 71, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1344, 257, 6, 6, 72, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1345, 257, 7, 7, 73, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1346, 257, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1347, 257, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1348, 257, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1349, 257, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1350, 257, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 16, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1351, 258, 2, 3, 181, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1352, 258, 3, 3, 120, 4, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1353, 258, 4, 4, 186, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1354, 258, 5, 5, 153, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1355, 258, 6, 6, 154, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1356, 258, 7, 7, 66, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1357, 258, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1358, 258, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1359, 258, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1360, 258, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1361, 258, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 18, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1362, 259, 6, 6, 29, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1363, 259, 7, 7, 56, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1364, 259, 8, 8, 57, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1365, 259, 9, 9, 74, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1366, 259, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1367, 259, 11, 11, NULL, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1368, 259, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 19, 0, '2025-10-15 el docente Rafael Nuñez Informa que la estudiante si asiste a clases y es reintegrada nuevamente a la lista - RETIRADO Y REPORTADO EN SIMPADE COMO DESERTOR EL 2025-04-21 - LA COORDINADORA OLGA LILIANA REPORTA CAMBIO DE RESIDENCIA - 2025-03-04 El señor Emerzon Marmol Fernandez (padre de la estudiante) autoriza como acudiente a la señora madre Niny Johana Duran Vega', NULL, NULL);
INSERT INTO `matriculas` VALUES (1369, 260, 10, 10, 99, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1370, 260, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1371, 260, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 20, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1372, 261, 10, 10, 99, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1373, 261, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1374, 261, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 21, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1375, 262, 11, 11, 100, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1376, 262, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 22, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1377, 263, 1, 1, 144, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1378, 263, 2, 2, 51, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1379, 263, 3, 3, 52, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1380, 263, 4, 4, 53, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1381, 263, 5, 5, 54, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1382, 263, 6, 6, 55, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1383, 263, 7, 7, 66, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1384, 263, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1385, 263, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1386, 263, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1387, 263, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1388, 263, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 23, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1389, 264, 4, 5, 12, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1390, 264, 5, 6, 178, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1391, 264, 6, 7, 134, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1392, 264, 7, 8, 172, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1393, 264, 8, 9, 111, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1394, 264, 9, 9, 74, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1395, 264, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1396, 264, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1397, 264, 12, 12, 184, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 24, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1398, 265, 8, 8, 143, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1399, 265, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1400, 265, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1401, 265, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1402, 265, 12, 12, 184, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 25, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1403, 266, 3, 3, 62, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1404, 266, 4, 4, 63, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1405, 266, 5, 5, 64, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1406, 266, 6, 6, 65, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1407, 266, 7, 7, 82, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1408, 266, 8, 8, 83, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1409, 266, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1410, 266, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1411, 266, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1412, 266, 12, 12, 184, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 27, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1413, 267, 8, 8, 57, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1414, 267, 9, 9, 74, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1415, 267, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1416, 267, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1417, 267, 12, 12, 184, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 28, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1418, 268, 9, 9, 137, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1419, 268, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1420, 268, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1421, 268, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 29, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1422, 269, 1, 1, 60, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1423, 269, 2, 2, 61, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1424, 269, 3, 3, 75, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1425, 269, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1426, 269, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1427, 269, 6, 6, 78, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1428, 269, 7, 7, 79, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1429, 269, 8, 8, 131, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1430, 269, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1431, 269, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1432, 269, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1433, 269, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 30, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1434, 270, 1, 2, 124, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1435, 270, 2, 2, 25, 4, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1436, 270, 3, 3, 26, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1437, 270, 4, 4, 27, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1438, 270, 5, 5, 28, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1439, 270, 6, 6, 29, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1440, 270, 7, 7, 56, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1441, 270, 8, 8, 57, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1442, 270, 9, 9, 74, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1443, 270, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1444, 270, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1445, 270, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 31, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1446, 271, 11, 11, 100, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1447, 271, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 10, 0, 'Retirado 2026-05-13 aparece matriculado en Cali - INSTITUCION EDUCATIVA REPUBLICA DE ISRAEL', NULL, NULL);
INSERT INTO `matriculas` VALUES (1448, 272, 9, 9, 98, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1449, 272, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1450, 272, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1451, 272, 12, 12, 184, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'cancelado', NULL, NULL, NULL, 17, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1452, 273, 10, 10, 156, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1453, 273, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1454, 273, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 2, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1455, 274, 10, 10, 156, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1456, 274, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1457, 274, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 3, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1458, 275, 3, 4, 11, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1459, 275, 4, 5, 12, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1460, 275, 5, 6, 13, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1461, 275, 6, 7, 14, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1462, 275, 7, 7, 15, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1463, 275, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1464, 275, 9, 9, 155, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1465, 275, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1466, 275, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1467, 275, 12, 12, 187, 1, 3, 'Mañana', '2026-02-12', 'antiguo', 'activo', NULL, NULL, NULL, 4, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1468, 276, 11, 11, 157, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1469, 276, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 6, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1470, 277, 12, 12, 187, 1, 4, 'Mañana', '2026-01-28', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1471, 278, 8, 8, 143, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1472, 278, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1473, 278, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1474, 278, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1475, 278, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 7, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1476, 279, 11, 11, 157, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1477, 279, 12, 12, 187, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 8, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1478, 280, 9, 9, 74, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1479, 280, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1480, 280, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1481, 280, 12, 12, 187, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 9, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1482, 281, 3, 3, 32, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1483, 281, 4, 4, 70, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1484, 281, 5, 5, 71, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1485, 281, 6, 6, 72, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1486, 281, 7, 7, 66, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1487, 281, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1488, 281, 9, 9, 155, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1489, 281, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1490, 281, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1491, 281, 12, 12, 187, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 10, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1492, 282, 12, 12, 187, 1, 4, 'Mañana', '2026-02-04', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1493, 283, 9, 9, 158, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1494, 283, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1495, 283, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1496, 283, 12, 12, 187, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 11, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1497, 284, 11, 11, 157, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1498, 284, 12, 12, 187, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 13, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1499, 285, 3, 5, 188, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1500, 285, 4, 6, 189, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1501, 285, 5, 7, 190, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1502, 285, 6, 7, 109, 2, NULL, NULL, NULL, 'repitente', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1503, 285, 7, 7, 30, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1504, 285, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1505, 285, 9, 9, 74, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1506, 285, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1507, 285, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1508, 285, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 15, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1509, 286, 12, 12, 187, 1, 4, 'Mañana', '2026-01-20', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1510, 287, 9, 9, 155, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1511, 287, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1512, 287, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1513, 287, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 16, 0, 'Estudiante Venezolano', NULL, NULL);
INSERT INTO `matriculas` VALUES (1514, 288, 11, 11, 157, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1515, 288, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 17, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1516, 289, 10, 10, 99, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1517, 289, 11, 11, 100, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1518, 289, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 26, 0, 'Fue promovido al grado 11-3 por comision de evaluacion y promoción anticipada de marzo 2026', NULL, NULL);
INSERT INTO `matriculas` VALUES (1519, 290, 12, 12, 187, 1, 1, 'Mañana', '2026-01-15', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1520, 291, 10, 10, 156, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1521, 291, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1522, 291, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 19, 0, 'Fue promovido al grado 11-3 por comision de evaluacion y promoción anticipada de marzo 2026', NULL, NULL);
INSERT INTO `matriculas` VALUES (1523, 292, 11, 11, 157, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1524, 292, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 20, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1525, 293, 12, 12, 187, 1, 4, 'Mañana', '2026-01-23', 'nuevo', 'activo', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1526, 294, 11, 11, 157, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1527, 294, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 21, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1528, 295, 9, 9, 155, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1529, 295, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1530, 295, 11, 11, 191, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1531, 295, 12, 12, 187, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 30, 0, 'Fue promovido al grado 11-3 por comision de evaluacion y promoción anticipada de marzo 2026', NULL, NULL);
INSERT INTO `matriculas` VALUES (1532, 296, 11, 11, 157, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1533, 296, 12, 12, 187, 1, 4, 'Mañana', '2024-12-03', 'antiguo', 'activo', NULL, NULL, NULL, 22, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1534, 297, 2, 2, 192, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1535, 297, 3, 3, 32, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1536, 297, 4, 4, 70, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1537, 297, 5, 5, 71, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1538, 297, 6, 6, 72, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1539, 297, 7, 7, 73, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1540, 297, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1541, 297, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1542, 297, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1543, 297, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1544, 297, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 23, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1545, 298, 11, 11, 157, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1546, 298, 12, 12, 187, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 1, 0, 'Retirado 2026-02-10 se entrega documentos - cambio de domicilio - Estudiante Venezolano', NULL, NULL);
INSERT INTO `matriculas` VALUES (1547, 299, 10, 10, 156, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1548, 299, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1549, 299, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 5, 0, 'Retirado 2026-04-22 se entrega documentos - cambio de domicilio', NULL, NULL);
INSERT INTO `matriculas` VALUES (1550, 300, 11, 11, 157, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1551, 300, 12, 12, 187, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'cancelado', NULL, NULL, NULL, 12, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1552, 301, 9, 9, 155, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1553, 301, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1554, 301, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1555, 301, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'cancelado', NULL, NULL, NULL, 16, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1556, 302, 9, 9, 98, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1557, 302, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1558, 302, 11, 11, 157, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1559, 302, 12, 12, 187, 1, 3, 'Mañana', '2025-12-05', 'antiguo', 'cancelado', NULL, NULL, NULL, 18, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1560, 303, 12, 12, 187, 1, 4, 'Mañana', '2026-01-28', 'nuevo', 'retirado', NULL, NULL, NULL, NULL, 0, '2026-05-28 el señor padre realiza retiro orque el estudiante no desea seguir estudiando - 2026-05-25 Retirado por deserción - Reporta la coordinadora - llamé al padre de familia estaba viajando y el joven se quedaba con la mamá, pero no había compromiso de la madre al inicio del año falto demaciado por que se encontraba enfermo venía un dia faltaba cuatro pero no volvió desde principio de abril.', NULL, NULL);
INSERT INTO `matriculas` VALUES (1561, 304, 7, 7, 73, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1562, 304, 8, 8, 57, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1563, 304, 9, 9, 74, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1564, 304, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1565, 304, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1566, 304, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 1, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1567, 305, 10, 10, 156, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1568, 305, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1569, 305, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 2, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1570, 306, 9, 9, 74, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1571, 306, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1572, 306, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1573, 306, 12, 12, 193, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 3, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1574, 307, 5, 5, 54, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1575, 307, 6, 6, 55, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1576, 307, 7, 7, 15, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1577, 307, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1578, 307, 9, 9, 155, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1579, 307, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1580, 307, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1581, 307, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 4, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1582, 308, 8, 9, 180, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1583, 308, 9, 10, 174, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1584, 308, 10, 10, 156, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1585, 308, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1586, 308, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 5, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1587, 309, 9, 9, 155, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1588, 309, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1589, 309, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1590, 309, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 6, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1591, 310, 11, 11, 145, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1592, 310, 12, 12, 193, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 7, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1593, 311, 2, 4, 194, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1594, 311, 3, 5, 195, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1595, 311, 4, 6, 196, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1596, 311, 5, 7, 197, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1597, 311, 6, 8, 198, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1598, 311, 7, 8, 110, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1599, 311, 8, 9, 111, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1600, 311, 9, 10, 112, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1601, 311, 10, 11, 199, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1602, 311, 11, 11, 145, 1, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1603, 311, 12, 12, 193, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 8, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1604, 312, 1, 1, 144, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1605, 312, 2, 2, 51, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1606, 312, 3, 3, 52, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1607, 312, 4, 4, 53, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1608, 312, 5, 5, 54, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1609, 312, 6, 6, 55, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1610, 312, 7, 7, 66, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1611, 312, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1612, 312, 9, 9, 155, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1613, 312, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1614, 312, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1615, 312, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 9, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1616, 313, 2, 4, 200, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1617, 313, 3, 5, 201, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1618, 313, 4, 5, 127, 4, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1619, 313, 5, 6, 128, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1620, 313, 6, 7, 109, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1621, 313, 7, 7, 66, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1622, 313, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1623, 313, 9, 9, 155, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1624, 313, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1625, 313, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1626, 313, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 11, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1627, 314, 10, 10, 113, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1628, 314, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1629, 314, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 12, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1630, 315, 6, 6, 55, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1631, 315, 7, 7, 66, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1632, 315, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1633, 315, 9, 9, 155, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1634, 315, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1635, 315, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1636, 315, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 13, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1637, 316, 10, 10, 156, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1638, 316, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1639, 316, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 14, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1640, 317, 11, 11, 145, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1641, 317, 12, 12, 193, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 15, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1642, 318, 11, 11, 145, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1643, 318, 12, 12, 193, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 16, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1644, 319, 5, 5, 28, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1645, 319, 6, 6, 72, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1646, 319, 7, 7, 73, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1647, 319, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1648, 319, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1649, 319, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1650, 319, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1651, 319, 12, 12, 193, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 17, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1652, 320, 10, 10, 156, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1653, 320, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1654, 320, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 18, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1655, 321, 11, 11, 145, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1656, 321, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 19, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1657, 322, 6, 6, 72, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1658, 322, 7, 7, 73, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1659, 322, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1660, 322, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1661, 322, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1662, 322, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1663, 322, 12, 12, 193, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 20, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1664, 323, 11, 11, 145, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1665, 323, 12, 12, 193, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 21, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1666, 324, 1, 1, 202, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1667, 324, 2, 2, 69, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1668, 324, 3, 3, 32, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1669, 324, 4, 4, 70, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1670, 324, 5, 5, 71, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1671, 324, 6, 6, 72, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1672, 324, 7, 7, 73, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1673, 324, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1674, 324, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1675, 324, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1676, 324, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1677, 324, 12, 12, 193, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 23, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1678, 325, 8, 9, 136, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1679, 325, 9, 9, 137, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1680, 325, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1681, 325, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1682, 325, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 24, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1683, 326, 10, 10, 113, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1684, 326, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1685, 326, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 25, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1686, 327, 10, 11, 203, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1687, 327, 11, 11, 145, 1, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1688, 327, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 26, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1689, 328, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1690, 328, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 23, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1691, 329, 3, 3, 52, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1692, 329, 4, 4, 53, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1693, 329, 5, 5, 54, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1694, 329, 6, 6, 55, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1695, 329, 7, 7, 30, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1696, 329, 8, 8, 97, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1697, 329, 9, 9, 98, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1698, 329, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1699, 329, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1700, 329, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 27, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1701, 330, 9, 9, 98, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1702, 330, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1703, 330, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1704, 330, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 28, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1705, 331, 9, 9, 98, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1706, 331, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1707, 331, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1708, 331, 12, 12, 193, 1, 4, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 31, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1709, 332, 10, 10, 99, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1710, 332, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1711, 332, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 10, 0, 'Retirado 2026-02-26 se entrega documentos - Cambio de I.E.', NULL, NULL);
INSERT INTO `matriculas` VALUES (1712, 333, 10, 10, 99, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1713, 333, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1714, 333, 12, 12, 193, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 32, 0, 'Retirado 2026-01-21 se entrega documentos - Cambio de I.E.', NULL, NULL);
INSERT INTO `matriculas` VALUES (1715, 334, 3, 3, 62, 3, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1716, 334, 4, 4, 63, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1717, 334, 5, 5, 64, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1718, 334, 6, 6, 65, 3, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1719, 334, 7, 7, 82, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1720, 334, 8, 8, 83, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1721, 334, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1722, 334, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1723, 334, 11, 11, 145, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1724, 334, 12, 12, 193, 1, NULL, 'Mañana', NULL, 'antiguo', 'cancelado', NULL, NULL, NULL, 29, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1725, 335, 3, 3, 75, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1726, 335, 4, 4, 76, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1727, 335, 5, 5, 77, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1728, 335, 6, 6, 78, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1729, 335, 7, 7, 79, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1730, 335, 8, 8, 131, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1731, 335, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1732, 335, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1733, 335, 11, 11, 191, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1734, 335, 12, 12, 204, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 1, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1735, 336, 3, 4, 151, 4, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1736, 336, 4, 5, 152, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1737, 336, 5, 6, 182, 4, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1738, 336, 6, 7, 183, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1739, 336, 7, 7, 79, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1740, 336, 8, 8, 131, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1741, 336, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1742, 336, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1743, 336, 11, 11, 191, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1744, 336, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 2, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1745, 337, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1746, 337, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 3, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1747, 338, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1748, 338, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 4, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1749, 339, 8, 8, 83, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1750, 339, 9, 9, 158, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1751, 339, 10, 10, 159, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1752, 339, 11, 11, 191, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1753, 339, 12, 12, 204, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 5, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1754, 340, 8, 9, 169, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1755, 340, 9, 10, 205, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1756, 340, 10, 11, 206, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1757, 340, 11, 11, 191, 1, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1758, 340, 12, 12, 204, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 6, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1759, 341, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1760, 341, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 7, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1761, 342, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1762, 342, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 8, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1763, 343, 1, 2, 207, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1764, 343, 2, 3, 208, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1765, 343, 3, 4, 209, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1766, 343, 4, 5, 12, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1767, 343, 5, 6, 13, 5, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1768, 343, 6, 7, 14, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1769, 343, 7, 7, 15, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1770, 343, 8, 8, 16, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1771, 343, 9, 9, 155, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1772, 343, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1773, 343, 11, 11, 191, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1774, 343, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 9, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1775, 344, 9, 9, 98, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1776, 344, 10, 10, 99, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1777, 344, 11, 11, 191, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1778, 344, 12, 12, 204, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 10, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1779, 345, 6, 7, 171, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1780, 345, 7, 8, 172, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1781, 345, 8, 9, 173, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1782, 345, 9, 10, 174, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1783, 345, 10, 11, 203, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1784, 345, 11, 11, 191, 1, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1785, 345, 12, 12, 204, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 11, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1786, 346, 8, 9, 180, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1787, 346, 9, 10, 205, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1788, 346, 10, 11, 206, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1789, 346, 11, 11, 191, 1, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1790, 346, 12, 12, 204, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 12, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1791, 347, 8, 9, 180, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1792, 347, 9, 10, 210, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1793, 347, 10, 11, 203, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1794, 347, 11, 11, 191, 1, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1795, 347, 12, 12, 204, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 13, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1796, 348, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1797, 348, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 14, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1798, 349, 10, 11, 203, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1799, 349, 11, 11, 191, 1, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1800, 349, 12, 12, 204, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 15, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1801, 350, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1802, 350, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 16, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1803, 351, 10, 10, 156, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1804, 351, 11, 11, 191, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1805, 351, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 17, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1806, 352, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1807, 352, 12, 12, 204, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 18, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1808, 353, 6, 6, 78, 5, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1809, 353, 7, 7, 79, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1810, 353, 8, 8, 131, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1811, 353, 9, 9, 137, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1812, 353, 10, 10, 113, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1813, 353, 11, 11, 191, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1814, 353, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 19, 0, 'Estudiante Venezolano', NULL, NULL);
INSERT INTO `matriculas` VALUES (1815, 354, 10, 10, 156, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1816, 354, 11, 11, 191, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1817, 354, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 21, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1818, 355, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1819, 355, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 22, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1820, 356, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1821, 356, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 24, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1822, 357, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1823, 357, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 25, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1824, 358, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1825, 358, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 27, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1826, 359, 10, 10, 113, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1827, 359, 11, 11, 191, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1828, 359, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 28, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1829, 360, 8, 10, 211, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1830, 360, 9, 10, 205, 2, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1831, 360, 10, 11, 206, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1832, 360, 11, 11, 191, 1, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1833, 360, 12, 12, 204, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'activo', NULL, NULL, NULL, 29, 0, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1834, 361, 9, 9, 155, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1835, 361, 10, 10, 156, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1836, 361, 11, 11, 191, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1837, 361, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'retirado', NULL, NULL, NULL, 20, 0, 'Retirado 2026-02-10 se entregó documentos en diciembre de 2025', NULL, NULL);
INSERT INTO `matriculas` VALUES (1838, 362, 11, 11, 191, 1, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1839, 362, 12, 12, 204, 1, 1, 'Mañana', '2025-12-05', 'antiguo', 'cancelado', NULL, NULL, NULL, 26, 0, 'Solicita cambio a la jornada Sabatino 2026', NULL, NULL);
INSERT INTO `matriculas` VALUES (1840, 363, 6, 7, 171, 2, NULL, NULL, NULL, 'nuevo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1841, 363, 7, 8, 172, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1842, 363, 8, 9, 173, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1843, 363, 9, 10, 112, 2, NULL, NULL, NULL, 'antiguo', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1844, 363, 10, 11, 162, 1, NULL, NULL, NULL, 'antiguo', 'activo', 'reprobado', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1845, 363, 11, 11, 191, 1, NULL, NULL, NULL, 'repitente', 'activo', 'promovido', NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO `matriculas` VALUES (1846, 363, 12, 12, 204, 1, 2, 'Mañana', '2025-12-05', 'antiguo', 'cancelado', NULL, NULL, NULL, 31, 0, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for migrations
-- ----------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of migrations
-- ----------------------------
INSERT INTO `migrations` VALUES (1, '0001_01_01_000000_create_users_table', 1);
INSERT INTO `migrations` VALUES (2, '0001_01_01_000001_create_cache_table', 1);
INSERT INTO `migrations` VALUES (3, '0001_01_01_000002_create_jobs_table', 1);

-- ----------------------------
-- Table structure for modalidades
-- ----------------------------
DROP TABLE IF EXISTS `modalidades`;
CREATE TABLE `modalidades`  (
  `id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `nombre`(`nombre` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of modalidades
-- ----------------------------
INSERT INTO `modalidades` VALUES (1, 'Asist. Admin.', 1);
INSERT INTO `modalidades` VALUES (2, 'Ebanistería', 1);
INSERT INTO `modalidades` VALUES (3, 'Electricidad', 1);
INSERT INTO `modalidades` VALUES (4, 'Electrónica', 1);

-- ----------------------------
-- Table structure for parentescos
-- ----------------------------
DROP TABLE IF EXISTS `parentescos`;
CREATE TABLE `parentescos`  (
  `id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `nombre`(`nombre` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of parentescos
-- ----------------------------
INSERT INTO `parentescos` VALUES (4, 'Abuela(o)');
INSERT INTO `parentescos` VALUES (3, 'Hermana(o)');
INSERT INTO `parentescos` VALUES (6, 'Madrastra');
INSERT INTO `parentescos` VALUES (1, 'Madre');
INSERT INTO `parentescos` VALUES (9, 'Otro');
INSERT INTO `parentescos` VALUES (7, 'Padrastro');
INSERT INTO `parentescos` VALUES (2, 'Padre');
INSERT INTO `parentescos` VALUES (8, 'Prima(o)');
INSERT INTO `parentescos` VALUES (5, 'Tia(o)');

-- ----------------------------
-- Table structure for password_reset_tokens
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens`  (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of password_reset_tokens
-- ----------------------------

-- ----------------------------
-- Table structure for periodos
-- ----------------------------
DROP TABLE IF EXISTS `periodos`;
CREATE TABLE `periodos`  (
  `id` smallint UNSIGNED NOT NULL AUTO_INCREMENT,
  `anio_lectivo_id` smallint UNSIGNED NOT NULL,
  `numero` tinyint UNSIGNED NOT NULL,
  `nombre` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `fecha_inicio` date NULL DEFAULT NULL,
  `fecha_fin` date NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_periodo`(`anio_lectivo_id` ASC, `numero` ASC) USING BTREE,
  CONSTRAINT `fk_periodo_anio` FOREIGN KEY (`anio_lectivo_id`) REFERENCES `anios_lectivos` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 64 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of periodos
-- ----------------------------
INSERT INTO `periodos` VALUES (1, 1, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (2, 1, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (3, 1, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (4, 1, 4, 'Periodo 4', NULL, NULL);
INSERT INTO `periodos` VALUES (5, 2, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (6, 2, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (7, 2, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (8, 2, 4, 'Periodo 4', NULL, NULL);
INSERT INTO `periodos` VALUES (9, 3, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (10, 3, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (11, 3, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (12, 3, 4, 'Periodo 4', NULL, NULL);
INSERT INTO `periodos` VALUES (13, 4, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (14, 4, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (15, 4, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (16, 4, 4, 'Periodo 4', NULL, NULL);
INSERT INTO `periodos` VALUES (17, 5, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (18, 5, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (19, 5, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (20, 5, 4, 'Periodo 4', NULL, NULL);
INSERT INTO `periodos` VALUES (21, 6, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (22, 6, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (23, 6, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (24, 6, 4, 'Periodo 4', NULL, NULL);
INSERT INTO `periodos` VALUES (25, 7, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (26, 7, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (27, 7, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (28, 7, 4, 'Periodo 4', NULL, NULL);
INSERT INTO `periodos` VALUES (29, 8, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (30, 8, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (31, 8, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (32, 8, 4, 'Periodo 4', NULL, NULL);
INSERT INTO `periodos` VALUES (33, 9, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (34, 9, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (35, 9, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (36, 9, 4, 'Periodo 4', NULL, NULL);
INSERT INTO `periodos` VALUES (37, 10, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (38, 10, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (39, 10, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (40, 10, 4, 'Periodo 4', NULL, NULL);
INSERT INTO `periodos` VALUES (41, 11, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (42, 11, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (43, 11, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (44, 11, 4, 'Periodo 4', NULL, NULL);
INSERT INTO `periodos` VALUES (45, 12, 1, 'Periodo 1', NULL, NULL);
INSERT INTO `periodos` VALUES (46, 12, 2, 'Periodo 2', NULL, NULL);
INSERT INTO `periodos` VALUES (47, 12, 3, 'Periodo 3', NULL, NULL);
INSERT INTO `periodos` VALUES (48, 12, 4, 'Periodo 4', NULL, NULL);

-- ----------------------------
-- Table structure for sedes
-- ----------------------------
DROP TABLE IF EXISTS `sedes`;
CREATE TABLE `sedes`  (
  `id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT,
  `institucion_id` tinyint UNSIGNED NOT NULL,
  `codigo` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT 0,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_sedes_codigo`(`institucion_id` ASC, `codigo` ASC) USING BTREE,
  CONSTRAINT `fk_sedes_inst` FOREIGN KEY (`institucion_id`) REFERENCES `instituciones` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sedes
-- ----------------------------
INSERT INTO `sedes` VALUES (1, 1, 'P', 'Principal', NULL, 1, 1, NULL, NULL);
INSERT INTO `sedes` VALUES (2, 1, 'LF', 'Los Farallones', NULL, 0, 1, NULL, NULL);
INSERT INTO `sedes` VALUES (3, 1, 'CP', 'Central Provivienda', NULL, 0, 1, NULL, NULL);
INSERT INTO `sedes` VALUES (4, 1, 'RP', 'Rafael Pombo', NULL, 0, 1, NULL, NULL);
INSERT INTO `sedes` VALUES (5, 1, 'PT', 'Purificación Trujillo', NULL, 0, 1, NULL, NULL);

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions`  (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sessions_user_id_index`(`user_id` ASC) USING BTREE,
  INDEX `sessions_last_activity_index`(`last_activity` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sessions
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_email_unique`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------

-- ----------------------------
-- View structure for v_consolidado_grupos
-- ----------------------------
DROP VIEW IF EXISTS `v_consolidado_grupos`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_consolidado_grupos` AS SELECT al.anio, s.nombre AS sede, g.codigo AS grupo, g.jornada,
       g.cupos_proyectados,
       SUM(m.condicion IN ('antiguo','repitente') AND m.estado = 'activo') AS antiguos,
       SUM(m.condicion = 'nuevo' AND m.estado = 'activo')                  AS nuevos,
       SUM(m.estado = 'activo')                                            AS matriculados,
       g.cupos_proyectados - SUM(m.estado = 'activo')                      AS cupos_disponibles
FROM grupos g
JOIN anios_lectivos al ON al.id = g.anio_lectivo_id
JOIN sedes          s  ON s.id  = g.sede_id
LEFT JOIN matriculas m ON m.grupo_id = g.id
GROUP BY al.anio, s.nombre, g.id, g.codigo, g.jornada, g.cupos_proyectados ;

-- ----------------------------
-- View structure for v_estudiantes_actuales
-- ----------------------------
DROP VIEW IF EXISTS `v_estudiantes_actuales`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_estudiantes_actuales` AS SELECT e.id, e.numero_documento, e.nombre_completo, e.genero,
       e.fecha_nacimiento,
       TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) AS edad,
       al.anio, s.nombre AS sede, g.codigo AS grupo, m.jornada,
       mo.nombre AS modalidad, m.condicion, m.estado
FROM matriculas m
JOIN estudiantes    e  ON e.id  = m.estudiante_id
JOIN anios_lectivos al ON al.id = m.anio_lectivo_id
JOIN sedes          s  ON s.id  = m.sede_id
LEFT JOIN grupos      g  ON g.id  = m.grupo_id
LEFT JOIN modalidades mo ON mo.id = m.modalidad_id
WHERE al.estado = 'activo' ;

-- ----------------------------
-- View structure for v_total_modalidades
-- ----------------------------
DROP VIEW IF EXISTS `v_total_modalidades`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_total_modalidades` AS SELECT al.anio, g.codigo AS grupo, mo.nombre AS modalidad, COUNT(*) AS total
FROM matriculas m
JOIN anios_lectivos al ON al.id = m.anio_lectivo_id
JOIN modalidades    mo ON mo.id = m.modalidad_id
LEFT JOIN grupos     g ON g.id  = m.grupo_id
WHERE m.estado = 'activo'
GROUP BY al.anio, g.codigo, mo.nombre ;

SET FOREIGN_KEY_CHECKS = 1;
