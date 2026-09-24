<?php

namespace Tests\Feature;

use App\Models\SolicitudInscripcion;
use Carbon\Carbon;
use Database\Seeders\DatosIniciales;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
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
        ], $cambios);
    }

    public function test_el_formulario_es_publico_y_trae_los_catalogos()
    {
        // En otro año del calendario: si la consulta del año activo fallara, el
        // valor de respaldo date('Y') daría 2031 y la prueba lo notaría.
        $this->travelTo('2031-03-01');

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

    public function test_un_documento_repetido_se_guarda_y_no_revela_nada()
    {
        // La familia real y un tercero envían el mismo documento de estudiante:
        // se guardan los dos, para que la secretaría los compare, y ninguno
        // queda bloqueado por el otro.
        $this->post('/inscripcion', $this->datos())->assertSessionHasNoErrors();
        $this->post('/inscripcion', $this->datos(['acudiente_numero_documento' => '31999888']))->assertSessionHasNoErrors();

        $this->assertSame(2, SolicitudInscripcion::where('numero_documento', '1109555001')->count());
    }

    public function test_un_envio_incompleto_no_permite_averiguar_si_un_nino_tiene_solicitud()
    {
        // Sondeo: solo el documento del niño. La respuesta debe ser idéntica
        // haya o no una solicitud en curso con ese documento.
        $sondeo = ['numero_documento' => '1109555001', 'acudiente_numero_documento' => '12345'];

        $sinSolicitud = $this->post('/inscripcion', $sondeo)->assertSessionHasErrors()->baseResponse->getSession()->get('errors')->keys();

        $this->post('/inscripcion', $this->datos())->assertSessionHasNoErrors();
        $this->flushSession();

        $conSolicitud = $this->post('/inscripcion', $sondeo)->assertSessionHasErrors()->baseResponse->getSession()->get('errors')->keys();

        $this->assertSame($sinSolicitud, $conSolicitud);
        $this->assertNotContains('numero_documento', $conSolicitud);
    }

    public function test_acepta_nombres_con_apostrofo_del_iphone_y_tildes_separadas()
    {
        $this->post('/inscripcion', $this->datos([
            'primer_nombre' => "Jose\u{0301}",     // "José" pegado con la tilde separada (NFD)
            'primer_apellido' => 'D’Costa',          // apóstrofo tipográfico del iPhone
            'segundo_apellido' => 'D´Andreis',       // tilde aguda de teclados latinos
        ]))->assertSessionHasNoErrors();

        $solicitud = SolicitudInscripcion::sole();
        $this->assertSame('José', $solicitud->primer_nombre);
        $this->assertSame("D'Costa", $solicitud->primer_apellido);
        $this->assertSame("D'Andreis", $solicitud->segundo_apellido);
    }

    public function test_un_nombre_sin_ninguna_letra_se_rechaza()
    {
        $this->post('/inscripcion', $this->datos(['primer_apellido' => '-']))
            ->assertSessionHasErrors(['primer_apellido' => 'Usa solo letras.']);
    }

    public function test_el_texto_oculto_de_otro_no_bloquea_el_envio()
    {
        // Escribió un texto largo en "¿cuál?" y luego eligió otra opción: el
        // campo queda oculto con el texto adentro y no debe dar un error invisible.
        $this->post('/inscripcion', $this->datos([
            'tipo_documento' => 'C.E.',
            'tipo_documento_otro' => str_repeat('x', 50),
        ]))->assertSessionHasNoErrors();

        $this->assertNull(SolicitudInscripcion::sole()->tipo_documento_otro);

        // Si la opción sí es "Otro", el largo se valida.
        $this->post('/inscripcion', $this->datos([
            'numero_documento' => '1109555002',
            'tipo_documento' => 'Otro',
            'tipo_documento_otro' => str_repeat('x', 50),
        ]))->assertSessionHasErrors(['tipo_documento_otro']);
    }

    public function test_el_sisben_enviado_como_numero_se_rechaza()
    {
        // En MariaDB, el número 2 en un ENUM es la posición 2 y se guardaría '1'.
        $this->postJson('/inscripcion', $this->datos(['sisben' => 2]))
            ->assertJsonValidationErrors(['sisben']);

        $this->assertSame(0, SolicitudInscripcion::count());
    }

    public function test_el_largo_del_correo_se_mide_ya_en_minusculas()
    {
        // 120 caracteres con una "İ" turca: en minúsculas pasa a 121, más que la
        // columna. Debe ser un error de validación, no un fallo de la base.
        $correo = 'İ'.str_repeat('a', 108).'@correo.com';
        $this->assertSame(120, mb_strlen($correo));

        $this->post('/inscripcion', $this->datos(['correo' => $correo]))
            ->assertSessionHasErrors(['correo']);
    }

    public function test_un_robot_que_envia_enseguida_no_guarda_nada()
    {
        $sello = fn () => Crypt::encryptString((string) now()->getTimestamp());

        // En el mismo segundo en que se abrió la página: un robot. Se le responde como si nada.
        $this->post('/inscripcion', $this->datos(['sello' => $sello()]))->assertRedirect()->assertSessionHasNoErrors();
        // Un sello inventado, también.
        $this->post('/inscripcion', $this->datos(['sello' => 'inventado']))->assertRedirect()->assertSessionHasNoErrors();
        $this->assertSame(0, SolicitudInscripcion::count());

        // Una persona tarda minutos. El autocompletado del navegador ya no puede
        // hacer que se pierda: no hay ningún campo escondido que llenar.
        $abierto = $sello();
        $this->travel(4)->minutes();
        $this->post('/inscripcion', $this->datos(['sello' => $abierto, 'sitio_web' => 'Calle 73 # 7M-18']))->assertSessionHasNoErrors();
        $this->assertSame(1, SolicitudInscripcion::count());
    }

    public function test_sin_sello_se_guarda_para_no_perder_inscripciones()
    {
        // Una pestaña abierta antes de que existiera el sello.
        $this->post('/inscripcion', $this->datos())->assertSessionHasNoErrors();

        $this->assertSame(1, SolicitudInscripcion::count());
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

    public function test_se_registra_con_la_hora_de_colombia()
    {
        // 03:30 del 24 en UTC son las 10:30 p. m. del 23 en Colombia. Con la app
        // en UTC, esta inscripción quedaba registrada al día siguiente.
        $this->travelTo(Carbon::parse('2026-09-24 03:30:00', 'UTC'));

        $this->post('/inscripcion', $this->datos())->assertSessionHasNoErrors();

        $solicitud = SolicitudInscripcion::sole();
        $this->assertSame('2026-09-23 22:30:00', $solicitud->autorizo_datos_en->format('Y-m-d H:i:s'));
        $this->assertSame('2026-09-23 22:30:00', $solicitud->created_at->format('Y-m-d H:i:s'));

        // Y lo que fecha la base (NOW(), CURRENT_TIMESTAMP) usa la misma hora.
        if (DB::getDriverName() !== 'sqlite') {
            $this->assertSame('-05:00', DB::selectOne('SELECT @@session.time_zone AS zona')->zona);
        }
    }

    public function test_la_fecha_de_la_autorizacion_no_cambia_al_revisar_la_solicitud()
    {
        // En SQLite una columna TIMESTAMP tampoco se actualiza sola, así que aquí
        // esta prueba pasaría aunque alguien cambiara dateTime() por timestamp().
        // Solo detecta ese error contra MariaDB:
        //   DB_CONNECTION=mysql DB_DATABASE=<base_de_prueba> php artisan test --filter=InscripcionTest
        if (DB::getDriverName() === 'sqlite') {
            $this->markTestSkipped('Solo detecta la regresión TIMESTAMP en MariaDB/MySQL.');
        }

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
