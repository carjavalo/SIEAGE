<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Inscripciones que llegan del formulario público (/inscripcion).
     *
     * Una solicitud NO es una matrícula: entra como 'pendiente' y la
     * secretaría la revisa. Solo al aprobarla se crearán el estudiante, el
     * acudiente y la matrícula en las tablas oficiales. Por eso aquí vive
     * todo lo que llena el acudiente, incluidos los datos que las tablas
     * oficiales todavía no tienen (EPS, SISBÉN, tipo de sangre, etnia…).
     */
    public function up(): void
    {
        Schema::create('solicitudes_inscripcion', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('anio_lectivo_id')->nullable()->comment('año lectivo activo cuando se envió');
            $table->enum('estado', ['pendiente', 'aprobada', 'rechazada'])->default('pendiente');

            // --- Estudiante ---------------------------------------------
            $table->string('primer_nombre', 40);
            $table->string('segundo_nombre', 40)->nullable();
            $table->string('primer_apellido', 40);
            $table->string('segundo_apellido', 40)->nullable();
            $table->enum('sexo', ['F', 'M']);
            $table->string('pais_nacimiento', 60)->comment('"Colombia" o el país que escribió');
            $table->string('ciudad_nacimiento', 80);
            $table->date('fecha_nacimiento');
            $table->enum('tipo_documento', ['R.C.', 'T.I.', 'C.C.', 'C.E.', 'P.P.T.', 'Otro']);
            $table->string('tipo_documento_otro', 40)->nullable()->comment('solo si tipo_documento = Otro');
            $table->string('numero_documento', 15);
            $table->string('ciudad_expedicion', 80);

            // --- Grado y salud ------------------------------------------
            $table->unsignedTinyInteger('grado_id')->comment('grado al que ingresa');
            $table->enum('tipo_sangre', ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']);
            $table->enum('sisben', ['ninguno', '1', '2', '3']);
            $table->string('eps', 80);
            $table->string('grupo_etnico', 60)->comment('la opción elegida o lo que escribió en "Otro"');
            $table->string('discapacidad', 300)->nullable();

            // --- Residencia y contacto ----------------------------------
            $table->string('direccion', 150);
            $table->string('barrio', 80)->comment('texto libre: puede no estar en el catálogo de barrios');
            $table->string('telefono_1', 10);
            $table->string('telefono_2', 10);
            $table->string('correo', 120);

            // --- Acudiente ----------------------------------------------
            $table->string('acudiente_primer_nombre', 40);
            $table->string('acudiente_segundo_nombre', 40)->nullable();
            $table->string('acudiente_primer_apellido', 40);
            $table->string('acudiente_segundo_apellido', 40)->nullable();
            $table->date('acudiente_fecha_nacimiento');
            $table->string('acudiente_numero_documento', 15);
            $table->string('acudiente_ciudad_expedicion', 80);
            $table->unsignedTinyInteger('acudiente_parentesco_id');
            $table->string('acudiente_parentesco_otro', 40)->nullable()->comment('solo si el parentesco es Otro');
            $table->string('acudiente_telefono_1', 10);
            $table->string('acudiente_telefono_2', 10);
            $table->string('acudiente_correo', 120)->nullable();

            // --- Constancia de la autorización (Ley 1581 de 2012) --------
            // DATETIME y no TIMESTAMP: en MariaDB 10.4 la primera columna
            // TIMESTAMP NOT NULL recibe "ON UPDATE CURRENT_TIMESTAMP", y la
            // fecha de la autorización cambiaría al aprobar la solicitud.
            $table->dateTime('autorizo_datos_en');
            $table->string('ip', 45)->nullable();
            $table->string('navegador', 255)->nullable();

            $table->timestamps();

            $table->index(['estado', 'created_at'], 'ix_sol_estado');
            $table->index(['numero_documento', 'anio_lectivo_id'], 'ix_sol_doc');
            $table->index('acudiente_numero_documento', 'ix_sol_acu_doc');
            $table->foreign('anio_lectivo_id', 'fk_sol_anio')->references('id')->on('anios_lectivos')->nullOnDelete();
            $table->foreign('grado_id', 'fk_sol_grado')->references('id')->on('grados')->restrictOnDelete();
            $table->foreign('acudiente_parentesco_id', 'fk_sol_par')->references('id')->on('parentescos')->restrictOnDelete();

            $table->comment('Inscripciones del formulario público, pendientes de revisión por la secretaría');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_inscripcion');
    }
};
