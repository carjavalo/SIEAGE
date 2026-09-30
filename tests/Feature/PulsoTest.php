<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Support\Pulso;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** El «tiempo real» del panel: lo que cambian otros se nota sin recargar. */
class PulsoTest extends TestCase
{
    use RefreshDatabase;

    private User $secretaria;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatosInicialesSeeder::class);
        $this->secretaria = User::factory()->create(['rol_id' => Rol::where('nombre', 'secretaria')->value('id')]);
    }

    /** Una familia envía el formulario público de inscripción. */
    private function inscribir(): void
    {
        $this->post('/inscripcion', [
            'primer_nombre' => 'Ana', 'segundo_nombre' => '', 'primer_apellido' => 'Prueba', 'segundo_apellido' => 'Uno', 'sexo' => 'F',
            'pais_nacimiento' => 'Colombia', 'pais_nacimiento_otro' => '', 'ciudad_nacimiento' => 'Cali, Valle', 'fecha_nacimiento' => '2014-03-12',
            'tipo_documento' => 'T.I.', 'tipo_documento_otro' => '', 'numero_documento' => '99000222', 'ciudad_expedicion' => 'Cali',
            'grado_id' => (string) DB::table('grados')->where('numero', 7)->value('id'), 'jornada' => 'Mañana', 'tipo_sangre' => 'O+', 'sisben' => '1', 'eps' => 'Prueba',
            'grupo_etnico' => 'Mestizo', 'grupo_etnico_otro' => '', 'discapacidad' => '', 'direccion' => 'Calle 1 # 2-3', 'barrio' => 'Prueba',
            'telefono_1' => '3005550101', 'telefono_2' => '3005550102', 'correo' => 'prueba@correo.com',
            'acudiente_primer_nombre' => 'Rosa', 'acudiente_segundo_nombre' => '', 'acudiente_primer_apellido' => 'Prueba', 'acudiente_segundo_apellido' => '',
            'acudiente_fecha_nacimiento' => '1986-07-02', 'acudiente_numero_documento' => '99000333', 'acudiente_ciudad_expedicion' => 'Cali',
            'acudiente_parentesco' => 'Madre', 'acudiente_parentesco_otro' => '', 'acudiente_misma_direccion' => true, 'acudiente_telefono_1' => '3005550101',
            'acudiente_telefono_2' => '3005550102', 'acudiente_correo' => '', 'autorizacion_datos' => true,
        ])->assertSessionHasNoErrors();
    }

    public function test_el_pulso_solo_con_sesion_y_viaja_en_cada_pagina()
    {
        $this->getJson('/pulso')->assertUnauthorized();

        $this->actingAs($this->secretaria)->getJson('/pulso')
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertJsonStructure(['inscritos', 'datos', 'pendientes', 'ultima_inscripcion']);

        // La página trae la misma firma que en ese instante da /pulso: si nada cambia, el navegador no recarga nada.
        $this->actingAs($this->secretaria)->get('/sedes')
            ->assertInertia(fn (Assert $page) => $page->where('pulso', Pulso::firma()));
        // Sin sesión (la página de ingreso) no se manda.
        auth()->logout();
        $this->get('/login')->assertInertia(fn (Assert $page) => $page->where('pulso', null));
    }

    public function test_una_inscripcion_nueva_cambia_la_firma_de_inscritos_y_no_la_de_datos()
    {
        $antes = Pulso::firma();

        $this->inscribir();
        $despues = Pulso::firma();

        $this->assertNotSame($antes['inscritos'], $despues['inscritos']);
        $this->assertSame($antes['datos'], $despues['datos']);
        $this->assertSame($antes['pendientes'] + 1, $despues['pendientes']);
        $this->assertGreaterThan($antes['ultima_inscripcion'], $despues['ultima_inscripcion']);

        // Lo que pide el navegador al notarlo: solo el número del menú y la firma nueva, sin rearmar la página.
        $this->actingAs($this->secretaria)->get('/estudiantes')
            ->assertInertia(fn (Assert $page) => $page->reloadOnly(['pulso', 'inscritosPendientes'], fn (Assert $parcial) => $parcial
                ->where('inscritosPendientes', $despues['pendientes'])
                ->where('pulso.inscritos', $despues['inscritos'])
                ->missing('estudiantes')));

        // En Inscritos, además, la lista con la que acaba de llegar.
        $this->actingAs($this->secretaria)->get('/inscritos')
            ->assertInertia(fn (Assert $page) => $page->reloadOnly(['pulso', 'inscritosPendientes', 'conteos', 'inscritos', 'detalle'], fn (Assert $parcial) => $parcial
                ->where('conteos.pendiente', $despues['pendientes'])
                ->has('inscritos', $despues['pendientes'])
                ->where('inscritos.0.numero_documento', '99000222')));
    }

    public function test_lo_que_cambia_un_companero_cambia_la_firma_de_datos()
    {
        $matricula = DB::table('matriculas as m')->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->where('al.estado', 'activo')->where('m.estado', 'activo')->first(['m.id', 'm.estudiante_id', 'm.grupo_id']);
        $firma = Pulso::firma();
        $cambio = function (string $que) use (&$firma) {
            $nueva = Pulso::firma();
            $this->assertNotSame($firma['datos'], $nueva['datos'], "No se notó: {$que}");
            $this->assertSame($firma['inscritos'], $nueva['inscritos'], "Movió la firma de inscritos: {$que}");
            $firma = $nueva;
        };

        // Los cambios llevan fecha con segundos: se adelanta el reloj como pasaría entre dos personas.
        $this->travel(5)->seconds();
        $this->actingAs($this->secretaria)->post("/estudiantes/{$matricula->estudiante_id}/deshabilitar", ['motivo' => 'retiro', 'razon' => 'Se mudó de ciudad.', 'fecha' => now()->toDateString()]);
        $cambio('retirar a un estudiante');

        $this->travel(5)->seconds();
        $this->actingAs($this->secretaria)->put('/grupos/cupos', ['cupos' => [$matricula->grupo_id => 41]]);
        $cambio('cambiar un cupo');

        $this->travel(5)->seconds();
        $this->actingAs($this->secretaria)->post('/sedes', ['nombre' => 'Sede de Prueba', 'codigo' => 'SP']);
        $cambio('crear una sede');

        $acudiente = DB::table('estudiante_acudiente')->where('estudiante_id', $matricula->estudiante_id)->value('acudiente_id');
        $this->travel(5)->seconds();
        DB::table('estudiante_acudiente')->where('estudiante_id', $matricula->estudiante_id)->update(['parentesco_otro' => null]);
        DB::table('acudientes')->where('id', $acudiente)->update(['direccion' => 'Carrera 9 # 9-99', 'updated_at' => now()]);
        $cambio('corregir a un acudiente');
    }
}
