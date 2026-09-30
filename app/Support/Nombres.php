<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Separa un nombre completo del Excel en apellidos y nombres.
 *
 * En el Excel el estudiante viene "Apellido1 Apellido2 Nombres" y el acudiente
 * "Nombres Apellido1 Apellido2". Las partículas de los apellidos compuestos
 * (de, del, de la, san…) se quedan con la palabra que acompañan: "De La Cruz"
 * es un solo apellido.
 *
 * No es infalible: con tres palabras no se puede saber si hay dos apellidos y
 * un nombre o un apellido y dos nombres (se asume lo primero, que es lo común
 * en Colombia). `dudoso()` dice cuáles conviene revisar a mano.
 */
final class Nombres
{
    private const PARTICULAS = ['de', 'del', 'la', 'las', 'los', 'san', 'santa', 'da', 'do', 'dos', 'di', 'van', 'von', 'y', 'mc', 'mac'];

    /**
     * "Restrepo Lopez Juan Manuel" → apellidos Restrepo / Lopez, nombres Juan / Manuel.
     *
     * @return array{primer_apellido: ?string, segundo_apellido: ?string, primer_nombre: ?string, segundo_nombre: ?string}
     */
    public static function deEstudiante(string $completo): array
    {
        $p = self::palabras($completo);

        return match (true) {
            count($p) === 0 => self::partes(null, null, null, null),
            count($p) === 1 => self::partes($p[0], null, null, null),
            count($p) === 2 => self::partes($p[0], null, $p[1], null),
            default => self::partes($p[0], $p[1], $p[2], implode(' ', array_slice($p, 3)) ?: null),
        };
    }

    /**
     * "Aura Maria Pineda Urbano" → nombres Aura / Maria, apellidos Pineda / Urbano.
     *
     * @return array{primer_apellido: ?string, segundo_apellido: ?string, primer_nombre: ?string, segundo_nombre: ?string}
     */
    public static function deAcudiente(string $completo): array
    {
        $p = self::palabras($completo);
        $n = count($p);

        return match (true) {
            $n === 0 => self::partes(null, null, null, null),
            $n === 1 => self::partes(null, null, $p[0], null),
            $n === 2 => self::partes($p[1], null, $p[0], null),
            default => self::partes($p[$n - 2], $p[$n - 1], $p[0], implode(' ', array_slice($p, 1, $n - 3)) ?: null),
        };
    }

    /**
     * Reparte el nombre de los estudiantes y acudientes que aún lo tienen en un
     * solo campo. No toca `nombre_completo` ni a quien ya tiene alguna parte,
     * así que se puede correr varias veces. Devuelve cuántos separó por tabla.
     *
     * @return array{estudiantes: int, acudientes: int}
     */
    public static function completar(): array
    {
        $hechos = ['estudiantes' => 0, 'acudientes' => 0];
        foreach (['estudiantes' => 'deEstudiante', 'acudientes' => 'deAcudiente'] as $tabla => $separar) {
            DB::table($tabla)
                ->whereNull('primer_apellido')->whereNull('segundo_apellido')
                ->whereNull('primer_nombre')->whereNull('segundo_nombre')
                ->orderBy('id')
                ->chunkById(500, function ($filas) use ($tabla, $separar, &$hechos) {
                    foreach ($filas as $fila) {
                        $hechos[$tabla] += DB::table($tabla)->where('id', $fila->id)->update(self::$separar((string) $fila->nombre_completo));
                    }
                });
        }

        return $hechos;
    }

    /** Conviene revisarlo: una o dos palabras, más de cuatro, o con partículas. */
    public static function dudoso(string $completo): bool
    {
        $crudas = preg_split('/\s+/', trim($completo), -1, PREG_SPLIT_NO_EMPTY);
        $n = count(self::palabras($completo));

        return $n < 3 || $n > 4 || count($crudas) !== $n;
    }

    /**
     * Las palabras del nombre, con cada partícula pegada a la palabra siguiente:
     * ["De La Cruz", "Perez", "Ana"].
     *
     * @return list<string>
     */
    private static function palabras(string $completo): array
    {
        $grupos = [];
        $pendiente = [];
        foreach (preg_split('/\s+/', trim($completo), -1, PREG_SPLIT_NO_EMPTY) as $palabra) {
            $pendiente[] = $palabra;
            if (! in_array(mb_strtolower($palabra), self::PARTICULAS, true)) {
                $grupos[] = implode(' ', $pendiente);
                $pendiente = [];
            }
        }
        // Al final no hay palabra a la que pegarse: ahí "Santa" o "Del" son un apellido más.
        if ($pendiente) {
            $grupos[] = implode(' ', $pendiente);
        }

        return $grupos;
    }

    /** @return array{primer_apellido: ?string, segundo_apellido: ?string, primer_nombre: ?string, segundo_nombre: ?string} */
    private static function partes(?string $a1, ?string $a2, ?string $n1, ?string $n2): array
    {
        return ['primer_apellido' => $a1, 'segundo_apellido' => $a2, 'primer_nombre' => $n1, 'segundo_nombre' => $n2];
    }
}
