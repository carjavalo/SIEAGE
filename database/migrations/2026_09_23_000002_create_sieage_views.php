<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Vistas de reporte (consolidado por grupo, estudiantes del año activo, totales por modalidad).
     * Usan funciones de MySQL, así que solo se crean en ese motor.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW v_consolidado_grupos AS
            SELECT al.anio, s.nombre AS sede, g.codigo AS grupo, g.jornada, g.cupos_proyectados,
                   SUM(m.condicion IN ('antiguo', 'repitente') AND m.estado = 'activo') AS antiguos,
                   SUM(m.condicion = 'nuevo' AND m.estado = 'activo') AS nuevos,
                   SUM(m.estado = 'activo') AS matriculados,
                   g.cupos_proyectados - SUM(m.estado = 'activo') AS cupos_disponibles
            FROM grupos g
            JOIN anios_lectivos al ON al.id = g.anio_lectivo_id
            JOIN sedes s ON s.id = g.sede_id
            LEFT JOIN matriculas m ON m.grupo_id = g.id
            GROUP BY al.anio, s.nombre, g.id, g.codigo, g.jornada, g.cupos_proyectados
            SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW v_estudiantes_actuales AS
            SELECT e.id, e.numero_documento, e.nombre_completo, e.genero, e.fecha_nacimiento,
                   TIMESTAMPDIFF(YEAR, e.fecha_nacimiento, CURDATE()) AS edad,
                   al.anio, s.nombre AS sede, g.codigo AS grupo, m.jornada,
                   mo.nombre AS modalidad, m.condicion, m.estado
            FROM matriculas m
            JOIN estudiantes e ON e.id = m.estudiante_id
            JOIN anios_lectivos al ON al.id = m.anio_lectivo_id
            JOIN sedes s ON s.id = m.sede_id
            LEFT JOIN grupos g ON g.id = m.grupo_id
            LEFT JOIN modalidades mo ON mo.id = m.modalidad_id
            WHERE al.estado = 'activo'
            SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW v_total_modalidades AS
            SELECT al.anio, g.codigo AS grupo, mo.nombre AS modalidad, COUNT(*) AS total
            FROM matriculas m
            JOIN anios_lectivos al ON al.id = m.anio_lectivo_id
            JOIN modalidades mo ON mo.id = m.modalidad_id
            LEFT JOIN grupos g ON g.id = m.grupo_id
            WHERE m.estado = 'activo'
            GROUP BY al.anio, g.codigo, mo.nombre
            SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_total_modalidades');
        DB::statement('DROP VIEW IF EXISTS v_estudiantes_actuales');
        DB::statement('DROP VIEW IF EXISTS v_consolidado_grupos');
    }
};
