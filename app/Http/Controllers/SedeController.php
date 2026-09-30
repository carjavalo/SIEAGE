<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Las sedes del colegio y, de cada una, sus grupos en el año lectivo que se
 * consulta. Desde aquí se crean las sedes y sus grupos (GrupoController); antes
 * los grupos solo nacían al importar el Excel o al promover.
 */
class SedeController extends Controller
{
    /** Las del ENUM de grupos.jornada. */
    public const JORNADAS = ['Mañana', 'Tarde', 'Única', 'Noche'];

    private const MENSAJES = [
        'required' => 'Este campo es obligatorio.',
        'max' => 'Máximo :max caracteres.',
        'codigo.regex' => 'Hasta 5 letras o números, sin espacios.',
        'string' => 'Revisa este campo.',
    ];

    public function index(Request $request): Response
    {
        $anios = DB::table('anios_lectivos')->orderByDesc('anio')->get(['id', 'anio', 'estado']);
        $anio = $anios->firstWhere('anio', (int) $request->query('anio'))
            ?? $anios->firstWhere('estado', 'activo')
            ?? $anios->first();

        $grupos = DB::table('grupos as g')
            ->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->leftJoin('matriculas as m', 'm.grupo_id', '=', 'g.id')
            ->where('g.anio_lectivo_id', $anio?->id)
            ->groupBy('g.id', 'g.sede_id', 'g.codigo', 'g.numero', 'g.jornada', 'g.cupos_proyectados', 'gr.id', 'gr.numero', 'gr.nombre')
            ->orderBy('gr.numero')
            ->orderBy('g.numero')
            ->selectRaw("g.id, g.sede_id, g.codigo, g.numero, g.jornada, g.cupos_proyectados as cupos,
                gr.id as grado_id, gr.numero as grado_numero, gr.nombre as grado,
                sum(m.estado = 'activo') as activos, count(m.id) as matriculas")
            ->get()
            ->map(fn ($g) => [...(array) $g, 'activos' => (int) $g->activos, 'matriculas' => (int) $g->matriculas, 'cupos' => (int) $g->cupos])
            ->groupBy('sede_id');

        // Los activos de la sede en el año, tengan grupo o no.
        $activos = DB::table('matriculas')
            ->where('anio_lectivo_id', $anio?->id)
            ->where('estado', 'activo')
            ->groupBy('sede_id')
            ->selectRaw('sede_id, count(*) as n, sum(grupo_id is null) as sin_grupo')
            ->get()
            ->keyBy('sede_id');

        // Una sede con historia (grupos o matrículas de cualquier año) no se puede eliminar.
        $enUso = DB::table('grupos')->distinct()->pluck('sede_id')->merge(DB::table('matriculas')->distinct()->pluck('sede_id'))->unique();

        $sedes = DB::table('sedes')->orderByDesc('es_principal')->orderBy('id')->get()->map(fn ($s) => [
            'id' => $s->id,
            'codigo' => $s->codigo,
            'nombre' => $s->nombre,
            'direccion' => $s->direccion,
            'es_principal' => (bool) $s->es_principal,
            'estudiantes' => (int) ($activos[$s->id]->n ?? 0),
            'sin_grupo' => (int) ($activos[$s->id]->sin_grupo ?? 0),
            'grupos' => $grupos->get($s->id, collect())->values(),
            'se_puede_eliminar' => ! $enUso->contains($s->id),
        ]);

        return Inertia::render('sedes/index', [
            'anios' => $anios,
            'anio' => $anio?->anio,
            // En un año cerrado solo se consulta.
            'editable' => $anio?->estado !== 'cerrado',
            'sedes' => $sedes,
            'grados' => DB::table('grados')->orderBy('numero')->get(['id', 'numero', 'nombre']),
            'jornadas' => self::JORNADAS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $this->validar($request);

        DB::table('sedes')->insert([
            ...$datos,
            'institucion_id' => DB::table('instituciones')->value('id'),
            'es_principal' => false,
            'activa' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Sede {$datos['nombre']} creada. Ahora agrégale sus grupos.");
    }

    public function update(Request $request, int $sede): RedirectResponse
    {
        $actual = DB::table('sedes')->find($sede) ?? abort(404);
        $datos = $this->validar($request, $actual->id);

        DB::table('sedes')->where('id', $actual->id)->update([...$datos, 'updated_at' => now()]);

        return back()->with('success', "Sede {$datos['nombre']} actualizada.");
    }

    public function destroy(int $sede): RedirectResponse
    {
        $actual = DB::table('sedes')->find($sede) ?? abort(404);

        if (DB::table('grupos')->where('sede_id', $actual->id)->exists() || DB::table('matriculas')->where('sede_id', $actual->id)->exists()) {
            throw ValidationException::withMessages(['eliminar' => 'Esta sede tiene grupos o estudiantes registrados: no se puede eliminar.']);
        }

        DB::table('sedes')->where('id', $actual->id)->delete();

        return back()->with('success', "Sede {$actual->nombre} eliminada.");
    }

    /**
     * Nombre y código únicos en el colegio, sin distinguir mayúsculas. El código
     * se guarda en mayúsculas: es el que sale junto a cada grupo en el libro de Excel.
     *
     * @return array{nombre: string, codigo: string, direccion: ?string}
     */
    private function validar(Request $request, ?int $excepto = null): array
    {
        $limpio = fn (string $campo) => preg_replace('/\s+/u', ' ', trim((string) $request->input($campo))) ?: null;
        $d = ['nombre' => $limpio('nombre'), 'codigo' => mb_strtoupper((string) $limpio('codigo')) ?: null, 'direccion' => $limpio('direccion')];

        $datos = validator($d, [
            'nombre' => ['required', 'string', 'max:80'],
            'codigo' => ['required', 'string', 'regex:/^[A-Z0-9]{1,5}$/'],
            'direccion' => ['nullable', 'string', 'max:150'],
        ], self::MENSAJES)->validate();

        $otras = DB::table('sedes')->when($excepto, fn ($q) => $q->where('id', '<>', $excepto))->get(['nombre', 'codigo']);
        $repetido = array_filter([
            'nombre' => $otras->contains(fn ($s) => mb_strtolower($s->nombre) === mb_strtolower($datos['nombre'])) ? 'Ya hay una sede con ese nombre.' : null,
            'codigo' => $otras->contains(fn ($s) => mb_strtoupper($s->codigo) === $datos['codigo']) ? 'Ese código ya lo usa otra sede.' : null,
        ]);
        if ($repetido) {
            throw ValidationException::withMessages($repetido);
        }

        return ['nombre' => $datos['nombre'], 'codigo' => $datos['codigo'], 'direccion' => $datos['direccion'] ?? null];
    }
}
