<?php

namespace App\Console\Commands;

use Database\Seeders\DatosIniciales;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExportarDatos extends Command
{
    protected $signature = 'sieage:exportar-datos';

    protected $description = 'Guarda los datos actuales de la BD en database/data/*.json para que db:seed los recree en otro equipo';

    public function handle(): int
    {
        foreach (DatosIniciales::TABLAS as $tabla) {
            $columnas = Schema::getColumnListing($tabla);
            $orden = in_array('id', $columnas) ? ['id'] : array_slice($columnas, 0, 2);

            $consulta = DB::table($tabla);
            foreach ($orden as $columna) {
                $consulta->orderBy($columna);
            }

            $filas = $consulta->get()->map(fn ($fila) => array_values((array) $fila))->all();

            file_put_contents(
                DatosIniciales::archivo($tabla),
                json_encode(['columnas' => $columnas, 'filas' => $filas], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)."\n",
            );

            $this->line(sprintf('  %-22s %6d filas', $tabla, count($filas)));
        }

        $this->info('Datos exportados en database/data/. Haz commit de esos archivos.');

        return self::SUCCESS;
    }
}
