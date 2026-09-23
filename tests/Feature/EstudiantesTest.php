<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EstudiantesTest extends TestCase
{
    use RefreshDatabase;

    public function test_los_invitados_no_ven_el_panel()
    {
        $this->get('/estudiantes')->assertRedirect('/login');
    }

    public function test_el_panel_muestra_los_estudiantes_del_grado()
    {
        $this->seed(DatosInicialesSeeder::class);
        $decimo = DB::table('grados')->where('numero', 10)->value('id');

        $this->actingAs(User::first())
            ->get("/estudiantes?anio=2026&grado={$decimo}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('estudiantes/index')
                ->where('anio', 2026)
                ->where('gradoId', $decimo)
                ->has('grupos', 6)
                ->has('estudiantes', DB::table('matriculas')->where('anio_lectivo_id', 12)->where('grado_id', $decimo)->count())
                ->missing('busqueda'));
    }

    public function test_la_busqueda_encuentra_por_documento()
    {
        $this->seed(DatosInicialesSeeder::class);
        $estudiante = DB::table('estudiantes')->first();

        $this->actingAs(User::first())
            ->get('/estudiantes?q='.$estudiante->numero_documento, [
                'X-Inertia' => 'true',
                'X-Inertia-Version' => (new HandleInertiaRequests)->version(request()),
                'X-Inertia-Partial-Component' => 'estudiantes/index',
                'X-Inertia-Partial-Data' => 'busqueda',
            ])
            ->assertOk()
            ->assertJsonPath('props.busqueda.0.id', $estudiante->id);
    }

    public function test_la_ficha_de_matricula_trae_historia_y_acudiente()
    {
        $this->seed(DatosInicialesSeeder::class);
        $id = DB::table('matriculas')->where('es_historico', true)->value('estudiante_id');

        $this->actingAs(User::first())
            ->get("/estudiantes/{$id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('estudiantes/ficha')
                ->where('estudiante.id', $id)
                ->where('actual.anio', 2026)
                ->has('historia', DB::table('matriculas')->where('estudiante_id', $id)->count())
                ->has('acudientes')
                ->where('institucion.nit', '800.025.227-5'));

        $this->actingAs(User::first())->get('/estudiantes/999999')->assertNotFound();
    }
}
