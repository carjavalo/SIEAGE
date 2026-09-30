<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** El apartado de Sedes: crear y cambiar sedes y sus grupos. */
class SedesTest extends TestCase
{
    use RefreshDatabase;

    private User $secretaria;

    private int $anioId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatosInicialesSeeder::class);
        $this->secretaria = $this->usuario('secretaria');
        $this->anioId = DB::table('anios_lectivos')->where('anio', 2026)->value('id');
    }

    private function usuario(string $rol): User
    {
        return User::factory()->create(['rol_id' => Rol::where('nombre', $rol)->value('id')]);
    }

    private function nuevaSede(): int
    {
        $this->actingAs($this->secretaria)->post('/sedes', ['nombre' => 'Sede de Prueba', 'codigo' => 'sp', 'direccion' => 'Calle 1 # 2-3'])->assertSessionHasNoErrors();

        return DB::table('sedes')->where('codigo', 'SP')->value('id');
    }

    public function test_la_pagina_muestra_cada_sede_con_sus_grupos_y_cuadra_con_la_base()
    {
        $this->get('/sedes')->assertRedirect('/login');

        $sede = DB::table('sedes')->where('codigo', 'LF')->first();
        $grupos = DB::table('grupos')->where(['anio_lectivo_id' => $this->anioId, 'sede_id' => $sede->id]);
        $activos = DB::table('matriculas')->where(['anio_lectivo_id' => $this->anioId, 'sede_id' => $sede->id, 'estado' => 'activo'])->count();

        // También la ven los docentes; solo no pueden cambiar nada.
        $this->actingAs($this->usuario('docente'))->get('/sedes')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('sedes/index')
                ->where('anio', 2026)
                ->where('editable', true)
                ->where('auth.puedeGestionarSedes', false)
                ->has('sedes', DB::table('sedes')->count())
                // La principal va primero.
                ->where('sedes.0.es_principal', true)
                ->where('sedes.1.codigo', 'LF')
                ->where('sedes.1.estudiantes', $activos)
                ->has('sedes.1.grupos', (clone $grupos)->count())
                ->where('sedes.1.se_puede_eliminar', false)
                ->has('grados', 12)
                ->has('jornadas', 4));

        // La suma de activos de los grupos de la sede más los que no tienen grupo da sus estudiantes.
        $pagina = $this->actingAs($this->secretaria)->get('/sedes')->viewData('page')['props'];
        foreach ($pagina['sedes'] as $s) {
            $this->assertSame($s['estudiantes'], collect($s['grupos'])->sum('activos') + $s['sin_grupo']);
        }
        $this->assertTrue($pagina['auth']['puedeGestionarSedes']);

        // Un año cerrado solo se consulta.
        $this->actingAs($this->secretaria)->get('/sedes?anio=2025')
            ->assertInertia(fn (Assert $page) => $page->where('anio', 2025)->where('editable', false));
    }

    public function test_crea_una_sede_con_el_codigo_en_mayusculas_y_no_deja_repetir()
    {
        $id = $this->nuevaSede();
        $sede = DB::table('sedes')->find($id);
        $this->assertSame(['Sede de Prueba', 'SP', 'Calle 1 # 2-3', 0], [$sede->nombre, $sede->codigo, $sede->direccion, (int) $sede->es_principal]);
        $this->assertSame(DB::table('instituciones')->value('id'), $sede->institucion_id);

        $this->actingAs($this->secretaria)->post('/sedes', ['nombre' => 'sede de prueba', 'codigo' => 'lf'])->assertSessionHasErrors(['nombre', 'codigo']);
        $this->actingAs($this->secretaria)->post('/sedes', ['nombre' => '', 'codigo' => 'demasiado largo'])->assertSessionHasErrors(['nombre', 'codigo']);
        $this->actingAs($this->usuario('docente'))->post('/sedes', ['nombre' => 'Otra', 'codigo' => 'OT'])->assertForbidden();
        $this->assertSame(1, DB::table('sedes')->whereNotIn('codigo', ['P', 'LF', 'CP', 'RP', 'PT'])->count());

        // Recién creada aparece vacía y se puede eliminar.
        $this->actingAs($this->secretaria)->get('/sedes')
            ->assertInertia(fn (Assert $page) => $page
                ->where('sedes.5.codigo', 'SP')
                ->where('sedes.5.estudiantes', 0)
                ->has('sedes.5.grupos', 0)
                ->where('sedes.5.se_puede_eliminar', true));
    }

    public function test_edita_una_sede_y_solo_elimina_las_que_no_tienen_historia()
    {
        $lf = DB::table('sedes')->where('codigo', 'LF')->value('id');

        $this->actingAs($this->secretaria)->put("/sedes/{$lf}", ['nombre' => 'Los Farallones', 'codigo' => 'LF', 'direccion' => '  Carrera 9  # 9-99 '])
            ->assertSessionHasNoErrors();
        $this->assertSame('Carrera 9 # 9-99', DB::table('sedes')->where('id', $lf)->value('direccion'));

        // Su propio nombre y código no chocan consigo misma; los de otra sede sí.
        $this->actingAs($this->secretaria)->put("/sedes/{$lf}", ['nombre' => 'Principal', 'codigo' => 'P'])->assertSessionHasErrors(['nombre', 'codigo']);

        $this->actingAs($this->secretaria)->delete("/sedes/{$lf}")->assertSessionHasErrors('eliminar');
        $this->assertDatabaseHas('sedes', ['id' => $lf]);

        $nueva = $this->nuevaSede();
        $this->actingAs($this->secretaria)->delete("/sedes/{$nueva}")->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('sedes', ['id' => $nueva]);
    }

    public function test_crea_grupos_en_una_sede_nueva_y_quedan_disponibles_en_estudiantes()
    {
        $sede = $this->nuevaSede();
        $sexto = DB::table('grados')->where('numero', 6)->value('id');
        $grupo = ['anio' => 2026, 'grado_id' => $sexto, 'numero' => 1, 'jornada' => 'Tarde', 'cupos' => 30];

        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", $grupo)->assertSessionHasNoErrors();
        $this->assertDatabaseHas('grupos', [
            'anio_lectivo_id' => $this->anioId, 'sede_id' => $sede, 'grado_id' => $sexto, 'numero' => 1, 'codigo' => '6-1', 'jornada' => 'Tarde', 'cupos_proyectados' => 30,
        ]);

        // El mismo número no se repite en la sede, ni siquiera en otra jornada.
        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", [...$grupo, 'jornada' => 'Mañana'])->assertSessionHasErrors('numero');
        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", [...$grupo, 'numero' => 0, 'jornada' => 'Madrugada', 'cupos' => 500])
            ->assertSessionHasErrors(['numero', 'jornada', 'cupos']);
        // En un año cerrado no se crean grupos.
        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", [...$grupo, 'anio' => 2025])->assertSessionHasErrors('numero');
        $this->actingAs($this->usuario('docente'))->post("/sedes/{$sede}/grupos", [...$grupo, 'numero' => 2])->assertForbidden();
        $this->assertSame(1, DB::table('grupos')->where('sede_id', $sede)->count());

        // En Estudiantes, el grupo nuevo sale entre los de sexto, con la sede en el filtro.
        $this->actingAs($this->secretaria)->get("/estudiantes?anio=2026&grado={$sexto}&sede=SP")
            ->assertInertia(fn (Assert $page) => $page
                ->where('sede', 'SP')
                ->has('grupos', 1)
                ->where('grupos.0.codigo', '6-1')
                ->where('grupos.0.sede_codigo', 'SP'));
    }

    public function test_cambia_el_numero_la_jornada_y_el_cupo_de_un_grupo_con_estudiantes()
    {
        $grupo = DB::table('grupos as g')->join('matriculas as m', 'm.grupo_id', '=', 'g.id')
            ->where('g.anio_lectivo_id', $this->anioId)->where('g.jornada', 'Mañana')->whereNotNull('m.jornada')
            ->first(['g.id', 'g.sede_id', 'g.grado_id', 'g.numero', 'g.codigo']);
        $estudiantes = DB::table('matriculas')->where('grupo_id', $grupo->id)->count();
        $prefijo = explode('-', $grupo->codigo)[0];

        $this->actingAs($this->secretaria)->put("/grupos/{$grupo->id}", ['numero' => 19, 'jornada' => 'Tarde', 'cupos' => 40])->assertSessionHasNoErrors();

        $g = DB::table('grupos')->find($grupo->id);
        $this->assertSame(["{$prefijo}-19", 'Tarde', 40], [$g->codigo, $g->jornada, (int) $g->cupos_proyectados]);
        // Sus estudiantes siguen en el grupo y pasan con él a la tarde.
        $this->assertSame($estudiantes, DB::table('matriculas')->where('grupo_id', $grupo->id)->where('jornada', 'Tarde')->count());

        // No puede tomar el número de otro grupo de su sede y grado.
        $otro = DB::table('grupos')->where(['anio_lectivo_id' => $this->anioId, 'sede_id' => $grupo->sede_id, 'grado_id' => $grupo->grado_id])
            ->where('id', '<>', $grupo->id)->value('numero');
        if ($otro !== null) {
            $this->actingAs($this->secretaria)->put("/grupos/{$grupo->id}", ['numero' => $otro, 'jornada' => 'Tarde', 'cupos' => 40])->assertSessionHasErrors('numero');
        }

        // Los de un año cerrado no se tocan.
        $viejo = DB::table('grupos as g')->join('anios_lectivos as al', 'al.id', '=', 'g.anio_lectivo_id')->where('al.estado', 'cerrado')->value('g.id');
        $this->actingAs($this->secretaria)->put("/grupos/{$viejo}", ['numero' => 9, 'jornada' => 'Tarde', 'cupos' => 40])->assertSessionHasErrors('numero');
    }

    public function test_solo_se_elimina_un_grupo_vacio()
    {
        $conEstudiantes = DB::table('grupos as g')->join('matriculas as m', 'm.grupo_id', '=', 'g.id')->where('g.anio_lectivo_id', $this->anioId)->value('g.id');
        $this->actingAs($this->secretaria)->delete("/grupos/{$conEstudiantes}")->assertSessionHasErrors('eliminar');
        $this->assertDatabaseHas('grupos', ['id' => $conEstudiantes]);

        $sede = $this->nuevaSede();
        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", [
            'anio' => 2026, 'grado_id' => DB::table('grados')->where('numero', 1)->value('id'), 'numero' => 1, 'jornada' => 'Mañana', 'cupos' => 34,
        ]);
        $vacio = DB::table('grupos')->where('sede_id', $sede)->value('id');

        $this->actingAs($this->usuario('docente'))->delete("/grupos/{$vacio}")->assertForbidden();
        $this->actingAs($this->secretaria)->delete("/grupos/{$vacio}")->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('grupos', ['id' => $vacio]);
    }
}
