<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * El periodo que se está calificando: lo fija quien configura los boletines y es
 * el que todos abren al entrar a Boletines. A lo sumo uno por año (lo cuida
 * BoletinController::calificar). Sin ninguno marcado se elige por fechas, como antes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('periodos', function (Blueprint $table) {
            $table->boolean('calificando')->default(false)->after('porcentaje');
        });
    }

    public function down(): void
    {
        Schema::table('periodos', function (Blueprint $table) {
            $table->dropColumn('calificando');
        });
    }
};
