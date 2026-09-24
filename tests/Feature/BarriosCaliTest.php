<?php

namespace Tests\Feature;

use Database\Seeders\BarriosCaliSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BarriosCaliTest extends TestCase
{
    use RefreshDatabase;

    public function test_la_lista_oficial_completa_los_barrios_que_ya_existen_sin_duplicarlos()
    {
        // Como llegaron del Excel: uno igual salvo mayúsculas y uno mal escrito.
        $mallarino = DB::table('barrios')->insertGetId(['nombre' => 'PUERTO MALLARINO']);
        DB::table('barrios')->insert(['nombre' => 'Aifonso Lopez']);

        $this->seed(BarriosCaliSeeder::class);
        $this->seed(BarriosCaliSeeder::class); // otra vez: no debe duplicar nada

        $datos = json_decode(file_get_contents(database_path('data/barrios_cali.json')), true);
        $this->assertSame(count($datos['barrios']) + count($datos['otros']) + 1, DB::table('barrios')->count());

        // Acuerdo 0636 de 2026: 324 barrios y 18 sectores.
        $this->assertSame(324, DB::table('barrios')->where('tipo', 'barrio')->count());
        $this->assertSame(18, DB::table('barrios')->where('tipo', 'sector')->count());

        // El que ya existía conserva su id (lo usan los acudientes) y queda con el nombre oficial.
        $fila = DB::table('barrios')->find($mallarino);
        $this->assertSame('Puerto Mallarino', $fila->nombre);
        $this->assertSame('barrio', $fila->tipo);
        $this->assertNotNull($fila->codigo);
        $this->assertNull(DB::table('barrios')->where('nombre', 'Aifonso Lopez')->value('tipo'));
    }

    public function test_el_formulario_sugiere_solo_barrios_verificados()
    {
        DB::table('barrios')->insert(['nombre' => 'Aifonso Lopez']);
        $this->seed(BarriosCaliSeeder::class);

        $this->get('/inscripcion')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('barrios', fn ($barrios) => collect($barrios)->contains('Puerto Mallarino')
                    && collect($barrios)->contains('Siloé')
                    && ! collect($barrios)->contains('Aifonso Lopez')));
    }
}
