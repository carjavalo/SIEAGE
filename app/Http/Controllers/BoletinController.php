<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Alcance;
use App\Support\Boletines;
use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Boletines de transición: el docente escribe sobre la hoja, el texto se guarda
 * solo, y se imprimen uno por uno o los de todo el grupo. Solo el texto es de
 * cada estudiante; quién firma y la jornada se fijan una vez por grupo.
 */
class BoletinController extends Controller
{
    /** Lo más largo que se acepta: unas dos hojas. */
    private const MAXIMO = 12000;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $anio = Boletines::anio();
        abort_unless($anio, 404);

        $grupos = Boletines::grupos($user, $anio->id);
        $periodos = Boletines::periodos($anio->id);

        // ?ver=ESTUDIANTE (desde su ficha): su grupo de transición de este año.
        $ver = $request->integer('ver') ?: null;
        $grupoId = $request->integer('grupo') ?: null;
        if ($ver && ! $grupoId) {
            $grupoId = DB::table('matriculas')->where('estudiante_id', $ver)->where('anio_lectivo_id', $anio->id)->value('grupo_id');
            abort_unless($grupoId, 404);
        }
        $grupo = $grupoId ? $grupos->firstWhere('id', (int) $grupoId) : $grupos->first();
        abort_if($grupoId && ! $grupo, 404);

        $periodo = $request->filled('periodo') ? $periodos->firstWhere('id', $request->integer('periodo')) : Boletines::periodoActual($periodos);
        abort_if($request->filled('periodo') && ! $periodo, 404);

        $configura = $grupo && $user->can('gestionar-sedes');

        return Inertia::render('boletines/index', [
            'anio' => $anio->anio,
            'grupos' => $grupos,
            'periodos' => $periodos->map(fn ($p) => ['id' => $p->id, 'numero' => $p->numero, 'etiqueta' => $p->etiqueta]),
            'periodo' => $periodo?->id,
            'grupo' => $grupo ? Boletines::datosGrupo($grupo->id) : null,
            'estudiantes' => $grupo && $periodo ? Boletines::estudiantes($grupo->id, $periodo->id) : [],
            'ver' => $ver,
            'maximo' => self::MAXIMO,
            'puedeConfigurar' => $configura,
            // Para elegir quién firma: quienes trabajan en la sede del grupo (los docentes primero).
            'usuarios' => $configura
                ? $this->firmantes($grupo->sede_id)
                    ->orderByRaw("CASE r.nombre WHEN 'docente' THEN 0 WHEN 'coordinacion' THEN 1 ELSE 2 END")->orderBy('u.name')
                    ->get(['u.id', 'u.name', 'r.nombre as rol'])
                : [],
        ]);
    }

    /**
     * Guarda el texto de un estudiante (se llama sola mientras se escribe). Cada
     * guardado sube la versión; si llega con una versión que ya no es la última
     * (otra persona, otra pestaña o una página vieja), no la pisa: responde 409
     * con lo que hay guardado. Sin versión («dejar el mío») guarda igual.
     */
    public function guardar(Request $request, int $matricula, int $periodo, bool $reintento = false): JsonResponse
    {
        $m = $this->matricula($request->user(), $matricula);
        abort_unless(DB::table('periodos')->where('id', $periodo)->where('anio_lectivo_id', $m->anio_lectivo_id)->exists(), 404);

        $datos = $request->validate([
            'texto' => ['present', 'nullable', 'string', 'max:'.self::MAXIMO],
            'version' => ['nullable', 'string'],
        ], ['max' => 'Es demasiado largo: máximo :max caracteres.']);
        $texto = self::limpiar((string) ($datos['texto'] ?? ''));
        $compara = $request->has('version');
        $user = $request->user();
        $ahora = now();

        try {
            return DB::transaction(function () use ($m, $periodo, $texto, $compara, $datos, $user, $ahora) {
                $actual = DB::table('boletines')->where('matricula_id', $m->id)->where('periodo_id', $periodo)->lockForUpdate()->first();

                if ($compara && (string) ($datos['version'] ?? '') !== ($actual ? (string) $actual->revision : '')) {
                    return response()->json([
                        'conflicto' => [
                            'texto' => $actual?->texto ?? '',
                            'version' => $actual ? (string) $actual->revision : null,
                            'por' => $actual ? DB::table('users')->where('id', $actual->actualizado_por)->value('name') : null,
                            'en' => $actual?->updated_at,
                        ],
                    ], 409);
                }

                if ($texto === '') {
                    DB::table('boletines')->where('matricula_id', $m->id)->where('periodo_id', $periodo)->delete();

                    return response()->json(['version' => null, 'actualizado_en' => null, 'por' => null]);
                }
                if ($actual) {
                    $revision = (int) $actual->revision + 1;
                    DB::table('boletines')->where('id', $actual->id)->update(['texto' => $texto, 'revision' => $revision, 'actualizado_por' => $user->id, 'updated_at' => $ahora]);
                } else {
                    $revision = 1;
                    DB::table('boletines')->insert([
                        'matricula_id' => $m->id, 'periodo_id' => $periodo, 'texto' => $texto, 'revision' => $revision,
                        'creado_por' => $user->id, 'actualizado_por' => $user->id, 'created_at' => $ahora, 'updated_at' => $ahora,
                    ]);
                }

                return response()->json(['version' => (string) $revision, 'actualizado_en' => $ahora->toDateTimeString(), 'por' => $user->name]);
            });
        } catch (UniqueConstraintViolationException $e) {
            // Otro guardado lo creó entre la lectura y el insert: otra vuelta, ya con la fila (y su versión).
            throw_if($reintento, $e);

            return $this->guardar($request, $matricula, $periodo, true);
        }
    }

    /** Quién firma (director(a) del grupo y coordinador(a) de la sede) y cómo se escribe la jornada. Solo el año en curso. */
    public function configurar(Request $request, int $grupo): RedirectResponse
    {
        $g = DB::table('grupos as g')
            ->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->join('anios_lectivos as al', 'al.id', '=', 'g.anio_lectivo_id')
            ->where('g.id', $grupo)->where('gr.numero', Boletines::GRADO)->where('al.estado', 'activo')
            ->first(['g.id', 'g.sede_id']);
        abort_unless($g, 404);
        Alcance::exigirSede($request->user(), $g->sede_id);

        // Solo alguien activo que trabaje en esa sede (o en todas).
        $firmante = Rule::exists('users', 'id')->where(fn ($q) => $this->deLaSede($q, $g->sede_id, 'users'));
        $datos = $request->validate([
            'director_id' => ['nullable', 'integer', $firmante],
            'coordinador_id' => ['nullable', 'integer', $firmante],
            'jornada_boletin' => ['nullable', 'string', 'max:60'],
        ], ['exists' => 'Elige a alguien de la lista.', 'max' => 'Es demasiado largo: máximo :max caracteres.']);

        DB::transaction(function () use ($g, $datos) {
            DB::table('grupos')->where('id', $g->id)->update([
                'director_id' => ($datos['director_id'] ?? null) ? $this->docenteDe((int) $datos['director_id']) : null,
                'jornada_boletin' => trim((string) ($datos['jornada_boletin'] ?? '')) ?: null,
                'updated_at' => now(),
            ]);
            DB::table('sedes')->where('id', $g->sede_id)->update(['coordinador_id' => ($datos['coordinador_id'] ?? null) ?: null, 'updated_at' => now()]);
        });

        return back()->with('success', 'Firmas y jornada guardadas.');
    }

    /**
     * Vista previa para imprimir: los boletines del grupo que ya tienen texto, o
     * el de un estudiante (?estudiante=, aunque esté vacío, para llenarlo a mano).
     */
    public function imprimir(Request $request): Response
    {
        $user = $request->user();
        $anio = Boletines::anio();
        abort_unless($anio, 404);

        $grupo = Boletines::grupos($user, $anio->id)->firstWhere('id', $request->integer('grupo'));
        $periodo = Boletines::periodos($anio->id)->firstWhere('id', $request->integer('periodo'));
        abort_unless($grupo && $periodo, 404);

        $estudiantes = Boletines::estudiantes($grupo->id, $periodo->id);
        $uno = $request->integer('estudiante') ?: null;
        if ($uno) {
            $estudiantes = $estudiantes->where('estudiante_id', $uno)->values();
            abort_if($estudiantes->isEmpty(), 404);
        }
        $conTexto = $uno ? $estudiantes : $estudiantes->filter(fn ($e) => $e->texto !== '')->values();

        return Inertia::render('boletines/imprimir', [
            'titulo' => $uno ? $estudiantes->first()->nombre : "Grupo {$grupo->codigo} · {$grupo->sede}",
            'volver' => '/boletines?'.http_build_query(array_filter(['grupo' => $grupo->id, 'periodo' => $periodo->id, 'ver' => $uno])),
            'periodo' => $periodo->etiqueta,
            'grupo' => Boletines::datosGrupo($grupo->id),
            'estudiantes' => $conTexto,
            'sinTexto' => $uno ? 0 : $estudiantes->count() - $conTexto->count(),
        ]);
    }

    /** La matrícula de transición del año en curso, si el usuario ve su sede. */
    private function matricula(?User $user, int $id): object
    {
        $m = DB::table('matriculas as m')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->where('m.id', $id)
            ->where('gr.numero', Boletines::GRADO)
            ->where('al.estado', 'activo')
            ->first(['m.id', 'm.sede_id', 'm.anio_lectivo_id']);
        abort_unless($m, 404);
        Alcance::exigirSede($user, $m->sede_id);

        return $m;
    }

    /** Los usuarios que pueden firmar en una sede: activos y que trabajan en ella (o ven todas, o administran). */
    private function firmantes(int $sedeId): Builder
    {
        return DB::table('users as u')->leftJoin('roles as r', 'r.id', '=', 'u.rol_id')->where(fn ($q) => $this->deLaSede($q, $sedeId, 'u'));
    }

    /** Condición «activo y de esa sede» sobre la tabla de usuarios con ese alias. */
    private function deLaSede(Builder $q, int $sedeId, string $tabla): Builder
    {
        return $q->where("{$tabla}.activo", true)->where(fn ($w) => $w
            ->where("{$tabla}.todas_las_sedes", true)
            ->orWhereIn("{$tabla}.rol_id", DB::table('roles')->where('nombre', 'administrador')->select('id'))
            ->orWhereIn("{$tabla}.id", DB::table('sede_user')->where('sede_id', $sedeId)->select('user_id')));
    }

    /** El docente de ese usuario (grupos.director_id apunta a docentes); se crea si no existe. */
    private function docenteDe(int $userId): int
    {
        // docentes.nombre_completo es de 120: un nombre de usuario más largo se recorta.
        $nombre = mb_substr(trim((string) DB::table('users')->where('id', $userId)->value('name')), 0, 120);
        $docente = DB::table('docentes')->where('user_id', $userId)->orderBy('id')->value('id');
        if ($docente) {
            DB::table('docentes')->where('id', $docente)->update(['nombre_completo' => $nombre, 'updated_at' => now()]);

            return (int) $docente;
        }

        return (int) DB::table('docentes')->insertGetId(['user_id' => $userId, 'nombre_completo' => $nombre, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
    }

    /**
     * Párrafos limpios: sin espacios repetidos ni líneas vacías de más. Un salto
     * de línea separa párrafos (así se ve en la hoja).
     */
    public static function limpiar(string $texto): string
    {
        $texto = str_replace(["\r\n", "\r", "\u{00A0}"], ["\n", "\n", ' '], $texto);
        $parrafos = array_filter(array_map(fn ($p) => trim(preg_replace('/[ \t]+/u', ' ', $p)), explode("\n", $texto)), fn ($p) => $p !== '');

        return implode("\n", $parrafos);
    }
}
