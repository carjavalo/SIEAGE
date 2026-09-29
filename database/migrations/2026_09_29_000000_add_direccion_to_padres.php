<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Dirección de la madre y del padre. Si viven juntos, el formulario copia la
     * misma en los dos (cada fila guarda la suya).
     */
    public function up(): void
    {
        Schema::table('padres', function (Blueprint $table) {
            $table->string('direccion', 150)->nullable()->after('correo');
            $table->string('barrio', 80)->nullable()->after('direccion');
        });
    }

    public function down(): void
    {
        Schema::table('padres', function (Blueprint $table) {
            $table->dropColumn(['direccion', 'barrio']);
        });
    }
};
