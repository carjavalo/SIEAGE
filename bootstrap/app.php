<?php

use App\Http\Middleware\CabecerasSeguridad;
use App\Http\Middleware\ExigirUsuarioActivo;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RegistrarActividad;
use App\Http\Middleware\RegistrarAuditoria;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // En todas las respuestas, también errores y redirecciones.
        $middleware->append(CabecerasSeguridad::class);

        // Quien ya tiene sesión y abre /login va a «/»: la primera pantalla que su rol puede abrir.
        $middleware->redirectUsersTo('/');

        $middleware->web(append: [
            ExigirUsuarioActivo::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            // Para «En línea» y «Última vez» en Usuarios.
            RegistrarActividad::class,
            RegistrarAuditoria::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // El login que quedó abierto desde el día anterior ya no tiene sesión válida (419): en vez
        // de la página de error de Laravel en una ventana, vuelve al login con un aviso.
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            if ($response->getStatusCode() === 419 && $request->is('login')) {
                return redirect('/login')->with('status', 'La página llevaba mucho tiempo abierta. Escribe de nuevo tu clave e ingresa.');
            }

            return $response;
        });
    })->create();
