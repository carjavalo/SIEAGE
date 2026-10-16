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
 * Gestor básico de usuarios (permiso 'gestionar-usuarios'). No se borran
 * usuarios: se desactivan, para no perder quién registró qué. A los
 * administradores solo los toca otro administrador, y a los super
 * administradores (el equipo de SIEAGE) solo otro super administrador: para
 * los demás ni siquiera aparecen.
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

    public function index(Request $request): Response
    {
        $veSupers = $request->user()->esSuperAdministrador();
        $superId = $this->rolId('superadministrador');
        $asignadas = DB::table('sede_user')->get(['user_id', 'sede_id'])->groupBy('user_id');
        $gradosMarcados = DB::table('sede_user_grado')->get(['user_id', 'sede_id', 'grado_id'])->groupBy('user_id');
        // Los grados que tiene cada sede (los de sus grupos), para ofrecer solo esos.
        $gradosDeSede = DB::table('grupos')->select('sede_id', 'grado_id')->distinct()->get()->groupBy('sede_id');
        $enLinea = Presencia::enLinea()->flip();

        return Inertia::render('usuarios/index', [
            'usuarios' => User::with('rol:id,nombre,etiqueta')
                ->when(! $veSupers, fn ($q) => $q->where(fn ($q) => $q->whereNull('rol_id')->orWhere('rol_id', '!=', $superId)))
                ->orderByDesc('activo')
                ->orderBy('name')
                ->get(['id', 'name', 'usuario', 'email', 'rol_id', 'activo', 'todas_las_sedes', 'ultimo_acceso', 'ultima_actividad', 'created_at'])
                ->map(fn (User $u) => [
                    ...$u->toArray(),
                    'sedes' => $asignadas->get($u->id, collect())->pluck('sede_id')->map(fn ($id) => (int) $id)->values(),
                    // En cada sede, si solo ve algunos grados: {sede_id: [grado_id, …]}.
                    'grados' => (object) $gradosMarcados->get($u->id, collect())->groupBy('sede_id')
                        ->map(fn ($filas) => $filas->pluck('grado_id')->map(fn ($id) => (int) $id)->values())->all(),
                    // Usando el panel ahora mismo; si no, la última vez que lo usó (o, de antes, cuándo ingresó).
                    'en_linea' => $enLinea->has($u->id),
                    'ultima_vez' => ($u->ultima_actividad ?? $u->ultimo_acceso)?->toIso8601String(),
                ]),
            // ve_todas: el rol ve todas las sedes (administrador o permiso «Ver todas las sedes»); no hace falta marcarlas.
            'roles' => Rol::orderBy('id')->when(! $veSupers, fn ($q) => $q->where('nombre', '!=', 'superadministrador'))
                ->get(['id', 'nombre', 'etiqueta', 'descripcion'])->map(fn (Rol $r) => [...$r->toArray(), 've_todas' => $this->rolVeTodas($r->id)]),
            // Para asignar a cada usuario las sedes que puede ver.
            'sedes' => DB::table('sedes')->orderByDesc('es_principal')->orderBy('nombre')->get(['id', 'codigo', 'nombre'])
                ->map(fn ($s) => [...(array) $s, 'grados' => $gradosDeSede->get($s->id, collect())->pluck('grado_id')->map(fn ($id) => (int) $id)->values()]),
            'grados' => DB::table('grados')->orderBy('numero')->get(['id', 'numero', 'nombre']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            ...$this->reglas(),
            'password' => ['required', 'string', 'min:8', 'max:72'],
        ], self::MENSAJES);
        $this->soloAdministradores($request, null, (int) $datos['rol_id']);

        // En una transacción: si faltan sedes, el usuario no queda creado a medias.
        DB::transaction(fn () => $this->asignarSedes(User::create([...collect($datos)->except(['sedes', 'grados'])->all(), 'activo' => true]), $datos));

        return back()->with('success', "Usuario «{$datos['usuario']}» creado.");
    }

    public function update(Request $request, User $usuario): RedirectResponse
    {
        $datos = $request->validate([
            ...$this->reglas($usuario),
            'activo' => ['required', 'boolean'],
        ], self::MENSAJES);

        $this->soloAdministradores($request, $usuario, (int) $datos['rol_id']);
        $this->protegerAdministradores($request, $usuario, (int) $datos['rol_id'], (bool) $datos['activo']);

        DB::transaction(function () use ($usuario, $datos) {
            $usuario->update(collect($datos)->except(['sedes', 'grados'])->all());
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
        $this->soloAdministradores($request, $usuario);

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
        $todas = (bool) ($datos['todas_las_sedes'] ?? false);
        $sedes = array_map('intval', $datos['sedes'] ?? []);

        if (! $this->rolVeTodas((int) $datos['rol_id']) && ! $todas && ! $sedes) {
            throw ValidationException::withMessages(['sedes' => 'Marca al menos una sede, o «Todas las sedes».']);
        }

        // Los grados marcados de cada sede asignada (con «todas las sedes» no hay límite de grado).
        $grados = [];
        foreach ($todas ? [] : $sedes as $sede) {
            foreach (array_unique(array_map('intval', $datos['grados'][$sede] ?? [])) as $grado) {
                $grados[] = ['user_id' => $usuario->id, 'sede_id' => $sede, 'grado_id' => $grado];
            }
        }

        DB::transaction(function () use ($usuario, $todas, $sedes, $grados) {
            $usuario->forceFill(['todas_las_sedes' => $todas])->save();
            DB::table('sede_user')->where('user_id', $usuario->id)->delete();
            DB::table('sede_user')->insert(array_map(fn ($id) => ['user_id' => $usuario->id, 'sede_id' => $id, 'created_at' => now()], $todas ? [] : $sedes));
            // Sedes y grados juntos: en cada sede, solo los grados marcados (o todos).
            DB::table('sede_user_grado')->where('user_id', $usuario->id)->delete();
            DB::table('sede_user_grado')->insert($grados);
        });
        Alcance::olvidar($usuario);
    }

    /** Si con ese rol se ven todas las sedes: el administrador (o el super), o el permiso «Ver todas las sedes». */
    private function rolVeTodas(int $rolId): bool
    {
        return in_array(Rol::where('id', $rolId)->value('nombre'), ['administrador', 'superadministrador'], true)
            || DB::table('rol_permiso')->where('rol_id', $rolId)->where('permiso', 'todas-las-sedes')->exists();
    }

    private function rolId(string $nombre): int
    {
        return (int) Rol::where('nombre', $nombre)->value('id');
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
            // En una sede, solo estos grados (sin grados: todos los de la sede).
            'grados' => ['sometimes', 'array'],
            'grados.*' => ['array'],
            'grados.*.*' => ['integer', 'distinct', 'exists:grados,id'],
        ];
    }

    /**
     * Nadie se sube a sí mismo (ni a otro) por encima de su rol: el rol de
     * administrador y a los administradores solo los da y los toca un
     * administrador; el de super administrador y a los super administradores,
     * solo un super administrador.
     */
    private function soloAdministradores(Request $request, ?User $usuario, ?int $rolId = null): void
    {
        $yo = $request->user();
        $toca = fn (int $id) => ($usuario && (int) $usuario->rol_id === $id) || $rolId === $id;

        if ($toca($this->rolId('superadministrador')) && ! $yo->esSuperAdministrador()) {
            throw ValidationException::withMessages(['rol_id' => 'Solo un super administrador puede dar ese rol o cambiar a un super administrador.']);
        }
        if ($toca($this->rolId('administrador')) && ! $yo->esAdministrador()) {
            throw ValidationException::withMessages(['rol_id' => 'Solo un administrador puede dar ese rol o cambiar a un administrador.']);
        }
    }

    /**
     * Nadie puede quitarse a sí mismo el acceso de administrador (ni el de super
     * administrador), y siempre debe quedar al menos un administrador activo
     * (los super administradores también cuentan).
     */
    private function protegerAdministradores(Request $request, User $usuario, int $rolId, bool $activo): void
    {
        $adminId = $this->rolId('administrador');
        $superId = $this->rolId('superadministrador');
        if ($usuario->esSuperAdministrador() && $usuario->is($request->user()) && (! $activo || $rolId !== $superId)) {
            throw ValidationException::withMessages([
                $activo ? 'rol_id' : 'activo' => 'No puedes quitarte tu propio acceso de super administrador.',
            ]);
        }
        $sigueSiendoAdmin = $activo && in_array($rolId, [$adminId, $superId], true);

        if ($sigueSiendoAdmin || ! $usuario->esAdministrador()) {
            return;
        }

        if ($usuario->is($request->user())) {
            throw ValidationException::withMessages([
                $activo ? 'rol_id' : 'activo' => 'No puedes quitarte tu propio acceso de administrador.',
            ]);
        }

        $otrosAdmins = User::where('activo', true)->whereIn('rol_id', [$adminId, $superId])->whereKeyNot($usuario->id)->count();
        if ($otrosAdmins === 0) {
            throw ValidationException::withMessages(['rol_id' => 'Debe quedar al menos un administrador activo.']);
        }
    }
}
