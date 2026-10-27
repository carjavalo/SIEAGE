<?php

namespace App\Support;

use App\Models\Padre;
use App\Models\SolicitudInscripcion;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Throwable;

/**
 * Importa las respuestas del formulario de Google de la institución («FORMULARIO DE
 * INSCRIPCIÓN ESTUDIANTE NUEVO …», descargado como Excel) como inscripciones
 * pendientes, igual que si las familias hubieran llenado el formulario de SIEAGE.
 *
 * - Quien respondió que ya estudia en la institución se omite: el formulario mismo le
 *   decía que no hacía falta llenarlo.
 * - Si una familia respondió dos veces por el mismo estudiante, vale la última.
 * - Se puede importar el mismo archivo otra vez (o uno con más respuestas): el
 *   estudiante que ya tiene inscripción en ese año no se repite.
 * - Las preguntas de caracterización que no tienen columna (vivienda, preescolar,
 *   especialidad de 10.º…) quedan en datos_adicionales, en el orden del formulario.
 *
 * Las columnas se buscan por su título, no por su posición: si la institución agrega
 * o mueve preguntas en el formulario, sigue funcionando.
 */
final class ImportarInscripciones
{
    /** Título normalizado de la columna => campo. Los datos del acudiente vienen repetidos con « 2». */
    private const COLUMNAS = [
        'marca temporal' => 'marca',
        'primer nombre' => 'primer_nombre',
        'segundo nombre' => 'segundo_nombre',
        'primer apellido' => 'primer_apellido',
        'segundo apellido' => 'segundo_apellido',
        'pais de nacimiento' => 'pais_nacimiento',
        'ciudad de nacimiento' => 'ciudad_nacimiento',
        'fecha de nacimiento' => 'fecha_nacimiento',
        'tipo de documento de identidad' => 'tipo_documento',
        'numero de documento de identidad' => 'numero_documento',
        'ciudad de expedicion del documento de identidad' => 'ciudad_expedicion',
        'tipo de sangre y rh' => 'tipo_sangre',
        'sexo' => 'sexo',
        'si tiene sisben, seleccione el grupo en el que se ubica' => 'sisben',
        'eps a la que se encuentra afiliado' => 'eps',
        'grupo etnico al que pertenece' => 'grupo_etnico',
        'si tiene alguna discapacidad, por favor describala' => 'discapacidad',
        'grado al que ingresara' => 'grado',
        'jornada de clases' => 'jornada',
        '*solo para primaria* elija la sede donde desea estudiar' => 'sede',
        'primer nombre 2' => 'acudiente_primer_nombre',
        'segundo nombre 2' => 'acudiente_segundo_nombre',
        'primer apellido 2' => 'acudiente_primer_apellido',
        'segundo apellido 2' => 'acudiente_segundo_apellido',
        'fecha de nacimiento 2' => 'acudiente_fecha_nacimiento',
        'numero de documento de identidad 2' => 'acudiente_numero_documento',
        'ciudad de expedicion del documento de identidad 2' => 'acudiente_ciudad_expedicion',
        'parentesco con el estudiante' => 'parentesco',
        'direccion de residencia' => 'direccion',
        'barrio' => 'barrio',
        'numero telefonico 1' => 'telefono_1',
        'numero telefonico 2' => 'telefono_2',
        'correo electronico' => 'correo',
    ];

    /** La pregunta «¿Actualmente estudia en la I.E…?» empieza así (normalizada). */
    private const YA_ESTUDIA = 'actualmente estudia en la';

    /** Sin estas columnas no es el formulario de inscripción. */
    private const OBLIGATORIAS = ['marca', 'primer_nombre', 'primer_apellido', 'numero_documento', 'grado', 'acudiente_primer_nombre'];

    /** ¿Es una descarga del formulario de inscripción? Mira solo la fila de títulos. */
    public static function reconoce(string $ruta): bool
    {
        try {
            $hoja = IOFactory::load($ruta)->getSheet(0);
            $titulos = $hoja->rangeToArray('A1:'.$hoja->getHighestColumn().'1', null, false, false)[0] ?? [];
        } catch (Throwable) {
            return false;
        }

        return array_diff(self::OBLIGATORIAS, array_values(self::mapa($titulos)['campos'])) === [];
    }

    /**
     * Crea las inscripciones pendientes del año indicado.
     *
     * @return array{creadas: int, yaEstudian: int, repetidas: int, yaInscritas: int, errores: list<array{fila: int, nombre: string, error: string}>}
     */
    public static function importar(string $ruta, int $anioLectivoId, string $archivo): array
    {
        $hoja = IOFactory::load($ruta)->getSheet(0);
        $filas = $hoja->toArray(null, false, false, false);
        $mapa = self::mapa(array_shift($filas) ?? []);

        $resumen = ['creadas' => 0, 'yaEstudian' => 0, 'repetidas' => 0, 'yaInscritas' => 0, 'errores' => []];
        $grados = DB::table('grados')->get(['id', 'numero', 'nombre'])->keyBy(fn ($g) => self::normal($g->nombre));
        $sedes = DB::table('sedes')->pluck('id', 'nombre')->mapWithKeys(fn ($id, $n) => [self::normal($n) => $id]);
        $parentescos = DB::table('parentescos')->pluck('id', 'nombre');

        // Una por estudiante: si respondieron varias veces, la última.
        $porDocumento = [];
        foreach ($filas as $i => $fila) {
            if (! array_filter($fila, fn ($v) => $v !== null && trim((string) $v) !== '')) {
                continue;
            }
            $d = ['_fila' => $i + 2];
            foreach ($mapa['campos'] as $col => $campo) {
                $d[$campo] = $fila[$col] ?? null;
            }
            if ($mapa['yaEstudia'] !== null && str_starts_with(self::normal((string) ($fila[$mapa['yaEstudia']] ?? '')), 'si')) {
                $resumen['yaEstudian']++;

                continue;
            }
            $d['_extra'] = [];
            foreach ($mapa['extra'] as $col => $pregunta) {
                $valor = self::texto($fila[$col] ?? null);
                if ($valor !== null) {
                    // Como lista y no como pregunta => respuesta: MySQL reordena las claves de un JSON.
                    $d['_extra'][] = ['pregunta' => $pregunta, 'respuesta' => $valor];
                }
            }
            $documento = self::documento($d['numero_documento']);
            if ($documento && isset($porDocumento[$documento])) {
                $resumen['repetidas']++;
            }
            $porDocumento[$documento ?: "sin-documento-{$i}"] = $d;
        }

        foreach ($porDocumento as $d) {
            try {
                $datos = self::datos($d, $anioLectivoId, $grados, $sedes, $parentescos, $archivo);
            } catch (ErrorDeFila $e) {
                $resumen['errores'][] = [
                    'fila' => $d['_fila'],
                    'nombre' => trim(self::texto($d['primer_nombre']).' '.self::texto($d['primer_apellido'])) ?: '(sin nombre)',
                    'error' => $e->getMessage(),
                ];

                continue;
            }

            $ya = SolicitudInscripcion::where('anio_lectivo_id', $anioLectivoId)->where('numero_documento', $datos['numero_documento'])->exists();
            if ($ya) {
                $resumen['yaInscritas']++;

                continue;
            }

            DB::transaction(function () use ($datos, $d) {
                $solicitud = (new SolicitudInscripcion)->forceFill($datos);
                $solicitud->save();
                // Si el acudiente es la madre o el padre, ya se sabe de él; el otro lo completa la secretaría.
                $rol = ['Madre' => 'madre', 'Padre' => 'padre'][self::texto($d['parentesco']) ?? ''] ?? null;
                if ($rol) {
                    $solicitud->padres()->create([
                        'parentesco' => $rol, 'situacion' => 'registrado', 'es_acudiente' => true,
                        'primer_nombre' => $datos['acudiente_primer_nombre'], 'segundo_nombre' => $datos['acudiente_segundo_nombre'],
                        'primer_apellido' => $datos['acudiente_primer_apellido'], 'segundo_apellido' => $datos['acudiente_segundo_apellido'],
                        'tipo_documento' => 'C.C.', 'numero_documento' => $datos['acudiente_numero_documento'],
                        'fecha_nacimiento' => $datos['acudiente_fecha_nacimiento'], 'telefono' => $datos['acudiente_telefono_1'],
                        'correo' => $datos['acudiente_correo'], 'direccion' => $datos['direccion'], 'barrio' => $datos['barrio'],
                    ]);
                }
            });
            $resumen['creadas']++;
        }

        return $resumen;
    }

    /**
     * Las columnas reconocidas (posición => campo), las demás preguntas (posición => título)
     * y la de «¿ya estudia aquí?».
     *
     * @return array{campos: array<int, string>, extra: array<int, string>, yaEstudia: int|null}
     */
    private static function mapa(array $titulos): array
    {
        $campos = [];
        $extra = [];
        $yaEstudia = null;
        foreach ($titulos as $col => $titulo) {
            $titulo = trim(preg_replace('/\s+/u', ' ', (string) $titulo));
            if ($titulo === '') {
                continue;
            }
            $normal = self::normal($titulo);
            if (isset(self::COLUMNAS[$normal]) && ! in_array(self::COLUMNAS[$normal], $campos, true)) {
                $campos[$col] = self::COLUMNAS[$normal];
            } elseif (str_starts_with($normal, self::YA_ESTUDIA)) {
                $yaEstudia = $col;
            } else {
                $extra[$col] = $titulo;
            }
        }

        return ['campos' => $campos, 'extra' => $extra, 'yaEstudia' => $yaEstudia];
    }

    /** Una respuesta, en las columnas de solicitudes_inscripcion. */
    private static function datos(array $d, int $anioId, $grados, $sedes, $parentescos, string $archivo): array
    {
        $t = fn (string $c) => self::texto($d[$c] ?? null);
        $requerido = function (string $c, string $nombre) use ($t) {
            return $t($c) ?? throw new ErrorDeFila("Falta {$nombre}.");
        };

        $documento = self::documento($d['numero_documento']) ?? throw new ErrorDeFila('Falta el número de documento del estudiante.');
        $grado = $grados->get(self::normal(preg_replace('/\s*\(.*\)\s*$/u', '', $t('grado') ?? '')))
            ?? throw new ErrorDeFila('No se reconoce el grado «'.($t('grado') ?? '').'».');
        [$tipo, $tipoOtro] = self::tipoDocumento($t('tipo_documento'));
        $parentesco = $t('parentesco');
        $parentescoId = $parentescos[$parentesco] ?? $parentescos['Otro'] ?? null;
        $marca = self::fecha($d['marca'] ?? null, true) ?? now();
        $sede = $t('sede') ? $sedes->get(self::normal($t('sede'))) : null;
        $telefono1 = self::documento($d['telefono_1'] ?? null);
        $telefono2 = self::documento($d['telefono_2'] ?? null) ?? $telefono1;
        $correo = $t('correo') ? Str::lower($t('correo')) : null;

        return [
            'anio_lectivo_id' => $anioId,
            'primer_nombre' => $requerido('primer_nombre', 'el primer nombre del estudiante'),
            'segundo_nombre' => $t('segundo_nombre'),
            'primer_apellido' => $requerido('primer_apellido', 'el primer apellido del estudiante'),
            'segundo_apellido' => $t('segundo_apellido'),
            'sexo' => str_starts_with(self::normal($t('sexo') ?? ''), 'm') ? 'M' : 'F',
            'pais_nacimiento' => $t('pais_nacimiento') ?? 'Colombia',
            'ciudad_nacimiento' => $t('ciudad_nacimiento') ?? '',
            'fecha_nacimiento' => self::fecha($d['fecha_nacimiento'] ?? null)?->format('Y-m-d') ?? throw new ErrorDeFila('La fecha de nacimiento del estudiante no es válida.'),
            'tipo_documento' => $tipo,
            'tipo_documento_otro' => $tipoOtro,
            'numero_documento' => $documento,
            'ciudad_expedicion' => $t('ciudad_expedicion') ?? '',
            'grado_id' => $grado->id,
            'jornada' => in_array($t('jornada'), ['Mañana', 'Tarde'], true) ? $t('jornada') : null,
            // La sede solo se pide en primaria (transición a quinto), como en el formulario de SIEAGE.
            'sede_preferida_id' => $grado->numero <= 5 ? $sede : null,
            'tipo_sangre' => in_array($t('tipo_sangre'), ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], true)
                ? $t('tipo_sangre')
                : throw new ErrorDeFila('Falta el tipo de sangre o no es válido.'),
            'sisben' => self::sisben($t('sisben')),
            'eps' => $t('eps') ?? '',
            'grupo_etnico' => in_array(self::normal($t('grupo_etnico') ?? ''), ['', 'n/a', 'na'], true) ? 'Ninguno' : $t('grupo_etnico'),
            'discapacidad' => $t('discapacidad'),
            'direccion' => $t('direccion') ?? '',
            'barrio' => $t('barrio') ?? '',
            'telefono_1' => $telefono1 ?? '',
            'telefono_2' => $telefono2 ?? '',
            'correo' => $correo ?? '',
            'acudiente_primer_nombre' => $requerido('acudiente_primer_nombre', 'el primer nombre del acudiente'),
            'acudiente_segundo_nombre' => $t('acudiente_segundo_nombre'),
            'acudiente_primer_apellido' => $requerido('acudiente_primer_apellido', 'el primer apellido del acudiente'),
            'acudiente_segundo_apellido' => $t('acudiente_segundo_apellido'),
            'acudiente_fecha_nacimiento' => self::fecha($d['acudiente_fecha_nacimiento'] ?? null)?->format('Y-m-d'),
            'acudiente_numero_documento' => self::documento($d['acudiente_numero_documento'] ?? null) ?? throw new ErrorDeFila('Falta el documento del acudiente.'),
            'acudiente_ciudad_expedicion' => $t('acudiente_ciudad_expedicion') ?? '',
            'acudiente_parentesco_id' => $parentescoId,
            'acudiente_parentesco_otro' => isset($parentescos[$parentesco]) ? null : $parentesco,
            // El formulario de la institución pregunta una sola dirección: la del hogar, que es la del acudiente.
            'acudiente_direccion' => $t('direccion'),
            'acudiente_barrio' => $t('barrio'),
            'acudiente_telefono_1' => $telefono1 ?? '',
            'acudiente_telefono_2' => $telefono2 ?? '',
            'acudiente_correo' => $correo,
            'datos_adicionales' => $d['_extra'] ?: null,
            'autorizo_datos_en' => $marca,
            'navegador' => Str::limit("Importado del formulario de Google ({$archivo})", 255, ''),
            'created_at' => $marca,
            'updated_at' => now(),
        ];
    }

    private static function tipoDocumento(?string $texto): array
    {
        $n = self::normal($texto ?? '');

        return match (true) {
            str_contains($n, 'registro') => ['R.C.', null],
            str_contains($n, 'tarjeta') => ['T.I.', null],
            str_contains($n, 'proteccion') || str_contains($n, 'ppt') => ['P.P.T.', null],
            str_contains($n, 'extranjeria') => ['C.E.', null],
            str_contains($n, 'cedula') => ['C.C.', null],
            $n === '' => ['T.I.', null],
            default => ['Otro', Str::limit($texto, 40, '')],
        };
    }

    /** «No tengo» → ninguno; «Grupo B» → B (SISBÉN IV); «Nivel 2» → 2 (SISBÉN III). */
    private static function sisben(?string $texto): string
    {
        $n = self::normal($texto ?? '');
        if (preg_match('/grupo\s*([a-d])\b/', $n, $m)) {
            return strtoupper($m[1]);
        }
        if (preg_match('/nivel\s*([1-3])\b/', $n, $m)) {
            return $m[1];
        }

        return 'ninguno';
    }

    /** Las fechas vienen como «9/24/2021» (mes/día/año, como las exporta Google) o como fecha de Excel. */
    private static function fecha(mixed $valor, bool $conHora = false): ?CarbonImmutable
    {
        if ($valor === null || $valor === '') {
            return null;
        }
        if (is_numeric($valor)) {
            return CarbonImmutable::instance(Date::excelToDateTimeObject((float) $valor));
        }
        $valor = trim((string) $valor);
        foreach ($conHora ? ['n/j/Y H:i:s', 'n/j/Y G:i:s', 'n/j/Y'] : ['n/j/Y', 'Y-m-d', 'j/n/Y'] as $formato) {
            try {
                $f = CarbonImmutable::createFromFormat("!{$formato}", $valor);
                if ($f && $f->year > 1900 && $f->isPast()) {
                    return $f;
                }
            } catch (Throwable) {
            }
        }

        return null;
    }

    /** Solo los dígitos (o letras y dígitos, en un PPT); null si no queda nada. */
    private static function documento(mixed $valor): ?string
    {
        $limpio = preg_replace('/[^0-9A-Za-z]/', '', (string) $valor);

        return $limpio === '' ? null : Str::limit($limpio, 15, '');
    }

    private static function texto(mixed $valor): ?string
    {
        $t = trim(preg_replace('/\s+/u', ' ', (string) $valor));

        return $t === '' ? null : $t;
    }

    /** Minúsculas, sin tildes ni espacios de más: para comparar títulos y opciones. */
    private static function normal(string $texto): string
    {
        return trim(preg_replace('/\s+/u', ' ', Str::lower(Str::ascii($texto))));
    }
}
