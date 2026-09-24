<?php

namespace App\Http\Controllers;

use App\Models\Padre;
use App\Models\SolicitudInscripcion;
use App\Support\Grupos;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Estudiantes inscritos por el formulario público que la secretaría revisa:
 * primero se completan los datos de la madre y el padre, y después se elige
 * el grupo y se matricula (se crean el estudiante, el acudiente y la matrícula).
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
            ->leftJoin('matriculas as m', 'm.id', '=', 's.matricula_id')
            ->leftJoin('grupos as ga', 'ga.id', '=', 'm.grupo_id')
            ->when($estado !== 'todas', fn ($q) => $q->where('s.estado', $estado))
            ->orderByDesc('s.created_at')
            ->get([
                's.id', 's.estado', 's.created_at',
                's.primer_nombre', 's.segundo_nombre', 's.primer_apellido', 's.segundo_apellido',
                's.tipo_documento', 's.numero_documento', 's.grado_id', 'g.numero as grado_numero', 'g.nombre as grado',
                's.acudiente_primer_nombre', 's.acudiente_primer_apellido', 'p.nombre as parentesco', 's.acudiente_telefono_1',
                'ga.codigo as grupo_asignado',
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
                    'id', 'estado', 'grado_id', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'sexo',
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
            // Si ya se aprobó: dónde quedó matriculado.
            'matricula' => $solicitud->matricula_id
                ? DB::table('matriculas as m')
                    ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
                    ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
                    ->where('m.id', $solicitud->matricula_id)
                    ->first(['m.estudiante_id', 'm.grado_id', 'g.codigo as grupo', 'al.anio'])
                : null,
        ];
    }

    /**
     * Segundo paso: elegir el grupo, dentro del grado que pidió la familia,
     * viendo cuántos estudiantes tiene cada uno.
     */
    public function grupo(SolicitudInscripcion $solicitud): Response
    {
        $anioId = $this->anioDeMatricula($solicitud);

        return Inertia::render('inscritos/grupo', [
            ...$this->ficha($solicitud),
            'anio' => DB::table('anios_lectivos')->where('id', $anioId)->value('anio'),
            'gradoNumero' => DB::table('grados')->where('id', $solicitud->grado_id)->value('numero'),
            'grupos' => Grupos::conOcupacion($anioId, $solicitud->grado_id),
        ]);
    }

    /**
     * Aprueba la inscripción: crea (o completa, si ya estuvo en el colegio) el
     * estudiante y el acudiente, pasa a su nombre la madre y el padre, y lo
     * matricula en el grupo elegido. Todo o nada.
     */
    public function matricular(Request $request, SolicitudInscripcion $solicitud): RedirectResponse
    {
        $anioId = $this->anioDeMatricula($solicitud);
        $grupoId = $request->validate([
            'grupo_id' => [
                'required',
                'integer',
                Rule::exists('grupos', 'id')->where('grado_id', $solicitud->grado_id)->where('anio_lectivo_id', $anioId),
            ],
        ], [
            'grupo_id.required' => 'Elige el grupo.',
            'grupo_id.exists' => 'Ese grupo no es del grado que pidió la familia.',
        ])['grupo_id'];

        if ($solicitud->estado !== SolicitudInscripcion::PENDIENTE) {
            throw ValidationException::withMessages(['grupo_id' => 'Esta inscripción ya fue revisada.']);
        }
        if ($solicitud->padres()->count() < 2) {
            throw ValidationException::withMessages(['grupo_id' => 'Primero completa los datos de la madre y el padre.']);
        }

        DB::transaction(function () use ($request, $solicitud, $anioId, $grupoId) {
            $s = $solicitud;
            $grupo = DB::table('grupos')->find($grupoId);
            $barrioId = $this->barrio($s->barrio);
            $ahora = now();

            $estudianteId = $this->guardarPersona('estudiantes', $s->numero_documento, [
                'tipo_documento' => $s->tipo_documento,
                'tipo_documento_otro' => $s->tipo_documento_otro,
                'numero_documento' => $s->numero_documento,
                'ciudad_expedicion' => $s->ciudad_expedicion,
                // Como en el Excel: apellidos y luego nombres.
                'nombre_completo' => $this->nombre($s->primer_apellido, $s->segundo_apellido, $s->primer_nombre, $s->segundo_nombre),
                'primer_apellido' => $s->primer_apellido,
                'segundo_apellido' => $s->segundo_apellido,
                'primer_nombre' => $s->primer_nombre,
                'segundo_nombre' => $s->segundo_nombre,
                'fecha_nacimiento' => $s->fecha_nacimiento?->format('Y-m-d'),
                'pais_nacimiento' => $s->pais_nacimiento,
                'ciudad_nacimiento' => $s->ciudad_nacimiento,
                'genero' => $s->sexo,
                'tipo_sangre' => $s->tipo_sangre,
                'sisben' => $s->sisben,
                'eps' => $s->eps,
                'grupo_etnico' => $s->grupo_etnico,
                'discapacidad' => $s->discapacidad,
                'direccion' => $s->direccion,
                'barrio_id' => $barrioId,
                'telefono_1' => $s->telefono_1,
                'telefono_2' => $s->telefono_2,
                'correo' => $s->correo,
            ]);

            $yaMatriculado = DB::table('matriculas as m')
                ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
                ->where('m.estudiante_id', $estudianteId)
                ->where('m.anio_lectivo_id', $anioId)
                ->first(['g.codigo']);
            if ($yaMatriculado) {
                throw ValidationException::withMessages([
                    'grupo_id' => 'Ya está matriculado este año'.($yaMatriculado->codigo ? " en {$yaMatriculado->codigo}" : '').'.',
                ]);
            }

            $acudienteId = $this->guardarPersona('acudientes', $s->acudiente_numero_documento, [
                'tipo_documento' => 'C.C.',
                'numero_documento' => $s->acudiente_numero_documento,
                'ciudad_expedicion' => $s->acudiente_ciudad_expedicion,
                'nombre_completo' => $this->nombre($s->acudiente_primer_nombre, $s->acudiente_segundo_nombre, $s->acudiente_primer_apellido, $s->acudiente_segundo_apellido),
                'primer_nombre' => $s->acudiente_primer_nombre,
                'segundo_nombre' => $s->acudiente_segundo_nombre,
                'primer_apellido' => $s->acudiente_primer_apellido,
                'segundo_apellido' => $s->acudiente_segundo_apellido,
                'fecha_nacimiento' => $s->acudiente_fecha_nacimiento?->format('Y-m-d'),
                'telefono_celular' => $s->acudiente_telefono_1,
                'telefono_fijo' => $s->acudiente_telefono_2 !== $s->acudiente_telefono_1 ? $s->acudiente_telefono_2 : null,
                'email' => $s->acudiente_correo,
                'direccion' => $s->direccion,
                'barrio_id' => $barrioId,
            ]);

            // El acudiente de la inscripción queda como el principal.
            DB::table('estudiante_acudiente')->where('estudiante_id', $estudianteId)->where('acudiente_id', '!=', $acudienteId)->update(['es_principal' => false]);
            DB::table('estudiante_acudiente')->updateOrInsert(
                ['estudiante_id' => $estudianteId, 'acudiente_id' => $acudienteId],
                ['parentesco_id' => $s->acudiente_parentesco_id, 'parentesco_otro' => $s->acudiente_parentesco_otro, 'es_principal' => true, 'vive_con' => true],
            );

            // La madre y el padre pasan al estudiante, salvo que ya tuviera registrados de antes.
            $yaTiene = DB::table('padres')->where('estudiante_id', $estudianteId)->pluck('parentesco');
            DB::table('padres')->where('solicitud_inscripcion_id', $s->id)->whereNotIn('parentesco', $yaTiene)->update(['estudiante_id' => $estudianteId]);

            $matriculaId = DB::table('matriculas')->insertGetId([
                'estudiante_id' => $estudianteId,
                'anio_lectivo_id' => $anioId,
                'grado_id' => $s->grado_id,
                'grupo_id' => $grupo->id,
                'sede_id' => $grupo->sede_id,
                'jornada' => $grupo->jornada,
                'fecha_matricula' => $ahora->toDateString(),
                // Si ya tuvo matrículas en otros años, vuelve: no es nuevo.
                'condicion' => DB::table('matriculas')->where('estudiante_id', $estudianteId)->exists() ? 'antiguo' : 'nuevo',
                'estado' => 'activo',
                'observaciones' => "Inscrito por el formulario (solicitud {$s->id}).",
                'created_at' => $ahora,
                'updated_at' => $ahora,
            ]);

            // estado no es asignable en masa (el formulario es público): se asigna aquí a propósito.
            $s->forceFill([
                'estado' => SolicitudInscripcion::APROBADA,
                'matricula_id' => $matriculaId,
                'revisada_por' => $request->user()?->id,
                'revisada_en' => $ahora,
            ])->save();
        });

        return to_route('inscritos.index');
    }

    /** El año lectivo que estaba activo cuando la familia envió el formulario. */
    private function anioDeMatricula(SolicitudInscripcion $solicitud): ?int
    {
        return $solicitud->anio_lectivo_id ?? SolicitudInscripcion::anioLectivoActivoId();
    }

    /**
     * Crea el estudiante o acudiente; si ya existe con ese documento (volvió al
     * colegio, o es acudiente de un hermano), solo completa lo que le falta, sin
     * cambiar lo que ya tenía.
     *
     * @param  array<string, mixed>  $datos
     */
    private function guardarPersona(string $tabla, string $documento, array $datos): int
    {
        $existente = DB::table($tabla)->where('numero_documento', $documento)->first();
        if (! $existente) {
            return DB::table($tabla)->insertGetId([...$datos, 'created_at' => now(), 'updated_at' => now()]);
        }

        $faltan = array_filter($datos, fn ($valor, $campo) => $valor !== null && ($existente->{$campo} ?? null) === null, ARRAY_FILTER_USE_BOTH);
        // Un estudiante borrado que vuelve se recupera.
        if (($existente->deleted_at ?? null) !== null) {
            $faltan['deleted_at'] = null;
        }
        if ($faltan) {
            DB::table($tabla)->where('id', $existente->id)->update([...$faltan, 'updated_at' => now()]);
        }

        return $existente->id;
    }

    /** El barrio que escribió la familia; si no está en el catálogo, se agrega. */
    private function barrio(?string $nombre): ?int
    {
        $nombre = mb_substr(trim((string) $nombre), 0, 80);
        if ($nombre === '') {
            return null;
        }

        // La columna es única sin distinguir tildes ni mayúsculas: se reutiliza el que ya exista.
        return DB::table('barrios')->where('nombre', $nombre)->value('id') ?? DB::table('barrios')->insertGetId(['nombre' => $nombre]);
    }

    private function nombre(?string ...$partes): string
    {
        return implode(' ', array_filter($partes));
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

        // Si sigue pendiente, lo que sigue es elegir el grupo y matricular.
        return $solicitud->estado === SolicitudInscripcion::PENDIENTE
            ? to_route('inscritos.grupo', $solicitud)
            : back();
    }
}
