<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Los documentos de matrícula (fotos, fotocopias, certificados…) de cada
 * matrícula, no solo de las que vinieron por el formulario de inscripción: así
 * la ficha de cualquier estudiante dice cuáles faltan y se marcan ahí.
 * Mismo formato que solicitudes_inscripcion.documentos (ver App\Support\Documentos).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matriculas', function (Blueprint $table) {
            $table->json('documentos')->nullable()->comment('clave => entregado | no_aplica');
            $table->foreignId('documentos_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('documentos_en')->nullable();
        });

        // Las que vinieron de una inscripción traen lo que ya se marcó en Inscritos.
        DB::table('solicitudes_inscripcion')->whereNotNull('matricula_id')->whereNotNull('documentos')
            ->get(['matricula_id', 'documentos', 'documentos_por', 'documentos_en'])
            ->each(fn ($s) => DB::table('matriculas')->where('id', $s->matricula_id)->update([
                'documentos' => $s->documentos,
                'documentos_por' => $s->documentos_por,
                'documentos_en' => $s->documentos_en,
            ]));
    }

    public function down(): void
    {
        Schema::table('matriculas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('documentos_por');
            $table->dropColumn(['documentos', 'documentos_en']);
        });
    }
};
