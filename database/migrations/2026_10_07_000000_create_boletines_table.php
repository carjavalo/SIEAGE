<?php

use App\Support\Boletines;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Boletines de transición («Informe escolar de valoración»): un texto por
     * estudiante y periodo, escrito por el docente. Lo demás de la hoja sale de
     * lo que ya hay: la matrícula, el grupo y su director(a), la sede y su
     * coordinador(a), y el periodo con su porcentaje.
     */
    public function up(): void
    {
        Schema::create('boletines', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('matricula_id');
            $table->unsignedSmallInteger('periodo_id');
            $table->text('texto')->comment('la valoración: párrafos separados por saltos de línea');
            $table->unsignedInteger('revision')->default(1)->comment('sube en cada guardado: con ella se detecta si otro lo cambió');
            $table->foreignId('creado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('actualizado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['matricula_id', 'periodo_id'], 'uq_boletin');
            $table->foreign('matricula_id', 'fk_boletin_mat')->references('id')->on('matriculas')->cascadeOnDelete();
            $table->foreign('periodo_id', 'fk_boletin_per')->references('id')->on('periodos')->restrictOnDelete();

            $table->comment('Informe escolar de valoración de transición: el texto de cada estudiante por periodo');
        });

        // «PRIMER PERIODO 50%»: el boletín muestra el porcentaje del periodo.
        Schema::table('periodos', function (Blueprint $table) {
            $table->unsignedTinyInteger('porcentaje')->nullable()->after('nombre');
        });

        // Cómo se escribe la jornada en el boletín («UNICA DE 6:45AM A 12:00PM»); sin ella, la del grupo.
        Schema::table('grupos', function (Blueprint $table) {
            $table->string('jornada_boletin', 60)->nullable()->after('jornada');
        });

        // Quien firma como «Rector(a) o coordinador(a)» en los boletines de la sede.
        Schema::table('sedes', function (Blueprint $table) {
            $table->foreignId('coordinador_id')->nullable()->after('direccion')->constrained('users')->nullOnDelete();
        });

        // Los periodos de 2026 (dos de 50 %) y la dirección de la sede Rafael Pombo.
        // También lo hace DatabaseSeeder, porque en una base nueva los datos llegan después.
        Boletines::datosIniciales();
    }

    public function down(): void
    {
        Schema::dropIfExists('boletines');

        Schema::table('sedes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('coordinador_id');
        });
        Schema::table('grupos', function (Blueprint $table) {
            $table->dropColumn('jornada_boletin');
        });
        Schema::table('periodos', function (Blueprint $table) {
            $table->dropColumn('porcentaje');
        });
    }
};
