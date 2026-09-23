<?php

namespace App\Http\Controllers;

use App\Http\Requests\InscripcionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InscripcionController extends Controller
{
    /**
     * Formulario público de inscripción. Los catálogos salen de la base para
     * que el acudiente elija entre valores válidos en vez de escribirlos.
     */
    public function create(): Response
    {
        return Inertia::render('inscripcion/create', [
            'anioLectivo' => DB::table('anios_lectivos')->where('estado', 'activo')->value('anio') ?? (int) date('Y'),
            'grados' => DB::table('grados')->orderBy('numero')->get(['id', 'numero', 'nombre']),
            'parentescos' => DB::table('parentescos')->orderBy('id')->pluck('nombre'),
            'barrios' => DB::table('barrios')->orderBy('nombre')->pluck('nombre'),
        ]);
    }

    /**
     * Recibe la inscripción ya validada.
     *
     * PENDIENTE: todavía no se guarda. Varios campos del formulario (EPS,
     * SISBÉN, tipo de sangre, grupo étnico, lugar de nacimiento, ciudad de
     * expedición, contacto del estudiante) no tienen columna en la base, y
     * falta decidir si una inscripción entra directo como matrícula o como
     * solicitud que la secretaría aprueba.
     */
    public function store(InscripcionRequest $request): RedirectResponse
    {
        // Campo trampa invisible: un humano nunca lo llena. Al bot se le
        // responde igual que a un envío correcto para no darle pistas.
        if ($request->filled('sitio_web')) {
            return back();
        }

        return back();
    }
}
