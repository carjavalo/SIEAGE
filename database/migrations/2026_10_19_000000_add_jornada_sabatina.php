<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Jornada «Sabatina»: la de los ciclos (educación por ciclos de los sábados). Cada
 * ciclo equivale a un grado regular —ver App\Support\ImportarLibroMatricula—,
 * así que lo único nuevo es la jornada de sus grupos y matrículas.
 */
return new class extends Migration
{
    private const ANTES = ['Mañana', 'Tarde', 'Única', 'Noche'];

    private const AHORA = ['Mañana', 'Tarde', 'Única', 'Noche', 'Sabatina'];

    public function up(): void
    {
        Schema::table('grupos', fn (Blueprint $t) => $t->enum('jornada', self::AHORA)->default('Mañana')->change());
        Schema::table('matriculas', fn (Blueprint $t) => $t->enum('jornada', self::AHORA)->nullable()->change());
    }

    public function down(): void
    {
        Schema::table('grupos', fn (Blueprint $t) => $t->enum('jornada', self::ANTES)->default('Mañana')->change());
        Schema::table('matriculas', fn (Blueprint $t) => $t->enum('jornada', self::ANTES)->nullable()->change());
    }
};
