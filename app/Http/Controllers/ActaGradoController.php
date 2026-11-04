<?php

namespace App\Http\Controllers;

use App\Support\ActasGrado;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Actas de grado y diplomas de undécimo para imprimir: por programa (cada modalidad
 * técnica y los ciclos sabatinos), de todos los graduandos o de uno. Los datos de la
 * ceremonia (fecha, firmas, número de acta, libro, folio y con quién comienza y se
 * cierra cada acta) se guardan por año.
 */
class ActaGradoController extends Controller
{
    /** Quiénes firman por defecto (como en las actas de 2024); se cambian en «Datos del grado». */
    private const RECTOR = 'Betty Rodríguez Chávez';

    private const SECRETARIO = 'Jhon Jairo Franco Caicedo';

    public function index(Request $request): Response
    {
        $anio = $this->anio($request->query('anio'));

        return Inertia::render('actas-grado/index', [
            'anio' => (int) $anio->anio,
            ...ActasGrado::del($anio->id),
            'graduacion' => $this->graduacion($anio->id),
            'institucion' => DB::table('instituciones')->first(['nombre', 'codigo_dane', 'municipio']),
            'volver' => '/estudiantes?'.http_build_query(['anio' => $anio->anio, 'grado' => DB::table('grados')->where('numero', 11)->value('id')]),
        ]);
    }

    public function guardar(Request $request, int $anio): RedirectResponse
    {
        $anio = $this->anio($anio);
        $datos = $request->validate([
            'fecha' => ['nullable', 'date'],
            'rector' => ['nullable', 'string', 'max:120'],
            'cargo_rector' => ['required', 'string', 'max:60'],
            'secretario' => ['nullable', 'string', 'max:120'],
            'cargo_secretario' => ['required', 'string', 'max:60'],
            'actas' => ['array'],
            'actas.*' => ['array'],
            'actas.*.acta' => ['nullable', 'string', 'max:20'],
            'actas.*.libro' => ['nullable', 'string', 'max:20'],
            'actas.*.folio' => ['nullable', 'string', 'max:20'],
            // Con qué nombre comienza y se cierra el acta general; vacío, el primero y el último de la lista.
            'actas.*.primero' => ['nullable', 'string', 'max:150'],
            'actas.*.ultimo' => ['nullable', 'string', 'max:150'],
        ]);
        // Solo las claves de programa conocidas y los tres campos de cada una.
        $actas = collect($datos['actas'] ?? [])
            ->filter(fn ($v, $k) => $k === ActasGrado::CICLOS || preg_match('/^modalidad-\d+$/', (string) $k))
            ->map(fn ($v) => array_map(fn ($c) => trim((string) ($v[$c] ?? '')) ?: null, ['acta' => 'acta', 'libro' => 'libro', 'folio' => 'folio', 'primero' => 'primero', 'ultimo' => 'ultimo']));

        DB::table('graduaciones')->updateOrInsert(['anio_lectivo_id' => $anio->id], [
            'fecha' => $datos['fecha'] ?? null,
            'rector' => trim((string) ($datos['rector'] ?? '')) ?: null,
            'cargo_rector' => trim($datos['cargo_rector']),
            'secretario' => trim((string) ($datos['secretario'] ?? '')) ?: null,
            'cargo_secretario' => trim($datos['cargo_secretario']),
            'actas' => json_encode($actas, JSON_UNESCAPED_UNICODE),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Se guardaron los datos del grado.');
    }

    private function anio(mixed $anio): object
    {
        $fila = $anio ? DB::table('anios_lectivos')->where('anio', (int) $anio)->first() : DB::table('anios_lectivos')->where('estado', 'activo')->first();
        abort_unless($fila, 404);

        return $fila;
    }

    /** @return array<string, mixed> */
    private function graduacion(int $anioId): array
    {
        $g = DB::table('graduaciones')->where('anio_lectivo_id', $anioId)->first();

        return [
            'fecha' => $g?->fecha ? substr((string) $g->fecha, 0, 10) : null,
            // Mientras no se guarden los del año, los que firman las actas de siempre.
            'rector' => $g ? $g->rector : self::RECTOR,
            'cargo_rector' => $g?->cargo_rector ?? 'Rectora',
            'secretario' => $g ? $g->secretario : self::SECRETARIO,
            'cargo_secretario' => $g?->cargo_secretario ?? 'Secretario Académico',
            'actas' => (object) ($g?->actas ? json_decode($g->actas, true) : []),
        ];
    }
}
