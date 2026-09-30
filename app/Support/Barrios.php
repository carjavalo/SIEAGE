<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/** El catálogo de barrios, que crece con lo que escriben las familias y la secretaría. */
final class Barrios
{
    /** El id del barrio con ese nombre; si no está en el catálogo, se agrega. Vacío: null. */
    public static function id(?string $nombre): ?int
    {
        $nombre = mb_substr(trim((string) $nombre), 0, 80);
        if ($nombre === '') {
            return null;
        }

        // La columna es única sin distinguir tildes ni mayúsculas: se reutiliza el que ya exista.
        return DB::table('barrios')->where('nombre', $nombre)->value('id') ?? DB::table('barrios')->insertGetId(['nombre' => $nombre]);
    }
}
