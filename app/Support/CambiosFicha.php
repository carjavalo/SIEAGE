<?php

namespace App\Support;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * El historial de correcciones hechas desde la ficha (tabla cambios_ficha) y
 * lo que la ficha necesita saber de los acudientes para editarlos.
 */
final class CambiosFicha
{
    /**
     * Lo que cambia entre la fila guardada y los valores nuevos: campo → [antes, después].
     * Vacío y null cuentan como lo mismo; los números se comparan como texto (la base los devuelve así).
     *
     * @param  array<string, mixed>  $nuevo
     * @return array<string, array{0: mixed, 1: mixed}>
     */
    public static function diferencias(object $actual, array $nuevo): array
    {
        $cambios = [];
        foreach ($nuevo as $campo => $valor) {
            $antes = $actual->{$campo} ?? null;
            if ((string) ($antes ?? '') !== (string) ($valor ?? '')) {
                $cambios[$campo] = [$antes, $valor];
            }
        }

        return $cambios;
    }

    /** @param  array<string, mixed>  $cambios */
    public static function anotar(int $estudianteId, ?int $acudienteId, string $accion, array $cambios, ?int $usuarioId): void
    {
        DB::table('cambios_ficha')->insert([
            'estudiante_id' => $estudianteId,
            'acudiente_id' => $acudienteId,
            'accion' => $accion,
            'cambios' => json_encode($cambios, JSON_UNESCAPED_UNICODE),
            'user_id' => $usuarioId,
            'created_at' => now(),
        ]);
    }

    /**
     * Quién tocó por última vez los datos del estudiante y los de cada acudiente.
     *
     * @return array{estudiante: array{usuario: ?string, fecha: string}|null, acudientes: array<int, array{usuario: ?string, fecha: string}>}
     */
    public static function ultimas(int $estudianteId, Collection $acudientesIds): array
    {
        $filas = DB::table('cambios_ficha as c')
            ->leftJoin('users as u', 'u.id', '=', 'c.user_id')
            ->where(fn ($q) => $q->where('c.estudiante_id', $estudianteId)->orWhereIn('c.acudiente_id', $acudientesIds))
            ->orderByDesc('c.id')
            ->limit(300)
            ->get(['c.accion', 'c.estudiante_id', 'c.acudiente_id', 'c.created_at', 'u.name as usuario']);

        $dato = fn (?object $f) => $f ? ['usuario' => $f->usuario, 'fecha' => substr((string) $f->created_at, 0, 10)] : null;

        return [
            'estudiante' => $dato($filas->first(fn ($f) => $f->accion === 'estudiante_editado' && (int) $f->estudiante_id === $estudianteId)),
            'acudientes' => $acudientesIds
                ->mapWithKeys(fn ($id) => [$id => $dato($filas->first(
                    fn ($f) => (int) $f->acudiente_id === (int) $id && in_array($f->accion, ['acudiente_editado', 'acudiente_agregado'], true)
                ))])
                ->filter()
                ->all(),
        ];
    }

    /**
     * Los otros estudiantes de cada acudiente (hermanos, primos…), con su grupo
     * de este año: lo que se le cambie al acudiente vale también para ellos.
     *
     * @return Collection<int, Collection<int, array{nombre: string, grupo: ?string}>> por acudiente
     */
    public static function otrosEstudiantes(Collection $acudientesIds, ?int $excepto = null, ?array $sedes = null): Collection
    {
        if ($acudientesIds->isEmpty()) {
            return collect();
        }
        $anioId = DB::table('anios_lectivos')->where('estado', 'activo')->value('id');

        return DB::table('estudiante_acudiente as ea')
            ->join('estudiantes as e', 'e.id', '=', 'ea.estudiante_id')
            ->leftJoin('matriculas as m', fn ($j) => $j->on('m.estudiante_id', '=', 'e.id')->where('m.anio_lectivo_id', $anioId))
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->whereIn('ea.acudiente_id', $acudientesIds)
            ->when($excepto, fn ($q) => $q->where('e.id', '<>', $excepto))
            // Un usuario de sede no ve a los hermanos que estudian en otra.
            ->when($sedes !== null, fn ($q) => $q->whereIn('m.sede_id', $sedes))
            ->whereNull('e.deleted_at')
            ->orderBy('e.nombre_completo')
            ->get(['ea.acudiente_id', 'e.nombre_completo as nombre', 'g.codigo as grupo'])
            ->groupBy('acudiente_id')
            ->map(fn ($filas) => $filas->map(fn ($f) => ['nombre' => $f->nombre, 'grupo' => $f->grupo])->values());
    }
}
