<?php

namespace Tests\Feature;

use Database\Seeders\DatosIniciales;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatosInicialesTest extends TestCase
{
    use RefreshDatabase;

    public function test_los_datos_iniciales_se_cargan_completos_y_sin_duplicar()
    {
        $this->seed(DatosInicialesSeeder::class);
        $this->seed(DatosInicialesSeeder::class);

        foreach (DatosIniciales::TABLAS as $tabla) {
            $esperadas = count(json_decode(file_get_contents(DatosIniciales::archivo($tabla)), true)['filas']);

            $this->assertSame($esperadas, DB::table($tabla)->count(), "Filas en {$tabla}");
        }
    }
}
