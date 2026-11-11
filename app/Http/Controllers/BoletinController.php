<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\User;
use App\Support\Alcance;
use App\Support\Boletines;
use App\Support\Firmantes;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Boletines de transición: el docente escribe sobre la hoja, el texto se guarda
 * solo, y se imprimen uno por uno o los de todo el grupo. Solo el texto es de
 * cada estudiante; quién firma y la jornada se fijan una vez por grupo.
 */
class BoletinController extends Controller
{
    /** Lo más largo que se acepta: unas dos hojas. */
    private const MAXIMO = 12000;

    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $anio = Boletines::anio();
        abort_unless($anio, 404);

        $grupos = Boletines::grupos($user, $anio->id);
        // El docente solo ve el periodo que se está calificando (ver Boletines::periodosPara).
        $periodos = Boletines::periodosPara($user, $anio->id);

        // ?ver=ESTUDIANTE (desde su ficha): su grupo de transición de este año.
        $ver = $request->integer('ver') ?: null;
        $grupoId = $request->integer('grupo') ?: null;
        if ($ver && ! $grupoId) {
            $grupoId = DB::table('matriculas')->where('estudiante_id', $ver)->where('anio_lectivo_id', $anio->id)->value('grupo_id');
            abort_unless($grupoId, 404);
        }
        $grupo = $grupoId ? $grupos->firstWhere('id', (int) $grupoId) : $grupos->first();
        abort_if($grupoId && ! $grupo, 404);

        $periodo = $request->filled('periodo') ? $periodos->firstWhere('id', $request->integer('periodo')) : Boletines::periodoActual($periodos);
        if ($request->filled('periodo') && ! $periodo) {
            // Un periodo que ya no se califica (un enlace o una pestaña de antes): al que sí.
            abort_unless(Boletines::periodos($anio->id)->contains('id', $request->integer('periodo')), 404);

            return redirect('/boletines?'.http_build_query(array_filter(['grupo' => $grupo?->id, 'ver' => $ver])));
        }

        $configura = $grupo && $user->can('configurar-boletines');

        return Inertia::render('boletines/index', [
            'anio' => $anio->anio,
            'grupos' => $grupos,
            'periodos' => $periodos->map(fn ($p) => ['id' => $p->id, 'numero' => $p->numero, 'etiqueta' => $p->etiqueta, 'calificando' => $p->calificando]),
            'periodo' => $periodo?->id,
            'grupo' => $grupo ? Boletines::datosGrupo($grupo->id) : null,
            'estudiantes' => $grupo && $periodo ? Boletines::estudiantes($grupo->id, $periodo->id) : [],
            'ver' => $ver,
            'maximo' => self::MAXIMO,
            'puedeConfigurar' => $configura,
            'puedeFijarPeriodo' => Boletines::puedeFijarPeriodo($user),
            // Crear ahí mismo a quien firma (es crear un usuario): solo administradores.
            'puedeCrearFirmantes' => $configura && $user->can('gestionar-usuarios'),
            // Para elegir quién firma: quienes trabajan en la sede del grupo (los docentes primero).
            'usuarios' => $configura ? Firmantes::paraElegir($grupo->sede_id) : [],
        ]);
    }

    /**
     * Guarda el texto de un estudiante (se llama sola mientras se escribe). Cada
     * guardado sube la versión; si llega con una versión que ya no es la última
     * (otra persona, otra pestaña o una página vieja), no la pisa: responde 409
     * con lo que hay guardado. Sin versión («dejar el mío») guarda igual.
     */
    public function guardar(Request $request, int $matricula, int $periodo, bool $reintento = false): JsonResponse
    {
        $m = $this->matricula($request->user(), $matricula);
        abort_unless(Boletines::periodosPara($request->user(), $m->anio_lectivo_id)->contains('id', $periodo), 404);

        $datos = $request->validate([
            'texto' => ['present', 'nullable', 'string', 'max:'.self::MAXIMO],
            'version' => ['nullable', 'string'],
        ], ['max' => 'Es demasiado largo: máximo :max caracteres.']);
        $texto = self::limpiar((string) ($datos['texto'] ?? ''));
        $compara = $request->has('version');
        $user = $request->user();
        $ahora = now();

        try {
            return DB::transaction(function () use ($m, $periodo, $texto, $compara, $datos, $user, $ahora) {
                $actual = DB::table('boletines')->where('matricula_id', $m->id)->where('periodo_id', $periodo)->lockForUpdate()->first();

                if ($compara && ! self::vigente($actual, $datos['version'] ?? null)) {
                    return response()->json(['conflicto' => self::comoEsta($actual)], 409);
                }

                if ($texto === '') {
                    DB::table('boletines')->where('matricula_id', $m->id)->where('periodo_id', $periodo)->delete();

                    return response()->json(['version' => null, 'actualizado_en' => null, 'por' => null]);
                }

                return response()->json(self::escribir($actual, $m->id, $periodo, $texto, $user, $ahora));
            });
        } catch (UniqueConstraintViolationException $e) {
            // Otro guardado lo creó entre la lectura y el insert: otra vuelta, ya con la fila (y su versión).
            throw_if($reintento, $e);

            return $this->guardar($request, $matricula, $periodo, true);
        }
    }

    /**
     * «Copiar a otros»: el mismo texto en varios estudiantes a la vez. Como al
     * guardar, no pisa a quien alguien cambió después de abrir la página: esos
     * vuelven en «omitidos» con lo que tienen guardado.
     */
    public function copiar(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'periodo' => ['required', 'integer'],
            'texto' => ['required', 'string', 'max:'.self::MAXIMO],
            'para' => ['required', 'array', 'min:1', 'max:200'],
            'para.*.matricula' => ['required', 'integer', 'distinct'],
            'para.*.version' => ['present', 'nullable', 'string'],
        ], ['max' => 'Es demasiado largo: máximo :max caracteres.', 'texto.required' => 'No hay nada que copiar.']);
        $texto = self::limpiar($datos['texto']);
        if ($texto === '') {
            throw ValidationException::withMessages(['texto' => 'No hay nada que copiar.']);
        }

        // Primero que pueda escribir en todos; después se escribe.
        $user = $request->user();
        $anios = collect($datos['para'])->map(fn ($p) => $this->matricula($user, (int) $p['matricula'])->anio_lectivo_id)->unique();
        abort_unless($anios->count() === 1 && Boletines::periodosPara($user, (int) $anios->first())->contains('id', (int) $datos['periodo']), 404);

        $periodo = (int) $datos['periodo'];
        $ahora = now();
        $copiados = [];
        $omitidos = [];
        foreach ($datos['para'] as $p) {
            $m = (int) $p['matricula'];
            $fila = fn () => DB::table('boletines')->where('matricula_id', $m)->where('periodo_id', $periodo);
            try {
                DB::transaction(function () use ($fila, $p, $m, $periodo, $texto, $user, $ahora, &$copiados, &$omitidos) {
                    $actual = $fila()->lockForUpdate()->first();
                    if (self::vigente($actual, $p['version'] ?? null)) {
                        $copiados[$m] = self::escribir($actual, $m, $periodo, $texto, $user, $ahora);
                    } else {
                        $omitidos[$m] = self::comoEsta($actual);
                    }
                });
            } catch (UniqueConstraintViolationException) {
                // Alguien lo escribió en ese mismo instante: se deja lo suyo.
                $omitidos[$m] = self::comoEsta($fila()->first());
            }
        }

        return response()->json(['copiados' => (object) $copiados, 'omitidos' => (object) $omitidos]);
    }

    /**
     * Fija el periodo que se está calificando en el año en curso: desde ahí todos
     * abren Boletines en ese periodo y los docentes solo ven ese. Queda uno solo
     * marcado. Quien configura los boletines sigue viendo y escribiendo los demás.
     */
    public function calificar(Request $request, int $periodo): RedirectResponse
    {
        abort_unless(Boletines::puedeFijarPeriodo($request->user()), 403);
        $anio = Boletines::anio();
        abort_unless($anio, 404);
        $p = Boletines::periodos($anio->id)->firstWhere('id', $periodo);
        abort_unless($p, 404);

        DB::transaction(function () use ($anio, $p) {
            DB::table('periodos')->where('anio_lectivo_id', $anio->id)->where('id', '!=', $p->id)->update(['calificando' => false]);
            DB::table('periodos')->where('id', $p->id)->update(['calificando' => true]);
        });

        return back()->with('success', 'Se está calificando el '.mb_strtolower($p->etiqueta).': los docentes solo ven ese periodo.');
    }

    /** Quién firma como director(a) del grupo y cómo se escribe la jornada (el rector(a) es fijo: Boletines::RECTORA). Solo el año en curso. */
    public function configurar(Request $request, int $grupo): RedirectResponse
    {
        $g = $this->grupo($request->user(), $grupo);

        // Solo alguien activo que trabaje en esa sede (o en todas).
        $firmante = Firmantes::regla($g->sede_id);
        $datos = $request->validate([
            // Si no llega, se deja como está (p. ej. un director(a) que ya estaba y no tiene usuario).
            'director_id' => ['sometimes', 'nullable', 'integer', $firmante],
            'jornada_boletin' => ['nullable', 'string', 'max:60'],
        ], ['exists' => 'Elige a alguien de la lista.', 'max' => 'Es demasiado largo: máximo :max caracteres.']);

        DB::transaction(function () use ($g, $datos) {
            $director = array_key_exists('director_id', $datos) ? ['director_id' => $datos['director_id'] ? Firmantes::docenteDe((int) $datos['director_id']) : null] : [];
            DB::table('grupos')->where('id', $g->id)->update([
                ...$director,
                'jornada_boletin' => trim((string) ($datos['jornada_boletin'] ?? '')) ?: null,
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', 'Director(a) y jornada guardados.');
    }

    /**
     * Crea a quien firma desde «Firmas y jornada», con el nombre tal como sale en el
     * boletín: queda activo en la sede del grupo como docente que dirige el grupo,
     * con un usuario sacado del nombre y una clave
     * aleatoria que nadie conoce; si va a entrar, el administrador se la pone en Usuarios.
     */
    public function crearFirmante(Request $request, int $grupo): JsonResponse
    {
        $g = $this->grupo($request->user(), $grupo);
        if (is_string($n = $request->input('nombre'))) {
            $request->merge(['nombre' => preg_replace('/\s+/u', ' ', trim($n))]);
        }
        $datos = $request->validate([
            // Nombres y apellidos: al menos dos palabras, solo letras.
            'nombre' => ['required', 'string', 'max:120', "regex:/^[\pL.'-]+( [\pL.'-]+)+$/u"],
            'para' => ['required', Rule::in(['director'])],
        ], [
            'required' => 'Escribe el nombre completo.',
            'max' => 'Es demasiado largo: máximo :max caracteres.',
            'regex' => 'Escribe nombres y apellidos, solo con letras.',
        ]);

        $igual = User::whereRaw('LOWER(name) = ?', [mb_strtolower($datos['nombre'])])->value('usuario');
        if ($igual) {
            throw ValidationException::withMessages(['nombre' => "Ya existe: es el usuario «{$igual}». Si no sale en la lista, revisa en Usuarios que esté activo y en esta sede."]);
        }

        $rol = Rol::where('nombre', 'docente')->first();
        if (! $rol) {
            throw ValidationException::withMessages(['nombre' => 'Ya no existe el rol con que se crea: créalo en Usuarios con el rol que corresponda.']);
        }
        $nuevo = DB::transaction(function () use ($datos, $rol, $g) {
            $u = User::create([
                'name' => $datos['nombre'],
                'usuario' => self::usuarioPara($datos['nombre']),
                'password' => Str::random(48),
                'rol_id' => $rol->id,
                'activo' => true,
            ]);
            DB::table('sede_user')->insert(['user_id' => $u->id, 'sede_id' => $g->sede_id, 'created_at' => now()]);
            // Si es el director(a) que el grupo ya tenía sin usuario, ese docente queda con este usuario (no se repite).
            DB::table('docentes')
                ->where('id', DB::table('grupos')->where('id', $g->id)->value('director_id'))
                ->whereNull('user_id')
                ->whereRaw('LOWER(nombre_completo) = ?', [mb_strtolower($datos['nombre'])])
                ->update(['user_id' => $u->id, 'updated_at' => now()]);

            return $u;
        });

        return response()->json(['id' => $nuevo->id, 'name' => $nuevo->name, 'usuario' => $nuevo->usuario, 'rol' => $rol->etiqueta ?? $rol->nombre], 201);
    }

    /**
     * Vista previa para imprimir: los boletines del grupo que ya tienen texto, o
     * el de un estudiante (?estudiante=, aunque esté vacío, para llenarlo a mano).
     */
    public function imprimir(Request $request): Response
    {
        $user = $request->user();
        $anio = Boletines::anio();
        abort_unless($anio, 404);

        $grupo = Boletines::grupos($user, $anio->id)->firstWhere('id', $request->integer('grupo'));
        $periodo = Boletines::periodosPara($user, $anio->id)->firstWhere('id', $request->integer('periodo'));
        abort_unless($grupo && $periodo, 404);

        $estudiantes = Boletines::estudiantes($grupo->id, $periodo->id);
        $uno = $request->integer('estudiante') ?: null;
        if ($uno) {
            $estudiantes = $estudiantes->where('estudiante_id', $uno)->values();
            abort_if($estudiantes->isEmpty(), 404);
        }
        $conTexto = $uno ? $estudiantes : $estudiantes->filter(fn ($e) => $e->texto !== '')->values();

        return Inertia::render('boletines/imprimir', [
            'titulo' => $uno ? $estudiantes->first()->nombre : "Grupo {$grupo->codigo} · {$grupo->sede}",
            'volver' => '/boletines?'.http_build_query(array_filter(['grupo' => $grupo->id, 'periodo' => $periodo->id, 'ver' => $uno])),
            'periodo' => $periodo->etiqueta,
            'grupo' => Boletines::datosGrupo($grupo->id),
            'estudiantes' => $conTexto,
            'sinTexto' => $uno ? 0 : $estudiantes->count() - $conTexto->count(),
        ]);
    }

    /** El grupo de transición del año en curso, si el usuario ve su sede. */
    private function grupo(?User $user, int $id): object
    {
        $g = DB::table('grupos as g')
            ->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->join('anios_lectivos as al', 'al.id', '=', 'g.anio_lectivo_id')
            ->where('g.id', $id)->where('gr.numero', Boletines::GRADO)->where('al.estado', 'activo')
            ->first(['g.id', 'g.sede_id', 'g.grado_id']);
        abort_unless($g, 404);
        Alcance::exigir($user, $g->sede_id, $g->grado_id, $g->id);

        return $g;
    }

    /** La matrícula de transición del año en curso, si el usuario ve su sede. */
    private function matricula(?User $user, int $id): object
    {
        $m = DB::table('matriculas as m')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->join('anios_lectivos as al', 'al.id', '=', 'm.anio_lectivo_id')
            ->where('m.id', $id)
            ->where('gr.numero', Boletines::GRADO)
            ->where('al.estado', 'activo')
            ->first(['m.id', 'm.sede_id', 'm.grado_id', 'm.grupo_id', 'm.anio_lectivo_id']);
        abort_unless($m, 404);
        // Sin grupo (0, que no existe): si solo tiene algunos grupos del grado, no la ve.
        Alcance::exigir($user, $m->sede_id, $m->grado_id, $m->grupo_id ?? 0);

        return $m;
    }

    /** Si la versión con la que llega es la última guardada (null: estaba vacío). */
    private static function vigente(?object $actual, ?string $version): bool
    {
        return (string) $version === ($actual ? (string) $actual->revision : '');
    }

    /** Lo que hay guardado, para quien llegó con una versión vieja. */
    private static function comoEsta(?object $actual): array
    {
        return [
            'texto' => $actual?->texto ?? '',
            'version' => $actual ? (string) $actual->revision : null,
            'por' => $actual ? DB::table('users')->where('id', $actual->actualizado_por)->value('name') : null,
            'en' => $actual?->updated_at,
        ];
    }

    /** Escribe el texto (crea la fila o sube su versión) y devuelve la versión nueva. */
    private static function escribir(?object $actual, int $matricula, int $periodo, string $texto, User $user, \DateTimeInterface $ahora): array
    {
        if ($actual) {
            $revision = (int) $actual->revision + 1;
            DB::table('boletines')->where('id', $actual->id)->update(['texto' => $texto, 'revision' => $revision, 'actualizado_por' => $user->id, 'updated_at' => $ahora]);
        } else {
            $revision = 1;
            DB::table('boletines')->insert([
                'matricula_id' => $matricula, 'periodo_id' => $periodo, 'texto' => $texto, 'revision' => $revision,
                'creado_por' => $user->id, 'actualizado_por' => $user->id, 'created_at' => $ahora, 'updated_at' => $ahora,
            ]);
        }

        return ['version' => (string) $revision, 'actualizado_en' => $ahora->format('Y-m-d H:i:s'), 'por' => $user->name];
    }

    /**
     * Un usuario para entrar sacado del nombre: inicial del primer nombre y primer
     * apellido («Ana Lucía Pérez Gómez» → «aperez», «Juan Ríos Mejía» → «jrios»),
     * con un número si ya está tomado.
     */
    public static function usuarioPara(string $nombre): string
    {
        $partes = array_values(array_filter(array_map(fn ($p) => preg_replace('/[^a-z0-9]/', '', $p), explode(' ', Str::lower(Str::ascii($nombre))))));
        // Con cuatro palabras o más, el primer apellido es la penúltima; con dos o tres, la segunda.
        $apellido = count($partes) >= 4 ? $partes[count($partes) - 2] : ($partes[1] ?? '');
        $base = str_pad(substr(substr($partes[0] ?? '', 0, 1).$apellido, 0, 40), 3, 'x');

        $usuario = $base;
        for ($i = 2; User::where('usuario', $usuario)->exists(); $i++) {
            $usuario = $base.$i;
        }

        return $usuario;
    }

    /**
     * Párrafos limpios: sin espacios repetidos ni líneas vacías de más. Un salto
     * de línea separa párrafos (así se ve en la hoja).
     */
    public static function limpiar(string $texto): string
    {
        $texto = str_replace(["\r\n", "\r", "\u{00A0}"], ["\n", "\n", ' '], $texto);
        $parrafos = array_filter(array_map(fn ($p) => trim(preg_replace('/[ \t]+/u', ' ', $p)), explode("\n", $texto)), fn ($p) => $p !== '');

        return implode("\n", $parrafos);
    }
}
