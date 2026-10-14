<?php

namespace Tests\Feature;

use App\Models\SolicitudInscripcion;
use App\Models\User;
use Database\Seeders\DatosIniciales;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

/** Importar el Excel de respuestas del formulario de inscripción de Google del colegio. */
class ImportarInscripcionesTest extends TestCase
{
    use RefreshDatabase;

    /** Los títulos tal como los exporta Google (los del acudiente, repetidos con « 2»). */
    private const TITULOS = [
        'Marca temporal', 'Actualmente estudia en la I.E Alfonso Lopez Pumarejo (sedes Central Provivienda, Rafael Pombo, Purificación Trujillo, Los Farallones o Principal)',
        'Primer Nombre', 'Segundo Nombre', 'Primer Apellido', 'Segundo Apellido', 'País de nacimiento', 'Ciudad de nacimiento', 'Fecha de nacimiento',
        'Tipo de Documento de Identidad', 'Número de documento de identidad', 'Ciudad de expedición del documento de identidad', 'Tipo de sangre y RH', 'Sexo',
        'Si tiene SISBEN, seleccione el grupo en el que se ubica', 'EPS a la que se encuentra afiliado', 'Grupo étnico al que pertenece',
        'Si tiene alguna discapacidad, por favor descríbala', 'Grado al que ingresará', 'Jornada de clases', '*SOLO PARA PRIMARIA* Elija la sede donde desea estudiar',
        '*SOLO PARA GRADO 10º* Elija la especialidad que desea estudiar', 'El tipo de vivienda es:',
        'Primer Nombre 2', 'Segundo Nombre 2', 'Primer Apellido 2', 'Segundo Apellido 2', 'Fecha de nacimiento 2', 'Número de documento de identidad 2',
        'Ciudad de expedición del documento de identidad 2', 'Parentesco con el estudiante', 'Dirección de residencia', 'Barrio', 'Número telefónico 1',
        'Número telefónico 2', 'Correo electrónico',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        foreach (['anios_lectivos', 'grados', 'parentescos', 'instituciones', 'sedes'] as $tabla) {
            ['columnas' => $columnas, 'filas' => $filas] = json_decode(file_get_contents(DatosIniciales::archivo($tabla)), true);
            DB::table($tabla)->insert(array_map(fn ($fila) => array_combine($columnas, $fila), $filas));
        }
        Storage::fake('local');
    }

    /** Una respuesta: una niña de transición cuya acudiente es la madre. */
    private function respuesta(array $cambios = []): array
    {
        return array_values(array_merge(array_fill_keys(self::TITULOS, null), [
            'Marca temporal' => '9/1/2026 20:27:25',
            self::TITULOS[1] => 'NO - Si esta es su respuesta responda todo el cuestionario',
            'Primer Nombre' => 'Lesly ', 'Segundo Nombre' => 'Rocío ', 'Primer Apellido' => 'Caicedo', 'Segundo Apellido' => 'Muñoz ',
            'País de nacimiento' => 'Colombia', 'Ciudad de nacimiento' => 'Cali-valle', 'Fecha de nacimiento' => '9/24/2021',
            'Tipo de Documento de Identidad' => 'Registro Civil', 'Número de documento de identidad' => '1108341002',
            'Ciudad de expedición del documento de identidad' => 'Cali-valle', 'Tipo de sangre y RH' => 'A+', 'Sexo' => 'Femenino',
            'Si tiene SISBEN, seleccione el grupo en el que se ubica' => 'Grupo C', 'EPS a la que se encuentra afiliado' => 'Coosalud ',
            'Grupo étnico al que pertenece' => 'Mestizo', 'Grado al que ingresará' => 'Transición', 'Jornada de clases' => 'Mañana',
            '*SOLO PARA PRIMARIA* Elija la sede donde desea estudiar' => 'Central Provivienda', 'El tipo de vivienda es:' => 'Casa',
            'Primer Nombre 2' => 'Diana', 'Segundo Nombre 2' => 'Marcela ', 'Primer Apellido 2' => 'Muñoz ', 'Segundo Apellido 2' => 'López ',
            'Fecha de nacimiento 2' => '2/7/1988', 'Número de documento de identidad 2' => '1130639923',
            'Ciudad de expedición del documento de identidad 2' => 'Cali-valle', 'Parentesco con el estudiante' => 'Madre',
            'Dirección de residencia' => 'Cra7e#72a50', 'Barrio' => 'Alfonso López 2 etapa ', 'Número telefónico 1' => '318 532 0059',
            'Número telefónico 2' => '3042424718', 'Correo electrónico' => 'Marcesanty911@gmail.com',
        ], $cambios));
    }

    private function excel(array $filas, array $titulos = self::TITULOS): UploadedFile
    {
        $libro = new Spreadsheet;
        $libro->getActiveSheet()->setTitle('Respuestas de formulario 1')->fromArray([$titulos, ...$filas], null, 'A1', true);
        $ruta = tempnam(sys_get_temp_dir(), 'form').'.xlsx';
        (new Xlsx($libro))->save($ruta);

        return new UploadedFile($ruta, 'FORMULARIO DE INSCRIPCIÓN 2027.xlsx', null, null, true);
    }

    private function subir(UploadedFile $archivo)
    {
        return $this->actingAs(User::factory()->create())->post('/importaciones', [
            'archivo' => $archivo,
        ]);
    }

    public function test_crea_las_inscripciones_y_omite_a_quien_ya_estudia_y_las_repetidas()
    {
        $this->subir($this->excel([
            $this->respuesta(),
            // Ya estudia aquí: no se importa.
            $this->respuesta([self::TITULOS[1] => 'SI - Si esta es su respuesta no es necesario diligenciar este formulario', 'Número de documento de identidad' => '1103933589']),
            // Respondió dos veces por el mismo niño (con puntos en el documento): vale la segunda.
            $this->respuesta(['Número de documento de identidad' => '1.075.508.626', 'Grado al que ingresará' => 'Sexto (6º)', 'Primer Nombre' => 'Viejo']),
            $this->respuesta(['Número de documento de identidad' => '1075508626', 'Grado al que ingresará' => 'Sexto (6º)', 'Primer Nombre' => 'Nuevo',
                'Si tiene SISBEN, seleccione el grupo en el que se ubica' => 'No tengo', 'Parentesco con el estudiante' => 'Tia(o)',
                '*SOLO PARA PRIMARIA* Elija la sede donde desea estudiar' => 'Rafael Pombo']),
            // Un grado que no existe: queda en la lista de errores, las demás sí entran.
            $this->respuesta(['Número de documento de identidad' => '999000111', 'Grado al que ingresará' => 'Duodécimo']),
        ]))->assertSessionHasNoErrors()->assertSessionHas('importacion', fn ($r) => $r['creadas'] === 2 && $r['yaEstudian'] === 1
            && $r['repetidas'] === 1 && $r['yaInscritas'] === 0 && count($r['errores']) === 1 && $r['errores'][0]['fila'] === 6 && $r['anio'] === 2026);

        $this->assertSame(2, SolicitudInscripcion::count());
        $lesly = SolicitudInscripcion::where('numero_documento', '1108341002')->firstOrFail();
        $this->assertSame(SolicitudInscripcion::PENDIENTE, $lesly->estado);
        $this->assertSame(SolicitudInscripcion::anioLectivoActivoId(), $lesly->anio_lectivo_id, 'el año activo, como el formulario de SIEAGE');
        $this->assertSame(['Lesly', 'Rocío', 'Caicedo', 'Muñoz', 'F', 'R.C.', 'C', 'A+'],
            [$lesly->primer_nombre, $lesly->segundo_nombre, $lesly->primer_apellido, $lesly->segundo_apellido, $lesly->sexo, $lesly->tipo_documento, $lesly->sisben, $lesly->tipo_sangre]);
        $this->assertSame('2021-09-24', $lesly->fecha_nacimiento->format('Y-m-d'));
        $this->assertSame('1988-02-07', $lesly->acudiente_fecha_nacimiento->format('Y-m-d'));
        $this->assertSame(DB::table('grados')->where('numero', 0)->value('id'), $lesly->grado_id);
        $this->assertSame((int) DB::table('sedes')->where('nombre', 'Central Provivienda')->value('id'), (int) $lesly->sede_preferida_id);
        $this->assertSame(['3185320059', 'marcesanty911@gmail.com', 'Cra7e#72a50'], [$lesly->telefono_1, $lesly->correo, $lesly->acudiente_direccion]);
        $this->assertSame('2026-09-01', $lesly->created_at->format('Y-m-d'), 'la fecha de la respuesta, no la de la importación');
        // Lo que no tiene columna, en el orden del formulario.
        $this->assertSame([['pregunta' => 'El tipo de vivienda es:', 'respuesta' => 'Casa']], $lesly->datos_adicionales);
        // La acudiente es la madre: queda registrada; el padre lo completa la secretaría.
        $this->assertSame(['madre'], $lesly->padres()->pluck('parentesco')->all());
        $this->assertTrue((bool) $lesly->padres()->first()->es_acudiente);

        $nuevo = SolicitudInscripcion::where('numero_documento', '1075508626')->firstOrFail();
        $this->assertSame('Nuevo', $nuevo->primer_nombre);
        $this->assertSame('ninguno', $nuevo->sisben);
        $this->assertNull($nuevo->sede_preferida_id, 'en bachillerato no se pide sede');
        $this->assertSame((int) DB::table('parentescos')->where('nombre', 'Tia(o)')->value('id'), $nuevo->acudiente_parentesco_id);
        $this->assertSame(0, $nuevo->padres()->count());
    }

    public function test_importar_otra_vez_no_repite_inscripciones()
    {
        $this->subir($this->excel([$this->respuesta()]));
        $this->subir($this->excel([$this->respuesta(), $this->respuesta(['Número de documento de identidad' => '1103933589'])]))
            ->assertSessionHas('importacion', fn ($r) => $r['creadas'] === 1 && $r['yaInscritas'] === 1);

        $this->assertSame(2, SolicitudInscripcion::count());
    }

    public function test_otro_excel_solo_se_guarda()
    {
        $this->subir($this->excel([['1', 'Gómez Ana']], ['A', 'NOMBRE']))
            ->assertSessionHas('success')
            ->assertSessionMissing('importacion');

        $this->assertSame(0, SolicitudInscripcion::count());
        $this->assertCount(1, Storage::disk('local')->files('importaciones'));
    }

    public function test_tambien_por_consola()
    {
        $archivo = $this->excel([$this->respuesta()]);

        $this->artisan('inscripciones:importar', ['archivo' => $archivo->getPathname()])
            ->expectsOutputToContain('1 creadas')
            ->assertSuccessful();
        $this->assertSame(1, SolicitudInscripcion::count());
    }
}
