<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * El historial de correcciones de la ficha también anota cuando se cambia la
 * modalidad (técnica) de la matrícula. Sin este valor, guardar la modalidad
 * fallaba con error 500.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cambios_ficha', function (Blueprint $table) {
            $table->enum('accion', ['estudiante_editado', 'acudiente_editado', 'acudiente_agregado', 'acudiente_quitado', 'modalidad_editada'])->change();
        });
    }

    public function down(): void
    {
        Schema::table('cambios_ficha', function (Blueprint $table) {
            $table->enum('accion', ['estudiante_editado', 'acudiente_editado', 'acudiente_agregado', 'acudiente_quitado'])->change();
        });
    }
};
