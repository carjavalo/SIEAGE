<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Actas de grado (ver App\Support\Permisos): Coordinación y Secretaría, que ya
 * tienen todo lo de estudiantes, también las imprimen. El docente no.
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (DB::table('roles')->whereIn('nombre', ['coordinacion', 'secretaria'])->pluck('id') as $rol) {
            DB::table('rol_permiso')->insertOrIgnore(['rol_id' => $rol, 'permiso' => 'actas-grado']);
        }
    }

    public function down(): void
    {
        DB::table('rol_permiso')->where('permiso', 'actas-grado')->delete();
    }
};
