<?php

namespace App\Http\Controllers;

use App\Support\Alcance;
use App\Support\InformeDocumentos;
use App\Support\InformeMatricula;
use App\Support\LibroMatriculaSede;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Informes del año, con vista previa hoja por hoja (A4) que se guarda como PDF
 * desde el cuadro de impresión del navegador: el de matrícula y el de documentos
 * pendientes, con los mismos filtros. Y el libro de matrícula de cada sede en
 * Excel, con el formato que el colegio ya usa.
 */
class InformeController extends Controller
{
    /** Todo el colegio, o solo una sede (?sede=P), un grado (?grado=ID) y un grupo (?grupo=ID). */
    public function matricula(Request $request): Response
    {
        $f = $this->filtros($request);
        $informe = InformeMatricula::del($f['anio'], $f['sedes'], $f['grado']?->id, $f['grupo']?->id, $request->user()) ?? abort(404);

        return Inertia::render('informes/matricula', [...$informe, ...$this->propiedades($f)]);
    }

    /** Documentos de matrícula pendientes por estudiante, con los mismos filtros. */
    public function documentos(Request $request): Response
    {
        $f = $this->filtros($request);
        $informe = InformeDocumentos::del($f['anio'], $f['sedes'], $f['grado']?->id, $f['grupo']?->id, $request->user()) ?? abort(404);

        return Inertia::render('informes/documentos', [
            ...$informe,
            ...$this->propiedades($f),
            'institucion' => DB::table('instituciones')->first(['nombre', 'municipio', 'codigo_dane']),
            'anios' => DB::table('anios_lectivos')->orderByDesc('anio')->pluck('anio'),
            'corte' => now()->toIso8601String(),
        ]);
    }

    /**
     * Año, sede, grado y grupo pedidos, validados contra lo que puede ver el usuario.
     *
     * @return array{anio: int, sede: object|null, grado: object|null, grupo: object|null, sedes: list<int>|null, permitidas: list<int>|null}
     */
    private function filtros(Request $request): array
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

        return ['anio' => $anio, 'sede' => $sede, 'grado' => $grado, 'grupo' => $grupo, 'sedes' => $sede ? [$sede->id] : $permitidas, 'permitidas' => $permitidas];
    }

    /** Lo que necesitan los selectores de la barra: lo elegido y las opciones. */
    private function propiedades(array $f): array
    {
        return [
            'anio' => $f['anio'],
            'filtro' => [
                'sede' => $f['sede']?->codigo,
                'sedeNombre' => $f['sede']?->nombre,
                'grado' => $f['grado']?->id,
                'gradoNombre' => $f['grado']?->nombre,
                'grupo' => $f['grupo']?->id,
                'grupoCodigo' => $f['grupo']?->codigo,
            ],
            'opciones' => $this->opciones($f['anio'], $f['permitidas']),
        ];
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
        $sedeId = DB::table('sedes')->where('codigo', $datos['sede'])->value('id');
        Alcance::exigirSede($request->user(), $sedeId);
        // El libro trae todos los grados de la sede: no para quien solo ve algunos.
        abort_if(isset(Alcance::grados($request->user())[(int) $sedeId]), 403);
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
