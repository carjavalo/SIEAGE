<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Anota cuándo usó el panel cada usuario por última vez (users.ultima_actividad), para la
 * lista de usuarios. Como el navegador pregunta por el pulso cada 10 s, se escribe como
 * mucho una vez por minuto y sin tocar updated_at.
 */
class RegistrarActividad
{
    public function handle(Request $request, Closure $next): Response
    {
        // Antes de armar la respuesta: así la firma del pulso que lleva esta misma página ya la cuenta
        // y el navegador no recarga la lista de usuarios por su propia visita.
        $usuario = $request->user();
        if ($usuario && (! $usuario->ultima_actividad || $usuario->ultima_actividad->lt(now()->subMinute()))) {
            DB::table('users')->where('id', $usuario->id)->update(['ultima_actividad' => now()]);
        }

        return $next($request);
    }
}
