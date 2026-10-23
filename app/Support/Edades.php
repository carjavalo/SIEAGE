<?php

namespace App\Support;

use Carbon\CarbonImmutable;

/**
 * La tabla de edades del institución, por grado:
 *
 *   Grado      Edad adecuada   Edad aceptable            Extraedad
 *   Primero    6 años          hasta 8 años y 11 meses   9 años en adelante
 *   …          (uno más por grado)
 *   Once       16 años         hasta 18 años y 11 meses  19 años en adelante
 *
 * Es decir: adecuada = grado + 5; aceptable hasta grado + 7 (con sus 11 meses);
 * extraedad desde grado + 8. Transición (grado 0) sigue la misma regla: 5 años,
 * aceptable hasta los 7, extraedad desde los 8.
 *
 * La edad se toma al 31 de marzo del año lectivo, como en el informe de matrícula:
 * así un estudiante no «pasa» a extraedad a mitad de año por cumplir años.
 */
final class Edades
{
    private const SOBRE_EL_GRADO = 5;

    public static function adecuada(int $grado): int
    {
        return $grado + self::SOBRE_EL_GRADO;
    }

    /** Hasta esta edad (y 11 meses) es aceptable; un año más ya es extraedad. */
    public static function aceptableHasta(int $grado): int
    {
        return $grado + self::SOBRE_EL_GRADO + 2;
    }

    /** Años cumplidos al 31 de marzo del año lectivo. */
    public static function alInicioDelAnio(?string $nacimiento, int $anio): ?int
    {
        if (! $nacimiento) {
            return null;
        }
        $n = CarbonImmutable::parse($nacimiento);
        $r = CarbonImmutable::create($anio, 3, 31);

        return $r->year - $n->year - (($r->month < $n->month || ($r->month === $n->month && $r->day < $n->day)) ? 1 : 0);
    }

    /** 'adecuada', 'aceptable' o 'extraedad'; null si no se sabe la edad. */
    public static function estado(?int $edad, int $grado): ?string
    {
        return match (true) {
            $edad === null => null,
            $edad > self::aceptableHasta($grado) => 'extraedad',
            $edad > self::adecuada($grado) => 'aceptable',
            default => 'adecuada',
        };
    }

    /**
     * Para las alertas de la ficha, la lista y los inscritos: null si la edad es la
     * adecuada (o no se sabe); si no, el estado con la edad y el rango del grado.
     *
     * @return array{estado: string, edad: int, adecuada: int, aceptableHasta: int, anio: int}|null
     */
    public static function alerta(?string $nacimiento, int $grado, int $anio): ?array
    {
        $edad = self::alInicioDelAnio($nacimiento, $anio);
        $estado = self::estado($edad, $grado);
        if ($estado === null || $estado === 'adecuada') {
            return null;
        }

        return ['estado' => $estado, 'edad' => $edad, 'adecuada' => self::adecuada($grado), 'aceptableHasta' => self::aceptableHasta($grado), 'anio' => $anio];
    }
}
