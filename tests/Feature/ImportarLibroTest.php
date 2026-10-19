<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\LibroMatriculaSede;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

/** Importar el libro de matrícula y el de ciclos sabatinos (mismo formato, una hoja por grupo o por ciclo). */
class ImportarLibroTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatosInicialesSeeder::class);
        Storage::fake('local');
    }

    /** Una hoja con los títulos del libro del colegio (fila 1 y 2) y estas filas de estudiantes. */
    private function hoja(Spreadsheet $libro, string $titulo, array $filas, int $cupos = 25): void
    {
        $h = new Worksheet($libro, $titulo);
        $libro->addSheet($h);
        $titulos = ['C1' => 'FECHA MATRÍCULA', 'C2' => 'DÍA', 'D2' => 'MES', 'E2' => 'AÑO', 'F1' => 'APELLIDOS Y NOMBRES', 'G1' => 'SEDE',
            'H1' => 'MODALIDAD TÉCNICA', 'AG1' => 'JORNADA', 'AH1' => 'GENERO', 'AI1' => 'FECHA NACIMIENTO', 'AM1' => 'TIPO DOC', 'AN1' => 'NUMERO',
            'AY1' => 'FOTOS', 'AZ1' => 'NOMBRE DEL ACUDIENTE', 'BA1' => 'CÉDULA', 'BB1' => 'PARENTESCO', 'BC1' => 'DIRECCIÓN', 'BD1' => 'BARRIO',
            'BE1' => 'TELÉFONO FIJO', 'BF1' => 'TELÉFONO CELULAR', 'BG1' => 'OBSERVACIONES', 'B1' => $cupos];
        foreach (['I', 'K', 'M', 'O', 'Q', 'S', 'U', 'W', 'Y', 'AA', 'AC', 'AE'] as $k => $col) {
            $titulos["{$col}1"] = 'GRUPO'.(2015 + $k);
        }
        foreach ($titulos as $celda => $v) {
            $h->setCellValue($celda, $v);
        }
        foreach ($filas as $i => $f) {
            foreach ($f as $col => $v) {
                $h->setCellValue($col.(3 + $i), $v);
            }
        }
        $h->setCellValue('C'.(3 + count($filas) + 3), 'TOTAL ESTUDIANTES MATRICULADOS');
    }

    private function archivo(Spreadsheet $libro, string $nombre): UploadedFile
    {
        $ruta = tempnam(sys_get_temp_dir(), 'libro').'.xlsx';
        (new Xlsx($libro))->save($ruta);

        return new UploadedFile($ruta, $nombre, null, null, true);
    }

    private function subir(UploadedFile $archivo, string $tipo)
    {
        return $this->actingAs(User::first())->post('/importaciones', ['archivo' => $archivo, 'tipo' => $tipo]);
    }

    /** Un estudiante del libro, con los datos de una fila real de SABATINOS-2026. */
    private function fila(array $cambios = []): array
    {
        return array_merge([
            'A' => 1, 'C' => 19, 'D' => 'febrero', 'E' => 2026, 'F' => 'Alegria Arrechea Estiven Yerard', 'G' => 'Principal',
            'I' => 'No', 'K' => 'No', 'M' => 'No', 'O' => 'No', 'Q' => 'No', 'S' => 'No', 'U' => 'No', 'W' => 'No', 'Y' => 'No', 'AA' => 'No', 'AC' => 'No',
            'AE' => 'III', 'AF' => 'P', 'AG' => 'Sabatina', 'AH' => 'M', 'AI' => 29, 'AJ' => 5, 'AK' => 2010, 'AM' => 'T.I.', 'AN' => '9.066.842.892',
            'AY' => 'S', 'AZ' => 'Miley Arrechea Díaz', 'BA' => '9.064.488.408', 'BB' => 'Madre', 'BC' => 'CL 66A 7BBis-34', 'BD' => 'Calibella',
            'BE' => '317 713 6961', 'BF' => '318 303 3540',
        ], $cambios);
    }

    private function libroDeCiclos(): Spreadsheet
    {
        $libro = new Spreadsheet;
        $libro->removeSheetByIndex(0);
        $this->hoja($libro, 'CICLO III 2026', [
            $this->fila(),
            // Retirado, antiguo (B), con historia: 0-2 en Rafael Pombo en 2017.
            $this->fila(['A' => 'R', 'B' => 1, 'F' => 'Alzate Ocampo Juan Esteban', 'AN' => '9150689530', 'M' => '0-2', 'N' => 'RP',
                'AZ' => 'Javier Ocampo Ramirez', 'BA' => '9939990', 'BB' => 'Abuela(o)']),
        ]);
        // En la hoja del ciclo V la celda del grupo viene vacía: vale el nombre de la hoja.
        $this->hoja($libro, 'CICLO V 2026', [$this->fila(['F' => 'Zapata Ruiz Ana', 'AH' => 'F', 'AN' => '9000000001', 'AE' => null, 'AG' => null, 'BA' => '9000000002', 'AZ' => 'Rosa Ruiz'])]);
        $this->hoja($libro, 'NO TOCAR', []);

        return $libro;
    }

    public function test_el_libro_de_ciclos_crea_grupos_sabatinos_en_su_grado_equivalente()
    {
        $this->subir($this->archivo($this->libroDeCiclos(), 'SABATINOS-2026.xlsx'), 'ciclos')
            ->assertSessionHasNoErrors()
            ->assertSessionHas('importacion', fn ($r) => $r['tipo'] === 'ciclos' && $r['anio'] === 2026 && $r['hojas'] === 2
                && $r['matriculas'] === 3 && $r['estudiantesNuevos'] === 3 && $r['grupos'] === 2 && $r['historicas'] === 1 && $r['errores'] === []);

        $grupo = fn (string $codigo) => DB::table('grupos as g')->join('grados as gr', 'gr.id', '=', 'g.grado_id')->where('g.codigo', $codigo)->first(['g.id', 'gr.numero', 'g.jornada', 'g.cupos_proyectados']);
        $this->assertSame([7, 'Sabatina', 25], [(int) $grupo('Ciclo III')->numero, $grupo('Ciclo III')->jornada, (int) $grupo('Ciclo III')->cupos_proyectados]);
        $this->assertSame([10, 'Sabatina'], [(int) $grupo('Ciclo V')->numero, $grupo('Ciclo V')->jornada]);

        $e = DB::table('estudiantes')->where('numero_documento', '9066842892')->first();
        $this->assertSame(['Alegria', 'Arrechea', 'Estiven', 'Yerard', '2010-05-29', 'M', 'T.I.'],
            [$e->primer_apellido, $e->segundo_apellido, $e->primer_nombre, $e->segundo_nombre, $e->fecha_nacimiento, $e->genero, $e->tipo_documento]);
        $m = DB::table('matriculas')->where('estudiante_id', $e->id)->first();
        $this->assertSame([$grupo('Ciclo III')->id, 'Sabatina', 'activo', 'nuevo', '2026-02-19'], [(int) $m->grupo_id, $m->jornada, $m->estado, $m->condicion, $m->fecha_matricula]);
        $this->assertDatabaseHas('estudiante_acudiente', ['estudiante_id' => $e->id, 'es_principal' => true,
            'acudiente_id' => DB::table('acudientes')->where('numero_documento', '9064488408')->value('id'),
            'parentesco_id' => DB::table('parentescos')->where('nombre', 'Madre')->value('id')]);

        // El retirado y su historia.
        $juan = DB::table('estudiantes')->where('numero_documento', '9150689530')->value('id');
        $this->assertSame(['retirado', 'antiguo'], [DB::table('matriculas')->where('estudiante_id', $juan)->where('es_historico', false)->value('estado'),
            DB::table('matriculas')->where('estudiante_id', $juan)->where('es_historico', false)->value('condicion')]);
        $h = DB::table('matriculas as m')->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->where('m.estudiante_id', $juan)->where('m.es_historico', true)->first(['al.anio', 'gr.numero', 'm.sede_id']);
        $this->assertSame([2017, 0, (int) DB::table('sedes')->where('codigo', 'RP')->value('id')], [(int) $h->anio, (int) $h->numero, (int) $h->sede_id]);

        // Otra vez el mismo archivo: no duplica nada.
        $antes = DB::table('matriculas')->count();
        $this->subir($this->archivo($this->libroDeCiclos(), 'SABATINOS-2026.xlsx'), 'ciclos')
            ->assertSessionHas('importacion', fn ($r) => $r['matriculas'] === 0 && $r['yaMatriculados'] === 3 && $r['estudiantesNuevos'] === 0);
        $this->assertSame($antes, DB::table('matriculas')->count());
    }

    public function test_el_libro_de_matricula_carga_lo_que_falta_y_lo_exportado_por_sieage_no_duplica_nada()
    {
        // El libro que exporta SIEAGE (con madre y padre antes de OBSERVACIONES): todos ya están.
        [$exportado] = LibroMatriculaSede::generar(2026, 'P');
        $antes = DB::table('matriculas')->count();
        $this->subir($this->archivo($exportado, 'PRINCIPAL-2026.xlsx'), 'matricula')
            ->assertSessionHasNoErrors()
            ->assertSessionHas('importacion', fn ($r) => $r['matriculas'] === 0 && $r['estudiantesNuevos'] === 0 && $r['yaMatriculados'] > 0 && $r['errores'] === []);
        $this->assertSame($antes, DB::table('matriculas')->count());

        // Un estudiante nuevo en una hoja de grupo: entra en ese grupo.
        $libro = new Spreadsheet;
        $libro->removeSheetByIndex(0);
        $this->hoja($libro, '10-1', [$this->fila(['AE' => '10-1', 'AG' => 'Mañana', 'H' => 'Electricidad', 'AN' => '9111111111', 'F' => 'Nuevo Nuevo Ana'])], 34);
        $this->subir($this->archivo($libro, 'PRINCIPAL-2026.xlsx'), 'matricula')
            ->assertSessionHas('importacion', fn ($r) => $r['matriculas'] === 1 && $r['grupos'] === 0);
        $m = DB::table('matriculas as m')->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->where('e.numero_documento', '9111111111')->first(['g.codigo', 'm.jornada', 'm.modalidad_id']);
        $this->assertSame(['10-1', 'Mañana', DB::table('modalidades')->where('nombre', 'Electricidad')->value('id')], [$m->codigo, $m->jornada, $m->modalidad_id]);
    }

    public function test_cada_pestana_solo_acepta_su_formato()
    {
        $this->subir($this->archivo($this->libroDeCiclos(), 'SABATINOS-2026.xlsx'), 'formulario')->assertSessionHasErrors('archivo');
        $otro = new Spreadsheet;
        $otro->getActiveSheet()->fromArray([['A', 'NOMBRE'], [1, 'Ana']]);
        $this->subir($this->archivo($otro, 'otro.xlsx'), 'ciclos')->assertSessionHasErrors('archivo');
        $this->subir($this->archivo($otro, 'otro.xlsx'), 'cualquiera')->assertSessionHasErrors('tipo');
        $this->assertSame(0, DB::table('grupos')->where('jornada', 'Sabatina')->count());
    }
}
