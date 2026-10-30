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
                ->assertHeader('X-Frame-Options', 'DENY')
                ->assertHeader('X-Content-Type-Options', 'nosniff')
                ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
                ->assertHeaderMissing('X-Powered-By');

            $politica = $respuesta->headers->get('Content-Security-Policy');
            $this->assertStringContainsString("frame-ancestors 'none'", $politica);
            // Los scripts: solo de este sitio o con el nonce de esta respuesta, nunca en línea sin él.
            $this->assertMatchesRegularExpression("/script-src 'self' 'nonce-[^']+'/", $politica);
            $this->assertStringNotContainsString("script-src 'self' 'unsafe-inline'", $politica);
            preg_match("/'nonce-([^']+)'/", $politica, $nonce);
            $this->assertStringContainsString('nonce="'.$nonce[1].'"', $respuesta->getContent());
        }
    }

    public function test_tambien_las_del_panel_y_las_redirecciones()
    {
        $this->get('/estudiantes')->assertRedirect('/login')->assertHeader('X-Frame-Options', 'DENY');

        $this->actingAs(User::factory()->create())
            ->get('/settings/profile')
            ->assertOk()
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_en_el_dominio_publico_se_exige_https()
    {
        $this->get('http://matriculateya.example.edu.co/login')
            ->assertStatus(301)
            ->assertRedirect('https://matriculateya.example.edu.co/login');

        $this->get('https://matriculateya.example.edu.co/login')
            ->assertOk()
            ->assertHeader('Strict-Transport-Security', 'max-age=15552000');
    }

    public function test_en_desarrollo_no_se_exige_https()
    {
        foreach (['http://localhost/login', 'http://127.0.0.1:8000/login', 'http://192.168.2.172:8004/login', 'http://sieage.test/login'] as $url) {
            $this->get($url)->assertOk()->assertHeaderMissing('Strict-Transport-Security');
        }
    }
}
