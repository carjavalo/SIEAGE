<?php

namespace App\Http\Controllers;

use App\Http\Requests\InscripcionRequest;
use App\Models\SolicitudInscripcion;
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
            // Solo los barrios verificados (la lista oficial de Cali y algunos
            // lugares vecinos); los nombres mal escritos del Excel no se sugieren.
            'barrios' => DB::table('barrios')->whereNotNull('tipo')->orderBy('nombre')->get(['nombre', 'municipio'])
                ->map(fn ($b) => $b->municipio ? "{$b->nombre} ({$b->municipio})" : $b->nombre),
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
            return back();
        }

        SolicitudInscripcion::create($request->datosParaGuardar());

        return back();
    }
}
