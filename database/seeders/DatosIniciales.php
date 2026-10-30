<?php

namespace Database\Seeders;

/**
 * Tablas que viajan con el proyecto en database/data/*.json, en orden de dependencias.
 * El repositorio es público: lo que hay de personas (PERSONALES) es inventado y sirve
 * para las pruebas y para desarrollar. Los datos reales están solo en la base.
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

    /** Con datos de personas: nunca se exportan de una base real a estos archivos. */
    public const PERSONALES = ['users', 'docentes', 'estudiantes', 'acudientes', 'estudiante_acudiente', 'matriculas', 'entregas_boletin', 'boletines_excel'];

    public static function archivo(string $tabla): string
    {
        return database_path("data/{$tabla}.json");
    }
}
