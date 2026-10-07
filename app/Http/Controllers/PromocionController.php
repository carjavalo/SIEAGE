<?php

namespace App\Http\Controllers;

use App\Support\Alcance;
use App\Support\Promocion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** Promover al grado siguiente: un estudiante, un grado o todo el colegio. */
class PromocionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'anio' => ['required', 'integer'],
            'grado_id' => ['nullable', 'integer', 'exists:grados,id'],
            'estudiante_id' => ['nullable', 'integer', 'exists:estudiantes,id'],
            'sede' => ['nullable', 'string', 'exists:sedes,codigo'],
        ]);

        $user = $request->user();
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
        // Sin sede pedida, "todo el colegio" es todo lo que este usuario puede ver (de ese grado).
        $sedeId ??= $gradoId ? Alcance::sedesDelGrado($user, $gradoId) : Alcance::sedes($user);
        $resumen = Promocion::ejecutar((int) $datos['anio'], $datos['grado_id'] ?? null, $datos['estudiante_id'] ?? null, $sedeId);

        return back()->with('promocion', $resumen);
    }
}
