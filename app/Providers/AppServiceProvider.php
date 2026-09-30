<?php

namespace App\Providers;

use App\Models\User;
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
        // Crear, editar y desactivar usuarios: solo administradores.
        Gate::define('gestionar-usuarios', fn (User $user) => $user->esAdministrador());

        // Deshabilitar o habilitar la matrícula de un estudiante y corregir sus datos: todos menos los docentes.
        Gate::define('gestionar-matriculas', fn (User $user) => $user->activo
            && in_array($user->rol?->nombre, ['administrador', 'coordinacion', 'secretaria'], true));

        // Crear y cambiar sedes y grupos: todos menos los docentes.
        Gate::define('gestionar-sedes', fn (User $user) => $user->activo
            && in_array($user->rol?->nombre, ['administrador', 'coordinacion', 'secretaria'], true));

        // Promover estudiantes al grado siguiente: todos menos los docentes.
        Gate::define('promover-estudiantes', fn (User $user) => $user->activo
            && in_array($user->rol?->nombre, ['administrador', 'coordinacion', 'secretaria'], true));
    }
}
