<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A qué sedes pertenece cada usuario. Quien está asignado a sedes solo ve y
     * modifica los datos de esas sedes (ver App\Support\Alcance).
     *
     * - Los administradores ven todas las sedes siempre.
     * - `todas_las_sedes`: para quien no es administrador pero trabaja con todas
     *   (p. ej. coordinación general); incluye las sedes que se creen después.
     * - Sin sedes y sin `todas_las_sedes`: no ve datos de ninguna sede.
     */
    public function up(): void
    {
        Schema::create('sede_user', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('sede_id');
            $table->timestamp('created_at')->nullable();

            $table->primary(['user_id', 'sede_id']);
            $table->foreign('sede_id', 'fk_sede_user_sede')->references('id')->on('sedes')->cascadeOnDelete();
        });

        Schema::table('users', function (Blueprint $table) {
            // Los usuarios que ya existen conservan su acceso a todo.
            $table->boolean('todas_las_sedes')->default(false)->after('rol_id');
        });
        DB::table('users')->update(['todas_las_sedes' => true]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('todas_las_sedes');
        });
        Schema::dropIfExists('sede_user');
    }
};
