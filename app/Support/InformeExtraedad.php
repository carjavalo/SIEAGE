<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Informe de extraedad: de los estudiantes activos del año (con los mismos filtros
 * del informe de matrícula), quiénes pasan la edad máxima aceptable de su grado
 * según la tabla de edades del colegio (ver App\Support\Edades), por grupo, y
 * cuántos hay en cada grado. La edad es al 31 de marzo del año lectivo.
 */
final class InformeExtraedad
{
    /**
     * @param  list<int>|null  $sedes  la sede elegida, o las que puede ver quien lo pide (null = todas)
     * @return array<string, mixed>|null null si el año no existe
     */
    public static function del(int $anio, ?array $sedes = null, ?int $gradoId = null, ?int $grupoId = null, ?User $alcance = null): ?array
    {
        $anioId = DB::table('anios_lectivos')->where('anio', $anio)->value('id');
        if (! $anioId) {
            return null;
        }

        $filas = DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->join('sedes as s', 's.id', '=', 'm.sede_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('estudiante_acudiente as ea', fn ($j) => $j->on('ea.estudiante_id', '=', 'e.id')->where('ea.es_principal', true))
            ->leftJoin('acudientes as a', 'a.id', '=', 'ea.acudiente_id')
            ->where('m.anio_lectivo_id', $anioId)
            ->where('m.estado', 'activo')
            ->whereNull('e.deleted_at')
            ->when($sedes !== null, fn ($q) => $q->whereIn('m.sede_id', $sedes))
            ->when($gradoId !== null, fn ($q) => $q->where('m.grado_id', $gradoId))
            ->when($grupoId !== null, fn ($q) => $q->where('m.grupo_id', $grupoId))
            ->when($alcance, fn ($q) => Alcance::filtrar($q, $alcance, 'm.sede_id', 'm.grado_id'))
            // Sede por sede (la principal primero), y en cada una por grado y grupo.
            ->orderByDesc('s.es_principal')->orderBy('s.nombre')->orderBy('gr.numero')->orderBy('g.numero')->orderBy('e.nombre_completo')
            ->get([
                'm.grupo_id', 'g.codigo as grupo', 'gr.numero as grado', 'gr.nombre as grado_nombre', 's.nombre as sede', 'm.jornada',
                'e.nombre_completo as nombre', 'e.tipo_documento', 'e.numero_documento', 'e.fecha_nacimiento',
                'a.nombre_completo as acudiente', DB::raw('coalesce(a.telefono_celular, a.telefono_fijo) as telefono'),
            ])
            ->map(function ($m) use ($anio) {
                $m->grado = (int) $m->grado;
                $m->edad = Edades::alInicioDelAnio($m->fecha_nacimiento, $anio);
                $m->estado = Edades::estado($m->edad, $m->grado);

                return $m;
            });

        $extra = $filas->where('estado', 'extraedad');

        return [
            'totales' => [
                'activos' => $filas->count(),
                'conEdad' => $filas->whereNotNull('estado')->count(),
                'adecuada' => $filas->where('estado', 'adecuada')->count(),
                'aceptable' => $filas->where('estado', 'aceptable')->count(),
                'extraedad' => $extra->count(),
                'sinFecha' => $filas->whereNull('estado')->count(),
            ],
            // La tabla de edades del colegio, con cuántos hay en cada grado.
            'grados' => $filas->groupBy('grado')->sortKeys()->map(fn (Collection $de, $numero) => [
                'numero' => (int) $numero,
                'nombre' => $de->first()->grado_nombre,
                'adecuada' => Edades::adecuada((int) $numero),
                'aceptableHasta' => Edades::aceptableHasta((int) $numero),
                'activos' => $de->count(),
                'aceptable' => $de->where('estado', 'aceptable')->count(),
                'extraedad' => $de->where('estado', 'extraedad')->count(),
            ])->values(),
            'grupos' => $extra->groupBy(fn ($m) => $m->grupo_id ?? "sin-{$m->grado}")->map(fn (Collection $de) => [
                'grupo' => $de->first()->grupo ?? $de->first()->grado_nombre,
                'grado' => $de->first()->grado_nombre,
                'sede' => $de->first()->sede,
                'jornada' => $de->first()->jornada,
                'adecuada' => Edades::adecuada($de->first()->grado),
                'aceptableHasta' => Edades::aceptableHasta($de->first()->grado),
                'estudiantes' => $de->map(fn ($m) => [
                    'nombre' => $m->nombre,
                    'documento' => trim("{$m->tipo_documento} {$m->numero_documento}"),
                    'nacimiento' => $m->fecha_nacimiento,
                    'edad' => $m->edad,
                    // Años por encima de la edad adecuada del grado.
                    'deMas' => $m->edad - Edades::adecuada($m->grado),
                    'acudiente' => $m->acudiente,
                    'telefono' => $m->telefono,
                ])->values(),
            ])->values(),
        ];
    }
}
