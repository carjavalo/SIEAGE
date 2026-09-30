<?php

namespace Tests\Feature;

use Tests\TestCase;

/** El video «Cómo inscribir a un estudiante» que se abre desde el login. */
class AyudaTest extends TestCase
{
    private function total(): int
    {
        return filesize(resource_path('ayuda/inscripcion.mp4'));
    }

    public function test_el_video_se_publica_sin_sesion_y_sin_cookies()
    {
        $respuesta = $this->get('/ayuda/inscripcion.mp4')
            ->assertOk()
            ->assertHeader('Content-Type', 'video/mp4')
            ->assertHeader('Accept-Ranges', 'bytes')
            ->assertHeader('Content-Length', $this->total())
            ->assertHeader('X-Content-Type-Options', 'nosniff');

        // Se pide muchas veces seguidas: no debe abrir sesión ni tocar la base.
        $this->assertEmpty($respuesta->headers->getCookies());
        $this->assertStringContainsString('public', $respuesta->headers->get('Cache-Control'));
    }

    public function test_de_aqui_en_adelante_se_entrega_por_trozos()
    {
        // Chrome y Firefox piden «bytes=N-»: reciben medio mega y vuelven por el siguiente.
        $this->get('/ayuda/inscripcion.mp4', ['Range' => 'bytes=0-'])
            ->assertStatus(206)
            ->assertHeader('Content-Range', 'bytes 0-524287/'.$this->total())
            ->assertHeader('Content-Length', 524288);

        $ultimo = $this->total() - 1;
        $desde = $ultimo - 999;
        $respuesta = $this->get('/ayuda/inscripcion.mp4', ['Range' => "bytes={$desde}-"])
            ->assertStatus(206)
            ->assertHeader('Content-Range', "bytes {$desde}-{$ultimo}/".$this->total());

        $this->assertSame(1000, strlen($respuesta->getContent()));
        $this->assertSame(substr(file_get_contents(resource_path('ayuda/inscripcion.mp4')), -1000), $respuesta->getContent());
    }

    public function test_un_rango_cerrado_se_entrega_tal_como_se_pide()
    {
        // Safari pide primero los dos primeros bytes y, si no recibe exactamente eso, no reproduce.
        $this->get('/ayuda/inscripcion.mp4', ['Range' => 'bytes=0-1'])
            ->assertStatus(206)
            ->assertHeader('Content-Range', 'bytes 0-1/'.$this->total())
            ->assertHeader('Content-Length', 2);

        // Aunque sea más largo que un trozo.
        $this->get('/ayuda/inscripcion.mp4', ['Range' => 'bytes=0-1999999'])
            ->assertStatus(206)
            ->assertHeader('Content-Range', 'bytes 0-1999999/'.$this->total());
    }

    public function test_si_el_video_cambio_no_se_continua_una_descarga_vieja()
    {
        $this->get('/ayuda/inscripcion.mp4', ['Range' => 'bytes=1000-', 'If-Range' => '"otro-video"'])
            ->assertOk()
            ->assertHeader('Content-Length', $this->total());

        $etag = $this->get('/ayuda/inscripcion.mp4', ['Range' => 'bytes=0-1'])->headers->get('ETag');
        $this->get('/ayuda/inscripcion.mp4', ['Range' => 'bytes=1000-', 'If-Range' => $etag])->assertStatus(206);
        $this->get('/ayuda/inscripcion.mp4', ['If-None-Match' => $etag])->assertStatus(304);
    }

    public function test_el_login_conoce_la_direccion_del_video()
    {
        $this->assertStringContainsString('"ayuda.inscripcion":', $this->get('/login')->assertOk()->getContent());
    }
}
