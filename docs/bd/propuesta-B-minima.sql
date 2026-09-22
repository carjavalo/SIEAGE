-- =====================================================================
-- SIEAGE - PROPUESTA B: "Mínima pragmática"
-- MySQL 8 / MariaDB 10.6+  ·  utf8mb4
-- 4 tablas. Sin tablas-catálogo: los valores fijos van como ENUM y el
-- grupo se guarda como texto ("10-3"), igual que en el Excel.
-- Objetivo: migrar rápido y tener algo funcionando esta semana.
-- =====================================================================
CREATE DATABASE IF NOT EXISTS sieage
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sieage;

-- ---------- 1. Acudientes (primero: los estudiantes lo referencian) ---
-- Va aparte y no embebido en `estudiantes` porque varios hermanos
-- comparten acudiente (en el Excel hay al menos 10 cédulas repetidas).
CREATE TABLE acudientes (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero_documento  VARCHAR(20)  NOT NULL UNIQUE,
  nombre_completo   VARCHAR(150) NOT NULL,
  telefono_fijo     VARCHAR(25)  NULL,
  telefono_celular  VARCHAR(25)  NULL,
  email             VARCHAR(120) NULL,
  direccion         VARCHAR(150) NULL,
  barrio            VARCHAR(80)  NULL,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

-- ---------- 2. Estudiantes -------------------------------------------
CREATE TABLE estudiantes (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo_documento    ENUM('R.C.','T.I.','C.C.','C.E.','P.P.T.','N.U.I.P.') NOT NULL DEFAULT 'T.I.',
  numero_documento  VARCHAR(20)  NOT NULL UNIQUE,
  nombre_completo   VARCHAR(150) NOT NULL,
  fecha_nacimiento  DATE NULL,
  genero            ENUM('F','M','O') NULL,
  tiene_foto        BOOLEAN NOT NULL DEFAULT 0,
  acudiente_id      INT UNSIGNED NULL,
  parentesco        ENUM('Madre','Padre','Hermana(o)','Abuela(o)','Tia(o)',
                         'Madrastra','Padrastro','Prima(o)','Otro') NULL,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL, deleted_at TIMESTAMP NULL,
  KEY ix_est_nombre (nombre_completo),
  CONSTRAINT fk_est_acu FOREIGN KEY (acudiente_id)
    REFERENCES acudientes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- 3. Matrículas: la historia año por año --------------------
-- Aquí caben tanto los años históricos importados del Excel (2015-2025)
-- como las matrículas reales que registre el sistema de ahora en adelante.
CREATE TABLE matriculas (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  estudiante_id     INT UNSIGNED NOT NULL,
  anio              SMALLINT UNSIGNED NOT NULL,       -- 2015 … 2026
  grado             TINYINT UNSIGNED NOT NULL,        -- 0 = Transición … 11
  grupo             VARCHAR(10) NULL,                 -- "10-3"; NULL si solo se sabe el grado
  sede              ENUM('Principal','Los Farallones','Central Provivienda',
                         'Rafael Pombo','Purificación Trujillo') NOT NULL,
  jornada           ENUM('Mañana','Tarde','Única','Noche') NULL,
  modalidad         ENUM('Asist. Admin.','Ebanistería','Electricidad','Electrónica') NULL,
  fecha_matricula   DATE NULL,
  condicion         ENUM('nuevo','antiguo','repitente','trasladado') NOT NULL DEFAULT 'nuevo',
  estado            ENUM('activo','retirado','trasladado','graduado') NOT NULL DEFAULT 'activo',
  es_historico      BOOLEAN NOT NULL DEFAULT 0,       -- 1 = viene del Excel
  boletines         JSON NULL,                        -- {"1":"entregado","2":"no_aplica",...}
  observaciones     TEXT NULL,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_matricula (estudiante_id, anio),
  KEY ix_mat_anio_grupo (anio, grupo, estado),
  CONSTRAINT fk_mat_est FOREIGN KEY (estudiante_id)
    REFERENCES estudiantes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- 4. Dirección de grupo (hoja DIRECTORES DE GRUPO) ----------
CREATE TABLE directores_grupo (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  anio      SMALLINT UNSIGNED NOT NULL,
  grupo     VARCHAR(10) NOT NULL,
  jornada   ENUM('Mañana','Tarde','Única','Noche') NOT NULL DEFAULT 'Mañana',
  docente   VARCHAR(120) NOT NULL,
  cupos_proyectados SMALLINT UNSIGNED NOT NULL DEFAULT 34,
  UNIQUE KEY uq_dir (anio, grupo, jornada)
) ENGINE=InnoDB;

-- ---------- Vistas ----------------------------------------------------
CREATE OR REPLACE VIEW v_estudiantes_2026 AS
SELECT e.id, e.numero_documento, e.nombre_completo, e.genero,
       TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) AS edad,
       m.grupo, m.sede, m.jornada, m.modalidad, m.condicion, m.estado,
       a.nombre_completo AS acudiente, a.telefono_celular, a.barrio
FROM matriculas m
JOIN estudiantes  e ON e.id = m.estudiante_id
LEFT JOIN acudientes a ON a.id = e.acudiente_id
WHERE m.anio = 2026;

CREATE OR REPLACE VIEW v_consolidado_grupos AS
SELECT m.anio, m.grupo, m.jornada,
       SUM(m.condicion IN ('antiguo','repitente') AND m.estado = 'activo') AS antiguos,
       SUM(m.condicion = 'nuevo' AND m.estado = 'activo')                  AS nuevos,
       SUM(m.estado = 'activo')                                            AS matriculados
FROM matriculas m
GROUP BY m.anio, m.grupo, m.jornada;

-- ---------- Consulta de "años cursados" de un estudiante --------------
-- Reemplaza las 24 columnas del Excel:
-- SELECT anio, grado, grupo, sede, condicion
-- FROM matriculas WHERE estudiante_id = ? ORDER BY anio;
