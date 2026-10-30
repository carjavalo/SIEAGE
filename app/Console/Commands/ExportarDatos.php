<?php

namespace App\Console\Commands;

use Database\Seeders\DatosIniciales;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExportarDatos extends Command
{
    protected $signature = 'sieage:exportar-datos {--tabla=* : Solo estas tablas (p. ej. --tabla=users)}';

    protected $description = 'Guarda los catálogos de la BD en database/data/*.json (sin datos de personas: el repositorio es público)';

    public function handle(): int
    {
        $catalogos = array_values(array_diff(DatosIniciales::TABLAS, DatosIniciales::PERSONALES));
        $tablas = $this->option('tabla') ?: $catalogos;
        if ($desconocidas = array_diff($tablas, $catalogos)) {
            $this->error('No se exportan estas tablas: '.implode(', ', $desconocidas).'. Las de personas no van al repositorio: para pasarlas a otro equipo, un respaldo con mysqldump.');

            return self::FAILURE;
        }

        foreach ($tablas as $tabla) {
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
