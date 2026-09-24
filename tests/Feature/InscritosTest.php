<?php

namespace Tests\Feature;

use App\Models\SolicitudInscripcion;
use App\Models\User;
use Database\Seeders\DatosIniciales;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InscritosTest extends TestCase
{
    use RefreshDatabase;

    private SolicitudInscripcion $solicitud;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['anios_lectivos', 'grados', 'parentescos'] as $tabla) {
            ['columnas' => $columnas, 'filas' => $filas] = json_decode(file_get_contents(DatosIniciales::archivo($tabla)), true);
            DB::table($tabla)->insert(array_map(fn ($fila) => array_combine($columnas, $fila), $filas));
        }

        // La solicitud entra por el formulario público, igual que en producción.
        $this->post('/inscripcion', [
            'primer_nombre' => 'Sara', 'segundo_nombre' => '', 'primer_apellido' => 'Gómez', 'segundo_apellido' => 'Rentería',
            'sexo' => 'F', 'pais_nacimiento' => 'Colombia', 'ciudad_nacimiento' => 'Cali', 'fecha_nacimiento' => '2014-03-12',
            'tipo_documento' => 'T.I.', 'numero_documento' => '1109555001', 'ciudad_expedicion' => 'Cali',
            'grado_id' => (string) DB::table('grados')->where('numero', 7)->value('id'),
            'tipo_sangre' => 'O+', 'sisben' => '1', 'eps' => 'Emssanar', 'grupo_etnico' => 'Mestizo', 'discapacidad' => '',
            'direccion' => 'Calle 73 # 7M-18', 'barrio' => 'Alfonso López', 'telefono_1' => '3001234567', 'telefono_2' => '3852436',
            'correo' => 'familia@correo.com',
            'acudiente_primer_nombre' => 'Martha', 'acudiente_segundo_nombre' => '', 'acudiente_primer_apellido' => 'Rentería',
            'acudiente_segundo_apellido' => 'Mier', 'acudiente_fecha_nacimiento' => '1986-07-02', 'acudiente_numero_documento' => '67038408',
            'acudiente_ciudad_expedicion' => 'Cali', 'acudiente_parentesco' => 'Madre', 'acudiente_telefono_1' => '3187184003',
            'acudiente_telefono_2' => '3852436', 'acudiente_correo' => '', 'autorizacion_datos' => true,
        ])->assertSessionHasNoErrors();

        $this->solicitud = SolicitudInscripcion::firstOrFail();
    }

    /** Madre = la acudiente (datos copiados); padre sin datos conocidos. */
    private function padres(array $madre = [], array $padre = []): array
    {
        return [
            'madre' => array_merge([
                'situacion' => 'registrado', 'es_acudiente' => true,
                'primer_nombre' => 'Martha', 'segundo_nombre' => '', 'primer_apellido' => 'Rentería', 'segundo_apellido' => 'Mier',
                'tipo_documento' => 'C.C.', 'numero_documento' => '67.038.408', 'fecha_nacimiento' => '1986-07-02',
                'telefono' => '318 718 4003', 'correo' => '', 'ocupacion' => 'Comerciante',
            ], $madre),
            'padre' => array_merge([
                'situacion' => 'desconocido', 'es_acudiente' => true, 'primer_nombre' => 'Quedó escrito',
            ], $padre),
        ];
    }

    public function test_solo_con_sesion()
    {
        $this->get('/inscritos')->assertRedirect('/login');
        $this->put("/inscritos/{$this->solicitud->id}/padres", $this->padres())->assertRedirect('/login');
        $this->assertDatabaseCount('padres', 0);
    }

    public function test_la_lista_muestra_los_pendientes_y_el_menu_los_cuenta()
    {
        $this->actingAs(User::factory()->create())
            ->get('/inscritos')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('inscritos/index')
                ->where('estado', 'pendiente')
                ->where('inscritosPendientes', 1)
                ->has('inscritos', 1)
                ->where('inscritos.0.primer_nombre', 'Sara')
                ->where('inscritos.0.parentesco', 'Madre')
                ->where('inscritos.0.padres', []));
    }

    public function test_la_lista_trae_la_ficha_lateral_del_elegido()
    {
        $usuario = User::factory()->create();

        // Sin ?ver= no hay ficha; con ?ver= llega la misma que en la página del inscrito.
        $this->actingAs($usuario)
            ->get('/inscritos')
            ->assertInertia(fn (Assert $page) => $page->where('detalle', null)->where('inscritos.0.grado_numero', 7));

        $this->actingAs($usuario)
            ->get("/inscritos?ver={$this->solicitud->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('inscritos/index')
                ->where('detalle.solicitud.id', $this->solicitud->id)
                ->where('detalle.solicitud.acudiente_parentesco', 'Madre')
                ->where('detalle.padres', []));
    }

    public function test_la_ficha_trae_los_datos_del_formulario()
    {
        $this->actingAs(User::factory()->create())
            ->get("/inscritos/{$this->solicitud->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('inscritos/show')
                ->where('solicitud.acudiente_parentesco', 'Madre')
                ->where('solicitud.acudiente_fecha_nacimiento', '1986-07-02')
                ->where('solicitud.grado', DB::table('grados')->where('numero', 7)->value('nombre'))
                ->where('padres', []));
    }

    public function test_guarda_madre_y_padre_y_se_puede_corregir()
    {
        $usuario = User::factory()->create();

        $this->actingAs($usuario)
            ->put("/inscritos/{$this->solicitud->id}/padres", $this->padres())
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->assertDatabaseHas('padres', [
            'solicitud_inscripcion_id' => $this->solicitud->id,
            'parentesco' => 'madre',
            'situacion' => 'registrado',
            'es_acudiente' => true,
            'numero_documento' => '67038408', // sin puntos
            'telefono' => '3187184003',
            'ocupacion' => 'Comerciante',
            'registrado_por' => $usuario->id,
        ]);
        // "Desconocido" no guarda nombre ni queda como acudiente aunque lo envíen.
        $this->assertDatabaseHas('padres', [
            'parentesco' => 'padre', 'situacion' => 'desconocido', 'es_acudiente' => false, 'primer_nombre' => null,
        ]);

        // Guardar otra vez corrige, no duplica.
        $this->actingAs($usuario)->put("/inscritos/{$this->solicitud->id}/padres", $this->padres(padre: [
            'situacion' => 'registrado', 'es_acudiente' => false,
            'primer_nombre' => 'Carlos', 'primer_apellido' => 'Gómez', 'telefono' => '3100000000',
        ]))->assertSessionHasNoErrors();

        $this->assertDatabaseCount('padres', 2);
        $this->assertDatabaseHas('padres', ['parentesco' => 'padre', 'situacion' => 'registrado', 'primer_nombre' => 'Carlos']);

        $this->actingAs($usuario)->get('/inscritos')
            ->assertInertia(fn (Assert $page) => $page->where('inscritos.0.padres', ['madre', 'padre']));
    }

    public function test_con_datos_exige_nombre_y_apellido()
    {
        $this->actingAs(User::factory()->create())
            ->put("/inscritos/{$this->solicitud->id}/padres", $this->padres(madre: [
                'es_acudiente' => false, 'primer_nombre' => '', 'primer_apellido' => '', 'numero_documento' => '12',
            ]))
            ->assertSessionHasErrors(['madre.primer_nombre', 'madre.primer_apellido', 'madre.numero_documento']);

        $this->assertDatabaseCount('padres', 0);
    }

    /** Dos grupos de Séptimo (el grado que pidió la familia) y uno de Octavo, en el año activo. */
    private function grupos(): array
    {
        foreach (['instituciones', 'sedes'] as $tabla) {
            ['columnas' => $columnas, 'filas' => $filas] = json_decode(file_get_contents(DatosIniciales::archivo($tabla)), true);
            DB::table($tabla)->insert(array_map(fn ($fila) => array_combine($columnas, $fila), $filas));
        }
        $anio = SolicitudInscripcion::anioLectivoActivoId();
        $sede = DB::table('sedes')->value('id');
        $grado = fn (int $numero) => DB::table('grados')->where('numero', $numero)->value('id');
        $grupo = fn (int $numero, int $n) => DB::table('grupos')->insertGetId([
            'anio_lectivo_id' => $anio, 'sede_id' => $sede, 'grado_id' => $grado($numero), 'numero' => $n,
            'codigo' => "{$numero}-{$n}", 'jornada' => 'Mañana', 'cupos_proyectados' => 34,
        ]);

        return ['7-1' => $grupo(7, 1), '7-2' => $grupo(7, 2), '8-1' => $grupo(8, 1)];
    }

    public function test_guardar_los_padres_lleva_a_elegir_el_grupo()
    {
        $this->actingAs(User::factory()->create())
            ->put("/inscritos/{$this->solicitud->id}/padres", $this->padres())
            ->assertRedirect("/inscritos/{$this->solicitud->id}/grupo");
    }

    public function test_el_paso_del_grupo_muestra_los_grupos_del_grado_con_su_ocupacion()
    {
        $this->grupos();

        $this->actingAs(User::factory()->create())
            ->get("/inscritos/{$this->solicitud->id}/grupo")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('inscritos/grupo')
                ->where('gradoNumero', 7)
                ->has('grupos', 2)
                ->where('grupos.0.codigo', '7-1')
                ->where('grupos.0.cupos', 34)
                ->where('matricula', null));
    }

    public function test_matricular_crea_el_estudiante_el_acudiente_y_la_matricula()
    {
        $grupos = $this->grupos();
        $usuario = User::factory()->create();
        $this->actingAs($usuario)->put("/inscritos/{$this->solicitud->id}/padres", $this->padres());

        $this->actingAs($usuario)
            ->post("/inscritos/{$this->solicitud->id}/matricular", ['grupo_id' => $grupos['7-2']])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/inscritos');

        $estudiante = DB::table('estudiantes')->where('numero_documento', '1109555001')->first();
        $this->assertSame('Gómez Rentería Sara', $estudiante->nombre_completo);
        $this->assertSame('Emssanar', $estudiante->eps);

        $matricula = DB::table('matriculas')->where('estudiante_id', $estudiante->id)->first();
        $this->assertSame($grupos['7-2'], (int) $matricula->grupo_id);
        $this->assertSame('nuevo', $matricula->condicion);
        $this->assertSame('activo', $matricula->estado);

        $acudiente = DB::table('acudientes')->where('numero_documento', '67038408')->first();
        $this->assertSame('Martha Rentería Mier', $acudiente->nombre_completo);
        $this->assertDatabaseHas('estudiante_acudiente', [
            'estudiante_id' => $estudiante->id, 'acudiente_id' => $acudiente->id,
            'parentesco_id' => DB::table('parentescos')->where('nombre', 'Madre')->value('id'), 'es_principal' => true,
        ]);
        $this->assertSame(2, DB::table('padres')->where('estudiante_id', $estudiante->id)->count());
        $this->assertDatabaseHas('barrios', ['nombre' => 'Alfonso López']);

        $solicitud = $this->solicitud->fresh();
        $this->assertSame(SolicitudInscripcion::APROBADA, $solicitud->estado);
        $this->assertSame($matricula->id, (int) $solicitud->matricula_id);
        $this->assertSame($usuario->id, (int) $solicitud->revisada_por);

        // La ficha del inscrito ya dice dónde quedó.
        $this->actingAs($usuario)
            ->get("/inscritos/{$this->solicitud->id}")
            ->assertInertia(fn (Assert $page) => $page->where('matricula.grupo', '7-2'));
    }

    public function test_no_se_matricula_sin_padres_en_otro_grado_ni_dos_veces()
    {
        $grupos = $this->grupos();
        $usuario = User::factory()->create();
        $matricular = fn (int $grupo) => $this->actingAs($usuario)->post("/inscritos/{$this->solicitud->id}/matricular", ['grupo_id' => $grupo]);

        $matricular($grupos['7-1'])->assertSessionHasErrors(['grupo_id' => 'Primero completa los datos de la madre y el padre.']);

        $this->actingAs($usuario)->put("/inscritos/{$this->solicitud->id}/padres", $this->padres());
        $matricular($grupos['8-1'])->assertSessionHasErrors(['grupo_id' => 'Ese grupo no es del grado que pidió la familia.']);
        $this->assertDatabaseCount('matriculas', 0);

        $matricular($grupos['7-1'])->assertSessionHasNoErrors();
        $matricular($grupos['7-2'])->assertSessionHasErrors(['grupo_id' => 'Esta inscripción ya fue revisada.']);
        $this->assertDatabaseCount('matriculas', 1);
    }
}
