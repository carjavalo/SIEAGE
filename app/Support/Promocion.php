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
 *
 * Como pidió la institución: los de quinto pasan a sexto sin grupo ni jornada (los
 * grupos de sexto se arman con la proyección de cupos) y los de noveno pasan a
 * décimo sin técnica; las dos cosas se asignan después en Estudiantes. Los
 * grupos del año siguiente no se copian solos: se crean en Sedes, según la
 * proyección de matrícula entregada a la SED.
 *
 * Los de ciclos (jornada Sabatina) pasan al ciclo siguiente, no al grado siguiente
 * (Ciclo III, en Séptimo → Ciclo IV, en Noveno), y a su grupo sabatino; si ese grupo
 * del año siguiente todavía no existe, se crea (ver App\Support\Ciclos).
 *
 * Los marcados como reprobados (resultado "reprobado", ver ReprobacionController)
 * no pasan: repiten su mismo grado (o ciclo) el año siguiente, como repitentes, y
 * siguen con su técnica. Un reprobado de undécimo no se gradúa.
 */
final class Promocion
{
    /** Al pasar a este grado (sexto) el estudiante queda sin grupo ni jornada. */
    public const GRADO_SIN_GRUPO = 6;

    /** Desde este grado (décimo) hay técnica; al llegar a él queda sin elegir. */
    public const GRADO_TECNICA = 10;

    /** @var array<int, int> Estudiantes activos por grupo del año destino, al día durante la promoción. */
    private array $ocupados = [];

    private function __construct(private object $origen, private object $destino) {}

    /**
     * Promueve las matrículas activas del año indicado (que debe ser el año en
     * curso). Sin grado ni estudiante: toda la institución.
     *
     * @return array<string, mixed> resumen para mostrar al usuario
     */
    public static function ejecutar(int $anio, ?int $gradoId = null, ?int $estudianteId = null, int|array|null $sedeId = null, ?int $grupoId = null, ?int $grupoDestinoId = null): array
    {
        $origen = DB::table('anios_lectivos')->where('anio', $anio)->first();
        if (! $origen || $origen->estado !== 'activo') {
            throw ValidationException::withMessages(['promocion' => 'Solo se promueve desde el año lectivo en curso.']);
        }

        return DB::transaction(function () use ($origen, $gradoId, $estudianteId, $sedeId, $grupoId, $grupoDestinoId) {
            $promocion = new self($origen, self::anioSiguiente($origen));

            return $promocion->promover($promocion->pendientes($gradoId, $estudianteId, $sedeId, $grupoId), $grupoDestinoId);
        });
    }

    /** El año siguiente; si no existe se crea como "planeado". */
    private static function anioSiguiente(object $origen): object
    {
        return AniosLectivos::abrir((int) $origen->anio + 1);
    }

    /**
     * Deshace la promoción de un alcance (un estudiante, un grupo, un grado o todo).
     *
     * Se puede pedir desde dos lados:
     *  - Desde el año en curso: el alcance (grado/grupo) es el de ORIGEN (p. ej. 5.º en 2026)
     *    y se borra lo que la promoción creó en el año siguiente; los graduados de undécimo
     *    vuelven a activos.
     *  - Desde un año planeado (el DESTINO, p. ej. 2027): el alcance es el del grado/grupo que
     *    recibió a los promovidos (p. ej. 6.º en 2027) y se borra lo que la promoción trajo ahí.
     *
     * No toca a los inscritos nuevos del año siguiente ni a nadie deshabilitado a mano. A los
     * reprobados se les borra la matrícula en que repetían, pero siguen marcados como reprobados.
     *
     * @return array<string, mixed> resumen para mostrar al usuario
     */
    public static function revertir(int $anio, ?int $gradoId = null, ?int $estudianteId = null, int|array|null $sedeId = null, ?int $grupoId = null): array
    {
        $visto = DB::table('anios_lectivos')->where('anio', $anio)->first();

        // Desde un año planeado (el destino): el alcance se refiere a ese año.
        if ($visto && $visto->estado !== 'activo') {
            return self::revertirDesdeDestino($visto, $gradoId, $estudianteId, $sedeId, $grupoId);
        }

        $origen = $visto;
        if (! $origen || $origen->estado !== 'activo') {
            throw ValidationException::withMessages(['promocion' => 'Solo se deshace la promoción desde el año lectivo en curso o el año siguiente.']);
        }
        $destino = DB::table('anios_lectivos')->where('anio', $anio + 1)->first();
        if (! $destino) {
            return ['anio' => $anio + 1, 'revertidos' => 0, 'reactivados' => 0];
        }

        return DB::transaction(function () use ($origen, $destino, $gradoId, $estudianteId, $sedeId, $grupoId) {
            // Matrículas del año en curso en el alcance (las que se promovieron o reprobaron).
            $delAlcance = DB::table('matriculas as m')
                ->where('m.anio_lectivo_id', $origen->id)
                ->when($gradoId, fn ($q) => $q->where('m.grado_id', $gradoId))
                ->when($estudianteId, fn ($q) => $q->where('m.estudiante_id', $estudianteId))
                ->when($grupoId, fn ($q) => $q->where('m.grupo_id', $grupoId))
                ->when($sedeId !== null, fn ($q) => $q->whereIn('m.sede_id', (array) $sedeId))
                ->get(['m.id', 'm.estudiante_id', 'm.estado', 'm.resultado']);
            $estudiantes = $delAlcance->pluck('estudiante_id');

            // Las que la promoción creó en el año siguiente para esos estudiantes: "antiguo"
            // de una promovida, o "repitente" de una reprobada. No toca a los inscritos nuevos.
            $creadas = DB::table('matriculas as sig')
                ->join('matriculas as m', fn ($j) => $j->on('m.estudiante_id', '=', 'sig.estudiante_id')->where('m.anio_lectivo_id', $origen->id))
                ->where('sig.anio_lectivo_id', $destino->id)
                ->whereIn('sig.estudiante_id', $estudiantes)
                ->where(fn ($q) => $q->where(fn ($q) => $q->where('sig.condicion', 'antiguo')->where('m.resultado', 'promovido'))
                    ->orWhere(fn ($q) => $q->where('sig.condicion', 'repitente')->where('m.resultado', 'reprobado')))
                ->pluck('sig.id');
            DB::table('matriculas')->whereIn('id', $creadas)->delete();

            // Graduados de undécimo: vuelven a activos. Las que seguían activas: se les quita "promovido".
            $graduados = $delAlcance->where('estado', 'graduado')->where('resultado', 'promovido')->pluck('id');
            DB::table('matriculas')->whereIn('id', $graduados)->update(['estado' => 'activo', 'resultado' => null, 'updated_at' => now()]);
            $activas = $delAlcance->where('estado', 'activo')->where('resultado', 'promovido')->pluck('id');
            DB::table('matriculas')->whereIn('id', $activas)->update(['resultado' => null, 'updated_at' => now()]);

            return [
                'anio' => (int) $destino->anio,
                'revertidos' => $creadas->count(),
                'reactivados' => $graduados->count(),
            ];
        });
    }

    /**
     * Deshacer la promoción mirándola desde el año destino (el grado/grupo que recibió a los
     * promovidos): borra las matrículas que la promoción creó en ese año dentro del alcance y
     * le quita la marca "promovido" a la matrícula de origen de cada uno.
     *
     * @return array<string, mixed>
     */
    private static function revertirDesdeDestino(object $destino, ?int $gradoId, ?int $estudianteId, int|array|null $sedeId, ?int $grupoId): array
    {
        $origen = DB::table('anios_lectivos')->where('anio', (int) $destino->anio - 1)->where('estado', 'activo')->first();
        if (! $origen) {
            throw ValidationException::withMessages(['promocion' => 'No hay promoción que deshacer para ese año.']);
        }

        return DB::transaction(function () use ($origen, $destino, $gradoId, $estudianteId, $sedeId, $grupoId) {
            $filas = DB::table('matriculas as sig')
                ->join('matriculas as m', fn ($j) => $j->on('m.estudiante_id', '=', 'sig.estudiante_id')->where('m.anio_lectivo_id', $origen->id))
                ->where('sig.anio_lectivo_id', $destino->id)
                ->where(fn ($q) => $q->where(fn ($q) => $q->where('sig.condicion', 'antiguo')->where('m.resultado', 'promovido'))
                    ->orWhere(fn ($q) => $q->where('sig.condicion', 'repitente')->where('m.resultado', 'reprobado')))
                // El alcance (grado/grupo/sede/estudiante) se refiere al año destino.
                ->when($gradoId, fn ($q) => $q->where('sig.grado_id', $gradoId))
                ->when($estudianteId, fn ($q) => $q->where('sig.estudiante_id', $estudianteId))
                ->when($grupoId, fn ($q) => $q->where('sig.grupo_id', $grupoId))
                ->when($sedeId !== null, fn ($q) => $q->whereIn('sig.sede_id', (array) $sedeId))
                ->get(['sig.id as sig_id', 'm.id as origen_id', 'm.resultado as origen_resultado']);

            DB::table('matriculas')->whereIn('id', $filas->pluck('sig_id'))->delete();
            // A los promovidos se les quita la marca; los reprobados siguen reprobados (repiten al promover otra vez).
            $origenPromovidos = $filas->where('origen_resultado', 'promovido')->pluck('origen_id');
            DB::table('matriculas')->whereIn('id', $origenPromovidos)->update(['resultado' => null, 'updated_at' => now()]);

            return [
                'anio' => (int) $destino->anio,
                'revertidos' => $filas->count(),
                'reactivados' => 0,
            ];
        });
    }

    /** Matrículas activas del alcance que todavía no tienen matrícula el año siguiente. */
    private function pendientes(?int $gradoId, ?int $estudianteId, int|array|null $sedeId = null, ?int $grupoId = null): Collection
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
            // Un grupo específico (p. ej. todo 5-2), para promoverlo a un grupo elegido.
            ->when($grupoId, fn ($q) => $q->where('m.grupo_id', $grupoId))
            // Una sede, o las del usuario que promueve (null = todas).
            ->when($sedeId !== null, fn ($q) => $q->whereIn('m.sede_id', (array) $sedeId))
            ->whereNotExists(fn ($q) => $q->from('matriculas as sig')
                ->whereColumn('sig.estudiante_id', 'm.estudiante_id')
                ->where('sig.anio_lectivo_id', $this->destino->id))
            ->orderBy('gr.numero')
            ->orderBy('e.nombre_completo')
            ->get(['m.id', 'm.estudiante_id', 'm.grado_id', 'gr.numero as grado_numero', 'g.numero as grupo_numero', 'm.sede_id', 'm.jornada', 'm.modalidad_id', 'm.resultado']);
    }

    /** @return array<string, mixed> */
    private function promover(Collection $pendientes, ?int $grupoDestinoId = null): array
    {
        $gradosPorNumero = DB::table('grados')->pluck('id', 'numero');
        $ultimo = $gradosPorNumero->keys()->max();
        $this->ahora = now();
        $graduados = 0;
        $sinSuGrupo = [];

        // Si se eligió un grupo de destino (promover 5-2 → 6-2), todos los que pasan
        // van a ese grupo, sin importar su grupo ni la lógica automática.
        $destinoForzado = $grupoDestinoId !== null ? $this->grupoForzado($grupoDestinoId) : null;

        // Primera pasada: los de undécimo se gradúan y cada uno de los demás
        // pasa a su mismo grupo. Los que no lo tienen esperan a la segunda,
        // para repartirse viendo ya cuántos quedaron en cada grupo.
        foreach ($pendientes as $m) {
            // Reprobó: repite su mismo grado (y ciclo, si es sabatino) el año siguiente.
            if (self::repite($m)) {
                $gradoNuevo = (int) $m->grado_id;
                if ($m->jornada === Ciclos::JORNADA && ($ciclo = Ciclos::deGrado((int) $m->grado_numero))) {
                    $this->matricular($m, $gradoNuevo, $this->grupoDelCiclo($ciclo, $gradoNuevo, $m));
                } elseif ((int) $m->grado_numero === self::GRADO_SIN_GRUPO) {
                    $this->matricularSinGrupo($m, $gradoNuevo);
                } elseif ($grupo = $this->mismoGrupo($gradoNuevo, $m)) {
                    $this->matricular($m, $gradoNuevo, $grupo);
                } else {
                    $sinSuGrupo[] = [$m, $gradoNuevo];
                }

                continue;
            }

            if ((int) $m->grado_numero === (int) $ultimo) {
                DB::table('matriculas')->where('id', $m->id)->update(['estado' => 'graduado', 'resultado' => 'promovido', 'updated_at' => $this->ahora]);
                $graduados++;

                continue;
            }

            // Destino elegido: todos al mismo grupo, en el grado de ese grupo.
            if ($destinoForzado !== null) {
                $this->matricular($m, (int) $destinoForzado->grado_id, $destinoForzado);

                continue;
            }

            // Sabatina: al ciclo siguiente, en su grupo sabatino.
            if ($m->jornada === Ciclos::JORNADA && ($ciclo = Ciclos::siguiente(Ciclos::deGrado((int) $m->grado_numero) ?? ''))) {
                $gradoNuevo = $gradosPorNumero[Ciclos::grado($ciclo)];
                $this->matricular($m, $gradoNuevo, $this->grupoDelCiclo($ciclo, $gradoNuevo, $m));

                continue;
            }

            $gradoNuevo = $gradosPorNumero[$m->grado_numero + 1];
            if ((int) $m->grado_numero + 1 === self::GRADO_SIN_GRUPO) {
                $this->matricularSinGrupo($m, $gradoNuevo);
            } elseif ($grupo = $this->mismoGrupo($gradoNuevo, $m)) {
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
            'repiten' => $this->repiten,
            'graduados' => $graduados,
            'sobreCupo' => $this->sobreCupo,
            'sinGrupo' => $this->sinGrupo,
            'reparto' => $reparto,
        ];
    }

    private Carbon $ahora;

    private int $promovidos = 0;

    private int $repiten = 0;

    private static function repite(object $m): bool
    {
        return $m->resultado === 'reprobado';
    }

    private int $sobreCupo = 0;

    private int $sinGrupo = 0;

    /** @var array<int|string, array{grupo: string, sede: string, n: int, libres: int|null}> */
    private array $reparto = [];

    /** Crea la matrícula del año siguiente en el grupo elegido y deja la actual como promovida. */
    private function matricular(object $m, int $gradoNuevo, object $grupo): void
    {
        $lleno = $this->ocupados[$grupo->id] >= $grupo->cupos_proyectados;

        $this->crearMatricula($m, $gradoNuevo, $grupo->sede_id, $grupo->id, $grupo->jornada);

        $this->ocupados[$grupo->id]++;
        $this->sobreCupo += $lleno ? 1 : 0;
        $this->reparto[$grupo->id] ??= ['grupo' => $grupo->codigo, 'sede' => $grupo->sede, 'n' => 0, 'libres' => 0];
        $this->reparto[$grupo->id]['n']++;
        $this->reparto[$grupo->id]['libres'] = $grupo->cupos_proyectados - $this->ocupados[$grupo->id];
    }

    /** Pasa a sexto sin grupo ni jornada, en la sede donde se da ese grado. */
    private function matricularSinGrupo(object $m, int $gradoNuevo): void
    {
        $sede = $this->sedeDelGrado($gradoNuevo, $m);
        $this->crearMatricula($m, $gradoNuevo, $sede->id, null, null);

        $this->sinGrupo++;
        // En el resumen va con el nombre del grado y sin cupos: todavía no tiene grupo.
        $clave = "sin-{$sede->id}";
        $this->reparto[$clave] ??= ['grupo' => DB::table('grados')->where('id', $gradoNuevo)->value('nombre'), 'sede' => $sede->nombre, 'n' => 0, 'libres' => null];
        $this->reparto[$clave]['n']++;
    }

    private function crearMatricula(object $m, int $gradoNuevo, int $sedeId, ?int $grupoId, ?string $jornada): void
    {
        $repite = self::repite($m);
        DB::table('matriculas')->insert([
            'estudiante_id' => $m->estudiante_id,
            'anio_lectivo_id' => $this->destino->id,
            'grado_id' => $gradoNuevo,
            'grupo_id' => $grupoId,
            'sede_id' => $sedeId,
            // Al llegar a décimo la técnica queda sin elegir; después sigue con la suya.
            // El que repite sigue con la suya.
            'modalidad_id' => ! $repite && (int) $m->grado_numero + 1 === self::GRADO_TECNICA ? null : $m->modalidad_id,
            'jornada' => $jornada,
            'fecha_matricula' => $this->ahora->toDateString(),
            'condicion' => $repite ? 'repitente' : 'antiguo',
            'estado' => 'activo',
            'es_historico' => false,
            'created_at' => $this->ahora,
            'updated_at' => $this->ahora,
        ]);
        if ($repite) {
            $this->repiten++;

            return;
        }
        DB::table('matriculas')->where('id', $m->id)->update(['resultado' => 'promovido', 'updated_at' => $this->ahora]);
        $this->promovidos++;
    }

    /** @var array<int, Collection> Sedes de cada grado sin grupo (de la que más grupos tiene a la que menos). */
    private array $sedesDelGrado = [];

    /**
     * Dónde se da el grado: las sedes de sus grupos en el año siguiente o, si aún
     * no los crearon, en el año en curso. Si su sede lo tiene, la suya; si no, la
     * que más grupos tiene de ese grado. Sin grupos en ningún año, se queda en su sede.
     */
    private function sedeDelGrado(int $gradoId, object $m): object
    {
        $sedes = $this->sedesDelGrado[$gradoId] ??= (function () use ($gradoId) {
            foreach ([$this->destino->id, $this->origen->id] as $anioId) {
                $sedes = DB::table('grupos')->where('anio_lectivo_id', $anioId)->where('grado_id', $gradoId)
                    ->groupBy('sede_id')->orderByRaw('count(*) desc')->orderBy('sede_id')->pluck('sede_id');
                if ($sedes->isNotEmpty()) {
                    return $sedes;
                }
            }

            return collect();
        })();

        $sedeId = $sedes->isEmpty() || $sedes->contains($m->sede_id) ? $m->sede_id : $sedes->first();

        return DB::table('sedes')->where('id', $sedeId)->first(['id', 'nombre']);
    }

    /**
     * El grupo sabatino del ciclo en el año siguiente, en la sede del estudiante (o en
     * la que lo tenga). Si no existe se crea, con el cupo del grupo que deja.
     */
    private function grupoDelCiclo(string $ciclo, int $gradoId, object $m): object
    {
        $buscar = fn () => DB::table('grupos as g')->join('sedes as s', 's.id', '=', 'g.sede_id')
            ->where('g.anio_lectivo_id', $this->destino->id)->where('g.grado_id', $gradoId)->where('g.jornada', Ciclos::JORNADA)
            ->orderByRaw('g.sede_id = ? desc', [$m->sede_id])->orderBy('g.id')
            ->first(['g.id', 'g.numero', 'g.codigo', 'g.sede_id', 'g.jornada', 'g.cupos_proyectados', 's.nombre as sede']);

        $grupo = $buscar();
        if (! $grupo) {
            DB::table('grupos')->insert([
                'anio_lectivo_id' => $this->destino->id, 'sede_id' => $m->sede_id, 'grado_id' => $gradoId, 'numero' => 1,
                'codigo' => Ciclos::codigo($ciclo), 'jornada' => Ciclos::JORNADA,
                'cupos_proyectados' => (int) (DB::table('matriculas as x')->join('grupos as gx', 'gx.id', '=', 'x.grupo_id')->where('x.id', $m->id)->value('gx.cupos_proyectados') ?: 34),
                'created_at' => $this->ahora, 'updated_at' => $this->ahora,
            ]);
            $grupo = $buscar();
        }
        $this->ocupados[$grupo->id] ??= (int) DB::table('matriculas')->where('grupo_id', $grupo->id)->where('estado', 'activo')->count();

        return $grupo;
    }

    /** @var array<int, Collection> Grupos del año destino por grado, cargados una vez. */
    private array $grupos = [];

    /**
     * El grupo de destino elegido para promover un grupo completo (p. ej. 6-2 para
     * los de 5-2). Debe ser un grupo del año siguiente. Inicializa su ocupación.
     */
    private function grupoForzado(int $grupoDestinoId): object
    {
        $grupo = DB::table('grupos as g')
            ->join('sedes as s', 's.id', '=', 'g.sede_id')
            ->where('g.id', $grupoDestinoId)
            ->where('g.anio_lectivo_id', $this->destino->id)
            ->first(['g.id', 'g.numero', 'g.codigo', 'g.sede_id', 'g.grado_id', 'g.jornada', 'g.cupos_proyectados', 's.nombre as sede']);
        if (! $grupo) {
            throw ValidationException::withMessages(['promocion' => 'El grupo de destino no es válido o no es del año siguiente.']);
        }
        $this->ocupados[$grupo->id] ??= (int) DB::table('matriculas')->where('grupo_id', $grupo->id)->where('estado', 'activo')->count();

        return $grupo;
    }

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
     * Grupos del grado en el año destino. No se copian solos de los del año en
     * curso: se crean antes en Sedes, según la proyección de matrícula. Si
     * todavía no los hay, no se promueve (todo o nada) y se dice cuáles faltan.
     */
    private function gruposDestino(int $gradoId): Collection
    {
        $grupos = DB::table('grupos as g')
            ->join('sedes as s', 's.id', '=', 'g.sede_id')
            ->where('g.anio_lectivo_id', $this->destino->id)
            ->where('g.grado_id', $gradoId)
            ->get(['g.id', 'g.numero', 'g.codigo', 'g.sede_id', 'g.jornada', 'g.cupos_proyectados', 's.nombre as sede']);

        if ($grupos->isEmpty()) {
            $nombre = DB::table('grados')->where('id', $gradoId)->value('nombre');
            throw ValidationException::withMessages([
                'promocion' => "Todavía no hay grupos de {$nombre} en {$this->destino->anio}: créalos en Sedes, según la proyección de matrícula, y vuelve a promover.",
            ]);
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
