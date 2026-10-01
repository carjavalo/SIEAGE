<?php

namespace App\Http\Controllers;

use App\Support\Alcance;
use App\Support\Constancias;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Constancias de matrícula: vista previa hoja por hoja (dos copias en cada hoja) para imprimir
 * desde el navegador, de un estudiante o de un grupo, un grado, una sede o todo el colegio.
 */
class ConstanciaController extends Controller
{
    /** La de un estudiante: la matrícula del año pedido o, si no se pide, la más reciente. */
    public function estudiante(Request $request, int $estudiante): Response
    {
        $matricula = DB::table('matriculas as m')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->where('m.estudiante_id', $estudiante)
            ->whereNull('e.deleted_at')
            ->tap(fn ($q) => Alcance::filtrar($q, $request->user(), 'm.sede_id'))
            ->where('al.estado', '<>', 'planeado')
            ->when($request->filled('anio'), fn ($q) => $q->where('al.anio', (int) $request->query('anio')))
            ->orderByDesc('al.anio')
            ->first(['m.id', 'e.nombre_completo']);
        abort_unless($matricula, 404);

        return $this->pagina([$matricula->id], $matricula->nombre_completo, "/estudiantes/{$estudiante}");
    }

    /**
     * Varias a la vez, de los estudiantes activos del año: ?grupo=ID, ?grado=ID (con ?sede=
     * opcional), ?sede=CODIGO o nada (todo el colegio). Salen ordenadas por sede, grado,
     * grupo y nombre, como se archivan.
     */
    public function lote(Request $request): Response
    {
        $anio = DB::table('anios_lectivos')->where('anio', (int) $request->query('anio'))->first()
            ?? DB::table('anios_lectivos')->where('estado', 'activo')->first();
        abort_unless($anio, 404);

        $sede = $request->filled('sede') ? DB::table('sedes')->where('codigo', (string) $request->query('sede'))->first() : null;
        $grado = $request->filled('grado') ? DB::table('grados')->where('id', (int) $request->query('grado'))->first() : null;
        $grupo = $request->filled('grupo')
            ? DB::table('grupos as g')->join('sedes as s', 's.id', '=', 'g.sede_id')->where('g.id', (int) $request->query('grupo'))->where('g.anio_lectivo_id', $anio->id)->first(['g.id', 'g.codigo', 's.nombre as sede'])
            : null;
        abort_if(($request->filled('sede') && ! $sede) || ($request->filled('grado') && ! $grado) || ($request->filled('grupo') && ! $grupo), 404);
        if ($sede) {
            Alcance::exigirSede($request->user(), $sede->id);
        }

        $ids = DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->join('sedes as s', 's.id', '=', 'm.sede_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->where('m.anio_lectivo_id', $anio->id)
            ->where('m.estado', 'activo')
            ->whereNull('e.deleted_at')
            ->when($grupo, fn ($q) => $q->where('m.grupo_id', $grupo->id))
            ->when(! $grupo && $grado, fn ($q) => $q->where('m.grado_id', $grado->id))
            ->when(! $grupo && $sede, fn ($q) => $q->where('m.sede_id', $sede->id))
            // Sin sede pedida: todas las que puede ver (un grupo de otra sede no trae a nadie).
            ->tap(fn ($q) => Alcance::filtrar($q, $request->user(), 'm.sede_id'))
            ->orderByDesc('s.es_principal')
            ->orderBy('s.nombre')
            ->orderBy('gr.numero')
            ->orderBy('g.codigo')
            ->orderBy('e.nombre_completo')
            ->pluck('m.id')
            ->all();

        $titulo = match (true) {
            (bool) $grupo => "Grupo {$grupo->codigo} · {$grupo->sede}",
            $grado && $sede => "{$grado->nombre} · {$sede->nombre}",
            (bool) $grado => "{$grado->nombre} · todas las sedes",
            (bool) $sede => "Sede {$sede->nombre}",
            default => 'Todo el colegio',
        };
        $volver = '/estudiantes?'.http_build_query(array_filter(['anio' => $anio->anio, 'sede' => $sede?->codigo, 'grado' => $grado?->id]));

        return $this->pagina($ids, "{$titulo} · {$anio->anio}", $volver);
    }

    /** @param  list<int>  $matriculas */
    private function pagina(array $matriculas, string $titulo, string $volver): Response
    {
        return Inertia::render('constancias/index', [
            'titulo' => $titulo,
            'volver' => $volver,
            'constancias' => Constancias::de($matriculas),
            'institucion' => DB::table('instituciones')->first(['nombre', 'nit', 'codigo_dane', 'resolucion', 'municipio']),
        ]);
    }
}
