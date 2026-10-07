<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Roles y permisos desde la web: cada rol tiene un nombre para mostrar y su
 * lista de permisos (ver App\Support\Permisos). Los roles de siempre quedan con
 * lo mismo que podían hacer cuando estaba escrito en el código, sin cambiar nada.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->string('etiqueta', 60)->nullable()->after('nombre');
        });

        Schema::create('rol_permiso', function (Blueprint $table) {
            $table->foreignId('rol_id')->constrained('roles')->cascadeOnDelete();
            $table->string('permiso', 60);
            $table->primary(['rol_id', 'permiso']);
        });

        foreach (['administrador' => 'Administrador', 'coordinacion' => 'Coordinación', 'secretaria' => 'Secretaría', 'docente' => 'Docente'] as $nombre => $etiqueta) {
            DB::table('roles')->where('nombre', $nombre)->whereNull('etiqueta')->update(['etiqueta' => $etiqueta]);
        }
        // Cualquier otro rol que hubiera: su nombre tal cual.
        DB::table('roles')->whereNull('etiqueta')->update(['etiqueta' => DB::raw('nombre')]);

        // Lo que hasta hoy podía cada uno (el administrador, todo, sin filas).
        $docente = ['ver-estudiantes', 'constancias', 'ver-inscritos', 'matricular', 'escribir-boletines', 'ver-sedes', 'informes', 'importar-datos'];
        $todosMenosDocentes = [...$docente, 'editar-estudiantes', 'deshabilitar-matriculas', 'promover-estudiantes', 'configurar-boletines', 'gestionar-sedes', 'cambiar-cupos'];
        foreach (['coordinacion' => $todosMenosDocentes, 'secretaria' => $todosMenosDocentes, 'docente' => $docente] as $nombre => $permisos) {
            $rol = DB::table('roles')->where('nombre', $nombre)->value('id');
            if ($rol) {
                DB::table('rol_permiso')->insert(array_map(fn ($p) => ['rol_id' => $rol, 'permiso' => $p], $permisos));
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('rol_permiso');
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('etiqueta');
        });
    }
};
