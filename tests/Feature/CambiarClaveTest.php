<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CambiarClaveTest extends TestCase
{
    use RefreshDatabase;

    public function test_cambia_la_clave_y_reactiva_al_usuario()
    {
        $u = User::factory()->create(['usuario' => 'admin', 'activo' => false]);

        $this->artisan('usuario:clave', ['usuario' => 'Admin'])
            ->expectsQuestion('Nueva clave (mínimo 8 caracteres, no se ve al escribir)', 'clave-nueva-1')
            ->expectsQuestion('Repítela', 'clave-nueva-1')
            ->assertSuccessful();

        $u->refresh();
        $this->assertTrue(Hash::check('clave-nueva-1', $u->password));
        $this->assertTrue($u->activo);
    }

    public function test_no_cambia_nada_si_no_coinciden_o_no_existe()
    {
        $u = User::factory()->create(['usuario' => 'admin']);
        $antes = $u->password;

        $this->artisan('usuario:clave', ['usuario' => 'admin'])
            ->expectsQuestion('Nueva clave (mínimo 8 caracteres, no se ve al escribir)', 'clave-nueva-1')
            ->expectsQuestion('Repítela', 'otra-cosa-22')
            ->assertFailed();
        $this->artisan('usuario:clave', ['usuario' => 'nadie'])->assertFailed();

        $this->assertSame($antes, $u->fresh()->password);
    }
}
