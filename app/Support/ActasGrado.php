<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Actas de grado y diplomas de undécimo. Cada graduando sale con el formato de su
 * programa: el bachillerato técnico de su modalidad o, en la jornada sabatina, el
 * bachillerato académico por ciclos. Cada programa es un acta general aparte: cuenta
 * sus alumnos y empieza y termina con el primero y el último en orden alfabético
 * (por apellidos), juntando todos los grupos de once.
 *
 * Graduandos: las matrículas de undécimo del año, activas o ya graduadas (después
 * de promover), menos las marcadas como reprobadas.
 */
final class ActasGrado
{
    public const CICLOS = 'ciclos';

    /** El título por nombre de modalidad, como sale en las actas del colegio. */
    private const TECNICAS = [
        'Asist. Admin.' => ['Bachiller Técnico en Comercio', 'Asistencia Administrativa'],
        'Ebanistería' => ['Bachiller Técnico Industrial', 'Diseño y Elaboración de Muebles Contemporáneos y Modulares'],
        'Electricidad' => ['Bachiller Técnico Industrial', 'Instalaciones Eléctricas Residenciales'],
        'Electrónica' => ['Bachiller Técnico Industrial', 'Mantenimiento Electrónico Para Equipos Domésticos y de Pequeña Industria'],
    ];

    /**
     * Los programas que gradúan este año, con sus graduandos en orden, y los de once
     * que no se pueden graduar porque no tienen modalidad.
     *
     * @return array{programas: list<array<string, mixed>>, sinModalidad: list<array{id: int, nombre: string, grupo: ?string}>}
     */
    public static function del(int $anioId): array
    {
        $filas = DB::table('matriculas as m')
            ->join('estudiantes as e', 'e.id', '=', 'm.estudiante_id')
            ->join('grados as gr', 'gr.id', '=', 'm.grado_id')
            ->leftJoin('grupos as g', 'g.id', '=', 'm.grupo_id')
            ->leftJoin('modalidades as mo', 'mo.id', '=', 'm.modalidad_id')
            ->where('m.anio_lectivo_id', $anioId)
            ->where('gr.numero', 11)
            ->whereIn('m.estado', ['activo', 'graduado'])
            ->where(fn ($q) => $q->whereNull('m.resultado')->orWhere('m.resultado', '<>', 'reprobado'))
            ->whereNull('e.deleted_at')
            ->orderBy('e.nombre_completo')
            ->orderBy('m.id')
            ->get([
                'm.id', 'e.id as estudiante_id', 'e.tipo_documento', 'e.numero_documento', 'e.nombre_completo',
                'e.primer_nombre', 'e.segundo_nombre', 'e.primer_apellido', 'e.segundo_apellido',
                'm.modalidad_id', 'mo.nombre as modalidad', 'm.jornada', 'g.jornada as jornada_grupo', 'g.codigo as grupo',
            ]);

        $programas = [];
        $sinModalidad = [];
        foreach ($filas as $f) {
            $sabatina = ($f->jornada ?? $f->jornada_grupo) === Ciclos::JORNADA;
            $clave = $sabatina ? self::CICLOS : ($f->modalidad_id ? "modalidad-{$f->modalidad_id}" : null);
            if (! $clave) {
                $sinModalidad[] = ['id' => (int) $f->estudiante_id, 'nombre' => self::nombre($f), 'grupo' => $f->grupo];

                continue;
            }
            $programas[$clave] ??= self::programa($clave, $f->modalidad);
            $programas[$clave]['graduandos'][] = [
                'matricula' => (int) $f->id,
                'nombre' => self::nombre($f),
                'documento' => self::documento($f->tipo_documento, $f->numero_documento),
                'grupo' => $f->grupo,
            ];
        }

        // Primero las técnicas en el orden de sus modalidades, al final los ciclos.
        uksort($programas, fn ($a, $b) => [$a === self::CICLOS, (int) substr($a, 10)] <=> [$b === self::CICLOS, (int) substr($b, 10)]);

        return ['programas' => array_values($programas), 'sinModalidad' => $sinModalidad];
    }

    /** @return array<string, mixed> */
    private static function programa(string $clave, ?string $modalidad): array
    {
        if ($clave === self::CICLOS) {
            return ['clave' => $clave, 'nombre' => 'Ciclo VI · sabatina', 'tipo' => 'ciclos', 'titulo' => 'Bachiller Académico', 'especialidad' => null, 'graduandos' => []];
        }
        [$titulo, $especialidad] = self::TECNICAS[$modalidad] ?? ['Bachiller Técnico', $modalidad];

        return ['clave' => $clave, 'nombre' => $modalidad, 'tipo' => 'tecnico', 'titulo' => $titulo, 'especialidad' => $especialidad, 'graduandos' => []];
    }

    /** «Mariana Acevedo Guzman»: nombres y luego apellidos, con mayúscula inicial. */
    public static function nombre(object $e): string
    {
        $partes = $e->primer_apellido && $e->primer_nombre
            ? (array) $e
            : Nombres::deEstudiante((string) $e->nombre_completo);
        $nombre = trim(implode(' ', array_filter([
            $partes['primer_nombre'] ?? null, $partes['segundo_nombre'] ?? null,
            $partes['primer_apellido'] ?? null, $partes['segundo_apellido'] ?? null,
        ])));

        return mb_convert_case($nombre !== '' ? $nombre : (string) $e->nombre_completo, MB_CASE_TITLE, 'UTF-8');
    }

    /** «T.I. 1.107.853.837»: el número con puntos de mil cuando es solo cifras. */
    public static function documento(?string $tipo, ?string $numero): string
    {
        $numero = trim((string) $numero);
        if (ctype_digit($numero) && $numero[0] !== '0') {
            $numero = number_format((int) $numero, 0, ',', '.');
        }

        return trim(($tipo ?? '').' '.$numero);
    }
}
