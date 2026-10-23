<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Throwable;

/**
 * Carga el libro de matrícula del institución (una hoja por grupo, como
 * «PRINCIPAL-2026.xlsx») o el de ciclos (una hoja por ciclo, como
 * «SABATINOS-2026.xlsx»): mismo formato, ver docs/bd/00-analisis-excel.md.
 *
 * Por cada fila de estudiante: crea al estudiante y al acudiente si no existen
 * (si existen, solo completa lo que les falta), los une, y crea su matrícula del
 * año del libro y las de los años anteriores que trae la historia («GRUPO 2015…»).
 * No borra ni cambia nada que ya exista: una matrícula del año que ya está se deja
 * como está. Por eso se puede cargar el mismo libro varias veces.
 *
 * Las columnas se buscan por su título (no por su letra): sirve también el libro
 * que exporta SIEAGE, que trae la madre y el padre antes de OBSERVACIONES.
 *
 * Ciclos (jornada sabatina): cada ciclo queda en el último grado que abarca, con
 * su grupo «Ciclo III» en jornada Sabatina (ver App\Support\Ciclos).
 */
final class ImportarLibroMatricula
{
    private const MESES = ['enero' => 1, 'febrero' => 2, 'marzo' => 3, 'abril' => 4, 'mayo' => 5, 'junio' => 6, 'julio' => 7,
        'agosto' => 8, 'septiembre' => 9, 'setiembre' => 9, 'octubre' => 10, 'noviembre' => 11, 'diciembre' => 12];

    /** Hojas de resumen o auxiliares: no son de estudiantes. */
    private const NO_SON_GRUPOS = ['consolidado', 'total modalidades', 'directores de grupo', 'no tocar', 'pegar aqui', 'constancia de matricula'];

    /** Título normalizado de la fila 1 → campo (las fechas ocupan tres columnas: día, mes, año). */
    private const TITULOS = [
        'fecha matricula' => 'fecha_matricula', 'apellidos y nombres' => 'nombre', 'sede' => 'sede', 'modalidad tecnica' => 'modalidad',
        'jornada' => 'jornada', 'genero' => 'genero', 'fecha nacimiento' => 'nacimiento', 'tipo doc' => 'tipo_documento',
        'numero' => 'numero_documento', 'fotos' => 'fotos', 'nombre del acudiente' => 'acudiente', 'cedula' => 'acudiente_documento',
        'parentesco' => 'parentesco', 'direccion' => 'direccion', 'barrio' => 'barrio', 'telefono fijo' => 'telefono_fijo',
        'telefono celular' => 'telefono_celular', 'observaciones' => 'observaciones',
    ];

    private array $sedes = [];

    private array $grados = [];

    private array $anios = [];

    private array $resumen = ['hojas' => 0, 'estudiantes' => 0, 'estudiantesNuevos' => 0, 'matriculas' => 0, 'yaMatriculados' => 0,
        'acudientesNuevos' => 0, 'historicas' => 0, 'grupos' => 0, 'errores' => [], 'anio' => null];

    private function __construct(private bool $ciclos) {}

    /** ¿Es un libro de matrícula (o de ciclos)? Mira los títulos de la primera hoja con estudiantes. */
    public static function reconoce(string $ruta): bool
    {
        try {
            foreach (IOFactory::load($ruta)->getAllSheets() as $hoja) {
                if (self::esHojaDeGrupo($hoja)) {
                    return true;
                }
            }
        } catch (Throwable) {
        }

        return false;
    }

    /**
     * @param  bool  $ciclos  el libro de sabatinos: cada hoja es un ciclo y la jornada es Sabatina
     * @return array<string, mixed> el resumen
     */
    public static function importar(string $ruta, bool $ciclos): array
    {
        $yo = new self($ciclos);
        $yo->sedes = DB::table('sedes')->get(['id', 'codigo', 'nombre'])
            ->flatMap(fn ($s) => [self::normal($s->codigo) => $s->id, self::normal($s->nombre) => $s->id])->all();
        $yo->grados = DB::table('grados')->pluck('id', 'numero')->all();
        $yo->anios = DB::table('anios_lectivos')->pluck('id', 'anio')->all();

        foreach (IOFactory::load($ruta)->getAllSheets() as $hoja) {
            if (self::esHojaDeGrupo($hoja)) {
                $yo->hoja($hoja);
            }
        }

        return $yo->resumen;
    }

    private static function esHojaDeGrupo(Worksheet $hoja): bool
    {
        $nombre = self::normal($hoja->getTitle());
        foreach (self::NO_SON_GRUPOS as $n) {
            if (str_starts_with($nombre, $n)) {
                return false;
            }
        }
        $titulos = array_map(fn ($t) => self::normal((string) $t), $hoja->rangeToArray('A1:'.$hoja->getHighestColumn().'1', null, false, false)[0] ?? []);

        return in_array('apellidos y nombres', $titulos, true) && in_array('numero', $titulos, true);
    }

    // ------------------------------------------------------------------ una hoja (un grupo o un ciclo)

    private function hoja(Worksheet $hoja): void
    {
        $filas = $hoja->toArray(null, true, false, false);
        [$cols, $historia] = $this->columnas($filas[0] ?? []);
        if (! $historia) {
            $this->error($hoja, 1, '—', 'No tiene las columnas «GRUPO 2015…»: no se sabe de qué año es.');

            return;
        }
        $anio = max(array_keys($historia));
        $anioId = $this->anios[$anio] ?? null;
        if (! $anioId) {
            $this->error($hoja, 1, '—', "El año {$anio} no existe en SIEAGE.");

            return;
        }
        $this->resumen['anio'] = $anio;
        $this->resumen['hojas']++;
        $cupos = is_numeric($filas[0][1] ?? null) ? (int) $filas[0][1] : 34; // B1: el cupo del grupo

        foreach ($filas as $i => $f) {
            if ($i < 2) {
                continue;
            }
            $nombre = self::texto($f[$cols['nombre']] ?? null);
            // Los totales de abajo («TOTAL ESTUDIANTES…») cierran la lista.
            if (str_starts_with(self::normal((string) ($f[2] ?? '')), 'total estudiantes')) {
                break;
            }
            if ($nombre === null) {
                continue;
            }
            try {
                DB::transaction(fn () => $this->fila($hoja, $f, $cols, $historia, $anio, $anioId, $cupos, $i + 1));
            } catch (ErrorDeFila $e) {
                $this->error($hoja, $i + 1, $nombre, $e->getMessage());
            } catch (Throwable $e) {
                // Un dato que la base no acepta: esa fila no entra, las demás sí.
                report($e);
                $this->error($hoja, $i + 1, $nombre, 'No se pudo guardar: '.Str::limit($e->getMessage(), 120));
            }
        }
    }

    /** Dónde está cada campo, y las columnas de la historia: año => [columna del grupo, columna de la sede]. */
    private function columnas(array $titulos): array
    {
        $cols = [];
        $historia = [];
        foreach ($titulos as $c => $t) {
            $n = self::normal((string) $t);
            if (preg_match('/^grupo\s*(\d{4})$/', $n, $m)) {
                $historia[(int) $m[1]] = [$c, $c + 1];
            } elseif (isset(self::TITULOS[$n]) && ! isset($cols[self::TITULOS[$n]])) {
                $cols[self::TITULOS[$n]] = $c;
            }
        }

        return [$cols, $historia];
    }

    private function fila(Worksheet $hoja, array $f, array $cols, array $historia, int $anio, int $anioId, int $cupos, int $numeroFila): void
    {
        $v = fn (string $campo, int $mas = 0) => isset($cols[$campo]) ? ($f[$cols[$campo] + $mas] ?? null) : null;
        $documento = self::digitos($v('numero_documento')) ?? throw new ErrorDeFila('No tiene número de documento.');
        $nombre = self::texto($v('nombre'));

        // El grupo de este año: el de la historia (GRUPO 2026) o, en los ciclos, el de la hoja.
        [$grupoAnio, $sedeAnio] = $historia[$anio];
        $codigo = self::texto($f[$grupoAnio] ?? null);
        $sedeId = $this->sede(self::texto($f[$sedeAnio] ?? null)) ?? $this->sede(self::texto($v('sede'))) ?? throw new ErrorDeFila('No se reconoce la sede.');
        $ubicacion = $this->ciclos ? $this->delCiclo($hoja->getTitle(), $codigo) : $this->delCodigo($codigo ?? $hoja->getTitle());
        if (! $ubicacion) {
            throw new ErrorDeFila('No se reconoce el grupo «'.($codigo ?? $hoja->getTitle()).'».');
        }
        [$grado, $numero, $codigoGrupo] = $ubicacion;
        $jornada = $this->ciclos ? Ciclos::JORNADA : self::jornada(self::texto($v('jornada')));

        $estudianteId = $this->estudiante($documento, $nombre, $v, $f, $cols);
        $this->acudiente($estudianteId, $v);
        $this->resumen['estudiantes']++;

        // La matrícula del año: si ya tiene, se deja como está.
        if (DB::table('matriculas')->where('estudiante_id', $estudianteId)->where('anio_lectivo_id', $anioId)->exists()) {
            $this->resumen['yaMatriculados']++;
        } else {
            $grupoId = $this->grupo($anioId, $sedeId, $grado, $numero, $codigoGrupo, $jornada, $cupos);
            $marca = strtoupper(trim((string) ($f[0] ?? '')));
            DB::table('matriculas')->insert([
                'estudiante_id' => $estudianteId,
                'anio_lectivo_id' => $anioId,
                'grado_id' => $this->grados[$grado],
                'grupo_id' => $grupoId,
                'sede_id' => $sedeId,
                'jornada' => $jornada,
                'modalidad_id' => $this->modalidad(self::texto($v('modalidad'))),
                'fecha_matricula' => $this->fecha($v('fecha_matricula'), $v('fecha_matricula', 1), $v('fecha_matricula', 2))?->format('Y-m-d'),
                // B: consecutivo de antiguos; vacío, nuevo. A: 1 activo, R retirado, en blanco cancelado.
                'condicion' => self::texto($f[1] ?? null) !== null ? 'antiguo' : 'nuevo',
                'estado' => $marca === 'R' ? 'retirado' : ($marca === '1' ? 'activo' : 'cancelado'),
                'observaciones' => self::texto($v('observaciones')),
                'numero_orden' => $numeroFila - 2,
                'es_historico' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->resumen['matriculas']++;
        }

        // La historia de los años anteriores, la que todavía no esté.
        foreach ($historia as $año => [$cGrupo, $cSede]) {
            $antes = self::texto($f[$cGrupo] ?? null);
            if ($año >= $anio || $antes === null || self::normal($antes) === 'no' || ! isset($this->anios[$año])) {
                continue;
            }
            $u = $this->delCodigo($antes) ?? $this->delCiclo('', $antes);
            $sedeAntes = $this->sede(self::texto($f[$cSede] ?? null)) ?? $sedeId;
            if (! $u || DB::table('matriculas')->where('estudiante_id', $estudianteId)->where('anio_lectivo_id', $this->anios[$año])->exists()) {
                continue;
            }
            [$gAntes, $nAntes, $codAntes] = $u;
            DB::table('matriculas')->insert([
                'estudiante_id' => $estudianteId,
                'anio_lectivo_id' => $this->anios[$año],
                'grado_id' => $this->grados[$gAntes],
                'grupo_id' => $nAntes ? DB::table('grupos')->where('anio_lectivo_id', $this->anios[$año])->where('sede_id', $sedeAntes)->where('codigo', $codAntes)->value('id') : null,
                'sede_id' => $sedeAntes,
                'condicion' => 'antiguo',
                'estado' => 'activo',
                'es_historico' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->resumen['historicas']++;
        }
    }

    // ------------------------------------------------------------------ personas

    private function estudiante(string $documento, ?string $nombre, callable $v, array $f, array $cols): int
    {
        $nacimiento = $this->fecha($v('nacimiento'), $v('nacimiento', 1), $v('nacimiento', 2));
        $genero = strtoupper((string) self::texto($v('genero')));
        $datos = [
            'tipo_documento' => self::tipoEstudiante(self::texto($v('tipo_documento'))),
            'numero_documento' => $documento,
            'nombre_completo' => $nombre,
            ...Nombres::deEstudiante((string) $nombre),
            'fecha_nacimiento' => $nacimiento?->format('Y-m-d'),
            'genero' => in_array($genero, ['F', 'M'], true) ? $genero : null,
            'tiene_foto' => strtoupper((string) self::texto($v('fotos'))) === 'S',
            'direccion' => self::texto($v('direccion')),
            'barrio_id' => Barrios::id(self::texto($v('barrio'))),
        ];

        $existente = DB::table('estudiantes')->where('numero_documento', $documento)->first();
        if (! $existente) {
            $this->resumen['estudiantesNuevos']++;

            return DB::table('estudiantes')->insertGetId([...$datos, 'created_at' => now(), 'updated_at' => now()]);
        }
        // Ya estaba: solo se completa lo que le falta.
        $faltan = array_filter($datos, fn ($valor, $campo) => $valor !== null && $valor !== false && ($existente->{$campo} ?? null) === null, ARRAY_FILTER_USE_BOTH);
        if ($faltan) {
            DB::table('estudiantes')->where('id', $existente->id)->update([...$faltan, 'updated_at' => now()]);
        }

        return $existente->id;
    }

    private function acudiente(int $estudianteId, callable $v): void
    {
        $nombre = self::texto($v('acudiente'));
        $documento = self::digitos($v('acudiente_documento'));
        if (! $nombre || ! $documento) {
            return; // sin cédula no se puede saber si ya existe
        }
        $acudienteId = DB::table('acudientes')->where('numero_documento', $documento)->value('id');
        if (! $acudienteId) {
            $acudienteId = DB::table('acudientes')->insertGetId([
                'tipo_documento' => 'C.C.',
                'numero_documento' => $documento,
                'nombre_completo' => $nombre,
                ...Nombres::deAcudiente($nombre),
                'direccion' => self::texto($v('direccion')),
                'barrio_id' => Barrios::id(self::texto($v('barrio'))),
                'telefono_fijo' => self::digitos($v('telefono_fijo')),
                'telefono_celular' => self::digitos($v('telefono_celular')),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->resumen['acudientesNuevos']++;
        }
        if (DB::table('estudiante_acudiente')->where('estudiante_id', $estudianteId)->where('acudiente_id', $acudienteId)->exists()) {
            return;
        }
        [$parentescoId, $otro] = $this->parentesco(self::texto($v('parentesco')));
        DB::table('estudiante_acudiente')->insert([
            'estudiante_id' => $estudianteId,
            'acudiente_id' => $acudienteId,
            'parentesco_id' => $parentescoId,
            'parentesco_otro' => $otro,
            // Principal si todavía no tiene uno.
            'es_principal' => ! DB::table('estudiante_acudiente')->where('estudiante_id', $estudianteId)->where('es_principal', true)->exists(),
            'vive_con' => true,
        ]);
    }

    // ------------------------------------------------------------------ catálogos

    /** «6-1» → [6, 1, '6-1']; «9°» → [9, null, '9°']; «0-2» → [0, 2, '0-2']. Un ciclo («III») también. */
    private function delCodigo(?string $codigo): ?array
    {
        $c = trim((string) $codigo);
        if (preg_match('/^(\d{1,2})\s*-\s*(\d{1,2})$/', $c, $m) && isset($this->grados[(int) $m[1]])) {
            return [(int) $m[1], (int) $m[2], "{$m[1]}-{$m[2]}"];
        }
        if (preg_match('/^(\d{1,2})\s*[°º]?$/u', $c, $m) && isset($this->grados[(int) $m[1]])) {
            return [(int) $m[1], null, $c];
        }

        return $this->delCiclo('', $c);
    }

    /** El ciclo, del nombre de la hoja («CICLO III 2026») o de la celda («III»): [grado equivalente, 1, 'Ciclo III']. */
    private function delCiclo(string $hoja, ?string $codigo): ?array
    {
        foreach ([(string) $codigo, $hoja] as $texto) {
            if (preg_match('/(?:^|ciclo\s+)(VI|IV|V|III|II|I)\b/i', trim($texto), $m)) {
                $romano = strtoupper($m[1]);

                return [Ciclos::grado($romano), 1, Ciclos::codigo($romano)];
            }
        }

        return null;
    }

    private function grupo(int $anioId, int $sedeId, int $grado, ?int $numero, string $codigo, string $jornada, int $cupos): ?int
    {
        if ($numero === null) {
            return null; // «9°»: el grado, sin grupo
        }
        $clave = ['anio_lectivo_id' => $anioId, 'sede_id' => $sedeId, 'grado_id' => $this->grados[$grado], 'numero' => $numero, 'jornada' => $jornada];
        $id = DB::table('grupos')->where($clave)->value('id');
        if ($id) {
            return $id;
        }
        $this->resumen['grupos']++;

        return DB::table('grupos')->insertGetId([...$clave, 'codigo' => $codigo, 'cupos_proyectados' => $cupos, 'created_at' => now(), 'updated_at' => now()]);
    }

    private function sede(?string $texto): ?int
    {
        return $texto ? ($this->sedes[self::normal($texto)] ?? null) : null;
    }

    private function modalidad(?string $nombre): ?int
    {
        return $nombre ? DB::table('modalidades')->whereRaw('lower(nombre) = ?', [mb_strtolower($nombre)])->value('id') : null;
    }

    /** @return array{0: int, 1: string|null} id del parentesco y, si no está en el catálogo, lo que decía */
    private function parentesco(?string $texto): array
    {
        $catalogo = DB::table('parentescos')->pluck('id', 'nombre');
        $n = self::normal($texto ?? '');
        foreach ($catalogo as $nombre => $id) {
            $base = self::normal(preg_replace('/\(.*\)/', '', $nombre));
            if ($n !== '' && ($n === self::normal($nombre) || str_starts_with($n, $base))) {
                return [$id, null];
            }
        }

        return [$catalogo['Otro'] ?? $catalogo->first(), $texto];
    }

    private static function jornada(?string $texto): ?string
    {
        $n = self::normal($texto ?? '');

        return match (true) {
            str_starts_with($n, 'man') => 'Mañana',
            str_starts_with($n, 'tar') => 'Tarde',
            str_starts_with($n, 'sab') => 'Sabatina',
            str_starts_with($n, 'noc') => 'Noche',
            str_starts_with($n, 'uni') => 'Única',
            default => null,
        };
    }

    private static function tipoEstudiante(?string $texto): string
    {
        $n = str_replace(['.', ' '], '', self::normal($texto ?? ''));

        return match ($n) {
            'ti' => 'T.I.', 'rc' => 'R.C.', 'cc' => 'C.C.', 'ce' => 'C.E.', 'ppt' => 'P.P.T.', 'nuip' => 'N.U.I.P.', 'nes' => 'N.E.S.',
            default => $n === '' ? 'T.I.' : 'Otro',
        };
    }

    /** Día, mes (número o nombre) y año en tres celdas. */
    private function fecha(mixed $dia, mixed $mes, mixed $anio): ?CarbonImmutable
    {
        $d = (int) $dia;
        $m = is_numeric($mes) ? (int) $mes : (self::MESES[self::normal((string) $mes)] ?? 0);
        $a = (int) $anio;
        if ($d < 1 || $m < 1 || $a < 1900 || ! checkdate($m, $d, $a)) {
            return null;
        }

        return CarbonImmutable::create($a, $m, $d);
    }

    private function error(Worksheet $hoja, int $fila, string $nombre, string $error): void
    {
        $this->resumen['errores'][] = ['hoja' => $hoja->getTitle(), 'fila' => $fila, 'nombre' => $nombre, 'error' => $error];
    }

    /** Solo los dígitos ("1,066,842,892" o 1066842892.0 → "1066842892"); null si no queda nada. */
    private static function digitos(mixed $valor): ?string
    {
        if (is_float($valor)) {
            $valor = number_format($valor, 0, '', '');
        }
        $limpio = preg_replace('/\D/', '', (string) $valor);

        return $limpio === '' ? null : Str::limit($limpio, 20, '');
    }

    private static function texto(mixed $valor): ?string
    {
        $t = trim(preg_replace('/\s+/u', ' ', (string) $valor));

        return $t === '' ? null : $t;
    }

    private static function normal(string $texto): string
    {
        return trim(preg_replace('/\s+/u', ' ', Str::lower(Str::ascii($texto))));
    }
}
