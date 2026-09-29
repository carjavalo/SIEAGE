<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Deshabilitar a un estudiante en el año en curso (perdió el año, se retiró,
 * fue trasladado u otro motivo) y volver a habilitarlo si fue un error. Cada
 * cambio queda en novedades_matricula con su razón y quién lo hizo.
 */
class DeshabilitacionController extends Controller
{
    /** Motivo elegido en el formulario → estado de la matrícula. */
    public const MOTIVOS = [
        'perdio' => 'reprobado',
        'retiro' => 'retirado',
        'traslado' => 'trasladado',
        'otro' => 'cancelado',
    ];

    private const MENSAJES = [
        'razon.required' => 'Escribe la razón.',
        'razon.min' => 'Cuéntalo con un poco más de detalle (mínimo :min caracteres).',
        'razon.max' => 'Máximo :max caracteres.',
        'motivo.required' => 'Elige el motivo.',
        'motivo.in' => 'Elige el motivo.',
        'fecha.required' => 'Indica la fecha.',
        'fecha.date_format' => 'Escribe una fecha válida.',
        'fecha.before_or_equal' => 'La fecha no puede ser futura.',
    ];

    public function deshabilitar(Request $request, int $estudiante): RedirectResponse
    {
        $datos = $request->validate([
            'motivo' => ['required', Rule::in(array_keys(self::MOTIVOS))],
            'razon' => ['required', 'string', 'min:5', 'max:500'],
            'fecha' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
        ], self::MENSAJES);

        $matricula = $this->matriculaEnCurso($estudiante);
        if ($matricula->estado !== 'activo') {
            throw ValidationException::withMessages(['razon' => 'El estudiante ya no está activo este año.']);
        }

        $estado = self::MOTIVOS[$datos['motivo']];
        $razon = trim($datos['razon']);

        $quitadas = DB::transaction(function () use ($request, $matricula, $estado, $razon, $datos) {
            DB::table('matriculas')->where('id', $matricula->id)->update([
                'estado' => $estado,
                'resultado' => $estado === 'reprobado' ? 'reprobado' : null,
                'fecha_retiro' => $datos['fecha'],
                'motivo_retiro' => $razon,
                'deshabilitado_por' => $request->user()->id,
                'deshabilitado_en' => now(),
                'updated_at' => now(),
            ]);
            $this->anotar($request, $matricula, 'deshabilitada', $estado, $razon, $datos['fecha']);

            // Si ya lo habían promovido al año siguiente, esa matrícula planeada sobra.
            return DB::table('matriculas')
                ->where('estudiante_id', $matricula->estudiante_id)
                ->whereIn('anio_lectivo_id', DB::table('anios_lectivos')->where('estado', 'planeado')->select('id'))
                ->delete();
        });

        $texto = ['reprobado' => 'perdió el año', 'retirado' => 'retirado', 'trasladado' => 'trasladado', 'cancelado' => 'deshabilitado'][$estado];

        return back()->with('success', "Estudiante deshabilitado: {$texto}.".($quitadas ? ' Se quitó su matrícula del año siguiente.' : ''));
    }

    public function habilitar(Request $request, int $estudiante): RedirectResponse
    {
        $datos = $request->validate([
            'razon' => ['required', 'string', 'min:5', 'max:500'],
        ], self::MENSAJES);

        $matricula = $this->matriculaEnCurso($estudiante);
        if (in_array($matricula->estado, ['activo', 'graduado'], true)) {
            throw ValidationException::withMessages(['razon' => 'El estudiante no está deshabilitado.']);
        }

        DB::transaction(function () use ($request, $matricula, $datos) {
            DB::table('matriculas')->where('id', $matricula->id)->update([
                'estado' => 'activo',
                'resultado' => null,
                'fecha_retiro' => null,
                'motivo_retiro' => null,
                'deshabilitado_por' => null,
                'deshabilitado_en' => null,
                'updated_at' => now(),
            ]);
            $this->anotar($request, $matricula, 'habilitada', 'activo', trim($datos['razon']), now()->toDateString());
        });

        return back()->with('success', 'Estudiante habilitado de nuevo.');
    }

    /** La matrícula del estudiante en el año lectivo en curso. */
    private function matriculaEnCurso(int $estudiante): object
    {
        $matricula = DB::table('matriculas as m')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->where('al.estado', 'activo')
            ->where('m.estudiante_id', $estudiante)
            ->first(['m.id', 'm.estudiante_id', 'm.estado']);

        if (! $matricula) {
            throw ValidationException::withMessages(['razon' => 'El estudiante no tiene matrícula en el año en curso.']);
        }

        return $matricula;
    }

    private function anotar(Request $request, object $matricula, string $tipo, string $estadoNuevo, string $razon, string $fecha): void
    {
        DB::table('novedades_matricula')->insert([
            'matricula_id' => $matricula->id,
            'tipo' => $tipo,
            'estado_anterior' => $matricula->estado,
            'estado_nuevo' => $estadoNuevo,
            'razon' => $razon,
            'fecha' => $fecha,
            'user_id' => $request->user()->id,
            'created_at' => now(),
        ]);
    }
}
