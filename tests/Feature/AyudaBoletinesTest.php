<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** La clase en video de Boletines, que se abre con el «?» de esa pantalla. */
class AyudaBoletinesTest extends TestCase
{
    use RefreshDatabase;

    public function test_solo_con_sesion_y_permiso_y_por_trozos()
    {
        $this->get('/ayuda/boletines.mp4')->assertRedirect('/login');

        $total = filesize(resource_path('ayuda/boletines.mp4'));
        $this->actingAs(User::factory()->create(['rol_id' => Rol::where('nombre', 'docente')->value('id')]))
            ->get('/ayuda/boletines.mp4', ['Range' => 'bytes=0-'])
            ->assertStatus(206)
            ->assertHeader('Content-Type', 'video/mp4')
            ->assertHeader('Content-Range', 'bytes 0-524287/'.$total);

        // Sin el permiso de escribir boletines, tampoco el video.
        $rol = Rol::create(['nombre' => 'sin-boletines', 'etiqueta' => 'Sin boletines']);
        DB::table('rol_permiso')->insert(['rol_id' => $rol->id, 'permiso' => 'ver-estudiantes']);
        $this->actingAs(User::factory()->create(['rol_id' => $rol->id]))->get('/ayuda/boletines.mp4')->assertForbidden();
    }
}
