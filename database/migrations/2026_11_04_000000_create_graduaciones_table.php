<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Los datos de la ceremonia de grado de cada año, que salen en las actas y los
 * diplomas de undécimo: la fecha, quién firma y, por modalidad, el número del
 * acta general y el libro y folio donde se registró.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('graduaciones', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->unsignedSmallInteger('anio_lectivo_id')->unique('uq_graduacion_anio');
            $table->date('fecha')->nullable();
            $table->string('rector', 120)->nullable();
            $table->string('cargo_rector', 60)->default('Rectora');
            $table->string('secretario', 120)->nullable();
            $table->string('cargo_secretario', 60)->default('Secretario Académico');
            // Por programa (ver ActasGrado::programas): {"modalidad-1": {"acta": "19-1", "libro": "01", "folio": "74-01"}, ...}
            $table->json('actas')->nullable();
            $table->timestamps();

            $table->foreign('anio_lectivo_id', 'fk_graduacion_anio')->references('id')->on('anios_lectivos')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('graduaciones');
    }
};
