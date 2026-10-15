<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * El año que sigue al que está en curso se prepara antes de que exista: en
 * Sedes se le crean los grupos según la proyección de matrícula (antes de
 * promover) y al crear el primero nace como "planeado". La promoción lo usa igual.
 */
final class AniosLectivos
{
    /** El año siguiente al que está en curso, exista o no todavía. */
    public static function siguiente(): ?int
    {
        $activo = DB::table('anios_lectivos')->where('estado', 'activo')->value('anio');

        return $activo === null ? null : (int) $activo + 1;
    }

    /** El año lectivo; si es el siguiente al que está en curso y todavía no existe, se crea como "planeado". */
    public static function abrir(int $anio): ?object
    {
        if ($anio === self::siguiente() && ! DB::table('anios_lectivos')->where('anio', $anio)->exists()) {
            DB::table('anios_lectivos')->insert(['anio' => $anio, 'estado' => 'planeado', 'created_at' => now(), 'updated_at' => now()]);
        }

        return DB::table('anios_lectivos')->where('anio', $anio)->first();
    }
}
