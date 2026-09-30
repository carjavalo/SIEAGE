<?php

use App\Support\Nombres;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Los estudiantes y acudientes que vinieron del Excel tienen el nombre en un
     * solo campo. Aquí se reparte en primer y segundo apellido y primer y
     * segundo nombre (las columnas ya existían, vacías). `nombre_completo` se
     * conserva igual: es lo que se muestra y se busca.
     *
     * Solo se tocan las filas que aún no tienen ninguna parte, así que no pisa
     * lo que alguien ya corrigió a mano. En una base nueva no hay filas todavía:
     * ahí lo hace DatabaseSeeder después de cargar los datos.
     */
    public function up(): void
    {
        Nombres::completar();
    }

    /** No se deshace: el nombre completo nunca se modificó. */
    public function down(): void {}
};
