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
}
