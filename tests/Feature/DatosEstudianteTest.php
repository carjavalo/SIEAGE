<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Corregir desde la ficha los datos del estudiante y de sus acudientes. */
class DatosEstudianteTest extends TestCase
{
    use RefreshDatabase;

    private User $secretaria;

    /** Un estudiante con un solo acudiente, que además es acudiente de otro estudiante. */
    private object $vinculo;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatosInicialesSeeder::class);
        $this->secretaria = $this->usuario('secretaria');

        $compartido = DB::table('estudiante_acudiente')->groupBy('acudiente_id')->havingRaw('count(*) > 1')->value('acudiente_id');
        $this->vinculo = DB::table('estudiante_acudiente')->where('acudiente_id', $compartido)->orderBy('estudiante_id')->first();
    }

    private function usuario(string $rol): User
    {
        return User::factory()->create(['rol_id' => Rol::where('nombre', $rol)->value('id')]);
    }

    /** Lo que mandaría el diálogo del estudiante sin tocar nada. */
    private function formularioEstudiante(int $id, array $cambios = []): array
    {
        $e = DB::table('estudiantes')->find($id);

        return [
            'nombre_completo' => $e->nombre_completo, 'tipo_documento' => $e->tipo_documento, 'tipo_documento_otro' => $e->tipo_documento_otro,
            'numero_documento' => $e->numero_documento, 'fecha_nacimiento' => $e->fecha_nacimiento, 'genero' => $e->genero,
            'ciudad_expedicion' => $e->ciudad_expedicion, 'pais_nacimiento' => $e->pais_nacimiento, 'ciudad_nacimiento' => $e->ciudad_nacimiento,
            'tipo_sangre' => $e->tipo_sangre, 'sisben' => $e->sisben, 'eps' => $e->eps, 'grupo_etnico' => $e->grupo_etnico,
            'discapacidad' => $e->discapacidad, 'direccion' => $e->direccion,
            'barrio' => DB::table('barrios')->where('id', $e->barrio_id)->value('nombre'),
            'telefono_1' => $e->telefono_1, 'telefono_2' => $e->telefono_2, 'correo' => $e->correo, 'tiene_foto' => (bool) $e->tiene_foto,
            ...$cambios,
        ];
    }

    /** Lo que mandaría el diálogo del acudiente sin tocar nada. */
    private function formularioAcudiente(int $estudianteId, int $acudienteId, array $cambios = []): array
    {
        $a = DB::table('acudientes')->find($acudienteId);
        $v = DB::table('estudiante_acudiente')->where(['estudiante_id' => $estudianteId, 'acudiente_id' => $acudienteId])->first();

        return [
            'nombre_completo' => $a->nombre_completo, 'tipo_documento' => $a->tipo_documento, 'numero_documento' => $a->numero_documento,
            'parentesco_id' => $v->parentesco_id, 'parentesco_otro' => $v->parentesco_otro,
            'telefono_celular' => $a->telefono_celular, 'telefono_fijo' => $a->telefono_fijo, 'email' => $a->email,
            'direccion' => $a->direccion, 'barrio' => DB::table('barrios')->where('id', $a->barrio_id)->value('nombre'),
            'es_principal' => (bool) $v->es_principal,
            ...$cambios,
        ];
    }

    private function nuevoAcudiente(array $cambios = []): array
    {
        return [
            'primer_nombre' => 'Rosa', 'segundo_nombre' => 'Elena', 'primer_apellido' => 'Prueba', 'segundo_apellido' => null,
            'tipo_documento' => 'C.C.', 'numero_documento' => '99.000.111', 'telefono_celular' => '300 555 0101', 'telefono_fijo' => null,
            'email' => null, 'direccion' => 'Calle 1 # 2-3', 'barrio' => 'Barrio de Prueba',
            'parentesco_id' => DB::table('parentescos')->where('nombre', 'Abuela(o)')->value('id'), 'es_principal' => false,
            ...$cambios,
        ];
    }

    public function test_corrige_los_datos_del_estudiante_y_deja_el_valor_anterior_en_el_historial()
    {
        $id = $this->vinculo->estudiante_id;
        $antes = DB::table('estudiantes')->find($id);

        $this->actingAs($this->secretaria)
            ->put("/estudiantes/{$id}", $this->formularioEstudiante($id, [
                'nombre_completo' => '  Prueba   Corregida Ana ', 'eps' => 'Emssanar', 'telefono_1' => '310 555 0102', 'barrio' => 'Barrio de Prueba',
                'sisben' => '2', 'tiene_foto' => true,
            ]))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $e = DB::table('estudiantes')->find($id);
        $this->assertSame('Prueba Corregida Ana', $e->nombre_completo);
        $this->assertSame('Emssanar', $e->eps);
        $this->assertSame('3105550102', $e->telefono_1);
        $this->assertSame('2', $e->sisben);
        $this->assertSame(1, (int) $e->tiene_foto);
        $this->assertSame('Barrio de Prueba', DB::table('barrios')->where('id', $e->barrio_id)->value('nombre'));
        // Lo que no se tocó sigue igual.
        $this->assertSame($antes->numero_documento, $e->numero_documento);
        $this->assertSame($antes->fecha_nacimiento, $e->fecha_nacimiento);

        $cambio = DB::table('cambios_ficha')->where('estudiante_id', $id)->first();
        $this->assertSame('estudiante_editado', $cambio->accion);
        $this->assertSame($this->secretaria->id, (int) $cambio->user_id);
        $campos = json_decode($cambio->cambios, true);
        $this->assertSame([$antes->nombre_completo, 'Prueba Corregida Ana'], $campos['nombre_completo']);
        $this->assertSame([null, 'Emssanar'], $campos['eps']);
        $this->assertArrayHasKey('barrio', $campos);
        $this->assertArrayNotHasKey('numero_documento', $campos);

        // La ficha dice quién fue el último en editar.
        $this->actingAs($this->secretaria)->get("/estudiantes/{$id}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('estudiante.ultima_edicion.usuario', $this->secretaria->name)
                ->where('estudiante.barrio', 'Barrio de Prueba')
                ->has('parentescos', DB::table('parentescos')->count()));
    }

    public function test_guardar_sin_cambios_no_deja_nada_en_el_historial()
    {
        $id = $this->vinculo->estudiante_id;

        $this->actingAs($this->secretaria)->put("/estudiantes/{$id}", $this->formularioEstudiante($id))
            ->assertSessionHasNoErrors()->assertSessionHas('success', 'No había nada que cambiar.');

        $this->assertDatabaseCount('cambios_ficha', 0);
    }

    public function test_los_docentes_no_pueden_editar_y_sin_sesion_tampoco()
    {
        $id = $this->vinculo->estudiante_id;
        $datos = $this->formularioEstudiante($id, ['eps' => 'Otra']);

        $this->put("/estudiantes/{$id}", $datos)->assertRedirect('/login');
        $this->actingAs($this->usuario('docente'))->put("/estudiantes/{$id}", $datos)->assertForbidden();
        $this->actingAs($this->usuario('docente'))->postJson('/acudientes/buscar', ['documento' => '12345'])->assertForbidden();
        $this->assertNull(DB::table('estudiantes')->where('id', $id)->value('eps'));
    }

    public function test_valida_el_documento_repetido_y_los_formatos()
    {
        $id = $this->vinculo->estudiante_id;
        $otro = DB::table('estudiantes')->where('id', '<>', $id)->value('numero_documento');

        $this->actingAs($this->secretaria)
            ->put("/estudiantes/{$id}", $this->formularioEstudiante($id, [
                'numero_documento' => $otro, 'nombre_completo' => 'Ana 123', 'fecha_nacimiento' => '2999-01-01', 'telefono_1' => '12', 'correo' => 'no-es-correo',
                'sisben' => '7',
            ]))
            ->assertSessionHasErrors(['numero_documento', 'nombre_completo', 'fecha_nacimiento', 'telefono_1', 'correo', 'sisben']);

        $this->assertDatabaseCount('cambios_ficha', 0);
    }

    public function test_un_nombre_en_cuatro_partes_se_arma_con_los_apellidos_primero()
    {
        $id = $this->vinculo->estudiante_id;
        DB::table('estudiantes')->where('id', $id)->update([
            'primer_apellido' => 'Prueba', 'segundo_apellido' => 'Uno', 'primer_nombre' => 'Ana', 'segundo_nombre' => null, 'nombre_completo' => 'Prueba Uno Ana',
        ]);
        $datos = $this->formularioEstudiante($id, ['primer_apellido' => 'Prueba', 'segundo_apellido' => 'Dos', 'primer_nombre' => 'Ana', 'segundo_nombre' => 'María']);
        unset($datos['nombre_completo']);

        $this->actingAs($this->secretaria)->put("/estudiantes/{$id}", $datos)->assertSessionHasNoErrors();

        $e = DB::table('estudiantes')->find($id);
        $this->assertSame('Prueba Dos Ana María', $e->nombre_completo);
        $this->assertSame('Dos', $e->segundo_apellido);
        $this->assertSame('María', $e->segundo_nombre);
    }

    public function test_corregir_al_acudiente_vale_para_todos_sus_estudiantes()
    {
        ['estudiante_id' => $id, 'acudiente_id' => $acudiente] = (array) $this->vinculo;
        $hermano = DB::table('estudiante_acudiente')->where('acudiente_id', $acudiente)->where('estudiante_id', '<>', $id)->value('estudiante_id');

        // La ficha avisa con quién más lo comparte.
        $this->actingAs($this->secretaria)->get("/estudiantes/{$id}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('acudientes.0.id', $acudiente)
                ->where('acudientes.0.otros_estudiantes.0.nombre', fn ($n) => is_string($n) && $n !== ''));

        $this->actingAs($this->secretaria)
            ->put("/estudiantes/{$id}/acudientes/{$acudiente}", $this->formularioAcudiente($id, $acudiente, [
                'telefono_celular' => '311 555 0103', 'email' => 'prueba@correo.com',
                'parentesco_id' => DB::table('parentescos')->where('nombre', 'Otro')->value('id'), 'parentesco_otro' => 'Madrina',
            ]))
            ->assertSessionHasNoErrors();

        $this->assertSame('3115550103', DB::table('acudientes')->where('id', $acudiente)->value('telefono_celular'));
        // El teléfono es de la persona: el hermano lo ve igual. El parentesco es de cada estudiante.
        $this->actingAs($this->secretaria)->get("/estudiantes/{$hermano}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('acudientes.0.telefono_celular', '3115550103')
                ->where('acudientes.0.parentesco', fn ($p) => $p !== 'Otro')
                ->where('acudientes.0.ultima_edicion.usuario', $this->secretaria->name));
        $this->assertSame('Madrina', DB::table('estudiante_acudiente')->where(['estudiante_id' => $id, 'acudiente_id' => $acudiente])->value('parentesco_otro'));

        $campos = json_decode(DB::table('cambios_ficha')->where('acudiente_id', $acudiente)->value('cambios'), true);
        $this->assertSame('Otro', $campos['parentesco'][1]);
        $this->assertSame('3115550103', $campos['telefono_celular'][1]);
    }

    public function test_lo_importado_con_formato_raro_no_impide_corregir_otro_campo()
    {
        ['estudiante_id' => $id, 'acudiente_id' => $acudiente] = (array) $this->vinculo;
        DB::table('acudientes')->where('id', $acudiente)->update(['telefono_fijo' => '555 01 04 ext. 2', 'numero_documento' => 'CC-77.001']);

        $this->actingAs($this->secretaria)
            ->put("/estudiantes/{$id}/acudientes/{$acudiente}", $this->formularioAcudiente($id, $acudiente, ['direccion' => 'Carrera 9 # 9-99']))
            ->assertSessionHasNoErrors();
        $a = DB::table('acudientes')->find($acudiente);
        $this->assertSame('Carrera 9 # 9-99', $a->direccion);
        $this->assertSame('555 01 04 ext. 2', $a->telefono_fijo);

        // Pero si se toca, tiene que quedar bien.
        $this->actingAs($this->secretaria)
            ->put("/estudiantes/{$id}/acudientes/{$acudiente}", $this->formularioAcudiente($id, $acudiente, ['telefono_fijo' => '555 ext 3']))
            ->assertSessionHasErrors('telefono_fijo');
    }

    public function test_agrega_un_acudiente_nuevo_y_lo_puede_dejar_como_principal()
    {
        $id = $this->vinculo->estudiante_id;

        $this->actingAs($this->secretaria)->post("/estudiantes/{$id}/acudientes", $this->nuevoAcudiente())->assertSessionHasNoErrors();

        $nuevo = DB::table('acudientes')->where('numero_documento', '99000111')->first();
        $this->assertSame('Rosa Elena Prueba', $nuevo->nombre_completo);
        $this->assertSame('3005550101', $nuevo->telefono_celular);
        $lazo = fn (int $acudiente) => DB::table('estudiante_acudiente')->where(['estudiante_id' => $id, 'acudiente_id' => $acudiente])->first();
        $this->assertSame(0, (int) $lazo($nuevo->id)->es_principal);
        $this->assertSame(1, (int) $lazo($this->vinculo->acudiente_id)->es_principal);
        $this->assertDatabaseHas('cambios_ficha', ['estudiante_id' => $id, 'acudiente_id' => $nuevo->id, 'accion' => 'acudiente_agregado']);

        // Marcarlo como principal le quita la marca al otro; siempre queda uno solo.
        $this->actingAs($this->secretaria)
            ->put("/estudiantes/{$id}/acudientes/{$nuevo->id}", [
                'primer_nombre' => 'Rosa', 'segundo_nombre' => 'Elena', 'primer_apellido' => 'Prueba', 'segundo_apellido' => null,
                ...array_diff_key($this->formularioAcudiente($id, $nuevo->id, ['es_principal' => true]), ['nombre_completo' => 1]),
            ])
            ->assertSessionHasNoErrors();
        $this->assertSame(1, (int) $lazo($nuevo->id)->es_principal);
        $this->assertSame(0, (int) $lazo($this->vinculo->acudiente_id)->es_principal);
        $this->assertSame(1, (int) DB::table('estudiante_acudiente')->where('estudiante_id', $id)->sum('es_principal'));
    }

    public function test_si_el_documento_ya_esta_registrado_se_vincula_a_esa_persona_con_sus_datos()
    {
        $id = $this->vinculo->estudiante_id;
        $existente = DB::table('acudientes')->where('id', '<>', $this->vinculo->acudiente_id)->first();
        $cuantos = DB::table('acudientes')->count();

        $this->actingAs($this->secretaria)->postJson('/acudientes/buscar', ['documento' => $existente->numero_documento, 'estudiante' => $id])
            ->assertOk()
            ->assertJsonPath('acudiente.id', $existente->id)
            ->assertJsonPath('acudiente.ya_vinculado', false);
        $this->actingAs($this->secretaria)->postJson('/acudientes/buscar', ['documento' => '99.000.111'])->assertOk()->assertJsonPath('acudiente', null);

        $this->actingAs($this->secretaria)
            ->post("/estudiantes/{$id}/acudientes", $this->nuevoAcudiente(['numero_documento' => $existente->numero_documento]))
            ->assertSessionHasNoErrors();

        $this->assertSame($cuantos, DB::table('acudientes')->count());
        $this->assertSame($existente->nombre_completo, DB::table('acudientes')->where('id', $existente->id)->value('nombre_completo'));
        $this->assertDatabaseHas('estudiante_acudiente', ['estudiante_id' => $id, 'acudiente_id' => $existente->id, 'es_principal' => 0]);

        // Dos veces el mismo, no.
        $this->actingAs($this->secretaria)
            ->post("/estudiantes/{$id}/acudientes", ['acudiente_id' => $existente->id, 'parentesco_id' => 1])
            ->assertSessionHasErrors('numero_documento');
    }

    public function test_quitar_un_acudiente_nunca_deja_al_estudiante_sin_ninguno_ni_sin_principal()
    {
        ['estudiante_id' => $id, 'acudiente_id' => $acudiente] = (array) $this->vinculo;

        $this->actingAs($this->secretaria)->delete("/estudiantes/{$id}/acudientes/{$acudiente}")->assertSessionHasErrors('quitar');
        $this->assertDatabaseHas('estudiante_acudiente', ['estudiante_id' => $id, 'acudiente_id' => $acudiente]);

        $this->actingAs($this->secretaria)->post("/estudiantes/{$id}/acudientes", $this->nuevoAcudiente());
        $nuevo = DB::table('acudientes')->where('numero_documento', '99000111')->value('id');

        // Se quita el principal: el que queda pasa a serlo. Sigue siendo acudiente del otro estudiante.
        $this->actingAs($this->secretaria)->delete("/estudiantes/{$id}/acudientes/{$acudiente}")->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('estudiante_acudiente', ['estudiante_id' => $id, 'acudiente_id' => $acudiente]);
        $this->assertDatabaseHas('estudiante_acudiente', ['estudiante_id' => $id, 'acudiente_id' => $nuevo, 'es_principal' => 1]);
        $this->assertDatabaseHas('acudientes', ['id' => $acudiente]);
        $this->assertDatabaseHas('cambios_ficha', ['estudiante_id' => $id, 'accion' => 'acudiente_quitado']);

        // Un acudiente que no es de este estudiante: no existe para él.
        $this->actingAs($this->secretaria)->delete("/estudiantes/{$id}/acudientes/{$acudiente}")->assertNotFound();
    }
}
