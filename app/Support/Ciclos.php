<?php

namespace App\Support;

/**
 * Los ciclos de la jornada sabatina y los grados que abarca cada uno, según el
 * institución:
 *
 *   Ciclo I   → 1.º, 2.º y 3.º
 *   Ciclo II  → 4.º y 5.º
 *   Ciclo III → 6.º y 7.º
 *   Ciclo IV  → 8.º y 9.º
 *   Ciclo V   → 10.º
 *   Ciclo VI  → 11.º
 *
 * En SIEAGE un estudiante de ciclo queda en el último grado de su ciclo (Ciclo III
 * → Séptimo), con jornada Sabatina y en el grupo «Ciclo III». Al promoverlo pasa
 * al ciclo siguiente (Ciclo III → Ciclo IV, es decir, a Noveno), no al grado
 * siguiente; el Ciclo VI se gradúa como Undécimo.
 */
final class Ciclos
{
    public const JORNADA = 'Sabatina';

    /** Ciclo => grados que abarca. */
    public const GRADOS = [
        'I' => [1, 2, 3],
        'II' => [4, 5],
        'III' => [6, 7],
        'IV' => [8, 9],
        'V' => [10],
        'VI' => [11],
    ];

    /** El grado en que queda en SIEAGE un estudiante del ciclo: el último que abarca (III → 7). */
    public static function grado(string $ciclo): ?int
    {
        $grados = self::GRADOS[strtoupper($ciclo)] ?? null;

        return $grados ? max($grados) : null;
    }

    /** El ciclo de un grado (7 → III); null si no es de ninguno (Transición). */
    public static function deGrado(int $grado): ?string
    {
        foreach (self::GRADOS as $ciclo => $grados) {
            if (in_array($grado, $grados, true)) {
                return $ciclo;
            }
        }

        return null;
    }

    /** El ciclo que sigue (III → IV); null después del VI. */
    public static function siguiente(string $ciclo): ?string
    {
        $ciclos = array_keys(self::GRADOS);
        $i = array_search(strtoupper($ciclo), $ciclos, true);

        return $i === false ? null : ($ciclos[$i + 1] ?? null);
    }

    /** «Ciclo III»: el código del grupo del ciclo. */
    public static function codigo(string $ciclo): string
    {
        return 'Ciclo '.strtoupper($ciclo);
    }
}
