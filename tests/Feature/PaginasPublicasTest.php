<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Lo que ve quien todavía no ha iniciado sesión. */
class PaginasPublicasTest extends TestCase
{
    use RefreshDatabase;

    public function test_sin_sesion_solo_se_publican_las_rutas_publicas()
    {
        $html = $this->get('/login')->assertOk()->getContent();

        $this->assertStringContainsString('"login":', $html);
        $this->assertStringContainsString('"inscripcion.store":', $html);
        $this->assertStringNotContainsString('usuarios.store', $html);
        $this->assertStringNotContainsString('importaciones.store', $html);
        $this->assertStringNotContainsString('storage.local', $html);
    }

    public function test_con_sesion_el_panel_conoce_todas_sus_rutas()
    {
        $html = $this->actingAs(User::factory()->create())->get('/settings/profile')->assertOk()->getContent();

        $this->assertStringContainsString('"estudiantes.index":', $html);
        $this->assertStringContainsString('"usuarios.store":', $html);
        $this->assertStringNotContainsString('storage.local', $html);
    }

    public function test_al_ingresar_desde_el_login_se_recarga_la_pagina_completa()
    {
        $user = User::factory()->create();

        // Visita de Inertia: 409 con la dirección, y el navegador la carga entera (con todas las rutas).
        $this->withHeaders(['X-Inertia' => 'true'])
            ->post('/login', ['usuario' => $user->usuario, 'password' => 'password'])
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', url('/estudiantes'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_el_login_no_se_indexa()
    {
        $html = $this->get('/login')->getContent();

        $this->assertStringContainsString('<meta name="robots" content="noindex">', $html);
        $this->assertStringContainsString('<meta name="description"', $html);
    }

    public function test_los_mensajes_de_laravel_salen_en_espanol()
    {
        $this->post('/login', [])->assertSessionHasErrors([
            'usuario' => 'Este campo es obligatorio.',
            'password' => 'Este campo es obligatorio.',
        ]);
    }
}
