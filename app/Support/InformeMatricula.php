<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Informe de matrícula de un año lectivo: todo el colegio, en cifras, más el
 * listado de estudiantes activos por grupo (el anexo).
 *
 * Se trae el año en una sola consulta y se agrupa aquí, en PHP: son unos miles
 * de filas y así el cálculo es el mismo en MySQL y en las pruebas (SQLite).
 *
 * Edad y extraedad: la edad se toma al 31 de marzo del año lectivo. La edad
 * esperada es 5 años en Transición y uno más por grado (6 en Primero… 16 en
 * Undécimo); está en extraedad quien tiene 2 o más años por encima.
 */
final class InformeMatricula
{
    private const EDAD_TRANSICION = 5;

    private const AÑOS_DE_EXTRAEDAD = 2;

    private const NIVELES = ['preescolar' => 'Preescolar', 'primaria' => 'Primaria', 'secundaria' => 'Secundaria', 'media' => 'Media'];

    /** Datos del estudiante que el informe no muestra si faltan en más de la mitad de los activos. */
    private const OPCIONALES = [
        'eps' => 'EPS', 'sisben' => 'SISBÉN', 'grupo_etnico' => 'grupo étnico', 'discapacidad' => 'discapacidad',
        'barrio_id' => 'barrio', 'tipo_sangre' => 'tipo de sangre',
    ];

    private CarbonImmutable $referencia;

    /** @param  list<int>|null  $sedes  las sedes que puede ver quien pide el informe (null = todas) */
    private function __construct(private object $anio, private ?array $sedes = null)
    {
        $this->referencia = CarbonImmutable::create($anio->anio, 3, 31);
    }

    /** @return array<string, mixed>|null null si el año no existe */
    public static function del(int $anio, ?array $sedes = null): ?array
    {
        $fila = DB::table('anios_lectivos')->where('anio', $anio)->first(['id', 'anio']);

        return $fila ? (new self($fila, $sedes))->armar() : null;
    }

    /** @return array<string, mixed> */
    private function armar(): array
    {
        $matriculas = $this->matriculas();
        $activas = $matriculas->where('estado', 'activo')->values();
        $grupos = $this->grupos($activas);

        return [
            'institucion' => DB::table('instituciones')->first(['nombre', 'municipio', 'codigo_dane']),
            'anio' => $this->anio->anio,
            'anios' => DB::table('anios_lectivos')->orderByDesc('anio')->pluck('anio'),
            'corte' => now()->toIso8601String(),
            'totales' => $this->totales($matriculas, $activas, $grupos),
            'sedes' => $this->porSede($activas, $grupos),
            'jornadas' => $activas->countBy('jornada')->map(fn ($n, $j) => ['nombre' => $j ?: 'Sin jornada', 'activos' => $n])->sortByDesc('activos')->values(),
            'niveles' => $this->porNivel($activas, $grupos),
            'grados' => $this->porGrado($matriculas, $grupos),
            'grupos' => $grupos->values(),
            'modalidades' => $this->modalidades($activas),
            'parentescos' => $activas->countBy(fn ($m) => $m->parentesco ?? 'Sin acudiente registrado')
                ->map(fn ($n, $p) => ['nombre' => $p, 'n' => $n])->sortByDesc('n')->values(),
            'porMes' => $matriculas->filter(fn ($m) => $m->fecha_matricula)
                ->countBy(fn ($m) => substr($m->fecha_matricula, 0, 7))
                ->sortKeys()->map(fn ($n, $mes) => ['mes' => $mes, 'n' => $n])->values(),
            'sinFecha' => $matriculas->whereNull('fecha_matricula')->count(),
            'inscripciones' => $this->inscripciones(),
            // Para la nota "Sobre los datos": lo que casi nadie tiene registrado.
            'sinRegistrar' => collect(self::OPCIONALES)
                ->filter(fn ($etiqueta, $campo) => $activas->filter(fn ($m) => filled($m->{$campo}))->count() < $activas->count() / 2)
                ->values(),
            'anexo' => $this->anexo($activas, $grupos),
        ];
    }

    /** Todas las matrículas del año, con lo que el informe necesita de cada una. */
    private function matriculas(): Collection
    {
        return DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('sedes as s', 's.id', '=', 'm.sede_id')
            ->leftJoin('modalidades as mo', 'mo.id', '=', 'm.modalidad_id')
            ->leftJoin('estudiante_acudiente as ea', function ($join) {
                $join->on('ea.estudiante_id', '=', 'e.id')->where('ea.es_principal', true);
            })
            ->leftJoin('acudientes as a', 'a.id', '=', 'ea.acudiente_id')
            ->leftJoin('parentescos as p', 'p.id', '=', 'ea.parentesco_id')
            ->where('m.anio_lectivo_id', $this->anio->id)
            ->when($this->sedes !== null, fn ($q) => $q->whereIn('m.sede_id', $this->sedes))
            ->whereNull('e.deleted_at')
            ->orderBy('e.nombre_completo')
            ->get([
                'm.id', 'm.estado', 'm.condicion', 'm.grupo_id', 'm.fecha_matricula',
                DB::raw('coalesce(m.jornada, g.jornada) as jornada'),
                'gr.numero as grado', 'gr.nombre as grado_nombre', 'gr.nivel',
                's.codigo as sede_codigo', 's.nombre as sede',
                'mo.nombre as modalidad',
                'e.nombre_completo as nombre', 'e.tipo_documento', 'e.numero_documento', 'e.genero', 'e.fecha_nacimiento',
                'e.eps', 'e.sisben', 'e.grupo_etnico', 'e.discapacidad', 'e.barrio_id', 'e.tipo_sangre',
                'a.nombre_completo as acudiente', 'p.nombre as parentesco',
                DB::raw('coalesce(a.telefono_celular, a.telefono_fijo) as telefono'),
            ])
            ->each(function ($m) {
                $m->edad = $this->edad($m->fecha_nacimiento);
                $m->extraedad = $m->edad !== null && $m->edad - ($m->grado + self::EDAD_TRANSICION) >= self::AÑOS_DE_EXTRAEDAD;
            });
    }

    /** Edad cumplida al 31 de marzo del año lectivo. */
    private function edad(?string $nacimiento): ?int
    {
        if (! $nacimiento) {
            return null;
        }
        $n = CarbonImmutable::parse($nacimiento);
        $r = $this->referencia;

        return $r->year - $n->year - (($r->month < $n->month || ($r->month === $n->month && $r->day < $n->day)) ? 1 : 0);
    }

    /** Los grupos del año (también los que no tienen estudiantes), con sus cifras. */
    private function grupos(Collection $activas): Collection
    {
        $porGrupo = $activas->groupBy('grupo_id');

        return DB::table('grupos as g')
            ->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->join('sedes as s', 's.id', '=', 'g.sede_id')
            ->where('g.anio_lectivo_id', $this->anio->id)
            ->when($this->sedes !== null, fn ($q) => $q->whereIn('g.sede_id', $this->sedes))
            ->orderBy('gr.numero')->orderByDesc('s.es_principal')->orderBy('s.nombre')->orderBy('g.numero')
            ->get(['g.id', 'g.codigo', 'g.jornada', 'g.cupos_proyectados as cupos', 'gr.numero as grado', 'gr.nombre as grado_nombre', 'gr.nivel',
                's.codigo as sede_codigo', 's.nombre as sede'])
            ->keyBy('id')
            ->map(function ($g) use ($porGrupo) {
                $de = $porGrupo->get($g->id, collect());
                $g->cupos = (int) $g->cupos;
                $g->activos = $de->count();
                $g->nuevos = $de->where('condicion', 'nuevo')->count();
                $g->repitentes = $de->where('condicion', 'repitente')->count();
                $g->ninas = $de->where('genero', 'F')->count();
                $g->ninos = $de->where('genero', 'M')->count();

                return $g;
            });
    }

    /** @return array<string, int|float|null> */
    private function totales(Collection $matriculas, Collection $activas, Collection $grupos): array
    {
        $conEdad = $activas->whereNotNull('edad');

        return [
            'matriculas' => $matriculas->count(),
            'activos' => $activas->count(),
            'nuevos' => $activas->where('condicion', 'nuevo')->count(),
            'antiguos' => $activas->where('condicion', 'antiguo')->count(),
            'repitentes' => $activas->where('condicion', 'repitente')->count(),
            'retirados' => $matriculas->where('estado', 'retirado')->count(),
            'cancelados' => $matriculas->where('estado', 'cancelado')->count(),
            'otrosEstados' => $matriculas->whereNotIn('estado', ['activo', 'retirado', 'cancelado'])->count(),
            'cupos' => $grupos->sum('cupos'),
            'grupos' => $grupos->count(),
            'sedes' => $activas->pluck('sede_codigo')->filter()->unique()->count(),
            'ninas' => $activas->where('genero', 'F')->count(),
            'ninos' => $activas->where('genero', 'M')->count(),
            'extraedad' => $activas->where('extraedad', true)->count(),
            'conEdad' => $conEdad->count(),
            'edadPromedio' => $conEdad->count() ? round($conEdad->avg('edad'), 1) : null,
            'conAcudiente' => $activas->whereNotNull('acudiente')->count(),
            'conTelefono' => $activas->filter(fn ($m) => filled($m->telefono))->count(),
        ];
    }

    private function porSede(Collection $activas, Collection $grupos): Collection
    {
        $gruposPorSede = $grupos->groupBy('sede_codigo');

        return $activas->groupBy('sede_codigo')->map(fn (Collection $de, $codigo) => [
            'codigo' => $codigo,
            'nombre' => $de->first()->sede,
            'activos' => $de->count(),
            'grupos' => $gruposPorSede->get($codigo, collect())->count(),
            'cupos' => $gruposPorSede->get($codigo, collect())->sum('cupos'),
            'nuevos' => $de->where('condicion', 'nuevo')->count(),
            'ninas' => $de->where('genero', 'F')->count(),
            'ninos' => $de->where('genero', 'M')->count(),
            'jornadas' => $de->countBy(fn ($m) => $m->jornada ?: 'Sin jornada'),
            'grados' => $de->pluck('grado')->unique()->sort()->values(),
        ])->sortByDesc('activos')->values();
    }

    private function porNivel(Collection $activas, Collection $grupos): Collection
    {
        return collect(self::NIVELES)->map(fn ($nombre, $clave) => [
            'clave' => $clave,
            'nombre' => $nombre,
            'activos' => $activas->where('nivel', $clave)->count(),
            'grupos' => $grupos->where('nivel', $clave)->count(),
        ])->filter(fn ($n) => $n['activos'] > 0)->values();
    }

    private function porGrado(Collection $matriculas, Collection $grupos): Collection
    {
        return $matriculas->groupBy('grado')->sortKeys()->map(function (Collection $del, $numero) use ($grupos) {
            $activas = $del->where('estado', 'activo');
            $conEdad = $activas->whereNotNull('edad');
            $gruposDelGrado = $grupos->where('grado', $numero);

            return [
                'numero' => (int) $numero,
                'nombre' => $del->first()->grado_nombre,
                'nivel' => $del->first()->nivel,
                'grupos' => $gruposDelGrado->count(),
                'cupos' => $gruposDelGrado->sum('cupos'),
                'activos' => $activas->count(),
                'nuevos' => $activas->where('condicion', 'nuevo')->count(),
                'repitentes' => $activas->where('condicion', 'repitente')->count(),
                'retirados' => $del->where('estado', 'retirado')->count(),
                'cancelados' => $del->where('estado', 'cancelado')->count(),
                'ninas' => $activas->where('genero', 'F')->count(),
                'ninos' => $activas->where('genero', 'M')->count(),
                'edadEsperada' => (int) $numero + self::EDAD_TRANSICION,
                'edadPromedio' => $conEdad->count() ? round($conEdad->avg('edad'), 1) : null,
                'extraedad' => $activas->where('extraedad', true)->count(),
            ];
        })->values();
    }

    /** Media técnica: estudiantes activos por modalidad en Décimo y Undécimo. */
    private function modalidades(Collection $activas): Collection
    {
        return $activas->whereNotNull('modalidad')->groupBy('modalidad')->map(fn (Collection $de, $nombre) => [
            'nombre' => $nombre,
            'decimo' => $de->where('grado', 10)->count(),
            'undecimo' => $de->where('grado', 11)->count(),
            'total' => $de->count(),
        ])->sortByDesc('total')->values();
    }

    /** Solicitudes del formulario público para este año. */
    private function inscripciones(): array
    {
        $solicitudes = DB::table('solicitudes_inscripcion as si')
            ->join('grados as gr', 'gr.id', '=', 'si.grado_id')
            ->where('si.anio_lectivo_id', $this->anio->id)
            ->tap(fn ($q) => Alcance::filtrarSolicitudes($q, request()->user(), 'si'))
            ->get(['si.estado', 'gr.numero as grado']);

        return [
            'total' => $solicitudes->count(),
            'porEstado' => $solicitudes->countBy('estado'),
        ];
    }

    /** Estudiantes activos de cada grupo, en el orden de los grupos. */
    private function anexo(Collection $activas, Collection $grupos): Collection
    {
        $porGrupo = $activas->groupBy('grupo_id');

        return $grupos->map(fn ($g) => [
            'grupo' => $g->id,
            'estudiantes' => $porGrupo->get($g->id, collect())->map(fn ($m) => [
                'nombre' => $m->nombre,
                'documento' => trim("{$m->tipo_documento} {$m->numero_documento}"),
                'edad' => $m->edad,
                'extraedad' => $m->extraedad,
                'sexo' => $m->genero,
                'condicion' => $m->condicion,
                'modalidad' => $m->modalidad,
                'acudiente' => $m->acudiente,
                'parentesco' => $m->parentesco,
                'telefono' => $m->telefono,
            ])->values(),
        ])->filter(fn ($g) => $g['estudiantes']->isNotEmpty())->values();
    }
}
