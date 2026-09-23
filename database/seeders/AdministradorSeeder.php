<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdministradorSeeder extends Seeder
{
    /**
     * Crea el usuario «admin» con una clave aleatoria que se muestra una sola vez.
     */
    public function run(): void
    {
        if (User::where('usuario', 'admin')->exists()) {
            $this->command->warn('El usuario «admin» ya existe; no se modificó.');

            return;
        }

        $clave = Str::password(12, symbols: false);

        User::create([
            'name' => 'Administrador',
            'usuario' => 'admin',
            'password' => $clave,
            'rol_id' => Rol::where('nombre', 'administrador')->value('id'),
        ]);

        $this->command->info("Usuario: admin · Clave: {$clave}  (cámbiala al ingresar)");
    }
}
