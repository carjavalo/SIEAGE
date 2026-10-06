<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** El video tutorial del panel, que se abre con el «?» del encabezado. */
class AyudaOperadorTest extends TestCase
{
    use RefreshDatabase;

    public function test_solo_con_sesion_y_por_trozos()
    {
        $this->get('/ayuda/operador.mp4')->assertRedirect('/login');

        $total = filesize(resource_path('ayuda/operador.mp4'));
        $this->actingAs(User::factory()->create())
            ->get('/ayuda/operador.mp4', ['Range' => 'bytes=0-'])
            ->assertStatus(206)
            ->assertHeader('Content-Type', 'video/mp4')
            ->assertHeader('Content-Range', 'bytes 0-524287/'.$total);
    }
}
