<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Alcance;
use App\Support\Boletines;
use App\Support\CambiosFicha;
use App\Support\Constancias;
use App\Support\Documentos;
use App\Support\Edades;
use App\Support\Grupos;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EstudianteController extends Controller
{
    /**
     * Panel de estudiantes por grado para un año lectivo.
     */
    public function index(Request $request): Response
    {
        $anios = DB::table('anios_lectivos')->orderByDesc('anio')->get(['id', 'anio', 'estado']);
        $anio = $anios->firstWhere('anio', (int) $request->query('anio'))
            ?? $anios->firstWhere('estado', 'activo')
            ?? $anios->first();

        // Sedes que puede ver el usuario (null = todas). Todo lo de abajo se limita a ellas.
        $permitidas = Alcance::sedes($request->user());

        // Filtro por sede (?sede=LF). Sin él, todas las que puede ver. Se ofrecen
        // las sedes con su número de activos en el año, para mostrarlo en el selector.
        // Los activos que ve de cada sede (con los grados que tenga marcados en ella).
        $activosPorSede = Alcance::filtrar(DB::table('matriculas')->where('anio_lectivo_id', $anio?->id)->where('estado', 'activo'), $request->user(), 'sede_id', 'grado_id')
            ->groupBy('sede_id')->selectRaw('sede_id, count(*) as n')->pluck('n', 'sede_id');
        $sedes = DB::table('sedes as s')
            ->when($permitidas !== null, fn ($q) => $q->whereIn('s.id', $permitidas))
            ->orderByDesc('s.es_principal')
            ->orderBy('s.nombre')
            ->get(['s.id', 's.codigo', 's.nombre'])
            ->map(fn ($s) => (object) [...(array) $s, 'activos' => (int) ($activosPorSede[$s->id] ?? 0)]);
        $sede = $sedes->firstWhere('codigo', (string) $request->query('sede'))
            // Con una sola sede asignada, esa queda elegida siempre.
            ?? ($permitidas !== null && $sedes->count() === 1 ? $sedes->first() : null);
        // La sede elegida (o todas las suyas), y en cada una los grados que tenga marcados.
        $enSede = fn ($q, string $columna = 'sede_id', string $grado = 'grado_id') => Alcance::filtrar($sede ? $q->where($columna, $sede->id) : $q, $request->user(), $columna, $grado);
        $visibles = Alcance::gradosVisibles($request->user(), $sede?->id);

        $resumenPorGrado = DB::table('matriculas')
            ->where('anio_lectivo_id', $anio?->id)
            ->tap(fn ($q) => $enSede($q))
            ->groupBy('grado_id')
            ->selectRaw("grado_id, count(*) as total, sum(estado = 'activo') as activos, count(distinct grupo_id) as grupos")
            ->get()
            ->keyBy('grado_id');

        $grados = DB::table('grados')->when($visibles !== null, fn ($q) => $q->whereIn('id', $visibles))->orderBy('numero')->get()->map(fn ($g) => [
            'id' => $g->id,
            'numero' => $g->numero,
            'nombre' => $g->nombre,
            'nivel' => $g->nivel,
            'activos' => (int) ($resumenPorGrado[$g->id]->activos ?? 0),
            'grupos' => (int) ($resumenPorGrado[$g->id]->grupos ?? 0),
        ]);

        // El grado pedido; si no hay (o no existe en la sede elegida), el primero con estudiantes.
        $pedido = $grados->firstWhere('id', (int) $request->query('grado'));
        $gradoId = $pedido && (! $sede || $pedido['grupos'] > 0 || $pedido['activos'] > 0)
            ? $pedido['id']
            : ($grados->firstWhere('activos', '>', 0)['id'] ?? $pedido['id'] ?? null);

        $totales = DB::table('matriculas')
            ->where('anio_lectivo_id', $anio?->id)
            ->tap(fn ($q) => $enSede($q))
            ->selectRaw("
                sum(estado = 'activo') as activos,
                sum(estado = 'activo' and condicion = 'nuevo') as nuevos,
                sum(estado = 'activo' and condicion in ('antiguo', 'repitente')) as antiguos,
                sum(estado <> 'activo') as retirados
            ")
            ->first();

        $grupos = Grupos::conOcupacion($anio?->id, $gradoId, $sede ? (Alcance::puedeVer($request->user(), $sede->id, $gradoId) ? $sede->id : []) : Alcance::sedesDelGrado($request->user(), $gradoId));

        // Si ya fue promovido: el grupo que tiene en el año siguiente.
        $siguienteId = DB::table('anios_lectivos')->where('anio', ($anio?->anio ?? 0) + 1)->value('id');

        $estudiantes = DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->join('sedes as s', 's.id', '=', 'm.sede_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('modalidades as mo', 'mo.id', '=', 'm.modalidad_id')
            ->leftJoin('estudiante_acudiente as ea', function ($join) {
                $join->on('ea.estudiante_id', '=', 'e.id')->where('ea.es_principal', true);
            })
            ->leftJoin('acudientes as a', 'a.id', '=', 'ea.acudiente_id')
            ->leftJoin('matriculas as sig', function ($join) use ($siguienteId) {
                $join->on('sig.estudiante_id', '=', 'e.id')->where('sig.anio_lectivo_id', $siguienteId);
            })
            ->leftJoin('grupos as gsig', 'gsig.id', '=', 'sig.grupo_id')
            ->where('m.anio_lectivo_id', $anio?->id)
            ->where('m.grado_id', $gradoId)
            ->tap(fn ($q) => $enSede($q, 'm.sede_id', 'm.grado_id'))
            ->whereNull('e.deleted_at')
            ->orderBy('e.nombre_completo')
            ->get([
                'e.id', 'e.nombre_completo as nombre', 'e.tipo_documento', 'e.numero_documento', 'e.genero',
                'm.grupo_id', 'g.codigo as grupo', 's.nombre as sede', 's.codigo as sede_codigo', 'm.jornada', 'mo.nombre as modalidad',
                'm.condicion', 'm.estado', 'a.nombre_completo as acudiente',
                DB::raw('coalesce(a.telefono_celular, a.telefono_fijo) as telefono'),
                'gsig.codigo as promovido_a', 'e.fecha_nacimiento',
            ]);
        // La alerta de edad según la tabla de la institución (null si la edad es la adecuada).
        $numeroGrado = $gradoId ? (int) DB::table('grados')->where('id', $gradoId)->value('numero') : null;
        foreach ($estudiantes as $e) {
            $e->edad = $numeroGrado !== null && $anio ? Edades::alerta($e->fecha_nacimiento, $numeroGrado, (int) $anio->anio) : null;
            unset($e->fecha_nacimiento);
        }

        // Grupos de destino para promover un grupo completo: los del grado siguiente
        // en el año siguiente, dentro del alcance del usuario. Vacío si aún no existen.
        $gradoSiguienteId = $numeroGrado !== null ? DB::table('grados')->where('numero', $numeroGrado + 1)->value('id') : null;
        $gruposDestino = ($siguienteId && $gradoSiguienteId)
            ? DB::table('grupos as g')
                ->join('sedes as s', 's.id', '=', 'g.sede_id')
                ->where('g.anio_lectivo_id', $siguienteId)
                ->where('g.grado_id', $gradoSiguienteId)
                ->tap(fn ($q) => Alcance::filtrar($q, $request->user(), 'g.sede_id', 'g.grado_id'))
                ->orderBy('s.codigo')
                ->orderBy('g.numero')
                ->get(['g.id', 'g.codigo', 'g.sede_id', 's.nombre as sede'])
                ->map(fn ($g) => ['id' => $g->id, 'codigo' => $g->codigo, 'sede_id' => (int) $g->sede_id, 'sede' => $g->sede])
                ->values()
            : collect();

        return Inertia::render('estudiantes/index', [
            'anios' => $anios,
            'anio' => $anio?->anio,
            'sedes' => $sedes->map(fn ($s) => ['codigo' => $s->codigo, 'nombre' => $s->nombre, 'activos' => (int) $s->activos]),
            'sede' => $sede?->codigo,
            'grados' => $grados,
            'gradoId' => $gradoId,
            'totales' => array_map('intval', (array) $totales),
            'grupos' => $grupos,
            // Grupos del grado siguiente (año siguiente) para promover un grupo completo a uno elegido.
            'gruposDestino' => $gruposDestino,
            'estudiantes' => $estudiantes,
            // Con todas las sedes se ofrece "Todas las sedes"; con algunas, solo esas.
            'todasLasSedes' => $permitidas === null,
            'busqueda' => Inertia::optional(fn () => $this->buscar((string) $request->query('q'), $anio?->id, $request->user())),
            // Ficha del estudiante seleccionado (?ver=ID), que se muestra al lado
            // de la lista sin salir de la página. Solo se consulta si hay uno.
            'detalle' => fn () => $request->filled('ver') && Alcance::puedeVerEstudiante($request->user(), (int) $request->query('ver'))
                ? $this->ficha((int) $request->query('ver'), $anio?->anio)
                : null,
        ]);
    }

    /**
     * Ficha de matrícula del estudiante (equivale a la hoja CONSTANCIA DE MATRÍCULA del Excel).
     * Con ?anio=2027, la matrícula de ese año.
     */
    public function show(Request $request, int $estudiante): Response
    {
        Alcance::exigirEstudiante($request->user(), $estudiante);
        $ficha = $this->ficha($estudiante, $request->integer('anio') ?: null);
        abort_if(! $ficha, 404);

        // Como en la constancia (es la ficha de matrícula que se imprime): en el año planeado, lo que la
        // proyección de cupos aún no decide sale «Por asignar» (6.º: grupo y jornada; 10.º: la técnica)…
        if ($a = $ficha['actual']) {
            $a = clone $a;
            $planeado = $a->estado_anio === 'planeado';
            if ($planeado && (int) $a->grado_numero === 6) {
                $a->grupo = $a->jornada = Constancias::POR_ASIGNAR;
            }
            if ($planeado && (int) $a->grado_numero === 10) {
                $a->modalidad = Constancias::POR_ASIGNAR;
            }
            $ficha['actual'] = $a;
        }
        // …y el correo: si no tiene, el que dio la familia al inscribirse.
        if (! filled($ficha['estudiante']->correo)) {
            $inscripcion = DB::table('solicitudes_inscripcion')->where('numero_documento', $ficha['estudiante']->numero_documento)
                ->orderByDesc('id')->first(['correo', 'acudiente_correo']);
            $ficha['estudiante']->correo = $inscripcion?->correo ?: $inscripcion?->acudiente_correo;
        }

        return Inertia::render('estudiantes/ficha', [
            ...$ficha,
            'institucion' => DB::table('instituciones')->first(),
        ]);
    }

    /**
     * Datos de la ficha: el estudiante, su historia de matrículas, sus
     * acudientes y los boletines de la matrícula actual. La usan la página de
     * ficha completa y el panel lateral del listado.
     *
     * La matrícula «actual» es la del año que se está viendo (`$anio`): así, quien
     * mira 2027 ve la de 2027 aunque ese año todavía esté planeado. Sin año, o si
     * no tiene matrícula ese año, la del año más reciente que ya empezó.
     *
     * @return array<string, mixed>|null
     */
    private function ficha(int $estudiante, ?int $anio = null): ?array
    {
        $alumno = DB::table('estudiantes')->whereNull('deleted_at')->where('id', $estudiante)->first();
        if (! $alumno) {
            return null;
        }

        $historia = DB::table('matriculas as m')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->join('sedes as s', 's.id', '=', 'm.sede_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('modalidades as mo', 'mo.id', '=', 'm.modalidad_id')
            ->where('m.estudiante_id', $alumno->id)
            ->orderByDesc('al.anio')
            ->get([
                'm.id', 'al.anio', 'al.estado as estado_anio', 'gr.id as grado_id', 'gr.nombre as grado', 'gr.numero as grado_numero', 'g.codigo as grupo',
                's.nombre as sede', 's.codigo as sede_codigo', 'm.sede_id', 'm.grupo_id', 'm.anio_lectivo_id', 'm.jornada', 'mo.nombre as modalidad',
                'm.fecha_matricula', 'm.condicion', 'm.estado', 'm.es_historico', 'm.observaciones',
                'm.fecha_retiro', 'm.motivo_retiro', 'm.resultado',
            ]);

        $actual = ($anio ? $historia->firstWhere('anio', $anio) : null)
            ?? $historia->firstWhere('estado_anio', '<>', 'planeado')
            ?? $historia->first();
        // El año planeado (después de promover) entra en la historia solo cuando es el que se está viendo;
        // si no, se muestra aparte, como «Año siguiente».
        $historia = $historia->reject(fn ($h) => $h->estado_anio === 'planeado' && $h->id !== $actual?->id)->values();

        $acudientes = DB::table('estudiante_acudiente as ea')
            ->join('acudientes as a', 'a.id', '=', 'ea.acudiente_id')
            ->join('parentescos as p', 'p.id', '=', 'ea.parentesco_id')
            ->leftJoin('barrios as b', 'b.id', '=', 'a.barrio_id')
            ->where('ea.estudiante_id', $alumno->id)
            ->orderByDesc('ea.es_principal')
            ->get([
                'a.id', 'a.nombre_completo as nombre', 'a.primer_nombre', 'a.segundo_nombre', 'a.primer_apellido', 'a.segundo_apellido',
                'a.tipo_documento', 'a.numero_documento', 'p.nombre as parentesco', 'ea.parentesco_id', 'ea.parentesco_otro',
                'a.direccion', 'b.nombre as barrio', 'a.telefono_fijo', 'a.telefono_celular', 'a.email', 'ea.es_principal',
            ]);

        // Para corregir los datos desde la ficha: con quién más comparte acudiente y quién los editó por última vez.
        $alumno->barrio = $alumno->barrio_id ? DB::table('barrios')->where('id', $alumno->barrio_id)->value('nombre') : null;
        $hermanos = CambiosFicha::otrosEstudiantes($acudientes->pluck('id'), $alumno->id, Alcance::sedes(request()->user()));
        $ediciones = CambiosFicha::ultimas($alumno->id, $acudientes->pluck('id'));
        $alumno->ultima_edicion = $ediciones['estudiante'];
        foreach ($acudientes as $a) {
            $a->otros_estudiantes = $hermanos->get($a->id, collect())->values();
            $a->ultima_edicion = $ediciones['acudientes'][$a->id] ?? null;
        }

        $boletines = $actual
            ? DB::table('boletines_excel')->where('matricula_id', $actual->id)->orderBy('numero')->get(['numero', 'valor'])
            : collect();

        $promocion = DB::table('matriculas as m')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->join('sedes as s', 's.id', '=', 'm.sede_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->where('m.estudiante_id', $alumno->id)
            ->where('al.estado', 'planeado')
            // Solo si es posterior al que se está viendo (viendo 2027, no hay «año siguiente» que mostrar).
            ->where('al.anio', '>', $actual?->anio ?? 0)
            ->orderBy('al.anio')
            ->first(['al.anio', 'gr.id as grado_id', 'gr.nombre as grado', 'g.codigo as grupo', 's.nombre as sede', 's.codigo as sede_codigo', 'm.jornada', 'm.condicion']);

        $novedades = $actual
            ? DB::table('novedades_matricula as n')
                ->leftJoin('users as u', 'u.id', '=', 'n.user_id')
                ->where('n.matricula_id', $actual->id)
                ->orderByDesc('n.id')
                ->get(['n.id', 'n.tipo', 'n.estado_nuevo', 'n.razon', 'n.fecha', 'n.created_at', 'u.name as usuario'])
            : collect();

        // Para cambiar de grupo, grado o sede sin devolver a inscritos: todos los
        // grupos del año en curso dentro del alcance del usuario (de cualquier grado),
        // agrupados por sede. Solo cuando la matrícula actual es del año activo y está activa.
        $sedes = null;
        if ($actual && $actual->estado === 'activo' && $actual->estado_anio === 'activo') {
            $sedes = DB::table('grupos as g')
                ->join('sedes as s', 's.id', '=', 'g.sede_id')
                ->join('grados as gr', 'gr.id', '=', 'g.grado_id')
                ->where('g.anio_lectivo_id', $actual->anio_lectivo_id)
                ->tap(fn ($q) => Alcance::filtrar($q, request()->user(), 'g.sede_id', 'g.grado_id'))
                ->orderBy('s.codigo')
                ->orderBy('gr.numero')
                ->orderBy('g.numero')
                ->get(['g.id', 'g.codigo', 'g.grado_id', 'gr.nombre as grado_nombre', 'gr.numero as grado_numero', 's.id as sede_id', 's.codigo as sede_codigo', 's.nombre as sede_nombre'])
                ->groupBy('sede_id')
                ->map(fn ($grupos, $sedeId) => [
                    'id' => (int) $sedeId,
                    'codigo' => $grupos->first()->sede_codigo,
                    'nombre' => $grupos->first()->sede_nombre,
                    'grupos' => $grupos->map(fn ($g) => [
                        'id' => $g->id,
                        'codigo' => $g->codigo,
                        'grado_id' => $g->grado_id,
                        'grado' => $g->grado_nombre,
                        'grado_numero' => (int) $g->grado_numero,
                    ])->values(),
                ])
                ->values();
        }

        return [
            'estudiante' => $alumno,
            'actual' => $actual,
            // Transición del año en curso: escribe e imprime su boletín (ver BoletinController).
            'boletin' => $actual && request()->user()->can('escribir-boletines') && (int) $actual->grado_numero === Boletines::GRADO && $actual->estado === 'activo'
                && $actual->grupo_id !== null && Alcance::puedeVer(request()->user(), $actual->sede_id, $actual->grado_id)
                && DB::table('anios_lectivos')->where('anio', $actual->anio)->value('estado') === 'activo',
            'documentos' => $actual ? self::documentos($actual->id, (int) $actual->grado_numero, $alumno) : null,
            // Alerta de edad para el grado de la matrícula (tabla de edades de la institución).
            'edad' => $actual ? Edades::alerta($alumno->fecha_nacimiento, (int) $actual->grado_numero, (int) $actual->anio) : null,
            'novedades' => $novedades,
            // Matrícula del año siguiente, si ya fue promovido.
            'promocion' => $promocion,
            // Si la matrícula vino de una inscripción: se puede devolver a inscritos.
            'inscripcion' => $actual && request()->user()->can('matricular')
                ? DB::table('solicitudes_inscripcion')->where('matricula_id', $actual->id)->where('estado', 'aprobada')->value('id')
                : null,
            'historia' => $historia,
            'acudientes' => $acudientes,
            'boletines' => $boletines,
            // Grupos del año (de cualquier grado, por sede, dentro del alcance) para cambiar de grupo, grado o sede.
            'sedes' => $sedes,
            'parentescos' => DB::table('parentescos')->orderBy('id')->get(['id', 'nombre']),
        ];
    }

    /**
     * Los documentos de matrícula de la matrícula actual: la lista que le toca por
     * su grado y cuáles se recibieron. Los que falten se marcan desde la ficha.
     *
     * @return array<string, mixed>
     */
    public static function documentos(int $matriculaId, int $grado, object $alumno): array
    {
        $m = DB::table('matriculas')->where('id', $matriculaId)->first(['documentos', 'documentos_por', 'documentos_en']);
        $marcados = json_decode($m->documentos ?? '[]', true) ?: [];

        return [
            'lista' => array_map(fn (array $d) => [...$d, 'estado' => $marcados[$d['clave']] ?? null],
                Documentos::lista($grado, $alumno->tipo_documento, $alumno->eps)),
            'registro' => $m->documentos_en ? [
                'por' => $m->documentos_por ? DB::table('users')->where('id', $m->documentos_por)->value('name') : null,
                'en' => CarbonImmutable::parse($m->documentos_en)->toIso8601String(),
            ] : null,
        ];
    }

    /**
     * Búsqueda global por nombre o documento, con la matrícula del año consultado.
     */
    private function buscar(string $texto, ?int $anioId, ?User $user): array
    {
        $texto = trim($texto);
        if (mb_strlen($texto) < 2) {
            return [];
        }

        return DB::table('estudiantes as e')
            ->leftJoin('matriculas as m', function ($join) use ($anioId) {
                $join->on('m.estudiante_id', '=', 'e.id')->where('m.anio_lectivo_id', $anioId);
            })
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('sedes as s', 's.id', '=', 'm.sede_id')
            ->whereNull('e.deleted_at')
            // Solo estudiantes que tienen (o tuvieron) matrícula en las sedes (y grados) del usuario.
            ->when(! Alcance::todas($user), fn ($q) => $q->whereExists(fn ($s) => Alcance::filtrar($s->from('matriculas as mp')
                ->whereColumn('mp.estudiante_id', 'e.id'), $user, 'mp.sede_id', 'mp.grado_id')))
            ->where(fn ($q) => $q->where('e.nombre_completo', 'like', "%{$texto}%")->orWhere('e.numero_documento', 'like', "{$texto}%"))
            ->orderBy('e.nombre_completo')
            ->limit(12)
            ->get(['e.id', 'e.nombre_completo as nombre', 'e.tipo_documento', 'e.numero_documento', 'm.grado_id', 'g.codigo as grupo', 's.nombre as sede', 's.codigo as sede_codigo', 'm.estado'])
            ->all();
    }
}
