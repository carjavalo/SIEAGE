<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestor básico de usuarios (solo administradores, ver la regla
 * 'gestionar-usuarios'). No se borran usuarios: se desactivan, para no perder
 * quién registró qué.
 */
class UsuarioController extends Controller
{
    private const MENSAJES = [
        'required' => 'Este campo es obligatorio.',
        'max' => 'Máximo :max caracteres.',
        'min' => 'Mínimo :min caracteres.',
        'email' => 'Escribe un correo válido.',
        'regex' => 'Solo letras minúsculas, números, punto, guion y guion bajo.',
        'unique' => 'Ya hay otro usuario con este valor.',
        'exists' => 'Elige uno de los roles.',
        'confirmed' => 'Las claves no coinciden.',
    ];

    public function index(): Response
    {
        return Inertia::render('usuarios/index', [
            'usuarios' => User::with('rol:id,nombre')
                ->orderByDesc('activo')
                ->orderBy('name')
                ->get(['id', 'name', 'usuario', 'email', 'rol_id', 'activo', 'ultimo_acceso', 'created_at']),
            'roles' => Rol::orderBy('id')->get(['id', 'nombre', 'descripcion']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            ...$this->reglas(),
            'password' => ['required', 'string', 'min:8', 'max:72'],
        ], self::MENSAJES);

        User::create([...$datos, 'activo' => true]);

        return back()->with('success', "Usuario «{$datos['usuario']}» creado.");
    }

    public function update(Request $request, User $usuario): RedirectResponse
    {
        $datos = $request->validate([
            ...$this->reglas($usuario),
            'activo' => ['required', 'boolean'],
        ], self::MENSAJES);

        $this->protegerAdministradores($request, $usuario, (int) $datos['rol_id'], (bool) $datos['activo']);

        $usuario->update($datos);
        if (! $usuario->activo) {
            $this->cerrarSesiones($usuario);
        }

        return back()->with('success', "Usuario «{$usuario->usuario}» actualizado.");
    }

    public function clave(Request $request, User $usuario): RedirectResponse
    {
        $datos = $request->validate([
            'password' => ['required', 'string', 'min:8', 'max:72'],
        ], self::MENSAJES);

        // La clave anterior deja de servir, también en los equipos donde quedó recordada.
        $usuario->forceFill(['password' => $datos['password'], 'remember_token' => null])->save();
        if (! $usuario->is($request->user())) {
            $this->cerrarSesiones($usuario);
        }

        return back()->with('success', "Clave de «{$usuario->usuario}» cambiada.");
    }

    /** Saca al usuario de las sesiones que tenga abiertas en otros equipos. */
    private function cerrarSesiones(User $usuario): void
    {
        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))->where('user_id', $usuario->id)->delete();
        }
    }

    /** @return array<string, mixed> */
    private function reglas(?User $usuario = null): array
    {
        $request = request();
        // El usuario se guarda en minúsculas y sin espacios, que es como se escribe al ingresar.
        if (is_string($u = $request->input('usuario'))) {
            $request->merge(['usuario' => mb_strtolower(trim($u))]);
        }
        if (is_string($e = $request->input('email'))) {
            $request->merge(['email' => mb_strtolower(trim($e)) ?: null]);
        }

        return [
            'name' => ['required', 'string', 'max:120'],
            'usuario' => ['required', 'string', 'min:3', 'max:50', 'regex:/^[a-z0-9._-]+$/', Rule::unique('users', 'usuario')->ignore($usuario?->id)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($usuario?->id)],
            'rol_id' => ['required', 'integer', 'exists:roles,id'],
        ];
    }

    /**
     * Nadie puede quitarse a sí mismo el acceso de administrador, y siempre
     * debe quedar al menos un administrador activo.
     */
    private function protegerAdministradores(Request $request, User $usuario, int $rolId, bool $activo): void
    {
        $adminId = Rol::where('nombre', 'administrador')->value('id');
        $sigueSiendoAdmin = $activo && $rolId === (int) $adminId;

        if ($sigueSiendoAdmin || ! $usuario->esAdministrador()) {
            return;
        }

        if ($usuario->is($request->user())) {
            throw ValidationException::withMessages([
                $activo ? 'rol_id' : 'activo' => 'No puedes quitarte tu propio acceso de administrador.',
            ]);
        }

        $otrosAdmins = User::where('activo', true)->where('rol_id', $adminId)->whereKeyNot($usuario->id)->count();
        if ($otrosAdmins === 0) {
            throw ValidationException::withMessages(['rol_id' => 'Debe quedar al menos un administrador activo.']);
        }
    }
}
