<?php

namespace App\Http\Middleware;

use App\Support\Auditoria;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Deja constancia de todo lo que cambia un usuario con sesión y de lo que se lleva
 * de muchos estudiantes a la vez (Excel, informes e impresiones por lote). Solo la
 * acción y su dirección: nunca lo que se escribió en el formulario.
 */
class RegistrarAuditoria
{
    private const SALIDAS_DE_DATOS = [
        'inscritos.excel',
        'informes.matricula.excel',
        'informes.matricula',
        'informes.documentos',
        'informes.extraedad',
        'constancias.lote',
        'constancias.estudiante',
        'boletines.imprimir',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $ruta = $request->route()?->getName();
        $sacaDatos = in_array($ruta, self::SALIDAS_DE_DATOS, true);
        if ($request->user() && ($sacaDatos || ! $request->isMethodSafe())) {
            Auditoria::anotar('accion', [
                'ruta' => $ruta,
                'metodo' => $request->method(),
                'direccion' => $request->path(),
                'filtros' => $sacaDatos ? $request->query() : null,
                'estado' => $response->getStatusCode(),
            ]);
        }

        return $response;
    }
}
