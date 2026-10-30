<?php

namespace Tests\Feature;

use App\Support\Nombres;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class NombresTest extends TestCase
{
    use RefreshDatabase;

    private function partes(?string $a1, ?string $a2, ?string $n1, ?string $n2): array
    {
        return ['primer_apellido' => $a1, 'segundo_apellido' => $a2, 'primer_nombre' => $n1, 'segundo_nombre' => $n2];
    }

    public function test_el_estudiante_viene_con_los_apellidos_primero()
    {
        $this->assertSame($this->partes('Gomez', 'Rojas', 'Pedro', 'Pablo'), Nombres::deEstudiante('Gomez Rojas Pedro Pablo'));
        $this->assertSame($this->partes('Ortiz', 'Salazar', 'Nelly', null), Nombres::deEstudiante('  Ortiz  Salazar Nelly '));
        $this->assertSame($this->partes('De la Torre', 'Mejia', 'Hugo', 'Pablo'), Nombres::deEstudiante('De la Torre Mejia Hugo Pablo'));
        $this->assertSame($this->partes('Silva', 'Zuñiga', 'Rosa', 'De Los Angeles'), Nombres::deEstudiante('Silva Zuñiga Rosa De Los Angeles'));
        $this->assertSame($this->partes('Vargas', 'Pardo', 'Elkin', 'Tomas Yeison'), Nombres::deEstudiante('Vargas Pardo Elkin Tomas Yeison'));
        $this->assertSame($this->partes('Perez', null, 'Ana', null), Nombres::deEstudiante('Perez Ana'));
    }

    public function test_el_acudiente_viene_con_los_nombres_primero()
    {
        $this->assertSame($this->partes('Cano', 'Duarte', 'Luz', 'Rosa'), Nombres::deAcudiente('Luz Rosa Cano Duarte'));
        $this->assertSame($this->partes('Salazar', 'Vera', 'Nubia', null), Nombres::deAcudiente('Nubia Salazar Vera'));
        $this->assertSame($this->partes('Mora', null, 'Paola', null), Nombres::deAcudiente('Paola Mora'));
        $this->assertSame($this->partes('Núñez', 'Paredes', 'Yoleida', 'Del Carmen'), Nombres::deAcudiente('Yoleida Del Carmen Núñez Paredes'));
        // "Santa" al final es un apellido, no una partícula.
        $this->assertSame($this->partes('Arias', 'Santa', 'Diana', 'Milena'), Nombres::deAcudiente('Diana Milena Arias Santa'));
    }

    public function test_marca_los_que_conviene_revisar()
    {
        $this->assertFalse(Nombres::dudoso('Gomez Rojas Pedro Pablo'));
        $this->assertFalse(Nombres::dudoso('Ortiz Salazar Nelly'));
        $this->assertTrue(Nombres::dudoso('Paola Mora'));
        $this->assertTrue(Nombres::dudoso('De la Torre Mejia Hugo Pablo'));
        $this->assertTrue(Nombres::dudoso('Vargas Pardo Elkin Tomas Yeison'));
    }

    public function test_completa_a_todos_sin_tocar_el_nombre_completo_ni_lo_ya_separado()
    {
        $this->seed(DatosInicialesSeeder::class);
        $manual = DB::table('estudiantes')->orderBy('id')->first();
        DB::table('estudiantes')->where('id', $manual->id)->update(['primer_apellido' => 'Corregido', 'primer_nombre' => 'A Mano']);
        $nombres = DB::table('estudiantes')->orderBy('id')->pluck('nombre_completo', 'id')->all();

        $hechos = Nombres::completar();

        $this->assertSame(DB::table('estudiantes')->count() - 1, $hechos['estudiantes']);
        $this->assertSame(DB::table('acudientes')->count(), $hechos['acudientes']);
        $this->assertSame(0, DB::table('estudiantes')->whereNull('primer_apellido')->count());
        $this->assertSame(0, DB::table('acudientes')->whereNull('primer_nombre')->count());
        $this->assertSame($nombres, DB::table('estudiantes')->orderBy('id')->pluck('nombre_completo', 'id')->all());
        $this->assertSame('Corregido', DB::table('estudiantes')->where('id', $manual->id)->value('primer_apellido'));

        // Correrlo otra vez no cambia nada.
        $this->assertSame(['estudiantes' => 0, 'acudientes' => 0], Nombres::completar());
    }
}
