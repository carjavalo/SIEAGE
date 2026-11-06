<?php

namespace Tests\Feature;

use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Las modalidades que se crearon escribiéndolas a mano en la ficha se unen con la original. */
class UnirModalidadesTest extends TestCase
{
    use RefreshDatabase;

    public function test_las_repetidas_se_unen_con_la_original_y_las_distintas_no()
    {
        $this->seed(DatosInicialesSeeder::class);
        $original = (int) DB::table('modalidades')->where('nombre', 'Asist. Admin.')->value('id');
        $electricidad = (int) DB::table('modalidades')->where('nombre', 'Electricidad')->value('id');
        $electronica = (int) DB::table('modalidades')->where('nombre', 'Electrónica')->value('id');
        $larga = DB::table('modalidades')->insertGetId(['nombre' => 'Asistencia Administrativa', 'activa' => true]);
        $sinPunto = DB::table('modalidades')->insertGetId(['nombre' => 'Asist. Admin', 'activa' => true]);
        [$m1, $m2] = DB::table('matriculas')->orderBy('id')->limit(2)->pluck('id')->all();
        DB::table('matriculas')->where('id', $m1)->update(['modalidad_id' => $larga]);
        DB::table('matriculas')->where('id', $m2)->update(['modalidad_id' => $sinPunto]);
        $anio = DB::table('anios_lectivos')->where('estado', 'activo')->value('id');
        DB::table('graduaciones')->insert(['anio_lectivo_id' => $anio, 'cargo_rector' => 'Rectora', 'cargo_secretario' => 'Secretario', 'actas' => json_encode(["modalidad-{$larga}" => ['acta' => '7']])]);

        (require database_path('migrations/2026_11_06_100000_unir_modalidades_repetidas.php'))->up();

        $this->assertSame($original, (int) DB::table('matriculas')->where('id', $m1)->value('modalidad_id'));
        $this->assertSame($original, (int) DB::table('matriculas')->where('id', $m2)->value('modalidad_id'));
        $this->assertNull(DB::table('modalidades')->find($larga));
        $this->assertNull(DB::table('modalidades')->find($sinPunto));
        // Electricidad y Electrónica siguen siendo dos.
        $this->assertNotNull(DB::table('modalidades')->find($electricidad));
        $this->assertNotNull(DB::table('modalidades')->find($electronica));
        // El número de acta que se había llenado para la repetida pasa a la original.
        $this->assertSame(['acta' => '7'], json_decode(DB::table('graduaciones')->value('actas'), true)["modalidad-{$original}"]);
    }
}
