<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatosInicialesSeeder extends Seeder
{
    /**
     * Carga database/data/*.json. Solo inserta filas que no existan (por llave primaria o única),
     * así que se puede ejecutar varias veces sin duplicar ni sobrescribir nada.
     */
    public function run(): void
    {
        // Lo que hay de personas es inventado: nunca en la base real.
        if (app()->isProduction()) {
            $this->command->error('Los datos iniciales son inventados: no se cargan en producción.');

            return;
        }

        Schema::withoutForeignKeyConstraints(function () {
            foreach (DatosIniciales::TABLAS as $tabla) {
                $archivo = DatosIniciales::archivo($tabla);

                if (! is_file($archivo)) {
                    $this->command->warn("  {$tabla}: sin archivo de datos, se omite.");

                    continue;
                }

                ['columnas' => $columnas, 'filas' => $filas] = json_decode(file_get_contents($archivo), true);

                if ($tabla === 'users') {
                    $this->sincronizarUsuarios(array_map(fn ($fila) => array_combine($columnas, $fila), $filas));

                    continue;
                }

                $insertadas = 0;
                foreach (array_chunk($filas, 500) as $lote) {
                    $insertadas += DB::table($tabla)->insertOrIgnore(
                        array_map(fn ($fila) => array_combine($columnas, $fila), $lote),
                    );
                }

                $this->command->line(sprintf('  %-22s %6d nuevas de %d', $tabla, $insertadas, count($filas)));
            }
        });
    }

    /**
     * Los usuarios que falten, con la clave al azar del archivo (nadie la conoce:
     * se pone con `php artisan usuario:clave`). A los que ya existen no se les toca nada:
     * este archivo nunca debe poder cambiar una clave o un rol de verdad.
     *
     * @param  list<array<string, mixed>>  $usuarios
     */
    private function sincronizarUsuarios(array $usuarios): void
    {
        $nuevos = 0;

        foreach ($usuarios as $u) {
            if (DB::table('users')->where('usuario', $u['usuario'])->exists()) {
                continue;
            }

            // Mismo id si está libre; si otro equipo ya lo usó, que la base asigne uno.
            $fila = array_diff_key($u, array_flip(['ultimo_acceso', 'remember_token']));
            if (DB::table('users')->where('id', $u['id'])->exists()) {
                unset($fila['id']);
            }
            DB::table('users')->insert($fila);
            $nuevos++;
        }

        $this->command->line(sprintf('  %-22s %6d nuevos de %d', 'users', $nuevos, count($usuarios)));
    }
}
