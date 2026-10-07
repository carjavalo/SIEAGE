<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Support\Permisos;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Roles y permisos desde la web (Usuarios → Roles y permisos). Datos inventados. */
class RolesTest extends TestCase
{
    use RefreshDatabase;

    private function rol(string $nombre): Rol
    {
        return Rol::where('nombre', $nombre)->firstOrFail();
    }

    private function usuario(string $rol): User
    {
        return User::factory()->create(['rol_id' => $this->rol($rol)->id]);
    }

    private function permisosDe(string $rol): array
    {
        return DB::table('rol_permiso')->where('rol_id', $this->rol($rol)->id)->orderBy('permiso')->pluck('permiso')->all();
    }

    public function test_los_roles_de_siempre_quedan_con_lo_que_podian_hacer()
    {
        $docente = ['constancias', 'escribir-boletines', 'importar-datos', 'informes', 'matricular', 'ver-estudiantes', 'ver-inscritos', 'ver-sedes'];
        $this->assertSame($docente, $this->permisosDe('docente'));
        $resto = collect(Permisos::claves())->reject(fn ($p) => in_array($p, ['gestionar-usuarios', 'gestionar-roles'], true))->sort()->values()->all();
        $this->assertSame($resto, $this->permisosDe('coordinacion'));
        $this->assertSame($resto, $this->permisosDe('secretaria'));
        $this->assertSame(Permisos::claves(), Permisos::de($this->usuario('administrador')));
        $this->assertSame('Coordinación', $this->rol('coordinacion')->etiqueta);

        // El docente entra a lo de siempre, pero no deshabilita, ni cambia cupos, ni ve usuarios.
        $profe = $this->usuario('docente');
        $this->actingAs($profe)->get('/estudiantes')->assertOk();
        $this->actingAs($profe)->get('/inscritos')->assertOk();
        $this->actingAs($profe)->post('/estudiantes/1/deshabilitar')->assertForbidden();
        $this->actingAs($profe)->put('/grupos/cupos')->assertForbidden();
        $this->actingAs($profe)->get('/usuarios')->assertForbidden();
        $this->actingAs($profe)->get('/usuarios/roles')->assertForbidden();
        // Secretaría tampoco administra usuarios ni roles.
        $this->actingAs($this->usuario('secretaria'))->get('/usuarios/roles')->assertForbidden();
    }

    public function test_la_pagina_trae_los_roles_con_sus_permisos()
    {
        $this->usuario('docente');
        $this->actingAs($this->usuario('administrador'))
            ->get('/usuarios/roles')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('usuarios/roles')
                ->has('roles', 4)
                ->where('roles.0.etiqueta', 'Administrador')
                ->where('roles.0.sistema', true)
                ->where('roles.0.permisos', Permisos::claves())
                ->where('roles.3.etiqueta', 'Docente')
                ->where('roles.3.usuarios', 1)
                ->has('areas', 6)
                ->where('areas.0.permisos.0.clave', 'ver-estudiantes')
                ->where('requiere.matricular', 'ver-inscritos')
                ->etc());
    }

    public function test_un_rol_nuevo_con_sus_permisos_cambia_lo_que_ve_quien_lo_tiene()
    {
        $admin = $this->usuario('administrador');

        // Nuevo, empezando con los permisos del docente.
        $this->actingAs($admin)->post('/roles', ['etiqueta' => 'Orientación escolar', 'descripcion' => 'Acompaña a las familias', 'copiar_de' => $this->rol('docente')->id])
            ->assertRedirect();
        $rol = Rol::where('etiqueta', 'Orientación escolar')->firstOrFail();
        $this->assertSame('orientacion-escolar', $rol->nombre);
        $this->assertSame($this->permisosDe('docente'), $this->permisosDe('orientacion-escolar'));

        // Solo matricular: se le agrega solo «ver inscritos», que es lo que necesita para servir.
        $this->actingAs($admin)->put("/roles/{$rol->id}", ['etiqueta' => 'Orientación escolar', 'descripcion' => null, 'permisos' => ['matricular']])
            ->assertSessionHasNoErrors();
        $this->assertSame(['matricular', 'ver-inscritos'], $this->permisosDe('orientacion-escolar'));

        $orientadora = User::factory()->create(['rol_id' => $rol->id]);
        $this->actingAs($orientadora)->get('/')->assertRedirect('/inscritos');
        $this->actingAs($orientadora)->get('/inscritos')->assertOk();
        $this->actingAs($orientadora)->get('/estudiantes')->assertForbidden();
        $this->actingAs($orientadora)->get('/boletines')->assertForbidden();
        $this->actingAs($orientadora)->get('/inscritos')->assertInertia(fn (Assert $page) => $page
            ->where('auth.permisos', ['ver-inscritos', 'matricular'])
            ->where('auth.puedeEditarDatos', false)
            ->etc());

        // Sin ningún permiso: solo su perfil.
        $this->actingAs($admin)->put("/roles/{$rol->id}", ['etiqueta' => 'Orientación escolar', 'permisos' => []])->assertSessionHasNoErrors();
        $this->actingAs($orientadora)->get('/')->assertRedirect('/settings/profile');
        $this->actingAs($orientadora)->get('/inscritos')->assertForbidden();
    }

    public function test_nombres_y_permisos_validos()
    {
        $admin = $this->usuario('administrador');
        $this->actingAs($admin)->post('/roles', ['etiqueta' => 'Docente'])->assertSessionHasErrors(['etiqueta' => 'Ya hay otro rol con este nombre.']);
        $this->actingAs($admin)->post('/roles', ['etiqueta' => ''])->assertSessionHasErrors('etiqueta');
        $docente = $this->rol('docente');
        $this->actingAs($admin)->put("/roles/{$docente->id}", ['etiqueta' => 'Docente', 'permisos' => ['borrar-todo']])->assertSessionHasErrors('permisos.0');
        // Cambiarle el nombre que se ve: la clave interna sigue igual.
        $this->actingAs($admin)->put("/roles/{$docente->id}", ['etiqueta' => 'Profesor(a)', 'permisos' => ['ver-estudiantes']])->assertSessionHasNoErrors();
        $this->assertSame('docente', $docente->fresh()->nombre);
        $this->assertSame('Profesor(a)', $docente->fresh()->etiqueta);
    }

    public function test_el_administrador_no_se_toca_y_un_rol_con_usuarios_no_se_borra()
    {
        $admin = $this->usuario('administrador');
        $rolAdmin = $this->rol('administrador');

        // Sus permisos no cambian (tiene todo siempre); su nombre sí.
        $this->actingAs($admin)->put("/roles/{$rolAdmin->id}", ['etiqueta' => 'Rectoría', 'permisos' => []])->assertSessionHasNoErrors();
        $this->assertSame(0, DB::table('rol_permiso')->where('rol_id', $rolAdmin->id)->count());
        $this->assertSame(Permisos::claves(), Permisos::de($admin->fresh()));
        $this->actingAs($admin)->delete("/roles/{$rolAdmin->id}")->assertSessionHasErrors('rol');

        // Con usuarios (aunque estén desactivados), no se borra.
        $secretaria = $this->rol('secretaria');
        User::factory()->create(['rol_id' => $secretaria->id, 'activo' => false]);
        $this->actingAs($admin)->delete("/roles/{$secretaria->id}")->assertSessionHasErrors(['rol' => 'Lo tiene 1 usuario (también cuentan los desactivados): cámbiales el rol en Usuarios y vuelve a intentarlo.']);
        $this->assertNotNull($secretaria->fresh());

        // Sin usuarios, sí (y sus permisos con él).
        $this->actingAs($admin)->post('/roles', ['etiqueta' => 'Temporal', 'copiar_de' => $secretaria->id]);
        $temporal = Rol::where('etiqueta', 'Temporal')->firstOrFail();
        $this->actingAs($admin)->delete("/roles/{$temporal->id}")->assertRedirect('/usuarios/roles');
        $this->assertNull($temporal->fresh());
        $this->assertSame(0, DB::table('rol_permiso')->where('rol_id', $temporal->id)->count());
    }

    public function test_quien_gestiona_usuarios_sin_ser_administrador_no_se_vuelve_administrador()
    {
        // Coordinación con permiso de usuarios.
        $coordinacion = $this->rol('coordinacion');
        DB::table('rol_permiso')->insert(['rol_id' => $coordinacion->id, 'permiso' => 'gestionar-usuarios']);
        $coordinadora = User::factory()->create(['rol_id' => $coordinacion->id]);
        $admin = $this->usuario('administrador');
        $datos = ['name' => 'Nueva Persona Prueba', 'usuario' => 'nueva.prueba', 'todas_las_sedes' => true, 'password' => 'clave-de-prueba-1'];

        $this->actingAs($coordinadora)->get('/usuarios')->assertOk();
        $this->actingAs($coordinadora)->post('/usuarios', [...$datos, 'rol_id' => $this->rol('administrador')->id])->assertSessionHasErrors('rol_id');
        $this->actingAs($coordinadora)->post('/usuarios', [...$datos, 'rol_id' => $this->rol('docente')->id])->assertSessionHasNoErrors();
        $this->actingAs($coordinadora)->put("/usuarios/{$coordinadora->id}", ['name' => $coordinadora->name, 'usuario' => $coordinadora->usuario, 'rol_id' => $this->rol('administrador')->id, 'activo' => true, 'todas_las_sedes' => true])
            ->assertSessionHasErrors('rol_id');
        $this->actingAs($coordinadora)->put("/usuarios/{$admin->id}/clave", ['password' => 'otra-clave-123'])->assertSessionHasErrors('rol_id');
        $this->assertSame($this->rol('coordinacion')->id, $coordinadora->fresh()->rol_id);
    }

    public function test_completar_agrega_lo_que_cada_permiso_necesita()
    {
        $this->assertSame(['ver-estudiantes', 'constancias'], Permisos::completar(['constancias', 'no-existe']));
        $this->assertSame(['escribir-boletines', 'configurar-boletines'], Permisos::completar(['configurar-boletines']));
        $this->assertSame([], Permisos::completar([]));
    }
}
