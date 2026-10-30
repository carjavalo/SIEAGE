<?php

namespace Tests\Feature;

use Database\Seeders\DatosIniciales;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatosInicialesTest extends TestCase
{
    use RefreshDatabase;

    public function test_los_datos_iniciales_se_cargan_completos_y_sin_duplicar()
    {
        $this->seed(DatosInicialesSeeder::class);
        $this->seed(DatosInicialesSeeder::class);

        foreach (DatosIniciales::TABLAS as $tabla) {
            $esperadas = count(json_decode(file_get_contents(DatosIniciales::archivo($tabla)), true)['filas']);

            $this->assertSame($esperadas, DB::table($tabla)->count(), "Filas en {$tabla}");
        }
    }

    public function test_el_archivo_nunca_cambia_a_un_usuario_que_ya_existe()
    {
        ['columnas' => $columnas, 'filas' => $filas] = json_decode(file_get_contents(DatosIniciales::archivo('users')), true);
        $usuario = array_combine($columnas, $filas[0]);

        DB::table('users')->insert([
            'id' => 999, 'name' => 'Viejo', 'usuario' => $usuario['usuario'], 'password' => 'otra',
            'rol_id' => DB::table('roles')->where('nombre', 'docente')->value('id'), 'activo' => false,
            'ultimo_acceso' => '2026-01-01 08:00:00',
        ]);

        $this->seed(DatosInicialesSeeder::class);

        $local = DB::table('users')->where('usuario', $usuario['usuario'])->first();
        $this->assertSame('Viejo', $local->name);
        $this->assertSame('otra', $local->password);
        $this->assertSame((int) DB::table('roles')->where('nombre', 'docente')->value('id'), (int) $local->rol_id);
        $this->assertFalse((bool) $local->activo);
        $this->assertSame(count($filas), DB::table('users')->count());
    }

    public function test_los_datos_de_personas_del_repositorio_son_inventados()
    {
        $filas = fn (string $tabla) => json_decode(file_get_contents(DatosIniciales::archivo($tabla)), true);

        ['columnas' => $columnas, 'filas' => $estudiantes] = $filas('estudiantes');
        $documento = array_search('numero_documento', $columnas);
        foreach ($estudiantes as $e) {
            $this->assertStringStartsWith('99', (string) $e[$documento]);
        }

        ['columnas' => $columnas, 'filas' => $acudientes] = $filas('acudientes');
        $documento = array_search('numero_documento', $columnas);
        foreach ($acudientes as $a) {
            $this->assertTrue($a[$documento] === null || str_starts_with((string) $a[$documento], '88'));
        }

        // Ningún volcado ni copia de un .env dentro del proyecto.
        $this->assertSame([], glob(database_path('data/*.sql')));
        $this->assertSame([], glob(base_path('docs/bd/respaldos/*')));
        $this->assertSame([], array_values(array_filter(glob(base_path('.env.*')), fn ($f) => ! str_ends_with($f, '.env.example') && ! str_ends_with($f, '.env.testing'))));
        $this->assertFileDoesNotExist(public_path('estructura-consolidado.png'));
    }

    public function test_no_se_exportan_tablas_de_personas()
    {
        $this->artisan('sieage:exportar-datos', ['--tabla' => ['estudiantes']])->assertFailed();
        $this->artisan('sieage:exportar-datos', ['--tabla' => ['users']])->assertFailed();
    }
}
