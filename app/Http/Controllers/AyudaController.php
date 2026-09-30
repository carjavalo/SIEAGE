<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Los videos de ayuda. Por ahora uno: «Cómo inscribir a un estudiante», que se abre desde el login.
 *
 * No se dejan en public/ porque el servidor de `artisan serve` no atiende peticiones por
 * rangos (Range): sin ellas Chrome no deja adelantar ni devolver el video y el iPhone no lo abre.
 */
class AyudaController extends Controller
{
    /**
     * Tope de cada entrega cuando el navegador pide «de aquí en adelante». El servidor atiende una
     * petición a la vez: si el navegador deja de leer a mitad del video (lo hace cuando ya tiene
     * suficiente por delante), una entrega larga dejaría esperando a todos los demás.
     */
    private const TROZO = 512 * 1024;

    public function inscripcion(Request $request): Response
    {
        $ruta = resource_path('ayuda/inscripcion.mp4');
        abort_unless(is_file($ruta), 404);

        $total = filesize($ruta);
        $cabeceras = [
            'Content-Type' => 'video/mp4',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=86400',
            'ETag' => sprintf('"%x-%x"', filemtime($ruta), $total),
        ];

        // Lo demás (archivo entero, «del byte a al b», 304, 416, HEAD) ya lo resuelve Symfony.
        $entero = response()->file($ruta, $cabeceras);
        if ($entero->isNotModified($request)) {
            return $entero;
        }

        $condicion = $request->headers->get('If-Range');
        $vigente = $condicion === null || in_array($condicion, [$cabeceras['ETag'], $entero->headers->get('Last-Modified')], true);

        if (! $request->isMethod('GET') || ! $vigente || ! preg_match('/^bytes=(\d+)-$/', (string) $request->headers->get('Range'), $m) || $m[1] >= $total) {
            return $entero;
        }

        $inicio = (int) $m[1];
        $fin = min($inicio + self::TROZO, $total) - 1;

        return response(file_get_contents($ruta, false, null, $inicio, $fin - $inicio + 1), 206, $cabeceras + [
            'Last-Modified' => $entero->headers->get('Last-Modified'),
            'Content-Range' => "bytes {$inicio}-{$fin}/{$total}",
            'Content-Length' => $fin - $inicio + 1,
        ]);
    }
}
