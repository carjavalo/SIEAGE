<?php

namespace App\Support;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class Grupos
{
    /**
     * Grupos de un grado en un año lectivo con su sede, jornada, director,
     * cupos y cuántos estudiantes activos (y nuevos) tienen. Lo usan el
     * tablero de Estudiantes y el paso de elegir grupo al matricular.
     */
    public static function conOcupacion(?int $anioLectivoId, ?int $gradoId): Collection
    {
        return DB::table('grupos as g')
            ->join('sedes as s', 's.id', '=', 'g.sede_id')
            ->leftJoin('docentes as d', 'd.id', '=', 'g.director_id')
            ->leftJoin('matriculas as m', 'm.grupo_id', '=', 'g.id')
            ->where('g.anio_lectivo_id', $anioLectivoId)
            ->where('g.grado_id', $gradoId)
            ->groupBy('g.id', 'g.codigo', 'g.numero', 'g.jornada', 'g.cupos_proyectados', 's.nombre', 's.codigo', 'd.nombre_completo')
            ->orderBy('g.numero')
            ->orderBy('s.codigo')
            ->selectRaw("
                g.id, g.codigo, g.jornada, g.cupos_proyectados as cupos,
                s.nombre as sede, s.codigo as sede_codigo, d.nombre_completo as director,
                coalesce(sum(m.estado = 'activo'), 0) as activos,
                coalesce(sum(m.estado = 'activo' and m.condicion = 'nuevo'), 0) as nuevos
            ")
            ->get();
    }
}
