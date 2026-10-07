<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Rol;
use App\Models\User;
use App\Support\Alcance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Sede y grado juntos: en una sede, un usuario puede ver solo algunos grados. Datos inventados. */
class AlcanceGradosTest extends TestCase
{
    use RefreshDatabase;

    private int $sedeA;

    private int $sedeB;

    private int $transicion;

    private int $primero;

    /** @var array<string, int> estudiantes por nombre */
    private array $est = [];

    protected function setUp(): void
    {
        parent::setUp();

        DB::table('instituciones')->insert(['id' => 1, 'nombre' => 'Institución de prueba']);
        $this->sedeA = DB::table('sedes')->insertGetId(['institucion_id' => 1, 'codigo' => 'AA', 'nombre' => 'Sede A']);
        $this->sedeB = DB::table('sedes')->insertGetId(['institucion_id' => 1, 'codigo' => 'BB', 'nombre' => 'Sede B']);
        $anio = DB::table('anios_lectivos')->insertGetId(['anio' => 2026, 'estado' => 'activo']);
        $this->transicion = DB::table('grados')->insertGetId(['numero' => 0, 'nombre' => 'Transición', 'nivel' => 'preescolar']);
        $this->primero = DB::table('grados')->insertGetId(['numero' => 1, 'nombre' => 'Primero', 'nivel' => 'primaria']);

        foreach ([['Trans A', $this->sedeA, $this->transicion, '0-1'], ['Primero A', $this->sedeA, $this->primero, '1-1'], ['Primero B', $this->sedeB, $this->primero, '1-1']] as [$nombre, $sede, $grado, $codigo]) {
            $grupo = DB::table('grupos')->insertGetId(['anio_lectivo_id' => $anio, 'sede_id' => $sede, 'grado_id' => $grado, 'numero' => 1, 'codigo' => $codigo, 'jornada' => 'Mañana']);
            $this->est[$nombre] = DB::table('estudiantes')->insertGetId([
                'tipo_documento' => 'R.C.', 'numero_documento' => (string) random_int(10000000, 99999999), 'nombre_completo' => "{$nombre} Prueba",
                'primer_apellido' => 'Prueba', 'primer_nombre' => $nombre,
            ]);
            DB::table('matriculas')->insert(['estudiante_id' => $this->est[$nombre], 'anio_lectivo_id' => $anio, 'grado_id' => $grado, 'grupo_id' => $grupo, 'sede_id' => $sede, 'estado' => 'activo']);
        }
    }

    /** Sede A solo Transición; sede B, todos sus grados. */
    private function profe(): User
    {
        $u = User::factory()->create(['rol_id' => Rol::where('nombre', 'secretaria')->value('id'), 'todas_las_sedes' => false]);
        DB::table('sede_user')->insert([['user_id' => $u->id, 'sede_id' => $this->sedeA], ['user_id' => $u->id, 'sede_id' => $this->sedeB]]);
        DB::table('sede_user_grado')->insert(['user_id' => $u->id, 'sede_id' => $this->sedeA, 'grado_id' => $this->transicion]);

        return $u;
    }

    public function test_en_una_sede_solo_ve_los_grados_marcados()
    {
        $profe = $this->profe();
        $this->assertTrue(Alcance::puedeVerEstudiante($profe, $this->est['Trans A']));
        $this->assertFalse(Alcance::puedeVerEstudiante($profe, $this->est['Primero A']));
        $this->assertTrue(Alcance::puedeVerEstudiante($profe, $this->est['Primero B']));
        $this->assertSame([$this->sedeB], Alcance::sedesDelGrado($profe, $this->primero));
        $this->assertSame([$this->transicion], Alcance::gradosVisibles($profe, $this->sedeA));
        $this->assertNull(Alcance::gradosVisibles($profe, $this->sedeB));

        $this->actingAs($profe)->get("/estudiantes/{$this->est['Trans A']}")->assertOk();
        $this->actingAs($profe)->get("/estudiantes/{$this->est['Primero A']}")->assertNotFound();
        $this->actingAs($profe)->get("/estudiantes/{$this->est['Primero B']}")->assertOk();

        // En la sede A solo se ofrece Transición; en Primero, solo el de la sede B.
        $this->actingAs($profe)->get('/estudiantes?anio=2026&sede=AA')->assertInertia(fn (Assert $page) => $page
            ->where('grados', fn ($g) => collect($g)->pluck('id')->all() === [$this->transicion])
            ->etc());
        $this->actingAs($profe)->get("/estudiantes?anio=2026&grado={$this->primero}")->assertInertia(fn (Assert $page) => $page
            ->where('estudiantes', fn ($e) => collect($e)->pluck('nombre')->all() === ['Primero B Prueba'])
            ->where('grupos', fn ($g) => collect($g)->pluck('sede_codigo')->all() === ['BB'])
            ->where('sedes', fn ($s) => collect($s)->pluck('activos', 'codigo')->all() === ['AA' => 1, 'BB' => 1])
            ->etc());

        // La búsqueda tampoco lo encuentra.
        $this->actingAs($profe)->get('/estudiantes?anio=2026&q=Primero', [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => (new HandleInertiaRequests)->version(request()),
            'X-Inertia-Partial-Component' => 'estudiantes/index',
            'X-Inertia-Partial-Data' => 'busqueda',
        ])->assertOk()->assertJsonPath('props.busqueda', fn ($b) => collect($b)->pluck('nombre')->all() === ['Primero B Prueba']);
    }

    public function test_quien_solo_ve_algunos_grados_promueve_grado_por_grado_y_no_baja_el_libro_de_la_sede()
    {
        $profe = $this->profe();
        $this->actingAs($profe)->post('/promociones', ['anio' => 2026])->assertSessionHasErrors('grado_id');
        $this->actingAs($profe)->post('/promociones', ['anio' => 2026, 'sede' => 'AA', 'grado_id' => $this->primero])->assertNotFound();
        $this->actingAs($profe)->get('/informes/matricula/excel?anio=2026&sede=AA')->assertForbidden();
    }

    public function test_en_usuarios_se_marcan_sede_y_grados()
    {
        $admin = User::factory()->create(['rol_id' => Rol::where('nombre', 'administrador')->value('id')]);
        $this->actingAs($admin)->post('/usuarios', [
            'name' => 'Docente Transición Prueba', 'usuario' => 'transicion.prueba', 'rol_id' => Rol::where('nombre', 'docente')->value('id'),
            'password' => 'clave-de-prueba-1', 'sedes' => [$this->sedeA], 'grados' => [$this->sedeA => [$this->transicion], $this->sedeB => [$this->primero]],
        ])->assertSessionHasNoErrors();
        $nuevo = User::where('usuario', 'transicion.prueba')->firstOrFail();
        // Solo los de sus sedes (la B no está marcada).
        $this->assertSame([[$this->sedeA, $this->transicion]], DB::table('sede_user_grado')->where('user_id', $nuevo->id)->get()->map(fn ($f) => [(int) $f->sede_id, (int) $f->grado_id])->all());

        $this->actingAs($admin)->get('/usuarios')->assertInertia(fn (Assert $page) => $page
            ->where('usuarios', fn ($u) => collect($u)->firstWhere('usuario', 'transicion.prueba')['grados'] == [$this->sedeA => [$this->transicion]])
            ->where('sedes', fn ($s) => collect($s)->firstWhere('codigo', 'AA')['grados'] == [$this->transicion, $this->primero])
            ->has('grados', 2)
            ->etc());

        // Sin grados, vuelve a ver todos los de la sede.
        $this->actingAs($admin)->put("/usuarios/{$nuevo->id}", ['name' => $nuevo->name, 'usuario' => $nuevo->usuario, 'rol_id' => $nuevo->rol_id, 'activo' => true, 'sedes' => [$this->sedeA], 'grados' => []])
            ->assertSessionHasNoErrors();
        $this->assertSame(0, DB::table('sede_user_grado')->where('user_id', $nuevo->id)->count());
    }
}
