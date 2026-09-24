<?php

namespace Tests\Feature;

use App\Models\SolicitudInscripcion;
use Database\Seeders\DatosIniciales;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InscripcionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Solo los catálogos que usa el formulario, tomados de los mismos JSON
        // que carga DatosInicialesSeeder (ids y nombres reales).
        foreach (['anios_lectivos', 'grados', 'parentescos'] as $tabla) {
            ['columnas' => $columnas, 'filas' => $filas] = json_decode(file_get_contents(DatosIniciales::archivo($tabla)), true);
            DB::table($tabla)->insert(array_map(fn ($fila) => array_combine($columnas, $fila), $filas));
        }
    }

    /** Un envío válido, tal como lo manda el formulario (con puntos y espacios en los números). */
    private function datos(array $cambios = []): array
    {
        return array_merge([
            'primer_nombre' => 'Sara',
            'segundo_nombre' => 'Lucía',
            'primer_apellido' => 'Gómez',
            'segundo_apellido' => 'Rentería',
            'sexo' => 'F',
            'pais_nacimiento' => 'Colombia',
            'pais_nacimiento_otro' => '',
            'ciudad_nacimiento' => 'Cali, Valle',
            'fecha_nacimiento' => '2014-03-12',
            'tipo_documento' => 'T.I.',
            'tipo_documento_otro' => '',
            'numero_documento' => '1.109.555.001',
            'ciudad_expedicion' => 'Cali',
            'grado_id' => (string) DB::table('grados')->where('numero', 7)->value('id'),
            'tipo_sangre' => 'O+',
            'sisben' => '1',
            'eps' => 'Emssanar',
            'grupo_etnico' => 'Afrocolombiano',
            'grupo_etnico_otro' => '',
            'discapacidad' => '',
            'direccion' => 'Calle 73 # 7M-18',
            'barrio' => 'Alfonso López',
            'telefono_1' => '300 123 4567',
            'telefono_2' => '3852436',
            'correo' => 'Familia.Gomez@Correo.com',
            'acudiente_primer_nombre' => 'Martha',
            'acudiente_segundo_nombre' => '',
            'acudiente_primer_apellido' => 'Rentería',
            'acudiente_segundo_apellido' => 'Mier',
            'acudiente_fecha_nacimiento' => '1986-07-02',
            'acudiente_numero_documento' => '67038408',
            'acudiente_ciudad_expedicion' => 'Cali',
            'acudiente_parentesco' => 'Madre',
            'acudiente_parentesco_otro' => '',
            'acudiente_telefono_1' => '318 718 4003',
            'acudiente_telefono_2' => '3852436',
            'acudiente_correo' => '',
            'autorizacion_datos' => true,
            'sitio_web' => '',
        ], $cambios);
    }

    public function test_el_formulario_es_publico_y_trae_los_catalogos()
    {
        $this->get('/inscripcion')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('inscripcion/create')
                ->where('anioLectivo', 2026)
                ->has('grados', 12)
                ->has('parentescos', 9));
    }

    public function test_guarda_la_inscripcion_como_solicitud_pendiente()
    {
        $this->post('/inscripcion', $this->datos())
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame(1, SolicitudInscripcion::count());
        $solicitud = SolicitudInscripcion::first();

        $this->assertSame(SolicitudInscripcion::PENDIENTE, $solicitud->estado);
        $this->assertSame((int) DB::table('anios_lectivos')->where('anio', 2026)->value('id'), $solicitud->anio_lectivo_id);
        $this->assertSame('Sara', $solicitud->primer_nombre);
        $this->assertSame('Colombia', $solicitud->pais_nacimiento);
        $this->assertSame('2014-03-12', $solicitud->fecha_nacimiento->format('Y-m-d'));
        $this->assertSame('1109555001', $solicitud->numero_documento, 'el documento se guarda sin puntos');
        $this->assertNull($solicitud->tipo_documento_otro);
        $this->assertSame((int) $this->datos()['grado_id'], $solicitud->grado_id);
        $this->assertSame('3001234567', $solicitud->telefono_1, 'el teléfono se guarda sin espacios');
        $this->assertSame('familia.gomez@correo.com', $solicitud->correo);
        $this->assertNull($solicitud->discapacidad, 'un opcional vacío queda en NULL, no en ""');
        $this->assertSame((int) DB::table('parentescos')->where('nombre', 'Madre')->value('id'), $solicitud->acudiente_parentesco_id);
        $this->assertNull($solicitud->acudiente_correo);
        $this->assertNotNull($solicitud->autorizo_datos_en);
        $this->assertSame('127.0.0.1', $solicitud->ip);

        // Una solicitud no toca los registros oficiales hasta que se apruebe.
        $this->assertSame(0, DB::table('estudiantes')->count());
        $this->assertSame(0, DB::table('acudientes')->count());
        $this->assertSame(0, DB::table('matriculas')->count());
    }

    public function test_resuelve_las_opciones_otro_y_descarta_el_texto_que_sobro()
    {
        $this->post('/inscripcion', $this->datos([
            'pais_nacimiento' => 'Otro',
            'pais_nacimiento_otro' => 'Venezuela',
            'tipo_documento' => 'Otro',
            'tipo_documento_otro' => 'Pasaporte',
            'grupo_etnico' => 'Otro',
            'grupo_etnico_otro' => 'Raizal',
            'acudiente_parentesco' => 'Otro',
            'acudiente_parentesco_otro' => 'Padrino',
        ]))->assertSessionHasNoErrors();

        $otra = SolicitudInscripcion::sole();
        $this->assertSame('Venezuela', $otra->pais_nacimiento);
        $this->assertSame('Otro', $otra->tipo_documento);
        $this->assertSame('Pasaporte', $otra->tipo_documento_otro);
        $this->assertSame('Raizal', $otra->grupo_etnico);
        $this->assertSame((int) DB::table('parentescos')->where('nombre', 'Otro')->value('id'), $otra->acudiente_parentesco_id);
        $this->assertSame('Padrino', $otra->acudiente_parentesco_otro);
    }

    public function test_si_cambio_de_opcion_no_se_guarda_lo_que_escribio_en_otro()
    {
        // Eligió "Otro", escribió, y luego volvió a "Colombia" / "Madre":
        // el formulario conserva el texto, pero no debe llegar a la base.
        $this->post('/inscripcion', $this->datos([
            'pais_nacimiento_otro' => 'Venezuela',
            'tipo_documento_otro' => 'Pasaporte',
            'acudiente_parentesco_otro' => 'Padrino',
        ]))->assertSessionHasNoErrors();

        $solicitud = SolicitudInscripcion::sole();
        $this->assertSame('Colombia', $solicitud->pais_nacimiento);
        $this->assertNull($solicitud->tipo_documento_otro);
        $this->assertNull($solicitud->acudiente_parentesco_otro);
    }

    public function test_no_acepta_otra_solicitud_pendiente_del_mismo_documento()
    {
        $this->post('/inscripcion', $this->datos())->assertSessionHasNoErrors();

        $this->post('/inscripcion', $this->datos())
            ->assertSessionHasErrors(['numero_documento' => 'Ya recibimos una inscripción con este documento y está en revisión. La secretaría se comunicará contigo.']);

        $this->assertSame(1, SolicitudInscripcion::count());
    }

    public function test_si_la_solicitud_fue_rechazada_puede_volver_a_inscribirse()
    {
        $this->post('/inscripcion', $this->datos())->assertSessionHasNoErrors();
        SolicitudInscripcion::query()->update(['estado' => SolicitudInscripcion::RECHAZADA]);

        $this->post('/inscripcion', $this->datos())->assertSessionHasNoErrors();

        $this->assertSame(2, SolicitudInscripcion::count());
    }

    public function test_el_campo_trampa_no_guarda_nada()
    {
        $this->post('/inscripcion', $this->datos(['sitio_web' => 'https://spam.example']))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame(0, SolicitudInscripcion::count());
    }

    public function test_nadie_puede_enviar_una_solicitud_ya_aprobada()
    {
        $this->post('/inscripcion', $this->datos(['estado' => 'aprobada']))->assertSessionHasNoErrors();

        $this->assertSame(SolicitudInscripcion::PENDIENTE, SolicitudInscripcion::sole()->estado);
    }

    public function test_los_datos_invalidos_no_se_guardan()
    {
        $this->post('/inscripcion', $this->datos([
            'autorizacion_datos' => false,
            'fecha_nacimiento' => '12/03/2014',
            'correo' => 'no-es-correo',
            'acudiente_parentesco' => 'Vecino',
            'grado_id' => '999',
        ]))->assertSessionHasErrors(['autorizacion_datos', 'fecha_nacimiento', 'correo', 'acudiente_parentesco', 'grado_id']);

        $this->assertSame(0, SolicitudInscripcion::count());
    }

    public function test_la_fecha_de_la_autorizacion_no_cambia_al_revisar_la_solicitud()
    {
        $this->travelTo('2026-09-23 10:00:00');
        $this->post('/inscripcion', $this->datos())->assertSessionHasNoErrors();

        // Días después la secretaría la aprueba: la constancia debe seguir diciendo
        // el día 23. Un UPDATE cualquiera es lo que, con una columna TIMESTAMP,
        // habría reescrito la fecha en MariaDB.
        $this->travelTo('2026-10-01 15:30:00');
        DB::table('solicitudes_inscripcion')->update(['estado' => SolicitudInscripcion::APROBADA]);

        $this->assertSame('2026-09-23 10:00:00', SolicitudInscripcion::sole()->autorizo_datos_en->format('Y-m-d H:i:s'));
    }
}
