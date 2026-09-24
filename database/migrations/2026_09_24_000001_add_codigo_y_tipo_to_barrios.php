<?php

use Database\Seeders\BarriosCaliSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Distingue los barrios oficiales de Cali (con su código del IDESC) de los
     * nombres escritos a mano que llegaron en el Excel ("Aifonso Lopez",
     * "Alfonzo Lopez 3"...). Los del Excel se conservan porque los usan los
     * acudientes importados, pero al no tener tipo ya no se sugieren en el
     * formulario de inscripción.
     */
    public function up(): void
    {
        Schema::table('barrios', function (Blueprint $table) {
            $table->string('codigo', 6)->nullable()->unique()->after('id')->comment('código del barrio en el IDESC (Acuerdo 0636 de 2026)');
            $table->string('tipo', 20)->nullable()->after('comuna')->comment('barrio, sector, corregimiento u otro_municipio; null = nombre sin verificar');
            $table->string('municipio', 40)->nullable()->after('tipo')->comment('null = Santiago de Cali');
        });

        // En una base nueva la tabla está vacía: DatabaseSeeder carga primero
        // los datos iniciales y después la lista oficial. Aquí solo se fusiona
        // cuando ya hay datos, para no ocupar los ids que traen los acudientes.
        if (DB::table('barrios')->exists()) {
            (new BarriosCaliSeeder)->run();
        }
    }

    public function down(): void
    {
        // Las filas de la lista oficial que nadie usa se quitan; las que ya
        // existían o tienen acudientes se quedan, con su nombre corregido.
        DB::table('barrios')
            ->whereNotNull('tipo')
            ->whereNotIn('id', DB::table('acudientes')->whereNotNull('barrio_id')->select('barrio_id'))
            ->whereNotIn('id', DB::table('estudiantes')->whereNotNull('barrio_id')->select('barrio_id'))
            ->delete();

        Schema::table('barrios', function (Blueprint $table) {
            $table->dropUnique(['codigo']);
            $table->dropColumn(['codigo', 'tipo', 'municipio']);
        });
    }
};
