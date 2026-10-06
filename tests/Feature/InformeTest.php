<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

class InformeTest extends TestCase
{
    use RefreshDatabase;

    public function test_solo_con_sesion()
    {
        $this->get('/informes/matricula')->assertRedirect('/login');
    }

    public function test_el_informe_cuadra_con_la_base()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anioId = DB::table('anios_lectivos')->where('anio', 2026)->value('id');
        $matriculas = DB::table('matriculas')->where('anio_lectivo_id', $anioId);
        $activos = (clone $matriculas)->where('estado', 'activo')->count();

        $this->actingAs(User::first())
            ->get('/informes/matricula?anio=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('informes/matricula')
                ->where('anio', 2026)
                ->where('totales.matriculas', (clone $matriculas)->count())
                ->where('totales.activos', $activos)
                ->where('totales.nuevos', (clone $matriculas)->where('estado', 'activo')->where('condicion', 'nuevo')->count())
                ->where('totales.retirados', (clone $matriculas)->where('estado', 'retirado')->count())
                ->where('totales.grupos', DB::table('grupos')->where('anio_lectivo_id', $anioId)->count())
                ->where('totales.cupos', (int) DB::table('grupos')->where('anio_lectivo_id', $anioId)->sum('cupos_proyectados'))
                // Doce grados, de Transición (edad esperada 5) a Undécimo (16).
                ->has('grados', 12)
                ->where('grados.0.edadEsperada', 5)
                ->where('grados.11.edadEsperada', 16)
                ->has('anexo')
                ->has('sinRegistrar'));
    }

    public function test_el_anexo_trae_a_todos_los_activos_una_vez()
    {
        $this->seed(DatosInicialesSeeder::class);

        $respuesta = $this->actingAs(User::first())->get('/informes/matricula?anio=2026');
        $props = $respuesta->viewData('page')['props'];
        $enAnexo = collect($props['anexo'])->sum(fn ($g) => count($g['estudiantes']));

        // Cada grupo del anexo existe en la lista de grupos, y entre todos suman los activos con grupo.
        $ids = collect($props['grupos'])->pluck('id');
        $this->assertTrue(collect($props['anexo'])->every(fn ($g) => $ids->contains($g['grupo'])));
        $this->assertSame(collect($props['grupos'])->sum('activos'), $enAnexo);
        $this->assertLessThanOrEqual($props['totales']['activos'], $enAnexo);
    }

    public function test_filtra_por_sede_y_por_grado()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anioId = DB::table('anios_lectivos')->where('anio', 2026)->value('id');
        $lf = DB::table('sedes')->where('codigo', 'LF')->first();
        $septimo = DB::table('grados')->where('numero', 7)->value('id');
        $activos = fn (?int $sede, ?int $grado) => DB::table('matriculas')->where('anio_lectivo_id', $anioId)->where('estado', 'activo')
            ->when($sede, fn ($q) => $q->where('sede_id', $sede))->when($grado, fn ($q) => $q->where('grado_id', $grado))->count();

        $this->actingAs(User::first())->get('/informes/matricula?anio=2026&sede=LF')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filtro.sede', 'LF')
                ->where('filtro.sedeNombre', $lf->nombre)
                ->where('totales.activos', $activos($lf->id, null))
                ->where('grupos', fn ($g) => collect($g)->every(fn ($x) => $x['sede_codigo'] === 'LF'))
                // El selector de grado: cada sede con los grados que tiene grupos ese año.
                ->where('opciones', fn ($o) => collect(collect($o)->firstWhere('codigo', 'LF')['grados'])->pluck('id')->map(fn ($i) => (int) $i)->sort()->values()->all()
                    === DB::table('grupos')->where('anio_lectivo_id', $anioId)->where('sede_id', $lf->id)->distinct()->orderBy('grado_id')->pluck('grado_id')->map(fn ($i) => (int) $i)->all()));

        $this->actingAs(User::first())->get("/informes/matricula?anio=2026&sede=LF&grado={$septimo}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('filtro.grado', $septimo)
                ->where('totales.activos', $activos($lf->id, $septimo))
                ->has('grados', 1)
                ->where('grupos', fn ($g) => collect($g)->every(fn ($x) => $x['sede_codigo'] === 'LF' && $x['grado'] === 7)));

        // Solo el grado, en todas las sedes.
        $this->actingAs(User::first())->get("/informes/matricula?anio=2026&grado={$septimo}")
            ->assertInertia(fn (Assert $page) => $page->where('filtro.sede', null)->where('totales.activos', $activos(null, $septimo)));

        $this->actingAs(User::first())->get('/informes/matricula?anio=2026&sede=XX')->assertNotFound();
        $this->actingAs(User::first())->get('/informes/matricula?anio=2026&grado=999')->assertNotFound();
    }

    public function test_filtra_por_grupo()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anioId = DB::table('anios_lectivos')->where('anio', 2026)->value('id');
        $grupo = DB::table('grupos as g')->join('sedes as s', 's.id', '=', 'g.sede_id')
            ->where('g.anio_lectivo_id', $anioId)->orderBy('g.id')->first(['g.id', 'g.codigo', 'g.grado_id', 's.codigo as sede']);
        $activos = DB::table('matriculas')->where('grupo_id', $grupo->id)->where('estado', 'activo')->count();

        // Solo con el grupo basta: la sede y el grado salen de él.
        $this->actingAs(User::first())->get("/informes/matricula?anio=2026&grupo={$grupo->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('filtro.grupo', $grupo->id)
                ->where('filtro.grupoCodigo', $grupo->codigo)
                ->where('filtro.sede', $grupo->sede)
                ->where('filtro.grado', $grupo->grado_id)
                ->where('totales.activos', $activos)
                ->has('grupos', 1)
                ->where('opciones', fn ($o) => collect($o)->flatMap(fn ($s) => collect($s['grados'])->flatMap(fn ($g) => $g['grupos']))->pluck('id')->contains($grupo->id)));

        // Un grupo de otro año no existe en este.
        $otro = DB::table('grupos')->where('anio_lectivo_id', '!=', $anioId)->value('id');
        if ($otro) {
            $this->actingAs(User::first())->get("/informes/matricula?anio=2026&grupo={$otro}")->assertNotFound();
        }
        $this->actingAs(User::first())->get('/informes/matricula?anio=2026&grupo=999999')->assertNotFound();
    }

    public function test_un_anio_que_no_existe_da_404()
    {
        $this->seed(DatosInicialesSeeder::class);

        $this->actingAs(User::first())->get('/informes/matricula?anio=1990')->assertNotFound();
    }

    public function test_el_excel_solo_con_sesion()
    {
        $this->get('/informes/matricula/excel?anio=2026&sede=P')->assertRedirect('/login');
    }

    public function test_el_excel_de_una_sede_trae_sus_grupos_y_el_consolidado()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anioId = DB::table('anios_lectivos')->where('anio', 2026)->value('id');
        $sedeId = DB::table('sedes')->where('codigo', 'P')->value('id');
        $grupos = DB::table('grupos')->where(['anio_lectivo_id' => $anioId, 'sede_id' => $sedeId])->pluck('codigo');

        $respuesta = $this->actingAs(User::first())->get('/informes/matricula/excel?anio=2026&sede=P');
        $respuesta->assertOk()->assertDownload('PRINCIPAL-2026.xlsx');

        $archivo = tempnam(sys_get_temp_dir(), 'libro');
        file_put_contents($archivo, $respuesta->streamedContent());
        $libro = IOFactory::load($archivo);
        unlink($archivo);

        $hojas = $libro->getSheetNames();
        foreach ($grupos as $codigo) {
            $this->assertContains($codigo, $hojas);
        }
        foreach (['CONSOLIDADO', 'DIRECTORES DE GRUPO', 'NO TOCAR'] as $hoja) {
            $this->assertContains($hoja, $hojas);
        }
        $this->assertNotContains('PEGAR AQUÍ', $hojas);

        // Cada hoja de grupo: una fila por matrícula del grupo y sus totales con las fórmulas del colegio.
        $primero = DB::table('grupos')->where(['anio_lectivo_id' => $anioId, 'sede_id' => $sedeId, 'codigo' => $grupos->first()])->first();
        $matriculas = DB::table('matriculas as m')->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->where('m.grupo_id', $primero->id)->whereNull('e.deleted_at');
        $hoja = $libro->getSheetByName($primero->codigo);
        $ultima = 2 + $matriculas->count() + 5;
        $this->assertSame('=SUM(A3:A'.$ultima.')-A'.($ultima + 7), $hoja->getCell('A'.($ultima + 5))->getValue());
        $this->assertSame('=COUNTIF(A3:A'.$ultima.',"R")', $hoja->getCell('A'.($ultima + 9))->getValue());
        $this->assertSame('=B1-A'.($ultima + 3), $hoja->getCell('A1')->getValue());
        $unos = collect(range(3, $ultima))->filter(fn ($r) => $hoja->getCell("A{$r}")->getValue() === 1)->count();
        $activos = (clone $matriculas)->where('m.estado', 'activo')->count();
        $this->assertSame($activos, $unos);

        // Las fórmulas viajan con su resultado: en la «Vista protegida» de Excel no se calculan y se verían en blanco.
        $this->assertEquals($activos, $hoja->getCell('A'.($ultima + 3))->getOldCalculatedValue());
        $this->assertEquals((clone $matriculas)->where('m.estado', 'retirado')->count(), $hoja->getCell('A'.($ultima + 9))->getOldCalculatedValue());
        $this->assertEquals($primero->cupos_proyectados - $activos, $hoja->getCell('A1')->getOldCalculatedValue());

        // CONSOLIDADO apunta a los totales de cada hoja.
        $consolidado = $libro->getSheetByName('CONSOLIDADO');
        $this->assertSame('SEDE PRINCIPAL', $consolidado->getCell('B3')->getValue());
        $this->assertSame("='{$primero->codigo}'!A".($ultima + 5), $consolidado->getCell('E8')->getValue());
        $this->assertIsNumeric($consolidado->getCell('E8')->getOldCalculatedValue());
        $this->assertIsNumeric($consolidado->getCell('B4')->getOldCalculatedValue());
    }

    public function test_el_excel_de_una_sede_que_no_existe_da_404()
    {
        $this->seed(DatosInicialesSeeder::class);

        $this->actingAs(User::first())->get('/informes/matricula/excel?anio=2026&sede=XX')->assertNotFound();
        $this->actingAs(User::first())->get('/informes/matricula/excel?anio=1990&sede=P')->assertNotFound();
    }
}
