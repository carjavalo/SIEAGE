<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * La última vez que cada usuario usó el panel (no solo cuándo ingresó): la lista de
 * usuarios muestra «En línea» o «Hace 20 min». La anota App\Http\Middleware\RegistrarActividad.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('ultima_actividad')->nullable()->after('ultimo_acceso');
        });

        // Lo que se sabe hasta hoy: el último ingreso.
        DB::table('users')->whereNotNull('ultimo_acceso')->update(['ultima_actividad' => DB::raw('ultimo_acceso')]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('ultima_actividad');
        });
    }
};
