<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * El super administrador: el equipo que mantiene SIEAGE. Puede todo lo del
 * administrador y es el único que entra a Roles y permisos. Por eso
 * «gestionar-roles» deja de ser un permiso que se reparte: se quita de los roles
 * que lo tenían (el administrador ya no lo tiene).
 *
 * Nadie queda con este rol al migrar: se da con `php artisan sieage:superadmin <usuario>`.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! DB::table('roles')->where('nombre', 'superadministrador')->exists()) {
            DB::table('roles')->insert([
                'nombre' => 'superadministrador',
                'etiqueta' => 'Super administrador',
                'descripcion' => 'Equipo de SIEAGE: todo lo del administrador y, además, Roles y permisos',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('rol_permiso')->where('permiso', 'gestionar-roles')->delete();
    }

    public function down(): void
    {
        // Quien era super administrador vuelve a administrador; el rol se quita.
        $super = DB::table('roles')->where('nombre', 'superadministrador')->value('id');
        if ($super) {
            DB::table('users')->where('rol_id', $super)->update(['rol_id' => DB::table('roles')->where('nombre', 'administrador')->value('id')]);
            DB::table('rol_permiso')->where('rol_id', $super)->delete();
            DB::table('roles')->where('id', $super)->delete();
        }
    }
};
