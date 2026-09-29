<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InformeTest extends TestCase
{
    use RefreshDatabase;

    public function test_solo_con_sesion()
    {
        $this->get('/informes/matricula')->assertRedirect('/login');
    }

    public function test_el_informe_cuadra_con_la_base()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anioId = DB::table('anios_lectivos')->where('anio', 2026)->value('id');
        $matriculas = DB::table('matriculas')->where('anio_lectivo_id', $anioId);
        $activos = (clone $matriculas)->where('estado', 'activo')->count();

        $this->actingAs(User::first())
            ->get('/informes/matricula?anio=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('informes/matricula')
                ->where('anio', 2026)
                ->where('totales.matriculas', (clone $matriculas)->count())
                ->where('totales.activos', $activos)
                ->where('totales.nuevos', (clone $matriculas)->where('estado', 'activo')->where('condicion', 'nuevo')->count())
                ->where('totales.retirados', (clone $matriculas)->where('estado', 'retirado')->count())
                ->where('totales.grupos', DB::table('grupos')->where('anio_lectivo_id', $anioId)->count())
                ->where('totales.cupos', (int) DB::table('grupos')->where('anio_lectivo_id', $anioId)->sum('cupos_proyectados'))
                // Doce grados, de Transición (edad esperada 5) a Undécimo (16).
                ->has('grados', 12)
                ->where('grados.0.edadEsperada', 5)
                ->where('grados.11.edadEsperada', 16)
                ->has('anexo')
                ->has('sinRegistrar'));
    }

    public function test_el_anexo_trae_a_todos_los_activos_una_vez()
    {
        $this->seed(DatosInicialesSeeder::class);

        $respuesta = $this->actingAs(User::first())->get('/informes/matricula?anio=2026');
        $props = $respuesta->viewData('page')['props'];
        $enAnexo = collect($props['anexo'])->sum(fn ($g) => count($g['estudiantes']));

        // Cada grupo del anexo existe en la lista de grupos, y entre todos suman los activos con grupo.
        $ids = collect($props['grupos'])->pluck('id');
        $this->assertTrue(collect($props['anexo'])->every(fn ($g) => $ids->contains($g['grupo'])));
        $this->assertSame(collect($props['grupos'])->sum('activos'), $enAnexo);
        $this->assertLessThanOrEqual($props['totales']['activos'], $enAnexo);
    }

    public function test_un_anio_que_no_existe_da_404()
    {
        $this->seed(DatosInicialesSeeder::class);

        $this->actingAs(User::first())->get('/informes/matricula?anio=1990')->assertNotFound();
    }
}
