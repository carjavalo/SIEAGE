<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cabeceras de seguridad en todas las respuestas de la app.
 *
 * Sin una política de scripts (script-src): Ziggy (@routes) e Inertia escriben
 * scripts en línea y habría que firmarlos uno a uno. Lo que sí se cierra:
 * que otro sitio la meta en un iframe (clickjacking), que el navegador adivine
 * tipos de archivo y que las direcciones internas viajen como Referer.
 */
class CabecerasSeguridad
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // PHP anuncia su versión en X-Powered-By: no hay por qué darle esa pista a nadie.
        header_remove('X-Powered-By');
        $response->headers->remove('X-Powered-By');

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Content-Security-Policy', "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'");
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

        return $response;
    }
}
