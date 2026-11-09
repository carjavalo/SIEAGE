<?php

namespace App\Support;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class Grupos
{
    /** El código de un grupo: «6-1»; en Transición (grado 0), «0-1», «0-2»… */
    public static function codigo(int $grado, int $numero): string
    {
        return "{$grado}-{$numero}";
    }

    /**
     * Grupos de un grado en un año lectivo con su sede, jornada, director,
     * cupos y cuántos estudiantes activos (y nuevos) tienen. Lo usan el
     * tablero de Estudiantes y el paso de elegir grupo al matricular.
     */
    public static function conOcupacion(?int $anioLectivoId, ?int $gradoId, int|array|null $sedeId = null): Collection
    {
        return self::consulta($anioLectivoId)
            ->where('g.grado_id', $gradoId)
            // Una sede, o la lista de sedes que puede ver el usuario (null = todas).
            ->when($sedeId !== null, fn ($q) => $q->whereIn('g.sede_id', (array) $sedeId))
            ->orderBy('g.numero')
            ->orderBy('s.codigo')
            ->get();
    }

    /**
     * Los grupos de la jornada sabatina (los ciclos, de todos los grados) de un año, con
     * la misma ocupación que conOcupacion. `$alcance` limita la consulta a lo que ve el
     * usuario (sede elegida, sedes y grados asignados). En orden de ciclo (por grado).
     */
    public static function sabatinos(?int $anioLectivoId, callable $alcance): Collection
    {
        return self::consulta($anioLectivoId)
            ->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->where('g.jornada', Ciclos::JORNADA)
            ->tap($alcance)
            ->groupBy('gr.numero')
            ->orderBy('gr.numero')
            ->orderBy('s.codigo')
            ->get();
    }

    private static function consulta(?int $anioLectivoId): Builder
    {
        return DB::table('grupos as g')
            ->join('sedes as s', 's.id', '=', 'g.sede_id')
            ->leftJoin('docentes as d', 'd.id', '=', 'g.director_id')
            ->leftJoin('matriculas as m', 'm.grupo_id', '=', 'g.id')
            ->where('g.anio_lectivo_id', $anioLectivoId)
            ->groupBy('g.id', 'g.codigo', 'g.numero', 'g.jornada', 'g.cupos_proyectados', 's.nombre', 's.codigo', 'd.nombre_completo')
            ->selectRaw("
                g.id, g.codigo, g.jornada, g.cupos_proyectados as cupos,
                s.nombre as sede, s.codigo as sede_codigo, d.nombre_completo as director,
                coalesce(sum(m.estado = 'activo'), 0) as activos,
                coalesce(sum(m.estado = 'activo' and m.condicion = 'nuevo'), 0) as nuevos
            ");
    }
}
