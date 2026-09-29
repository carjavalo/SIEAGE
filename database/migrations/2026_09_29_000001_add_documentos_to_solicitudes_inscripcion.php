<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Documentos que trajo el acudiente (segundo paso para matricular a un
 * inscrito): cuáles se marcaron, quién los registró y cuándo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitudes_inscripcion', function (Blueprint $table) {
            // clave del documento => 'entregado' | 'no_aplica' (ver App\Support\Documentos).
            $table->json('documentos')->nullable()->after('matricula_id');
            $table->foreignId('documentos_por')->nullable()->after('documentos')->constrained('users')->nullOnDelete();
            $table->dateTime('documentos_en')->nullable()->after('documentos_por');
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes_inscripcion', function (Blueprint $table) {
            $table->dropConstrainedForeignId('documentos_por');
            $table->dropColumn(['documentos', 'documentos_en']);
        });
    }
};
