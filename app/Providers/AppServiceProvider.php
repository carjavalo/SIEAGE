<?php

namespace App\Providers;

use App\Models\User;
use App\Support\Auditoria;
use App\Support\Permisos;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Cada permiso es una regla con su mismo nombre. Qué puede cada rol se decide en
        // Usuarios → Roles y permisos (ver App\Support\Permisos), no aquí.
        foreach (Permisos::reglas() as $permiso) {
            Gate::define($permiso, fn (User $user) => Permisos::tiene($user, $permiso));
        }

        // Las claves nuevas. Las que ya existen siguen sirviendo hasta que se cambien.
        Password::defaults(fn () => Password::min(10)->max(72)->letters()->numbers());

        // El formulario público: 30/min por IP, porque en una jornada de inscripción en la sala
        // de sistemas todos los equipos salen por la misma IP (6/min bloqueaba familias
        // legítimas). El tope por hora frena a quien quiera llenar la base de solicitudes falsas.
        RateLimiter::for('inscripcion', fn (Request $request) => [
            Limit::perMinute(30)->by('minuto:'.$request->ip()),
            Limit::perHour(300)->by('hora:'.$request->ip()),
        ]);

        // Quién entra, quién falla y quién queda bloqueado (ver App\Support\Auditoria).
        Event::listen(Login::class, fn () => Auditoria::anotar('ingreso'));
        Event::listen(Logout::class, fn (Logout $e) => Auditoria::anotar('salida', ['usuario' => $e->user?->usuario]));
        Event::listen(Failed::class, fn (Failed $e) => Auditoria::anotar('ingreso_fallido', [
            // Si ese usuario no existe, solo el comienzo: a veces la gente escribe ahí su clave.
            'intento' => $e->user?->usuario ?? Str::limit((string) ($e->credentials['usuario'] ?? ''), 3, '…'),
        ]));
        Event::listen(Lockout::class, fn () => Auditoria::anotar('ingreso_bloqueado'));
    }
}
