<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * El «pulso» de los datos: dos firmas cortas que cambian cuando alguien más
 * toca algo. Cada página las recibe al cargarse y el navegador las vuelve a
 * pedir cada pocos segundos (GET /pulso); si difieren, trae lo nuevo sin que
 * nadie recargue. Es una sola consulta de conteos y fechas: no lee filas.
 *
 * No es un canal abierto (WebSocket): el servidor atiende una petición a la
 * vez, y una conexión permanente por usuario lo dejaría sin atender a nadie.
 */
final class Pulso
{
    /**
     * @return array{inscritos: string, datos: string, pendientes: int, ultima_inscripcion: int}
     */
    public static function firma(): array
    {
        $f = DB::selectOne("
            select
                (select count(*) from solicitudes_inscripcion) as si_n,
                (select count(*) from solicitudes_inscripcion where estado = 'pendiente') as si_p,
                (select coalesce(max(id), 0) from solicitudes_inscripcion) as si_u,
                (select max(updated_at) from solicitudes_inscripcion) as si_m,
                (select count(*) from padres) as pa_n,
                (select max(updated_at) from padres) as pa_m,
                (select count(*) from matriculas) as ma_n,
                (select max(updated_at) from matriculas) as ma_m,
                (select count(*) from estudiantes where deleted_at is null) as es_n,
                (select max(updated_at) from estudiantes) as es_m,
                (select max(updated_at) from acudientes) as ac_m,
                (select coalesce(max(id), 0) from cambios_ficha) as cf_u,
                (select coalesce(max(id), 0) from novedades_matricula) as nm_u,
                (select count(*) from grupos) as gr_n,
                (select max(updated_at) from grupos) as gr_m,
                (select count(*) from sedes) as se_n,
                (select max(updated_at) from sedes) as se_m
        ");
        $v = (array) $f;

        return [
            // Inscripciones: llegó una, se revisó, se le registraron los padres o los documentos.
            'inscritos' => substr(md5(implode('|', [$v['si_n'], $v['si_p'], $v['si_u'], $v['si_m'], $v['pa_n'], $v['pa_m']])), 0, 12),
            // Estudiantes, matrículas, acudientes, grupos y sedes.
            'datos' => substr(md5(implode('|', array_intersect_key($v, array_flip(
                ['ma_n', 'ma_m', 'es_n', 'es_m', 'ac_m', 'cf_u', 'nm_u', 'gr_n', 'gr_m', 'se_n', 'se_m']
            )))), 0, 12),
            'pendientes' => (int) $v['si_p'],
            'ultima_inscripcion' => (int) $v['si_u'],
        ];
    }
}
