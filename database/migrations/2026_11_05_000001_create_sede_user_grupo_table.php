<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Dentro de un grado marcado (sede_user_grado), solo algunos grupos: p. ej. la
 * docente de 0-1 en Rafael Pombo ve solo 0-1. Se guarda el número del grupo, no
 * su id, para que siga valiendo el año siguiente. Sin filas aquí, todos los grupos.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sede_user_grupo', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('sede_id');
            $table->unsignedTinyInteger('grado_id');
            $table->unsignedTinyInteger('numero');

            $table->primary(['user_id', 'sede_id', 'grado_id', 'numero']);
            $table->foreign('sede_id', 'fk_sugr_sede')->references('id')->on('sedes')->cascadeOnDelete();
            $table->foreign('grado_id', 'fk_sugr_grado')->references('id')->on('grados')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sede_user_grupo');
    }
};
