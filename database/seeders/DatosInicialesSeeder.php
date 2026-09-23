<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatosInicialesSeeder extends Seeder
{
    /**
     * Carga database/data/*.json. Solo inserta filas que no existan (por llave primaria o única),
     * así que se puede ejecutar varias veces sin duplicar ni sobrescribir nada.
     */
    public function run(): void
    {
        Schema::withoutForeignKeyConstraints(function () {
            foreach (DatosIniciales::TABLAS as $tabla) {
                $archivo = DatosIniciales::archivo($tabla);

                if (! is_file($archivo)) {
                    $this->command->warn("  {$tabla}: sin archivo de datos, se omite.");

                    continue;
                }

                ['columnas' => $columnas, 'filas' => $filas] = json_decode(file_get_contents($archivo), true);

                $insertadas = 0;
                foreach (array_chunk($filas, 500) as $lote) {
                    $insertadas += DB::table($tabla)->insertOrIgnore(
                        array_map(fn ($fila) => array_combine($columnas, $fila), $lote),
                    );
                }

                $this->command->line(sprintf('  %-22s %6d nuevas de %d', $tabla, $insertadas, count($filas)));
            }
        });
    }
}
