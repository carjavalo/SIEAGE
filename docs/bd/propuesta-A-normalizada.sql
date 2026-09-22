-- =====================================================================
-- SIEAGE - PROPUESTA A: "Núcleo académico normalizado"  (RECOMENDADA)
-- MySQL 8 / MariaDB 10.6+  ·  utf8mb4
-- Idea central: las 24 columnas "GRUPO 20XX" del Excel se convierten en
-- filas de `matriculas` (1 fila = 1 estudiante en 1 año lectivo).
-- =====================================================================
CREATE DATABASE IF NOT EXISTS sieage
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sieage;

-- ---------- 1. Institución y sedes -----------------------------------
CREATE TABLE instituciones (
  id              TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(150)  NOT NULL,
  nit             VARCHAR(20)   NULL,
  codigo_dane     VARCHAR(20)   NULL,
  resolucion      VARCHAR(150)  NULL,
  municipio       VARCHAR(80)   NULL,
  rector          VARCHAR(120)  NULL,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE sedes (
  id              TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institucion_id  TINYINT UNSIGNED NOT NULL,
  codigo          VARCHAR(5)    NOT NULL,          -- P, LF, CP, RP, PT
  nombre          VARCHAR(80)   NOT NULL,
  direccion       VARCHAR(150)  NULL,
  es_principal    BOOLEAN       NOT NULL DEFAULT 0,
  activa          BOOLEAN       NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_sedes_codigo (institucion_id, codigo),
  CONSTRAINT fk_sedes_inst FOREIGN KEY (institucion_id)
    REFERENCES instituciones(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------- 2. Calendario académico ----------------------------------
CREATE TABLE anios_lectivos (
  id            SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  anio          SMALLINT UNSIGNED NOT NULL UNIQUE,
  fecha_inicio  DATE NULL,
  fecha_fin     DATE NULL,
  estado        ENUM('planeado','activo','cerrado') NOT NULL DEFAULT 'planeado',
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE periodos (
  id                SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  anio_lectivo_id   SMALLINT UNSIGNED NOT NULL,
  numero            TINYINT UNSIGNED NOT NULL,     -- 1..10 (el Excel prevé 10)
  nombre            VARCHAR(30) NULL,
  fecha_inicio      DATE NULL,
  fecha_fin         DATE NULL,
  UNIQUE KEY uq_periodo (anio_lectivo_id, numero),
  CONSTRAINT fk_periodo_anio FOREIGN KEY (anio_lectivo_id)
    REFERENCES anios_lectivos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- 3. Catálogos académicos ----------------------------------
CREATE TABLE grados (
  id      TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero  TINYINT NOT NULL UNIQUE,                 -- 0 = Transición ... 11
  nombre  VARCHAR(20) NOT NULL,
  nivel   ENUM('preescolar','primaria','secundaria','media') NOT NULL
) ENGINE=InnoDB;

CREATE TABLE modalidades (
  id      TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(40) NOT NULL UNIQUE,             -- Asist. Admin., Ebanistería...
  activa  BOOLEAN NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE parentescos (
  id      TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE barrios (
  id      SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(80) NOT NULL UNIQUE,
  comuna  VARCHAR(20) NULL
) ENGINE=InnoDB;

-- ---------- 4. Docentes y grupos -------------------------------------
CREATE TABLE docentes (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NULL,            -- enlaza con `users` de Laravel
  documento       VARCHAR(20) NULL UNIQUE,
  nombre_completo VARCHAR(120) NOT NULL,
  email           VARCHAR(120) NULL,
  telefono        VARCHAR(25)  NULL,
  activo          BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE grupos (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  anio_lectivo_id    SMALLINT UNSIGNED NOT NULL,
  sede_id            TINYINT  UNSIGNED NOT NULL,
  grado_id           TINYINT  UNSIGNED NOT NULL,
  numero             TINYINT  UNSIGNED NOT NULL,   -- el "-3" de 10-3
  codigo             VARCHAR(10) NOT NULL,         -- "10-3" (desnormalizado a propósito)
  jornada            ENUM('Mañana','Tarde','Única','Noche') NOT NULL DEFAULT 'Mañana',
  director_id        INT UNSIGNED NULL,
  cupos_proyectados  SMALLINT UNSIGNED NOT NULL DEFAULT 34,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_grupo (anio_lectivo_id, sede_id, grado_id, numero, jornada),
  KEY ix_grupo_codigo (anio_lectivo_id, codigo),
  CONSTRAINT fk_grupo_anio  FOREIGN KEY (anio_lectivo_id) REFERENCES anios_lectivos(id),
  CONSTRAINT fk_grupo_sede  FOREIGN KEY (sede_id)  REFERENCES sedes(id),
  CONSTRAINT fk_grupo_grado FOREIGN KEY (grado_id) REFERENCES grados(id),
  CONSTRAINT fk_grupo_dir   FOREIGN KEY (director_id) REFERENCES docentes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- 5. Personas ----------------------------------------------
CREATE TABLE estudiantes (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo_documento    ENUM('R.C.','T.I.','C.C.','C.E.','P.P.T.','N.U.I.P.','N.E.S.') NOT NULL DEFAULT 'T.I.',
  numero_documento  VARCHAR(20) NOT NULL,
  nombre_completo   VARCHAR(150) NOT NULL,         -- tal como viene del Excel
  primer_apellido   VARCHAR(40) NULL,              -- opcional: se parte después
  segundo_apellido  VARCHAR(40) NULL,
  primer_nombre     VARCHAR(40) NULL,
  segundo_nombre    VARCHAR(40) NULL,
  fecha_nacimiento  DATE NULL,
  genero            ENUM('F','M','O') NULL,
  tiene_foto        BOOLEAN NOT NULL DEFAULT 0,
  foto_path         VARCHAR(255) NULL,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL, deleted_at TIMESTAMP NULL,
  UNIQUE KEY uq_est_doc (tipo_documento, numero_documento),
  KEY ix_est_nombre (nombre_completo)
) ENGINE=InnoDB;

CREATE TABLE acudientes (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo_documento    ENUM('C.C.','C.E.','P.P.T.','PAS','N.I.T.') NOT NULL DEFAULT 'C.C.',
  numero_documento  VARCHAR(20) NOT NULL,
  nombre_completo   VARCHAR(150) NOT NULL,
  telefono_fijo     VARCHAR(25) NULL,
  telefono_celular  VARCHAR(25) NULL,
  email             VARCHAR(120) NULL,
  direccion         VARCHAR(150) NULL,
  barrio_id         SMALLINT UNSIGNED NULL,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_acu_doc (tipo_documento, numero_documento),
  CONSTRAINT fk_acu_barrio FOREIGN KEY (barrio_id) REFERENCES barrios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Un acudiente puede tener varios hijos en la institución (caso real del Excel)
CREATE TABLE estudiante_acudiente (
  estudiante_id   INT UNSIGNED NOT NULL,
  acudiente_id    INT UNSIGNED NOT NULL,
  parentesco_id   TINYINT UNSIGNED NOT NULL,
  es_principal    BOOLEAN NOT NULL DEFAULT 1,
  vive_con        BOOLEAN NOT NULL DEFAULT 1,
  PRIMARY KEY (estudiante_id, acudiente_id),
  CONSTRAINT fk_ea_est  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  CONSTRAINT fk_ea_acu  FOREIGN KEY (acudiente_id)  REFERENCES acudientes(id)  ON DELETE CASCADE,
  CONSTRAINT fk_ea_par  FOREIGN KEY (parentesco_id) REFERENCES parentescos(id)
) ENGINE=InnoDB;

-- ---------- 6. EL CORAZÓN: historia académica ------------------------
-- 1 fila = 1 estudiante en 1 año lectivo. Reemplaza las 12 columnas dobles.
CREATE TABLE matriculas (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  estudiante_id     INT UNSIGNED NOT NULL,
  anio_lectivo_id   SMALLINT UNSIGNED NOT NULL,
  grado_id          TINYINT UNSIGNED NOT NULL,     -- siempre se conoce
  grupo_id          INT UNSIGNED NULL,             -- NULL si el Excel solo dice "10º"
  sede_id           TINYINT UNSIGNED NOT NULL,
  modalidad_id      TINYINT UNSIGNED NULL,         -- solo aplica en 10º y 11º
  jornada           ENUM('Mañana','Tarde','Única','Noche') NULL,
  fecha_matricula   DATE NULL,
  condicion         ENUM('nuevo','antiguo','repitente','trasladado') NOT NULL DEFAULT 'nuevo',
  estado            ENUM('activo','retirado','trasladado','graduado','cancelado') NOT NULL DEFAULT 'activo',
  resultado         ENUM('promovido','reprobado','pendiente','desertor') NULL,
  fecha_retiro      DATE NULL,
  motivo_retiro     VARCHAR(200) NULL,
  numero_orden      SMALLINT UNSIGNED NULL,        -- consecutivo dentro del grupo
  es_historico      BOOLEAN NOT NULL DEFAULT 0,    -- 1 = importado del Excel, sin soporte físico
  observaciones     TEXT NULL,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_matricula (estudiante_id, anio_lectivo_id),
  KEY ix_mat_grupo (grupo_id, estado),
  KEY ix_mat_anio_sede (anio_lectivo_id, sede_id, estado),
  CONSTRAINT fk_mat_est   FOREIGN KEY (estudiante_id)   REFERENCES estudiantes(id) ON DELETE CASCADE,
  CONSTRAINT fk_mat_anio  FOREIGN KEY (anio_lectivo_id) REFERENCES anios_lectivos(id),
  CONSTRAINT fk_mat_grado FOREIGN KEY (grado_id)        REFERENCES grados(id),
  CONSTRAINT fk_mat_grupo FOREIGN KEY (grupo_id)        REFERENCES grupos(id) ON DELETE SET NULL,
  CONSTRAINT fk_mat_sede  FOREIGN KEY (sede_id)         REFERENCES sedes(id),
  CONSTRAINT fk_mat_moda  FOREIGN KEY (modalidad_id)    REFERENCES modalidades(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- 7. Entrega de boletines ----------------------------------
CREATE TABLE entregas_boletin (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  matricula_id   INT UNSIGNED NOT NULL,
  periodo_id     SMALLINT UNSIGNED NOT NULL,
  estado         ENUM('entregado','pendiente','no_aplica') NOT NULL DEFAULT 'pendiente',
  fecha_entrega  DATE NULL,
  recibido_por   VARCHAR(120) NULL,
  UNIQUE KEY uq_entrega (matricula_id, periodo_id),
  CONSTRAINT fk_bol_mat FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
  CONSTRAINT fk_bol_per FOREIGN KEY (periodo_id)   REFERENCES periodos(id)
) ENGINE=InnoDB;

-- ---------- 8. Vistas equivalentes a las hojas de resumen ------------
CREATE OR REPLACE VIEW v_estudiantes_actuales AS
SELECT e.id, e.numero_documento, e.nombre_completo, e.genero,
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
WHERE al.estado = 'activo';

-- Equivale a la hoja CONSOLIDADO
CREATE OR REPLACE VIEW v_consolidado_grupos AS
SELECT al.anio, s.nombre AS sede, g.codigo AS grupo, g.jornada,
       g.cupos_proyectados,
       SUM(m.condicion IN ('antiguo','repitente') AND m.estado = 'activo') AS antiguos,
       SUM(m.condicion = 'nuevo' AND m.estado = 'activo')                  AS nuevos,
       SUM(m.estado = 'activo')                                            AS matriculados,
       g.cupos_proyectados - SUM(m.estado = 'activo')                      AS cupos_disponibles
FROM grupos g
JOIN anios_lectivos al ON al.id = g.anio_lectivo_id
JOIN sedes          s  ON s.id  = g.sede_id
LEFT JOIN matriculas m ON m.grupo_id = g.id
GROUP BY al.anio, s.nombre, g.id, g.codigo, g.jornada, g.cupos_proyectados;

-- Equivale a la hoja TOTAL MODALIDADES
CREATE OR REPLACE VIEW v_total_modalidades AS
SELECT al.anio, g.codigo AS grupo, mo.nombre AS modalidad, COUNT(*) AS total
FROM matriculas m
JOIN anios_lectivos al ON al.id = m.anio_lectivo_id
JOIN modalidades    mo ON mo.id = m.modalidad_id
LEFT JOIN grupos     g ON g.id  = m.grupo_id
WHERE m.estado = 'activo'
GROUP BY al.anio, g.codigo, mo.nombre;

-- ---------- 9. Datos semilla -----------------------------------------
INSERT INTO instituciones (nombre, nit, codigo_dane, resolucion, municipio) VALUES
  ('Institución Educativa Alfonso López Pumarejo','800.025.227-5','176001040101',
   'Resolución 1697 del 3 de septiembre del 2002','Santiago de Cali');

INSERT INTO sedes (institucion_id, codigo, nombre, es_principal) VALUES
  (1,'P' ,'Principal',1),
  (1,'LF','Los Farallones',0),
  (1,'CP','Central Provivienda',0),
  (1,'RP','Rafael Pombo',0),
  (1,'PT','Purificación Trujillo',0);

INSERT INTO grados (numero, nombre, nivel) VALUES
  (0,'Transición','preescolar'),
  (1,'Primero','primaria'),(2,'Segundo','primaria'),(3,'Tercero','primaria'),
  (4,'Cuarto','primaria'),(5,'Quinto','primaria'),
  (6,'Sexto','secundaria'),(7,'Séptimo','secundaria'),
  (8,'Octavo','secundaria'),(9,'Noveno','secundaria'),
  (10,'Décimo','media'),(11,'Undécimo','media');

INSERT INTO modalidades (nombre) VALUES
  ('Asist. Admin.'),('Ebanistería'),('Electricidad'),('Electrónica');

INSERT INTO parentescos (nombre) VALUES
  ('Madre'),('Padre'),('Hermana(o)'),('Abuela(o)'),('Tia(o)'),
  ('Madrastra'),('Padrastro'),('Prima(o)'),('Otro');

INSERT INTO anios_lectivos (anio, estado) VALUES
  (2015,'cerrado'),(2016,'cerrado'),(2017,'cerrado'),(2018,'cerrado'),
  (2019,'cerrado'),(2020,'cerrado'),(2021,'cerrado'),(2022,'cerrado'),
  (2023,'cerrado'),(2024,'cerrado'),(2025,'cerrado'),(2026,'activo');

INSERT INTO periodos (anio_lectivo_id, numero, nombre)
SELECT al.id, n.numero, CONCAT('Periodo ', n.numero)
FROM anios_lectivos al
CROSS JOIN (SELECT 1 AS numero UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) n;
