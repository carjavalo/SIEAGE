<?php

namespace App\Http\Controllers;

use App\Models\Padre;
use App\Models\SolicitudInscripcion;
use App\Support\Alcance;
use App\Support\Barrios;
use App\Support\Documentos;
use App\Support\Edades;
use App\Support\Grupos;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Estudiantes inscritos por el formulario público que la secretaría revisa:
 * primero se revisan los datos de la madre y el padre (los llena la familia en
 * el formulario; en las solicitudes anteriores, la secretaría), luego se marcan los
 * documentos que trajo el acudiente y después se elige el grupo y se
 * matricula (se crean el estudiante, el acudiente y la matrícula).
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
            ->leftJoin('sedes as sp', 'sp.id', '=', 's.sede_preferida_id')
            ->tap(fn ($q) => Alcance::filtrarSolicitudes($q, $request->user()))
            ->when($estado !== 'todas', fn ($q) => $q->where('s.estado', $estado))
            ->orderByDesc('s.created_at')
            ->get([
                's.id', 's.estado', 's.created_at',
                's.primer_nombre', 's.segundo_nombre', 's.primer_apellido', 's.segundo_apellido',
                's.tipo_documento', 's.numero_documento', 's.grado_id', 'g.numero as grado_numero', 'g.nombre as grado',
                's.acudiente_primer_nombre', 's.acudiente_primer_apellido', 'p.nombre as parentesco', 's.acudiente_telefono_1',
                'ga.codigo as grupo_asignado',
                // La sede que pidió la familia (solo primaria).
                'sp.codigo as sede_preferida_codigo', 'sp.nombre as sede_preferida',
            ]);

        $padres = DB::table('padres')
            ->whereIn('solicitud_inscripcion_id', $inscritos->pluck('id'))
            ->get(['solicitud_inscripcion_id', 'parentesco'])
            ->groupBy('solicitud_inscripcion_id');

        return Inertia::render('inscritos/index', [
            'estado' => $estado,
            'conteos' => Alcance::filtrarSolicitudes(DB::table('solicitudes_inscripcion as s'), $request->user())
                ->selectRaw('s.estado, count(*) as n')->groupBy('s.estado')->pluck('n', 'estado'),
            'inscritos' => $inscritos->map(fn ($i) => [
                ...(array) $i,
                'padres' => $padres->get($i->id, collect())->pluck('parentesco')->values(),
            ]),
            // Ficha del inscrito elegido (?ver=ID), que se muestra al lado de la
            // lista sin salir de la página. Solo se consulta si hay uno.
            'detalle' => fn () => $request->filled('ver')
                && Alcance::filtrarSolicitudes(DB::table('solicitudes_inscripcion as s')->where('s.id', (int) $request->query('ver')), $request->user())->exists()
                && ($elegida = SolicitudInscripcion::find((int) $request->query('ver')))
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
        Alcance::exigirSolicitud(request()->user(), $solicitud->id);

        return [
            'solicitud' => [
                ...$solicitud->only([
                    'id', 'estado', 'grado_id', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'sexo',
                    'pais_nacimiento', 'ciudad_nacimiento', 'tipo_documento', 'tipo_documento_otro', 'numero_documento',
                    'ciudad_expedicion', 'tipo_sangre', 'sisben', 'eps', 'grupo_etnico', 'discapacidad',
                    'direccion', 'barrio', 'telefono_1', 'telefono_2', 'correo',
                    'acudiente_primer_nombre', 'acudiente_segundo_nombre', 'acudiente_primer_apellido', 'acudiente_segundo_apellido',
                    'acudiente_numero_documento', 'acudiente_ciudad_expedicion', 'acudiente_parentesco_otro',
                    'acudiente_direccion', 'acudiente_barrio', 'datos_adicionales',
                    'acudiente_telefono_1', 'acudiente_telefono_2', 'acudiente_correo',
                ]),
                'fecha_nacimiento' => $solicitud->fecha_nacimiento?->format('Y-m-d'),
                'acudiente_fecha_nacimiento' => $solicitud->acudiente_fecha_nacimiento?->format('Y-m-d'),
                'enviada' => $solicitud->created_at?->toIso8601String(),
                'grado' => DB::table('grados')->where('id', $solicitud->grado_id)->value('nombre'),
                'jornada' => $solicitud->jornada,
                'sede_preferida' => $solicitud->sede_preferida_id
                    ? DB::table('sedes')->where('id', $solicitud->sede_preferida_id)->value('nombre')
                    : null,
                'acudiente_parentesco' => DB::table('parentescos')->where('id', $solicitud->acudiente_parentesco_id)->value('nombre'),
            ],
            'padres' => $solicitud->padres()->get()->keyBy('parentesco'),
            'documentos' => Documentos::resumen($solicitud),
            // Alerta de edad para el grado que pidió la familia, en el año de la inscripción.
            'edad' => Edades::alerta(
                $solicitud->fecha_nacimiento?->format('Y-m-d'),
                (int) DB::table('grados')->where('id', $solicitud->grado_id)->value('numero'),
                (int) (DB::table('anios_lectivos')->where('id', $this->anioDeMatricula($solicitud))->value('anio') ?? now()->year),
            ),
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
     * Segundo paso: marcar los documentos que trajo el acudiente, con la lista
     * de primaria o de bachillerato según el grado.
     */
    public function documentos(SolicitudInscripcion $solicitud): Response
    {
        return Inertia::render('inscritos/documentos', [
            ...$this->ficha($solicitud),
            'requisitos' => Documentos::para($solicitud),
            'nivel' => Documentos::esPrimaria($solicitud) ? 'primaria' : 'bachillerato',
            // Como objeto aunque esté vacío: en el navegador es un mapa clave → estado.
            'marcados' => (object) ($solicitud->documentos ?? []),
            'registro' => $solicitud->documentos_en ? [
                'por' => DB::table('users')->where('id', $solicitud->documentos_por)->value('name'),
                'en' => $solicitud->documentos_en->toIso8601String(),
            ] : null,
        ]);
    }

    public function guardarDocumentos(Request $request, SolicitudInscripcion $solicitud): RedirectResponse
    {
        Alcance::exigirSolicitud($request->user(), $solicitud->id);
        // Solo claves de la lista que le toca (primaria o bachillerato), en su orden.
        $marcados = Documentos::validar($request, Documentos::para($solicitud));

        $registro = ['documentos_por' => $request->user()?->id, 'documentos_en' => now()];
        $solicitud->forceFill(['documentos' => $marcados, ...$registro])->save();
        // Ya matriculado: la ficha del estudiante lee los de su matrícula.
        if ($solicitud->matricula_id) {
            DB::table('matriculas')->where('id', $solicitud->matricula_id)->update(['documentos' => json_encode($marcados), ...$registro]);
        }

        // Si sigue pendiente, lo que sigue es elegir el grupo y matricular.
        return $solicitud->estado === SolicitudInscripcion::PENDIENTE
            ? to_route('inscritos.grupo', $solicitud)
            : back();
    }

    /**
     * Tercer paso: elegir el grupo, dentro del grado que pidió la familia,
     * viendo cuántos estudiantes tiene cada uno.
     */
    public function grupo(Request $request, SolicitudInscripcion $solicitud): Response
    {
        // El año en que queda matriculado: el en curso o uno siguiente ya creado (?anio=2027).
        $anios = $this->aniosParaMatricular();
        $anioId = $anios->firstWhere('anio', $request->integer('anio'))?->id
            ?? ($anios->contains('id', $this->anioDeMatricula($solicitud)) ? $this->anioDeMatricula($solicitud) : $anios->first()?->id);

        return Inertia::render('inscritos/grupo', [
            ...$this->ficha($solicitud),
            'anio' => DB::table('anios_lectivos')->where('id', $anioId)->value('anio'),
            'anios' => $anios->map(fn ($a) => ['anio' => (int) $a->anio, 'estado' => $a->estado])->values(),
            'gradoNumero' => DB::table('grados')->where('id', $solicitud->grado_id)->value('numero'),
            // Solo los grupos de las sedes del usuario.
            'grupos' => Grupos::conOcupacion($anioId, $solicitud->grado_id, Alcance::sedesDelGrado(request()->user(), (int) $solicitud->grado_id)),
            // Si ya está en la institución este año (por su documento): activo, no se matricula otra vez; retirado, se reactiva.
            'matriculaExistente' => $solicitud->estado === SolicitudInscripcion::PENDIENTE
                ? $this->matriculaDelAnio(DB::table('estudiantes')->where('numero_documento', $solicitud->numero_documento)->value('id'), $anioId)
                : null,
        ]);
    }

    /** Los años en que se puede matricular: el que está en curso y los siguientes ya creados (planeados). */
    private function aniosParaMatricular(): Collection
    {
        return DB::table('anios_lectivos')->whereIn('estado', ['activo', 'planeado'])->orderBy('anio')->get(['id', 'anio', 'estado']);
    }

    /** La matrícula que ya tiene el estudiante en ese año, con su grupo y estado; null si no tiene. */
    private function matriculaDelAnio(?int $estudianteId, ?int $anioId): ?object
    {
        if (! $estudianteId || ! $anioId) {
            return null;
        }

        return DB::table('matriculas as m')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->where('m.estudiante_id', $estudianteId)
            ->where('m.anio_lectivo_id', $anioId)
            ->first(['m.id', 'm.estado', 'm.observaciones', 'g.codigo as grupo', 'gr.nombre as grado', 'm.fecha_retiro', 'm.motivo_retiro']);
    }

    /**
     * Aprueba la inscripción: crea (o completa, si ya estuvo en la institución) el
     * estudiante y el acudiente, pasa a su nombre la madre y el padre, y lo
     * matricula en el grupo elegido. Todo o nada.
     */
    public function matricular(Request $request, SolicitudInscripcion $solicitud): RedirectResponse
    {
        Alcance::exigirSolicitud($request->user(), $solicitud->id);
        $grupoId = $request->validate([
            'grupo_id' => [
                'required',
                'integer',
                // Del grado que pidió la familia, en el año en curso o en uno siguiente ya creado.
                Rule::exists('grupos', 'id')->where('grado_id', $solicitud->grado_id)->whereIn('anio_lectivo_id', $this->aniosParaMatricular()->pluck('id')->all())
                    ->when(! Alcance::todas($request->user()), fn ($r) => $r->whereIn('sede_id', Alcance::sedesDelGrado($request->user(), (int) $solicitud->grado_id))),
            ],
        ], [
            'grupo_id.required' => 'Elige el grupo.',
            'grupo_id.exists' => 'Ese grupo no es del grado que pidió la familia.',
        ])['grupo_id'];
        // El año es el del grupo elegido.
        $anioId = (int) DB::table('grupos')->where('id', $grupoId)->value('anio_lectivo_id');

        if ($solicitud->estado !== SolicitudInscripcion::PENDIENTE) {
            throw ValidationException::withMessages(['grupo_id' => 'Esta inscripción ya fue revisada.']);
        }
        if ($solicitud->padres()->count() < 2) {
            throw ValidationException::withMessages(['grupo_id' => 'Primero completa los datos de la madre y el padre.']);
        }

        DB::transaction(function () use ($request, $solicitud, $anioId, $grupoId) {
            $s = $solicitud;
            $grupo = DB::table('grupos')->find($grupoId);
            $barrioId = Barrios::id($s->barrio);
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

            // Si ya tiene matrícula este año: activa, ya estudia aquí y no se matricula otra vez;
            // retirada (o cancelada), vuelve a la institución y esa misma matrícula se reactiva más abajo.
            $existente = $this->matriculaDelAnio($estudianteId, $anioId);
            if ($existente?->estado === 'activo') {
                throw ValidationException::withMessages([
                    'grupo_id' => 'Ya está matriculado y activo este año en '.($existente->grupo ?? $existente->grado).'. Búscalo en Estudiantes.',
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
                'direccion' => $s->acudiente_direccion ?? $s->direccion,
                'barrio_id' => $s->acudiente_barrio ? Barrios::id($s->acudiente_barrio) : $barrioId,
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

            $nueva = [
                'grado_id' => $s->grado_id,
                'grupo_id' => $grupo->id,
                'sede_id' => $grupo->sede_id,
                'jornada' => $grupo->jornada,
                'fecha_matricula' => $ahora->toDateString(),
                'estado' => 'activo',
                'updated_at' => $ahora,
                // Los documentos recibidos pasan a la matrícula; los que falten se marcan en la ficha del estudiante.
                // Sin nada marcado en la inscripción, una matrícula que se reactiva conserva los que ya tenía.
                ...($s->documentos !== null ? [
                    'documentos' => json_encode($s->documentos),
                    'documentos_por' => $s->documentos_por,
                    'documentos_en' => $s->documentos_en,
                ] : []),
            ];
            if ($existente) {
                // Vuelve después de retirarse este mismo año: se reactiva su matrícula, sin el retiro.
                DB::table('matriculas')->where('id', $existente->id)->update([
                    ...$nueva,
                    'resultado' => null,
                    'fecha_retiro' => null,
                    'motivo_retiro' => null,
                    'deshabilitado_por' => null,
                    'deshabilitado_en' => null,
                    'observaciones' => trim(($existente->observaciones ? $existente->observaciones."\n" : '')."Volvió por el formulario de inscripción (solicitud {$s->id})."),
                ]);
                DB::table('novedades_matricula')->insert([
                    'matricula_id' => $existente->id,
                    'tipo' => 'habilitada',
                    'estado_anterior' => $existente->estado,
                    'estado_nuevo' => 'activo',
                    'razon' => "Volvió a la institución: se matriculó otra vez por el formulario de inscripción (solicitud {$s->id}).",
                    'fecha' => $ahora->toDateString(),
                    'user_id' => $request->user()?->id,
                    'created_at' => $ahora,
                ]);
                $matriculaId = $existente->id;
            } else {
                $matriculaId = DB::table('matriculas')->insertGetId([...$nueva,
                    'estudiante_id' => $estudianteId,
                    'anio_lectivo_id' => $anioId,
                    // Si ya tuvo matrículas en otros años, vuelve: no es nuevo.
                    'condicion' => DB::table('matriculas')->where('estudiante_id', $estudianteId)->exists() ? 'antiguo' : 'nuevo',
                    'observaciones' => "Inscrito por el formulario (solicitud {$s->id}).",
                    'created_at' => $ahora,
                ]);
            }

            // estado no es asignable en masa (el formulario es público): se asigna aquí a propósito.
            $s->forceFill([
                'estado' => SolicitudInscripcion::APROBADA,
                'matricula_id' => $matriculaId,
                // La inscripción queda en el año en que se matriculó (cuenta en el informe de ese año).
                'anio_lectivo_id' => $anioId,
                'revisada_por' => $request->user()?->id,
                'revisada_en' => $ahora,
            ])->save();
        });

        return to_route('inscritos.index');
    }

    /**
     * Deshacer la matrícula de un inscrito (se matriculó por error, o en el grupo o
     * el año que no era): la inscripción vuelve a pendiente y la matrícula se borra.
     * Si esa matrícula era la de un estudiante que volvía (se había retirado ese
     * año y se reactivó), no se borra: vuelve a como estaba. La madre y el padre
     * vuelven a la inscripción, y los documentos marcados después, también.
     *
     * No se deja si ya tiene matrícula en un año siguiente (promovido) o boletines
     * escritos: eso se quita primero.
     */
    public function devolver(Request $request, SolicitudInscripcion $solicitud): RedirectResponse
    {
        Alcance::exigirSolicitud($request->user(), $solicitud->id);
        $m = $solicitud->estado === SolicitudInscripcion::APROBADA && $solicitud->matricula_id
            ? DB::table('matriculas as m')->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
                ->where('m.id', $solicitud->matricula_id)->first(['m.id', 'm.estudiante_id', 'm.documentos', 'm.documentos_por', 'm.documentos_en', 'al.anio'])
            : null;
        if (! $m) {
            throw ValidationException::withMessages(['devolver' => 'Esta inscripción no tiene una matrícula que deshacer.']);
        }
        $siguiente = DB::table('matriculas as m')->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->where('m.estudiante_id', $m->estudiante_id)->where('al.anio', '>', $m->anio)->min('al.anio');
        if ($siguiente) {
            throw ValidationException::withMessages(['devolver' => "Ya tiene matrícula en {$siguiente} (lo promovieron): quita primero esa matrícula."]);
        }
        if (DB::table('boletines')->where('matricula_id', $m->id)->exists()) {
            throw ValidationException::withMessages(['devolver' => 'Ya tiene boletines escritos en esta matrícula: no se puede deshacer.']);
        }

        DB::transaction(function () use ($request, $solicitud, $m) {
            $ahora = now();
            // ¿Era un estudiante que volvía? Su matrícula del año se había reactivado con esta inscripción.
            $reactivada = DB::table('novedades_matricula')->where('matricula_id', $m->id)->where('tipo', 'habilitada')
                ->where('razon', 'like', "%(solicitud {$solicitud->id})%")->orderByDesc('id')->first();
            if ($reactivada) {
                DB::table('matriculas')->where('id', $m->id)->update([
                    'estado' => $reactivada->estado_anterior,
                    'fecha_retiro' => $reactivada->fecha,
                    'motivo_retiro' => "Se deshizo la matrícula por la inscripción (solicitud {$solicitud->id}).",
                    'deshabilitado_por' => $request->user()?->id,
                    'deshabilitado_en' => $ahora,
                    'updated_at' => $ahora,
                ]);
                DB::table('novedades_matricula')->insert([
                    'matricula_id' => $m->id,
                    'tipo' => 'deshabilitada',
                    'estado_anterior' => 'activo',
                    'estado_nuevo' => $reactivada->estado_anterior,
                    'razon' => "Se devolvió a inscritos: se deshizo la matrícula por el formulario (solicitud {$solicitud->id}).",
                    'fecha' => $ahora->toDateString(),
                    'user_id' => $request->user()?->id,
                    'created_at' => $ahora,
                ]);
            } else {
                DB::table('matriculas')->where('id', $m->id)->delete();
            }

            DB::table('padres')->where('solicitud_inscripcion_id', $solicitud->id)->where('estudiante_id', $m->estudiante_id)->update(['estudiante_id' => null]);

            $solicitud->forceFill([
                'estado' => SolicitudInscripcion::PENDIENTE,
                'matricula_id' => null,
                'revisada_por' => null,
                'revisada_en' => null,
                // Los documentos que se marcaron en la ficha del estudiante vuelven a la inscripción.
                ...($m->documentos !== null ? [
                    'documentos' => json_decode($m->documentos, true),
                    'documentos_por' => $m->documentos_por,
                    'documentos_en' => $m->documentos_en,
                ] : []),
            ])->save();
        });

        return to_route('inscritos.index', ['ver' => $solicitud->id])
            ->with('success', 'Volvió a inscritos: la matrícula se deshizo y la inscripción quedó pendiente.');
    }

    /** El año lectivo que estaba activo cuando la familia envió el formulario. */
    private function anioDeMatricula(SolicitudInscripcion $solicitud): ?int
    {
        return $solicitud->anio_lectivo_id ?? SolicitudInscripcion::anioLectivoActivoId();
    }

    /**
     * Crea el estudiante o acudiente; si ya existe con ese documento (volvió al
     * institución, o es acudiente de un hermano), solo completa lo que le falta, sin
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

    private function nombre(?string ...$partes): string
    {
        return implode(' ', array_filter($partes));
    }

    public function guardarPadres(Request $request, SolicitudInscripcion $solicitud): RedirectResponse
    {
        Alcance::exigirSolicitud($request->user(), $solicitud->id);
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
                "{$p}.direccion" => [$conDatos, 'required', 'string', 'max:150'],
                "{$p}.barrio" => [$conDatos, 'nullable', 'string', 'max:80'],
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

        // Si sigue pendiente, lo que sigue es recibir los documentos.
        return $solicitud->estado === SolicitudInscripcion::PENDIENTE
            ? to_route('inscritos.documentos', $solicitud)
            : back();
    }

    public function excelInscritos(Request $request): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $inscritos = DB::table('solicitudes_inscripcion as s')
            ->join('grados as g', 'g.id', '=', 's.grado_id')
            ->join('parentescos as p', 'p.id', '=', 's.acudiente_parentesco_id')
            ->leftJoin('sedes as sp', 'sp.id', '=', 's.sede_preferida_id')
            ->tap(fn ($q) => Alcance::filtrarSolicitudes($q, $request->user()))
            ->orderBy('g.numero')
            ->orderBy('s.primer_apellido')
            ->orderBy('s.primer_nombre')
            ->get([
                's.id', 's.estado', 's.created_at',
                's.primer_nombre', 's.segundo_nombre', 's.primer_apellido', 's.segundo_apellido',
                's.tipo_documento', 's.numero_documento', 's.fecha_nacimiento',
                's.grado_id', 'g.numero as grado_numero', 'g.nombre as grado',
                's.acudiente_primer_nombre', 's.acudiente_segundo_nombre', 's.acudiente_primer_apellido', 's.acudiente_segundo_apellido',
                's.acudiente_numero_documento', 's.acudiente_telefono_1', 's.acudiente_correo',
                'p.nombre as parentesco',
                'sp.codigo as sede_preferida_codigo', 'sp.nombre as sede_preferida',
            ]);

        $libro = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $hoja = $libro->getActiveSheet();
        $hoja->setTitle('Inscritos');

        $encabezados = [
            'Grado', 'Nombre Estudiante', 'Documento', 'Fecha Nacimiento', 'Estado',
            'Acudiente', 'Parentesco', 'Documento Acudiente', 'Teléfono', 'Correo', 'Sede Preferida',
        ];

        foreach ($encabezados as $col => $titulo) {
            $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col + 1);
            $hoja->setCellValue("{$letra}1", $titulo);
        }
        $hoja->getStyle("A1:{$hoja->getHighestColumn()}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A7B']],
        ]);

        $fila = 2;
        foreach ($inscritos as $inscrito) {
            $nombre = trim("{$inscrito->primer_nombre} {$inscrito->segundo_nombre}");
            $apellido = trim("{$inscrito->primer_apellido} {$inscrito->segundo_apellido}");
            $acudienteNombre = trim("{$inscrito->acudiente_primer_nombre} {$inscrito->acudiente_segundo_nombre}");
            $acudienteApellido = trim("{$inscrito->acudiente_primer_apellido} {$inscrito->acudiente_segundo_apellido}");

            $datos = [
                $inscrito->grado,
                "{$apellido}, {$nombre}",
                $inscrito->numero_documento ?? '',
                $inscrito->fecha_nacimiento ?? '',
                ucfirst($inscrito->estado),
                "{$acudienteApellido}, {$acudienteNombre}",
                $inscrito->parentesco ?? '',
                $inscrito->acudiente_numero_documento ?? '',
                $inscrito->acudiente_telefono_1 ?? '',
                $inscrito->acudiente_correo ?? '',
                $inscrito->sede_preferida ?? '',
            ];

            foreach ($datos as $col => $valor) {
                $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col + 1);
                $hoja->setCellValueExplicit("{$letra}{$fila}", (string) $valor, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            }
            $fila++;
        }

        foreach (range(1, count($encabezados)) as $col) {
            $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
            $hoja->getColumnDimension($letra)->setAutoSize(true);
        }

        $archivo = 'INSCRITOS-' . now()->format('Y-m-d_His') . '.xlsx';
        $ruta = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $archivo;

        $escritor = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($libro);
        $escritor->save($ruta);
        $libro->disconnectWorksheets();

        return response()->download($ruta, $archivo, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }
}
