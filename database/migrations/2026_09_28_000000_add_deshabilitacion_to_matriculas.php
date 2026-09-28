<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Deshabilitar a un estudiante en el año en curso: porque perdió el año,
     * se retiró o fue trasladado. La matrícula guarda el estado y la razón
     * vigentes; novedades_matricula guarda cada cambio (quién, cuándo y por
     * qué), también cuando se vuelve a habilitar.
     */
    public function up(): void
    {
        Schema::table('matriculas', function (Blueprint $table) {
            // 'reprobado' = perdió el año. Los demás estados ya existían.
            $table->enum('estado', ['activo', 'retirado', 'trasladado', 'graduado', 'cancelado', 'reprobado'])->default('activo')->change();
            $table->string('motivo_retiro', 500)->nullable()->change();
            $table->foreignId('deshabilitado_por')->nullable()->after('motivo_retiro')->constrained('users')->nullOnDelete();
            $table->dateTime('deshabilitado_en')->nullable()->after('deshabilitado_por');
        });

        Schema::create('novedades_matricula', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('matricula_id');
            $table->enum('tipo', ['deshabilitada', 'habilitada']);
            $table->string('estado_anterior', 20);
            $table->string('estado_nuevo', 20);
            $table->string('razon', 500);
            $table->date('fecha')->comment('fecha del retiro, traslado o de volver a habilitar');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->nullable();

            $table->index('matricula_id', 'ix_nov_matricula');
            $table->foreign('matricula_id', 'fk_nov_matricula')->references('id')->on('matriculas')->cascadeOnDelete();

            $table->comment('Historial de deshabilitaciones y habilitaciones de matrículas');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('novedades_matricula');

        Schema::table('matriculas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('deshabilitado_por');
            $table->dropColumn('deshabilitado_en');
            $table->string('motivo_retiro', 200)->nullable()->change();
            $table->enum('estado', ['activo', 'retirado', 'trasladado', 'graduado', 'cancelado'])->default('activo')->change();
        });
    }
};
