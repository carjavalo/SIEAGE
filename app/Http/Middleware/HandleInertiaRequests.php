<?php

namespace App\Http\Middleware;

use App\Support\Alcance;
use App\Support\Permisos;
use App\Support\Pulso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
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
        // Inertia guarda cada página en el historial del navegador: en un equipo compartido, «Atrás»
        // después de salir la volvía a mostrar sin preguntarle al servidor. Cifrada, y con la llave
        // borrada al salir, ya no se puede leer. El navegador solo cifra en https (o en localhost).
        Inertia::encryptHistory($request->secure() || in_array($request->getHost(), ['localhost', '127.0.0.1'], true));

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                // Lo que puede hacer (claves de App\Support\Permisos), para mostrar u ocultar menús y botones.
                'permisos' => fn () => Permisos::de($request->user()),
                'puedeGestionarUsuarios' => fn () => (bool) $request->user()?->can('gestionar-usuarios'),
                'puedePromover' => fn () => (bool) $request->user()?->can('promover-estudiantes'),
                'puedeDeshabilitar' => fn () => (bool) $request->user()?->can('deshabilitar-matriculas'),
                'puedeEditarCupos' => fn () => (bool) $request->user()?->can('cambiar-cupos'),
                // Corregir datos del estudiante y sus acudientes.
                'puedeEditarDatos' => fn () => (bool) $request->user()?->can('editar-estudiantes'),
                'puedeGestionarSedes' => fn () => (bool) $request->user()?->can('gestionar-sedes'),
                // Ve todas las sedes, o solo estas (para mostrarlas en la cabecera).
                'todasLasSedes' => fn () => Alcance::todas($request->user()),
                'sedes' => fn () => $request->user() && ! Alcance::todas($request->user())
                    ? DB::table('sedes')->whereIn('id', Alcance::sedes($request->user()))->orderBy('nombre')->get(['id', 'codigo', 'nombre'])
                    : [],
            ],
            // Para el aviso del menú "Inscritos": solo con sesión iniciada.
            'inscritosPendientes' => fn () => $request->user()?->can('ver-inscritos')
                ? Alcance::filtrarSolicitudes(DB::table('solicitudes_inscripcion as s'), $request->user())->where('s.estado', 'pendiente')->count()
                : 0,
            // Cómo estaban los datos cuando se armó esta página: el navegador lo compara con GET /pulso.
            'pulso' => fn () => $request->user() ? Pulso::firma() : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                // Resumen de la última promoción, para el aviso (toast) en pantalla.
                'promocion' => fn () => $request->session()->get('promocion'),
                // Resumen de la última reversión de promoción (deshacer), para el aviso en pantalla.
                'reversion' => fn () => $request->session()->get('reversion'),
                // Resumen de la última importación del formulario de inscripción (ver ImportarInscripciones).
                'importacion' => fn () => $request->session()->get('importacion'),
            ],
        ];
    }
}
