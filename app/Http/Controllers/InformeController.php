<?php

namespace App\Http\Controllers;

use App\Support\InformeMatricula;
use App\Support\LibroMatriculaSede;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Informe de matrícula del año: una vista previa hoja por hoja (A4) que se
 * guarda como PDF desde el cuadro de impresión del navegador; y el libro de
 * matrícula de cada sede en Excel, con el formato que el colegio ya usa.
 */
class InformeController extends Controller
{
    public function matricula(Request $request): Response
    {
        $anio = (int) ($request->query('anio') ?: DB::table('anios_lectivos')->where('estado', 'activo')->value('anio'));

        return Inertia::render('informes/matricula', InformeMatricula::del($anio) ?? abort(404));
    }

    /** «PRINCIPAL-2026.xlsx»: el libro de la sede, una hoja por grupo más las de resumen. */
    public function excel(Request $request): StreamedResponse
    {
        $datos = $request->validate([
            'anio' => ['required', 'integer'],
            'sede' => ['required', 'string', 'max:5'],
        ]);
        [$libro, $archivo] = LibroMatriculaSede::generar((int) $datos['anio'], $datos['sede']) ?? abort(404);

        return response()->streamDownload(function () use ($libro) {
            $escritor = new Xlsx($libro);
            // Cada fórmula va con su resultado ya calculado: Excel abre lo descargado en «Vista
            // protegida», donde no calcula nada, y sin esto los totales se veían en blanco.
            $escritor->setPreCalculateFormulas(true);
            $escritor->save('php://output');
            $libro->disconnectWorksheets();
        }, $archivo, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'no-store',
        ]);
    }
}
