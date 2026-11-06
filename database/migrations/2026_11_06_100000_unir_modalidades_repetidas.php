<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * La ficha dejaba escribir la modalidad a mano y, si no era idéntica, creaba otra:
 * «Asistencia Administrativa» y «Asist. Admin» además de «Asist. Admin.». Salían como
 * pestañas aparte en Actas de grado y en los informes. Aquí se unen con la original.
 *
 * Dos modalidades son la misma si tienen las mismas palabras y cada palabra de una es
 * el comienzo de la de la otra, sin importar tildes, mayúsculas ni puntos («asist» y
 * «asistencia», «admin» y «administrativa»). «Electricidad» y «Electrónica» no lo son.
 * Queda la más antigua (la de menor id); sus estudiantes y los datos del acta pasan a ella.
 */
return new class extends Migration
{
    public function up(): void
    {
        $modalidades = DB::table('modalidades')->orderBy('id')->get(['id', 'nombre']);
        $palabras = fn (string $nombre) => array_values(array_filter(preg_split('/[^a-z0-9]+/', Str::lower(Str::ascii($nombre)))));
        $iguales = function (array $a, array $b): bool {
            if (count($a) !== count($b) || $a === []) {
                return false;
            }
            foreach ($a as $i => $p) {
                $corta = strlen($p) <= strlen($b[$i]) ? $p : $b[$i];
                $larga = $corta === $p ? $b[$i] : $p;
                if (strlen($corta) < 3 || ! str_starts_with($larga, $corta)) {
                    return false;
                }
            }

            return true;
        };

        $unidas = [];
        foreach ($modalidades as $i => $original) {
            if (isset($unidas[$original->id])) {
                continue;
            }
            foreach ($modalidades->slice($i + 1) as $repetida) {
                if (! isset($unidas[$repetida->id]) && $iguales($palabras($original->nombre), $palabras($repetida->nombre))) {
                    $unidas[$repetida->id] = $original->id;
                }
            }
        }

        DB::transaction(function () use ($unidas) {
            foreach ($unidas as $repetida => $original) {
                DB::table('matriculas')->where('modalidad_id', $repetida)->update(['modalidad_id' => $original]);
                $this->moverActas($repetida, $original);
                DB::table('modalidades')->where('id', $repetida)->delete();
            }
        });
    }

    /** Los datos del acta (número, libro, folio) guardados para la repetida, si la original no tiene. */
    private function moverActas(int $repetida, int $original): void
    {
        if (! DB::getSchemaBuilder()->hasTable('graduaciones')) {
            return;
        }
        foreach (DB::table('graduaciones')->whereNotNull('actas')->get(['id', 'actas']) as $g) {
            $actas = json_decode($g->actas, true) ?: [];
            if (! array_key_exists("modalidad-{$repetida}", $actas)) {
                continue;
            }
            $actas["modalidad-{$original}"] ??= $actas["modalidad-{$repetida}"];
            unset($actas["modalidad-{$repetida}"]);
            DB::table('graduaciones')->where('id', $g->id)->update(['actas' => json_encode($actas, JSON_UNESCAPED_UNICODE)]);
        }
    }

    public function down(): void
    {
        // No se separan otra vez: eran la misma modalidad.
    }
};
