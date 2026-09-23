<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tablas del dominio académico (institución, sedes, estudiantes, acudientes, matrículas…).
     * Reproduce la estructura de docs/bd/sieage.sql.
     */
    public function up(): void
    {
        $jornadas = ['Mañana', 'Tarde', 'Única', 'Noche'];

        // En MySQL se conservan los nombres de índice originales; SQLite exige nombres únicos en toda la BD.
        $indice = fn (string $tabla, string $nombre) => DB::getDriverName() === 'mysql' ? $nombre : "{$tabla}_{$nombre}";

        // --- Catálogos ---------------------------------------------------

        Schema::create('instituciones', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('nombre', 150);
            $table->string('nit', 20)->nullable();
            $table->string('codigo_dane', 20)->nullable();
            $table->string('resolucion', 150)->nullable();
            $table->string('municipio', 80)->nullable();
            $table->string('rector', 120)->nullable();
            $table->timestamps();
        });

        Schema::create('sedes', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->unsignedTinyInteger('institucion_id');
            $table->string('codigo', 5);
            $table->string('nombre', 80);
            $table->string('direccion', 150)->nullable();
            $table->boolean('es_principal')->default(false);
            $table->boolean('activa')->default(true);
            $table->timestamps();

            $table->unique(['institucion_id', 'codigo'], 'uq_sedes_codigo');
            $table->foreign('institucion_id', 'fk_sedes_inst')->references('id')->on('instituciones')->restrictOnDelete()->cascadeOnUpdate();
        });

        Schema::create('anios_lectivos', function (Blueprint $table) use ($indice) {
            $table->smallIncrements('id');
            $table->unsignedSmallInteger('anio')->unique($indice('anios_lectivos', 'anio'));
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->enum('estado', ['planeado', 'activo', 'cerrado'])->default('planeado');
            $table->timestamps();
        });

        Schema::create('periodos', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->unsignedSmallInteger('anio_lectivo_id');
            $table->unsignedTinyInteger('numero');
            $table->string('nombre', 30)->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();

            $table->unique(['anio_lectivo_id', 'numero'], 'uq_periodo');
            $table->foreign('anio_lectivo_id', 'fk_periodo_anio')->references('id')->on('anios_lectivos')->cascadeOnDelete();
        });

        Schema::create('grados', function (Blueprint $table) use ($indice) {
            $table->tinyIncrements('id');
            $table->tinyInteger('numero')->unique($indice('grados', 'numero'));
            $table->string('nombre', 20);
            $table->enum('nivel', ['preescolar', 'primaria', 'secundaria', 'media']);
        });

        Schema::create('modalidades', function (Blueprint $table) use ($indice) {
            $table->tinyIncrements('id');
            $table->string('nombre', 40)->unique($indice('modalidades', 'nombre'));
            $table->boolean('activa')->default(true);
        });

        Schema::create('parentescos', function (Blueprint $table) use ($indice) {
            $table->tinyIncrements('id');
            $table->string('nombre', 30)->unique($indice('parentescos', 'nombre'));
        });

        Schema::create('barrios', function (Blueprint $table) use ($indice) {
            $table->smallIncrements('id');
            $table->string('nombre', 80)->unique($indice('barrios', 'nombre'));
            $table->string('comuna', 20)->nullable();
        });

        // --- Personas ----------------------------------------------------

        Schema::create('docentes', function (Blueprint $table) use ($indice) {
            $table->increments('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('documento', 20)->nullable()->unique($indice('docentes', 'documento'));
            $table->string('nombre_completo', 120);
            $table->string('email', 120)->nullable();
            $table->string('telefono', 25)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('estudiantes', function (Blueprint $table) {
            $table->increments('id');
            $table->enum('tipo_documento', ['R.C.', 'T.I.', 'C.C.', 'C.E.', 'P.P.T.', 'N.U.I.P.', 'N.E.S.'])->default('T.I.');
            $table->string('numero_documento', 20);
            $table->string('nombre_completo', 150);
            $table->string('primer_apellido', 40)->nullable();
            $table->string('segundo_apellido', 40)->nullable();
            $table->string('primer_nombre', 40)->nullable();
            $table->string('segundo_nombre', 40)->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->enum('genero', ['F', 'M', 'O'])->nullable();
            $table->boolean('tiene_foto')->default(false);
            $table->string('foto_path')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tipo_documento', 'numero_documento'], 'uq_est_doc');
            $table->index('nombre_completo', 'ix_est_nombre');
        });

        Schema::create('acudientes', function (Blueprint $table) {
            $table->increments('id');
            $table->enum('tipo_documento', ['C.C.', 'C.E.', 'P.P.T.', 'PAS', 'N.I.T.'])->default('C.C.');
            $table->string('numero_documento', 20);
            $table->string('nombre_completo', 150);
            $table->string('telefono_fijo', 25)->nullable();
            $table->string('telefono_celular', 25)->nullable();
            $table->string('email', 120)->nullable();
            $table->string('direccion', 150)->nullable();
            $table->unsignedSmallInteger('barrio_id')->nullable();
            $table->timestamps();

            $table->unique(['tipo_documento', 'numero_documento'], 'uq_acu_doc');
            $table->foreign('barrio_id', 'fk_acu_barrio')->references('id')->on('barrios')->nullOnDelete();
        });

        Schema::create('estudiante_acudiente', function (Blueprint $table) {
            $table->unsignedInteger('estudiante_id');
            $table->unsignedInteger('acudiente_id');
            $table->unsignedTinyInteger('parentesco_id');
            $table->boolean('es_principal')->default(true);
            $table->boolean('vive_con')->default(true);

            $table->primary(['estudiante_id', 'acudiente_id']);
            $table->foreign('acudiente_id', 'fk_ea_acu')->references('id')->on('acudientes')->cascadeOnDelete();
            $table->foreign('estudiante_id', 'fk_ea_est')->references('id')->on('estudiantes')->cascadeOnDelete();
            $table->foreign('parentesco_id', 'fk_ea_par')->references('id')->on('parentescos')->restrictOnDelete();
        });

        // --- Grupos y matrículas -----------------------------------------

        Schema::create('grupos', function (Blueprint $table) use ($jornadas) {
            $table->increments('id');
            $table->unsignedSmallInteger('anio_lectivo_id');
            $table->unsignedTinyInteger('sede_id');
            $table->unsignedTinyInteger('grado_id');
            $table->unsignedTinyInteger('numero');
            $table->string('codigo', 10);
            $table->enum('jornada', $jornadas)->default('Mañana');
            $table->unsignedInteger('director_id')->nullable();
            $table->unsignedSmallInteger('cupos_proyectados')->default(34);
            $table->timestamps();

            $table->unique(['anio_lectivo_id', 'sede_id', 'grado_id', 'numero', 'jornada'], 'uq_grupo');
            $table->index(['anio_lectivo_id', 'codigo'], 'ix_grupo_codigo');
            $table->foreign('anio_lectivo_id', 'fk_grupo_anio')->references('id')->on('anios_lectivos')->restrictOnDelete();
            $table->foreign('director_id', 'fk_grupo_dir')->references('id')->on('docentes')->nullOnDelete();
            $table->foreign('grado_id', 'fk_grupo_grado')->references('id')->on('grados')->restrictOnDelete();
            $table->foreign('sede_id', 'fk_grupo_sede')->references('id')->on('sedes')->restrictOnDelete();
        });

        Schema::create('matriculas', function (Blueprint $table) use ($jornadas) {
            $table->increments('id');
            $table->unsignedInteger('estudiante_id');
            $table->unsignedSmallInteger('anio_lectivo_id');
            $table->unsignedTinyInteger('grado_id');
            $table->unsignedInteger('grupo_id')->nullable();
            $table->unsignedTinyInteger('sede_id');
            $table->unsignedTinyInteger('modalidad_id')->nullable();
            $table->enum('jornada', $jornadas)->nullable();
            $table->date('fecha_matricula')->nullable();
            $table->enum('condicion', ['nuevo', 'antiguo', 'repitente', 'trasladado'])->default('nuevo');
            $table->enum('estado', ['activo', 'retirado', 'trasladado', 'graduado', 'cancelado'])->default('activo');
            $table->enum('resultado', ['promovido', 'reprobado', 'pendiente', 'desertor'])->nullable();
            $table->date('fecha_retiro')->nullable();
            $table->string('motivo_retiro', 200)->nullable();
            $table->unsignedSmallInteger('numero_orden')->nullable();
            $table->boolean('es_historico')->default(false);
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->unique(['estudiante_id', 'anio_lectivo_id'], 'uq_matricula');
            $table->index(['grupo_id', 'estado'], 'ix_mat_grupo');
            $table->index(['anio_lectivo_id', 'sede_id', 'estado'], 'ix_mat_anio_sede');
            $table->foreign('anio_lectivo_id', 'fk_mat_anio')->references('id')->on('anios_lectivos')->restrictOnDelete();
            $table->foreign('estudiante_id', 'fk_mat_est')->references('id')->on('estudiantes')->cascadeOnDelete();
            $table->foreign('grado_id', 'fk_mat_grado')->references('id')->on('grados')->restrictOnDelete();
            $table->foreign('grupo_id', 'fk_mat_grupo')->references('id')->on('grupos')->nullOnDelete();
            $table->foreign('modalidad_id', 'fk_mat_moda')->references('id')->on('modalidades')->nullOnDelete();
            $table->foreign('sede_id', 'fk_mat_sede')->references('id')->on('sedes')->restrictOnDelete();
        });

        Schema::create('entregas_boletin', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('matricula_id');
            $table->unsignedSmallInteger('periodo_id');
            $table->enum('estado', ['entregado', 'pendiente', 'no_aplica'])->default('pendiente');
            $table->date('fecha_entrega')->nullable();
            $table->string('recibido_por', 120)->nullable();

            $table->unique(['matricula_id', 'periodo_id'], 'uq_entrega');
            $table->foreign('matricula_id', 'fk_bol_mat')->references('id')->on('matriculas')->cascadeOnDelete();
            $table->foreign('periodo_id', 'fk_bol_per')->references('id')->on('periodos')->restrictOnDelete();
        });

        Schema::create('boletines_excel', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('matricula_id')->comment('la matrícula del año en curso');
            $table->unsignedTinyInteger('numero')->comment('el encabezado: 1 = 1º … 10 = 10º');
            $table->string('valor', 20)->comment('texto literal de la celda: S, NO APLICA, …');

            $table->unique(['matricula_id', 'numero'], 'uq_bol_excel');
            $table->index('valor', 'ix_bol_excel_valor');
            $table->foreign('matricula_id', 'fk_bolx_mat')->references('id')->on('matriculas')->cascadeOnDelete();

            $table->comment('Datos crudos de las columnas BOLETÍN del Excel, pendientes de interpretar');
        });
    }

    public function down(): void
    {
        foreach ([
            'boletines_excel', 'entregas_boletin', 'matriculas', 'grupos', 'estudiante_acudiente',
            'acudientes', 'estudiantes', 'docentes', 'barrios', 'parentescos', 'modalidades',
            'grados', 'periodos', 'anios_lectivos', 'sedes', 'instituciones',
        ] as $tabla) {
            Schema::dropIfExists($tabla);
        }
    }
};
