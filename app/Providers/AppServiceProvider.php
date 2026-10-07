<?php

namespace App\Providers;

use App\Models\User;
use App\Support\Permisos;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

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
        foreach (Permisos::claves() as $permiso) {
            Gate::define($permiso, fn (User $user) => Permisos::tiene($user, $permiso));
        }
    }
}
