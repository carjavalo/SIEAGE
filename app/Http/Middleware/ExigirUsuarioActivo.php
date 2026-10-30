<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Un usuario desactivado no sigue adentro: ni con una sesión que quedó abierta ni
 * con la cookie de «Recordarme», que entra sin pasar por el login.
 */
class ExigirUsuarioActivo
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->activo) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/login');
        }

        return $next($request);
    }
}
