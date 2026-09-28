<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PromocionTest extends TestCase
{
    use RefreshDatabase;

    private User $secretaria;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatosInicialesSeeder::class);
        $this->secretaria = User::factory()->create(['rol_id' => Rol::where('nombre', 'secretaria')->value('id')]);
    }

    private function grado(int $numero): int
    {
        return DB::table('grados')->where('numero', $numero)->value('id');
    }

    private function anioId(int $anio): ?int
    {
        return DB::table('anios_lectivos')->where('anio', $anio)->value('id');
    }

    private function promover(array $datos): array
    {
        $this->actingAs($this->secretaria)
            ->post('/promociones', ['anio' => 2026, ...$datos])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        return session('promocion');
    }

    public function test_un_estudiante_pasa_al_grado_siguiente_en_su_misma_sede_y_jornada()
    {
        // Un estudiante de tercero en Rafael Pombo, jornada de la mañana.
        $m = DB::table('matriculas as m')->join('sedes as s', 's.id', '=', 'm.sede_id')
            ->where('m.anio_lectivo_id', $this->anioId(2026))->where('m.grado_id', $this->grado(3))
            ->where('m.estado', 'activo')->where('s.codigo', 'RP')->where('m.jornada', 'Mañana')
            ->first(['m.*']);

        $resumen = $this->promover(['estudiante_id' => $m->estudiante_id]);

        $this->assertSame(['anio' => 2027, 'promovidos' => 1, 'graduados' => 0], array_intersect_key($resumen, array_flip(['anio', 'promovidos', 'graduados'])));
        $this->assertSame('planeado', DB::table('anios_lectivos')->where('anio', 2027)->value('estado'));

        $nueva = DB::table('matriculas')->where('estudiante_id', $m->estudiante_id)->where('anio_lectivo_id', $this->anioId(2027))->first();
        $this->assertSame($this->grado(4), (int) $nueva->grado_id);
        $this->assertSame((int) $m->sede_id, (int) $nueva->sede_id);
        $this->assertSame('Mañana', $nueva->jornada);
        $this->assertSame('antiguo', $nueva->condicion);
        $this->assertSame('promovido', DB::table('matriculas')->where('id', $m->id)->value('resultado'));

        // Los grupos de cuarto de 2027 se abrieron iguales a los de 2026.
        $this->assertSame(
            DB::table('grupos')->where('anio_lectivo_id', $this->anioId(2026))->where('grado_id', $this->grado(4))->count(),
            DB::table('grupos')->where('anio_lectivo_id', $this->anioId(2027))->where('grado_id', $this->grado(4))->count(),
        );

        // Promoverlo otra vez no hace nada.
        $this->assertSame(0, $this->promover(['estudiante_id' => $m->estudiante_id])['promovidos']);
        $this->assertSame(1, DB::table('matriculas')->where('estudiante_id', $m->estudiante_id)->where('anio_lectivo_id', $this->anioId(2027))->count());
    }

    public function test_todos_pasan_a_su_mismo_grupo_sin_importar_el_cupo()
    {
        $activos = DB::table('matriculas')->where('anio_lectivo_id', $this->anioId(2026))
            ->where('grado_id', $this->grado(10))->where('estado', 'activo')->count();

        $resumen = $this->promover(['grado_id' => $this->grado(10)]);

        $this->assertSame($activos, $resumen['promovidos']);
        $this->assertSame($activos, array_sum(array_column($resumen['reparto'], 'n')));

        // Cada uno pasa a su mismo grupo (10-3 → 11-3), quepa o no. 10-6 no tiene
        // 11-6: esos van de respaldo a los grupos con menos estudiantes.
        $destinos = DB::table('matriculas as m')
            ->join('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->join('matriculas as sig', fn ($j) => $j->on('sig.estudiante_id', '=', 'm.estudiante_id')->where('sig.anio_lectivo_id', $this->anioId(2027)))
            ->join('grupos as gs', 'gs.id', '=', 'sig.grupo_id')
            ->where('m.anio_lectivo_id', $this->anioId(2026))->where('m.grado_id', $this->grado(10))->where('m.estado', 'activo')
            ->get(['g.numero as antes', 'gs.numero as despues']);
        $this->assertSame($activos, $destinos->count());
        foreach ($destinos->groupBy('antes') as $numero => $delGrupo) {
            $existe = DB::table('grupos')->where('anio_lectivo_id', $this->anioId(2027))->where('grado_id', $this->grado(11))->where('numero', $numero)->exists();
            $this->assertSame($existe ? $delGrupo->count() : 0, $delGrupo->where('despues', $numero)->count(), "10-{$numero} → 11-{$numero}");
        }

        // La alerta cuenta exactamente a los que quedaron por encima del cupo de su grupo.
        $excedidos = DB::table('grupos as g')
            ->leftJoin('matriculas as m', fn ($j) => $j->on('m.grupo_id', '=', 'g.id')->where('m.estado', 'activo'))
            ->where('g.anio_lectivo_id', $this->anioId(2027))->where('g.grado_id', $this->grado(11))
            ->groupBy('g.id', 'g.cupos_proyectados')
            ->selectRaw('count(m.id) as n, g.cupos_proyectados as cupos')
            ->get()
            ->sum(fn ($g) => max(0, $g->n - $g->cupos));
        $this->assertSame((int) $excedidos, $resumen['sobreCupo']);

        // La modalidad técnica se conserva.
        $conModalidad = DB::table('matriculas')->where('anio_lectivo_id', $this->anioId(2027))->whereNotNull('modalidad_id')->count();
        $this->assertSame(
            DB::table('matriculas')->where('anio_lectivo_id', $this->anioId(2026))->where('grado_id', $this->grado(10))->where('estado', 'activo')->whereNotNull('modalidad_id')->count(),
            $conModalidad,
        );
    }

    public function test_aunque_su_grupo_este_lleno_pasa_a_el_y_se_avisa()
    {
        $anio = $this->anioId(2026);
        $decimo = $this->grado(10);

        // Abre 2027 con un estudiante de 10-1 y deja 11-1 exactamente lleno.
        $de101 = DB::table('matriculas as m')->join('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->where('m.anio_lectivo_id', $anio)->where('g.grado_id', $decimo)->where('g.numero', 1)->where('m.estado', 'activo')
            ->limit(2)->pluck('m.estudiante_id');
        $this->promover(['estudiante_id' => $de101[0]]);
        $grupo111 = DB::table('grupos')->where('anio_lectivo_id', $this->anioId(2027))->where('grado_id', $this->grado(11))->where('numero', 1)->first();
        DB::table('grupos')->where('id', $grupo111->id)->update(['cupos_proyectados' => 1]);

        $resumen = $this->promover(['estudiante_id' => $de101[1]]);

        $this->assertSame(1, $resumen['promovidos']);
        $this->assertSame(1, $resumen['sobreCupo']);
        $this->assertSame('11-1', $resumen['reparto'][0]['grupo']);
        $this->assertSame(-1, $resumen['reparto'][0]['libres']);
        $this->assertSame($grupo111->id, (int) DB::table('matriculas')->where('estudiante_id', $de101[1])->where('anio_lectivo_id', $this->anioId(2027))->value('grupo_id'));
    }

    public function test_undecimo_se_gradua_y_todo_el_colegio_se_promueve()
    {
        $anio = $this->anioId(2026);
        $undecimo = DB::table('matriculas')->where('anio_lectivo_id', $anio)->where('grado_id', $this->grado(11))->where('estado', 'activo')->count();
        $activos = DB::table('matriculas')->where('anio_lectivo_id', $anio)->where('estado', 'activo')->count();

        $resumen = $this->promover([]);

        $this->assertSame($undecimo, $resumen['graduados']);
        $this->assertSame($activos - $undecimo, $resumen['promovidos']);
        $this->assertSame($undecimo, DB::table('matriculas')->where('anio_lectivo_id', $anio)->where('estado', 'graduado')->count());
        $this->assertSame(0, DB::table('matriculas')->where('anio_lectivo_id', $this->anioId(2027))->where('grado_id', $this->grado(11) + 1)->count());
        $this->assertSame($activos - $undecimo, DB::table('matriculas')->where('anio_lectivo_id', $this->anioId(2027))->count());

        // El panel de 2026 muestra a dónde quedó cada uno.
        $this->actingAs($this->secretaria)->get('/estudiantes?anio=2026&grado='.$this->grado(9))
            ->assertInertia(fn ($page) => $page->where('estudiantes.0.promovido_a', fn ($g) => str_starts_with((string) $g, '10-')));
    }

    public function test_solo_desde_el_anio_en_curso_y_no_los_docentes()
    {
        $this->actingAs($this->secretaria)->post('/promociones', ['anio' => 2025])->assertSessionHasErrors('promocion');

        $docente = User::factory()->create(['rol_id' => Rol::where('nombre', 'docente')->value('id')]);
        $this->actingAs($docente)->post('/promociones', ['anio' => 2026])->assertForbidden();

        $this->assertNull($this->anioId(2027));
    }

    public function test_la_promocion_se_puede_deshacer()
    {
        $antes = DB::table('matriculas')->where('anio_lectivo_id', $this->anioId(2026))
            ->selectRaw('estado, count(*) as n')->groupBy('estado')->pluck('n', 'estado')->all();
        $total = DB::table('matriculas')->count();

        $this->promover([]);
        $this->artisan('sieage:revertir-promocion', ['--force' => true])->assertSuccessful();

        $this->assertSame($antes, DB::table('matriculas')->where('anio_lectivo_id', $this->anioId(2026))
            ->selectRaw('estado, count(*) as n')->groupBy('estado')->pluck('n', 'estado')->all());
        $this->assertSame(0, DB::table('matriculas')->where('anio_lectivo_id', $this->anioId(2026))->where('resultado', 'promovido')->count());
        $this->assertSame($total, DB::table('matriculas')->count());
        $this->assertNull($this->anioId(2027));

        // Y se puede volver a promover.
        $this->assertGreaterThan(0, $this->promover([])['promovidos']);
    }
}
