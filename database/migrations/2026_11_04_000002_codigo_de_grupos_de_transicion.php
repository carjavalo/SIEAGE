<?php

use Illuminate\Database\Migrations\Migration;

/**
 * Pasaba los grupos de Transición a «T1», «T2»; se descartó (ver 2026_11_05_000000, que
 * los devuelve a «0-1»). Queda vacía para que donde ya se aplicó siga constando.
 */
return new class extends Migration
{
    public function up(): void {}

    public function down(): void {}
};
