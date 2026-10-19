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

        // Pedida por año, sale la ficha de matrícula del año planeado (sin grupo todavía).
        $this->actingAs(User::first())
            ->get("/estudiantes/{$matricula->estudiante_id}/constancia?anio=".($anio->anio + 1))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('constancias.0.anio', $anio->anio + 1)
                ->where('constancias.0.estudiante.grupo', null));
    }

    public function test_lleva_el_correo_del_acudiente_o_si_no_tiene_el_de_la_familia()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anio = $this->anioActivo();
        $matricula = DB::table('matriculas as m')->where('m.anio_lectivo_id', $anio->id)->where('m.estado', 'activo')
            ->whereExists(fn ($q) => $q->from('estudiante_acudiente as ea')->whereColumn('ea.estudiante_id', 'm.estudiante_id'))
            ->first(['m.id', 'm.estudiante_id']);
        $acudientes = DB::table('estudiante_acudiente')->where('estudiante_id', $matricula->estudiante_id)->pluck('acudiente_id');
        DB::table('acudientes')->whereIn('id', $acudientes)->update(['email' => 'acudiente@correo.com']);
        DB::table('estudiantes')->where('id', $matricula->estudiante_id)->update(['correo' => 'familia@correo.com']);
        $correo = fn () => $this->actingAs(User::first())->get("/estudiantes/{$matricula->estudiante_id}/constancia")
            ->viewData('page')['props']['constancias'][0]['acudiente']['correo'];

        $this->assertSame('acudiente@correo.com', $correo());

        DB::table('acudientes')->whereIn('id', $acudientes)->update(['email' => null]);
        $this->assertSame('familia@correo.com', $correo());

        // Sin ninguno de los dos: el que dio la familia al inscribirse.
        DB::table('estudiantes')->where('id', $matricula->estudiante_id)->update(['correo' => null]);
        $documento = DB::table('estudiantes')->where('id', $matricula->estudiante_id)->value('numero_documento');
        DB::table('solicitudes_inscripcion')->insert(['numero_documento' => $documento, 'acudiente_correo' => 'inscripcion@correo.com', 'correo' => 'otro@correo.com',
            'primer_nombre' => 'A', 'primer_apellido' => 'B', 'sexo' => 'F', 'pais_nacimiento' => 'Colombia', 'ciudad_nacimiento' => 'Cali', 'fecha_nacimiento' => '2014-01-01',
            'tipo_documento' => 'T.I.', 'ciudad_expedicion' => 'Cali', 'grado_id' => DB::table('grados')->value('id'), 'tipo_sangre' => 'O+', 'sisben' => '1', 'eps' => 'X',
            'grupo_etnico' => 'Mestizo', 'direccion' => 'C', 'barrio' => 'B', 'telefono_1' => '3000000000', 'telefono_2' => '3000000000',
            'acudiente_primer_nombre' => 'C', 'acudiente_primer_apellido' => 'D', 'acudiente_numero_documento' => '99999', 'acudiente_ciudad_expedicion' => 'Cali', 'acudiente_fecha_nacimiento' => '1980-01-01', 'autorizo_datos_en' => now(),
            'acudiente_parentesco_id' => DB::table('parentescos')->value('id'), 'acudiente_telefono_1' => '3000000000', 'acudiente_telefono_2' => '3000000000',
            'estado' => 'aprobada', 'created_at' => now(), 'updated_at' => now()]);
        $this->assertSame('inscripcion@correo.com', $correo());
    }

    public function test_en_el_anio_planeado_sexto_va_sin_grupo_ni_jornada_y_decimo_sin_tecnica()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anio = $this->anioActivo();
        $planeado = DB::table('anios_lectivos')->insertGetId(['anio' => $anio->anio + 1, 'estado' => 'planeado']);
        $ficha = function (int $numero) use ($anio, $planeado) {
            $m = (array) DB::table('matriculas')->where('anio_lectivo_id', $anio->id)->where('estado', 'activo')
                ->where('grado_id', DB::table('grados')->where('numero', $numero - 1)->value('id'))->first();
            $estudiante = $m['estudiante_id'];
            unset($m['id']);
            // Promovido con grupo, jornada y técnica ya puestos: igual no deben salir.
            DB::table('matriculas')->insert([...$m, 'anio_lectivo_id' => $planeado, 'grado_id' => DB::table('grados')->where('numero', $numero)->value('id'),
                'jornada' => 'Mañana', 'modalidad_id' => DB::table('modalidades')->value('id')]);

            return $this->actingAs(User::first())->get("/estudiantes/{$estudiante}/constancia?anio=".($anio->anio + 1))
                ->viewData('page')['props']['constancias'][0]['estudiante'];
        };

        $sexto = $ficha(6);
        $this->assertSame(['Por asignar', 'Por asignar'], [$sexto['grupo'], $sexto['jornada']]);
        $decimo = $ficha(10);
        $this->assertSame('Por asignar', $decimo['modalidad']);
        $this->assertSame('Mañana', $decimo['jornada'], 'en 10.º la jornada sí va');

        // En el año en curso, todo como está.
        $m = DB::table('matriculas')->where('anio_lectivo_id', $anio->id)->where('estado', 'activo')
            ->where('grado_id', DB::table('grados')->where('numero', 6)->value('id'))->whereNotNull('grupo_id')->first();
        $actual = $this->actingAs(User::first())->get("/estudiantes/{$m->estudiante_id}/constancia")->viewData('page')['props']['constancias'][0]['estudiante'];
        $this->assertNotSame('Por asignar', $actual['grupo']);
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

    public function test_la_ficha_completa_del_anio_planeado_sigue_las_mismas_reglas_y_muestra_el_correo_de_la_inscripcion()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anio = $this->anioActivo();
        $planeado = DB::table('anios_lectivos')->insertGetId(['anio' => $anio->anio + 1, 'estado' => 'planeado']);
        $m = (array) DB::table('matriculas')->where('anio_lectivo_id', $anio->id)->where('estado', 'activo')
            ->where('grado_id', DB::table('grados')->where('numero', 5)->value('id'))->first();
        $estudiante = $m['estudiante_id'];
        unset($m['id']);
        DB::table('matriculas')->insert([...$m, 'anio_lectivo_id' => $planeado, 'grado_id' => DB::table('grados')->where('numero', 6)->value('id'), 'jornada' => 'Mañana']);
        DB::table('estudiantes')->where('id', $estudiante)->update(['correo' => null]);

        $this->actingAs(User::first())->get("/estudiantes/{$estudiante}?anio=".($anio->anio + 1))
            ->assertInertia(fn (Assert $page) => $page
                ->where('actual.anio', $anio->anio + 1)
                ->where('actual.grupo', 'Por asignar')
                ->where('actual.jornada', 'Por asignar'));
    }
}
