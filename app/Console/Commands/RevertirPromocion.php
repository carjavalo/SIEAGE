<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Deshace la promoción del año en curso (pensado para pruebas): borra las
 * matrículas que la promoción creó en el año siguiente, devuelve a "activo" a
 * los de undécimo que quedaron graduados y quita la marca "promovido". Si el
 * año siguiente queda vacío, también se borran sus grupos y el año.
 *
 * No toca a los inscritos que se matricularon directamente en el año
 * siguiente (condición "nuevo"), ni a nadie deshabilitado a mano.
 */
class RevertirPromocion extends Command
{
    protected $signature = 'sieage:revertir-promocion {--force : No pedir confirmación}';

    protected $description = 'Deshace la promoción del año lectivo en curso al año siguiente';

    public function handle(): int
    {
        $origen = DB::table('anios_lectivos')->where('estado', 'activo')->first();
        $destino = $origen ? DB::table('anios_lectivos')->where('anio', $origen->anio + 1)->first() : null;
        if (! $origen || ! $destino) {
            $this->info('No hay promoción que deshacer.');

            return self::SUCCESS;
        }

        // Las matrículas que creó la promoción: "antiguo" en el año siguiente, de
        // estudiantes cuya matrícula de este año quedó como promovida.
        $promovidas = DB::table('matriculas as sig')
            ->join('matriculas as m', fn ($j) => $j->on('m.estudiante_id', '=', 'sig.estudiante_id')->where('m.anio_lectivo_id', $origen->id))
            ->where('sig.anio_lectivo_id', $destino->id)
            ->where('sig.condicion', 'antiguo')
            ->where('m.resultado', 'promovido')
            ->pluck('sig.id');
        $graduados = DB::table('matriculas')->where('anio_lectivo_id', $origen->id)->where('estado', 'graduado')->where('resultado', 'promovido')->count();

        $this->line("Año {$origen->anio} → {$destino->anio}:");
        $this->line("  {$promovidas->count()} matrículas de {$destino->anio} se borran");
        $this->line("  {$graduados} graduados de undécimo vuelven a activos");

        if (! $this->option('force') && ! $this->confirm('¿Deshacer la promoción?')) {
            return self::FAILURE;
        }

        DB::transaction(function () use ($origen, $destino, $promovidas) {
            DB::table('matriculas')->whereIn('id', $promovidas)->delete();
            DB::table('matriculas')->where('anio_lectivo_id', $origen->id)->where('estado', 'graduado')->where('resultado', 'promovido')
                ->update(['estado' => 'activo', 'resultado' => null, 'updated_at' => now()]);
            DB::table('matriculas')->where('anio_lectivo_id', $origen->id)->where('estado', 'activo')->where('resultado', 'promovido')
                ->update(['resultado' => null, 'updated_at' => now()]);

            // Si el año siguiente quedó sin nadie y solo estaba planeado, se quita con sus grupos.
            if ($destino->estado === 'planeado' && ! DB::table('matriculas')->where('anio_lectivo_id', $destino->id)->exists()) {
                DB::table('grupos')->where('anio_lectivo_id', $destino->id)->delete();
                DB::table('periodos')->where('anio_lectivo_id', $destino->id)->delete();
                DB::table('anios_lectivos')->where('id', $destino->id)->delete();
                $this->line("  El año {$destino->anio} quedó vacío: se borró con sus grupos.");
            }
        });

        $this->info('Promoción deshecha.');

        return self::SUCCESS;
    }
}
