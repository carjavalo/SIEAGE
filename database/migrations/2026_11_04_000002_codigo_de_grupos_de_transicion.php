<?php

use App\Support\Grupos;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/** Los grupos de Transición pasan de «0-1», «0-2»… a «T1», «T2»… (en pantallas, boletines y Excel). */
return new class extends Migration
{
    public function up(): void
    {
        $this->renombrar(fn ($g) => preg_match('/^0-\d+$/', $g->codigo) ? Grupos::codigo(0, (int) $g->numero) : null);
    }

    public function down(): void
    {
        $this->renombrar(fn ($g) => preg_match('/^T\d+$/', $g->codigo) ? "0-{$g->numero}" : null);
    }

    private function renombrar(callable $nuevo): void
    {
        DB::table('grupos as g')->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->where('gr.numero', 0)->whereNotNull('g.numero')
            ->get(['g.id', 'g.codigo', 'g.numero'])
            ->each(function ($g) use ($nuevo) {
                if ($codigo = $nuevo($g)) {
                    DB::table('grupos')->where('id', $g->id)->update(['codigo' => $codigo]);
                }
            });
    }
};
