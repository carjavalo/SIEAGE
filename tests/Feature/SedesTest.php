<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Support\Boletines;
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

    public function test_los_grupos_de_transicion_se_llaman_0_1_0_2()
    {
        $sede = $this->nuevaSede();
        $transicion = DB::table('grados')->where('numero', 0)->value('id');

        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", ['anio' => 2026, 'grado_id' => $transicion, 'numero' => 2, 'jornada' => 'Mañana', 'cupos' => 25])
            ->assertSessionHasNoErrors();
        $this->assertDatabaseHas('grupos', ['sede_id' => $sede, 'grado_id' => $transicion, 'numero' => 2, 'codigo' => '0-2']);

        // Los que una versión anterior pasó a «T3» vuelven a «0-3».
        $viejo = DB::table('grupos')->insertGetId(['anio_lectivo_id' => $this->anioId, 'sede_id' => $sede, 'grado_id' => $transicion, 'numero' => 3, 'codigo' => 'T3', 'jornada' => 'Mañana']);
        (require database_path('migrations/2026_11_05_000000_codigo_de_grupos_de_transicion.php'))->up();
        $this->assertSame('0-3', DB::table('grupos')->where('id', $viejo)->value('codigo'));
    }

    public function test_los_grupos_del_anio_siguiente_se_crean_aqui_antes_de_promover()
    {
        // 2027 todavía no existe, pero ya sale para prepararlo según la proyección de matrícula.
        $this->actingAs($this->secretaria)->get('/sedes')
            ->assertInertia(fn (Assert $page) => $page
                ->where('anio', 2026)
                ->where('anios.0', ['id' => null, 'anio' => 2027, 'estado' => 'planeado']));
        $this->actingAs($this->secretaria)->get('/sedes?anio=2027')
            ->assertInertia(fn (Assert $page) => $page
                ->where('anio', 2027)
                ->where('editable', true)
                ->where('sedes', fn ($sedes) => collect($sedes)->every(fn ($s) => $s['grupos'] === [] && $s['estudiantes'] === 0)));
        $this->assertNull(DB::table('anios_lectivos')->where('anio', 2027)->value('id'), 'verlo no lo crea');

        // Con el primer grupo nace el año, como planeado.
        $lf = DB::table('sedes')->where('codigo', 'LF')->value('id');
        $grupo = ['anio' => 2027, 'grado_id' => DB::table('grados')->where('numero', 6)->value('id'), 'numero' => 1, 'jornada' => 'Mañana', 'cupos' => 34];
        $this->actingAs($this->secretaria)->post("/sedes/{$lf}/grupos", $grupo)->assertSessionHasNoErrors();
        $anio2027 = DB::table('anios_lectivos')->where('anio', 2027)->first();
        $this->assertSame('planeado', $anio2027->estado);
        $this->assertDatabaseHas('grupos', ['anio_lectivo_id' => $anio2027->id, 'sede_id' => $lf, 'codigo' => '6-1', 'cupos_proyectados' => 34]);

        // Más allá del año siguiente no se puede.
        $this->actingAs($this->secretaria)->post("/sedes/{$lf}/grupos", [...$grupo, 'anio' => 2028])->assertSessionHasErrors('anio');
        $this->assertNull(DB::table('anios_lectivos')->where('anio', 2028)->value('id'));
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

    public function test_crea_un_ciclo_sabatino_y_de_el_solo_se_cambia_el_cupo()
    {
        $sede = $this->nuevaSede();
        $undecimo = DB::table('grados')->where('numero', 11)->value('id');

        // Se elige el ciclo: queda en el último grado que abarca, con jornada sabatina y número 1.
        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", ['anio' => 2026, 'ciclo' => 'VI', 'cupos' => 25])
            ->assertSessionHasNoErrors()->assertSessionHas('success', 'Ciclo VI creado en Sede de Prueba.');
        $ciclo = DB::table('grupos')->where(['sede_id' => $sede, 'codigo' => 'Ciclo VI'])->first();
        $this->assertSame([$undecimo, 1, 'Sabatina', 25, $this->anioId], [(int) $ciclo->grado_id, (int) $ciclo->numero, $ciclo->jornada, (int) $ciclo->cupos_proyectados, (int) $ciclo->anio_lectivo_id]);

        // Uno por sede; un ciclo que no existe, no; el docente no crea ciclos; en un año cerrado tampoco.
        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", ['anio' => 2026, 'ciclo' => 'VI', 'cupos' => 25])->assertSessionHasErrors('ciclo');
        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", ['anio' => 2026, 'ciclo' => 'VII', 'cupos' => 25])->assertSessionHasErrors('ciclo');
        $this->actingAs($this->usuario('docente'))->post("/sedes/{$sede}/grupos", ['anio' => 2026, 'ciclo' => 'V', 'cupos' => 25])->assertForbidden();
        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", ['anio' => 2025, 'ciclo' => 'V', 'cupos' => 25])->assertSessionHasErrors('ciclo');

        // El 11-1 de la mañana no se confunde con el Ciclo VI (también es Undécimo, número 1).
        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", ['anio' => 2026, 'grado_id' => $undecimo, 'numero' => 1, 'jornada' => 'Mañana', 'cupos' => 34])
            ->assertSessionHasNoErrors();
        $this->assertSame(['11-1', 'Ciclo VI'], DB::table('grupos')->where('sede_id', $sede)->orderBy('codigo')->pluck('codigo')->all());

        // Al editarlo solo cambia el cupo: el nombre y la jornada quedan, aunque lleguen otros.
        $this->actingAs($this->secretaria)->put("/grupos/{$ciclo->id}", ['cupos' => 30, 'numero' => 7, 'jornada' => 'Mañana'])->assertSessionHasNoErrors();
        $g = DB::table('grupos')->find($ciclo->id);
        $this->assertSame(['Ciclo VI', 'Sabatina', 1, 30], [$g->codigo, $g->jornada, (int) $g->numero, (int) $g->cupos_proyectados]);

        // La página trae los ciclos que se pueden crear y el de la sede entre sus grupos.
        $this->actingAs($this->secretaria)->get('/sedes')->assertInertia(fn (Assert $page) => $page
            ->has('ciclos', 6)
            ->where('ciclos.5', ['ciclo' => 'VI', 'codigo' => 'Ciclo VI', 'grados' => '11.º'])
            ->where('ciclos.0.grados', '1.º, 2.º, 3.º')
            ->where('sedes', fn ($sedes) => collect(collect($sedes)->firstWhere('id', $sede)['grupos'])->contains(fn ($x) => $x['codigo'] === 'Ciclo VI' && $x['jornada'] === 'Sabatina'))
            ->etc());

        // Vacío, se elimina como cualquier grupo.
        $this->actingAs($this->secretaria)->delete("/grupos/{$ciclo->id}")->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('grupos', ['id' => $ciclo->id]);
    }

    public function test_un_estudiante_pasa_de_un_ciclo_a_otro_y_de_vuelta_a_un_grupo()
    {
        $sede = DB::table('sedes')->where('codigo', 'P')->value('id');
        foreach (['III', 'IV'] as $c) {
            $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", ['anio' => 2026, 'ciclo' => $c, 'cupos' => 25])->assertSessionHasNoErrors();
        }
        $cicloIII = DB::table('grupos')->where(['sede_id' => $sede, 'codigo' => 'Ciclo III', 'anio_lectivo_id' => $this->anioId])->first();
        $cicloIV = DB::table('grupos')->where(['sede_id' => $sede, 'codigo' => 'Ciclo IV', 'anio_lectivo_id' => $this->anioId])->first();
        $m = DB::table('matriculas as m')->join('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->where('m.anio_lectivo_id', $this->anioId)->where('m.estado', 'activo')->where('g.sede_id', $sede)->where('g.jornada', '<>', 'Sabatina')
            ->first(['m.id', 'm.estudiante_id', 'm.grupo_id', 'g.jornada']);
        $cambiar = fn (int $grupo) => $this->actingAs($this->secretaria)
            ->post("/estudiantes/{$m->estudiante_id}/cambiar-grupo", ['grupo_id' => $grupo, 'razon' => 'Pasa a la jornada sabatina por trabajo.']);
        $sabatinos = fn () => DB::table('matriculas as x')->join('grupos as gx', 'gx.id', '=', 'x.grupo_id')
            ->where('x.anio_lectivo_id', $this->anioId)->where('x.estado', 'activo')->whereRaw("coalesce(x.jornada, gx.jornada) = 'Sabatina'")->count();

        // En la ficha, los ciclos van marcados para ir aparte de los grados.
        $this->actingAs($this->secretaria)->get("/estudiantes/{$m->estudiante_id}")->assertInertia(fn (Assert $page) => $page
            ->where('sedes', fn ($sedes) => collect($sedes)->flatMap(fn ($s) => $s['grupos'])->where('ciclo', true)->pluck('codigo')->sort()->values()->all() === ['Ciclo III', 'Ciclo IV'])
            ->etc());

        // A un ciclo: toma su grado (Séptimo) y la jornada sabatina.
        $cambiar($cicloIII->id)->assertSessionHasNoErrors();
        $x = DB::table('matriculas')->find($m->id);
        $this->assertSame([$cicloIII->id, $cicloIII->grado_id, 'Sabatina'], [(int) $x->grupo_id, (int) $x->grado_id, $x->jornada]);
        $this->assertSame(1, $sabatinos());

        // De un ciclo a otro.
        $cambiar($cicloIV->id)->assertSessionHasNoErrors();
        $x = DB::table('matriculas')->find($m->id);
        $this->assertSame([$cicloIV->id, $cicloIV->grado_id, 'Sabatina'], [(int) $x->grupo_id, (int) $x->grado_id, $x->jornada]);

        // Y de vuelta a su grupo de antes: sale de la sabatina.
        $cambiar((int) $m->grupo_id)->assertSessionHasNoErrors();
        $this->assertSame($m->jornada, DB::table('matriculas')->where('id', $m->id)->value('jornada'));
        $this->assertSame(0, $sabatinos());
    }

    public function test_cambia_de_grupo_o_ciclo_a_varios_marcados_a_la_vez()
    {
        $sede = DB::table('sedes')->where('codigo', 'P')->value('id');
        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", ['anio' => 2026, 'ciclo' => 'IV', 'cupos' => 3])->assertSessionHasNoErrors();
        $ciclo = DB::table('grupos')->where(['sede_id' => $sede, 'codigo' => 'Ciclo IV', 'anio_lectivo_id' => $this->anioId])->first();
        $activos = DB::table('matriculas as m')->join('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->where('m.anio_lectivo_id', $this->anioId)->where('m.estado', 'activo')->where('g.sede_id', $sede)->where('g.jornada', '<>', 'Sabatina')
            ->orderBy('m.id')->limit(4)->get(['m.id', 'm.estudiante_id']);
        $ids = $activos->pluck('estudiante_id')->all();
        $cambiar = fn (array $estudiantes, ?int $grupo = null) => $this->actingAs($this->secretaria)
            ->post('/estudiantes/cambiar-grupo', ['estudiantes' => $estudiantes, 'grupo_id' => $grupo ?? $ciclo->id, 'razon' => 'Pasan a la sabatina por trabajo.']);

        // La lista de grupos para elegir trae los ciclos marcados.
        $this->actingAs($this->secretaria)->getJson('/estudiantes/grupos-para-cambiar')->assertOk()
            ->assertJson(fn ($json) => $json->etc())
            ->assertJsonFragment(['codigo' => 'Ciclo IV', 'ciclo' => true]);

        // Cuatro no caben en un ciclo de 3 cupos: no se cambia a nadie.
        $cambiar($ids)->assertSessionHasErrors(['grupo_id' => 'En ese grupo solo quedan 3 cupos y son 4 estudiantes.']);
        $this->assertSame(0, DB::table('matriculas')->where('grupo_id', $ciclo->id)->count());

        // Tres sí: todos al ciclo, en Noveno y jornada sabatina, con su novedad.
        $tres = array_slice($ids, 0, 3);
        $cambiar($tres)->assertSessionHasNoErrors()->assertSessionHas('success', '3 estudiantes cambiaron a Ciclo IV (P).');
        $this->assertSame(3, DB::table('matriculas')->where('grupo_id', $ciclo->id)->where('jornada', 'Sabatina')->where('grado_id', $ciclo->grado_id)->count());
        $this->assertSame(3, DB::table('novedades_matricula')->whereIn('matricula_id', $activos->take(3)->pluck('id'))->where('tipo', 'cambio_grupo')->count());

        // Alguien que ya está en ese grupo entre los marcados: no se cambia a nadie.
        $cambiar([$ids[3], $ids[0]])->assertSessionHasErrors('grupo_id');
        // Alguien fuera del año en curso (o retirado): tampoco.
        DB::table('matriculas')->where('id', $activos[3]->id)->update(['estado' => 'retirado']);
        $cambiar([$ids[3]])->assertSessionHasErrors('estudiantes');
        // Sin permiso de editar estudiantes, no.
        $this->actingAs($this->usuario('docente'))->post('/estudiantes/cambiar-grupo', ['estudiantes' => $tres, 'grupo_id' => $ciclo->id, 'razon' => 'Una razón de prueba.'])
            ->assertForbidden();
    }

    /** Un docente activo de la sede. */
    private function docenteDe(int $sedeId, string $nombre): User
    {
        $u = $this->usuario('docente');
        $u->update(['name' => $nombre, 'todas_las_sedes' => false]);
        DB::table('sede_user')->insert(['sede_id' => $sedeId, 'user_id' => $u->id]);

        return $u;
    }

    public function test_asigna_cambia_y_quita_el_director_del_grupo_y_sale_en_el_boletin()
    {
        $g = DB::table('grupos')->where('anio_lectivo_id', $this->anioId)->orderBy('id')->first();
        DB::table('grupos')->where('id', $g->id)->update(['director_id' => null]);
        $datos = ['numero' => $g->numero, 'jornada' => $g->jornada, 'cupos' => $g->cupos_proyectados];
        $ana = $this->docenteDe($g->sede_id, 'Ana Lucía Prueba');
        $luis = $this->docenteDe($g->sede_id, 'Luis Prueba Díaz');
        $director = fn () => Boletines::datosGrupo($g->id)->director;

        // La lista de la sede trae a sus docentes, y el grupo dice que no tiene director.
        $this->actingAs($this->secretaria)->get('/sedes?anio=2026')->assertInertia(fn (Assert $page) => $page
            ->where('sedes', fn ($sedes) => collect(collect($sedes)->firstWhere('id', $g->sede_id)['firmantes'])->pluck('id')->contains($ana->id)));

        $this->actingAs($this->secretaria)->put("/grupos/{$g->id}", [...$datos, 'director_id' => $ana->id])->assertSessionHasNoErrors();
        $this->assertSame('ANA LUCÍA PRUEBA', $director());

        // Editar sin enviar el campo no lo borra.
        $this->actingAs($this->secretaria)->put("/grupos/{$g->id}", $datos)->assertSessionHasNoErrors();
        $this->assertSame('ANA LUCÍA PRUEBA', $director());

        $this->actingAs($this->secretaria)->put("/grupos/{$g->id}", [...$datos, 'director_id' => $luis->id])->assertSessionHasNoErrors();
        $this->assertSame('LUIS PRUEBA DÍAZ', $director());

        $this->actingAs($this->secretaria)->put("/grupos/{$g->id}", [...$datos, 'director_id' => null])->assertSessionHasNoErrors();
        $this->assertNull($director());
    }

    public function test_el_director_debe_ser_de_la_sede_y_quien_no_puede_cambiar_grupos_no_ve_la_lista()
    {
        $g = DB::table('grupos')->where('anio_lectivo_id', $this->anioId)->orderBy('id')->first();
        $otraSede = DB::table('sedes')->where('id', '<>', $g->sede_id)->value('id');
        $ajeno = $this->docenteDe($otraSede, 'De Otra Sede');
        $datos = ['numero' => $g->numero, 'jornada' => $g->jornada, 'cupos' => $g->cupos_proyectados];
        $antes = $g->director_id;

        $this->actingAs($this->secretaria)->put("/grupos/{$g->id}", [...$datos, 'director_id' => $ajeno->id])->assertSessionHasErrors('director_id');
        $this->assertEquals($antes, DB::table('grupos')->where('id', $g->id)->value('director_id'));

        $this->actingAs($this->usuario('docente'))->put("/grupos/{$g->id}", [...$datos, 'director_id' => null])->assertForbidden();
        $this->actingAs($this->usuario('docente'))->get('/sedes')->assertInertia(fn (Assert $page) => $page
            ->where('sedes', fn ($sedes) => collect($sedes)->every(fn ($s) => collect($s['firmantes'])->isEmpty())));
    }

    public function test_crea_un_grupo_con_su_director()
    {
        $sede = $this->nuevaSede();
        $ana = $this->docenteDe($sede, 'Ana Directora');

        $this->actingAs($this->secretaria)->post("/sedes/{$sede}/grupos", [
            'anio' => 2026, 'grado_id' => DB::table('grados')->where('numero', 0)->value('id'), 'numero' => 1, 'jornada' => 'Mañana', 'cupos' => 30, 'director_id' => $ana->id,
        ])->assertSessionHasNoErrors();

        $g = DB::table('grupos')->where('sede_id', $sede)->first();
        $this->assertSame('ANA DIRECTORA', Boletines::datosGrupo($g->id)->director);
    }
}
