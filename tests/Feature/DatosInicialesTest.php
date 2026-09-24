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

    public function test_los_usuarios_se_actualizan_desde_el_archivo()
    {
        ['columnas' => $columnas, 'filas' => $filas] = json_decode(file_get_contents(DatosIniciales::archivo('users')), true);
        $usuario = array_combine($columnas, $filas[0]);

        // En este equipo el usuario ya existía con otro id, otra clave y otro rol,
        // y ya había ingresado: la clave y el rol se toman del archivo, el último
        // ingreso se conserva.
        DB::table('users')->insert([
            'id' => 999, 'name' => 'Viejo', 'usuario' => $usuario['usuario'], 'password' => 'otra',
            'rol_id' => DB::table('roles')->where('nombre', 'docente')->value('id'), 'activo' => false,
            'ultimo_acceso' => '2026-01-01 08:00:00',
        ]);

        $this->seed(DatosInicialesSeeder::class);

        $local = DB::table('users')->where('usuario', $usuario['usuario'])->first();
        $this->assertSame(999, (int) $local->id);
        $this->assertSame($usuario['name'], $local->name);
        $this->assertSame($usuario['password'], $local->password);
        $this->assertSame((int) $usuario['rol_id'], (int) $local->rol_id);
        $this->assertTrue((bool) $local->activo);
        $this->assertSame('2026-01-01 08:00:00', $local->ultimo_acceso);
        $this->assertSame(count($filas), DB::table('users')->count());
    }
}
