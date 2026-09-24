<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            DatosInicialesSeeder::class,
            // Después de los datos iniciales, para completar los barrios que ya
            // traen (y sus ids) en vez de duplicarlos.
            BarriosCaliSeeder::class,
        ]);
    }
}
