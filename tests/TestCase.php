<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    /**
     * Los grupos del año siguiente iguales a los de este, como si la secretaría los
     * hubiera creado en Sedes según la proyección de matrícula: la promoción ya no
     * los copia sola. Sin $grados, los de todos los grados.
     *
     * @param  list<int>|null  $grados  números de grado (0 a 11)
     */
    protected function crearGruposDelSiguiente(int $anio = 2026, ?array $grados = null): void
    {
        $origen = DB::table('anios_lectivos')->where('anio', $anio)->value('id');
        if (! DB::table('anios_lectivos')->where('anio', $anio + 1)->exists()) {
            DB::table('anios_lectivos')->insert(['anio' => $anio + 1, 'estado' => 'planeado', 'created_at' => now(), 'updated_at' => now()]);
        }
        $destino = DB::table('anios_lectivos')->where('anio', $anio + 1)->value('id');

        $grupos = DB::table('grupos as g')->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->where('g.anio_lectivo_id', $origen)
            ->when($grados !== null, fn ($q) => $q->whereIn('gr.numero', $grados))
            ->get(['g.sede_id', 'g.grado_id', 'g.numero', 'g.codigo', 'g.jornada', 'g.cupos_proyectados']);

        DB::table('grupos')->insert($grupos->map(fn ($g) => [
            ...(array) $g,
            'anio_lectivo_id' => $destino,
            'created_at' => now(),
            'updated_at' => now(),
        ])->all());
    }
}
