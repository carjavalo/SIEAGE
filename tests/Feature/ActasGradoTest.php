<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\ActasGrado;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Actas de grado y diplomas de undécimo: un acta general por modalidad (y otra de los ciclos). */
class ActasGradoTest extends TestCase
{
    use RefreshDatabase;

    private object $anio;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatosInicialesSeeder::class);
        $this->anio = DB::table('anios_lectivos')->where('estado', 'activo')->first();
    }

    /** Las matrículas activas de once del año, de la más antigua a la más nueva. */
    private function deOnce()
    {
        return DB::table('matriculas as m')->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->where('m.anio_lectivo_id', $this->anio->id)->where('gr.numero', 11)->where('m.estado', 'activo')
            ->orderBy('m.id')->select('m.*');
    }

    /** Un estudiante de once nuevo en el grupo y con la modalidad que se pidan. */
    private function graduando(string $nombre, ?int $modalidad, ?string $jornada = null): int
    {
        $base = $this->deOnce()->first();
        $estudiante = DB::table('estudiantes')->insertGetId([
            'tipo_documento' => 'C.C.', 'numero_documento' => (string) random_int(1000000000, 1999999999), 'nombre_completo' => $nombre,
        ]);

        return DB::table('matriculas')->insertGetId([
            'estudiante_id' => $estudiante, 'anio_lectivo_id' => $this->anio->id, 'grado_id' => $base->grado_id,
            'grupo_id' => $base->grupo_id, 'sede_id' => $base->sede_id, 'modalidad_id' => $modalidad, 'jornada' => $jornada ?? $base->jornada, 'estado' => 'activo',
        ]);
    }

    public function test_sin_sesion_o_sin_permiso_no_se_ven()
    {
        $this->get('/actas-grado')->assertRedirect('/login');

        $rol = DB::table('roles')->insertGetId(['nombre' => 'consulta', 'etiqueta' => 'Consulta']);
        DB::table('rol_permiso')->insert(['rol_id' => $rol, 'permiso' => 'ver-estudiantes']);
        $usuario = User::factory()->create(['rol_id' => $rol, 'todas_las_sedes' => true]);
        $this->actingAs($usuario)->get('/actas-grado')->assertForbidden();
        $this->actingAs($usuario)->put("/actas-grado/{$this->anio->anio}", [])->assertForbidden();
    }

    public function test_cada_modalidad_es_un_acta_con_su_primero_y_su_ultimo_en_orden_alfabetico()
    {
        $modalidad = (int) DB::table('modalidades')->where('nombre', 'Electricidad')->value('id');
        DB::table('matriculas')->whereIn('id', $this->deOnce()->pluck('m.id'))->update(['modalidad_id' => $modalidad]);
        $this->graduando('Aaron Abadia Ana Maria', $modalidad);
        $this->graduando('Zzapata Zuluaga Zoe', $modalidad);
        $total = $this->deOnce()->count();

        $this->actingAs(User::first())
            ->get("/actas-grado?anio={$this->anio->anio}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('actas-grado/index')
                ->has('programas', 1)
                ->where('programas.0.clave', "modalidad-{$modalidad}")
                ->where('programas.0.titulo', 'Bachiller Técnico Industrial')
                ->where('programas.0.especialidad', 'Instalaciones Eléctricas Residenciales')
                ->has('programas.0.graduandos', $total)
                // Nombres primero: así sale en el acta, ordenada por apellidos.
                ->where('programas.0.graduandos.0.nombre', 'Ana Maria Aaron Abadia')
                ->where('programas.0.graduandos.'.($total - 1).'.nombre', 'Zoe Zzapata Zuluaga')
                ->where('graduacion.rector', 'Betty Rodríguez Chávez')
                ->where('graduacion.cargo_rector', 'Rectora')
                ->where('graduacion.secretario', 'Jhon Jairo Franco Caicedo'));
    }

    public function test_los_ciclos_y_cada_tecnica_van_aparte_y_no_salen_reprobados_ni_sin_modalidad()
    {
        $ids = $this->deOnce()->pluck('m.id');
        $comercio = (int) DB::table('modalidades')->where('nombre', 'Asist. Admin.')->value('id');
        DB::table('matriculas')->whereIn('id', $ids)->update(['modalidad_id' => $comercio]);
        $reprobado = $ids->first();
        DB::table('matriculas')->where('id', $reprobado)->update(['resultado' => 'reprobado']);
        $sabatino = $this->graduando('Mora Mina Pedro', null, 'Sabatina');
        $sinModalidad = $this->graduando('Rios Rua Luz', null);

        $datos = ActasGrado::del($this->anio->id);
        $claves = array_column($datos['programas'], 'clave');

        $this->assertSame(["modalidad-{$comercio}", ActasGrado::CICLOS], $claves);
        $this->assertSame('Bachiller Técnico en Comercio', $datos['programas'][0]['titulo']);
        $this->assertNotContains($reprobado, array_column($datos['programas'][0]['graduandos'], 'matricula'));
        $this->assertSame([$sabatino], array_column($datos['programas'][1]['graduandos'], 'matricula'));
        $this->assertSame('Bachiller Académico', $datos['programas'][1]['titulo']);
        $this->assertSame(['Luz Rios Rua'], array_column($datos['sinModalidad'], 'nombre'));
        $this->assertNotContains($sinModalidad, collect($datos['programas'])->flatMap(fn ($p) => array_column($p['graduandos'], 'matricula'))->all());
    }

    public function test_los_ya_graduados_al_promover_siguen_saliendo()
    {
        $modalidad = (int) DB::table('modalidades')->value('id');
        $ids = $this->deOnce()->pluck('m.id');
        DB::table('matriculas')->whereIn('id', $ids)->update(['modalidad_id' => $modalidad, 'estado' => 'graduado', 'resultado' => 'promovido']);

        $this->assertCount($ids->count(), ActasGrado::del($this->anio->id)['programas'][0]['graduandos']);
    }

    public function test_el_documento_lleva_puntos_de_mil()
    {
        $this->assertSame('T.I. 1.107.853.837', ActasGrado::documento('T.I.', '1107853837'));
        $this->assertSame('C.C. 0123', ActasGrado::documento('C.C.', '0123'));
        $this->assertSame('P.P.T. AB12', ActasGrado::documento('P.P.T.', 'AB12'));
    }

    public function test_los_datos_del_grado_se_guardan_por_año()
    {
        $modalidad = (int) DB::table('modalidades')->value('id');
        $url = "/actas-grado/{$this->anio->anio}";

        $this->actingAs(User::first())->from('/actas-grado')->put($url, [
            'fecha' => '2026-12-10',
            'rector' => ' Rectora De Prueba ',
            'cargo_rector' => 'Rectora',
            'secretario' => 'Secretario De Prueba',
            'cargo_secretario' => 'Secretario Académico',
            'actas' => [
                "modalidad-{$modalidad}" => ['acta' => '19-1', 'libro' => '01', 'folio' => '74-01', 'primero' => ' Mariana Acevedo Guzman ', 'ultimo' => ''],
                ActasGrado::CICLOS => ['acta' => '11', 'libro' => '', 'folio' => ''],
                'inventada' => ['acta' => 'x'],
            ],
        ])->assertRedirect('/actas-grado')->assertSessionHasNoErrors();

        $this->actingAs(User::first())
            ->get("/actas-grado?anio={$this->anio->anio}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('graduacion.fecha', '2026-12-10')
                ->where('graduacion.rector', 'Rectora De Prueba')
                ->where("graduacion.actas.modalidad-{$modalidad}.folio", '74-01')
                // Con quién comienza y se cierra se puede corregir; vacío queda el de la lista.
                ->where("graduacion.actas.modalidad-{$modalidad}.primero", 'Mariana Acevedo Guzman')
                ->where("graduacion.actas.modalidad-{$modalidad}.ultimo", null)
                ->where('graduacion.actas.ciclos.libro', null)
                ->missing('graduacion.actas.inventada'));

        // Escrito a mano en mayúsculas o minúsculas, sale con mayúscula inicial como los demás nombres.
        $this->actingAs(User::first())->put($url, [
            'cargo_rector' => 'Rectora', 'cargo_secretario' => 'Secretario Académico',
            'actas' => ["modalidad-{$modalidad}" => ['primero' => 'MARIANA  acevedo guzmán', 'ultimo' => 'zoe zapata']],
        ])->assertSessionHasNoErrors();
        $this->assertSame('Mariana Acevedo Guzmán', json_decode(DB::table('graduaciones')->value('actas'), true)["modalidad-{$modalidad}"]['primero']);
        // Y los que ya estaban guardados así, también.
        DB::table('graduaciones')->update(['actas' => json_encode(["modalidad-{$modalidad}" => ['primero' => 'LUZ RIOS', 'ultimo' => null]])]);
        $this->actingAs(User::first())->get("/actas-grado?anio={$this->anio->anio}")
            ->assertInertia(fn (Assert $page) => $page
                ->where("graduacion.actas.modalidad-{$modalidad}.primero", 'Luz Rios')
                ->where("graduacion.actas.modalidad-{$modalidad}.ultimo", null));

        // Guardar otra vez cambia la misma fila: una por año.
        $this->actingAs(User::first())->put($url, ['cargo_rector' => 'Rector', 'cargo_secretario' => 'Secretaria'])->assertSessionHasNoErrors();
        $this->assertSame(1, DB::table('graduaciones')->count());
        $this->assertSame('Rector', DB::table('graduaciones')->value('cargo_rector'));
        // Dejarlo vacío a propósito no trae de vuelta el nombre por defecto.
        $this->actingAs(User::first())->get("/actas-grado?anio={$this->anio->anio}")
            ->assertInertia(fn (Assert $page) => $page->where('graduacion.rector', null));

        $this->actingAs(User::first())->put($url, ['cargo_rector' => '', 'cargo_secretario' => 'x', 'fecha' => 'mañana'])
            ->assertSessionHasErrors(['cargo_rector', 'fecha']);
        $this->actingAs(User::first())->put('/actas-grado/1990', ['cargo_rector' => 'a', 'cargo_secretario' => 'b'])->assertNotFound();
    }
}
