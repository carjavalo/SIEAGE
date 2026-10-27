<?php

namespace App\Http\Controllers;

use App\Support\Alcance;
use App\Support\Promocion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** Promover al grado siguiente: un estudiante, un grado o toda la institución. */
class PromocionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'anio' => ['required', 'integer'],
            'grado_id' => ['nullable', 'integer', 'exists:grados,id'],
            'estudiante_id' => ['nullable', 'integer', 'exists:estudiantes,id'],
            'sede' => ['nullable', 'string', 'exists:sedes,codigo'],
            // Promover un grupo completo (p. ej. 5-2) a un grupo de destino elegido (6-2).
            'grupo_id' => ['nullable', 'integer', 'exists:grupos,id'],
            'grupo_destino_id' => ['nullable', 'integer', 'required_with:grupo_id', 'exists:grupos,id'],
        ], [
            'grupo_destino_id.required_with' => 'Elige a qué grupo promover.',
        ]);

        $user = $request->user();

        // Promover un grupo completo a un grupo de destino elegido.
        if (isset($datos['grupo_id'])) {
            $origen = DB::table('grupos')->where('id', $datos['grupo_id'])->first(['sede_id', 'grado_id']);
            $destino = DB::table('grupos')->where('id', $datos['grupo_destino_id'])->first(['sede_id', 'grado_id']);
            if (! $origen || ! $destino) {
                throw ValidationException::withMessages(['grupo_id' => 'Grupo no válido.']);
            }
            Alcance::exigir($user, $origen->sede_id, $origen->grado_id);
            Alcance::exigir($user, $destino->sede_id, $destino->grado_id);
            $resumen = Promocion::ejecutar((int) $datos['anio'], null, null, (int) $origen->sede_id, (int) $datos['grupo_id'], (int) $datos['grupo_destino_id']);

            return back()->with('promocion', $resumen);
        }

        $gradoId = isset($datos['grado_id']) ? (int) $datos['grado_id'] : null;
        $sedeId = isset($datos['sede']) ? DB::table('sedes')->where('codigo', $datos['sede'])->value('id') : null;
        if ($sedeId) {
            $gradoId ? Alcance::exigir($user, $sedeId, $gradoId) : Alcance::exigirSede($user, $sedeId);
        }
        if (isset($datos['estudiante_id'])) {
            Alcance::exigirEstudiante($user, (int) $datos['estudiante_id']);
        } elseif (! $gradoId && Alcance::grados($user) !== []) {
            // Quien solo ve algunos grados promueve grado por grado.
            throw ValidationException::withMessages(['grado_id' => 'Elige el grado: solo puedes promover los grados que tienes asignados.']);
        }
        if ($sedeId && ! $gradoId && isset(Alcance::grados($user)[(int) $sedeId])) {
            throw ValidationException::withMessages(['grado_id' => 'Elige el grado: en esta sede solo tienes algunos grados.']);
        }
        // Sin sede pedida, "toda la institución" es todo lo que este usuario puede ver (de ese grado).
        $sedeId ??= $gradoId ? Alcance::sedesDelGrado($user, $gradoId) : Alcance::sedes($user);
        $resumen = Promocion::ejecutar((int) $datos['anio'], $datos['grado_id'] ?? null, $datos['estudiante_id'] ?? null, $sedeId);

        return back()->with('promocion', $resumen);
    }

    /** Deshacer la promoción: un estudiante, un grupo, un grado o toda la institución. */
    public function revertir(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'anio' => ['required', 'integer'],
            'grado_id' => ['nullable', 'integer', 'exists:grados,id'],
            'estudiante_id' => ['nullable', 'integer', 'exists:estudiantes,id'],
            'sede' => ['nullable', 'string', 'exists:sedes,codigo'],
            'grupo_id' => ['nullable', 'integer', 'exists:grupos,id'],
        ]);

        $user = $request->user();

        // Deshacer la promoción de un grupo completo (p. ej. todo 5-2).
        if (isset($datos['grupo_id'])) {
            $grupo = DB::table('grupos')->where('id', $datos['grupo_id'])->first(['sede_id', 'grado_id']);
            if (! $grupo) {
                throw ValidationException::withMessages(['grupo_id' => 'Grupo no válido.']);
            }
            Alcance::exigir($user, $grupo->sede_id, $grupo->grado_id);
            $resumen = Promocion::revertir((int) $datos['anio'], null, null, (int) $grupo->sede_id, (int) $datos['grupo_id']);

            return back()->with('reversion', $resumen);
        }

        $gradoId = isset($datos['grado_id']) ? (int) $datos['grado_id'] : null;
        $sedeId = isset($datos['sede']) ? DB::table('sedes')->where('codigo', $datos['sede'])->value('id') : null;
        if ($sedeId) {
            $gradoId ? Alcance::exigir($user, $sedeId, $gradoId) : Alcance::exigirSede($user, $sedeId);
        }
        if (isset($datos['estudiante_id'])) {
            Alcance::exigirEstudiante($user, (int) $datos['estudiante_id']);
        } elseif (! $gradoId && Alcance::grados($user) !== []) {
            throw ValidationException::withMessages(['grado_id' => 'Elige el grado: solo puedes deshacer la promoción de los grados que tienes asignados.']);
        }
        if ($sedeId && ! $gradoId && isset(Alcance::grados($user)[(int) $sedeId])) {
            throw ValidationException::withMessages(['grado_id' => 'Elige el grado: en esta sede solo tienes algunos grados.']);
        }
        $sedeId ??= $gradoId ? Alcance::sedesDelGrado($user, $gradoId) : Alcance::sedes($user);
        $resumen = Promocion::revertir((int) $datos['anio'], $datos['grado_id'] ?? null, $datos['estudiante_id'] ?? null, $sedeId);

        return back()->with('reversion', $resumen);
    }
}
