<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Support\Presencia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** «En línea» y «Última vez» en la lista de usuarios. */
class PresenciaTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['rol_id' => Rol::where('nombre', 'administrador')->value('id'), 'usuario' => 'admin.prueba']);
    }

    private function sesion(User $u, int $haceSegundos): void
    {
        DB::table('sessions')->insert(['id' => uniqid('s', true), 'user_id' => $u->id, 'ip_address' => '127.0.0.1', 'user_agent' => 'prueba',
            'payload' => '', 'last_activity' => now()->subSeconds($haceSegundos)->getTimestamp()]);
    }

    private function fila(array $usuarios, User $u): array
    {
        return collect($usuarios)->firstWhere('id', $u->id);
    }

    public function test_usar_el_panel_anota_la_actividad_como_mucho_una_vez_por_minuto()
    {
        $u = User::factory()->create(['ultima_actividad' => null]);

        $this->actingAs($u)->get('/pulso')->assertOk();
        $primera = $u->fresh()->ultima_actividad;
        $this->assertNotNull($primera);

        // A los 30 s (el pulso pregunta cada 10) no se vuelve a escribir.
        $this->travel(30)->seconds();
        $this->actingAs($u->fresh())->get('/pulso');
        $this->assertTrue($u->fresh()->ultima_actividad->equalTo($primera));

        $this->travel(2)->minutes();
        $this->actingAs($u->fresh())->get('/pulso');
        $this->assertTrue($u->fresh()->ultima_actividad->gt($primera));
    }

    public function test_en_linea_segun_las_sesiones_y_si_no_la_ultima_vez()
    {
        config(['session.driver' => 'database']);
        $admin = $this->admin();
        $conectada = User::factory()->create(['ultima_actividad' => now()->subMinute()]);
        $se_fue = User::factory()->create(['ultima_actividad' => now()->subMinutes(25), 'ultimo_acceso' => now()->subHours(5)]);
        $de_antes = User::factory()->create(['ultima_actividad' => null, 'ultimo_acceso' => now()->subDays(3)]);
        $this->sesion($conectada, 20);
        $this->sesion($se_fue, 25 * 60);

        $this->actingAs($admin)
            ->get('/usuarios')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('usuarios/index')
                ->where('usuarios', function ($usuarios) use ($conectada, $se_fue, $de_antes) {
                    $usuarios = collect($usuarios)->all();
                    $this->assertTrue($this->fila($usuarios, $conectada)['en_linea']);
                    $this->assertFalse($this->fila($usuarios, $se_fue)['en_linea']);
                    // La última actividad, no el último ingreso.
                    $this->assertSame($se_fue->ultima_actividad->toIso8601String(), $this->fila($usuarios, $se_fue)['ultima_vez']);
                    // Sin actividad anotada (de antes de este cambio): su último ingreso.
                    $this->assertSame($de_antes->ultimo_acceso->toIso8601String(), $this->fila($usuarios, $de_antes)['ultima_vez']);

                    return true;
                }));
    }

    public function test_al_cerrar_sesion_deja_de_estar_en_linea_enseguida()
    {
        config(['session.driver' => 'database']);
        $u = User::factory()->create(['ultima_actividad' => now()]);
        $this->sesion($u, 5);
        $this->assertTrue(Presencia::enLinea()->contains($u->id));

        // Cerrar sesión borra la sesión; la última actividad sigue siendo reciente, pero ya no está en línea.
        DB::table('sessions')->where('user_id', $u->id)->delete();
        $this->assertFalse(Presencia::enLinea()->contains($u->id));
    }

    public function test_sin_sesiones_en_la_base_se_mira_la_ultima_actividad()
    {
        config(['session.driver' => 'file']);
        $reciente = User::factory()->create(['ultima_actividad' => now()->subSeconds(40)]);
        $quieto = User::factory()->create(['ultima_actividad' => now()->subMinutes(10)]);

        $this->assertTrue(Presencia::enLinea()->contains($reciente->id));
        $this->assertFalse(Presencia::enLinea()->contains($quieto->id));
    }

    public function test_el_pulso_avisa_cuando_alguien_entra()
    {
        config(['session.driver' => 'database']);
        $admin = $this->admin();
        $antes = $this->actingAs($admin)->getJson('/pulso')->assertOk()->json('presencia');

        $this->sesion(User::factory()->create(), 3);

        $this->assertNotSame($antes, $this->actingAs($admin)->getJson('/pulso')->json('presencia'));
    }
}
