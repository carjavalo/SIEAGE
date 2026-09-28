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

    public function test_el_filtro_de_sede_limita_grados_grupos_lista_y_totales()
    {
        $this->seed(DatosInicialesSeeder::class);
        $lf = DB::table('sedes')->where('codigo', 'LF')->value('id');
        $activosLf = DB::table('matriculas')->where('anio_lectivo_id', 12)->where('sede_id', $lf)->where('estado', 'activo')->count();
        $sexto = DB::table('grados')->where('numero', 6)->value('id');
        $primero = DB::table('grados')->where('numero', 1)->value('id');

        // Primero no existe en Los Farallones: abre en el primer grado que sí tiene (sexto).
        $this->actingAs(User::first())
            ->get("/estudiantes?anio=2026&sede=LF&grado={$primero}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('sede', 'LF')
                ->has('sedes', 5)
                ->where('sedes', fn ($sedes) => collect($sedes)->firstWhere('codigo', 'LF')['activos'] === $activosLf)
                ->where('gradoId', $sexto)
                ->where('totales.activos', $activosLf)
                ->where('grados', fn ($grados) => collect($grados)->firstWhere('numero', 1)['activos'] === 0)
                ->where('grupos', fn ($grupos) => collect($grupos)->every(fn ($g) => $g['sede_codigo'] === 'LF'))
                ->where('estudiantes', fn ($lista) => count($lista) > 0 && collect($lista)->every(fn ($e) => $e['sede_codigo'] === 'LF')));

        // Primaria en Rafael Pombo: solo sus grupos, aunque el grado exista en otras sedes.
        $this->actingAs(User::first())
            ->get("/estudiantes?anio=2026&sede=RP&grado={$primero}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('gradoId', $primero)
                ->where('grupos', fn ($grupos) => count($grupos) > 0 && collect($grupos)->every(fn ($g) => $g['sede_codigo'] === 'RP')));

        // Sede desconocida: como si no hubiera filtro.
        $this->actingAs(User::first())->get('/estudiantes?anio=2026&sede=XX')
            ->assertInertia(fn (Assert $page) => $page->where('sede', null));
    }

    public function test_promover_con_sede_solo_toca_esa_sede()
    {
        $this->seed(DatosInicialesSeeder::class);
        $primero = DB::table('grados')->where('numero', 1)->value('id');
        $rp = DB::table('sedes')->where('codigo', 'RP')->value('id');
        $activosRp = DB::table('matriculas')->where('anio_lectivo_id', 12)->where('grado_id', $primero)->where('sede_id', $rp)->where('estado', 'activo')->count();

        $this->actingAs(User::first())->post('/promociones', ['anio' => 2026, 'grado_id' => $primero, 'sede' => 'RP'])->assertSessionHasNoErrors();

        $this->assertSame($activosRp, session('promocion')['promovidos']);
        $this->assertSame($activosRp, DB::table('matriculas as m')->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')->where('al.anio', 2027)->count());
    }
}
