<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Para importar el formulario de Google del colegio:
 *  - SISBÉN: el formulario usa los grupos del SISBÉN IV (A, B, C, D); antes solo
 *    cabían los niveles 1–3 del anterior. Pasa a texto corto para guardar ambos.
 *  - datos_adicionales: las preguntas de caracterización del formulario del
 *    colegio (preescolar, vivienda, asistencia, especialidad de 10.º…) que no
 *    tienen columna propia: [{pregunta, respuesta}], en el orden del formulario.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitudes_inscripcion', function (Blueprint $table) {
            $table->string('sisben', 10)->comment('ninguno, 1–3 (SISBÉN III) o A–D (SISBÉN IV)')->change();
            $table->json('datos_adicionales')->nullable()->comment('otras respuestas del formulario de Google: [{pregunta, respuesta}]');
        });
        Schema::table('estudiantes', function (Blueprint $table) {
            $table->string('sisben', 10)->nullable()->comment('ninguno, 1–3 (SISBÉN III) o A–D (SISBÉN IV)')->change();
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes_inscripcion', function (Blueprint $table) {
            $table->dropColumn('datos_adicionales');
        });
    }
};
