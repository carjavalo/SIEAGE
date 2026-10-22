<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Edades;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** La tabla de edades del colegio y sus alertas. */
class EdadesTest extends TestCase
{
    use RefreshDatabase;

    public function test_sigue_la_tabla_de_edades_grado_por_grado()
    {
        // Grado => [adecuada, aceptable hasta (y 11 meses), extraedad desde], tal como está en la tabla.
        $tabla = [1 => [6, 8, 9], 2 => [7, 9, 10], 3 => [8, 10, 11], 4 => [9, 11, 12], 5 => [10, 12, 13], 6 => [11, 13, 14],
            7 => [12, 14, 15], 8 => [13, 15, 16], 9 => [14, 16, 17], 10 => [15, 17, 18], 11 => [16, 18, 19]];

        foreach ($tabla as $grado => [$adecuada, $aceptable, $extra]) {
            $this->assertSame($adecuada, Edades::adecuada($grado));
            $this->assertSame($aceptable, Edades::aceptableHasta($grado));
            $this->assertSame('adecuada', Edades::estado($adecuada, $grado));
            $this->assertSame('adecuada', Edades::estado($adecuada - 1, $grado), 'menor de la adecuada: no es alerta');
            $this->assertSame('aceptable', Edades::estado($adecuada + 1, $grado));
            $this->assertSame('aceptable', Edades::estado($aceptable, $grado), "{$aceptable} años y 11 meses todavía es aceptable en {$grado}.º");
            $this->assertSame('extraedad', Edades::estado($extra, $grado));
        }
        $this->assertNull(Edades::estado(null, 3));
    }

    public function test_la_edad_es_al_31_de_marzo_del_anio_lectivo()
    {
        // Cumple 9 el 1 de abril de 2026: al 31 de marzo tenía 8, aceptable en Primero.
        $this->assertSame(8, Edades::alInicioDelAnio('2017-04-01', 2026));
        $this->assertNull(Edades::alerta('2020-04-01', 1, 2026), '5 años en Primero: sin alerta');
        $this->assertSame('aceptable', Edades::alerta('2017-04-01', 1, 2026)['estado']);
        $this->assertSame(['estado' => 'extraedad', 'edad' => 9, 'adecuada' => 6, 'aceptableHasta' => 8, 'anio' => 2026], Edades::alerta('2017-03-31', 1, 2026));
    }

    public function test_la_lista_y_la_ficha_avisan_la_extraedad()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anioId = DB::table('anios_lectivos')->where('anio', 2026)->value('id');
        $primero = DB::table('grados')->where('numero', 1)->value('id');
        $m = DB::table('matriculas')->where('anio_lectivo_id', $anioId)->where('grado_id', $primero)->where('estado', 'activo')->first();
        DB::table('estudiantes')->where('id', $m->estudiante_id)->update(['fecha_nacimiento' => '2016-01-15']); // 10 años: extraedad en Primero

        $this->actingAs(User::first())->get("/estudiantes?anio=2026&grado={$primero}&ver={$m->estudiante_id}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('estudiantes', fn ($l) => collect($l)->firstWhere('id', $m->estudiante_id)['edad']['estado'] === 'extraedad')
                ->where('detalle.edad.estado', 'extraedad')
                ->where('detalle.edad.edad', 10)
                ->where('detalle.edad.aceptableHasta', 8));
    }

    public function test_el_informe_de_extraedad_lista_a_quienes_pasan_la_edad_de_su_grado()
    {
        $this->seed(DatosInicialesSeeder::class);
        $anioId = DB::table('anios_lectivos')->where('anio', 2026)->value('id');
        $primero = DB::table('grados')->where('numero', 1)->value('id');
        $grupo = DB::table('grupos')->where('anio_lectivo_id', $anioId)->where('grado_id', $primero)->orderBy('id')->first();
        $ids = DB::table('matriculas')->where('grupo_id', $grupo->id)->where('estado', 'activo')->orderBy('id')->pluck('estudiante_id');
        // Todo el grupo en edad adecuada, menos dos: uno de 8 (aceptable) y uno de 10 (extraedad).
        DB::table('estudiantes')->whereIn('id', $ids)->update(['fecha_nacimiento' => '2019-06-01']);
        DB::table('estudiantes')->where('id', $ids[0])->update(['fecha_nacimiento' => '2017-06-01']);
        DB::table('estudiantes')->where('id', $ids[1])->update(['fecha_nacimiento' => '2015-06-01']);

        $this->actingAs(User::first())->get("/informes/extraedad?anio=2026&grupo={$grupo->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('informes/extraedad')
                ->where('totales.activos', $ids->count())
                ->where('totales.aceptable', 1)
                ->where('totales.extraedad', 1)
                ->where('grados.0.adecuada', 6)
                ->where('grados.0.aceptableHasta', 8)
                ->has('grupos', 1)
                ->where('grupos.0.grupo', $grupo->codigo)
                ->where('grupos.0.estudiantes.0.edad', 10)
                ->where('grupos.0.estudiantes.0.deMas', 4));
    }
}
