<?php

namespace App\Http\Controllers;

use App\Support\CambiosFicha;
use App\Support\Grupos;
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

        // Filtro por sede (?sede=LF). Sin él, todas. Se ofrecen las sedes con
        // su número de activos en el año, para mostrarlo en el selector.
        $sedes = DB::table('sedes as s')
            ->leftJoin('matriculas as m', fn ($j) => $j->on('m.sede_id', '=', 's.id')->where('m.anio_lectivo_id', $anio?->id)->where('m.estado', 'activo'))
            ->groupBy('s.id', 's.codigo', 's.nombre', 's.es_principal')
            ->orderByDesc('s.es_principal')
            ->orderBy('s.nombre')
            ->selectRaw('s.id, s.codigo, s.nombre, count(m.id) as activos')
            ->get();
        $sede = $sedes->firstWhere('codigo', (string) $request->query('sede'));
        $enSede = fn ($q, string $columna = 'sede_id') => $q->when($sede, fn ($q) => $q->where($columna, $sede->id));

        $resumenPorGrado = DB::table('matriculas')
            ->where('anio_lectivo_id', $anio?->id)
            ->tap(fn ($q) => $enSede($q))
            ->groupBy('grado_id')
            ->selectRaw("grado_id, count(*) as total, sum(estado = 'activo') as activos, count(distinct grupo_id) as grupos")
            ->get()
            ->keyBy('grado_id');

        $grados = DB::table('grados')->orderBy('numero')->get()->map(fn ($g) => [
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

        $grupos = Grupos::conOcupacion($anio?->id, $gradoId, $sede?->id);

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
            ->tap(fn ($q) => $enSede($q, 'm.sede_id'))
            ->whereNull('e.deleted_at')
            ->orderBy('e.nombre_completo')
            ->get([
                'e.id', 'e.nombre_completo as nombre', 'e.tipo_documento', 'e.numero_documento', 'e.genero',
                'm.grupo_id', 'g.codigo as grupo', 's.nombre as sede', 's.codigo as sede_codigo', 'm.jornada', 'mo.nombre as modalidad',
                'm.condicion', 'm.estado', 'a.nombre_completo as acudiente',
                DB::raw('coalesce(a.telefono_celular, a.telefono_fijo) as telefono'),
                'gsig.codigo as promovido_a',
            ]);

        return Inertia::render('estudiantes/index', [
            'anios' => $anios,
            'anio' => $anio?->anio,
            'sedes' => $sedes->map(fn ($s) => ['codigo' => $s->codigo, 'nombre' => $s->nombre, 'activos' => (int) $s->activos]),
            'sede' => $sede?->codigo,
            'grados' => $grados,
            'gradoId' => $gradoId,
            'totales' => array_map('intval', (array) $totales),
            'grupos' => $grupos,
            'estudiantes' => $estudiantes,
            'busqueda' => Inertia::optional(fn () => $this->buscar((string) $request->query('q'), $anio?->id)),
            // Ficha del estudiante seleccionado (?ver=ID), que se muestra al lado
            // de la lista sin salir de la página. Solo se consulta si hay uno.
            'detalle' => fn () => $request->filled('ver') ? $this->ficha((int) $request->query('ver')) : null,
        ]);
    }

    /**
     * Ficha de matrícula del estudiante (equivale a la hoja CONSTANCIA DE MATRÍCULA del Excel).
     */
    public function show(int $estudiante): Response
    {
        $ficha = $this->ficha($estudiante);
        abort_if(! $ficha, 404);

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
     * @return array<string, mixed>|null
     */
    private function ficha(int $estudiante): ?array
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
            ->where('al.estado', '<>', 'planeado')
            ->orderByDesc('al.anio')
            ->get([
                'm.id', 'al.anio', 'gr.id as grado_id', 'gr.nombre as grado', 'gr.numero as grado_numero', 'g.codigo as grupo',
                's.nombre as sede', 's.codigo as sede_codigo', 'm.jornada', 'mo.nombre as modalidad',
                'm.fecha_matricula', 'm.condicion', 'm.estado', 'm.es_historico', 'm.observaciones',
                'm.fecha_retiro', 'm.motivo_retiro',
            ]);

        $actual = $historia->first();

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
        $hermanos = CambiosFicha::otrosEstudiantes($acudientes->pluck('id'), $alumno->id);
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
            ->orderBy('al.anio')
            ->first(['al.anio', 'gr.id as grado_id', 'gr.nombre as grado', 'g.codigo as grupo', 's.nombre as sede', 's.codigo as sede_codigo', 'm.jornada']);

        $novedades = $actual
            ? DB::table('novedades_matricula as n')
                ->leftJoin('users as u', 'u.id', '=', 'n.user_id')
                ->where('n.matricula_id', $actual->id)
                ->orderByDesc('n.id')
                ->get(['n.id', 'n.tipo', 'n.estado_nuevo', 'n.razon', 'n.fecha', 'n.created_at', 'u.name as usuario'])
            : collect();

        return [
            'estudiante' => $alumno,
            'actual' => $actual,
            'novedades' => $novedades,
            // Matrícula del año siguiente, si ya fue promovido.
            'promocion' => $promocion,
            'historia' => $historia,
            'acudientes' => $acudientes,
            'boletines' => $boletines,
            'parentescos' => DB::table('parentescos')->orderBy('id')->get(['id', 'nombre']),
        ];
    }

    /**
     * Búsqueda global por nombre o documento, con la matrícula del año consultado.
     */
    private function buscar(string $texto, ?int $anioId): array
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
            ->where(fn ($q) => $q->where('e.nombre_completo', 'like', "%{$texto}%")->orWhere('e.numero_documento', 'like', "{$texto}%"))
            ->orderBy('e.nombre_completo')
            ->limit(12)
            ->get(['e.id', 'e.nombre_completo as nombre', 'e.tipo_documento', 'e.numero_documento', 'm.grado_id', 'g.codigo as grupo', 's.nombre as sede', 's.codigo as sede_codigo', 'm.estado'])
            ->all();
    }
}
