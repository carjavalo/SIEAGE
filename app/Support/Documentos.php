<?php

namespace App\Support;

use App\Models\SolicitudInscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Documentos que el acudiente trae para matricular (paso N°1 del procedimiento
 * de matrícula del colegio). Hay una lista para primaria y otra para
 * bachillerato; Transición usa la de primaria.
 *
 * En bachillerato, los certificados de notas que se piden dependen del grado
 * al que entra: el del grado anterior y todos los de atrás (a 7.º: «de 6.º y
 * de todos los grados anteriores»).
 *
 * Cada documento se marca como entregado o, si puede no corresponder (el
 * certificado de notas o el retiro del SIMAT de quien nunca estudió), como
 * "no aplica". Se puede matricular con documentos pendientes: quedan
 * anotados en la ficha del inscrito para pedirlos después.
 *
 * Se guardan en la inscripción mientras no se ha matriculado y, después, en la
 * matrícula (matriculas.documentos): así los tienen también los estudiantes que
 * vinieron del Excel, y la ficha de cualquiera dice cuáles faltan.
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
        return self::lista(self::grado($solicitud), $solicitud->tipo_documento, $solicitud->eps);
    }

    /**
     * La lista según el grado (número: 0 es Transición), el documento del estudiante y su EPS.
     *
     * @return list<array{clave: string, nombre: string, ayuda: string|null, noAplica: bool}>
     */
    public static function lista(int $grado, ?string $tipoDocumento, ?string $eps): array
    {
        $primaria = $grado <= self::ULTIMO_DE_PRIMARIA;
        $documento = self::DOCUMENTO_DEL_ESTUDIANTE[$tipoDocumento] ?? 'del documento de identidad';
        $anterior = $grado - 1;

        $lista = [
            ['fotos', '3 fotografías tamaño 3×4 cm', null, false],
            ['documento_estudiante', "Fotocopia {$documento} del estudiante", null, false],
            [
                'notas',
                $primaria ? 'Certificado de notas del último grado aprobado' : "Certificados de notas de {$anterior}.º y de todos los grados anteriores",
                'No aplica si no viene de otro grado.',
                true,
            ],
            ['eps', 'Fotocopia del carné de la EPS', $eps ? "EPS registrada: {$eps}." : null, false],
            ...($primaria ? [['vacunas', 'Fotocopia del carné de vacunas', null, false]] : []),
            ['cedula_acudiente', 'Fotocopia de la cédula de la madre, el padre o el acudiente', null, false],
            ['simat', 'Retiro del SIMAT de la institución anterior', 'No aplica si no estuvo matriculado en otro colegio.', true],
            ['carpeta', 'Carpeta colgante tamaño oficio con gancho plástico', null, false],
        ];

        return array_map(fn (array $d) => ['clave' => $d[0], 'nombre' => $d[1], 'ayuda' => $d[2], 'noAplica' => $d[3]], $lista);
    }

    /**
     * Valida lo marcado contra la lista (solo sus claves; "no aplica" solo donde
     * corresponde) y lo devuelve en el orden de la lista, sin los no marcados.
     *
     * @param  list<array{clave: string, nombre: string, ayuda: string|null, noAplica: bool}>  $lista
     * @return array<string, string>
     */
    public static function validar(Request $request, array $lista): array
    {
        $requisitos = collect($lista)->keyBy('clave');
        $request->validate([
            'documentos' => ['present', 'array:'.$requisitos->keys()->implode(',')],
            ...$requisitos->mapWithKeys(fn (array $d, string $clave) => [
                "documentos.{$clave}" => ['nullable', Rule::in($d['noAplica'] ? [self::ENTREGADO, self::NO_APLICA] : [self::ENTREGADO])],
            ])->all(),
        ], [
            'array' => 'Hay un documento que no está en la lista.',
            'in' => 'Ese documento no se puede marcar así.',
        ]);

        return $requisitos->keys()->mapWithKeys(fn ($clave) => [$clave => $request->input("documentos.{$clave}")])->filter()->all();
    }

    public static function esPrimaria(SolicitudInscripcion $solicitud): bool
    {
        return self::grado($solicitud) <= self::ULTIMO_DE_PRIMARIA;
    }

    /** El número del grado al que entra: 0 es Transición, 11 es Undécimo. */
    private static function grado(SolicitudInscripcion $solicitud): int
    {
        return (int) DB::table('grados')->where('id', $solicitud->grado_id)->value('numero');
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
