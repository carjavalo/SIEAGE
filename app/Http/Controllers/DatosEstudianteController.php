<?php

namespace App\Http\Controllers;

use App\Support\Alcance;
use App\Support\Barrios;
use App\Support\CambiosFicha;
use App\Support\Documentos;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Corregir desde la ficha los datos del estudiante y de sus acudientes, y
 * agregarle o quitarle un acudiente. Cada cambio queda en cambios_ficha con
 * el valor anterior, quién lo hizo y cuándo.
 *
 * Lo que vino del Excel y no se toca no se valida: un teléfono o un documento
 * con un formato raro no impide corregir otro campo.
 */
class DatosEstudianteController extends Controller
{
    private const LETRAS = 'regex:/^(?=.*\pL)[\pL\pM\s\'.-]+$/u';

    private const DOCUMENTO = 'regex:/^[0-9A-Za-z]{5,20}$/';

    private const MENSAJES = [
        'required' => 'Este campo es obligatorio.',
        'regex' => 'Usa solo letras.',
        'numero_documento.regex' => 'Entre 5 y 20 letras o números, sin puntos ni espacios.',
        'numero_documento.unique' => 'Ya hay otra persona registrada con ese documento.',
        'min' => 'Es demasiado corto.',
        'max' => 'Máximo :max caracteres.',
        'in' => 'Elige una de las opciones.',
        'exists' => 'Elige una de las opciones.',
        'integer' => 'Elige una de las opciones.',
        'digits_between' => 'Debe tener entre :min y :max dígitos.',
        'date_format' => 'Escribe una fecha válida.',
        'before' => 'La fecha debe ser anterior a hoy.',
        'after' => 'Revisa el año de la fecha.',
        'email' => 'Escribe un correo válido.',
        'boolean' => 'Revisa este campo.',
        'string' => 'Revisa este campo.',
    ];

    public function estudiante(Request $request, int $estudiante): RedirectResponse
    {
        $alumno = $this->alumno($estudiante);
        $conPartes = $this->conPartes($alumno);
        $d = $this->entrada($request, $alumno, documento: 'numero_documento', telefonos: ['telefono_1', 'telefono_2']);

        $datos = validator($d, [
            ...$this->reglasNombre($conPartes),
            'tipo_documento' => ['required', Rule::in(['R.C.', 'T.I.', 'C.C.', 'C.E.', 'P.P.T.', 'N.U.I.P.', 'N.E.S.', 'Otro'])],
            'tipo_documento_otro' => ['exclude_unless:tipo_documento,Otro', 'required', 'string', 'max:40'],
            'numero_documento' => $this->siCambia($d, $alumno, 'numero_documento', ['required'], [
                'string', self::DOCUMENTO, Rule::unique('estudiantes', 'numero_documento')->ignore($alumno->id),
            ]),
            'fecha_nacimiento' => ['nullable', 'date_format:Y-m-d', 'before:today', 'after:1900-01-01'],
            'genero' => ['nullable', Rule::in(['F', 'M', 'O'])],
            'ciudad_expedicion' => ['nullable', 'string', 'max:80'],
            'pais_nacimiento' => ['nullable', 'string', 'max:60'],
            'ciudad_nacimiento' => ['nullable', 'string', 'max:80'],
            'tipo_sangre' => ['nullable', Rule::in(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])],
            // 'string' a propósito: con el número 2, MariaDB lo tomaría como posición del ENUM.
            'sisben' => ['nullable', 'string', Rule::in(['ninguno', '1', '2', '3', 'A', 'B', 'C', 'D'])],
            'eps' => ['nullable', 'string', 'max:80'],
            'grupo_etnico' => ['nullable', 'string', 'max:60'],
            'discapacidad' => ['nullable', 'string', 'max:300'],
            'direccion' => ['nullable', 'string', 'max:150'],
            'barrio' => ['nullable', 'string', 'max:80'],
            'telefono_1' => $this->siCambia($d, $alumno, 'telefono_1', ['nullable'], ['digits_between:7,10']),
            'telefono_2' => $this->siCambia($d, $alumno, 'telefono_2', ['nullable'], ['digits_between:7,10']),
            'correo' => ['nullable', 'email', 'max:120'],
            'tiene_foto' => ['boolean'],
        ], self::MENSAJES)->validate();

        $nuevo = [
            // Como en el Excel: apellidos y luego nombres.
            ...$this->nombre($datos, $conPartes, ['primer_apellido', 'segundo_apellido', 'primer_nombre', 'segundo_nombre']),
            'tipo_documento' => $datos['tipo_documento'],
            'tipo_documento_otro' => $datos['tipo_documento'] === 'Otro' ? $datos['tipo_documento_otro'] : null,
            'numero_documento' => $datos['numero_documento'],
            'tiene_foto' => (int) ($datos['tiene_foto'] ?? $alumno->tiene_foto),
        ];
        foreach (['fecha_nacimiento', 'genero', 'ciudad_expedicion', 'pais_nacimiento', 'ciudad_nacimiento', 'tipo_sangre', 'sisben', 'eps',
            'grupo_etnico', 'discapacidad', 'direccion', 'telefono_1', 'telefono_2', 'correo'] as $campo) {
            $nuevo[$campo] = $datos[$campo] ?? null;
        }

        $guardado = DB::transaction(function () use ($request, $alumno, $nuevo, $datos) {
            $cambios = CambiosFicha::diferencias($alumno, $nuevo) + $this->cambioDeBarrio($alumno->barrio_id, $datos['barrio'] ?? null, $nuevo);
            if (! $cambios) {
                return false;
            }
            DB::table('estudiantes')->where('id', $alumno->id)->update([...array_intersect_key($nuevo, $cambios + ['barrio_id' => 1]), 'updated_at' => now()]);
            CambiosFicha::anotar($alumno->id, null, 'estudiante_editado', $cambios, $request->user()?->id);

            return true;
        });

        return back()->with('success', $guardado ? 'Los datos del estudiante quedaron actualizados.' : 'No había nada que cambiar.');
    }

    public function acudiente(Request $request, int $estudiante, int $acudiente): RedirectResponse
    {
        $alumno = $this->alumno($estudiante);
        $vinculo = $this->vinculo($alumno->id, $acudiente);
        $persona = DB::table('acudientes')->find($acudiente);
        $conPartes = $this->conPartes($persona);
        $d = $this->entrada($request, $persona, documento: 'numero_documento', telefonos: ['telefono_celular', 'telefono_fijo']);

        $datos = validator($d, [
            ...$this->reglasNombre($conPartes),
            ...$this->reglasAcudiente($d, $persona),
            ...$this->reglasVinculo($d),
        ], self::MENSAJES)->validate();

        $nuevo = [
            ...$this->nombre($datos, $conPartes, ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido']),
            'tipo_documento' => $datos['tipo_documento'],
            'numero_documento' => $datos['numero_documento'],
            'telefono_celular' => $datos['telefono_celular'] ?? null,
            'telefono_fijo' => $datos['telefono_fijo'] ?? null,
            'email' => $datos['email'] ?? null,
            'direccion' => $datos['direccion'] ?? null,
        ];
        // Principal solo se gana aquí; para quitárselo se marca a otro acudiente.
        $lazo = [
            'parentesco_id' => (int) $datos['parentesco_id'],
            'parentesco_otro' => $datos['parentesco_otro'] ?? null,
            'es_principal' => (int) ($vinculo->es_principal || ($datos['es_principal'] ?? false)),
        ];

        $guardado = DB::transaction(function () use ($request, $alumno, $persona, $vinculo, $nuevo, $lazo, $datos) {
            $cambios = CambiosFicha::diferencias($persona, $nuevo) + $this->cambioDeBarrio($persona->barrio_id, $datos['barrio'] ?? null, $nuevo);
            $delLazo = CambiosFicha::diferencias($vinculo, $lazo);
            if (! $cambios && ! $delLazo) {
                return false;
            }
            if ($cambios) {
                DB::table('acudientes')->where('id', $persona->id)->update([...array_intersect_key($nuevo, $cambios + ['barrio_id' => 1]), 'updated_at' => now()]);
            }
            if ($delLazo) {
                if (isset($delLazo['es_principal'])) {
                    DB::table('estudiante_acudiente')->where('estudiante_id', $alumno->id)->update(['es_principal' => false]);
                }
                DB::table('estudiante_acudiente')->where(['estudiante_id' => $alumno->id, 'acudiente_id' => $persona->id])->update($lazo);
            }
            // En el historial, el parentesco va con su nombre, no con el id.
            if (isset($delLazo['parentesco_id'])) {
                $nombres = DB::table('parentescos')->whereIn('id', $delLazo['parentesco_id'])->pluck('nombre', 'id');
                $delLazo['parentesco'] = array_map(fn ($id) => $nombres[$id] ?? null, $delLazo['parentesco_id']);
                unset($delLazo['parentesco_id']);
            }
            CambiosFicha::anotar($alumno->id, $persona->id, 'acudiente_editado', $cambios + $delLazo, $request->user()?->id);

            return true;
        });

        return back()->with('success', $guardado ? 'Los datos del acudiente quedaron actualizados.' : 'No había nada que cambiar.');
    }

    /** Agrega un acudiente: uno que ya existe (por su documento o su id) o uno nuevo. */
    public function agregarAcudiente(Request $request, int $estudiante): RedirectResponse
    {
        $alumno = $this->alumno($estudiante);
        $d = $this->entrada($request, null, documento: 'numero_documento', telefonos: ['telefono_celular', 'telefono_fijo']);

        $existente = isset($d['acudiente_id'])
            ? DB::table('acudientes')->find((int) $d['acudiente_id'])
            : DB::table('acudientes')->where('numero_documento', $d['numero_documento'] ?? '')->first();
        if (isset($d['acudiente_id']) && ! $existente) {
            abort(404);
        }

        $datos = validator($d, [
            // De quien ya está registrado solo se elige el parentesco; sus datos se corrigen después, con el lápiz.
            ...($existente ? [] : [...$this->reglasNombre(true), ...$this->reglasAcudiente($d, null)]),
            ...$this->reglasVinculo($d),
        ], self::MENSAJES)->validate();

        if ($existente && DB::table('estudiante_acudiente')->where(['estudiante_id' => $alumno->id, 'acudiente_id' => $existente->id])->exists()) {
            throw ValidationException::withMessages(['numero_documento' => 'Ya es acudiente de este estudiante.']);
        }

        DB::transaction(function () use ($request, $alumno, $existente, $datos) {
            $acudienteId = $existente->id ?? DB::table('acudientes')->insertGetId([
                ...$this->nombre($datos, true, ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido']),
                'tipo_documento' => $datos['tipo_documento'],
                'numero_documento' => $datos['numero_documento'],
                'telefono_celular' => $datos['telefono_celular'] ?? null,
                'telefono_fijo' => $datos['telefono_fijo'] ?? null,
                'email' => $datos['email'] ?? null,
                'direccion' => $datos['direccion'] ?? null,
                'barrio_id' => Barrios::id($datos['barrio'] ?? null),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // El primero que se le registra es el principal, aunque no se marque.
            $principal = ($datos['es_principal'] ?? false) || ! DB::table('estudiante_acudiente')->where('estudiante_id', $alumno->id)->exists();
            if ($principal) {
                DB::table('estudiante_acudiente')->where('estudiante_id', $alumno->id)->update(['es_principal' => false]);
            }
            DB::table('estudiante_acudiente')->insert([
                'estudiante_id' => $alumno->id,
                'acudiente_id' => $acudienteId,
                'parentesco_id' => (int) $datos['parentesco_id'],
                'parentesco_otro' => $datos['parentesco_otro'] ?? null,
                'es_principal' => $principal,
                'vive_con' => true,
            ]);

            $persona = DB::table('acudientes')->find($acudienteId);
            CambiosFicha::anotar($alumno->id, $acudienteId, 'acudiente_agregado', [
                'nombre' => $persona->nombre_completo,
                'documento' => "{$persona->tipo_documento} {$persona->numero_documento}",
                'ya_registrado' => (bool) $existente,
                'es_principal' => $principal,
            ], $request->user()?->id);
        });

        return back()->with('success', $existente
            ? "{$existente->nombre_completo} ya estaba registrado: quedó como acudiente con los datos que tenía."
            : 'Acudiente agregado.');
    }

    public function quitarAcudiente(Request $request, int $estudiante, int $acudiente): RedirectResponse
    {
        $alumno = $this->alumno($estudiante);
        $vinculo = $this->vinculo($alumno->id, $acudiente);
        $persona = DB::table('acudientes')->find($acudiente);

        if (DB::table('estudiante_acudiente')->where('estudiante_id', $alumno->id)->count() < 2) {
            throw ValidationException::withMessages(['quitar' => 'Es el único acudiente: agrega otro antes de quitarlo.']);
        }

        DB::transaction(function () use ($request, $alumno, $vinculo, $persona) {
            DB::table('estudiante_acudiente')->where(['estudiante_id' => $alumno->id, 'acudiente_id' => $persona->id])->delete();

            // Si era el principal, pasa a serlo el que queda (el más antiguo, si quedan varios).
            if ($vinculo->es_principal) {
                $otro = DB::table('estudiante_acudiente')->where('estudiante_id', $alumno->id)->orderBy('acudiente_id')->value('acudiente_id');
                DB::table('estudiante_acudiente')->where(['estudiante_id' => $alumno->id, 'acudiente_id' => $otro])->update(['es_principal' => true]);
            }

            // Queda en el historial de la ficha, sin apuntar al acudiente: si nadie más lo tiene, se borra.
            CambiosFicha::anotar($alumno->id, null, 'acudiente_quitado', [
                'nombre' => $persona->nombre_completo,
                'documento' => "{$persona->tipo_documento} {$persona->numero_documento}",
                'era_principal' => (bool) $vinculo->es_principal,
            ], $request->user()?->id);
            if (! DB::table('estudiante_acudiente')->where('acudiente_id', $persona->id)->exists()) {
                DB::table('acudientes')->where('id', $persona->id)->delete();
            }
        });

        return back()->with('success', "{$persona->nombre_completo} ya no es acudiente de este estudiante.");
    }

    /** Al agregar un acudiente: ¿ese documento ya está registrado? (es frecuente entre hermanos). */
    public function buscarAcudiente(Request $request): JsonResponse
    {
        Alcance::exigirEstudiante($request->user(), (int) $request->input('estudiante'));
        $documento = preg_replace('/[\s.]/', '', (string) $request->input('documento'));
        $a = mb_strlen($documento) >= 5 ? DB::table('acudientes')->where('numero_documento', $documento)->first() : null;
        if (! $a) {
            return response()->json(['acudiente' => null]);
        }

        return response()->json(['acudiente' => [
            'id' => $a->id,
            'nombre' => $a->nombre_completo,
            'tipo_documento' => $a->tipo_documento,
            'numero_documento' => $a->numero_documento,
            'telefono' => $a->telefono_celular ?? $a->telefono_fijo,
            'estudiantes' => CambiosFicha::otrosEstudiantes(collect([$a->id]), null, Alcance::sedes($request->user()))->get($a->id, collect())->values(),
            'ya_vinculado' => DB::table('estudiante_acudiente')
                ->where(['acudiente_id' => $a->id, 'estudiante_id' => (int) $request->input('estudiante')])->exists(),
        ]]);
    }

    // ------------------------------------------------------------------ piezas

    private function alumno(int $id): object
    {
        Alcance::exigirEstudiante(request()->user(), $id);

        return DB::table('estudiantes')->whereNull('deleted_at')->where('id', $id)->first() ?? abort(404);
    }

    private function vinculo(int $estudianteId, int $acudienteId): object
    {
        return DB::table('estudiante_acudiente')->where(['estudiante_id' => $estudianteId, 'acudiente_id' => $acudienteId])->first() ?? abort(404);
    }

    /** Quien llegó del Excel tiene el nombre en una sola pieza; quien llegó por el formulario, en cuatro. */
    private function conPartes(object $persona): bool
    {
        return $persona->primer_nombre !== null || $persona->primer_apellido !== null;
    }

    /**
     * Lo que llega del formulario: sin espacios sobrantes y lo vacío como null.
     * Al documento y a los teléfonos se les quitan puntos y espacios, salvo que
     * sigan exactamente como estaban guardados.
     *
     * @param  list<string>  $telefonos
     * @return array<string, mixed>
     */
    private function entrada(Request $request, ?object $actual, string $documento, array $telefonos): array
    {
        $d = [];
        foreach ($request->all() as $campo => $valor) {
            $d[$campo] = is_string($valor) ? (preg_replace('/\s+/u', ' ', trim($valor)) ?: null) : $valor;
        }
        foreach ([$documento, ...$telefonos] as $campo) {
            if (is_string($d[$campo] ?? null) && $d[$campo] !== ($actual->{$campo} ?? null)) {
                $d[$campo] = preg_replace($campo === $documento ? '/[\s.]/' : '/[\s.()-]/', '', $d[$campo]) ?: null;
            }
        }

        return $d;
    }

    /**
     * Las reglas de formato solo si el valor cambió: lo importado del Excel que
     * nadie tocó se deja pasar como está.
     *
     * @param  array<string, mixed>  $d
     * @param  list<mixed>  $siempre
     * @param  list<mixed>  $alCambiar
     * @return list<mixed>
     */
    private function siCambia(array $d, ?object $actual, string $campo, array $siempre, array $alCambiar): array
    {
        $igual = $actual !== null && ($d[$campo] ?? null) === ($actual->{$campo} ?? null);

        return $igual ? $siempre : [...$siempre, ...$alCambiar];
    }

    /** @return array<string, list<mixed>> */
    private function reglasNombre(bool $conPartes): array
    {
        $parte = ['string', 'max:40', self::LETRAS];

        return $conPartes ? [
            'primer_nombre' => ['required', ...$parte],
            'segundo_nombre' => ['nullable', ...$parte],
            'primer_apellido' => ['required', ...$parte],
            'segundo_apellido' => ['nullable', ...$parte],
        ] : [
            'nombre_completo' => ['required', 'string', 'min:3', 'max:150', self::LETRAS],
        ];
    }

    /**
     * @param  array<string, mixed>  $d
     * @return array<string, list<mixed>>
     */
    private function reglasAcudiente(array $d, ?object $persona): array
    {
        return [
            'tipo_documento' => ['required', Rule::in(['C.C.', 'C.E.', 'P.P.T.', 'PAS', 'N.I.T.'])],
            'numero_documento' => $this->siCambia($d, $persona, 'numero_documento', ['required'], [
                'string', self::DOCUMENTO, Rule::unique('acudientes', 'numero_documento')->ignore($persona?->id),
            ]),
            'telefono_celular' => $this->siCambia($d, $persona, 'telefono_celular', ['nullable'], ['digits_between:7,10']),
            'telefono_fijo' => $this->siCambia($d, $persona, 'telefono_fijo', ['nullable'], ['digits_between:7,10']),
            'email' => ['nullable', 'email', 'max:120'],
            'direccion' => ['nullable', 'string', 'max:150'],
            'barrio' => ['nullable', 'string', 'max:80'],
        ];
    }

    /**
     * El parentesco con este estudiante y si es su acudiente principal.
     *
     * @param  array<string, mixed>  $d
     * @return array<string, list<mixed>>
     */
    private function reglasVinculo(array $d): array
    {
        $otro = DB::table('parentescos')->where('nombre', 'Otro')->value('id');
        $esOtro = $otro !== null && (int) ($d['parentesco_id'] ?? 0) === (int) $otro;

        return [
            'parentesco_id' => ['required', 'integer', 'exists:parentescos,id'],
            'parentesco_otro' => $esOtro ? ['required', 'string', 'max:40'] : ['exclude'],
            'es_principal' => ['boolean'],
        ];
    }

    /**
     * Las columnas del nombre. En cuatro partes, el nombre completo se arma en
     * el orden dado; en una sola, se guarda tal cual.
     *
     * @param  array<string, mixed>  $datos
     * @param  list<string>  $orden
     * @return array<string, ?string>
     */
    private function nombre(array $datos, bool $conPartes, array $orden): array
    {
        if (! $conPartes) {
            return ['nombre_completo' => $datos['nombre_completo']];
        }
        $partes = array_map(fn ($campo) => $datos[$campo] ?? null, array_combine($orden, $orden));

        return ['nombre_completo' => implode(' ', array_filter($partes)), ...$partes];
    }

    /**
     * El barrio se escribe como texto y se guarda por id: si cambia, deja el id
     * nuevo en $nuevo y devuelve el cambio con los nombres, para el historial.
     *
     * @param  array<string, mixed>  $nuevo
     * @return array<string, array{0: ?string, 1: ?string}>
     */
    private function cambioDeBarrio(?int $actualId, ?string $escrito, array &$nuevo): array
    {
        $antes = $actualId ? DB::table('barrios')->where('id', $actualId)->value('nombre') : null;
        if (mb_strtolower((string) $antes) === mb_strtolower((string) $escrito)) {
            return [];
        }
        $nuevo['barrio_id'] = Barrios::id($escrito);

        return (int) $nuevo['barrio_id'] === (int) $actualId ? [] : ['barrio' => [$antes, $escrito]];
    }

    /**
     * Marca desde la ficha los documentos de matrícula que trajo el acudiente. Van
     * en la matrícula actual; si vino de una inscripción, también en ella, para que
     * Inscritos diga lo mismo.
     */
    public function documentos(Request $request, int $estudiante): RedirectResponse
    {
        Alcance::exigirEstudiante($request->user(), $estudiante);
        $alumno = DB::table('estudiantes')->whereNull('deleted_at')->where('id', $estudiante)->first() ?? abort(404);
        $actual = DB::table('matriculas as m')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->where('m.estudiante_id', $estudiante)->where('al.estado', '<>', 'planeado')
            ->orderByDesc('al.anio')
            ->first(['m.id', 'gr.numero']) ?? abort(404);

        $marcados = Documentos::validar($request, Documentos::lista((int) $actual->numero, $alumno->tipo_documento, $alumno->eps));
        $registro = ['documentos_por' => $request->user()?->id, 'documentos_en' => now()];
        DB::table('matriculas')->where('id', $actual->id)->update(['documentos' => json_encode($marcados), ...$registro]);
        DB::table('solicitudes_inscripcion')->where('matricula_id', $actual->id)->update(['documentos' => json_encode($marcados), ...$registro]);

        return back();
    }

    public function cambiarGrupo(Request $request, int $estudiante): RedirectResponse
    {
        $this->alumno($estudiante);
        $datos = $request->validate([
            'grupo_id' => ['required', 'integer', 'exists:grupos,id'],
            'razon' => ['required', 'string', 'min:10', 'max:300'],
        ], self::MENSAJES_CAMBIO);

        [$movidos, $grupo] = $this->moverA($request, [$estudiante], (int) $datos['grupo_id'], $datos['razon']);
        $m = $movidos[0];

        return back()->with('success', 'Cambió a '.($m['cambia_grado'] ? "{$grupo->grado} – {$grupo->codigo}" : $grupo->codigo).'.');
    }

    /**
     * Cambiar de grupo (o de ciclo, grado o sede) a varios a la vez: los marcados en la lista
     * de Estudiantes, todos al mismo grupo y con la misma razón. Todos o ninguno.
     */
    public function cambiarGrupoVarios(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'estudiantes' => ['required', 'array', 'min:1', 'max:500'],
            'estudiantes.*' => ['integer', 'distinct'],
            'grupo_id' => ['required', 'integer', 'exists:grupos,id'],
            'razon' => ['required', 'string', 'min:10', 'max:300'],
        ], [...self::MENSAJES_CAMBIO, 'estudiantes.required' => 'Marca al menos un estudiante.', 'estudiantes.max' => 'Son demasiados a la vez: máximo :max.']);

        $ids = array_values(array_unique(array_map('intval', $datos['estudiantes'])));
        [$movidos, $grupo] = $this->moverA($request, $ids, (int) $datos['grupo_id'], $datos['razon']);
        $n = count($movidos);

        return back()->with('success', ($n === 1 ? '1 estudiante cambió' : "{$n} estudiantes cambiaron")." a {$grupo->codigo} ({$grupo->sede}).");
    }

    private const MENSAJES_CAMBIO = [
        'grupo_id.required' => 'Elige el nuevo grupo.',
        'grupo_id.exists' => 'Grupo no válido.',
        'razon.required' => 'Escribe la razón del cambio.',
        'razon.min' => 'Mínimo 10 caracteres.',
    ];

    /**
     * Pasa a los estudiantes al grupo (de su año en curso): su matrícula activa toma el grupo,
     * el grado, la sede y la jornada del grupo, y queda la novedad en su historial. Antes de
     * cambiar a nadie revisa que todos estén activos y a su alcance, que ninguno esté ya en
     * ese grupo y que alcancen los cupos.
     *
     * @param  list<int>  $estudiantes
     * @return array{0: list<array{matricula: int, cambia_grado: bool}>, 1: object}
     */
    private function moverA(Request $request, array $estudiantes, int $grupoId, string $razon): array
    {
        $user = $request->user();
        $matriculas = DB::table('matriculas as m')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('sedes as s', 's.id', '=', 'm.sede_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->whereIn('m.estudiante_id', $estudiantes)
            ->where('al.estado', 'activo')
            ->where('m.estado', 'activo')
            ->whereNull('e.deleted_at')
            ->tap(fn ($q) => Alcance::filtrar($q, $user, 'm.sede_id', 'm.grado_id', 'm.grupo_id'))
            ->get(['m.id', 'm.estudiante_id', 'm.grupo_id', 'm.sede_id', 'm.grado_id', 'm.estado', 'm.anio_lectivo_id', 'e.nombre_completo',
                'g.codigo as grupo_actual', 's.codigo as sede_actual', 'gr.nombre as grado_actual']);
        if ($matriculas->pluck('estudiante_id')->unique()->count() !== count($estudiantes)) {
            throw ValidationException::withMessages(['estudiantes' => count($estudiantes) === 1
                ? 'No está activo en el año en curso o no lo tienes asignado.'
                : 'Algunos de los marcados no están activos en el año en curso o no los tienes asignados: no se cambió a nadie.']);
        }

        $nuevo = DB::table('grupos as g')
            ->join('sedes as s', 's.id', '=', 'g.sede_id')
            ->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->where('g.id', $grupoId)
            ->tap(fn ($q) => Alcance::filtrar($q, $user, 'g.sede_id', 'g.grado_id', 'g.id'))
            ->first(['g.id', 'g.codigo', 'g.sede_id', 'g.jornada', 'g.anio_lectivo_id', 'g.cupos_proyectados', 's.codigo as sede', 'g.grado_id', 'gr.nombre as grado']) ?? abort(403);
        // Solo a un grupo del mismo año de la matrícula (el año en curso).
        if ($matriculas->contains(fn ($m) => (int) $m->anio_lectivo_id !== (int) $nuevo->anio_lectivo_id)) {
            throw ValidationException::withMessages(['grupo_id' => 'Ese grupo es de otro año lectivo.']);
        }

        $yaEstan = $matriculas->where('grupo_id', $nuevo->id);
        if ($yaEstan->isNotEmpty()) {
            throw ValidationException::withMessages(['grupo_id' => $yaEstan->count() === 1 && $matriculas->count() === 1
                ? 'Ya está en ese grupo.'
                : 'Ya están en ese grupo: '.$yaEstan->pluck('nombre_completo')->take(5)->implode(', ').($yaEstan->count() > 5 ? '…' : '').'. Quítalos de la selección.']);
        }

        // El cupo no se guarda: es lo proyectado menos los que ya están activos en el grupo.
        $activos = (int) DB::table('matriculas')->where('grupo_id', $nuevo->id)->where('estado', 'activo')->count();
        $libres = (int) $nuevo->cupos_proyectados - $activos;
        if ($libres < $matriculas->count()) {
            throw ValidationException::withMessages(['grupo_id' => $libres <= 0
                ? 'No hay cupos disponibles en ese grupo.'
                : "En ese grupo solo quedan {$libres} cupos y son {$matriculas->count()} estudiantes."]);
        }

        $movidos = DB::transaction(function () use ($user, $matriculas, $nuevo, $razon) {
            $movidos = [];
            foreach ($matriculas as $m) {
                $cambiaGrado = (int) $nuevo->grado_id !== (int) $m->grado_id;
                $cambiaSede = (int) $nuevo->sede_id !== (int) $m->sede_id;
                // La jornada va con el grupo: al pasar de un ciclo (sabatina) a un grupo de la
                // mañana, o al revés, deja de contar (o empieza a contar) en la pestaña Sabatina.
                $cambios = ['grupo_id' => $nuevo->id, 'jornada' => $nuevo->jornada, 'updated_at' => now()];
                if ($cambiaGrado) {
                    $cambios['grado_id'] = $nuevo->grado_id;
                }
                if ($cambiaSede) {
                    $cambios['sede_id'] = $nuevo->sede_id;
                }
                // Al cambiar de grado o sede, el consecutivo de la ficha (único por año/grado/sede)
                // ya no corresponde: se limpia y se renumera al imprimir la constancia.
                if ($cambiaGrado || $cambiaSede) {
                    $cambios['consecutivo'] = null;
                }
                DB::table('matriculas')->where('id', $m->id)->update($cambios);

                $desde = $m->grupo_actual ?? $m->grado_actual;
                $detalleGrado = $cambiaGrado ? " [de {$m->grado_actual} a {$nuevo->grado}]" : '';
                DB::table('novedades_matricula')->insert([
                    'matricula_id' => $m->id,
                    'tipo' => 'cambio_grupo',
                    'estado_anterior' => $m->estado,
                    'estado_nuevo' => $m->estado,
                    'razon' => "Cambió de {$desde} ({$m->sede_actual}) a {$nuevo->codigo} ({$nuevo->sede}){$detalleGrado}: {$razon}",
                    'fecha' => now()->toDateString(),
                    'user_id' => $user->id,
                    'created_at' => now(),
                ]);
                $movidos[] = ['matricula' => (int) $m->id, 'cambia_grado' => $cambiaGrado];
            }

            return $movidos;
        });

        return [$movidos, $nuevo];
    }

    /**
     * Corregir a mano la modalidad (media técnica) de una matrícula desde la ficha: se
     * elige una de las que ya existen (vacío la quita). Antes se escribía el nombre y,
     * si no era idéntico, se creaba otra modalidad («Asistencia Administrativa» al lado
     * de «Asist. Admin.»), que salía como otra pestaña en Actas de grado e informes.
     * Queda en el historial de la ficha (cambios_ficha).
     */
    public function modalidad(Request $request, int $estudiante): RedirectResponse
    {
        $this->alumno($estudiante);

        $datos = $request->validate([
            'matricula_id' => ['required', 'integer'],
            // `present`: una página vieja que manda el nombre escrito no la borra sin querer.
            'modalidad_id' => ['present', 'nullable', 'integer', Rule::exists('modalidades', 'id')],
        ], ['modalidad_id.exists' => 'Elige una de las modalidades de la lista.', 'modalidad_id.present' => 'Recarga la página y elige la modalidad de la lista.']);

        $matricula = DB::table('matriculas as m')
            ->leftJoin('modalidades as mo', 'mo.id', '=', 'm.modalidad_id')
            ->where('m.id', $datos['matricula_id'])
            ->where('m.estudiante_id', $estudiante)
            ->tap(fn ($q) => Alcance::filtrar($q, $request->user(), 'm.sede_id', 'm.grado_id'))
            ->first(['m.id', 'm.modalidad_id', 'mo.nombre as modalidad']) ?? abort(404);

        $modalidadId = isset($datos['modalidad_id']) ? (int) $datos['modalidad_id'] : null;
        $nombre = $modalidadId ? (string) DB::table('modalidades')->where('id', $modalidadId)->value('nombre') : '';

        if ((int) $matricula->modalidad_id === (int) $modalidadId) {
            return back()->with('success', 'No había nada que cambiar.');
        }

        DB::transaction(function () use ($request, $matricula, $modalidadId, $nombre, $estudiante) {
            DB::table('matriculas')->where('id', $matricula->id)->update(['modalidad_id' => $modalidadId, 'updated_at' => now()]);
            CambiosFicha::anotar($estudiante, null, 'modalidad_editada', ['modalidad' => [$matricula->modalidad, $nombre ?: null]], $request->user()?->id);
        });

        return back()->with('success', $nombre === '' ? 'Se quitó la modalidad.' : "Modalidad actualizada a {$nombre}.");
    }
}
