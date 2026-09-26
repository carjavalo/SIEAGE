<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as RespuestaHttp;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'status' => $request->session()->get('status'),
        ])->withViewData(['meta' => [
            'descripcion' => 'Acceso al sistema de gestión académica de la I.E. Alfonso López Pumarejo.',
            'indexar' => false,
        ]]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RespuestaHttp
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Recarga completa, no una visita de Inertia: la página del login solo trae las
        // rutas públicas (ver @routes en app.blade.php) y el panel necesita todas.
        return Inertia::location(redirect()->intended(route('estudiantes.index', absolute: false))->getTargetUrl());
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
