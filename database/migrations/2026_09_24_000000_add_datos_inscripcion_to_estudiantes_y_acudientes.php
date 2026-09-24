<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Columnas para guardar en las tablas oficiales lo que captura el
     * formulario de inscripción (/inscripcion) y que el Excel no traía:
     * nacimiento, salud, residencia del estudiante y datos completos del
     * acudiente. Todas son opcionales porque los estudiantes importados del
     * Excel no las tienen.
     */
    public function up(): void
    {
        Schema::table('estudiantes', function (Blueprint $table) {
            $table->enum('tipo_documento', ['R.C.', 'T.I.', 'C.C.', 'C.E.', 'P.P.T.', 'N.U.I.P.', 'N.E.S.', 'Otro'])->default('T.I.')->change();
            $table->string('tipo_documento_otro', 40)->nullable()->after('tipo_documento')->comment('solo si tipo_documento = Otro');
            $table->string('ciudad_expedicion', 80)->nullable()->after('numero_documento');

            $table->string('pais_nacimiento', 60)->nullable()->after('fecha_nacimiento');
            $table->string('ciudad_nacimiento', 80)->nullable()->after('pais_nacimiento');

            $table->enum('tipo_sangre', ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])->nullable()->after('genero');
            $table->enum('sisben', ['ninguno', '1', '2', '3'])->nullable()->after('tipo_sangre');
            $table->string('eps', 80)->nullable()->after('sisben');
            $table->string('grupo_etnico', 60)->nullable()->after('eps');
            $table->string('discapacidad', 300)->nullable()->after('grupo_etnico');

            $table->string('direccion', 150)->nullable()->after('discapacidad');
            $table->unsignedSmallInteger('barrio_id')->nullable()->after('direccion');
            $table->string('telefono_1', 10)->nullable()->after('barrio_id');
            $table->string('telefono_2', 10)->nullable()->after('telefono_1');
            $table->string('correo', 120)->nullable()->after('telefono_2');

            $table->foreign('barrio_id', 'fk_est_barrio')->references('id')->on('barrios')->nullOnDelete();
        });

        Schema::table('acudientes', function (Blueprint $table) {
            $table->string('primer_nombre', 40)->nullable()->after('nombre_completo');
            $table->string('segundo_nombre', 40)->nullable()->after('primer_nombre');
            $table->string('primer_apellido', 40)->nullable()->after('segundo_nombre');
            $table->string('segundo_apellido', 40)->nullable()->after('primer_apellido');
            $table->date('fecha_nacimiento')->nullable()->after('segundo_apellido');
            $table->string('ciudad_expedicion', 80)->nullable()->after('numero_documento');
        });

        Schema::table('estudiante_acudiente', function (Blueprint $table) {
            $table->string('parentesco_otro', 40)->nullable()->after('parentesco_id')->comment('solo si el parentesco es Otro');
        });
    }

    public function down(): void
    {
        Schema::table('estudiante_acudiente', function (Blueprint $table) {
            $table->dropColumn('parentesco_otro');
        });

        Schema::table('acudientes', function (Blueprint $table) {
            $table->dropColumn(['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'fecha_nacimiento', 'ciudad_expedicion']);
        });

        Schema::table('estudiantes', function (Blueprint $table) {
            $table->dropForeign('fk_est_barrio');
            $table->dropColumn([
                'tipo_documento_otro', 'ciudad_expedicion', 'pais_nacimiento', 'ciudad_nacimiento',
                'tipo_sangre', 'sisben', 'eps', 'grupo_etnico', 'discapacidad',
                'direccion', 'barrio_id', 'telefono_1', 'telefono_2', 'correo',
            ]);
            $table->enum('tipo_documento', ['R.C.', 'T.I.', 'C.C.', 'C.E.', 'P.P.T.', 'N.U.I.P.', 'N.E.S.'])->default('T.I.')->change();
        });
    }
};
