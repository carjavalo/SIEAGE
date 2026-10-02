<?php

namespace App\Support;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Quién está usando SIEAGE en este momento. Mientras alguien tiene el panel abierto, el
 * navegador pregunta por el pulso cada 10 s y su sesión se renueva; si lleva más de
 * dos minutos sin hacerlo (cerró la pestaña, salió o la dejó quieta media hora), ya no
 * está en línea. Al cerrar sesión, la sesión se borra y deja de estarlo enseguida.
 */
final class Presencia
{
    public const MINUTOS = 2;

    /** @return Collection<int, int> ids de los usuarios en línea */
    public static function enLinea(): Collection
    {
        $desde = now()->subMinutes(self::MINUTOS);

        // Con las sesiones en la base (como en el colegio) se sabe al instante; si no, por la última actividad.
        $ids = config('session.driver') === 'database'
            ? DB::connection(config('session.connection'))->table(config('session.table', 'sessions'))
                ->whereNotNull('user_id')
                ->where('last_activity', '>=', $desde->getTimestamp())
                ->distinct()
                ->pluck('user_id')
            : DB::table('users')->where('ultima_actividad', '>=', $desde)->pluck('id');

        return $ids->map(fn ($id) => (int) $id)->sort()->values();
    }

    /** Cambia cuando alguien entra o sale, y cada minuto mientras alguien trabaja (su «última vez» avanza). */
    public static function firma(): string
    {
        return substr(md5(self::enLinea()->implode(',').'|'.DB::table('users')->max('ultima_actividad')), 0, 12);
    }
}
