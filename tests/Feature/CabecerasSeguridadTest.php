<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CabecerasSeguridadTest extends TestCase
{
    use RefreshDatabase;

    public function test_las_paginas_publicas_llevan_las_cabeceras_de_seguridad()
    {
        foreach (['/login', '/inscripcion'] as $pagina) {
            $respuesta = $this->get($pagina)
                ->assertOk()
                ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
                ->assertHeader('X-Content-Type-Options', 'nosniff')
                ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
                ->assertHeaderMissing('X-Powered-By');

            $this->assertStringContainsString("frame-ancestors 'self'", $respuesta->headers->get('Content-Security-Policy'));
        }
    }

    public function test_tambien_las_del_panel_y_las_redirecciones()
    {
        $this->get('/estudiantes')->assertRedirect('/login')->assertHeader('X-Frame-Options', 'SAMEORIGIN');

        $this->actingAs(User::factory()->create())
            ->get('/settings/profile')
            ->assertOk()
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    }
}
