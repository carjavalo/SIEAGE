<?php

namespace App\Support;

use App\Models\SolicitudInscripcion;
use Illuminate\Support\Facades\DB;

/**
 * Documentos que el acudiente trae para matricular (paso N°1 del procedimiento
 * de matrícula del colegio). Hay una lista para primaria y otra para
 * bachillerato; Transición usa la de primaria.
 *
 * Cada documento se marca como entregado o, si puede no corresponder (el
 * certificado de notas o el retiro del SIMAT de quien nunca estudió), como
 * "no aplica". Se puede matricular con documentos pendientes: quedan
 * anotados en la ficha del inscrito para pedirlos después.
 */
final class Documentos
{
    public const ENTREGADO = 'entregado';

    public const NO_APLICA = 'no_aplica';

    /** Hasta este grado (5.º) va la lista de primaria. */
    private const ULTIMO_DE_PRIMARIA = 5;

    /** Cómo se llama el documento del estudiante en la lista, según el que trajo. */
    private const DOCUMENTO_DEL_ESTUDIANTE = [
        'R.C.' => 'del registro civil',
        'T.I.' => 'de la tarjeta de identidad',
        'C.C.' => 'de la cédula',
        'C.E.' => 'de la cédula de extranjería',
        'P.P.T.' => 'del PPT (Permiso por Protección Temporal)',
    ];

    /**
     * Los documentos que le tocan a esta solicitud, en el orden del procedimiento.
     *
     * @return list<array{clave: string, nombre: string, ayuda: string|null, noAplica: bool}>
     */
    public static function para(SolicitudInscripcion $solicitud): array
    {
        $primaria = self::esPrimaria($solicitud);
        $documento = self::DOCUMENTO_DEL_ESTUDIANTE[$solicitud->tipo_documento] ?? 'del documento de identidad';

        $lista = [
            ['fotos', '3 fotografías tamaño 3×4 cm', null, false],
            ['documento_estudiante', "Fotocopia {$documento} del estudiante", null, false],
            [
                'notas',
                $primaria ? 'Certificado de notas del último grado aprobado' : 'Certificado de notas de 5.º al último grado aprobado',
                'No aplica si no viene de otro grado.',
                true,
            ],
            ['eps', 'Fotocopia del carné de la EPS', $solicitud->eps ? "La familia escribió: {$solicitud->eps}." : null, false],
            ...($primaria ? [['vacunas', 'Fotocopia del carné de vacunas', null, false]] : []),
            ['cedula_acudiente', 'Fotocopia de la cédula de la madre, el padre o el acudiente', null, false],
            ['simat', 'Retiro del SIMAT de la institución anterior', 'No aplica si no estuvo matriculado en otro colegio.', true],
            ['carpeta', 'Carpeta colgante tamaño oficio con gancho plástico', null, false],
        ];

        return array_map(fn (array $d) => ['clave' => $d[0], 'nombre' => $d[1], 'ayuda' => $d[2], 'noAplica' => $d[3]], $lista);
    }

    public static function esPrimaria(SolicitudInscripcion $solicitud): bool
    {
        return (int) DB::table('grados')->where('id', $solicitud->grado_id)->value('numero') <= self::ULTIMO_DE_PRIMARIA;
    }

    /**
     * Cuántos están listos (entregados o "no aplica") y cuáles faltan.
     *
     * @return array{listos: int, total: int, faltan: list<string>}
     */
    public static function resumen(SolicitudInscripcion $solicitud): array
    {
        $marcados = $solicitud->documentos ?? [];
        $lista = self::para($solicitud);
        $faltan = array_values(array_map(
            fn (array $d) => $d['nombre'],
            array_filter($lista, fn (array $d) => ! isset($marcados[$d['clave']])),
        ));

        return ['listos' => count($lista) - count($faltan), 'total' => count($lista), 'faltan' => $faltan];
    }
}
