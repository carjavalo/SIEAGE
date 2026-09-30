<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Lo que el formulario de matrícula del colegio pregunta y faltaba: la
     * jornada que prefiere la familia y, en primaria, la sede donde quiere
     * estudiar. Son preferencias: el grupo lo decide la secretaría al matricular.
     */
    public function up(): void
    {
        Schema::table('solicitudes_inscripcion', function (Blueprint $table) {
            $table->enum('jornada', ['Mañana', 'Tarde'])->nullable()->after('grado_id')->comment('jornada que prefiere; depende del cupo');
            $table->unsignedTinyInteger('sede_preferida_id')->nullable()->after('jornada')->comment('solo primaria');
            $table->foreign('sede_preferida_id', 'fk_sol_sede')->references('id')->on('sedes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes_inscripcion', function (Blueprint $table) {
            $table->dropForeign('fk_sol_sede');
            $table->dropColumn(['jornada', 'sede_preferida_id']);
        });
    }
};
