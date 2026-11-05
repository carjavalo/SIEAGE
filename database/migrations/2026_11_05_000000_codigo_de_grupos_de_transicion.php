<?php

use App\Support\Grupos;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Los grupos de Transición se llaman «0-1», «0-2»…, como en Estudiantes. Una versión
 * anterior los pasó a «T1», «T2»: aquí vuelven (si no se alcanzó a aplicar, no cambia nada).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('grupos as g')->join('grados as gr', 'gr.id', '=', 'g.grado_id')
            ->where('gr.numero', 0)->whereNotNull('g.numero')
            ->get(['g.id', 'g.codigo', 'g.numero'])
            ->filter(fn ($g) => preg_match('/^T\d+$/', $g->codigo))
            ->each(fn ($g) => DB::table('grupos')->where('id', $g->id)->update(['codigo' => Grupos::codigo(0, (int) $g->numero)]));
    }

    public function down(): void
    {
        // Nada: «0-1» es el nombre de siempre.
    }
};
