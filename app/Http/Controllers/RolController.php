<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Support\Permisos;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Roles y permisos (Usuarios → Roles y permisos): crear roles y decidir qué
 * puede hacer cada uno. El administrador no se toca: tiene todo siempre, para
 * que nunca se pierda el acceso. Un rol con usuarios no se puede borrar.
 */
class RolController extends Controller
{
    private const MENSAJES = [
        'required' => 'Este campo es obligatorio.',
        'max' => 'Máximo :max caracteres.',
        'unique' => 'Ya hay otro rol con este nombre.',
        'exists' => 'Elige uno de la lista.',
    ];

    public function index(Request $request): Response
    {
        $usuarios = DB::table('users')->whereNotNull('rol_id')->selectRaw('rol_id, count(*) as total, sum(case when activo then 1 else 0 end) as activos')
            ->groupBy('rol_id')->get()->keyBy('rol_id');
        $permisos = DB::table('rol_permiso')->get()->groupBy('rol_id');

        return Inertia::render('usuarios/roles', [
            'roles' => Rol::orderBy('id')->get()->map(fn (Rol $r) => [
                'id' => $r->id,
                'nombre' => $r->nombre,
                'etiqueta' => $r->etiqueta ?? $r->nombre,
                'descripcion' => $r->descripcion,
                'sistema' => $r->esAdministrador(),
                'usuarios' => (int) ($usuarios->get($r->id)?->activos ?? 0),
                'inactivos' => (int) ($usuarios->get($r->id)?->total ?? 0) - (int) ($usuarios->get($r->id)?->activos ?? 0),
                'permisos' => $r->esAdministrador() ? Permisos::claves() : $permisos->get($r->id, collect())->pluck('permiso')->intersect(Permisos::claves())->values(),
            ]),
            'areas' => collect(Permisos::AREAS)->map(fn ($lista, $area) => [
                'area' => $area,
                'permisos' => collect($lista)->map(fn ($p, $clave) => ['clave' => $clave, 'nombre' => $p[0], 'detalle' => $p[1]])->values(),
            ])->values(),
            'requiere' => Permisos::REQUIERE,
            // Al volver de crear uno, queda abierto.
            'elegido' => $request->integer('rol') ?: null,
            'puedeUsuarios' => $request->user()->can('gestionar-usuarios'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'etiqueta' => ['required', 'string', 'max:60', Rule::unique('roles', 'etiqueta')],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'copiar_de' => ['nullable', 'integer', 'exists:roles,id'],
        ], self::MENSAJES);

        $rol = DB::transaction(function () use ($datos) {
            $rol = Rol::create([
                'nombre' => $this->nombreLibre($datos['etiqueta']),
                'etiqueta' => trim($datos['etiqueta']),
                'descripcion' => trim((string) ($datos['descripcion'] ?? '')) ?: null,
            ]);
            // «Empezar con los permisos de…»: una copia; después cada uno va por su lado.
            if ($origen = isset($datos['copiar_de']) ? Rol::find($datos['copiar_de']) : null) {
                $this->guardarPermisos($rol, $origen->esAdministrador()
                    ? Permisos::claves()
                    : DB::table('rol_permiso')->where('rol_id', $origen->id)->pluck('permiso')->all());
            }

            return $rol;
        });

        return redirect()->route('roles.index', ['rol' => $rol->id])->with('success', "Rol «{$rol->etiqueta}» creado.");
    }

    public function update(Request $request, Rol $rol): RedirectResponse
    {
        $datos = $request->validate([
            'etiqueta' => ['required', 'string', 'max:60', Rule::unique('roles', 'etiqueta')->ignore($rol->id)],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'permisos' => ['present', 'array'],
            'permisos.*' => ['string', Rule::in(Permisos::claves())],
        ], self::MENSAJES + ['in' => 'Ese permiso no existe.']);

        DB::transaction(function () use ($rol, $datos) {
            $rol->update(['etiqueta' => trim($datos['etiqueta']), 'descripcion' => trim((string) ($datos['descripcion'] ?? '')) ?: null]);
            // Al administrador solo se le cambia el nombre y la descripción: tiene todo siempre.
            if (! $rol->esAdministrador()) {
                $this->guardarPermisos($rol, $datos['permisos']);
            }
        });

        return back()->with('success', "Rol «{$rol->etiqueta}» guardado.");
    }

    public function destroy(Rol $rol): RedirectResponse
    {
        if ($rol->esAdministrador()) {
            throw ValidationException::withMessages(['rol' => 'El rol de administrador no se puede borrar.']);
        }
        $usuarios = $rol->usuarios()->count();
        if ($usuarios > 0) {
            throw ValidationException::withMessages(['rol' => ($usuarios === 1 ? 'Lo tiene 1 usuario' : "Lo tienen {$usuarios} usuarios")
                .' (también cuentan los desactivados): cámbiales el rol en Usuarios y vuelve a intentarlo.']);
        }
        $rol->delete();

        return redirect()->route('roles.index')->with('success', "Rol «{$rol->etiqueta}» borrado.");
    }

    /** Guarda los permisos del rol, cada uno con el que necesita para servir. */
    private function guardarPermisos(Rol $rol, array $permisos): void
    {
        DB::table('rol_permiso')->where('rol_id', $rol->id)->delete();
        DB::table('rol_permiso')->insert(array_map(fn ($p) => ['rol_id' => $rol->id, 'permiso' => $p], Permisos::completar($permisos)));
        Permisos::olvidar();
    }

    /** El nombre interno (fijo) sale del que se ve: «Orientación escolar» → «orientacion-escolar». */
    private function nombreLibre(string $etiqueta): string
    {
        $base = Str::limit(Str::slug($etiqueta), 44, '') ?: 'rol';
        $nombre = $base;
        for ($i = 2; Rol::where('nombre', $nombre)->exists(); $i++) {
            $nombre = "{$base}-{$i}";
        }

        return $nombre;
    }
}
