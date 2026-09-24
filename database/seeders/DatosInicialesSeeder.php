<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatosInicialesSeeder extends Seeder
{
    /**
     * Carga database/data/*.json. Solo inserta filas que no existan (por llave primaria o única),
     * así que se puede ejecutar varias veces sin duplicar ni sobrescribir nada. Los usuarios son
     * la excepción: se actualizan (ver sincronizarUsuarios).
     */
    public function run(): void
    {
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
     * Los usuarios no solo se insertan: si ya existen (mismo `usuario`) se
     * actualizan nombre, correo, clave, rol y estado, para que un cambio de
     * clave o de rol hecho en un equipo llegue a los demás. El último ingreso
     * y la sesión recordada son de cada equipo y no se tocan.
     *
     * @param  list<array<string, mixed>>  $usuarios
     */
    private function sincronizarUsuarios(array $usuarios): void
    {
        $campos = ['name', 'email', 'email_verified_at', 'password', 'rol_id', 'activo', 'updated_at'];
        $nuevos = $actualizados = 0;

        foreach ($usuarios as $u) {
            $existente = DB::table('users')->where('usuario', $u['usuario'])->first(['id']);

            if ($existente) {
                $actualizados += DB::table('users')->where('id', $existente->id)->update(array_intersect_key($u, array_flip($campos)));

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

        $this->command->line(sprintf('  %-22s %6d nuevos, %d actualizados de %d', 'users', $nuevos, $actualizados, count($usuarios)));
    }
}
