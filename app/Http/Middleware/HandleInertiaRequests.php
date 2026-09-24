<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                // Para mostrar el menú "Usuarios" solo a quien puede usarlo.
                'puedeGestionarUsuarios' => fn () => (bool) $request->user()?->can('gestionar-usuarios'),
            ],
            // Para el aviso del menú "Inscritos": solo con sesión iniciada.
            'inscritosPendientes' => fn () => $request->user()
                ? DB::table('solicitudes_inscripcion')->where('estado', 'pendiente')->count()
                : 0,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
        ]);
    }
}
