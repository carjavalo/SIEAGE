<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\User;
use App\Support\Alcance;
use App\Support\Presencia;
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
        $asignadas = DB::table('sede_user')->get(['user_id', 'sede_id'])->groupBy('user_id');
        $enLinea = Presencia::enLinea()->flip();

        return Inertia::render('usuarios/index', [
            'usuarios' => User::with('rol:id,nombre')
                ->orderByDesc('activo')
                ->orderBy('name')
                ->get(['id', 'name', 'usuario', 'email', 'rol_id', 'activo', 'todas_las_sedes', 'ultimo_acceso', 'ultima_actividad', 'created_at'])
                ->map(fn (User $u) => [
                    ...$u->toArray(),
                    'sedes' => $asignadas->get($u->id, collect())->pluck('sede_id')->map(fn ($id) => (int) $id)->values(),
                    // Usando el panel ahora mismo; si no, la última vez que lo usó (o, de antes, cuándo ingresó).
                    'en_linea' => $enLinea->has($u->id),
                    'ultima_vez' => ($u->ultima_actividad ?? $u->ultimo_acceso)?->toIso8601String(),
                ]),
            'roles' => Rol::orderBy('id')->get(['id', 'nombre', 'descripcion']),
            // Para asignar a cada usuario las sedes que puede ver.
            'sedes' => DB::table('sedes')->orderByDesc('es_principal')->orderBy('nombre')->get(['id', 'codigo', 'nombre']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            ...$this->reglas(),
            'password' => ['required', 'string', 'min:8', 'max:72'],
        ], self::MENSAJES);

        // En una transacción: si faltan sedes, el usuario no queda creado a medias.
        DB::transaction(fn () => $this->asignarSedes(User::create([...collect($datos)->except('sedes')->all(), 'activo' => true]), $datos));

        return back()->with('success', "Usuario «{$datos['usuario']}» creado.");
    }

    public function update(Request $request, User $usuario): RedirectResponse
    {
        $datos = $request->validate([
            ...$this->reglas($usuario),
            'activo' => ['required', 'boolean'],
        ], self::MENSAJES);

        $this->protegerAdministradores($request, $usuario, (int) $datos['rol_id'], (bool) $datos['activo']);

        DB::transaction(function () use ($usuario, $datos) {
            $usuario->update(collect($datos)->except('sedes')->all());
            $this->asignarSedes($usuario, $datos);
        });
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

    /**
     * Guarda las sedes del usuario. Si no es administrador, debe tener "todas las
     * sedes" o al menos una marcada: un usuario sin sedes no vería nada.
     *
     * @param  array<string, mixed>  $datos
     */
    private function asignarSedes(User $usuario, array $datos): void
    {
        $esAdmin = Rol::where('id', $datos['rol_id'])->value('nombre') === 'administrador';
        $todas = (bool) ($datos['todas_las_sedes'] ?? false);
        $sedes = array_map('intval', $datos['sedes'] ?? []);

        if (! $esAdmin && ! $todas && ! $sedes) {
            throw ValidationException::withMessages(['sedes' => 'Marca al menos una sede, o «Todas las sedes».']);
        }

        DB::transaction(function () use ($usuario, $todas, $sedes) {
            $usuario->forceFill(['todas_las_sedes' => $todas])->save();
            DB::table('sede_user')->where('user_id', $usuario->id)->delete();
            DB::table('sede_user')->insert(array_map(fn ($id) => ['user_id' => $usuario->id, 'sede_id' => $id, 'created_at' => now()], $todas ? [] : $sedes));
        });
        Alcance::olvidar($usuario);
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
            // Qué sedes puede ver: todas, o las marcadas (los administradores ven todas siempre).
            'todas_las_sedes' => ['sometimes', 'boolean'],
            'sedes' => ['sometimes', 'array'],
            'sedes.*' => ['integer', 'distinct', 'exists:sedes,id'],
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
