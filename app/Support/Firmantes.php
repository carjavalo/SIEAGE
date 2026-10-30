<?php

namespace App\Support;

use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

/**
 * Quiénes pueden firmar o dirigir un grupo de una sede: los usuarios activos que
 * trabajan en ella (o ven todas, o administran). Lo usan «Firmas y jornada» en
 * Boletines y el formulario del grupo en Sedes.
 */
final class Firmantes
{
    /** Los usuarios de la sede, con su rol (alias u y r). */
    public static function de(int $sedeId): Builder
    {
        return DB::table('users as u')->leftJoin('roles as r', 'r.id', '=', 'u.rol_id')->where(fn ($q) => self::deLaSede($q, $sedeId, 'u'));
    }

    /** Los mismos, ya ordenados (los docentes primero) y listos para elegir en una lista. */
    public static function paraElegir(int $sedeId): Collection
    {
        return self::de($sedeId)
            ->orderByRaw("CASE r.nombre WHEN 'docente' THEN 0 WHEN 'coordinacion' THEN 1 ELSE 2 END")->orderBy('u.name')
            ->get(['u.id', 'u.name', DB::raw('COALESCE(r.etiqueta, r.nombre) as rol')]);
    }

    /** Regla de validación: el id es de alguien activo de esa sede. */
    public static function regla(int $sedeId): Exists
    {
        return Rule::exists('users', 'id')->where(fn ($q) => self::deLaSede($q, $sedeId, 'users'));
    }

    /** El docente de ese usuario (grupos.director_id apunta a docentes); se crea si no existe. */
    public static function docenteDe(int $userId): int
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

    /** Condición «activo y de esa sede» sobre la tabla de usuarios con ese alias. */
    private static function deLaSede(Builder $q, int $sedeId, string $tabla): Builder
    {
        return $q->where("{$tabla}.activo", true)->where(fn ($w) => $w
            ->where("{$tabla}.todas_las_sedes", true)
            ->orWhereIn("{$tabla}.rol_id", DB::table('roles')->where('nombre', 'administrador')->select('id'))
            ->orWhereIn("{$tabla}.id", DB::table('sede_user')->where('sede_id', $sedeId)->select('user_id')));
    }
}
