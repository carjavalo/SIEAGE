<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Cupos de los grupos: los define la institución por grupo (antes eran 34 fijos). */
class GrupoController extends Controller
{
    public function cupos(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'cupos' => ['required', 'array', 'min:1'],
            'cupos.*' => ['required', 'integer', 'min:1', 'max:99'],
        ], [
            'cupos.*.required' => 'Escribe el cupo.',
            'cupos.*.integer' => 'Debe ser un número entero.',
            'cupos.*.min' => 'Mínimo :min.',
            'cupos.*.max' => 'Máximo :max.',
        ]);

        $ids = array_map('intval', array_keys($datos['cupos']));
        abort_if(DB::table('grupos')->whereIn('id', $ids)->count() !== count($ids), 422, 'Grupo inexistente.');

        DB::transaction(function () use ($datos) {
            foreach ($datos['cupos'] as $id => $cupos) {
                DB::table('grupos')->where('id', (int) $id)->update(['cupos_proyectados' => (int) $cupos, 'updated_at' => now()]);
            }
        });

        $n = count($ids);

        return back()->with('success', $n === 1 ? 'Cupo guardado.' : "Cupos de {$n} grupos guardados.");
    }
}
