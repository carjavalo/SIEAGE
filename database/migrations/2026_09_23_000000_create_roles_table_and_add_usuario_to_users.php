<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Roles de acceso y credenciales por nombre de usuario.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();
            $table->string('descripcion')->nullable();
            $table->timestamps();
        });

        DB::table('roles')->insert([
            ['nombre' => 'administrador', 'descripcion' => 'Acceso total, gestiona usuarios', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'coordinacion', 'descripcion' => 'Coordinación académica', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'secretaria', 'descripcion' => 'Matrículas, importaciones y constancias', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'docente', 'descripcion' => 'Consulta de sus grupos', 'created_at' => now(), 'updated_at' => now()],
        ]);

        Schema::table('users', function (Blueprint $table) {
            $table->string('usuario', 50)->unique()->after('name');
            $table->string('email')->nullable()->change();
            $table->foreignId('rol_id')->nullable()->after('password')->constrained('roles')->nullOnDelete();
            $table->boolean('activo')->default(true)->after('rol_id');
            $table->timestamp('ultimo_acceso')->nullable()->after('activo');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rol_id');
            $table->dropColumn(['usuario', 'activo', 'ultimo_acceso']);
            $table->string('email')->nullable(false)->change();
        });

        Schema::dropIfExists('roles');
    }
};
