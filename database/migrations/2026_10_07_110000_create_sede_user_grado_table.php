<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sede y grado juntos: en una sede asignada (sede_user) se puede limitar al
 * usuario a ciertos grados (p. ej. Rafael Pombo → Transición). Una sede sin
 * filas aquí sigue viéndose con todos sus grados, como hasta ahora.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sede_user_grado', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('sede_id');
            $table->unsignedTinyInteger('grado_id');

            $table->primary(['user_id', 'sede_id', 'grado_id']);
            $table->foreign('sede_id', 'fk_sug_sede')->references('id')->on('sedes')->cascadeOnDelete();
            $table->foreign('grado_id', 'fk_sug_grado')->references('id')->on('grados')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sede_user_grado');
    }
};
