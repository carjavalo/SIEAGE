<?php

namespace Database\Seeders;

use App\Support\Boletines;
use App\Support\Nombres;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(DatosInicialesSeeder::class);

        // Los datos del Excel traen el nombre en un solo campo: se reparte en
        // apellidos y nombres (solo a quien aún no los tiene separados).
        $separados = Nombres::completar();
        $this->command->line(sprintf('  Nombres separados: %d estudiantes, %d acudientes', $separados['estudiantes'], $separados['acudientes']));

        // Lo que necesitan los boletines de transición (ver la migración de boletines).
        Boletines::datosIniciales();
    }
}
