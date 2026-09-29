<?php

namespace App\Http\Controllers;

use App\Support\Promocion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $sedeId = isset($datos['sede']) ? DB::table('sedes')->where('codigo', $datos['sede'])->value('id') : null;
        $resumen = Promocion::ejecutar((int) $datos['anio'], $datos['grado_id'] ?? null, $datos['estudiante_id'] ?? null, $sedeId);

        return back()->with('promocion', $resumen);
    }
}
