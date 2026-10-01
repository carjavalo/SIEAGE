<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Qué sedes puede ver y modificar un usuario.
 *
 * - Administrador, o usuario con "todas las sedes": todas (`sedes()` devuelve null).
 * - Los demás: solo las sedes asignadas en sede_user. Sin ninguna, ninguna.
 *
 * Todo lo que lee o modifica datos de estudiantes, grupos, inscritos o informes
 * pasa por aquí: el filtro se aplica en el servidor, no solo en la pantalla.
 */
final class Alcance
{
    /** null = todas las sedes; si no, los ids permitidos (puede ser una lista vacía). */
    public static function sedes(?User $user): ?array
    {
        if (! $user) {
            return [];
        }

        // Se recuerda durante la petición (una sola consulta aunque se pregunte muchas veces).
        $clave = "alcance.sedes.{$user->id}";
        $guardado = request()->attributes->get($clave, false);
        if ($guardado !== false) {
            return $guardado;
        }

        $sedes = $user->esAdministrador() || $user->todas_las_sedes
            ? null
            : DB::table('sede_user')->where('user_id', $user->id)->pluck('sede_id')->map(fn ($id) => (int) $id)->all();
        request()->attributes->set($clave, $sedes);

        return $sedes;
    }

    public static function todas(?User $user): bool
    {
        return self::sedes($user) === null;
    }

    public static function puedeVerSede(?User $user, int|string|null $sedeId): bool
    {
        $sedes = self::sedes($user);

        return $sedes === null || ($sedeId !== null && in_array((int) $sedeId, $sedes, true));
    }

    /** Limita una consulta a las sedes del usuario por la columna indicada (p. ej. 'm.sede_id'). */
    public static function filtrar(Builder $consulta, ?User $user, string $columna): Builder
    {
        $sedes = self::sedes($user);

        return $sedes === null ? $consulta : $consulta->whereIn($columna, $sedes);
    }

    /**
     * Un estudiante es visible si alguna de sus matrículas está en una sede del
     * usuario: así el colegio de un estudiante que pasó de sede no pierde su ficha.
     */
    public static function puedeVerEstudiante(?User $user, int $estudianteId): bool
    {
        $sedes = self::sedes($user);

        return $sedes === null || DB::table('matriculas')->where('estudiante_id', $estudianteId)->whereIn('sede_id', $sedes)->exists();
    }

    /** Como puedeVerEstudiante, pero responde 404 (no revela que existe) si no puede. */
    public static function exigirEstudiante(?User $user, int $estudianteId): void
    {
        abort_unless(self::puedeVerEstudiante($user, $estudianteId), 404);
    }

    public static function exigirSede(?User $user, int|string|null $sedeId): void
    {
        abort_unless(self::puedeVerSede($user, $sedeId), 404);
    }

    /**
     * Inscritos (solicitudes del formulario). Una solicitud no tiene sede hasta que
     * se matricula, así que es de una sede si: ya quedó matriculada en ella; o la
     * familia la eligió (primaria); o, sin ninguna de las dos, si esa sede tiene
     * grupos del grado que pidió. `$alias` es el de solicitudes_inscripcion.
     */
    public static function filtrarSolicitudes(Builder $consulta, ?User $user, string $alias = 's'): Builder
    {
        $sedes = self::sedes($user);
        if ($sedes === null) {
            return $consulta;
        }

        return $consulta->where(fn ($q) => $q
            ->whereExists(fn ($m) => $m->from('matriculas as am')->whereColumn('am.id', "{$alias}.matricula_id")->whereIn('am.sede_id', $sedes))
            ->orWhere(fn ($q) => $q->whereNull("{$alias}.matricula_id")->whereIn("{$alias}.sede_preferida_id", $sedes))
            ->orWhere(fn ($q) => $q->whereNull("{$alias}.matricula_id")->whereNull("{$alias}.sede_preferida_id")
                ->whereExists(fn ($g) => $g->from('grupos as ag')
                    ->whereColumn('ag.grado_id', "{$alias}.grado_id")
                    ->whereIn('ag.sede_id', $sedes)
                    ->where(fn ($a) => $a->whereColumn('ag.anio_lectivo_id', "{$alias}.anio_lectivo_id")
                        ->orWhere(fn ($a) => $a->whereNull("{$alias}.anio_lectivo_id")
                            ->whereIn('ag.anio_lectivo_id', DB::table('anios_lectivos')->where('estado', 'activo')->select('id')))))));
    }

    public static function exigirSolicitud(?User $user, int $solicitudId): void
    {
        abort_unless(self::filtrarSolicitudes(DB::table('solicitudes_inscripcion as s')->where('s.id', $solicitudId), $user)->exists(), 404);
    }

    /** Después de cambiar las sedes de alguien, para que la misma petición lo vea. */
    public static function olvidar(User $user): void
    {
        request()->attributes->remove("alcance.sedes.{$user->id}");
    }
}
