<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * El historial de la matrícula también anota cuándo se cambia a un estudiante de
 * grupo o de sede (sin devolverlo a inscritos), con la razón y quién lo hizo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('novedades_matricula', function (Blueprint $table) {
            $table->enum('tipo', ['deshabilitada', 'habilitada', 'reprobada', 'reprobacion_quitada', 'cambio_grupo'])->change();
        });
    }

    public function down(): void
    {
        Schema::table('novedades_matricula', function (Blueprint $table) {
            $table->enum('tipo', ['deshabilitada', 'habilitada', 'reprobada', 'reprobacion_quitada'])->change();
        });
    }
};
