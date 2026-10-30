<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * El registro de quién hizo qué: storage/logs/auditoria-AAAA-MM-DD.log, un año. Es
 * para responder «¿quién entró?» y «¿quién descargó esto?» si hay un incidente.
 * Sin datos de estudiantes ni claves: solo usuario, IP y acción.
 */
final class Auditoria
{
    /** @param  array<string, mixed>  $datos */
    public static function anotar(string $evento, array $datos = []): void
    {
        // Si no se puede escribir (disco lleno, permisos), la persona igual sigue trabajando.
        try {
            $usuario = request()->user();
            Log::channel('auditoria')->info($evento, [
                'usuario' => $usuario?->usuario,
                'ip' => request()->ip(),
                ...array_filter($datos, fn ($v) => $v !== null && $v !== []),
            ]);
        } catch (Throwable) {
            //
        }
    }
}
