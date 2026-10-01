<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Un usuario asignado a una sede solo ve y modifica los datos de esa sede. */
class AlcanceSedesTest extends TestCase
{
    use RefreshDatabase;

    private User $lf;

    private int $sedeLf;

    private int $sedeP;

    /** Un estudiante activo de la Principal (10.° y 11.°), que el usuario de Los Farallones no debe ver. */
    private object $dePrincipal;

    private object $deFarallones;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatosInicialesSeeder::class);
        $this->sedeLf = DB::table('sedes')->where('codigo', 'LF')->value('id');
        $this->sedeP = DB::table('sedes')->where('codigo', 'P')->value('id');
        $this->lf = $this->usuarioDe([$this->sedeLf]);

        $activo = fn (int $sede) => DB::table('matriculas')->where('anio_lectivo_id', 12)->where('sede_id', $sede)->where('estado', 'activo')
            ->orderBy('id')->first(['estudiante_id', 'grado_id', 'grupo_id']);
        $this->dePrincipal = $activo($this->sedeP);
        $this->deFarallones = $activo($this->sedeLf);
    }

    /** Secretaría con solo estas sedes. */
    private function usuarioDe(array $sedes, string $rol = 'secretaria'): User
    {
        $u = User::factory()->create(['rol_id' => Rol::where('nombre', $rol)->value('id'), 'todas_las_sedes' => false]);
        DB::table('sede_user')->insert(array_map(fn ($s) => ['user_id' => $u->id, 'sede_id' => $s], $sedes));

        return $u;
    }

    public function test_el_panel_solo_muestra_su_sede_aunque_pida_otra()
    {
        $activosLf = DB::table('matriculas')->where('anio_lectivo_id', 12)->where('sede_id', $this->sedeLf)->where('estado', 'activo')->count();

        foreach (['/estudiantes?anio=2026', '/estudiantes?anio=2026&sede=P', '/estudiantes?anio=2026&grado='.$this->dePrincipal->grado_id] as $url) {
            $this->actingAs($this->lf)->get($url)
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->where('todasLasSedes', false)
                    ->where('sede', 'LF')
                    ->has('sedes', 1)
                    ->where('totales.activos', $activosLf)
                    ->where('grupos', fn ($g) => collect($g)->every(fn ($x) => $x['sede_codigo'] === 'LF'))
                    ->where('estudiantes', fn ($e) => collect($e)->every(fn ($x) => $x['sede_codigo'] === 'LF')));
        }
    }

    public function test_no_ve_ni_busca_estudiantes_de_otra_sede()
    {
        $otro = $this->dePrincipal->estudiante_id;
        $documento = DB::table('estudiantes')->where('id', $otro)->value('numero_documento');

        $this->actingAs($this->lf)->get("/estudiantes/{$otro}")->assertNotFound();
        $this->actingAs($this->lf)->get("/estudiantes/{$otro}/constancia")->assertNotFound();
        $this->actingAs($this->lf)->get("/estudiantes?anio=2026&ver={$otro}")->assertInertia(fn (Assert $page) => $page->where('detalle', null));
        $this->actingAs($this->lf)
            ->get("/estudiantes?anio=2026&q={$documento}", $this->parcial('busqueda'))
            ->assertJsonPath('props.busqueda', []);

        // El de su sede sí.
        $propio = $this->deFarallones->estudiante_id;
        $this->actingAs($this->lf)->get("/estudiantes/{$propio}")->assertOk();
    }

    public function test_no_modifica_nada_de_otra_sede()
    {
        $otro = $this->dePrincipal->estudiante_id;
        $grupoP = $this->dePrincipal->grupo_id;

        $this->actingAs($this->lf)->put('/grupos/cupos', ['cupos' => [$grupoP => 50]])->assertNotFound();
        $this->actingAs($this->lf)->put("/estudiantes/{$otro}", ['nombre_completo' => 'Otro Nombre'])->assertNotFound();
        $this->actingAs($this->lf)->post("/estudiantes/{$otro}/deshabilitar", ['motivo' => 'retiro', 'razon' => 'Se retiró.', 'fecha' => '2026-09-15']);
        $this->actingAs($this->lf)->post('/promociones', ['anio' => 2026, 'estudiante_id' => $otro])->assertNotFound();
        $this->actingAs($this->lf)->post('/promociones', ['anio' => 2026, 'grado_id' => $this->dePrincipal->grado_id, 'sede' => 'P'])->assertNotFound();
        $this->actingAs($this->lf)->post('/sedes', ['codigo' => 'NV', 'nombre' => 'Nueva'])->assertForbidden();

        $this->assertSame(34, (int) DB::table('grupos')->where('id', $grupoP)->value('cupos_proyectados'));
        $this->assertSame('activo', DB::table('matriculas')->where('estudiante_id', $otro)->where('anio_lectivo_id', 12)->value('estado'));
        $this->assertNull(DB::table('anios_lectivos')->where('anio', 2027)->value('id'));
    }

    public function test_promover_todo_solo_promueve_su_sede()
    {
        $activosLf = DB::table('matriculas')->where('anio_lectivo_id', 12)->where('sede_id', $this->sedeLf)->where('estado', 'activo')->count();

        $this->actingAs($this->lf)->post('/promociones', ['anio' => 2026])->assertSessionHasNoErrors();

        $this->assertSame($activosLf, session('promocion')['promovidos']);
        $origenes = DB::table('matriculas as sig')
            ->join('matriculas as m', fn ($j) => $j->on('m.estudiante_id', '=', 'sig.estudiante_id')->where('m.anio_lectivo_id', 12))
            ->where('sig.anio_lectivo_id', DB::table('anios_lectivos')->where('anio', 2027)->value('id'))
            ->distinct()->pluck('m.sede_id')->all();
        $this->assertSame([$this->sedeLf], array_map('intval', $origenes));
    }

    public function test_informes_y_constancias_por_lote_solo_de_su_sede()
    {
        $activosLf = DB::table('matriculas')->where('anio_lectivo_id', 12)->where('sede_id', $this->sedeLf)->where('estado', 'activo')->count();

        $this->actingAs($this->lf)->get('/informes/matricula/excel?anio=2026&sede=P')->assertNotFound();
        $this->actingAs($this->lf)->get('/constancias?anio=2026&sede=P')->assertNotFound();
        $this->actingAs($this->lf)->get('/constancias?anio=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('constancias', $activosLf));
        $this->actingAs($this->lf)->get('/sedes?anio=2026')
            ->assertInertia(fn (Assert $page) => $page->has('sedes', 1)->where('sedes.0.codigo', 'LF'));
    }

    public function test_inscritos_de_su_sede_por_sede_elegida_o_por_grado()
    {
        $grado = fn (int $n) => DB::table('grados')->where('numero', $n)->value('id');
        $rp = DB::table('sedes')->where('codigo', 'RP')->value('id');
        $base = ['primer_nombre' => 'A', 'primer_apellido' => 'B', 'sexo' => 'F', 'pais_nacimiento' => 'Colombia', 'ciudad_nacimiento' => 'Cali',
            'fecha_nacimiento' => '2014-01-01', 'tipo_documento' => 'T.I.', 'ciudad_expedicion' => 'Cali', 'tipo_sangre' => 'O+', 'sisben' => '1',
            'eps' => 'X', 'grupo_etnico' => 'Mestizo', 'direccion' => 'C', 'barrio' => 'B', 'telefono_1' => '3000000000', 'telefono_2' => '3000000000',
            'correo' => 'a@b.co', 'acudiente_primer_nombre' => 'C', 'acudiente_primer_apellido' => 'D', 'acudiente_fecha_nacimiento' => '1980-01-01',
            'acudiente_numero_documento' => '99999', 'acudiente_ciudad_expedicion' => 'Cali', 'acudiente_parentesco_id' => 1,
            'acudiente_telefono_1' => '3000000000', 'acudiente_telefono_2' => '3000000000', 'autorizo_datos_en' => now(),
            'anio_lectivo_id' => 12, 'estado' => 'pendiente', 'created_at' => now(), 'updated_at' => now()];
        $septimo = DB::table('solicitudes_inscripcion')->insertGetId([...$base, 'numero_documento' => '1001', 'grado_id' => $grado(7)]);   // LF enseña 7.°
        $once = DB::table('solicitudes_inscripcion')->insertGetId([...$base, 'numero_documento' => '1002', 'grado_id' => $grado(11)]);     // solo la Principal
        $primaria = DB::table('solicitudes_inscripcion')->insertGetId([...$base, 'numero_documento' => '1003', 'grado_id' => $grado(3), 'sede_preferida_id' => $rp]);

        $this->actingAs($this->lf)->get('/inscritos')
            ->assertInertia(fn (Assert $page) => $page
                ->where('inscritos', fn ($i) => collect($i)->pluck('id')->all() === [$septimo])
                ->where('inscritosPendientes', 1));
        $this->actingAs($this->lf)->get("/inscritos/{$once}")->assertNotFound();
        $this->actingAs($this->lf)->get("/inscritos/{$primaria}")->assertNotFound();
        $this->actingAs($this->lf)->get("/inscritos/{$septimo}")->assertOk();

        // Quien tiene Rafael Pombo ve el de primaria que la eligió.
        $this->actingAs($this->usuarioDe([$rp]))->get("/inscritos/{$primaria}")->assertOk();
    }

    public function test_sin_sedes_no_ve_nada_y_con_varias_ve_la_suma()
    {
        $this->actingAs($this->usuarioDe([]))->get('/estudiantes?anio=2026')
            ->assertInertia(fn (Assert $page) => $page->has('sedes', 0)->where('totales.activos', 0)->where('estudiantes', []));

        $dos = $this->usuarioDe([$this->sedeLf, $this->sedeP]);
        $activos = DB::table('matriculas')->where('anio_lectivo_id', 12)->whereIn('sede_id', [$this->sedeLf, $this->sedeP])->where('estado', 'activo')->count();
        $this->actingAs($dos)->get('/estudiantes?anio=2026')
            ->assertInertia(fn (Assert $page) => $page->has('sedes', 2)->where('sede', null)->where('totales.activos', $activos));
    }

    public function test_el_administrador_asigna_las_sedes_y_se_exige_al_menos_una()
    {
        $admin = User::factory()->create(['rol_id' => Rol::where('nombre', 'administrador')->value('id'), 'todas_las_sedes' => false]);
        $datos = ['name' => 'Ana Sede', 'usuario' => 'anasede', 'email' => '', 'rol_id' => Rol::where('nombre', 'secretaria')->value('id'), 'password' => 'clave-segura-1'];

        $this->actingAs($admin)->post('/usuarios', [...$datos, 'sedes' => []])->assertSessionHasErrors('sedes');
        $this->actingAs($admin)->post('/usuarios', [...$datos, 'sedes' => [$this->sedeLf]])->assertSessionHasNoErrors();

        $ana = User::where('usuario', 'anasede')->firstOrFail();
        $this->assertFalse($ana->todas_las_sedes);
        $this->assertSame([$this->sedeLf], DB::table('sede_user')->where('user_id', $ana->id)->pluck('sede_id')->map(fn ($i) => (int) $i)->all());

        // Cambiarla a "todas las sedes" quita las asignadas.
        $this->actingAs($admin)->put("/usuarios/{$ana->id}", [...$datos, 'activo' => true, 'todas_las_sedes' => true, 'sedes' => [$this->sedeLf]])->assertSessionHasNoErrors();
        $this->assertTrue($ana->fresh()->todas_las_sedes);
        $this->assertSame(0, DB::table('sede_user')->where('user_id', $ana->id)->count());

        // El administrador ve todo aunque no tenga sedes ni "todas".
        $this->actingAs($admin)->get('/estudiantes?anio=2026')->assertInertia(fn (Assert $page) => $page->where('todasLasSedes', true)->has('sedes', 5));
    }

    /** Cabeceras de una recarga parcial de Inertia (solo `$prop`). */
    private function parcial(string $prop): array
    {
        return [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => (new HandleInertiaRequests)->version(request()),
            'X-Inertia-Partial-Component' => 'estudiantes/index',
            'X-Inertia-Partial-Data' => $prop,
        ];
    }
}
