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

    /** Lo que aún no se sabe en la proyección del año siguiente. */
    public const POR_ASIGNAR = 'Por asignar';

    /**
     * @param  list<int>  $matriculas  en el orden en que deben salir
     * @return list<array<string, mixed>>
     */
    public static function de(array $matriculas): array
    {
        if (! $matriculas) {
            return [];
        }
        $numeros = self::numerosEnElGrupo($matriculas);

        $filas = DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->join('sedes as s', 's.id', '=', 'm.sede_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('modalidades as mo', 'mo.id', '=', 'm.modalidad_id')
            ->whereIn('m.id', $matriculas)
            ->get([
                'm.id', 'm.consecutivo', 'm.estudiante_id', 'al.anio', 'al.estado as estado_anio', 'm.fecha_matricula', 'gr.numero as grado_numero',
                'gr.nombre as grado', 'g.codigo as grupo', 's.nombre as sede',
                'm.jornada', 'mo.nombre as modalidad', 'm.condicion', 'm.observaciones',
                'e.nombre_completo as nombre', 'e.tipo_documento', 'e.numero_documento', 'e.correo',
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
                'ea.parentesco_otro', 'a.direccion', 'b.nombre as barrio', 'a.telefono_celular', 'a.telefono_fijo', 'a.email',
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

        // El correo que dio la familia al inscribirse (la última inscripción con ese documento), por si
        // el estudiante y su acudiente no tienen uno guardado.
        $deInscripcion = DB::table('solicitudes_inscripcion')
            ->whereIn('numero_documento', $filas->pluck('numero_documento')->unique())
            ->orderBy('id')
            ->get(['numero_documento', 'acudiente_correo', 'correo'])
            ->keyBy('numero_documento');

        $hoy = now()->toDateString();

        return collect($matriculas)
            ->filter(fn ($id) => $filas->has($id))
            ->map(function ($id) use ($filas, $acudientes, $historias, $deInscripcion, $hoy, $numeros) {
                $m = $filas[$id];
                $a = $acudientes->get($m->estudiante_id);
                $inscripcion = $deInscripcion->get($m->numero_documento);
                // En el año planeado (la proyección de cupos), lo que todavía no está decidido sale «Por
                // asignar»: en 6.º (vienen de las sedes de primaria) el grupo y la jornada; en 10.º, la técnica.
                $planeado = $m->estado_anio === 'planeado';
                $sinGrupo = $planeado && (int) $m->grado_numero === 6;
                $sinTecnica = $planeado && (int) $m->grado_numero === 10;

                return [
                    'id' => $m->id,
                    // El n.º de la ficha dentro de su grupo (1 al total de activos), y ese total.
                    'consecutivo' => $numeros[$id]['numero'] ?? null,
                    'deTotal' => $numeros[$id]['total'] ?? null,
                    'anio' => $m->anio,
                    // Como en el Excel: la fecha de la constancia es la de la matrícula.
                    'fecha' => $m->fecha_matricula ?? $hoy,
                    'estudiante' => [
                        'nombre' => $m->nombre,
                        'documento' => trim("{$m->tipo_documento} {$m->numero_documento}"),
                        'grado' => $m->grado,
                        'grupo' => $sinGrupo ? self::POR_ASIGNAR : $m->grupo,
                        'sede' => $m->sede,
                        'jornada' => $sinGrupo ? self::POR_ASIGNAR : $m->jornada,
                        'modalidad' => $sinTecnica ? self::POR_ASIGNAR : $m->modalidad,
                        'condicion' => $m->condicion,
                    ],
                    'acudiente' => $a ? [
                        'nombre' => $a->nombre,
                        'documento' => $a->numero_documento,
                        'parentesco' => $a->parentesco === 'Otro' && $a->parentesco_otro ? $a->parentesco_otro : $a->parentesco,
                        'direccion' => $a->direccion,
                        'barrio' => $a->barrio,
                        'telefonos' => collect([$a->telefono_celular, $a->telefono_fijo])->filter()->unique()->values(),
                        // El del acudiente; si no tiene, el de contacto de la familia; si tampoco, el de su inscripción.
                        'correo' => $a->email ?: $m->correo ?: $inscripcion?->acudiente_correo ?: $inscripcion?->correo,
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

    /**
     * El n.º de cada ficha dentro de su grupo: los estudiantes activos del grupo en
     * orden alfabético (el mismo de la lista y de las constancias del grupo), de 1
     * al total. Así la última ficha de un grupo de 40 es la 40. Sin grupo (sexto
     * recién promovido), cuenta el grado en su sede. Quien no está activo no lleva n.º.
     *
     * @param  list<int>  $matriculas
     * @return array<int, array{numero: int, total: int}>
     */
    private static function numerosEnElGrupo(array $matriculas): array
    {
        $grupo = fn ($m) => $m->grupo_id ? "g{$m->grupo_id}" : "{$m->anio_lectivo_id}-{$m->sede_id}-{$m->grado_id}";
        $pedidas = DB::table('matriculas')->whereIn('id', $matriculas)->where('estado', 'activo')->get(['id', 'anio_lectivo_id', 'sede_id', 'grado_id', 'grupo_id']);
        if ($pedidas->isEmpty()) {
            return [];
        }
        $claves = $pedidas->map($grupo)->flip();

        $numeros = [];
        DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->whereIn('m.anio_lectivo_id', $pedidas->pluck('anio_lectivo_id')->unique())
            ->where(fn ($q) => $q->whereIn('m.grupo_id', $pedidas->pluck('grupo_id')->filter()->unique())
                ->orWhere(fn ($q) => $q->whereNull('m.grupo_id')->whereIn('m.grado_id', $pedidas->whereNull('grupo_id')->pluck('grado_id')->unique())))
            ->where('m.estado', 'activo')
            ->whereNull('e.deleted_at')
            ->orderBy('e.nombre_completo')
            ->orderBy('m.id')
            ->get(['m.id', 'm.anio_lectivo_id', 'm.sede_id', 'm.grado_id', 'm.grupo_id'])
            ->filter(fn ($m) => $claves->has($grupo($m)))
            ->groupBy($grupo)
            ->each(function ($delGrupo) use (&$numeros) {
                foreach ($delGrupo->values() as $i => $m) {
                    $numeros[$m->id] = ['numero' => $i + 1, 'total' => $delGrupo->count()];
                }
            });

        return $numeros;
    }
}
