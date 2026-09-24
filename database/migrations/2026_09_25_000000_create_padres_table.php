<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Madre y padre del estudiante. No es lo mismo que el acudiente: el
     * acudiente puede ser un abuelo o una tía, y aunque sea la madre, sus
     * datos se guardan también aquí (duplicados a propósito) para que la
     * ficha de los padres esté completa por sí sola.
     *
     * Mientras el estudiante solo está inscrito, la fila apunta a la
     * solicitud; al aprobarla se le asigna el estudiante_id.
     */
    public function up(): void
    {
        Schema::create('padres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_inscripcion_id')->nullable()->constrained('solicitudes_inscripcion')->cascadeOnDelete();
            $table->unsignedInteger('estudiante_id')->nullable();
            $table->enum('parentesco', ['madre', 'padre']);
            $table->enum('situacion', ['registrado', 'fallecido', 'desconocido'])->default('registrado')
                ->comment('registrado = hay datos; los otros dos no llevan nombre ni documento');
            $table->boolean('es_acudiente')->default(false)->comment('los datos se copiaron del acudiente');

            $table->string('primer_nombre', 40)->nullable();
            $table->string('segundo_nombre', 40)->nullable();
            $table->string('primer_apellido', 40)->nullable();
            $table->string('segundo_apellido', 40)->nullable();
            $table->enum('tipo_documento', ['C.C.', 'C.E.', 'P.P.T.', 'PAS', 'Otro'])->nullable();
            $table->string('numero_documento', 15)->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->string('telefono', 10)->nullable();
            $table->string('correo', 120)->nullable();
            $table->string('ocupacion', 80)->nullable();

            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['solicitud_inscripcion_id', 'parentesco'], 'uq_padres_solicitud');
            $table->unique(['estudiante_id', 'parentesco'], 'uq_padres_estudiante');
            $table->foreign('estudiante_id', 'fk_padres_est')->references('id')->on('estudiantes')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('padres');
    }
};
