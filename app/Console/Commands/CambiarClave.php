<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Para cuando nadie puede entrar (se olvidó la clave del administrador): cambia
 * la clave desde la consola del servidor. La clave se escribe sin que se vea.
 */
class CambiarClave extends Command
{
    protected $signature = 'usuario:clave {usuario : El nombre de usuario, por ejemplo admin}';

    protected $description = 'Cambia la clave de un usuario (y lo reactiva si estaba inactivo)';

    public function handle(): int
    {
        $usuario = User::where('usuario', mb_strtolower(trim($this->argument('usuario'))))->first();
        if (! $usuario) {
            $this->error('No hay ningún usuario «'.$this->argument('usuario').'».');
            $this->line('Usuarios: '.User::orderBy('usuario')->pluck('usuario')->implode(', '));

            return self::FAILURE;
        }

        $clave = (string) $this->secret('Nueva clave (mínimo 10 caracteres, con letras y números; no se ve al escribir)');
        if (mb_strlen($clave) < 10 || mb_strlen($clave) > 72 || ! preg_match('/\pL/u', $clave) || ! preg_match('/\d/', $clave)) {
            $this->error('La clave debe tener entre 10 y 72 caracteres, con letras y números.');

            return self::FAILURE;
        }
        if ($clave !== (string) $this->secret('Repítela')) {
            $this->error('Las dos claves no coinciden. No se cambió nada.');

            return self::FAILURE;
        }

        // Como al cambiarla desde Usuarios: la anterior deja de servir, también donde quedó recordada.
        $usuario->forceFill(['password' => $clave, 'activo' => true])->save();
        $usuario->cerrarSesiones();

        $this->info("Listo: ya puedes entrar como «{$usuario->usuario}» con la clave nueva.");

        return self::SUCCESS;
    }
}
