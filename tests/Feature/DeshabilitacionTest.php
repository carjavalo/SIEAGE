<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DeshabilitacionTest extends TestCase
{
    use RefreshDatabase;

    private User $secretaria;

    private object $matricula;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatosInicialesSeeder::class);
        $this->secretaria = User::factory()->create(['rol_id' => Rol::where('nombre', 'secretaria')->value('id')]);

        // Un estudiante activo de noveno en el año en curso.
        $this->matricula = DB::table('matriculas as m')->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->join('grados as g', 'g.id', '=', 'm.grado_id')
            ->where('al.estado', 'activo')->where('m.estado', 'activo')->where('g.numero', 9)
            ->first(['m.id', 'm.estudiante_id']);
    }

    private function actual(): object
    {
        return DB::table('matriculas')->where('id', $this->matricula->id)->first();
    }

    public function test_deshabilita_con_motivo_razon_y_fecha_y_deja_constancia()
    {
        $this->actingAs($this->secretaria)
            ->post("/estudiantes/{$this->matricula->estudiante_id}/deshabilitar", [
                'motivo' => 'retiro', 'razon' => '  La familia se mudó a Jamundí.  ', 'fecha' => '2026-09-15',
            ])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $m = $this->actual();
        $this->assertSame('retirado', $m->estado);
        $this->assertSame('2026-09-15', $m->fecha_retiro);
        $this->assertSame('La familia se mudó a Jamundí.', $m->motivo_retiro);
        $this->assertSame($this->secretaria->id, (int) $m->deshabilitado_por);
        $this->assertNotNull($m->deshabilitado_en);
        $this->assertDatabaseHas('novedades_matricula', [
            'matricula_id' => $this->matricula->id, 'tipo' => 'deshabilitada', 'estado_anterior' => 'activo',
            'estado_nuevo' => 'retirado', 'user_id' => $this->secretaria->id,
        ]);

        // La ficha muestra el historial.
        $this->actingAs($this->secretaria)->get("/estudiantes/{$this->matricula->estudiante_id}")
            ->assertInertia(fn (Assert $page) => $page->where('novedades.0.tipo', 'deshabilitada')->where('novedades.0.usuario', $this->secretaria->name));

        // Ya deshabilitado: no se puede otra vez.
        $this->actingAs($this->secretaria)
            ->post("/estudiantes/{$this->matricula->estudiante_id}/deshabilitar", ['motivo' => 'otro', 'razon' => 'Otra vez', 'fecha' => '2026-09-16'])
            ->assertSessionHasErrors('razon');
    }

    public function test_la_razon_y_el_motivo_son_obligatorios()
    {
        $this->actingAs($this->secretaria)
            ->post("/estudiantes/{$this->matricula->estudiante_id}/deshabilitar", ['motivo' => '', 'razon' => 'no', 'fecha' => now()->addDay()->toDateString()])
            ->assertSessionHasErrors(['motivo', 'razon', 'fecha']);

        $this->assertSame('activo', $this->actual()->estado);
        $this->assertDatabaseCount('novedades_matricula', 0);
    }

    public function test_perdio_el_anio_no_se_promueve_y_quita_la_promocion_hecha()
    {
        // Lo promueven primero y después se sabe que perdió el año.
        $this->actingAs($this->secretaria)->post('/promociones', ['anio' => 2026, 'estudiante_id' => $this->matricula->estudiante_id]);
        $siguiente = DB::table('anios_lectivos')->where('anio', 2027)->value('id');
        $this->assertDatabaseHas('matriculas', ['estudiante_id' => $this->matricula->estudiante_id, 'anio_lectivo_id' => $siguiente]);

        $this->actingAs($this->secretaria)
            ->post("/estudiantes/{$this->matricula->estudiante_id}/deshabilitar", ['motivo' => 'perdio', 'razon' => 'Perdió cinco materias.', 'fecha' => '2026-09-20'])
            ->assertSessionHasNoErrors();

        $this->assertSame('reprobado', $this->actual()->estado);
        $this->assertSame('reprobado', $this->actual()->resultado);
        $this->assertDatabaseMissing('matriculas', ['estudiante_id' => $this->matricula->estudiante_id, 'anio_lectivo_id' => $siguiente]);

        $this->actingAs($this->secretaria)->post('/promociones', ['anio' => 2026, 'estudiante_id' => $this->matricula->estudiante_id]);
        $this->assertSame(0, session('promocion')['promovidos']);
    }

    public function test_se_puede_volver_a_habilitar()
    {
        $id = $this->matricula->estudiante_id;
        $this->actingAs($this->secretaria)->post("/estudiantes/{$id}/deshabilitar", ['motivo' => 'traslado', 'razon' => 'Trasladado a otro colegio.', 'fecha' => '2026-09-01']);
        $this->assertSame('trasladado', $this->actual()->estado);

        $this->actingAs($this->secretaria)->post("/estudiantes/{$id}/habilitar", ['razon' => ''])->assertSessionHasErrors('razon');
        $this->actingAs($this->secretaria)->post("/estudiantes/{$id}/habilitar", ['razon' => 'Fue un error, sigue asistiendo.'])->assertSessionHasNoErrors();

        $m = $this->actual();
        $this->assertSame('activo', $m->estado);
        $this->assertNull($m->fecha_retiro);
        $this->assertNull($m->motivo_retiro);
        $this->assertNull($m->deshabilitado_por);
        $this->assertSame(['habilitada', 'deshabilitada'], DB::table('novedades_matricula')->where('matricula_id', $m->id)->orderByDesc('id')->pluck('tipo')->all());

        // Activo otra vez: se puede promover.
        $this->actingAs($this->secretaria)->post('/promociones', ['anio' => 2026, 'estudiante_id' => $id]);
        $this->assertSame(1, session('promocion')['promovidos']);
    }

    public function test_los_docentes_no_pueden()
    {
        $docente = User::factory()->create(['rol_id' => Rol::where('nombre', 'docente')->value('id')]);

        $this->actingAs($docente)
            ->post("/estudiantes/{$this->matricula->estudiante_id}/deshabilitar", ['motivo' => 'retiro', 'razon' => 'Se retiró.', 'fecha' => '2026-09-15'])
            ->assertForbidden();
        $this->actingAs($docente)->get('/estudiantes')->assertInertia(fn (Assert $page) => $page->where('auth.puedeDeshabilitar', false));
        $this->assertSame('activo', $this->actual()->estado);
    }
}
