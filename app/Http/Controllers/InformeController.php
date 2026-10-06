<?php

namespace App\Http\Controllers;

use App\Support\Alcance;
use App\Support\InformeMatricula;
use App\Support\LibroMatriculaSede;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Informe de matrícula del año: una vista previa hoja por hoja (A4) que se
 * guarda como PDF desde el cuadro de impresión del navegador; y el libro de
 * matrícula de cada sede en Excel, con el formato que el colegio ya usa.
 */
class InformeController extends Controller
{
    /** Todo el colegio, o solo una sede (?sede=P), un grado (?grado=ID) y un grupo (?grupo=ID). */
    public function matricula(Request $request): Response
    {
        $filtros = $request->validate([
            'anio' => ['nullable', 'integer'],
            'sede' => ['nullable', 'string', 'max:5'],
            'grado' => ['nullable', 'integer'],
            'grupo' => ['nullable', 'integer'],
        ]);
        $anio = (int) ($filtros['anio'] ?? null ?: DB::table('anios_lectivos')->where('estado', 'activo')->value('anio'));
        $permitidas = Alcance::sedes($request->user());

        // Un grupo ya dice su sede y su grado.
        $grupo = null;
        if (! empty($filtros['grupo'])) {
            $grupo = DB::table('grupos as g')
                ->join('anios_lectivos as al', 'al.id', '=', 'g.anio_lectivo_id')
                ->join('sedes as s', 's.id', '=', 'g.sede_id')
                ->where('g.id', $filtros['grupo'])->where('al.anio', $anio)
                ->first(['g.id', 'g.codigo', 'g.grado_id', 's.codigo as sede']) ?? abort(404);
            $filtros['sede'] = $grupo->sede;
            $filtros['grado'] = $grupo->grado_id;
        }

        $sede = null;
        if (! empty($filtros['sede'])) {
            $sede = DB::table('sedes')->where('codigo', $filtros['sede'])->first(['id', 'codigo', 'nombre']) ?? abort(404);
            Alcance::exigirSede($request->user(), $sede->id);
        }
        $grado = ! empty($filtros['grado']) ? (DB::table('grados')->where('id', $filtros['grado'])->first(['id', 'numero', 'nombre']) ?? abort(404)) : null;

        $informe = InformeMatricula::del($anio, $sede ? [$sede->id] : $permitidas, $grado?->id, $grupo?->id) ?? abort(404);

        return Inertia::render('informes/matricula', [
            ...$informe,
            'filtro' => [
                'sede' => $sede?->codigo,
                'sedeNombre' => $sede?->nombre,
                'grado' => $grado?->id,
                'gradoNombre' => $grado?->nombre,
                'grupo' => $grupo?->id,
                'grupoCodigo' => $grupo?->codigo,
            ],
            'opciones' => $this->opciones($anio, $permitidas),
        ]);
    }

    /**
     * Las sedes que puede ver el usuario, cada una con los grados que tiene
     * grupos ese año y esos grupos: el selector de grado muestra solo los de la
     * sede elegida, y el de grupo, los de ese grado.
     *
     * @param  list<int>|null  $permitidas
     */
    private function opciones(int $anio, ?array $permitidas): array
    {
        $filas = DB::table('grupos as g')
            ->join('anios_lectivos as al', 'al.id', '=', 'g.anio_lectivo_id')
            ->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->where('al.anio', $anio)
            ->when($permitidas !== null, fn ($q) => $q->whereIn('g.sede_id', $permitidas))
            ->orderBy('g.numero')
            ->get(['g.id as grupo_id', 'g.codigo', 'g.sede_id', 'gr.id', 'gr.numero', 'gr.nombre']);

        return DB::table('sedes')
            ->when($permitidas !== null, fn ($q) => $q->whereIn('id', $permitidas))
            ->orderByDesc('es_principal')->orderBy('nombre')
            ->get(['id', 'codigo', 'nombre'])
            ->map(fn ($s) => [
                'codigo' => $s->codigo,
                'nombre' => $s->nombre,
                'grados' => $filas->where('sede_id', $s->id)->groupBy('id')->sortBy(fn ($de) => (int) $de->first()->numero)
                    ->map(fn ($de) => [
                        'id' => (int) $de->first()->id,
                        'numero' => (int) $de->first()->numero,
                        'nombre' => $de->first()->nombre,
                        'grupos' => $de->map(fn ($g) => ['id' => (int) $g->grupo_id, 'codigo' => $g->codigo])->values(),
                    ])->values(),
            ])
            ->filter(fn ($s) => $s['grados']->isNotEmpty())
            ->values()
            ->all();
    }

    /** «PRINCIPAL-2026.xlsx»: el libro de la sede, una hoja por grupo más las de resumen. */
    public function excel(Request $request): StreamedResponse
    {
        $datos = $request->validate([
            'anio' => ['required', 'integer'],
            'sede' => ['required', 'string', 'max:5'],
        ]);
        Alcance::exigirSede($request->user(), DB::table('sedes')->where('codigo', $datos['sede'])->value('id'));
        [$libro, $archivo] = LibroMatriculaSede::generar((int) $datos['anio'], $datos['sede']) ?? abort(404);

        return response()->streamDownload(function () use ($libro) {
            $escritor = new Xlsx($libro);
            // Cada fórmula va con su resultado ya calculado: Excel abre lo descargado en «Vista
            // protegida», donde no calcula nada, y sin esto los totales se veían en blanco.
            $escritor->setPreCalculateFormulas(true);
            $escritor->save('php://output');
            $libro->disconnectWorksheets();
        }, $archivo, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'no-store',
        ]);
    }
}
