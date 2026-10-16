<?php

namespace App\Console\Commands;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Console\Command;

/**
 * Da (o quita) el rol de super administrador desde la consola del servidor. Es el
 * del equipo de SIEAGE: desde la web solo lo puede dar otro super administrador,
 * así que el primero se da aquí. Con --quitar, vuelve a administrador.
 */
class SuperAdministrador extends Command
{
    protected $signature = 'sieage:superadmin
        {usuarios* : Uno o varios nombres de usuario, por ejemplo jperez}
        {--quitar : Lo deja como administrador}';

    protected $description = 'Da el rol de super administrador (o lo quita con --quitar)';

    public function handle(): int
    {
        $rol = Rol::where('nombre', $this->option('quitar') ? 'administrador' : 'superadministrador')->first();
        if (! $rol) {
            $this->error('Falta el rol: corre primero php artisan migrate --force.');

            return self::FAILURE;
        }

        $nombres = array_map(fn ($u) => mb_strtolower(trim($u)), $this->argument('usuarios'));
        $usuarios = User::whereIn('usuario', $nombres)->get();
        $faltan = array_diff($nombres, $usuarios->pluck('usuario')->all());
        if ($faltan) {
            $this->error('No hay ningún usuario «'.implode('», «', $faltan).'». No se cambió nada.');
            $this->line('Usuarios: '.User::orderBy('usuario')->pluck('usuario')->implode(', '));

            return self::FAILURE;
        }

        foreach ($usuarios as $u) {
            $u->forceFill(['rol_id' => $rol->id, 'activo' => true])->save();
            $this->info("«{$u->usuario}» ({$u->name}) ahora es {$rol->etiqueta}.");
        }

        return self::SUCCESS;
    }
}
