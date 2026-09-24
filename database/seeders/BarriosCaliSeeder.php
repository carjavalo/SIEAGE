<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Barrios y sectores oficiales de Santiago de Cali (Acuerdo 0636 de 2026 del
 * Concejo, capa de barrios del IDESC) y algunos lugares verificados fuera del
 * área urbana donde viven familias del colegio. Son las sugerencias del campo
 * Barrio del formulario de inscripción.
 *
 * Se fusiona con lo que ya haya en la tabla: si el barrio ya existe con el
 * mismo nombre (sin importar tildes ni mayúsculas) se completa con su código,
 * tipo y comuna, conservando su id; si no, se inserta. Se puede ejecutar
 * varias veces sin duplicar nada.
 */
class BarriosCaliSeeder extends Seeder
{
    public function run(): void
    {
        $datos = json_decode(file_get_contents(database_path('data/barrios_cali.json')), true);

        $existentes = DB::table('barrios')->get(['id', 'nombre', 'codigo']);
        $porCodigo = $existentes->whereNotNull('codigo')->keyBy('codigo');
        $porNombre = $existentes->keyBy(fn ($b) => self::clave($b->nombre));
        [$nuevos, $completados] = [0, 0];

        foreach ([...$datos['barrios'], ...$datos['otros']] as $b) {
            $fila = [
                'codigo' => $b['codigo'] ?? null,
                'nombre' => $b['nombre'],
                'comuna' => isset($b['comuna']) ? (string) $b['comuna'] : null,
                'tipo' => $b['tipo'],
                'municipio' => $b['municipio'] ?? null,
            ];
            $clave = self::clave($fila['nombre']);
            $actual = ($fila['codigo'] ? $porCodigo->get($fila['codigo']) : null) ?? $porNombre->get($clave);

            if (! $actual) {
                $id = DB::table('barrios')->insertGetId($fila);
                $porNombre->put($clave, (object) ['id' => $id]);
                $nuevos++;

                continue;
            }

            // Si el nombre oficial ya lo tiene otra fila, se deja el que había
            // para no chocar con la llave única.
            if (($porNombre->get($clave)?->id ?? $actual->id) !== $actual->id) {
                unset($fila['nombre']);
            }
            $completados += DB::table('barrios')->where('id', $actual->id)->update($fila);
        }

        $this->command?->line("  barrios de Cali: {$nuevos} nuevos, {$completados} completados");
    }

    private static function clave(string $nombre): string
    {
        return Str::of($nombre)->ascii()->lower()->squish()->value();
    }
}
