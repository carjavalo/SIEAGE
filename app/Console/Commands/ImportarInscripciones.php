<?php

namespace App\Console\Commands;

use App\Models\SolicitudInscripcion;
use App\Support\ImportarInscripciones as Importador;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Lo mismo que subir el archivo en Importar datos, desde la consola del servidor:
 *   php artisan inscripciones:importar "FORMULARIO DE INSCRIPCIÓN….xlsx"
 * Quedan en el año lectivo activo, como las del formulario de SIEAGE.
 */
class ImportarInscripciones extends Command
{
    protected $signature = 'inscripciones:importar {archivo : El Excel descargado del formulario de Google}';

    protected $description = 'Crea inscripciones pendientes a partir del Excel del formulario de inscripción de Google';

    public function handle(): int
    {
        $ruta = $this->argument('archivo');
        if (! is_file($ruta)) {
            $this->error("No existe el archivo «{$ruta}».");

            return self::FAILURE;
        }
        if (! Importador::reconoce($ruta)) {
            $this->error('No parece la descarga del formulario de inscripción (faltan columnas como «Primer Nombre» o «Grado al que ingresará»).');

            return self::FAILURE;
        }

        $anioId = SolicitudInscripcion::anioLectivoActivoId();
        if (! $anioId) {
            $this->error('No hay un año lectivo activo.');

            return self::FAILURE;
        }
        $anio = DB::table('anios_lectivos')->find($anioId);

        $r = Importador::importar($ruta, $anio->id, basename($ruta));

        $this->info("Inscripciones {$anio->anio}: {$r['creadas']} creadas.");
        $this->line("  Ya estudian en el institución (omitidas): {$r['yaEstudian']}");
        $this->line("  Respuestas repetidas (quedó la última): {$r['repetidas']}");
        $this->line("  Ya estaban inscritas en {$anio->anio}: {$r['yaInscritas']}");
        foreach ($r['errores'] as $e) {
            $this->warn("  Fila {$e['fila']} ({$e['nombre']}): {$e['error']}");
        }

        return self::SUCCESS;
    }
}
