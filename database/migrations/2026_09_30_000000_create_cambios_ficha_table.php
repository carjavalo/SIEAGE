<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cada corrección hecha desde la ficha: los datos del estudiante, los de un
     * acudiente, o que se le agregó o quitó uno. Guarda qué campos cambiaron,
     * con el valor anterior, quién lo hizo y cuándo.
     */
    public function up(): void
    {
        Schema::create('cambios_ficha', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('estudiante_id')->comment('desde la ficha de quién se hizo el cambio');
            $table->unsignedInteger('acudiente_id')->nullable();
            $table->enum('accion', ['estudiante_editado', 'acudiente_editado', 'acudiente_agregado', 'acudiente_quitado']);
            $table->json('cambios')->nullable()->comment('campo → [antes, después]');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->nullable();

            $table->index(['estudiante_id', 'id'], 'ix_cambios_est');
            $table->index(['acudiente_id', 'id'], 'ix_cambios_acu');
            $table->foreign('estudiante_id', 'fk_cambios_est')->references('id')->on('estudiantes')->cascadeOnDelete();
            $table->foreign('acudiente_id', 'fk_cambios_acu')->references('id')->on('acudientes')->nullOnDelete();

            $table->comment('Historial de correcciones de los datos del estudiante y sus acudientes');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cambios_ficha');
    }
};
