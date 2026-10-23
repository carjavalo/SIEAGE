<?php

namespace App\Http\Controllers;

use App\Support\Alcance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Marcar que un estudiante reprobó el año: sigue activo, pero al promover repite
 * su mismo grado en el año siguiente (y queda como repitente), en vez de pasar
 * al siguiente. Se puede quitar si fue un error. Queda en el historial de la
 * matrícula con la razón y quién lo hizo.
 *
 * Si ya lo habían promovido, esa matrícula del año siguiente se quita para que,
 * al promover otra vez, quede en el grado correcto.
 */
class ReprobacionController extends Controller
{
    public function reprobar(Request $request, int $estudiante): RedirectResponse
    {
        $razon = trim($request->validate(['razon' => ['required', 'string', 'min:5', 'max:500']], self::MENSAJES)['razon']);
        $m = $this->matriculaEnCurso($estudiante);
        if ($m->estado !== 'activo') {
            throw ValidationException::withMessages(['razon' => 'Solo se marca la reprobación de un estudiante activo.']);
        }
        if ($m->resultado === 'reprobado') {
            throw ValidationException::withMessages(['razon' => 'Ya está marcado: repetirá el grado.']);
        }

        $quitada = DB::transaction(function () use ($request, $m, $razon) {
            DB::table('matriculas')->where('id', $m->id)->update(['resultado' => 'reprobado', 'updated_at' => now()]);
            $this->anotar($request, $m, 'reprobada', $razon);

            return $this->quitarPromocion($m);
        });

        return back()->with('success', "Reprobó {$m->grado}: al promover, repetirá {$m->grado} en ".($m->anio + 1).'.'
            .($quitada ? " Se quitó la matrícula de {$quitada} que ya tenía." : ''));
    }

    public function quitar(Request $request, int $estudiante): RedirectResponse
    {
        $razon = trim($request->validate(['razon' => ['required', 'string', 'min:5', 'max:500']], self::MENSAJES)['razon']);
        $m = $this->matriculaEnCurso($estudiante);
        if ($m->resultado !== 'reprobado') {
            throw ValidationException::withMessages(['razon' => 'No está marcado como reprobado.']);
        }

        $quitada = DB::transaction(function () use ($request, $m, $razon) {
            DB::table('matriculas')->where('id', $m->id)->update(['resultado' => null, 'updated_at' => now()]);
            $this->anotar($request, $m, 'reprobacion_quitada', $razon);

            return $this->quitarPromocion($m);
        });

        return back()->with('success', 'Ya no repite: al promover pasará al grado siguiente.'
            .($quitada ? " Se quitó la matrícula de {$quitada} en que repetía." : ''));
    }

    private const MENSAJES = [
        'razon.required' => 'Escribe la razón.',
        'razon.min' => 'Cuéntalo con un poco más de detalle (mínimo :min caracteres).',
        'razon.max' => 'Máximo :max caracteres.',
    ];

    /** La matrícula del estudiante en el año lectivo en curso (de las sedes y grados del usuario). */
    private function matriculaEnCurso(int $estudiante): object
    {
        Alcance::exigirEstudiante(request()->user(), $estudiante);
        $m = DB::table('matriculas as m')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->where('al.estado', 'activo')
            ->where('m.estudiante_id', $estudiante)
            ->tap(fn ($q) => Alcance::filtrar($q, request()->user(), 'm.sede_id', 'm.grado_id'))
            ->first(['m.id', 'm.estudiante_id', 'm.estado', 'm.resultado', 'al.anio', 'gr.nombre as grado']);

        return $m ?? throw ValidationException::withMessages(['razon' => 'El estudiante no tiene matrícula en el año en curso.']);
    }

    /** Si ya tenía matrícula en el año siguiente (planeado), se quita; devuelve ese año. */
    private function quitarPromocion(object $m): ?int
    {
        $planeada = DB::table('matriculas as sig')
            ->join('anios_lectivos as al', 'al.id', '=', 'sig.anio_lectivo_id')
            ->where('sig.estudiante_id', $m->estudiante_id)
            ->where('al.estado', 'planeado')
            ->first(['sig.id', 'al.anio']);
        if (! $planeada) {
            return null;
        }
        DB::table('matriculas')->where('id', $planeada->id)->delete();

        return (int) $planeada->anio;
    }

    private function anotar(Request $request, object $m, string $tipo, string $razon): void
    {
        DB::table('novedades_matricula')->insert([
            'matricula_id' => $m->id,
            'tipo' => $tipo,
            'estado_anterior' => $m->estado,
            'estado_nuevo' => $m->estado,
            'razon' => $razon,
            'fecha' => now()->toDateString(),
            'user_id' => $request->user()->id,
            'created_at' => now(),
        ]);
    }
}
