<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Constancias de matrícula para imprimir: la de un estudiante y las de un grupo, grado, sede o todo el colegio. */
class ConstanciasTest extends TestCase
{
    use RefreshDatabase;

    private function anioActivo(): object
    {
        return DB::table('anios_lectivos')->where('estado', 'activo')->first();
    }

    public function test_sin_sesion_no_se_ven()
    {
        $this->get('/constancias')->assertRedirect('/login');
        $this->get('/estudiantes/1/constancia')->assertRedirect('/login');
    }

    public function test_la_de_un_estudiante_trae_su_matricula_acudiente_e_historia()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anio = $this->anioActivo();
        // Un estudiante activo este año que ya estudiaba aquí antes.
        $id = DB::table('matriculas as m')
            ->where('m.anio_lectivo_id', $anio->id)
            ->whereExists(fn ($q) => $q->from('matriculas as h')->whereColumn('h.estudiante_id', 'm.estudiante_id')->where('h.anio_lectivo_id', '<>', $anio->id))
            ->whereExists(fn ($q) => $q->from('estudiante_acudiente as ea')->whereColumn('ea.estudiante_id', 'm.estudiante_id'))
            ->value('m.estudiante_id');
        $anios = DB::table('matriculas as m')->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')->where('m.estudiante_id', $id)->orderBy('al.anio')->pluck('al.anio')->all();

        $this->actingAs(User::first())
            ->get("/estudiantes/{$id}/constancia")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('constancias/index')
                ->has('constancias', 1)
                ->where('constancias.0.anio', $anio->anio)
                ->where('constancias.0.historia', fn ($h) => collect($h)->pluck('anio')->all() === $anios)
                ->whereNot('constancias.0.acudiente', null)
                ->has('constancias.0.acudiente.telefonos')
                ->where('institucion.nit', DB::table('instituciones')->value('nit'))
                ->where('volver', "/estudiantes/{$id}"));
    }

    public function test_la_de_un_año_anterior_solo_cuenta_hasta_ese_año()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anio = $this->anioActivo();
        $id = DB::table('matriculas as m')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->where('al.anio', $anio->anio - 1)
            ->whereExists(fn ($q) => $q->from('matriculas as h')->whereColumn('h.estudiante_id', 'm.estudiante_id')->where('h.anio_lectivo_id', $anio->id))
            ->value('m.estudiante_id');

        $this->actingAs(User::first())
            ->get("/estudiantes/{$id}/constancia?anio=".($anio->anio - 1))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('constancias.0.anio', $anio->anio - 1)
                ->where('constancias.0.historia', fn ($h) => collect($h)->max('anio') === $anio->anio - 1));

        $this->actingAs(User::first())->get("/estudiantes/{$id}/constancia?anio=1990")->assertNotFound();
    }

    public function test_el_año_planeado_no_cuenta_todavia()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anio = $this->anioActivo();
        $matricula = DB::table('matriculas')->where('anio_lectivo_id', $anio->id)->where('estado', 'activo')->first();

        // Ya promovido: tiene matrícula en el año siguiente, que todavía está planeado.
        $planeado = DB::table('anios_lectivos')->insertGetId(['anio' => $anio->anio + 1, 'estado' => 'planeado']);
        $siguiente = (array) $matricula;
        unset($siguiente['id']);
        DB::table('matriculas')->insert([...$siguiente, 'anio_lectivo_id' => $planeado, 'grupo_id' => null]);

        $this->actingAs(User::first())
            ->get("/estudiantes/{$matricula->estudiante_id}/constancia")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('constancias.0.anio', $anio->anio)
                ->where('constancias.0.historia', fn ($h) => collect($h)->max('anio') === $anio->anio));
    }

    public function test_la_fecha_es_la_de_matricula_y_si_falta_la_de_hoy()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anio = $this->anioActivo();
        $matricula = DB::table('matriculas')->where('anio_lectivo_id', $anio->id)->where('estado', 'activo')->first();
        DB::table('matriculas')->where('id', $matricula->id)->update(['fecha_matricula' => "{$anio->anio}-02-03"]);

        $this->actingAs(User::first())
            ->get("/estudiantes/{$matricula->estudiante_id}/constancia")
            ->assertInertia(fn (Assert $page) => $page->where('constancias.0.fecha', "{$anio->anio}-02-03"));

        DB::table('matriculas')->where('id', $matricula->id)->update(['fecha_matricula' => null]);
        $this->actingAs(User::first())
            ->get("/estudiantes/{$matricula->estudiante_id}/constancia")
            ->assertInertia(fn (Assert $page) => $page->where('constancias.0.fecha', now()->toDateString()));
    }

    public function test_las_de_un_grupo_son_sus_activos_en_orden_alfabetico()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anio = $this->anioActivo();
        $grupo = DB::table('grupos')->where('anio_lectivo_id', $anio->id)->first();
        // Uno retirado no lleva constancia.
        $retirado = DB::table('matriculas')->where('grupo_id', $grupo->id)->where('estado', 'activo')->value('id');
        DB::table('matriculas')->where('id', $retirado)->update(['estado' => 'retirado']);

        $nombres = DB::table('matriculas as m')->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->where('m.grupo_id', $grupo->id)->where('m.estado', 'activo')->orderBy('e.nombre_completo')->pluck('e.nombre_completo')->all();

        $this->actingAs(User::first())
            ->get("/constancias?anio={$anio->anio}&grupo={$grupo->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('constancias/index')
                ->where('titulo', fn ($t) => str_starts_with($t, "Grupo {$grupo->codigo}"))
                ->where('constancias', fn ($c) => collect($c)->pluck('estudiante.nombre')->all() === $nombres
                    && collect($c)->every(fn ($x) => $x['estudiante']['grupo'] === $grupo->codigo)));
    }

    public function test_por_grado_por_sede_y_todo_el_colegio()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anio = $this->anioActivo();
        $activos = fn ($q) => $q->where('anio_lectivo_id', $anio->id)->where('estado', 'activo');
        $sede = DB::table('sedes')->where('es_principal', true)->first();
        $grado = DB::table('matriculas')->tap($activos)->where('sede_id', $sede->id)->value('grado_id');

        $contar = fn (string $url) => count($this->actingAs(User::first())->get($url)->assertOk()->viewData('page')['props']['constancias']);

        $this->assertSame(DB::table('matriculas')->tap($activos)->where('grado_id', $grado)->count(), $contar("/constancias?anio={$anio->anio}&grado={$grado}"));
        $this->assertSame(
            DB::table('matriculas')->tap($activos)->where('grado_id', $grado)->where('sede_id', $sede->id)->count(),
            $contar("/constancias?anio={$anio->anio}&grado={$grado}&sede={$sede->codigo}"),
        );
        $this->assertSame(DB::table('matriculas')->tap($activos)->where('sede_id', $sede->id)->count(), $contar("/constancias?anio={$anio->anio}&sede={$sede->codigo}"));
        $this->assertSame(DB::table('matriculas')->tap($activos)->count(), $contar("/constancias?anio={$anio->anio}"));
    }

    public function test_un_filtro_que_no_existe_es_404()
    {
        $this->seed(DatosInicialesSeeder::class);

        $this->actingAs(User::first())->get('/constancias?grupo=999999')->assertNotFound();
        $this->actingAs(User::first())->get('/constancias?sede=NOEXISTE')->assertNotFound();
    }
}
