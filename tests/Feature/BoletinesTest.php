<?php

namespace Tests\Feature;

use App\Http\Controllers\BoletinController;
use App\Models\Rol;
use App\Models\User;
use App\Support\Boletines;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Boletines de transición: escribir el texto de cada estudiante, quién firma e imprimirlos. Datos inventados. */
class BoletinesTest extends TestCase
{
    use RefreshDatabase;

    private int $anio;

    private int $periodo1;

    private int $periodo3;

    private int $sedeA;

    private int $sedeB;

    /** @var array<string, int> grupos por código */
    private array $grupos = [];

    /** @var array<string, int> matrículas por nombre */
    private array $mat = [];

    protected function setUp(): void
    {
        parent::setUp();

        DB::table('instituciones')->insert(['id' => 1, 'nombre' => 'Institución de prueba']);
        $this->sedeA = DB::table('sedes')->insertGetId(['institucion_id' => 1, 'codigo' => 'RP', 'nombre' => 'Rafael Pombo', 'direccion' => 'CR 7R BIS Nº 72-124 BR ALFONSO LOPEZ']);
        $this->sedeB = DB::table('sedes')->insertGetId(['institucion_id' => 1, 'codigo' => 'LF', 'nombre' => 'Los Farallones']);
        $this->anio = DB::table('anios_lectivos')->insertGetId(['anio' => 2026, 'estado' => 'activo']);
        foreach ([1, 2, 3, 4] as $n) {
            $id = DB::table('periodos')->insertGetId(['anio_lectivo_id' => $this->anio, 'numero' => $n, 'nombre' => "Periodo {$n}", 'porcentaje' => $n <= 2 ? 50 : null]);
            if ($n === 1) {
                $this->periodo1 = $id;
            }
            if ($n === 3) {
                $this->periodo3 = $id;
            }
        }
        $transicion = DB::table('grados')->insertGetId(['numero' => 0, 'nombre' => 'Transición', 'nivel' => 'preescolar']);
        $primero = DB::table('grados')->insertGetId(['numero' => 1, 'nombre' => 'Primero', 'nivel' => 'primaria']);

        $grupo = fn (string $codigo, int $sede, int $grado) => $this->grupos[$codigo.($sede === $this->sedeB ? '-LF' : '')] = DB::table('grupos')->insertGetId([
            'anio_lectivo_id' => $this->anio, 'sede_id' => $sede, 'grado_id' => $grado, 'numero' => 1, 'codigo' => $codigo, 'jornada' => 'Mañana',
        ]);
        $grupo('0-1', $this->sedeA, $transicion);
        $grupo('0-1', $this->sedeB, $transicion);
        $grupo('1-1', $this->sedeA, $primero);

        $estudiante = function (string $nombre, array $partes, string $grupo, int $grado, int $sede, string $estado = 'activo') {
            $e = DB::table('estudiantes')->insertGetId([
                'tipo_documento' => 'R.C.', 'numero_documento' => (string) random_int(10000000, 99999999), 'nombre_completo' => $nombre,
                'primer_apellido' => $partes[0], 'segundo_apellido' => $partes[1], 'primer_nombre' => $partes[2], 'segundo_nombre' => $partes[3],
            ]);
            $this->mat[$nombre] = DB::table('matriculas')->insertGetId([
                'estudiante_id' => $e, 'anio_lectivo_id' => $this->anio, 'grado_id' => $grado, 'grupo_id' => $this->grupos[$grupo], 'sede_id' => $sede, 'estado' => $estado,
            ]);
        };
        $estudiante('Prueba Uno Ana María', ['Prueba', 'Uno', 'Ana', 'María'], '0-1', $transicion, $this->sedeA);
        $estudiante('Ejemplo Dos Luis', ['Ejemplo', 'Dos', 'Luis', null], '0-1', $transicion, $this->sedeA);
        $estudiante('Retirado Tres Sol', ['Retirado', 'Tres', 'Sol', null], '0-1', $transicion, $this->sedeA, 'retirado');
        $estudiante('Otra Sede Cuatro', ['Otra', 'Sede', 'Cuatro', null], '0-1-LF', $transicion, $this->sedeB);
        $estudiante('Primero Cinco Juan', ['Primero', 'Cinco', 'Juan', null], '1-1', $primero, $this->sedeA);
    }

    private function usuario(string $rol, ?array $sedes = null): User
    {
        $u = User::factory()->create(['rol_id' => Rol::where('nombre', $rol)->value('id'), 'todas_las_sedes' => $sedes === null]);
        if ($sedes !== null) {
            DB::table('sede_user')->insert(array_map(fn ($s) => ['user_id' => $u->id, 'sede_id' => $s], $sedes));
        }

        return $u;
    }

    public function test_sin_sesion_no_se_ven()
    {
        $this->get('/boletines')->assertRedirect('/login');
        $this->put("/boletines/{$this->mat['Ejemplo Dos Luis']}/{$this->periodo1}", ['texto' => 'x'])->assertRedirect('/login');
    }

    public function test_la_pagina_trae_los_grupos_de_transicion_y_sus_estudiantes_activos()
    {
        $this->actingAs($this->usuario('administrador'))
            ->get('/boletines')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('boletines/index')
                // Solo transición (no el 1-1), de las dos sedes.
                ->has('grupos', 2)
                ->where('grupos', fn ($g) => collect($g)->every(fn ($x) => $x['codigo'] === '0-1'))
                // Solo los periodos con porcentaje: «PRIMER PERIODO 50%» y «SEGUNDO PERIODO 50%».
                ->where('periodos', fn ($p) => collect($p)->pluck('etiqueta')->all() === ['PRIMER PERIODO 50%', 'SEGUNDO PERIODO 50%'])
                ->where('grupo.curso', '0 - 1')
                ->where('grupo.sede', 'LOS FARALLONES')
                ->etc());

        $this->actingAs($this->usuario('administrador'))
            ->get("/boletines?grupo={$this->grupos['0-1']}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('grupo.direccion', 'CR 7R BIS Nº 72-124 BR ALFONSO LOPEZ - VALLE - CALI')
                ->where('grupo.jornada', 'MAÑANA')
                // Activos, en orden; el retirado no.
                ->where('estudiantes', fn ($e) => collect($e)->pluck('nombre')->all() === ['Ejemplo Dos Luis', 'Prueba Uno Ana María'])
                ->where('estudiantes.1.apellidos_nombres', 'PRUEBA UNO ANA MARÍA')
                ->where('estudiantes.1.nombres_apellidos', 'Ana María Prueba Uno')
                ->etc());
    }

    public function test_desde_la_ficha_abre_el_grupo_del_estudiante()
    {
        $id = DB::table('matriculas')->where('id', $this->mat['Prueba Uno Ana María'])->value('estudiante_id');
        $this->actingAs($this->usuario('administrador'))
            ->get("/boletines?ver={$id}")
            ->assertInertia(fn (Assert $page) => $page->where('grupo.id', $this->grupos['0-1'])->where('ver', $id)->etc());
    }

    public function test_el_docente_escribe_y_el_texto_se_guarda_limpio()
    {
        $docente = $this->usuario('docente', [$this->sedeA]);
        $m = $this->mat['Prueba Uno Ana María'];

        $this->actingAs($docente)
            ->putJson("/boletines/{$m}/{$this->periodo1}", ['texto' => "  Primer   párrafo.\r\n\r\n  Segundo\u{00A0}párrafo.  \n"])
            ->assertOk()
            ->assertJsonPath('por', $docente->name);

        $fila = DB::table('boletines')->where('matricula_id', $m)->first();
        $this->assertSame("Primer párrafo.\nSegundo párrafo.", $fila->texto);
        $this->assertSame($docente->id, (int) $fila->creado_por);

        // Vacío: se borra.
        $this->assertSame(1, (int) $fila->revision);
        $this->actingAs($docente)->putJson("/boletines/{$m}/{$this->periodo1}", ['texto' => '   ', 'version' => '1'])->assertOk();
        $this->assertDatabaseCount('boletines', 0);
    }

    public function test_solo_transicion_del_año_en_curso_y_de_sus_sedes()
    {
        $docente = $this->usuario('docente', [$this->sedeA]);

        // Primero no tiene boletín de texto.
        $this->actingAs($docente)->putJson("/boletines/{$this->mat['Primero Cinco Juan']}/{$this->periodo1}", ['texto' => 'x'])->assertNotFound();
        // Otra sede: no lo ve.
        $this->actingAs($docente)->putJson("/boletines/{$this->mat['Otra Sede Cuatro']}/{$this->periodo1}", ['texto' => 'x'])->assertNotFound();
        $this->actingAs($docente)->get("/boletines?grupo={$this->grupos['0-1-LF']}")->assertNotFound();
        // Un periodo de otro año: no.
        $otro = DB::table('anios_lectivos')->insertGetId(['anio' => 2025, 'estado' => 'cerrado']);
        $periodoViejo = DB::table('periodos')->insertGetId(['anio_lectivo_id' => $otro, 'numero' => 1]);
        $this->actingAs($docente)->putJson("/boletines/{$this->mat['Ejemplo Dos Luis']}/{$periodoViejo}", ['texto' => 'x'])->assertNotFound();

        // Su sede sí, y en la página solo le aparece su grupo.
        $this->actingAs($docente)->putJson("/boletines/{$this->mat['Ejemplo Dos Luis']}/{$this->periodo1}", ['texto' => 'Bien.'])->assertOk();
        $this->actingAs($docente)->get('/boletines')->assertInertia(fn (Assert $page) => $page->has('grupos', 1)->where('puedeConfigurar', false)->where('usuarios', [])->etc());
    }

    public function test_no_pisa_lo_que_otra_persona_cambio()
    {
        $una = $this->usuario('docente', [$this->sedeA]);
        $otra = $this->usuario('coordinacion', [$this->sedeA]);
        $m = $this->mat['Ejemplo Dos Luis'];

        $this->actingAs($una)->putJson("/boletines/{$m}/{$this->periodo1}", ['texto' => 'Versión uno.', 'version' => null])->assertOk()->assertJsonPath('version', '1');
        $vieja = '1';
        $this->actingAs($otra)->putJson("/boletines/{$m}/{$this->periodo1}", ['texto' => 'Versión dos.', 'version' => $vieja])->assertOk()->assertJsonPath('version', '2');

        // La primera sigue con la versión vieja: no se guarda y le cuenta qué hay.
        $this->actingAs($una)
            ->putJson("/boletines/{$m}/{$this->periodo1}", ['texto' => 'Versión tres.', 'version' => $vieja])
            ->assertStatus(409)
            ->assertJsonPath('conflicto.texto', 'Versión dos.')
            ->assertJsonPath('conflicto.por', $otra->name);
        $this->assertSame('Versión dos.', DB::table('boletines')->value('texto'));

        // «Dejar el mío»: sin versión, se guarda.
        $this->actingAs($una)->putJson("/boletines/{$m}/{$this->periodo1}", ['texto' => 'Versión tres.'])->assertOk()->assertJsonPath('version', '3');
        $this->assertSame('Versión tres.', DB::table('boletines')->value('texto'));
    }

    public function test_una_pagina_vieja_de_la_misma_persona_tampoco_pisa()
    {
        // Volver con «Atrás» o una segunda pestaña: la misma docente, con la versión con que se abrió.
        $docente = $this->usuario('docente', [$this->sedeA]);
        $m = $this->mat['Ejemplo Dos Luis'];
        $this->actingAs($docente)->putJson("/boletines/{$m}/{$this->periodo1}", ['texto' => 'Lo nuevo y largo.', 'version' => null])->assertOk();

        // La página vieja lo veía vacío (versión nula).
        $this->actingAs($docente)
            ->putJson("/boletines/{$m}/{$this->periodo1}", ['texto' => 'Lo viejo.', 'version' => null])
            ->assertStatus(409)
            ->assertJsonPath('conflicto.texto', 'Lo nuevo y largo.')
            ->assertJsonPath('conflicto.version', '1');
        $this->assertSame('Lo nuevo y largo.', DB::table('boletines')->value('texto'));
    }

    public function test_la_pagina_trae_la_version_de_cada_texto()
    {
        $admin = $this->usuario('administrador');
        $m = $this->mat['Prueba Uno Ana María'];
        $this->actingAs($admin)->putJson("/boletines/{$m}/{$this->periodo1}", ['texto' => 'Uno.'])->assertOk();
        $this->actingAs($admin)->putJson("/boletines/{$m}/{$this->periodo1}", ['texto' => 'Dos.'])->assertOk();

        $this->actingAs($admin)
            ->get("/boletines?grupo={$this->grupos['0-1']}&periodo={$this->periodo1}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('estudiantes.1.texto', 'Dos.')
                ->where('estudiantes.1.version', '2')
                ->where('estudiantes.0.version', null)
                ->etc());
    }

    public function test_muy_largo_no_se_guarda()
    {
        $this->actingAs($this->usuario('administrador'))
            ->putJson("/boletines/{$this->mat['Ejemplo Dos Luis']}/{$this->periodo1}", ['texto' => str_repeat('a', 12001)])
            ->assertStatus(422);
    }

    public function test_firmas_y_jornada_las_fija_coordinacion_y_no_el_docente()
    {
        $directora = $this->usuario('docente', [$this->sedeA]);
        $directora->update(['name' => 'Maria Eunices Prueba Ortiz']);
        $coordinadora = $this->usuario('coordinacion', [$this->sedeA]);
        $coordinadora->update(['name' => 'Betty Prueba Chavez']);
        $grupo = $this->grupos['0-1'];
        $datos = ['director_id' => $directora->id, 'coordinador_id' => $coordinadora->id, 'jornada_boletin' => 'Unica de 6:45AM a 12:00PM'];

        $this->actingAs($directora)->put("/boletines/grupos/{$grupo}", $datos)->assertForbidden();
        $this->actingAs($coordinadora)->put("/boletines/grupos/{$grupo}", $datos)->assertRedirect();

        // El director queda como docente del grupo (también sale en Estudiantes) y el coordinador en la sede.
        $this->assertSame($directora->id, (int) DB::table('docentes')->where('id', DB::table('grupos')->where('id', $grupo)->value('director_id'))->value('user_id'));
        $this->assertSame($coordinadora->id, (int) DB::table('sedes')->where('id', $this->sedeA)->value('coordinador_id'));

        $g = Boletines::datosGrupo($grupo);
        $this->assertSame('MARIA EUNICES PRUEBA ORTIZ', $g->director);
        $this->assertSame('BETTY PRUEBA CHAVEZ', $g->coordinador);
        $this->assertSame('UNICA DE 6:45AM A 12:00PM', $g->jornada);

        // Otra vez el mismo director: no se duplica el docente.
        $this->actingAs($coordinadora)->put("/boletines/grupos/{$grupo}", $datos)->assertRedirect();
        $this->assertDatabaseCount('docentes', 1);

        // Primero no tiene boletín: no se configura.
        $this->actingAs($coordinadora)->put("/boletines/grupos/{$this->grupos['1-1']}", $datos)->assertNotFound();
    }

    public function test_firmantes_solo_de_la_sede_y_solo_en_el_año_en_curso()
    {
        $coordinadora = $this->usuario('coordinacion', [$this->sedeA]);
        $deLaSede = $this->usuario('docente', [$this->sedeA]);
        $deOtra = $this->usuario('docente', [$this->sedeB]);
        $inactivo = $this->usuario('docente', [$this->sedeA]);
        $inactivo->update(['activo' => false]);
        $grupo = $this->grupos['0-1'];

        // La lista para elegir: los de la sede (y quien ve todas), no los de otra sede ni los inactivos.
        $this->actingAs($coordinadora)->get("/boletines?grupo={$grupo}")->assertInertia(fn (Assert $page) => $page
            ->where('usuarios', fn ($u) => ($ids = collect($u)->pluck('id'))->contains($deLaSede->id) && $ids->contains($coordinadora->id)
                && ! $ids->contains($deOtra->id) && ! $ids->contains($inactivo->id))
            ->etc());

        $this->actingAs($coordinadora)->put("/boletines/grupos/{$grupo}", ['director_id' => $deOtra->id])->assertSessionHasErrors('director_id');
        $this->actingAs($coordinadora)->put("/boletines/grupos/{$grupo}", ['coordinador_id' => $inactivo->id])->assertSessionHasErrors('coordinador_id');
        $this->actingAs($coordinadora)->put("/boletines/grupos/{$grupo}", ['director_id' => $deLaSede->id])->assertSessionHasNoErrors();

        // Un grupo de transición de un año cerrado no se toca.
        DB::table('anios_lectivos')->where('id', $this->anio)->update(['estado' => 'cerrado']);
        $this->actingAs($coordinadora)->put("/boletines/grupos/{$grupo}", ['director_id' => null])->assertNotFound();
        $this->assertNotNull(DB::table('grupos')->where('id', $grupo)->value('director_id'));
    }

    public function test_desde_la_ficha_de_otra_sede_no_ofrece_ni_abre_el_boletin()
    {
        // Un estudiante que estuvo antes en la sede A y ahora está en transición en la sede B.
        $id = DB::table('matriculas')->where('id', $this->mat['Otra Sede Cuatro'])->value('estudiante_id');
        $viejo = DB::table('anios_lectivos')->insertGetId(['anio' => 2025, 'estado' => 'cerrado']);
        DB::table('matriculas')->insert(['estudiante_id' => $id, 'anio_lectivo_id' => $viejo, 'grado_id' => DB::table('grados')->where('numero', 1)->value('id'), 'sede_id' => $this->sedeA, 'estado' => 'activo']);
        $deA = $this->usuario('secretaria', [$this->sedeA]);

        $this->actingAs($deA)->get("/estudiantes/{$id}")->assertInertia(fn (Assert $page) => $page->where('boletin', false)->etc());
        $this->actingAs($deA)->get("/boletines?ver={$id}")->assertNotFound();
    }

    public function test_imprimir_todos_trae_solo_los_que_tienen_texto()
    {
        $admin = $this->usuario('administrador');
        $this->actingAs($admin)->putJson("/boletines/{$this->mat['Prueba Uno Ana María']}/{$this->periodo1}", ['texto' => 'Muy bien.'])->assertOk();

        $this->actingAs($admin)
            ->get("/boletines/imprimir?grupo={$this->grupos['0-1']}&periodo={$this->periodo1}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('boletines/imprimir')
                ->has('estudiantes', 1)
                ->where('estudiantes.0.texto', 'Muy bien.')
                ->where('sinTexto', 1)
                ->where('periodo', 'PRIMER PERIODO 50%'));

        // Uno solo sale aunque esté vacío (para llenarlo a mano).
        $id = DB::table('matriculas')->where('id', $this->mat['Ejemplo Dos Luis'])->value('estudiante_id');
        $this->actingAs($admin)
            ->get("/boletines/imprimir?grupo={$this->grupos['0-1']}&periodo={$this->periodo1}&estudiante={$id}")
            ->assertInertia(fn (Assert $page) => $page->has('estudiantes', 1)->where('estudiantes.0.texto', '')->where('sinTexto', 0));

        // El periodo 3 no tiene porcentaje: no se ofrece.
        $this->actingAs($admin)->get("/boletines/imprimir?grupo={$this->grupos['0-1']}&periodo={$this->periodo3}")->assertNotFound();
    }

    public function test_la_ficha_dice_si_tiene_boletin()
    {
        $admin = $this->usuario('administrador');
        $transicion = DB::table('matriculas')->where('id', $this->mat['Ejemplo Dos Luis'])->value('estudiante_id');
        $primero = DB::table('matriculas')->where('id', $this->mat['Primero Cinco Juan'])->value('estudiante_id');

        $this->actingAs($admin)->get("/estudiantes/{$transicion}")->assertInertia(fn (Assert $page) => $page->where('boletin', true)->etc());
        $this->actingAs($admin)->get("/estudiantes/{$primero}")->assertInertia(fn (Assert $page) => $page->where('boletin', false)->etc());
    }

    public function test_limpiar_parrafos()
    {
        $this->assertSame("Uno dos.\nTres.", BoletinController::limpiar("Uno   dos.\n\n\n   Tres.   "));
        $this->assertSame('', BoletinController::limpiar(" \n \r\n "));
    }

    public function test_etiqueta_del_periodo()
    {
        $this->assertSame('PRIMER PERIODO 50%', Boletines::etiquetaPeriodo(1, 50));
        $this->assertSame('SEGUNDO PERIODO', Boletines::etiquetaPeriodo(2, null));
    }
}
