<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Datos de la constancia de matrícula (la hoja CONSTANCIA DE MATRICULA del Excel): el
 * estudiante y su matrícula, el acudiente principal y los grupos de los años anteriores.
 *
 * Sirve para una sola o para cientos a la vez (un grupo, un grado, una sede): son tres
 * consultas sin importar cuántas sean.
 */
class Constancias
{
    /** Años de historia que caben en la hoja (el Excel traía doce: 2015 a 2026). */
    public const AÑOS = 12;

    /**
     * @param  list<int>  $matriculas  en el orden en que deben salir
     * @return list<array<string, mixed>>
     */
    public static function de(array $matriculas): array
    {
        if (! $matriculas) {
            return [];
        }

        $filas = DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->join('sedes as s', 's.id', '=', 'm.sede_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('modalidades as mo', 'mo.id', '=', 'm.modalidad_id')
            ->whereIn('m.id', $matriculas)
            ->get([
                'm.id', 'm.estudiante_id', 'al.anio', 'm.fecha_matricula', 'gr.nombre as grado', 'g.codigo as grupo', 's.nombre as sede',
                'm.jornada', 'mo.nombre as modalidad', 'm.condicion', 'm.observaciones',
                'e.nombre_completo as nombre', 'e.tipo_documento', 'e.numero_documento',
            ])
            ->keyBy('id');

        $estudiantes = $filas->pluck('estudiante_id')->unique()->values();

        // El acudiente principal; si nadie está marcado como principal, el primero.
        $acudientes = DB::table('estudiante_acudiente as ea')
            ->join('acudientes as a', 'a.id', '=', 'ea.acudiente_id')
            ->join('parentescos as p', 'p.id', '=', 'ea.parentesco_id')
            ->leftJoin('barrios as b', 'b.id', '=', 'a.barrio_id')
            ->whereIn('ea.estudiante_id', $estudiantes)
            ->orderByDesc('ea.es_principal')
            ->orderBy('a.id')
            ->get([
                'ea.estudiante_id', 'a.nombre_completo as nombre', 'a.tipo_documento', 'a.numero_documento', 'p.nombre as parentesco',
                'ea.parentesco_otro', 'a.direccion', 'b.nombre as barrio', 'a.telefono_celular', 'a.telefono_fijo',
            ])
            ->unique('estudiante_id')
            ->keyBy('estudiante_id');

        // Los años ya cursados o en curso (el planeado, después de promover, todavía no cuenta).
        $historias = DB::table('matriculas as m')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->join('sedes as s', 's.id', '=', 'm.sede_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->whereIn('m.estudiante_id', $estudiantes)
            ->where('al.estado', '<>', 'planeado')
            ->orderBy('al.anio')
            ->get(['m.estudiante_id', 'al.anio', 'g.codigo as grupo', 'gr.nombre as grado', 's.nombre as sede'])
            ->groupBy('estudiante_id');

        $hoy = now()->toDateString();

        return collect($matriculas)
            ->filter(fn ($id) => $filas->has($id))
            ->map(function ($id) use ($filas, $acudientes, $historias, $hoy) {
                $m = $filas[$id];
                $a = $acudientes->get($m->estudiante_id);

                return [
                    'id' => $m->id,
                    'anio' => $m->anio,
                    // Como en el Excel: la fecha de la constancia es la de la matrícula.
                    'fecha' => $m->fecha_matricula ?? $hoy,
                    'estudiante' => [
                        'nombre' => $m->nombre,
                        'documento' => trim("{$m->tipo_documento} {$m->numero_documento}"),
                        'grado' => $m->grado,
                        'grupo' => $m->grupo,
                        'sede' => $m->sede,
                        'jornada' => $m->jornada,
                        'modalidad' => $m->modalidad,
                        'condicion' => $m->condicion,
                    ],
                    'acudiente' => $a ? [
                        'nombre' => $a->nombre,
                        'documento' => $a->numero_documento,
                        'parentesco' => $a->parentesco === 'Otro' && $a->parentesco_otro ? $a->parentesco_otro : $a->parentesco,
                        'direccion' => $a->direccion,
                        'barrio' => $a->barrio,
                        'telefonos' => collect([$a->telefono_celular, $a->telefono_fijo])->filter()->unique()->values(),
                    ] : null,
                    'observaciones' => $m->observaciones ? trim($m->observaciones) : null,
                    'historia' => collect($historias->get($m->estudiante_id, []))
                        ->where('anio', '<=', $m->anio)
                        ->take(-self::AÑOS)
                        ->map(fn ($h) => ['anio' => $h->anio, 'grupo' => $h->grupo ?? $h->grado, 'sede' => $h->sede])
                        ->values(),
                ];
            })
            ->values()
            ->all();
    }
}
