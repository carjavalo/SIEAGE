<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Support\Alcance;
use App\Support\Boletines;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** En Transición, un usuario puede ver solo algunos grupos (0-1, 0-2…). Datos inventados. */
class AlcanceGruposTest extends TestCase
{
    use RefreshDatabase;

    private int $sede;

    private int $anio;

    private int $transicion;

    /** @var array<string, int> grupos por código */
    private array $grupos = [];

    /** @var array<string, int> estudiantes por grupo */
    private array $est = [];

    protected function setUp(): void
    {
        parent::setUp();

        DB::table('instituciones')->insert(['id' => 1, 'nombre' => 'Institución de prueba']);
        $this->sede = DB::table('sedes')->insertGetId(['institucion_id' => 1, 'codigo' => 'AA', 'nombre' => 'Sede A']);
        $this->anio = DB::table('anios_lectivos')->insertGetId(['anio' => 2026, 'estado' => 'activo']);
        $this->transicion = DB::table('grados')->insertGetId(['numero' => 0, 'nombre' => 'Transición', 'nivel' => 'preescolar']);
        DB::table('grados')->insert(['numero' => 1, 'nombre' => 'Primero', 'nivel' => 'primaria']);

        foreach ([1, 2] as $n) {
            $codigo = "0-{$n}";
            $this->grupos[$codigo] = DB::table('grupos')->insertGetId(['anio_lectivo_id' => $this->anio, 'sede_id' => $this->sede, 'grado_id' => $this->transicion, 'numero' => $n, 'codigo' => $codigo, 'jornada' => 'Mañana']);
            $this->est[$codigo] = DB::table('estudiantes')->insertGetId([
                'tipo_documento' => 'R.C.', 'numero_documento' => (string) (1000000 + $n), 'nombre_completo' => "Grupo {$n} Prueba",
                'primer_apellido' => 'Prueba', 'primer_nombre' => "Grupo {$n}",
            ]);
            DB::table('matriculas')->insert(['estudiante_id' => $this->est[$codigo], 'anio_lectivo_id' => $this->anio, 'grado_id' => $this->transicion, 'grupo_id' => $this->grupos[$codigo], 'sede_id' => $this->sede, 'estado' => 'activo']);
        }
        // Uno de Transición todavía sin grupo.
        $this->est['sin grupo'] = DB::table('estudiantes')->insertGetId(['tipo_documento' => 'R.C.', 'numero_documento' => '1000009', 'nombre_completo' => 'Sin Grupo Prueba']);
        DB::table('matriculas')->insert(['estudiante_id' => $this->est['sin grupo'], 'anio_lectivo_id' => $this->anio, 'grado_id' => $this->transicion, 'grupo_id' => null, 'sede_id' => $this->sede, 'estado' => 'activo']);
    }

    /** Sede A, Transición, solo el grupo 0-1. */
    private function profe(): User
    {
        $u = User::factory()->create(['rol_id' => Rol::where('nombre', 'secretaria')->value('id'), 'todas_las_sedes' => false]);
        DB::table('sede_user')->insert(['user_id' => $u->id, 'sede_id' => $this->sede]);
        DB::table('sede_user_grado')->insert(['user_id' => $u->id, 'sede_id' => $this->sede, 'grado_id' => $this->transicion]);
        DB::table('sede_user_grupo')->insert(['user_id' => $u->id, 'sede_id' => $this->sede, 'grado_id' => $this->transicion, 'numero' => 1]);

        return $u;
    }

    public function test_solo_ve_los_estudiantes_y_grupos_marcados()
    {
        $profe = $this->profe();
        $this->assertTrue(Alcance::puedeVerEstudiante($profe, $this->est['0-1']));
        $this->assertFalse(Alcance::puedeVerEstudiante($profe, $this->est['0-2']));
        $this->assertFalse(Alcance::puedeVerEstudiante($profe, $this->est['sin grupo']));
        $this->assertTrue(Alcance::puedeVer($profe, $this->sede, $this->transicion, $this->grupos['0-1']));
        $this->assertFalse(Alcance::puedeVer($profe, $this->sede, $this->transicion, $this->grupos['0-2']));
        $this->assertFalse(Alcance::veGradoCompleto($profe, $this->sede, $this->transicion));

        $this->actingAs($profe)->get("/estudiantes/{$this->est['0-1']}")->assertOk();
        $this->actingAs($profe)->get("/estudiantes/{$this->est['0-2']}")->assertNotFound();

        $this->actingAs($profe)->get("/estudiantes?anio=2026&grado={$this->transicion}")->assertInertia(fn (Assert $page) => $page
            ->where('estudiantes', fn ($e) => collect($e)->pluck('nombre')->all() === ['Grupo 1 Prueba'])
            ->where('grupos', fn ($g) => collect($g)->pluck('codigo')->all() === ['0-1'])
            ->etc());

        // Los boletines de Transición, igual: solo su grupo.
        $this->assertSame(['0-1'], Boletines::grupos($profe, $this->anio)->pluck('codigo')->all());

        // Sin grupos marcados, vuelve a ver todo el grado.
        DB::table('sede_user_grupo')->delete();
        Alcance::olvidar($profe);
        $this->assertTrue(Alcance::puedeVerEstudiante($profe, $this->est['0-2']));
        $this->assertTrue(Alcance::veGradoCompleto($profe, $this->sede, $this->transicion));
    }

    public function test_no_actua_sobre_el_grado_entero_ni_sobre_otro_grupo()
    {
        $profe = $this->profe();
        $this->actingAs($profe)->post('/promociones', ['anio' => 2026, 'grado_id' => $this->transicion])->assertSessionHasErrors('grupo_id');
        $this->actingAs($profe)->post('/promociones', ['anio' => 2026, 'sede' => 'AA', 'grado_id' => $this->transicion])->assertSessionHasErrors('grupo_id');
        $this->actingAs($profe)->post('/promociones/revertir', ['anio' => 2026, 'grupo_id' => $this->grupos['0-2']])->assertNotFound();
    }

    public function test_en_usuarios_se_marcan_los_grupos_de_transicion()
    {
        $admin = User::factory()->create(['rol_id' => Rol::where('nombre', 'administrador')->value('id')]);
        $datos = [
            'name' => 'Docente Cero Uno', 'usuario' => 'cero.uno', 'rol_id' => Rol::where('nombre', 'docente')->value('id'), 'password' => 'clave-de-prueba-1',
            'sedes' => [$this->sede], 'grados' => [$this->sede => [$this->transicion]],
            // El 7 de un grado no marcado no se guarda.
            'grupos' => [$this->sede => [$this->transicion => [2], 99 => [7]]],
        ];
        $this->actingAs($admin)->post('/usuarios', $datos)->assertSessionHasNoErrors();
        $nuevo = User::where('usuario', 'cero.uno')->firstOrFail();
        $this->assertSame([2], DB::table('sede_user_grupo')->where('user_id', $nuevo->id)->pluck('numero')->map(fn ($n) => (int) $n)->all());
        $this->assertTrue(Alcance::puedeVerEstudiante($nuevo, $this->est['0-2']));
        $this->assertFalse(Alcance::puedeVerEstudiante($nuevo, $this->est['0-1']));

        // La pantalla recibe sus grupos y los de Transición de cada sede.
        $this->actingAs($admin)->get('/usuarios')->assertInertia(fn (Assert $page) => $page
            ->where('usuarios', fn ($u) => collect($u)->firstWhere('usuario', 'cero.uno')['grupos'] == [$this->sede => [$this->transicion => [2]]])
            ->where('sedes', fn ($s) => collect($s)->firstWhere('codigo', 'AA')['grupos'] == [$this->transicion => [['numero' => 1, 'codigo' => '0-1'], ['numero' => 2, 'codigo' => '0-2']]])
            ->etc());

        // Quitar el grado se lleva sus grupos.
        $this->actingAs($admin)->put("/usuarios/{$nuevo->id}", [...$datos, 'grados' => [], 'activo' => true])->assertSessionHasNoErrors();
        $this->assertSame(0, DB::table('sede_user_grupo')->where('user_id', $nuevo->id)->count());
    }

    public function test_inscritos_ya_matriculados_en_otro_grupo_no_los_ve()
    {
        $profe = $this->profe();
        $base = ['primer_nombre' => 'A', 'primer_apellido' => 'B', 'sexo' => 'F', 'pais_nacimiento' => 'Colombia', 'ciudad_nacimiento' => 'Cali',
            'fecha_nacimiento' => '2021-01-01', 'tipo_documento' => 'R.C.', 'ciudad_expedicion' => 'Cali', 'tipo_sangre' => 'O+', 'sisben' => '1',
            'eps' => 'X', 'grupo_etnico' => 'Mestizo', 'direccion' => 'C', 'barrio' => 'B', 'telefono_1' => '3000000000', 'telefono_2' => '3000000000',
            'correo' => 'a@b.co', 'acudiente_primer_nombre' => 'C', 'acudiente_primer_apellido' => 'D', 'acudiente_fecha_nacimiento' => '1980-01-01',
            'acudiente_numero_documento' => '99999', 'acudiente_ciudad_expedicion' => 'Cali', 'acudiente_parentesco_id' => DB::table('parentescos')->insertGetId(['nombre' => 'Madre']),
            'acudiente_telefono_1' => '3000000000', 'acudiente_telefono_2' => '3000000000', 'autorizo_datos_en' => now(),
            'anio_lectivo_id' => $this->anio, 'grado_id' => $this->transicion, 'sede_preferida_id' => $this->sede, 'created_at' => now(), 'updated_at' => now()];
        $matricula = fn (string $g) => DB::table('matriculas')->where('estudiante_id', $this->est[$g])->value('id');
        $suya = DB::table('solicitudes_inscripcion')->insertGetId([...$base, 'numero_documento' => '2001', 'estado' => 'aprobada', 'matricula_id' => $matricula('0-1')]);
        $ajena = DB::table('solicitudes_inscripcion')->insertGetId([...$base, 'numero_documento' => '2002', 'estado' => 'aprobada', 'matricula_id' => $matricula('0-2')]);
        $pendiente = DB::table('solicitudes_inscripcion')->insertGetId([...$base, 'numero_documento' => '2003', 'estado' => 'pendiente']);

        $ven = Alcance::filtrarSolicitudes(DB::table('solicitudes_inscripcion as s'), $profe)->orderBy('s.id')->pluck('s.id')->all();
        $this->assertSame([$suya, $pendiente], array_map('intval', $ven));
        $this->actingAs($profe)->post("/inscritos/{$ajena}/devolver")->assertNotFound();
        $this->assertNotNull($matricula('0-2'));
    }

    public function test_quien_gestiona_usuarios_no_da_mas_grupos_de_los_que_tiene()
    {
        $gestor = Rol::create(['nombre' => 'gestor', 'etiqueta' => 'Gestor']);
        DB::table('rol_permiso')->insert(['rol_id' => $gestor->id, 'permiso' => 'gestionar-usuarios']);
        $yo = User::factory()->create(['rol_id' => $gestor->id, 'todas_las_sedes' => false]);
        DB::table('sede_user')->insert(['user_id' => $yo->id, 'sede_id' => $this->sede]);
        DB::table('sede_user_grado')->insert(['user_id' => $yo->id, 'sede_id' => $this->sede, 'grado_id' => $this->transicion]);
        DB::table('sede_user_grupo')->insert(['user_id' => $yo->id, 'sede_id' => $this->sede, 'grado_id' => $this->transicion, 'numero' => 1]);

        $base = ['name' => 'Otro', 'usuario' => 'otro.prueba', 'rol_id' => $gestor->id, 'password' => 'clave-de-prueba-1', 'sedes' => [$this->sede]];
        // Toda la sede, todo Transición u otro grupo: más de lo que tiene.
        $this->actingAs($yo)->post('/usuarios', $base)->assertSessionHasErrors('sedes');
        $this->actingAs($yo)->post('/usuarios', [...$base, 'grados' => [$this->sede => [$this->transicion]]])->assertSessionHasErrors('sedes');
        $this->actingAs($yo)->post('/usuarios', [...$base, 'grados' => [$this->sede => [$this->transicion]], 'grupos' => [$this->sede => [$this->transicion => [2]]]])->assertSessionHasErrors('sedes');
        // Su mismo grupo, sí.
        $this->actingAs($yo)->post('/usuarios', [...$base, 'grados' => [$this->sede => [$this->transicion]], 'grupos' => [$this->sede => [$this->transicion => [1]]]])->assertSessionHasNoErrors();
    }

    public function test_el_mismo_grupo_en_dos_sedes_se_guarda()
    {
        $otra = DB::table('sedes')->insertGetId(['institucion_id' => 1, 'codigo' => 'BB', 'nombre' => 'Sede B']);
        $admin = User::factory()->create(['rol_id' => Rol::where('nombre', 'administrador')->value('id')]);
        $this->actingAs($admin)->post('/usuarios', [
            'name' => 'Dos Sedes', 'usuario' => 'dos.sedes', 'rol_id' => Rol::where('nombre', 'docente')->value('id'), 'password' => 'clave-de-prueba-1',
            'sedes' => [$this->sede, $otra], 'grados' => [$this->sede => [$this->transicion], $otra => [$this->transicion]],
            'grupos' => [$this->sede => [$this->transicion => [1]], $otra => [$this->transicion => [1]]],
        ])->assertSessionHasNoErrors();
        $this->assertSame(2, DB::table('sede_user_grupo')->count());
    }
}
