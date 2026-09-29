<?php

namespace App\Http\Controllers;

use App\Support\InformeMatricula;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Informe de matrícula del año: una vista previa hoja por hoja (A4) que se
 * guarda como PDF desde el cuadro de impresión del navegador.
 */
class InformeController extends Controller
{
    public function matricula(Request $request): Response
    {
        $anio = (int) ($request->query('anio') ?: DB::table('anios_lectivos')->where('estado', 'activo')->value('anio'));

        return Inertia::render('informes/matricula', InformeMatricula::del($anio) ?? abort(404));
    }
}
