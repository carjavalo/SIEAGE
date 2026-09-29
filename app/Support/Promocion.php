<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Promoción de fin de año: cada estudiante activo pasa al grado siguiente en
 * el año lectivo siguiente, y los de undécimo quedan graduados.
 *
 * Los cupos no detienen la promoción: todos pasan. Cada estudiante va a su
 * mismo grupo en el grado siguiente (9-1 → 10-1), en su sede si el grado nuevo
 * la tiene, aunque ese grupo quede sobre el cupo. Si ese grupo no existe
 * (10-6 y no hay 11-6), va al grupo con menos estudiantes de su sede y su
 * jornada. Los que quedan sobre el cupo se cuentan para avisar: la secretaría
 * revisa después y deshabilita a quienes no continúan.
 */
final class Promocion
{
    /** @var array<int, int> Estudiantes activos por grupo del año destino, al día durante la promoción. */
    private array $ocupados = [];

    private function __construct(private object $origen, private object $destino) {}

    /**
     * Promueve las matrículas activas del año indicado (que debe ser el año en
     * curso). Sin grado ni estudiante: todo el colegio.
     *
     * @return array<string, mixed> resumen para mostrar al usuario
     */
    public static function ejecutar(int $anio, ?int $gradoId = null, ?int $estudianteId = null, ?int $sedeId = null): array
    {
        $origen = DB::table('anios_lectivos')->where('anio', $anio)->first();
        if (! $origen || $origen->estado !== 'activo') {
            throw ValidationException::withMessages(['promocion' => 'Solo se promueve desde el año lectivo en curso.']);
        }

        return DB::transaction(function () use ($origen, $gradoId, $estudianteId, $sedeId) {
            $promocion = new self($origen, self::anioSiguiente($origen));

            return $promocion->promover($promocion->pendientes($gradoId, $estudianteId, $sedeId));
        });
    }

    /** El año siguiente; si no existe se crea como "planeado". */
    private static function anioSiguiente(object $origen): object
    {
        $siguiente = $origen->anio + 1;
        if (! DB::table('anios_lectivos')->where('anio', $siguiente)->exists()) {
            DB::table('anios_lectivos')->insert(['anio' => $siguiente, 'estado' => 'planeado', 'created_at' => now(), 'updated_at' => now()]);
        }

        return DB::table('anios_lectivos')->where('anio', $siguiente)->first();
    }

    /** Matrículas activas del alcance que todavía no tienen matrícula el año siguiente. */
    private function pendientes(?int $gradoId, ?int $estudianteId, ?int $sedeId = null): Collection
    {
        return DB::table('matriculas as m')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->where('m.anio_lectivo_id', $this->origen->id)
            ->where('m.estado', 'activo')
            ->whereNull('e.deleted_at')
            ->when($gradoId, fn ($q) => $q->where('m.grado_id', $gradoId))
            ->when($estudianteId, fn ($q) => $q->where('m.estudiante_id', $estudianteId))
            ->when($sedeId, fn ($q) => $q->where('m.sede_id', $sedeId))
            ->whereNotExists(fn ($q) => $q->from('matriculas as sig')
                ->whereColumn('sig.estudiante_id', 'm.estudiante_id')
                ->where('sig.anio_lectivo_id', $this->destino->id))
            ->orderBy('gr.numero')
            ->orderBy('e.nombre_completo')
            ->get(['m.id', 'm.estudiante_id', 'm.grado_id', 'gr.numero as grado_numero', 'g.numero as grupo_numero', 'm.sede_id', 'm.jornada', 'm.modalidad_id']);
    }

    /** @return array<string, mixed> */
    private function promover(Collection $pendientes): array
    {
        $gradosPorNumero = DB::table('grados')->pluck('id', 'numero');
        $ultimo = $gradosPorNumero->keys()->max();
        $this->ahora = now();
        $graduados = 0;
        $sinSuGrupo = [];

        // Primera pasada: los de undécimo se gradúan y cada uno de los demás
        // pasa a su mismo grupo. Los que no lo tienen esperan a la segunda,
        // para repartirse viendo ya cuántos quedaron en cada grupo.
        foreach ($pendientes as $m) {
            if ((int) $m->grado_numero === (int) $ultimo) {
                DB::table('matriculas')->where('id', $m->id)->update(['estado' => 'graduado', 'resultado' => 'promovido', 'updated_at' => $this->ahora]);
                $graduados++;

                continue;
            }

            $gradoNuevo = $gradosPorNumero[$m->grado_numero + 1];
            if ($grupo = $this->mismoGrupo($gradoNuevo, $m)) {
                $this->matricular($m, $gradoNuevo, $grupo);
            } else {
                $sinSuGrupo[] = [$m, $gradoNuevo];
            }
        }

        // Segunda pasada: los que no tienen su mismo grupo, al de menos estudiantes.
        foreach ($sinSuGrupo as [$m, $gradoNuevo]) {
            $this->matricular($m, $gradoNuevo, $this->menosOcupado($gradoNuevo, $m));
        }

        $reparto = array_values($this->reparto);
        usort($reparto, fn ($a, $b) => strnatcmp($a['grupo'], $b['grupo']) ?: strcmp($a['sede'], $b['sede']));

        return [
            'anio' => (int) $this->destino->anio,
            'promovidos' => $this->promovidos,
            'graduados' => $graduados,
            'sobreCupo' => $this->sobreCupo,
            'reparto' => $reparto,
        ];
    }

    private Carbon $ahora;

    private int $promovidos = 0;

    private int $sobreCupo = 0;

    /** @var array<int, array{grupo: string, sede: string, n: int, libres: int}> */
    private array $reparto = [];

    /** Crea la matrícula del año siguiente en el grupo elegido y deja la actual como promovida. */
    private function matricular(object $m, int $gradoNuevo, object $grupo): void
    {
        $lleno = $this->ocupados[$grupo->id] >= $grupo->cupos_proyectados;

        DB::table('matriculas')->insert([
            'estudiante_id' => $m->estudiante_id,
            'anio_lectivo_id' => $this->destino->id,
            'grado_id' => $gradoNuevo,
            'grupo_id' => $grupo->id,
            'sede_id' => $grupo->sede_id,
            'modalidad_id' => $m->modalidad_id,
            'jornada' => $grupo->jornada,
            'fecha_matricula' => $this->ahora->toDateString(),
            'condicion' => 'antiguo',
            'estado' => 'activo',
            'es_historico' => false,
            'created_at' => $this->ahora,
            'updated_at' => $this->ahora,
        ]);
        DB::table('matriculas')->where('id', $m->id)->update(['resultado' => 'promovido', 'updated_at' => $this->ahora]);

        $this->ocupados[$grupo->id]++;
        $this->promovidos++;
        $this->sobreCupo += $lleno ? 1 : 0;
        $this->reparto[$grupo->id] ??= ['grupo' => $grupo->codigo, 'sede' => $grupo->sede, 'n' => 0, 'libres' => 0];
        $this->reparto[$grupo->id]['n']++;
        $this->reparto[$grupo->id]['libres'] = $grupo->cupos_proyectados - $this->ocupados[$grupo->id];
    }

    /** @var array<int, Collection> Grupos del año destino por grado, cargados una vez. */
    private array $grupos = [];

    /** Grupos del grado nuevo en la sede del estudiante (o todos, si el grado no está en su sede). */
    private function enSuSede(int $gradoId, object $m): Collection
    {
        $grupos = $this->grupos[$gradoId] ??= $this->gruposDestino($gradoId);

        return $grupos->where('sede_id', $m->sede_id)->whenEmpty(fn () => $grupos);
    }

    /** El mismo grupo en el grado siguiente (9-1 → 10-1), si existe; tenga o no cupo. */
    private function mismoGrupo(int $gradoId, object $m): ?object
    {
        if ($m->grupo_numero === null) {
            return null;
        }

        return $this->enSuSede($gradoId, $m)->first(
            fn ($g) => (int) $g->numero === (int) $m->grupo_numero,
        );
    }

    /** Respaldo: el grupo con menos estudiantes de su sede y, si lo hay, de su jornada. */
    private function menosOcupado(int $gradoId, object $m): object
    {
        $enSuSede = $this->enSuSede($gradoId, $m);
        $compatibles = $enSuSede->where('jornada', $m->jornada)->whenEmpty(fn () => $enSuSede);

        return $compatibles
            ->sortBy([
                fn ($a, $b) => $this->ocupados[$a->id] <=> $this->ocupados[$b->id],
                fn ($a, $b) => strnatcmp($a->codigo, $b->codigo),
            ])
            ->first();
    }

    /**
     * Grupos del grado en el año destino. Si aún no hay, se abren iguales a los
     * de ese grado en el año en curso (mismo código, sede, jornada y cupos).
     */
    private function gruposDestino(int $gradoId): Collection
    {
        $existentes = fn () => DB::table('grupos as g')
            ->join('sedes as s', 's.id', '=', 'g.sede_id')
            ->where('g.anio_lectivo_id', $this->destino->id)
            ->where('g.grado_id', $gradoId)
            ->get(['g.id', 'g.numero', 'g.codigo', 'g.sede_id', 'g.jornada', 'g.cupos_proyectados', 's.nombre as sede']);

        $grupos = $existentes();
        if ($grupos->isEmpty()) {
            $modelo = DB::table('grupos')->where('anio_lectivo_id', $this->origen->id)->where('grado_id', $gradoId)->get();
            if ($modelo->isEmpty()) {
                $nombre = DB::table('grados')->where('id', $gradoId)->value('nombre');
                throw ValidationException::withMessages(['promocion' => "No hay grupos de {$nombre} para abrir en {$this->destino->anio}."]);
            }
            DB::table('grupos')->insert($modelo->map(fn ($g) => [
                'anio_lectivo_id' => $this->destino->id,
                'sede_id' => $g->sede_id,
                'grado_id' => $g->grado_id,
                'numero' => $g->numero,
                'codigo' => $g->codigo,
                'jornada' => $g->jornada,
                'cupos_proyectados' => $g->cupos_proyectados,
                'created_at' => now(),
                'updated_at' => now(),
            ])->all());
            $grupos = $existentes();
        }

        $activos = DB::table('matriculas')
            ->whereIn('grupo_id', $grupos->pluck('id'))
            ->where('estado', 'activo')
            ->groupBy('grupo_id')
            ->selectRaw('grupo_id, count(*) as n')
            ->pluck('n', 'grupo_id');
        foreach ($grupos as $g) {
            $this->ocupados[$g->id] = (int) ($activos[$g->id] ?? 0);
        }

        return $grupos;
    }
}
