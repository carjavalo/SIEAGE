<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * El consecutivo de la ficha de matrícula (la constancia): un número por año
 * lectivo (1, 2, 3…) que no cambia, para que una ficha reimpresa salga con el
 * mismo. Las matrículas que ya existen se numeran en el orden en que se crearon;
 * las nuevas lo reciben al imprimir su ficha (ver App\Support\Constancias).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matriculas', function (Blueprint $table) {
            $table->unsignedInteger('consecutivo')->nullable()->comment('n.º de la ficha de matrícula en su año');
            $table->unique(['anio_lectivo_id', 'consecutivo'], 'uq_matricula_consecutivo');
        });

        DB::table('matriculas')->distinct()->pluck('anio_lectivo_id')->each(function ($anio) {
            DB::table('matriculas')->where('anio_lectivo_id', $anio)->orderBy('id')->pluck('id')
                ->each(fn ($id, $i) => DB::table('matriculas')->where('id', $id)->update(['consecutivo' => $i + 1]));
        });
    }

    public function down(): void
    {
        Schema::table('matriculas', function (Blueprint $table) {
            $table->dropUnique('uq_matricula_consecutivo');
            $table->dropColumn('consecutivo');
        });
    }
};
