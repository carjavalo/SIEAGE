<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Los grupos de una sede: crearlos, cambiarles el número, la jornada o el cupo
 * y eliminar los que quedaron vacíos (desde Sedes), y guardar los cupos de un
 * grado completo (desde Estudiantes). En un año lectivo cerrado no se toca nada.
 */
class GrupoController extends Controller
{
    private const MENSAJES = [
        'required' => 'Este campo es obligatorio.',
        'integer' => 'Debe ser un número entero.',
        'min' => 'Mínimo :min.',
        'max' => 'Máximo :max.',
        'in' => 'Elige una de las opciones.',
        'exists' => 'Elige una de las opciones.',
    ];

    public function store(Request $request, int $sede): RedirectResponse
    {
        $sede = DB::table('sedes')->find($sede) ?? abort(404);
        $datos = $request->validate([
            'anio' => ['required', 'integer', 'exists:anios_lectivos,anio'],
            'grado_id' => ['required', 'integer', 'exists:grados,id'],
            ...$this->reglas(),
        ], self::MENSAJES);

        $anio = DB::table('anios_lectivos')->where('anio', $datos['anio'])->first();
        $this->abierto($anio->estado);
        $grado = DB::table('grados')->find($datos['grado_id']);
        $codigo = $this->libre($anio->id, $sede->id, $grado, (int) $datos['numero']);

        DB::table('grupos')->insert([
            'anio_lectivo_id' => $anio->id,
            'sede_id' => $sede->id,
            'grado_id' => $grado->id,
            'numero' => (int) $datos['numero'],
            'codigo' => $codigo,
            'jornada' => $datos['jornada'],
            'cupos_proyectados' => (int) $datos['cupos'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Grupo {$codigo} creado en {$sede->nombre}.");
    }

    public function update(Request $request, int $grupo): RedirectResponse
    {
        $actual = DB::table('grupos')->find($grupo) ?? abort(404);
        $datos = $request->validate($this->reglas(), self::MENSAJES);

        $this->abierto(DB::table('anios_lectivos')->where('id', $actual->anio_lectivo_id)->value('estado'));
        $grado = DB::table('grados')->find($actual->grado_id);
        $codigo = $this->libre($actual->anio_lectivo_id, $actual->sede_id, $grado, (int) $datos['numero'], $actual->id);

        DB::transaction(function () use ($actual, $datos, $codigo) {
            DB::table('grupos')->where('id', $actual->id)->update([
                'numero' => (int) $datos['numero'],
                'codigo' => $codigo,
                'jornada' => $datos['jornada'],
                'cupos_proyectados' => (int) $datos['cupos'],
                'updated_at' => now(),
            ]);
            // Sus estudiantes llevan la jornada del grupo en la matrícula: cambia con él.
            if ($datos['jornada'] !== $actual->jornada) {
                DB::table('matriculas')->where('grupo_id', $actual->id)->where('jornada', $actual->jornada)
                    ->update(['jornada' => $datos['jornada'], 'updated_at' => now()]);
            }
        });

        return back()->with('success', "Grupo {$codigo} actualizado.");
    }

    public function destroy(int $grupo): RedirectResponse
    {
        $actual = DB::table('grupos')->find($grupo) ?? abort(404);
        $this->abierto(DB::table('anios_lectivos')->where('id', $actual->anio_lectivo_id)->value('estado'));

        $matriculas = DB::table('matriculas')->where('grupo_id', $actual->id)->count();
        if ($matriculas > 0) {
            throw ValidationException::withMessages([
                'eliminar' => "El grupo {$actual->codigo} tiene {$matriculas} ".($matriculas === 1 ? 'estudiante registrado' : 'estudiantes registrados').': no se puede eliminar.',
            ]);
        }

        DB::table('grupos')->where('id', $actual->id)->delete();

        return back()->with('success', "Grupo {$actual->codigo} eliminado.");
    }

    /** @return array<string, list<mixed>> */
    private function reglas(): array
    {
        return [
            'numero' => ['required', 'integer', 'min:1', 'max:30'],
            'jornada' => ['required', Rule::in(SedeController::JORNADAS)],
            'cupos' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }

    private function abierto(?string $estado): void
    {
        if ($estado === 'cerrado') {
            throw ValidationException::withMessages(['numero' => 'Ese año lectivo ya está cerrado: sus grupos no se cambian.']);
        }
    }

    /**
     * El código del grupo («6-3»), si ese número está libre en la sede para ese
     * grado y año. No se repite ni en otra jornada: dos «6-3» en la misma sede se confundirían.
     */
    private function libre(int $anioId, int $sedeId, object $grado, int $numero, ?int $excepto = null): string
    {
        $codigo = "{$grado->numero}-{$numero}";
        $ocupado = DB::table('grupos')
            ->where(['anio_lectivo_id' => $anioId, 'sede_id' => $sedeId, 'grado_id' => $grado->id, 'numero' => $numero])
            ->when($excepto, fn ($q) => $q->where('id', '<>', $excepto))
            ->exists();
        if ($ocupado) {
            throw ValidationException::withMessages(['numero' => "Ya existe el grupo {$codigo} en esta sede."]);
        }

        return $codigo;
    }

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
