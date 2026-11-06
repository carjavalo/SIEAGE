<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Las modalidades (media técnica) son un catálogo fijo: Asist. Admin., Ebanistería,
 * Electricidad, Electrónica… Lo que llega escrito (del Excel, por ejemplo) se busca
 * en ese catálogo; nunca se crea otra.
 *
 * Un texto es una modalidad si tiene las mismas palabras y cada palabra de uno es el
 * comienzo de la del otro, sin importar tildes, mayúsculas ni puntos: «Asistencia
 * Administrativa», «Asist. Admin» y «ASIST ADMIN.» son «Asist. Admin.»; «Electronica»
 * es «Electrónica». «Electricidad» y «Electrónica» no se confunden, y lo que podría
 * ser cualquiera de las dos («Elec») queda sin modalidad.
 */
final class Modalidades
{
    /** El id de la modalidad que corresponde a ese texto, o null si no es ninguna. */
    public static function buscar(?string $texto): ?int
    {
        $buscadas = self::palabras((string) $texto);
        if ($buscadas === []) {
            return null;
        }
        $encontradas = DB::table('modalidades')->orderBy('id')->get(['id', 'nombre'])
            ->filter(fn ($m) => self::iguales($buscadas, self::palabras($m->nombre)));

        // Escrita igual, esa; si no, «Elec» podría ser Electricidad o Electrónica: si es más de una, no se adivina.
        $exacta = $encontradas->first(fn ($m) => self::palabras($m->nombre) === $buscadas);
        if ($exacta) {
            return (int) $exacta->id;
        }

        return $encontradas->count() === 1 ? (int) $encontradas->first()->id : null;
    }

    /** @return list<string> */
    public static function palabras(string $nombre): array
    {
        return array_values(array_filter(preg_split('/[^a-z0-9]+/', Str::lower(Str::ascii($nombre))) ?: []));
    }

    /**
     * @param  list<string>  $a
     * @param  list<string>  $b
     */
    public static function iguales(array $a, array $b): bool
    {
        if (count($a) !== count($b) || $a === []) {
            return false;
        }
        foreach ($a as $i => $p) {
            if ($p === $b[$i]) {
                continue;
            }
            [$corta, $larga] = strlen($p) <= strlen($b[$i]) ? [$p, $b[$i]] : [$b[$i], $p];
            if (strlen($corta) < 3 || ! str_starts_with($larga, $corta)) {
                return false;
            }
        }

        return true;
    }
}
