<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Informe de documentos de matrícula pendientes: de los estudiantes activos del
 * año (con los mismos filtros del informe de matrícula), quiénes no han traído
 * todos sus documentos y cuáles les faltan, por grupo. Lo marcado está en
 * matriculas.documentos (ver App\Support\Documentos).
 */
final class InformeDocumentos
{
    /** Nombre corto de cada documento, para las columnas de la tabla, en el orden de la lista. */
    public const CORTOS = [
        'fotos' => 'Fotos',
        'documento_estudiante' => 'Doc. estudiante',
        'notas' => 'Notas',
        'eps' => 'EPS',
        'vacunas' => 'Vacunas',
        'cedula_acudiente' => 'Cédula acudiente',
        'simat' => 'SIMAT',
        'carpeta' => 'Carpeta',
    ];

    /**
     * @param  list<int>|null  $sedes  la sede elegida, o las que puede ver quien lo pide (null = todas)
     * @return array<string, mixed>|null null si el año no existe
     */
    public static function del(int $anio, ?array $sedes = null, ?int $gradoId = null, ?int $grupoId = null, ?User $alcance = null): ?array
    {
        $anioId = DB::table('anios_lectivos')->where('anio', $anio)->value('id');
        if (! $anioId) {
            return null;
        }

        $matriculas = DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->join('sedes as s', 's.id', '=', 'm.sede_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('estudiante_acudiente as ea', fn ($j) => $j->on('ea.estudiante_id', '=', 'e.id')->where('ea.es_principal', true))
            ->leftJoin('acudientes as a', 'a.id', '=', 'ea.acudiente_id')
            ->where('m.anio_lectivo_id', $anioId)
            ->where('m.estado', 'activo')
            ->whereNull('e.deleted_at')
            ->when($sedes !== null, fn ($q) => $q->whereIn('m.sede_id', $sedes))
            ->when($gradoId !== null, fn ($q) => $q->where('m.grado_id', $gradoId))
            ->when($grupoId !== null, fn ($q) => $q->where('m.grupo_id', $grupoId))
            // Quien lo pide ve solo los grados que tenga marcados en cada sede.
            ->when($alcance, fn ($q) => Alcance::filtrar($q, $alcance, 'm.sede_id', 'm.grado_id'))
            ->orderBy('gr.numero')->orderByDesc('s.es_principal')->orderBy('s.nombre')->orderBy('g.numero')->orderBy('e.nombre_completo')
            ->get([
                'm.grupo_id', 'm.documentos', 'g.codigo as grupo', 'gr.numero as grado', 'gr.nombre as grado_nombre', 's.nombre as sede',
                'e.nombre_completo as nombre', 'e.tipo_documento', 'e.numero_documento', 'e.eps',
                'a.nombre_completo as acudiente', DB::raw('coalesce(a.telefono_celular, a.telefono_fijo) as telefono'),
            ]);

        $filas = $matriculas->map(fn ($m) => self::fila($m));
        $pendientes = $filas->where('faltan', '>', 0);

        return [
            'totales' => [
                'activos' => $filas->count(),
                'completos' => $filas->count() - $pendientes->count(),
                'pendientes' => $pendientes->count(),
                // Los que no tienen nada marcado: casi siempre, los que vinieron del Excel.
                'sinRegistro' => $filas->where('marcados', 0)->count(),
            ],
            'documentos' => collect(self::CORTOS)->map(fn ($corto, $clave) => [
                'clave' => $clave,
                'corto' => $corto,
                'faltan' => $filas->filter(fn ($f) => ($f['estados'][$clave] ?? null) === 'falta')->count(),
            ])->values(),
            'grupos' => self::porGrupo($pendientes),
        ];
    }

    /** Un estudiante: el estado de cada documento (null = no le corresponde) y cuántos le faltan. */
    private static function fila(object $m): array
    {
        $marcados = json_decode($m->documentos ?? '[]', true) ?: [];
        $estados = [];
        foreach (Documentos::lista((int) $m->grado, $m->tipo_documento, $m->eps) as $d) {
            $estados[$d['clave']] = $marcados[$d['clave']] ?? 'falta';
        }

        return [
            'grupo_id' => $m->grupo_id,
            'grupo' => $m->grupo ?? $m->grado_nombre,
            'grado' => $m->grado_nombre,
            'sede' => $m->sede,
            'nombre' => $m->nombre,
            'documento' => trim("{$m->tipo_documento} {$m->numero_documento}"),
            'acudiente' => $m->acudiente,
            'telefono' => $m->telefono,
            'estados' => $estados,
            'faltan' => count(array_filter($estados, fn ($e) => $e === 'falta')),
            'marcados' => count($marcados),
        ];
    }

    /** Los estudiantes con pendientes, agrupados por grupo (en el orden de la consulta). */
    private static function porGrupo(Collection $pendientes): Collection
    {
        return $pendientes->groupBy(fn ($f) => $f['grupo_id'] ?? "sin-{$f['grado']}")->map(fn (Collection $de) => [
            'grupo' => $de->first()['grupo'],
            'grado' => $de->first()['grado'],
            'sede' => $de->first()['sede'],
            'estudiantes' => $de->map(fn ($f) => collect($f)->only(['nombre', 'documento', 'acudiente', 'telefono', 'estados', 'faltan'])->all())->values(),
        ])->values();
    }
}
