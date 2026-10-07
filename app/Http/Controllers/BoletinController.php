<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use App\Models\User;
use App\Support\Alcance;
use App\Support\Boletines;
use Illuminate\Contracts\Database\Query\Builder;
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

    public function index(Request $request): Response
    {
        $user = $request->user();
        $anio = Boletines::anio();
        abort_unless($anio, 404);

        $grupos = Boletines::grupos($user, $anio->id);
        $periodos = Boletines::periodos($anio->id);

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
        abort_if($request->filled('periodo') && ! $periodo, 404);

        $configura = $grupo && $user->can('gestionar-sedes');

        return Inertia::render('boletines/index', [
            'anio' => $anio->anio,
            'grupos' => $grupos,
            'periodos' => $periodos->map(fn ($p) => ['id' => $p->id, 'numero' => $p->numero, 'etiqueta' => $p->etiqueta]),
            'periodo' => $periodo?->id,
            'grupo' => $grupo ? Boletines::datosGrupo($grupo->id) : null,
            'estudiantes' => $grupo && $periodo ? Boletines::estudiantes($grupo->id, $periodo->id) : [],
            'ver' => $ver,
            'maximo' => self::MAXIMO,
            'puedeConfigurar' => $configura,
            // Crear ahí mismo a quien firma (es crear un usuario): solo administradores.
            'puedeCrearFirmantes' => $configura && $user->can('gestionar-usuarios'),
            // Para elegir quién firma: quienes trabajan en la sede del grupo (los docentes primero).
            'usuarios' => $configura
                ? $this->firmantes($grupo->sede_id)
                    ->orderByRaw("CASE r.nombre WHEN 'docente' THEN 0 WHEN 'coordinacion' THEN 1 ELSE 2 END")->orderBy('u.name')
                    ->get(['u.id', 'u.name', 'r.nombre as rol'])
                : [],
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
        abort_unless(DB::table('periodos')->where('id', $periodo)->where('anio_lectivo_id', $m->anio_lectivo_id)->exists(), 404);

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
        $anioPeriodo = DB::table('periodos')->where('id', $datos['periodo'])->value('anio_lectivo_id');
        abort_unless($anioPeriodo && $anios->count() === 1 && (int) $anios->first() === (int) $anioPeriodo, 404);

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

    /** Quién firma (director(a) del grupo y coordinador(a) de la sede) y cómo se escribe la jornada. Solo el año en curso. */
    public function configurar(Request $request, int $grupo): RedirectResponse
    {
        $g = $this->grupo($request->user(), $grupo);

        // Solo alguien activo que trabaje en esa sede (o en todas).
        $firmante = Rule::exists('users', 'id')->where(fn ($q) => $this->deLaSede($q, $g->sede_id, 'users'));
        $datos = $request->validate([
            // Si no llega, se deja como está (p. ej. un director(a) que ya estaba y no tiene usuario).
            'director_id' => ['sometimes', 'nullable', 'integer', $firmante],
            'coordinador_id' => ['sometimes', 'nullable', 'integer', $firmante],
            'jornada_boletin' => ['nullable', 'string', 'max:60'],
        ], ['exists' => 'Elige a alguien de la lista.', 'max' => 'Es demasiado largo: máximo :max caracteres.']);

        DB::transaction(function () use ($g, $datos) {
            $director = array_key_exists('director_id', $datos) ? ['director_id' => $datos['director_id'] ? $this->docenteDe((int) $datos['director_id']) : null] : [];
            DB::table('grupos')->where('id', $g->id)->update([
                ...$director,
                'jornada_boletin' => trim((string) ($datos['jornada_boletin'] ?? '')) ?: null,
                'updated_at' => now(),
            ]);
            if (array_key_exists('coordinador_id', $datos)) {
                DB::table('sedes')->where('id', $g->sede_id)->update(['coordinador_id' => $datos['coordinador_id'] ?: null, 'updated_at' => now()]);
            }
        });

        return back()->with('success', 'Firmas y jornada guardadas.');
    }

    /**
     * Crea a quien firma desde «Firmas y jornada», con el nombre tal como sale en el
     * boletín: queda activo en la sede del grupo (docente si dirige el grupo,
     * coordinación si coordina), con un usuario sacado del nombre y una clave
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
            'para' => ['required', Rule::in(['director', 'coordinador'])],
        ], [
            'required' => 'Escribe el nombre completo.',
            'max' => 'Es demasiado largo: máximo :max caracteres.',
            'regex' => 'Escribe nombres y apellidos, solo con letras.',
        ]);

        $igual = User::whereRaw('LOWER(name) = ?', [mb_strtolower($datos['nombre'])])->value('usuario');
        if ($igual) {
            throw ValidationException::withMessages(['nombre' => "Ya existe: es el usuario «{$igual}». Si no sale en la lista, revisa en Usuarios que esté activo y en esta sede."]);
        }

        $rol = $datos['para'] === 'director' ? 'docente' : 'coordinacion';
        $nuevo = DB::transaction(function () use ($datos, $rol, $g) {
            $u = User::create([
                'name' => $datos['nombre'],
                'usuario' => self::usuarioPara($datos['nombre']),
                'password' => Str::random(48),
                'rol_id' => Rol::where('nombre', $rol)->value('id'),
                'activo' => true,
            ]);
            DB::table('sede_user')->insert(['user_id' => $u->id, 'sede_id' => $g->sede_id, 'created_at' => now()]);
            // Si es el director(a) que el grupo ya tenía sin usuario, ese docente queda con este usuario (no se repite).
            if ($datos['para'] === 'director') {
                DB::table('docentes')
                    ->where('id', DB::table('grupos')->where('id', $g->id)->value('director_id'))
                    ->whereNull('user_id')
                    ->whereRaw('LOWER(nombre_completo) = ?', [mb_strtolower($datos['nombre'])])
                    ->update(['user_id' => $u->id, 'updated_at' => now()]);
            }

            return $u;
        });

        return response()->json(['id' => $nuevo->id, 'name' => $nuevo->name, 'usuario' => $nuevo->usuario, 'rol' => $rol], 201);
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
        $periodo = Boletines::periodos($anio->id)->firstWhere('id', $request->integer('periodo'));
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
            ->first(['g.id', 'g.sede_id']);
        abort_unless($g, 404);
        Alcance::exigirSede($user, $g->sede_id);

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
            ->first(['m.id', 'm.sede_id', 'm.anio_lectivo_id']);
        abort_unless($m, 404);
        Alcance::exigirSede($user, $m->sede_id);

        return $m;
    }

    /** Los usuarios que pueden firmar en una sede: activos y que trabajan en ella (o ven todas, o administran). */
    private function firmantes(int $sedeId): Builder
    {
        return DB::table('users as u')->leftJoin('roles as r', 'r.id', '=', 'u.rol_id')->where(fn ($q) => $this->deLaSede($q, $sedeId, 'u'));
    }

    /** Condición «activo y de esa sede» sobre la tabla de usuarios con ese alias. */
    private function deLaSede(Builder $q, int $sedeId, string $tabla): Builder
    {
        return $q->where("{$tabla}.activo", true)->where(fn ($w) => $w
            ->where("{$tabla}.todas_las_sedes", true)
            ->orWhereIn("{$tabla}.rol_id", DB::table('roles')->where('nombre', 'administrador')->select('id'))
            ->orWhereIn("{$tabla}.id", DB::table('sede_user')->where('sede_id', $sedeId)->select('user_id')));
    }

    /** El docente de ese usuario (grupos.director_id apunta a docentes); se crea si no existe. */
    private function docenteDe(int $userId): int
    {
        // docentes.nombre_completo es de 120: un nombre de usuario más largo se recorta.
        $nombre = mb_substr(trim((string) DB::table('users')->where('id', $userId)->value('name')), 0, 120);
        $docente = DB::table('docentes')->where('user_id', $userId)->orderBy('id')->value('id');
        if ($docente) {
            DB::table('docentes')->where('id', $docente)->update(['nombre_completo' => $nombre, 'updated_at' => now()]);

            return (int) $docente;
        }

        return (int) DB::table('docentes')->insertGetId(['user_id' => $userId, 'nombre_completo' => $nombre, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
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
