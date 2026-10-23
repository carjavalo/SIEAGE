<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Corrige el consecutivo: debe ser único por grado (y año), no por año en general.
 * El consecutivo inicia en 1 en cada grado y se incrementa según el número de estudiantes.
 * Esto se calcula dinámicamente en Constancias::numerosEnElGrupo() pero no se guarda
 * de forma acorde a la restricción unique. Esta migración ajusta la unicidad.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Cambiar la restricción unique para que sea por anio_lectivo_id, grado_id, sede_id
        // en lugar de solo anio_lectivo_id
        Schema::table('matriculas', function (Blueprint $table) {
            $table->dropUnique('uq_matricula_consecutivo');
        });

        Schema::table('matriculas', function (Blueprint $table) {
            $table->unique(['anio_lectivo_id', 'grado_id', 'sede_id', 'consecutivo'], 'uq_matricula_consecutivo_por_grado');
        });

        // Renumerar los consecutivos: 1, 2, 3... por cada (año, grado, sede).
        DB::table('matriculas')
            ->select('anio_lectivo_id', 'grado_id', 'sede_id')
            ->distinct()
            ->get()
            ->each(function ($combo) {
                DB::table('matriculas')
                    ->where('anio_lectivo_id', $combo->anio_lectivo_id)
                    ->where('grado_id', $combo->grado_id)
                    ->where('sede_id', $combo->sede_id)
                    ->orderBy('id')
                    ->pluck('id')
                    ->each(fn ($id, $i) => DB::table('matriculas')->where('id', $id)->update(['consecutivo' => $i + 1]));
            });
    }

    public function down(): void
    {
        Schema::table('matriculas', function (Blueprint $table) {
            $table->dropUnique('uq_matricula_consecutivo_por_grado');
        });

        Schema::table('matriculas', function (Blueprint $table) {
            $table->unique(['anio_lectivo_id', 'consecutivo'], 'uq_matricula_consecutivo');
        });

        // Restaurar numeración por año
        DB::table('matriculas')->distinct()->pluck('anio_lectivo_id')->each(function ($anio) {
            DB::table('matriculas')->where('anio_lectivo_id', $anio)->orderBy('id')->pluck('id')
                ->each(fn ($id, $i) => DB::table('matriculas')->where('id', $id)->update(['consecutivo' => $i + 1]));
        });
    }
};
