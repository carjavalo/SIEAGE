<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * El historial de la matrícula también anota cuándo se marca que un estudiante
 * reprobó el año (repite el grado al promover) y cuándo se quita esa marca.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('novedades_matricula', function (Blueprint $table) {
            $table->enum('tipo', ['deshabilitada', 'habilitada', 'reprobada', 'reprobacion_quitada'])->change();
        });
    }

    public function down(): void
    {
        Schema::table('novedades_matricula', function (Blueprint $table) {
            $table->enum('tipo', ['deshabilitada', 'habilitada'])->change();
        });
    }
};
