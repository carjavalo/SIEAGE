<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Dirección y barrio del acudiente, como en el formulario de matrícula del
     * colegio. Si vive con el estudiante, el formulario copia los de la residencia.
     * Opcionales en la tabla porque las solicitudes anteriores no los tienen.
     */
    public function up(): void
    {
        Schema::table('solicitudes_inscripcion', function (Blueprint $table) {
            $table->string('acudiente_direccion', 150)->nullable()->after('acudiente_parentesco_otro');
            $table->string('acudiente_barrio', 80)->nullable()->after('acudiente_direccion');
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes_inscripcion', function (Blueprint $table) {
            $table->dropColumn(['acudiente_direccion', 'acudiente_barrio']);
        });
    }
};
