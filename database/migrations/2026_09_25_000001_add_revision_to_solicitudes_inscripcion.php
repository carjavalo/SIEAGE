<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Qué pasó con la solicitud: la matrícula que se creó al aprobarla (y con
     * ella el estudiante y el grupo), quién la revisó y cuándo.
     */
    public function up(): void
    {
        Schema::table('solicitudes_inscripcion', function (Blueprint $table) {
            $table->unsignedInteger('matricula_id')->nullable()->after('estado')->comment('la matrícula creada al aprobarla');
            $table->foreignId('revisada_por')->nullable()->after('matricula_id')->constrained('users')->nullOnDelete();
            $table->dateTime('revisada_en')->nullable()->after('revisada_por');

            $table->foreign('matricula_id', 'fk_sol_matricula')->references('id')->on('matriculas')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes_inscripcion', function (Blueprint $table) {
            $table->dropForeign('fk_sol_matricula');
            $table->dropConstrainedForeignId('revisada_por');
            $table->dropColumn(['matricula_id', 'revisada_en']);
        });
    }
};
