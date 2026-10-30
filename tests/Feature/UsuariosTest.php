<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UsuariosTest extends TestCase
{
    use RefreshDatabase;

    private function rol(string $nombre): int
    {
        return Rol::where('nombre', $nombre)->value('id');
    }

    private function admin(): User
    {
        return User::factory()->create(['rol_id' => $this->rol('administrador')]);
    }

    public function test_solo_los_administradores_entran()
    {
        $secretaria = User::factory()->create(['rol_id' => $this->rol('secretaria')]);

        $this->get('/usuarios')->assertRedirect('/login');
        $this->actingAs($secretaria)->get('/usuarios')->assertForbidden();
        $this->actingAs($secretaria)->post('/usuarios', [])->assertForbidden();
        $this->actingAs($secretaria)->get('/estudiantes')
            ->assertInertia(fn (Assert $page) => $page->where('auth.puedeGestionarUsuarios', false));

        $this->actingAs($this->admin())->get('/usuarios')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('usuarios/index')
                ->where('auth.puedeGestionarUsuarios', true)
                ->has('usuarios', 2)
                ->has('roles', 4)
                ->missing('usuarios.0.password'));
    }

    public function test_crea_un_usuario_que_puede_ingresar()
    {
        $this->actingAs($this->admin())->post('/usuarios', [
            'name' => 'Juan Pérez',
            'usuario' => ' JPerez ',
            'email' => '',
            'rol_id' => $this->rol('secretaria'),
            'todas_las_sedes' => true,
            'password' => 'clave-segura-1',
        ])->assertSessionHasNoErrors();

        $nuevo = User::where('usuario', 'jperez')->firstOrFail();
        $this->assertNull($nuevo->email);
        $this->assertTrue($nuevo->activo);
        $this->assertTrue(Hash::check('clave-segura-1', $nuevo->password));

        auth()->logout();
        $this->post('/login', ['usuario' => 'jperez', 'password' => 'clave-segura-1']);
        $this->assertAuthenticatedAs($nuevo);
    }

    public function test_valida_usuario_repetido_y_formato()
    {
        $admin = $this->admin();
        $datos = ['name' => 'Ana', 'email' => '', 'rol_id' => $this->rol('docente'), 'password' => '12345678'];

        $this->actingAs($admin)->post('/usuarios', [...$datos, 'usuario' => $admin->usuario])->assertSessionHasErrors('usuario');
        $this->actingAs($admin)->post('/usuarios', [...$datos, 'usuario' => 'ana maria!'])->assertSessionHasErrors('usuario');
        $this->actingAs($admin)->post('/usuarios', [...$datos, 'usuario' => 'ana', 'password' => 'corta'])->assertSessionHasErrors('password');
        $this->assertDatabaseCount('users', 1);
    }

    public function test_un_administrador_no_se_quita_su_propio_acceso()
    {
        $admin = $this->admin();
        $base = ['name' => $admin->name, 'usuario' => $admin->usuario, 'email' => $admin->email];

        $this->actingAs($admin)->put("/usuarios/{$admin->id}", [...$base, 'rol_id' => $this->rol('administrador'), 'activo' => false])
            ->assertSessionHasErrors('activo');
        $this->actingAs($admin)->put("/usuarios/{$admin->id}", [...$base, 'rol_id' => $this->rol('docente'), 'activo' => true])
            ->assertSessionHasErrors('rol_id');

        $this->assertTrue($admin->fresh()->esAdministrador());
    }

    public function test_desactivado_no_puede_ingresar()
    {
        $docente = User::factory()->create(['rol_id' => $this->rol('docente')]);

        $this->actingAs($this->admin())->put("/usuarios/{$docente->id}", [
            'name' => 'Docente Renombrado', 'usuario' => $docente->usuario, 'email' => $docente->email,
            'rol_id' => $this->rol('coordinacion'), 'activo' => false, 'todas_las_sedes' => true,
        ])->assertSessionHasNoErrors();

        $docente->refresh();
        $this->assertSame('Docente Renombrado', $docente->name);
        $this->assertFalse($docente->activo);

        auth()->logout();
        $this->post('/login', ['usuario' => $docente->usuario, 'password' => 'password']);
        $this->assertGuest();
    }

    public function test_se_desactiva_y_se_reactiva_con_su_boton()
    {
        $admin = $this->admin();
        $docente = User::factory()->create(['rol_id' => $this->rol('docente')]);

        $this->actingAs($admin)->put("/usuarios/{$docente->id}/estado", ['activo' => false])->assertSessionHasNoErrors();
        $this->assertFalse($docente->fresh()->activo);
        $this->actingAs($admin)->put("/usuarios/{$docente->id}/estado", ['activo' => true])->assertSessionHasNoErrors();
        $this->assertTrue($docente->fresh()->activo);

        // Ni a sí mismo, ni al último administrador activo.
        $this->actingAs($admin)->put("/usuarios/{$admin->id}/estado", ['activo' => false])
            ->assertSessionHasErrors(['activo' => 'No puedes desactivar tu propio usuario.']);
        $this->assertTrue($admin->fresh()->activo);
        $secretaria = User::factory()->create(['rol_id' => $this->rol('secretaria')]);
        $this->actingAs($secretaria)->put("/usuarios/{$docente->id}/estado", ['activo' => false])->assertForbidden();
    }

    public function test_se_elimina_y_lo_que_registro_se_queda()
    {
        $admin = $this->admin();
        $docente = User::factory()->create(['rol_id' => $this->rol('docente')]);
        DB::table('instituciones')->insert(['id' => 1, 'nombre' => 'Institución de prueba']);
        $sede = DB::table('sedes')->insertGetId(['institucion_id' => 1, 'codigo' => 'PR', 'nombre' => 'Sede Prueba', 'coordinador_id' => $docente->id]);
        DB::table('sede_user')->insert(['user_id' => $docente->id, 'sede_id' => $sede]);
        $profe = DB::table('docentes')->insertGetId(['user_id' => $docente->id, 'nombre_completo' => 'Docente de Prueba', 'activo' => true]);

        $this->actingAs($admin)->delete("/usuarios/{$docente->id}")->assertSessionHasNoErrors();

        $this->assertNull(User::find($docente->id));
        // Lo que lo nombraba se queda, sin su nombre; sus sedes se van con él.
        $this->assertNull(DB::table('sedes')->where('id', $sede)->value('coordinador_id'));
        $this->assertSame(0, DB::table('sede_user')->where('user_id', $docente->id)->count());
        $this->assertNotNull(DB::table('docentes')->where('id', $profe)->first());
        $this->assertNull(DB::table('docentes')->where('id', $profe)->value('user_id'));
        $this->post('/logout');
        $this->post('/login', ['usuario' => $docente->usuario, 'password' => 'password']);
        $this->assertGuest();
    }

    public function test_no_se_elimina_a_si_mismo_ni_al_ultimo_administrador_ni_a_un_super()
    {
        $admin = $this->admin();
        $this->actingAs($admin)->delete("/usuarios/{$admin->id}")
            ->assertSessionHasErrors(['usuario' => 'No puedes eliminar tu propio usuario.']);

        // Un super administrador puede eliminar administradores, pero siempre queda uno activo.
        $super = User::factory()->create(['rol_id' => $this->rol('superadministrador')]);
        $this->actingAs($super)->delete("/usuarios/{$admin->id}")->assertSessionHasNoErrors();
        $otro = $this->admin();
        // El administrador no toca al super administrador.
        $this->actingAs($otro)->delete("/usuarios/{$super->id}")->assertSessionHasErrors('rol_id');
        $this->assertNotNull(User::find($super->id));
        // Quien gestiona usuarios sin ser administrador no elimina administradores.
        $coordinacion = Rol::where('nombre', 'coordinacion')->first();
        DB::table('rol_permiso')->insert(['rol_id' => $coordinacion->id, 'permiso' => 'gestionar-usuarios']);
        $coordinadora = User::factory()->create(['rol_id' => $coordinacion->id]);
        $this->actingAs($coordinadora)->delete("/usuarios/{$otro->id}")->assertSessionHasErrors('rol_id');
        $this->assertNotNull(User::find($otro->id));
    }

    public function test_cambia_la_clave_de_otro_usuario()
    {
        $docente = User::factory()->create(['rol_id' => $this->rol('docente')]);

        $this->actingAs($this->admin())->put("/usuarios/{$docente->id}/clave", ['password' => 'nueva-clave-9'])
            ->assertSessionHasNoErrors();

        auth()->logout();
        $this->post('/login', ['usuario' => $docente->usuario, 'password' => 'password']);
        $this->assertGuest();
        $this->post('/login', ['usuario' => $docente->usuario, 'password' => 'nueva-clave-9']);
        $this->assertAuthenticatedAs($docente);
    }
}
