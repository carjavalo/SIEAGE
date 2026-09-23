<?php

namespace Database\Seeders;

/**
 * Tablas que viajan con el proyecto en database/data/*.json, en orden de dependencias.
 */
final class DatosIniciales
{
    public const TABLAS = [
        'roles',
        'users',
        'instituciones',
        'sedes',
        'anios_lectivos',
        'periodos',
        'grados',
        'modalidades',
        'parentescos',
        'barrios',
        'docentes',
        'estudiantes',
        'acudientes',
        'estudiante_acudiente',
        'grupos',
        'matriculas',
        'entregas_boletin',
        'boletines_excel',
    ];

    public static function archivo(string $tabla): string
    {
        return database_path("data/{$tabla}.json");
    }
}
