<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Qué sedes puede ver y modificar un usuario.
 *
 * - Administrador, usuario con "todas las sedes" o con un rol que tiene el permiso
 *   «Ver todas las sedes»: todas (`sedes()` devuelve null).
 * - Los demás: solo las sedes asignadas en sede_user. Sin ninguna, ninguna.
 * - Y en cada sede asignada, si tiene grados marcados (sede_user_grado), solo
 *   esos grados (p. ej. Rafael Pombo → Transición); sin grados marcados, todos.
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

        $sedes = $user->esAdministrador() || $user->todas_las_sedes || Permisos::tiene($user, 'todas-las-sedes')
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

    /**
     * Las sedes donde solo ve algunos grados: [sede_id => [grado_id, …]]. Las
     * sedes que no aparecen se ven con todos sus grados.
     *
     * @return array<int, list<int>>
     */
    public static function grados(?User $user): array
    {
        $sedes = self::sedes($user);
        if (! $user || $sedes === null || $sedes === []) {
            return [];
        }

        $clave = "alcance.grados.{$user->id}";
        $guardado = request()->attributes->get($clave);
        if ($guardado === null) {
            $guardado = DB::table('sede_user_grado')->where('user_id', $user->id)->whereIn('sede_id', $sedes)->get(['sede_id', 'grado_id'])
                ->groupBy('sede_id')->map(fn ($filas) => $filas->pluck('grado_id')->map(fn ($id) => (int) $id)->values()->all())->all();
            request()->attributes->set($clave, $guardado);
        }

        return $guardado;
    }

    /** Si puede ver ese grado en esa sede. */
    public static function puedeVer(?User $user, int|string|null $sedeId, int|string|null $gradoId): bool
    {
        if (! self::puedeVerSede($user, $sedeId)) {
            return false;
        }
        $limitados = self::grados($user)[(int) $sedeId] ?? null;

        return $limitados === null || ($gradoId !== null && in_array((int) $gradoId, $limitados, true));
    }

    /** Como puedeVer, pero responde 404 si no puede. */
    public static function exigir(?User $user, int|string|null $sedeId, int|string|null $gradoId): void
    {
        abort_unless(self::puedeVer($user, $sedeId, $gradoId), 404);
    }

    /** Las sedes donde puede ver ese grado (null = todas). */
    public static function sedesDelGrado(?User $user, ?int $gradoId): ?array
    {
        $sedes = self::sedes($user);
        if ($sedes === null) {
            return null;
        }
        $limitados = self::grados($user);

        return array_values(array_filter($sedes, fn ($s) => ! isset($limitados[$s]) || ($gradoId !== null && in_array($gradoId, $limitados[$s], true))));
    }

    /** Los grados que puede ver (null = todos), en una sede o en todas las suyas. */
    public static function gradosVisibles(?User $user, ?int $sedeId = null): ?array
    {
        $sedes = self::sedes($user);
        if ($sedes === null) {
            return null;
        }
        $limitados = self::grados($user);
        $grados = [];
        foreach ($sedeId !== null ? array_intersect($sedes, [$sedeId]) : $sedes as $s) {
            if (! isset($limitados[$s])) {
                return null;
            }
            $grados = [...$grados, ...$limitados[$s]];
        }

        return array_values(array_unique($grados));
    }

    /**
     * Limita una consulta a las sedes del usuario por la columna indicada (p. ej.
     * 'm.sede_id') y, con `$grado` (p. ej. 'm.grado_id'), a los grados que tenga
     * marcados en cada sede.
     */
    public static function filtrar(Builder $consulta, ?User $user, string $columna, ?string $grado = null): Builder
    {
        $sedes = self::sedes($user);
        if ($sedes === null) {
            return $consulta;
        }
        $limitados = $grado ? self::grados($user) : [];
        if ($limitados === []) {
            return $consulta->whereIn($columna, $sedes);
        }
        $libres = array_values(array_diff($sedes, array_keys($limitados)));

        return $consulta->where(function ($w) use ($columna, $grado, $libres, $limitados) {
            $w->whereIn($columna, $libres);
            foreach ($limitados as $sede => $grados) {
                $w->orWhere(fn ($o) => $o->where($columna, $sede)->whereIn($grado, $grados));
            }
        });
    }

    /**
     * Un estudiante es visible si alguna de sus matrículas está en una sede del
     * usuario: así el colegio de un estudiante que pasó de sede no pierde su ficha.
     */
    public static function puedeVerEstudiante(?User $user, int $estudianteId): bool
    {
        return self::todas($user) || self::filtrar(DB::table('matriculas')->where('estudiante_id', $estudianteId), $user, 'sede_id', 'grado_id')->exists();
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
        $limitados = self::grados($user);
        if ($sedes === null || $limitados === []) {
            return self::solicitudesDeSedes($consulta, $sedes, $alias);
        }

        // En las sedes con grados marcados, solo las solicitudes de esos grados.
        $libres = array_values(array_diff($sedes, array_keys($limitados)));

        return $consulta->where(function ($w) use ($libres, $limitados, $alias) {
            $w->where(fn ($q) => self::solicitudesDeSedes($q, $libres, $alias));
            foreach ($limitados as $sede => $grados) {
                $w->orWhere(fn ($q) => self::solicitudesDeSedes($q, [$sede], $alias)->whereIn("{$alias}.grado_id", $grados));
            }
        });
    }

    /**
     * Las solicitudes de estas sedes (null = todas), con el mismo criterio de
     * filtrarSolicitudes(). La usa el informe cuando se elige una sede.
     *
     * @param  list<int>|null  $sedes
     */
    public static function solicitudesDeSedes(Builder $consulta, ?array $sedes, string $alias = 's'): Builder
    {
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
        request()->attributes->remove("alcance.grados.{$user->id}");
    }
}
