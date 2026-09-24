<?php

namespace App\Http\Controllers;

use App\Http\Requests\InscripcionRequest;
use App\Models\SolicitudInscripcion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
     * Guarda la inscripción como solicitud pendiente. No toca las tablas
     * oficiales: el estudiante, el acudiente y la matrícula se crean cuando
     * la secretaría la apruebe.
     */
    public function store(InscripcionRequest $request): RedirectResponse
    {
        // Campo trampa invisible: un humano nunca lo llena. Al bot se le
        // responde igual que a un envío correcto para no darle pistas, pero
        // no se guarda nada.
        if ($request->filled('sitio_web')) {
            // Queda anotado (sin los datos): si alguna vez lo activa una persona,
            // por ejemplo con el autocompletado del navegador, no se pierde sin rastro.
            Log::warning('Inscripción descartada por el campo trampa', [
                'ip' => $request->ip(),
                'navegador' => $request->userAgent(),
                'largo' => mb_strlen((string) $request->input('sitio_web')),
            ]);

            return back();
        }

        SolicitudInscripcion::create($request->datosParaGuardar());

        return back();
    }
}
