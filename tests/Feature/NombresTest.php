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
        $this->assertSame($this->partes('Restrepo', 'Lopez', 'Juan', 'Manuel'), Nombres::deEstudiante('Restrepo Lopez Juan Manuel'));
        $this->assertSame($this->partes('Aguirre', 'Betancourt', 'Yeri', null), Nombres::deEstudiante('  Aguirre  Betancourt Yeri '));
        $this->assertSame($this->partes('De la Cruz', 'Quintero', 'Victor', 'Manuel'), Nombres::deEstudiante('De la Cruz Quintero Victor Manuel'));
        $this->assertSame($this->partes('Camilo', 'Magaña', 'Maria', 'De Los Angeles'), Nombres::deEstudiante('Camilo Magaña Maria De Los Angeles'));
        $this->assertSame($this->partes('Florez', 'Guaje', 'Reinner', 'Samuel Yaninn'), Nombres::deEstudiante('Florez Guaje Reinner Samuel Yaninn'));
        $this->assertSame($this->partes('Perez', null, 'Ana', null), Nombres::deEstudiante('Perez Ana'));
    }

    public function test_el_acudiente_viene_con_los_nombres_primero()
    {
        $this->assertSame($this->partes('Pineda', 'Urbano', 'Aura', 'Maria'), Nombres::deAcudiente('Aura Maria Pineda Urbano'));
        $this->assertSame($this->partes('Betancourt', 'Leon', 'Keterine', null), Nombres::deAcudiente('Keterine Betancourt Leon'));
        $this->assertSame($this->partes('Angulo', null, 'Juliana', null), Nombres::deAcudiente('Juliana Angulo'));
        $this->assertSame($this->partes('Ríos', 'Bolivar', 'Carlimar', 'Del Valle'), Nombres::deAcudiente('Carlimar Del Valle Ríos Bolivar'));
        // "Santa" al final es un apellido, no una partícula.
        $this->assertSame($this->partes('Hurtado', 'Santa', 'Jhoana', 'Andrea'), Nombres::deAcudiente('Jhoana Andrea Hurtado Santa'));
    }

    public function test_marca_los_que_conviene_revisar()
    {
        $this->assertFalse(Nombres::dudoso('Restrepo Lopez Juan Manuel'));
        $this->assertFalse(Nombres::dudoso('Aguirre Betancourt Yeri'));
        $this->assertTrue(Nombres::dudoso('Juliana Angulo'));
        $this->assertTrue(Nombres::dudoso('De la Cruz Quintero Victor Manuel'));
        $this->assertTrue(Nombres::dudoso('Florez Guaje Reinner Samuel Yaninn'));
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
