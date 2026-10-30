<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cabeceras de seguridad en todas las respuestas de la app, y HTTPS obligatorio
 * en el dominio público.
 *
 * Los scripts solo corren si salen de este sitio o llevan el nonce de la petición
 * (Vite y Ziggy lo ponen solos): si alguien lograra colar un <script> en una
 * página, el navegador no lo ejecuta. Lo demás cierra que otro sitio la meta en
 * un iframe (clickjacking), que el navegador adivine tipos de archivo, que las
 * direcciones internas viajen como Referer y que una página con datos de
 * estudiantes quede guardada en un equipo compartido.
 */
class CabecerasSeguridad
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->exigeHttps($request) && ! $request->secure()) {
            return new RedirectResponse('https://'.$request->getHttpHost().$request->getRequestUri(), 301);
        }

        $nonce = Vite::useCspNonce();

        $response = $next($request);

        // PHP anuncia su versión en X-Powered-By: no hay por qué darle esa pista a nadie.
        header_remove('X-Powered-By');
        $response->headers->remove('X-Powered-By');

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Content-Security-Policy', $this->politica($response, $nonce));
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');

        // El navegador ya no vuelve a intentar por http (180 días). Solo se manda por https, como pide la norma.
        if ($request->secure() && $this->exigeHttps($request)) {
            $response->headers->set('Strict-Transport-Security', 'max-age=15552000');
        }

        // Con sesión, nada queda guardado: en un equipo compartido, «Atrás» después de salir no muestra datos.
        if ($request->user() && ! str_starts_with((string) $response->headers->get('Content-Type'), 'video/')) {
            $response->headers->set('Cache-Control', 'no-store, private');
        }

        return $response;
    }

    /**
     * Un dominio de verdad (matriculateya…). En el equipo de desarrollo se entra por
     * localhost, por IP o por el nombre del equipo, y ahí no hay certificado.
     */
    private function exigeHttps(Request $request): bool
    {
        $host = $request->getHost();

        return ! filter_var(trim($host, '[]'), FILTER_VALIDATE_IP)
            && str_contains($host, '.')
            && ! preg_match('/\.(localhost|local|test)$/', $host);
    }

    private function politica(Response $response, string $nonce): string
    {
        $siempre = "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'";

        // Con Vite en desarrollo los scripts salen de otro puerto, y la página de error de
        // la depuración lleva los suyos en línea.
        if (Vite::isRunningHot() || (config('app.debug') && $response->isServerError())) {
            return $siempre;
        }

        return implode('; ', [
            $siempre,
            "default-src 'self'",
            "script-src 'self' 'nonce-{$nonce}'",
            // 'unsafe-inline' solo en estilos: React escribe style="…" y los avisos traen su CSS.
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "img-src 'self' data: blob:",
            "media-src 'self'",
            "connect-src 'self'",
            "frame-src 'none'",
            "worker-src 'none'",
        ]);
    }
}
