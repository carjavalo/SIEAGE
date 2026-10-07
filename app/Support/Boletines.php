<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Boletines de transición («Informe escolar de valoración»): qué grupos los
 * tienen, qué periodos se ofrecen y los datos de cada hoja. El docente solo
 * escribe el texto; el encabezado, los propósitos y las firmas salen de aquí.
 */
final class Boletines
{
    /** El grado que tiene boletines de texto. */
    public const GRADO = 0;

    private const ORDINALES = [1 => 'PRIMER', 2 => 'SEGUNDO', 3 => 'TERCER', 4 => 'CUARTO', 5 => 'QUINTO', 6 => 'SEXTO'];

    /**
     * En 2026 transición tiene dos periodos de 50 % (los otros del año quedan sin
     * porcentaje y no se ofrecen); y la dirección de la sede Rafael Pombo, como sale en
     * el encabezado de sus boletines. Solo llena lo que falta.
     */
    public static function datosIniciales(): void
    {
        $anio = DB::table('anios_lectivos')->where('anio', 2026)->value('id');
        if ($anio) {
            DB::table('periodos')->where('anio_lectivo_id', $anio)->whereIn('numero', [1, 2])->whereNull('porcentaje')->update(['porcentaje' => 50]);
        }
        DB::table('sedes')->where('codigo', 'RP')->whereNull('direccion')->update(['direccion' => 'CR 7R BIS Nº 72-124 BR ALFONSO LOPEZ']);
    }

    /** «PRIMER PERIODO 50%». */
    public static function etiquetaPeriodo(int $numero, ?int $porcentaje): string
    {
        $nombre = (self::ORDINALES[$numero] ?? "{$numero}.º").' PERIODO';

        return $porcentaje ? "{$nombre} {$porcentaje}%" : $nombre;
    }

    /** El año en curso (el único con boletines por escribir). */
    public static function anio(): ?object
    {
        return DB::table('anios_lectivos')->where('estado', 'activo')->orderByDesc('anio')->first(['id', 'anio']);
    }

    /**
     * Los periodos del año que llevan boletín: los que tienen porcentaje. Si
     * ninguno lo tiene (un año sin configurar), todos.
     *
     * @return Collection<int, object{id: int, numero: int, porcentaje: ?int, etiqueta: string}>
     */
    public static function periodos(int $anioId): Collection
    {
        $todos = DB::table('periodos')->where('anio_lectivo_id', $anioId)->orderBy('numero')->get(['id', 'numero', 'porcentaje', 'fecha_inicio', 'fecha_fin']);
        $conPorcentaje = $todos->whereNotNull('porcentaje')->values();

        return ($conPorcentaje->isEmpty() ? $todos : $conPorcentaje)->map(fn ($p) => (object) [
            'id' => (int) $p->id,
            'numero' => (int) $p->numero,
            'porcentaje' => $p->porcentaje === null ? null : (int) $p->porcentaje,
            'etiqueta' => self::etiquetaPeriodo((int) $p->numero, $p->porcentaje === null ? null : (int) $p->porcentaje),
            'fecha_inicio' => $p->fecha_inicio,
            'fecha_fin' => $p->fecha_fin,
        ]);
    }

    /** El periodo que va (por fechas) o, si no hay fechas, el primero. */
    public static function periodoActual(Collection $periodos): ?object
    {
        $hoy = now()->toDateString();

        return $periodos->first(fn ($p) => $p->fecha_inicio && $p->fecha_fin && $p->fecha_inicio <= $hoy && $hoy <= $p->fecha_fin)
            ?? $periodos->first();
    }

    /**
     * Los grupos de transición del año que el usuario puede ver, con cuántos
     * estudiantes activos tienen.
     *
     * @return Collection<int, object>
     */
    public static function grupos(?User $user, int $anioId): Collection
    {
        return DB::table('grupos as g')
            ->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->join('sedes as s', 's.id', '=', 'g.sede_id')
            ->where('g.anio_lectivo_id', $anioId)
            ->where('gr.numero', self::GRADO)
            ->tap(fn ($q) => Alcance::filtrar($q, $user, 'g.sede_id', 'g.grado_id'))
            ->orderByDesc('s.es_principal')
            ->orderBy('s.nombre')
            ->orderBy('g.codigo')
            ->get(['g.id', 'g.codigo', 'g.jornada', 's.id as sede_id', 's.nombre as sede', 's.codigo as sede_codigo'])
            ->map(function ($g) {
                $g->activos = DB::table('matriculas')->where('grupo_id', $g->id)->where('estado', 'activo')->count();

                return $g;
            });
    }

    /**
     * Lo que va en la hoja de un grupo, igual para todos sus estudiantes:
     * sede, dirección, curso, jornada y quienes firman.
     */
    public static function datosGrupo(int $grupoId): ?object
    {
        $g = DB::table('grupos as g')
            ->join('sedes as s', 's.id', '=', 'g.sede_id')
            ->join('anios_lectivos as al', 'al.id', '=', 'g.anio_lectivo_id')
            ->leftJoin('docentes as d', 'd.id', '=', 'g.director_id')
            ->leftJoin('users as c', 'c.id', '=', 's.coordinador_id')
            ->where('g.id', $grupoId)
            ->first([
                'g.id', 'g.codigo', 'g.jornada', 'g.jornada_boletin', 'g.sede_id', 'al.anio',
                's.nombre as sede', 's.direccion', 'd.user_id as director_id', 'd.nombre_completo as director',
                's.coordinador_id', 'c.name as coordinador',
            ]);
        if (! $g) {
            return null;
        }

        return (object) [
            'id' => (int) $g->id,
            'sede_id' => (int) $g->sede_id,
            'anio' => (int) $g->anio,
            'sede' => mb_strtoupper($g->sede),
            // «CR 7R BIS Nº 72-124 BR ALFONSO LOPEZ - VALLE - CALI»
            'direccion' => implode(' - ', array_filter([$g->direccion ? mb_strtoupper(trim($g->direccion)) : null, 'VALLE', 'CALI'])),
            'curso' => str_replace('-', ' - ', $g->codigo),
            'codigo' => $g->codigo,
            'jornada' => $g->jornada_boletin ? mb_strtoupper(trim($g->jornada_boletin)) : mb_strtoupper($g->jornada),
            'jornada_boletin' => $g->jornada_boletin,
            'jornada_grupo' => $g->jornada,
            'director' => $g->director ? mb_strtoupper(trim($g->director)) : null,
            'director_id' => $g->director_id === null ? null : (int) $g->director_id,
            'coordinador' => $g->coordinador ? mb_strtoupper(trim($g->coordinador)) : null,
            'coordinador_id' => $g->coordinador_id === null ? null : (int) $g->coordinador_id,
        ];
    }

    /**
     * Los estudiantes activos del grupo con su texto del periodo, en orden alfabético.
     *
     * @return Collection<int, object>
     */
    public static function estudiantes(int $grupoId, int $periodoId): Collection
    {
        return DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->leftJoin('modalidades as mo', 'mo.id', '=', 'm.modalidad_id')
            ->leftJoin('boletines as b', fn ($j) => $j->on('b.matricula_id', '=', 'm.id')->where('b.periodo_id', $periodoId))
            ->leftJoin('users as u', 'u.id', '=', 'b.actualizado_por')
            ->where('m.grupo_id', $grupoId)
            ->where('m.estado', 'activo')
            ->whereNull('e.deleted_at')
            ->orderBy('e.nombre_completo')
            ->get([
                'm.id as matricula_id', 'e.id as estudiante_id', 'e.nombre_completo',
                'e.primer_nombre', 'e.segundo_nombre', 'e.primer_apellido', 'e.segundo_apellido',
                'mo.nombre as modalidad', 'b.texto', 'b.revision', 'b.updated_at as actualizado_en', 'u.name as actualizado_por',
            ])
            ->map(fn ($e) => self::estudiante($e));
    }

    /** @return object{matricula_id: int, estudiante_id: int, nombre: string, apellidos_nombres: string, nombres_apellidos: string, modalidad: string, texto: string, version: ?string, actualizado_en: ?string, actualizado_por: ?string} */
    private static function estudiante(object $e): object
    {
        $nombres = trim(implode(' ', array_filter([$e->primer_nombre, $e->segundo_nombre, $e->primer_apellido, $e->segundo_apellido])));

        return (object) [
            'matricula_id' => (int) $e->matricula_id,
            'estudiante_id' => (int) $e->estudiante_id,
            'nombre' => $e->nombre_completo,
            // Arriba, en mayúsculas y con los apellidos primero; en el texto, como se le llama.
            'apellidos_nombres' => mb_strtoupper($e->nombre_completo),
            'nombres_apellidos' => $e->primer_nombre ? $nombres : $e->nombre_completo,
            'modalidad' => $e->modalidad ? mb_strtoupper($e->modalidad) : '',
            'texto' => (string) $e->texto,
            // Con qué versión se abrió: si al guardar ya hay otra, alguien lo cambió mientras tanto.
            'version' => $e->revision === null ? null : (string) $e->revision,
            'actualizado_en' => $e->actualizado_en,
            'actualizado_por' => $e->actualizado_por,
        ];
    }
}
