<?php

namespace App\Http\Controllers;

use App\Models\Padre;
use App\Models\SolicitudInscripcion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Estudiantes inscritos por el formulario público que la secretaría todavía
 * revisa. Aquí se completan los datos de la madre y el padre.
 */
class InscritoController extends Controller
{
    public function index(Request $request): Response
    {
        $estado = in_array($request->query('estado'), ['pendiente', 'aprobada', 'rechazada', 'todas'], true)
            ? $request->query('estado')
            : 'pendiente';

        $inscritos = DB::table('solicitudes_inscripcion as s')
            ->join('grados as g', 'g.id', '=', 's.grado_id')
            ->join('parentescos as p', 'p.id', '=', 's.acudiente_parentesco_id')
            ->when($estado !== 'todas', fn ($q) => $q->where('s.estado', $estado))
            ->orderByDesc('s.created_at')
            ->get([
                's.id', 's.estado', 's.created_at',
                's.primer_nombre', 's.segundo_nombre', 's.primer_apellido', 's.segundo_apellido',
                's.tipo_documento', 's.numero_documento', 's.grado_id', 'g.numero as grado_numero', 'g.nombre as grado',
                's.acudiente_primer_nombre', 's.acudiente_primer_apellido', 'p.nombre as parentesco', 's.acudiente_telefono_1',
            ]);

        $padres = DB::table('padres')
            ->whereIn('solicitud_inscripcion_id', $inscritos->pluck('id'))
            ->get(['solicitud_inscripcion_id', 'parentesco'])
            ->groupBy('solicitud_inscripcion_id');

        return Inertia::render('inscritos/index', [
            'estado' => $estado,
            'conteos' => DB::table('solicitudes_inscripcion')->selectRaw('estado, count(*) as n')->groupBy('estado')->pluck('n', 'estado'),
            'inscritos' => $inscritos->map(fn ($i) => [
                ...(array) $i,
                'padres' => $padres->get($i->id, collect())->pluck('parentesco')->values(),
            ]),
            // Ficha del inscrito elegido (?ver=ID), que se muestra al lado de la
            // lista sin salir de la página. Solo se consulta si hay uno.
            'detalle' => fn () => $request->filled('ver') && ($elegida = SolicitudInscripcion::find((int) $request->query('ver')))
                ? $this->ficha($elegida)
                : null,
        ]);
    }

    public function show(SolicitudInscripcion $solicitud): Response
    {
        return Inertia::render('inscritos/show', $this->ficha($solicitud));
    }

    /**
     * Lo que llenó la familia en el formulario y lo registrado de la madre y
     * el padre. Lo usan la página del inscrito y la ficha lateral de la lista.
     *
     * @return array<string, mixed>
     */
    private function ficha(SolicitudInscripcion $solicitud): array
    {
        return [
            'solicitud' => [
                ...$solicitud->only([
                    'id', 'estado', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'sexo',
                    'pais_nacimiento', 'ciudad_nacimiento', 'tipo_documento', 'tipo_documento_otro', 'numero_documento',
                    'ciudad_expedicion', 'tipo_sangre', 'sisben', 'eps', 'grupo_etnico', 'discapacidad',
                    'direccion', 'barrio', 'telefono_1', 'telefono_2', 'correo',
                    'acudiente_primer_nombre', 'acudiente_segundo_nombre', 'acudiente_primer_apellido', 'acudiente_segundo_apellido',
                    'acudiente_numero_documento', 'acudiente_ciudad_expedicion', 'acudiente_parentesco_otro',
                    'acudiente_telefono_1', 'acudiente_telefono_2', 'acudiente_correo',
                ]),
                'fecha_nacimiento' => $solicitud->fecha_nacimiento?->format('Y-m-d'),
                'acudiente_fecha_nacimiento' => $solicitud->acudiente_fecha_nacimiento?->format('Y-m-d'),
                'enviada' => $solicitud->created_at?->toIso8601String(),
                'grado' => DB::table('grados')->where('id', $solicitud->grado_id)->value('nombre'),
                'acudiente_parentesco' => DB::table('parentescos')->where('id', $solicitud->acudiente_parentesco_id)->value('nombre'),
            ],
            'padres' => $solicitud->padres()->get()->keyBy('parentesco'),
        ];
    }

    public function guardarPadres(Request $request, SolicitudInscripcion $solicitud): RedirectResponse
    {
        $nombre = ['nullable', 'string', 'max:40', 'regex:/^(?=.*\pL)[\pL\pM\s\'.-]+$/u'];
        $reglas = [];
        foreach (['madre', 'padre'] as $p) {
            $conDatos = "exclude_unless:{$p}.situacion,registrado";
            $reglas += [
                "{$p}.situacion" => ['required', Rule::in(['registrado', 'fallecido', 'desconocido'])],
                "{$p}.es_acudiente" => ['boolean'],
                "{$p}.primer_nombre" => [$conDatos, 'required', ...array_slice($nombre, 1)],
                "{$p}.segundo_nombre" => [$conDatos, ...$nombre],
                "{$p}.primer_apellido" => [$conDatos, 'required', ...array_slice($nombre, 1)],
                "{$p}.segundo_apellido" => [$conDatos, ...$nombre],
                "{$p}.tipo_documento" => [$conDatos, 'nullable', Rule::in(['C.C.', 'C.E.', 'P.P.T.', 'PAS', 'Otro'])],
                "{$p}.numero_documento" => [$conDatos, 'nullable', 'digits_between:5,15'],
                "{$p}.fecha_nacimiento" => [$conDatos, 'nullable', 'date_format:Y-m-d', 'before:today', 'after:1900-01-01'],
                "{$p}.telefono" => [$conDatos, 'nullable', 'digits_between:7,10'],
                "{$p}.correo" => [$conDatos, 'nullable', 'email', 'max:120'],
                "{$p}.ocupacion" => [$conDatos, 'nullable', 'string', 'max:80'],
            ];
        }

        // Documento y teléfono llegan con puntos o espacios: solo dígitos.
        $limpio = $request->all();
        foreach (['madre', 'padre'] as $p) {
            foreach (['numero_documento', 'telefono'] as $c) {
                if (is_string($limpio[$p][$c] ?? null)) {
                    $limpio[$p][$c] = preg_replace('/\D/', '', $limpio[$p][$c]) ?: null;
                }
            }
        }
        $request->replace($limpio);

        $datos = $request->validate($reglas, [
            'required' => 'Este campo es obligatorio.',
            'regex' => 'Usa solo letras.',
            'max' => 'Máximo :max caracteres.',
            'in' => 'Elige una de las opciones.',
            'digits_between' => 'Debe tener entre :min y :max dígitos.',
            'date_format' => 'Escribe una fecha válida.',
            'before' => 'La fecha debe ser anterior a hoy.',
            'after' => 'Revisa el año de la fecha.',
            'email' => 'Escribe un correo válido.',
        ]);

        DB::transaction(function () use ($datos, $solicitud, $request) {
            foreach (['madre', 'padre'] as $p) {
                $fila = array_fill_keys(Padre::CAMPOS, null);
                $fila = array_merge($fila, $datos[$p]);
                $fila['es_acudiente'] = $fila['situacion'] === 'registrado' && (bool) ($fila['es_acudiente'] ?? false);

                Padre::updateOrCreate(
                    ['solicitud_inscripcion_id' => $solicitud->id, 'parentesco' => $p],
                    [...$fila, 'registrado_por' => $request->user()?->id],
                );
            }
        });

        return back()->with('success', 'Datos de los padres guardados.');
    }
}
